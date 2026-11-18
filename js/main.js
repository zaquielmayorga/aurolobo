/* AURO LOBO — interacción principal */

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
if (reduced) root.classList.add('reduced');

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const hasGsap = !!(gsap && ScrollTrigger);
if (hasGsap) gsap.registerPlugin(ScrollTrigger);

const TOAST_MSG = 'Tienda en preparación · lanzamiento próximamente';

const PRODUCTS = {
  'aro-lobo': {
    n: '01', name: 'Aro Lobo', img: 'assets/productos/aros-plata.webp',
    alt: 'Pareja de aros huggie de plata 925 sobre pizarra oscura',
    mat: 'Huggie · Plata 925', material: 'Plata 925 rodiada', size: '12 mm · grosor 3 mm', price: '39 €', base: 'plata',
    desc: 'El aro que se queda puesto. Discreto en la oficina, firme por la noche, y con un cierre de bisagra que no se abre en el gimnasio.',
  },
  'cruz-norte': {
    n: '02', name: 'Cruz Norte', img: 'assets/productos/cruz-plata.webp',
    alt: 'Pendiente de aro con cruz colgante de plata sobre fondo azul claro',
    mat: 'Pendiente cruz · Plata 925', material: 'Plata 925 pulida', size: 'Aro 11 mm · cruz 22 mm', price: '45 €', base: 'plata',
    desc: 'Una cruz limpia, sin adornos. Para quien lleva la fe —o el norte— sin necesidad de explicarlo.',
  },
  'sello-aureo': {
    n: '03', name: 'Sello Áureo', img: 'assets/productos/oro-studs-sello.webp',
    alt: 'Dos pendientes de botón y un anillo sello en vermeil dorado',
    mat: 'Studs + sello · Vermeil 18k', material: 'Vermeil 18k sobre plata 925', size: 'Studs 8 mm · sello tallas 18–26', price: '89 €', base: 'oro',
    desc: 'Oro con peso, sin ostentación. Un juego para quien quiere el acento cálido sin pasarse. El sello admitirá grabado de iniciales.',
  },
  'cadena-imperio': {
    n: '04', name: 'Cadena Imperio', img: 'assets/productos/cadena-cubana.webp',
    alt: 'Cadena cubana de plata sobre tejido azul noche',
    mat: 'Cubana 5 mm · Plata 925', material: 'Plata 925 maciza', size: '5 mm · 50 / 55 cm', price: '129 €', base: 'plata',
    desc: 'Eslabón cubano compacto que cae plano sobre el pecho. Pensada para llevarla por fuera de la camisa abierta.',
  },
  'brazalete-ejecutivo': {
    n: '05', name: 'Brazalete Ejecutivo', img: 'assets/productos/brazalete-acero.webp',
    alt: 'Brazalete rígido abierto de acero inoxidable cepillado',
    mat: 'Rígido · Acero 316L', material: 'Acero inoxidable 316L', size: '8 mm · ajustable', price: '35 €', base: 'plata',
    desc: 'Asoma bajo el puño de la camisa y aguanta el entrenamiento. Acero quirúrgico que no se oscurece ni da alergia.',
  },
  'anillo-manada': {
    n: '06', name: 'Anillo Manada', img: 'assets/productos/anillo-lobo.webp',
    alt: 'Anillo de plata oxidada con cabeza de lobo en relieve',
    mat: 'Sello grabado · Plata oxidada', material: 'Plata 925 oxidada', size: 'Tallas 18–26', price: '59 €', base: 'plata',
    desc: 'El emblema de la casa. La pátina oscura resalta el relieve del lobo y mejora con el uso.',
  },
};

const FILTERS = {
  toOro: 'sepia(.6) saturate(2.1) hue-rotate(-8deg) brightness(1.04) contrast(1.03)',
  toPlata: 'grayscale(1) brightness(1.1) contrast(1.06)',
};

/* ---------------- Lenis ---------------- */

let lenis = null;
if (!reduced && window.Lenis) {
  try {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    root.classList.add('has-lenis');
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } catch (e) {
    lenis = null;
  }
}
const lockScroll = () => { document.body.classList.add('is-locked'); if (lenis) lenis.stop(); };
const unlockScroll = () => { document.body.classList.remove('is-locked'); if (lenis) lenis.start(); };

/* ---------------- Toast ---------------- */

const toastEl = $('#toast');
let toastTimer = 0;
function toast(msg = TOAST_MSG) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3200);
}
document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (add) {
    e.preventDefault();
    toast();
  }
});

/* ---------------- Header & menú ---------------- */

const header = $('#header');
const onScrollHeader = () => header && header.classList.toggle('is-solid', window.scrollY > 40);
window.addEventListener('scroll', onScrollHeader, { passive: true });
onScrollHeader();

const menuBtn = $('#menu-btn');
const menu = $('#menu');
let menuOpen = false;
let menuTimer = 0;
function setMenu(open) {
  if (!menu || !menuBtn || open === menuOpen) return;
  menuOpen = open;
  clearTimeout(menuTimer);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  if (open) {
    menu.hidden = false;
    header.classList.add('is-solid');
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    lockScroll();
    const first = $('a', menu);
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 50);
  } else {
    menu.classList.remove('is-open');
    menuTimer = setTimeout(() => { menu.hidden = true; }, 500);
    unlockScroll();
    onScrollHeader();
  }
}
if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!menuOpen));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuOpen) {
    setMenu(false);
    menuBtn.focus();
  }
});

// Enlaces internos
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  const wasOpen = menuOpen;
  if (wasOpen) setMenu(false);
  const go = () => {
    if (lenis) lenis.scrollTo(id === '#inicio' ? 0 : target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    if (id !== '#inicio') {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  };
  wasOpen ? setTimeout(go, 60) : go();
});

/* ---------------- Escena 3D + loader ---------------- */

const loader = $('#loader');
const loaderBar = $('#loader-bar');
const loaderPct = $('#loader-pct');
let loaderDone = false;
let loaderShown = 0;
const loaderStart = performance.now();

function paintLoader(v) {
  loaderShown = v;
  if (loaderBar) loaderBar.style.transform = `scaleX(${v / 100})`;
  if (loaderPct) loaderPct.textContent = String(Math.round(v));
}
(function tickLoader() {
  if (loaderDone) return;
  const t = Math.min(1, (performance.now() - loaderStart) / 1100);
  paintLoader(Math.max(loaderShown, 90 * (1 - Math.pow(1 - t, 3))));
  requestAnimationFrame(tickLoader);
})();

function finishLoader() {
  if (loaderDone) return;
  loaderDone = true;
  paintLoader(100);
  setTimeout(() => {
    if (loader) loader.classList.add('is-done');
    introHero();
  }, 180);
}
setTimeout(finishLoader, 1500); // nunca bloquear más de ~1,5 s

let scene = null;
let heroProgress = 0;

async function initScene() {
  const hosts = [$('#hero-canvas'), $('#soon-canvas')].filter(Boolean);
  try {
    const mod = await import('./scene.js');
    if (!mod.supportsWebGL() || !hosts.length) throw new Error('no-webgl');
    scene = mod.createJewelScene({ hosts, reduced, mobile: isMobile });
    scene.setProgress(heroProgress);
  } catch (e) {
    root.classList.add('no-webgl');
  }
  const elapsed = performance.now() - loaderStart;
  setTimeout(finishLoader, Math.max(0, 500 - elapsed));
}
initScene();

/* Puntero / giroscopio → inclinación de la joya */
if (!reduced) {
  window.addEventListener('pointermove', (e) => {
    if (!scene || e.pointerType === 'touch') return;
    scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  const heroStage = $('.hero__stage');
  if (heroStage) {
    heroStage.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (!scene || !t) return;
      scene.setPointer((t.clientX / window.innerWidth) * 2 - 1, (t.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
  }

  const onOrient = (e) => {
    if (!scene || e.gamma == null || e.beta == null) return;
    scene.setPointer(e.gamma / 30, (e.beta - 45) / 30);
  };
  const DOE = window.DeviceOrientationEvent;
  if (DOE && !finePointer) {
    if (typeof DOE.requestPermission === 'function') {
      const ask = () => {
        DOE.requestPermission()
          .then((r) => { if (r === 'granted') window.addEventListener('deviceorientation', onOrient, { passive: true }); })
          .catch(() => {});
      };
      document.addEventListener('touchend', ask, { once: true, passive: true });
    } else {
      window.addEventListener('deviceorientation', onOrient, { passive: true });
    }
  }
}

/* ---------------- Animaciones GSAP ---------------- */

function introHero() {
  if (!hasGsap || reduced) return;
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero__title .line > span', { yPercent: 115, duration: 1.4, stagger: 0.1 })
    .from('.hero__copy .eyebrow, .hero__lead, .hero__actions', { y: 24, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.25)
    .from('.hero__meta', { opacity: 0, duration: 1.2 }, 0.4)
    .from('.header', { yPercent: -100, duration: 1, clearProps: 'transform' }, 0.2);
}

if (hasGsap && !reduced) {
  // Hero guiado por scroll
  const proxy = { p: 0 };
  gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  })
    .to(proxy, {
      p: 1, duration: 1, ease: 'none',
      onUpdate: () => { heroProgress = proxy.p; if (scene) scene.setProgress(proxy.p); },
    }, 0)
    .to('.hero__copy', { y: -90, opacity: 0, duration: 0.38, ease: 'power1.in' }, 0)
    .to('.hero__meta, .hero__scroll', { opacity: 0, duration: 0.25 }, 0)
    .to('.hero__caption', { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.5);

  // Cabeceras de sección
  $$('.section__head').forEach((head) => {
    gsap.from(head.children, {
      y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: head, start: 'top 82%', once: true },
    });
  });

  // Vitrina: aparición escalonada
  gsap.set('.piece', { y: 60, opacity: 0 });
  ScrollTrigger.batch('.piece', {
    start: 'top 90%',
    once: true,
    onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.1, clearProps: 'transform,opacity' }),
  });

  // Manifiesto palabra a palabra
  const text = $('[data-split]');
  if (text) {
    const words = text.textContent.trim().split(/\s+/);
    text.setAttribute('aria-label', text.textContent.trim());
    text.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    gsap.to($$('.w', text), {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 42%', scrub: true },
    });
  }
  gsap.from('.motto p > *', {
    yPercent: 50, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12,
    scrollTrigger: { trigger: '.motto', start: 'top 78%', once: true },
  });
  gsap.from('.motto footer, .manifesto__story p', {
    y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1,
    scrollTrigger: { trigger: '.motto footer', start: 'top 90%', once: true },
  });

  // Confianza
  gsap.from('.trust__list li', {
    y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09,
    scrollTrigger: { trigger: '.trust__list', start: 'top 85%', once: true },
  });

  // Próximamente
  gsap.from('.soon__inner > *', {
    y: 50, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1,
    scrollTrigger: { trigger: '.soon', start: 'top 70%', once: true },
  });

  // Lookbook horizontal (solo escritorio)
  const lb = $('#lookbook');
  const track = $('#lb-track');
  const bar = $('#lb-progress');
  if (lb && track) {
    const mm = gsap.matchMedia();
    const intro = $('#lb-intro');
    mm.add('(min-width: 960px)', () => {
      lb.classList.add('is-pinned-lb');
      // En escritorio la intro forma parte del recorrido horizontal
      if (intro) track.prepend(intro);
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: lb,
          start: 'top top',
          end: () => '+=' + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => { if (bar) bar.style.transform = `scaleX(${self.progress})`; },
        },
      });
      $$('.look', track).forEach((look) => {
        const img = $('img', look);
        if (!img) return;
        gsap.fromTo(img, { xPercent: -7 }, {
          xPercent: 7, ease: 'none',
          scrollTrigger: { trigger: look, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        });
      });
      return () => {
        lb.classList.remove('is-pinned-lb');
        gsap.set(track, { clearProps: 'transform' });
        if (intro) track.before(intro);
      };
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---------------- Vitrina ---------------- */

const rail = $('#rail');
const pieces = $$('.piece');

// Tilt 3D + brillo especular + foco (escritorio)
if (rail && finePointer && !reduced) {
  pieces.forEach((piece) => {
    const card = $('.piece__card', piece);
    const media = $('.piece__media', piece);
    if (!card || !media) return;
    media.addEventListener('pointermove', (e) => {
      const r = media.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
      card.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });
    media.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
    piece.addEventListener('pointerenter', () => {
      pieces.forEach((p) => p.classList.toggle('is-focus', p === piece));
      rail.classList.add('has-focus');
    });
  });
  rail.addEventListener('pointerleave', () => {
    rail.classList.remove('has-focus');
    pieces.forEach((p) => p.classList.remove('is-focus'));
  });
}

// Carrusel móvil: contador y flechas
const prevBtn = $('#rail-prev');
const nextBtn = $('#rail-next');
const currentEl = $('#rail-current');
let currentIdx = 0;
const isCarousel = () => rail && getComputedStyle(rail).display === 'flex';

function updateCounter() {
  if (!rail || !isCarousel()) {
    pieces.forEach((p) => p.classList.remove('is-dim'));
    return;
  }
  const railLeft = rail.getBoundingClientRect().left + parseFloat(getComputedStyle(rail).paddingLeft);
  let best = 0;
  let bestD = Infinity;
  pieces.forEach((p, i) => {
    const d = Math.abs(p.getBoundingClientRect().left - railLeft);
    if (d < bestD) { bestD = d; best = i; }
  });
  // Al llegar al final, la última pieza
  if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4) best = pieces.length - 1;
  currentIdx = best;
  if (currentEl) currentEl.textContent = String(best + 1).padStart(2, '0');
  if (prevBtn) prevBtn.disabled = best === 0;
  if (nextBtn) nextBtn.disabled = best === pieces.length - 1;
  pieces.forEach((p, i) => p.classList.toggle('is-dim', i !== best));
}
function goTo(i) {
  if (!rail) return;
  const idx = Math.max(0, Math.min(pieces.length - 1, i));
  const railLeft = rail.getBoundingClientRect().left + parseFloat(getComputedStyle(rail).paddingLeft);
  const delta = pieces[idx].getBoundingClientRect().left - railLeft;
  rail.scrollTo({ left: rail.scrollLeft + delta, behavior: reduced ? 'auto' : 'smooth' });
}
if (rail) {
  let raf = 0;
  rail.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateCounter);
  }, { passive: true });
  window.addEventListener('resize', updateCounter);
  updateCounter();
}
if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIdx - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIdx + 1));

/* ---------------- Detalle (dialog) ---------------- */

const dialog = $('#detail');
const dImg = $('#detail-img');
let currentProduct = null;

function setVariant(v) {
  if (!currentProduct || !dImg) return;
  $$('[data-variant]', dialog).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.variant === v)));
  if (v === currentProduct.base) dImg.style.filter = 'none';
  else dImg.style.filter = v === 'oro' ? FILTERS.toOro : FILTERS.toPlata;
}

function openDetail(id) {
  const p = PRODUCTS[id];
  if (!p || !dialog) return;
  currentProduct = p;
  dImg.style.transition = 'none';
  dImg.src = p.img;
  dImg.alt = p.alt;
  $('#detail-num').textContent = `${p.n} / 06`;
  $('#detail-mat').textContent = p.mat;
  $('#detail-name').textContent = p.name;
  $('#detail-desc').textContent = p.desc;
  $('#detail-material').textContent = p.material;
  $('#detail-size').textContent = p.size;
  $('#detail-price').textContent = p.price;
  const addBtn = $('.detail__actions [data-add]', dialog);
  if (addBtn) addBtn.setAttribute('aria-label', `Añadir ${p.name}`);
  setVariant(p.base);
  void dImg.offsetWidth;
  dImg.style.transition = '';
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  lockScroll();
}
function closeDetail() {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close();
  else { dialog.removeAttribute('open'); unlockScroll(); }
}

pieces.forEach((piece) => {
  const media = $('.piece__media', piece);
  if (media) media.addEventListener('click', () => openDetail(piece.dataset.id));
});
if (dialog) {
  dialog.addEventListener('close', unlockScroll);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeDetail();
    const v = e.target.closest('[data-variant]');
    if (v) setVariant(v.dataset.variant);
  });
  dialog.addEventListener('keydown', (e) => {
    const v = e.target.closest('[data-variant]');
    if (v && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      const other = $$('[data-variant]', dialog).find((b) => b !== v);
      if (other) { other.focus(); setVariant(other.dataset.variant); }
    }
  });
  const closeBtn = $('#detail-close');
  if (closeBtn) closeBtn.addEventListener('click', closeDetail);
}

/* ---------------- Cursor y botones magnéticos ---------------- */

if (finePointer && !reduced && hasGsap) {
  const cursor = $('.cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  if (cursor && dot && ring) {
    root.classList.add('has-cursor');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    gsap.set([dot, ring], { x: -100, y: -100, xPercent: 0, yPercent: 0 });
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      cursor.classList.remove('is-hidden');
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });
    document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    const interactive = 'a, button, [role="radio"], [data-cursor]';
    document.addEventListener('pointerover', (e) => {
      cursor.classList.toggle('is-hover', !!e.target.closest(interactive));
    });
  }

  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}
