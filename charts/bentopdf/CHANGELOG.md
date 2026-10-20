# Upgrade notes

## 0.2.0 — 2.8.10

Upgrade from 2.8.4. Reviewed every [release 2.8.5–2.8.10](https://github.com/alam00000/BentoPDF/releases) and the [image/nginx/source comparison](https://github.com/alam00000/BentoPDF/compare/v2.8.4...v2.8.10). 2.8.7 and 2.8.10 address upstream security advisories; 2.8.5–2.8.9 add PDF editing/workflow improvements and fix MIME, service-worker caching, WASM, timestamp and translation problems. Features described as coming next in release announcements are not assumed shipped.

Added env and envFrom hooks so the new runtime ROBOTS_NOINDEX=true setting can be used. It injects noindex HTML metadata at container startup, so the bundled HTML directory must remain writable when enabling it. It stays false by default to preserve existing indexing behavior. SITE_URL, DISABLE_GITHUB_STARS and branding options are image build arguments: setting pod environment variables cannot rebuild static assets. Use a custom image for these.

The recommended bentopdf-simple image, port8080, upstream security headers and canonical handling remain intact. If a reverse proxy overrides headers, preserve the image's cross-origin isolation headers for SharedArrayBuffer tools. The upstream default canonical site is now bentopdf.com; custom public canonicals require a custom SITE_URL build.

Validation: Helm lint, default and ROBOTS_NOINDEX/envFrom/Ingress/HTTPRoute renders, catalog regeneration/check and catalog tests. Browser PDF processing and indexing behavior were not tested live.

### Runtime configuration audit

Reviewed exact target Dockerfile, Dockerfile.puid, nginx-ipv6.sh, nginx-noindex.sh and PUID entrypoint. Runtime controls PORT, DISABLE_IPV6, ROBOTS_NOINDEX, NOINDEX_HTML_ROOT and NGINX_ENTRYPOINT_QUIET_LOGS are exposed through env; PORT must match service.targetPort. PUID/PGID affect only the optional PUID image variant. All static asset/branding/WASM/OCR/canonical variables are classified as image-build settings in values.yaml, not misleading runtime options. This browser-only application has no database requirement. Tool settings are stored in the browser; no chart-side UI state is forced.
