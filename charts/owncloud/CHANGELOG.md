# Upgrade notes

## 0.1.1 — 10.16.6

Upgrade from 10.16.2. Reviewed the [10.16.3–10.16.6 changelog](https://github.com/owncloud/core/blob/v10.16.6/CHANGELOG.md) and the [configuration/source comparison](https://github.com/owncloud/core/compare/v10.16.2...v10.16.6). These releases fix administrator configuration access, dependency vulnerabilities, chunked WebDAV write-hook veto handling, Oracle performance, federation/preview validation, and the 10.16.5 PROPFIND regression.

No new core configuration keys were introduced in config.sample.php across this range. The image continues to use port 8080 and /mnt/data; existing database, Redis, trusted-domain, Secret and extra-volume settings remain applicable. Redis is intentionally kept at the existing version in this app upgrade.

10.16.5 tightens service-handler configuration and preview-format validation: review custom service handlers and preview integrations before rollout. Back up the database and /mnt/data together before the image's automatic upgrade; database migrations are not undone by Helm rollback. This chart stays on ownCloud 10.16 and does not adopt the separate ownCloud 11 PHP/runtime changes.

Validation: helm lint and default/Ingress/HTTPRoute rendering; catalog regeneration and catalog tests. This does not constitute a live data migration test.
