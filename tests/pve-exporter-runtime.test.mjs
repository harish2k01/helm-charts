import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseAllDocuments } from 'yaml';
const render = (...args) => parseAllDocuments(execFileSync('helm', ['template', 'review', 'charts/pve-exporter', '--namespace', 'review', ...args], { encoding: 'utf8' })).map(d => d.toJSON()).filter(Boolean);
const pod = docs => docs.find(d => d.kind === 'Deployment').spec.template.spec;
test('file configuration stays Secret-backed and uses the chosen mount path', () => {
  const spec = pod(render('--set', 'proxmox.config.mountPath=/etc/custom/pve.yml'));
  assert.ok(spec.containers[0].args.includes('--config.file=/etc/custom/pve.yml'));
  assert.ok(spec.containers[0].args.includes('--collector.qdevice'));
  assert.equal(spec.containers[0].volumeMounts[0].mountPath, '/etc/custom/pve.yml');
  assert.ok(spec.volumes[0].secret.secretName);
});
test('environment mode needs only its credential Secret and can disable QDevice', () => {
  const docs = render('--set', 'proxmox.config.enabled=false,collectors.qdevice=false,envFrom[0].secretRef.name=pve-credentials');
  const spec = pod(docs), container = spec.containers[0];
  assert.deepEqual(container.envFrom, [{ secretRef: { name: 'pve-credentials' } }]);
  assert.ok(container.args.includes('--no-collector.qdevice'));
  assert.ok(!container.args.some(a => a.startsWith('--config.file')));
  assert.equal(spec.volumes, undefined);
  assert.equal(container.volumeMounts, undefined);
  assert.ok(!docs.some(d => d.kind === 'Secret'));
});
