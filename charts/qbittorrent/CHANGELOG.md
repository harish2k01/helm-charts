# Changelog

## 0.3.2

### Chart changes

Add a link to the web chart catalog near the top of the README. Application versions and workload configuration are unchanged.

## 0.3.1

### Application changes

5.2.4 → 5.3.0 adds app-owned WebUI, RSS and torrent-management features. Back up the full /config including session and SQLite data: configuration migration version 9 removes already migrated legacy keys and image-only rollback is not assured. Trusted proxies are resolved nearest-to-farthest; include intended intermediaries. search/downloadTorrent and rss/setFeedRefreshInterval now require POST. The LinuxServer wrapper still uses WEBUI_PORT and TORRENTING_PORT; no new service or datastore is required.

Source: [upstream changes](https://github.com/qbittorrent/qBittorrent/compare/release-5.2.4...release-5.3.0).

### Chart changes

Align the image, chart metadata, values schema and catalog. Existing deployment options, persistence and datastore images are unchanged.

## 0.2.0 - 2026-10-21

### Application changes

The 5.2.1–5.2.4 releases repair lockfile handling, migrations, database failures, torrent imports and WebUI/API escaping, and restrict forwarded-host use to explicitly enabled reverse-proxy support. No new required LinuxServer environment variable, persistent path or listening port was introduced in this range. Existing `WEBUI_PORT=8080`, `TORRENTING_PORT=6881`, `/config`, and optional peer TCP/UDP exposure remain valid. When changing ports, change both the matching `env` value and the Service/container port values. Configure reverse proxy support and trusted proxies in qBittorrent rather than disabling CSRF/host validation. Back up `/config`, including resume/session state, before upgrade.

Do not use the unrelated historical LinuxServer `20.04.1` tag as a qBittorrent major upgrade; this chart follows the actual application 5.x release stream.

Reviewed upstream release sequence: [release-5.2.1](https://github.com/qbittorrent/qBittorrent/releases/tag/release-5.2.1), [release-5.2.2](https://github.com/qbittorrent/qBittorrent/releases/tag/release-5.2.2), [release-5.2.3](https://github.com/qbittorrent/qBittorrent/releases/tag/release-5.2.3), [release-5.2.4](https://github.com/qbittorrent/qBittorrent/releases/tag/release-5.2.4).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-qbittorrent/).

Configuration/source review: [full comparison](https://github.com/qbittorrent/qBittorrent/compare/release-5.2.0...release-5.2.4). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.

### Chart changes

- Pin image/app metadata and image annotation consistently to 5.2.4; refresh schema defaults, chart install examples, repository table and generated catalog.
- Add a complete runtime configuration reference and commented opt-in values, including existing and newly introduced settings; preserve application-owned configuration.
- Support existing Secrets/ConfigMaps through optional envFrom without creating credentials.

Validation: Helm lint, default rendering, optional configuration/Secret rendering, schema checks and generated-catalog tests. No production workload was modified or live database migration performed.
