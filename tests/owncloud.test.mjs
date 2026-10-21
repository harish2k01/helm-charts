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
