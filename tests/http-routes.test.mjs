import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseAllDocuments } from 'yaml';

const charts = readdirSync('charts').filter(name => existsSync(`charts/${name}/templates/httproute.yaml`));
const route = (gateway, host, extra = {}) => ({ parentRefs: [{ name: gateway, namespace: 'edge', sectionName: 'https' }], hostnames: [host], ...extra });
function render(chart, values = {}, extra = []) {
  const dir = mkdtempSync(join(tmpdir(), 'helm-http-routes-'));
  try {
    const file = join(dir, 'values.json');
    writeFileSync(file, JSON.stringify(values));
    return execFileSync('helm', ['template', 'example', `charts/${chart}`, '--namespace', 'apps', '-f', file, ...extra], { encoding: 'utf8' });
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const routes = output => parseAllDocuments(output).map(doc => doc.toJSON()).filter(doc => doc?.kind === 'HTTPRoute');

for (const chart of charts) {
  test(`${chart}: independent named routes retain the legacy backend and isolate attachments`, () => {
    const legacy = routes(render(chart, { httpRoute: { enabled: true, ...route('legacy', 'legacy.example.com') } }))[0];
    const output = routes(render(chart, {
      httpRoutes: {
        internal: route('internal', 'app.internal.example.com', { annotations: { 'example.com/scope': 'internal' } }),
        external: route('external', 'app.example.com'),
        disabled: { enabled: false },
      },
    }));
    assert.equal(output.length, 2);
    for (const key of ['internal', 'external']) {
      const actual = output.find(r => r.metadata.name.endsWith(`-${key}`));
      assert.equal(actual.metadata.namespace, 'apps');
      assert.equal(actual.spec.parentRefs[0].name, key);
      assert.deepEqual(actual.spec.hostnames, [key === 'internal' ? 'app.internal.example.com' : 'app.example.com']);
      assert.deepEqual(actual.spec.rules[0].backendRefs, legacy.spec.rules[0].backendRefs.map(b => ({ ...b, weight: 1 })));
      assert.equal(actual.metadata.labels['app.kubernetes.io/instance'], 'example');
    }
    assert.equal(output.find(r => r.metadata.name.endsWith('-internal')).metadata.annotations['example.com/scope'], 'internal');
    assert.equal(output.find(r => r.metadata.name.endsWith('-external')).metadata.annotations, undefined);
    const together = routes(render(chart, { httpRoute: { enabled: true, ...route('legacy', 'legacy.example.com') }, httpRoutes: { external: route('external', 'app.example.com') } }));
    assert.equal(together.length, 2);
    assert.deepEqual(together.find(r => r.metadata.name === legacy.metadata.name), legacy);
    assert.equal(routes(render(chart)).length, 0);
  });

  test(`${chart}: named route filters, matches, and long resource names render correctly`, () => {
    const rule = { filters: [{ type: 'RequestHeaderModifier', requestHeaderModifier: { set: [{ name: 'X-Route', value: 'external' }] } }] };
    const output = routes(render(chart, { fullnameOverride: 'a'.repeat(63), httpRoutes: { external: route('external', 'app.example.com', { rules: [rule, { matches: [{ path: { type: 'PathPrefix', value: '/api' } }] }] }) } }));
    assert.equal(output[0].metadata.name.length, 63);
    assert.ok(output[0].metadata.name.endsWith('-external'));
    assert.deepEqual(output[0].spec.rules[0].filters, rule.filters);
    assert.equal(output[0].spec.rules[1].matches[0].path.value, '/api');
    assert.ok(output[0].spec.rules.every(r => r.backendRefs[0].name === 'a'.repeat(63)));
  });
}

test('named route schema rejects missing attachments, invalid names and empty rules', () => {
  for (const httpRoutes of [
    { external: {} },
    { external: { parentRefs: [], hostnames: ['app.example.com'] } },
    { external: route('external', 'app.example.com', { rules: [] }) },
    { 'UPPERCASE': route('external', 'app.example.com') },
    { ['a'.repeat(41)]: route('external', 'app.example.com') },
    { external: route('external', 'app.example.com', { enabled: 'true' }) },
  ]) {
    assert.throws(() => render('bentopdf', { httpRoutes }), /Error/);
  }
});

test('Ghost named routes retain ActivityPub endpoints and app backend', () => {
  const actual = routes(render('ghost', { activityPub: { enabled: true }, httpRoutes: { external: route('external', 'blog.example.com') } }))[0];
  assert.equal(actual.spec.rules[0].backendRefs[0].name, 'example-ghost-activitypub');
  assert.equal(actual.spec.rules[0].backendRefs[0].port, 8080);
  assert.ok(actual.spec.rules[0].matches.some(m => m.path.value === '/.well-known/webfinger'));
  assert.equal(actual.spec.rules[1].backendRefs[0].name, 'example-ghost');
  assert.throws(() => render('ghost', { activityPub: { enabled: true }, httpRoutes: { external: { enabled: false } } }), /requires httpRoute.enabled/);
});

test('route names that collide after shortening fail instead of emitting duplicate objects', () => {
  assert.throws(() => render('bentopdf', {
    fullnameOverride: 'a'.repeat(59) + '-b',
    httpRoutes: { a: route('one', 'one.example.com'), 'b-a': route('two', 'two.example.com') },
  }), /resource name collision/);
});

test('AdGuard and Syncthing named routes follow configurable HTTP Service ports', () => {
  for (const chart of ['adguard-home', 'syncthing']) {
    const actual = routes(render(chart, { service: { ports: [{ name: 'http', port: 8888, targetPort: 8888, protocol: 'TCP' }] }, httpRoutes: { external: route('external', 'app.example.com') } }))[0];
    assert.equal(actual.spec.rules[0].backendRefs[0].port, 8888);
  }
});

test('Portfolio Next rejects Ingress combined with enabled named routes', () => {
  assert.throws(() => render('portfolio-next', { ingress: { enabled: true }, httpRoutes: { external: route('external', 'app.example.com') } }), /Enable only one/);
  assert.equal(routes(render('portfolio-next', { ingress: { enabled: true }, httpRoutes: { external: { enabled: false } } })).length, 0);
});
