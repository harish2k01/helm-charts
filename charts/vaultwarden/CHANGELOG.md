# Changelog

## 0.2.2

### Chart changes

Add a link to the web chart catalog near the top of the README. Application versions and workload configuration are unchanged.

## 0.2.1

### Application changes

1.37.1 → 1.37.5 updates the bundled web vault and introduces database key IDs and organization policy migration/backfill. Back up /data and the configured database before upgrade. Startup validates numeric and cron settings more strictly, including persisted config.json; remove obsolete Duo iframe settings and review invalid overrides. SSO signup policy is separate from regular signup and defaults to allowed upstream. The Alpine-only MariaDB TLS workaround is not appropriate for the default Debian image.

Source: [upstream changes](https://github.com/dani-garcia/vaultwarden/compare/1.37.1...1.37.5).

### Chart changes

Align the image, chart metadata, values schema and catalog. Existing deployment options, persistence and datastore images are unchanged.
