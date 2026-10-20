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
test('application Secret keys and sidecar config mounts stay isolated',()=>{
  const deployment=render('--set','extraEnv[0].name=SCRUTINY_WEB_INFLUXDB_TOKEN','--set','extraEnv[0].valueFrom.secretKeyRef.name=credentials','--set','extraEnv[0].valueFrom.secretKeyRef.key=token','--set','influxdb.envFrom[0].secretRef.name=db-settings','--set','extraVolumes[0].name=custom-config','--set','extraVolumes[0].configMap.name=influx-config','--set','influxdb.extraVolumeMounts[0].name=custom-config','--set','influxdb.extraVolumeMounts[0].mountPath=/etc/influxdb2').find(d=>d.kind==='Deployment');
  const app=deployment.spec.template.spec.containers.find(c=>c.name==='scrutiny-web');
  const influx=deployment.spec.template.spec.containers.find(c=>c.name==='influxdb');
  assert.deepEqual(app.env[0].valueFrom,{secretKeyRef:{name:'credentials',key:'token'}});
  assert.equal(influx.env,undefined);
  assert.deepEqual(influx.envFrom,[{secretRef:{name:'db-settings'}}]);
  assert.ok(influx.volumeMounts.some(m=>m.name==='custom-config'&&m.mountPath==='/etc/influxdb2'));
  assert.ok(!app.volumeMounts.some(m=>m.name==='custom-config'));
  assert.ok(deployment.spec.template.spec.volumes.some(v=>v.name==='custom-config'&&v.configMap.name==='influx-config'));
});
