import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse, stringify } from 'yaml';

export const retiredCharts = JSON.parse(readFileSync(new URL('./retired-charts.json', import.meta.url), 'utf8'));
export const isRetiredAsset = name => retiredCharts.some(chart =>
  name.startsWith(`${chart}-`) && /^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?\.tgz(?:\.prov)?$/.test(name.slice(chart.length + 1)));

export function pruneRetiredCharts(site) {
  const directory = resolve(site);
  const index = join(directory, 'index.yaml');
  if (existsSync(index)) {
    const data = parse(readFileSync(index, 'utf8'));
    for (const name of retiredCharts) delete data.entries?.[name];
    writeFileSync(index, stringify(data));
  }
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isFile() && isRetiredAsset(entry.name)) unlinkSync(join(directory, entry.name));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/prune-retired-charts.mjs <site-directory>');
  pruneRetiredCharts(process.argv[2]);
}
