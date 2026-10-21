import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,workload,serviceContract,existingClaim} from './helpers/render.mjs';
test('Firefly web Service and startup probes resolve and scheduled cron remains present',()=>{
  const docs=render('firefly-iii');serviceContract(docs,'firefly-iii',8080);
  assert.ok(docs.some(d=>d.kind==='CronJob'));
  assert.ok(container(docs,'firefly-iii').startupProbe);
});
test('Firefly existing upload/database claims and shared Secret are reused without replacement',()=>{
  const docs=render('firefly-iii',['persistence.upload.existingClaim=operator-data','postgres.persistence.existingClaim=db-data','firefly.secrets.existingSecret=runtime']);
  existingClaim(docs,'firefly-iii','/var/www/html/storage/upload');
  assert.ok(container(docs,'firefly-iii').envFrom.some(e=>e.secretRef?.name==='runtime'));
  assert.equal(docs.some(d=>d.kind==='Secret'),false);
  const init=workload(docs,'firefly-iii').spec.template.spec.initContainers[0];
  assert.equal(init.env.find(e=>e.name==='PGPASSWORD').valueFrom.secretKeyRef.name,'runtime');
});
