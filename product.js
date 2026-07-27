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

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function dots(s) { return String(s || '').split('·').map((x) => x.trim()).filter(Boolean); }

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
    const special = [
      [/eliminate|regenerate|detox kit/, 'eliminate-regenerate'],
      [/his fertile|men'?s? (kit|herbal)|fertile fires/, 'mens-kit'],
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

  /* ---------- section builders ---------- */

  function starRow(count) {
    const star = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z"/></svg>';
    return `<span class="pp-stars" aria-label="Rated 5 out of 5 stars">${star.repeat(5)}</span><span class="pp-star-note">${count ? count + ' verified reviews' : 'Loved by the Kawsaypac community'}</span>`;
  }

  function heroSection(p) {
    const pills = (p.pills || []).map((x) => `<span class="pp-pill">${esc(x)}</span>`).join('');
    const bens = (p.benefits || []).map((b) => `<li><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10.5l4.5 4.5L17 5.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${esc(b)}</span></li>`).join('');
    const size = p.size ? `<span class="pp-size">${esc(p.size)} pouch</span>` : '';
    return `
    <section class="pp-hero">
      <div class="pp-shell pp-hero-grid">
        <div class="pp-hero-media">
          <img src="${esc(p.image)}?v=30" alt="${esc(p.name)} by Kawsaypac" width="900" height="900" fetchpriority="high">
          <span class="pp-hero-badge">Wild-harvested · Ecuador</span>
        </div>
        <div class="pp-hero-copy">
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
            <button class="pp-add btn btn-primary" type="button" data-add-ritual>Add to Ritual</button>
          </div>
          ${bens ? `<ul class="pp-checklist">${bens}</ul>` : ''}
          ${extrasBlock(p)}
          <div class="pp-assure"><span>Small-batch care</span><span>Direct trade</span><span>No fillers, no capsules</span></div>
        </div>
      </div>
    </section>`;
  }

  function extrasBlock(p) {
    if (!p.extras || !p.extras.length) return '';
    return `<div class="pp-extras">` + p.extras.map((e) => {
      const inner = e.items
        ? `<ul>${e.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
        : `<p>${esc(e.body)}</p>`;
      return `<section class="pp-extra"><h3>${esc(e.label)}</h3>${inner}</section>`;
    }).join('') + `</div>`;
  }

  function claimSection(p) {
    const c = p.claim || {};
    if (!c.text && !c.usedFor) return '';
    const chips = dots(c.usedFor).map((x) => `<span>${esc(x)}</span>`).join('');
    const helps = dots(c.howItHelps).map((x) => `<li>${esc(x)}</li>`).join('');
    const scenic = SCENIC[p.tag] || SCENIC['Herbal Blend'];
    return `
    <section class="pp-claim">
      <div class="pp-shell pp-claim-grid">
        <div class="pp-claim-copy">
          <p class="pp-eyebrow">Why ${esc(p.name)}</p>
          ${c.text ? `<h2>${esc(c.text)}</h2>` : ''}
          ${chips ? `<div class="pp-claim-block"><h3>Used for</h3><div class="pp-chiprow">${chips}</div></div>` : ''}
          ${helps ? `<div class="pp-claim-block"><h3>How it helps</h3><ul class="pp-helps">${helps}</ul></div>` : ''}
          ${c.whatsInside ? `<div class="pp-claim-block"><h3>What&#39;s inside</h3><p>${esc(c.whatsInside)}</p></div>` : ''}
          ${c.scienceSays ? `<div class="pp-claim-block"><h3>The science says</h3><p>${esc(c.scienceSays)}</p></div>` : ''}
          ${c.fyi ? `<p class="pp-fyi">${esc(c.fyi)}</p>` : ''}
        </div>
        <figure class="pp-claim-media"><img src="${esc(scenic)}?v=30" alt="Kawsaypac herbal preparation" loading="lazy" width="720" height="900"></figure>
      </div>
    </section>`;
  }

  function highlightsSection(p) {
    const h = p.highlights;
    if (!h || !h.cards || !h.cards.length) return '';
    return `
    <section class="pp-band pp-highlights">
      <div class="pp-shell">
        <p class="pp-eyebrow">Inside every cup</p>
        ${h.heading ? `<h2>${esc(h.heading)}${/[.?!]$/.test(h.heading) ? '' : '.'}</h2>` : ''}
        ${h.subtext ? `<p class="pp-sub">${esc(h.subtext)}</p>` : ''}
        <div class="pp-cards pp-cards-${Math.min(h.cards.length, 5)}">
          ${h.cards.map((c, i) => `
          <article class="pp-card">
            <span class="pp-card-num">0${i + 1}</span>
            <h3>${esc(c.title)}</h3>
            ${c.tag ? `<span class="pp-card-tag">${esc(c.tag)}</span>` : ''}
            <p>${esc(c.body)}</p>
          </article>`).join('')}
        </div>
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
    <section class="pp-band pp-info">
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
    <section class="pp-band pp-info">
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
    <section class="pp-band pp-info">
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

  /* ---------- ritual: prepare + best time ---------- */

  function prepareSection(p) {
    const prep = p.prepare || [];
    const bt = p.bestTime || [];
    if (!prep.length && !bt.length) return '';
    const isKitProtocol = p.infographic === 'protocol';
    const btBlock = (!bt.length || isKitProtocol) ? '' : `
      <div class="pp-besttime">
        <h3>Best time to drink</h3>
        <div class="pp-tabs" data-tabs>
          <div class="pp-tab-row" role="tablist" aria-label="Best time to drink">
            ${bt.map((t, i) => `<button type="button" role="tab" id="pp-tab-${i}" aria-controls="pp-pane-${i}" aria-selected="${i === 0}" class="${i === 0 ? 'on' : ''}" data-tab="${i}">${esc(t.label || 'Ritual ' + (i + 1))}</button>`).join('')}
          </div>
          ${bt.map((t, i) => `<div class="pp-tab-pane ${i === 0 ? 'on' : ''}" id="pp-pane-${i}" role="tabpanel" aria-labelledby="pp-tab-${i}" ${i === 0 ? '' : 'hidden'}><p>${esc(t.body)}</p></div>`).join('')}
        </div>
      </div>`;
    return `
    <section class="pp-band pp-ritual">
      <div class="pp-shell">
        <p class="pp-eyebrow">The ritual</p>
        <h2>How to prepare ${esc(p.name)}.</h2>
        <div class="pp-prep">
          ${prep.map((s, i) => `
          <article class="pp-prep-card">
            <span class="pp-prep-step">Step ${i + 1}</span>
            <h3>${esc(s.label)}</h3>
            <p>${esc(s.body)}</p>
          </article>`).join('')}
        </div>
        ${btBlock}
      </div>
    </section>`;
  }

  function resultsSection(p) {
    const r = p.results || [];
    if (!r.length) return '';
    return `
    <section class="pp-band pp-results">
      <div class="pp-shell">
        <p class="pp-eyebrow">What to expect</p>
        <h2>The ${esc(p.name)} timeline.</h2>
        <ol class="pp-timeline">
          ${r.map((it) => `<li><h3>${esc(it.label)}</h3><p>${esc(it.body)}</p></li>`).join('')}
        </ol>
      </div>
    </section>`;
  }

  function studiesSection(p) {
    const s = p.studies;
    if (!s || !s.items || !s.items.length) return '';
    return `
    <section class="pp-band pp-studies">
      <div class="pp-shell">
        <p class="pp-eyebrow">Rooted in research</p>
        <h2>${esc(s.heading || 'The research speaks')}${/[.:!?]$/.test(s.heading || '') ? '' : '.'}</h2>
        <div class="pp-accordion" data-accordion>
          ${s.items.map((it, i) => `
          <div class="pp-acc-item${i === 0 ? ' open' : ''}">
            <button type="button" class="pp-acc-btn" aria-expanded="${i === 0}"><span>${esc(it.label)}</span><i aria-hidden="true"></i></button>
            <div class="pp-acc-body"><p>${esc(it.body)}</p>${it.link ? `<a class="pp-study-link" href="${esc(it.link)}" target="_blank" rel="noopener">Read the study <span aria-hidden="true">↗</span></a>` : ''}</div>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function comparisonSection(p) {
    const c = p.comparison;
    if (!c) return '';
    const cols = c.columns || [];
    return `
    <section class="pp-band pp-compare">
      <div class="pp-shell">
        <p class="pp-eyebrow">Compare</p>
        <h2>${esc(c.header)}${/[.:!?]$/.test(c.header) ? '' : '.'}</h2>
        ${c.subtext ? `<p class="pp-sub">${esc(c.subtext)}</p>` : ''}
        ${cols.length ? `<div class="pp-compare-row">${cols.map((col, i) => `<span class="${i === 0 ? 'pp-col-us' : ''}">${esc(col)}${i === 0 ? ' <em>· this blend</em>' : ''}</span>`).join('')}</div>` : ''}
      </div>
    </section>`;
  }

  function reviewsSection(p) {
    const r = p.reviews || [];
    if (!r.length) return '';
    return `
    <section class="pp-band pp-reviews">
      <div class="pp-shell">
        <p class="pp-eyebrow">From the community</p>
        <h2>Real people. Real rituals.</h2>
        <div class="pp-review-grid">
          ${r.map((rv) => `
          <figure class="pp-review">
            <span class="pp-stars pp-stars-sm" aria-label="5 star review">${'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z"/></svg>'.repeat(5)}</span>
            <blockquote>&ldquo;${esc(rv.quote)}&rdquo;</blockquote>
            <figcaption>${esc(rv.author)}</figcaption>
          </figure>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function secretSection(p) {
    const s = p.secret || [];
    if (!s.length) return '';
    return `
    <section class="pp-band pp-secret">
      <div class="pp-shell">
        <p class="pp-eyebrow">The secret for best results</p>
        <h2>Meet the plants halfway.</h2>
        <div class="pp-accordion" data-accordion>
          ${s.map((it, i) => `
          <div class="pp-acc-item${i === 0 ? ' open' : ''}">
            <button type="button" class="pp-acc-btn" aria-expanded="${i === 0}"><span>${esc(it.label)}</span><i aria-hidden="true"></i></button>
            <div class="pp-acc-body"><p>${esc(it.body)}</p></div>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function sourcingSection(p) {
    const s = p.sourcing;
    if (!s || !s.cards || !s.cards.length) return '';
    return `
    <section class="pp-band pp-sourcing">
      <div class="pp-shell">
        <p class="pp-eyebrow">Sourcing transparency</p>
        <h2>${esc(s.heading || 'Where your herbs come from')}${/[.:!?]$/.test(s.heading || '') ? '' : '.'}</h2>
        ${s.subtext ? `<p class="pp-sub">${esc(s.subtext)}</p>` : ''}
        <div class="pp-source-grid">
          ${s.cards.map((c) => `<article class="pp-source-card"><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></article>`).join('')}
        </div>
        <a class="pp-source-band" href="story.html">
          <img src="assets/img/chip-hands.webp?v=30" alt="Hands holding harvested Ecuadorian herbs" loading="lazy" width="1200" height="500">
          <span><small>Direct trade · Ecuadorian Amazon</small><strong>Read the sourcing story behind every pouch.</strong></span>
        </a>
      </div>
    </section>`;
  }

  function routineSection(p) {
    const r = p.routine;
    if (!r || !r.items || !r.items.length) return '';
    return `
    <section class="pp-band pp-routine">
      <div class="pp-shell">
        <p class="pp-eyebrow">The routine</p>
        <h2>${esc(r.header || 'Where ' + p.name + ' fits')}${/[.:!?]$/.test(r.header || '') ? '' : '.'}</h2>
        <div class="pp-routine-grid">
          ${r.items.map((it, i) => `
          <article class="pp-routine-card">
            <span class="pp-routine-num">${i + 1}</span>
            ${it.label ? `<h3>${esc(it.label)}</h3>` : ''}
            <p>${esc(it.body)}</p>
          </article>`).join('')}
        </div>
        ${r.note ? `<p class="pp-routine-note">${esc(r.note)}</p>` : ''}
      </div>
    </section>`;
  }

  function faqSection(p) {
    const f = p.faqs || [];
    if (!f.length) return '';
    return `
    <section class="pp-band pp-faq">
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

  function crossSellSection(p) {
    const wanted = (p.crossSell || []).map(findSlugByName).filter((s) => s && s !== p.slug);
    const pool = Object.keys(DATA).filter((s) => s !== p.slug && wanted.indexOf(s) === -1);
    while (wanted.length < 3 && pool.length) wanted.push(pool.shift());
    const items = wanted.slice(0, 3).map((slug) => {
      const q = CATALOG[slug];
      return `
      <a class="pp-xs-card" href="product.html?product=${esc(slug)}">
        <img src="${esc(q.image)}?v=30" alt="${esc(q.name)}" loading="lazy" width="480" height="480">
        <span class="pp-xs-copy"><strong>${esc(q.name)}</strong>${q.subline ? `<small>${esc(q.subline)}</small>` : ''}<em>${esc(q.price || '')} · Shop this blend</em></span>
      </a>`;
    }).join('');
    if (!items) return '';
    return `
    <section class="pp-band pp-xs">
      <div class="pp-shell">
        <p class="pp-eyebrow">You may also like</p>
        <h2>Continue the ritual.</h2>
        <div class="pp-xs-grid">${items}</div>
      </div>
    </section>`;
  }

  function disclaimerSection() {
    return `
    <section class="pp-disclaimer">
      <div class="pp-shell">
        <p>These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. If you are pregnant, nursing, taking medication, or managing a condition, consult a qualified clinician before use. <a href="fda-disclaimer.html">Read the full disclaimer</a>.</p>
      </div>
    </section>`;
  }

  function stickyBar(p) {
    return `
    <div class="pp-sticky" data-sticky>
      <div class="pp-sticky-inner">
        <img src="${esc(p.image)}?v=30" alt="" width="56" height="56">
        <div class="pp-sticky-meta"><strong>${esc(p.name)}</strong><span>${esc(p.price || '')}</span></div>
        <button class="btn btn-primary pp-add" type="button" data-add-ritual>Add to Ritual</button>
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
    // quantity
    const qtyOut = root.querySelector('[data-qty-value]');
    let qty = 1;
    const setQty = (v) => { qty = Math.min(9, Math.max(1, v)); if (qtyOut) qtyOut.textContent = String(qty); };
    root.querySelectorAll('[data-qty-minus]').forEach((b) => b.addEventListener('click', () => setQty(qty - 1)));
    root.querySelectorAll('[data-qty-plus]').forEach((b) => b.addEventListener('click', () => setQty(qty + 1)));

    // add to ritual -> cart toast
    root.querySelectorAll('[data-add-ritual]').forEach((b) => b.addEventListener('click', () => {
      const label = qty > 1 ? `${qty} x ${p.name}` : p.name;
      toast(`${label} added to your ritual bag. Shopify checkout connects at launch.`);
    }));

    // accordions
    root.querySelectorAll('[data-accordion]').forEach((acc) => {
      acc.querySelectorAll('.pp-acc-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = btn.closest('.pp-acc-item');
          const open = item.classList.toggle('open');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      });
    });

    // tabs
    root.querySelectorAll('[data-tabs]').forEach((tabs) => {
      const btns = Array.from(tabs.querySelectorAll('[data-tab]'));
      const panes = Array.from(tabs.querySelectorAll('.pp-tab-pane'));
      btns.forEach((btn) => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.tab);
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
      heroSection(p),
      claimSection(p),
      highlightsSection(p),
      infographicSection(p),
      prepareSection(p),
      resultsSection(p),
      studiesSection(p),
      comparisonSection(p),
      reviewsSection(p),
      secretSection(p),
      sourcingSection(p),
      routineSection(p),
      faqSection(p),
      crossSellSection(p),
      disclaimerSection(),
      stickyBar(p)
    ].join('\n'));
    initInteractions(root, p);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
