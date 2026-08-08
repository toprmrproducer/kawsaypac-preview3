(function(){
  'use strict';
  const $=(s,c=document)=>c.querySelector(s);const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const LOOX_SHOP='the-electric-eats.myshopify.com';
  const KLAVIYO_COMPANY_ID='SB34LP';
  const KLAVIYO_CONSENT_KEY='kawsaypac_marketing_consent_v1';
  function createKlaviyoIntegration(){
    let loading=null;
    const getConsent=()=>{try{return localStorage.getItem(KLAVIYO_CONSENT_KEY)||''}catch(e){return''}};
    const queue=(command,...args)=>{
      if(getConsent()!=='granted')return false;
      window._learnq=window._learnq||[];
      window._learnq.push([command,...args]);
      return true;
    };
    const load=()=>{
      if(getConsent()!=='granted')return Promise.resolve(false);
      const existing=document.querySelector('script[data-kawsay-klaviyo]');
      if(existing)return Promise.resolve(true);
      if(loading)return loading;
      loading=new Promise(resolve=>{
        window._learnq=window._learnq||[];
        const script=document.createElement('script');
        script.async=true;
        script.dataset.kawsayKlaviyo='';
        script.referrerPolicy='strict-origin-when-cross-origin';
        script.src=`https://static.klaviyo.com/onsite/js/${KLAVIYO_COMPANY_ID}/klaviyo.js?company_id=${KLAVIYO_COMPANY_ID}`;
        script.addEventListener('load',()=>resolve(true),{once:true});
        script.addEventListener('error',()=>{loading=null;resolve(false)},{once:true});
        document.head.append(script);
      });
      return loading;
    };
    const track=(name,properties={})=>{if(getConsent()!=='granted')return false;load();return queue('track',name,properties)};
    const identify=(email,properties={})=>{
      const value=String(email||'').trim().toLowerCase();
      if(!value||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return false;
      if(getConsent()!=='granted')return false;
      load();
      return queue('identify',Object.assign({$email:value},properties));
    };
    const setConsent=value=>{
      const previous=getConsent();
      const next=value==='granted'?'granted':'denied';
      try{localStorage.setItem(KLAVIYO_CONSENT_KEY,next)}catch(e){}
      if(next==='granted'){
        load();
        track('Marketing Consent Updated',{Status:'Granted',Source:'Kawsaypac consent panel'});
      }
      document.dispatchEvent(new CustomEvent('kawsaypac:marketing-consent',{detail:{status:next}}));
      /* Removing a loaded script does not reliably detach its listeners. Reload after
         revocation so Klaviyo is absent from the new page lifecycle. */
      if(next==='denied'&&previous==='granted'&&document.querySelector('script[data-kawsay-klaviyo]'))location.reload();
      return next;
    };
    const productProperties=detail=>{
      const price=parseFloat(String(detail.price||detail.Price||'').replace(/[^0-9.]/g,''));
      return {
        ProductName:detail.name||detail.ProductName||'',
        ProductID:detail.productId||detail.ProductID||detail.slug||detail.handle||'',
        SKU:detail.sku||detail.SKU||detail.handle||detail.slug||'',
        Categories:detail.categories||detail.Categories||[],
        ImageURL:detail.image||detail.ImageURL||'',
        URL:detail.url||detail.URL||location.href,
        Brand:'Kawsaypac',
        Price:Number.isFinite(price)?price:0,
        Quantity:Math.max(1,parseInt(detail.quantity||detail.Quantity,10)||1)
      };
    };
    return Object.freeze({
      companyId:KLAVIYO_COMPANY_ID,
      getConsent,
      setConsent,
      load,
      track,
      identify,
      trackViewedProduct:detail=>track('Viewed Product',productProperties(detail||{})),
      trackAddedToCart:detail=>track('Added to Cart',productProperties(detail||{})),
      trackCheckoutHandoff:detail=>track('Headless Checkout Clicked',Object.assign({Source:'Kawsaypac headless storefront',URL:location.href},detail||{}))
    });
  }
  window.KawsaypacKlaviyo=createKlaviyoIntegration();
  function loadLoox(){
    const existing=document.querySelector('script[data-kawsay-loox]');
    if(existing)return existing;
    const script=document.createElement('script');
    script.async=true;
    script.dataset.kawsayLoox='';
    script.referrerPolicy='strict-origin-when-cross-origin';
    script.src=`https://loox.io/widget/loox.js?shop=${encodeURIComponent(LOOX_SHOP)}`;
    document.body.append(script);
    return script;
  }
  window.KawsaypacLoox=Object.freeze({load:loadLoox,shop:LOOX_SHOP});
  const sprout='<img class="sprout" src="assets/sprites/herb-icons/guayusa-sprig.webp?v=32" alt="" aria-hidden="true">';
  const concerns=[['All Products','all'],["Women's Wellness",'womens-wellness'],["Men's Wellness",'mens-wellness'],['Digestive Health','digestive-health'],['Auto-Immune Support','auto-immune-support'],['Nervous System','nervous-system'],['Energy & Vitality','energy-vitality'],['Joint & Mobility','joint-mobility'],['Heart Health','heart-health'],['Liver Support','liver-support'],['Kidney Support','kidney-support'],['Lung Support','lung-support'],['Hormone Balance','hormone-balance'],['Sleep & Relaxation','sleep-relaxation'],['Full Body Detox','full-body-detox']];
  const products=[
    /* Catalog values below mirror product-data.js (the canonical source).
       If a name/price changes there, change it here too. */
    {slug:'river-of-life',name:'River of Life',tag:'Heart Health',concerns:'heart-health lung-support',price:'$34',image:'https://cdn.shopify.com/s/files/1/0507/1660/6628/files/RiverOfLife.png?v=1699940764',desc:'A grounding daily botanical blend for a steady whole-body ritual.',benefits:['Daily foundational ritual','Whole botanicals','Direct Ecuador sourcing'],ingredients:'A rotating whole-herb formulation. Refer to the current pouch for the exact ingredient list and preparation directions.'},
    {slug:'scales-of-balance',name:'Scales of Balance',tag:'Nervous System',concerns:'nervous-system auto-immune-support joint-mobility',price:'$28.50',image:'https://cdn.shopify.com/s/files/1/0507/1660/6628/files/ScalesOfBalance.png?v=1699937323',desc:'A calm-focused blend for moments when the nervous system needs less noise.',benefits:['Calm daily practice','Small-batch blend','No fillers'],ingredients:'A layered Ecuadorian botanical formulation. Refer to the current pouch for ingredients and serving guidance.'},
    {slug:'sacred-sacral',name:'Sacred Sacral',tag:"Women's Wellness",concerns:'womens-wellness hormone-balance sleep-relaxation',price:'$28.50',image:'https://cdn.shopify.com/s/files/1/0507/1660/6628/files/SacredSacral.png?v=1762375079',desc:'A thoughtful blend created for cyclical ritual, grounding, and care.',benefits:['Cyclical wellness ritual','Whole loose herbs','Educational preparation'],ingredients:'Whole botanicals selected around a women’s wellness ritual. Use the product label as the final ingredient authority.'},
    {slug:'zapped-in',name:'Zapped In',tag:'Energy & Vitality',concerns:'energy-vitality mens-wellness',price:'$34',image:'https://cdn.shopify.com/s/files/1/0507/1660/6628/files/ZappedInCover.png?v=1699937055',desc:'A bright daytime blend built around clean energy, presence, and sharp focus.',benefits:['Morning ritual','Focused energy','Resealable pouch'],ingredients:'Guayusa-led botanical blend with complementary whole herbs. Confirm current formula and directions on the pouch.'},
    {slug:'bowel-balance',name:'Bowel Balance',tag:'Digestive Health',concerns:'digestive-health',price:'$28.50',image:'https://cdn.shopify.com/s/files/1/0507/1660/6628/files/BowelBalance.png?v=1762372003',desc:'A practical daily preparation created around digestive comfort and regularity.',benefits:['After-meal ritual','Loose whole herbs','Clear brewing guide'],ingredients:'Whole herbs and roots selected around digestive wellness. Follow the exact preparation guidance on the current label.'},
    {slug:'eliminate-regenerate',name:'Eliminate & Regenerate - Detox Kit',tag:'Full Body Detox',concerns:'full-body-detox liver-support kidney-support',price:'$113',image:'https://cdn.shopify.com/s/files/1/0507/1660/6628/files/Eliminate_Regenerate.png?v=1699938353',desc:'A structured multi-blend program for customers who prefer a complete ritual.',benefits:['Coordinated program','Multiple small batches','Step-by-step guide'],ingredients:'A coordinated collection of separate herbal blends. Each pouch includes its own formula and preparation directions.'},
    {slug:'final-flush',name:'Final Flush',tag:'Liver + Kidney',concerns:'liver-support kidney-support digestive-health',price:'$28.50',image:'https://cdn.shopify.com/s/files/1/0507/1660/6628/files/Final_Flush.png?v=1762373697',desc:'A concise closing blend designed to complete a guided cleansing program.',benefits:['Closing-phase ritual','Whole botanicals','Small-batch preparation'],ingredients:'A whole-herb formulation for the final phase of a guided routine. Follow the current pouch and consult a clinician when appropriate.'},
    {slug:'guayusa-leaf',name:'Guayusa',tag:'Single Herb',concerns:'energy-vitality mens-wellness',price:'$22.50',image:'https://cdn.shopify.com/s/files/1/0507/1660/6628/files/Guayusa.png?v=1699942164',desc:'A clean, naturally caffeinated Amazonian leaf for a focused morning infusion.',benefits:['Single wildcrafted herb','Amazonian origin','Naturally caffeinated'],ingredients:'100% guayusa leaf. Preparation and batch origin are recorded on the pouch.'},
    {slug:'ritual-bundle',name:'Daily Ritual Bundle',tag:'Bundle',concerns:'all nervous-system energy-vitality digestive-health',price:'$86.00',image:'assets/img/chip-cup.webp',desc:'Three complementary blends for morning, after-meal, and evening rituals.',benefits:['Three-part daily rhythm','Bundled education','Gift-ready'],ingredients:'A rotating bundle of three full-size blends. Exact contents are listed before the Shopify connection is activated.'},
    {slug:'ebook-preparation',name:'The Herbal Preparation Book',tag:'eBook',concerns:'all',price:'$18.00',image:'assets/img/new/kawsaypac-herbal-field-journal.webp',desc:'A digital field guide to infusions, decoctions, timing, and responsible use.',benefits:['Instant digital guide','Clear preparation methods','Printable references'],ingredients:'Digital educational product. No physical ingredients or medical claims.'}
  ];
  window.KAWSAYPAC={concerns,products};
  window.KAWSAY_VIDEOS=[
    {poster:'assets/img/testimonials/mens-detox-kit.webp',mp4:'assets/video/testimonials/mens-detox-kit.mp4',label:'Men\u2019s Detox Kit \u00b7 Nestor R.'},
    {poster:'assets/img/testimonials/detox-kit.webp',mp4:'assets/video/testimonials/detox-kit.mp4',label:'Detox Kit \u00b7 Mirna Q.'},
    {poster:'assets/img/testimonials/sacred-sacral.webp',mp4:'assets/video/testimonials/sacred-sacral.mp4',label:'Sacred Sacral \u00b7 Kristin M.'},
    {poster:'assets/img/testimonials/zapped-in.webp',mp4:'assets/video/testimonials/zapped-in.mp4',label:'Zapped In \u00b7 Petrena T.'},
    {poster:'assets/img/testimonials/30-day-raw-reset.webp',mp4:'assets/video/testimonials/30-day-raw-reset.mp4',label:'30 Day Raw Reset \u00b7 Arayah W.'}
  ];
  function navLink(label,href){return `<a class="nav-link" href="${href}">${sprout}<span>${label}</span></a>`}
  function renderHeader(){const host=$('[data-site-header]');if(!host)return;const ribbon='<span>Wildcrafted in Ecuador</span><i>✦</i><span>Whole botanicals</span><i>✦</i><span>Small-batch blends</span><i>✦</i><span>Direct partner sourcing</span><i>✦</i>';host.innerHTML=`<svg width="0" height="0" aria-hidden="true"><filter id="liquid-refraction" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.025" numOctaves="2" seed="8" result="noise"/><feGaussianBlur in="noise" stdDeviation="1.2" result="softNoise"/><feDisplacementMap in="SourceGraphic" in2="softNoise" scale="12" xChannelSelector="R" yChannelSelector="G"/></filter></svg><header class="site-header"><div class="trust-ribbon" aria-label="Kawsaypac sourcing highlights"><div class="trust-track">${ribbon}${ribbon}</div></div><div class="nav-pill"><span class="nav-refraction"></span><span class="nav-tint"></span><a class="brand" href="index.html" data-psst="Psst: Kawsaypac means the living force in Kichwa."><img src="assets/brand/kawsaypac-mark.svg?v=17" alt=""><span><strong>KAWSAYPAC</strong><small>Ancestral Herbs</small></span></a><nav class="desktop-nav" aria-label="Primary"><div class="nav-item"><a class="nav-link drop-trigger" href="shop.html" aria-expanded="false">${sprout}<span>Shop by Concern</span></a><div class="dropdown mega"><div class="mega-links">${concerns.map(c=>`<a href="shop.html?concern=${c[1]}">${c[0]}</a>`).join('')}</div><a class="mega-feature" href="shop.html?concern=digestive-health"><img loading="lazy" decoding="async" src="assets/img/bowl-digestive.webp?v=17" alt="Digestive herbs prepared in a ceramic bowl"><span><small>Find your ritual</small><strong>Begin with what your body is asking for.</strong></span></a></div></div>${navLink('Philosophy','philosophy.html')}${navLink('Retreats','retreats.html')}${navLink('Apothecary','apothecary.html')}<div class="nav-item"><a class="nav-link drop-trigger" href="tea-preparation.html" aria-expanded="false">${sprout}<span>Learn</span></a><div class="dropdown"><a href="philosophy.html">About Kawsaypac</a><a href="tea-preparation.html">Tea Preparation Guide</a><a href="preparing-your-body.html">Preparing Your Body</a><a href="recipes.html">Recipes & Programs</a></div></div>${navLink('Our Story','story.html')}</nav><div class="nav-actions"><button class="nav-icon-btn" type="button" aria-label="Search" data-search-toggle><svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.6-3.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><button class="nav-icon-btn nav-cart" type="button" aria-label="Cart" data-cart-open><svg class="icon" viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2"/></svg><span class="cart-count" data-cart-count aria-hidden="true">0</span></button><a class="btn btn-primary" href="shop.html">Shop Herbs</a><button class="menu-toggle icon-button" type="button" aria-label="Open menu" aria-expanded="false"><svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div><form class="nav-search-panel" role="search" data-search-panel aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.6-3.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" name="q" placeholder="Search herbs, blends, concerns..." aria-label="Search products" autocomplete="off"><button type="submit" class="btn btn-primary">Search</button><button type="button" class="nav-search-close" aria-label="Close search" data-search-close>&times;</button></form></div><div class="mobile-sheet" aria-hidden="true"><nav><div class="msheet-group"><button type="button" class="msheet-toggle" aria-expanded="false"><span>Shop by Concern</span><svg class="icon msheet-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button><div class="msheet-panel">${concerns.map(c=>`<a class="mobile-sub" href="shop.html?concern=${c[1]}">${c[0]}</a>`).join('')}</div></div><a href="philosophy.html">Philosophy</a><a href="retreats.html">Retreats</a><a href="apothecary.html">Apothecary</a><a href="story.html">Our Story</a><div class="msheet-group"><button type="button" class="msheet-toggle" aria-expanded="false"><span>Learn</span><svg class="icon msheet-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button><div class="msheet-panel"><a class="mobile-sub" href="philosophy.html">About Kawsaypac</a><a class="mobile-sub" href="tea-preparation.html">Tea Preparation Guide</a><a class="mobile-sub" href="preparing-your-body.html">Preparing Your Body</a><a class="mobile-sub" href="recipes.html">Recipes & Programs</a><a class="mobile-sub" href="journal.html">Journal</a></div></div></nav></div></header>`;}
  function normalizeRibbon(){$$('.trust-track').forEach(track=>{if(track.querySelector('.trust-group'))return;const items=[...track.children],mid=Math.ceil(items.length/2);const first=document.createElement('div'),second=document.createElement('div');first.className='trust-group';second.className='trust-group';second.setAttribute('aria-hidden','true');items.slice(0,mid).forEach(item=>first.append(item));items.slice(mid).forEach(item=>second.append(item));track.append(first,second)})}
  function renderFooter(){const host=$('[data-site-footer]');if(!host)return;host.innerHTML=`<footer class="site-footer"><img class="footer-bg" loading="lazy" decoding="async" width="1920" height="1080" src="assets/img/gen6/footer-dark-river.webp?v=74" alt="Moonlit Ecuadorian jungle river at night"><div class="footer-leaves" aria-hidden="true"><img class="fl fl-l" loading="lazy" decoding="async" src="assets/img/fg-leaf-fern.webp?v=78" alt=""><img class="fl fl-r" loading="lazy" decoding="async" src="assets/img/fg-leaf-fern.webp?v=78" alt=""><img class="fl ff-rise ff-monstera" loading="lazy" decoding="async" src="assets/journey-v4/monstera.webp?v=88" alt=""><img class="fl ff-rise ff-orchid-left" loading="lazy" decoding="async" src="assets/journey-v4/orchids-left.webp?v=88" alt=""><img class="fl ff-rise ff-orchid-right" loading="lazy" decoding="async" src="assets/journey-v4/orchid-brom.webp?v=88" alt=""></div><div class="footer-card"><div class="footer-grid"><div class="footer-intro"><a class="brand" href="index.html"><img src="assets/brand/kawsaypac-mark.svg?v=17" alt=""><span><strong>KAWSAYPAC</strong><small>ANCESTRAL HERBS</small></span></a><p>Wildcrafted herbal rituals rooted in Ecuador and shared through direct community relationships.</p></div><div class="footer-col"><h3>Explore</h3><ul><li><a href="shop.html">Shop All Herbs</a></li><li><a href="philosophy.html">Why Kawsaypac</a></li><li><a href="retreats.html">Ecuador Retreats</a></li><li><a href="tea-preparation.html">Tea Preparation Guide</a></li><li><a href="recipes.html">Recipes & Programs</a></li><li><a href="story.html">Our Story</a></li><li><a href="journal.html">Blogs</a></li></ul></div><div class="footer-col"><h3>Support</h3><ul><li><a href="contact.html">Contact Us</a></li><li><a href="faq.html">FAQ</a></li><li><a href="wholesale.html">Wholesale</a></li><li><a href="retreats.html#book">Book a Discovery Call</a></li></ul></div><div class="footer-col"><h3>Policies</h3><ul><li><a href="shipping-returns.html">Shipping & Returns</a></li><li><a href="refund-policy.html">Refund Policy</a></li><li><a href="privacy.html">Privacy Policy</a></li><li><a href="terms.html">Terms of Service</a></li><li><a href="fda-disclaimer.html">FDA Disclaimer</a></li></ul></div></div><div class="footer-bottom"><div><div class="electric">THE ELECTRIC EATS</div><div class="footer-tagline">Rooted in Ecuador. Guided by Nature. Created for Transformation.</div></div><div class="socials"><a href="https://www.instagram.com/theelectriceats/" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg></a><a href="https://www.youtube.com/@theelectriceats" aria-label="YouTube"><svg viewBox="0 0 24 24"><path d="M21 8.2a3 3 0 0 0-2-2C17 5.6 14.3 5.5 12 5.5s-5 .1-6.9.7A3 3 0 0 0 3 8.2 20 20 0 0 0 2.5 12 20 20 0 0 0 3 15.8a3 3 0 0 0 2.1 2c1.9.6 4.6.7 6.9.7s5-.1 6.9-.7a3 3 0 0 0 2.1-2 20 20 0 0 0 .5-3.8 20 20 0 0 0-.5-3.8Z"/><path d="m10 9 5 3-5 3Z"/></svg></a><a href="https://x.com/theelectriceats" aria-label="X"><svg viewBox="0 0 24 24"><path d="M5 4l14 16M19 4 5 20"/></svg></a><a href="https://www.tiktok.com/@theelectriceats" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="M14 3v11.5a4.5 4.5 0 1 1-4-4.5M14 3c.5 3 2 4.5 5 5"/></svg></a><a href="mailto:hello@theelectriceats.com" aria-label="Email"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></a></div><p class="legal">© 2026 The Electric Eats. These statements have not been evaluated by the Food and Drug Administration. Products are not intended to diagnose, treat, cure, or prevent disease.</p></div></div></footer>`;const foot=host.querySelector('.site-footer');if(foot&&'IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){foot.classList.add('footer-alive');io.disconnect()}}),{threshold:.18});io.observe(foot)}else if(foot){foot.classList.add('footer-alive')}}
  function renderModal(){const host=$('[data-site-modal]');if(!host)return;host.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-label="Media viewer"><div class="modal-card"><button class="modal-close icon-button" type="button" aria-label="Close"><svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="video-frame" data-modal-content></div></div></div><div class="toast" role="status" aria-live="polite"></div>';}
  function initHomeVideo(){const v=$('.home-video');if(!v)return;const source=$('source[data-src]',v);let loaded=false;const kick=()=>{v.play&&v.play().catch(()=>{});};const load=()=>{if(loaded)return;loaded=true;if(source){source.src=source.dataset.src;source.removeAttribute('data-src');v.load();}if(v.readyState>=2)kick();else v.addEventListener('loadeddata',kick,{once:true});};v.muted=true;v.setAttribute('muted','');v.setAttribute('playsinline','');if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){load();observer.disconnect();}},{rootMargin:'800px 0px'});observer.observe(v);}else load();}
  function initNavSearchCart(){
    const toggleBtn=$('[data-search-toggle]'),panel=$('[data-search-panel]'),closeBtn=$('[data-search-close]');
    if(panel){const input=$('input[name="q"]',panel);
      const openP=()=>{panel.classList.add('open');panel.setAttribute('aria-hidden','false');if(input)setTimeout(()=>input.focus(),20);};
      const closeP=()=>{panel.classList.remove('open');panel.setAttribute('aria-hidden','true');};
      if(toggleBtn)toggleBtn.addEventListener('click',()=>panel.classList.contains('open')?closeP():openP());
      if(closeBtn)closeBtn.addEventListener('click',closeP);
      panel.addEventListener('submit',e=>{e.preventDefault();const q=(input&&input.value||'').trim();location.href='shop.html'+(q?('?q='+encodeURIComponent(q)):'');});
      document.addEventListener('keydown',e=>{if(e.key==='Escape')closeP();});}
    // cart: open the Shopify storefront cart drawer if present, else go to shop
    $$('[data-cart-open]').forEach(btn=>btn.addEventListener('click',()=>{try{if(window.KawsaypacStorefront&&typeof window.KawsaypacStorefront.openCart==='function'){window.KawsaypacStorefront.openCart();return;}}catch(e){}location.href='shop.html';}));
    // live cart count from the Shopify storefront cart element if it exposes one
    const badge=$('[data-cart-count]');
    if(badge){const sync=()=>{try{const cart=document.getElementById('storefront-cart');const n=cart&&(cart.count||cart.getAttribute('count'));const v=parseInt(n,10);badge.textContent=isFinite(v)?v:0;badge.style.display=(isFinite(v)&&v>0)?'grid':'none';}catch(e){}};sync();setInterval(sync,2500);}
  }
  function initNav(){const toggle=$('.menu-toggle'),sheet=$('.mobile-sheet');if(toggle&&sheet){toggle.addEventListener('click',()=>{const open=!sheet.classList.contains('open');sheet.classList.toggle('open',open);sheet.setAttribute('aria-hidden',String(!open));toggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});$$('a',sheet).forEach(a=>a.addEventListener('click',()=>{sheet.classList.remove('open');document.body.classList.remove('menu-open')}));$$('.msheet-toggle',sheet).forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const g=b.closest('.msheet-group');const open=!g.classList.contains('open');$$('.msheet-group.open',sheet).forEach(x=>{x.classList.remove('open');const t=x.querySelector('.msheet-toggle');if(t)t.setAttribute('aria-expanded','false')});g.classList.toggle('open',open);b.setAttribute('aria-expanded',String(open))}));sheet.addEventListener('click',e=>{if(e.target===sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');toggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')}});}$$('.drop-trigger').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const item=btn.closest('.nav-item');const open=!item.classList.contains('open');$$('.nav-item.open').forEach(i=>i.classList.remove('open'));item.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open))}));document.addEventListener('click',()=>$$('.nav-item.open').forEach(i=>i.classList.remove('open')));document.addEventListener('keydown',e=>{if(e.key==='Escape'){$$('.nav-item.open').forEach(i=>i.classList.remove('open'));if(sheet){sheet.classList.remove('open');document.body.classList.remove('menu-open');}}});}
  function card(p){const note=p.slug==='zapped-in'?'<span class="hand-note" aria-hidden="true">Raisa’s morning pick</span>':'';return `<article class="product-card reveal" data-shop-product data-concern="${p.concerns}" data-type="${p.tag.toLowerCase()}"><a class="product-media" href="product.html?product=${p.slug}"><img src="${p.image.startsWith('http')?p.image:p.image+'?v=17'}" alt="${p.name} herbal product" loading="lazy"><span class="product-tag">${p.tag}</span>${note}</a><div class="product-copy"><h3>${p.name}</h3><strong>${p.price}</strong><p>${p.desc}</p><a class="card-link" href="product.html?product=${p.slug}">Shop this blend</a></div></article>`}
  function renderHomeData(){const pillars=$('[data-pillars]');if(pillars){const d=[['Ancestral Wisdom','mountain-herb-rosette.webp','Formulas guided by generations of Kichwa plant knowledge.'],['Wildcrafted & Ethical','guayusa-sprig.webp','Hand-harvested in the wild, never bulked with fillers.'],['Plant Medicine is Sacred','passionflower-vine.webp','Prepared with respect and shared with clear guidance.'],['Healing Together','herbal-teacup.webp','Direct partnerships that return value to the source.']];pillars.innerHTML=d.map(x=>`<article class="pillar reveal"><img loading="lazy" decoding="async" src="assets/sprites/herb-icons/${x[1]}?v=35" alt=""><h3>${x[0]}</h3><p>${x[2]}</p></article>`).join('')}const best=$('[data-best-sellers]');if(best){const picks=[['scales-of-balance','Nervous System'],['sacred-sacral','Womb Health'],['zapped-in','Energy'],['bowel-balance','Digestive'],['final-flush','Detox']];best.innerHTML=picks.map(([slug,tag])=>{const p=products.find(x=>x.slug===slug);return `<article class="product-card best-card reveal"><a class="product-media" href="product.html?product=${p.slug}"><img src="${p.image.startsWith('http')?p.image:p.image+'?v=17'}" alt="${p.name} herbal product" loading="lazy" decoding="async" width="640" height="640"><span class="product-tag">${tag}</span></a><div class="product-copy best-copy"><h3>${p.name}</h3><div class="best-buy"><strong>${p.price}</strong><a class="card-link" href="product.html?product=${p.slug}">Shop</a></div></div></article>`}).join('')}const grid=$('[data-concern-grid]');if(grid){const rows=[['Digestive Health','digestive-health','gen5/con-digestive'],["Women's Wellness",'womens-wellness','gen5/con-womens'],['Nervous System','nervous-system','gen5/con-nervous'],['Energy & Vitality','energy-vitality','gen5/con-energy'],['Immune Support','auto-immune-support','gen5/con-immune'],['Sleep & Relaxation','sleep-relaxation','gen5/con-sleep'],['Detox & Cleanse','full-body-detox','gen5/con-detox'],['Joint & Mobility','joint-mobility','gen5/con-joint'],['Hormone Balance','hormone-balance','gen5/con-hormone'],['All Concerns','all','gen5/con-all']];grid.innerHTML=rows.map(r=>`<a class="concern-circle" href="shop.html?concern=${r[1]}"><span class="concern-bowl"><img loading="lazy" decoding="async" width="340" height="340" src="assets/img/${r[2]}.webp?v=63" alt=""></span><strong>${r[0]}</strong></a>`).join('')};const videos=$('[data-video-stories]');if(videos){const V=window.KAWSAY_VIDEOS;
      /* Real, client-approved reviews. Cards stay poster-only so the homepage
         does not download the 2:56 film until a visitor asks to watch it. */
      const card=(x,i)=>`<button class="story-916" type="button" data-vlb="${i}" aria-label="Watch customer review: ${x.label}"><img src="${x.poster}?v=1" alt="Customer review for ${x.label}" loading="lazy" decoding="async" width="720" height="1280"><span class="video-play"><svg viewBox="0 0 24 24" aria-hidden="true" style="width:22px;fill:currentColor"><path d="M8 5v14l11-7z"/></svg></span><span class="story-916-copy"><strong>${x.label}</strong></span></button>`;const set=V.map(card).join('');videos.innerHTML=`<div class="story-rail" data-story-rail><div class="story-rail-track">${set}${set}</div></div>`}}
  /* Rituals-photographed gallery removed per client 30 Jul; its renderer went with it. */
  function initUgcSwap(host){
    /* UGC slots: when a real testimonial file lands at assets/video/ugc/ugc-N.mp4
       the matching poster card upgrades itself into an inline player. Until then
       the card keeps its poster + play affordance (labeled placeholder modal). */
    if(!host||!('fetch'in window)||location.protocol==='file:')return;
    $$('.video-card',host).forEach((btn,index)=>{
      const src=`assets/video/ugc/ugc-${index+1}.mp4`;
      fetch(src,{method:'HEAD'}).then(res=>{
        const type=(res.headers.get('content-type')||'').toLowerCase();
        if(!res.ok||!(type.includes('video')||type.includes('octet-stream')))return;
        const poster=btn.querySelector('img'),label=btn.querySelector('.video-card-copy strong');
        const card=document.createElement('div');
        card.className='video-card ugc-live reveal visible';
        card.setAttribute('role','button');
        card.setAttribute('tabindex','0');
        card.setAttribute('aria-label',`Play testimonial: ${label?label.textContent:'customer story'}`);
        card.innerHTML=`<video preload="metadata" playsinline loop poster="${poster?poster.src:''}"><source src="${src}" type="video/mp4"></video><span class="video-play"><svg viewBox="0 0 24 24" aria-hidden="true" style="width:22px;fill:currentColor"><path d="M8 5v14l11-7z"/></svg></span><span class="video-card-copy"><strong>${label?label.textContent:''}</strong></span>`;
        btn.replaceWith(card);
        const vid=card.querySelector('video');
        const toggle=()=>{if(vid.paused){$$('.ugc-live video',host).forEach(other=>{if(other!==vid)other.pause()});vid.play().catch(()=>{})}else vid.pause()};
        card.addEventListener('click',toggle);
        card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
        vid.addEventListener('play',()=>card.classList.add('is-playing'));
        vid.addEventListener('pause',()=>card.classList.remove('is-playing'));
      }).catch(()=>{});
    });
  }
  function initReveal(){
    ['.collection-row','.product-grid','.concern-row','.philo-credo','.pillar-grid'].forEach(sel=>{
      const host=document.querySelector(sel); if(!host)return;
      host.classList.add(sel.replace('.','').replace('collection-row','collections').replace('product-grid','products'));
      [...host.children].forEach((c,i)=>c.style.setProperty('--i',i));
      const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io2.unobserve(e.target)}}),{threshold:.15});
      io2.observe(host);
    });
if(matchMedia('(prefers-reduced-motion: reduce)').matches){$$('.reveal').forEach(e=>e.classList.add('visible'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(e=>io.observe(e));
    /* iOS Safari safety net: observers can stall mid-scroll and leave ghost
       half-invisible sections; sweep the viewport and force-reveal. */
    const sweep=()=>{$$('.reveal:not(.visible)').forEach(e=>{const r=e.getBoundingClientRect();if(r.top<innerHeight+120&&r.bottom>-120)e.classList.add('visible')});$$('.collection-row:not(.visible),.product-grid:not(.visible),.concern-row:not(.visible),.philo-credo:not(.visible),.pillar-grid:not(.visible)').forEach(h=>{const r=h.getBoundingClientRect();if(r.top<innerHeight+120&&r.bottom>-120)h.classList.add('visible')})};
    let sweepRaf=0;addEventListener('scroll',()=>{if(!sweepRaf)sweepRaf=requestAnimationFrame(()=>{sweepRaf=0;sweep()})},{passive:true});setInterval(sweep,900);sweep()}
  function initHero(){const hero=$('.hero-scroll');if(!hero)return;const layers={far:$('.layer-far'),peak:$('.layer-cotopaxi'),valley:$('.layer-valley'),front:$('.layer-foreground'),foliage:$('.layer-foliage')},backdrop=$('.hero-static-range'),finalScene=$('.hero-final-scene'),brand=$('.brand-statement'),copy=$('.hero-copy');const mobile=matchMedia('(max-width: 720px)').matches,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(mobile||reduce||!window.gsap||!window.ScrollTrigger){Object.values(layers).forEach(e=>e&&(e.style.transform='none'));if(backdrop)backdrop.style.display='none';if(finalScene){finalScene.style.opacity='1';finalScene.style.visibility='visible';finalScene.style.clipPath='none'}if(brand)brand.style.display='none';if(copy){copy.style.opacity='1';copy.style.visibility='visible';copy.style.transform='none'}return}gsap.registerPlugin(ScrollTrigger);const starts={far:86,peak:62,valley:118,front:132,foliage:145},ends={far:0,peak:-7,valley:0,front:0,foliage:0};const timing={far:[.03,.31],peak:[.06,.40],valley:[.20,.38],front:[.30,.36],foliage:[.39,.31]};const progress=(p,start,duration)=>Math.max(0,Math.min(1,(p-start)/duration));Object.entries(layers).forEach(([k,e])=>e&&gsap.set(e,{yPercent:starts[k],autoAlpha:1}));if(backdrop)gsap.set(backdrop,{autoAlpha:.24,scale:1.04});gsap.set(finalScene,{autoAlpha:0});ScrollTrigger.create({trigger:hero,start:'top top',end:'+=205%',pin:$('.hero-sticky'),scrub:true,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>{const p=self.progress;Object.entries(layers).forEach(([k,e])=>{if(!e)return;const [start,duration]=timing[k];const t=progress(p,start,duration);const eased=1-Math.pow(1-t,3);gsap.set(e,{yPercent:starts[k]+(ends[k]-starts[k])*eased,y:k==='peak'?-20*eased:0})});if(backdrop)gsap.set(backdrop,{autoAlpha:.24*(1-progress(p,.02,.28)),scale:1.04-progress(p,.02,.28)*.04});const bo=1-progress(p,.10,.13);gsap.set(brand,{autoAlpha:bo,y:(1-bo)*-10});const co=progress(p,.74,.13);gsap.set(copy,{autoAlpha:co,y:18*(1-co)});}})}
  function initFilm(){const frame=$('[data-youtube-film]');if(!frame)return;let loaded=false;const command=func=>{if(frame.contentWindow)frame.contentWindow.postMessage(JSON.stringify({event:'command',func,args:[]}), 'https://www.youtube.com')};const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(!loaded){frame.src=frame.dataset.src;loaded=true;setTimeout(()=>command('playVideo'),900)}else command('playVideo')}else if(loaded)command('pauseVideo')}),{threshold:.45});io.observe(frame)}
  function initDraggableSprites(){
    /* Raisa's editorial botanicals: NOT draggable, NOT interactive. They frame
       the composition like a photoshoot, growing into the page. Curated to a
       few intentional florals: a white orchid string down the LEFT of Our
       Collections, and two tropical heliconia descending into Shop by Concern.
       Everything scattered was removed per her recap. Gentle sway only. */
    const placements=[
      ['.collections','assets/img/raisa/generated/orchid-cascade-v2.webp','-1%','6%','clamp(250px,23vw,440px)','left-frame'],
      ['.concern-section','assets/img/raisa/concern-heliconia-left.webp','-1%','-2%','clamp(120px,13vw,215px)','descend'],
      ['.concern-section','assets/img/raisa/concern-heliconia-right.webp','right','-2%','clamp(115px,12vw,205px)','descend']
    ];
    placements.forEach(([selector,path,left,top,size,role],index)=>{
      const host=$(selector);if(!host)return;
      if(getComputedStyle(host).position==='static')host.style.position='relative';
      host.style.isolation='isolate';
      const sprite=document.createElement('span');
      sprite.className=`eco-botanical eco-${role}`;
      sprite.setAttribute('aria-hidden','true');
      const anchor=left==='right'?'left:auto;right:1.2%':`left:${left}`;
      sprite.style.cssText=`${anchor};top:${top};--eco-size:${size};--eco-delay:-${(index*1.7).toFixed(1)}s;--eco-dur:${11+index*2}s;--eco-di:${(index*.22).toFixed(2)}s`;
      sprite.innerHTML=`<img src="${path}?v=101" alt="" loading="lazy" decoding="async" draggable="false">`;
      host.append(sprite);
      if(role==='descend'){
        // lagged follow: the vines CHASE the scroll with a visible delay,
        // gliding down when you scroll down and back up when you scroll up.
        if(matchMedia('(prefers-reduced-motion: reduce)').matches){sprite.style.opacity='1';sprite.style.transform='none';return}
        let target=0,current=0,running=false;
        const phoneMq=matchMedia('(max-width: 720px)');
        const computeTarget=()=>{const r=host.getBoundingClientRect();const vh=innerHeight;const p=Math.max(0,Math.min(1,(vh-r.top)/(r.height+vh)));target=phoneMq.matches?(-18+p*30):(-130+p*300);if(p>0.02)sprite.classList.add('eco-live')};
        const tick=()=>{computeTarget();current+=(target-current)*0.055;sprite.style.transform=`translateY(${current.toFixed(1)}px)`;if(Math.abs(target-current)>0.3)requestAnimationFrame(tick);else running=false};
        const wake=()=>{if(!running){running=true;requestAnimationFrame(tick)}};
        addEventListener('scroll',wake,{passive:true});
        wake();
      }
    });
  }
  function initPhilosophySpotlight(){
    const sec=document.querySelector('.philosophy');
    if(!sec||!matchMedia('(hover: hover) and (pointer: fine)').matches)return;
    const glow=document.createElement('div');glow.className='philo-spotlight';sec.prepend(glow);
    sec.addEventListener('pointermove',e=>{const r=sec.getBoundingClientRect();glow.style.setProperty('--sx',`${e.clientX-r.left}px`);glow.style.setProperty('--sy',`${e.clientY-r.top}px`);glow.style.opacity='1'},{passive:true});
    sec.addEventListener('pointerleave',()=>{glow.style.opacity='0'},{passive:true});
  }
  function initLivingInterface(){
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce)return;
    const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
    const root=document.documentElement;
    let frame=0,lastX=innerWidth/2,lastY=innerHeight/2;
    const paint=()=>{frame=0;const nx=(lastX/innerWidth-.5)*2,ny=(lastY/innerHeight-.5)*2;root.style.setProperty('--scene-x',`${(nx*13).toFixed(2)}px`);root.style.setProperty('--scene-y',`${(ny*9).toFixed(2)}px`);root.style.setProperty('--scene-x-back',`${(nx*-7).toFixed(2)}px`);root.style.setProperty('--scene-y-back',`${(ny*-5).toFixed(2)}px`);$$('.drag-sprite:not(.is-dragging)').forEach((sprite,index)=>{const depth=Number(sprite.style.getPropertyValue('--sprite-depth'))||.5;sprite.style.setProperty('--pointer-x',`${(nx*11*depth).toFixed(2)}px`);sprite.style.setProperty('--pointer-y',`${(ny*8*depth).toFixed(2)}px`)});if(cursor){cursor.style.setProperty('--cursor-x',`${lastX}px`);cursor.style.setProperty('--cursor-y',`${lastY}px`)}};
    let cursor=null;
    if(fine){cursor=document.createElement('div');cursor.className='cursor-bloom';cursor.setAttribute('aria-hidden','true');document.body.append(cursor)}
    document.addEventListener('pointermove',e=>{lastX=e.clientX;lastY=e.clientY;if(!frame)frame=requestAnimationFrame(paint)},{passive:true});
    $$('a,button,.product-card,.bowl-card,.image-story,.video-card,.retreat-chapter,.specimen').forEach(el=>{el.addEventListener('pointerenter',()=>cursor&&cursor.classList.add('is-active'));el.addEventListener('pointerleave',()=>{cursor&&cursor.classList.remove('is-active');el.style.removeProperty('--mag-x');el.style.removeProperty('--mag-y')});if(el.matches('.btn,.icon-button'))el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mag-x',`${((e.clientX-r.left)/r.width-.5)*8}px`);el.style.setProperty('--mag-y',`${((e.clientY-r.top)/r.height-.5)*6}px`)})});
    $$('.section,.shop-hero,.page-hero,.pdp-hero').forEach(section=>{const react=e=>{const r=section.getBoundingClientRect(),x=((e.clientX-r.left)/r.width-.5)*2,y=((e.clientY-r.top)/r.height-.5)*2;section.style.setProperty('--react-x',`${(x*7).toFixed(2)}px`);section.style.setProperty('--react-y',`${(y*5).toFixed(2)}px`)};section.addEventListener('pointermove',react,{passive:true});section.addEventListener('pointerleave',()=>{section.style.setProperty('--react-x','0px');section.style.setProperty('--react-y','0px')});section.addEventListener('pointerdown',react,{passive:true})});
  }
  function toast(message){const t=$('.toast');if(!t)return;t.textContent=message;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3800)}
  function initKlaviyo(){
    const api=window.KawsaypacKlaviyo;
    if(!api)return;
    /* The published desktop and mobile Klaviyo quiz forms still carry the
       legacy Shopify collection URL on their Success-step best-sellers CTA.
       Keep visitors inside whichever host serves this headless storefront,
       including the preview today and the custom domain after cutover. */
    document.addEventListener('click',event=>{
      const path=typeof event.composedPath==='function'?event.composedPath():[event.target];
      const button=path.find(node=>node?.matches?.('form.klaviyo-form button, form.klaviyo-form a')&&/shop\s+our\s+best\s+sellers/i.test(node.textContent||''));
      if(!button)return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      location.assign(new URL('shop.html#live-apothecary',document.baseURI).href);
    },true);
    const ensurePanel=()=>{
      let panel=$('[data-marketing-consent]');
      if(panel)return panel;
      panel=document.createElement('section');
      panel.className='marketing-consent';
      panel.dataset.marketingConsent='';
      panel.setAttribute('role','dialog');
      panel.setAttribute('aria-label','Marketing and cookie preferences');
      panel.hidden=true;
      panel.innerHTML='<div class="marketing-consent__copy"><strong>Your privacy, your choice.</strong><p>Allow marketing analytics to enable Klaviyo forms and improve your shopping experience. Necessary site functions always remain available.</p><a href="privacy.html">Privacy Policy</a></div><div class="marketing-consent__actions"><button class="btn btn-outline" type="button" data-consent-deny>Necessary only</button><button class="btn btn-primary" type="button" data-consent-allow>Allow analytics</button></div>';
      document.body.append(panel);
      $('[data-consent-deny]',panel).addEventListener('click',()=>{api.setConsent('denied');panel.hidden=true});
      $('[data-consent-allow]',panel).addEventListener('click',()=>{api.setConsent('granted');panel.hidden=true});
      return panel;
    };
    const openPreferences=()=>{const panel=ensurePanel();panel.hidden=false;const selected=api.getConsent()==='granted'?'[data-consent-allow]':'[data-consent-deny]';setTimeout(()=>$(selected,panel)?.focus(),20)};
    const privacyLink=$('.footer-col a[href="privacy.html"]');
    if(privacyLink&&!$('[data-marketing-preferences]')){
      const item=document.createElement('li');
      item.innerHTML='<button class="kx-privacy-choice" type="button" data-marketing-preferences>Cookie preferences</button>';
      privacyLink.closest('ul')?.append(item);
      $('[data-marketing-preferences]',item)?.addEventListener('click',openPreferences);
    }
    /* Global Privacy Control is a browser-level opt-out signal. Honor it before
       displaying or loading any marketing integration. */
    if(!api.getConsent()&&navigator.globalPrivacyControl===true)api.setConsent('denied');
    if(!api.getConsent())openPreferences();
    else api.load();
    let latestProduct=null;
    document.addEventListener('kawsaypac:product-viewed',event=>{latestProduct=event.detail||{};api.trackViewedProduct(latestProduct)});
    document.addEventListener('kawsaypac:marketing-consent',event=>{if(event.detail?.status==='granted'&&latestProduct)api.trackViewedProduct(latestProduct)});
    document.addEventListener('click',event=>{
      const path=typeof event.composedPath==='function'?event.composedPath():[event.target];
      const checkout=path.some(node=>{
        if(!node||node===window||node===document)return false;
        const slot=node.getAttribute&&node.getAttribute('slot');
        const text=(node.textContent||'').trim();
        return slot==='checkout-button'||/secure shopify checkout/i.test(text);
      });
      const cart=path.find(node=>node&&node.id==='storefront-cart');
      if(checkout&&cart&&cart.dataset.termsRecorded==='true')api.trackCheckoutHandoff();
    },true);
  }
  function initForms(){
    $$('[data-newsletter],.contact-form').forEach(form=>form.addEventListener('submit',e=>{
      e.preventDefault();
      const email=$('input[type="email"]',form);
      if(email&&(!email.value||!email.validity.valid)){toast('Please enter a valid email address.');email.focus();return}
      if(form.matches('[data-newsletter]')){
        const api=window.KawsaypacKlaviyo;
        if(api&&api.getConsent()==='granted'&&api.identify(email?.value,{Source:'Website newsletter'})){
          api.track('Newsletter Signup Requested',{Source:'Kawsaypac website'});
          toast('Thank you. Your email preferences were sent securely.');
        }else toast('Please allow marketing analytics before joining the email list.');
        return;
      }
      toast('Thank you. Your email app will open with this message.');
      if(form.classList.contains('contact-form')){const data=new FormData(form);location.href=`mailto:hello@theelectriceats.com?subject=${encodeURIComponent(data.get('subject')||'Kawsaypac inquiry')}&body=${encodeURIComponent(data.get('message')||'')}`}
    }));
    $$('[data-add-cart]').forEach(btn=>btn.addEventListener('click',()=>toast('Added to the preview bag. Shopify checkout will be connected at launch.')));
  }
  function initLooxCarousels(){
    const hosts=$$('[data-loox-carousel]');
    if(!hosts.length)return;
    const ready=host=>{
      const mount=$('.loox-v2-carousel-container',host);
      if(!mount||(!mount.childElementCount&&!mount.textContent.trim()))return false;
      host.hidden=false;
      const section=host.closest('.kx-reviews,.loox-community');
      if(section)section.classList.add('loox-ready');
      return true;
    };
    const observer=new MutationObserver(()=>hosts.forEach(ready));
    hosts.forEach(host=>observer.observe(host,{childList:true,subtree:true}));
    loadLoox();
    let checks=0;
    const timer=setInterval(()=>{checks++;const done=hosts.every(ready);if(done||checks>=20){clearInterval(timer);observer.disconnect()}},500);
  }
  function initGalleryImgRetry(){
    /* Insurance for transient CDN 404s mid-deploy: one cache-busted retry. */
    document.addEventListener('error',e=>{
      const im=e.target;
      if(im&&im.tagName==='IMG'&&/assets\/img\/gallery\//.test(im.src)&&!im.dataset.retried){
        im.dataset.retried='1';
        setTimeout(()=>{im.src=im.src.split('?')[0]+'?r='+Math.floor(performance.now())},800);
      }
    },true);
  }
  function initKawsayLightbox(){
    const V=window.KAWSAY_VIDEOS||[];
    const lb=document.createElement('div');lb.className='vlb';lb.hidden=true;lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Testimonial viewer');
    lb.innerHTML=`<button class="vlb-close" type="button" aria-label="Close viewer"><svg viewBox="0 0 24 24" style="width:20px;stroke:currentColor;stroke-width:2.4;fill:none"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="vlb-rail" data-vlb-rail></div><div class="vlb-stage" data-vlb-stage></div><div class="vlb-controls" aria-label="Customer story navigation"><button class="vlb-direction vlb-prev" type="button" aria-label="Previous customer story"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><p class="vlb-position" data-vlb-position aria-live="polite"></p><button class="vlb-direction vlb-next" type="button" aria-label="Next customer story"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div>`;
    document.body.append(lb);
    const rail=lb.querySelector('[data-vlb-rail]'),stage=lb.querySelector('[data-vlb-stage]'),closeBtn=lb.querySelector('.vlb-close'),prevBtn=lb.querySelector('.vlb-prev'),nextBtn=lb.querySelector('.vlb-next'),position=lb.querySelector('[data-vlb-position]');
    let mode='video',imgList=[],last=null,current=0,touchX=null;
    function railThumb(src,i,label){return `<button class="vlb-thumb" type="button" data-vlb-jump="${i}" aria-label="${label}"><img loading="lazy" decoding="async" src="${src}" alt=""></button>`}
    function paintRail(items){rail.innerHTML=items.join('')}
    function setActive(i){current=i;const items=mode==='video'?V:imgList;$$('.vlb-thumb',rail).forEach((t,k)=>t.classList.toggle('is-active',k===i));const on=$$('.vlb-thumb',rail)[i];if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});position.textContent=`${i+1} of ${items.length}`}
    function showVideo(i){mode='video';const x=V[i];if(!x)return;stage.innerHTML=`<video src="${x.mp4}" controls playsinline preload="metadata" poster="${x.poster}?v=1" aria-label="Customer review: ${x.label}"></video>`;setActive(i);const v=stage.querySelector('video');v&&v.play().catch(()=>{})}
    function showImage(i){mode='image';const src=imgList[i];if(!src)return;stage.innerHTML=`<img src="${src}" alt="Customer photo">`;setActive(i)}
    function openShell(){lb.hidden=false;void lb.offsetWidth;lb.classList.add('open');document.body.classList.add('modal-open');closeBtn.focus()}
    function shut(){lb.classList.remove('open');document.body.classList.remove('modal-open');const v=stage.querySelector('video');v&&v.pause();setTimeout(()=>{if(!lb.classList.contains('open')){lb.hidden=true;stage.innerHTML=''}},280);if(last&&last.focus)last.focus()}
    function openVideo(i){last=document.activeElement;paintRail(V.map((x,k)=>railThumb(x.poster+'?v=1',k,'Play '+x.label)));openShell();showVideo(i)}
    function openImages(list,i){last=document.activeElement;imgList=list;paintRail(list.map((s2,k)=>railThumb(s2,k,'View photo '+(k+1))));openShell();showImage(i)}
    function step(delta){const items=mode==='video'?V:imgList;if(!items.length)return;const next=(current+delta+items.length)%items.length;mode==='video'?showVideo(next):showImage(next)}
    window.kawsayLightbox={openVideo,openImages};
    rail.addEventListener('click',e=>{const b=e.target.closest('[data-vlb-jump]');if(!b)return;const i=+b.dataset.vlbJump;mode==='video'?showVideo(i):showImage(i)});
    prevBtn.addEventListener('click',()=>step(-1));
    nextBtn.addEventListener('click',()=>step(1));
    stage.addEventListener('touchstart',e=>{touchX=e.changedTouches[0]?.clientX??null},{passive:true});
    stage.addEventListener('touchend',e=>{if(touchX===null)return;const dx=(e.changedTouches[0]?.clientX??touchX)-touchX;touchX=null;if(Math.abs(dx)>52)step(dx<0?1:-1)},{passive:true});
    closeBtn.addEventListener('click',shut);
    lb.addEventListener('click',e=>{if(e.target===lb||e.target===stage)shut()});
    document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')shut();else if(e.key==='ArrowLeft')step(-1);else if(e.key==='ArrowRight')step(1)});
    /* Authentic testimonial cards open in the fullscreen viewer. Direct
       listeners keep the control reliable across static and rendered rails. */
    $$('.story-916[data-vlb]').forEach(card=>card.addEventListener('click',e=>{
      e.preventDefault();
      openVideo(+card.dataset.vlb%V.length);
    }));
    document.addEventListener('click',e=>{
      const gp=e.target.closest('[data-gpic]');
      if(gp){const scope=gp.closest('[data-gpic-scope]')||document;const all=$$('[data-gpic]',scope).map(el=>el.dataset.gpic);openImages(all,all.indexOf(gp.dataset.gpic))}
    });
  }
  function initModal(){const modal=$('.modal'),content=$('[data-modal-content]'),close=$('.modal-close');if(!modal)return;let last=null;function shut(){modal.classList.remove('open');document.body.classList.remove('modal-open');content.innerHTML='';if(last)last.focus()}function open(el){last=el;const src=el.dataset.video;const mp4=el.dataset.videoMp4;if(mp4)content.innerHTML=`<video src="${mp4}" loop autoplay playsinline disablePictureInPicture controlsList="nofullscreen nodownload noremoteplayback" style="width:100%;height:100%;object-fit:contain;background:#000"></video>`;else if(src)content.innerHTML=`<iframe src="${src}" title="Kawsaypac film" allow="autoplay; fullscreen" allowfullscreen></iframe>`;else content.innerHTML='<div style="padding:50px;text-align:center"><p class="eyebrow" style="color:#f0d77c">Client footage pending</p><h2 style="font-family:var(--display);font-weight:400">Customer video placeholder</h2><p>This clearly labeled preview position will hold an approved customer story.</p></div>';modal.classList.add('open');document.body.classList.add('modal-open');close.focus()}$$('[data-video],[data-placeholder-video],[data-video-mp4]').forEach(el=>el.addEventListener('click',()=>open(el)));close&&close.addEventListener('click',shut);modal.addEventListener('click',e=>{if(e.target===modal)shut()});modal.addEventListener('touchmove',e=>{if(e.target===modal)shut()},{passive:true});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))shut()})}
  /* Blogs now lives directly in the footer Explore column (columns merged 30 Jul). */
  function initPopovers(){
    const triggers=$$('[data-pop]');if(!triggers.length)return;
    const data={
      herbs:{img:'assets/img/apoth-guayusa.webp',line:'Single wildcrafted botanicals, kept whole from the Andes to your cup.',href:'shop.html#live-apothecary',label:'Browse the herbs'},
      blends:{img:'assets/img/blend-river-of-life.webp',line:'Small-batch house formulas built around one clear daily ritual.',href:'shop.html#live-apothecary',label:'Meet the blends'},
      bundles:{img:'assets/img/blend-eliminate-regenerate.webp',line:'Complete ritual kits that pair complementary blends with gentle guidance.',href:'shop.html#live-apothecary',label:'See the bundles'}
    };
    const pop=document.createElement('div');pop.className='mini-pop';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','A closer look');pop.hidden=true;document.body.append(pop);
    let active=null,hideTimer=0;
    const hide=()=>{clearTimeout(hideTimer);pop.classList.remove('is-open');active&&active.setAttribute('aria-expanded','false');active=null;setTimeout(()=>{if(!pop.classList.contains('is-open'))pop.hidden=true},320)};
    const scheduleHide=()=>{clearTimeout(hideTimer);hideTimer=setTimeout(hide,260)};
    const show=trigger=>{
      const d=data[trigger.dataset.pop];if(!d)return;clearTimeout(hideTimer);
      if(active&&active!==trigger)active.setAttribute('aria-expanded','false');
      active=trigger;trigger.setAttribute('aria-expanded','true');
      pop.innerHTML=`<img class="mini-pop-photo" src="${d.img}?v=25" alt=""><div class="mini-pop-copy"><p>${d.line}</p><a href="${d.href}">${d.label}</a></div><img class="mini-pop-leaf" src="assets/sprites/herb-icons/guayusa-sprig.webp?v=32" alt="">`;
      pop.hidden=false;
      const r=trigger.getBoundingClientRect(),w=Math.min(300,innerWidth-24);
      pop.style.width=w+'px';
      const left=Math.max(12,Math.min(innerWidth-w-12,r.left+scrollX+r.width/2-w/2));
      pop.style.left=left+'px';pop.style.top=(r.bottom+scrollY+12)+'px';
      requestAnimationFrame(()=>pop.classList.add('is-open'));
    };
    triggers.forEach(t=>{
      t.setAttribute('tabindex','0');t.setAttribute('role','button');t.setAttribute('aria-haspopup','dialog');t.setAttribute('aria-expanded','false');
      t.addEventListener('mouseenter',()=>show(t));
      t.addEventListener('mouseleave',scheduleHide);
      t.addEventListener('focus',()=>show(t));
      t.addEventListener('blur',scheduleHide);
      t.addEventListener('click',e=>{e.preventDefault();active===t&&pop.classList.contains('is-open')?hide():show(t)});
      t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();active===t&&pop.classList.contains('is-open')?hide():show(t)}});
    });
    pop.addEventListener('mouseenter',()=>clearTimeout(hideTimer));
    pop.addEventListener('mouseleave',scheduleHide);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){const t=active;hide();t.focus()}});
    document.addEventListener('click',e=>{if(active&&!pop.contains(e.target)&&!e.target.closest('[data-pop]'))hide()});
    addEventListener('scroll',()=>{if(active)hide()},{passive:true});
  }
  function initFooterHummingbird(){
    /* Raisa 23-24 Jul: "this little hummingbird can go" - removed per her request */
    return;
  }
  function initSectionDrift(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||matchMedia('(max-width: 720px)').matches)return;
    const els=$$('.philo-accent img,.herb-plate img,.concern-sprites img');if(!els.length)return;
    let tick=0;
    const paint=()=>{tick=0;const vh=innerHeight;els.forEach((el,i)=>{const r=el.getBoundingClientRect();if(r.bottom<-60||r.top>vh+60)return;const p=(r.top+r.height/2)/vh-.5;const amp=i%2?9:12;el.style.translate=`0 ${(-p*amp*2).toFixed(1)}px`})};
    addEventListener('scroll',()=>{if(!tick)tick=requestAnimationFrame(paint)},{passive:true});
    paint();
  }
  function initStatCounters(){const fmt=(v,dec,suf)=>v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec})+suf;const animate=el=>{const target=parseFloat(el.dataset.count),dec=+(el.dataset.decimals||0),suf=el.dataset.suffix||'';if(el.__counted)return;el.__counted=true;if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=fmt(target,dec,suf);return}const t0=performance.now(),dur=1400;const tick=now=>{const p=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=fmt(target*e,dec,suf);if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)};window.__animateCounters=els=>els.forEach(animate);const els=$$('[data-count]').filter(el=>!el.closest('.journey-final'));if(!els.length)return;const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;io.unobserve(en.target);animate(en.target)}),{threshold:.4});els.forEach(e=>io.observe(e))}
  function initGuidedRails(){
    const icon=(dir)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7'}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    $$('[data-guided-track]').forEach(row=>{
      let shell=row.closest('[data-guided-rail]');
      if(!shell){shell=document.createElement('div');shell.className='home-guided-rail';shell.setAttribute('data-guided-rail','');row.before(shell);shell.append(row)}
      let prev=$('[data-guided-prev]',shell),next=$('[data-guided-next]',shell),progress=$('[data-guided-progress]',shell);
      if(!prev||!next||!progress){
        const label=row.dataset.guidedLabel||'items',nav=document.createElement('div');nav.className='concern-rail-nav home-rail-controls';nav.setAttribute('aria-label',`${label} carousel controls`);nav.innerHTML=`<p class="concern-swipe-cue"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 12h8M12 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Swipe to browse</span></p><button class="concern-nav-btn" type="button" data-guided-prev aria-label="Previous ${label}">${icon(-1)}</button><div class="concern-progress" data-guided-progress aria-label="${label} carousel position"></div><button class="concern-nav-btn" type="button" data-guided-next aria-label="Next ${label}">${icon(1)}</button>`;shell.append(nav);
        const cta=document.createElement('a');cta.className='btn btn-primary concern-directory-cta home-rail-cta';cta.href=row.dataset.guidedCta||'shop.html';cta.innerHTML='Discover more <span aria-hidden="true">&rarr;</span>';shell.append(cta);
        prev=$('[data-guided-prev]',shell);next=$('[data-guided-next]',shell);progress=$('[data-guided-progress]',shell);
      }
      let pages=1,frame=0;
      const paint=()=>{frame=0;const max=Math.max(0,row.scrollWidth-row.clientWidth),ratio=max?row.scrollLeft/max:0,index=Math.min(pages-1,Math.round(ratio*(pages-1)));$$('[data-guided-dot]',progress).forEach((dot,i)=>dot.classList.toggle('is-active',i===index));prev.disabled=row.scrollLeft<4;next.disabled=row.scrollLeft>max-4};
      const measure=()=>{const max=Math.max(0,row.scrollWidth-row.clientWidth);pages=Math.max(1,Math.ceil(max/Math.max(1,row.clientWidth*.72))+1);progress.innerHTML=Array.from({length:pages},(_,i)=>`<span data-guided-dot="${i}"${i===0?' class="is-active"':''}></span>`).join('');paint()};
      const move=delta=>row.scrollBy({left:delta*Math.min(row.clientWidth*.74,420),behavior:'smooth'});
      prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
      row.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(paint)},{passive:true});
      row.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}else if(e.key==='ArrowRight'){e.preventDefault();move(1)}});
      addEventListener('resize',measure,{passive:true});measure();
    });
  }
  function initPageNavigator(){
    const nav=$('[data-page-nav]');if(!nav)return;
    const links=$$('a[href^="#"]',nav),targets=links.map(link=>$(link.getAttribute('href'))).filter(Boolean);
    if(!targets.length)return;
    const setActive=id=>links.forEach(link=>{const active=link.getAttribute('href')===`#${id}`;link.classList.toggle('is-active',active);if(active){link.setAttribute('aria-current','location');if(innerWidth<1280){const box=nav.querySelector('.kx-toc-links,ul,ol')||nav;if(box.scrollWidth>box.clientWidth)box.scrollTo({left:link.offsetLeft-(box.clientWidth-link.offsetWidth)/2,behavior:'smooth'})}}else link.removeAttribute('aria-current')});
    if('IntersectionObserver'in window){
      const seen=new Map();
      const sectionIO=new IntersectionObserver(entries=>{entries.forEach(entry=>seen.set(entry.target,entry));const active=targets.filter(target=>seen.get(target)?.isIntersecting).sort((a,b)=>Math.abs(a.getBoundingClientRect().top-150)-Math.abs(b.getBoundingClientRect().top-150))[0];if(active)setActive(active.id)},{rootMargin:'-18% 0px -62% 0px',threshold:[0,.1,.5]});
      targets.forEach(target=>sectionIO.observe(target));
      const footer=$('.site-footer')||$('[data-site-footer]');
      if(footer)new IntersectionObserver(entries=>entries.forEach(entry=>nav.classList.toggle('is-shelved',entry.isIntersecting)),{rootMargin:'0px 0px 18% 0px'}).observe(footer);
    }
    links.forEach(link=>link.addEventListener('click',()=>setActive(link.hash.slice(1))));
    setActive(targets[0].id);
    /* MOBILE (Shreyas, 1 Aug): the chip rail ate the top of every kx page on
       phones. On small screens the rail is hidden entirely and replaced by a
       floating "Sections" pill that opens a bottom sheet with the same links. */
    if(matchMedia('(max-width:760px)').matches&&!document.querySelector('.psn-fab')){
      const fab=document.createElement('button');fab.type='button';fab.className='psn-fab';fab.setAttribute('aria-label','Jump to a section');
      fab.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Sections</span>';
      const sheet=document.createElement('div');sheet.className='psn-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-label','Page sections');
      sheet.innerHTML='<div class="psn-sheet-card"><p class="psn-sheet-title">On this page</p><nav class="psn-sheet-links">'+links.map(l=>`<a href="${l.getAttribute('href')}">${l.textContent}</a>`).join('')+'</nav></div>';
      document.body.append(fab,sheet);
      const close=()=>{sheet.classList.remove('open');fab.classList.remove('open')};
      fab.addEventListener('click',()=>{const open=!sheet.classList.contains('open');sheet.classList.toggle('open',open);fab.classList.toggle('open',open)});
      sheet.addEventListener('click',e=>{if(e.target===sheet)close()});
      sheet.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
      document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    }
  }
  function initThemeVariant(){
    /* Two live versions of the site. The theme lives ONLY in the URL: a plain
       URL is ALWAYS the clean version (no sticky localStorage state, which
       confused review). While ?theme=gradient is present, same-origin nav
       links are decorated with the param so browsing keeps the variant. */
    try{localStorage.removeItem('kx-theme')}catch(e){}
    const q=new URLSearchParams(location.search).get('theme');
    if(q!=='gradient')return;
    document.documentElement.classList.add('theme-gradient');
    const decorate=()=>{
      document.querySelectorAll('a[href]').forEach(a=>{
        const href=a.getAttribute('href')||'';
        if(/^(https?:|mailto:|tel:|#)/.test(href))return;
        if(href.indexOf('theme=gradient')!==-1)return;
        a.setAttribute('href', href+(href.indexOf('?')===-1?'?':'&')+'theme=gradient');
      });
    };
    decorate();
    new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});
  }
  function initCtaPouches(){
    /* The Difference packets follow the cursor: each pouch drifts toward the
       pointer at its own depth (front moves most), with a whisper of rotation
       and lift. Lerped so it glides rather than sticks to the mouse. */
    const sec=$('.home-cta');if(!sec)return;
    if(!matchMedia('(hover: hover) and (pointer: fine)').matches)return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const pouches=$$('.cta-pouch',sec);if(!pouches.length)return;
    const depth=[18,12,9];             /* cta-pouch-1 front ... -3 back */
    const state=pouches.map(()=>({x:0,y:0,tx:0,ty:0}));
    let hoverIdx=-1,running=false;
    sec.classList.add('pouch-live');
    pouches.forEach((p,i)=>{
      const cls=[...p.classList].find(c=>/^cta-pouch-\d$/.test(c));
      p.dataset.di=cls?(+cls.slice(-1)-1):i;
      p.addEventListener('pointerenter',()=>{hoverIdx=i;wake()});
      p.addEventListener('pointerleave',()=>{hoverIdx=-1;wake()});
    });
    const tick=()=>{
      let live=false;
      pouches.forEach((p,i)=>{
        const s=state[i];
        s.x+=(s.tx-s.x)*.09;s.y+=(s.ty-s.y)*.09;
        if(Math.abs(s.tx-s.x)>.15||Math.abs(s.ty-s.y)>.15)live=true;
        p.style.setProperty('--px',s.x.toFixed(1)+'px');
        p.style.setProperty('--py',s.y.toFixed(1)+'px');
        p.style.setProperty('--pr',(s.x*.04).toFixed(2)+'deg');
        p.style.setProperty('--ps',hoverIdx===i?'1.045':'1');
      });
      if(live)requestAnimationFrame(tick);else running=false;
    };
    const wake=()=>{if(!running){running=true;requestAnimationFrame(tick)}};
    sec.addEventListener('pointermove',e=>{
      const r=sec.getBoundingClientRect();
      const nx=(e.clientX-r.left)/r.width-.5, ny=(e.clientY-r.top)/r.height-.5;
      pouches.forEach((p,i)=>{
        const d=depth[p.dataset.di]||10;
        state[i].tx=nx*d*2;state[i].ty=ny*d;
      });
      wake();
    },{passive:true});
    sec.addEventListener('pointerleave',()=>{state.forEach(s=>{s.tx=0;s.ty=0});hoverIdx=-1;wake()},{passive:true});
  }
  function boot(){initThemeVariant();renderHeader();normalizeRibbon();renderFooter();renderModal();initKlaviyo();renderHomeData();initDraggableSprites();initCtaPouches();initNav();initNavSearchCart();initHomeVideo();initHero();initFilm();initReveal();initForms();initLooxCarousels();initModal();initKawsayLightbox();initGalleryImgRetry();initLivingInterface();initPhilosophySpotlight();initPopovers();initFooterHummingbird();initStatCounters();initGuidedRails();initSectionDrift();initPageNavigator();try{console.log('%cBrewed by hand in Ecuador. Curious minds welcome.','color:#1F3A2A;font-size:13px;font-family:Georgia,serif')}catch(e){}document.documentElement.classList.add('ready')}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* 29 Jul: interactive hero clouds. Pointer-parallax with a lagged lerp on the
   CSS `translate` channel, which composes with the GSAP scrub transform
   instead of overwriting it. Desktop pointers only, gentle amplitude. */
(function(){
  'use strict';
  function initCloudDrift(){
    var clouds=Array.prototype.slice.call(document.querySelectorAll('.j5l[data-n^="cloud"]'));
    if(!clouds.length)return;
    if(window.matchMedia('(hover: none)').matches)return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var tx=0,ty=0,cx=0,cy=0;
    window.addEventListener('pointermove',function(e){
      tx=e.clientX/window.innerWidth-.5;
      ty=e.clientY/window.innerHeight-.5;
    },{passive:true});
    var amps=[26,16,34];
    (function loop(){
      cx+=(tx-cx)*.045;
      cy+=(ty-cy)*.045;
      clouds.forEach(function(c,i){
        var a=amps[i%amps.length];
        c.style.translate=(-cx*a).toFixed(1)+'px '+(-cy*a*.7).toFixed(1)+'px';
      });
      window.requestAnimationFrame(loop);
    })();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initCloudDrift,{once:true});
  else initCloudDrift();
})();
