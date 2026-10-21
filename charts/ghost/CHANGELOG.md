# Upgrade notes

## 0.2.5

### Application changes

None. Application, database and init-image versions are unchanged.

### Chart changes

Use stable identity labels in StatefulSet claim templates instead of chart/app-version labels. Add the documented persistence.claimTemplateLabels maps (under each affected component's persistence settings) for deterministic preservation of existing immutable template labels. Existing installations must pin their current labels before the first upgrade; simply removing historical labels is also an immutable change. No StatefulSet/PVC replacement or database migration is performed. Regression tests compare complete claim templates across simulated chart/app version upgrades and verify legacy-label overrides.

## 0.2.4 — 6.71.0-alpine

Upgrade from 6.39.0-alpine. Reviewed every published release from6.40.0 through6.71.0 (including patch releases and6.66.0's failed npm publication), the [source comparison](https://github.com/TryGhost/Ghost/compare/v6.39.0...v6.71.0), and exact old/new defaults.json and overrides.json. The official image retains port2368 and /var/lib/ghost/content.

Application changes include gift subscriptions, threaded/pinned comments, Admin toolbar, IndexNow, llms.txt/Markdown responses, configurable Admin session lifetime, automations/email sequences, React Admin migration, export improvements and security/dependency fixes. These are upstream application/theme features; they do not require new Services or enabling chart-side feature flags.

Configuration changes are accessible through the existing generic env, extraEnv, secretEnv, extraVolumes and extraVolumeMounts hooks. New deployment-relevant keys include admin__sessionMaxAgeMs, klipy__apiKey/contentFilter (Tenor is removed), adapters__jobs, adapters__redirects, adapters__route-settings, storage__imports, externalRequest settings, remoteFlags, disableMigrationBackups and custom adapter paths. The target defaults also change asset content hashing and client-error logging, add signup/checkout spam controls, import/member limits, llms cache policy, request-integrity verification, query-parameter filtering and machine-payment adapter settings. These upstream defaults are deliberately inherited rather than hard-coded into user values. Removed lazyRouting and emailAnalytics.openedJobLagWarningMinutes overrides should be removed from installation values.

Custom adapter packages must satisfy the new boot-time validation contract. Docker _FILE secret support is available in6.58; existing Kubernetes secretKeyRef injection remains supported. For mounted secret files use extraEnv and extraVolumes. Keep secrets such as Klipy/payment keys out of plain env. Machine payment integrations require their own upstream setup and are not provisioned by this chart.

Ghost6 production uses MySQL8; the existing mysql:8 image family is retained. The [6.59 release](https://github.com/TryGhost/Ghost/releases/tag/v6.59.0) fixes migrations on MySQL older than8.0.28. Back up the database and content together before automatic startup migrations; do not rely on Helm rollback for database downgrade. Node24 support added in6.63 is handled inside the published image. Social Web proxy settings remain opt-in.

Validation: Helm lint, default and session/Klipy-Secret/Ingress/HTTPRoute rendering plus catalog regeneration/check/tests. No production database migrations, theme compatibility or external integration calls were executed.
