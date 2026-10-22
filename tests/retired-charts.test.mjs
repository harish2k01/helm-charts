import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';
import { pruneRetiredCharts, isRetiredAsset } from '../scripts/prune-retired-charts.mjs';

test('retired chart history is removed without deleting unrelated package history', () => {
  const dir = mkdtempSync(join(tmpdir(), 'retired-charts-'));
  try {
    writeFileSync(join(dir, 'index.yaml'), 'apiVersion: v1\nentries:\n  portfolio-next: [{version: 0.1.0}]\n  portfolio-tracker: [{version: 0.2.1}]\n  demo: [{version: 0.1.0}]\n');
    for (const name of ['portfolio-next-0.1.0.tgz', 'portfolio-next-0.1.0.tgz.prov', 'portfolio-tracker-0.2.1.tgz', 'demo-0.1.0.tgz', 'portfolio-next-helper-0.1.0.tgz']) writeFileSync(join(dir, name), 'fixture');
    pruneRetiredCharts(dir);
    assert.deepEqual(Object.keys(parse(readFileSync(join(dir, 'index.yaml'), 'utf8')).entries), ['demo']);
    assert.deepEqual(readdirSync(dir).sort(), ['demo-0.1.0.tgz', 'index.yaml', 'portfolio-next-helper-0.1.0.tgz']);
    const before = readFileSync(join(dir, 'index.yaml'), 'utf8');
    pruneRetiredCharts(dir);
    assert.equal(readFileSync(join(dir, 'index.yaml'), 'utf8'), before);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('retirement asset matching is limited to chart archives and signatures', () => {
  assert.equal(isRetiredAsset('portfolio-next-0.2.0.tgz'), true);
  assert.equal(isRetiredAsset('portfolio-tracker-0.3.0-rc.1.tgz.prov'), true);
  for (const name of ['portfolio-next-0.2.0.exe', 'portfolio-next-helper-0.2.0.tgz', '../portfolio-next-0.2.0.tgz', 'portfolio-tracker-evil.tgz']) assert.equal(isRetiredAsset(name), false);
});
