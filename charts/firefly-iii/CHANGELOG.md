# Changelog

## 0.2.1

### Application changes

The cron helper moves from curl 8.21.0 to 8.23.0. SMB was removed, but this chart invokes curl only over HTTP with --fail, --silent and --show-error. The wrapper entrypoint and Secret-backed cron token remain compatible; Firefly III and PostgreSQL are unchanged.

Source: [upstream changes](https://curl.se/changes.html).

### Chart changes

Align the image, chart metadata, values schema and catalog. Existing deployment options, persistence and datastore images are unchanged.
