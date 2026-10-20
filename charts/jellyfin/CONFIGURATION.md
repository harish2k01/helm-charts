# jellyfin runtime configuration

This chart passes the existing/new supported runtime options through the extensible `env` map; 17 documented names are listed below. Optional examples in `values.yaml` are commented so they cannot enable a feature or override an existing application setting. All environment values must be quoted strings. Upstream defaults are distinct from chart defaults. Environment overrides take precedence over persisted app configuration.

Sources: [target-version configuration](https://github.com/jellyfin/jellyfin/blob/v10.11.11/MediaBrowser.Controller/Extensions/ConfigurationExtensions.cs), [full application comparison](https://github.com/jellyfin/jellyfin/compare/v10.11.8...v10.11.11).

| Environment variable | Upstream default when unset | Purpose |
| --- | --- | --- |
| `PUID` | wrapper user default; chart=3000 | Owner UID for writable config and media |
| `PGID` | wrapper group default; chart=3000 | Owner GID for writable config and media |
| `TZ` | chart=Asia/Kolkata | Container timezone |
| `UMASK` | 022 | Mask applied to newly created files |
| `JELLYFIN_PublishedServerUrl` | unset | URL advertised by discovery; include scheme |
| `FFMPEG_PATH` | /usr/lib/jellyfin-ffmpeg/ffmpeg | LinuxServer wrapper binary override; custom path must exist |
| `JELLYFIN_DefaultRedirectPath` | web/ | Default web redirect path |
| `JELLYFIN_hostwebclient` | True | Serve bundled web client |
| `JELLYFIN_FFmpeg__probesize` | 1G | FFmpeg probing byte budget |
| `JELLYFIN_FFmpeg__analyzeduration` | 200M | FFmpeg analyze duration budget |
| `JELLYFIN_FFmpeg__novalidation` | False | Skip ffmpeg validation; normally leave false |
| `JELLYFIN_FFmpeg__imgExtractPerfTradeoff` | False | Image extraction performance tradeoff |
| `JELLYFIN_kestrel__socket` | False | Use Unix socket; requires deliberate Service/probe redesign |
| `JELLYFIN_kestrel__socketPath` | unset | Unix listener socket path |
| `JELLYFIN_kestrel__socketPermissions` | unset | Unix socket permission mode |
| `JELLYFIN_sqlite__cacheSize` | 20000 | SQLite cache size in pages |
| `JELLYFIN_DetectNetworkChange` | True | React to network interface changes |

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

[Image documentation](https://docs.linuxserver.io/images/docker-jellyfin/) additionally supports the `FILE__<VARIABLE>` convention: mount a Secret file then set e.g. `env.FILE__JELLYFIN_PublishedServerUrl` to its absolute path. Base-image Docker Mods (`DOCKER_MODS`) and initialization hooks can change installed software/startup behavior; they are opt-in image extensions, not application settings, and must be reviewed separately. `UMASK` affects new files, not existing permissions; match PUID/PGID to writable storage. Build variables such as `BUILD_VERSION`, architecture and download URLs are image-build inputs, not chart runtime settings.

## Wrapper-owned paths and app settings

The [LinuxServer startup script](https://github.com/linuxserver/docker-jellyfin/blob/master/root/etc/s6-overlay/s6-rc.d/svc-jellyfin/run) unconditionally sets `JELLYFIN_DATA_DIR=/config/data`, `JELLYFIN_CONFIG_DIR=/config`, `JELLYFIN_LOG_DIR=/config/log`, `JELLYFIN_CACHE_DIR=/config/cache`, and `JELLYFIN_WEB_DIR=/usr/share/jellyfin/web`. These upstream path names are therefore **not effective overrides** through this image; use the existing PVC/mount values. `FFMPEG_PATH` is the wrapper-supported ffmpeg override; it falls back unless the supplied file exists. `JELLYFIN_ENABLE_IIS` is Windows-specific and is not a Linux image feature. Broader ASP.NET/DOTNET debug/runtime switches are not app configuration. The source also accepts JSON configuration sections through `JELLYFIN_` with `__` separators; arbitrary XML system/encoding/library settings are managed in Jellyfin, not automatically bound env values. Device/transcoding/library/user/network settings remain app-owned. The embedded SQLite engine is provided by the image; no external database engine/image is configured by this chart.
