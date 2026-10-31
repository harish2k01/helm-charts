# Changelog

## 0.3.1 - 2026-11-01

- Use `/ping` for default liveness and readiness probes to avoid login redirects and repeated kubelet `ProbeWarning` events.
- Preserve `Host: localhost` for deployments with hostname allowlists. Application versions and probe timing are unchanged.

## 0.2.0 - 2026-10-21

### Application changes

New hostname validation and trusted proxy settings affect reverse proxies. Configure `env.SONARR__SERVER__ALLOWEDHOSTS` with the externally used hostname and service DNS names (no scheme or port), and `env.SONARR__SERVER__TRUSTEDNETWORKS` with only your actual ingress/controller source CIDRs. Empty trusted networks now trust loopback only; forwarded client/protocol headers from ingress are otherwise ignored. No cluster CIDR is assumed. The chart sends `Host: localhost` in HTTP health probes so enabling an allowlist does not reject kubelet's pod-IP Host header.

qBittorrent API/auth compatibility and integration fixes are app-level settings. Configure new download clients, external IDs, search/filter features and indexers in the app; the chart preserves existing `/config`, ports, media mounts and LinuxServer PUID/PGID. Never update the binary using the app's in-container updater.

Example (replace the documentation CIDR and names with your actual proxy and hosts):

```yaml
env:
  SONARR__SERVER__ALLOWEDHOSTS: "sonarr.example.com,sonarr,sonarr.default.svc.cluster.local"
  SONARR__SERVER__TRUSTEDNETWORKS: "192.0.2.0/24"
envFrom:
  - secretRef:
      name: sonarr-database
```

Reviewed upstream release sequence: [v4.0.18.2971](https://github.com/Sonarr/Sonarr/releases/tag/v4.0.18.2971), [v4.0.19.2979](https://github.com/Sonarr/Sonarr/releases/tag/v4.0.19.2979), [v4.0.20.3014](https://github.com/Sonarr/Sonarr/releases/tag/v4.0.20.3014).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-sonarr/).

Configuration/source review: [full comparison](https://github.com/Sonarr/Sonarr/compare/v4.0.17.2952...v4.0.20.3014). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.

### Chart changes

- Pin image/app metadata and image annotation consistently to 4.0.20; refresh schema defaults, chart install examples, repository table and generated catalog.
- Add a complete runtime configuration reference and commented opt-in values, including existing and newly introduced settings; preserve application-owned configuration.
- Support existing Secrets/ConfigMaps through optional envFrom without creating credentials.
- Set the health-probe Host header to localhost so explicit host allowlists do not reject kubelet probes.

Validation: Helm lint, default rendering, optional configuration/Secret rendering, schema checks and generated-catalog tests. No production workload was modified or live database migration performed.
