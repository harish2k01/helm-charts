# Upgrade notes

## 0.1.1 — 10.16.6

Upgrade from 10.16.2. Reviewed the [10.16.3–10.16.6 changelog](https://github.com/owncloud/core/blob/v10.16.6/CHANGELOG.md) and the [configuration/source comparison](https://github.com/owncloud/core/compare/v10.16.2...v10.16.6). These releases fix administrator configuration access, dependency vulnerabilities, chunked WebDAV write-hook veto handling, Oracle performance, federation/preview validation, and the 10.16.5 PROPFIND regression.

No new core configuration keys were introduced in config.sample.php across this range. The image continues to use port 8080 and /mnt/data; existing database, Redis, trusted-domain, Secret and extra-volume settings remain applicable. Redis is intentionally kept at the existing version in this app upgrade.

10.16.5 tightens service-handler configuration and preview-format validation: review custom service handlers and preview integrations before rollout. Back up the database and /mnt/data together before the image's automatic upgrade; database migrations are not undone by Helm rollback. This chart stays on ownCloud 10.16 and does not adopt the separate ownCloud 11 PHP/runtime changes.

Validation: helm lint and default/Ingress/HTTPRoute rendering; catalog regeneration and catalog tests. This does not constitute a live data migration test.

### Runtime and database compatibility audit

The exact application target is ownCloud10.16.6. The [10.16 Docker guide](https://doc.owncloud.com/server/10.16/admin_manual/installation/docker/index.html) explicitly uses MariaDB10.11, matching the retained bundled database. The ownCloud/server10.16.6 image manifest inspected for linux/amd64 is `sha256:296c7a40c475a1bf93eff1e41cb1fc7f184c61ae86d07b25516697c144cf4112`, built on the22.04 image family. The [base environment reference](https://github.com/owncloud-docker/base/blob/1f1bfad501e97c3366c03c7971f0ce69dacd8128/ENVIRONMENT.md), [22.04 entrypoint overlay](https://github.com/owncloud-docker/base/tree/1f1bfad501e97c3366c03c7971f0ce69dacd8128/v22.04/overlay) and server wrapper were inspected for supported options. The image does not publish a source revision label, so this source-to-image mapping is based on its22.04 family rather than an attested source commit.

values.yaml now inventories supported22.04 wrapper settings for PHP/Apache limits, proxy/overwrite behavior, DB options, Redis/session/cache controls, SMTP, object storage, apps/cron/maintenance, sharing/security, previews, logging, user/group settings and storage quotas. Entries absent from the22.04 overlay are excluded; secrets are listed separately for Secret mapping. None of these optional entries are active defaults. Custom core config.php settings not wrapped by the image can use existing extraVolumes/extraVolumeMounts. Core and wrapper defaults must not be inferred from newer ownCloud11/PHP8 images.
