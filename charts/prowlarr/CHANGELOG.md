# Changelog

## 0.3.1 - 2026-11-01

- Use `/ping` for default liveness and readiness probes to avoid login redirects and repeated kubelet `ProbeWarning` events.
- Preserve `Host: localhost` for deployments with hostname allowlists. Application versions and probe timing are unchanged.

## 0.2.0 - 2026-10-21

### Application changes

New hostname validation and trusted proxy settings affect reverse proxies. Configure `env.PROWLARR__SERVER__ALLOWEDHOSTS` with the externally used hostname and service DNS names (no scheme or port), and `env.PROWLARR__SERVER__TRUSTEDNETWORKS` with only your actual ingress/controller source CIDRs. Empty trusted networks now trust loopback only; forwarded client/protocol headers from ingress are otherwise ignored. No cluster CIDR is assumed. The chart sends `Host: localhost` in HTTP health probes so enabling an allowlist does not reject kubelet's pod-IP Host header.

PostgreSQL connection strings are newly available through `PROWLARR__POSTGRES__MAINDBCONNECTIONSTRING` and `PROWLARR__POSTGRES__LOGDBCONNECTIONSTRING`; put credentials in an existing Secret and reference it with `envFrom`. Existing SQLite/PVC deployments remain unchanged. qBittorrent API/auth compatibility and integration fixes are app-level settings. Configure new download clients, external IDs, search/filter features and indexers in the app; the chart preserves existing `/config`, ports, media mounts and LinuxServer PUID/PGID. Never update the binary using the app's in-container updater.

Example (replace the documentation CIDR and names with your actual proxy and hosts):

```yaml
env:
  PROWLARR__SERVER__ALLOWEDHOSTS: "prowlarr.example.com,prowlarr,prowlarr.default.svc.cluster.local"
  PROWLARR__SERVER__TRUSTEDNETWORKS: "192.0.2.0/24"
envFrom:
  - secretRef:
      name: prowlarr-database
```

Reviewed upstream release sequence: [v2.4.0.5397](https://github.com/Prowlarr/Prowlarr/releases/tag/v2.4.0.5397), [v2.5.2.5491](https://github.com/Prowlarr/Prowlarr/releases/tag/v2.5.2.5491), [v2.6.5.5623](https://github.com/Prowlarr/Prowlarr/releases/tag/v2.6.5.5623).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-prowlarr/).

Configuration/source review: [full comparison](https://github.com/Prowlarr/Prowlarr/compare/v2.3.5.5327...v2.6.5.5623). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.

### Chart changes

- Pin image/app metadata and image annotation consistently to 2.6.5; refresh schema defaults, chart install examples, repository table and generated catalog.
- Add a complete runtime configuration reference and commented opt-in values, including existing and newly introduced settings; preserve application-owned configuration.
- Support existing Secrets/ConfigMaps through optional envFrom without creating credentials.
- Set the health-probe Host header to localhost so explicit host allowlists do not reject kubelet probes.

Validation: Helm lint, default rendering, optional configuration/Secret rendering, schema checks and generated-catalog tests. No production workload was modified or live database migration performed.
