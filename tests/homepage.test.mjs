import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,workload,serviceContract,existingClaim} from './helpers/render.mjs';
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
