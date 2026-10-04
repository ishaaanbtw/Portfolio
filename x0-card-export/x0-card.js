/* X0 Card — standalone, embeddable 3D card (drag to rotate).
   Extracted from .tools/x0-card-film/card2.html: same geometry, materials
   and studio lighting, without the camera film.

   Usage:
     import { mountX0Card } from './x0-card.js';
     mountX0Card(document.getElementById('card'));

   Textures (put them in ./tex/):
     front.png, back.png            card artwork
     front_crm.png, back_crm.png    finish masks (raised / metallic / clearcoat areas)
   If any of these are missing, the card falls back to tex/front_fallback.png and
   tex/back_fallback.png with a plain satin finish. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

export async function mountX0Card(container, opts = {}) {
  const o = {
    texPath: './tex/',
    background: null,          // null = transparent, or a CSS colour like '#070708'
    autoRotate: false,         // gentle spin when idle
    halo: 0.045,               // faint glow behind the card (0 to switch off)
    exposure: 0.92,            // overall brightness
    touchAction: 'none',       // 'pan-y' lets a vertical swipe still scroll the page on phones
    frontFallback: 'front_fallback.png',
    backFallback: 'back_fallback.png',
    ...opts,
  };

  /* ---------------------------------------------------- renderer */
  /* QUALITY. Full Retina resolution (capped at 2x, the limit the eye can use
     at this size) and MSAA always on, so the silhouette and rounded corners
     stay clean. Affordable because the card only renders while it moves. */
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({
    antialias: true, alpha: o.background === null, powerPreference: 'default',
  });
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = o.exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.touchAction = o.touchAction;
  container.appendChild(renderer.domElement);
  RectAreaLightUniformsLib.init();

  const scene = new THREE.Scene();
  if (o.background !== null) scene.background = new THREE.Color(o.background);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.4;

  const camera = new THREE.PerspectiveCamera(25, 1, 1, 2000);
  camera.position.set(0, 0, 230);

  /* ---------------------------------------------------- textures */
  const loader = new THREE.TextureLoader();
  const load = (name, srgb) => new Promise((res) => loader.load(/^(data:|https?:|\/)/.test(name) ? name : o.texPath + name, (t) => {
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
    res(t);
  }, undefined, () => res(null)));
  let [front, back, frontCRM, backCRM] = await Promise.all([
    load('front.png', true), load('back.png', true), load('front_crm.png'), load('back_crm.png')]);
  if (!front) front = await load(o.frontFallback, true);
  if (!back) back = await load(o.backFallback, true);

  /* ---------------------------------------------------- the card (mm) */
  const W = 53.98, H = 85.6, T = 0.76, R = 3.18, B = 0.14;
  const rr = (w, h, r) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
    s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    return s;
  };
  const card = new THREE.Group(); scene.add(card);

  if (o.halo > 0) {
    const M = 24, GW = W + 2 * M, GH = H + 2 * M, px = 8;
    const c = document.createElement('canvas'); c.width = Math.round(GW * px); c.height = Math.round(GH * px);
    const g = c.getContext('2d');
    g.filter = `blur(${Math.round(8 * px)}px)`; g.fillStyle = '#fff';
    g.beginPath(); g.roundRect((M - 1.5) * px, (M - 1.5) * px, (W + 3) * px, (H + 3) * px, 4.5 * px); g.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const h = new THREE.Mesh(new THREE.PlaneGeometry(GW, GH), new THREE.MeshBasicMaterial({
      map: t, color: new THREE.Color(o.halo, o.halo, o.halo * 1.05), transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    h.position.z = -2.5; h.renderOrder = -1; card.add(h);
  }

  const inset = 0.03;
  const body = new THREE.ExtrudeGeometry(rr(W, H, R), {
    depth: T - 2 * B - 2 * inset, bevelEnabled: true, bevelThickness: B, bevelSize: B, bevelOffset: -B,
    bevelSegments: 6, curveSegments: 64,
  });
  body.translate(0, 0, -(T - 2 * B - 2 * inset) / 2);
  card.add(new THREE.Mesh(body, new THREE.MeshPhysicalMaterial({
    color: 0xd9dade, roughness: 0.22, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12 })));

  const face = (side) => {
    const g = new THREE.ShapeGeometry(rr(W - 2 * B, H - 2 * B, R - B), 64);
    if (side < 0) g.rotateY(Math.PI);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      uv.setXY(i, side > 0 ? (x + W / 2) / W : (W / 2 - x) / W, (y + H / 2) / H);
    }
    g.translate(0, 0, side * T / 2);
    return g;
  };
  const faceMat = (map, crm) => crm
    ? new THREE.MeshPhysicalMaterial({ map, bumpMap: crm, bumpScale: 0.6,
        roughness: 1, roughnessMap: crm, metalness: 1, metalnessMap: crm,
        clearcoat: 1, clearcoatMap: crm, clearcoatRoughness: 0.14 })
    : new THREE.MeshPhysicalMaterial({ map, roughness: 0.45, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  card.add(new THREE.Mesh(face(1), faceMat(front, frontCRM)));
  card.add(new THREE.Mesh(face(-1), faceMat(back, backCRM)));
  card.rotation.set(THREE.MathUtils.degToRad(4), THREE.MathUtils.degToRad(-14), 0);

  /* ---------------------------------------------------- lights */
  const key = new THREE.RectAreaLight(0xffffff, 3.2, 140, 90); key.position.set(-80, 110, 120); key.lookAt(0, 0, 0);
  const rim = new THREE.RectAreaLight(0xe8ecf5, 5, 200, 12); rim.position.set(90, -30, -110); rim.lookAt(0, 0, 0);
  const rim2 = new THREE.RectAreaLight(0xf5efe8, 3, 12, 200); rim2.position.set(-120, 20, -60); rim2.lookAt(0, 0, 0);
  const front2 = new THREE.RectAreaLight(0xffffff, 1.6, 120, 120); front2.position.set(60, -40, -160); front2.lookAt(0, 0, 0);
  scene.add(key, rim, rim2, front2, new THREE.HemisphereLight(0xdfe3ea, 0x0a0a0c, 0.25));

  /* ---------------------------------------------------- drag to rotate */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;       // keeps page scroll working; set true to allow zoom
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.8;
  controls.autoRotate = o.autoRotate;
  controls.autoRotateSpeed = 1.2;
  /* spin freely left-right, but only tilt so far up and down, so the card
     never ends up edge-on and looking like a line */
  controls.minPolarAngle = THREE.MathUtils.degToRad(60);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(120);

  /* ---------------------------------------------------- size + loop */
  const resize = () => {
    const w = container.clientWidth || 400, h = container.clientHeight || 500;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
    camera.aspect = w / h;
    // fit the card's height (plus margin) whatever the container shape
    const fitH = (H * 1.35) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const fitW = (W * 1.35) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    camera.position.setLength(Math.max(fitH, fitW));
    camera.updateProjectionMatrix();
    invalidate();
  };
  /* RENDER ON DEMAND. Nothing is drawn while the card is still: a frame is
     drawn only while it is being dragged, while it glides to a stop, when
     auto-rotate is on, or after a resize. An idle card costs nothing, so it
     never competes with the page's own scroll animation. */
  let raf = 0, dragging = false, visible = true;
  /* `raf` stays set for the whole frame, so the 'change' event fired by
     controls.update() cannot start a second loop alongside this one. */
  const frame = () => {
    if (!visible) { raf = 0; return; }
    const moving = controls.update();          // true while damping is still settling
    renderer.render(scene, camera);
    raf = (moving || dragging || controls.autoRotate) ? requestAnimationFrame(frame) : 0;
  };
  function invalidate() { if (!raf && visible) raf = requestAnimationFrame(frame); }
  controls.addEventListener('start', () => { dragging = true; invalidate(); });
  controls.addEventListener('end', () => { dragging = false; invalidate(); });
  controls.addEventListener('change', invalidate);

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) invalidate(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  });
  io.observe(container);
  const ro = new ResizeObserver(resize); ro.observe(container); resize();
  /* shader compile up front, so the first drag does not stutter */
  renderer.compile(scene, camera);
  invalidate();

  return {
    scene, camera, card, controls,
    destroy() { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); controls.dispose(); renderer.dispose(); renderer.domElement.remove(); },
  };
}
