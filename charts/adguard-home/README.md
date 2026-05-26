# AdGuard Home Helm Chart

This chart deploys [AdGuard Home](https://github.com/AdguardTeam/AdGuardHome) using the official container image, with persistent work and configuration storage, DNS service ports, and optional Ingress or Gateway API HTTPRoute access for the web UI.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install adguard-home harish2k01/adguard-home
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install adguard-home oci://ghcr.io/harish2k01/helm-charts/adguard-home --version 0.1.1
```

## First Run

The default service exposes TCP `3000` for initial setup/admin UI and TCP/UDP `53` for DNS.

```bash
kubectl -n default port-forward svc/adguard-home 3000:3000
```

Then open `http://127.0.0.1:3000/`.

## Expose DNS

Use a `LoadBalancer` service when clients outside the cluster should use AdGuard Home as a DNS resolver.

```yaml
service:
  type: LoadBalancer
  externalTrafficPolicy: Local
  annotations:
    metallb.universe.tf/loadBalancerIPs: 192.168.1.53
```

## Optional Ports

Add matching `service.ports` and `containerPorts` entries for optional AdGuard Home features such as the post-setup admin UI on port `80`, DNS-over-TLS, DNS-over-QUIC, DNSCrypt, or DHCP.

```yaml
service:
  ports:
    - name: http
      port: 80
      targetPort: http
      protocol: TCP
    - name: dns-tcp
      port: 53
      targetPort: dns-tcp
      protocol: TCP
    - name: dns-udp
      port: 53
      targetPort: dns-udp
      protocol: UDP
    - name: dot
      port: 853
      targetPort: dot
      protocol: TCP

containerPorts:
  - name: http
    containerPort: 80
    protocol: TCP
  - name: dns-tcp
    containerPort: 53
    protocol: TCP
  - name: dns-udp
    containerPort: 53
    protocol: UDP
  - name: dot
    containerPort: 853
    protocol: TCP

livenessProbe:
  tcpSocket:
    port: http

readinessProbe:
  tcpSocket:
    port: http
```

## Install With Gateway API HTTPRoute

```yaml
httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - adguard.example.com
```

## Install With Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: adguard.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: adguard-home-tls
      hosts:
        - adguard.example.com
```

## Persistence

The official image uses separate work and configuration directories. By default, the chart creates one PVC for each directory.

```yaml
persistence:
  work:
    enabled: true
    size: 2Gi
  conf:
    enabled: true
    size: 1Gi
```

To store both directories in one PVC, enable shared persistence. The `work.subPath` and `conf.subPath` directories are created inside the shared claim by Kubernetes when mounted.

```yaml
persistence:
  shared:
    enabled: true
    size: 3Gi
  work:
    enabled: true
    subPath: work
  conf:
    enabled: true
    subPath: conf
```

To reuse existing PVCs:

```yaml
persistence:
  work:
    enabled: true
    existingClaim: adguard-home-work
  conf:
    enabled: true
    existingClaim: adguard-home-conf
```

To reuse one existing PVC:

```yaml
persistence:
  shared:
    enabled: true
    existingClaim: adguard-home-data
  work:
    enabled: true
    subPath: work
  conf:
    enabled: true
    subPath: conf
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of AdGuard Home replicas |
| `image.repository` | string | `adguard/adguardhome` | Container image repository |
| `image.tag` | string | `v0.107.76` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.annotations` | object | `{}` | Service annotations |
| `service.externalTrafficPolicy` | string | `""` | External traffic policy for NodePort or LoadBalancer services |
| `service.ports` | list | HTTP setup and DNS ports | Service ports to expose |
| `containerPorts` | list | HTTP setup and DNS ports | Container ports exposed by the pod |
| `persistence.shared.enabled` | bool | `false` | Use one PVC for all enabled data mounts |
| `persistence.shared.existingClaim` | string | `""` | Existing shared PVC to reuse |
| `persistence.shared.size` | string | `3Gi` | Shared PVC size |
| `persistence.work.enabled` | bool | `true` | Create or mount the work PVC, or mount the work subPath when shared persistence is enabled |
| `persistence.work.existingClaim` | string | `""` | Existing PVC for `/opt/adguardhome/work` |
| `persistence.work.size` | string | `2Gi` | Work PVC size |
| `persistence.work.subPath` | string | `work` | Shared PVC directory mounted at `/opt/adguardhome/work` |
| `persistence.conf.enabled` | bool | `true` | Create or mount the configuration PVC, or mount the configuration subPath when shared persistence is enabled |
| `persistence.conf.existingClaim` | string | `""` | Existing PVC for `/opt/adguardhome/conf` |
| `persistence.conf.size` | string | `1Gi` | Configuration PVC size |
| `persistence.conf.subPath` | string | `conf` | Shared PVC directory mounted at `/opt/adguardhome/conf` |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress for the web UI |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute for the web UI |
| `livenessProbe` | object | TCP check on `http-setup` | Container liveness probe |
| `readinessProbe` | object | TCP check on `http-setup` | Container readiness probe |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
