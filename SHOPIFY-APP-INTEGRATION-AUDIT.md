# Shopify App Integration Audit

Audit updated: 8 August 2026

## Launch status

| App | Headless status | Implementation boundary |
|---|---|---|
| Klaviyo | Implemented in the storefront | Public company ID `SB34LP`; consent-gated Klaviyo.js; Active on Site; Viewed Product; Added to Cart; headless checkout click. Shopify remains authoritative for Checkout Started, orders, fulfillment, and post-purchase events once the customer enters hosted checkout. Active Klaviyo onsite forms can render through the same public loader. |
| Loox Reviews | Implemented in the storefront | Official external-domain loader, live review carousel, product widgets, and authentic static fallbacks. Final production domains must remain allowed by the Loox plan. |
| Notify Me | Implemented in the storefront | An unavailable live Shopify variant replaces Add to Cart with Notify Me's official storefront SDK and modal. Name and email remain inside Notify Me. No private Notify Me key is present in this repository. |
| Cowlendar Booking | Existing routes verified | Retreat calls keep their existing Cowlendar booking destination. The live destination redirects through Shopify and loads Cowlendar. No private credential is stored in this repository. |
| Uplinkly Downloads | Shopify backend, cutover route prepared | Digital delivery starts from paid Shopify orders. The Shopify Thank You or Order Status block and Uplinkly email remain the customer entry points. Netlify redirects historic and future apex requests under `/apps/downloads/*` to the identical app-proxy path on `shop.theelectriceats.com`. No storefront script, paid PDF, unrestricted file URL, or private key belongs in the headless site. |
| Urgency+ | Backend inventory confirmed, storefront widget not active | Shopify inventory is authoritative and current quantities were verified. The legacy storefront did not load an Urgency+ widget, and the headless repository has no public Storefront token for exact `quantityAvailable`. Do not show hard-coded scarcity. Add exact counts only after a public token with the minimum inventory scope or a supported vendor headless endpoint is supplied. |
| SKU IQ | Shopify backend only | SKU IQ synchronizes Shopify and TikTok inventory and orders. The headless storefront must not duplicate this sync. Account-level status and one SKU reconciliation require authenticated Shopify, SKU IQ, and TikTok access. |
| I Agree To Terms | Implemented at the headless cart boundary | The cart requires acceptance before checkout. Acceptance and its timestamp are saved as Shopify cart attributes and therefore carry into the order. Direct Buy Now was removed from digital products so it cannot bypass the guard. The legacy vendor app remains responsible only for the legacy theme cart. |

## Verification record

| Check | Result |
|---|---|
| Notify Me sold-out trigger | Passed on live unavailable product Cordoncillo Matico. The Add to Cart control was replaced, the official SDK loaded from Notify Me, and the name and email modal opened. No submission was sent. |
| Terms cart attribute mutation | Passed. `cartAttributesUpdate` returned HTTP 200 and the cart showed `Acceptance saved with this order.` |
| Terms checkout guard | Passed. Checkout produced no request before acceptance and reached the Shopify checkout URL after acceptance. |
| Uplinkly digital delivery | Passed in the prior real test. Shopify Thank You showed Access Downloads, the order-scoped Uplinkly page showed only the purchased file, and the delivery email arrived. Apex-domain preservation remains dependent on the planned `shop.theelectriceats.com` cutover. |
| Cowlendar destination | Passed. The retreat booking URL redirected to the live Shopify store with Cowlendar parameters and the vendor integration loaded. |
| Loox reviews | Passed for the configured production domain path. The GitHub preview intentionally uses verified local fallbacks because Loox rejects that preview hostname. |
| Klaviyo storefront runtime | Passed for consent gating and the implemented client events. Shopify and Klaviyo remain authoritative for Checkout Started and later events. Existing flow content and recipient delivery still require Klaviyo dashboard logs or a real consenting test profile. |
| Urgency+ exact count | Not certified. No active widget was found and no public inventory token is present. |
| SKU IQ reconciliation | Not certified from a public storefront. This is an authenticated backend check, not a frontend integration. |

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
