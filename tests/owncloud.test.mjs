import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseAllDocuments } from 'yaml';
const render=(...args)=>parseAllDocuments(execFileSync('helm',['template','owncloud','charts/owncloud','--namespace','files',...args],{encoding:'utf8'})).map(d=>d.toJSON()).filter(Boolean);
const redis=docs=>docs.find(d=>d.kind==='StatefulSet'&&d.metadata.name.endsWith('-redis'));
test('Redis startup probe protects persisted-data loading and retains data mount',()=>{
  const container=redis(render()).spec.template.spec.containers[0];
  assert.equal(container.image,'redis:8.10.2');
  assert.deepEqual(container.args,['--databases','1']);
  assert.deepEqual(container.startupProbe.exec.command,['redis-cli','ping']);
  assert.equal(container.startupProbe.failureThreshold,60);
  assert.equal(container.volumeMounts[0].mountPath,'/data');
});
test('Redis startup grace can be increased without disabling readiness',()=>{
  const container=redis(render('--set','redis.startupProbe.failureThreshold=180')).spec.template.spec.containers[0];
  assert.equal(container.startupProbe.failureThreshold,180);
  assert.deepEqual(container.readinessProbe.exec.command,['redis-cli','ping']);
});
test('external and disabled Redis never create an internal Redis writer',()=>{
  assert.equal(redis(render('--set','redis.internal=false,redis.host=redis.example.internal')),undefined);
  assert.equal(redis(render('--set','redis.enabled=false')),undefined);
});

const app = docs => docs.find(d=>d.kind==='Deployment').spec.template.spec;
test('ownCloud 11 retains supported MariaDB series and existing Redis pin without enabling optional overrides',()=>{
  const docs=render(), pod=app(docs), main=pod.containers.find(c=>c.name==='owncloud');
  assert.equal(main.image,'owncloud/server:11.1.0');
  assert.equal(docs.find(d=>d.kind==='StatefulSet'&&d.metadata.name.endsWith('-mariadb')).spec.template.spec.containers[0].image,'mariadb:10.11');
  assert.equal(main.env.find(e=>e.name==='OWNCLOUD_ALLOW_SUBADMINS'),undefined);
  assert.equal(main.env.find(e=>e.name==='OWNCLOUD_REDIS_TLS_VERIFY_PEER'),undefined);
  assert.equal(pod.automountServiceAccountToken,false);
  assert.ok(pod.initContainers.some(c=>c.name==='wait-for-redis'));
});
test('external TLS Redis reaches wrapper with optional settings and referenced credentials',()=>{
  const pod=app(render('--set','redis.internal=false,redis.host=tls://redis.example.invalid,redis.service.port=6380',
    '--set-string','env.OWNCLOUD_REDIS_TLS_VERIFY_PEER=true',
    '--set-string','env.OWNCLOUD_STRICT_LOGIN_ENFORCED=true',
    '--set','secretEnv.existingSecret.name=redis-credentials',
    '--set','secretEnv.existingSecret.keys[0].envName=OWNCLOUD_REDIS_PASSWORD,secretEnv.existingSecret.keys[0].secretKey=password'));
  assert.ok(!pod.initContainers.some(c=>c.name==='wait-for-redis'));
  const env=pod.containers[0].env;
  assert.equal(env.find(e=>e.name==='OWNCLOUD_REDIS_HOST').value,'tls://redis.example.invalid');
  assert.equal(env.find(e=>e.name==='OWNCLOUD_REDIS_PORT').value,'6380');
  assert.equal(env.find(e=>e.name==='OWNCLOUD_REDIS_TLS_VERIFY_PEER').value,'true');
  assert.deepEqual(env.find(e=>e.name==='OWNCLOUD_REDIS_PASSWORD').valueFrom.secretKeyRef,{name:'redis-credentials',key:'password',optional:false});
});
test('external Redis needs no initContainers when MariaDB is external too',()=>{
  const pod=app(render('--set','redis.internal=false,redis.host=redis.example.invalid,mariadb.enabled=false,database.host=mariadb.example.invalid'));
  assert.equal(pod.initContainers,undefined);
});
