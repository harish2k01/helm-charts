# prowlarr runtime configuration

This chart passes the existing/new supported runtime options through the extensible `env` map; 45 documented names are listed below. Optional examples in `values.yaml` are commented so they cannot enable a feature or override an existing application setting. All environment values must be quoted strings. Upstream defaults are distinct from chart defaults. Environment overrides take precedence over persisted app configuration.

Sources: [target-version configuration](https://github.com/Prowlarr/Prowlarr/tree/v2.6.5.5623/src/NzbDrone.Common/Options), [full application comparison](https://github.com/Prowlarr/Prowlarr/compare/v2.3.5.5327...v2.6.5.5623).

| Environment variable | Upstream default when unset | Purpose |
| --- | --- | --- |
| `PUID` | wrapper user default; chart=3000 | Owner UID for writable config and media |
| `PGID` | wrapper group default; chart=3000 | Owner GID for writable config and media |
| `TZ` | chart=Asia/Kolkata | Container timezone |
| `UMASK` | 022 | Mask applied to newly created files |
| `PROWLARR__APP__INSTANCENAME` | Prowlarr | App identity and UI: InstanceName |
| `PROWLARR__APP__THEME` | auto | App identity and UI: Theme |
| `PROWLARR__APP__LAUNCHBROWSER` | true | App identity and UI: LaunchBrowser |
| `PROWLARR__AUTH__APIKEY` | generated/persisted | Authentication: ApiKey Secret/sensitive: use an existing Secret. |
| `PROWLARR__AUTH__ENABLED` | false | Authentication: Enabled |
| `PROWLARR__AUTH__METHOD` | None (first-run setup required) | Authentication: Method |
| `PROWLARR__AUTH__REQUIRED` | Enabled | Authentication: Required |
| `PROWLARR__AUTH__TRUSTCGNATIPADDRESSES` | false | Authentication: TrustCgnatIpAddresses |
| `PROWLARR__LOG__LEVEL` | debug | Logging: Level |
| `PROWLARR__LOG__FILTERSENTRYEVENTS` | true | Logging: FilterSentryEvents |
| `PROWLARR__LOG__ROTATE` | 50 | Logging: Rotate |
| `PROWLARR__LOG__SIZELIMIT` | 1 | Logging: SizeLimit |
| `PROWLARR__LOG__SQL` | false | Logging: Sql |
| `PROWLARR__LOG__CONSOLELEVEL` | empty | Logging: ConsoleLevel |
| `PROWLARR__LOG__CONSOLEFORMAT` | Standard | Logging: ConsoleFormat |
| `PROWLARR__LOG__ANALYTICSENABLED` | true | Logging: AnalyticsEnabled |
| `PROWLARR__LOG__SYSLOGSERVER` | empty | Logging: SyslogServer |
| `PROWLARR__LOG__SYSLOGPORT` | 514 | Logging: SyslogPort |
| `PROWLARR__LOG__SYSLOGLEVEL` | inherits Log.Level | Logging: SyslogLevel |
| `PROWLARR__LOG__DBENABLED` | true | Logging: DbEnabled |
| `PROWLARR__POSTGRES__HOST` | empty (SQLite) | External PostgreSQL: Host |
| `PROWLARR__POSTGRES__PORT` | 5432 | External PostgreSQL: Port |
| `PROWLARR__POSTGRES__USER` | empty | External PostgreSQL: User |
| `PROWLARR__POSTGRES__PASSWORD` | empty | External PostgreSQL: Password Secret/sensitive: use an existing Secret. |
| `PROWLARR__POSTGRES__MAINDB` | prowlarr-main | External PostgreSQL: MainDb |
| `PROWLARR__POSTGRES__LOGDB` | prowlarr-log | External PostgreSQL: LogDb |
| `PROWLARR__POSTGRES__MAINDBCONNECTIONSTRING` | empty | External PostgreSQL: MainDbConnectionString Secret/sensitive: use an existing Secret. |
| `PROWLARR__POSTGRES__LOGDBCONNECTIONSTRING` | empty | External PostgreSQL: LogDbConnectionString Secret/sensitive: use an existing Secret. |
| `PROWLARR__SERVER__URLBASE` | empty | Listener/proxy/TLS: UrlBase |
| `PROWLARR__SERVER__BINDADDRESS` | * | Listener/proxy/TLS: BindAddress |
| `PROWLARR__SERVER__ALLOWEDHOSTS` | empty (any host) | Listener/proxy/TLS: AllowedHosts |
| `PROWLARR__SERVER__PORT` | 9696 | Listener/proxy/TLS: Port |
| `PROWLARR__SERVER__ENABLESSL` | false | Listener/proxy/TLS: EnableSsl |
| `PROWLARR__SERVER__SSLPORT` | 6969 | Listener/proxy/TLS: SslPort |
| `PROWLARR__SERVER__SSLCERTPATH` | empty | Listener/proxy/TLS: SslCertPath |
| `PROWLARR__SERVER__SSLCERTPASSWORD` | empty | Listener/proxy/TLS: SslCertPassword Secret/sensitive: use an existing Secret. |
| `PROWLARR__SERVER__TRUSTEDNETWORKS` | empty (loopback only) | Listener/proxy/TLS: TrustedNetworks |
| `PROWLARR__UPDATE__MECHANISM` | BuiltIn | Binary updater (keep image-managed): Mechanism |
| `PROWLARR__UPDATE__AUTOMATICALLY` | false on Linux | Binary updater (keep image-managed): Automatically |
| `PROWLARR__UPDATE__SCRIPTPATH` | empty | Binary updater (keep image-managed): ScriptPath |
| `PROWLARR__UPDATE__BRANCH` | master | Binary updater (keep image-managed): Branch |

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

[Image documentation](https://docs.linuxserver.io/images/docker-prowlarr/) additionally supports the `FILE__<VARIABLE>` convention: mount a Secret file then set e.g. `env.FILE__PROWLARR__AUTH__APIKEY` to its absolute path. Base-image Docker Mods (`DOCKER_MODS`) and initialization hooks can change installed software/startup behavior; they are opt-in image extensions, not application settings, and must be reviewed separately. `UMASK` affects new files, not existing permissions; match PUID/PGID to writable storage. Build variables such as `BUILD_VERSION`, architecture and download URLs are image-build inputs, not chart runtime settings.

## Persisted settings and database

Download clients, indexers, quality profiles, root folders, notification scripts and API request/webhook fields are persisted app/UI/API settings, not arbitrary environment variables. The options table covers every property bound by the target `App`, `Auth`, `Server`, `Log`, `Update`, and `Postgres` option classes. The legacy Auth.Enabled switch maps authentication to Forms; prefer Auth.Method and Auth.Required. Keep binary updates image-managed; Update settings are listed for coverage and should not be used to update files inside the container.

The default database is image-bundled SQLite in `/config`; this chart embeds no database image and does not change an external database server. PostgreSQL is optional and requires separate main/log databases and its own backups. Refer to the [official PostgreSQL setup](https://wiki.servarr.com/prowlarr/postgres-setup); no automatic SQLite-to-PostgreSQL conversion is performed. The external server major version and an upgrade against your data have not been live-tested by these static chart checks. Before updating an existing external deployment, check its major against upstream support and back it up. Restore a matching database backup when rolling back an application migration.

## Verified container build

The 2.6.5 amd64 image manifest identifies [wrapper source fd19558fc530](https://github.com/linuxserver/docker-prowlarr/tree/fd19558fc5301624dc589603fb2e9439f2faac9b) and build `Linuxserver.io version:- 2.6.5.5623-ls164 Build-date:- 2026-10-18T23:10:20+00:00`. The public tag also provides arm64. These are registry metadata checks, not a live application/database migration test.
