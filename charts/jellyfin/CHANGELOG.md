# Changelog

## 0.2.0 - 2026-10-21

### Application changes

10.11.9–10.11.11 include security fixes, normalized-username database migrations/user-manager locking fixes, stale userdata-cache fixes, and AV1 AMF/QSV/HDR10 encoder corrections. No new required container environment variable, config path, Service port or hardware device mount was introduced. Existing `/config`, published URL, media mounts and GPU devices remain supported. Preserve the complete `/config` PVC backup before upgrade; restore the backup together with the previous image if rolling back a migrated database. The startup probe allows 15 minutes for migration before liveness checks begin. Hardware acceleration/tonemapping features are selected in Jellyfin and still require the correct device mount, permissions and compatible drivers; the chart does not enable hardware settings automatically.

Reviewed upstream release sequence: [v10.11.9](https://github.com/jellyfin/jellyfin/releases/tag/v10.11.9), [v10.11.10](https://github.com/jellyfin/jellyfin/releases/tag/v10.11.10), [v10.11.11](https://github.com/jellyfin/jellyfin/releases/tag/v10.11.11).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-jellyfin/).

Configuration/source review: [full comparison](https://github.com/jellyfin/jellyfin/compare/v10.11.8...v10.11.11). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.

### Chart changes

- Pin image/app metadata and image annotation consistently to 10.11.11; refresh schema defaults, chart install examples, repository table and generated catalog.
- Add a complete runtime configuration reference and commented opt-in values, including existing and newly introduced settings; preserve application-owned configuration.
- Support existing Secrets/ConfigMaps through optional envFrom without creating credentials.
- Add a configurable startup probe allowing up to 15 minutes for migrations before liveness restarts begin.

Validation: Helm lint, default rendering, optional configuration/Secret rendering, schema checks and generated-catalog tests. No production workload was modified or live database migration performed.
