# Changelog

## 0.1.1

### Application changes

v2.0.1 → v2.0.4 adds a lightweight /healthz endpoint, changes the metrics implementation, restores metadata, and updates CA dependencies. Health checks no longer trigger a scrape or require qBittorrent to be reachable; use scrape alerts for backend availability.

Source: [upstream changes](https://github.com/martabal/qbittorrent-exporter/compare/v2.0.1...v2.0.4).

### Chart changes

Use /healthz for default liveness/readiness while leaving the metrics and ServiceMonitor paths unchanged. Reserve /healthz from exporter.path and correct the upstream ENABLE_LABEL_WITH_TAGS variable without renaming the chart value.
