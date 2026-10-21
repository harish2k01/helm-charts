# Dependency updates

Renovate detects image proposals; application and chart compatibility are reviewed before merging. App/chart changes and source evidence live in each affected chart's `CHANGELOG.md`. Runtime options are discoverable in chart values, with secrets supplied through Kubernetes Secret references.

The configuration adds upstream source and release-history links for application images, including LinuxServer wrappers whose image metadata may otherwise link only to the wrapper. Wrapper release notes and the full intervening application history remain relevant; a release link does not prove compatibility.

qBittorrent uses strict semantic versioning and accepts application tags in the 4–9 series. This rejects the historical `20.04.1` OS-style tag that was incorrectly proposed as an upgrade from 5.2.x. A genuine future qBittorrent v10 needs an intentional rule update.

All updates remain manually merged. Independent proposals for embedded PostgreSQL, MySQL, MariaDB, Redis and InfluxDB are disabled. A datastore change requires version-specific upstream application/container support before targeted compatibility testing; newer versions and passing tests alone do not justify it. See [the upgrade review reference](../UPGRADE_REVIEW.md) for the evidence gate and review checks. Unstable SemVer prereleases are excluded where the versioning scheme identifies them; a numeric tag such as BusyBox 1.38.0 can still be labeled unstable in upstream prose and requires release-note review.

Validate config changes with the official validator and the historical-tag regression test:

```sh
npx --yes --package renovate@44.172.1 -- renovate-config-validator --strict renovate.json
node --test tests/renovate.test.mjs
```

The weekly review checks all bot PRs, audits configuration and migration compatibility, and pushes reviewable changes back to the same branches. It does not merge or deploy. Chart metadata and `docs/catalog.json` are kept consistent through the repository generator; Renovate does not execute arbitrary post-upgrade shell tasks here.

## Shared runner and repository configuration

The shared runner is configured by `homelab-ops/charts/renovate/values.yaml`, whose `renovate.config` JSON selects `harish2k01/helm-charts` and `harish2k01/homelab-ops`. Its shared rules disable automerging and automatic embedded PostgreSQL/MySQL/MariaDB bumps. The deployed `renovate-config` ConfigMap was checked against that source; it has no `force` configuration overriding repository rules. The deployed image at review time is Renovate 43.150.0.

Each repository then supplies its own `renovate.json`. The `homelab-ops` repository restricts its own updates to Argo CD files and ignores its vendored charts; that repository-specific restriction is separate from the global runner configuration. The Helm chart repository enables Helm values, Helm dependencies and GitHub Actions. Its package rules add the application release links and qBittorrent guard on top of the shared rules. No shared runner change is required for these repository-specific improvements.

Renovate validation and applicable disposable smoke tests run during upgrade reviews rather than dedicated standing workflows. Validate against the actual deployed runner version; 43.150.0 and 44.172.1 were checked in the preceding review. A real Renovate run uses repository configuration after merge. The shared runner remains on its existing six-hour schedule in Asia/Kolkata, separate from the weekly Codex chart-compatibility review.
