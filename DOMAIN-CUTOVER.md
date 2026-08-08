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
5. **Preserve Shopify on a subdomain.** In Shopify-managed DNS, create `CNAME shop shops.myshopify.com`. In Shopify Admin → Settings → Domains, connect `shop.theelectriceats.com`, wait for verification and TLS, then make it Shopify's primary domain. Verify product pages, cart, checkout, and the Uplinkly app-proxy route at `/apps/downloads/`.
6. **Verify Uplinkly before moving the apex.** In Uplinkly, confirm every digital variant has the correct file, delivery mode, download limit, email template, and download-page template. Use an existing fulfilled test order or Uplinkly's resend/preview controls to confirm that its order-scoped link opens on `shop.theelectriceats.com/apps/downloads/...`. Do not publish the PDF itself or an unrestricted share URL in this repository.
7. **Preserve historic Uplinkly links.** The committed Netlify `_redirects` rule sends `theelectriceats.com/apps/downloads/*` to the same path on `shop.theelectriceats.com` with a temporary `302`. This keeps links from older Uplinkly emails and Shopify order-status pages usable after the apex moves. Netlify preserves any query parameters on the redirect.
8. **Allow the headless domains in Loox.** In Loox → Settings → General → External domains, add `theelectriceats.com` and `www.theelectriceats.com`.
9. **Assign the domains in Netlify first.** In Netlify → Domain management, add `theelectriceats.com`. Netlify will also add `www.theelectriceats.com`. Select the preferred primary hostname and note the exact DNS records shown under Pending DNS verification.
10. **Change only the public web records in Shopify DNS.** Unless Netlify displays different project-specific values:
   - replace the Shopify apex A record with `A @ 75.2.60.5`
   - replace the Shopify `www` record with `CNAME www <site-name>.netlify.app`
   - keep `CNAME shop shops.myshopify.com`
   - remove only conflicting apex A/AAAA/ALIAS records; preserve MX/TXT and unrelated subdomains
11. **Wait for DNS and TLS.** Propagation can take up to 24 hours. Netlify should provision HTTPS automatically after verification.
12. **Run the launch checklist.** Verify HTTPS on apex and `www`, the preferred-host redirect, `shop` and checkout, cart return URLs, Loox widgets, all authentic testimonial videos, canonical URLs, email delivery, and mobile navigation. For Uplinkly, verify all three customer paths: the Shopify Thank You or Order Status button, the delivery-email button, and an older apex-domain download link. Each must reach the correct order-scoped page without exposing another order or an unrestricted file URL.

## Rollback

If the headless site or certificate fails, restore the apex and `www` records captured in step 1. Leave `shop.theelectriceats.com` connected to Shopify. DNS rollback does not require moving the registrar.

## Optional DNS-provider move

Netlify DNS or Cloudflare DNS can host the zone without charge, but changing nameservers adds another migration surface. Do it only after the website cutover is stable. If the domain is Shopify-managed and the chosen DNS provider requires nameserver control, transfer the registration to a supported registrar first; Shopify says registrar transfers can take up to seven days and may be blocked by a 60-day transfer lock.

## Current repository preparation

- Shopify Web Components use `the-electric-eats.myshopify.com`, so catalog and cart data do not depend on the apex domain.
- Purchase fallbacks use the `.myshopify.com` domain and follow Shopify's primary-domain redirect.
- Headless product and ebook canonical URLs remain on `theelectriceats.com`.
- Uplinkly remains the protected digital-delivery and entitlement service. The static `ebook.html` route is a product page, not an order-download page.
- Netlify preserves historic `/apps/downloads/*` links by redirecting them to the identical Shopify app-proxy path on `shop.theelectriceats.com`.
- Public Shopify product IDs are stored locally for Loox product widgets.
- No private Shopify or Loox credential is shipped to the browser.

## Uplinkly ownership boundary

The secure download page must not be recreated as static HTML. Its order number, purchased assets, download limits, and file authorization are private, order-scoped data owned by Shopify and Uplinkly. A fully custom Kawsaypac download portal would require a documented Uplinkly server API or another server-side fulfillment service that can validate the logged-in customer or a signed order token before returning short-lived download URLs. Until that API exists and is tested, the supported launch path is the branded Uplinkly page behind Shopify's `/apps/downloads/` proxy.
