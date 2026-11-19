/* Auro Lobo — mejora progresiva, sin recogida de datos. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const behavior = () => motion.matches ? 'instant' : 'smooth';
const root = document.documentElement;
const menu = $('#menu');
const menuBtn = $('#menu-btn');
const main = $('main');
const footer = $('.footer');
const dialog = $('#detail');
let menuOpen = false;
let opener = null;

function setMenu(open, returnFocus = true) {
  menuOpen = open;
  menu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  main.inert = open;
  footer.inert = open;
  $('.header .brand').inert = open;
  document.body.classList.toggle('is-locked', open || dialog.open);
  if (open) $('a', menu).focus();
  else if (returnFocus) menuBtn.focus({ preventScroll: true });
}
menuBtn.addEventListener('click', () => setMenu(!menuOpen));
document.addEventListener('keydown', (event) => {
  if (!menuOpen) return;
  if (event.key === 'Escape') { event.preventDefault(); setMenu(false); }
  if (event.key === 'Tab') {
    const stops = [menuBtn, ...$$('a', menu)];
    const first = stops[0], last = stops.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
matchMedia('(min-width: 960px)').addEventListener('change', (event) => {
  if (event.matches && menuOpen) { setMenu(false, false); $('.nav a').focus(); }
});
// El scroll nativo respeta scroll-padding-top, incluso al cargar un enlace con hash.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  if (menuOpen) setMenu(false, false);
  history.replaceState(null, '', link.hash);
  target.scrollIntoView({ behavior: behavior(), block: 'start' });
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
});

const descriptions = {
  'aro-lobo': 'Un aro de líneas limpias y cierre de bisagra como punto de partida. El acento discreto junto a una americana o una camiseta.',
  'cruz-norte': 'La vertical de una cruz aporta un acento gráfico al aro. Un concepto para dar protagonismo al pendiente.',
  'sello-aureo': 'Botones y sello de tono dorado. Una propuesta para introducir un acento cálido en un conjunto sobrio.',
  'cadena-imperio': 'El eslabón cubano como referencia. Imagina una cadena que asome sobre un escote abierto y acompañe el conjunto.',
  'brazalete-ejecutivo': 'Una línea abierta y sencilla para la muñeca. Un concepto de brazalete de inspiración minimalista.',
  'anillo-manada': 'El lobo como emblema. Una propuesta de anillo con relieve y contraste entre superficies claras y oscuras.',
};
// Una sola fuente para nombre, imagen y material: las tarjetas del HTML.
$$('.piece').forEach((piece, index) => {
  $('.piece__media', piece).addEventListener('click', (event) => {
    opener = event.currentTarget;
    const img = $('img', piece);
    $('#detail-img').src = img.getAttribute('src');
    $('#detail-img').alt = img.alt;
    $('#detail-name').textContent = $('.piece__name', piece).textContent;
    $('#detail-mat').textContent = 'Concepto de colección';
    $('#detail-material').textContent = $('.piece__mat', piece).textContent.split('·').at(-1).trim();
    $('#detail-desc').textContent = descriptions[piece.dataset.id];
    $('#detail-num').textContent = `${String(index + 1).padStart(2, '0')} / 06 · Muestra IA`;
    $('#detail-size').textContent = 'Por confirmar';
    $('#detail-price').textContent = 'Precio al lanzar';
    $('.detail__status').textContent = '';
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('is-locked');
  });
});
const detailStatus = document.createElement('p');
detailStatus.className = 'detail__status';
detailStatus.setAttribute('role', 'status');
$('.detail__actions').after(detailStatus);
$('#detail-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => {
  document.body.classList.remove('is-locked');
  opener?.focus({ preventScroll: true });
});
let toastTimer;
document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-soon]')) return;
  const message = 'Tienda en preparación. Precios y fecha de lanzamiento por confirmar.';
  // Un aviso dentro del diálogo sigue siendo legible en la capa modal.
  if (dialog.open) { detailStatus.textContent = message; return; }
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 5000);
});

function carousel(track, items, previous, next, counter, totalLabel = false) {
  let current = 0;
  let pending = false;
  const update = () => {
    pending = false;
    const start = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
    let nearest = Infinity;
    items.forEach((item, index) => {
      const distance = Math.abs(item.getBoundingClientRect().left - start);
      if (distance < nearest) { nearest = distance; current = index; }
    });
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    previous.disabled = track.scrollLeft < 4;
    next.disabled = atEnd;
    const value = String(current + 1).padStart(2, '0');
    counter.textContent = totalLabel ? `${value} / ${String(items.length).padStart(2, '0')}` : value;
  };
  const go = (step) => {
    const item = items[Math.max(0, Math.min(items.length - 1, current + step))];
    const offset = item.getBoundingClientRect().left - track.getBoundingClientRect().left - parseFloat(getComputedStyle(track).paddingLeft);
    track.scrollTo({ left: track.scrollLeft + offset, behavior: behavior() });
  };
  previous.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, { passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); go(event.key === 'ArrowRight' ? 1 : -1);
  });
  new ResizeObserver(update).observe(track);
  update();
}
carousel($('#rail'), $$('.piece'), $('#rail-prev'), $('#rail-next'), $('#rail-current'));
carousel($('#lb-track'), $$('.look'), $('#look-prev'), $('#look-next'), $('#look-current'), true);

// La escena se carga después del primer pintado y nunca bloquea el contenido.
async function initScene() {
  try {
    const { createJewelScene, supportsWebGL } = await import('./scene.js');
    if (!supportsWebGL()) { root.classList.add('no-webgl'); return; }
    const scene = createJewelScene({ hosts: $$('.canvas-host'), reduced: motion.matches });
    root.classList.add('webgl-ready');
    motion.addEventListener('change', (event) => scene.setReduced(event.matches));
    if (matchMedia('(pointer: fine)').matches) {
      $$('.jewel-stage').forEach((stage) => {
        stage.addEventListener('pointermove', (event) => {
          const box = stage.getBoundingClientRect();
          scene.setPointer(2 * (event.clientX - box.left) / box.width - 1, 2 * (event.clientY - box.top) / box.height - 1);
        }, { passive: true });
        stage.addEventListener('pointerleave', () => scene.setPointer(0, 0));
      });
    }
  } catch {
    root.classList.add('no-webgl');
  }
}
requestAnimationFrame(() => requestAnimationFrame(initScene));
