# Upgrade notes

## 0.1.4 — 1.15.0

Upgrade from 1.14.0. Reviewed all releases 1.14.1 through 1.14.8 and 1.15.0, the [source/configuration comparison](https://github.com/alexjustesen/speedtest-tracker/compare/v1.14.0...v1.15.0), and the [LinuxServer image configuration](https://docs.linuxserver.io/images/docker-speedtest-tracker/).

1.14.3 removes the UniFi integration, Librespeed references, and Laravel Telescope debugging configuration. Remove obsolete UNIFI_API_BASE_URL, UNIFI_API_TOKEN and TELESCOPE_* overrides from user values; these are not chart defaults. Outbound requests now use Laravel's 30-second timeout. 1.14.4 adds reorderable result columns; 1.14.7 changes API start_at/end_at date filtering; 1.15.0 adds latest-result filtering and outbound URL protocol validation. The remaining patches repair notifications, fonts, negative CLI readings and dependencies/security.

No required new runtime environment variables, mount paths or exposed ports were introduced. Existing speedtest.env and Secret/database hooks remain the configuration surface. The upstream development Compose PostgreSQL downgrade to 17 is not a production requirement and is not imposed on existing database volumes. Preserve APP_KEY and back up /config and the active database before upgrade; the image applies migrations at startup.

Validation: Helm lint, default and Ingress/HTTPRoute rendering, generated catalog consistency and catalog tests. Actual speed measurements and database migrations were not run against user data.
