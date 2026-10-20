import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { parse } from "yaml";

const root = new URL("../", import.meta.url);

test("catalog includes every chart with authoritative versions and icon URLs", async () => {
  const { charts } = JSON.parse(
    await readFile(new URL("docs/catalog.json", root), "utf8"),
  );
  const entries = (
    await readdir(new URL("charts/", root), { withFileTypes: true })
  ).filter((e) => e.isDirectory());
  assert.equal(charts.length, entries.length);
  assert.equal(new Set(charts.map((c) => c.slug)).size, charts.length);
  for (const entry of entries) {
    const source = parse(
      await readFile(new URL(`charts/${entry.name}/Chart.yaml`, root), "utf8"),
    );
    const chart = charts.find((c) => c.slug === source.name);
    assert.ok(chart, `Missing ${source.name}`);
    assert.equal(
      chart.version,
      String(source.version),
      `${source.name}: chart version`,
    );
    assert.equal(
      chart.appVersion,
      String(source.appVersion),
      `${source.name}: application version`,
    );
    assert.equal(
      chart.description,
      source.description,
      `${source.name}: description`,
    );
    assert.equal(
      chart.icon,
      source.icon || null,
      `${source.name}: native icon`,
    );
    assert.ok(chart.category, `${source.name}: category`);
  }
});
