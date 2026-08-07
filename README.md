# Kawsaypac Ancestral Herbs

Production static preview for The Electric Eats LLC.

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Stack

Multi-page HTML, CSS, vanilla JavaScript, GSAP 3.12, ScrollTrigger, and Shopify Storefront Web Components. Product cards and product-detail pages add the selected live Shopify variant to the cart, while checkout remains hosted by Shopify.

The public storefront domain and product handles are configured in markup. No Shopify admin token, private API key, or headless credential is shipped to the browser or committed to this repository.

Klaviyo uses the public company ID `SB34LP`. Its browser script is consent-gated and records product views, cart additions, and the handoff to hosted Shopify checkout. See `SHOPIFY-APP-INTEGRATION-AUDIT.md` for the complete launch matrix.

## Key routes

- Home: `index.html`
- Shop and concern filters: `shop.html`
- Product detail: `product.html?product=zapped-in`
- Apothecary, story, philosophy, retreats, learning guides, support, and policy routes are all static HTML pages.

## Deployment

GitHub Pages serves the `main` branch. `.nojekyll` keeps the static asset paths unchanged.
