/* Kawsaypac digital product detail page.
   Reads ?product=<handle>, looks the record up in ebook-data.js and renders a
   full premium detail page: breadcrumb, cover gallery, buy box wired to the
   live Shopify storefront components, what's inside, about, cross links and a
   closing CTA. Unknown handles redirect to recipes.html so no digital product
   can ever fall through to the herb page again. */
(function () {
  'use strict';

  var STORE_DOMAIN = 'https://theelectriceats.com';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function sprig() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V8"/><path d="M12 12c-3 0-5-2-5-5 3 0 5 2 5 5Z"/><path d="M12 10c3 0 5-2 5-5-3 0-5 2-5 5Z"/></svg>';
  }

  function check() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5"/></svg>';
  }

  function download() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/></svg>';
  }

  function crossLinks(record, all, order) {
    var sameKind = [];
    var others = [];
    order.forEach(function (handle) {
      if (handle === record.handle) return;
      var candidate = all[handle];
      if (!candidate) return;
      if (candidate.kind === record.kind) sameKind.push(candidate);
      else others.push(candidate);
    });
    return sameKind.concat(others).slice(0, 3);
  }

  function render(root, record, all, order) {
    var thumbs = '';
    if (record.images.length > 1) {
      thumbs = '<div class="eb-thumbs" data-eb-thumbs role="group" aria-label="Preview pages">' +
        record.images.map(function (image, index) {
          return '<button type="button" data-eb-thumb="' + index + '" aria-current="' + (index === 0 ? 'true' : 'false') + '" aria-label="Preview image ' + (index + 1) + '">' +
            '<img src="' + esc(image) + '" alt="" loading="lazy" decoding="async"></button>';
        }).join('') + '</div>';
    }

    var inside = record.inside.map(function (item) {
      return '<li>' + sprig() + '<span>' + esc(item) + '</span></li>';
    }).join('');

    var about = record.about.map(function (paragraph) {
      return '<p>' + esc(paragraph) + '</p>';
    }).join('');

    var strip = '';
    if (record.images.length > 2) {
      strip = '<div class="eb-strip" aria-label="Look inside ' + esc(record.title) + '">' +
        record.images.slice(1).map(function (image) {
          return '<figure><img src="' + esc(image) + '" alt="A look inside ' + esc(record.title) + '" loading="lazy" decoding="async"></figure>';
        }).join('') + '</div>';
    }

    var related = crossLinks(record, all, order).map(function (item) {
      return '<a class="eb-more-card" href="ebook.html?product=' + encodeURIComponent(item.handle) + '">' +
        '<span class="eb-more-media"><img src="' + esc(item.images[0]) + '" alt="" loading="lazy" decoding="async"><span>' + esc(item.badge) + '</span></span>' +
        '<span class="eb-more-body"><h3>' + esc(item.title) + '</h3><strong>$' + esc(item.price) + '</strong>' +
        '<span class="eb-more-cta">View this ' + (item.kind === 'program' ? 'program' : 'guide') + ' <span aria-hidden="true">&#8599;</span></span></span></a>';
    }).join('');

    var note = record.note
      ? '<p class="eb-note">' + esc(record.note) + '</p>'
      : '';

    var handleAttr = esc(record.handle);
    var shopifyUrl = STORE_DOMAIN + '/products/' + encodeURIComponent(record.handle);

    root.innerHTML =
      '<div class="eb-wrap">' +
        '<nav class="eb-crumbs" aria-label="Breadcrumb">' +
          '<a href="index.html">Home</a><span class="eb-crumb-sep" aria-hidden="true">/</span>' +
          '<a href="recipes.html">Recipes &amp; Programs</a><span class="eb-crumb-sep" aria-hidden="true">/</span>' +
          '<span class="eb-crumb-here" aria-current="page">' + esc(record.title) + '</span>' +
        '</nav>' +

        '<section class="eb-hero">' +
          '<div class="eb-gallery">' +
            '<figure class="eb-cover"><img data-eb-cover src="' + esc(record.images[0]) + '" alt="' + esc(record.title) + ' cover" fetchpriority="high"></figure>' +
            thumbs +
          '</div>' +
          '<div class="eb-buy">' +
            '<p class="eb-badge">' + download() + esc(record.badge) + '</p>' +
            '<h1>' + esc(record.title) + '</h1>' +
            '<p class="eb-stars" aria-label="Customer favorite">&#9733;&#9733;&#9733;&#9733;&#9733;</p>' +
            '<p class="eb-price-row"><span class="eb-price">$' + esc(record.price) + '</span><span class="eb-price-meta">USD &middot; Instant download</span></p>' +
            '<p class="eb-lead">' + esc(record.lead) + '</p>' +
            '<div class="eb-buy-panel">' +
              '<shopify-context type="product" handle="' + handleAttr + '">' +
                '<template>' +
                  '<div class="eb-buy-buttons">' +
                    '<button class="btn btn-primary" type="button" onclick="window.KawsaypacStorefront.addToCart(event)" shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale">' +
                      'Add to bag &middot; <shopify-money format="money_without_trailing_zeros" query="product.selectedOrFirstAvailableVariant.price"></shopify-money>' +
                    '</button>' +
                    '<button class="btn btn-outline" type="button" onclick="window.KawsaypacStorefront.buyNow(event)">Buy it now</button>' +
                  '</div>' +
                '</template>' +
                '<div class="eb-buy-fallback" shopify-loading-placeholder>' +
                  '<a class="btn btn-primary" href="' + esc(shopifyUrl) + '">Buy on the Shopify store</a>' +
                  '<p>Connecting to secure checkout&hellip;</p>' +
                '</div>' +
              '</shopify-context>' +
              '<ul class="eb-trust">' +
                '<li>' + check() + 'Instant PDF download after checkout</li>' +
                '<li>' + check() + 'Secure Shopify checkout</li>' +
                '<li>' + check() + 'Yours to keep, printable at home</li>' +
              '</ul>' +
            '</div>' +
            note +
            (record.tags.length ? '<div class="eb-tags">' + record.tags.map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join('') + '</div>' : '') +
          '</div>' +
        '</section>' +

        '<section class="eb-band" aria-labelledby="eb-inside-title">' +
          '<div class="eb-band-head">' +
            '<p class="eyebrow">' + (record.kind === 'program' ? 'The program' : 'The guide') + '</p>' +
            '<h2 id="eb-inside-title">What&#39;s <span class="accent">inside.</span></h2>' +
            '<p>Everything this ' + (record.kind === 'program' ? 'guided program' : 'digital guide') + ' places in your hands the moment checkout completes.</p>' +
          '</div>' +
          '<ul class="eb-inside-grid">' + inside + '</ul>' +
        '</section>' +

        '<section class="eb-band" aria-labelledby="eb-about-title">' +
          '<div class="eb-band-head">' +
            '<p class="eyebrow">From the makers</p>' +
            '<h2 id="eb-about-title">About this ' + (record.kind === 'program' ? '<span class="accent">program.</span>' : '<span class="accent">guide.</span>') + '</h2>' +
          '</div>' +
          '<div class="eb-about-grid">' + about + '</div>' +
          strip +
        '</section>' +

        '<section class="eb-band" aria-labelledby="eb-more-title">' +
          '<div class="eb-band-head">' +
            '<p class="eyebrow">Continue the library</p>' +
            '<h2 id="eb-more-title">Pairs well <span class="accent">with.</span></h2>' +
          '</div>' +
          '<div class="eb-more-grid">' + related + '</div>' +
        '</section>' +
      '</div>' +

      '<section class="eb-closing" aria-label="Back to the library">' +
        '<img src="assets/img/gen/closing-sunrise-cup.webp?v=99" alt="" loading="lazy" decoding="async">' +
        '<p class="eyebrow">The full shelf</p>' +
        '<h2>Every recipe and program, in one calm place.</h2>' +
        '<p>Browse the rest of the digital library, or return to the herbs that started it all.</p>' +
        '<div class="eb-buy-buttons">' +
          '<a class="btn btn-primary" href="recipes.html">Back to Recipes &amp; Programs</a>' +
          '<a class="btn btn-outline" href="shop.html">Shop the herbs</a>' +
        '</div>' +
      '</section>';

    root.setAttribute('aria-busy', 'false');

    var cover = root.querySelector('[data-eb-cover]');
    var thumbHost = root.querySelector('[data-eb-thumbs]');
    if (cover && thumbHost) {
      thumbHost.addEventListener('click', function (event) {
        var button = event.target.closest('[data-eb-thumb]');
        if (!button) return;
        var index = Number(button.dataset.ebThumb);
        if (!record.images[index]) return;
        cover.src = record.images[index];
        thumbHost.querySelectorAll('[data-eb-thumb]').forEach(function (item) {
          item.setAttribute('aria-current', String(item === button));
        });
      });
    }

    /* Broken-image guard: swap any failed image to an on-brand placeholder. */
    var placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAF9F6"/><stop offset="1" stop-color="#1F3A2A"/></linearGradient></defs><rect width="640" height="800" fill="url(#g)"/><text x="50%" y="52%" font-family="Georgia,serif" font-size="30" fill="#C9A942" text-anchor="middle">Kawsaypac</text></svg>');
    root.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () { if (img.src !== placeholder) img.src = placeholder; }, { once: true });
      if (img.complete && img.naturalWidth === 0 && img.src.indexOf('data:') !== 0) img.src = placeholder;
    });
  }

  function updateMeta(record) {
    var shopifyUrl = STORE_DOMAIN + '/products/' + encodeURIComponent(record.handle);
    document.title = record.title + ' | Kawsaypac Digital Library';
    var description = document.getElementById('ebook-meta-description');
    if (description) description.setAttribute('content', record.lead);
    var canonical = document.getElementById('ebook-canonical');
    if (canonical) canonical.setAttribute('href', shopifyUrl);
    var ogTitle = document.getElementById('ebook-og-title');
    if (ogTitle) ogTitle.setAttribute('content', record.title + ' | Kawsaypac');
    var ogDescription = document.getElementById('ebook-og-description');
    if (ogDescription) ogDescription.setAttribute('content', record.lead);
  }

  function boot() {
    var root = document.querySelector('[data-ebook-root]');
    if (!root) return;
    var all = window.KAWSAYPAC_EBOOKS || {};
    var order = window.KAWSAYPAC_EBOOK_ORDER || Object.keys(all);
    var handle = new URLSearchParams(window.location.search).get('product') || '';
    var record = all[handle];

    if (!record) {
      window.location.replace('recipes.html');
      return;
    }

    updateMeta(record);
    render(root, record, all, order);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
