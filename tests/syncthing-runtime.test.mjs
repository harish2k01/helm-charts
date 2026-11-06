import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseAllDocuments } from 'yaml';
const container = (...args) => parseAllDocuments(execFileSync('helm', ['template', 'review', 'charts/syncthing', ...args], { encoding: 'utf8' })).map(d => d.toJSON()).find(d => d?.kind === 'Deployment').spec.template.spec.containers[0];
test('database startup gets its own probe budget before liveness begins', () => {
  const c = container();
  assert.equal(c.startupProbe.httpGet.path,'/rest/noauth/health');
  assert.equal(c.startupProbe.failureThreshold*c.startupProbe.periodSeconds,600);
  assert.ok(c.livenessProbe);
  assert.ok(!c.env.some(e => e.name.startsWith('STDB')));
});
test('operators can extend or disable startup checks without losing liveness', () => {
  assert.equal(container('--set','startupProbe.failureThreshold=120').startupProbe.failureThreshold,120);
  const c = container('--set-json','startupProbe=null');
  assert.equal(c.startupProbe,undefined);
  assert.ok(c.livenessProbe);
});
