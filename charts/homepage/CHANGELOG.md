# Upgrade notes

## 0.3.1

### Chart changes

Add a link to the web chart catalog near the top of the README. Application versions and workload configuration are unchanged.

## 0.3.0 — Homepage 2.7.0

Upgrade from 1.13.2. Reviewed all intervening releases: [2.0.0](https://github.com/gethomepage/homepage/releases/tag/v2.0.0), [2.1.0](https://github.com/gethomepage/homepage/releases/tag/v2.1.0), [2.1.1](https://github.com/gethomepage/homepage/releases/tag/v2.1.1), [2.1.2](https://github.com/gethomepage/homepage/releases/tag/v2.1.2), [2.2.0](https://github.com/gethomepage/homepage/releases/tag/v2.2.0), [2.3.0](https://github.com/gethomepage/homepage/releases/tag/v2.3.0), [2.4.0](https://github.com/gethomepage/homepage/releases/tag/v2.4.0), [2.5.0](https://github.com/gethomepage/homepage/releases/tag/v2.5.0), [2.6.0](https://github.com/gethomepage/homepage/releases/tag/v2.6.0) and [2.7.0](https://github.com/gethomepage/homepage/releases/tag/v2.7.0), plus the [complete source comparison](https://github.com/gethomepage/homepage/compare/v1.13.2...v2.7.0).

### Application changes

- 2.0 adds built-in password/OIDC authentication and the optional MCP configuration API. Authentication is opt-in and does not replace edge TLS/Host controls. Node changes from 22 to 24 inside the published image; the target runtime reports Node 24.22.1. Port 3000 and /app/config remain unchanged.
- 2.1 fixes auth-provider loading and adds widget API compatibility and Gateway discovery fixes. 2.1.1 introduced a YAML parsing regression; 2.1.2 fixes it, so the target does not stop at the affected release.
- 2.2 and 2.6 include security fixes GHSA-669x-4pg4-w24r and GHSA-qxcr-4rv3-v23r. 2.3 adds OIDC auto-login and bulk Docker-status/stat requests; 2.4 preserves configuration variable placeholders during MCP edits; 2.5 adds log rotation, feeds, Bookorbit, qui and customapi widgets. 2.6 preserves dollar sequences in environment/file secrets; 2.7 adds NetBird and fixes Prometheus metric rendering. Many other widget fixes are covered in the linked releases.
- Review existing widget configuration when its service also changes. In particular [FileFlows 26.10+ requires widget version 2](https://github.com/gethomepage/homepage/blob/v2.7.0/docs/widgets/services/fileflows.md), the enabled Fenrus endpoint and its token; older servers retain widget version 1. Pulse v6, Authentik, Linkwarden, Dockhand and qBittorrent API compatibility additions remain settings inside Homepage YAML, not additional chart-level environment defaults.

### Configuration and chart changes

- Audited exact target [authentication documentation](https://github.com/gethomepage/homepage/blob/v2.7.0/docs/installation/index.md), [MCP documentation](https://github.com/gethomepage/homepage/blob/v2.7.0/docs/configs/mcp.md), [auth environment mapping](https://github.com/gethomepage/homepage/blob/v2.7.0/src/utils/env.js), [authentication handler](https://github.com/gethomepage/homepage/blob/v2.7.0/src/pages/api/auth/%5B...nextauth%5D.js), [request proxy](https://github.com/gethomepage/homepage/blob/v2.7.0/src/proxy.js), Dockerfile and entrypoint. Existing logging, IPv6 proxy, HOSTNAME/PORT, config-directory, HOMEPAGE_VAR_/HOMEPAGE_FILE_ and volume hooks remain available.
- Added commented HOMEPAGE_AUTH_ENABLED, HOMEPAGE_EXTERNAL_URL, HOMEPAGE_OIDC_ISSUER/CLIENT_ID/NAME/SCOPE/AUTO_LOGIN and HOMEPAGE_MCP_ENABLED/ALLOW_WRITE examples. No optional flags are enabled in chart defaults. Authentication requires a stable secret of at least 32 characters and a password or complete OIDC credentials. NEXTAUTH_URL/NEXTAUTH_SECRET take precedence over their Homepage aliases; avoid setting conflicting naming families.
- Added extraEnv for individual Kubernetes Secret key references, including HOMEPAGE_AUTH_SECRET/PASSWORD, HOMEPAGE_OIDC_CLIENT_SECRET and HOMEPAGE_MCP_TOKEN, plus schema and usage documentation. Existing envFrom supports whole external Secrets/ConfigMaps. Secret values are not copied into the chart ConfigMap.
- Fixed the generated pod host allowlist to use service.targetPort rather than hard-coded 3000. Configure env.PORT and service.targetPort together when changing the app listener. MY_POD_IP and HOMEPAGE_ALLOWED_HOSTS are chart-managed and reject conflicting direct overrides; use homepage.allowedHosts for public names.
- MCP tokens require at least 32 characters and grant access to configured service credentials. Writes can modify custom.js, which runs in browsers. Preserve upstream disabled defaults. For writes, use operator-owned writable config with homepage.config.enabled=false; read-only ConfigMap files shadow a PVC if generated files remain enabled. No automatic PVC seeding or overwrite is introduced. Coordinate UID/GID/fsGroup and GitOps ownership explicitly.
- No database or independent datastore is required or changed. Next.js BUILD/NEXT_PUBLIC metadata remains image-build configuration. Optional APIs, widget provider fields and UI layout choices remain YAML/application settings rather than forced environment defaults.

### Backup, rollback and validation

Back up configuration files and any writable config volume before upgrade or enabling MCP writers. Keep auth cookie secrets stable across replicas/restarts; replacing them invalidates sessions. No datastore migration is needed, but rollback cannot restore config files edited through MCP; restore matched backups. Test custom widgets, authentication and externally managed routing before production rollout.

Five focused Helm tests pass, covering defaults, custom ports/host allowlist, Secret references, writable operator claim behavior, disabled optional features and invalid/conflicting schema inputs. Helm lint and default/optional renders pass. Repository-wide tests and generated catalog checks run during final integration.

A disposable Kubernetes namespace codex-homepage-review-20261105 ran the exact ghcr.io/gethomepage/homepage:v2.7.0 image, resolved digest sha256:19c5c09184458a41b7b5915e71463a39f36cd33540f41bdbed008791b8182d5f. Pods had bounded CPU/memory, no API token, only synthetic Secrets/ConfigMaps and emptyDir volumes, and no production data or PVCs. Runtime checks passed: auth-off homepage/health HTTP 200; MCP disabled HTTP 404; hostile Host HTTP 400; auth-on unauthenticated homepage HTTP 307 with public health HTTP 200; wrong password HTTP 401, correct password/session HTTP 200; MCP missing token HTTP 401, token read HTTP 200, writes disabled by default, and opt-in write/read-back on emptyDir. Missing OIDC client credentials were rejected with HTTP 500; complete synthetic OIDC configuration returned an OAuth provider HTTP 200. No external identity-provider discovery, authorization callback or real widget service was exercised. The namespace was deleted after checks.


## 0.1.1 — 1.13.2

Upgrade from 1.13.1 to v1.13.2. Reviewed the [release](https://github.com/gethomepage/homepage/releases/tag/v1.13.2) and [complete comparison](https://github.com/gethomepage/homepage/compare/v1.13.1...v1.13.2). Changes add Dispatcharr v24 API compatibility, allow an explicit cookie header override, and stop the Seerr widget injecting an incorrect available field; remaining changes are dependency, translation and CI maintenance.

No new deployment environment variables, ports, storage paths or RBAC requirements were introduced by this patch. Existing homepage.config YAML and environment/Secret hooks expose widget settings without a new chart abstraction. Keep allowedHosts explicitly configured for your public hostname. No new credentials or widgets are enabled by default.

Validation: Helm lint, default and Ingress/HTTPRoute rendering, generated catalog consistency and catalog tests. External widget authentication was not tested against a live service.

### Runtime configuration audit

Inspected the exact v1.13.2 Dockerfile/entrypoint, src/utils/config, widget proxy, logger and configuration documentation. values.yaml now shows optional log target/level, proxy IPv6, config directory and HOMEPAGE_VAR_/HOMEPAGE_FILE_ substitution settings. Existing envFrom/volume hooks handle Secret-backed widget credentials; widget/provider config lives in the existing YAML files and no database is required. NEXT_PUBLIC_VERSION/REVISION/BUILDTIME and CI are build metadata, not runtime user features. The default non-root configuration does not run root-only ownership changes in the entrypoint.
