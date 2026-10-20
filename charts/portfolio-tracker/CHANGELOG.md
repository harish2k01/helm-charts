# Upgrade notes

## 0.2.0 — 0.7.0

Upgrade from 0.1.0. Reviewed all releases 0.1.1, 0.2.0, 0.3.0, 0.4.0, 0.4.1, 0.5.0, 0.6.0, 0.6.1, 0.6.2 and 0.7.0, plus the [complete source comparison](https://github.com/harish2k01/portfolio-tracker/compare/v0.1.0...v0.7.0). Includes SIP calculation fixes, UI revamps, provider changes, graph fixes, XIRR and asset-logo support.

Added optional LOGO_PROVIDER configuration and Secret-backed LOGO_DEV_TOKEN/BRANDFETCH_CLIENT_ID fields. No provider is enabled by chart defaults. Upstream selects logo.dev when its token is present, then Brandfetch if its client ID is present; LOGO_PROVIDER selects the preferred configured provider. Logo URLs contain a provider publishable identifier and are returned to browsers, so use provider credentials intended for public logo access.

0.7.0 adds Asset.logoUrl, logoSource and logoUpdatedAt via a Prisma migration. The image entrypoint still runs prisma migrate deploy before starting the app; preserve NEXTAUTH_SECRET and back up PostgreSQL before upgrading. Port3000, SMTP settings and database URL behavior are unchanged. UI refresh is an application-visible change; no data-reset or database-version change is introduced by the chart.

Validation: Helm lint, default and provider/Secret/Ingress/HTTPRoute rendering, generated catalog consistency and catalog tests. Provider API responses and live database migrations were not tested.
