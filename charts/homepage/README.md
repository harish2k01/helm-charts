# Homepage Helm Chart

Browse the [Helm chart catalog](https://charts.harish2k01.in/) to explore available charts and installation commands.

This chart deploys [Homepage](https://gethomepage.dev/), a customizable application dashboard/startpage, using the upstream container image.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install homepage harish2k01/homepage
```

## Install From OCI

```bash
helm install homepage oci://ghcr.io/harish2k01/helm-charts/homepage --version 0.3.1
```

## Web UI Access

Homepage requires `HOMEPAGE_ALLOWED_HOSTS` for non-local access. This chart always includes the pod IP for health probes; add your external hostname with `homepage.allowedHosts`.

Expose with Gateway API:

```yaml
homepage:
  allowedHosts:
    - homepage.example.com

httpRoutes:
  main:
    enabled: true
    parentRefs:
      - name: gateway
        namespace: gateway-system
        sectionName: https
    hostnames:
      - homepage.example.com
```

Or with Ingress:

```yaml
homepage:
  allowedHosts:
    - homepage.example.com

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: homepage.example.com
      paths:
        - path: /
          pathType: Prefix
```

## Configuration

The chart generates Homepage config files from `homepage.config.files` and mounts them under `/app/config`:

```yaml
homepage:
  config:
    enabled: true
    files:
      settings.yaml: |
        title: HomeLab
      services.yaml: |
        - Monitoring:
            - Uptime Kuma:
                href: https://uptime.example.com
                description: Status checks
```

To provide your own ConfigMap:

```yaml
homepage:
  existingConfigMap: homepage-config
```

Keep the keys in that ConfigMap aligned with the files listed in `homepage.config.files`, or override `homepage.config.files` to match your keys.

To provide `/app/config` through your own volume mount instead, disable generated config files:

```yaml
homepage:
  config:
    enabled: false
```

## Kubernetes Discovery

By default, `kubernetes.yaml` uses `mode: cluster` and the chart creates RBAC for pods, nodes, namespaces, ingresses, Gateway API HTTPRoutes, Traefik IngressRoutes, and metrics. Disable RBAC branches you do not need:

```yaml
rbac:
  gatewayApi: false
  traefik: false
  metrics: false
```

## Persistence

Generated ConfigMap files are enough for most GitOps-style installs. Enable a config PVC when you want persistent `/app/config` storage:

```yaml
persistence:
  config:
    enabled: true
    size: 1Gi
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Homepage replicas |
| `image.repository` | string | `ghcr.io/gethomepage/homepage` | Container image repository |
| `image.tag` | string | `v2.7.0` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `serviceAccount.create` | bool | `true` | Create a ServiceAccount |
| `serviceAccount.automount` | bool | `true` | Automount the ServiceAccount token |
| `rbac.create` | bool | `true` | Create RBAC for Kubernetes discovery |
| `rbac.gatewayApi` | bool | `true` | Include Gateway API read permissions |
| `rbac.traefik` | bool | `true` | Include Traefik IngressRoute read permissions |
| `rbac.metrics` | bool | `true` | Include metrics.k8s.io read permissions |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `homepage.allowedHosts` | list | `[]` | Additional allowed hosts for external access |
| `homepage.existingConfigMap` | string | `""` | Existing ConfigMap with Homepage config files |
| `homepage.config.enabled` | bool | `true` | Generate and mount Homepage config files |
| `homepage.config.files` | object | see `values.yaml` | Homepage config file contents mounted under `/app/config` |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `3000` | Kubernetes Service port |
| `service.targetPort` | int | `3000` | Container Web UI port |
| `service.extraPorts` | list | `[]` | Additional Service ports |
| `persistence.config.enabled` | bool | `false` | Create or mount a config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/app/config` |
| `persistence.config.size` | string | `1Gi` | Config PVC size |
| `persistence.config.storageClassName` | string | `""` | Config PVC storage class |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoutes.main.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |

## Optional runtime settings

`env` includes commented logging, proxy and config-directory examples. Use `envFrom` for `HOMEPAGE_VAR_*` Secret values or `HOMEPAGE_FILE_*` paths with `extraVolumes`/`extraVolumeMounts`; placeholders are substituted in Homepage YAML. Keep widget credentials in Secrets. See [CHANGELOG.md](CHANGELOG.md) for release details.

## Multiple HTTPRoutes

Use `httpRoutes` to define one or more routes, each with its own Gateway
references, hostnames, annotations, and rules. The default `main` entry is disabled.

```yaml
httpRoutes:
  internal:
    parentRefs:
      - name: internal-gateway
        namespace: ingress
        sectionName: https
    hostnames: [app.internal.example.com]
  external:
    parentRefs:
      - name: external-gateway
        namespace: ingress
        sectionName: https
    hostnames: [app.example.com]
```

Each map key is a lowercase DNS label of up to 40 characters and becomes the
resource-name suffix (`<app-fullname>-internal`, for example). Long base names are
shortened to keep the suffix and stay within 63 characters; collisions fail rendering.

| Key | Default | Description |
|---|---|---|
| `httpRoutes` | Disabled `main` entry | Named HTTPRoutes; defaults create no routes. |
| `httpRoutes.<name>.enabled` | `true` | Set false to omit an entry, including its attachments. |
| `httpRoutes.<name>.parentRefs` | Required when enabled | Gateway references, with optional namespace and listener section. |
| `httpRoutes.<name>.hostnames` | Required when enabled | Independent explicit hostname list. |
| `httpRoutes.<name>.annotations` | `{}` | Per-route annotations. |
| `httpRoutes.<name>.rules` | Path prefix `/` | Gateway API matches and filters. Backend references are always supplied by the chart using its application Service and HTTP port. |

Each route has independent hostnames, attachments, annotations, and rules.
Chart-specific backend behavior is retained; Ghost also includes its ActivityPub
endpoints when enabled. Gateway API CRDs and a compatible controller
are required; the referenced Gateway must allow attachment from this namespace.

### Migration from the single-route option

`httpRoute` has been removed. Move its settings under `httpRoutes.main` and remove
the old key entirely, including `httpRoute.enabled: false`. Old values fail
rendering with a migration message instead of silently dropping traffic. The old
resource `<app-fullname>` is replaced by `<app-fullname>-main`; coordinate the
upgrade with your GitOps pruning policy to avoid overlapping or missing routes.
Multiple hostnames and parent references apply to the whole route; use separate
entries when each hostname group must attach to a different Gateway.

## Built-in authentication and MCP

Homepage authentication is opt-in. Store a stable cookie secret (at least 32 characters) and the password in an existing Kubernetes Secret, then reference its keys:

```yaml
env:
  HOMEPAGE_AUTH_ENABLED: "true"
  HOMEPAGE_EXTERNAL_URL: https://dashboard.example.com
extraEnv:
  - name: HOMEPAGE_AUTH_SECRET
    valueFrom:
      secretKeyRef:
        name: homepage-auth
        key: cookie-secret
  - name: HOMEPAGE_AUTH_PASSWORD
    valueFrom:
      secretKeyRef:
        name: homepage-auth
        key: password
```

For OIDC, replace the password with `HOMEPAGE_OIDC_CLIENT_SECRET` from a Secret and set `HOMEPAGE_OIDC_ISSUER` and `HOMEPAGE_OIDC_CLIENT_ID`. Optional `HOMEPAGE_OIDC_NAME`, `HOMEPAGE_OIDC_SCOPE` (upstream default `openid email profile`) and `HOMEPAGE_OIDC_AUTO_LOGIN` control the login experience. `HOMEPAGE_EXTERNAL_URL` must be the browser-facing absolute URL; configure TLS at your Gateway/Ingress. `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are supported upstream aliases, with precedence over the Homepage names. Keep the cookie secret shared across replicas and stable across restarts.

The optional `/api/mcp` endpoint uses `HOMEPAGE_MCP_ENABLED=true`. It accepts an authenticated Homepage session or a separate `HOMEPAGE_MCP_TOKEN` (at least 32 characters) supplied through `extraEnv` or `envFrom`. Tokens can read configured service credentials. Writes remain off unless `HOMEPAGE_MCP_ALLOW_WRITE=true`; write access also permits changing `custom.js`, which executes in browsers.

For writable MCP configuration, set `homepage.config.enabled=false`, enable `persistence.config`, and supply an operator-populated writable claim. Generated or existing ConfigMap files are read-only even when a PVC is mounted beneath them. The chart does not initialize or overwrite the claim. Set a suitable `podSecurityContext.fsGroup` or volume ownership for UID/GID 1000. Back up the files before enabling writers; generated GitOps configuration and runtime MCP edits must not compete for ownership.

`extraEnv` accepts Kubernetes `EnvVar` objects; `envFrom` imports whole Secrets/ConfigMaps. The chart reserves `MY_POD_IP` and `HOMEPAGE_ALLOWED_HOSTS`; set public names through `homepage.allowedHosts`. When changing `env.PORT`, also change `service.targetPort` so the Service, probes and allowed pod address stay aligned.

| Key | Default | Description |
|---|---|---|
| `extraEnv` | `[]` | Individual environment variables, including Secret key references. |
| `env.HOMEPAGE_AUTH_ENABLED` | Unset; upstream disabled | Enable password or OIDC authentication explicitly. |
| `env.HOMEPAGE_EXTERNAL_URL` | Unset | Public absolute HTTP(S) URL required for authentication. |
| `env.HOMEPAGE_MCP_ENABLED` | Unset; upstream disabled | Enable the authenticated MCP config endpoint. |
| `env.HOMEPAGE_MCP_ALLOW_WRITE` | Unset; upstream disabled | Allow edits only with writable operator-owned config. |

See [CHANGELOG.md](CHANGELOG.md) for the v1 to v2 release review, compatibility notes and validation.
