/* FURY · INSIDE THE HEADSET.
   The VR chapter as a place you step into. The section pins and the scroll is
   the clock (p, 0..1):
     0.00-0.10  a Quest-style headset seen from the wearer's side, rising into view.
                The live room already glows inside both lenses.
     0.10-0.22  the camera pushes through the right lens and the room opens up.
     0.22-0.96  you stand on the stage of the auditorium. Scrolling turns your
                head from screen to screen, the real VR UI floating around you,
                each with its caption. The pointer looks around a little.
     0.96-1.00  the headset comes off: back to the page.
   The room is built here in three.js after the Unity scene (low poly, pale
   blue, light strips on the walls). Loaded only when the section is near. */
import * as THREE from './vendor/three.module.min.js';

const IMG = 'assets/img/fury/';
const PANELS = [
  { src: IMG + 'vr-p-sessions.webp', aspect: 1600 / 921, yaw: 0 },
  { src: IMG + 'vr-p-tutorial.webp', aspect: 1600 / 921, yaw: -52 },
  { src: IMG + 'vr-p-speaking.webp', aspect: 1300 / 1071, yaw: -104 },
  { video: 'assets/media/fury/vr-unity', aspect: 1280 / 600, yaw: -158, pitch: 2, timer: true },
  { draw: 'customise', aspect: 2000 / 1500, yaw: -212 },
];
const T0 = 0.2, T1 = 0.93; // the tour runs between these

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const P = (p, a, b) => clamp((p - a) / (b - a));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (x) => x * x * (3 - 2 * x);
const rad = THREE.MathUtils.degToRad;

export function mount(host) {
  const run = host.querySelector('.fvr__run');
  const pin = host.querySelector('.fvr__pin');
  const world = host.querySelector('.fvr__world');
  const canvas = host.querySelector('canvas');
  const quest = host.querySelector('.fvr__quest');
  const lensR = quest.querySelector('[data-lens="r"]'), lensL = quest.querySelector('[data-lens="l"]');
  const intro = host.querySelector('.fvr__intro');
  const glass = quest.querySelector('.fvr__glass');
  const caps = Array.from(host.querySelectorAll('.fvr__cap'));
  const count = host.querySelector('.fvr__count b');
  const hud = host.querySelector('.fvr__hud');
  const fade = host.querySelector('.fvr__fade');
  const hint = host.querySelector('.fvr__hint');

  /* ---------- renderer ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const SKY = new THREE.Color('#aab6cb');
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 16, 46);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 120);
  camera.position.set(0, 1.65, 0);
  camera.rotation.order = 'YXZ';

  scene.add(new THREE.HemisphereLight('#f4f7ff', '#6f7d97', 1.55));
  const sun = new THREE.DirectionalLight('#ffffff', 1.1);
  sun.position.set(-6, 14, 8);
  scene.add(sun);

  buildRoom(scene);
  const panels = buildPanels(scene, camera);
  const laser = buildLaser(camera);
  scene.add(camera);

  /* ---------- sizing ---------- */
  let W = 1, H = 1;
  function size() {
    // full bleed, whatever column the section sits in
    const vw = document.documentElement.clientWidth;
    pin.style.width = vw + 'px';
    pin.style.marginLeft = -run.getBoundingClientRect().left + 'px';
    W = pin.clientWidth; H = pin.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = W / H < 0.9 ? 78 : 62;
    camera.updateProjectionMatrix();
    // panels sit closer on narrow screens so they fill the view
    const R = W / H < 0.9 ? 2.6 : 3.3;
    panels.forEach((pn) => pn.place(R));
  }

  /* ---------- the clock ---------- */
  let target = 0, cur = 0, inView = false, raf = 0, enter = 0;
  let lookX = 0, lookY = 0, lx = 0, ly = 0;
  function measure() {
    const r = run.getBoundingClientRect(), span = r.height - innerHeight;
    target = span > 0 ? clamp(-r.top / span) : 0;
    // the headset draws itself as the section rises into view, before it pins
    enter = clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.75));
  }
  addEventListener('scroll', measure, { passive: true });
  addEventListener('resize', () => { size(); measure(); }, { passive: true });
  pin.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    lookX = (e.clientX / W) * 2 - 1; lookY = (e.clientY / H) * 2 - 1;
  });
  pin.addEventListener('pointerleave', () => { lookX = 0; lookY = 0; });

  /* yaw through the panels: hold on each, turn between */
  const stops = PANELS.map((pn) => pn.yaw);
  function yawAt(q) {
    const n = stops.length - 1, x = q * n, i = Math.min(n - 1, Math.floor(x)), f = x - i;
    // hold the middle 45% of each leg on the panel, turn in the rest
    const k = smooth(clamp((f - 0.28) / 0.44));
    return { yaw: stops[i] + (stops[i + 1] - stops[i]) * k, focus: f < 0.5 ? i : i + 1, near: 1 - Math.abs(f - (f < 0.5 ? 0 : 1)) * 2 };
  }
  function pitchAt(q) {
    const n = stops.length - 1, x = q * n, i = Math.min(n - 1, Math.floor(x)), f = x - i;
    const k = smooth(clamp((f - 0.28) / 0.44));
    const a = PANELS[i].pitch || 0, b = PANELS[i + 1].pitch || 0;
    return a + (b - a) * k;
  }

  let lastFocus = -1;
  function frame(t) {
    raf = 0;
    cur += (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.0002) cur = target;
    const p = cur;

    /* intro: draw the headset, then push through the lens */
    const draw = ease(enter);
    glass.style.opacity = String(1 - P(p, 0.05, 0.12));
    quest.style.translate = `0 ${(40 * (1 - draw)).toFixed(1)}px`;
    const z = ease(P(p, 0.05, 0.18));
    const s = Math.pow(42, z);
    quest.style.transform = `scale(${s.toFixed(4)})`;
    quest.style.opacity = String(draw * (1 - P(p, 0.15, 0.185)));
    intro.style.opacity = String(1 - P(p, 0.04, 0.09));
    hint.style.opacity = String(draw * (1 - P(p, 0.01, 0.04)));

    // the room shows through the lenses, then becomes everything
    const a = lensR.getBoundingClientRect(), b = lensL.getBoundingClientRect(), pr = pin.getBoundingClientRect();
    const cx = a.left + a.width / 2 - pr.left, cy = a.top + a.height / 2 - pr.top, r = a.width / 2;
    const cx2 = b.left + b.width / 2 - pr.left, cy2 = b.top + b.height / 2 - pr.top;
    if (p < 0.185) {
      const m = `radial-gradient(circle ${r.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px, #000 97%, transparent 100%), radial-gradient(circle ${r.toFixed(1)}px at ${cx2.toFixed(1)}px ${cy2.toFixed(1)}px, #000 97%, transparent 100%)`;
      world.style.webkitMaskImage = m; world.style.maskImage = m;
      world.style.opacity = String(0.55 + 0.45 * draw);
    } else {
      world.style.webkitMaskImage = 'none'; world.style.maskImage = 'none';
      world.style.opacity = '1';
    }
    host.style.setProperty('--vig', String(1 - P(p, 0.17, 0.27)));

    /* the tour */
    const q = P(p, T0, T1);
    const y = yawAt(q);
    lx += (lookX - lx) * 0.06; ly += (lookY - ly) * 0.06;
    const idle = p < T0 ? Math.sin(t / 2600) * 7 : 0;
    camera.rotation.y = rad(y.yaw - lx * 5 + idle);
    camera.rotation.x = rad(pitchAt(q) - ly * 3.5 + (p < T0 ? -2 : 0));
    // a little lean toward the panel being read
    const lean = p < T0 ? 0 : y.near * 0.35;
    camera.position.set(-Math.sin(rad(y.yaw)) * lean, 1.65, -Math.cos(rad(y.yaw)) * lean);

    const touring = p > T0 - 0.01 && p < 0.965;
    panels.forEach((pn, i) => pn.update(t, i === y.focus && touring ? 1 : 0));
    laser.update(touring ? panels[y.focus] : null, t);

    hud.classList.toggle('is-on', touring);
    if (y.focus !== lastFocus) {
      lastFocus = y.focus;
      caps.forEach((c, i) => c.classList.toggle('is-on', i === y.focus));
      count.textContent = '0' + (y.focus + 1);
      panels.forEach((pn, i) => pn.play(i === y.focus));
    }
    /* no fade to a blank frame at the end: the room itself scrolls away and
       the next block follows straight after */
    fade.style.opacity = '0';

    renderer.render(scene, camera);
    if (inView) raf = requestAnimationFrame(frame);
  }

  new IntersectionObserver((es) => {
    inView = es[0].isIntersecting;
    if (inView) { measure(); if (!raf) raf = requestAnimationFrame(frame); }
    else panels.forEach((pn) => pn.play(false));
  }, { rootMargin: '200px 0px' }).observe(run);

  host.classList.add('is-3d');
  size(); measure(); cur = target;
  raf = requestAnimationFrame(frame);
}

/* ================================================================ ROOM */
function buildRoom(scene) {
  const mat = (c, e) => new THREE.MeshLambertMaterial({ color: c, emissive: e || 0x000000 });
  const wall = mat('#b9c4d7'), floor = mat('#a3b0c6'), stage = mat('#c4cedd'), seatM = mat('#cfd7e4'), seatB = mat('#bcc6d6');
  const glow = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const ceil = mat('#a89886', '#4a4038'), navy = mat('#1c2643'), dark = mat('#6d7891');
  const box = (w, h, d, m, x, y, z, ry) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z); if (ry) o.rotation.y = ry; scene.add(o); return o;
  };

  // stage and pit
  box(30, 0.4, 10, stage, 0, -0.2, 2);                 // stage, top at y = 0
  box(30, 0.05, 0.06, glow, 0, 0.0, -3.0);             // stage lip light
  box(30, 1.2, 3, floor, 0, -1.6, -4.5);               // pit floor at y = -1

  // tiered seating
  const ROWS = 13, SEAT = 0.62, x0 = -13.2, aisles = [-4.6, 4.6];
  const seats = [];
  for (let r = 0; r < ROWS; r++) {
    const z = -6.2 - r * 1.05, y = -1 + r * 0.42;
    box(30, 0.42 * (r + 1) + 0.2, 1.05, floor, 0, -1 + (0.42 * (r + 1)) / 2 - 0.1, z - 0.1);
    for (let x = x0; x <= -x0 + 0.01; x += SEAT) {
      if (aisles.some((a) => Math.abs(x - a) < 0.75)) continue;
      seats.push([x, y + 0.42, z]);
    }
    // aisle stairs: light strips on each step
    aisles.forEach((a) => {
      box(1.2, 0.03, 0.04, glow, a, y + 0.43, z + 0.42);
      box(1.2, 0.03, 0.04, glow, a, y + 0.22, z - 0.05);
    });
  }
  const seatG = new THREE.BoxGeometry(0.5, 0.12, 0.5), backG = new THREE.BoxGeometry(0.52, 0.62, 0.12);
  const armG = new THREE.BoxGeometry(0.06, 0.3, 0.46);
  const iS = new THREE.InstancedMesh(seatG, seatM, seats.length), iB = new THREE.InstancedMesh(backG, seatB, seats.length);
  const iA = new THREE.InstancedMesh(armG, seatB, seats.length);
  const m4 = new THREE.Matrix4();
  seats.forEach(([x, y, z], i) => {
    iS.setMatrixAt(i, m4.makeTranslation(x, y + 0.3, z));
    const b = new THREE.Matrix4().makeRotationX(-0.14); b.setPosition(x, y + 0.62, z - 0.27);
    iB.setMatrixAt(i, b);
    iA.setMatrixAt(i, m4.makeTranslation(x - 0.29, y + 0.42, z));
  });
  scene.add(iS, iB, iA);

  // walls, back wall, ceiling
  box(0.6, 14, 34, wall, -15.3, 4, -6);
  box(0.6, 14, 34, wall, 15.3, 4, -6);
  box(31, 14, 0.6, wall, 0, 4, -21.5);
  box(31, 14, 0.6, wall, 0, 4, 9.3);
  box(31, 0.5, 34, ceil, 0, 9.4, -6);
  // ceiling light bars
  for (let i = 0; i < 6; i++) box(0.12, 0.05, 26, glow, -10 + i * 4, 9.1, -8);

  // the light strips on the side walls, like the Unity scene
  [-1, 1].forEach((sd) => {
    for (let k = 0; k < 6; k++) box(0.06, 0.07, 9, glow, sd * 14.95, 3.3 + k * 0.42, -1.5 - k * 0.15);
    // a glowing doorway on each side of the stage
    box(0.1, 4.4, 1.6, glow, sd * 14.9, 2.2, 5.5);
    box(0.4, 4.9, 0.3, dark, sd * 14.8, 2.4, 4.55);
    box(0.4, 4.9, 0.3, dark, sd * 14.8, 2.4, 6.45);
  });
  // a screen on the back wall of the stage, and side pillars
  box(10, 3.4, 0.2, dark, 0, 4.4, 9.0);
  box(9.6, 3.0, 0.1, new THREE.MeshBasicMaterial({ color: '#aeb9ca' }), 0, 4.4, 8.88);
  [-7.5, 7.5].forEach((x) => box(0.5, 9, 0.5, wall, x, 4.5, 8.7));

  // the podium with the mic, behind and to the right of you
  const pod = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.95, 1.1), navy); top.position.y = 0.48; pod.add(top);
  const mic = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.32, 16), mat('#c9cfda'));
  body.rotation.z = Math.PI / 2; mic.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), mat('#9aa3b3')); head.position.x = -0.19; mic.add(head);
  mic.position.set(0.3, 0.99, 0.05); mic.rotation.y = 0.5; pod.add(mic);
  pod.position.set(1.9, 0, 3.4); pod.rotation.y = -0.4;
  scene.add(pod);
}

/* ============================================================== PANELS */
function roundedPlane(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 6);
  // UVs from position
  const pos = g.attributes.position, uv = [];
  for (let i = 0; i < pos.count; i++) uv.push(pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

function drawCustomise() {
  const c = document.createElement('canvas'); c.width = 2000; c.height = 1500;
  const g = c.getContext('2d');
  const F = (w, s) => `${w} ${s}px Sora, Geist, system-ui, sans-serif`;
  const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  g.fillStyle = 'rgba(56, 62, 76, 0.94)'; rr(0, 0, 2000, 1500, 56); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = F(700, 88);
  g.letterSpacing = '6px'; g.fillText('CUSTOMISE ENVIRONMENT', 1000, 210); g.letterSpacing = '0px';
  g.textAlign = 'left'; g.font = F(600, 64); g.fillText('Auditorium Settings', 170, 400);
  g.font = F(400, 46); g.fillStyle = '#e8e8ee'; g.fillText('Audience', 170, 530); g.fillText('Only Stage', 1080, 530);
  const btn = (x, y, w, on, t) => { g.fillStyle = on ? '#f52d5d' : '#73767f'; rr(x, y, w, 120, 18); g.fill(); g.fillStyle = '#fff'; g.font = F(500, 46); g.textAlign = 'center'; g.fillText(t, x + w / 2, y + 76); g.textAlign = 'left'; };
  btn(170, 580, 260, true, 'Fill'); btn(460, 580, 320, false, 'No Fill');
  btn(1080, 580, 260, true, 'On'); btn(1370, 580, 260, false, 'Off');
  g.font = F(400, 46); g.fillStyle = '#e8e8ee'; g.fillText('Volume', 170, 850);
  g.fillStyle = '#8b8e96'; rr(170, 900, 1660, 34, 17); g.fill();
  g.fillStyle = '#9be15d'; rr(170, 900, 520, 34, 17); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(690, 917, 42, 0, Math.PI * 2); g.fill();
  rr(600, 1160, 800, 170, 85); g.fill();
  g.fillStyle = '#111'; g.font = F(600, 60); g.textAlign = 'center'; g.fillText('Save', 1000, 1268);
  return c;
}

function drawTimer() {
  const c = document.createElement('canvas'); c.width = 360; c.height = 170;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(4, 4, 352, 162, 40); g.fill();
  g.fillStyle = '#111'; g.font = '600 92px "Geist Mono", ui-monospace, monospace'; g.textAlign = 'center';
  g.fillText('5:00', 180, 118);
  return c;
}

function buildPanels(scene, camera) {
  const loader = new THREE.TextureLoader();
  return PANELS.map((cfg) => {
    const W = cfg.aspect >= 1.4 ? 2.5 : 1.9, Hh = W / cfg.aspect;
    let tex, video = null;
    if (cfg.src) tex = loader.load(cfg.src);
    else if (cfg.draw) {
      tex = new THREE.CanvasTexture(drawCustomise());
      if (document.fonts) document.fonts.ready.then(() => { tex.image = drawCustomise(); tex.needsUpdate = true; });
    } else {
      video = document.createElement('video');
      video.src = cfg.video + (video.canPlayType('video/webm; codecs="vp9"') ? '.webm' : '.mp4'); video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'none';
      video.setAttribute('muted', ''); video.setAttribute('playsinline', '');
      tex = loader.load(cfg.video + '.webp');
      const vt = new THREE.VideoTexture(video); vt.colorSpace = THREE.SRGBColorSpace;
      video.addEventListener('playing', () => { if (m.map !== vt) { m.map = vt; m.needsUpdate = true; } }, { once: true });
    }
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, fog: false, depthWrite: false, depthTest: false });
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(roundedPlane(W, Hh, cfg.src ? 0.001 : 0.08), m);
    g.add(mesh);
    // a soft frame for the video panel
    if (video) {
      const fr = new THREE.Mesh(roundedPlane(W + 0.06, Hh + 0.06, 0.1), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, fog: false, depthWrite: false, depthTest: false }));
      fr.position.z = -0.005; fr.renderOrder = 9; g.add(fr);
    }
    if (cfg.timer) {
      const tm = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(drawTimer()), transparent: true, fog: false, toneMapped: false, depthWrite: false, depthTest: false }));
      tm.renderOrder = 11;
      tm.material.map.colorSpace = THREE.SRGBColorSpace;
      tm.position.set(W / 2 + 0.05, Hh / 2 + 0.18, 0.02); g.add(tm);
    }
    g.traverse((o) => (o.renderOrder = o.renderOrder || 10));
    scene.add(g);
    const mats = [];
    g.traverse((o) => { if (o.material) mats.push([o.material, o.material.opacity]); });
    let k = 0, R = 3.3;
    const yaw = rad(cfg.yaw), pitch = rad(cfg.pitch || 0);
    const seed = Math.random() * 6;
    return {
      cfg, group: g, W, H: Hh,
      place(r) { R = r; },
      play(on) { if (!video) return; if (on) { const pr = video.play(); if (pr && pr.catch) pr.catch(() => {}); } else video.pause(); },
      update(t, focus) {
        k += (focus - k) * 0.08;
        const r = R - k * 0.25;
        const yb = 1.65 + Math.sin(pitch) * r + Math.sin(t / 1400 + seed) * 0.025;
        g.position.set(-Math.sin(yaw) * Math.cos(pitch) * r, yb, -Math.cos(yaw) * Math.cos(pitch) * r);
        g.lookAt(camera.position.x, 1.65, camera.position.z);
        g.scale.setScalar(0.9 + 0.1 * k);
        mats.forEach(([mt, base]) => (mt.opacity = base * (0.42 + 0.58 * k)));
      },
      target() { return mesh.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -this.H * 0.28 * g.scale.y, 0)); },
    };
  });
}

/* ========================================== THE CONTROLLER AND ITS LASER */
function buildLaser(camera) {
  const hand = new THREE.Group();
  const ctl = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.09, 4, 12), new THREE.MeshLambertMaterial({ color: '#eef1f6' }));
  ctl.rotation.x = Math.PI / 2.3; hand.add(ctl);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 8, 24), new THREE.MeshLambertMaterial({ color: '#eef1f6' }));
  ring.position.set(0, 0.03, -0.05); ring.rotation.x = 0.6; hand.add(ring);
  hand.position.set(0.24, -0.26, -0.42);
  camera.add(hand);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 1, 6), new THREE.MeshBasicMaterial({ color: '#f52d5d', transparent: true, fog: false }));
  beam.geometry.translate(0, 0.5, 0); beam.geometry.rotateX(Math.PI / 2); // points along +z, length 1
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), new THREE.MeshBasicMaterial({ color: '#f52d5d', transparent: true, fog: false }));
  let on = 0;
  const from = new THREE.Vector3(), to = new THREE.Vector3(), cur = new THREE.Vector3();
  let first = true;
  return {
    update(panel, t) {
      if (!beam.parent) { camera.parent.add(beam); camera.parent.add(dot); }
      on += ((panel ? 1 : 0) - on) * 0.08;
      beam.material.opacity = dot.material.opacity = on;
      hand.visible = beam.visible = dot.visible = on > 0.02;
      if (!panel) return;
      hand.getWorldPosition(from);
      to.copy(panel.target());
      to.x += Math.sin(t / 900) * 0.04; to.y += Math.cos(t / 1100) * 0.03;
      if (first) { cur.copy(to); first = false; }
      cur.lerp(to, 0.1);
      beam.position.copy(from);
      beam.lookAt(cur);
      beam.scale.set(1, 1, from.distanceTo(cur));
      dot.position.copy(cur).lerp(from, 0.004);
      dot.lookAt(from);
    },
  };
}
