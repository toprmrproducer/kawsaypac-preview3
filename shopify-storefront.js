(function () {
  'use strict';

  /*
   * Browser-visible Shopify configuration.
   * Only a PUBLIC Storefront API token may ever be placed here. Never add an
   * Admin API token, private app secret, or any other server-side credential.
   */
  const STOREFRONT_CONFIG = Object.freeze({
    storeDomain: 'https://theelectriceats.com',
    country: 'US',
    language: 'en',
    publicAccessToken: '__PUBLIC_STOREFRONT_TOKEN__',
    blogHandle: 'foods-herbs-facts'
  });

  const PHYSICAL_PRODUCT_HANDLES = Object.freeze([
    'valerian',
    'guayusa',
    'sacred-sacral-sweetened',
    'final-flush',
    'bowel-balance',
    'soursop-leaves-graviola',
    'cordoncillo-matico-1',
    'zapped-in',
    'scales-of-balance',
    'bowel-banisher',
    'one-way-out',
    'river-of-life',
    'chuchuhuasi',
    'cats-claw'
  ]);

  const EBOOK_PRODUCT_HANDLES = Object.freeze([
    'gut-harmony',
    'r-a-w-by-law-the-uncookbook-of-135-rawfully-tasty-colorful-sun-food-recipes',
    'the-electric-eats-cookbook-130-electrifyingly-delicious-easy-to-make-plant-based-recipes',
    'from-our-feed-to-your-kitchen-50-plant-based-recipes-inspired-by-dr-sebis-cell-food-guide-e-book',
    'alkaline-vegan-dishes-top-10-favorites-from-our-kitchen-to-yours'
  ]);

  const PROGRAM_PRODUCT_HANDLES = Object.freeze([
    'fearless-fruit-detox',
    'her-fertile-waters',
    'his-fertile-fires',
    'eliminate-regenerate',
    '7-day-fruit-detox',
    '30-day-raw-reset',
    '10-day-transitional-detox',
    'free-lets-get-raw-a-3-day-raw-alkaline-plant-based-experience'
  ]);

  const CONCERN_FILTERS = Object.freeze([
    { label: 'All Physical Products', slug: 'all' },
    { label: "Women's Wellness", slug: 'womens-wellness', products: ['sacred-sacral-sweetened'] },
    { label: "Men's Wellness", slug: 'mens-wellness', products: ['zapped-in'] },
    { label: 'Digestive Health', slug: 'digestive-health', products: ['bowel-balance', 'bowel-banisher', 'final-flush'] },
    { label: 'Auto-Immune Support', slug: 'auto-immune-support', products: ['cats-claw', 'soursop-leaves-graviola', 'chuchuhuasi'] },
    { label: 'Nervous System', slug: 'nervous-system', products: ['scales-of-balance', 'valerian'] },
    { label: 'Energy & Vitality', slug: 'energy-vitality', products: ['guayusa', 'zapped-in'] },
    { label: 'Joint & Mobility', slug: 'joint-mobility', products: ['chuchuhuasi', 'cats-claw'] },
    { label: 'Heart Health', slug: 'heart-health', products: ['river-of-life'] },
    { label: 'Liver Support', slug: 'liver-support', products: ['final-flush'] },
    { label: 'Kidney Support', slug: 'kidney-support', products: ['final-flush'] },
    { label: 'Lung Support', slug: 'lung-support', products: ['cordoncillo-matico-1'] },
    { label: 'Hormone Balance', slug: 'hormone-balance', products: ['sacred-sacral-sweetened'] },
    { label: 'Sleep & Relaxation', slug: 'sleep-relaxation', products: ['valerian', 'scales-of-balance'] },
    { label: 'Full Body Detox', slug: 'full-body-detox', products: ['final-flush'] }
  ]);

  const TYPE_COLLECTIONS = Object.freeze({
    blends: { label: 'Herbal Blends', handle: 'herbal-blends' },
    bundles: { label: 'Herb Bundles', handle: 'herb-bundles' }
  });

  const PLACEHOLDER_TOKEN = STOREFRONT_CONFIG.publicAccessToken.startsWith('__');
  const COMPONENT_TIMEOUT = 10000;

  function configureStores() {
    document.querySelectorAll('[data-storefront-config]').forEach((store) => {
      store.setAttribute('store-domain', STOREFRONT_CONFIG.storeDomain);
      store.setAttribute('country', STOREFRONT_CONFIG.country);
      store.setAttribute('language', STOREFRONT_CONFIG.language);

      if (PLACEHOLDER_TOKEN) {
        store.removeAttribute('public-access-token');
      } else {
        store.setAttribute('public-access-token', STOREFRONT_CONFIG.publicAccessToken);
      }
    });
  }

  function escapeAttribute(value) {
    return String(value).replace(/[&"'<>]/g, (character) => ({
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
      '<': '&lt;',
      '>': '&gt;'
    })[character]);
  }

  function productCardTemplate(options = {}) {
    const mediaPriority = options.priority ? ' priority="true"' : '';
    const cardClass = options.cardClass ? ` ${options.cardClass}` : '';
    return `
      <article class="storefront-card${cardClass}">
        <a
          class="storefront-card__media"
          href="product.html"
          data-storefront-product-link
          shopify-attr--data-product-handle="product.handle"
          aria-label="View product details"
        >
          <shopify-media
            query="product.selectedOrFirstAvailableVariant.image"
            width="720"
            aspect-ratio="1"
            layout="constrained"
            sizes="(max-width: 680px) 92vw, (max-width: 980px) 45vw, 30vw"${mediaPriority}
          ></shopify-media>
          <span class="storefront-card__type"><shopify-data query="product.productType"></shopify-data></span>
        </a>
        <div class="storefront-card__body">
          <div class="storefront-card__heading">
            <h2><shopify-data query="product.title"></shopify-data></h2>
            <strong><shopify-money format="money_with_currency" query="product.selectedOrFirstAvailableVariant.price"></shopify-money></strong>
          </div>
          <p class="storefront-card__description"><shopify-data query="product.description"></shopify-data></p>
          <div class="storefront-card__actions">
            <a
              class="storefront-text-link"
              href="product.html"
              data-storefront-product-link
              shopify-attr--data-product-handle="product.handle"
            >View ritual <span aria-hidden="true">↗</span></a>
            <button
              class="storefront-quick-add"
              type="button"
              onclick="window.KawsaypacStorefront.addToCart(event)"
              shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale"
            >Add to bag</button>
          </div>
        </div>
      </article>`;
  }

  function skeletonCards(count = 6) {
    return Array.from({ length: count }, () => `
      <article class="storefront-card storefront-card--skeleton" aria-hidden="true">
        <div class="storefront-skeleton storefront-skeleton--media"></div>
        <div class="storefront-card__body">
          <div class="storefront-skeleton storefront-skeleton--line"></div>
          <div class="storefront-skeleton storefront-skeleton--short"></div>
        </div>
      </article>`).join('');
  }

  function renderCollection(grid, handle) {
    grid.innerHTML = `
      <shopify-context data-storefront-source type="collection" handle="${escapeAttribute(handle)}">
        <template>
          <shopify-list-context data-storefront-list type="product" query="collection.products" first="50">
            <template>${productCardTemplate()}</template>
            <div class="storefront-loading-grid" shopify-loading-placeholder>${skeletonCards()}</div>
          </shopify-list-context>
        </template>
        <div class="storefront-loading-grid" shopify-loading-placeholder>${skeletonCards()}</div>
      </shopify-context>`;
  }

  function renderProductHandles(grid, handles, options = {}) {
    grid.innerHTML = handles.map((handle) => `
      <shopify-context data-storefront-source type="product" handle="${escapeAttribute(handle)}">
        <template>${productCardTemplate(options)}</template>
        <div class="storefront-card storefront-card--skeleton" shopify-loading-placeholder aria-label="Loading product">
          <div class="storefront-skeleton storefront-skeleton--media"></div>
          <div class="storefront-card__body"><div class="storefront-skeleton storefront-skeleton--line"></div></div>
        </div>
      </shopify-context>`).join('');
  }

  function setShopState(grid, status, empty, label, renderId) {
    const finish = (reason) => {
      if (grid.dataset.renderId !== renderId) return;
      const cards = Array.from(grid.querySelectorAll('.storefront-card:not(.storefront-card--skeleton)'))
        .filter((card) => !card.closest('[data-storefront-source][hidden]')).length;
      const hasLoadedSource = Array.from(grid.querySelectorAll('[data-storefront-source]'))
        .some((source) => !source.hidden && source.hasAttribute('shopify-content-loaded'));
      const currentLabel = grid.dataset.activeLabel || label;

      if (cards > 0) {
        status.textContent = `Showing ${cards} ${cards === 1 ? 'product' : 'products'}${currentLabel ? ` for ${currentLabel}` : ''}.`;
        empty.hidden = true;
        grid.dataset.state = 'ready';
        grid.setAttribute('aria-busy', 'false');
      } else if (hasLoadedSource) {
        status.textContent = `No published products found${currentLabel ? ` for ${currentLabel}` : ''}.`;
        empty.hidden = false;
        empty.dataset.kind = 'empty';
        grid.dataset.state = 'empty';
        grid.setAttribute('aria-busy', 'false');
      } else if (reason === 'timeout') {
        status.textContent = 'The live apothecary could not be reached.';
        empty.hidden = false;
        empty.dataset.kind = 'error';
        grid.dataset.state = 'error';
        grid.setAttribute('aria-busy', 'false');
      }
    };

    const observer = new MutationObserver(() => window.setTimeout(() => finish('update'), 50));
    observer.observe(grid, { attributes: true, childList: true, subtree: true });
    window.setTimeout(() => {
      finish('timeout');
      observer.disconnect();
    }, COMPONENT_TIMEOUT);
  }

  function updateShopUrl(slug, type) {
    const url = new URL(window.location.href);
    if (type) {
      url.searchParams.set('type', type);
      url.searchParams.delete('concern');
    } else if (slug === 'all') {
      url.searchParams.delete('concern');
      url.searchParams.delete('type');
    } else {
      url.searchParams.set('concern', slug);
      url.searchParams.delete('type');
    }
    window.history.replaceState({}, '', url);
  }

  function initShop() {
    const grid = document.querySelector('[data-shop-grid]');
    const filters = document.querySelector('[data-shop-filters]');
    const status = document.querySelector('[data-shop-status]');
    const empty = document.querySelector('[data-shop-empty]');
    if (!grid || !filters || !status || !empty) return;

    filters.innerHTML = CONCERN_FILTERS.map((filter) => `
      <button class="filter" type="button" data-concern="${filter.slug}" aria-pressed="false">
        ${filter.label}
      </button>`).join('');

    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get('type') || '';
    const requestedCollection = TYPE_COLLECTIONS[requestedType];
    const requestedConcern = params.get('concern') || 'all';
    const renderId = 'physical-1';

    grid.dataset.renderId = renderId;
    grid.dataset.state = 'loading';
    grid.setAttribute('aria-busy', 'true');
    empty.hidden = true;

    const applyConcernFilter = (slug, syncUrl = true) => {
      const filter = CONCERN_FILTERS.find((item) => item.slug === slug) || CONCERN_FILTERS[0];
      const handles = filter.products || PHYSICAL_PRODUCT_HANDLES;
      const label = filter.slug === 'all' ? '' : filter.label;
      grid.dataset.activeLabel = label;

      grid.querySelectorAll('[data-storefront-source][type="product"]').forEach((context) => {
        context.hidden = !handles.includes(context.getAttribute('handle'));
      });
      filters.querySelectorAll('[data-concern]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.concern === filter.slug));
      });

      if (grid.dataset.state === 'ready') {
        const count = Array.from(grid.querySelectorAll('.storefront-card:not(.storefront-card--skeleton)'))
          .filter((card) => !card.closest('[data-storefront-source][hidden]')).length;
        status.textContent = `Showing ${count} ${count === 1 ? 'product' : 'products'}${label ? ` for ${label}` : ''}.`;
      } else {
        status.textContent = `Loading live physical products${label ? ` for ${label}` : ''}…`;
      }

      if (syncUrl) updateShopUrl(filter.slug, '');
    };

    if (requestedCollection) {
      grid.dataset.activeLabel = requestedCollection.label;
      status.textContent = `Loading live products for ${requestedCollection.label}…`;
      renderCollection(grid, requestedCollection.handle);
      filters.querySelectorAll('[data-concern]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
      setShopState(grid, status, empty, requestedCollection.label, renderId);
    } else {
      renderProductHandles(grid, PHYSICAL_PRODUCT_HANDLES);
      applyConcernFilter(requestedConcern, false);
      setShopState(grid, status, empty, grid.dataset.activeLabel, renderId);
    }

    filters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-concern]');
      if (!button) return;
      if (requestedCollection) {
        window.location.href = `shop.html?concern=${encodeURIComponent(button.dataset.concern)}`;
      } else {
        applyConcernFilter(button.dataset.concern);
      }
    });

    const editorialSections = [
      {
        grid: document.querySelector('[data-ebooks-grid]'),
        status: document.querySelector('[data-ebooks-status]'),
        empty: document.querySelector('[data-ebooks-empty]'),
        label: 'E-books',
        handles: EBOOK_PRODUCT_HANDLES
      },
      {
        grid: document.querySelector('[data-programs-grid]'),
        status: document.querySelector('[data-programs-status]'),
        empty: document.querySelector('[data-programs-empty]'),
        label: 'Health Programs',
        handles: PROGRAM_PRODUCT_HANDLES
      }
    ];

    editorialSections.forEach((section, index) => {
      if (!section.grid || !section.status || !section.empty) return;
      const renderId = `editorial-${index + 1}`;
      section.grid.dataset.renderId = renderId;
      section.grid.dataset.state = 'loading';
      section.grid.setAttribute('aria-busy', 'true');
      section.status.textContent = `Loading live ${section.label.toLowerCase()}…`;
      renderProductHandles(section.grid, section.handles, { cardClass: 'storefront-card--editorial' });
      setShopState(section.grid, section.status, section.empty, section.label, renderId);
    });
  }

  function addToCart(event) {
    const cart = document.getElementById('storefront-cart');
    if (!cart || typeof cart.addLine !== 'function') {
      showStorefrontNotice('The live bag is temporarily unavailable. Please try the Shopify store directly.');
      return;
    }

    try {
      cart.addLine(event).showModal();
    } catch (error) {
      showStorefrontNotice('This item could not be added just now. Please try again.');
    }
  }

  function buyNow(event) {
    const store = document.querySelector('[data-storefront-config]');
    if (!store || typeof store.buyNow !== 'function') {
      showStorefrontNotice('Checkout is temporarily unavailable. Please try the Shopify store directly.');
      return;
    }

    try {
      store.buyNow(event, '_top');
    } catch (error) {
      showStorefrontNotice('Checkout could not open just now. Please try again.');
    }
  }

  function openCart() {
    const cart = document.getElementById('storefront-cart');
    if (cart && typeof cart.showModal === 'function') cart.showModal();
    else showStorefrontNotice('The live bag is temporarily unavailable.');
  }

  function showStorefrontNotice(message) {
    const notice = document.querySelector('[data-storefront-notice]');
    if (!notice) return;
    notice.textContent = message;
    notice.hidden = false;
    window.clearTimeout(showStorefrontNotice.timer);
    showStorefrontNotice.timer = window.setTimeout(() => { notice.hidden = true; }, 5000);
  }

  function initProductLinks() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('[data-storefront-product-link]');
      if (!link) return;
      const handle = link.dataset.productHandle;
      if (!handle) return;
      event.preventDefault();
      window.location.href = `product.html?product=${encodeURIComponent(handle)}`;
    });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('[data-journal-article-link]');
      if (!link || !link.dataset.articleHandle) return;
      event.preventDefault();
      window.location.href = `${STOREFRONT_CONFIG.storeDomain}/blogs/${STOREFRONT_CONFIG.blogHandle}/${encodeURIComponent(link.dataset.articleHandle)}`;
    });
  }

  function journalCardTemplate() {
    return `
      <article class="journal-card">
        <a
          class="journal-card__media"
          href="${STOREFRONT_CONFIG.storeDomain}/blogs/${STOREFRONT_CONFIG.blogHandle}"
          data-journal-article-link
          shopify-attr--data-article-handle="article.handle"
        >
          <shopify-media query="article.image" width="900" aspect-ratio="1.45" layout="constrained" sizes="(max-width: 720px) 92vw, 45vw"></shopify-media>
        </a>
        <div class="journal-card__body">
          <p class="eyebrow"><shopify-data query="article.publishedAt"></shopify-data></p>
          <h2><shopify-data query="article.title"></shopify-data></h2>
          <p><shopify-data query="article.excerpt"></shopify-data></p>
          <a
            class="storefront-text-link"
            href="${STOREFRONT_CONFIG.storeDomain}/blogs/${STOREFRONT_CONFIG.blogHandle}"
            data-journal-article-link
            shopify-attr--data-article-handle="article.handle"
          >Read field note <span aria-hidden="true">↗</span></a>
        </div>
      </article>`;
  }

  function initJournal() {
    const feed = document.querySelector('[data-journal-feed]');
    const status = document.querySelector('[data-journal-status]');
    const empty = document.querySelector('[data-journal-empty]');
    if (!feed || !status || !empty) return;

    feed.innerHTML = `
      <shopify-context data-journal-context type="blog" handle="${STOREFRONT_CONFIG.blogHandle}">
        <template>
          <div class="journal-live-heading">
            <p class="eyebrow">Connected Shopify journal</p>
            <h2><shopify-data query="blog.title"></shopify-data></h2>
            <p><shopify-data query="blog.description"></shopify-data></p>
          </div>
          <shopify-list-context data-journal-list type="article" query="blog.articles" first="12">
            <template>${journalCardTemplate()}</template>
            <div class="journal-loading" shopify-loading-placeholder aria-label="Loading journal entries">
              <div class="storefront-skeleton storefront-skeleton--feature"></div>
              <div class="storefront-skeleton storefront-skeleton--feature"></div>
            </div>
          </shopify-list-context>
        </template>
        <div class="journal-loading" shopify-loading-placeholder aria-label="Connecting to the journal">
          <div class="storefront-skeleton storefront-skeleton--feature"></div>
          <div class="storefront-skeleton storefront-skeleton--feature"></div>
        </div>
      </shopify-context>`;

    const finish = (reason) => {
      const cards = feed.querySelectorAll('.journal-card').length;
      const blogLoaded = Boolean(feed.querySelector('[data-journal-context][shopify-content-loaded]'));
      if (cards > 0) {
        status.textContent = `${cards} published ${cards === 1 ? 'field note' : 'field notes'}.`;
        empty.hidden = true;
      } else if (blogLoaded) {
        status.textContent = 'The journal is connected. No articles are published yet.';
        empty.hidden = false;
        empty.dataset.kind = 'empty';
      } else if (reason === 'timeout') {
        status.textContent = 'The Shopify journal could not be reached.';
        empty.hidden = false;
        empty.dataset.kind = 'error';
      }
    };

    const observer = new MutationObserver(() => window.setTimeout(() => finish('update'), 50));
    observer.observe(feed, { attributes: true, childList: true, subtree: true });
    window.setTimeout(() => {
      finish('timeout');
      observer.disconnect();
    }, COMPONENT_TIMEOUT);
  }

  function ensureJournalLinks() {
    const desktopLearn = Array.from(document.querySelectorAll('.desktop-nav .drop-trigger'))
      .find((button) => button.textContent.trim() === 'Learn');
    const dropdown = desktopLearn?.closest('.nav-item')?.querySelector('.dropdown');
    if (dropdown && !dropdown.querySelector('a[href="journal.html"]')) {
      const link = document.createElement('a');
      link.href = 'journal.html';
      link.textContent = 'Journal';
      dropdown.append(link);
    }

    const mobileNav = document.querySelector('.mobile-sheet nav');
    if (mobileNav && !mobileNav.querySelector('a[href="journal.html"]')) {
      const link = document.createElement('a');
      link.className = 'mobile-sub';
      link.href = 'journal.html';
      link.textContent = 'Journal';
      mobileNav.append(link);
    }

    const footerLearn = Array.from(document.querySelectorAll('.footer-col'))
      .find((column) => column.querySelector('h3')?.textContent.trim() === 'Learn');
    const footerList = footerLearn?.querySelector('ul');
    if (footerList && !footerList.querySelector('a[href="journal.html"]')) {
      const item = document.createElement('li');
      item.innerHTML = '<a href="journal.html">Journal</a>';
      footerList.append(item);
    }
  }

  function boot() {
    configureStores();
    ensureJournalLinks();
    initProductLinks();
    initJournal();
    document.documentElement.dataset.storefrontConfigured = 'true';
  }

  window.KawsaypacStorefront = Object.freeze({
    addToCart,
    buyNow,
    initShop,
    openCart,
    showStorefrontNotice,
    storeDomain: STOREFRONT_CONFIG.storeDomain
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
