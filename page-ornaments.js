(() => {
  'use strict';

  const ornaments = document.querySelectorAll('[data-page-ornament]');
  if (!ornaments.length) return;

  ornaments.forEach((ornament) => {
    const limit = Math.max(12, Number(ornament.dataset.dragLimit) || 28);
    let x = 0;
    let y = 0;
    let originX = 0;
    let originY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let moved = false;

    const clamp = (value) => Math.min(limit, Math.max(-limit, value));
    const render = () => {
      ornament.style.setProperty('--ornament-x', `${x}px`);
      ornament.style.setProperty('--ornament-y', `${y}px`);
    };
    const reset = () => {
      x = 0;
      y = 0;
      render();
    };

    ornament.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      originX = x;
      originY = y;
      pointerX = event.clientX;
      pointerY = event.clientY;
      moved = false;
      ornament.classList.add('is-dragging');
      ornament.focus({ preventScroll: true });
      ornament.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    ornament.addEventListener('pointermove', (event) => {
      if (!ornament.hasPointerCapture(event.pointerId)) return;
      const deltaX = event.clientX - pointerX;
      const deltaY = event.clientY - pointerY;
      x = clamp(originX + deltaX);
      y = clamp(originY + deltaY);
      moved ||= Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3;
      render();
    });

    const release = (event) => {
      if (ornament.hasPointerCapture(event.pointerId)) {
        ornament.releasePointerCapture(event.pointerId);
      }
      ornament.classList.remove('is-dragging');
    };

    ornament.addEventListener('pointerup', release);
    ornament.addEventListener('pointercancel', release);
    ornament.addEventListener('click', (event) => {
      if (moved) event.preventDefault();
    });
    ornament.addEventListener('dblclick', reset);

    ornament.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 12 : 4;
      if (event.key === 'ArrowLeft') x = clamp(x - step);
      else if (event.key === 'ArrowRight') x = clamp(x + step);
      else if (event.key === 'ArrowUp') y = clamp(y - step);
      else if (event.key === 'ArrowDown') y = clamp(y + step);
      else if (event.key === 'Home') reset();
      else return;
      event.preventDefault();
      render();
    });
  });
})();
