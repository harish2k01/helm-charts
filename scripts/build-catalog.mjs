import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { parse } from "yaml";

const root = fileURLToPath(new URL("../", import.meta.url));
const readme = await readFile(join(root, "README.md"), "utf8");
const categories = new Map();
for (const row of readme.split(/\r?\n/)) {
  const match = row.match(
    /^\| \[`([^`]+)`\]\(charts\/[^)]+\) \|[^|]+\|[^|]+\|\s*([^|]+)\|/,
  );
  if (match) categories.set(match[1], match[2].trim());
}
const names = {
  "adguard-home": "AdGuard Home",
  bentopdf: "BentoPDF",
  cloudflared: "Cloudflared",
  "firefly-iii": "Firefly III",
  "k8s-debug-pod": "K8s Debug Pod",
  owncloud: "ownCloud",
  "pocket-id": "Pocket ID",
  "pve-exporter": "Proxmox VE Exporter",
  qbittorrent: "qBittorrent",
  "qbittorrent-exporter": "qBittorrent Exporter",
  "speedtest-tracker": "Speedtest Tracker",
  "tor-proxy": "Tor Proxy",
  "uptime-kuma": "Uptime Kuma",
};
const entries = await readdir(join(root, "charts"), { withFileTypes: true });
const charts = [];
for (const entry of entries
  .filter((e) => e.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))) {
  const metadata = parse(
    await readFile(join(root, "charts", entry.name, "Chart.yaml"), "utf8"),
  );
  if (
    !metadata.name ||
    !metadata.version ||
    !metadata.description ||
    !metadata.appVersion
  ) {
    throw new Error(
      `Incomplete catalog metadata: charts/${entry.name}/Chart.yaml`,
    );
  }
  if (
    metadata.name !== entry.name ||
    !/^[a-z0-9][a-z0-9-]*$/.test(metadata.name)
  ) {
    throw new Error(`Chart name must match its directory: ${entry.name}`);
  }
  if (!categories.has(metadata.name))
    throw new Error(`Missing README catalog category: ${metadata.name}`);
  if (metadata.icon && new URL(metadata.icon).protocol !== "https:") {
    throw new Error(`Chart icon must use HTTPS: ${metadata.name}`);
  }
  charts.push({
    name:
      names[metadata.name] ||
      metadata.name.replace(
        /(^|-)(\w)/g,
        (_, space, letter) => `${space ? " " : ""}${letter.toUpperCase()}`,
      ),
    slug: metadata.name,
    category: categories.get(metadata.name),
    version: String(metadata.version),
    appVersion: String(metadata.appVersion),
    description: metadata.description,
    icon: metadata.icon || null,
  });
}
const output = `${JSON.stringify({ charts }, null, 2)}\n`;
const destination = resolve(root, "docs/catalog.json");
if (process.argv.includes("--check")) {
  if ((await readFile(destination, "utf8")) !== output) {
    throw new Error(
      "docs/catalog.json is stale. Run npm run build:catalog and commit the result.",
    );
  }
  console.log(`Catalog is current (${charts.length} charts).`);
} else {
  await writeFile(destination, output);
  console.log(`Generated docs/catalog.json (${charts.length} charts).`);
}
