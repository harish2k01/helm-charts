# qbittorrent runtime configuration

This chart passes the existing/new supported runtime options through the extensible `env` map; 6 documented names are listed below. Optional examples in `values.yaml` are commented so they cannot enable a feature or override an existing application setting. All environment values must be quoted strings. Upstream defaults are distinct from chart defaults. Environment overrides take precedence over persisted app configuration.

Sources: [target-version configuration](https://docs.linuxserver.io/images/docker-qbittorrent/), [full application comparison](https://github.com/qbittorrent/qBittorrent/compare/release-5.2.0...release-5.2.4).

| Environment variable | Upstream default when unset | Purpose |
| --- | --- | --- |
| `PUID` | wrapper user default; chart=3000 | Owner UID for writable config and media |
| `PGID` | wrapper group default; chart=3000 | Owner GID for writable config and media |
| `TZ` | chart=Asia/Kolkata | Container timezone |
| `UMASK` | 022 | Mask applied to newly created files |
| `WEBUI_PORT` | 8080 | Web UI/API listener; match Service targetPort |
| `TORRENTING_PORT` | 6881 | Peer TCP/UDP listener; match extra container/Service ports |

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

[Image documentation](https://docs.linuxserver.io/images/docker-qbittorrent/) additionally supports the `FILE__<VARIABLE>` convention: mount a Secret file then set e.g. `env.FILE__WEBUI_PORT` to its absolute path. Base-image Docker Mods (`DOCKER_MODS`) and initialization hooks can change installed software/startup behavior; they are opt-in image extensions, not application settings, and must be reviewed separately. `UMASK` affects new files, not existing permissions; match PUID/PGID to writable storage. Build variables such as `BUILD_VERSION`, architecture and download URLs are image-build inputs, not chart runtime settings.

## App settings and database

The LinuxServer image exposes WEBUI_PORT and TORRENTING_PORT as its application-specific environment interface. Download behavior, proxy settings, authentication, CSRF/host validation, categories, RSS and WebAPI request fields are persisted qBittorrent settings (`/config/qBittorrent/qBittorrent.conf`) or API/UI inputs; setting env.QBITTORRENT_* does not configure them. Preserve writable `/config` plus download mounts and session/resume state. The app owns its SQLite/session format; no external PostgreSQL/MySQL database image is embedded. Configuring another WebUI port requires matching env, container/Service target and probes. Peer TCP/UDP Service exposure is optional and must match TORRENTING_PORT.

## Verified container build

The 5.2.4 amd64 image manifest identifies [wrapper source d68e3a4df919](https://github.com/linuxserver/docker-qbittorrent/tree/d68e3a4df919ebdd59940aa423e0acacc851ba21) and build `Linuxserver.io version:- 5.2.4_v2.0.15-ls481 Build-date:- 2026-10-18T11:49:47+00:00`. The public tag also provides arm64. These are registry metadata checks, not a live application/database migration test.
