# Security Findings — Kawsaypac headless storefront — 2026-08-05

## Scope and threat model

This is a static HTML/CSS/JavaScript storefront on GitHub Pages. The browser talks to Shopify Storefront Web Components for public catalog/cart operations and to Loox for public, approved reviews. Shopify Admin, Loox Merchant APIs, DNS, and customer authentication are outside this repository.

Highest-value assets are Shopify/Loox administrative credentials, checkout integrity, and authentic customer review data. The key trust boundaries are browser → Shopify, browser → Loox, and DNS → GitHub Pages/Shopify.

## Results

| # | Severity | Title | Location | Evidence | Fix / status |
|---|---|---|---|---|---|
| F-001 | Medium | GitHub Pages cannot set a complete application security-header policy | Hosting layer | The preview sends HSTS but no site-controlled CSP, Referrer-Policy, or Permissions-Policy response headers. | Open, hosting owner. Put Cloudflare in front of Pages or migrate to a host with configurable response headers before enforcing a tested CSP. Do not add a strict CSP blindly because it would block Loox, Shopify, fonts, YouTube, and current inline styles. |
| F-002 | Low | Auto-updating third-party storefront scripts cannot be pinned with SRI | `app.js`, `shop.html` | Loox and Shopify provide official dynamic script endpoints rather than immutable versioned files. | Risk accepted. Limited to official HTTPS origins; no credentials are supplied to Loox. Reassess if either vendor provides a pinned build. |

## Credential and data-flow checks

- No Shopify Admin token, private app secret, Loox Merchant API key, service-role key, password, private key, or customer access token is present in the working tree.
- Targeted history scanning found no matching private credential pattern in Git history.
- Loox receives only the public `.myshopify.com` store identity and public Shopify product IDs.
- Shopify Storefront Web Components use the required public `.myshopify.com` domain. The optional public storefront token remains an explicit placeholder because this implementation does not need inventory counts, metafields, metaobjects, or customer accounts.
- All customer reviews are rendered by Loox or from escaped, trusted static product data. No untrusted review content is interpolated by local code.
- There is no backend, database, authentication layer, dependency manifest, or server-side secret store in this repository.

## Verification

- JavaScript syntax checks passed for `app.js`, `product.js`, `shopify-storefront.js`, and `ebook.js`.
- HTML parser checks passed for the home, testimonial gallery, product, ebook, and shop pages.
- Loox Cards Carousel rendered approved photo/video reviews in local browser testing.
- Static authentic reviews remain visible when Loox does not render.
- Five customer MP4s were validated as H.264/AAC and return HTTP 200 from the local site.

Residual risk is concentrated in third-party script supply chain and the limited header controls of GitHub Pages, not in exposed credentials.
