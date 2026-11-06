# Changelog

## 0.3.4

### Application changes

Ghost 6.74.0-alpine → 6.75.0-alpine adds the paid-subscription-changed automation trigger and video thumbnail selection from frames, and fixes upcoming YouTube livestream embeds in emails. The full source comparison also includes app-frame navigation/log-redaction hardening, SVG/PNG/WebP app-icon validation (JPEG/GIF no longer accepted), Portal/Admin automation refinements and GA lifecycle automation triggers. Private Labs flags and editor features are managed by the application, not enabled through chart defaults.

The complete runtime config, database schema and migration directories are identical between these two tags; no database migration or new environment default is introduced by this release. The official Alpine image changes only the Ghost version; Node 22.23.4, Ghost CLI 1.34.1, entrypoint, port 2368 and content path remain unchanged. Keep mysql:8; this app update supplies no evidence for a datastore version bump. Normal database/content backups remain recommended; custom apps/themes still need their own compatibility review.

Sources: [release notes](https://github.com/TryGhost/Ghost/releases/tag/v6.75.0), [all application changes](https://github.com/TryGhost/Ghost/compare/v6.74.0...v6.75.0), [runtime defaults](https://github.com/TryGhost/Ghost/blob/v6.75.0/ghost/core/shared/config/defaults.json), [production defaults](https://github.com/TryGhost/Ghost/blob/v6.75.0/ghost/core/shared/config/env/config.production.json).

### Chart changes

Synchronize app image metadata/schema/docs and catalog. Add commented examples for previously supported shutdown, HTTP compression/preload, Admin/device/webhook protections, image resizing/srcsets, theme archive expansion limits, file-log rotation, bulk email sizing, analytics/email branding, listing limits, exact trusted app origins and tips/donations options. Document the supported mounted-secret _FILE mechanism and its conflict with simultaneously supplied inline/chart-owned credentials. All remain opt-in overrides through existing env/Secret/volume hooks; persisted app configuration and optional integrations are not activated. Trusted app origins bypass ownership checks and must be selected carefully; development-only aliases and settings overridden by Ghost's mandatory overrides are not advertised as production options. This chart includes the independently reviewed Caddy 2.11.8 proxy changes from 0.3.3; merge PR #136 before PR #139.

Validation: Helm lint/default and optional routing/Secret renders and repository regression tests. Runtime Caddy proxy checks are recorded in 0.3.3. Ghost admin/editor, email delivery, theme/custom-app behavior and production data were not exercised.


## 0.3.3

### Application changes

The optional ActivityPub proxy upgrades Caddy 2.11.7-alpine → 2.11.8-alpine. This maintenance/security release fixes reverse-proxy informational-response header filtering (GHSA-8qx7-j2v2-x6q5), HTTP/2 upload timeouts, escaped URI handling and connection leaks. It rejects invalid/dots-only Host values. Stricter TLS/Caddyfile validation and PHP/file-server fixes do not require changes to this chart's generated reverse-proxy configuration. New log/TLS matcher directives are Caddyfile features, not Ghost environment settings; no new runtime environment defaults are required.

Sources: [release and full change list](https://github.com/caddyserver/caddy/releases/tag/v2.11.8), [official image change](https://github.com/caddyserver/caddy-docker/commit/8338ec8d). The official image moves Alpine 3.23 → 3.24 and changes the binary file capability from effective+permitted to permitted-only. Ghost 6.74.0-alpine and MySQL 8 remain unchanged.

### Chart changes

Update proxy image metadata/schema/docs and remove the proxy's added NET_BIND_SERVICE capability: port 8080 now runs with all capabilities dropped, UID/GID 1000, no privilege escalation and a read-only root filesystem. Retain original Host+port forwarding, trailing-slash normalization, disabled admin/automatic TLS and writable ephemeral /data and /config. ActivityPub remains opt-in. Older Caddy image overrides may require their former capability setup; use the previous chart when reverting the proxy image.

Validation: disposable Kubernetes test with the exact published image and chart security context passed Caddy validation/startup, Host+port, encoded percent paths, query strings, slash normalization and POST-body forwarding, and invalid Host rejection. Synthetic HTTP upstream only; hosted Social Web/TLS federation was not exercised. Existing Ghost content/database persistence is unaffected.

## 0.3.2

### Application changes

6.71.0-alpine → 6.74.0-alpine introduces automatic checkout, automation, metafield, app-install and job-outbox migrations. Back up the MySQL database and content together; an image downgrade alone does not undo migrations. New runtime options include upgrade adapter, listing limits and spam blocks. Keep the documented MySQL 8 series and existing content/port configuration.

Source: [upstream changes](https://github.com/TryGhost/Ghost/compare/v6.71.0...v6.74.0).

### Chart changes

Align the image, chart metadata, values schema and catalog. Existing deployment options, persistence and datastore images are unchanged.

## 0.3.1

### Application changes

Caddy 2.10.2-alpine → 2.11.7-alpine hardens timeouts and header handling and fixes HTTP/2/SSE regressions. Caddy 2.11 automatically rewrites Host for HTTPS upstreams; explicitly pass the original public Host and port for the ActivityPub proxy. Ghost and MySQL are unchanged.

Source: [upstream changes](https://github.com/caddyserver/caddy/releases/tag/v2.11.1).

### Chart changes

Preserve the ActivityPub proxy's documented public Host and request-path behavior when upgrading Caddy.

## 0.2.5

### Application changes

None. Application, database and init-image versions are unchanged.

### Chart changes

Use stable identity labels in StatefulSet claim templates instead of chart/app-version labels. Add the documented persistence.claimTemplateLabels maps (under each affected component's persistence settings) for deterministic preservation of existing immutable template labels. Existing installations must pin their current labels before the first upgrade; simply removing historical labels is also an immutable change. No StatefulSet/PVC replacement or database migration is performed. Regression tests compare complete claim templates across simulated chart/app version upgrades and verify legacy-label overrides.

## 0.2.4 — 6.71.0-alpine

Upgrade from 6.39.0-alpine. Reviewed every published release from6.40.0 through6.71.0 (including patch releases and6.66.0's failed npm publication), the [source comparison](https://github.com/TryGhost/Ghost/compare/v6.39.0...v6.71.0), and exact old/new defaults.json and overrides.json. The official image retains port2368 and /var/lib/ghost/content.

Application changes include gift subscriptions, threaded/pinned comments, Admin toolbar, IndexNow, llms.txt/Markdown responses, configurable Admin session lifetime, automations/email sequences, React Admin migration, export improvements and security/dependency fixes. These are upstream application/theme features; they do not require new Services or enabling chart-side feature flags.

Configuration changes are accessible through the existing generic env, extraEnv, secretEnv, extraVolumes and extraVolumeMounts hooks. New deployment-relevant keys include admin__sessionMaxAgeMs, klipy__apiKey/contentFilter (Tenor is removed), adapters__jobs, adapters__redirects, adapters__route-settings, storage__imports, externalRequest settings, remoteFlags, disableMigrationBackups and custom adapter paths. The target defaults also change asset content hashing and client-error logging, add signup/checkout spam controls, import/member limits, llms cache policy, request-integrity verification, query-parameter filtering and machine-payment adapter settings. These upstream defaults are deliberately inherited rather than hard-coded into user values. Removed lazyRouting and emailAnalytics.openedJobLagWarningMinutes overrides should be removed from installation values.

Custom adapter packages must satisfy the new boot-time validation contract. Docker _FILE secret support is available in6.58; existing Kubernetes secretKeyRef injection remains supported. For mounted secret files use extraEnv and extraVolumes. Keep secrets such as Klipy/payment keys out of plain env. Machine payment integrations require their own upstream setup and are not provisioned by this chart.

Ghost6 production uses MySQL8; the existing mysql:8 image family is retained. The [6.59 release](https://github.com/TryGhost/Ghost/releases/tag/v6.59.0) fixes migrations on MySQL older than8.0.28. Back up the database and content together before automatic startup migrations; do not rely on Helm rollback for database downgrade. Node24 support added in6.63 is handled inside the published image. Social Web proxy settings remain opt-in.

Validation: Helm lint, default and session/Klipy-Secret/Ingress/HTTPRoute rendering plus catalog regeneration/check/tests. No production database migrations, theme compatibility or external integration calls were executed.
