import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,serviceContract,existingClaim} from './helpers/render.mjs';
test('Pocket ID listener and probes resolve with persistent data by default',()=>{
  const docs=render('pocket-id');serviceContract(docs,'pocket-id',1411);
  assert.ok(container(docs,'pocket-id').volumeMounts.some(m=>m.mountPath==='/app/data'));
});
test('Pocket ID keeps the encryption key external and reuses existing data',()=>{
  const docs=render('pocket-id',['persistence.data.existingClaim=operator-data','secretEnv.existingSecret.name=runtime','secretEnv.existingSecret.keys[0].envName=ENCRYPTION_KEY','secretEnv.existingSecret.keys[0].secretKey=encryption-key']);
  existingClaim(docs,'pocket-id','/app/data');
  assert.equal(docs.some(d=>d.kind==='Secret'),false);
  assert.deepEqual(env(container(docs,'pocket-id'),'ENCRYPTION_KEY').valueFrom.secretKeyRef,{name:'runtime',key:'encryption-key',optional:false});
});
