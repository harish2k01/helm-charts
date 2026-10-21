import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,serviceContract} from './helpers/render.mjs';
test('BentoPDF routes port 80 to its 8080 listener without persistent storage',()=>{
  const docs=render('bentopdf');serviceContract(docs,'bentopdf',8080);
  assert.equal(docs.some(d=>d.kind==='PersistentVolumeClaim'),false);
});
test('BentoPDF listener changes propagate to Service and pod, with runtime Secret imports',()=>{
  const docs=render('bentopdf',['service.targetPort=8090','env.PORT=8090','envFrom[0].secretRef.name=runtime']);
  serviceContract(docs,'bentopdf',8090);
  const c=container(docs,'bentopdf');assert.equal(env(c,'PORT').value,'8090');
  assert.deepEqual(c.envFrom,[{secretRef:{name:'runtime'}}]);
  assert.equal(docs.some(d=>d.kind==='Secret'),false);
});
