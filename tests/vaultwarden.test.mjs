import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,workload,serviceContract,existingClaim} from './helpers/render.mjs';
test('Vaultwarden routes to its HTTP listener and recreates the persistent writer',()=>{
  const docs=render('vaultwarden');serviceContract(docs,'vaultwarden',80);
  assert.equal(workload(docs,'vaultwarden').spec.strategy.type,'Recreate');
});
test('Vaultwarden references an existing admin-token Secret and preserves existing vault data',()=>{
  const docs=render('vaultwarden',['persistence.config.existingClaim=operator-data','secretEnv.existingSecret.name=runtime','secretEnv.existingSecret.keys[0].envName=ADMIN_TOKEN','secretEnv.existingSecret.keys[0].secretKey=admin-token']);
  existingClaim(docs,'vaultwarden','/data');assert.equal(docs.some(d=>d.kind==='Secret'),false);
  assert.deepEqual(env(container(docs,'vaultwarden'),'ADMIN_TOKEN').valueFrom.secretKeyRef,{name:'runtime',key:'admin-token',optional:false});
});
