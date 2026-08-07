# Shopify App Integration Audit

Audit date: 7 August 2026

## Launch status

| App | Headless status | Implementation boundary |
|---|---|---|
| Klaviyo | Implemented in the storefront | Public company ID `SB34LP`; consent-gated Klaviyo.js; Active on Site; Viewed Product; Added to Cart; headless checkout click. Shopify remains authoritative for Checkout Started, orders, fulfillment, and post-purchase events once the customer enters hosted checkout. Active Klaviyo onsite forms can render through the same public loader. |
| Loox Reviews | Implemented in the storefront | Official external-domain loader, live review carousel, product widgets, and authentic static fallbacks. Final production domains must remain allowed by the Loox plan. |
| Notify Me | Not implemented by design | No confirmed headless use case. The Shopify theme extension cannot inject itself into this static storefront. Add only if a sold-out subscription journey is approved and the vendor supplies a supported headless API. |
| Cowlendar Booking | Existing routes retained | Retreat calls keep their existing Cowlendar booking destination. No private credential is stored in this repository. |
| Uplinkly Downloads | Shopify backend | Digital delivery starts from paid Shopify orders. No storefront script or private key belongs in the headless site. Verify delivery mappings inside Shopify before launch. |
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

## Security rules

- Never place a Klaviyo private API key in HTML, JavaScript, GitHub Pages, query strings, or screenshots.
- The public company ID is intentionally browser-visible.
- Any future server-side Klaviyo API work requires a dedicated restricted key stored only in the hosting provider's encrypted environment variables.
- Do not send duplicate `Checkout Started` events from the headless browser and Shopify backend.
