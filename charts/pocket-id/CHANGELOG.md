# Upgrade notes

## 0.2.0 — v2.18.0

Upgrade from v2.7.0. Reviewed all releases v2.8.0 through v2.18.0 and the [complete source comparison](https://github.com/pocket-id/pocket-id/compare/v2.7.0...v2.18.0), exact env_config.go/AppConfigModel and Docker entrypoint.

OIDC additions include PAR, scoped OAuth APIs, additional response modes, multiple client secrets, federated credentials and back-channel logout. v2.10 adds the Francis actor runtime; v2.12 migrates config/tokens and changes unauthenticated one-time-login to QR approval; subsequent versions migrate background jobs/LDAP/SCIM cleanup to actors and repair token/WebAuthn/SSRF security behavior. Existing encryption keys and database must be preserved.

TRUST_PROXY now accepts comma-separated IP/CIDR lists while boolean false/true remains compatible. PROXY_PROTOCOL is a separate trusted proxy list and should only be enabled behind a compatible proxy. TLS_CERT/TLS_KEY now hold inline PEM; mounted paths use TLS_CERT_FILE/TLS_KEY_FILE. METRICS_ENABLED and TRACING_ENABLED are removed: configure OTEL_METRICS_EXPORTER, OTEL_TRACES_EXPORTER, OTEL_LOGS_EXPORTER and OTEL_EXPORTER_OTLP_* instead. These changes and the complete runtime/application environment inventory are commented in values.yaml without forcing persisted UI settings.

The embedded actor listener uses port1414; the public Service remains1411 and does not expose it. Experimental standalone Francis requires explicit host, trusted CA and exactly one PSK/JWT bootstrap method; no standalone runtime or trust is provisioned by default. ICON_LIBRARY_URL selects a selfh.st-compatible icon mirror or disabled; CLOUDFLARE_LOCATION_HEADERS trusts proxy location data only when explicitly enabled. LOG_QUERY_ARGS may expose sensitive query values. SQLite storage warnings must not be suppressed to disguise unsupported network storage.

The default SQLite driver is bundled with the target binary; no external database image is changed. SQLite data must live on a local/block filesystem rather than NFS/SMB/FUSE. External PostgreSQL remains configurable through DB_CONNECTION_STRING; a precise supported server-major range is not declared in the target source, so external PostgreSQL compatibility remains a pre-rollout validation requirement rather than a confirmed matrix. Back up /app/data and ENCRYPTION_KEY before automatic migrations; downgrade requires a matched restore. The image retains PUID/PGID handling and binary healthcheck; removal of curl does not break chart probes. Added a20-minute startup probe for first-start migrations.

Validation: Helm lint, default and proxy/CIDR/OTLP/Secret/Ingress/HTTPRoute rendering, catalog generation/check/tests. Login/OIDC/actor migrations and external PostgreSQL were not tested live.
