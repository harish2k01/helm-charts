import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'yaml';

export const digest = file => createHash('sha256').update(readFileSync(file)).digest('hex');

export function chartMetadata(directory) {
  const metadata = parse(readFileSync(join(directory, 'Chart.yaml'), 'utf8'));
  if (!/^[a-z0-9][a-z0-9-]*$/.test(metadata.name) ||
      !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?(?:\+[a-zA-Z0-9.-]+)?$/.test(String(metadata.version))) {
    throw new Error(`Unsafe chart name or version in ${directory}`);
  }
  return metadata;
}

// Compare the whole chart directory, including README/schema files packaged by Helm.
// This is prospective: existing published versions are not rewritten on bootstrap.
export function checkVersionBumps(base, head = 'HEAD') {
  if (!base || /^0+$/.test(base)) return;
  const paths = execFileSync('git', ['diff', '--name-only', '-z', base, head, '--', 'charts/'], { encoding: 'utf8' });
  const directories = new Set(paths.split('\0').filter(Boolean).map(file => file.split('/').slice(0, 2).join('/')));
  for (const directory of directories) {
    const currentFile = join(directory, 'Chart.yaml');
    if (!existsSync(currentFile)) continue; // Retired chart.
    let previous;
    try { previous = execFileSync('git', ['show', `${base}:${directory}/Chart.yaml`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
    catch {
      // A newly added chart has no previous metadata. Other git failures must fail closed.
      const oldFiles = execFileSync('git', ['ls-tree', base, '--', `${directory}/`], { encoding: 'utf8' });
      if (oldFiles.trim()) throw new Error(`Cannot read previous metadata for ${directory}`);
      continue;
    }
    const current = chartMetadata(directory);
    const old = parse(previous);
    if (old.name === current.name && String(old.version) === String(current.version)) {
      throw new Error(`${directory} changed without a chart version bump (${current.version}). Published versions are immutable.`);
    }
  }
}

export function selectOciPackages(site, state, reconcile = false) {
  return readdirSync(site).filter(name => name.endsWith('.tgz')).sort()
    .filter(name => reconcile || state.oci?.[name] !== digest(join(site, name)));
}

export function planRelease({ site = '_site', reconcile = false, state = { version: 1, oci: {}, sources: {} } } = {}) {
  if (state.version !== 1 || !state.oci || !state.sources) throw new Error('Unsupported release state; use a valid version 1 state.');
  const charts = readdirSync('charts', { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => {
    const directory = `charts/${entry.name}`;
    const metadata = chartMetadata(directory);
    const archive = `${metadata.name}-${metadata.version}.tgz`;
    const source = execFileSync('git', ['rev-parse', `HEAD:${directory}`], { encoding: 'utf8' }).trim();
    if (state.sources[archive] && state.sources[archive] !== source) {
      throw new Error(`${directory} changed without a chart version bump (${metadata.version}).`);
    }
    return { directory, metadata, archive, source, package: !existsSync(join(site, archive)) };
  });
  return { charts, reconcile, state };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === 'check-versions') {
    checkVersionBumps(process.env.CHART_BASE_SHA);
  } else {
    const stateFile = '_site/release-state.json';
    const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : undefined;
    const plan = planRelease({ state, reconcile: process.env.RECONCILE === 'true' });
    writeFileSync('.release-plan.json', JSON.stringify(plan, null, 2));
    console.log(`${plan.charts.filter(chart => chart.package).length} new packages; ${plan.charts.filter(chart => !chart.package).length} existing packages reused.`);
  }
}
