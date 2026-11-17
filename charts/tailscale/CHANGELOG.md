# Changelog

## 0.1.9

### Application changes

v1.104.4 → v1.104.7 is a patch series ([changelog](https://tailscale.com/changelog), [v1.104.5](https://github.com/tailscale/tailscale/releases/tag/v1.104.5), [v1.104.6](https://github.com/tailscale/tailscale/releases/tag/v1.104.6), [v1.104.7](https://github.com/tailscale/tailscale/releases/tag/v1.104.7), [source diff](https://github.com/tailscale/tailscale/compare/v1.104.4...v1.104.7)):

- v1.104.5: Tailscale SSH session lifecycle fixes, randomized DNS query IDs, magicsock UDP read fixes. Userspace netstack TCP now disables RACK loss detection by default; `TS_NETSTACK_ENABLE_RACK=true` re-enables it (only relevant with `tailscale.userspace=true`).
- v1.104.6: wireguard-go duplicate handshake fix, magicsock retries UDP reads on `EADDRNOTAVAIL`.
- v1.104.7: Go 1.27.4; Kubernetes operator API proxy WhoIs fix (operator only).

No `cmd/containerboot` changes: `TS_*` container variables, ports, health/metrics endpoints, state path and entrypoint are unchanged. Rollback to v1.104.4 keeps the same state format.

### Chart changes

Align image, appVersion, Artifact Hub metadata and catalog; document the `TS_NETSTACK_ENABLE_RACK` opt-in as a commented `extraEnv` example. BusyBox init image is unchanged.


## 0.1.8

### Chart changes

Add a link to the web chart catalog near the top of the README. Application versions and workload configuration are unchanged.

## 0.1.7

### Chart changes

Add optional host networking with automatic `ClusterFirstWithHostNet` DNS policy and validated explicit DNS overrides. Reject `None` because `dnsConfig` is not exposed. Required hostname anti-affinity separates host-network Tailscale pods across releases and namespaces while preserving user affinity rules; excess replicas remain Pending. Normal pod networking remains the default. Application and init-container image versions are unchanged.

## 0.1.6

### Application changes

v1.104.1 → v1.104.4 brings SSH and Serve hardening. Container boot settings, persistent state and subnet configuration retain their current chart wiring.

Source: [upstream changes](https://github.com/tailscale/tailscale/compare/v1.104.1...v1.104.4).

### Chart changes

Align the image, chart metadata, values schema and catalog. Existing deployment options, persistence and datastore images are unchanged.

## 0.1.5

### Application changes

None. Application, database and init-image versions are unchanged.

### Chart changes

Use stable identity labels in StatefulSet claim templates instead of chart/app-version labels. Add the documented persistence.claimTemplateLabels maps (under each affected component's persistence settings) for deterministic preservation of existing immutable template labels. Existing installations must pin their current labels before the first upgrade; simply removing historical labels is also an immutable change. No StatefulSet/PVC replacement or database migration is performed. Regression tests compare complete claim templates across simulated chart/app version upgrades and verify legacy-label overrides.

## 0.1.4 — BusyBox 1.38.0

### App changes

The init image is pinned to BusyBox 1.38.0 (previously 1.37). [Upstream release notes](https://busybox.net/) explicitly label 1.38.0 **unstable**; review this release status before production use. [Official image metadata](https://github.com/docker-library/official-images/blob/master/library/busybox) confirms the version and architectures. This update does not change the application image beyond the prerequisite app/dependency PR.

Reviewed all 1.38 release notes and the init script: it uses sh -ec and sysctl -w for the existing IPv4/IPv6 forwarding keys. No new environment variable or sysctl key is required. The init container retains its existing privilege and enable/disable controls. New ash restrictions do not affect these commands.

### Chart changes

Merge Tailscale PR #47 before BusyBox PR #19. PR #19 includes both prerequisites and uses distinct chart versions to avoid publishing two different packages under the same version. Its GitHub Actions smoke job runs both charts' actual rendered init scripts in isolated Linux containers, including copy/preserve-existing-file behavior and both forwarding keys. Helm rendering alone does not prove shell behavior; check that job before merging. Existing production data and nodes are not touched by that smoke test.

## 0.1.3

### Application upgrade from v1.96.5 to v1.104.1

The intervening client and container releases include routing, DNS, security, connection recovery, and memory improvements. The container now supports `TS_BOOT_TIMEOUT`; set `tailscale.bootTimeout: "90s"` for slow control-plane connections and increase probe delays when necessary. Leave it empty to retain the upstream 60-second timeout. Do not also set `TS_BOOT_TIMEOUT` in `tailscale.extraEnv`.

The chart keeps PVC-backed state and explicitly renders an empty `TS_KUBE_SECRET`, which the target image still supports as disabling Kubernetes Secret state storage. Existing auth, routing, health (`/healthz`), metrics, and kernel-networking settings remain supported. No operator CRDs are installed by this chart; upstream operator-only features need the separate Tailscale operator. For custom Serve configurations, review the target release's interface-binding behavior and use `tailscale.extraEnv` for supported optional container variables.

Sources: [client/container changelog](https://tailscale.com/changelog), [complete source comparison](https://github.com/tailscale/tailscale/compare/v1.96.5...v1.104.1), and [container environment parsing](https://github.com/tailscale/tailscale/blob/v1.104.1/cmd/containerboot/settings.go).

### Runtime configuration coverage

Audit the target containerboot environment parser and wrapper documentation, covering both existing and newly supported variables. `values.yaml` now includes commented proxy, Serve, diagnostics, forwarding, auth and Secret-reference examples, and distinguishes chart-generated variables from operator-only, deprecated, internal/test and build-only settings. `authKey.enabled` defaults to true; setting it false omits the otherwise mandatory auth-key Secret reference so optional OAuth or workload identity can work through `extraEnv`/`envFrom`. Normal auth-key installations keep their previous manifests. The chart keeps persistent Tailscale identity/state; no external database server or schema migration is involved.

[Target containerboot contract](https://github.com/tailscale/tailscale/blob/v1.104.1/cmd/containerboot/main.go) documents authentication mutual exclusions and operator-only modes.
