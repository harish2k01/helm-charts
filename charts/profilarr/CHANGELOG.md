# Changelog

## 0.2.2

### Chart changes

Add a link to the web chart catalog near the top of the README. Application versions and workload configuration are unchanged.

## 0.2.1

### Application changes

2.2.0 → 2.3.1 removes local authentication bypass, introduces scoped API keys and password-plus-OIDC, and migrates SQLite authentication/configuration. Preserve /config and back it up; restore matched data for rollback. AUTH=oidc is a deprecated alias; use AUTH=on and set all three OIDC fields together. Existing keys migrate to full access. The parser's .NET source, wrapper and protocol are unchanged; both published images are pinned to 2.3.1.

Source: [upstream changes](https://github.com/Dictionarry-Hub/profilarr/compare/v2.2.0...v2.3.1).

### Chart changes

Update both app and parser together. Expose optional parser logging without changing its listener or Production environment. OIDC credentials and API keys can use existing envFrom Secrets.
