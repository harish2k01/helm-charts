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
const bash = process.platform === "win32" ? "C:/Program Files/Git/bin/bash.exe" : "bash";

async function runRestore(t, scenario) {
  const directory = await mkdtemp(join(tmpdir(), "helm-pages-history-"));
  t.after(async () => {
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith("helm-pages-history-"));
    await rm(directory, { recursive: true, force: true });
  });
  await mkdir(join(directory, "docs"));
  await writeFile(join(directory, "docs/index.html"), "catalog");
  const signingKey = join(directory, "key.asc");
  await writeFile(signingKey, "public signing key fixture");
  const requests = new Map();
  let base;
  const server = createServer((request, response) => {
    const url = request.url;
    const attempt = (requests.get(url) || 0) + 1;
    requests.set(url, attempt);
    const status = scenario(url, attempt);
    const content = url === "/index.yaml"
      ? `entries:\n  demo:\n    - urls:\n        - ${base}/demo-0.1.0.tgz\n`
      : url.endsWith(".prov") ? "signed provenance" : "archive bytes";
    response.writeHead(status, { "Content-Type": "application/octet-stream" }).end(status === 200 ? content : "unavailable");
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
    child.stdin.end(prepare);
  });
  return { ...result, directory, requests };
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
