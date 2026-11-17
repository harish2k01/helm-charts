# Changelog

## 0.2.3

### Application changes

2026.10.7 → 2026.11.1 ([2026.11.0](https://github.com/cloudflare/cloudflared/releases/tag/2026.11.0), [2026.11.1](https://github.com/cloudflare/cloudflared/releases/tag/2026.11.1), [RELEASE_NOTES](https://github.com/cloudflare/cloudflared/blob/2026.11.1/RELEASE_NOTES), [source diff](https://github.com/cloudflare/cloudflared/compare/2026.10.7...2026.11.1)):

- 2026.11.0, VULN-170057: when ingress has Access-protected rules and path normalization is enabled, rule matching strips matrix (`;param`) segments and also checks an alternate decode order, so a crafted path cannot match an earlier unprotected rule and bypass Access. Only rule matching changes; the request sent to the origin is not modified. Go 1.27.4.
- 2026.11.1, TUN-11062: when the edge signals an account region change, the connector restarts its whole HA connection group instead of treating it as a failure. Quick tunnels may fall back to HTTP/2. OpenTelemetry 1.47.0 (VULN-187395). Distroless base image refreshed (still `nonroot`).

No new or renamed runtime flags/environment variables, ports, metrics/readiness endpoints, container user or entrypoint changes. Rolling back to 2026.10.7 needs no migration, but you lose the security fixes.

### Chart changes

Align image, appVersion, Artifact Hub metadata, schema/README defaults and catalog. Workload configuration is unchanged.


## 0.2.2

### Chart changes

Add a link to the web chart catalog near the top of the README. Application versions and workload configuration are unchanged.

## 0.2.1

### Application changes

2026.10.2 → 2026.10.7 hardens metrics debug paths, supports stdin for config validation, adjusts container auto-update defaults and fixes an HTTP/2 stream regression. Preserve explicit chart arguments, edge configuration and Secret references.

Source: [upstream changes](https://github.com/cloudflare/cloudflared/compare/2026.10.2...2026.10.7).

### Chart changes

Render an explicit --no-autoupdate=false when requested, since the target image exports NO_AUTOUPDATE=true. Existing true mode and other options are preserved.

## 0.2.0

- Update cloudflared from 2026.3.0 to 2026.10.2 and synchronize image/app/schema/catalog metadata.
- Review every intervening release in upstream RELEASE_NOTES and the complete source comparison, including dependency/security updates, diagnostic prechecks, TLS/PQ changes, QUIC upgrades, service token-file handling, protected Quick Tunnels, diagnostics, and ingress matching.
- **Edge address family:** upstream changes the default from IPv4 to auto. On IPv4-only paths, explicitly set cloudflared.extraEnv.TUNNEL_EDGE_IP_VERSION to "4" before rollout. Optional examples remain commented so existing remote or environment configuration is not silently overridden.
- **Access path matching:** target source provides TUNNEL_DISABLE_PATH_NORMALIZATION but defaults it to true. Set the variable to "false" to enable canonicalization before Access ingress-rule matching; verify unusual encoded/dot-segment paths against your Access rules. The forwarded origin request path is not rewritten. The chart does not silently alter this upstream default.
- Connectivity prechecks run asynchronously and do not gate tunnel startup. They can be skipped with TUNNEL_NO_PRECHECKS=true. New diagnostic routes and blocking /debug/pprof/cmdline do not change the existing /ready health path or metrics port.
- The Linux/macOS/Windows installed-service switch to token files does not require this container chart to change its existing Secret-backed TUNNEL_TOKEN. That variable takes precedence over token files and credential JSON.
- Transport log-level flags are now deprecated no-ops. Legacy stdin-control was removed. Some obsolete tunnel metrics were removed; check custom alerts using cloudflared_tunnel_tunnel_rpc_fail or cloudflared_tunnel_max_concurrent_requests_per_tunnel. This chart does not install such alerts.
- Preserve token Secrets, remotely managed ingress, existing command construction, metrics Service and pod security settings. Protected Quick Tunnel --allowed-mail is a separate mode and is not enabled for existing token-managed named tunnels. No database is deployed or migrated.
- Document supported runtime transport/origin/logging overrides, alternate/deprecated/subcommand-only settings, Secret references, and build-only variables as comments in values.yaml. CLI-generated logLevel/metrics/noAutoupdate settings take precedence over equivalent environment values.

Sources: [release history](https://github.com/cloudflare/cloudflared/blob/2026.10.2/RELEASE_NOTES), [breaking changes](https://github.com/cloudflare/cloudflared/blob/2026.10.2/CHANGES.md), [complete source comparison](https://github.com/cloudflare/cloudflared/compare/2026.3.0...2026.10.2), [runtime flag definitions](https://github.com/cloudflare/cloudflared/blob/2026.10.2/cmd/cloudflared/tunnel/cmd.go), [authentication precedence](https://github.com/cloudflare/cloudflared/blob/2026.10.2/cmd/cloudflared/tunnel/subcommands.go), and [Access path matching](https://github.com/cloudflare/cloudflared/blob/2026.10.2/ingress/ingress.go).
