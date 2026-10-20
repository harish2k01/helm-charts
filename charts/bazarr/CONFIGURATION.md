# bazarr runtime configuration

This chart passes the existing/new supported runtime options through the extensible `env` map; 14 documented names are listed below. Optional examples in `values.yaml` are commented so they cannot enable a feature or override an existing application setting. All environment values must be quoted strings. Upstream defaults are distinct from chart defaults. Environment overrides take precedence over persisted app configuration.

Sources: [target-version configuration](https://github.com/morpheus65535/bazarr/blob/v1.6.2/bazarr/app/database.py), [full application comparison](https://github.com/morpheus65535/bazarr/compare/v1.5.6...v1.6.2).

| Environment variable | Upstream default when unset | Purpose |
| --- | --- | --- |
| `PUID` | wrapper user default; chart=3000 | Owner UID for writable config and media |
| `PGID` | wrapper group default; chart=3000 | Owner GID for writable config and media |
| `TZ` | chart=Asia/Kolkata | Container timezone |
| `UMASK` | 022 | Mask applied to newly created files |
| `BAZARR_CONFIG_BASE_FILE_PATH` | /config/config | Directory containing config.yaml/config.ini; other DB paths stay under /config |
| `POSTGRES_ENABLED` | config: postgresql.enabled=false | Use external PostgreSQL instead of SQLite |
| `POSTGRES_HOST` | config: localhost | External database hostname |
| `POSTGRES_PORT` | config: 5432 | External PostgreSQL port |
| `POSTGRES_DATABASE` | config: empty | External database name |
| `POSTGRES_USERNAME` | config: empty | External database username from Secret Secret/sensitive: use an existing Secret. |
| `POSTGRES_PASSWORD` | config: empty | External database password from Secret Secret/sensitive: use an existing Secret. |
| `POSTGRES_URL` | config: empty | PostgreSQL URL; individual fields override URL components Secret/sensitive: use an existing Secret. |
| `NO_UPDATE` | false (wrapper passes --no-update) | Internal argument-parser updater toggle; image must manage updates |
| `NO_CLI` | false | Disables CLI parsing; leave unset with the LinuxServer startup command |

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

[Image documentation](https://docs.linuxserver.io/images/docker-bazarr/) additionally supports the `FILE__<VARIABLE>` convention: mount a Secret file then set e.g. `env.FILE__POSTGRES_PASSWORD` to its absolute path. Base-image Docker Mods (`DOCKER_MODS`) and initialization hooks can change installed software/startup behavior; they are opt-in image extensions, not application settings, and must be reviewed separately. `UMASK` affects new files, not existing permissions; match PUID/PGID to writable storage. Build variables such as `BUILD_VERSION`, architecture and download URLs are image-build inputs, not chart runtime settings.

## Persisted app configuration and database

[Bazarr target config validators](https://github.com/morpheus65535/bazarr/blob/v1.6.2/bazarr/app/config.py) define the persisted configuration, including new Jellyfin integration, provider credentials, Whisper fallback, language equivalence, subtitle quality and Gemini key rotation. Set these through the UI/config file, not invented BAZARR_* variables. Only `BAZARR_CONFIG_BASE_FILE_PATH` changes the base config directory; it does not relocate the SQLite database or logs from `/config`. `POSTGRES_*` overrides are read by the database module; URL components supplied separately take precedence. Default SQLite is image-owned and no database image is deployed. Upstream does not publish a complete PostgreSQL version matrix here; an external server and migrated data must be checked separately before use. Existing config data is retained; this chart does not switch engines or perform data export/import. The LinuxServer startup command passes `--no-update --config /config`; changing NO_CLI would bypass that explicit path and should be avoided.
