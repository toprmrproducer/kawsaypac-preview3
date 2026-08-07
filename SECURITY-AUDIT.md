# Security audit: Kawsaypac headless storefront

Audit date: 2026-08-07

## Scope

This audit covers the static HTML, CSS, and JavaScript storefront deployed on GitHub Pages, its public Shopify Storefront Web Components integration, its Loox review widget, its consent-gated Klaviyo browser integration, and its GitHub delivery pipeline. Shopify Admin, Shopify hosted checkout, Loox merchant APIs, Klaviyo account configuration, DNS control, and customer authentication are outside this repository.

There is no application server, database, login system, private API, dependency manifest, or server-side secret store in this repository. The browser sends catalog and cart operations to Shopify, approved review requests to Loox, and consented marketing events to Klaviyo.

## Assets and trust boundaries

| Asset | Boundary | Primary threat | Control |
| --- | --- | --- | --- |
| Shopify catalog, cart, price, and checkout integrity | Browser to Shopify | Client price or product tampering | Official Shopify components send variant IDs and quantities; Shopify recalculates price and validates availability at checkout. |
| Klaviyo profile and behavioral events | Browser to Klaviyo | Tracking without consent or private key leakage | Public company ID only, consent gate, Global Privacy Control support, and a full page lifecycle reset after consent revocation. |
| Approved Loox reviews | Browser to Loox | Script compromise or untrusted review rendering | Official HTTPS widget endpoint; local fallback data is escaped before insertion. |
| Visitor navigation and DOM | URL and form input to browser DOM | DOM XSS, open redirects, or unsafe cross-origin messaging | Product handles are allowlisted, query values are encoded or normalized, external message origin is pinned, and all external tabs use `noopener`. |
| Source and delivery pipeline | Git and GitHub Actions | Credential leakage or mutable workflow compromise | History scan, CI secret scan, read-only workflow permissions, and actions pinned to full commit SHAs. |

## STRIDE summary

| Class | Relevant surface | Result |
| --- | --- | --- |
| Spoofing | No local accounts or authentication | Not applicable in this static storefront. Shopify authenticates its own checkout and account surfaces. |
| Tampering | Product handles, variant IDs, quantities, prices | Mitigated. Shopify remains authoritative for catalog, price, inventory, cart, and checkout. |
| Repudiation | Marketing and commerce events | Partially transferred to Shopify and Klaviyo logs. The static host has no application event log. |
| Information disclosure | Browser bundle, Git history, referrer data | No private credential found. Strict referrer policy added to every HTML document. |
| Denial of service | Third-party script and media availability | Residual vendor and CDN availability risk. Local review fallbacks remain available. |
| Elevation of privilege | Admin APIs and private keys | No admin API or private key is present in the storefront. |

## Findings

| ID | Severity | OWASP / CWE | Finding | Evidence | Fix and status |
| --- | --- | --- | --- | --- | --- |
| F-001 | Medium | A02:2025 / CWE-693 | GitHub Pages cannot apply a complete site-controlled security header policy. | Production sends HTTPS and HSTS, but no site-controlled CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, or `X-Content-Type-Options` response headers. | Open, hosting owner. A safe `_headers` baseline is committed for Netlify. Roll out CSP in Report-Only mode after the final host is selected because the current storefront uses Shopify, Loox, Klaviyo, YouTube, Google Fonts, Cloudinary, and inline styles. |
| F-002 | Low | A03:2025 / CWE-353 | Official Shopify, Loox, and Klaviyo scripts are dynamic endpoints and cannot be pinned with Subresource Integrity. | The vendors do not provide immutable, versioned browser files for these integrations. | Risk accepted. Only reviewed HTTPS origins are used. Reassess when vendors provide immutable builds. |
| F-003 | Low | A05:2025 / CWE-346 | YouTube player commands used a wildcard `postMessage` target origin. | `app.js` previously sent player commands to `*`. | Fixed. Commands are now restricted to `https://www.youtube.com`. |
| F-004 | Medium | A02:2025 / CWE-359 | Consent withdrawal could leave an already-loaded Klaviyo runtime active until the browser tab ended, and Global Privacy Control was not honored. | Local event queuing stopped after denial, but removing a loaded third-party script cannot reliably remove its listeners. | Fixed. Global Privacy Control defaults to denial before loading Klaviyo. Revoking previously granted consent reloads the page with denial persisted, so Klaviyo is absent from the new page lifecycle. |
| F-005 | Low | A03:2025 / CWE-798 | The repository had no automated history secret scan or security regression gate. | No security workflow existed. | Fixed. Weekly and push/PR checks now run a full-history Gitleaks scan, JavaScript syntax checks, and local security assertions. Workflow permissions are read-only and actions are pinned by full SHA. |

## Credential and data-flow evidence

- No Shopify Admin token, private app secret, Loox merchant API key, Klaviyo private API key, service-role key, password, customer access token, cloud credential, or private key is present in the working tree.
- Targeted full-history scanning found no GitHub token, Shopify private token, AWS key, Stripe private key, or private-key block.
- The Klaviyo company ID `SB34LP` is intentionally public. It is not a credential.
- The Loox shop identity and Shopify `.myshopify.com` domain are intentionally public.
- The private handoff repository is verified as `PRIVATE` on GitHub.
- GitHub Pages redirects HTTP to HTTPS and sends HSTS. Checkout remains on Shopify's HTTPS-hosted domain.
- Product query parameters are restricted to known data records or a conservative handle pattern. Unknown values redirect or normalize to a safe storefront state.
- Contact form values are URL-encoded before a `mailto:` handoff. No contact data is transmitted to a local server.

## Verification performed

- The security assertion suite checked 69 text assets and returned zero issues.
- JavaScript syntax checks passed for `app.js`, `product.js`, `shopify-storefront.js`, `ebook.js`, and the security audit script.
- All 44 HTML files passed parser checks and contain the strict referrer policy.
- A headless mobile browser confirmed Global Privacy Control persists denial and loads zero Klaviyo scripts.
- A headless mobile browser confirmed Klaviyo is absent before consent, loads after explicit consent, and is absent after the withdrawal-triggered reload.
- DOM XSS probes in `?concern=` and `?product=` did not execute, did not create injected nodes, and resolved to safe storefront states.
- A live mobile storefront test loaded the Joint & Mobility filter, invoked the official Shopify cart component, and received HTTP 200 from Shopify's Storefront GraphQL endpoint with no storefront notice or page error.
- The private handoff repository was queried through GitHub and remains `PRIVATE`.
- Production currently redirects HTTP to HTTPS, sends HSTS, and exposes no `.env`, `.git/config`, package lock, or JavaScript source map.
- The first post-hardening GitHub Actions security run completed successfully, including the full-history Gitleaks scan and all local security assertions.

Recheck production headers after every hosting or DNS change, and rerun a real Shopify cart and checkout smoke test after any storefront integration update.

## Residual risk and launch gate

There are no open Critical or High findings in this repository. F-001 remains a Medium hosting limitation. Before the custom domain launch, move to Netlify or put a configurable edge in front of the site, apply the committed header baseline, test a CSP in Report-Only mode, then enforce it only after Shopify, Loox, Klaviyo, YouTube, Google Fonts, Cloudinary, and all required media are confirmed working.
