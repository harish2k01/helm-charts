# Upgrade notes

## 0.1.1 — 1.13.2

Upgrade from 1.13.1 to v1.13.2. Reviewed the [release](https://github.com/gethomepage/homepage/releases/tag/v1.13.2) and [complete comparison](https://github.com/gethomepage/homepage/compare/v1.13.1...v1.13.2). Changes add Dispatcharr v24 API compatibility, allow an explicit cookie header override, and stop the Seerr widget injecting an incorrect available field; remaining changes are dependency, translation and CI maintenance.

No new deployment environment variables, ports, storage paths or RBAC requirements were introduced by this patch. Existing homepage.config YAML and environment/Secret hooks expose widget settings without a new chart abstraction. Keep allowedHosts explicitly configured for your public hostname. No new credentials or widgets are enabled by default.

Validation: Helm lint, default and Ingress/HTTPRoute rendering, generated catalog consistency and catalog tests. External widget authentication was not tested against a live service.

### Runtime configuration audit

Inspected the exact v1.13.2 Dockerfile/entrypoint, src/utils/config, widget proxy, logger and configuration documentation. values.yaml now shows optional log target/level, proxy IPv6, config directory and HOMEPAGE_VAR_/HOMEPAGE_FILE_ substitution settings. Existing envFrom/volume hooks handle Secret-backed widget credentials; widget/provider config lives in the existing YAML files and no database is required. NEXT_PUBLIC_VERSION/REVISION/BUILDTIME and CI are build metadata, not runtime user features. The default non-root configuration does not run root-only ownership changes in the entrypoint.
