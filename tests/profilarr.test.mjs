import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';

const chart = 'charts/profilarr';
const render = (...args) => execFileSync('helm', ['template', 'profilarr', chart, '--namespace', 'media', ...args], { encoding: 'utf8' });
const resource = (manifest, kind) => manifest.replace(/\r\n/g, '\n').split(/^---\s*$/m).find(doc => doc.includes(`kind: ${kind}\n`));

test('default install keeps state persistent and parser internal with authenticated app', () => {
  const manifest = render();
  const deployment = resource(manifest, 'Deployment');
  const service = resource(manifest, 'Service');
  assert.match(deployment, /type: Recreate/);
  assert.match(deployment, /automountServiceAccountToken: false/);
  assert.match(deployment, /runAsNonRoot: true/);
  assert.match(deployment, /image: "ghcr.io\/dictionarry-hub\/profilarr:2.2.0"/);
  assert.match(deployment, /image: "ghcr.io\/dictionarry-hub\/profilarr-parser:2.2.0"/);
  assert.match(deployment, /name: AUTH\s+value: "on"/);
  assert.match(deployment, /name: PARSER_HOST\s+value: "127.0.0.1"/);
  assert.match(deployment, /mountPath: \/config/);
  assert.match(resource(manifest, 'PersistentVolumeClaim'), /storage: 2Gi/);
  assert.match(service, /targetPort: http/);
  assert.doesNotMatch(service, /5000|parser/);
  assert.doesNotMatch(manifest, /kind: (HTTPRoute|Ingress)|mountPath: \/vault/);
});

test('sync-only ephemeral install needs neither parser nor PVC', () => {
  const manifest = render('--set', 'parser.enabled=false,persistence.config.enabled=false');
  assert.match(manifest, /name: config\s+emptyDir: \{\}/);
  assert.match(manifest, /mountPath: \/config/);
  assert.doesNotMatch(manifest, /kind: PersistentVolumeClaim|persistentVolumeClaim:|name: parser|name: PARSER_HOST|profilarr-parser/);
});

test('existing storage and runtime secrets are referenced without creating a claim or Secret', () => {
  const manifest = render('--set', 'persistence.config.existingClaim=existing-config,envFrom[0].secretRef.name=profilarr-auth');
  assert.match(manifest, /claimName: existing-config/);
  assert.match(manifest, /envFrom:\s+- secretRef:\s+name: profilarr-auth/);
  assert.doesNotMatch(manifest, /kind: (PersistentVolumeClaim|Secret)/);
});

test('listener overrides propagate through app and sidecar configuration', () => {
  const manifest = render('--set', 'service.port=80,service.targetPort=8686,parser.port=5050');
  assert.match(manifest, /name: PORT\s+value: "8686"/);
  assert.match(manifest, /containerPort: 8686/);
  assert.match(manifest, /name: PARSER_PORT\s+value: "5050"/);
  assert.match(manifest, /value: "http:\/\/\+:5050"/);
  assert.match(resource(manifest, 'Service'), /port: 80\s+targetPort: http/);
});

test('Gateway and Ingress route only to the app Service', () => {
  const gateway = render('--set', 'httpRoutes.main.enabled=true,httpRoutes.main.parentRefs[0].name=edge,httpRoutes.main.hostnames[0]=profilarr.example.com,env.ORIGIN=https://profilarr.example.com');
  assert.match(resource(gateway, 'HTTPRoute'), /backendRefs:\s+- name: profilarr\s+port: 6868/);
  assert.match(gateway, /name: ORIGIN\s+value: "https:\/\/profilarr.example.com"/);
  const ingress = render('--set', 'ingress.enabled=true,ingress.hosts[0].host=profilarr.example.com,ingress.hosts[0].paths[0].path=/,ingress.hosts[0].paths[0].pathType=Prefix');
  assert.match(resource(ingress, 'Ingress'), /service:\s+name: profilarr\s+port:\s+number: 6868/);
});

test('unsafe topology and invalid values fail before deployment', () => {
  for (const settings of [
    'replicaCount=2',
    'httpRoutes.main.enabled=true',
    'httpRoutes.main.enabled=true,ingress.enabled=true',
    'parser.port=6868',
    'service.targetPort=0',
    'persistence.config.mountPath=/data',
  ]) {
    const result = spawnSync('helm', ['template', 'profilarr', chart, '--set', settings], { encoding: 'utf8' });
    assert.notEqual(result.status, 0, settings);
    assert.match(result.stderr, /Error/);
  }
});
