# Changelog

## 0.2.0 - 2026-10-21

### Application changes

1.6 adds subtitle-table/database migrations and WAL handling, removes custom scoring sections and the obsolete Podnapisi provider, migrates a single Gemini key to the new multi-key list, and adds Jellyfin library refresh, Whisper fallback, language equivalence, subtitle quality checks and provider integrations. Configure these through the app UI or its persisted configuration; no extra Kubernetes Service or port is required. Back up the whole `/config` PVC before upgrade and review custom score workflows because their settings are removed upstream.

The new `BAZARR_CONFIG_BASE_FILE_PATH` environment variable selects the directory containing `config.yaml`/`config.ini` (not a file). It can be set via `env`; leave it unset to retain `/config/config`, or mount an alternative writable persistent directory with `extraVolumes`/`extraVolumeMounts`. The startup probe gives migrations up to 15 minutes. Provider API keys and postprocessing commands stay application-owned. Existing writable media mounts must remain available for subtitle changes.

Reviewed upstream release sequence: [v1.6.0](https://github.com/morpheus65535/bazarr/releases/tag/v1.6.0), [v1.6.1](https://github.com/morpheus65535/bazarr/releases/tag/v1.6.1), [v1.6.2](https://github.com/morpheus65535/bazarr/releases/tag/v1.6.2).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-bazarr/).

Configuration/source review: [full comparison](https://github.com/morpheus65535/bazarr/compare/v1.5.6...v1.6.2). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.

### Chart changes

- Pin image/app metadata and image annotation consistently to 1.6.2; refresh schema defaults, chart install examples, repository table and generated catalog.
- Add a complete runtime configuration reference and commented opt-in values, including existing and newly introduced settings; preserve application-owned configuration.
- Support existing Secrets/ConfigMaps through optional envFrom without creating credentials.
- Add a configurable startup probe allowing up to 15 minutes for migrations before liveness restarts begin.

Validation: Helm lint, default rendering, optional configuration/Secret rendering, schema checks and generated-catalog tests. No production workload was modified or live database migration performed.
