import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,serviceContract,existingClaim} from './helpers/render.mjs';
test('Uptime Kuma defaults to one persistent SQLite app without a database server',()=>{
  const docs=render('uptime-kuma');serviceContract(docs,'uptime-kuma',3001);
  assert.equal(docs.filter(d=>d.kind==='Deployment').length,1);
  assert.equal(env(container(docs,'uptime-kuma'),'UPTIME_KUMA_DB_PASSWORD'),undefined);
});
test('Uptime Kuma external database uses Secret credentials and preserves existing app data',()=>{
  const docs=render('uptime-kuma',['database.external.enabled=true','database.external.host=db.example','database.external.existingSecret=db-runtime','persistence.existingClaim=operator-data','envFrom[0].secretRef.name=runtime']);
  existingClaim(docs,'uptime-kuma','/app/data');
  const c=container(docs,'uptime-kuma');assert.equal(env(c,'UPTIME_KUMA_DB_HOSTNAME').value,'db.example');assert.equal(env(c,'UPTIME_KUMA_DB_PASSWORD').valueFrom.secretKeyRef.name,'db-runtime');assert.deepEqual(c.envFrom,[{secretRef:{name:'runtime'}}]);
  assert.equal(docs.some(d=>d.kind==='Secret'),false);
});
