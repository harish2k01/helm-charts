import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, mkdir, writeFile, rm, access } from "node:fs/promises";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname, basename, resolve } from "node:path";
import { parse } from "yaml";

const workflow = parse(await readFile(new URL("../.github/workflows/release.yaml", import.meta.url), "utf8"));
const prepare = workflow.jobs["build-and-deploy"].steps.find(step => step.name === "Prepare Helm repository site").run;
const restoreState = workflow.jobs["build-and-deploy"].steps.find(step => step.name === "Restore publication state").run;
const bash = process.platform === "win32" ? "C:/Program Files/Git/bin/bash.exe" : "bash";

async function runRestore(t, scenario, { names = ['demo-0.1.0.tgz'], delay = 0, step = prepare } = {}) {
  const directory = await mkdtemp(join(tmpdir(), "helm-pages-history-"));
  t.after(async () => {
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith("helm-pages-history-"));
    await rm(directory, { recursive: true, force: true });
  });
  await mkdir(join(directory, "docs"));
  await mkdir(join(directory, "_site"));
  await writeFile(join(directory, "docs/index.html"), "catalog");
  const signingKey = join(directory, "key.asc");
  await writeFile(signingKey, "public signing key fixture");
  const requests = new Map();
  let active = 0;
  let maximumActive = 0;
  let base;
  const server = createServer((request, response) => {
    const url = request.url;
    const attempt = (requests.get(url) || 0) + 1;
    requests.set(url, attempt);
    const status = scenario(url, attempt);
    const content = url === "/index.yaml"
      ? names.length ? `entries:\n  demo:\n${names.map(name => `    - urls:\n        - ${base}/${name}\n`).join('')}` : 'entries: {}\n'
      : url.endsWith(".prov") ? "signed provenance" : "archive bytes";
    active++;
    maximumActive = Math.max(maximumActive, active);
    setTimeout(() => {
      response.writeHead(status, { "Content-Type": "application/octet-stream" }).end(status === 200 ? content : "unavailable");
      active--;
    }, delay);
  });
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  t.after(() => new Promise(done => server.close(done)));
  base = `http://127.0.0.1:${server.address().port}`;
  const result = await new Promise((done, reject) => {
    const child = spawn(bash, ["-e", "-o", "pipefail"], {
      cwd: directory,
      env: { ...process.env, GITHUB_WORKSPACE: resolve(".").replaceAll("\\", "/"), HELM_REPOSITORY_URL: base, HELM_SIGNING_PUBLIC_KEY: signingKey.replaceAll("\\", "/"), NO_PROXY: "127.0.0.1" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", data => { output += data; });
    child.stderr.on("data", data => { output += data; });
    child.on("error", reject);
    child.on("close", code => done({ code, output }));
    child.stdin.end(step);
  });
  return { ...result, directory, requests, maximumActive };
}

test("Pages history restores index, archive and provenance after temporary 503s", { timeout: 60000 }, async t => {
  const result = await runRestore(t, (_url, attempt) => attempt === 1 ? 503 : 200);
  assert.equal(result.code, 0, result.output);
  for (const file of ["index.yaml", "demo-0.1.0.tgz", "demo-0.1.0.tgz.prov"]) {
    assert.equal(result.requests.get(`/${file}`), 2, file);
    await access(join(result.directory, "_site", file));
  }
});

test("Pages history treats only a missing index as a new repository", async t => {
  const result = await runRestore(t, () => 404);
  assert.equal(result.code, 0, result.output);
  assert.match(result.output, /preparing a new Helm repository/);
  await assert.rejects(access(join(result.directory, "_site/index.yaml")));
});

test("Pages history tolerates historical provenance that was never published", async t => {
  const result = await runRestore(t, url => url.endsWith(".prov") ? 404 : 200);
  assert.equal(result.code, 0, result.output);
  await access(join(result.directory, "_site/demo-0.1.0.tgz"));
  await assert.rejects(access(join(result.directory, "_site/demo-0.1.0.tgz.prov")));
});

test("Pages history stops when a historical archive cannot be restored", async t => {
  const result = await runRestore(t, url => url.endsWith(".tgz") ? 404 : 200);
  assert.notEqual(result.code, 0, result.output);
  assert.equal(result.requests.get("/demo-0.1.0.tgz"), 1);
});

test("Pages history stops after persistent index errors instead of losing history", { timeout: 60000 }, async t => {
  const result = await runRestore(t, () => 503);
  assert.notEqual(result.code, 0, result.output);
  assert.equal(result.requests.get("/index.yaml"), 6);
  assert.match(result.output, /refusing to publish incomplete history/);
});

test("Pages history stops after persistent provenance errors", { timeout: 60000 }, async t => {
  const result = await runRestore(t, url => url.endsWith(".prov") ? 503 : 200);
  assert.notEqual(result.code, 0, result.output);
  assert.equal(result.requests.get("/demo-0.1.0.tgz.prov"), 6);
  assert.match(result.output, /refusing to publish incomplete history/);
});

test('Pages history downloads concurrently with at most four workers and retains every archive', async t => {
  const names = Array.from({ length: 9 }, (_, index) => `demo-0.1.${index}.tgz`);
  const result = await runRestore(t, () => 200, { names, delay: 75 });
  assert.equal(result.code, 0, result.output);
  assert.ok(result.maximumActive > 1, `Expected parallel downloads, got ${result.maximumActive}`);
  assert.ok(result.maximumActive <= 4, `Exceeded four workers: ${result.maximumActive}`);
  for (const name of names) {
    await access(join(result.directory, '_site', name));
    await access(join(result.directory, '_site', `${name}.prov`));
  }
});

test('Pages history propagates a failure from the final partial worker batch', async t => {
  const names = Array.from({ length: 6 }, (_, index) => `demo-0.1.${index}.tgz`);
  const result = await runRestore(t, url => url === '/demo-0.1.5.tgz' ? 404 : 200, { names });
  assert.notEqual(result.code, 0, result.output);
});

test('Pages history handles an empty index after all charts have been retired', async t => {
  const result = await runRestore(t, () => 200, { names: [] });
  assert.equal(result.code, 0, result.output);
  assert.equal(result.requests.size, 1);
});

test('publication state bootstraps only when the ledger is missing', async t => {
  const result = await runRestore(t, () => 404, { step: restoreState });
  assert.equal(result.code, 0, result.output);
  assert.match(result.output, /checking all existing OCI versions once/);
  await assert.rejects(access(join(result.directory, '_site/release-state.json')));
});

test('publication state stops on access errors instead of discarding receipts', async t => {
  const result = await runRestore(t, () => 403, { step: restoreState });
  assert.notEqual(result.code, 0, result.output);
  assert.match(result.output, /refusing to continue/);
});
