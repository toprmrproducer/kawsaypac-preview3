(function () {
  'use strict';

  let attempts = 0;

  function boot() {
    if (window.KawsaypacStorefront) {
      window.KawsaypacStorefront.initShop();
      return;
    }

    attempts += 1;
    if (attempts < 100) {
      window.setTimeout(boot, 50);
      return;
    }

    const status = document.querySelector('[data-shop-status]');
    const empty = document.querySelector('[data-shop-empty]');
    if (status) status.textContent = 'The live apothecary could not be initialized.';
    if (empty) {
      empty.hidden = false;
      empty.dataset.kind = 'error';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
