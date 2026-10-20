# Changelog

## 0.1.1

- Update the application image from `0.1.0` to `0.1.1`, including the app version, image metadata, schema defaults, and catalog.
- Upstream changes only the two image-publishing workflows, disabling provenance/SBOM attachments to fix Docker build artifacts. Dockerfile, installed package list, Ubuntu base declaration, entrypoint, working directory, and application runtime configuration are unchanged.
- `TARGETARCH` and `KUBECTL_VERSION` are Docker build arguments and cannot select a different kubectl binary through Helm runtime values. `DEBIAN_FRONTEND` is an image build/package-install setting. The image entrypoint has no application-specific runtime variables and sleeps indefinitely. Set `command` as well as `args` when replacing that behavior.
- Document optional client proxy, kubeconfig and CA-file settings in `values.yaml`, with Secret-backed credentials through `envFrom`. In-cluster kubectl continues to use the existing ServiceAccount and read-only `view` binding by default. No database server is deployed or migrated; database clients connect only when explicitly invoked by the operator.

Sources: [release](https://github.com/harish2k01/k8s-debug-pod/releases/tag/v0.1.1), [complete comparison](https://github.com/harish2k01/k8s-debug-pod/compare/v0.1.0...v0.1.1), [Dockerfile](https://github.com/harish2k01/k8s-debug-pod/blob/v0.1.1/Dockerfile), and [entrypoint](https://github.com/harish2k01/k8s-debug-pod/blob/v0.1.1/entrypoint.sh).

The source Dockerfile resolves unpinned Ubuntu packages and the stable kubectl download at image build time. A rebuilt tag can therefore contain different tool binary versions even though the package list is unchanged. Check the bundled kubectl version against the cluster when using it; this source review does not claim byte-identical tools across the two image digests.
