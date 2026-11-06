import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,workload,serviceContract,existingClaim,rejects} from './helpers/render.mjs';
test('Firefly upgrades release the existing single-writer upload claim before replacing pods',()=>{
  const docs=render('firefly-iii',['persistence.upload.existingClaim=uploads']);
  const deployment=workload(docs,'firefly-iii');
  assert.deepEqual(deployment.spec.strategy,{type:'Recreate'});
  assert.equal(deployment.spec.template.spec.volumes.find(v=>v.name==='upload').persistentVolumeClaim.claimName,'uploads');
  assert.equal(docs.some(d=>d.kind==='PersistentVolumeClaim'&&d.metadata.name==='contract-firefly-iii-upload'),false);
});
test('Firefly allows an explicit supported rolling-update strategy and rejects an invalid type',()=>{
  const docs=render('firefly-iii',['deployment.strategy.type=RollingUpdate','deployment.strategy.rollingUpdate.maxSurge=0','deployment.strategy.rollingUpdate.maxUnavailable=1']);
  assert.deepEqual(workload(docs,'firefly-iii').spec.strategy,{type:'RollingUpdate',rollingUpdate:{maxSurge:0,maxUnavailable:1}});
  rejects('firefly-iii',['deployment.strategy.type=Invalid'],/Recreate|RollingUpdate/);
});
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
