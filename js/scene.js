/* Un renderer, dos vitrinas. Huggies abiertos con pasador y bisagra. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';

export function supportsWebGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}

function huggie(material) {
  const group = new THREE.Group();
  // Dos mitades de banda con sección biselada; apertura real en la parte superior.
  const start = 1.32, end = Math.PI * 2 + .62, hinge = Math.PI * 1.5;
  for (const [a, b] of [[start, hinge - .022], [hinge + .022, end]]) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.11, a, b, false);
    shape.lineTo(.87 * Math.cos(b), .87 * Math.sin(b));
    shape.absarc(0, 0, .87, b, a, true);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {depth:.24,bevelEnabled:true,bevelThickness:.045,bevelSize:.035,bevelSegments:3,steps:1,curveSegments:72});
    geometry.translate(0, 0, -.12);
    group.add(new THREE.Mesh(geometry, material));
  }
  // Pasador fino visible a través de la apertura; sin atribuir medidas reales.
  const pinStart = new THREE.Vector3(.99 * Math.cos(start), .99 * Math.sin(start), 0);
  const pinEnd = new THREE.Vector3(.99 * Math.cos(.69), .99 * Math.sin(.69), 0);
  const direction = pinEnd.clone().sub(pinStart);
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(.027,.027,direction.length(),12), material);
  pin.position.copy(pinStart).add(pinEnd).multiplyScalar(.5);
  pin.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
  group.add(pin);
  const hingePin = new THREE.Mesh(new THREE.CylinderGeometry(.083,.083,.36,24), material);
  hingePin.rotation.x = Math.PI/2;
  hingePin.position.set(0,-.99,0);
  group.add(hingePin);
  // Pequeño remache oscurecido para que la bisagra se lea en el metal.
  const rivetMaterial = material.clone();
  rivetMaterial.roughness = .48;
  rivetMaterial.color.multiplyScalar(.55);
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.012,16),rivetMaterial);
  rivet.rotation.x = Math.PI/2;
  rivet.position.set(0,-.99,.186);
  group.add(rivet);
  return group;
}

export function createJewelScene({ hosts, reduced = false }) {
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30,1,.1,50);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = makeStudio(new RoomEnvironment());
  const environment = pmrem.fromScene(room,0.025);
  scene.environment = environment.texture;
  room.traverse(object => {object.geometry?.dispose(); if(object.material) object.material.dispose();});
  pmrem.dispose();
  const silver = new THREE.MeshStandardMaterial({color:0xd5dadc,metalness:1,roughness:.19,envMapIntensity:1.35});
  const gold = new THREE.MeshStandardMaterial({color:0xd6ad59,metalness:1,roughness:.24,envMapIntensity:1.2});
  const main = huggie(silver);
  const accent = huggie(gold);
  main.position.set(.48,-.2,.3);
  accent.position.set(-1.0,.56,-.65);
  accent.scale.setScalar(.7);
  scene.add(accent,main);
  const key = new THREE.DirectionalLight(0xfff2db,2.3);
  key.position.set(-3,5,5);scene.add(key);
  const rim = new THREE.DirectionalLight(0xdce7f0,2);
  rim.position.set(4,1,-3);scene.add(rim);
  let host = null, running = false, lastTime = 0, elapsed = 0, lost = false;
  const visible = new Map();
  const pointer = {x:0,y:0};
  const tilt = {x:0,y:0};
  const pose = () => {
    const t = reduced ? 0 : elapsed;
    tilt.x += (pointer.x-tilt.x)*.06;
    tilt.y += (pointer.y-tilt.y)*.06;
    const px = reduced ? 0 : tilt.x*.14;
    const py = reduced ? 0 : tilt.y*.10;
    // Oscilación acotada: la joya nunca queda de canto ni sale de su caja.
    main.rotation.set(.12 + py,-.42 + Math.sin(t*.35)*.15 + px,-.20);
    accent.rotation.set(.25 + py,.62 + Math.sin(t*.28)*.14 + px,.25);
    main.position.y = -.2 + Math.sin(t*.5)*.045;
    accent.position.y = .56 + Math.sin(t*.4)*.06;
  };
  const draw = () => {if(host && !lost){pose();renderer.render(scene,camera);}};
  const frame = (time) => {
    if(time-lastTime<32) return;
    elapsed += Math.min((time-lastTime)/1000,.05);
    lastTime = time;
    draw();
  };
  const update = () => {
    const shouldRun = !reduced && !lost && !document.hidden && !!host && visible.get(host);
    if(shouldRun === running) return;
    running = shouldRun;
    lastTime = performance.now();
    renderer.setAnimationLoop(running ? frame : null);
  };
  const layout = () => {
    if(!host) return;
    const w = Math.max(host.clientWidth,1), h = Math.max(host.clientHeight,1);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1,w<600 ? 1.5 : 1.75));
    renderer.setSize(w,h,false);
    camera.aspect = w/h;
    // Reservar espacio para rótulos superior e inferior en cualquier proporción.
    camera.position.set(-.12,.15,Math.max(2.95/(.535*.76),3.65/(.535*camera.aspect*.87)));
    camera.lookAt(-.12,.15,0);
    camera.updateProjectionMatrix();
    draw();
  };
  const attach = (target) => {
    if(host === target) return;
    host = target;
    host.appendChild(renderer.domElement);
    layout();
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => visible.set(entry.target,entry.isIntersecting));
    const next = hosts.find(item => visible.get(item));
    if(next) attach(next);
    update();
  },{threshold:0.01});
  hosts.forEach(item => observer.observe(item));
  new ResizeObserver(layout).observe(document.body);
  document.addEventListener('visibilitychange',update);
  renderer.domElement.addEventListener('webglcontextlost',event => {
    event.preventDefault();lost=true;update();
    document.documentElement.classList.add('no-webgl');
  });
  renderer.domElement.addEventListener('webglcontextrestored',() => {
    lost=false;document.documentElement.classList.remove('no-webgl');layout();update();
  });
  attach(hosts[0]);
  return {
    setPointer(x,y){pointer.x=Math.max(-1,Math.min(1,x));pointer.y=Math.max(-1,Math.min(1,y));},
    setReduced(value){reduced=value;elapsed=0;update();draw();},
  };
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
