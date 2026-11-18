/* Escena 3D del hero: aro de plata con cruz colgante + aro de oro, polvo dorado.
   Un único renderer WebGL que se mueve entre el hero y la sección "Próximamente". */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';

export function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch (e) {
    return false;
  }
}

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);

export function createJewelScene({ hosts, reduced = false, mobile = false }) {
  const renderer = new THREE.WebGLRenderer({
    antialias: !mobile,
    alpha: true,
    powerPreference: 'high-performance',
  });
  const maxDpr = mobile ? 1.25 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  // Entorno PBR
  // Entorno PBR: RoomEnvironment oscurecido + softboxes de estudio. Los reflejos
  // alternan negro profundo y franjas blancas, como en fotografía de joyería.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = makeStudio(new RoomEnvironment());
  const envMap = pmrem.fromScene(room, 0.035).texture;
  scene.environment = envMap;
  room.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  pmrem.dispose();

  // Materiales
  const silver = new THREE.MeshPhysicalMaterial({
    color: 0xd2d6dc,
    metalness: 1,
    roughness: 0.07,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.45,
  });
  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xd9ab52,
    metalness: 1,
    roughness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.2,
  });

  const seg = mobile ? { r: 32, t: 112 } : { r: 48, t: 180 };

  // Joya principal
  const jewel = new THREE.Group();
  const pivot = new THREE.Group();
  pivot.add(jewel);
  scene.add(pivot);

  // Aro huggie: banda ancha y plana (no un donut)
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(1, 0.2, seg.r, seg.t), silver);
  hoop.scale.z = 1.75;
  jewel.add(hoop);

  // Línea de la bisagra
  const seam = new THREE.Mesh(new THREE.TorusGeometry(1, 0.206, 12, 24, 0.03), silver);
  seam.scale.z = 1.78;
  seam.rotation.z = Math.PI / 2 - 0.015;
  jewel.add(seam);

  // Pequeño stud de plata (pareja del aro)
  const stud = new THREE.Group();
  const studHead = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.09, 48, 1), silver);
  studHead.rotation.x = Math.PI / 2;
  const studBevel = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.045, 12, 48), silver);
  const studPin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12, 1), silver);
  studPin.rotation.x = Math.PI / 2;
  studPin.position.z = -0.27;
  stud.add(studHead, studBevel, studPin);
  const studBase = { x: 1.25, y: -1.15 };
  stud.position.set(studBase.x, studBase.y, 0.6);
  stud.rotation.set(0.3, -0.5, 0);
  pivot.add(stud);

  // Aro de oro secundario
  const goldHoop = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.12, seg.r, seg.t), gold);
  goldHoop.scale.z = 1.6;
  const goldOrbit = new THREE.Group();
  goldHoop.position.set(-1.55, 0.95, -1.1);
  goldHoop.rotation.set(0.9, 0.5, 0.2);
  goldOrbit.add(goldHoop);
  pivot.add(goldOrbit);

  // Luces de acento
  const warm = new THREE.PointLight(0xffb062, 28, 0, 2);
  warm.position.set(3, 2, 4);
  scene.add(warm);
  const cool = new THREE.DirectionalLight(0x86a2ff, 0.7);
  cool.position.set(-5, -2, -3);
  scene.add(cool);
  const key = new THREE.DirectionalLight(0xffffff, 0.6);
  key.position.set(-2, 4, 5);
  scene.add(key);
  // Luz de contorno fría: perfila el canto del aro contra el fondo oscuro
  const rim = new THREE.DirectionalLight(0xcfe0ff, 2.4);
  rim.position.set(4.5, 3, -4);
  scene.add(rim);
  const rim2 = new THREE.SpotLight(0xa9c2ff, 30, 0, 0.5, 0.6, 2);
  rim2.position.set(-4, 1.5, -3);
  scene.add(rim2);

  // Polvo dorado
  const count = mobile ? 140 : 320;
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = -4 + Math.random() * 6;
    seeds[i] = Math.random() * Math.PI * 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dustTex = makeDotTexture();
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xd8b25f,
      size: mobile ? 0.05 : 0.04,
      map: dustTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
  );
  scene.add(dust);

  // ---------------- Estado ----------------
  const state = {
    progress: 0,
    pointer: { x: 0, y: 0 },
    tilt: { x: 0, y: 0 },
    mode: 'hero',
    host: null,
    visible: new Map(),
    pageVisible: !document.hidden,
    running: false,
    layout: mobile ? 'mobile' : 'desktop',
  };
  const clock = new THREE.Clock();
  let elapsed = 0;

  // Zona libre del hero en móvil (px dentro del host): entre la línea de metadatos
  // y el bloque de texto. Las joyas se encajan ahí para no tapar ni cortarse.
  const safe = { top: 0, bottomStart: 0, bottomEnd: 0, w: 1, h: 1 };

  function measureSafe(host, w, h) {
    const stage = host.parentElement;
    const meta = stage && stage.querySelector('.hero__meta');
    const copy = stage && stage.querySelector('.hero__copy');
    const caption = stage && stage.querySelector('.hero__caption');
    safe.w = w;
    safe.h = h;
    safe.top = meta ? meta.offsetTop + meta.offsetHeight + 14 : h * 0.16;
    safe.bottomStart = copy ? copy.offsetTop - 18 : h * 0.45;
    const capTop = caption && caption.offsetHeight ? caption.offsetTop : h * 0.8;
    safe.bottomEnd = Math.min(capTop - 28, h * 0.62);
    if (safe.bottomStart - safe.top < 90) safe.bottomStart = safe.top + 90;
  }

  function layout() {
    const host = state.host;
    if (!host) return;
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    state.layout = w < 960 ? 'mobile' : 'desktop';
    const m = state.layout === 'mobile';
    // Composición más compacta en móvil
    goldHoop.position.x = m ? -1.2 : -1.55;
    goldHoop.position.y = m ? 0.9 : 0.95;
    studBase.x = m ? 1.0 : 1.25;
    studBase.y = m ? -0.95 : -1.15;
    stud.position.x = studBase.x;
    if (m && state.mode === 'hero') measureSafe(host, w, h);
  }

  // Extensión aproximada del grupo (unidades, escala 1) en la composición móvil
  const GROUP = { minX: -1.95, maxX: 1.4, minY: -1.3, maxY: 1.6 };
  const TAN = Math.tan(THREE.MathUtils.degToRad(15));

  function fitMobile(p, camZ) {
    const vh = camZ * TAN; // media altura visible en z=0
    const vw = vh * camera.aspect;
    const pxPerUnit = safe.h / (2 * vh);
    const top = safe.top;
    const bottom = lerp(safe.bottomStart, safe.bottomEnd, p);
    const boxH = (bottom - top) / pxPerUnit;
    const boxW = (2 * vw) * 0.86;
    const gw = GROUP.maxX - GROUP.minX;
    const gh = GROUP.maxY - GROUP.minY;
    const s = Math.min((boxH * 0.9) / gh, boxW / gw, 0.75);
    const cy = vh - ((top + bottom) / 2) / pxPerUnit; // centro de la caja en mundo
    return {
      s,
      x: -((GROUP.minX + GROUP.maxX) / 2) * s,
      y: cy - ((GROUP.minY + GROUP.maxY) / 2) * s,
    };
  }

  function pose(t) {
    const p = ease(clamp(state.progress, 0, 1));
    const isMobile = state.layout === 'mobile';
    const spin = reduced ? 0.6 : t * 0.22;

    state.tilt.x = lerp(state.tilt.x, state.pointer.x, 0.05);
    state.tilt.y = lerp(state.tilt.y, state.pointer.y, 0.05);

    if (state.mode === 'hero' && isMobile) {
      // Móvil: encaja el conjunto en la zona libre superior; acercamiento suave
      const camZ = lerp(9.2, 8, p);
      const f = fitMobile(p, camZ);
      pivot.position.set(f.x, f.y, 0);
      pivot.scale.setScalar(f.s);
      camera.position.z = camZ;
      jewel.rotation.y = spin + p * Math.PI * 1.25 + state.tilt.x * 0.45;
      jewel.rotation.x = 0.18 + p * 0.55 - state.tilt.y * 0.3;
      jewel.rotation.z = -0.12 + p * 0.25;
      goldOrbit.rotation.z = p * 0.25;
      goldHoop.position.z = lerp(-1.1, -1.8, p);
    } else if (state.mode === 'hero') {
      pivot.position.set(lerp(1.55, -0.9, p), lerp(0.2, 0.05, p), 0);
      pivot.scale.setScalar(0.92);
      camera.position.z = lerp(8, 5.2, p);
      jewel.rotation.y = spin + p * Math.PI * 1.25 + state.tilt.x * 0.45;
      jewel.rotation.x = 0.18 + p * 0.55 - state.tilt.y * 0.3;
      jewel.rotation.z = -0.12 + p * 0.25;
      goldOrbit.rotation.z = p * 0.8;
      goldHoop.position.z = lerp(-1.1, -2.6, p);
    } else {
      pivot.position.set(isMobile ? 0.1 : 2.55, isMobile ? 1.25 : 0, 0);
      pivot.scale.setScalar(isMobile ? 0.55 : 0.85);
      camera.position.z = 8;
      jewel.rotation.y = spin * 1.2 + state.tilt.x * 0.4;
      jewel.rotation.x = 0.25 - state.tilt.y * 0.3;
      jewel.rotation.z = -0.2;
      goldOrbit.rotation.z = 0.4;
      goldHoop.position.z = -1.1;
    }

    pivot.rotation.y = state.tilt.x * 0.15;
    pivot.rotation.x = -state.tilt.y * 0.1;
    goldHoop.rotation.y = 0.5 + (reduced ? 0 : t * 0.35);
    goldHoop.rotation.x = 0.9 + (reduced ? 0 : Math.sin(t * 0.4) * 0.15);
    stud.rotation.y = -0.5 + (reduced ? 0 : Math.sin(t * 0.5) * 0.6);
    stud.position.y = studBase.y + (reduced ? 0 : Math.sin(t * 0.7) * 0.06);

    warm.position.x = Math.cos(t * 0.3) * 4;
    warm.position.z = 3 + Math.sin(t * 0.3) * 1.5;
    dust.rotation.y = t * 0.012;
    dust.position.y = Math.sin(t * 0.15) * 0.15;
    const par = isMobile && state.mode === 'hero' ? 0.1 : 1;
    camera.position.x = state.tilt.x * 0.25 * par;
    camera.position.y = -state.tilt.y * 0.2 * par;
    camera.lookAt(camera.position.x * (1 - par), camera.position.y * (1 - par), 0);
  }

  function frame() {
    if (!reduced) elapsed += Math.min(clock.getDelta(), 0.05);
    pose(elapsed);
    renderer.render(scene, camera);
  }

  function updateRunning() {
    const shouldRun = !reduced && state.pageVisible && !!state.host && state.visible.get(state.host);
    if (shouldRun && !state.running) {
      clock.getDelta();
      renderer.setAnimationLoop(frame);
      state.running = true;
    } else if (!shouldRun && state.running) {
      renderer.setAnimationLoop(null);
      state.running = false;
    }
  }

  function attach(host) {
    if (state.host === host) return;
    state.host = host;
    state.mode = host.dataset.host === 'soon' ? 'soon' : 'hero';
    host.appendChild(renderer.domElement);
    layout();
    frame();
    updateRunning();
  }

  function pickHost() {
    const visibleHost = hosts.find((h) => state.visible.get(h));
    if (visibleHost) attach(visibleHost);
    updateRunning();
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => state.visible.set(e.target, e.isIntersecting));
      pickHost();
    },
    { rootMargin: '80px 0px' }
  );
  hosts.forEach((h) => {
    state.visible.set(h, false);
    io.observe(h);
  });

  const ro = new ResizeObserver(() => {
    layout();
    if (!state.running) frame();
  });
  hosts.forEach((h) => ro.observe(h));

  document.addEventListener('visibilitychange', () => {
    state.pageVisible = !document.hidden;
    updateRunning();
  });

  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    renderer.setAnimationLoop(null);
    state.running = false;
    document.documentElement.classList.add('no-webgl');
  });

  // Primer render en el hero
  attach(hosts[0]);

  return {
    setProgress(p) {
      state.progress = p;
      if (!state.running && state.host) frame();
    },
    setPointer(x, y) {
      if (reduced) return;
      state.pointer.x = clamp(x, -1, 1);
      state.pointer.y = clamp(y, -1, 1);
    },
  };
}

function makeDotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,240,200,.6)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Oscurece la RoomEnvironment y añade softboxes: más contraste en los reflejos del metal.
function makeStudio(room) {
  const walls = new Set();
  room.traverse((o) => {
    // MeshStandardMaterial = paredes/cajas de la sala; MeshBasic = paneles de luz
    if (o.isMesh && o.material && o.material.isMeshStandardMaterial) walls.add(o.material);
  });
  walls.forEach((m) => m.color.multiplyScalar(0.42));
  const box = (w, h, color, intensity, x, y, z, ry = 0, rx = 0) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
    );
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    room.add(m);
  };
  box(9, 1.2, 0xffffff, 9, 0, 10, 0, 0, Math.PI / 2); // franja cenital
  box(1.4, 7, 0xffffff, 7, -9, 3, 2, Math.PI / 2); // tira lateral izquierda
  box(1.0, 6, 0xd6e3ff, 6, 9, 2, -3, -Math.PI / 2); // tira fría derecha
  box(5, 1.4, 0xfff1dc, 4, 0, 4, 9, Math.PI); // frontal cálida suave
  return room;
}
