import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { digest, selectOciPackages } from './release-plan.mjs';

const exec = promisify(execFile);

export async function publishOci(plan, repository, site = '_site', run = exec) {
  const packages = selectOciPackages(site, plan.state, plan.reconcile);
  console.log(`Checking ${packages.length} pending OCI versions.`);
  const oci = {};
  for (const name of packages) {
    const archive = join(site, name);
    const { stdout } = await run('helm', ['show', 'chart', archive]);
    const metadata = parse(stdout);
    if (!metadata.name || !metadata.version) throw new Error(`Invalid chart metadata for ${name}`);
    try {
      await run('helm', ['show', 'chart', `${repository}/${metadata.name}`, '--version', String(metadata.version)]);
      console.log(`OCI ${metadata.name}:${metadata.version} already exists.`);
    } catch (error) {
      // Authentication, rate limits and network errors are not evidence of absence.
      const output = `${error.stderr || ''}\n${error.stdout || ''}`;
      if (!/(?:\b404\b|\bnot found\b|\bmanifest_unknown\b|\bname_unknown\b)/i.test(output) ||
          /unauthorized|forbidden|too many requests|\b429\b|\b50[0-9]\b|timeout|connection refused|no such host/i.test(output)) throw error;
      await run('helm', ['push', archive, repository]);
      console.log(`Published OCI ${metadata.name}:${metadata.version}.`);
    }
    oci[name] = digest(archive);
  }
  // Keep receipts only for archives included in this deployment (including retirement pruning).
  const all = { ...plan.state.oci, ...oci };
  const next = { version: 1, oci: {}, sources: { ...plan.state.sources } };
  for (const name of readdirSync(site).filter(name => name.endsWith('.tgz'))) {
    if (all[name] !== digest(join(site, name))) throw new Error(`Unconfirmed OCI publication: ${name}`);
    next.oci[name] = all[name];
  }
  for (const chart of plan.charts) next.sources[chart.archive] = chart.source;
  for (const name of Object.keys(next.sources)) if (!next.oci[name]) delete next.sources[name];
  return next;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const plan = JSON.parse(readFileSync('.release-plan.json', 'utf8'));
  const repository = `oci://ghcr.io/${process.env.GITHUB_REPOSITORY.toLowerCase()}`;
  const state = await publishOci(plan, repository);
  // This file reaches Pages only after GitHub release creation and all other steps succeed.
  writeFileSync('_site/release-state.json', JSON.stringify(state, null, 2));
}
