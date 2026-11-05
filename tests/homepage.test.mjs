import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,workload,serviceContract,existingClaim,rejects} from './helpers/render.mjs';

test('Homepage host allowlist includes pod health traffic and configured hostnames',()=>{
  const docs=render('homepage',['homepage.allowedHosts[0]=dashboard.example']);serviceContract(docs,'homepage',3000);
  assert.equal(env(container(docs,'homepage'),'HOMEPAGE_ALLOWED_HOSTS').value,'$(MY_POD_IP):3000,dashboard.example');
});

test('Homepage operator-owned config is not shadowed by generated files or RBAC',()=>{
  const docs=render('homepage',['homepage.config.enabled=false','persistence.config.enabled=true','persistence.config.existingClaim=operator-data','rbac.create=false','serviceAccount.create=false','serviceAccount.name=operator']);
  existingClaim(docs,'homepage','/app/config');
  assert.equal(docs.some(d=>['ConfigMap','ClusterRole','ClusterRoleBinding','ServiceAccount'].includes(d.kind)),false);
  assert.equal(workload(docs,'homepage').spec.template.spec.serviceAccountName,'operator');
});

test('Homepage optional auth credentials are Secret references and MCP is not enabled by default',()=>{
  const baseline=container(render('homepage'),'homepage');
  assert.equal(env(baseline,'HOMEPAGE_AUTH_ENABLED'),undefined);
  assert.equal(env(baseline,'HOMEPAGE_MCP_ENABLED'),undefined);
  const docs=render('homepage',['env.HOMEPAGE_AUTH_ENABLED=true','env.HOMEPAGE_EXTERNAL_URL=https://dashboard.example','extraEnv[0].name=HOMEPAGE_AUTH_SECRET','extraEnv[0].valueFrom.secretKeyRef.name=homepage-auth','extraEnv[0].valueFrom.secretKeyRef.key=cookie-secret','extraEnv[1].name=HOMEPAGE_AUTH_PASSWORD','extraEnv[1].valueFrom.secretKeyRef.name=homepage-auth','extraEnv[1].valueFrom.secretKeyRef.key=password']);
  const c=container(docs,'homepage');
  assert.equal(env(c,'HOMEPAGE_AUTH_ENABLED').value,'true');
  assert.deepEqual(env(c,'HOMEPAGE_AUTH_SECRET').valueFrom.secretKeyRef,{name:'homepage-auth',key:'cookie-secret'});
  assert.equal(env(c,'HOMEPAGE_AUTH_PASSWORD').value,undefined);
  assert.equal(c.readinessProbe.httpGet.path,'/api/healthcheck');
  assert.equal(new Set(c.env.map(v=>v.name)).size,c.env.length);
});

test('Homepage changed listener keeps host validation and Service/probes aligned',()=>{
  const docs=render('homepage',['service.targetPort=3100','env.PORT=3100']);
  serviceContract(docs,'homepage',3100);
  assert.equal(env(container(docs,'homepage'),'HOMEPAGE_ALLOWED_HOSTS').value,'$(MY_POD_IP):3100');
});

test('Homepage rejects conflicting managed environment and invalid optional flags',()=>{
  rejects('homepage',['extraEnv[0].name=HOMEPAGE_ALLOWED_HOSTS','extraEnv[0].value=*'],/cannot override/);
  rejects('homepage',['extraEnv[0].name=MY_POD_IP','extraEnv[0].value=127.0.0.1'],/cannot override/);
  rejects('homepage',['env.HOMEPAGE_MCP_ENABLED=enabled'],/HOMEPAGE_MCP_ENABLED/);
  rejects('homepage',['extraEnv[0].name=HOMEPAGE_AUTH_SECRET'],/extraEnv/);
});
