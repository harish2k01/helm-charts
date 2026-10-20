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
  assert.deepEqual(embedded.matchPackageNames,['postgres','mysql','mariadb']);
  assert.ok(config.packageRules.some(r=>r.matchPackageNames?.includes('influxdb')&&r.prBodyNotes?.length));
});
