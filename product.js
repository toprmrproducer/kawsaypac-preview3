(function () {
  'use strict';

  const DEFAULT_HANDLE = 'zapped-in';
  const DATA = window.KAWSAYPAC_PRODUCTS || {};
  const ALIASES = window.KAWSAYPAC_PRODUCT_ALIASES || {};

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

  // Full-bleed cinematic plates (section 2). Sharp landscape plates only
  // (every file >= 1600px wide on disk); deterministic per-slug so pages differ.
  const CINEMA_POOL = [
    'assets/img/bg-cloudforest-edge.webp',
    'assets/img/bg-highlands.webp',
    'assets/img/bg-waterfall.webp',
    'assets/img/bg-amazon-basin.webp',
    'assets/img/bg-paramo-band.webp',
    'assets/img/bg-footer-jungle.webp'
  ];

  // Photographic pool for the Blume-style highlight cards.
  const HIGHLIGHT_POOL = [
    'assets/img/gen/texture-botanical-macro.webp',
    'assets/img/gen2/apoth-texture.webp',
    'assets/img/herbal-infusion.webp',
    'assets/img/gen2/tea-brew-strip.webp',
    'assets/img/gen/story-energy-pouch.webp',
    'assets/img/gen4/cup-sage.webp',
    'assets/img/gen/closing-sunrise-cup.webp',
    'assets/img/gen4/pouch-front.webp'
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function dots(s) { return String(s || '').split('·').map((x) => x.trim()).filter(Boolean); }
  function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

  function handleFromUrl() {
    const requested = new URLSearchParams(window.location.search).get('product') || DEFAULT_HANDLE;
    const safe = /^[a-z0-9][a-z0-9-]{0,120}$/.test(requested) ? requested : DEFAULT_HANDLE;
    return ALIASES[safe] || safe;
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

  /* Hero gallery: REAL product imagery only. Products with approved custom pdp
     shots (assets/img/pdp/<slug>/ via pdp-manifest.js) show product image +
     those shots; every other product shows exactly its own Shopify product
     image, single frame, no thumb rail. No pool padding. */
  function galleryFor(p) {
    const custom = (window.KAWSAYPAC_PDP_GALLERY || {})[p.slug];
    if (custom && custom.length) {
      const shots = custom.map((x) => ({ src: x, alt: `${p.name} by Kawsaypac` }));
      if (!custom.some((x) => x.includes('01-hero'))) shots.unshift({ src: `${p.image}?v=31`, alt: `${p.name} by Kawsaypac` });
      return shots.slice(0, 4);
    }
    return [{ src: `${p.image}?v=31`, alt: `${p.name} by Kawsaypac` }];
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

  /* ---------- section 2: cinematic editorial band ---------- */

  function cinematicSection(p) {
    const line = p.cinematic || p.subline || p.name;
    const custom = (window.KAWSAYPAC_PDP_GALLERY || {})[p.slug] || [];
    const macro = custom.find((x) => x.includes('03-macro'));
    const img = macro || CINEMA_POOL[hashCode(p.slug) % CINEMA_POOL.length];
    return `
    <section class="pp-cinema" data-sec="cinematic">
      <img src="${esc(img)}?v=32" alt="" loading="lazy" width="1800" height="900">
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

  /* ---------- section 4: highlights (Blume photographic cards) ---------- */

  function highlightsSection(p) {
    const h = p.highlights;
    if (!h || !h.cards || !h.cards.length) return '';
    const base = hashCode(p.slug + 'hl');
    return `
    <section class="pp-band pp-highlights" data-sec="highlights">
      <div class="pp-shell">
        <p class="pp-eyebrow">Inside every cup</p>
        ${h.heading ? `<h2>${esc(h.heading)}${/[.?!]$/.test(h.heading) ? '' : '.'}</h2>` : ''}
        ${h.subtext ? `<p class="pp-sub">${esc(h.subtext)}</p>` : ''}
        <div class="pp-hl-grid pp-hl-${Math.min(h.cards.length, 5)}">
          ${h.cards.map((c, i) => `
          <article class="pp-hl-card">
            <figure class="pp-hl-media">
              <img src="${esc(HIGHLIGHT_POOL[(base + i) % HIGHLIGHT_POOL.length])}?v=31" alt="" loading="lazy" width="560" height="640">
              <figcaption>
                <strong>${esc(c.title)}</strong>
                ${c.tag ? `<span>${esc(c.tag)}</span>` : ''}
              </figcaption>
            </figure>
            <p>${esc(c.body)}</p>
          </article>`).join('')}
        </div>
      </div>
    </section>`;
  }

  /* ---------- infographics (kept feature; pure SVG/CSS, per product archetype) ---------- */

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

  function wheelInfographic(p) {
    const acts = (p.actives || []).filter((a) => a.name);
    if (!acts.length) return systemsInfographic(p);
    const colors = ['#143b28', '#d7ae36', '#2c5a40', '#b8922a', '#3f7355', '#8a6d1f'];
    const n = acts.length, gap = 3;
    let segs = '';
    for (let i = 0; i < n; i++) {
      const a0 = (360 / n) * i + gap / 2, a1 = (360 / n) * (i + 1) - gap / 2;
      segs += `<path d="${arcPath(150, 150, 130, 84, a0, a1)}" fill="${colors[i % colors.length]}" opacity="0.94"></path>`;
      const [lx, ly] = polar(150, 150, 107, (a0 + a1) / 2);
      segs += `<text x="${lx.toFixed(0)}" y="${ly.toFixed(0)}" text-anchor="middle" dominant-baseline="middle" class="pp-wheel-num">${i + 1}</text>`;
    }
    const legend = acts.map((a, i) => `
      <li><span class="pp-legend-dot" style="background:${colors[i % colors.length]}">${i + 1}</span>
      <div><strong>${esc(a.name)}</strong>${a.role ? `<span>${esc(a.role)}</span>` : ''}</div></li>`).join('');
    return `
    <section class="pp-band pp-info" data-sec="infographic">
      <div class="pp-shell pp-info-grid">
        <div class="pp-info-visual">
          <svg viewBox="0 0 300 300" role="img" aria-label="Active compound wheel for ${esc(p.name)}">
            <circle cx="150" cy="150" r="140" fill="none" stroke="#d7ae36" stroke-width="1" stroke-dasharray="2 6"/>
            ${segs}
            <text x="150" y="143" text-anchor="middle" class="pp-wheel-center">${esc(p.name.split(' ')[0])}</text>
            <text x="150" y="163" text-anchor="middle" class="pp-wheel-center-sub">compound wheel</text>
          </svg>
        </div>
        <div class="pp-info-copy">
          <p class="pp-eyebrow">Product infographic</p>
          <h2>The ${esc(p.name)} compound wheel.</h2>
          <p class="pp-sub">Each active compound in this pouch carries a different job. Together they make the full effect.</p>
          <ul class="pp-legend">${legend}</ul>
        </div>
      </div>
    </section>`;
  }

  function systemsInfographic(p) {
    const steps = dots((p.claim || {}).howItHelps);
    if (!steps.length) return '';
    const chips = dots((p.claim || {}).usedFor).slice(0, 8).map((x) => `<span>${esc(x)}</span>`).join('');
    return `
    <section class="pp-band pp-info" data-sec="infographic">
      <div class="pp-shell">
        <p class="pp-eyebrow">Product infographic</p>
        <h2>How ${esc(p.name)} moves through your body.</h2>
        <p class="pp-sub">One cup, ${steps.length} coordinated actions. Follow the pathway.</p>
        <ol class="pp-pathway">
          ${steps.map((s, i) => `<li><span class="pp-path-node">${i + 1}</span><p>${esc(s)}</p></li>`).join('')}
        </ol>
        ${chips ? `<div class="pp-path-foot"><h3>Reached systems &amp; concerns</h3><div class="pp-chiprow pp-chiprow-dark">${chips}</div></div>` : ''}
      </div>
    </section>`;
  }

  function protocolInfographic(p) {
    const slots = (p.bestTime && p.bestTime.length ? p.bestTime : p.results || []).slice(0, 5);
    if (!slots.length) return systemsInfographic(p);
    const icons = ['☀︎', '☼︎', '☾︎', '✦︎', '✧︎'];
    return `
    <section class="pp-band pp-info" data-sec="infographic">
      <div class="pp-shell">
        <p class="pp-eyebrow">Product infographic</p>
        <h2>Your day on the ${esc(p.name)}.</h2>
        <p class="pp-sub">A protocol, not a product. Each blend holds a fixed place in your day.</p>
        <div class="pp-protocol">
          ${slots.map((s, i) => `
          <article class="pp-proto-step">
            <span class="pp-proto-ico" aria-hidden="true">${icons[i % icons.length]}</span>
            <h3>${esc(s.label || 'Step ' + (i + 1))}</h3>
            <p>${esc(s.body)}</p>
          </article>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function infographicSection(p) {
    if (p.infographic === 'wheel') return wheelInfographic(p);
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
    return `
    <section class="pp-band pp-besttime" data-sec="besttime">
      <div class="pp-shell">
        <p class="pp-eyebrow">Timing is part of the medicine</p>
        <h2>Best time to drink.</h2>
        <div class="pp-tabs" data-tabs data-besttime-tabs>
          <div class="pp-tab-row" role="tablist" aria-label="Best time to drink">
            ${bt.map((t, i) => `<button type="button" role="tab" id="pp-bt-tab-${i}" aria-controls="pp-bt-pane-${i}" aria-selected="${i === 0}" class="${i === 0 ? 'on' : ''}" data-tab="${i}">${esc(t.label || 'Ritual ' + (i + 1))}</button>`).join('')}
          </div>
          ${bt.map((t, i) => `<div class="pp-tab-pane ${i === 0 ? 'on' : ''}" id="pp-bt-pane-${i}" role="tabpanel" aria-labelledby="pp-bt-tab-${i}" ${i === 0 ? '' : 'hidden'}><p>${esc(t.body)}</p></div>`).join('')}
        </div>
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
      <div class="pp-shell">
        <p class="pp-eyebrow">Rooted in research</p>
        <h2>${esc(s.heading || 'The research speaks')}${/[.:!?]$/.test(s.heading || '') ? '' : ':'}</h2>
        <div class="pp-study" data-study>
          <div class="pp-study-btns" role="tablist" aria-label="Clinical studies">
            ${s.items.map((it, i) => `
            <button type="button" role="tab" id="pp-study-tab-${i}" aria-controls="pp-study-pane-${i}" aria-selected="${i === 0}" class="pp-study-btn${i === 0 ? ' on' : ''}" data-study-btn="${i}">
              <span class="pp-study-btn-num">0${i + 1}</span>
              <span class="pp-study-btn-label">Study</span>
            </button>`).join('')}
          </div>
          ${s.items.map((it, i) => `
          <div class="pp-study-pane${i === 0 ? ' on' : ''}" id="pp-study-pane-${i}" role="tabpanel" aria-labelledby="pp-study-tab-${i}" ${i === 0 ? '' : 'hidden'}>
            <p class="pp-study-tag">${esc(it.label)}</p>
            <p class="pp-study-body">${esc(it.body)}</p>
            ${it.link ? `<a class="pp-study-link" href="${esc(it.link)}" target="_blank" rel="noopener">${esc(it.link.replace(/^https?:\/\//, ''))} <span aria-hidden="true">↗</span></a>` : ''}
          </div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  /* ---------- section 9: competitor comparison (same table for all products) ---------- */

  const COMPARE_ICONS = {
    q: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.4"/><path d="M9.6 9.3c.3-1.4 1.4-2.2 2.7-2.2 1.5 0 2.6 1 2.6 2.4 0 2-2.5 2.2-2.5 4"/><circle class="pp-ci-dot" cx="12.3" cy="16.6" r="1"/></svg>',
    factory: '<svg viewBox="0 0 24 24"><path d="M4 19V9l5 3.4V9l5 3.4V6.5h6V19z"/><path d="M8 16h1.6M13 16h1.6M17.5 16h1.6"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4.4v9.2L12 21l-8-4.4V7.4z"/><path d="M4 7.4l8 4.4 8-4.4M12 11.8V21"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M4 19h16"/><path d="M6.5 19v-4M10.8 19v-7M15 19v-5M19.2 19v-9"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2.5 12S6 6.2 12 6.2 21.5 12 21.5 12 18 17.8 12 17.8 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.6"/></svg>',
    cart: '<svg viewBox="0 0 24 24"><path d="M3.5 5h2.4l2 10.4h9.7L20 8H7"/><circle cx="9.4" cy="18.8" r="1.4"/><circle cx="16.4" cy="18.8" r="1.4"/></svg>',
    sprout: '<svg viewBox="0 0 24 24"><path d="M12 21v-8"/><path d="M12 13c0-4 2.8-6.5 7-6.5 0 4.2-2.8 6.5-7 6.5zM12 11.5C12 8 9.6 6 6 6c0 3.6 2.4 5.5 6 5.5z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24"><path d="M5 19C5 10 10.5 5 19.5 4.5 20 13.5 15 19 6 19z"/><path d="M5 19c3-4.5 7-8.5 11-11"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M2.8 6.5h11.4v9.6H2.8zM14.2 9.5h4l3 3.3v3.3h-7"/><circle cx="7" cy="17.8" r="1.7"/><circle cx="17.4" cy="17.8" r="1.7"/></svg>',
    flask: '<svg viewBox="0 0 24 24"><path d="M9.6 3.5h4.8M10.5 3.5v5L5.4 18a1.8 1.8 0 001.6 2.6h10a1.8 1.8 0 001.6-2.6l-5.1-9.5v-5"/><path d="M8 14.5h8"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M6.5 3.5h7.5l3.5 3.5v13.5h-11z"/><path d="M14 3.5V7h3.5M9 11h6M9 14.4h6M9 17.8h4"/></svg>',
    hands: '<svg viewBox="0 0 24 24"><path d="M7.7 12.9L4 9.9a2 2 0 012.5-3.1l3.6 2.6M16.3 12.9l3.7-3a2 2 0 00-2.5-3.1l-3.6 2.6"/><path d="M8.5 9.7l3.5 2.5 3.5-2.5M6.7 13.8L12 17.9l5.3-4.1"/></svg>'
  };

  const COMPARE_ROWS = [
    ['q', 'Unclear origin', 'sprout', 'Direct from trusted growers'],
    ['factory', 'Mass-produced', 'leaf', 'Small-batch'],
    ['box', 'Sits on shelves for months (or years)', 'truck', 'Harvested fresh, shipped fast'],
    ['chart', 'Lower potency', 'flask', 'Higher potency & purity'],
    ['eye', 'Little to no transparency', 'doc', 'Full transparency from farm to you'],
    ['cart', 'Generic commodity', 'hands', 'Relationships with growers & communities']
  ];

  function comparisonSection() {
    return `
    <section class="pp-band pp-compare" data-sec="compare">
      <div class="pp-shell">
        <p class="pp-eyebrow">Compare</p>
        <h2 class="pp-compare-title">Big Box Brands vs. Our Herbs</h2>
        <span class="pp-compare-sprig" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21v-8"/><path d="M12 13c0-4 2.8-6.5 7-6.5 0 4.2-2.8 6.5-7 6.5zM12 11.5C12 8 9.6 6 6 6c0 3.6 2.4 5.5 6 5.5z"/></svg></span>
        <div class="pp-compare-table" role="table" aria-label="Big box brands versus our herbs">
          <div class="pp-compare-head" role="row">
            <span class="pp-ch-them" role="columnheader">Big Box Brands</span>
            <span class="pp-ch-us" role="columnheader">The Electric Eats</span>
          </div>
          ${COMPARE_ROWS.map(([i1, t1, i2, t2]) => `
          <div class="pp-compare-tr" role="row">
            <span class="pp-cc-them" role="cell"><i class="pp-ci" aria-hidden="true">${COMPARE_ICONS[i1]}</i>${esc(t1)}</span>
            <span class="pp-cc-us" role="cell"><i class="pp-ci" aria-hidden="true">${COMPARE_ICONS[i2]}</i><strong>${esc(t2)}</strong></span>
          </div>`).join('')}
        </div>
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
      <div class="pp-shell">
        <p class="pp-eyebrow">What to expect</p>
        <h2>The ${esc(p.name)} timeline.</h2>
        <div class="pp-tabs" data-tabs data-results-tabs>
          <div class="pp-tab-row pp-tab-row-underline" role="tablist" aria-label="Results timeline">
            ${groups.map((g, i) => `<button type="button" role="tab" id="pp-rs-tab-${i}" aria-controls="pp-rs-pane-${i}" aria-selected="${i === 0}" class="${i === 0 ? 'on' : ''}" data-tab="${i}">${esc(g.label)}</button>`).join('')}
          </div>
          ${groups.map((g, i) => `
          <div class="pp-tab-pane pp-rs-pane ${i === 0 ? 'on' : ''}" id="pp-rs-pane-${i}" role="tabpanel" aria-labelledby="pp-rs-tab-${i}" ${i === 0 ? '' : 'hidden'}>
            <ol class="pp-timeline">
              ${g.items.map((it) => `<li><h3>${esc(it.label)}</h3><p>${esc(it.body)}</p></li>`).join('')}
            </ol>
          </div>`).join('')}
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
      <div class="pp-shell">
        <p class="pp-eyebrow">The secret for best results</p>
        <h2>Meet the plants halfway.</h2>
        <div class="pp-tabs" data-tabs data-secret-tabs>
          <div class="pp-tab-row" role="tablist" aria-label="The secret for best results">
            ${s.map((it, i) => `<button type="button" role="tab" id="pp-sc-tab-${i}" aria-controls="pp-sc-pane-${i}" aria-selected="${i === 0}" class="${i === 0 ? 'on' : ''}" data-tab="${i}">${esc(it.label)}</button>`).join('')}
          </div>
          ${s.map((it, i) => `<div class="pp-tab-pane ${i === 0 ? 'on' : ''}" id="pp-sc-pane-${i}" role="tabpanel" aria-labelledby="pp-sc-tab-${i}" ${i === 0 ? '' : 'hidden'}><p>${esc(it.body)}</p></div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  /* ---------- section 12: sourcing transparency (Blume cards + macro imagery) ---------- */

  function sourcingImage(title, idx) {
    const t = String(title || '').toLowerCase();
    if (/bark|plant|leaf|herb|blend/.test(t)) return 'assets/img/gen/texture-botanical-macro.webp';
    if (/land/.test(t)) return 'assets/img/real-amazon-basin.webp';
    if (/hand/.test(t)) return 'assets/img/chip-hands.webp';
    if (/process/.test(t)) return 'assets/img/gen2/apoth-texture.webp';
    return ['assets/img/gen/texture-botanical-macro.webp', 'assets/img/real-amazon-basin.webp', 'assets/img/chip-hands.webp', 'assets/img/gen2/apoth-texture.webp'][idx % 4];
  }

  function sourcingSection(p) {
    const s = p.sourcing;
    if (!s || !s.cards || !s.cards.length) return '';
    return `
    <section class="pp-band pp-sourcing" data-sec="sourcing">
      <div class="pp-shell">
        <p class="pp-eyebrow">Sourcing transparency</p>
        <h2>${esc(s.heading || 'Where your herbs come from')}${/[.:!?]$/.test(s.heading || '') ? '' : '.'}</h2>
        ${s.subtext ? `<p class="pp-sub">${esc(s.subtext)}</p>` : ''}
        <div class="pp-source-grid">
          ${s.cards.map((c, i) => `
          <article class="pp-source-card">
            <img src="${esc(sourcingImage(c.title, i))}?v=31" alt="" loading="lazy" width="480" height="360">
            <div class="pp-source-copy"><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></div>
          </article>`).join('')}
        </div>
        <a class="pp-source-band" href="story.html">
          <img src="assets/img/chip-hands.webp?v=31" alt="Hands holding harvested Ecuadorian herbs" loading="lazy" width="1200" height="500">
          <span><small>Direct trade · Ecuadorian Amazon</small><strong>Read the sourcing story behind every pouch.</strong></span>
        </a>
      </div>
    </section>`;
  }

  /* ---------- section 13: faq accordion ---------- */

  function faqSection(p) {
    const f = p.faqs || [];
    if (!f.length) return '';
    return `
    <section class="pp-band pp-faq" data-sec="faq">
      <div class="pp-shell">
        <p class="pp-eyebrow">Questions, answered</p>
        <h2>${esc(p.name)} FAQ.</h2>
        <div class="pp-accordion" data-accordion data-faq>
          ${f.map((it, i) => `
          <div class="pp-acc-item${i === 0 ? ' open' : ''}">
            <button type="button" class="pp-acc-btn" aria-expanded="${i === 0}"><span>${esc(it.q)}</span><i aria-hidden="true"></i></button>
            <div class="pp-acc-body">${it.a.map((par) => `<p>${esc(par)}</p>`).join('')}</div>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  /* ---------- section 14: the routine (Rhode numbered circles, linked steps) ---------- */

  function routineStepLink(label, currentSlug) {
    const base = String(label || '').replace(/\(.*?\)/g, '').trim();
    const slug = findSlugByName(base);
    if (slug && slug !== currentSlug) return `<a href="product.html?product=${esc(slug)}">${esc(label)}</a>`;
    return esc(label);
  }

  function routineSection(p) {
    let r = p.routine;
    // Products without a routine block in the doc: their preparation order (or daily
    // ritual timing) is the routine, rendered in the same numbered-step format.
    if (!r || !r.items || !r.items.length) {
      const items = (p.prepare || []).length >= 2 ? p.prepare
        : ((p.bestTime || []).length >= 2 ? p.bestTime : (p.prepare || []));
      if (items.length) r = { header: 'The ' + p.name + ' routine', items };
    }
    if (!r || !r.items || !r.items.length) return '';
    return `
    <section class="pp-band pp-routine" data-sec="routine">
      <div class="pp-shell">
        <p class="pp-eyebrow">The routine</p>
        <h2>${esc(r.header || 'Where ' + p.name + ' fits')}${/[.:!?]$/.test(r.header || '') ? '' : '.'}</h2>
        <div class="pp-routine-grid">
          ${r.items.map((it, i) => `
          <article class="pp-routine-card">
            <span class="pp-routine-num${i === 0 ? ' pp-routine-num-fill' : ''}">0${i + 1}</span>
            ${it.label ? `<h3>${routineStepLink(it.label, p.slug)}</h3>` : ''}
            <p>${esc(it.body)}</p>
          </article>`).join('')}
        </div>
        ${r.note ? `<p class="pp-routine-note">${esc(r.note)}</p>` : ''}
      </div>
    </section>`;
  }

  /* ---------- section 15: reviews wall (all reviews on the site) ---------- */

  function reviewsWallSection(p) {
    const seen = new Set();
    const all = [];
    Object.keys(DATA).forEach((slug) => {
      (DATA[slug].reviews || []).forEach((rv) => {
        const key = rv.quote + '|' + rv.author;
        if (seen.has(key)) return;
        seen.add(key);
        all.push({ quote: rv.quote, author: rv.author, product: DATA[slug].name, slug });
      });
    });
    if (!all.length) return '';
    // Put the current product's reviews first.
    all.sort((a, b) => (a.slug === p.slug ? -1 : 0) - (b.slug === p.slug ? -1 : 0));
    return `
    <section class="pp-band pp-reviews-wall" data-sec="reviews-wall">
      <div class="pp-shell">
        <p class="pp-eyebrow">The review wall</p>
        <h2>${all.length} reviews across the apothecary.</h2>
        <div class="pp-wall">
          ${all.map((rv) => `
          <figure class="pp-wall-card">
            <span class="pp-stars pp-stars-sm" aria-label="5 star review">${STAR.repeat(5)}</span>
            <blockquote>&ldquo;${esc(rv.quote)}&rdquo;</blockquote>
            <figcaption><strong>${esc(rv.author)}</strong><a href="product.html?product=${esc(rv.slug)}">${esc(rv.product)}</a></figcaption>
          </figure>`).join('')}
        </div>
      </div>
    </section>`;
  }

  /* ---------- section 16: you may also like ---------- */

  function crossSellSection(p) {
    const wanted = (p.crossSell || []).map(findSlugByName).filter((s) => s && s !== p.slug);
    const pool = Object.keys(DATA).filter((s) => s !== p.slug && wanted.indexOf(s) === -1);
    while (wanted.length < 3 && pool.length) wanted.push(pool.shift());
    const items = wanted.slice(0, 3).map((slug) => {
      const q = CATALOG[slug];
      return `
      <a class="pp-xs-card" href="product.html?product=${esc(slug)}">
        <img src="${esc(q.image)}?v=31" alt="${esc(q.name)}" loading="lazy" width="480" height="480">
        <span class="pp-xs-copy"><strong>${esc(q.name)}</strong>${q.subline ? `<small>${esc(q.subline)}</small>` : ''}<em>${esc(q.price || '')} · Shop this blend</em></span>
      </a>`;
    }).join('');
    if (!items) return '';
    return `
    <section class="pp-band pp-xs" data-sec="cross-sell">
      <div class="pp-shell">
        <p class="pp-eyebrow">You may also like</p>
        <h2>Continue the ritual.</h2>
        <div class="pp-xs-grid">${items}</div>
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
        <img src="${esc(p.image)}?v=31" alt="" width="56" height="56">
        <div class="pp-sticky-meta"><strong>${esc(p.name)}</strong><span>${esc(p.price || '')}</span></div>
        <button class="btn btn-primary pp-add" type="button" data-add-ritual>Add to Cart</button>
      </div>
    </div>`;
  }

  /* ---------- meta ---------- */

  function setMeta(p) {
    const url = `https://theelectriceats.com/products/${encodeURIComponent(p.slug)}`;
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

    // study switcher
    root.querySelectorAll('[data-study]').forEach((wrap) => {
      const btns = Array.from(wrap.querySelectorAll('[data-study-btn]'));
      const panes = Array.from(wrap.querySelectorAll('.pp-study-pane'));
      btns.forEach((btn) => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.studyBtn);
        btns.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
        panes.forEach((pn, j) => { pn.classList.toggle('on', j === i); if (j === i) pn.removeAttribute('hidden'); else pn.setAttribute('hidden', ''); });
      }));
    });

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

  /* ---------- boot ---------- */

  function boot() {
    const root = document.querySelector('[data-product-root]');
    if (!root) return;
    let slug = handleFromUrl();
    let p = DATA[slug] || EXTRA[slug];
    if (!p) { slug = DEFAULT_HANDLE; p = DATA[slug]; }
    if (!p) return;
    p = Object.assign({ slug }, p);

    setMeta(p);
    root.insertAdjacentHTML('afterbegin', [
      heroSection(p),          // 1
      cinematicSection(p),     // 2
      claimSection(p),         // 3
      highlightsSection(p),    // 4
      infographicSection(p),   //   (kept bonus feature)
      prepareSection(p),       // 5
      bestTimeSection(p),      // 6
      reviewsSection(p),       // 7
      studiesSection(p),       // 8
      comparisonSection(p),    // 9
      resultsSection(p),       // 10
      secretSection(p),        // 11
      sourcingSection(p),      // 12
      faqSection(p),           // 13
      routineSection(p),       // 14
      reviewsWallSection(p),   // 15
      crossSellSection(p),     // 16
      disclaimerSection(),
      stickyBar(p)
    ].join('\n'));
    initInteractions(root, p);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
