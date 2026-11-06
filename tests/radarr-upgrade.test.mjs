import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import YAML from 'yaml';
const chart='charts/radarr';
const values=YAML.parse(readFileSync(chart+'/values.yaml','utf8'));
const render=(args=[])=>YAML.parseAllDocuments(execFileSync('helm',['template','upgrade',chart,'--namespace','upgrade',...args],{encoding:'utf8'})).map(d=>d.toJSON()).find(d=>d?.kind==='Deployment').spec.template.spec.containers[0];
test('radarr configuration stays opt-in and metadata matches the deployable image',()=>{const pod=render();const meta=YAML.parse(readFileSync(chart+'/Chart.yaml','utf8'));assert.equal(values.image.tag,String(meta.appVersion));assert(pod.image.endsWith(':'+values.image.tag));const schema=JSON.parse(readFileSync(chart+'/values.schema.json','utf8'));assert.equal(schema.properties.image.properties.tag.default,values.image.tag);});
test('radarr references runtime Secrets without creating credentials',()=>{const pod=render(['--set','envFrom[0].secretRef.name=runtime-existing']);assert.deepEqual(pod.envFrom,[{secretRef:{name:'runtime-existing'}}]);});
test('radarr health checks remain valid with a host allowlist',()=>{const pod=render(['--set','env.RADARR__SERVER__ALLOWEDHOSTS=radarr.example.com']);for(const key of ['livenessProbe','readinessProbe'])assert.deepEqual(pod[key].httpGet.httpHeaders,[{name:'Host',value:'localhost'}]);});

test('radarr probes use the unauthenticated endpoint and remain configurable', () => {
  const schema = JSON.parse(readFileSync(chart + '/values.schema.json', 'utf8'));
  const defaults = render();
  const custom = render(['--set', 'livenessProbe.httpGet.path=/custom/ping', '--set', 'readinessProbe.httpGet.path=/custom/ready']);
  for (const key of ['livenessProbe', 'readinessProbe']) {
    assert.equal(defaults[key].httpGet.path, '/ping');
    assert.equal(defaults[key].httpGet.port, 'http');
    assert.deepEqual(defaults[key].httpGet.httpHeaders, [{ name: 'Host', value: 'localhost' }]);
    assert.equal(schema.properties[key].properties.httpGet.properties.path.default, '/ping');
    assert.equal(custom[key].httpGet.path, key === 'livenessProbe' ? '/custom/ping' : '/custom/ready');
  }
});
