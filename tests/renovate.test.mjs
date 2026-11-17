import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('renovate.json','utf8'));
test('qBittorrent proposals reject historical OS versions while allowing the active app series',()=>{
  const rule=config.packageRules.find(r=>r.allowedVersions&&r.matchPackageNames?.includes('lscr.io/linuxserver/qbittorrent'));
  const allowed=new RegExp(rule.allowedVersions.slice(1,-1));
  for(const valid of ['4.6.7','5.2.0','5.2.4','6.0.0'])assert.ok(allowed.test(valid),valid);
  for(const invalid of ['20.04.1','22.04.0','latest','5.2.4-beta1','5.2.4-ls1'])assert.equal(allowed.test(invalid),false,invalid);
});
test('database compatibility protection and manual chart review remain enabled',()=>{
  assert.equal(config.automerge,false);
  assert.equal(config.ignoreUnstable,true);
  const embedded=config.packageRules.find(r=>r.enabled===false);
  assert.deepEqual(embedded.matchPackageNames,['postgres','mysql','mariadb','redis','influxdb']);
  assert.ok(config.packageRules.some(r=>r.matchPackageNames?.includes('influxdb')&&r.prBodyNotes?.length));
});
test('every chart image has a Renovate rule linking proposals to upstream release history',async()=>{
  const {readdirSync}=await import('node:fs');
  const {parse}=await import('yaml');
  const linked=new Set(config.packageRules.filter(r=>r.changelogUrl).flatMap(r=>r.matchPackageNames??[]));
  const images=new Set();
  const walk=(v)=>{if(Array.isArray(v))return v.forEach(walk);if(v&&typeof v==='object'){
    if(typeof v.repository==='string')images.add(v.repository);
    if(typeof v.image==='string')images.add(v.image.split(/[:@]/)[0]);
    Object.values(v).forEach(walk);}};
  for(const chart of readdirSync('charts'))walk(parse(readFileSync(`charts/${chart}/values.yaml`,'utf8')));
  const missing=[...images].filter(i=>i.includes('/')||/^[a-z0-9-]+$/.test(i)).filter(i=>!linked.has(i)&&!['postgres','mysql','mariadb'].includes(i));
  assert.deepEqual(missing,[]);
});
