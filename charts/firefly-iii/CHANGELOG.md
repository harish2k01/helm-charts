# Changelog

## 0.2.3

### Chart changes

Add a link to the web chart catalog near the top of the README. Application versions and workload configuration are unchanged.

## 0.2.2

### Application changes

None. Firefly III and PostgreSQL images and database configuration are unchanged.

### Chart changes

Default the application deployment to `Recreate` and expose `deployment.strategy` for supported custom setups. Kubernetes' default rolling update can keep the old pod running while its replacement waits for the same `ReadWriteOnce` upload PVC on another node. Recreate stops the old pod first, so upgrades can briefly interrupt service while the volume moves. Existing upload and database PVCs are reused without replacement. Align the documented and schema image default with the existing pinned app version.

Source: [Kubernetes Deployment strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy). Regression coverage checks the default rollout with an existing upload PVC and an explicit rolling-update override.

## 0.2.1

### Application changes

The cron helper moves from curl 8.21.0 to 8.23.0. SMB was removed, but this chart invokes curl only over HTTP with --fail, --silent and --show-error. The wrapper entrypoint and Secret-backed cron token remain compatible; Firefly III and PostgreSQL are unchanged.

Source: [upstream changes](https://curl.se/changes.html).

### Chart changes

Align the image, chart metadata, values schema and catalog. Existing deployment options, persistence and datastore images are unchanged.
