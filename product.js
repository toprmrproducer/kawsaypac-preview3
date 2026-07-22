(function () {
  'use strict';

  const DEFAULT_HANDLE = 'zapped-in';
  const LOAD_TIMEOUT = 12000;

  // Botanical Journal guides. Handles without an entry keep the card hidden.
  const BLEND_GUIDES = {
    'river-of-life': 'river-of-life-guide',
    'scales-of-balance': 'scales-of-balance-guide',
    'sacred-sacral': 'sacred-sacral-guide',
    'sacred-sacral-sweetened': 'sacred-sacral-guide',
    'zapped-in': 'zapped-in-guide',
    'bowel-balance': 'bowel-balance-guide',
    'eliminate-regenerate': 'eliminate-regenerate-guide',
    'final-flush': 'final-flush-guide',
    'guayusa-leaf': 'guayusa-leaf-guide',
    'guayusa': 'guayusa-leaf-guide',
    'ritual-bundle': 'ritual-bundle-guide',
    'ebook-preparation': 'ebook-preparation-guide',
    'bowel-banisher': 'bowel-banisher-guide',
    'cats-claw': 'cats-claw-guide',
    'chuchuhuasi': 'chuchuhuasi-guide',
    'one-way-out': 'one-way-out-guide'
  };

  const GUIDE_TITLES = {
    'river-of-life-guide': 'River of Life: The Complete Guide to Our Heart-Centered Blend',
    'scales-of-balance-guide': 'Scales of Balance: A Complete Guide to Our Calming Blend',
    'sacred-sacral-guide': 'Sacred Sacral: The Complete Guide to Our Womb Wellness Blend',
    'zapped-in-guide': 'Zapped In: The Complete Guide to Our Plant Energy Blend',
    'bowel-balance-guide': 'Bowel Balance: The Complete Guide to Daily Digestive Rhythm',
    'eliminate-regenerate-guide': 'Eliminate + Regenerate: The Full Program, Explained',
    'final-flush-guide': 'Final Flush: The Complete Guide to Our Liver + Kidney Blend',
    'guayusa-leaf-guide': 'Wild Guayusa Leaf: From Napo Chakras to Your Morning Cup',
    'ritual-bundle-guide': 'The Daily Ritual Bundle: Morning to Evening, Explained',
    'ebook-preparation-guide': 'The Herbal Preparation Book: Why Method Is Half the Medicine',
    'bowel-banisher-guide': 'Bowel Banisher: The Complete Guide to Our Deep Cleanse Blend',
    'cats-claw-guide': "Cat's Claw (Una de Gato): The Complete Amazonian Guide",
    'chuchuhuasi-guide': 'Chuchuhuasi: The Amazonian Bark for Joints and Deep Warmth',
    'one-way-out-guide': 'One Way Out: The Complete Guide to Our Elimination Blend'
  };

  function initBlendGuide(handle) {
    const host = document.querySelector('[data-blend-guide]');
    if (!host) return;
    const guide = BLEND_GUIDES[handle];
    if (!guide) { host.hidden = true; return; }
    const link = host.querySelector('[data-blend-guide-link]');
    const img = host.querySelector('[data-blend-guide-img]');
    const title = host.querySelector('[data-blend-guide-title]');
    if (link) link.href = 'blog/' + guide + '.html';
    if (img) img.src = 'assets/img/blog/' + guide + '.webp?v=1';
    if (title && GUIDE_TITLES[guide]) title.textContent = GUIDE_TITLES[guide];
    host.hidden = false;
  }

  function productHandleFromUrl() {
    const requested = new URLSearchParams(window.location.search).get('product') || DEFAULT_HANDLE;
    return /^[a-z0-9][a-z0-9-]{0,120}$/.test(requested) ? requested : DEFAULT_HANDLE;
  }

  function titleFromHandle(handle) {
    return handle
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function setMeta(selector, content) {
    const element = document.querySelector(selector);
    if (element && content) element.setAttribute('content', content);
  }

  function setInitialMetadata(handle) {
    const fallbackTitle = titleFromHandle(handle);
    const canonicalUrl = `https://theelectriceats.com/products/${encodeURIComponent(handle)}`;
    const canonical = document.getElementById('product-canonical');
    const fallback = document.querySelector('[data-product-shopify-fallback]');

    document.title = `${fallbackTitle} | Kawsaypac Ancestral Herbs`;
    if (canonical) canonical.href = canonicalUrl;
    if (fallback) fallback.href = canonicalUrl;
    setMeta('#product-og-title', `${fallbackTitle} | Kawsaypac`);
    setMeta('#product-og-url', canonicalUrl);

    updateSchema({ name: fallbackTitle, url: canonicalUrl });
  }

  function upsertOgImage(url) {
    if (!url) return;
    let meta = document.querySelector('meta[property="og:image"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      document.head.append(meta);
    }
    meta.setAttribute('content', url);
  }

  function parsePrice(value) {
    const compact = value.replace(/,/g, '');
    const price = compact.match(/\d+(?:\.\d{1,2})?/);
    const currency = compact.match(/\b[A-Z]{3}\b/);
    return {
      amount: price ? price[0] : '',
      currency: currency ? currency[0] : 'USD'
    };
  }

  function updateSchema(product) {
    const script = document.getElementById('product-json-ld');
    if (!script) return;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name || 'Kawsaypac Herbal Product',
      brand: { '@type': 'Brand', name: 'Kawsaypac' },
      url: product.url
    };

    if (product.description) schema.description = product.description;
    if (product.image) schema.image = [product.image];
    if (product.price) {
      schema.offers = {
        '@type': 'Offer',
        url: product.url,
        price: product.price,
        priceCurrency: product.currency || 'USD',
        availability: product.available
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock'
      };
    }

    script.textContent = JSON.stringify(schema);
  }

  function syncLiveMetadata(context, handle) {
    const title = context.querySelector('[data-live-product-title]')?.textContent.trim();
    const description = context.querySelector('[data-live-product-description]')?.textContent.trim();
    const priceText = context.querySelector('[data-live-product-price]')?.textContent.trim() || '';
    const image = context.querySelector('.pdp-live-media shopify-media img');
    const purchaseButton = context.querySelector('.purchase .btn-primary');
    if (!title) return false;

    const canonicalUrl = `https://theelectriceats.com/products/${encodeURIComponent(handle)}`;
    const imageUrl = image?.currentSrc || image?.src || '';
    const price = parsePrice(priceText);
    const summary = description || 'Live product details and secure Shopify checkout from Kawsaypac.';

    document.title = `${title} | Kawsaypac Ancestral Herbs`;
    setMeta('meta[name="description"]', summary.slice(0, 160));
    setMeta('#product-og-title', `${title} | Kawsaypac`);
    setMeta('#product-og-description', summary.slice(0, 200));
    setMeta('#product-og-url', canonicalUrl);
    upsertOgImage(imageUrl);
    updateSchema({
      name: title,
      description: summary,
      image: imageUrl,
      url: canonicalUrl,
      price: price.amount,
      currency: price.currency,
      available: purchaseButton ? !purchaseButton.disabled : true
    });
    return true;
  }

  function initStickyCart() {
    const sticky = document.querySelector('[data-sticky-cart]');
    if (!sticky || sticky.dataset.initialized) return;
    sticky.dataset.initialized = 'true';
    const update = () => sticky.classList.toggle('show', window.scrollY > 620);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function showProductError(shell, error) {
    shell.dataset.state = 'error';
    error.hidden = false;
  }

  function boot() {
    const handle = productHandleFromUrl();
    const contextTemplate = document.getElementById('product-context-template');
    const contextHost = document.querySelector('[data-product-context-host]');
    const shell = document.querySelector('.pdp-live-shell');
    const error = document.querySelector('[data-product-error]');
    if (!contextTemplate || !contextHost || !shell || !error) return;

    const fragment = contextTemplate.content.cloneNode(true);
    const stagedContext = fragment.querySelector('[data-product-context]');
    if (!stagedContext) return;

    stagedContext.setAttribute('handle', handle);
    contextHost.replaceChildren(fragment);
    const context = contextHost.querySelector('[data-product-context]');
    if (!context) return;
    setInitialMetadata(handle);
    initBlendGuide(handle);

    let metadataSynced = false;
    const inspect = () => {
      const loaded = context.hasAttribute('shopify-content-loaded');
      if (loaded) {
        shell.dataset.state = 'ready';
        error.hidden = true;
        initStickyCart();
        metadataSynced = syncLiveMetadata(context, handle) || metadataSynced;
      }
    };

    const observer = new MutationObserver(() => {
      window.setTimeout(inspect, 40);
    });
    observer.observe(context, { attributes: true, childList: true, characterData: true, subtree: true });
    inspect();

    window.setTimeout(inspect, 800);
    window.setTimeout(inspect, 2400);
    window.setTimeout(() => {
      if (!context.hasAttribute('shopify-content-loaded')) showProductError(shell, error);
      else if (!metadataSynced) syncLiveMetadata(context, handle);
      observer.disconnect();
    }, LOAD_TIMEOUT);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
