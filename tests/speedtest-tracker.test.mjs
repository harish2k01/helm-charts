import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,serviceContract,existingClaim,rejects} from './helpers/render.mjs';
test('Speedtest Tracker defaults to SQLite with persistent configuration and startup probes',()=>{
  const docs=render('speedtest-tracker');serviceContract(docs,'speedtest-tracker',80);
  assert.equal(docs.filter(d=>d.kind==='Deployment').length,1);
  assert.equal(env(container(docs,'speedtest-tracker'),'DB_CONNECTION').value,'sqlite');
  assert.ok(container(docs,'speedtest-tracker').startupProbe);
});
test('Speedtest Tracker external DB credentials and application key remain Secret-backed',()=>{
  const docs=render('speedtest-tracker',['database.external.enabled=true','database.external.type=pgsql','database.external.host=db.example','database.external.existingSecret=db-runtime','speedtestTracker.secrets.existingSecret=runtime','speedtestTracker.persistence.existingClaim=operator-data']);
  existingClaim(docs,'speedtest-tracker','/config');
  const c=container(docs,'speedtest-tracker');assert.equal(env(c,'DB_CONNECTION').value,'pgsql');assert.equal(env(c,'DB_PASSWORD').valueFrom.secretKeyRef.name,'db-runtime');assert.deepEqual(c.envFrom,[{secretRef:{name:'runtime'}}]);
  assert.equal(docs.some(d=>d.kind==='Secret'),false);
});
test('Speedtest Tracker rejects simultaneous managed database backends',()=>rejects('speedtest-tracker',['database.mysql.enabled=true','database.postgresql.enabled=true'],/Enable only one database/));
