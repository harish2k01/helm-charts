# Changelog

## 0.1.3

### Application upgrade from v1.96.5 to v1.104.1

The intervening client and container releases include routing, DNS, security, connection recovery, and memory improvements. The container now supports `TS_BOOT_TIMEOUT`; set `tailscale.bootTimeout: "90s"` for slow control-plane connections and increase probe delays when necessary. Leave it empty to retain the upstream 60-second timeout. Do not also set `TS_BOOT_TIMEOUT` in `tailscale.extraEnv`.

The chart keeps PVC-backed state and explicitly renders an empty `TS_KUBE_SECRET`, which the target image still supports as disabling Kubernetes Secret state storage. Existing auth, routing, health (`/healthz`), metrics, and kernel-networking settings remain supported. No operator CRDs are installed by this chart; upstream operator-only features need the separate Tailscale operator. For custom Serve configurations, review the target release's interface-binding behavior and use `tailscale.extraEnv` for supported optional container variables.

Sources: [client/container changelog](https://tailscale.com/changelog), [complete source comparison](https://github.com/tailscale/tailscale/compare/v1.96.5...v1.104.1), and [container environment parsing](https://github.com/tailscale/tailscale/blob/v1.104.1/cmd/containerboot/settings.go).

### Runtime configuration coverage

Audit the target containerboot environment parser and wrapper documentation, covering both existing and newly supported variables. `values.yaml` now includes commented proxy, Serve, diagnostics, forwarding, auth and Secret-reference examples, and distinguishes chart-generated variables from operator-only, deprecated, internal/test and build-only settings. `authKey.enabled` defaults to true; setting it false omits the otherwise mandatory auth-key Secret reference so optional OAuth or workload identity can work through `extraEnv`/`envFrom`. Normal auth-key installations keep their previous manifests. The chart keeps persistent Tailscale identity/state; no external database server or schema migration is involved.

[Target containerboot contract](https://github.com/tailscale/tailscale/blob/v1.104.1/cmd/containerboot/main.go) documents authentication mutual exclusions and operator-only modes.
