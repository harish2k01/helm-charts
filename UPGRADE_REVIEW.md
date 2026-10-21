# Application and chart upgrade review

This reference applies to requested and weekly reviews of `friday-pa[bot]` / `app/friday-pa` pull requests in `harish2k01/helm-charts`.

## Review scope

Fetch current main and PR heads, preserve existing user changes and use isolated worktrees. Verify published releases and exact image availability, including container wrappers and architectures. Read every intervening changelog, migration guide and runtime configuration/source diff from the current version to the target. Review new features, renamed/removed settings, changed defaults, ports, probes, security, persistence and rollback requirements.

Audit both existing and newly added supported environment variables and configuration. Expose missing options in values with concise purpose/default comments and safely commented opt-in examples; adjust schema and templates when necessary. Supply secrets through Secret references and usable env/envFrom/extraEnv/config mounts. Preserve app-owned persisted configuration; distinguish runtime options from build variables, API request fields, UI settings and CLI flags. Do not activate optional defaults that unexpectedly override users' configuration.

## Databases and Redis

Skip independent PostgreSQL, MySQL, MariaDB, Redis, InfluxDB and other bundled datastore updates by default, including patch and minor updates. Renovate recency, a broad minimum-version bound and a passing smoke test are insufficient justification.

Only consider a datastore change when the exact target application/container release, base image or maintained official deployment adopts that version, or official upstream documentation explicitly supports the target server version/series. Record version-specific evidence in the chart changelog first. Then assess client/server support, migration path, entrypoint, architectures, persisted formats, backup and rollback constraints. If evidence is missing, retain the current datastore image and report the skipped proposal. Block an app upgrade requiring an undocumented datastore change. Do not retroactively revert already merged versions without an explicit request.

## Validation during each review

These checks belong to the review, not additional standing GitHub workflows. Keep the existing Lint Charts and Release Charts workflows. Do not recreate the removed BusyBox, ownCloud Redis, Scrutiny database or Renovate validation workflows without a new request.

- Run required Helm lint and default rendering, plus changed-option renders and meaningful repository tests. Check generated catalog consistency and exact pushed-head CI.
- When init-image versions or commands change, run `node scripts/smoke-busybox.mjs` in a disposable Docker-capable environment. It exercises rendered Scrutiny config seeding/preservation and Tailscale IPv4/IPv6 forwarding commands. Inspect assumptions and update pinned-version assertions for the reviewed target.
- Only after the datastore evidence gate passes, run the relevant disposable integration test: `node scripts/smoke-owncloud-redis.mjs` for ownCloud PHPRedis operations, RDB/AOF migration and restart; `node scripts/smoke-scrutiny-influx.mjs` for actual Scrutiny onboarding, authenticated API access and retained metrics across InfluxDB upgrade. Their historical baselines are Redis 6.2.21 and InfluxDB 2.8.0; adapt them to the actual current-to-target path. Do not run database upgrade tests merely because an app or documentation changed. Add a suitable targeted check for other supported datastore changes.
- Never use production data, production credentials or live PVCs for smoke tests. Report unavailable tools, skipped checks and untested custom/external backend migrations explicitly. Passing disposable tests does not establish complete production compatibility or safe downgrade.
- When Renovate configuration changes, run its official strict validator against the deployed runner version and any separately proposed version, plus `node --test tests/renovate.test.mjs`. The last reviewed versions were 43.150.0 and 44.172.1; refresh rather than assume.

## Documentation and delivery

Put source-linked app changes and chart changes in each affected chart's `CHANGELOG.md`, with version range, configuration changes, migrations, backups, rollback limitations and validation. Keep README content focused on usage and link to the changelog. Bump chart SemVer appropriately and synchronize image metadata, schema defaults, appVersion and the root README. Regenerate `docs/catalog.json` with the generator; never hand-edit it.

Push non-force to the same bot branches. Avoid duplicate commits for unchanged reviewed heads. Handle overlaps with distinct chart versions and an explicit merge order; disclose stacked changes. Never automatically merge or deploy. Preserve configured Git identity and add `Assisted-by: Codex` to new review commits. Summarize PRs, versions, configuration, evidence, tests, CI, skipped dependencies and remaining risks; stay quiet when no new work is actionable.

## Renovate review comes last

Inspect this repository's `renovate.json`, `homelab-ops/renovate.json` and the shared `renovate.config` JSON in `homelab-ops/charts/renovate/values.yaml`. Verify the deployed runner/config when available without exposing credentials. Preserve homelab-ops' separate Argo CD-only repository scope. Keep changes scoped to the appropriate layer, manual merges, stable update selection, accurate tag extraction and useful upstream release links. The Helm repository disables independent proposals for its five current datastore images; upstream-supported datastore changes can be made explicitly as part of the reviewed app update. New datastore dependencies require the same evidence policy and exclusion review.

The requested cloud environment is **Charts**. A saved prompt does not bind a local schedule to that environment: verify the actual execution environment and repository/tool/GitHub access. Use cloud checkout paths rather than Windows paths there.
