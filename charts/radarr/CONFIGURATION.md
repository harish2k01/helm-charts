# radarr runtime configuration

This chart passes the existing/new supported runtime options through the extensible `env` map; 45 documented names are listed below. Optional examples in `values.yaml` are commented so they cannot enable a feature or override an existing application setting. All environment values must be quoted strings. Upstream defaults are distinct from chart defaults. Environment overrides take precedence over persisted app configuration.

Sources: [target-version configuration](https://github.com/Radarr/Radarr/tree/v6.4.4.10685/src/NzbDrone.Common/Options), [full application comparison](https://github.com/Radarr/Radarr/compare/v6.1.1.10360...v6.4.4.10685).

| Environment variable | Upstream default when unset | Purpose |
| --- | --- | --- |
| `PUID` | wrapper user default; chart=3000 | Owner UID for writable config and media |
| `PGID` | wrapper group default; chart=3000 | Owner GID for writable config and media |
| `TZ` | chart=Asia/Kolkata | Container timezone |
| `UMASK` | 022 | Mask applied to newly created files |
| `RADARR__APP__INSTANCENAME` | Radarr | App identity and UI: InstanceName |
| `RADARR__APP__THEME` | auto | App identity and UI: Theme |
| `RADARR__APP__LAUNCHBROWSER` | true | App identity and UI: LaunchBrowser |
| `RADARR__AUTH__APIKEY` | generated/persisted | Authentication: ApiKey Secret/sensitive: use an existing Secret. |
| `RADARR__AUTH__ENABLED` | false | Authentication: Enabled |
| `RADARR__AUTH__METHOD` | None (first-run setup required) | Authentication: Method |
| `RADARR__AUTH__REQUIRED` | Enabled | Authentication: Required |
| `RADARR__AUTH__TRUSTCGNATIPADDRESSES` | false | Authentication: TrustCgnatIpAddresses |
| `RADARR__LOG__LEVEL` | debug | Logging: Level |
| `RADARR__LOG__FILTERSENTRYEVENTS` | true | Logging: FilterSentryEvents |
| `RADARR__LOG__ROTATE` | 50 | Logging: Rotate |
| `RADARR__LOG__SIZELIMIT` | 1 | Logging: SizeLimit |
| `RADARR__LOG__SQL` | false | Logging: Sql |
| `RADARR__LOG__CONSOLELEVEL` | empty | Logging: ConsoleLevel |
| `RADARR__LOG__CONSOLEFORMAT` | Standard | Logging: ConsoleFormat |
| `RADARR__LOG__ANALYTICSENABLED` | true | Logging: AnalyticsEnabled |
| `RADARR__LOG__SYSLOGSERVER` | empty | Logging: SyslogServer |
| `RADARR__LOG__SYSLOGPORT` | 514 | Logging: SyslogPort |
| `RADARR__LOG__SYSLOGLEVEL` | inherits Log.Level | Logging: SyslogLevel |
| `RADARR__LOG__DBENABLED` | true | Logging: DbEnabled |
| `RADARR__POSTGRES__HOST` | empty (SQLite) | External PostgreSQL: Host |
| `RADARR__POSTGRES__PORT` | 5432 | External PostgreSQL: Port |
| `RADARR__POSTGRES__USER` | empty | External PostgreSQL: User |
| `RADARR__POSTGRES__PASSWORD` | empty | External PostgreSQL: Password Secret/sensitive: use an existing Secret. |
| `RADARR__POSTGRES__MAINDB` | radarr-main | External PostgreSQL: MainDb |
| `RADARR__POSTGRES__LOGDB` | radarr-log | External PostgreSQL: LogDb |
| `RADARR__POSTGRES__MAINDBCONNECTIONSTRING` | empty | External PostgreSQL: MainDbConnectionString Secret/sensitive: use an existing Secret. |
| `RADARR__POSTGRES__LOGDBCONNECTIONSTRING` | empty | External PostgreSQL: LogDbConnectionString Secret/sensitive: use an existing Secret. |
| `RADARR__SERVER__URLBASE` | empty | Listener/proxy/TLS: UrlBase |
| `RADARR__SERVER__BINDADDRESS` | * | Listener/proxy/TLS: BindAddress |
| `RADARR__SERVER__ALLOWEDHOSTS` | empty (any host) | Listener/proxy/TLS: AllowedHosts |
| `RADARR__SERVER__PORT` | 7878 | Listener/proxy/TLS: Port |
| `RADARR__SERVER__ENABLESSL` | false | Listener/proxy/TLS: EnableSsl |
| `RADARR__SERVER__SSLPORT` | 9898 | Listener/proxy/TLS: SslPort |
| `RADARR__SERVER__SSLCERTPATH` | empty | Listener/proxy/TLS: SslCertPath |
| `RADARR__SERVER__SSLCERTPASSWORD` | empty | Listener/proxy/TLS: SslCertPassword Secret/sensitive: use an existing Secret. |
| `RADARR__SERVER__TRUSTEDNETWORKS` | empty (loopback only) | Listener/proxy/TLS: TrustedNetworks |
| `RADARR__UPDATE__MECHANISM` | BuiltIn | Binary updater (keep image-managed): Mechanism |
| `RADARR__UPDATE__AUTOMATICALLY` | false on Linux | Binary updater (keep image-managed): Automatically |
| `RADARR__UPDATE__SCRIPTPATH` | empty | Binary updater (keep image-managed): ScriptPath |
| `RADARR__UPDATE__BRANCH` | master | Binary updater (keep image-managed): Branch |

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

## LinuxServer container contract

[Image documentation](https://docs.linuxserver.io/images/docker-radarr/) additionally supports the `FILE__<VARIABLE>` convention: mount a Secret file then set e.g. `env.FILE__RADARR__AUTH__APIKEY` to its absolute path. Base-image Docker Mods (`DOCKER_MODS`) and initialization hooks can change installed software/startup behavior; they are opt-in image extensions, not application settings, and must be reviewed separately. `UMASK` affects new files, not existing permissions; match PUID/PGID to writable storage. Build variables such as `BUILD_VERSION`, architecture and download URLs are image-build inputs, not chart runtime settings.

## Persisted settings and database

Download clients, indexers, quality profiles, root folders, notification scripts and API request/webhook fields are persisted app/UI/API settings, not arbitrary environment variables. The options table covers every property bound by the target `App`, `Auth`, `Server`, `Log`, `Update`, and `Postgres` option classes. The legacy Auth.Enabled switch maps authentication to Forms; prefer Auth.Method and Auth.Required. Keep binary updates image-managed; Update settings are listed for coverage and should not be used to update files inside the container.

The default database is image-bundled SQLite in `/config`; this chart embeds no database image and does not change an external database server. PostgreSQL is optional and requires separate main/log databases and its own backups. Refer to the [official PostgreSQL setup](https://wiki.servarr.com/radarr/postgres-setup); no automatic SQLite-to-PostgreSQL conversion is performed. The external server major version and an upgrade against your data have not been live-tested by these static chart checks. Before updating an existing external deployment, check its major against upstream support and back it up. Restore a matching database backup when rolling back an application migration.

## Verified container build

The 6.4.4 amd64 image manifest identifies [wrapper source 8a9a0640b16e](https://github.com/linuxserver/docker-radarr/tree/8a9a0640b16e8db5895f51cd95260702888593c4) and build `Linuxserver.io version:- 6.4.4.10685-ls322 Build-date:- 2026-10-19T02:20:12+00:00`. The public tag also provides arm64. These are registry metadata checks, not a live application/database migration test.

The [official radarr PostgreSQL setup guide](https://github.com/Servarr/Wiki/blob/master/radarr/postgres-setup.md) explicitly lists PostgreSQL 14–18 as supported and identifies PostgreSQL 13 as end-of-life. This is the application's published guidance, not an inference from the driver. Its SQLite-to-PostgreSQL loader steps were written against PostgreSQL 14 and may require changes on newer majors; upstream advises a fresh database for PostgreSQL 18+. This chart does not migrate an external server or certify your existing dataset.

When enabling app-native HTTPS, set RADARR__SERVER__SSLPORT explicitly: the target startup bootstrap falls back to 8787 before config is loaded, while ConfigFileProvider uses 9898. Keeping the port explicit avoids this upstream fallback discrepancy; the normal HTTP Service is unaffected.
