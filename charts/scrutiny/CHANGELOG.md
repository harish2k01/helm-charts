# Changelog

## 0.2.3 — InfluxDB 2.9.1

### App changes

Compatibility review: Scrutiny v0.9.2 uses the InfluxDB v2 Go client and v2 onboarding, bucket, task, write and Flux query APIs. The 2.8-to-2.9 upgrade retains those APIs; no InfluxDB 3 upgrade is involved. An isolated GitHub Actions smoke job starts the actual Scrutiny image against InfluxDB 2.8, writes disposable metrics, upgrades the same disposable database to 2.9.1, and checks authenticated queries plus Scrutiny health/summary. Its result is required evidence before merging. Upstream config/source compatibility alone is not proof that a production dataset will migrate.

The InfluxDB sidecar moves from 2.8 to the verified 2.9.1 patch release. Scrutiny stays at v0.9.2-web; its HTTP API and sidecar port 8086 are unchanged. Back up both PVCs and export any API tokens you need before upgrading.

InfluxDB 2.9 enables token hashing by default and automatically migrates stored raw tokens to hashes. Existing client token strings remain valid, but the server can no longer reveal them. Preserve token strings securely outside the database. Rolling back to pre-2.8 requires a manual database downgrade and token recreation; restoring a pre-upgrade backup is the recovery route. Disabling hashing later does not recover plaintext tokens. To explicitly retain raw token storage during a planned compatibility window, set:

```yaml
influxdb:
  env:
    INFLUXD_USE_HASHED_TOKENS: "false"
```

The new `influxdb.env`, `influxdb.envFrom` and `influxdb.args` hooks expose upstream configuration without replacing the image entrypoint. For example, use `INFLUXD_STORAGE_MAX_CONCURRENT_COMPACTIONS` to tune compaction concurrency, or `args: ["--log-level=debug"]`. Leave these empty to use upstream defaults. The 2.9 release also improves environment override handling and backup gzip compression configuration; backup command flags belong in your backup job, not the long-running server arguments. The 2.9.1 patch fixes compaction queue behavior.

### Chart changes

The chart now includes a complete commented reference for launcher runtime environment flags and the container bootstrap settings, plus Scrutiny runtime configuration. New envFrom/extraEnv and mount hooks support Secret-backed credentials without copying them into plain values. The Deployment now defaults to `deploymentStrategy.type: Recreate` so old and new database processes cannot share a writable PVC during rollout. Expect brief downtime. The existing first-start-only Scrutiny config seeding is retained: edits to the ConfigMap do not overwrite an existing PVC configuration.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `influxdb.env` | object | `{}` | Additional InfluxDB environment settings |
| `influxdb.envFrom` | list | `[]` | Secret/ConfigMap environment sources |
| `influxdb.args` | list | `[]` | influxd command-line flags |
| `deploymentStrategy.type` | string | `Recreate` | Stop old database writers before starting a replacement |

Sources reviewed: [2.9.0 release notes](https://github.com/influxdata/influxdb/releases/tag/v2.9.0), [2.9.1 release notes](https://github.com/influxdata/influxdb/releases/tag/v2.9.1), [2.8.0 to 2.9.1 source comparison](https://github.com/influxdata/influxdb/compare/v2.8.0...v2.9.1), [token storage compatibility](https://github.com/influxdata/influxdb/blob/v2.9.1/authorization/storage.go), [container entrypoint](https://github.com/influxdata/influxdata-docker/blob/master/influxdb/2.9/entrypoint.sh), and [official image tags](https://github.com/docker-library/official-images/blob/master/library/influxdb).

Helm rendering verifies chart wiring; it does not validate a migration of your production database. Test a restored backup before production rollout.
