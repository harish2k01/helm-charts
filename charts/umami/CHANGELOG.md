# Upgrade notes

## 0.2.0 — 3.4.0

Upgrade from 3.1.0. Reviewed every release 3.2.0, 3.3.0, 3.3.1 and 3.4.0 plus the [source/configuration comparison](https://github.com/umami-software/umami/compare/v3.1.0...v3.4.0) and exact target source tree.

3.2 adds heatmaps and replay improvements; 3.3 adds TOTP 2FA, session stitching, richer properties and board cloning; 3.3.1 repairs lowercase-username migrations and enforces missing-key handling; 3.4 adds annotations, API keys, read-only MCP and compatible analytics API routes. Migration20–26 adds heatmaps, linked sessions, 2FA, session-data changes, lowercase usernames, annotations and API keys. The Docker start script runs check-db/migrate before exec node server.js. Back up PostgreSQL before rollout, preserve APP_SECRET and any existing 2FA key, and restore matched database backups for downgrade.

Added umami.extraEnv for individual Secret-backed runtime variables (including TWO_FACTOR_ENCRYPTION_KEY) and a startupProbe that allows up to20 minutes for migrations before liveness checks begin. TWO_FACTOR_ENCRYPTION_KEY must be a stable64-hex-character key (openssl rand -hex32); do not generate a new key on each deployment. MCP_ENABLED=1 explicitly enables /mcp and requires an API key; it is not enabled by default. Optional runtime configuration examples are commented in values.yaml so existing app behavior and persisted configuration are preserved.

The [target README](https://github.com/umami-software/umami/blob/v3.4.0/README.md) requires PostgreSQL12.14+, so existing bundled PostgreSQL17 is retained. PostgreSQL port5432, app port3000 and existing volume/database/Secret contracts are unchanged. Build-only BASE_PATH, API_URL and static tracker customization need a custom image where upstream bakes them into the frontend; pod env does not rebuild published assets.

Validation: Helm lint, default and MCP/2FA Secret/startupProbe/Ingress/HTTPRoute rendering, catalog regeneration/check/tests. Application migration and login/2FA flows were not exercised against user data.
