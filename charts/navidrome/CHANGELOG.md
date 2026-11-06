# Changelog

## 0.2.0 - 2026-10-21

### Application changes

**Back up the complete `/data` volume before upgrading.** 0.64 re-encodes all internal IDs and migrates every table; cached/offline clients may need a full resync. Rollback requires restoring the matching database backup. The startup probe permits 15 minutes for migration; increase it for large libraries or slow storage. 0.64.2 fixes scanner lock contention and 32-bit invalid-number migrations; 0.64.0/0.64.1 also contain authentication/SSRF/ownership/security fixes.

The chart corrects the scan setting to `ND_SCANNER_SCHEDULE` (default `1h`) and leaves sharing application-owned. Upstream 0.63 changes the unset `EnableSharing` default from false to true. To retain disabled sharing, explicitly set `env.ND_ENABLESHARING: "false"`; an existing config-file choice is otherwise preserved. Remove old `ND_SCANSCHEDULE` overrides and use the new key. Existing user choices in config files should be reviewed because explicit environment values override the config.

All new options are available through `env` (string values); no chart template additions are required for app settings:

| Release | Environment settings | Behavior |
| --- | --- | --- |
| 0.62 | `ND_ENFORCENONROOTUSER`, `ND_TRANSCODING_MAXCONCURRENT`, `ND_TRANSCODING_MAXCONCURRENTPERUSER`, `ND_MATCHER_PREFERSTARRED`, `ND_UIPLAYBACKREPORTINTERVAL` | Optional non-root enforcement, transcode limits, matching and UI reporting. Preserve upstream defaults unless needed. |
| 0.62 | `ND_TRANSCODING_ENABLECANCELLATION`, `ND_MATCHER_FUZZYTHRESHOLD` | Replacements for deprecated `ND_ENABLETRANSCODINGCANCELLATION` and `ND_SIMILARSONGSMATCHTHRESHOLD`. |
| 0.63 | `ND_SCANNER_ARTISTSPLITEXCEPTIONS`, `ND_SCANNER_IGNOREDOTFOLDERS`, `ND_LYRICSPRIORITY` | Artist split exceptions, dot-folder scanning, and added sidecar lyric formats. |
| 0.64 | `ND_JELLYFIN_ENABLED`, `ND_JELLYFIN_SERVERNAME`, `ND_JELLYFIN_EXPOSEDPUBLICUSERS`, `ND_JELLYFIN_MAXCONCURRENTSTREAMS` | Experimental Jellyfin Music API stays disabled. Public user advertisement is empty by default. |
| 0.64 | `ND_ENABLENATURALSORTING`, `ND_MAXIMAGESIZE`, `ND_ENABLESCHEDULEDDBANALYZE` | Natural ordering, image safety limit and query-planner maintenance. |
| 0.64.1 | `ND_JELLYFIN_AUTODISCOVERY`, `ND_JELLYFIN_QUICKCONNECT` | UDP discovery defaults off; Quick Connect defaults on only for the optional Jellyfin API. Discovery additionally needs deliberate UDP 7359 exposure using existing `service.extraPorts`/`extraContainerPorts` and suitable LAN routing. |

Plugin authors must replace Extism built-in HTTP with host HTTP services; private/loopback HTTP/WebSocket targets need explicit manifest IP/CIDR permissions. Negative durations now fail startup; unknown options warn. Existing `/data`, `/music`, read-only library mounts and HTTP port 4533 remain unchanged. New API and lyric capabilities are client/application features; they do not require another container.

Reviewed upstream release sequence: [v0.62.0](https://github.com/navidrome/navidrome/releases/tag/v0.62.0), [v0.63.0](https://github.com/navidrome/navidrome/releases/tag/v0.63.0), [v0.63.1](https://github.com/navidrome/navidrome/releases/tag/v0.63.1), [v0.63.2](https://github.com/navidrome/navidrome/releases/tag/v0.63.2), [v0.64.0](https://github.com/navidrome/navidrome/releases/tag/v0.64.0), [v0.64.1](https://github.com/navidrome/navidrome/releases/tag/v0.64.1), [v0.64.2](https://github.com/navidrome/navidrome/releases/tag/v0.64.2).

Configuration/source review: [full comparison](https://github.com/navidrome/navidrome/compare/v0.61.2...v0.64.2). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.

### Chart changes

- Pin image/app metadata and image annotation consistently to 0.64.2; refresh schema defaults, chart install examples, repository table and generated catalog.
- Add a complete runtime configuration reference and commented opt-in values, including existing and newly introduced settings; preserve application-owned configuration.
- Support existing Secrets/ConfigMaps through optional envFrom without creating credentials.
- Add a configurable startup probe allowing up to 15 minutes for migrations before liveness restarts begin.
- Correct the scanner environment key; sharing remains unset so persisted settings are not overridden.

Validation: Helm lint, default rendering, optional configuration/Secret rendering, schema checks and generated-catalog tests. No production workload was modified or live database migration performed.
