# Shopify App Integration Audit

Audit updated: 8 August 2026

## Launch status

| App | Headless status | Implementation boundary |
|---|---|---|
| Klaviyo | Implemented in the storefront | Public company ID `SB34LP`; consent-gated Klaviyo.js; Active on Site; Viewed Product; Added to Cart; headless checkout click. Shopify remains authoritative for Checkout Started, orders, fulfillment, and post-purchase events once the customer enters hosted checkout. Active Klaviyo onsite forms can render through the same public loader. |
| Loox Reviews | Implemented in the storefront | Official external-domain loader, live review carousel, product widgets, and authentic static fallbacks. Final production domains must remain allowed by the Loox plan. |
| Notify Me | Not implemented by design | No confirmed headless use case. The Shopify theme extension cannot inject itself into this static storefront. Add only if a sold-out subscription journey is approved and the vendor supplies a supported headless API. |
| Cowlendar Booking | Existing routes retained | Retreat calls keep their existing Cowlendar booking destination. No private credential is stored in this repository. |
| Uplinkly Downloads | Shopify backend, cutover route prepared | Digital delivery starts from paid Shopify orders. The Shopify Thank You or Order Status block and Uplinkly email remain the customer entry points. Netlify redirects historic and future apex requests under `/apps/downloads/*` to the identical app-proxy path on `shop.theelectriceats.com`. No storefront script, paid PDF, unrestricted file URL, or private key belongs in the headless site. |
| I Agree To Terms | Shopify checkout boundary | The current headless site does not fake a theme-cart checkbox. Terms enforcement should stay in a supported Shopify checkout extension or Shopify Function so it cannot be bypassed in the browser. |

## Klaviyo event map

| Requirement | Source |
|---|---|
| Signup forms | Active Klaviyo onsite forms loaded by the consented public script |
| Consent tracking | Local explicit choice plus `Marketing Consent Updated` event after approval |
| Active on Site | Klaviyo.js after marketing consent |
| Viewed Product | Product detail render in `product.js` |
| Added to Cart | Live Shopify card and product-detail cart actions in `shopify-storefront.js` |
| Checkout handoff | `Headless Checkout Clicked` when the hosted Shopify checkout control is used |
| Checkout Started | Native Klaviyo and Shopify integration after the customer enters hosted checkout |
| Order and fulfillment events | Native Shopify backend integration |

### Published form destination correction

The Klaviyo forms `REGULAR USE: Quiz Pop-Up Desktop` (`SDYjkv`) and `REGULAR USE: Quiz Pop-Up Mobile` (`XzWcvk`) currently publish their Success-step “Shop Our Best Sellers” button with `Action: Go to URL` pointing to the legacy Shopify collection at `https://theelectriceats.com/collections/best-sellers`. Change both button destinations in Klaviyo to the final headless catalog URL, `https://theelectriceats.com/shop.html#live-apothecary`, when the custom-domain cutover is complete. The storefront also captures that exact CTA and routes it to the host-relative `shop.html#live-apothecary`, so preview and production visitors remain in the headless experience without exposing any credential.

## Security rules

- Never place a Klaviyo private API key in HTML, JavaScript, GitHub Pages, query strings, or screenshots.
- The public company ID is intentionally browser-visible.
- Any future server-side Klaviyo API work requires a dedicated restricted key stored only in the hosting provider's encrypted environment variables.
- Do not send duplicate `Checkout Started` events from the headless browser and Shopify backend.

## Uplinkly download flow

The repository's `ebook.html` and `ebook.js` files are product-detail and checkout-handoff pages only. They do not contain order entitlement logic and must not be represented as a customer download portal.

At launch, Uplinkly remains responsible for associating a paid Shopify order with its digital files, applying any download limits or PDF protection, sending the delivery email, and rendering the order-scoped download page. Shopify must first be available at `shop.theelectriceats.com`; the committed `_redirects` rule then preserves legacy links such as `theelectriceats.com/apps/downloads/orders/...` after the apex moves to Netlify.

Before launch, validate one fulfilled digital order through each route:

1. Shopify Thank You or Order Status → Access Downloads.
2. Uplinkly delivery email → View Your Downloads.
3. Historic apex-domain `/apps/downloads/` link → `shop.theelectriceats.com/apps/downloads/` with the path and query string preserved.

The destination must show only the purchased files for that order. A custom Kawsaypac-styled portal is a separate server-side integration and is compatible only if Uplinkly provides a supported entitlement API or signed-download mechanism. Do not reproduce this with client-side order IDs or public PDF URLs.
