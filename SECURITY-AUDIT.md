# Security audit: Kawsaypac headless storefront

Audit date: 2026-08-07

## Scope

This audit covers the static HTML, CSS, and JavaScript storefront deployed on GitHub Pages, its public Shopify Storefront Web Components integration, its Loox review widget, its consent-gated Klaviyo browser integration, its Notify Me back-in-stock control, its terms acceptance cart attributes, and its GitHub delivery pipeline. Shopify Admin, Shopify hosted checkout, Loox merchant APIs, Klaviyo account configuration, Notify Me subscriber delivery, DNS control, and customer authentication are outside this repository.

There is no application server, database, login system, private API, dependency manifest, or server-side secret store in this repository. The browser sends catalog and cart operations to Shopify, approved review requests to Loox, and consented marketing events to Klaviyo.

## Assets and trust boundaries

| Asset | Boundary | Primary threat | Control |
| --- | --- | --- | --- |
| Shopify catalog, cart, price, and checkout integrity | Browser to Shopify | Client price or product tampering | Official Shopify components send variant IDs and quantities; Shopify recalculates price and validates availability at checkout. |
| Klaviyo profile and behavioral events | Browser to Klaviyo | Tracking without consent or private key leakage | Public company ID only, consent gate, Global Privacy Control support, and a full page lifecycle reset after consent revocation. |
| Approved Loox reviews | Browser to Loox | Script compromise or untrusted review rendering | Official HTTPS widget endpoint; local fallback data is escaped before insertion. |
| Back-in-stock subscriber data | Browser to Notify Me | Contact data leakage or exposed vendor credential | Official Notify Me storefront SDK loads only for an unavailable variant. The modal sends contact data directly to Notify Me and the repository contains no private vendor key. |
| Terms acceptance evidence | Browser to Shopify cart | Checkout bypass or acceptance not retained with the order | Direct Buy Now is removed, checkout is blocked until Shopify confirms the cart-attribute mutation, and Shopify remains authoritative for the resulting order. |
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
| F-006 | Low | A05:2025 / CWE-20 | Product research links were HTML-escaped but the renderer did not restrict their URI scheme, and four stored links used plain HTTP. | The data is repository-controlled, so there was no direct attacker input path, but a future unsafe value could have become a clickable `javascript:` or plaintext URL. | Fixed. The renderer now permits only valid HTTPS URLs, adds `noopener noreferrer`, all stored study links use HTTPS, and the regression audit checks both controls. |

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
- Gitleaks 8.30.1 scanned all 9 reachable commits after a fingerprint-specific ignore for the public Klaviyo consent-storage label and found no secret.
- Trivy 0.73.0 found no vulnerability, secret, or repository misconfiguration result. Retire.js 5.4.3 found no vulnerable vendored browser library. OSV-Scanner found no package source because this static repository has no dependency manifest or lockfile.
- Semgrep 1.172.0 ran 282 rules over 91 tracked files. Its five warnings were all HTML-template data flows in `product.js`; each value at those sinks is passed through `esc()`, and the production DOM payload probes remained inert.
- A bounded low-rate Nuclei 3.11.0 pass sent 409 non-destructive exposure and misconfiguration template requests with no match. The broad template run was intentionally stopped rather than continue thousands of requests against GitHub's shared Pages edge.
- The testssl protocol and cipher pass confirmed SSLv2, SSLv3, TLS 1.0, and TLS 1.1 are not offered; TLS 1.2 and TLS 1.3 are offered; NULL, anonymous, export, RC4, DES, and 3DES classes are not offered; and forward secrecy is available. These controls belong to GitHub's shared edge.
- OWASP ZAP 2.17.0 was installed, but its macOS command-line automation did not terminate reliably and its incomplete run is not used as evidence. The completed passive HTTP, browser, and Nuclei results above are the evidence for this report.
- A headless mobile browser confirmed Global Privacy Control persists denial and loads zero Klaviyo scripts.
- A headless mobile browser confirmed Klaviyo is absent before consent, loads after explicit consent, and is absent after the withdrawal-triggered reload.
- DOM XSS probes across `?concern=`, `?q=`, product, ebook, and testimonial routes did not execute, did not create injected nodes, and resolved to safe storefront states.
- A live mobile storefront test loaded the Joint & Mobility filter, invoked the official Shopify cart component, and received HTTP 200 from Shopify's Storefront GraphQL endpoint with no storefront notice or page error.
- A live unavailable variant loaded Notify Me's official SDK, replaced the disabled purchase action, and opened the name and email signup modal without a private key or test submission.
- A headless cart test confirmed the terms control blocks the Shopify checkout request before acceptance, saves `I-Agree-To-Terms` and `Accepted-Terms-At` through Shopify's cart API, and permits checkout only after the mutation returns HTTP 200.
- The private handoff repository was queried through GitHub and remains `PRIVATE`.
- All 44 production HTML routes returned HTTP 200. Production redirects HTTP to HTTPS, sends HSTS, and the sensitive-file probe found no `.env`, Git metadata, dependency lockfile, credentials file, or source map.
- Production references no plaintext external resource. The only preview-specific console rejection was Loox refusing its product-review frame on the GitHub Pages hostname; the product page now keeps its static verified-review wall on that preview and loads the live widget only on Loox's already-permitted final domain.
- The first post-hardening GitHub Actions security run completed successfully, including the full-history Gitleaks scan and all local security assertions.

Recheck production headers after every hosting or DNS change, and rerun a real Shopify cart and checkout smoke test after any storefront integration update.

## Residual risk and launch gate

There are no open Critical or High findings in this repository. F-001 remains a Medium hosting limitation. Before the custom domain launch, move to Netlify or put a configurable edge in front of the site, apply the committed header baseline, test a CSP in Report-Only mode, then enforce it only after Shopify, Loox, Klaviyo, YouTube, Google Fonts, Cloudinary, and all required media are confirmed working.
