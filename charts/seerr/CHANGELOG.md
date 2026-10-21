# Changelog

## 0.2.0 - 2026-10-21

### Application changes

3.3 introduces optional `DB_POOL_SIZE` (upstream default `10`) for external PostgreSQL; set it under `env` and inject database credentials from an existing Secret with `envFrom`. Default SQLite storage remains `/app/config`. IPv6 literal `HOST` values are now accepted. Existing probes at `/api/v1/settings/public` remain valid. Back up `/app/config` and any external database before automatic migrations.

**API consumers:** 3.5 makes `GET /settings/plex/library` and `GET /settings/jellyfin/library` read-only; `sync`/`enable` query parameters no longer work. Use `POST /settings/{plex|jellyfin}/library/sync` and `PUT /settings/{plex|jellyfin}/library/{libraryId}`. Update direct integrations before upgrading.

**Webhook consumers:** 3.3 changes `discordID` (string) to `discordIDs` (array of strings). Update custom consumers accordingly. Discord thread IDs, ntfy tags, Gotify poster embeds, user sync and override rules are configured within Seerr; no additional Service ports or enabled-by-default integration is needed. 3.4.1 fixes an ImageProxy path-traversal/RCE vulnerability; 3.5 also fixes migrated Overseerr status handling. Do not enable the upstream demo environment option in a production deployment.

Reviewed upstream release sequence: [v3.3.0](https://github.com/seerr-team/seerr/releases/tag/v3.3.0), [v3.4.0](https://github.com/seerr-team/seerr/releases/tag/v3.4.0), [v3.4.1](https://github.com/seerr-team/seerr/releases/tag/v3.4.1), [v3.5.0](https://github.com/seerr-team/seerr/releases/tag/v3.5.0).

Configuration/source review: [full comparison](https://github.com/seerr-team/seerr/compare/v3.2.0...v3.5.0). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.

### Chart changes

- Pin image/app metadata and image annotation consistently to v3.5.0; refresh schema defaults, chart install examples, repository table and generated catalog.
- Add a complete runtime configuration reference and commented opt-in values, including existing and newly introduced settings; preserve application-owned configuration.
- Support existing Secrets/ConfigMaps through optional envFrom without creating credentials.

Validation: Helm lint, default rendering, optional configuration/Secret rendering, schema checks and generated-catalog tests. No production workload was modified or live database migration performed.
