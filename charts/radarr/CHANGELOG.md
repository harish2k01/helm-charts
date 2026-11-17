# Changelog

## 0.4.0

### Application changes

Radarr 6.4.4 → 7.0.3 is a major upgrade. Back up `/config` (or take a Radarr backup) before upgrading.

- The application now runs on .NET 10 ([v7.0.0.10815](https://github.com/Radarr/Radarr/releases/tag/v7.0.0.10815)). Update only by changing the image; do not use the in-app updater.
- Database migration 243 rewrites stored media info for every movie file to support multiple audio and subtitle streams, and resets movie metadata refresh times so the next refresh re-reads metadata ([migration source](https://github.com/Radarr/Radarr/blob/v7.0.3.10918/src/NzbDrone.Core/Datastore/Migration/243_mediainfo_multiple_streams.cs), [v7.0.1.10859](https://github.com/Radarr/Radarr/releases/tag/v7.0.1.10859)). The migration is one-way: rolling back to 6.x requires restoring the pre-upgrade `/config` backup or volume snapshot. First startup can take longer on large libraries.
- External PostgreSQL databases must be version 15 or newer ([MigrationController](https://github.com/Radarr/Radarr/blob/v7.0.3.10918/src/NzbDrone.Core/Datastore/Migration/Framework/MigrationController.cs)). SQLite installs are unaffected.
- New authentication options: OIDC login (`Auth.Method=Oidc` with `OidcAuthority`, `OidcClientId`, `OidcClientSecret`, `OidcUserIdentifier`, `OidcScopes`) and `Auth.Required=DisabledForLocalhost`. Forms login redirects were fixed.
- PEM certificates are supported for app-native HTTPS through the new `Server.SslKeyPath` setting.
- The API stays at v3. Media info responses gain `audioStreams` and `subtitleStreams`; existing fields remain. Kometa metadata support was removed ([v7.0.2.10888](https://github.com/Radarr/Radarr/releases/tag/v7.0.2.10888)).
- Other notable changes: Trakt Smart List import list, full Transmission label support, Ntfy custom headers, Happy Eyeballs HTTP connections, and import fixes ([v7.0.3.10918](https://github.com/Radarr/Radarr/releases/tag/v7.0.3.10918)).

The LinuxServer container wrapper is unchanged apart from bundled package versions ([docker-radarr comparison](https://github.com/linuxserver/docker-radarr/compare/6.4.4.10685-ls327...7.0.3.10918-ls328)); `/config`, port 7878, PUID/PGID handling and the amd64/arm64 image platforms are unchanged.

### Chart changes

- Default image is `lscr.io/linuxserver/radarr:7.0.3`.
- Document opt-in OIDC (`RADARR__AUTH__OIDC*`), `RADARR__AUTH__REQUIRED=DisabledForLocalhost` and `RADARR__SERVER__SSLKEYPATH` settings in `values.yaml` and `CONFIGURATION.md`. All are commented out; put `RADARR__AUTH__OIDCCLIENTSECRET` in an existing Secret referenced through `envFrom`.
- The Deployment keeps the `Recreate` strategy so the old and new versions never open the same `/config` database together.

## 0.3.2

### Chart changes

Add a link to the web chart catalog near the top of the README. Application versions and workload configuration are unchanged.

## 0.3.1 - 2026-11-01

- Use `/ping` for default liveness and readiness probes to avoid login redirects and repeated kubelet `ProbeWarning` events.
- Preserve `Host: localhost` for deployments with hostname allowlists. Application versions and probe timing are unchanged.

## 0.2.0 - 2026-10-21

### Application changes

New hostname validation and trusted proxy settings affect reverse proxies. Configure `env.RADARR__SERVER__ALLOWEDHOSTS` with the externally used hostname and service DNS names (no scheme or port), and `env.RADARR__SERVER__TRUSTEDNETWORKS` with only your actual ingress/controller source CIDRs. Empty trusted networks now trust loopback only; forwarded client/protocol headers from ingress are otherwise ignored. No cluster CIDR is assumed. The chart sends `Host: localhost` in HTTP health probes so enabling an allowlist does not reject kubelet's pod-IP Host header.

PostgreSQL connection strings are newly available through `RADARR__POSTGRES__MAINDBCONNECTIONSTRING` and `RADARR__POSTGRES__LOGDBCONNECTIONSTRING`; put credentials in an existing Secret and reference it with `envFrom`. Existing SQLite/PVC deployments remain unchanged. qBittorrent API/auth compatibility and integration fixes are app-level settings. Configure new download clients, external IDs, search/filter features and indexers in the app; the chart preserves existing `/config`, ports, media mounts and LinuxServer PUID/PGID. Never update the binary using the app's in-container updater.

Example (replace the documentation CIDR and names with your actual proxy and hosts):

```yaml
env:
  RADARR__SERVER__ALLOWEDHOSTS: "radarr.example.com,radarr,radarr.default.svc.cluster.local"
  RADARR__SERVER__TRUSTEDNETWORKS: "192.0.2.0/24"
envFrom:
  - secretRef:
      name: radarr-database
```

Reviewed upstream release sequence: [v6.2.1.10461](https://github.com/Radarr/Radarr/releases/tag/v6.2.1.10461), [v6.3.0.10514](https://github.com/Radarr/Radarr/releases/tag/v6.3.0.10514), [v6.4.4.10685](https://github.com/Radarr/Radarr/releases/tag/v6.4.4.10685).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-radarr/).

### Chart changes

- Pin image/app metadata and image annotation consistently to 6.4.4; refresh schema defaults, chart install examples, repository table and generated catalog.
- Add a complete runtime configuration reference and commented opt-in values, including existing and newly introduced settings; preserve application-owned configuration.
- Support existing Secrets/ConfigMaps through optional envFrom without creating credentials.
- Set the health-probe Host header to localhost so explicit host allowlists do not reject kubelet probes.

Validation: Helm lint, default rendering, optional configuration/Secret rendering, schema checks and generated-catalog tests. No production workload was modified or live database migration performed.
