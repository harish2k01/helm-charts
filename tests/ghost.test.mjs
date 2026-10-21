import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,workload,serviceContract,existingClaim} from './helpers/render.mjs';
test('Ghost web routing and probes resolve while optional ActivityPub stays off',()=>{
  const docs=render('ghost');serviceContract(docs,'ghost',2368);
  assert.equal(env(container(docs,'ghost'),'database__client').value,'mysql');
  assert.equal(docs.filter(d=>d.kind==='Deployment').length,1);
  assert.ok(docs.some(d=>d.kind==='StatefulSet'&&d.spec.template.spec.containers.some(c=>c.image.startsWith('mysql:'))));
});
test('Ghost external MySQL, credential Secret and existing content claim avoid local database resources',()=>{
  const docs=render('ghost',['mysql.enabled=false','env.database__connection__host=db.example','persistence.content.existingClaim=operator-data','secretEnv.existingSecret.name=runtime','secretEnv.existingSecret.keys[0].envName=database__connection__password','secretEnv.existingSecret.keys[0].secretKey=password']);
  existingClaim(docs,'ghost','/var/lib/ghost/content');
  assert.equal(docs.filter(d=>d.kind==='Deployment').length,1);
  assert.equal(workload(docs,'ghost').spec.template.spec.initContainers,undefined);
  assert.equal(env(container(docs,'ghost'),'database__connection__password').valueFrom.secretKeyRef.name,'runtime');
  assert.equal(docs.some(d=>d.kind==='Secret'),false);
});
