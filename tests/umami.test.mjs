import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,workload,serviceContract,rejects} from './helpers/render.mjs';
test('Umami web and startup probes resolve; external PostgreSQL removes local data resources',()=>{
  serviceContract(render('umami'),'umami',3000);
  const docs=render('umami',['database.postgresql.enabled=false','database.external.enabled=true','database.external.existingSecret=db-runtime','umami.secrets.existingSecret=runtime']);
  assert.equal(docs.filter(d=>d.kind==='Deployment').length,1);assert.equal(docs.some(d=>['Secret','PersistentVolumeClaim'].includes(d.kind)),false);
  assert.equal(workload(docs,'umami').spec.template.spec.initContainers,undefined);
  const c=container(docs,'umami');assert.equal(env(c,'DATABASE_URL').valueFrom.secretKeyRef.name,'db-runtime');assert.equal(env(c,'APP_SECRET').valueFrom.secretKeyRef.name,'runtime');
});
test('Umami rejects missing or conflicting PostgreSQL choices',()=>{
  rejects('umami',['database.external.enabled=true'],/Enable only one database/);
  rejects('umami',['database.postgresql.enabled=false'],/requires PostgreSQL/);
});
