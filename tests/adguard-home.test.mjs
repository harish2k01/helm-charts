import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,workload,serviceContract,existingClaim} from './helpers/render.mjs';
test('AdGuard DNS TCP/UDP and setup UI services resolve to the correct pod ports',()=>{
  const docs=render('adguard-home'); serviceContract(docs,'adguard-home',3000);
  const c=container(docs,'adguard-home');
  for(const protocol of ['TCP','UDP']) assert.ok(c.ports.some(p=>p.containerPort===53&&p.protocol===protocol));
  assert.equal(workload(docs,'adguard-home').spec.strategy.type,'Recreate');
});
test('AdGuard reuses one existing claim for separate work and config directories',()=>{
  const docs=render('adguard-home',['persistence.existingClaim=operator-data']);
  for(const path of ['/opt/adguardhome/work','/opt/adguardhome/conf'])existingClaim(docs,'adguard-home',path);
  const mounts=container(docs,'adguard-home').volumeMounts;
  assert.notEqual(mounts[0].subPath,mounts[1].subPath);
});
