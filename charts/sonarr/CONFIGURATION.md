# sonarr runtime configuration

This chart passes the existing/new supported runtime options through the extensible `env` map; 43 documented names are listed below. Optional examples in `values.yaml` are commented so they cannot enable a feature or override an existing application setting. All environment values must be quoted strings. Upstream defaults are distinct from chart defaults. Environment overrides take precedence over persisted app configuration.

Sources: [target-version configuration](https://github.com/Sonarr/Sonarr/tree/v4.0.20.3014/src/NzbDrone.Common/Options), [full application comparison](https://github.com/Sonarr/Sonarr/compare/v4.0.17.2952...v4.0.20.3014).

| Environment variable | Upstream default when unset | Purpose |
| --- | --- | --- |
| `PUID` | wrapper user default; chart=3000 | Owner UID for writable config and media |
| `PGID` | wrapper group default; chart=3000 | Owner GID for writable config and media |
| `TZ` | chart=Asia/Kolkata | Container timezone |
| `UMASK` | 022 | Mask applied to newly created files |
| `SONARR__APP__INSTANCENAME` | Sonarr | App identity and UI: InstanceName |
| `SONARR__APP__THEME` | auto | App identity and UI: Theme |
| `SONARR__APP__LAUNCHBROWSER` | true | App identity and UI: LaunchBrowser |
| `SONARR__AUTH__APIKEY` | generated/persisted | Authentication: ApiKey Secret/sensitive: use an existing Secret. |
| `SONARR__AUTH__ENABLED` | false | Authentication: Enabled |
| `SONARR__AUTH__METHOD` | None (first-run setup required) | Authentication: Method |
| `SONARR__AUTH__REQUIRED` | Enabled | Authentication: Required |
| `SONARR__AUTH__TRUSTCGNATIPADDRESSES` | false | Authentication: TrustCgnatIpAddresses |
| `SONARR__LOG__LEVEL` | debug | Logging: Level |
| `SONARR__LOG__FILTERSENTRYEVENTS` | true | Logging: FilterSentryEvents |
| `SONARR__LOG__ROTATE` | 50 | Logging: Rotate |
| `SONARR__LOG__SIZELIMIT` | 1 | Logging: SizeLimit |
| `SONARR__LOG__SQL` | false | Logging: Sql |
| `SONARR__LOG__CONSOLELEVEL` | empty | Logging: ConsoleLevel |
| `SONARR__LOG__CONSOLEFORMAT` | Standard | Logging: ConsoleFormat |
| `SONARR__LOG__ANALYTICSENABLED` | true | Logging: AnalyticsEnabled |
| `SONARR__LOG__SYSLOGSERVER` | empty | Logging: SyslogServer |
| `SONARR__LOG__SYSLOGPORT` | 514 | Logging: SyslogPort |
| `SONARR__LOG__SYSLOGLEVEL` | inherits Log.Level | Logging: SyslogLevel |
| `SONARR__LOG__DBENABLED` | true | Logging: DbEnabled |
| `SONARR__POSTGRES__HOST` | empty (SQLite) | External PostgreSQL: Host |
| `SONARR__POSTGRES__PORT` | 5432 | External PostgreSQL: Port |
| `SONARR__POSTGRES__USER` | empty | External PostgreSQL: User |
| `SONARR__POSTGRES__PASSWORD` | empty | External PostgreSQL: Password Secret/sensitive: use an existing Secret. |
| `SONARR__POSTGRES__MAINDB` | sonarr-main | External PostgreSQL: MainDb |
| `SONARR__POSTGRES__LOGDB` | sonarr-log | External PostgreSQL: LogDb |
| `SONARR__SERVER__URLBASE` | empty | Listener/proxy/TLS: UrlBase |
| `SONARR__SERVER__BINDADDRESS` | * | Listener/proxy/TLS: BindAddress |
| `SONARR__SERVER__ALLOWEDHOSTS` | empty (any host) | Listener/proxy/TLS: AllowedHosts |
| `SONARR__SERVER__PORT` | 8989 | Listener/proxy/TLS: Port |
| `SONARR__SERVER__ENABLESSL` | false | Listener/proxy/TLS: EnableSsl |
| `SONARR__SERVER__SSLPORT` | 9898 | Listener/proxy/TLS: SslPort |
| `SONARR__SERVER__SSLCERTPATH` | empty | Listener/proxy/TLS: SslCertPath |
| `SONARR__SERVER__SSLCERTPASSWORD` | empty | Listener/proxy/TLS: SslCertPassword Secret/sensitive: use an existing Secret. |
| `SONARR__SERVER__TRUSTEDNETWORKS` | empty (loopback only) | Listener/proxy/TLS: TrustedNetworks |
| `SONARR__UPDATE__MECHANISM` | BuiltIn | Binary updater (keep image-managed): Mechanism |
| `SONARR__UPDATE__AUTOMATICALLY` | false on Linux | Binary updater (keep image-managed): Automatically |
| `SONARR__UPDATE__SCRIPTPATH` | empty | Binary updater (keep image-managed): ScriptPath |
| `SONARR__UPDATE__BRANCH` | main | Binary updater (keep image-managed): Branch |

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

[Image documentation](https://docs.linuxserver.io/images/docker-sonarr/) additionally supports the `FILE__<VARIABLE>` convention: mount a Secret file then set e.g. `env.FILE__SONARR__AUTH__APIKEY` to its absolute path. Base-image Docker Mods (`DOCKER_MODS`) and initialization hooks can change installed software/startup behavior; they are opt-in image extensions, not application settings, and must be reviewed separately. `UMASK` affects new files, not existing permissions; match PUID/PGID to writable storage. Build variables such as `BUILD_VERSION`, architecture and download URLs are image-build inputs, not chart runtime settings.

## Persisted settings and database

Download clients, indexers, quality profiles, root folders, notification scripts and API request/webhook fields are persisted app/UI/API settings, not arbitrary environment variables. The options table covers every property bound by the target `App`, `Auth`, `Server`, `Log`, `Update`, and `Postgres` option classes. The legacy Auth.Enabled switch maps authentication to Forms; prefer Auth.Method and Auth.Required. Keep binary updates image-managed; Update settings are listed for coverage and should not be used to update files inside the container.

The default database is image-bundled SQLite in `/config`; this chart embeds no database image and does not change an external database server. PostgreSQL is optional and requires separate main/log databases and its own backups. Refer to the [official PostgreSQL setup](https://wiki.servarr.com/sonarr/postgres-setup); no automatic SQLite-to-PostgreSQL conversion is performed. The external server major version and an upgrade against your data have not been live-tested by these static chart checks. Before updating an existing external deployment, check its major against upstream support and back it up. Restore a matching database backup when rolling back an application migration.

## Verified container build

The 4.0.20 amd64 image manifest identifies [wrapper source aee277b39f8f](https://github.com/linuxserver/docker-sonarr/tree/aee277b39f8f8e34eec5ccc9cb5a51a5d22d7bcf) and build `Linuxserver.io version:- 4.0.20.3014-ls329 Build-date:- 2026-10-15T18:57:33+00:00`. The public tag also provides arm64. These are registry metadata checks, not a live application/database migration test.
