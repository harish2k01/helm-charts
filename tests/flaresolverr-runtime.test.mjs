import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseAllDocuments } from 'yaml';
const render = (...args) => parseAllDocuments(execFileSync('helm', ['template', 'review', 'charts/flaresolverr', ...args], { encoding: 'utf8' })).map(d => d.toJSON()).filter(Boolean);
test('browser wait tuning and proxy credentials do not enable public routing or storage', () => {
  const docs = render('--set-string', 'env.BROWSER_WAIT_TIMEOUT=3', '--set', 'envFrom[0].secretRef.name=proxy-credentials');
  const c = docs.find(d => d.kind === 'Deployment').spec.template.spec.containers[0];
  assert.deepEqual(c.env.find(e => e.name === 'BROWSER_WAIT_TIMEOUT'), {name:'BROWSER_WAIT_TIMEOUT',value:'3'});
  assert.deepEqual(c.envFrom,[{secretRef:{name:'proxy-credentials'}}]);
  assert.ok(!docs.some(d => ['Ingress','HTTPRoute','PersistentVolumeClaim','Secret'].includes(d.kind)));
  assert.ok(!c.env.some(e => ['PROXY_PASSWORD','PROXY_USERNAME','PROMETHEUS_ENABLED'].includes(e.name)));
});
