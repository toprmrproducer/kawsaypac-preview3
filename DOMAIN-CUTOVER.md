# The Electric Eats headless domain cutover

Target: serve the headless site at `theelectriceats.com` and `www.theelectriceats.com`, while Shopify remains available at `shop.theelectriceats.com` for its storefront, cart, and checkout boundary.

## Decision

Use Netlify for the headless site. Keep the domain registered and DNS-managed in Shopify for this cutover. This is a DNS-routing change, not a registrar transfer.

Netlify cannot accept an inbound registrar transfer from Shopify. If domain ownership is moved away from Shopify later, transfer it separately to a registrar such as Cloudflare after launch is stable.

## Access required

- GitHub access to `toprmrproducer/kawsaypac-preview3`
- Netlify project access
- Shopify Admin access to Settings → Domains and DNS settings
- Loox access for external-domain allowlisting

No Shopify Admin API token or Loox Merchant API key belongs in the repository or browser.

## Zero-downtime sequence

1. **Record the current DNS zone.** Export it or take screenshots. Preserve all MX, TXT, SPF, DKIM, DMARC, verification, and non-web subdomain records.
2. **Lower TTL where Shopify permits it.** Do this at least several hours before cutover. Do not delete email records.
3. **Deploy the repository to Netlify.** Import the GitHub repository, deploy branch `main`, leave the build command empty, and use `.` as the publish directory.
4. **Verify the Netlify preview completely.** Test navigation, Shopify catalog/cart/checkout, Loox, all five testimonial videos, policy pages, and mobile layouts before touching DNS.
5. **Preserve Shopify on a subdomain.** In Shopify-managed DNS, create `CNAME shop shops.myshopify.com`. In Shopify Admin → Settings → Domains, connect `shop.theelectriceats.com`, wait for verification and TLS, then make it Shopify's primary domain. Verify product pages, cart, and checkout.
6. **Allow the headless domains in Loox.** In Loox → Settings → General → External domains, add `theelectriceats.com` and `www.theelectriceats.com`.
7. **Assign the domains in Netlify first.** In Netlify → Domain management, add `theelectriceats.com`. Netlify will also add `www.theelectriceats.com`. Select the preferred primary hostname and note the exact DNS records shown under Pending DNS verification.
8. **Change only the public web records in Shopify DNS.** Unless Netlify displays different project-specific values:
   - replace the Shopify apex A record with `A @ 75.2.60.5`
   - replace the Shopify `www` record with `CNAME www <site-name>.netlify.app`
   - keep `CNAME shop shops.myshopify.com`
   - remove only conflicting apex A/AAAA/ALIAS records; preserve MX/TXT and unrelated subdomains
9. **Wait for DNS and TLS.** Propagation can take up to 24 hours. Netlify should provision HTTPS automatically after verification.
10. **Run the launch checklist.** Verify HTTPS on apex and `www`, the preferred-host redirect, `shop` and checkout, cart return URLs, Loox widgets, all authentic testimonial videos, canonical URLs, email delivery, and mobile navigation.

## Rollback

If the headless site or certificate fails, restore the apex and `www` records captured in step 1. Leave `shop.theelectriceats.com` connected to Shopify. DNS rollback does not require moving the registrar.

## Optional DNS-provider move

Netlify DNS or Cloudflare DNS can host the zone without charge, but changing nameservers adds another migration surface. Do it only after the website cutover is stable. If the domain is Shopify-managed and the chosen DNS provider requires nameserver control, transfer the registration to a supported registrar first; Shopify says registrar transfers can take up to seven days and may be blocked by a 60-day transfer lock.

## Current repository preparation

- Shopify Web Components use `the-electric-eats.myshopify.com`, so catalog and cart data do not depend on the apex domain.
- Purchase fallbacks use the `.myshopify.com` domain and follow Shopify's primary-domain redirect.
- Headless product and ebook canonical URLs remain on `theelectriceats.com`.
- Public Shopify product IDs are stored locally for Loox product widgets.
- No private Shopify or Loox credential is shipped to the browser.
