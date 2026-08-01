(function () {
  'use strict';

  const DEFAULT_HANDLE = 'zapped-in';
  const DATA = window.KAWSAYPAC_PRODUCTS || {};
  const ALIASES = window.KAWSAYPAC_PRODUCT_ALIASES || {};
  const SHOPIFY = window.KAWSAYPAC_SHOPIFY || {};

  /* Client keeps the full-bleed cinematic band ONLY on herbs with real jungle
     footage. Her forthcoming list is a one-line change here. */
  const KEEP_CINEMATIC = ['guayusa-leaf', 'cats-claw'];
  const CINEMA_VIDEO = {
    'guayusa-leaf': 'assets/video/pdp/guayusa-jungle.mp4',
    'cats-claw': 'assets/video/pdp/cats-claw-jungle.mp4'
  };

  /* Digital/ebook handles route to ebook.html, never this template. */
  const DIGITAL_HANDLES = [
    'gut-harmony',
    'fearless-fruit-detox',
    '7-day-fruit-detox',
    '30-day-raw-reset',
    '10-day-transitional-detox',
    'free-lets-get-raw-a-3-day-raw-alkaline-plant-based-experience',
    'r-a-w-by-law-the-uncookbook-of-135-rawfully-tasty-colorful-sun-food-recipes',
    'the-electric-eats-cookbook-130-electrifyingly-delicious-easy-to-make-plant-based-recipes',
    'from-our-feed-to-your-kitchen-50-plant-based-recipes-inspired-by-dr-sebis-cell-food-guide-e-book',
    'alkaline-vegan-dishes-top-10-favorites-from-our-kitchen-to-yours'
  ];

  /* Loox (their live Shopify review app). */
  const LOOX_KEY = 'Dno6nRon81';
  const LOOX_SHOP = 'the-electric-eats.myshopify.com';
  const LOOX_SCRIPT = `https://loox.io/widget/${LOOX_KEY}/loox.1678282618137.js?shop=${LOOX_SHOP}`;

  /* Cache-bust local assets only; Shopify CDN urls already carry their own ?v=.
     CDN urls also get a width param so the gallery never waits on a 2500px source PNG. */
  const ASSET_V = 40;
  function vsrc(src) {
    src = String(src || '');
    if (src.indexOf('cdn.shopify.com') !== -1 && src.indexOf('width=') === -1) {
      return src + (src.indexOf('?') === -1 ? '?' : '&') + 'width=1600';
    }
    return src.indexOf('?') === -1 ? `${src}?v=${ASSET_V}` : src;
  }
  function shopifyHandleFor(p) { return (SHOPIFY[p.slug] || {}).handle || p.slug; }

  // Products that exist in the shop but have no approved landing doc yet.
  const EXTRA = {
    'ritual-bundle': {
      slug: 'ritual-bundle', name: 'Daily Ritual Bundle', tag: 'Bundle', price: '$86.00',
      image: 'assets/img/chip-cup.webp',
      subline: 'Morning, after-meal, and evening rituals in one set',
      description: 'Three complementary blends for morning, after-meal, and evening rituals. Exact contents are listed before the Shopify connection is activated.',
      benefits: ['Three-part daily rhythm', 'Bundled education', 'Gift-ready'],
      crossSell: ['Zapped In', 'Bowel Balance', 'Scales of Balance']
    },
    'ebook-preparation': {
      slug: 'ebook-preparation', name: 'The Herbal Preparation Book', tag: 'eBook', price: '$18.00',
      image: 'assets/img/new/kawsaypac-herbal-field-journal.webp',
      subline: 'A digital field guide to infusions and decoctions',
      description: 'A digital field guide to infusions, decoctions, timing, and responsible use. Instant download. No physical ingredients or medical claims.',
      benefits: ['Instant digital guide', 'Clear preparation methods', 'Printable references'],
      crossSell: ["Cat's Claw", 'Guayusa', 'Sacred Sacral']
    }
  };

  const CATALOG = {};
  Object.keys(DATA).forEach((k) => { CATALOG[k] = DATA[k]; });
  Object.keys(EXTRA).forEach((k) => { CATALOG[k] = CATALOG[k] || EXTRA[k]; });

  const SCENIC = {
    'Single Herb': 'assets/img/gen/texture-botanical-macro.webp',
    'Herbal Blend': 'assets/img/gen2/tea-brew-strip.webp',
    "Women's Wellness": 'assets/img/gen/story-morning-ritual.webp',
    'Kit': 'assets/img/gen/story-morning-ritual.webp'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function dots(s) { return String(s || '').split('·').map((x) => x.trim()).filter(Boolean); }
  /* Pull a specific custom pdp shot (02-editorial / 03-macro / 04-ritual) with a graceful fallback. */
  function galleryShot(p, marker, fallback) {
    const custom = (window.KAWSAYPAC_PDP_GALLERY || {})[p.slug] || [];
    return custom.find((x) => x.indexOf(marker) !== -1) || fallback;
  }

  function handleFromUrl() {
    const requested = new URLSearchParams(window.location.search).get('product');
    if (!requested) return DEFAULT_HANDLE;
    // Malformed handles resolve to nothing; boot() sends them to shop.html.
    if (!/^[a-z0-9][a-z0-9-]{0,120}$/.test(requested)) return '';
    return ALIASES[requested] || requested;
  }

  function toast(message) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.setAttribute('role', 'status');
      document.body.append(t);
    }
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 3800);
  }

  function normName(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function findSlugByName(name) {
    const n = normName(name);
    if (!n) return null;
    const special = [
      [/eliminate|regenerate|detox kit/, 'eliminate-regenerate'],
      [/his fertile|men'?s? (kit|herbal)|fertile fires?/, 'mens-kit'],
      [/her fertile|her sacred|women'?s? (kit|herbal)|fertile waters|sacred cycle/, 'womens-kit'],
      [/guayusa/, 'guayusa-leaf'],
      [/cat'?s? claw/, 'cats-claw']
    ];
    for (const [re, slug] of special) if (re.test(n)) return CATALOG[slug] ? slug : null;
    for (const slug of Object.keys(CATALOG)) {
      const cn = normName(CATALOG[slug].name);
      if (cn === n || cn.indexOf(n) !== -1 || n.indexOf(cn) !== -1) return slug;
    }
    return null;
  }

  const CHECK_ICON = '<svg class="pp-pill-check" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6.8 11.4l2.8 2.8 5.4-6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z"/></svg>';

  /* ---------- section 1: hero (Rhode card + dotted benefit pills + short accordion) ---------- */

  function starRow(count) {
    return `<span class="pp-stars" aria-label="Rated 5 out of 5 stars">${STAR.repeat(5)}</span><span class="pp-star-note">${count ? count + ' verified reviews' : 'Loved by the Kawsaypac community'}</span>`;
  }

  function cleanUse(u) {
    return String(u || '').replace(/^USE:\s*/i, '').replace(/\s*-\s*$/, '').trim();
  }

  function heroAccordion(p) {
    const items = [];
    if (p.benefits && p.benefits.length) {
      items.push({ label: 'Benefits', html: `<ul class="pp-hacc-list">${p.benefits.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` });
    }
    const use = cleanUse(p.use);
    if (use) items.push({ label: 'Use', html: `<p>${esc(use)}</p>` });
    if (p.actives && p.actives.length) {
      items.push({ label: 'Active Components', html: `<ul class="pp-hacc-list pp-hacc-actives">${p.actives.map((a) => `<li><strong>${esc(a.name)}</strong>${a.role ? `<span>${esc(a.role)}</span>` : ''}</li>`).join('')}</ul>` });
    }
    if (!items.length) return '';
    return `<div class="pp-hero-acc pp-accordion" data-accordion data-hero-accordion>
      ${items.map((it) => `
      <div class="pp-acc-item">
        <button type="button" class="pp-acc-btn" aria-expanded="false"><span>${esc(it.label)}</span><i aria-hidden="true"></i></button>
        <div class="pp-acc-body">${it.html}</div>
      </div>`).join('')}
    </div>`;
  }

  /* Hero gallery: frame 1 (and 2) are the product's REAL Shopify CDN images,
     hotlinked from their own store. The local assets/img/pdp/<slug>/ scenes
     (02-editorial / 03-macro / 04-ritual) stay as secondary styled frames.
     No pool padding, ever. */
  function galleryFor(p) {
    const cdn = ((SHOPIFY[p.slug] || {}).images || []);
    const custom = (window.KAWSAYPAC_PDP_GALLERY || {})[p.slug] || [];
    const shots = cdn.map((src) => ({ src: vsrc(src), alt: `${p.name} by Kawsaypac` }));
    if (!shots.length) shots.push({ src: vsrc(p.image), alt: `${p.name} by Kawsaypac` });
    custom.forEach((x) => shots.push({ src: vsrc(x), alt: `${p.name} styled by Kawsaypac` }));
    return shots.slice(0, 5);
  }
  function heroGallery(p) {
    const shots = galleryFor(p);
    const thumbs = shots.map((s, i) => `<button type="button" class="pp-thumb${i === 0 ? ' is-active' : ''}" data-thumb="${i}" aria-label="View image ${i + 1} of ${shots.length}"><img src="${esc(s.src)}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async"></button>`).join('');
    return `
        <div class="pp-hero-media" data-gallery>
          <div class="pp-hero-frame">
            ${shots.map((s, i) => `<img class="pp-hero-shot${i === 0 ? ' is-active' : ''}" data-shot="${i}" src="${esc(s.src)}" alt="${esc(s.alt)}" width="900" height="900" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`).join('')}
            <span class="pp-hero-badge">Wild-harvested · Ecuador</span>
          </div>
          ${shots.length > 1 ? `<div class="pp-thumbs" role="tablist" aria-label="Product images">${thumbs}</div>` : ''}
        </div>`;
  }

  function heroSection(p) {
    const pills = (p.pills || []).map((x) => `<span class="pp-pill">${CHECK_ICON}<span>${esc(x)}</span></span>`).join('');
    const size = p.size ? `<span class="pp-size">${esc(p.size)} pouch</span>` : '';
    const priceLabel = p.price ? ` · ${esc(p.price)}` : '';
    return `
    <section class="pp-hero" data-sec="hero">
      <div class="pp-shell pp-hero-grid">
        ${heroGallery(p)}
        <div class="pp-hero-card">
          <nav class="pp-crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="shop.html">Shop</a><span>/</span><span>${esc(p.tag || 'Herbal Ritual')}</span></nav>
          <h1>${esc(p.name)}</h1>
          ${p.subline ? `<p class="pp-subline">${esc(p.subline)}</p>` : ''}
          <div class="pp-star-row">${starRow((p.reviews || []).length)}</div>
          ${pills ? `<div class="pp-pills">${pills}</div>` : ''}
          ${p.description ? `<p class="pp-lede">${esc(p.description)}</p>` : ''}
          <div class="pp-price-row"><strong class="pp-price">${esc(p.price || '')}</strong>${size}</div>
          <div class="pp-buy-row">
            <div class="pp-qty" data-qty>
              <button type="button" data-qty-minus aria-label="Decrease quantity">&minus;</button>
              <output data-qty-value aria-live="polite">1</output>
              <button type="button" data-qty-plus aria-label="Increase quantity">+</button>
            </div>
            <button class="pp-add btn btn-primary" type="button" data-add-ritual>Add to Cart${priceLabel}</button>
          </div>
          ${heroAccordion(p)}
          <div class="pp-assure"><span>Small-batch care</span><span>Direct trade</span><span>No fillers, no capsules</span></div>
        </div>
      </div>
    </section>`;
  }

  /* ---------- section 2: cinematic band (KEEP_CINEMATIC herbs only, real jungle video) ---------- */

  function cinematicSection(p) {
    if (KEEP_CINEMATIC.indexOf(p.slug) === -1 || !CINEMA_VIDEO[p.slug]) return '';
    const line = p.cinematic || p.subline || p.name;
    return `
    <section class="pp-cinema" data-sec="cinematic">
      <video class="pp-cinema-video" data-cinema-video muted loop playsinline autoplay preload="auto" aria-hidden="true">
        <source src="${esc(CINEMA_VIDEO[p.slug])}" type="video/mp4">
      </video>
      <div class="pp-cinema-scrim" aria-hidden="true"></div>
      <p class="pp-cinema-line">${esc(line)}</p>
    </section>`;
  }

  /* ---------- section 3: one-line claim + ruled label rows ---------- */

  function claimSection(p) {
    const c = p.claim || {};
    if (!c.text && !c.usedFor) return '';
    const rows = [
      ['Used for', c.usedFor],
      ['How it helps', c.howItHelps],
      ["What's inside", c.whatsInside],
      ['The science says', c.scienceSays],
      ['FYI', c.fyi]
    ].filter((r) => r[1]);
    const scenic = SCENIC[p.tag] || SCENIC['Herbal Blend'];
    return `
    <section class="pp-claim" data-sec="claim">
      <div class="pp-shell pp-claim-grid">
        <div class="pp-claim-copy">
          <p class="pp-eyebrow">Why ${esc(p.name)}</p>
          ${c.text ? `<h2>${esc(c.text)}</h2>` : ''}
          <dl class="pp-claim-rows">
            ${rows.map(([label, val]) => `
            <div class="pp-claim-row">
              <dt>${esc(label)}:</dt>
              <dd>${dots(val).length > 1 ? dots(val).map(esc).join(' · ') : esc(val)}</dd>
            </div>`).join('')}
          </dl>
        </div>
        <figure class="pp-claim-media"><img src="${esc(scenic)}?v=31" alt="Kawsaypac herbal preparation" loading="lazy" width="720" height="900"></figure>
      </div>
    </section>`;
  }

  /* ---------- infographics (pure SVG/CSS, per product archetype) ---------- */

  function polar(cx, cy, r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }
  function arcPath(cx, cy, rOut, rIn, a0, a1) {
    const [x0, y0] = polar(cx, cy, rOut, a0), [x1, y1] = polar(cx, cy, rOut, a1);
    const [x2, y2] = polar(cx, cy, rIn, a1), [x3, y3] = polar(cx, cy, rIn, a0);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${rOut} ${rOut} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} A${rIn} ${rIn} 0 ${large} 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z`;
  }

  /* Each compound's long-form description lives in the product doc's
     highlights cards. Match by name so the wheel carries the full story
     (the separate "Inside Every Cup" text section is gone: client call). */
  function compoundDetail(p, a, i) {
    const cards = ((p.highlights || {}).cards || []);
    const key = normName(a.name);
    const hit = cards.find((c) => normName(c.title) === key) || cards[i];
    return hit ? hit.body : (a.role || '');
  }

  function wheelInfographic(p) {
    // Kits carry no chemical actives; their wheel segments are the blends in
    // the kit (title + timing tag from the doc's kit cards).
    let acts = (p.actives || []).filter((a) => a.name);
    const isKit = !acts.length;
    if (isKit) {
      acts = (((p.highlights || {}).cards) || [])
        .filter((c) => c.title)
        .map((c) => ({ name: c.title, role: c.tag || '' }));
    }
    if (!acts.length) return systemsInfographic(p);
    const wheelLabel = isKit ? 'kit wheel' : 'compound wheel';
    const colors = ['#143b28', '#d7ae36', '#2c5a40', '#b8922a', '#3f7355', '#8a6d1f'];
    const n = acts.length, gap = 3;
    let segs = '';
    for (let i = 0; i < n; i++) {
      const a0 = (360 / n) * i + gap / 2, a1 = (360 / n) * (i + 1) - gap / 2;
      segs += `<path class="pp-wseg" data-widx="${i}" style="--i:${i}" d="${arcPath(150, 150, 130, 84, a0, a1)}" fill="${colors[i % colors.length]}" opacity="0.94"><title>${esc(acts[i].name || '')}</title></path>`;
      const [lx, ly] = polar(150, 150, 107, (a0 + a1) / 2);
      segs += `<text class="pp-wheel-num pp-wseg" data-widx="${i}" style="--i:${i}" x="${lx.toFixed(0)}" y="${ly.toFixed(0)}" text-anchor="middle" dominant-baseline="middle">${i + 1}</text>`;
    }
    const legend = acts.map((a, i) => `
      <li class="pp-comp${i === 0 ? ' open' : ''}" data-widx="${i}">
        <button type="button" class="pp-comp-btn" data-comp-btn="${i}" aria-expanded="${i === 0 ? 'true' : 'false'}">
          <span class="pp-legend-dot" style="background:${colors[i % colors.length]}">${i + 1}</span>
          <span class="pp-comp-meta"><strong>${esc(a.name)}</strong>${a.role ? `<span>${esc(a.role)}</span>` : ''}</span>
          <i class="pp-comp-chev" aria-hidden="true"></i>
        </button>
        <div class="pp-comp-body"><p>${esc(compoundDetail(p, a, i))}</p></div>
      </li>`).join('');
    const h = p.highlights || {};
    return `
    <section class="pp-band pp-info" data-sec="infographic">
      <div class="pp-shell pp-info-grid">
        <div class="pp-info-visual" data-wheel>
          <svg viewBox="0 0 300 300" role="img" aria-label="Active compound wheel for ${esc(p.name)}: tap a segment to read what each compound does">
            <circle cx="150" cy="150" r="140" fill="none" stroke="#d7ae36" stroke-width="1" stroke-dasharray="2 6"/>
            ${segs}
            <text x="150" y="143" text-anchor="middle" class="pp-wheel-center">${esc(p.name.split(' ')[0])}</text>
            <text x="150" y="163" text-anchor="middle" class="pp-wheel-center-sub">${wheelLabel}</text>
          </svg>
          <p class="pp-wheel-hint">Tap a segment to open its compound</p>
        </div>
        <div class="pp-info-copy">
          <p class="pp-eyebrow">${isKit ? 'Inside your kit' : 'Inside every cup'}</p>
          <h2>${esc(h.heading || 'The ' + p.name + ' ' + wheelLabel)}${/[.?!:]$/.test(h.heading || '') ? '' : '.'}</h2>
          <p class="pp-sub">${esc(h.subtext || (isKit ? 'Each blend in this kit holds a fixed place in your day. Together they make the full protocol.' : 'Each active compound in this pouch carries a different job. Together they make the full effect.'))}</p>
          <ul class="pp-legend pp-legend-inter pp-seq">${legend}</ul>
        </div>
      </div>
    </section>`;
  }

  function systemsInfographic(p) {
    const steps = dots((p.claim || {}).howItHelps);
    if (!steps.length) return '';
    const chips = dots((p.claim || {}).usedFor).slice(0, 8).map((x) => `<span>${esc(x)}</span>`).join('');
    const img = galleryShot(p, '03-macro', 'assets/img/gen/texture-botanical-macro.webp');
    return `
    <section class="pp-band pp-info" data-sec="infographic">
      <div class="pp-shell pp-split">
        <div class="pp-split-copy">
          <p class="pp-eyebrow">Product infographic</p>
          <h2>How ${esc(p.name)} moves through your body.</h2>
          <p class="pp-sub">One cup, ${steps.length} coordinated actions. Follow the pathway.</p>
          <ol class="pp-pathway pp-seq">
            ${steps.map((s, i) => `<li><span class="pp-path-node">${i + 1}</span><p>${esc(s)}</p></li>`).join('')}
          </ol>
          ${chips ? `<div class="pp-path-foot"><h3>Reached systems &amp; concerns</h3><div class="pp-chiprow pp-chiprow-dark">${chips}</div></div>` : ''}
        </div>
        <figure class="pp-split-media"><img src="${esc(img)}?v=33" alt="${esc(p.name)} botanicals in macro detail" loading="lazy" width="720" height="900"></figure>
      </div>
    </section>`;
  }

  function protocolInfographic(p) {
    const slots = (p.bestTime && p.bestTime.length ? p.bestTime : p.results || []).slice(0, 5);
    if (!slots.length) return systemsInfographic(p);
    const icons = ['☀︎', '☼︎', '☾︎', '✦︎', '✧︎'];
    return `
    <section class="pp-band pp-info" data-sec="infographic">
      <div class="pp-shell pp-split pp-split-rev">
        <figure class="pp-split-media"><img src="${esc(galleryShot(p, '04-ritual', 'assets/img/gen/story-morning-ritual.webp'))}?v=33" alt="${esc(p.name)} daily ritual" loading="lazy" width="720" height="900"></figure>
        <div class="pp-split-copy">
          <p class="pp-eyebrow">Product infographic</p>
          <h2>Your day on the ${esc(p.name)}.</h2>
          <p class="pp-sub">A protocol, not a product. Each blend holds a fixed place in your day.</p>
          <div class="pp-protocol pp-protocol-list pp-seq">
            ${slots.map((s, i) => `
            <article class="pp-proto-step">
              <span class="pp-proto-ico" aria-hidden="true">${icons[i % icons.length]}</span>
              <h3>${esc(s.label || 'Step ' + (i + 1))}</h3>
              <p>${esc(s.body)}</p>
            </article>`).join('')}
          </div>
        </div>
      </div>
    </section>`;
  }

  function infographicSection(p) {
    // Every product with named actives gets the interactive compound wheel
    // (it now carries the compound long-copy that used to sit in its own
    // section). Kits render the same wheel from their per-blend kit cards,
    // so that copy survives the section merge.
    if ((p.actives || []).some((a) => a.name)) return wheelInfographic(p);
    if (((p.highlights || {}).cards || []).some((c) => c.title)) return wheelInfographic(p);
    if (p.infographic === 'protocol') return protocolInfographic(p);
    return systemsInfographic(p);
  }

  /* ---------- section 5: how to use (Rhode numbered editorial steps + imagery) ---------- */

  function prepareSection(p) {
    const prep = p.prepare || [];
    if (!prep.length) return '';
    return `
    <section class="pp-band pp-ritual" data-sec="howto">
      <div class="pp-shell pp-howto-grid">
        <figure class="pp-howto-media">
          <img src="assets/img/gen2/tea-brew-strip.webp?v=31" alt="Brewing Kawsaypac herbs" loading="lazy" width="720" height="900">
        </figure>
        <div class="pp-howto-copy">
          <p class="pp-eyebrow">How to use</p>
          <h2>How to prepare ${esc(p.name)}.</h2>
          <ol class="pp-howto-steps">
            ${prep.map((s, i) => `
            <li class="pp-howto-step">
              <span class="pp-howto-num">(0${i + 1})</span>
              <div><h3>${esc(s.label)}</h3><p>${esc(s.body)}</p></div>
            </li>`).join('')}
          </ol>
        </div>
      </div>
    </section>`;
  }

  /* ---------- section 6: best time to drink (tabs) ---------- */

  function bestTimeSection(p) {
    // Kits carry their day-protocol timing in `results`; use it when bestTime is empty.
    const bt = (p.bestTime && p.bestTime.length) ? p.bestTime
      : (p.infographic === 'protocol' ? (p.results || []) : []);
    if (!bt.length) return '';
    const img = galleryShot(p, '04-ritual', 'assets/img/gen2/tea-brew-strip.webp');
    return `
    <section class="pp-band pp-besttime" data-sec="besttime">
      <div class="pp-shell pp-split">
        <div class="pp-split-copy">
          <p class="pp-eyebrow">Timing is part of the medicine</p>
          <h2>Best time to drink.</h2>
          <div class="pp-accordion pp-split-acc" data-accordion>
            ${bt.map((t, i) => `
            <div class="pp-acc-item${i === 0 ? ' open' : ''}">
              <button type="button" class="pp-acc-btn" aria-expanded="${i === 0}"><span>${esc(t.label || 'Ritual ' + (i + 1))}</span><i aria-hidden="true"></i></button>
              <div class="pp-acc-body"><p>${esc(t.body)}</p></div>
            </div>`).join('')}
          </div>
        </div>
        <figure class="pp-split-media"><img src="${esc(img)}?v=33" alt="A ${esc(p.name)} cup in ritual" loading="lazy" width="720" height="900"></figure>
      </div>
    </section>`;
  }

  /* ---------- section 7: condition-specific starred reviews ---------- */

  function reviewsSection(p) {
    const r = (p.reviews || []).slice(0, 3);
    if (!r.length) return '';
    return `
    <section class="pp-band pp-reviews" data-sec="reviews">
      <div class="pp-shell">
        <p class="pp-eyebrow">From the community</p>
        <h2>Real people. Real rituals.</h2>
        <div class="pp-review-grid">
          ${r.map((rv) => `
          <figure class="pp-review">
            <span class="pp-stars pp-stars-sm" aria-label="5 star review">${STAR.repeat(5)}</span>
            <blockquote>&ldquo;${esc(rv.quote)}&rdquo;</blockquote>
            <figcaption>${esc(rv.author)}</figcaption>
          </figure>`).join('')}
        </div>
      </div>
    </section>`;
  }

  /* ---------- section 8: science numbers block (circular study buttons) ---------- */

  function studiesSection(p) {
    const s = p.studies;
    if (!s || !s.items || !s.items.length) return '';
    return `
    <section class="pp-band pp-studies" data-sec="science">
      <div class="pp-shell pp-split">
        <div class="pp-split-copy">
          <p class="pp-eyebrow">Rooted in research</p>
          <h2>${esc(s.heading || 'The research speaks')}${/[.:!?]$/.test(s.heading || '') ? '' : ':'}</h2>
          <div class="pp-study" data-study>
            <div class="pp-study-rows">
              ${s.items.map((it, i) => `
              <article class="pp-study-row${i === 0 ? ' on' : ''}" data-study-row="${i}">
                <button type="button" class="pp-study-row-head" data-study-btn="${i}" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="pp-study-pane-${i}">
                  <span class="pp-study-row-num">0${i + 1}</span>
                  <span class="pp-study-tag">${esc(it.label)}</span>
                  <i class="pp-comp-chev" aria-hidden="true"></i>
                </button>
                <div class="pp-study-row-body" id="pp-study-pane-${i}">
                  <p class="pp-study-body">${esc(it.body)}</p>
                  ${it.link ? `<a class="pp-study-link" href="${esc(it.link)}" target="_blank" rel="noopener">Read the study <span aria-hidden="true">↗</span></a>` : ''}
                </div>
              </article>`).join('')}
            </div>
          </div>
        </div>
        <figure class="pp-split-media pp-study-media">
          ${s.items.map((it, i) => `<img class="pp-study-shot${i === 0 ? ' on' : ''}" data-study-shot="${i}" src="${esc(vsrc(studyShot(p, i)))}" alt="${esc(p.name)} research imagery" ${i === 0 ? '' : 'loading="lazy"'} width="720" height="900">`).join('')}
        </figure>
      </div>
    </section>`;
  }

  /* Each study gets its own visual: cycle the product's custom gallery shots. */
  function studyShot(p, i) {
    const custom = (window.KAWSAYPAC_PDP_GALLERY || {})[p.slug] || [];
    const pool = custom.length ? custom : ['assets/img/gen/texture-botanical-macro.webp', 'assets/img/gen2/apoth-texture.webp', 'assets/img/herbal-infusion.webp'];
    return pool[i % pool.length];
  }

  /* ---------- section 9: per-product villain comparison (from p.comparison) ---------- */

  const MARK_YES = '<svg class="pp-mark pp-mark-yes" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6.8 11.4l2.8 2.8 5.4-6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const MARK_NO = '<svg class="pp-mark pp-mark-no" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M7.4 7.4l7.2 7.2M14.6 7.4l-7.2 7.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';

  /* Accepts the stored doc shape ({header, subtext, columns}) or the fuller
     merge shape ({header, subtext, columns:[...], rows:[{label, values:[bool|string,...]}]}).
     Renders only what the product's own data carries; no data, no section. */
  function normalizeComparison(c) {
    if (!c || typeof c !== 'object') return null;
    const out = {
      header: String(c.header || '').trim(),
      subtext: String(c.subtext || '').trim(),
      columns: Array.isArray(c.columns) ? c.columns.map((x) => String(x || '').trim()).filter(Boolean) : [],
      rows: Array.isArray(c.rows) ? c.rows.map((r) => ({
        label: String((r && r.label) || '').trim(),
        values: Array.isArray(r && r.values) ? r.values : []
      })).filter((r) => r.label || r.values.length) : []
    };
    if (!out.header && !out.subtext && !out.rows.length) return null;
    return out;
  }

  function compareCell(val) {
    if (val === true) return MARK_YES;
    if (val === false || val == null || val === '') return MARK_NO;
    return `<em>${esc(val)}</em>`;
  }

  // Each comparison column carries a small illustrated glyph so the reader can
  // see what they are comparing against (pill bottle for melatonin/supplements,
  // capsules for prescription drugs, a cup for coffee/teas, our herb sprig).
  function compareColIcon(label, isUs) {
    const l = String(label || '').toLowerCase();
    const wrap = (inner) => `<span class="pp-vsx-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg></span>`;
    if (isUs) return wrap('<path d="M16 27V15"/><path d="M16 17c0-5.4 3.8-8.8 9.5-8.8 0 5.7-3.8 8.8-9.5 8.8z" fill="rgba(201,169,66,.18)"/><path d="M16 15c0-4.7-3.2-7.4-8.1-7.4 0 4.9 3.2 7.4 8.1 7.4z" fill="rgba(201,169,66,.18)"/>');
    if (/melatonin|supplement|antacid|inhibitor|laxative|syrup|purifier|cbd|oil/.test(l)) return wrap('<rect x="10" y="11" width="12" height="16" rx="2.4"/><rect x="11.6" y="6.5" width="8.8" height="4.5" rx="1.2"/><circle cx="14" cy="21" r="1.15"/><circle cx="18.2" cy="18.6" r="1.15"/><circle cx="17.6" cy="23.4" r="1.15"/>');
    if (/prescription|medication|benzodiazepine|pill|drug|control/.test(l)) return wrap('<rect x="5.5" y="13.5" width="13" height="6.5" rx="3.25" transform="rotate(-28 12 16.75)"/><path d="M9.4 14.9l5.8 3.1" /><rect x="15" y="17" width="12" height="6" rx="3" transform="rotate(14 21 20)"/>');
    if (/coffee|tea|guayusa|ginseng|ashwagandha|elderberry|massage/.test(l)) return wrap('<path d="M8 12h14v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z"/><path d="M22 14h2.6a3.2 3.2 0 0 1 0 6.4H22"/><path d="M12 8.6c0-1.2 1.4-1.4 1.4-2.6M17 8.6c0-1.2 1.4-1.4 1.4-2.6"/>');
    return wrap('<circle cx="16" cy="16" r="9"/><circle cx="16" cy="16" r="2.2"/>');
  }

  // Render-level brand correction: the approved doc predates the Kawsaypac
  // rename, so its comparison columns still read "The Electric Eats X".
  function brandColumn(label) {
    return String(label || '').replace(/the electric eats/gi, 'Kawsaypac');
  }

  function comparisonSection(p) {
    const c = normalizeComparison(p.comparison);
    if (!c) return '';
    const cols = c.columns;
    const table = (c.rows.length && cols.length) ? `
        <div class="pp-vsx" role="table" aria-label="${esc(c.header || p.name + ' comparison')}" style="--vs-cols:${cols.length}">
          <div class="pp-vsx-row pp-vsx-head" role="row">
            <span class="pp-vsx-label" role="columnheader"><span class="pp-visually-hidden">Benefit</span></span>
            ${cols.map((col, i) => `<span class="pp-vsx-col${i === 0 ? ' pp-vsx-us' : ''}" role="columnheader">${compareColIcon(col, i === 0)}${esc(brandColumn(col))}</span>`).join('')}
          </div>
          ${c.rows.map((r) => `
          <div class="pp-vsx-row" role="row">
            <span class="pp-vsx-label" role="rowheader">${esc(r.label)}</span>
            ${cols.map((col, i) => `<span class="pp-vsx-cell${i === 0 ? ' pp-vsx-us' : ''}" role="cell">${compareCell(r.values[i])}</span>`).join('')}
          </div>`).join('')}
        </div>` : (cols.length ? `
        <div class="pp-vs-strip" aria-label="${esc(p.name)} versus the alternatives">
          ${cols.map((col, i) => i === 0
            ? `<span class="pp-vs-name pp-vs-ours">${esc(brandColumn(col))}</span>`
            : `<span class="pp-vs-sep" aria-hidden="true">vs</span><span class="pp-vs-name">${esc(brandColumn(col))}</span>`).join('')}
        </div>` : '');
    return `
    <section class="pp-band pp-compare" data-sec="compare">
      <div class="pp-shell">
        <div class="pp-center-head">
          <p class="pp-eyebrow">Compare</p>
          ${c.header ? `<h2 class="pp-compare-title">${esc(c.header)}</h2>` : ''}
          <span class="pp-compare-sprig" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21v-8"/><path d="M12 13c0-4 2.8-6.5 7-6.5 0 4.2-2.8 6.5-7 6.5zM12 11.5C12 8 9.6 6 6 6c0 3.6 2.4 5.5 6 5.5z"/></svg></span>
          ${c.subtext ? `<p class="pp-sub">${esc(c.subtext)}</p>` : ''}
        </div>
        ${table}
      </div>
    </section>`;
  }

  /* ---------- section 10: results (two tabs, week story blocks) ---------- */

  function resultsSection(p) {
    const r = p.results || [];
    if (!r.length) return '';
    const half = Math.ceil(r.length / 2);
    const groups = [
      { label: 'The first 14 days', items: r.slice(0, half) },
      { label: 'After 2 weeks', items: r.slice(half) }
    ].filter((g) => g.items.length);
    return `
    <section class="pp-band pp-results" data-sec="results">
      <div class="pp-shell pp-split pp-split-rev">
        <figure class="pp-split-media"><img src="${esc(galleryShot(p, '02-editorial', 'assets/img/gen/story-morning-ritual.webp'))}?v=33" alt="${esc(p.name)} editorial still" loading="lazy" width="720" height="900"></figure>
        <div class="pp-split-copy">
          <p class="pp-eyebrow">What to expect</p>
          <h2>The ${esc(p.name)} timeline.</h2>
          <div class="pp-accordion pp-split-acc" data-accordion>
            ${groups.map((g, i) => `
            <div class="pp-acc-item${i === 0 ? ' open' : ''}">
              <button type="button" class="pp-acc-btn" aria-expanded="${i === 0}"><span>${esc(g.label)}</span><i aria-hidden="true"></i></button>
              <div class="pp-acc-body">
                <ol class="pp-timeline">
                  ${g.items.map((it) => `<li><h3>${esc(it.label)}</h3><p>${esc(it.body)}</p></li>`).join('')}
                </ol>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ---------- section 11: the secret for best results (7 tabs) ---------- */

  // Canonical 7 tabs from the client's doc ("THIS WILL WORK ACROSS ALL PRODUCTS").
  const SECRET7 = [
    { label: 'Meet the plants halfway', body: 'These herbs are powerful. But they work best when your body is ready to receive them. Our herbs are not a substitute for how you live. It is an amplifier of it. The more you support your body through what you eat, how you move, and how you rest, the deeper this plant can go. These plants have carried generations. Meet them halfway and they will carry you further than you expect.' },
    { label: 'What you eat matters', body: 'Reduce processed foods, refined sugars, and alcohol. These are the same things driving the inflammation, hormonal disruption, digestive stress, and immune suppression your herbs are working to address. You cannot pour medicine into a body that keeps creating the conditions for disease.' },
    { label: 'How you move matters', body: 'Gentle, consistent movement keeps your lymphatic system flowing, your digestion active, and your body circulating the plant compounds you are taking in. You do not need intense exercise. A 30-minute walk daily does more for your body than most people realize.' },
    { label: 'How you rest matters', body: "Most healing happens while you sleep. Your herbs work with your body's natural repair cycles, but those cycles require deep, consistent rest to activate. Prioritize 7 to 9 hours. Take your evening cup before bed and let the plants work while you rest." },
    { label: 'What you drink matters', body: 'Stay hydrated. The compounds in your herbs move through your body via water. Dehydration slows absorption, dulls your skin, and makes everything harder. Aim for half your body weight in ounces of liquids daily alongside your herbal practice.' },
    { label: 'What you reduce matters', body: 'Chronic stress, alcohol, smoking, and poor sleep all suppress the very systems your herbs are working to restore. Even small, consistent reductions in these areas make a measurable difference in how quickly and deeply you feel results.' },
    { label: 'What you add REALLY matters', body: 'Breathwork, sunlight, time in nature, and stillness are not luxuries. They are medicine too. Our herbs come from the earth. The closer you stay to it, the better they work.' }
  ];

  function secretSection(p) {
    const s = (p.secret && p.secret.length >= 7) ? p.secret : SECRET7;
    if (!s.length) return '';
    return `
    <section class="pp-band pp-secret" data-sec="secret">
      <div class="pp-shell pp-split">
        <div class="pp-split-copy">
          <p class="pp-eyebrow">The secret for best results</p>
          <h2>Meet the plants halfway.</h2>
          <div class="pp-accordion pp-split-acc" data-accordion>
            ${s.map((it, i) => `
            <div class="pp-acc-item${i === 0 ? ' open' : ''}">
              <button type="button" class="pp-acc-btn" aria-expanded="${i === 0}"><span>${esc(it.label)}</span><i aria-hidden="true"></i></button>
              <div class="pp-acc-body"><p class="pp-secret-par">${esc(it.body)}</p></div>
            </div>`).join('')}
          </div>
        </div>
        <figure class="pp-split-media"><img src="assets/img/gen/closing-sunrise-cup.webp?v=33" alt="Morning herbal ritual at sunrise" loading="lazy" width="720" height="900"></figure>
      </div>
    </section>`;
  }

  /* Sourcing cards section removed on every product (client: repeats the
     homepage sourcing story, reads as mental fatigue). */

  /* ---------- section 13: faq accordion ---------- */

  function faqSection(p) {
    const f = p.faqs || [];
    if (!f.length) return '';
    return `
    <section class="pp-band pp-faq" data-sec="faq">
      <div class="pp-shell pp-split pp-split-rev">
        <figure class="pp-split-media"><img src="${esc(galleryShot(p, '03-macro', 'assets/img/gen2/apoth-texture.webp'))}" alt="${esc(p.name)} botanicals up close" loading="lazy" width="720" height="900"></figure>
        <div class="pp-split-copy">
          <p class="pp-eyebrow">Questions, answered</p>
          <h2>${esc(p.name)} FAQ.</h2>
          <div class="pp-accordion pp-split-acc" data-accordion data-faq>
            ${f.map((it, i) => `
            <div class="pp-acc-item${i === 0 ? ' open' : ''}">
              <button type="button" class="pp-acc-btn" aria-expanded="${i === 0}"><span>${esc(it.q)}</span><i aria-hidden="true"></i></button>
              <div class="pp-acc-body">${it.a.map((par) => `<p>${esc(par)}</p>`).join('')}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ---------- section 14: the upsell (routine context merged onto product cards) ---------- */

  /* Kits and blends are checked FIRST so a step like "Full Detox Support"
     resolves to the Eliminate & Regenerate kit, never to one of its parts
     (client correction, valerian call). */
  const UPSELL_HINTS = [
    [/eliminate\s*(&|and|\+)?\s*regenerate|full detox kit|detox kit/i, 'eliminate-regenerate'],
    [/his fertile fires|fertile fires/i, 'mens-kit'],
    [/her fertile waters|fertile waters|her sacred cycle/i, 'womens-kit'],
    [/sacred sacral/i, 'sacred-sacral'],
    [/scales of balance/i, 'scales-of-balance'],
    [/bowel balance/i, 'bowel-balance'], [/bowel banisher/i, 'bowel-banisher'],
    [/final flush/i, 'final-flush'], [/one way out/i, 'one-way-out'],
    [/river of life/i, 'river-of-life'], [/zapped in/i, 'zapped-in'],
    [/guayusa/i, 'guayusa-leaf'], [/cat'?s claw/i, 'cats-claw'],
    [/chuchuhuasi/i, 'chuchuhuasi'], [/valerian/i, 'valerian'],
    [/soursop/i, 'soursop'], [/matico|cordoncillo/i, 'matico']
  ];

  function upsellImage(slug) {
    const cdn = ((SHOPIFY[slug] || {}).images || [])[0];
    return cdn || vsrc((CATALOG[slug] || {}).image || '');
  }

  function upsellEntries(p) {
    const entries = [];
    const seen = new Set([p.slug]);
    ((p.routine && p.routine.items) || []).forEach((it) => {
      const text = `${it.label || ''} ${it.body || ''}`;
      for (const [re, slug] of UPSELL_HINTS) {
        if (re.test(text) && !seen.has(slug) && CATALOG[slug]) {
          seen.add(slug);
          entries.push({ slug, label: it.label || '', context: it.body || '' });
          break;
        }
      }
    });
    (p.crossSell || []).forEach((name) => {
      if (entries.length >= 3) return;
      const slug = findSlugByName(String(name).replace(/\(.*?\)/g, '').trim());
      if (slug && !seen.has(slug) && CATALOG[slug]) {
        seen.add(slug);
        const q = CATALOG[slug];
        entries.push({ slug, label: 'Pairs well', context: q.subline || (q.description || '').slice(0, 140) });
      }
    });
    return entries.slice(0, 3);
  }

  function upsellSection(p) {
    const entries = upsellEntries(p);
    if (!entries.length) return '';
    const r = p.routine || {};
    return `
    <section class="pp-band pp-upsell" data-sec="upsell">
      <div class="pp-shell">
        <p class="pp-eyebrow">Continue the ritual</p>
        <h2>${esc(r.header || 'Blends that pair with ' + p.name)}${/[.:!?]$/.test(r.header || '') ? '' : '.'}</h2>
        <div class="pp-upsell-grid shop-product-grid">
          ${entries.map((e) => {
            const q = CATALOG[e.slug];
            const href = `product.html?product=${esc(e.slug)}`;
            return `
          <article class="storefront-card">
            <a class="storefront-card__media" href="${href}" aria-label="View ${esc(q.name)}">
              <img src="${esc(upsellImage(e.slug))}" alt="${esc(q.name)}" loading="lazy" width="720" height="720">
            </a>
            <div class="storefront-card__body">
              <p class="storefront-card__stars" aria-label="Customer favorite">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
              <div class="storefront-card__heading">
                <h2>${esc(q.name)}</h2>
                <strong>${esc(q.price || '')}</strong>
              </div>
              <a class="storefront-text-link" href="${href}">View ritual <span aria-hidden="true">&#8599;</span></a>
            </div>
          </article>`;
          }).join('')}
        </div>
        ${r.note ? `<p class="pp-routine-note">${esc(r.note)}</p>` : ''}
      </div>
    </section>`;
  }

  /* ---------- section 15: this product's reviews (Loox live widget, static fallback) ---------- */

  function reviewsAllSection(p) {
    const r = p.reviews || [];
    const handle = shopifyHandleFor(p);
    const writeUrl = `https://theelectriceats.com/products/${encodeURIComponent(handle)}#looxReviews`;
    const VISIBLE = 4; // two rows of the two-column grid
    const seed = slugSeed(p.slug);
    const cards = r.map((rv, i) => `
          <figure class="pp-wall-card pp-wall-has-photo"${i >= VISIBLE ? ' hidden data-review-extra' : ''}>
            <button type="button" class="pp-wall-shot" data-gpic="${ugcForAuthor(rv.author, seed, i)}" aria-label="Open ${esc(rv.author)}'s customer photo"><img loading="lazy" decoding="async" src="${ugcForAuthor(rv.author, seed, i)}" alt="${esc(rv.author)} with their Kawsaypac pouch" width="640" height="800"></button>
            <span class="pp-stars pp-stars-sm" aria-label="5 star review">${STAR.repeat(5)}</span>
            <blockquote>&ldquo;${esc(rv.quote)}&rdquo;</blockquote>
            <figcaption><strong>${esc(rv.author)}</strong><span>${esc(p.name)}</span></figcaption>
          </figure>`).join('');
    if (!r.length && !handle) return '';
    return `
    <section class="pp-band pp-reviews-wall" data-sec="reviews-all" data-gpic-scope>
      <div class="pp-shell">
        <div class="pp-revhead">
          <div>
            <p class="pp-eyebrow">From the community</p>
            <h2>${esc(p.name)} reviews.</h2>
            <div class="pp-star-row">${starRow(r.length)}</div>
          </div>
          <a class="btn pp-write-review" href="${esc(writeUrl)}" target="_blank" rel="noopener">Write a review</a>
        </div>
        <div class="pp-loox" data-loox data-handle="${esc(handle)}" hidden>
          <div id="looxReviews" data-loox-container class="loox-reviews-default"></div>
        </div>
        <div class="pp-wall pp-wall-product" data-static-reviews>
          ${cards}
          ${r.length > VISIBLE ? `<div class="pp-wall-more"><button type="button" class="btn" data-reviews-more>See all ${r.length} reviews</button></div>` : ''}
        </div>
        <div class="pp-ugc-more"><a class="btn btn-primary" href="testimonial-gallery.html">View the full customer gallery</a></div>
      </div>
    </section>`;
  }

  function disclaimerSection() {
    return `
    <section class="pp-disclaimer" data-sec="disclaimer">
      <div class="pp-shell">
        <p>These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. If you are pregnant, nursing, taking medication, or managing a condition, consult a qualified clinician before use. <a href="fda-disclaimer.html">Read the full disclaimer</a>.</p>
      </div>
    </section>`;
  }

  function stickyBar(p) {
    return `
    <div class="pp-sticky" data-sticky>
      <div class="pp-sticky-inner">
        <img src="${esc(vsrc(p.image))}" alt="" width="56" height="56">
        <div class="pp-sticky-meta"><strong>${esc(p.name)}</strong><span>${esc(p.price || '')}</span></div>
        <button class="btn btn-primary pp-add" type="button" data-add-ritual>Add to Cart</button>
      </div>
    </div>`;
  }

  /* ---------- meta ---------- */

  function setMeta(p) {
    // Canonical/OG point at the REAL store handle (differs from our slug on 6 products).
    const url = `https://theelectriceats.com/products/${encodeURIComponent(shopifyHandleFor(p))}`;
    document.title = `${p.name} | Kawsaypac Ancestral Herbs`;
    const md = document.querySelector('meta[name="description"]');
    if (md && p.description) md.setAttribute('content', p.description.slice(0, 158));
    const set = (sel, v) => { const el = document.querySelector(sel); if (el && v) el.setAttribute('content', v); };
    set('#product-og-title', `${p.name} | Kawsaypac`);
    set('#product-og-description', (p.subline || p.description || '').slice(0, 200));
    set('#product-og-url', url);
    const canonical = document.getElementById('product-canonical');
    if (canonical) canonical.href = url;
    const ld = document.getElementById('product-json-ld');
    if (ld) {
      const amount = (p.price || '').replace(/[^0-9.]/g, '');
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Product',
        name: p.name, brand: { '@type': 'Brand', name: 'Kawsaypac' }, url,
        description: p.description || '', image: [p.image],
        offers: amount ? { '@type': 'Offer', url, price: amount, priceCurrency: 'USD', availability: 'https://schema.org/InStock' } : undefined
      });
    }
  }

  /* ---------- interactivity ---------- */

  function initInteractions(root, p) {
    // hero gallery
    const gal = root.querySelector('[data-gallery]');
    if (gal) {
      const shots = gal.querySelectorAll('.pp-hero-shot');
      const thumbs = gal.querySelectorAll('.pp-thumb');
      const show = (i) => {
        shots.forEach((s) => s.classList.toggle('is-active', s.dataset.shot === String(i)));
        thumbs.forEach((t) => t.classList.toggle('is-active', t.dataset.thumb === String(i)));
      };
      thumbs.forEach((t) => t.addEventListener('click', () => show(t.dataset.thumb)));
      // hide any thumb whose image fails so a future manifest entry can never look broken
      thumbs.forEach((t) => { const im = t.querySelector('img'); im.addEventListener('error', () => { t.remove(); }); });
      // Shopify sources arrive in mixed orientations: squarish shots render
      // contained (full image, no forced tall crop) instead of being stretched.
      shots.forEach((im) => {
        // custom pdp scene shots are composed full-bleed and keep the cover
        // crop; this targets the Shopify packshot-style sources only.
        if ((im.getAttribute('src') || '').indexOf('/pdp/') !== -1) return;
        const mark = () => {
          const r = im.naturalWidth / im.naturalHeight;
          // squarish AND portrait packshots (Shopify ships 1:1 and 3:4) render
          // contained; only genuinely tall editorial sources keep the cover crop
          if (r > 0.68 && r < 1.25) im.classList.add('pp-contain');
        };
        if (im.complete && im.naturalWidth) mark();
        else im.addEventListener('load', mark, { once: true });
      });
    }
    // hard equal-height guarantee: the gallery column ends exactly where the
    // buy card ends, never running on into the cinematic band (29 Jul report)
    const mediaEl = root.querySelector('.pp-hero-media');
    const cardEl = root.querySelector('.pp-hero-card');
    if (mediaEl && cardEl) {
      const sync = () => {
        if (window.innerWidth > 960) mediaEl.style.maxHeight = cardEl.offsetHeight + 'px';
        else mediaEl.style.maxHeight = '';
      };
      sync();
      window.addEventListener('resize', sync, { passive: true });
      window.setTimeout(sync, 700);
      if ('ResizeObserver' in window) new ResizeObserver(sync).observe(cardEl);
    }

    // quantity
    const qtyOut = root.querySelector('[data-qty-value]');
    let qty = 1;
    const setQty = (v) => { qty = Math.min(9, Math.max(1, v)); if (qtyOut) qtyOut.textContent = String(qty); };
    root.querySelectorAll('[data-qty-minus]').forEach((b) => b.addEventListener('click', () => setQty(qty - 1)));
    root.querySelectorAll('[data-qty-plus]').forEach((b) => b.addEventListener('click', () => setQty(qty + 1)));

    // add to cart -> toast
    root.querySelectorAll('[data-add-ritual]').forEach((b) => b.addEventListener('click', () => {
      const label = qty > 1 ? `${qty} x ${p.name}` : p.name;
      toast(`${label} added to your ritual bag. Shopify checkout connects at launch.`);
    }));

    // accordions (hero, faq)
    root.querySelectorAll('[data-accordion]').forEach((acc) => {
      acc.querySelectorAll('.pp-acc-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = btn.closest('.pp-acc-item');
          const open = item.classList.toggle('open');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      });
    });

    // tabs (best time, results, secret)
    root.querySelectorAll('[data-tabs]').forEach((tabs) => {
      const btns = Array.from(tabs.querySelectorAll('[data-tab]'));
      const panes = Array.from(tabs.querySelectorAll('.pp-tab-pane'));
      btns.forEach((btn) => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.tab);
        btns.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
        panes.forEach((pn, j) => { pn.classList.toggle('on', j === i); if (j === i) pn.removeAttribute('hidden'); else pn.setAttribute('hidden', ''); });
      }));
    });

    // studies: hovering (desktop) or tapping a row opens it and swaps the section image
    root.querySelectorAll('[data-study]').forEach((wrap) => {
      const rows = Array.from(wrap.querySelectorAll('[data-study-row]'));
      const section = wrap.closest('[data-sec="science"]') || root;
      const shots = Array.from(section.querySelectorAll('[data-study-shot]'));
      const hoverable = window.matchMedia && window.matchMedia('(hover:hover)').matches;
      const open = (i) => {
        rows.forEach((row) => {
          const on = row.dataset.studyRow === String(i);
          row.classList.toggle('on', on);
          const head = row.querySelector('[data-study-btn]');
          if (head) head.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
        shots.forEach((sh) => sh.classList.toggle('on', sh.dataset.studyShot === String(i)));
      };
      rows.forEach((row) => {
        const i = row.dataset.studyRow;
        const head = row.querySelector('[data-study-btn]');
        if (head) head.addEventListener('click', () => open(i));
        if (hoverable) row.addEventListener('mouseenter', () => open(i));
      });
    });

    // compound wheel: click a segment (or its row) to open that compound's story;
    // hover still cross-lights segment <-> row. One compound is open by default.
    const wheelSec = root.querySelector('[data-sec="infographic"]');
    if (wheelSec && wheelSec.querySelector('[data-wheel]')) {
      const segsAll = Array.from(wheelSec.querySelectorAll('svg [data-widx]'));
      const rows = Array.from(wheelSec.querySelectorAll('.pp-legend > [data-widx]'));
      const setHot = (idx) => {
        wheelSec.classList.toggle('pp-wheel-hover', idx !== null);
        segsAll.forEach((s) => s.classList.toggle('is-hot', s.dataset.widx === String(idx)));
        rows.forEach((c) => c.classList.toggle('is-hot', c.dataset.widx === String(idx)));
      };
      const openComp = (idx) => {
        rows.forEach((row) => {
          const on = row.dataset.widx === String(idx);
          row.classList.toggle('open', on);
          const btn = row.querySelector('.pp-comp-btn');
          if (btn) btn.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
        segsAll.forEach((s) => s.classList.toggle('is-open', s.dataset.widx === String(idx)));
      };
      segsAll.forEach((el) => {
        el.addEventListener('click', () => openComp(el.dataset.widx));
        el.addEventListener('mouseenter', () => setHot(el.dataset.widx));
        el.addEventListener('mouseleave', () => setHot(null));
      });
      rows.forEach((row) => {
        const btn = row.querySelector('.pp-comp-btn');
        if (btn) btn.addEventListener('click', () => openComp(row.dataset.widx));
        row.addEventListener('mouseenter', () => setHot(row.dataset.widx));
        row.addEventListener('mouseleave', () => setHot(null));
      });
      openComp(0);
    }

    // cinematic jungle video: autoplay kick for blocked browsers
    const cinema = root.querySelector('[data-cinema-video]');
    if (cinema) {
      const kick = () => { try { if (cinema.readyState === 0) cinema.load(); } catch (e) { /* noop */ } cinema.play().catch(() => {}); };
      kick();
      window.addEventListener('pointerdown', kick, { once: true, passive: true });
      window.addEventListener('scroll', kick, { once: true, passive: true });
    }

    // reviews: "See all reviews" expander
    root.querySelectorAll('[data-reviews-more]').forEach((btn) => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-review-extra]').forEach((el) => el.removeAttribute('hidden'));
        btn.closest('.pp-wall-more').remove();
      });
    });

    // reviews: attempt the live Loox widget; fall back to the static grid.
    initLoox(root);

    // sequential "wheel" reveals: numbered items open 1-2-3-4-5 as they scroll in
    if ('IntersectionObserver' in window) {
      const seqIo = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('pp-seq-in'); seqIo.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -12% 0px' });
      root.querySelectorAll('.pp-seq').forEach((wrap) => {
        Array.from(wrap.children).forEach((kid, i) => { kid.style.transitionDelay = (i * 0.14).toFixed(2) + 's'; });
        wrap.classList.add('pp-seq-ready');
        seqIo.observe(wrap);
      });
    }

    // sticky buy bar
    const sticky = root.querySelector('[data-sticky]');
    if (sticky) {
      const update = () => sticky.classList.toggle('show', window.scrollY > 640);
      window.addEventListener('scroll', update, { passive: true });
      update();
    }

    // gentle reveals (transform only, content always visible)
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('pp-in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      root.querySelectorAll('.pp-band, .pp-claim, .pp-hero-grid').forEach((el) => { el.classList.add('pp-anim'); io.observe(el); });
    }
  }

  /* Decorative sprites are OFF on product pages (client call: no mini
     flowers/leaves on the PDP flanks). The suppression lives in product.css
     scoped to body.pp-body so shared ornament systems stay untouched. */

  /* Loox live reviews: resolve the numeric Shopify product id from the store's
     own /products/<handle>.js endpoint, mount the widget, and only reveal it
     if it actually rendered within ~4s. The static grid is the safety net. */
  function initLoox(root) {
    const wrap = root.querySelector('[data-loox]');
    if (!wrap || !window.fetch) return;
    const handle = wrap.dataset.handle;
    const mount = wrap.querySelector('[data-loox-container]');
    const staticBlock = root.querySelector('[data-static-reviews]');
    if (!handle || !mount) return;
    fetch(`https://theelectriceats.com/products/${encodeURIComponent(handle)}.js`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('product lookup failed'))))
      .then((prod) => {
        if (!prod || !prod.id) throw new Error('no product id');
        mount.setAttribute('data-product-id', String(prod.id));
        const s = document.createElement('script');
        s.src = LOOX_SCRIPT;
        s.async = true;
        document.body.appendChild(s);
        window.setTimeout(() => {
          const rendered = mount.childElementCount > 0 && mount.textContent.trim().length > 0;
          if (rendered) {
            wrap.hidden = false;
            if (staticBlock) staticBlock.hidden = true;
          }
        }, 4000);
      })
      .catch(() => { /* static reviews stay in place */ });
  }


  /* ---------- customer photo picker (UGC pool, per-product deterministic) ---------- */

  /* ---------- customer photo picker: photos match the reviewer ---------- */

  /* Every gallery image classified by the person in it (viewed frame by frame).
     A male reviewer name gets a male photo, everyone else a female photo, so a
     "Kareem W." card can never show a woman again. */
  var UGC_MEN = [1,6,8,9,15,16,18,19,23,34,42,44,46,47,50,53,55,57];
  var UGC_WOMEN = [2,3,4,5,7,10,11,12,13,14,17,20,21,22,24,25,26,27,28,29,30,31,32,33,35,36,37,38,39,40,41,43,45,48,49,51,52,54,56,58,59,60];
  var MALE_FIRST = ['charles','ronnie','shawn','kai','kareem','dan','marty','silas','benjamin','benedict','bernardo','nestor','alex','jerome','solomon','javier','wilson','marcus','samuel','ken','erik','cordell','cam','safir','rhudy'];
  function ugcSrc(n) { return 'assets/img/gallery/ugc-' + (n < 10 ? '0' + n : n) + '.webp'; }
  function slugSeed(slug) {
    var seed = 5381; String(slug).split('').forEach(function (ch) { seed = ((seed * 33) ^ ch.charCodeAt(0)) >>> 0; });
    return seed;
  }
  function ugcForAuthor(author, seed, idx) {
    var first = String(author || '').trim().toLowerCase().split(/\s+/)[0];
    var male = MALE_FIRST.indexOf(first) !== -1;
    var pool = male ? UGC_MEN : UGC_WOMEN;
    var step = male ? 7 : 5; /* both coprime with their pool sizes: no repeats on a page */
    return ugcSrc(pool[(seed + idx * step) % pool.length]);
  }

  /* ---------- boot ---------- */

  function boot() {
    const root = document.querySelector('[data-product-root]');
    if (!root) return;
    const requested = new URLSearchParams(window.location.search).get('product');
    // Digital/ebook handles belong to the ebook template, never this one.
    if (requested && DIGITAL_HANDLES.indexOf(requested) !== -1) {
      window.location.replace(`ebook.html?product=${encodeURIComponent(requested)}`);
      return;
    }
    const slug = handleFromUrl();
    let p = DATA[slug] || EXTRA[slug];
    if (!p) {
      // A requested slug that resolves to nothing goes back to the shop,
      // never to a silently-wrong product.
      if (requested) { window.location.replace('shop.html'); return; }
      p = DATA[DEFAULT_HANDLE];
      if (!p) return;
      p = Object.assign({ slug: DEFAULT_HANDLE }, p);
    } else {
      p = Object.assign({ slug }, p);
    }

    setMeta(p);
    root.insertAdjacentHTML('afterbegin', [
      heroSection(p),          // 1 · hero + real-image gallery, rail outside the frame
      cinematicSection(p),     // 2 · jungle video band (KEEP_CINEMATIC only)
      claimSection(p),         // 3 · why-this-herb ruled rows
      infographicSection(p),   // 4 · interactive compound wheel (carries the compound long-copy)
      prepareSection(p),       // 5 · how to prepare
      bestTimeSection(p),      // 6 · best time to drink
      studiesSection(p),       // 8 · research rows (hover/tap to open)
      comparisonSection(p),    // 9 · per-product villain comparison (data-driven)
      resultsSection(p),       // 10 · what to expect
      secretSection(p),        // 11 · meet the plants halfway
      faqSection(p),           // 12 · faq
      upsellSection(p),        // 13 · routine-context upsell cards (before reviews, Blume)
      reviewsAllSection(p),    // 14 · this product's reviews (Loox live, static fallback)
      disclaimerSection(),
      stickyBar(p)
    ].join('\n'));
    initInteractions(root, p);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
