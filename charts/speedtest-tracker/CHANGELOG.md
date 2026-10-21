# Upgrade notes

## 0.2.1

### Application changes

None. Application, database and init-image versions are unchanged.

### Chart changes

Use stable identity labels in StatefulSet claim templates instead of chart/app-version labels. Add the documented persistence.claimTemplateLabels maps (under each affected component's persistence settings) for deterministic preservation of existing immutable template labels. Existing installations must pin their current labels before the first upgrade; simply removing historical labels is also an immutable change. No StatefulSet/PVC replacement or database migration is performed. Regression tests compare complete claim templates across simulated chart/app version upgrades and verify legacy-label overrides.

## 0.2.0 — 1.15.0

Upgrade from 1.14.0. Reviewed all releases 1.14.1 through 1.14.8 and 1.15.0, the [source/configuration comparison](https://github.com/alexjustesen/speedtest-tracker/compare/v1.14.0...v1.15.0), and the [LinuxServer image configuration](https://docs.linuxserver.io/images/docker-speedtest-tracker/).

1.14.3 removes the UniFi integration, Librespeed references, and Laravel Telescope debugging configuration. Remove obsolete UNIFI_API_BASE_URL, UNIFI_API_TOKEN and TELESCOPE_* overrides from user values; these are not chart defaults. Outbound requests now use Laravel's 30-second timeout. 1.14.4 adds reorderable result columns; 1.14.7 changes API start_at/end_at date filtering; 1.15.0 adds latest-result filtering and outbound URL protocol validation. The remaining patches repair notifications, fonts, negative CLI readings and dependencies/security.

No required new runtime environment variables, mount paths or exposed ports were introduced. Existing speedtest.env and Secret/database hooks remain the configuration surface. The upstream development Compose PostgreSQL downgrade to 17 is not a production requirement and is not imposed on existing database volumes. Preserve APP_KEY and back up /config and the active database before upgrade; the image applies migrations at startup.

Validation: Helm lint, default and Ingress/HTTPRoute rendering, generated catalog consistency and catalog tests. Actual speed measurements and database migrations were not run against user data.

### Runtime and database configuration audit

Inspected every target config/*.php environment read and the [LinuxServer v1.15.0-ls175 entrypoint](https://github.com/linuxserver/docker-speedtest-tracker/blob/v1.15.0-ls175/root/etc/s6-overlay/s6-rc.d/init-speedtest-tracker-config/run). The wrapper preserves /config/.env, creates/mounts /config/database.sqlite, rebuilds framework caches and runs artisan migrate --force at startup. A20-minute startup probe now protects that initialization from liveness restarts. Optional settings for cache, queues, sessions, logging, trusted API/client behavior, database sockets/TLS, notifications and filesystem providers are listed as comments without overriding persisted values. Credentials use the existing generic Secret import; FILE__ variables are supported by the LinuxServer base image.

The target uses Laravel13; its [database support matrix](https://laravel.com/docs/13.x/database) is MariaDB10.3+, MySQL5.7+, PostgreSQL10+ and SQLite3.26+. The unchanged chart image families MariaDB11, MySQL8 and PostgreSQL18 satisfy those framework minimums; the app still supports their drivers in config/database.php. Framework support is not proof of successful app migration on each server version: upstream development Compose tests PostgreSQL17 and this review did not run app migration tests on all optional backends. SQLite is the chart default and is bundled by the image. No SQL database image is bumped by this app update.
