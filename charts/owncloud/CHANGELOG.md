# Upgrade notes

## 0.2.0 — Redis 8.10.2

Merge the ownCloud app update [PR #75](https://github.com/harish2k01/helm-charts/pull/75) before this dependency update [PR #90](https://github.com/harish2k01/helm-charts/pull/90). This branch includes the app update so its chart metadata stays at ownCloud 10.16.6 and uses a distinct chart version. The chart's default Redis image moves from floating 6 to pinned 8.10.2, the version resolved by the proposed floating 8 tag at review time.

### Compatibility and preparation

- ownCloud 10.16 documents Redis >=6; Redis 8 preserves the Redis protocol, database 0 and port 6379 used by this chart. The existing --databases 1 remains valid. The chart does not use cluster, streams, functions, Redis Stack data structures or custom modules by default. No mandatory ownCloud environment rename was found.
- Back up the Redis PVC as well as the ownCloud data and MariaDB database before upgrading. Redis 7 introduced multipart AOF storage; newer RDB versions and AOF manifests must not be opened with the old image as a rollback strategy. Restore the pre-upgrade snapshot into a separate recovery volume. Do not delete or flush live Redis to simplify this upgrade: it holds file locks and cache state.
- A new configurable startup probe delays liveness during persisted-data loading. It defaults to redis-cli ping, every ten seconds, with 60 failures allowed; increase this window for large volumes. Readiness still waits for Redis to answer.
- The Redis 8 official image now loads bundled modules automatically on supported amd64/arm64 builds and uses setpriv for privilege dropping. Review memory consumption with existing resource limits; no speculative memory limit is imposed. The entrypoint's permission repair skips unexpected files and supports SKIP_FIX_PERMS / SKIP_DROP_PRIVS via redis.extraEnv. Prefer correct volume ownership; avoid disabling privilege dropping unless your security context already runs the process as the intended user.
- As in the old official image, Docker builds disable protected-mode by default. The Redis Service stays ClusterIP, unauthenticated and internal. Existing networkPolicy settings can restrict access. If adding authentication or ACLs, configure ownCloud credentials and authenticated probes together; this change does not silently enable incompatible authentication.
- Redis 8 changes the upstream license options to AGPLv3 / RSALv2 / SSPLv1. The Helm chart's MIT license describes chart source, not Redis.

### Intervening release review

Reviewed the 6.2, 7.0, 7.2, 7.4, 8.0, 8.2, 8.4, 8.6, 8.8 and 8.10 release-note lines, redis.conf changes and the exact 8.10.2 container entrypoint/Dockerfile. The old 6 tag floats, so the exact patch running in a deployment must be recorded from its image digest before rollout.

Redis 7 adds multipart AOF, ACL selectors, functions, safer Lua behavior and command/response corrections. Redis 7.2 changes several protocol edge cases and client eviction/replication behavior; 7.4 adds hash-field expiry and Lua-script cache eviction. Redis 8 adds integrated search/JSON/time-series/probabilistic modules, I/O improvements and additional ACL categories. 8.2–8.10 add stream, vector, TLS, eviction, compaction/hash and observability features; these do not require new Kubernetes resources for ownCloud's existing cache/locking use. New settings remain accessible through redis.args and mounted configs, including maxmemory policies, slowlog entry limits, I/O threads, and TLS settings. Cluster-bus protection added in 8.10.2 applies only to cluster mode, which this chart does not enable. The pinned patch includes security fixes for ACL, malformed persisted module data and TLS paths. Operators using custom Redis scripts/modules/ACLs or overridden args must also reconcile those against the release notes; the default chart cannot validate custom workloads.

Sources: [ownCloud 10.16 requirements](https://doc.owncloud.com/server/10.16/admin_manual/installation/system_requirements.html), [Redis 6.2 notes](https://github.com/redis/redis/blob/6.2/00-RELEASENOTES), [7.0](https://github.com/redis/redis/blob/7.0/00-RELEASENOTES), [7.2](https://github.com/redis/redis/blob/7.2/00-RELEASENOTES), [7.4](https://github.com/redis/redis/blob/7.4/00-RELEASENOTES), [8.0](https://github.com/redis/redis/blob/8.0/00-RELEASENOTES), [8.2](https://github.com/redis/redis/blob/8.2/00-RELEASENOTES), [8.4](https://github.com/redis/redis/blob/8.4/00-RELEASENOTES), [8.6](https://github.com/redis/redis/blob/8.6/00-RELEASENOTES), [8.8](https://github.com/redis/redis/blob/8.8/00-RELEASENOTES), [8.10.2](https://github.com/redis/redis/blob/8.10.2/00-RELEASENOTES), [default config](https://github.com/redis/redis/blob/8.10.2/redis.conf), [8.10.2 entrypoint](https://github.com/redis/docker-library-redis/blob/v8.10.2/debian/docker-entrypoint.sh), [Dockerfile](https://github.com/redis/docker-library-redis/blob/v8.10.2/debian/Dockerfile), [official image tags](https://github.com/docker-library/official-images/blob/master/library/redis).

Validation covers Helm lint, default rendering, startup-probe overrides, external Redis and disabled Redis branches, plus catalog checks. A real ownCloud/Redis data migration has not been exercised by these static checks. Test a restored copy before production upgrade.

## 0.1.1 — 10.16.6

Upgrade from 10.16.2. Reviewed the [10.16.3–10.16.6 changelog](https://github.com/owncloud/core/blob/v10.16.6/CHANGELOG.md) and the [configuration/source comparison](https://github.com/owncloud/core/compare/v10.16.2...v10.16.6). These releases fix administrator configuration access, dependency vulnerabilities, chunked WebDAV write-hook veto handling, Oracle performance, federation/preview validation, and the 10.16.5 PROPFIND regression.

No new core configuration keys were introduced in config.sample.php across this range. The image continues to use port 8080 and /mnt/data; existing database, Redis, trusted-domain, Secret and extra-volume settings remain applicable. Redis is intentionally kept at the existing version in this app upgrade.

10.16.5 tightens service-handler configuration and preview-format validation: review custom service handlers and preview integrations before rollout. Back up the database and /mnt/data together before the image's automatic upgrade; database migrations are not undone by Helm rollback. This chart stays on ownCloud 10.16 and does not adopt the separate ownCloud 11 PHP/runtime changes.

Validation: helm lint and default/Ingress/HTTPRoute rendering; catalog regeneration and catalog tests. This does not constitute a live data migration test.
