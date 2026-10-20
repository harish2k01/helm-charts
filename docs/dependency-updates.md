# Dependency updates

Renovate detects image proposals; application and chart compatibility are reviewed before merging. App/chart changes and source evidence live in each affected chart's `CHANGELOG.md`. Runtime options are discoverable in chart values, with secrets supplied through Kubernetes Secret references.

The configuration adds upstream source and release-history links for application images, including LinuxServer wrappers whose image metadata may otherwise link only to the wrapper. Wrapper release notes and the full intervening application history remain relevant; a release link does not prove compatibility.

qBittorrent uses strict semantic versioning and accepts application tags in the 4–9 series. This rejects the historical `20.04.1` OS-style tag that was incorrectly proposed as an upgrade from 5.2.x. A genuine future qBittorrent v10 needs an intentional rule update. The valid 5.2.4 upgrade remains in PR #73. PR #29 now contains these Renovate improvements and no application downgrade.

All updates remain manually merged. Existing automatic detection exclusions for embedded PostgreSQL, MySQL and MariaDB are retained; their upgrades are tied to application compatibility. Redis/InfluxDB proposals include a database compatibility note. Unstable SemVer prereleases are excluded where the versioning scheme identifies them; a numeric tag such as BusyBox 1.38.0 can still be labeled unstable in upstream prose and requires release-note review.

Validate config changes with the official validator and the historical-tag regression test:

```sh
npx --yes --package renovate@44.172.1 -- renovate-config-validator --strict renovate.json
node --test tests/renovate.test.mjs
```

The weekly review checks all bot PRs, audits configuration and migration compatibility, and pushes reviewable changes back to the same branches. It does not merge or deploy. Chart metadata and `docs/catalog.json` are kept consistent through the repository generator; Renovate does not execute arbitrary post-upgrade shell tasks here.
