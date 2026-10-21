# Changelog

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
