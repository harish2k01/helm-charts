import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {parseAllDocuments} from 'yaml';
import {rejects} from './helpers/render.mjs';

const hostLabel = 'tailscale.harish2k01.in/host-network';
function workload(values = {}, release = 'router', namespace = 'networking') {
  const output = execFileSync('helm', ['template', release, 'charts/tailscale', '--namespace', namespace,
    '--set-json', JSON.stringify(values)], {encoding: 'utf8'});
  const docs = parseAllDocuments(output);
  for (const doc of docs) assert.deepEqual(doc.errors, []);
  return docs.map(d => d.toJSON()).find(d => d.kind === 'StatefulSet');
}
const isolationRule = {
  labelSelector: {matchLabels: {[hostLabel]: 'true'}},
  namespaceSelector: {},
  topologyKey: 'kubernetes.io/hostname',
};

test('default pod networking keeps DNS and scheduling defaults', () => {
  const w = workload();
  assert.equal(w.spec.template.spec.hostNetwork, undefined);
  assert.equal(w.spec.template.spec.dnsPolicy, undefined);
  assert.equal(w.spec.template.spec.affinity, undefined);
  assert.equal(w.spec.template.metadata.labels[hostLabel], undefined);
});

test('host networking separates replicas even with all listener ports disabled', () => {
  const w = workload({hostNetwork: true, replicaCount: 2, service: {enabled: false},
    tailscale: {enableHealthCheck: false, enableMetrics: false},
    podLabels: {[hostLabel]: 'false', team: 'networking'}});
  const pod = w.spec.template.spec;
  assert.equal(w.spec.replicas, 2);
  assert.equal(pod.hostNetwork, true);
  assert.equal(pod.dnsPolicy, 'ClusterFirstWithHostNet');
  assert.equal(pod.containers[0].ports?.length ?? 0, 0);
  assert.equal(w.spec.template.metadata.labels[hostLabel], 'true');
  assert.equal(w.spec.template.metadata.labels.team, 'networking');
  assert.deepEqual(pod.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution, [isolationRule]);
  const other = workload({hostNetwork: true, nameOverride: 'other'}, 'another', 'elsewhere');
  assert.equal(other.spec.template.metadata.labels[hostLabel], 'true');
  assert.deepEqual(other.spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution, [isolationRule]);
});

test('required host isolation preserves all custom affinity and scheduling settings', () => {
  const term = {labelSelector: {matchLabels: {app: 'custom'}}, topologyKey: 'kubernetes.io/hostname'};
  const affinity = {
    nodeAffinity: {requiredDuringSchedulingIgnoredDuringExecution: {nodeSelectorTerms: [{matchExpressions: [{key: 'disk', operator: 'In', values: ['ssd']}]}]}},
    podAffinity: {preferredDuringSchedulingIgnoredDuringExecution: [{weight: 20, podAffinityTerm: term}]},
    podAntiAffinity: {requiredDuringSchedulingIgnoredDuringExecution: [term], preferredDuringSchedulingIgnoredDuringExecution: [{weight: 50, podAffinityTerm: term}]},
  };
  const nodeSelector = {pool: 'routers'};
  const tolerations = [{key: 'router', operator: 'Exists'}];
  const pod = workload({hostNetwork: true, affinity, nodeSelector, tolerations}).spec.template.spec;
  assert.deepEqual(pod.affinity, {...affinity, podAntiAffinity: {...affinity.podAntiAffinity,
    requiredDuringSchedulingIgnoredDuringExecution: [term, isolationRule]}});
  assert.deepEqual(pod.nodeSelector, nodeSelector);
  assert.deepEqual(pod.tolerations, tolerations);
  assert.deepEqual(workload({affinity}).spec.template.spec.affinity, affinity);
});

test('explicit supported DNS policies are honored in both network modes', () => {
  for (const hostNetwork of [false, true]) {
    for (const dnsPolicy of ['ClusterFirst', 'ClusterFirstWithHostNet', 'Default']) {
      assert.equal(workload({hostNetwork, dnsPolicy}).spec.template.spec.dnsPolicy, dnsPolicy);
    }
  }
});

test('unsupported DNS policies and nonboolean host networking fail schema validation', () => {
  for (const policy of ['None', 'invalid']) rejects('tailscale', [`dnsPolicy=${policy}`], /dnsPolicy/);
  rejects('tailscale', ['hostNetwork=yes'], /hostNetwork/);
});
