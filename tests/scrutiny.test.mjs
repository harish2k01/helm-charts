import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseAllDocuments } from 'yaml';

const render = (...args) => parseAllDocuments(execFileSync('helm', ['template', 'scrutiny', 'charts/scrutiny', '--namespace', 'monitoring', ...args], {encoding:'utf8'})).map(d=>d.toJSON()).filter(Boolean);
test('Scrutiny serializes database writers during default upgrades', () => {
  const deployment=render().find(d=>d.kind==='Deployment');
  assert.deepEqual(deployment.spec.strategy,{type:'Recreate'});
  const influx=deployment.spec.template.spec.containers.find(c=>c.name==='influxdb');
  assert.equal(influx.image,'influxdb:2.9.1');
  assert.equal(influx.env,undefined);
  assert.equal(influx.args,undefined);
  assert.ok(influx.volumeMounts.some(v=>v.mountPath==='/var/lib/influxdb2'));
});
test('InfluxDB overrides reach only its sidecar and retain Kubernetes Secret references', () => {
  const deployment=render('--set','influxdb.env.INFLUXD_USE_HASHED_TOKENS=false','--set','influxdb.args[0]=--log-level=debug','--set','influxdb.envFrom[0].secretRef.name=influx-settings').find(d=>d.kind==='Deployment');
  const influx=deployment.spec.template.spec.containers.find(c=>c.name==='influxdb');
  assert.deepEqual(influx.env,[{name:'INFLUXD_USE_HASHED_TOKENS',value:'false'}]);
  assert.deepEqual(influx.args,['--log-level=debug']);
  assert.deepEqual(influx.envFrom,[{secretRef:{name:'influx-settings'}}]);
  assert.equal(deployment.spec.template.spec.containers.find(c=>c.name==='scrutiny-web').env,undefined);
});
