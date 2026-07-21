# Kawsaypac Ancestral Herbs

Production static preview for The Electric Eats LLC.

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Stack

Multi-page HTML, CSS, vanilla JavaScript, GSAP 3.12, and ScrollTrigger. Commerce buttons are presentation-ready but Shopify checkout is intentionally not connected in this preview.

## Key routes

- Home: `index.html`
- Shop and concern filters: `shop.html`
- Product detail: `product.html?product=zapped-in`
- Apothecary, story, philosophy, retreats, learning guides, support, and policy routes are all static HTML pages.

## Deployment

GitHub Pages serves the `main` branch. `.nojekyll` keeps the static asset paths unchanged.
