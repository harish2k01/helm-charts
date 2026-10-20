# Changelog

## 0.1.3

### Application upgrade from v0.107.76 to v0.107.79

Review all three intervening patch releases: v0.107.77 fixes GLiNET-mode authorization and adds the query-log `reason` API filter; v0.107.78 hardens DNS transports and rule-list downloads; v0.107.79 hardens DNS-over-QUIC, supports bootstrap-server comments and installer language, and deprecates `tls.strict_sni_check`. The query-log `response_status` parameter is deprecated in favor of `reason`. These HTTP API fields do not require Kubernetes environment variables.

**Large filter lists:** downloads now default to a 256 MB limit. If an existing rule list exceeds that size, set `filtering.max_http_size` in the persisted `AdGuardHome.yaml` to a suitable nonzero size before refreshing the list. The upstream examples accept sizes such as `1 GB`. Filter update intervals can now be any integer from 0 through 8760 hours.

The application owns and rewrites `/opt/adguardhome/conf/AdGuardHome.yaml` on the writable configuration PVC. Stop the application before editing this file directly, preserve the rest of the file, and restart afterward; a read-only ConfigMap mounted over it is unsuitable. For example, the relevant application configuration is:

```yaml
filtering:
  max_http_size: 1 GB
  filters_update_interval: 24
```

Back up the work and conf PVC subdirectories before upgrading. Existing mounts, DNS Service ports, setup port 3000, optional encrypted-DNS ports, and command/args hooks remain compatible. The stable image tag does not opt into the separate upstream `edge` UI/versioning channel. If the admin UI was moved off port 3000 during setup, keep `containerPorts`, `service.ports`, and probe ports aligned with the configured address.

Sources: [full intervening changelog](https://github.com/AdguardTeam/AdGuardHome/blob/v0.107.79/CHANGELOG.md), [source comparison](https://github.com/AdguardTeam/AdGuardHome/compare/v0.107.76...v0.107.79), [filter-list size default](https://github.com/AdguardTeam/AdGuardHome/blob/v0.107.79/internal/filtering/rulelist/rulelist.go), and [application configuration](https://github.com/AdguardTeam/AdGuardHome/blob/v0.107.79/internal/home/config.go).

### Runtime configuration coverage

Audit all target CLI options and environment reads plus the image entrypoint/CMD and application configuration structs. The only application-specific production environment variable is the install-wizard suggested web port; the test-update URL is development-only. Values comments now document this distinction, complete argument replacement semantics, runtime/deprecated/one-shot flags, persisted application settings, and certificate Secret mounts. The chart does not replace application-managed YAML or introduce environment aliases for its config fields. The compared tags have no changes under `internal/configmigrate`; no external SQL database is deployed and the existing work/config data paths remain unchanged. Back up both subdirectories before rollout.

Sources: [runtime options](https://github.com/AdguardTeam/AdGuardHome/blob/v0.107.79/internal/home/options.go), [environment reads](https://github.com/AdguardTeam/AdGuardHome/blob/v0.107.79/internal/home/home.go), [image entrypoint](https://github.com/AdguardTeam/AdGuardHome/blob/v0.107.79/docker/build.Dockerfile), and [application-owned configuration](https://github.com/AdguardTeam/AdGuardHome/blob/v0.107.79/internal/home/config.go).
