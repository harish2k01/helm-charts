# Scrutiny Helm Chart

This chart deploys [Scrutiny](https://github.com/AnalogJ/scrutiny) web/API with an InfluxDB sidecar for collecting and visualizing S.M.A.R.T. metrics from remote collectors.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://charts.harish2k01.in
helm repo update
helm install scrutiny harish2k01/scrutiny
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install scrutiny oci://ghcr.io/harish2k01/helm-charts/scrutiny --version 0.2.3
```

The chart deploys the Scrutiny web/API container and an InfluxDB container in the same Pod. It does not deploy disk collectors; configure remote collectors to send data to the Scrutiny web endpoint.

## Install With Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  host: scrutiny.example.com
  annotations: {}
```

```bash
helm install scrutiny harish2k01/scrutiny -f values.yaml
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
    - scrutiny.example.com
```

## Persistence

The chart creates separate persistent volumes for the Scrutiny configuration database and InfluxDB data:

```yaml
persistence:
  enabled: true
  accessMode: ReadWriteOnce
  storageClassName: ""
  scrutiny:
    size: 1Gi
  influxdb:
    size: 10Gi
```

Set `persistence.enabled` to `false` for ephemeral test deployments.

## Scrutiny Configuration

The chart seeds `/opt/scrutiny/config/scrutiny.yaml` from a ConfigMap on first startup. If persistence is enabled and the file already exists in the mounted volume, the existing file is kept.

Example configuration:

```yaml
scrutiny:
  web:
    basepath: ""
    database:
      location: /opt/scrutiny/config/scrutiny.db
    influxdb:
      scheme: http
      host: 127.0.0.1
      port: 8086
      retentionPolicy: true
  log:
    level: INFO
  notify:
    urls:
      - discord://token@channel
```

## Remote Collectors

Scrutiny web/API is intended to receive metrics from collectors that run on nodes with access to disk S.M.A.R.T. data. Configure each collector to point at this chart's service, Ingress host, or HTTPRoute hostname.

For in-cluster collector traffic, the service listens on port `8080`:

```text
http://scrutiny.<namespace>.svc.cluster.local:8080
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `image.repository` | string | `ghcr.io/analogj/scrutiny` | Scrutiny container image repository |
| `image.tag` | string | `v0.9.2-web` | Scrutiny container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Scrutiny image pull policy |
| `influxdb.image.repository` | string | `influxdb` | InfluxDB image repository |
| `influxdb.image.tag` | string | `2.9.1` | InfluxDB image tag |
| `initContainer.image.repository` | string | `busybox` | Config seed init container image repository |
| `service.port` | int | `8080` | Kubernetes Service port |
| `scrutiny.web.basepath` | string | `""` | Optional Scrutiny web base path |
| `scrutiny.web.database.location` | string | `/opt/scrutiny/config/scrutiny.db` | Scrutiny SQLite database path |
| `scrutiny.web.influxdb.host` | string | `127.0.0.1` | InfluxDB host used by Scrutiny |
| `scrutiny.web.influxdb.port` | int | `8086` | InfluxDB port used by Scrutiny |
| `scrutiny.log.level` | string | `INFO` | Scrutiny log level |
| `scrutiny.notify.urls` | list | `[]` | Notification URLs written into `scrutiny.yaml` |
| `persistence.enabled` | bool | `true` | Enable persistent storage |
| `persistence.scrutiny.size` | string | `1Gi` | Scrutiny config PVC size |
| `persistence.influxdb.size` | string | `10Gi` | InfluxDB PVC size |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `ingress.className` | string | `traefik` | Ingress class |
| `ingress.host` | string | `scrutiny.local` | Ingress hostname |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Scrutiny container resource requests and limits |
| `influxdb.resources` | object | `{}` | InfluxDB container resource requests and limits |
| `probes.enabled` | bool | `true` | Enable Scrutiny HTTP liveness and readiness probes |

## Upgrade to chart 0.2.3 (InfluxDB 2.9.1)

The InfluxDB sidecar moves from 2.8 to the verified 2.9.1 patch release. Scrutiny stays at v0.9.2-web; its HTTP API and sidecar port 8086 are unchanged. Back up both PVCs and export any API tokens you need before upgrading.

InfluxDB 2.9 enables token hashing by default and automatically migrates stored raw tokens to hashes. Existing client token strings remain valid, but the server can no longer reveal them. Preserve token strings securely outside the database. Rolling back to pre-2.8 requires a manual database downgrade and token recreation; restoring a pre-upgrade backup is the recovery route. Disabling hashing later does not recover plaintext tokens. To explicitly retain raw token storage during a planned compatibility window, set:

```yaml
influxdb:
  env:
    INFLUXD_USE_HASHED_TOKENS: "false"
```

The new `influxdb.env`, `influxdb.envFrom` and `influxdb.args` hooks expose upstream configuration without replacing the image entrypoint. For example, use `INFLUXD_STORAGE_AGGRESSIVE_POINTS_PER_BLOCK` for the new storage compaction setting, or `args: ["--log-level=debug"]`. Leave these empty to use upstream defaults. The 2.9 release also improves environment override handling and backup gzip compression configuration; backup command flags belong in your backup job, not the long-running server arguments. The 2.9.1 patch fixes compaction queue behavior.

The Deployment now defaults to `deploymentStrategy.type: Recreate` so old and new database processes cannot share a writable PVC during rollout. Expect brief downtime. The existing first-start-only Scrutiny config seeding is retained: edits to the ConfigMap do not overwrite an existing PVC configuration.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `influxdb.env` | object | `{}` | Additional InfluxDB environment settings |
| `influxdb.envFrom` | list | `[]` | Secret/ConfigMap environment sources |
| `influxdb.args` | list | `[]` | influxd command-line flags |
| `deploymentStrategy.type` | string | `Recreate` | Stop old database writers before starting a replacement |

Sources reviewed: [2.9.0 release notes](https://github.com/influxdata/influxdb/releases/tag/v2.9.0), [2.9.1 release notes](https://github.com/influxdata/influxdb/releases/tag/v2.9.1), [2.8.0 to 2.9.1 source comparison](https://github.com/influxdata/influxdb/compare/v2.8.0...v2.9.1), [token storage compatibility](https://github.com/influxdata/influxdb/blob/v2.9.1/authorization/storage.go), [container entrypoint](https://github.com/influxdata/influxdata-docker/blob/master/influxdb/2.9/entrypoint.sh), and [official image tags](https://github.com/docker-library/official-images/blob/master/library/influxdb).

Helm rendering verifies chart wiring; it does not validate a migration of your production database. Test a restored backup before production rollout.
