import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseAllDocuments } from 'yaml';
const render = (...args) => parseAllDocuments(execFileSync('helm', ['template', 'review', 'charts/tailscale', ...args], { encoding: 'utf8' })).map(d => d.toJSON()).filter(Boolean);
const container = docs => docs.find(d => d.kind === 'StatefulSet').spec.template.spec.containers[0];
test('default auth keeps the Secret reference and PVC state without overriding boot timeout', () => {
  const c = container(render());
  assert.ok(c.env.find(e => e.name === 'TS_AUTHKEY').valueFrom.secretKeyRef.name);
  assert.equal(c.env.find(e => e.name === 'TS_KUBE_SECRET').value, '');
  assert.ok(!c.env.some(e => e.name === 'TS_BOOT_TIMEOUT'));
  assert.ok(c.volumeMounts.some(v => v.name === 'state'));
});
test('OAuth mode omits the auth-key Secret dependency and accepts an extended boot timeout', () => {
  const docs = render('--set', 'authKey.enabled=false,tailscale.bootTimeout=90s,tailscale.extraEnv.TS_CLIENT_ID=test-client,tailscale.envFrom[0].secretRef.name=oauth-credentials');
  const c = container(docs);
  assert.ok(!c.env.some(e => e.name === 'TS_AUTHKEY'));
  assert.deepEqual(c.envFrom,[{secretRef:{name:'oauth-credentials'}}]);
  assert.equal(c.env.find(e => e.name === 'TS_BOOT_TIMEOUT').value,'90s');
  assert.ok(!docs.some(d => d.kind === 'Secret'));
});
