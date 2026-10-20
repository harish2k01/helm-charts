# Upgrade notes

## 0.1.1 — 1.13.2

Upgrade from 1.13.1 to v1.13.2. Reviewed the [release](https://github.com/gethomepage/homepage/releases/tag/v1.13.2) and [complete comparison](https://github.com/gethomepage/homepage/compare/v1.13.1...v1.13.2). Changes add Dispatcharr v24 API compatibility, allow an explicit cookie header override, and stop the Seerr widget injecting an incorrect available field; remaining changes are dependency, translation and CI maintenance.

No new deployment environment variables, ports, storage paths or RBAC requirements were introduced by this patch. Existing homepage.config YAML and environment/Secret hooks expose widget settings without a new chart abstraction. Keep allowedHosts explicitly configured for your public hostname. No new credentials or widgets are enabled by default.

Validation: Helm lint, default and Ingress/HTTPRoute rendering, generated catalog consistency and catalog tests. External widget authentication was not tested against a live service.
