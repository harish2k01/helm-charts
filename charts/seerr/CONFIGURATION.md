# seerr runtime configuration

This chart passes the existing/new supported runtime options through the extensible `env` map; 25 documented names are listed below. Optional examples in `values.yaml` are commented so they cannot enable a feature or override an existing application setting. All environment values must be quoted strings. Upstream defaults are distinct from chart defaults. Environment overrides take precedence over persisted app configuration.

Sources: [target-version configuration](https://github.com/seerr-team/seerr/blob/v3.5.0/server/datasource.ts), [full application comparison](https://github.com/seerr-team/seerr/compare/v3.2.0...v3.5.0).

| Environment variable | Upstream default when unset | Purpose |
| --- | --- | --- |
| `HOST` | unset (listen on all interfaces) | HTTP bind address, IPv6 literals supported |
| `PORT` | 5055 | HTTP listener; match service.targetPort |
| `CONFIG_DIRECTORY` | config relative to /app | Database/settings/log/cache path; mount persistent storage before changing |
| `LOG_LEVEL` | debug | Application log threshold |
| `API_KEY` | generated/persisted | API key override; use an existing Secret Secret/sensitive: use an existing Secret. |
| `DB_TYPE` | sqlite | Database engine; postgres is external |
| `DB_HOST` | localhost (driver default) | External PostgreSQL hostname |
| `DB_PORT` | 5432 | External PostgreSQL TCP port |
| `DB_SOCKET_PATH` | unset | Mounted Unix socket directory, takes precedence over host/port |
| `DB_USER` | unset | External database username from Secret Secret/sensitive: use an existing Secret. |
| `DB_PASS` | unset | External database password from Secret Secret/sensitive: use an existing Secret. |
| `DB_NAME` | seerr | Database name |
| `DB_POOL_SIZE` | 10 (driver default) | Maximum PostgreSQL pool connections |
| `DB_CONNECT_TIMEOUT_MS` | 30000 | Pool acquisition timeout milliseconds; 0 means indefinite |
| `DB_LOG_QUERIES` | false | Query diagnostics; may expose sensitive data |
| `DB_USE_SSL` | false | Enable PostgreSQL TLS |
| `DB_SSL_REJECT_UNAUTHORIZED` | true | Verify database certificate trust; keep enabled |
| `DB_SSL_CA` | unset | Database TLS CA material (inline takes precedence over _FILE) |
| `DB_SSL_CA_FILE` | unset | Mounted database TLS CA file |
| `DB_SSL_KEY` | unset | Database TLS KEY material (inline takes precedence over _FILE) Secret/sensitive: use an existing Secret. |
| `DB_SSL_KEY_FILE` | unset | Mounted database TLS KEY file |
| `DB_SSL_CERT` | unset | Database TLS CERT material (inline takes precedence over _FILE) |
| `DB_SSL_CERT_FILE` | unset | Mounted database TLS CERT file |
| `TZ` | image timezone | Container timezone |
| `JELLYFIN_TYPE` | unset | Legacy one-time Jellyseerr migration selector; emby only when migrating |

## Existing Secrets and files

The chart does not create application credentials. Reference an existing Secret with `envFrom`; its keys must be the exact environment names in the table. Explicit `env` entries take precedence, so remove any conflicting entry when moving it to a Secret.

```yaml
envFrom:
  - secretRef:
      name: application-runtime
extraVolumes:
  - name: runtime-files
    secret:
      secretName: application-files
extraVolumeMounts:
  - name: runtime-files
    mountPath: /run/application-secrets
    readOnly: true
```

Config-file-only options remain supported by the application UI and its existing persistent config volume. Mount additional files with `extraVolumes`/`extraVolumeMounts` when necessary. Avoid replacing the entire writable config directory with a read-only ConfigMap/Secret: apps write configuration and migration state there. No existing config file is generated or overwritten by this chart.

## Database and non-runtime settings

SQLite remains the default in `/app/config/db`; PostgreSQL is external and must be selected explicitly with `DB_TYPE=postgres`. The chart provisions no PostgreSQL image or data-directory migration. The [official database guide](https://docs.seerr.dev/extending-seerr/database-config/) and target source support TCP/Unix sockets, TLS (inline material wins over `_FILE`), connection pools and acquisition timeouts. Upstream does not state a complete PostgreSQL major-version support matrix here; compatibility with an arbitrary existing server is unverified. Do not infer support or migrate its major from a Compose example. Back up the selected database before app migrations. Mounted config must be writable by the image node user.

`NODE_ENV=production` is fixed by the image; CI/test variables (`CI`, `PRESERVE_DB`, `WITH_MIGRATIONS`, `ALLOW_NETWORK`, `VERBOSE`, TypeScript tooling) and `COMMIT_TAG`/`TARGETPLATFORM`/build variables are not deployment features. `UNSAFE_DO_NOT_USE_DEMO` is a dangerous development/demo mode and is intentionally not offered as a production example. `JELLYFIN_TYPE` is a legacy migration input, not the normal media-server configuration API. Notification/webhook payloads and Plex/Jellyfin library endpoints are request/API contracts and do not become env vars.
