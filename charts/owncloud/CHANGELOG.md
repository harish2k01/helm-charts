# Changelog

## 0.4.1

### Chart changes

Add a link to the web chart catalog near the top of the README. Application versions and workload configuration are unchanged.

## 0.4.0 — ownCloud 11.1.0

### Application changes and compatibility

Upgrade 10.16.7 → 11.1.0. Reviewed every intervening major-line release (11.0.0, 11.0.1 and 11.1.0), the full [core comparison](https://github.com/owncloud/core/compare/v10.16.7...v11.1.0), config samples and runtime/container wrappers. The [upstream changelog](https://github.com/owncloud/core/blob/v11.1.0/CHANGELOG.md) covers security fixes to federation, previews and service-handler validation, updated PHP/JavaScript dependencies and certificate bundles. Existing custom service handlers must satisfy stricter class/interface validation; obsolete direct PHP AJAX routes and legacy database/group/user APIs, db:convert-type and integrity:sign-app/core commands were removed. Microsoft Teams Bridge is archived. Check integrations, custom themes and apps against these removals.

- The official image moves from Ubuntu 22.04/PHP 7.4 to Ubuntu 24.04/PHP >=8.3. Actual reviewed images reported PHP 7.4.33 → 8.3.6 and PHPRedis 6.3.0 → 5.3.7; the extension version decreases. Doctrine DBAL moves from 2 to 3, and Symfony Mailer replaces Swiftmailer. Revalidate custom apps, external database drivers and SMTP authentication/TLS with the new runtime; no third-party app compatibility is implied.
- Group administrators are disabled by default: existing assignments are ignored until the administrator explicitly enables `allow_subadmins`. The wrapper exposes `OWNCLOUD_ALLOW_SUBADMINS`; it remains commented here to retain the secure upstream default.
- Local account lockout defaults to enabled, five failed attempts in 900 seconds and a 600-second lock. `occ user:unlock` releases a temporary lock. Core `account_lockout.enabled`, `.max_attempts`, `.duration` and `.attempt_window` are persisted system configuration, with no wrapper env aliases. Change them using `occ config:system:set` with the correct boolean/integer type only after assessing login/denial-of-service behavior; LDAP/external authentication is outside this local-account feature.
- App installation now verifies every package signature. G2 signing replaces G1, with G1 verification ending on 2027-01-01. Obtain compatible, correctly signed app releases before rollout; do not broadly disable integrity verification. Upgrade repairs regenerate user certificate bundles against updated system trust roots. Custom CAs and remote integrations need a separate verification.
- The connectivity-check URL is configurable and defaults to `https://detectportal.firefox.com/success.txt`; installations with restricted egress should review that behavior. Local cache use and upgrade cache invalidation changed. These need no new chart resources.

### Chart changes and configuration audit

Bump the chart to 0.4.0 for the major runtime transition and align application/image/schema metadata. Keep the existing `Recreate` rollout, `/mnt/data` persistence, port 8080, healthcheck and immutable datastore claim templates. Do not add active optional environment defaults that overwrite persisted configuration.

Audit all `OWNCLOUD_*` variables referenced by the target 24.04 overlay, including existing options absent from values. Add 79 safely commented wrapper settings with purpose/default information: Redis TLS context/CA/client certificates, strict login, email/display-name permissions, proxy/URL rewriting, upload POST limit, audit, antivirus, PDF, WOPI/WND, metrics and integration options. Sensitive or credential-bearing structured options are directed to Secret references through `secretEnv`/`extraEnv` rather than plain values. The existing generic env, envFrom, Secret and volume hooks already render these options, so no fixed app-specific schema keys are required. Build-time image version/package/architecture variables are not runtime chart settings.

`OWNCLOUD_SKELETON_DIRECTORY` is no longer consumed: the wrapper uses `/mnt/data/skeleton` when nonempty and otherwise the bundled skeleton. Preserve mounted/persisted files. The wrapper rewrites its own `overwrite.config.php` at startup; do not replace the entire persisted config directory with a read-only mount. Core settings without wrapper aliases should be managed using `occ` or a carefully scoped additional PHP config file through existing volume hooks.

Fix external Redis startup: when `redis.internal=false` and `redis.host` is external (including `tls://...` with a referenced password), skip the chart's internal plaintext/unauthenticated `redis-cli` init probe. Otherwise that probe loops forever before the TLS/auth-aware ownCloud client can start. The official wrapper retains its bounded TCP startup wait. Chart-managed Redis keeps its existing init probe. External certificate validity, authentication and server availability remain operator responsibilities.

Wire `redis.service.port` into the ownCloud client's `OWNCLOUD_REDIS_PORT`; previously only the init probe received it, so external TLS listeners on ports such as 6380 could still be contacted on 6379. Add a Secret-backed external TLS/custom-port rendering regression and document the separately configurable internal Redis server arguments/probes.

Sources: [server Dockerfile](https://github.com/owncloud-docker/server/blob/master/v24.04/Dockerfile.multiarch), [reviewed base source](https://github.com/owncloud-docker/base/tree/b2071642309604eaf42b64c6c96ffb9052ab0bb1/v24.04), [environment reference](https://github.com/owncloud-docker/base/blob/b2071642309604eaf42b64c6c96ffb9052ab0bb1/ENVIRONMENT.md), [core config sample](https://github.com/owncloud/core/blob/v11.1.0/config/config.sample.php). Three target image files (config template, Redis defaults and general defaults) were byte-for-byte matched to that reviewed base source; the image itself carries no attested source revision.

### Datastores, migration and rollback

Retain MariaDB 10.11 and Redis 8.10.2 exactly; this PR performs no independent datastore update. The official [11.1 Docker guide](https://doc.owncloud.com/server/11.1/admin_manual/installation/installing_with_docker.html) uses ownCloud 11.1.0 with MariaDB 10.11 and Redis 7. MariaDB matches that documented series. Redis 8.10.2 was already merged in this chart and is retained under repository policy: the guide does **not** establish official support for Redis 8. A passing synthetic test is compatibility evidence for the exercised paths, not an upstream support declaration. Do not downgrade an existing Redis volume to 7 in place.

The official [11.1 requirements](https://doc.owncloud.com/server/11.1/admin_manual/installation/system_requirements.html) support Docker deployment and list AMD64; the published image also has ARM64, but publication is not an official ARM support claim. Backup the database, complete `/mnt/data`, custom apps/configuration and Redis persistence consistently before upgrading. Inventory installed apps, disable incompatible third-party apps and confirm replacement releases support ownCloud 11/PHP 8.3. The container automatically runs `occ upgrade`; schedule maintenance and allow startup time for the actual database size. A Helm rollback does not reverse schema or persisted configuration changes. Downgrade is unsupported: restore the complete pre-upgrade backup into a recovery installation. See the [official upgrade procedure](https://doc.owncloud.com/server/11.1/admin_manual/maintenance/upgrading/upgrade.html).

### Validation

Disposable synthetic Kubernetes test on 2026-11-05: initialize the exact 10.16.7 image against MariaDB 10.11 and Redis 8.10.2, create a WebDAV file and authenticate through OCS, stop the old server, then run the exact 11.1.0 image's automatic migration against the same scratch data/database. Migration succeeded; status reported 11.1.0 with maintenance disabled and no pending DB upgrade. Authenticated OCS, retained file contents, new WebDAV PUT/GET and the official healthcheck passed. Target PHPRedis passed JSON cache, TTL, NX locking, counters, WATCH/MULTI transactions and SCAN against retained Redis 8.10.2. No datastore-version migration was performed. Test used a dedicated namespace, synthetic credentials, emptyDir volumes and bounded resources; its namespace was deleted afterward.

Image index digests: 10.16.7 `sha256:8d9bdad5d0e8511738849824e15b7ab6b03361a9ca04006d5f64862258f0f751`; 11.1.0 `sha256:fa19b7038631f98929ec1771f1fb43595a18fc2b5f2f2220a7b66237c5ed1966`. Helm lint/default and optional/external Redis renders, focused app tests and immutable-claim regression tests passed. Catalog regeneration/check is performed when integrating this branch with concurrent chart updates. Production backups/restores, large datasets, external database variants, SMTP delivery, TLS endpoints, LDAP and custom/marketplace apps were not exercised.

## 0.3.1

### Application changes

10.16.6 → 10.16.7 updates signature verification, PHP and JavaScript dependencies, and the CA bundle. No core runtime setting or database schema change was identified. Keep MariaDB 10.11 and Redis 8.10.2.

Source: [upstream changes](https://github.com/owncloud/core/compare/v10.16.6...v10.16.7).

### Chart changes

Align the image, chart metadata, values schema and catalog. Existing deployment options, persistence and datastore images are unchanged.

## 0.2.1

### Application changes

None. Application, database and init-image versions are unchanged.

### Chart changes

Use stable identity labels in StatefulSet claim templates instead of chart/app-version labels. Add the documented persistence.claimTemplateLabels maps (under each affected component's persistence settings) for deterministic preservation of existing immutable template labels. Existing installations must pin their current labels before the first upgrade; simply removing historical labels is also an immutable change. No StatefulSet/PVC replacement or database migration is performed. Regression tests compare complete claim templates across simulated chart/app version upgrades and verify legacy-label overrides.

## 0.2.0 — Redis 8.10.2

Merge the ownCloud app update [PR #75](https://github.com/harish2k01/helm-charts/pull/75) before this dependency update [PR #90](https://github.com/harish2k01/helm-charts/pull/90). This branch includes the app update so its chart metadata stays at ownCloud 10.16.6 and uses a distinct chart version. The chart's default Redis image moves from floating 6 to pinned 8.10.2, the version resolved by the proposed floating 8 tag at review time.

### Chart changes and migration preparation

- ownCloud 10.16 documents Redis >=6; Redis 8 preserves the Redis protocol, database 0 and port 6379 used by this chart. The existing --databases 1 remains valid. The chart does not use cluster, streams, functions, Redis Stack data structures or custom modules by default. No mandatory ownCloud environment rename was found.
- Back up the Redis PVC as well as the ownCloud data and MariaDB database before upgrading. Redis 7 introduced multipart AOF storage; newer RDB versions and AOF manifests must not be opened with the old image as a rollback strategy. Restore the pre-upgrade snapshot into a separate recovery volume. Do not delete or flush live Redis to simplify this upgrade: it holds file locks and cache state.
- A new configurable startup probe delays liveness during persisted-data loading. It defaults to redis-cli ping, every ten seconds, with 60 failures allowed; increase this window for large volumes. Readiness still waits for Redis to answer.
- The Redis 8 official image now loads bundled modules automatically on supported amd64/arm64 builds and uses setpriv for privilege dropping. Review memory consumption with existing resource limits; no speculative memory limit is imposed. The entrypoint's permission repair skips unexpected files and supports SKIP_FIX_PERMS / SKIP_DROP_PRIVS via redis.extraEnv. Prefer correct volume ownership; avoid disabling privilege dropping unless your security context already runs the process as the intended user.
- As in the old official image, Docker builds disable protected-mode by default. The Redis Service stays ClusterIP, unauthenticated and internal. Existing networkPolicy settings can restrict access. If adding authentication or ACLs, configure ownCloud credentials and authenticated probes together; this change does not silently enable incompatible authentication.
- Redis 8 changes the upstream license options to AGPLv3 / RSALv2 / SSPLv1. The Helm chart's MIT license describes chart source, not Redis.

### App changes and intervening release review

Reviewed the 6.2, 7.0, 7.2, 7.4, 8.0, 8.2, 8.4, 8.6, 8.8 and 8.10 release-note lines, redis.conf changes and the exact 8.10.2 container entrypoint/Dockerfile. The old 6 tag floats, so the exact patch running in a deployment must be recorded from its image digest before rollout.

Redis 7 adds multipart AOF, ACL selectors, functions, safer Lua behavior and command/response corrections. Redis 7.2 changes several protocol edge cases and client eviction/replication behavior; 7.4 adds hash-field expiry and Lua-script cache eviction. Redis 8 adds integrated search/JSON/time-series/probabilistic modules, I/O improvements and additional ACL categories. 8.2–8.10 add stream, vector, TLS, eviction, compaction/hash and observability features; these do not require new Kubernetes resources for ownCloud's existing cache/locking use. New settings remain accessible through redis.args and mounted configs, including maxmemory policies, slowlog entry limits, I/O threads, and TLS settings. Cluster-bus protection added in 8.10.2 applies only to cluster mode, which this chart does not enable. The pinned patch includes security fixes for ACL, malformed persisted module data and TLS paths. Operators using custom Redis scripts/modules/ACLs or overridden args must also reconcile those against the release notes; the default chart cannot validate custom workloads.

Sources: [ownCloud 10.16 requirements](https://doc.owncloud.com/server/10.16/admin_manual/installation/system_requirements.html), [Redis 6.2 notes](https://github.com/redis/redis/blob/6.2/00-RELEASENOTES), [7.0](https://github.com/redis/redis/blob/7.0/00-RELEASENOTES), [7.2](https://github.com/redis/redis/blob/7.2/00-RELEASENOTES), [7.4](https://github.com/redis/redis/blob/7.4/00-RELEASENOTES), [8.0](https://github.com/redis/redis/blob/8.0/00-RELEASENOTES), [8.2](https://github.com/redis/redis/blob/8.2/00-RELEASENOTES), [8.4](https://github.com/redis/redis/blob/8.4/00-RELEASENOTES), [8.6](https://github.com/redis/redis/blob/8.6/00-RELEASENOTES), [8.8](https://github.com/redis/redis/blob/8.8/00-RELEASENOTES), [8.10.2](https://github.com/redis/redis/blob/8.10.2/00-RELEASENOTES), [default config](https://github.com/redis/redis/blob/8.10.2/redis.conf), [8.10.2 entrypoint](https://github.com/redis/docker-library-redis/blob/v8.10.2/debian/docker-entrypoint.sh), [Dockerfile](https://github.com/redis/docker-library-redis/blob/v8.10.2/debian/Dockerfile), [official image tags](https://github.com/docker-library/official-images/blob/master/library/redis).

Validation covers Helm lint, default rendering, startup-probe overrides, external Redis and disabled Redis branches, plus catalog checks. A dedicated GitHub Actions job uses the actual ownCloud 10.16.6 PHPRedis extension to exercise JSON cache, locking, counters, TTL, WATCH/MULTI transactions and SCAN before and after Redis 6.2.21 to 8.10.2, with both RDB and AOF persistence and a second Redis 8 restart. Review that job before merging. It does not run a complete ownCloud/MariaDB instance or migrate production data; test a restored copy before production rollout.

## 0.1.1 — 10.16.6

Upgrade from 10.16.2. Reviewed the [10.16.3–10.16.6 changelog](https://github.com/owncloud/core/blob/v10.16.6/CHANGELOG.md) and the [configuration/source comparison](https://github.com/owncloud/core/compare/v10.16.2...v10.16.6). These releases fix administrator configuration access, dependency vulnerabilities, chunked WebDAV write-hook veto handling, Oracle performance, federation/preview validation, and the 10.16.5 PROPFIND regression.

No new core configuration keys were introduced in config.sample.php across this range. The image continues to use port 8080 and /mnt/data; existing database, Redis, trusted-domain, Secret and extra-volume settings remain applicable. Redis is intentionally kept at the existing version in this app upgrade.

10.16.5 tightens service-handler configuration and preview-format validation: review custom service handlers and preview integrations before rollout. Back up the database and /mnt/data together before the image's automatic upgrade; database migrations are not undone by Helm rollback. This chart stays on ownCloud 10.16 and does not adopt the separate ownCloud 11 PHP/runtime changes.

Validation: helm lint and default/Ingress/HTTPRoute rendering; catalog regeneration and catalog tests. This does not constitute a live data migration test.

### Runtime and database compatibility audit

The exact application target is ownCloud10.16.6. The [10.16 Docker guide](https://doc.owncloud.com/server/10.16/admin_manual/installation/docker/index.html) explicitly uses MariaDB10.11, matching the retained bundled database. The ownCloud/server10.16.6 image manifest inspected for linux/amd64 is `sha256:296c7a40c475a1bf93eff1e41cb1fc7f184c61ae86d07b25516697c144cf4112`, built on the22.04 image family. The [base environment reference](https://github.com/owncloud-docker/base/blob/1f1bfad501e97c3366c03c7971f0ce69dacd8128/ENVIRONMENT.md), [22.04 entrypoint overlay](https://github.com/owncloud-docker/base/tree/1f1bfad501e97c3366c03c7971f0ce69dacd8128/v22.04/overlay) and server wrapper were inspected for supported options. The image does not publish a source revision label, so this source-to-image mapping is based on its22.04 family rather than an attested source commit.

values.yaml now inventories supported22.04 wrapper settings for PHP/Apache limits, proxy/overwrite behavior, DB options, Redis/session/cache controls, SMTP, object storage, apps/cron/maintenance, sharing/security, previews, logging, user/group settings and storage quotas. Entries absent from the22.04 overlay are excluded; secrets are listed separately for Secret mapping. None of these optional entries are active defaults. Custom core config.php settings not wrapped by the image can use existing extraVolumes/extraVolumeMounts. Core and wrapper defaults must not be inferred from newer ownCloud11/PHP8 images.
