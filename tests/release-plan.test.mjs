import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { parse } from 'yaml';
import { digest, selectOciPackages, planRelease, checkVersionBumps } from '../scripts/release-plan.mjs';
import { packageCharts } from '../scripts/package-charts.mjs';
import { publishOci } from '../scripts/publish-oci.mjs';

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'helm-release-'));
  t.after(() => {
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith('helm-release-'));
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

function git(directory, ...args) {
  return execFileSync('git', args, { cwd: directory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function repository(t) {
  const directory = fixture(t);
  mkdirSync(join(directory, 'charts/demo'), { recursive: true });
  mkdirSync(join(directory, '_site'));
  writeFileSync(join(directory, 'charts/demo/Chart.yaml'), 'apiVersion: v2\nname: demo\nversion: 1.0.0\n');
  git(directory, 'init');
  git(directory, 'add', '.');
  git(directory, '-c', 'user.name=Codex', '-c', 'user.email=codex@openai.com', 'commit', '-m', 'fixture');
  const base = git(directory, 'rev-parse', 'HEAD');
  return { directory, base };
}

function within(directory, fn) {
  const previous = process.cwd();
  process.chdir(directory);
  try { return fn(); } finally { process.chdir(previous); }
}

test('published archives are reused; new chart versions are packaged', t => {
  const { directory } = repository(t);
  writeFileSync(join(directory, '_site/demo-1.0.0.tgz'), 'original published archive');
  within(directory, () => {
    assert.equal(planRelease().charts[0].package, false);
    writeFileSync('charts/demo/Chart.yaml', 'apiVersion: v2\nname: demo\nversion: 1.1.0\n');
    assert.equal(planRelease().charts[0].package, true);
  });
});

test('publication receipts skip only matching archive digests; reconcile checks every version', t => {
  const directory = fixture(t);
  writeFileSync(join(directory, 'demo-1.0.0.tgz'), 'published');
  writeFileSync(join(directory, 'demo-0.9.0.tgz'), 'historical');
  const state = { oci: { 'demo-1.0.0.tgz': digest(join(directory, 'demo-1.0.0.tgz')) } };
  assert.deepEqual(selectOciPackages(directory, state), ['demo-0.9.0.tgz']);
  assert.equal(selectOciPackages(directory, state, true).length, 2);
  writeFileSync(join(directory, 'demo-1.0.0.tgz'), 'different bytes');
  assert.equal(selectOciPackages(directory, state).length, 2);
});

test('recorded sources reject chart changes under the same published version', t => {
  const { directory } = repository(t);
  within(directory, () => {
    const state = { version: 1, oci: {}, sources: { 'demo-1.0.0.tgz': 'different-source-tree' } };
    assert.throws(() => planRelease({ state }), /without a chart version bump/);
    assert.throws(() => planRelease({ state: { version: 2 } }), /Unsupported release state/);
  });
});

test('version guard rejects a changed README without a bump and permits bumped, new and retired charts', t => {
  const { directory, base } = repository(t);
  within(directory, () => {
    writeFileSync('charts/demo/README.md', 'New documentation');
    git(directory, 'add', '.');
    git(directory, '-c', 'user.name=Codex', '-c', 'user.email=codex@openai.com', 'commit', '-m', 'change');
    assert.throws(() => checkVersionBumps(base), /without a chart version bump/);
    writeFileSync('charts/demo/Chart.yaml', 'apiVersion: v2\nname: demo\nversion: 1.1.0\n');
    mkdirSync('charts/new');
    writeFileSync('charts/new/Chart.yaml', 'apiVersion: v2\nname: new\nversion: 1.0.0\n');
    git(directory, 'add', '.');
    git(directory, '-c', 'user.name=Codex', '-c', 'user.email=codex@openai.com', 'commit', '-m', 'bump');
    assert.doesNotThrow(() => checkVersionBumps(base));
    git(directory, 'rm', '-r', 'charts/demo');
    git(directory, '-c', 'user.name=Codex', '-c', 'user.email=codex@openai.com', 'commit', '-m', 'retire');
    assert.doesNotThrow(() => checkVersionBumps(base));
    assert.throws(() => checkVersionBumps('missing-ref'));
  });
});

test('reused signed packages are verified without packaging or dependency downloads', t => {
  const directory = fixture(t);
  writeFileSync(join(directory, 'demo-1.0.0.tgz'), 'original');
  writeFileSync(join(directory, 'demo-1.0.0.tgz.prov'), 'signature');
  const calls = [];
  packageCharts({ charts: [{ archive: 'demo-1.0.0.tgz', package: false }] }, directory,
    (command, args) => calls.push([command, ...args]), { HELM_SIGNING_PUBLIC_KEYRING: 'public.gpg' });
  assert.deepEqual(calls, [['helm', 'verify', join(directory, 'demo-1.0.0.tgz'), '--keyring', 'public.gpg']]);
  assert.equal(readFileSync(join(directory, 'demo-1.0.0.tgz'), 'utf8'), 'original');
});

test('new packages use locked dependency builds only when dependencies exist', t => {
  const directory = fixture(t);
  const calls = [];
  const charts = [false, true].map(dependencies => ({ directory: 'charts/demo', archive: 'demo.tgz', package: true,
    metadata: dependencies ? { dependencies: [{ name: 'database' }] } : {} }));
  packageCharts({ charts }, directory, (command, args) => calls.push([command, ...args]), {
    HELM_SIGNING_KEY_NAME: 'key', HELM_SIGNING_KEYRING: 'secret.gpg', HELM_SIGNING_PASSPHRASE_FILE: 'pass', HELM_SIGNING_PUBLIC_KEYRING: 'pub.gpg',
  });
  assert.equal(calls.filter(call => call[1] === 'package').length, 2);
  assert.deepEqual(calls.filter(call => call[1] === 'dependency'), [['helm', 'dependency', 'build', 'charts/demo']]);
});

test('missing provenance is repaired over original bytes and accepted by Helm', { timeout: 60000 }, t => {
  const directory = fixture(t);
  const home = join(directory, 'gpg');
  mkdirSync(home);
  const env = { ...process.env, GNUPGHOME: home };
  const run = (command, args, options = {}) => execFileSync(command, args, { ...options, env, stdio: options.stdio || ['pipe', 'pipe', 'pipe'] });
  const uid = 'Codex Release Test <codex-release-test@example.invalid>';
  run('gpg', ['--batch', '--pinentry-mode', 'loopback', '--passphrase', '', '--quick-generate-key', uid, 'rsa2048', 'sign', '0']);
  t.after(() => { try { run('gpgconf', ['--kill', 'all']); } catch {} });
  const keyring = join(directory, 'public.gpg');
  writeFileSync(keyring, run('gpg', ['--batch', '--export', uid]));
  const chart = join(directory, 'demo');
  mkdirSync(chart);
  writeFileSync(join(chart, 'Chart.yaml'), 'apiVersion: v2\nname: demo\nversion: 1.0.0\n');
  writeFileSync(join(chart, 'values.yaml'), '{}\n');
  run('helm', ['package', chart, '--destination', directory]);
  const archive = join(directory, 'demo-1.0.0.tgz');
  const before = digest(archive);
  const passphrase = join(directory, 'passphrase');
  writeFileSync(passphrase, '');
  packageCharts({ charts: [{ archive: 'demo-1.0.0.tgz', package: false }] }, directory, run, {
    HELM_SIGNING_KEY_NAME: uid, HELM_SIGNING_PASSPHRASE_FILE: passphrase, HELM_SIGNING_PUBLIC_KEYRING: keyring,
  });
  assert.equal(digest(archive), before);
  assert.ok(existsSync(`${archive}.prov`));
  run('helm', ['verify', archive, '--keyring', keyring]);
});

for (const scenario of ['existing', 'missing', 'unauthorized', 'timeout', 'push-failure']) {
  test(`OCI publication handles ${scenario} without masking failures`, async t => {
    const directory = fixture(t);
    const name = 'demo-1.0.0.tgz';
    writeFileSync(join(directory, name), 'published bytes');
    const calls = [];
    const run = async (_command, args) => {
      calls.push(args);
      if (args[0] === 'push') {
        if (scenario === 'push-failure') throw new Error('push rejected');
        return { stdout: '' };
      }
      if (args[2].startsWith('oci://') && scenario !== 'existing') {
        throw Object.assign(new Error(scenario), { stderr: scenario === 'unauthorized' ? '401 Unauthorized' : scenario === 'timeout' ? 'network timeout' : '404 Not Found' });
      }
      return { stdout: 'name: demo\nversion: 1.0.0\n' };
    };
    const plan = { state: { version: 1, oci: {}, sources: {} }, charts: [{ archive: name, source: 'source-tree' }] };
    const publish = () => publishOci(plan, 'oci://ghcr.io/owner/charts', directory, run);
    if (['unauthorized', 'timeout', 'push-failure'].includes(scenario)) {
      await assert.rejects(publish);
      if (scenario !== 'push-failure') assert.equal(calls.filter(args => args[0] === 'push').length, 0);
    } else {
      const state = await publish();
      assert.equal(state.oci[name], digest(join(directory, name)));
      assert.equal(state.sources[name], 'source-tree');
      assert.equal(calls.filter(args => args[0] === 'push').length, scenario === 'missing' ? 1 : 0);
      calls.length = 0;
      await publishOci({ ...plan, state }, 'oci://ghcr.io/owner/charts', directory, run);
      assert.equal(calls.length, 0, 'successful retries do not query already confirmed OCI versions');
    }
  });
}

const workflow = parse(readFileSync(new URL('../.github/workflows/release.yaml', import.meta.url), 'utf8'));
const releaseScript = workflow.jobs['build-and-deploy'].steps.find(step => step.name === 'Create GitHub releases').with.script;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
for (const scenario of ['complete', 'missing-provenance', 'new', 'upload-failure']) {
  test(`GitHub release inventory handles ${scenario}`, async () => {
    const uploads = [];
    const creates = [];
    const inventory = scenario === 'new' ? [] : [{ id: 1, tag_name: 'demo-1.0.0', assets: [
      { name: 'demo-1.0.0.tgz' }, ...(scenario === 'complete' ? [{ name: 'demo-1.0.0.tgz.prov' }] : []),
    ] }];
    const fs = {
      readFileSync(file) {
        if (file === '.release-inventory.json') return JSON.stringify(inventory);
        if (file === '.release-plan.json') return JSON.stringify({ charts: [{ directory: 'charts/demo',
          metadata: { name: 'demo', version: '1.0.0', appVersion: '2.0.0', description: 'Demo' } }] });
        return Buffer.from('asset');
      },
      existsSync: () => true,
    };
    const github = { rest: { repos: {
      async createRelease(input) { creates.push(input); return { data: { id: 2, tag_name: input.tag_name } }; },
      async uploadReleaseAsset(input) { uploads.push(input); if (scenario === 'upload-failure') throw new Error('upload failed'); },
    } } };
    const require = name => name === 'fs' ? fs : name === 'path' ? { join, basename } : {
      execFileSync: () => 'name: demo\nversion: 1.0.0\nappVersion: 2.0.0\ndescription: Demo\n',
    };
    const execute = () => new AsyncFunction('require', 'github', 'context', 'core', releaseScript)(require, github,
      { repo: { owner: 'owner', repo: 'charts' } }, { info() {}, warning() {} });
    if (scenario === 'upload-failure') { await assert.rejects(execute, /upload failed/); return; }
    await execute();
    assert.equal(creates.length, scenario === 'new' ? 1 : 0);
    assert.deepEqual(uploads.map(input => input.name), scenario === 'complete' ? [] : scenario === 'new'
      ? ['demo-1.0.0.tgz', 'demo-1.0.0.tgz.prov'] : ['demo-1.0.0.tgz.prov']);
  });
}
