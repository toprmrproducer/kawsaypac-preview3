# The Electric Eats headless domain cutover

Target: serve this headless site at `theelectriceats.com` while keeping Shopify checkout on a dedicated branded subdomain.

## Safe order of operations

1. In DNS, create `shop.theelectriceats.com` as a CNAME to `shops.myshopify.com`.
2. In Shopify Admin → Settings → Domains, connect `shop.theelectriceats.com`, wait for verification and TLS, then make it the Shopify primary domain. Confirm product pages, cart, and checkout work there before changing the apex domain.
3. In Loox → Settings → General → External domains, allow `theelectriceats.com` and `www.theelectriceats.com`. The site uses Loox's public external widget; no Merchant API key is required.
4. In GitHub repository Settings → Pages, verify ownership and set the custom domain to `theelectriceats.com`. GitHub will add the repository `CNAME` file.
5. Only after GitHub has claimed the domain, change the apex DNS from Shopify to GitHub Pages:
   - `A @ 185.199.108.153`
   - `A @ 185.199.109.153`
   - `A @ 185.199.110.153`
   - `A @ 185.199.111.153`
   - `CNAME www toprmrproducer.github.io`
6. Remove conflicting apex A/AAAA/ALIAS records. Do not use wildcard DNS records.
7. Wait for DNS and certificate propagation, enable **Enforce HTTPS** in GitHub Pages, then verify apex → HTTPS, `www` redirect, `shop` checkout, Loox widgets, cart, canonical URLs, and all five testimonial videos.

## Rollback

If the headless site or certificate fails, restore the apex record to the value currently instructed by Shopify and leave `shop.theelectriceats.com` connected. Do not remove the Shopify subdomain during rollback.

## Current preparation in this repository

- Shopify Web Components target the canonical public `.myshopify.com` store domain, so catalog/cart data does not depend on the apex domain.
- Purchase fallbacks use the `.myshopify.com` domain and will follow Shopify's primary-domain redirect.
- Headless product and ebook canonical URLs remain on `theelectriceats.com`.
- Public Shopify product IDs are stored locally for Loox PDP widgets, so review rendering does not depend on Shopify's Ajax product endpoint after the apex moves.

Do not commit a `CNAME` file until the repository custom-domain claim is being performed; doing so early would redirect the working GitHub preview to the still-live Shopify site.
