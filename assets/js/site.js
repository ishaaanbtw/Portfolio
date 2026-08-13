/* ============================================================================
   site.js — the whole engine. No dependencies, no build step.
   ----------------------------------------------------------------------------
   Modules, in order:
     0  utils
     1  sound        synthesized UI audio (no files)
     2  sky          time-of-day gradient behind the sheet
     3  shell        nav, footer, outro, controls, click spark, tooltip, toast
     4  words        scroll-driven word-by-word reveal
     5  showcase     work grid with live CSS previews, scroll-scaled
     6  tabs         Teams / Awards index
     7  pages        per-route rendering
     8  loop         one rAF tick drives every scroll effect
   ========================================================================== */

(() => {
  'use strict';

  const S = window.SITE;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ======================================================== 0. utils ====== */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const el = (tag, props = {}, html) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') n.className = v;
      else if (k === 'style') n.setAttribute('style', v);
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) n.setAttribute(k, v);
    }
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  /* Event targets are not always elements — wheel over a scrollbar, or events
     dispatched at window/document, hand back a node with no .closest(). */
  const hit = (e, sel) => {
    const t = e.target;
    return t && typeof t.closest === 'function' ? t.closest(sel) : null;
  };

  /* assigned in boot(); lets modules outside the loop restart it */
  let wakeLoop = () => {};
  const Pointer = { x: 0, y: 0, seen: false };

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  /* A real spring, integrated per frame. Used for anything scroll-driven, so
     values decelerate into place instead of tracking the scrollbar rigidly.
     stiffness/damping are in the usual spring-per-second units. */
  function Spring(value, stiffness = 120, damping = 20, mass = 1) {
    return {
      v: value, target: value, vel: 0, k: stiffness, d: damping, m: mass,
      step(dt) {
        /* clamp dt so a backgrounded tab can't fling the spring */
        dt = Math.min(dt, 1 / 30);
        const f = -this.k * (this.v - this.target) - this.d * this.vel;
        this.vel += (f / this.m) * dt;
        this.v += this.vel * dt;
        if (Math.abs(this.v - this.target) < 0.0004 && Math.abs(this.vel) < 0.004) {
          this.v = this.target;
          this.vel = 0;
          return false;          // at rest
        }
        return true;             // still moving
      },
    };
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ======================================================== 1. sound ===== */

  const Sound = {
    ctx: null,
    muted: localStorage.getItem('sound') === 'off',

    wake() {
      if (this.muted) return;
      /* A context created before a user gesture starts life suspended, and a
         suspended context plays nothing at all. Resume on every wake. */
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.bus = this.ctx.createGain();
      /* deliberately quiet — audio should only confirm, never announce */
      this.bus.gain.value = 0.34;
      // a gentle low-pass so nothing is ever piercing
      this.lp = this.ctx.createBiquadFilter();
      this.lp.type = 'lowpass';
      this.lp.frequency.value = 7200;
      this.bus.connect(this.lp).connect(this.ctx.destination);
      this.noise = this.makeNoise();
    },

    makeNoise() {
      const len = this.ctx.sampleRate * 0.4;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      return buf;
    },

    /* One voice: a filtered noise transient for the "contact" plus a short
       pitched body for the "material". Everything else is a preset over this.
       Pitch wobbles a few percent per hit so repeats never feel mechanical. */
    voice({ freq = 520, gain = 0.1, dur = 0.07, bright = 2600, type = 'sine', drop = 0.55, noise = 0.5, attack = 0.004 }) {
      if (this.muted) return;
      this.wake();
      if (!this.ctx || this.ctx.state !== 'running') return;

      const t = this.ctx.currentTime;
      const detune = 1 + (Math.random() - 0.5) * 0.06;
      const f = freq * detune;

      if (noise > 0) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noise;
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = bright * detune;
        bp.Q.value = 1.1;
        const ng = this.ctx.createGain();
        ng.gain.setValueAtTime(gain * noise, t);
        ng.gain.exponentialRampToValueAtTime(0.00001, t + dur * 0.45);
        src.connect(bp).connect(ng).connect(this.bus);
        src.start(t);
        src.stop(t + dur);
      }

      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * drop, t + dur);
      const og = this.ctx.createGain();
      og.gain.setValueAtTime(0, t);
      og.gain.linearRampToValueAtTime(gain, t + attack);
      og.gain.exponentialRampToValueAtTime(0.00001, t + dur);
      osc.connect(og).connect(this.bus);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    },

    /* very soft tap — hovering, passing over things */
    tick() { this.voice({ freq: 2100, gain: 0.014, dur: 0.018, bright: 6200, drop: 0.9, noise: 0.35 }); },
    /* glass click — links, rows, tabs */
    tap() { this.voice({ freq: 1320, gain: 0.036, dur: 0.036, bright: 4600, type: 'triangle', drop: 0.7, noise: 0.4 }); },
    /* muted pop — a deliberate button press */
    press() { this.voice({ freq: 300, gain: 0.055, dur: 0.075, bright: 1500, drop: 0.42, noise: 0.3, attack: 0.002 }); },

    /* tiny two-note confirmation tick — only for completed actions */
    chime() {
      if (this.muted) return;
      this.wake();
      if (!this.ctx || this.ctx.state !== 'running') return;
      [1568, 2093].forEach((f, i) => {
        const t = this.ctx.currentTime + i * 0.055;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.03, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.00001, t + 0.16);
        o.connect(g).connect(this.bus);
        o.start(t);
        o.stop(t + 0.2);
      });
    },

    toggle() {
      this.muted = !this.muted;
      localStorage.setItem('sound', this.muted ? 'off' : 'on');
      if (!this.muted) { this.wake(); this.tap(); }
      return this.muted;
    },
  };

  /* ======================================================== 2. sky ======= */

  /* hour, [top, mid, low], text ink, star opacity, orb, orb glow */
  const SKY = [
    { h: 0,  c: ['#05070f', '#0a1128', '#16204a'], stars: 1,    clouds: 0,    name: 'midnight' },
    { h: 4,  c: ['#0c1229', '#1b2450', '#3d3f6b'], stars: 0.7,  clouds: 0.08, name: 'late' },
    { h: 6,  c: ['#2a3466', '#7a6a92', '#e0a087'], stars: 0.18, clouds: 0.45,  name: 'dawn' },
    { h: 8,  c: ['#5c8fd6', '#9fc4e8', '#f4d9bd'], stars: 0,    clouds: 0.8,   name: 'morning' },
    { h: 12, c: ['#3d84d1', '#7fb5e6', '#cfe4f5'], stars: 0,    clouds: 0.95, name: 'noon' },
    { h: 16, c: ['#4a8ec9', '#8fbde0', '#e8d9b8'], stars: 0,    clouds: 0.85, name: 'afternoon' },
    { h: 18, c: ['#3b5c8f', '#b06a5c', '#f2a45c'], stars: 0,    clouds: 0.6,    name: 'golden' },
    { h: 20, c: ['#1d2447', '#7a3a4a', '#d1573a'], stars: 0.25, clouds: 0.3,   name: 'dusk' },
    { h: 22, c: ['#080b1c', '#131c3d', '#2c2f5c'], stars: 0.85, clouds: 0.05,  name: 'night' },
    { h: 24, c: ['#05070f', '#0a1128', '#16204a'], stars: 1,    clouds: 0,    name: 'midnight' },
  ];

  /* the three states of the little orb on the time pod */
  const ORB = {
    sun:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">' +
      '<circle cx="10" cy="10" r="3.4" fill="currentColor" stroke="none"/>' +
      '<path d="M10 1.6v2M10 16.4v2M1.6 10h2M16.4 10h2M4.1 4.1l1.4 1.4M14.5 14.5l1.4 1.4M15.9 4.1l-1.4 1.4M5.5 14.5l-1.4 1.4"/></svg>',
    horizon:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">' +
      '<path d="M6.3 12.6a3.7 3.7 0 0 1 7.4 0" fill="currentColor" stroke="none"/>' +
      '<path d="M1.8 12.6h3M15.2 12.6h3M10 3.4v2.2M4.6 5.9l1.5 1.5M15.4 5.9l-1.5 1.5"/>' +
      '<path d="M2.4 16.1h15.2"/></svg>',
    moon:
      '<svg viewBox="0 0 20 20" fill="none">' +
      '<path d="M14.6 12.4A6.2 6.2 0 0 1 7.6 3a6.6 6.6 0 1 0 7 9.4Z" fill="currentColor"/></svg>',
  };

  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgb2css = (r) => `rgb(${r.map((v) => Math.round(v)).join(',')})`;
  const mixRgb = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
  const mixHex = (a, b, t) => rgb2css(mixRgb(hex2rgb(a), hex2rgb(b), t));
  const cssRgb = (str) => str.match(/\d+/g).map(Number);

  /* WCAG relative luminance — used to decide whether the footer copy needs
     dark ink or light ink against whatever the sky is currently doing. */
  function luminance([r, g, b]) {
    const f = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }

  const INK_DARK = [25, 23, 20];
  const INK_LIGHT = [244, 247, 255];
  const INK_DARK_STRONG = [10, 9, 8];
  const INK_LIGHT_STRONG = [255, 255, 255];
  const contrast = (a, b) => {
    const l1 = luminance(a), l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const Sky = {
    hour: null,

    init() {
      const root = el('div', { class: 'sky-root', 'aria-hidden': 'true' });
      root.appendChild(this.starfield());
      root.appendChild(this.clouds());
      this.shoot = el('span', { class: 'shoot' });
      root.appendChild(this.shoot);
      document.body.prepend(root);

      const now = new Date();
      this.set(now.getHours() + now.getMinutes() / 60, false);
      this.scheduleShoot();
    },

    /* My first starfield used radii of 0.3–1.4px, which is invisible on any
       real display. These are sized in px against the viewport and given three
       brightness tiers so the sky has depth rather than uniform speckle. */
    starfield() {
      const stars = [];
      const tiers = [
        { n: 70, r: [0.5, 0.9], o: [0.28, 0.5] },   // faint dust
        { n: 34, r: [0.9, 1.5], o: [0.5, 0.78] },   // mid
        { n: 10, r: [1.5, 2.2], o: [0.8, 1.0] },    // the few bright ones
      ];

      /* The paper covers the top ~60% of the viewport at the footer, so stars
         spread evenly over the full height are mostly invisible — that's why
         only three were showing. Two thirds now sit in the band below the
         paper; the rest go up top, where they show in the 32px side strips. */
      /* Split each tier deterministically rather than rolling a die per star —
         a random 68% chance can land well under half on an unlucky page, and
         "most of the stars are where you can see them" should be guaranteed. */
      const LOW_SHARE = 0.68;
      for (const t of tiers) {
        const inLowBand = Math.round(t.n * LOW_SHARE);
        for (let i = 0; i < t.n; i++) {
          const x = Math.random() * 100;
          const y = i < inLowBand
            ? 58 + Math.random() * 42     // below the paper's bottom edge
            : Math.random() * 58;         // visible down the inset side strips
          const r = t.r[0] + Math.random() * (t.r[1] - t.r[0]);
          const o = t.o[0] + Math.random() * (t.o[1] - t.o[0]);
          const dur = (4 + Math.random() * 6).toFixed(1);
          const begin = (Math.random() * 8).toFixed(1);
          stars.push(
            `<circle cx="${x.toFixed(2)}%" cy="${y.toFixed(2)}%" r="${r.toFixed(2)}" fill="#fff" opacity="${o.toFixed(2)}">` +
            `<animate attributeName="opacity" values="${o.toFixed(2)};${(o * 0.35).toFixed(2)};${o.toFixed(2)}" ` +
            `dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`
          );
        }
      }

      const holder = el('div');
      holder.innerHTML = `<svg class="stars" preserveAspectRatio="none">${stars.join('')}</svg>`;
      return holder.firstElementChild;
    },

    clouds() {
      const holder = el('div', { class: 'clouds' });
      /* a handful at different sizes, heights, blurs and speeds — the variety
         is what stops it reading as a repeating pattern */
      /* Weighted to the lower half, where the sky is actually visible past the
         paper. Nearer clouds are bigger, sharper, faster and more opaque; the
         far ones are small, soft and slow, which gives the band some depth. */
      const spec = [
        { w: 30, h: 11, t: 58, o: 0.82, dur: 96,  bob: 22, y: 9 },
        { w: 20, h: 8,  t: 70, b: 14, o: 0.7,  dur: 74,  bob: 18, y: 7 },
        { w: 42, h: 15, t: 78, o: 0.88, dur: 128, bob: 30, y: 12 },
        { w: 16, h: 6,  t: 48, b: 13, o: 0.42, dur: 150, bob: 26, y: 6 },
        { w: 26, h: 10, t: 86, o: 0.78, dur: 108, bob: 24, y: 10 },
        { w: 13, h: 5,  t: 34, b: 12, o: 0.28, dur: 190, bob: 34, y: 5 },
        { w: 34, h: 12, t: 64, o: 0.58, dur: 118, bob: 28, y: 11 },
      ];
      spec.forEach((c, i) => {
        const cloud = el('i', {
          style:
            `--w:${c.w}rem;--h:${c.h}rem;--t:${c.t}%;--o:${c.o};` +
            `--dur:${c.dur}s;--bob:${c.bob}s;--bob-y:${c.y}px;` +
            /* negative delay so they start already spread across the sky */
            `--delay:-${((c.dur / spec.length) * i).toFixed(1)}s`,
        });
        cloud.appendChild(el('span'));
        holder.appendChild(cloud);
      });
      return holder;
    },

    /* one shooting star every 30–60s, and only while it's actually dark */
    scheduleShoot() {
      const next = 30000 + Math.random() * 30000;
      setTimeout(() => {
        const dark = parseFloat(getComputedStyle(document.documentElement)
          .getPropertyValue('--star-opacity') || 0);
        if (dark > 0.55 && this.shoot && !document.hidden) {
          this.shoot.style.top = `${6 + Math.random() * 22}%`;
          this.shoot.style.left = `${2 + Math.random() * 30}%`;
          this.shoot.classList.remove('go');
          void this.shoot.offsetWidth;   // restart the animation
          this.shoot.classList.add('go');
        }
        this.scheduleShoot();
      }, next);
    },

    /* interpolate the palette at an arbitrary hour */
    at(h) {
      h = ((h % 24) + 24) % 24;
      let a = SKY[0], b = SKY[SKY.length - 1];
      for (let i = 0; i < SKY.length - 1; i++) {
        if (h >= SKY[i].h && h <= SKY[i + 1].h) { a = SKY[i]; b = SKY[i + 1]; break; }
      }
      const t = b.h === a.h ? 0 : (h - a.h) / (b.h - a.h);
      return {
        c: a.c.map((c, i) => mixHex(c, b.c[i], t)),
        stars: lerp(a.stars, b.stars, t),
        clouds: lerp(a.clouds, b.clouds, t),
        name: t < 0.5 ? a.name : b.name,
      };
    },

    set(h, announce = true) {
      this.hour = h;
      const p = this.at(h);
      const r = document.documentElement.style;
      r.setProperty('--sky-1', p.c[0]);
      r.setProperty('--sky-2', p.c[1]);
      r.setProperty('--sky-3', p.c[2]);
      r.setProperty('--star-opacity', p.stars.toFixed(2));
      r.setProperty('--cloud-opacity', p.clouds.toFixed(2));

      /* Footer legibility.
         Blending ink from dark to light passes through mid-grey, which at dusk
         (a mid-luminance sky) drops contrast to ~1.3:1 — worse than the night
         bug it was meant to fix. So the ink is *chosen*, not blended: whichever
         of dark/light contrasts better wins. A soft haze behind the text pushes
         the local background away from mid-luminance, which is what actually
         guarantees the ratio at dawn and dusk. */
      const low = cssRgb(p.c[2]);
      const SCRIM = 0.34;
      const darkBg = mixRgb(low, [255, 255, 255], SCRIM);   // light haze
      const lightBg = mixRgb(low, [0, 0, 0], SCRIM);        // dark haze
      const useLight = contrast(INK_LIGHT, lightBg) > contrast(INK_DARK, darkBg);

      r.setProperty('--outro-ink', rgb2css(useLight ? INK_LIGHT : INK_DARK));
      r.setProperty('--outro-ink-strong', rgb2css(useLight ? INK_LIGHT_STRONG : INK_DARK_STRONG));
      r.setProperty('--outro-scrim', useLight
        ? `rgba(0, 0, 0, ${SCRIM})`
        : `rgba(255, 255, 255, ${SCRIM})`);

      const pod = $('.timepod');
      if (pod) {
        const lbl = $('.timepod__label', pod);
        if (lbl) lbl.textContent = `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`;
        const ticks = $$('.timepod__ticks i', pod);
        const on = Math.round((h / 24) * (ticks.length - 1));
        ticks.forEach((t, i) => t.classList.toggle('on', i === on));

        /* the glyph tells you which part of the day you're in, matching the
           reference: full sun by day, sun-over-horizon at dawn and dusk, moon
           at night */
        const orb = $('.timepod__orb', pod);
        const phase = p.stars > 0.4 ? 'moon' : (h < 7.5 || h > 17 ? 'horizon' : 'sun');
        if (orb && orb.dataset.phase !== phase) {
          orb.dataset.phase = phase;
          orb.innerHTML = ORB[phase];
        }
      }
      const fine = $('.outro .fine');
      if (fine && announce) fine.dataset.sky = p.name;
    },
  };

  /* ======================================================== 3. shell ===== */

  const ICON = {
    github: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"/></svg>',
    x: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M12.6 1h2.35L9.83 6.86 15.85 15H10.9L7.02 9.9 2.6 15H.25l5.46-6.25L0 1h5.07l3.62 4.78L12.6 1Zm-.83 12.6h1.3L4.1 2.33H2.7l9.07 11.27Z"/></svg>',
    mail: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.2" y="3.2" width="13.6" height="9.6" rx="1.6"/><path d="m1.8 4.4 6.2 4.4 6.2-4.4"/></svg>',
    dribbble: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="7"/><path d="M2 5.4c4.3.6 7.7 2.8 9.6 6.9M5.6 1.6C8.4 4.4 10 8.4 10.3 14.6M14.8 7c-4 .1-7.6 1-10.6 3.2"/></svg>',
    linkedin: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.4 5.2H.9V15h2.5V5.2ZM2.15 1a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9ZM15 9.6c0-2.9-1.6-4.6-3.8-4.6-1.3 0-2.1.6-2.6 1.4V5.2H6.1V15h2.5V9.9c0-1.3.5-2.2 1.7-2.2 1.1 0 1.6.8 1.6 2.2V15H15V9.6Z"/></svg>',
  };

  const SPEAKER =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round">' +
    '<path d="M7.2 3.2 4.4 5.6H2.2v4.8h2.2l2.8 2.4V3.2Z" fill="currentColor" stroke="none"/>' +
    '<path d="M9.6 6.1a2.6 2.6 0 0 1 0 3.8"/><path d="M11.6 4.3a5.2 5.2 0 0 1 0 7.4"/>' +
    '<path class="slash" d="M13.9 4.6 9.4 11.4" stroke-width="1.5"/></svg>';

  const Shell = {
    page: document.body.dataset.page || 'home',

    init() {
      document.title = `${S.person.name} — ${this.page === 'home' ? 'Portfolio' : this.page[0].toUpperCase() + this.page.slice(1)}`;
      this.nav();
      this.foot();
      this.outro();
      this.controls();
      this.hoverCold();
      this.toast();
      this.tooltip();
      /* stacks() is deliberately not called here — the prose it lives inside
         hasn't been rendered yet. boot() calls it after the page mounts. */
      this.transitions();
      this.buttons();
    },

    nav() {
      const nav = $('#nav');
      if (!nav) return;
      S.nav.forEach((item, i) => {
        const current = item.href.startsWith(this.page === 'home' ? 'index' : this.page);
        const a = el('a', { href: item.href, ...(current ? { 'aria-current': 'page' } : {}) }, esc(item.label));
        if (this.page === 'home') {
          const rv = (S.canvas && S.canvas.reveal) || {};
          a.classList.add('rv');
          a.style.setProperty('--rv-delay', `${(rv.navAt || 2300) + i * (rv.navStagger || 70)}ms`);
          a.style.setProperty('--rv-blur', `${rv.blur || 14}px`);
        }
        nav.appendChild(a);
      });
      this.menu();
    },

    /* --- the phone's navigation -----------------------------------------------
       A row of four links is a desktop pattern: it assumes a cursor and a page
       wide enough to spare the room. At 390px it is 262px of 16px-tall targets
       sitting on top of the headline.

       Below 48rem it is replaced — not reflowed — by a fixed bar and a sheet.
       Both live in the DOM at all times and CSS alone decides which is on
       screen, so a rotation or a resized window can never leave the page with
       neither.

       Project pages already hide `.nav` entirely, and the bar is hidden with
       it, so nothing here can reach a case study. */
    menu() {
      if (this.page === 'project' || $('.mbar')) return;

      const bar = el('div', { class: 'mbar', 'aria-hidden': 'false' });
      const btn = el('button', {
        class: 'mbar__btn', type: 'button',
        'aria-label': 'Menu', 'aria-expanded': 'false', 'aria-controls': 'm-sheet',
      });
      btn.innerHTML = '<span class="mbar__bar"></span><span class="mbar__bar"></span>';
      bar.appendChild(btn);

      const sheet = el('div', {
        class: 'msheet', id: 'm-sheet', hidden: '',
        role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Menu',
      });

      /* --- the four panels -------------------------------------------------
         Opening is not a sheet fading up. Four coloured panels come down over
         the page one after another, each starting about 110ms after the one
         ahead of it — so at any instant you are looking at a staircase of
         leading edges rather than at a single moving thing, which is what makes
         it read as layers of paper sliding over each other instead of a drawer.

         EACH ONE STOPS WHERE IT LANDS. The first version had them continue on
         out of the bottom, which looked right in a video of somebody else's
         site and was wrong here for a measurable reason: a panel that passes
         through has to travel two screens instead of one, and at any duration
         that keeps the whole sequence under a second that makes the leading
         edge cross the glass in about 150ms. Filmed at 60fps against the
         reference — 430ms to cross — it read as a flash rather than as fabric.
         Landing halves the distance, so the same spring covers it in the same
         time the reference takes, and the colours simply pile up: only the top
         one is visible at rest, and the three beneath it are what the close
         uncovers on the way back out.

         Each panel is 124% of the viewport, offset -12%, and travels in units
         of its own height. That margin is not decoration: the springs overshoot
         by about 5%, and without the overspill an overshoot would show a strip
         of the page along the top edge at the moment the panel settles. */
      const PANELS = [
        /* in: the order they come down.  out: reversed, because they are
           stacked — the top one has to lift before the one beneath it can be
           seen, so leaving in the order they arrived would just hide the
           cascade under the panel that had not moved yet. */
        { k: 'a', in: 0, out: 270 },
        { k: 'b', in: 110, out: 180 },
        { k: 'c', in: 220, out: 90 },
        { k: 'd', in: 330, out: 0 },
      ];
      const lays = PANELS.map((P, i) => {
        const n = el('div', {
          class: `msheet__lay msheet__lay--${P.k}`, 'aria-hidden': 'true',
          style: `z-index:${i + 1}`,
        });
        sheet.appendChild(n);
        return { n, at: P.in, out: P.out, pos: -100, vel: 0, to: -100 };
      });
      const last = lays[3];    /* the surface the menu is written on */

      /* --- what is written on it -------------------------------------------
         Ordered the way it arrives: the name, the pages, the places to find me,
         then the one thing I want tapped. Each carries its own `--i`, so the
         stagger is a single multiplication in CSS rather than a queue of
         timeouts that would need cancelling on a fast close. */
      const body = el('div', { class: 'msheet__body' });
      let i = 0;
      const step = (n) => { n.style.setProperty('--i', String(i++)); return n; };

      body.appendChild(step(el('p', { class: 'msheet__brand' }, esc(S.person.name))));

      /* --- the pages, set as a masthead rather than a list -------------------
         The nav sits in its own two-column block: a small standing word on the
         left and the pages themselves indented past it, large and tightly
         leaded, anchored to the top third of the screen with the room left
         under them.

         That indent is the whole idea. Four rows of the same size with rules
         between them and a gap above is a settings screen; the same four words
         set as a stack with something standing beside them is a masthead, and a
         masthead has a voice. The word is "Pages" rather than something written
         for the occasion because that is what this site already calls this list
         in its own footer — a menu is not the place to introduce a new noun. */
      const nav = el('div', { class: 'msheet__nav' });
      nav.appendChild(step(el('p', { class: 'msheet__eyebrow' }, 'Pages')));

      const list = el('nav', { class: 'msheet__list', 'aria-label': 'Pages' });
      S.nav.forEach((item) => {
        const cur = item.href.startsWith(this.page === 'home' ? 'index' : this.page);
        list.appendChild(step(el('a', {
          class: 'msheet__link', href: item.href,
          ...(cur ? { 'aria-current': 'page' } : {}),
        }, esc(item.label))));
      });
      nav.appendChild(list);
      body.appendChild(nav);

      const fc = S.footer || {};
      const soc = el('ul', { class: 'msheet__soc' });
      (fc.links || []).filter((l) => !/^mailto:/.test(l.href)).forEach((l) => {
        soc.appendChild(step(el('li', {}, ''))).appendChild(el('a', {
          href: l.href, target: '_blank', rel: 'noopener',
        }, esc(l.label)));
      });
      if (soc.children.length) body.appendChild(soc);

      const mail = fc.email || S.person.email;
      body.appendChild(step(el('a', { class: 'msheet__cta', href: `mailto:${mail}` },
        esc(fc.lead || 'Get in touch'))));

      sheet.appendChild(body);
      document.body.appendChild(bar);
      document.body.appendChild(sheet);

      /* --- the physics -----------------------------------------------------
         One spring per panel, all four integrated in ONE requestAnimationFrame
         loop that writes four transforms and reads nothing. A spring rather
         than a bezier for a reason that matters here: the button can be tapped
         again mid-flight, and a spring simply gets a new target and carries its
         current velocity into it, so an interrupted open turns into a close
         without a seam. A CSS transition would restart from a standstill.

         zeta 0.7 — under-damped on purpose. It arrives, goes about 5% past, and
         settles. Critically damped would be correct and would feel like
         software.

         omega 6.4 rather than 13.2, and it was set by measurement rather than
         by feel. The frequency is what decides how long the leading edge takes
         to cross the glass, which is the one number that separates fabric from
         a flash. Filmed at 60fps: 13.2 over two screens gave 150ms, 9 over one
         screen gave 230ms, and the reference — filmed the same way — takes
         about 400. 6.4 puts it at 330: slower than a UI transition wants to be,
         which is the point, and still leaves the whole sequence inside 1.1s. */
      const W = 6.4;                    /* rad/s   */
      const Z = 0.7;                    /* damping */
      const K = W * W;
      const C = 2 * Z * W;
      let raf = 0, t0 = 0, prev = 0, lit = false, dir = 1;

      const write = () => {
        for (const L of lays) L.n.style.transform = `translate3d(0,${L.pos.toFixed(2)}%,0)`;
      };

      const frame = (now) => {
        raf = 0;
        const t = now - t0;
        let dt = Math.min((now - prev) / 1000, 0.05);
        prev = now;
        let live = false;

        for (const L of lays) {
          if (t < (dir > 0 ? L.at : L.out)) { live = true; continue; }
          /* substepped so a dropped frame cannot make the spring explode */
          let rest = dt;
          while (rest > 0) {
            const h = Math.min(rest, 1 / 120);
            rest -= h;
            L.vel += (-K * (L.pos - L.to) - C * L.vel) * h;
            L.pos += L.vel * h;
          }
          /* A PANEL THAT IS OFF THE SCREEN IS FINISHED, WHATEVER THE SPRING
             THINKS. On the way out it overshoots past -100 and eases back, all
             of it above the top edge — a third of a second of arithmetic and
             transform writes that cannot be seen. Clamping the moment it clears
             ends the loop with the animation instead of long after it. */
          if (L.to < 0 && L.pos <= -100) { L.pos = -100; L.vel = 0; }
          else if (Math.abs(L.pos - L.to) > 0.15 || Math.abs(L.vel) > 0.6) live = true;
          else { L.pos = L.to; L.vel = 0; }
        }
        write();

        /* The content is lit from inside the loop, off the last panel's real
           position rather than a timer, so it cannot appear early on a slow
           frame: the surface it is written on has to be down first.

           AND IT LATCHES. The first version re-tested the condition every frame
           and the surface's own overshoot — 2.8% past its resting place — took
           it back out of the window, so the class went on at 656ms, off at
           690ms and on again at 806ms. Each flip restarted six staggered CSS
           transitions from zero, which is why the menu used to finish arriving
           a third of a second later than it should. Turning it off is the
           closing tap's job, and nothing else's. */
        if (!lit && dir > 0 && last.pos > -3) {
          lit = true;
          sheet.classList.add('is-lit');
          const first = $('.msheet__link', sheet);
          if (first) first.focus({ preventScroll: true });
        }

        if (live) raf = requestAnimationFrame(frame);
        else {
          sheet.classList.remove('is-moving');
          if (dir < 0) { sheet.hidden = true; document.body.style.top = ''; }
        }
      };

      /* The delay clock restarts on every call, including one that lands
         mid-flight — the positions and velocities carry over untouched, so a
         reversal keeps its momentum while the stagger is measured from the tap
         that caused it. */
      const run = () => {
        t0 = prev = performance.now();
        sheet.classList.add('is-moving');
        if (!raf) raf = requestAnimationFrame(frame);
      };

      let open = false, keep = 0;
      const set = (next) => {
        if (next === open) return;
        open = next;
        dir = open ? 1 : -1;
        btn.setAttribute('aria-expanded', String(open));
        btn.classList.toggle('is-open', open);
        bar.classList.toggle('is-open', open);

        if (open) {
          /* Locking with `overflow: hidden` alone lets iOS Safari forget where
             the reader was; pinning the body at its current offset and putting
             it back on close is what keeps the position. */
          keep = window.scrollY;
          document.body.style.top = `-${keep}px`;
          document.body.classList.add('m-locked');
          sheet.hidden = false;
          for (const L of lays) { L.to = 0; }
          if (REDUCED) {
            for (const L of lays) { L.pos = L.to; L.vel = 0; }
            write();
            sheet.classList.add('is-lit');
            lit = true;
            const first = $('.msheet__link', sheet);
            if (first) first.focus({ preventScroll: true });
            return;
          }
          /* start from above without a paint at the old position */
          write();
          run();
          return;
        }

        sheet.classList.remove('is-lit');
        lit = false;
        document.body.classList.remove('m-locked');
        window.scrollTo(0, keep);
        btn.focus({ preventScroll: true });

        for (const L of lays) { L.to = -100; }
        if (REDUCED) {
          for (const L of lays) { L.pos = -100; L.vel = 0; }
          write();
          sheet.hidden = true;
          document.body.style.top = '';
          return;
        }
        run();
      };

      /* THE FIRST FRAME IS THE EXPENSIVE ONE, SO IT HAPPENS BEFORE THE TAP
         LANDS. Unhiding the sheet inside the click handler means style, layout
         and the first paint of four full-screen panels and ten blurred rows all
         fall in the same frame as the first panel's first move — measured at
         53ms, against 16.7 for every frame after it. Taking the sheet out of
         `display: none` on pointerdown instead spends that work in the gap
         between a finger touching the glass and the click event, which on a
         phone is 80ms or more, and the animation starts on a warm layout.
         Nothing is visible either way: the panels are parked above the top
         edge and the sheet does not take pointer events until it moves. */
      btn.addEventListener('pointerdown', () => { if (!open) sheet.hidden = false; }, { passive: true });
      btn.addEventListener('click', () => set(!open));
      list.addEventListener('click', (e) => { if (hit(e, 'a')) set(false); });
      body.addEventListener('click', (e) => { if (hit(e, '.msheet__cta')) set(false); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) set(false); });
    },

    /* The footer answers the header. Same dotted field, same nav — the Pages
       column is built from S.nav rather than listed again, so it cannot fall out
       of step with the links at the top of the page. The email takes the place the
       name takes in the hero: the largest thing on the surface. */
    foot() {
      const f = $('#foot');
      if (!f) return;
      const c = S.footer || {};
      f.className = 'foot';
      f.appendChild(el('div', { class: 'foot__dots', 'aria-hidden': 'true' }));

      const said = el('div', { class: 'foot__said' });
      const mail = c.email || S.person.email;
      said.appendChild(el('a', { class: 'foot__mail', href: `mailto:${mail}` }, esc(mail)));
      if (c.note) said.appendChild(el('p', { class: 'foot__note' }, esc(c.note)));
      said.appendChild(el('p', { class: 'foot__fine' },
        esc(String(c.fine || '').replace('{year}', new Date().getFullYear()))));
      f.appendChild(said);

      /* --- the Links column speaks in glyphs --------------------------------
         Four stacked words that all mean "elsewhere" are four things to read
         before you can pick one; the marks are recognised without reading. The
         column keeps its rhythm — same row pitch as Pages beside it, only the
         label becomes a glyph — so the two columns still scan as one pair.

         MATCHED ON THE HREF, NOT THE LABEL, because the href is the fact.
         `S.footer.links` is content and its labels are free text: the first
         entry is called Twitter and points at x.com, and somebody will
         eventually write "𝕏" or "Twitter/X" or their own name for it. The
         destination cannot drift.

         AND IT FALLS BACK TO THE WORD. A link this does not recognise keeps its
         label rather than rendering an empty 18px box — adding a fifth link to
         content should never make it disappear from the page. */
      const GLYPH = [
        [/^mailto:/, 'mail'],
        [/(^|\/\/|\.)(x|twitter)\.com/, 'x'],
        [/linkedin\.com/, 'linkedin'],
        [/github\.com/, 'github'],
        [/dribbble\.com/, 'dribbble'],
      ];
      const glyph = (href) => {
        const hit = GLYPH.find(([re]) => re.test(href));
        return hit ? ICON[hit[1]] : '';
      };

      const column = (title, items, asGlyphs) => {
        /* named rather than counted: the phone hides one of these two and lays
           the other one out sideways, and `:nth-of-type` would be pointing at
           the dot field and the address, which are divs in the same grid */
        const col = el('div', {
          class: `foot__col foot__col--${title.toLowerCase()}`,
        });
        col.appendChild(el('h2', { class: 'foot__colt' }, esc(title)));
        const list = el('ul', {});
        items.forEach((it) => {
          const here = it.href.startsWith(this.page === 'home' ? 'index' : this.page);
          const mark = asGlyphs ? glyph(it.href) : '';
          const a = el('a', {
            href: it.href,
            /* The label does not disappear when the word does — it moves to the
               accessible name, so a screen reader still says "Twitter" and a
               cursor still gets a tooltip. An icon-only link with no name is
               announced as its own URL. */
            ...(mark ? { class: 'foot__ico', 'aria-label': it.label, title: it.label } : {}),
            ...(here ? { 'aria-current': 'page' } : {}),
            /* only the outbound ones open away from the site */
            ...(/^https?:/.test(it.href) ? { target: '_blank', rel: 'noopener' } : {}),
          }, mark
            /* THE WORD STAYS IN THE BOX, IT JUST STOPS BEING VISIBLE.
               Sizing the glyph row by hand does not hold: a text row here is
               the line box of a 15px label at `line-height: normal`, which is
               17px, and an 18px mark set to `1.5em` came out at 22.5 — five
               and a half pixels of drift per row, so by the fourth link the
               column was 10px out of step with Pages beside it and the whole
               pair stopped reading as one thing.
               So the label is still laid out and still measured; it is only
               hidden, and the mark is positioned over it. The pitch is then
               identical BY CONSTRUCTION, at every width and whatever the type
               scale does — and the box keeps the width of the word, which on a
               desktop is a far better target than 18 square pixels. */
            ? `<span class="foot__ico__w">${esc(it.label)}</span>${mark}`
            : esc(it.label));
          list.appendChild(el('li', {}, '')).appendChild(a);
        });
        col.appendChild(list);
        return col;
      };
      f.appendChild(column('Pages', S.nav));
      f.appendChild(column('Links', c.links || [], true));
    },

    outro() {
      const o = $('#outro');
      if (!o) return;
      o.className = 'outro';
      /* its own line, not the footer's — the footer above already signs the page,
         and this one names the sky instead */
      const fine = String(S.footer.outroFine || '').replace('{year}', new Date().getFullYear());
      /* deliberately one flowing sentence — the fine print sits inline */
      o.innerHTML =
        `<p><strong>${esc(S.footer.lead)}</strong> — ${esc(S.footer.body)} ` +
        `<span class="fine">${esc(fine)}</span></p>`;
    },

    controls() {
      /* time-of-day pod */
      const pod = el('div', { class: 'timepod', title: 'Drag to change the sky' });
      pod.appendChild(el('span', { class: 'timepod__orb' }));
      const track = el('div', { class: 'timepod__track' });
      track.appendChild(el('div', { class: 'timepod__ticks' }, '<i></i>'.repeat(7)));
      const range = el('input', {
        type: 'range', min: '0', max: '1435', step: '5',
        value: String(Math.round(Sky.hour * 60)),
        'aria-label': 'Time of day',
      });
      let lastTick = -1;
      range.addEventListener('input', () => {
        const h = +range.value / 60;
        Sky.set(h);
        const t = Math.round(h * 2);
        if (t !== lastTick) { lastTick = t; Sound.tick(); }
      });
      track.appendChild(range);
      pod.appendChild(track);
      pod.appendChild(el('span', { class: 'timepod__label' }));
      document.body.appendChild(el('div', { class: 'controls' })).appendChild(pod);

      /* mute */
      const mute = el(
        'button',
        { class: 'mute', 'aria-pressed': String(Sound.muted), 'aria-label': 'Toggle sound' },
        SPEAKER
      );
      mute.addEventListener('click', () => {
        const m = Sound.toggle();
        mute.setAttribute('aria-pressed', String(m));
      });
      document.body.appendChild(mute);

      Sky.set(Sky.hour);
    },

    /* Whatever sits under the cursor at first paint shouldn't light up before
       the pointer has actually moved. CSS gates hover behind :not(.hover-cold). */
    hoverCold() {
      const root = document.documentElement;
      root.classList.add('hover-cold');
      let fx = -1, fy = -1;
      const arm = () => {
        root.classList.remove('hover-cold');
        removeEventListener('pointermove', move);
        removeEventListener('pointerdown', arm);
      };
      const move = (e) => {
        if (fx < 0) { fx = e.clientX; fy = e.clientY; return; }
        if (Math.abs(e.clientX - fx) + Math.abs(e.clientY - fy) > 12) arm();
      };
      addEventListener('pointermove', move, { passive: true });
      addEventListener('pointerdown', arm, { passive: true });
    },

    /* Click spark. Six spokes at 60°, offset 36°, travelling outward and
       fading over ~95ms — every value here was measured off the recording
       frame by frame. Fires on any click, anywhere, like the reference. */
    spark(x, y) {
      if (REDUCED) return;
      const s = el('span', { class: 'spark', 'aria-hidden': 'true' });
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      for (let k = 0; k < 6; k++) {
        s.appendChild(el('i', { style: `--a:${36 + k * 60}deg` }));
      }
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 220);
    },

    toast() {
      this.toastEl = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(this.toastEl);
    },

    /* One tooltip element, repositioned on demand. It springs up from under the
       badge rather than fading in place. */
    tooltip() {
      const tip = el('div', { class: 'tip', role: 'tooltip' });
      document.body.appendChild(tip);
      this.tipEl = tip;

      let current = null;

      const show = (node) => {
        const label = node.dataset.tip;
        if (!label) return;
        current = node;
        tip.textContent = label;
        const r = node.getBoundingClientRect();
        tip.style.left = `${r.left + r.width / 2}px`;
        tip.style.top = `${r.top - 6}px`;
        tip.classList.add('is-up');
      };

      const hide = () => { current = null; tip.classList.remove('is-up'); };

      document.addEventListener('pointermove', (e) => {
        const node = hit(e, '[data-tip]');
        if (node === current) return;
        if (node) show(node);
        else hide();
      }, { passive: true });

      /* a tooltip anchored to a moving page has to follow or disappear */
      addEventListener('scroll', () => { if (current) show(current); }, { passive: true });
      document.addEventListener('focusin', (e) => {
        const node = e.target.closest?.('[data-tip]');
        if (node) show(node); else hide();
      });
      document.addEventListener('focusout', hide);
    },

    say(msg) {
      const t = this.toastEl;
      t.textContent = msg;
      t.classList.add('is-up');
      clearTimeout(this._tt);
      this._tt = setTimeout(() => t.classList.remove('is-up'), 1900);
    },

    /* The three-card product stack. Cards cycle so the front one changes, each
       card springing to its new depth. The tooltip tracks whatever is in front. */
    stacks() {
      $$('.stack').forEach((stack) => {
        const cards = $$('.stack__card', stack);
        if (!cards.length) return;

        let front = 0;
        const apply = () => {
          cards.forEach((c, i) => {
            const depth = (i - front + cards.length) % cards.length;
            c.dataset.depth = String(depth);
          });
          stack.dataset.tip = cards[front].dataset.name || '';
        };

        const cycle = () => {
          front = (front + 1) % cards.length;
          apply();
          Sound.tick();
          /* keep the tooltip label in step with the new front card */
          stack.dispatchEvent(new Event('pointermove', { bubbles: true }));
        };

        apply();
        stack.addEventListener('click', cycle);
        stack.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycle(); }
        });
        /* auto-flip while hovered, so it feels alive without a click */
        let timer = null;
        stack.addEventListener('pointerenter', () => { timer = setInterval(cycle, 1100); });
        stack.addEventListener('pointerleave', () => { clearInterval(timer); timer = null; });
      });
    },

    /* Avatar-group hover (transitions.dev). Every sibling shifts, with the
       amount falling off by distance from the hovered one, so the group moves
       like a connected row rather than one item popping. The timing function is
       written inline *before* the variable writes — ease-in on the way up,
       a springier ease-out on the way back — as the recipe requires. */
    avatars() {
      const read = (name, fallback) => {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v === '' ? fallback : parseFloat(v);
      };
      const lift = read('--avatar-lift', -4);
      const scale = read('--avatar-scale', 1.05);
      const falloff = read('--avatar-falloff', 0.45);

      $$('.t-avatar-group').forEach((group) => {
        const items = $$('.t-avatar', group);
        if (items.length < 2) return;

        const write = (ease) => {
          items.forEach((node) => { node.style.transitionTimingFunction = ease; });
        };

        items.forEach((item, active) => {
          item.addEventListener('pointerenter', () => {
            write('var(--avatar-ease-in)');
            items.forEach((node, i) => {
              const distance = Math.abs(i - active);
              node.style.setProperty('--shift', `${(lift * Math.pow(falloff, distance)).toFixed(3)}px`);
              node.style.setProperty('--scale-active', i === active ? String(scale) : '1');
            });
          });
        });

        group.addEventListener('pointerleave', () => {
          write('var(--avatar-ease-out)');
          items.forEach((node) => {
            node.style.setProperty('--shift', '0px');
            node.style.setProperty('--scale-active', '1');
          });
        });
      });
    },

    /* The "people" field. Cards are scattered on a jittered grid so they never
       overlap badly, spring in with a stagger, and the page blurs behind them.
       Escape or a click on the backdrop closes it. */
    field() {
      const trigger = $('.people-trigger');
      if (!trigger || !S.people.field?.length) return;

      const field = el('div', { class: 'field', 'aria-hidden': 'true' });
      const scrim = el('button', {
        class: 'field__scrim', type: 'button', 'aria-label': 'Close',
        'data-nopress': '',
      });
      field.appendChild(scrim);

      const cards = S.people.field;
      /* lay them out on a 4x3 jittered grid, skipping the middle column where
         the prose sits, so the text stays readable through the blur */
      const slots = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          if (col === 1 || col === 2) { if (row !== 2) continue; }
          slots.push([col, row]);
        }
      }

      /* Jitter is decided once so the field doesn't reshuffle on every open,
         but the percentages are resolved against the live viewport each time —
         otherwise a card's random offset can push it off the screen edge. */
      const nodes = cards.map((c, i) => {
        const [col, row] = slots[i % slots.length];
        const card = el('figure', { class: 'field__card' });
        card.appendChild(el('img', { src: c.src, alt: '', loading: 'lazy' }));
        card.style.setProperty('--rot', `${((Math.random() - 0.5) * 13).toFixed(2)}deg`);
        /* measured: ~85ms before the first card appears, then a short stagger */
        card.style.setProperty('--delay', `${85 + i * 38}ms`);
        field.appendChild(card);
        return {
          card, col, row,
          w: c.w || 13,
          ratio: c.ratio || '4/3',
          jx: (Math.random() - 0.5) * 7,
          jy: (Math.random() - 0.5) * 9,
        };
      });

      const REM = 16;
      const layout = () => {
        const vw = innerWidth, vh = innerHeight;
        nodes.forEach((n) => {
          const [rw, rh] = n.ratio.split('/').map(Number);
          const wpx = n.w * REM;
          const hpx = wpx * (rh / rw);
          /* keep a 12px margin so a rotated, hover-scaled card can't clip */
          const maxLeft = Math.max(1, ((vw - wpx - 12) / vw) * 100);
          const maxTop = Math.max(1, ((vh - hpx - 12) / vh) * 100);
          const left = clamp(n.col * 25 + 3 + n.jx, 1, maxLeft);
          const top = clamp(n.row * 30 + 8 + n.jy, 1, maxTop);
          n.card.style.left = `${left.toFixed(2)}%`;
          n.card.style.top = `${top.toFixed(2)}%`;
          n.card.style.width = `${n.w}rem`;
          n.card.style.aspectRatio = n.ratio;
        });
      };

      layout();
      document.body.appendChild(field);

      let open = false;
      const setOpen = (next) => {
        if (next === open) return;
        open = next;
        if (open) layout();          // re-resolve against the current viewport
        field.classList.toggle('is-open', open);
        field.setAttribute('aria-hidden', String(!open));
        document.body.classList.toggle('is-field', open);
        trigger.setAttribute('aria-expanded', String(open));
        if (open) Sound.voice({ freq: 420, gain: 0.05, dur: 0.14, bright: 1800, drop: 1.9, noise: 0.2 });
        else Sound.voice({ freq: 620, gain: 0.04, dur: 0.11, bright: 1600, drop: 0.4, noise: 0.2 });
      };

      trigger.addEventListener('click', (e) => { e.preventDefault(); setOpen(!open); });
      scrim.addEventListener('click', () => setOpen(false));
      addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
      /* scrolling away should dismiss it rather than leave it floating */
      addEventListener('scroll', () => { if (open) setOpen(false); }, { passive: true });
    },

    /* soft cross-page fade */
    transitions() {
      if (REDUCED) return;
      document.addEventListener('click', (e) => {
        /* leave modified and middle clicks to the browser, or cmd-click stops
           opening links in a new tab */
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const a = hit(e, 'a[href]');
        if (!a) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin || a.target === '_blank') return;
        if (url.pathname === location.pathname && url.hash) return;
        if (!/\.html?$/.test(url.pathname) && url.pathname !== '/') return;
        e.preventDefault();
        document.body.classList.add('is-leaving');
        setTimeout(() => (location.href = a.href), 240);
      });
    },

    /* ripple + sound on every button, plus the two hero actions */
    buttons() {
      const HIT = 'a, button, .row, .tab, .project, .post, .person, .stack, .chip-badge, input[type="range"]';

      /* Press lifecycle: dip immediately on pointerdown, release on pointerup
         anywhere (so dragging off a control still resolves), spring back via
         CSS. The dip has to be synchronous with the sound or it feels laggy. */
      let pressed = null;

      const release = () => {
        if (!pressed) return;
        pressed.classList.remove('is-press');
        pressed = null;
      };

      document.addEventListener('pointerdown', (e) => {
        /* Backdrops opt out of both the spark and the press dip. A spark drawn
           under a translucent dark scrim is just a smudge, and dipping a
           full-viewport element exposes the page around all four edges. */
        const backdrop = hit(e, '[data-nopress]');
        if (!backdrop && e.pointerType !== 'touch') Shell.spark(e.clientX, e.clientY);

        const target = backdrop ? null : hit(e, HIT);
        if (!target) return;

        target.classList.add('pressable', 'is-press');
        pressed = target;

        const b = hit(e, '.btn');
        if (b) {
          Sound.press();
          const r = b.getBoundingClientRect();
          const ink = el('span', { class: 'btn__ink', style: `left:${e.clientX - r.left}px;top:${e.clientY - r.top}px` });
          b.appendChild(ink);
          setTimeout(() => ink.remove(), 640);
        } else {
          Sound.tap();
        }
      });

      addEventListener('pointerup', release);
      addEventListener('pointercancel', release);
      addEventListener('blur', release);

      /* keyboard activation deserves the same feedback */
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const target = document.activeElement;
        if (!target || !target.matches || !target.matches(HIT)) return;
        target.classList.add('pressable', 'is-press');
        pressed = target;
        Sound.tap();
      });
      document.addEventListener('keyup', release);

      /* a quiet tick when the pointer first enters something clickable */
      let lastHover = null;
      document.addEventListener('pointermove', (e) => {
        const over = hit(e, HIT);
        if (over === lastHover) return;
        lastHover = over;
        if (over) Sound.tick();
      }, { passive: true });

      document.addEventListener('click', async (e) => {
        const b = hit(e, '[data-action]');
        if (!b) return;
        const act = b.dataset.action;

        if (act === 'copy-email') {
          e.preventDefault();
          /* `copyEmail` if content.js names one, otherwise the address the page
             is written from — so the button keeps working in a copy of this
             site that has not been told about the distinction */
          const mail = S.person.copyEmail || S.person.email;
          try {
            await navigator.clipboard.writeText(mail);
          } catch {
            const ta = el('textarea', { style: 'position:fixed;opacity:0' });
            ta.value = mail;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
          const lbl = $('.btn__label', b);
          b.classList.add('is-done');
          setTimeout(() => { if (lbl) lbl.textContent = 'Copied'; }, 170);
          setTimeout(() => {
            b.classList.remove('is-done');
            if (lbl) lbl.textContent = S.hero.primary.label;
          }, 1900);
          Sound.chime();
          Shell.say(mail);
        }

        if (act === 'resume') {
          /* It opens HERE. Following the link would hand the file to the
             browser's own PDF plugin, which is a different application with a
             different toolbar, a different scrollbar and a grey void around the
             page — the exact moment a portfolio stops feeling like one thing.
             The link stays a real link, with a real href, so a middle-click or
             a right-click still gets the file and the page works with no JS. */
          if (Paper.ok()) {
            e.preventDefault();
            Paper.open();
          } else if (S.person.resumeUrl === '#') {
            e.preventDefault();
            Shell.say('Add your resume link in content.js');
          }
        }
      });
    },
  };

  /* ======================================================== 4. words ===== */

  const Words = {
    blocks: [],

    /* Wrap every word so it can't break apart, then every character inside it
       so the reveal boundary can cut mid-word — "ca|pital" — the way the
       reference does. Inline markup (em, mark, u, a, chip) is left intact. */
    split(root) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach((node) => {
        if (!node.nodeValue.trim()) return;
        /* these are glyphs and widgets, not prose — leave their text alone */
        if (node.parentElement.closest('.chip, .chip-badge, .stack')) return;
        const frag = document.createDocumentFragment();

        node.nodeValue.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
          const word = el('span', { class: 'w' });
          /* Intl.Segmenter keeps emoji and accents as single characters */
          for (const ch of chars(tok)) word.appendChild(el('span', { class: 'c' }, esc(ch)));
          frag.appendChild(word);
        });

        node.replaceWith(frag);
      });
    },

    /* groups is an array of blocks; each block is an array of authored lines.
       Line breaks are deliberate, not left to the browser, which is how the
       reference keeps its ragged right edge identical at every width. */
    mount(container, groups) {
      groups.forEach((lines) => {
        const b = el('section', { class: 'block' });
        (Array.isArray(lines) ? lines : [lines]).forEach((line) => {
          b.appendChild(el('span', { class: 'line' }, line));
        });
        container.appendChild(b);
        this.split(b);
        this.blocks.push({
          el: b,
          /* Badges and the logo stack are NOT reveal units — in the reference
             they sit at full colour while the text around them is still grey. */
          units: $$('.c, .chip, .scribble', b),
          lit: -1,
          band: [],
          /* spring that chases raw scroll progress — the boundary decelerates
             into place rather than tracking the scrollbar rigidly */
          sp: null,
        });
      });
    },

    tick(vh, dt) {
      let animating = false;

      this.blocks.forEach((b) => {
        const r = b.el.getBoundingClientRect();
        let target;

        if (r.bottom < -400) target = 1;
        else if (r.top > vh + 400) target = 0;
        else {
          /* a block starts lighting as it crosses the lower third and is fully
             lit a little past the middle of the viewport */
          const start = vh * 0.92;
          const end = vh * 0.42;
          const span = Math.max(1, start - end + r.height * 0.55);
          target = clamp((start - r.top) / span);
        }

        if (!b.sp) b.sp = Spring(target, 190, 26);
        b.sp.target = target;
        if (b.sp.step(dt)) animating = true;

        this.paint(b, easeOut(b.sp.v) * b.units.length);
      });

      return animating;
    },

    /* pos is fractional: the whole number is the lit prefix, the remainder
       positions a four-character gradient band just past the boundary */
    paint(b, pos) {
      const u = b.units;
      const n = Math.floor(pos);

      if (n !== b.lit) {
        const from = Math.max(0, Math.min(b.lit < 0 ? 0 : b.lit, n));
        const to = Math.min(u.length, Math.max(b.lit < 0 ? u.length : b.lit, n));
        for (let i = from; i < to; i++) u[i].classList.toggle('is-lit', i < n);
        b.lit = n;
      }

      /* the band is only ever a handful of nodes, so rebuilding it is cheap */
      for (const { el: node, cls } of b.band) node.classList.remove(cls);
      b.band.length = 0;

      const BAND = ['b4', 'b3', 'b2', 'b1'];
      for (let k = 0; k < BAND.length; k++) {
        const i = n + k;
        if (i >= u.length) break;
        const node = u[i];
        if (node.classList.contains('is-lit')) continue;
        const cls = BAND[k];
        node.classList.add(cls);
        b.band.push({ el: node, cls });
      }
    },
  };

  /* graceful character splitting: emoji and combining marks stay whole */
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;
  function chars(str) {
    if (seg) return [...seg.segment(str)].map((s) => s.segment);
    return [...str];
  }

  /* =================================================== 5. showcase ====== */

  /* Six preview types, all CSS/SVG — no image or video assets. Each one reacts
     to hover on its parent card; the card's entrance is scroll-driven. */
  const PREVIEW = {
    search: (item) =>
      `<div class="pv pv-search">` +
        `<div class="pv-search__sheet">` +
          `<span class="pv-search__label">${esc(item.line || item.title)}</span>` +
        `</div>` +
      `</div>`,

    words: (item) => {
      const word = esc(item.line || item.title);
      let out = '';
      /* a jittered lattice rather than pure random, so it never clumps */
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const x = col * 20 + 3 + Math.random() * 9;
          const y = row * 19 + 5 + Math.random() * 8;
          out +=
            `<i style="--x:${x.toFixed(1)}%;--y:${y.toFixed(1)}%;` +
            `--r:${(Math.random() * 30 - 15).toFixed(1)}deg;` +
            `--dx:${(Math.random() * 22 - 11).toFixed(1)}px;` +
            `--dy:${(Math.random() * 18 - 9).toFixed(1)}px;` +
            `--d:${(7 + Math.random() * 7).toFixed(1)}s;` +
            `--o:-${(Math.random() * 6).toFixed(1)}s">${word}</i>`;
        }
      }
      return `<div class="pv pv-words">${out}</div>`;
    },

    fan: (item) => {
      const colours = item.colours || ['#c96a3f', '#8a3b3b', '#3f5a86', '#2e4f4a', '#a8503f', '#25303d'];
      const n = colours.length;
      const mid = (n - 1) / 2;
      return `<div class="pv pv-fan"><div class="pv-fan__deck">` +
        colours.map((c, i) =>
          `<span class="pv-fan__card" style="--c:${c};--i:${(i - mid).toFixed(2)};` +
          `z-index:${n - Math.abs(i - mid)}"></span>`).join('') +
      `</div></div>`;
    },

    ring: (item) =>
      `<div class="pv pv-ring">` +
        `<div class="pv-ring__pod">` +
          `<svg class="pv-ring__dial" viewBox="0 0 36 36" aria-hidden="true">` +
            `<circle class="track" cx="18" cy="18" r="15.9"/>` +
            `<circle class="fill" cx="18" cy="18" r="15.9"/>` +
          `</svg>` +
          `<span class="pv-ring__copy"><span>${esc(item.line || 'Working')}</span>` +
          `<b>${esc(item.stat || '672/897 processed')}</b></span>` +
        `</div>` +
      `</div>`,

    bloom: (item) =>
      `<div class="pv pv-bloom">` +
        `<span class="pv-bloom__word">${esc(item.line || item.title)}</span>` +
      `</div>`,

    list: (item) => {
      const rows = item.rows || ['Reading the filing', 'Extracting the tables',
                                 'Cross-checking figures', 'Drafting the summary'];
      return `<div class="pv pv-list"><div class="pv-list__rows">` +
        rows.map((r, i) => `<span class="pv-list__row" style="--sd:${i * 90}ms">${esc(r)}</span>`).join('') +
      `</div></div>`;
    },
  };

  /* --------------------------------------------------------- 5b. thumbnails

     Drop-in artwork for the work cards, so changing one is a file operation
     rather than a code edit. A card looks for a file named after its own
     title in assets/img/thumbs/ — 'Today, around the world' becomes
     today-around-the-world — and tries THUMB_EXT in order until one loads.

     The image is painted OVER its CSS preview, not in place of it. That is
     the whole reason this is safe to leave switched on for every card: an
     empty folder, a typo in a filename or a half-uploaded file all end the
     same way, with the layer removing itself and the original preview showing
     through. Nothing to configure and nothing to break.

     `thumb: 'some/path.jpg'` on a showcase item overrides the convention.

     TWO WAYS TO SHOW IT. `thumbFit` picks between them:

       cover  (default) the artwork fills the panel edge to edge, cropped
       sheet            the artwork sits as a poster on a tinted field and
                        pushes toward you on hover, the same move the Eido
                        card's `search` preview makes

     Sheet mode reads its field colour out of the artwork itself, so it needs
     no colour setting and a replacement file re-tints the card on its own.  */

  const THUMB_DIR = 'assets/img/thumbs/';
  const THUMB_EXT = ['webp', 'avif', 'jpg', 'jpeg', 'png', 'gif', 'svg'];

  const slug = (s) => String(s).toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  /* One read of the artwork, answering two questions.

     TONE. Dark artwork under the floating nav would swallow the links. The nav
     reads `--tone` rather than pixels (see 6b), so the luminance of the top
     strip — the only band that ever sits under the nav — is measured once on
     load and declared.

     FIELD. Sheet mode needs a colour behind the poster. Picking it by hand
     would mean a second thing to update every time the file changes, and they
     would drift. So it comes from the artwork's own left and right edges: the
     parts furthest from any subject, which is what makes them read as
     background rather than content.

     That colour is then LIFTED away from the artwork before it is used, and
     the reason is the whole point of the mode. Used raw it is by definition
     the colour the artwork already ends in, so the poster dissolves into the
     field and there is no sheet to see — which is what the first pass at this
     looked like. Eido's version works because a near-white sheet sits on a
     saturated blue. So the sample is moved in lightness, away from wherever
     the artwork sits, and its saturation is floored on the way: a lift that
     only adds white reads as fog rather than as a field. */

  /* The lift itself. LIFT is in HSL lightness, and the direction is decided by
     which side of the middle the artwork is on, so light artwork gets a darker
     field rather than a blown-out one. SAT_FLOOR keeps a tinted sample from
     lifting into a flat neutral.

     The floor does NOT apply below GREY, and that guard is load-bearing rather
     than tidy. Hue is undefined at zero saturation and this maths reports it
     as 0, which is red — so flooring an achromatic sample invents a colour
     that is nowhere in the artwork. White edges came out pink. A greyscale
     thumbnail should get a grey field, so below GREY the sample is left as it
     is and only its lightness moves. */
  const LIFT = 0.20;
  const SAT_FLOOR = 0.30;
  const GREY = 0.06;

  function liftColour(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let l = (max + min) / 2;
    let s = 0;
    let h = 0;
    if (max !== min) {
      const dd = max - min;
      s = l > 0.5 ? dd / (2 - max - min) : dd / (max + min);
      if (max === r) h = (g - b) / dd + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / dd + 2;
      else h = (r - g) / dd + 4;
      h /= 6;
    }
    l = Math.min(1, Math.max(0, l < 0.5 ? l + LIFT : l - LIFT));
    if (s >= GREY) s = Math.max(s, SAT_FLOOR);

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const chan = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [chan(h + 1 / 3), chan(h), chan(h - 1 / 3)]
      .map((v) => Math.round(v * 255));
  }

  /* The files are same-origin, so the canvas stays untainted. If that ever
     stops being true the throw is caught, the nav keeps its current ink and
     the field falls back to the colour in the stylesheet. */
  function readArt(img) {
    if (!img.naturalWidth || !img.naturalHeight) return null;
    try {
      const c = document.createElement('canvas');
      const w = (c.width = 24);
      const h = (c.height = 8);
      const ctx = c.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, img.naturalWidth,
                    Math.max(1, Math.round(img.naturalHeight * 0.22)), 0, 0, w, h);
      const d = ctx.getImageData(0, 0, w, h).data;
      let sum = 0;
      for (let i = 0; i < d.length; i += 4) {
        sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      }
      /* the two edge columns of that strip, averaged */
      const edge = [0, 0, 0];
      for (let row = 0; row < h; row++) {
        for (const col of [0, w - 1]) {
          const p = (row * w + col) * 4;
          edge[0] += d[p]; edge[1] += d[p + 1]; edge[2] += d[p + 2];
        }
      }
      const n = h * 2;
      const lift = liftColour(edge[0] / n, edge[1] / n, edge[2] / n);
      const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      return {
        /* two tones, because two different surfaces can end up under the nav:
           the artwork in cover mode, the field in sheet mode */
        dark: sum / (d.length / 4) < 128,
        fieldDark: lum(lift) < 128,
        field: `rgb(${lift[0]}, ${lift[1]}, ${lift[2]})`,
      };
    } catch (err) { return null; }
  }

  /* A thumb path ending in a video extension mounts a <video> instead of an
     <img>. It is muted, looped, inline and autoplaying, so it behaves like a
     moving still rather than a player — no controls, no sound, nothing to
     click, and the card stays a plain link.

     `thumbPoster` is the still that shows before the first frame decodes and
     is also what the tone/field sampling reads, since a <video> cannot be
     drawn to a canvas until it has data. Without a poster the card simply
     skips the sampling and keeps its default field colour.

     WHY THE POSTER DRIVES THE REVEAL. The layer used to wait for the video's
     `loadeddata`, which on a cold load is hundreds of milliseconds after the
     page paints — and for that whole stretch the CSS preview underneath was
     visible, so the card flashed the `search` panel's blue and then cut to the
     video. Video data is the wrong thing to wait for. The poster is a 50KB
     still that arrives in a fraction of the time, the <video> paints it
     natively the moment it has it, and the swap from poster to first frame is
     invisible because they are the same image. So the reveal now fires on
     whichever arrives first, and the preview beneath is never seen.       */
  const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

  function mountThumbVideo(item, media, src) {
    const sheet = item.thumbFit === 'sheet';

    const vid = el('video', {
      class: `wcard__thumb wcard__thumb--${sheet ? 'sheet' : 'cover'}`,
      autoplay: '', loop: '', muted: '', playsinline: '',
      /* 'auto', not 'metadata': the file is a few hundred KB and it is the
         only thing on the card. Fetching just the header saved nothing and
         pushed the first frame further out. */
      preload: 'auto',
      'aria-hidden': 'true',
      tabindex: '-1',
    });
    /* the attribute alone is not enough in every engine — autoplay is only
       allowed once the property is set as well */
    vid.muted = true;
    vid.defaultMuted = true;
    if (item.thumbPoster) vid.poster = item.thumbPoster;
    vid.src = src;

    const host = sheet ? el('div', { class: 'wcard__poster' }, '') : vid;
    if (sheet) host.appendChild(vid);

    vid.addEventListener('error', () => { host.remove(); });

    /* Idempotent: several things race to call this and the first one wins.
       Three jobs, and the second is the one the blue flash came down to.

         1. fade the layer in
         2. CUT the CSS preview underneath. Without this the reveal is a
            crossfade and the preview shows through the artwork for its whole
            620ms — on this card, saturated blue through a near-black video.
         3. skip the fade entirely when the poster was already cached, since
            the artwork is available before the card's first paint and there
            is nothing to animate from.                                     */
    let shown = false;
    const reveal = (instant) => {
      if (shown) return;
      shown = true;
      if (instant) media.classList.add('is-instant');
      host.classList.add('is-on');
      media.classList.add('is-covered');
      if (instant) {
        /* two frames: one for the class change to be picked up with the
           transition suppressed, one to hand the transition back for hover
           and anything else that animates these nodes later */
        requestAnimationFrame(() => requestAnimationFrame(
          () => media.classList.remove('is-instant')));
      }
    };
    vid.addEventListener('loadeddata', () => reveal());

    /* tone + field are sampled off the poster, in a detached image — and that
       same image is what tells us the poster is now painted, so it doubles as
       the reveal trigger */
    if (item.thumbPoster) {
      const probe = new Image();
      probe.crossOrigin = 'anonymous';
      const settle = (instant) => {
        const art = readArt(probe);
        if (art) {
          if (sheet) host.style.setProperty('--field', art.field);
          if (sheet ? art.fieldDark : art.dark) host.style.setProperty('--tone', 'dark');
        }
        /* after the tone is set, so the card never fades in on the wrong
           field colour and then corrects itself */
        reveal(instant);
      };
      probe.addEventListener('load', () => settle(false));
      /* a poster that fails to decode must not strand the layer at opacity 0 */
      probe.addEventListener('error', () => reveal(false));
      probe.src = item.thumbPoster;
      /* Already in cache — the common case, because index.html preloads this
         file, and exactly the case the reload flash came from. A cached image
         can finish decoding before the listener above is called, so the state
         is read directly rather than waited for, and the reveal is instant:
         there is no earlier frame for the card to fade in from. */
      if (probe.complete && probe.naturalWidth) settle(true);
    }

    /* respect reduced-motion: hold the first frame instead of looping */
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      try {
        if (still.matches) { vid.pause(); return; }
        /* play() is a promise in browsers and a no-op in jsdom, so neither the
           rejection nor the missing return value can be assumed away */
        const p = vid.play();
        if (p && p.catch) p.catch(() => {});
      } catch (err) { /* autoplay refused; the poster still stands in */ }
    };
    vid.addEventListener('loadeddata', sync);
    if (still.addEventListener) still.addEventListener('change', sync);

    media.appendChild(host);
  }

  function mountThumb(item, media) {
    const sources = item.thumb
      ? [item.thumb]
      : THUMB_EXT.map((ext) => `${THUMB_DIR}${slug(item.title)}.${ext}`);
    if (VIDEO_EXT.test(sources[0])) return mountThumbVideo(item, media, sources[0]);
    const sheet = item.thumbFit === 'sheet';
    let i = 0;

    /* alt is empty and the node is hidden from the tree on purpose: the card
       is a link that already carries its own label, so the artwork is
       decoration and a second name here would only be read out twice. */
    const img = el('img', {
      class: `wcard__thumb wcard__thumb--${sheet ? 'sheet' : 'cover'}`,
      alt: '',
      'aria-hidden': 'true',
      decoding: 'async',
      draggable: 'false',
    });

    /* `host` is whatever has to fade in, carry the tone and disappear when the
       candidates run out. In cover mode that is the image; in sheet mode it is
       the field, because a coloured panel left behind after a failed load
       would hide the CSS preview it is supposed to fall back to. */
    const host = sheet
      ? el('div', { class: 'wcard__poster' }, '')
      : img;
    if (sheet) host.appendChild(img);

    img.addEventListener('error', () => {
      if (++i < sources.length) img.src = sources[i];
      else host.remove();
    });
    img.addEventListener('load', () => {
      const art = readArt(img);
      if (art) {
        if (sheet) host.style.setProperty('--field', art.field);
        /* the nav samples whatever is actually painted under it, which in
           sheet mode is the field and not the artwork */
        if (sheet ? art.fieldDark : art.dark) host.style.setProperty('--tone', 'dark');
      }
      host.classList.add('is-on');
      /* and the preview underneath is cut, so the fade-in is not a crossfade
         with it — see the `is-covered` rule in the stylesheet. Same contract
         as the video path, and only ever after a file has actually loaded, so
         the fallback is untouched. */
      media.classList.add('is-covered');
    });
    img.src = sources[0];
    media.appendChild(host);
  }

  const Showcase = {
    cards: [],

    init(mount) {
      const data = S.showcase;
      if (!data || !data.items || !data.items.length) return;

      const section = el('section', { class: 'showcase', id: 'showcase' });
      const grid = el('div', { class: 'showcase__grid' });

      data.items.forEach((item) => {
        const card = el('a', {
          class: 'wcard',
          href: item.href || '#',
          'aria-label': `${item.title} — ${item.meta || ''}`,
        });
        const media = el('div', { class: 'wcard__media' },
          (PREVIEW[item.preview] || PREVIEW.bloom)(item));
        mountThumb(item, media);
        card.appendChild(media);
        card.appendChild(el('div', { class: 'wcard__meta' },
          `<span class="wcard__title">${esc(item.title)}</span>` +
          `<span class="wcard__tags">${esc(item.meta || '')}</span>`));
        grid.appendChild(card);
        this.cards.push({ el: card, sp: null, last: -1 });
      });

      section.appendChild(grid);
      mount.appendChild(section);
      this.drawer(data.items);
    },

    /* ---------------------------------------------------------- the drawer
       Slides up from the bottom over the dimmed page. One panel, re-filled per
       project, so there's a single set of listeners no matter how many cards. */
    drawer(items) {
      const wrap = el('div', { class: 'drawer' });
      const scrim = el('button', {
        class: 'drawer__scrim', type: 'button', 'aria-label': 'Close project',
        'data-nopress': '',
      });
      const panel = el('div', {
        class: 'drawer__panel', role: 'dialog', 'aria-modal': 'true',
        'aria-labelledby': 'drawer-title',
      });

      const bar = el('div', { class: 'drawer__bar' });
      const title = el('h2', { class: 'drawer__title', id: 'drawer-title' });
      const sub = el('span', { class: 'drawer__sub' });
      const close = el('button', {
        class: 'drawer__close', type: 'button', 'aria-label': 'Close project',
      }, '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 2l8 8M10 2l-8 8"/></svg>');
      bar.append(title, sub, close);

      const scroll = el('div', { class: 'drawer__scroll' });
      panel.append(bar, scroll);
      wrap.append(scrim, panel);
      document.body.appendChild(wrap);

      let open = false;
      let restoreTo = null;
      let closeTimer = null;

      /* --- grow: the panel docks to the top as you scroll its content ------
         Driven by a spring off the scroll container's own scrollTop, so it
         eases into place rather than tracking the scroll one-to-one. */
      /* tuned: 233ms to 90% docked, and just over-damped so the panel can
         never overshoot past the top of the screen */
      const growSp = Spring(0, 340, 38);
      this.grow = growSp;
      const GROW_OVER = 150;          // px of scroll to fully dock

      /* ONE scroll listener on this container. There were three: the dock's grow
         spring, the rail's ink, and the section spy — each reading layout
         independently, on every event. The spy is gone (an observer replaces it),
         and the other two are coalesced here and throttled to one run per frame,
         so a burst of scroll events cannot queue up more work than the display
         can show. */
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          growSp.target = clamp(scroll.scrollTop / GROW_OVER);
          if (RailInk.current) RailInk.current.tick();
          wakeLoop();
        });
      };
      scroll.addEventListener('scroll', onScroll, { passive: true });
      /* cached measurements are only invalid when the layout changes */
      addEventListener('resize', () => {
        if (RailInk.current) RailInk.current.measure();
        if (SectionNav.rebuild) SectionNav.rebuild();
      }, { passive: true });

      this.growTick = (dt) => {
        if (!open) return false;
        const moving = growSp.step(dt);
        wrap.style.setProperty('--grow', growSp.v.toFixed(3));
        return moving;
      };

      /* --- the full case study, rendered into the drawer ------------------ */
      const study = (data, item) => {
        /* If the case study opens on a dark section, the header above it joins
           the band — otherwise the band starts halfway down the first screen,
           with a hard edge across the title. */
        const darkTop = data.sections[0] && data.sections[0].tone === 'dark';
        const grid = el('div', {
          class: `drawer__study${darkTop ? ' drawer__study--darktop' : ''}` });

        const rail = el('nav', { class: 'drawer__rail', 'aria-label': 'Sections' });
        const links = [];
        data.sections.forEach((sec) => {
          /* behaviour lives in SectionNav, bound once the sections exist */
          const a = el('a', { class: 'rail__link', href: `#${sec.id}` },
            esc(sec.nav || sec.eyebrow || ''));
          rail.appendChild(a);
          links.push(a);
        });

        const col = el('div');
        col.appendChild(el('header', { class: `proj__head${darkTop ? ' proj__head--dark' : ''}` },
          `<span class="proj__eyebrow">${esc(data.eyebrow || '')}</span>` +
          `<h3 class="proj__title">${esc(data.title || '')}</h3>`));

        const secs = [];
        data.sections.forEach((sec) => {
          const s = el('section', {
            class: `sec${sec.tone === 'dark' ? ' sec--dark' : ''}`, id: sec.id });
          s.innerHTML =
            `<span class="sec__eyebrow">${esc(sec.eyebrow || '')}</span>` +
            /* an optional opener that sits ABOVE the section heading, which is
               where the original portfolio puts "Going back to how it started…" */
            (sec.preamble
              ? `<div class="sec__pre is-in">` +
                  `<h5 class="sec__pre__t">${esc(sec.preamble.title)}</h5>` +
                  `<p class="sec__pre__b">${sec.preamble.body}</p>` +
                `</div>`
              : '') +
            /* The scroll anchor. Zero-height, sitting immediately before the
               HEADING rather than at the top of the section — which is what makes
               every section land identically. Scrolling to the section box put the
               heading at a different height depending on what preceded it inside
               (Research has a preamble above its heading; the others do not), which
               is why one section arrived near the top and another mid-screen.
               Its scroll-margin-top carries the landing allowance, so the layout
               decides the final position and no JS offset is involved. */
            `<i class="sec__anchor" aria-hidden="true"></i>` +
            `<h4 class="sec__heading is-in">${esc(sec.heading || '')}</h4>` +
            /* body copy is authored, and content.js documents <b>/<em>/<a> as
               allowed inside any string — escaping it printed the tags */
            `<div class="sec__body is-in">${(sec.body || []).map((t) => `<p>${t}</p>`).join('')}</div>` +
            (sec.blocks || []).map((b) => (BLOCK[b.type] || (() => ''))(b)).join('');
          $$('.blk', s).forEach((n) => n.classList.add('is-in'));
          rhythm(s);
          col.appendChild(s);
          secs.push(s);
        });

        /* the pager belongs in the text column, not under the sticky rail */
        const pg = pager(item);
        if (pg) col.appendChild(pg);

        grid.append(rail, col);

        /* No scroll handler: SectionNav observes a reading band instead, so
           nothing measures the DOM as the reader scrolls. */
        SectionNav.bind(scroll, secs, links);

        return grid;
      };

      /* --- the highlights carousel ----------------------------------------
         Bound after the study renders. Autoplay is the default because the
         slides are a showcase, but it stops the moment the visitor touches a dot
         or hovers — nothing is more annoying than a carousel that moves while
         you are reading it. */
      const carousels = (root) => {
        $$('[data-carousel]', root).forEach((wrap) => {
          const track = $('.hltrack', wrap);
          const dots = $$('.hl__dot', wrap);
          const n = $$('.hl', wrap).length;
          if (!n) return;
          let at = 0, timer = null, stopped = false;

          const show = (i) => {
            at = (i + n) % n;
            track.style.setProperty('--at', String(at));
            dots.forEach((d, k) => {
              d.classList.toggle('is-on', k === at);
              d.setAttribute('aria-selected', k === at ? 'true' : 'false');
            });
          };
          const stop = () => { stopped = true; clearInterval(timer); timer = null; };
          const play = () => {
            if (stopped || timer || REDUCED || n < 2) return;
            timer = setInterval(() => show(at + 1), b_delay);
          };

          dots.forEach((d, k) => d.addEventListener('click', () => {
            stop(); show(k); Sound.tap();
          }));
          wrap.addEventListener('pointerenter', () => { clearInterval(timer); timer = null; });
          wrap.addEventListener('pointerleave', play);

          /* keyboard, once a dot has focus */
          wrap.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            e.preventDefault(); stop();
            show(at + (e.key === 'ArrowRight' ? 1 : -1));
            dots[at].focus();
          });

          /* a horizontal drag flicks between slides */
          let x0 = null;
          wrap.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
          wrap.addEventListener('pointerup', (e) => {
            if (x0 === null) return;
            const dx = e.clientX - x0; x0 = null;
            if (Math.abs(dx) < 40) return;
            stop(); show(at + (dx < 0 ? 1 : -1));
          });

          show(0);
          play();
          wrap.__hl = { show, get at() { return at; }, get n() { return n; },
                        get playing() { return !!timer; }, stop };
        });
      };
      const b_delay = 3000;   /* 3s per slide, as asked */

      /* --- prev / next project ---------------------------------------------
         Sits at the very end of a case study. It cycles rather than clamping,
         so the last project still offers somewhere to go instead of dead-ending
         the way the drawer used to. Clicking refills the open drawer rather
         than closing and reopening it, which keeps the dock and scroll position
         machinery untouched. */
      const pager = (item) => {
        const i = items.indexOf(item);
        if (i < 0 || items.length < 2) return null;
        const prev = items[(i - 1 + items.length) % items.length];
        const next = items[(i + 1) % items.length];

        const nav = el('nav', { class: 'drawer__pager', 'aria-label': 'Projects' });
        const side = (dir, target) => {
          const b = el('button', {
            type: 'button',
            class: `pager__side pager__side--${dir}`,
            'aria-label': `${dir === 'prev' ? 'Previous' : 'Next'} project: ${target.title}`,
          });
          b.appendChild(el('span', { class: 'pager__dir' },
            dir === 'prev' ? 'Back' : 'Next project'));
          b.appendChild(el('span', { class: 'pager__name' }, esc(target.title)));
          if (target.meta) b.appendChild(el('span', { class: 'pager__meta' }, esc(target.meta)));
          b.addEventListener('click', () => {
            fill(target);
            scroll.scrollTop = 0;
            Sound.tap();
          });
          return b;
        };
        nav.append(side('prev', prev), side('next', next));
        return nav;
      };

      const fill = (item) => {
        title.textContent = item.title;
        /* innerHTML below destroys any notes/stickers placed in here, so the
           ink drawn on this surface goes with them */
        Ink.clearSurface(scroll);
        scroll.innerHTML = '';
        /* the lanes in there are gone, so stop stepping them every frame */
        Marquee.prune();
        /* the observed sections are gone with the innerHTML */
        SectionNav.stop();
        RailInk.current = null;
        scroll.scrollTop = 0;
        growSp.v = 0; growSp.vel = 0; growSp.target = 0;
        wrap.style.setProperty('--grow', '0');

        /* a card can carry a whole case study instead of short detail rows */
        const data = item.study === true ? S.project : item.study;
        if (data && data.sections) {
          sub.textContent = data.eyebrow || item.meta || '';
          scroll.appendChild(study(data, item));
          carousels(scroll);
          videos(scroll);
          compares(scroll);
          Lightbox.bind(scroll);
          Reveal.bind(scroll, scroll);
          RailInk.bind($('.drawer__rail', scroll), scroll);
          /* after the append, so anything that measures itself can */
          Marquee.bind(scroll);
          /* The dock opens with the study, the same as on a project page. A
             study marked `reading: true` opts out and starts collapsed to its
             tab. applyScope is called rather than setMode so the decision stays
             in one place, and so the dock arrives with the study instead of
             waiting for the visitor's first scroll. */
          Rack.reading = !!data.reading;
          Rack.applyScope();
          return;
        }

        sub.textContent = item.detail?.subtitle || item.meta || '';
        let step = 0;
        const stagger = () => `--sd:${60 + step++ * 70}ms`;

        (item.detail?.sections || [
          { label: 'Overview', body: [`A writeup for ${item.title} goes here. Add a "detail" block to this item in content.js.`] },
        ]).forEach((sec) => {
          const row = el('div', { class: 'drawer__row', style: stagger() });
          row.appendChild(el('span', { class: 'drawer__label' }, esc(sec.label)));
          row.appendChild(el('div', { class: 'drawer__body' },
            (Array.isArray(sec.body) ? sec.body : [sec.body]).map((p) => `<p>${p}</p>`).join('')));
          scroll.appendChild(row);

          /* a preview panel can sit after any section */
          if (sec.preview) {
            scroll.appendChild(el('figure', { class: 'drawer__media', style: stagger() },
              (PREVIEW[sec.preview] || PREVIEW.bloom)(sec)));
          }
        });

        /* short-detail cards get the same pager */
        const pg = pager(item);
        if (pg) scroll.appendChild(pg);
      };

      const setOpen = (next, item) => {
        if (next === open) return;
        clearTimeout(closeTimer);
        open = next;

        if (open) {
          fill(item);
          /* annotations land in the drawer while it's the project on screen */
          Canvas.prevSurface = Canvas.surface;
          scroll.style.position = 'relative';
          Canvas.setSurface(scroll);
          Canvas.placement();
          /* Wait for the panel to finish its slide before the dock arrives.
             Showing it during the transition read as the toolbar sliding in
             from behind the sheet. */
          clearTimeout(this._rackIn);
          this._rackIn = setTimeout(() => Rack.applyScope(), 470);
          restoreTo = document.activeElement;
          wrap.classList.remove('is-closing');
          wrap.classList.add('is-open');
          /* lock the page behind without losing its scroll position */
          document.documentElement.style.overflow = 'hidden';
          close.focus({ preventScroll: true });
          Sound.voice({ freq: 260, gain: 0.05, dur: 0.16, bright: 1500, drop: 2.1, noise: 0.22 });
        } else {
          wrap.classList.add('is-closing');
          wrap.classList.remove('is-open');
          Rack.reading = false;
          Canvas.setSurface(Canvas.prevSurface || null);
          /* and it leaves first, so it never hangs over a closing panel */
          clearTimeout(this._rackIn);
          Rack.applyScope();
          document.documentElement.style.overflow = '';
          Sound.voice({ freq: 520, gain: 0.038, dur: 0.11, bright: 1700, drop: 0.4, noise: 0.22 });
          if (restoreTo && restoreTo.focus) restoreTo.focus({ preventScroll: true });
          closeTimer = setTimeout(() => wrap.classList.remove('is-closing'), 380);
        }
      };

      /* cards keep their href so they still behave like links, but a plain
         click opens the drawer instead of navigating */
      this.cards.forEach((c, i) => {
        c.el.addEventListener('click', (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          setOpen(true, items[i]);
        });
      });

      close.addEventListener('click', () => setOpen(false));
      scrim.addEventListener('click', () => setOpen(false));

      addEventListener('keydown', (e) => {
        if (!open) return;
        /* The lightbox sits above this drawer. Both listen for Escape on the
           window, and this one was registered first, so without this guard one
           Escape closed the lightbox AND the drawer underneath it. The topmost
           layer gets the key. */
        if (document.body.classList.contains('is-lbox')) return;
        if (e.key === 'Escape') { setOpen(false); return; }
        /* keep Tab inside the panel while it's modal */
        if (e.key !== 'Tab') return;
        const focusable = $$('a[href], button, [tabindex]:not([tabindex="-1"])', panel)
          .filter((n) => n.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });

      this.setDrawerOpen = setOpen;
    },

    /* Cards grow from small to full size as they cross the viewport. Springs,
       so the value decelerates into place instead of tracking scroll rigidly. */
    tick(vh, dt) {
      if (!this.cards.length || REDUCED) return false;
      let moving = false;

      this.cards.forEach((c) => {
        const r = c.el.getBoundingClientRect();
        let target;
        if (r.top > vh) target = 0;
        else if (r.bottom < 0) target = 1;
        else {
          /* fully grown by the time the card's top reaches 55% of the viewport */
          const start = vh * 0.98;
          const end = vh * 0.55;
          target = clamp((start - r.top) / Math.max(1, start - end));
        }

        if (!c.sp) c.sp = Spring(target, 170, 25);
        c.sp.target = target;
        if (c.sp.step(dt)) moving = true;

        const v = Math.round(easeOut(c.sp.v) * 100) / 100;
        if (v !== c.last) { c.last = v; c.el.style.setProperty('--in', v.toFixed(2)); }
      });

      return moving;
    },
  };

  /* ===================================================== 5b. project ==== */

  /* The white Figma frame every artifact sits in: 20px radius, hairline border,
     soft shadow, generous padding. `annos` places small design artifacts around
     it — a measurement label, a sticky note, a comment. They are decoration, so
     they are aria-hidden and never take pointer events away from the frame.

     data-zoom marks it as openable in the lightbox. */
  /* Intrinsic dimensions, so the browser reserves the right box BEFORE the bytes
     arrive. Without these a lazy image contributes no height, every section below it
     sits at the wrong offset, and a rail link clicked before the images load scrolls
     to a position that no longer exists by the time they do. `height: auto` in CSS
     keeps them from fixing the rendered size — the attributes only supply the ratio. */
  const BOX = (b) => (b.w && b.h ? ` width="${b.w}" height="${b.h}"` : '');

  const FRAME = (b, inner) => {
    const annos = (b.annos || []).map((a) =>
      `<span class="anno anno--${a.kind || 'note'}" style="${a.at || ''}"` +
      ` aria-hidden="true">${esc(a.text)}</span>`).join('');

    /* The artwork's rendered width, so the caption can centre on the IMAGE rather
       than on the column. The frame hugs its artwork and sits at the column's left
       edge, so a caption centred in the column drifts right of the picture and stops
       reading as part of it.

       Both caps have to be considered: a portrait image capped by height renders
       narrower than its `max`, and using `max` alone would centre the caption on a
       width the picture never had. */
    const fw = (() => {
      const mw = parseFloat(b.max);
      if (!Number.isFinite(mw)) return null;
      const mh = parseFloat(b.maxh);
      if (Number.isFinite(mh) && b.w && b.h) return Math.min(mw, mh * (b.w / b.h));
      return mw;
    })();

    return `<figure class="blk blk-frame"${fw ? ` style="--fw:${Math.round(fw)}px"` : ''}>` +
      `<div class="fframe" data-zoom tabindex="0" role="button"` +
      ` aria-label="${esc(b.caption || 'Open larger')}">` +
        `<div class="fframe__in">${inner}</div>` +
        annos +
      `</div>` +
      (b.caption
        ? `<figcaption class="fframe__cap${b.pill ? ' fframe__cap--pill' : ''}">` +
          /* the pill is a span so the figcaption can be a full-width box that
             centres it — the same two-level shape the standalone chip uses */
          (b.pill ? `<span>${esc(b.caption)}</span>` : esc(b.caption)) +
          `</figcaption>`
        : '') +
    `</figure>`;
  };

  /* --- vertical rhythm ----------------------------------------------------
     A block carries the gap that belongs ABOVE it. That is right until two
     headings land back to back: the first one then has a major gap above it
     and another major gap below it, so it floats between two voids with
     nothing attached to it — it reads as a caption for the whitespace rather
     than as a title for what follows.

     The gap between a heading and the heading it introduces has to be small,
     so the pair reads as one unit. CSS cannot ask "does the next block start
     with a heading", and :has() is the wrong tool here because the test needs
     to run in the jsdom harness too. So the renderer labels each block and the
     stylesheet keys off the label. */
  const rhythm = (root) => {
    const HEADS = 'h2, h3, h4, h5, h6';
    /* querySelectorAll never matches the root itself, and both callers hand this
       a single section rather than a container of them — so searching for
       descendants found nothing and no block was ever labelled. */
    const secs = root.matches && root.matches('.sec') ? [root] : $$('.sec', root);
    secs.forEach((s) => {
      $$(':scope > .blk', s).forEach((b, i) => {
        const kids = [...b.children];
        const lead = kids[0] && kids[0].matches(HEADS);
        if (lead) b.classList.add('blk--leads');
        /* a block that is nothing but a heading has no body to anchor it */
        if (lead && kids.length === 1) b.classList.add('blk--headonly');
        if (i === 0) b.classList.add('blk--first');
      });
    });
  };

  /* Gradient fills need an id, and ids are document-global — two cards sharing
     one would both take the first card's colour. Monotonic rather than derived
     from the index, because the drawer re-renders the study on every open. */
  let sparkId = 0;

  const BLOCK = {
    /* --- outcome metrics -----------------------------------------------------
       Four cards, each one number with the sentence that explains it and a
       sparkline showing the shape of the change.

       The sparkline is generated from `trend`, a plain list of numbers in
       content.js — not a picture. So the line always matches the figure above it,
       and editing the data edits the drawing. A rising metric rises; the one that
       went DOWN because less effort is better draws downward, which a stock
       "up and to the right" graphic would have got wrong. */
    metrics: (b) => {
      const ICON = {
        down: '<path d="M8 2v8m0 0 3-3m-3 3L5 7M2.5 12.5h11"/>',
        up:   '<path d="M3 11.5c3.5 0 3-8 6.5-8M9.5 3.5h3v3"/>',
        star: '<path d="M8 2.2l1.8 3.7 4 .6-2.9 2.9.7 4L8 11.5l-3.6 1.9.7-4L2.2 6.5l4-.6z"/>',
      };
      /* --- the chart ---------------------------------------------------------
         A bare stroke on white does not read as a graph; it reads as a squiggle.
         What makes it legible as a measurement is the frame around it — a
         baseline for the line to sit ON, two rules to give the vertical
         distance a scale, and a filled area so the space under the curve has
         weight. The stroke alone was the only part being drawn.

         The plot is inset from the gridlines so the curve never lies flat along
         one, which would read as a rendering fault rather than as a maximum. */
      const spark = (vals) => {
        const W = 120, H = 46;
        const TOP = 3, BOT = H - 3;      /* the ruled area */
        const IN = 4;                    /* the curve's own inset inside it */
        const lo = Math.min(...vals), hi = Math.max(...vals);
        const span = hi - lo || 1;
        const y0 = TOP + IN, y1 = BOT - IN;
        const pts = vals.map((v, i) => [
          (i * W) / (vals.length - 1),
          y1 - ((v - lo) / span) * (y1 - y0),
        ]);
        const xy = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

        /* quadratic through the midpoints, the same smoothing the ink uses */
        let d = `M${xy(pts[0])}`;
        for (let i = 1; i < pts.length - 1; i++) {
          d += ` Q${xy(pts[i])} ${xy([(pts[i][0] + pts[i + 1][0]) / 2,
            (pts[i][1] + pts[i + 1][1]) / 2])}`;
        }
        const last = pts[pts.length - 1];
        d += ` L${xy(last)}`;

        const id = `mspark${++sparkId}`;
        const rule = (y, cls) =>
          `<line class="${cls}" x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;

        /* pathLength="1" is what lets the line draw itself in from pure CSS. It
           re-scales dasharray/dashoffset so the whole path measures 1, so the
           stylesheet can say "hidden" as `stroke-dashoffset: 1` without anyone
           calling getTotalLength() — no measurement, no layout read, and the
           timing survives the path being re-generated from different data. */
        /* uniform scaling: `preserveAspectRatio="none"` would let the chart keep
           a fixed height at any card width, but it turns the end marker into an
           ellipse, which is worse than a slightly taller chart */
        return `<svg class="mcard__spark" viewBox="0 0 ${W} ${H}" fill="none"` +
          ` aria-hidden="true">` +
          `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
            `<stop offset="0" stop-color="var(--c)" stop-opacity="0.26"/>` +
            `<stop offset="1" stop-color="var(--c)" stop-opacity="0"/>` +
          `</linearGradient></defs>` +
          `<g class="spark__grid">${rule(TOP, 'spark__rule')}` +
            `${rule((TOP + BOT) / 2, 'spark__rule')}${rule(BOT, 'spark__base')}</g>` +
          `<path class="spark__area" d="${d} L${W} ${BOT} L0 ${BOT} Z" fill="url(#${id})"/>` +
          `<path class="spark__line" d="${d}" pathLength="1" stroke="var(--c)"` +
            ` stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<circle class="spark__halo" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}"` +
            ` r="4.2" fill="var(--c)" opacity="0.14"/>` +
          `<circle class="spark__dot" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}"` +
            ` r="2.4" fill="var(--c)"/></svg>`;
      };
      const cards = (b.items || []).map((m) =>
        `<div class="mcard" style="--c:${m.c};--wash:${m.wash}">` +
          `<span class="mcard__ico" aria-hidden="true">` +
            `<svg viewBox="0 0 16 16" fill="none" stroke="var(--c)" stroke-width="1.5"` +
            ` stroke-linecap="round" stroke-linejoin="round">${ICON[m.icon] || ICON.up}</svg>` +
          `</span>` +
          `<strong class="mcard__v">${esc(m.value)}</strong>` +
          `<b class="mcard__l">${m.label}</b>` +
          `<p class="mcard__b">${m.body}</p>` +
          (m.trend ? spark(m.trend) : '') +
        `</div>`).join('');
      return `<div class="blk blk-metrics">` +
        `<div class="mgrid">${cards}</div>` +
        (b.note ? `<p class="mcard__note">${esc(b.note)}</p>` : '') +
      `</div>`;
    },

    /* A standalone monospace chip — the aside the original portfolio sets between
       two artifacts to say what happened between them. Visually the same pill the
       frame captions use, but a block in its own right rather than a caption, so it
       belongs to neither image above nor below. */
    chip: (b) => `<p class="blk blk-chip"><span>${b.text}</span></p>`,

    /* A screen recording in the same frame as the stills.
       Deliberately a <video>, not a GIF: a GIF is capped at 256 colours and has no
       interframe compression, so this clip would have been tens of megabytes and
       visibly banded. As H.264 it is 2MB at 1080p and looks like the source.

       muted + playsinline are what make autoplay permissible at all — a browser
       will refuse to start anything with sound. `loop` because it is a short flow,
       and no controls because it behaves as an illustration. Video.play() is
       driven by the observer in `videos()` below, so nothing downloads or plays
       until it is on screen. */
    video: (b) => FRAME(b,
      `<video class="shotvid" muted loop playsinline preload="none"` + BOX(b) +
      ` poster="${esc(b.poster || '')}"` +
      ` aria-label="${esc(b.alt || '')}"` +
      (b.max ? ` style="max-width:${b.max}"` : '') + `>` +
        `<source src="${esc(b.src)}" type="video/mp4">` +
      `</video>`),

    /* A supplied image in the premium frame. Width is capped by the caller so a
       1x export is never stretched past its pixels. */
    /* `max` caps the width, `maxh` the height. A near-square export at the column's
       full width becomes the tallest thing on the page, and shrinking the width to
       fix that also throws away resolution the file has — so height is its own knob.

       `width: auto` goes with it deliberately: .shotimg is normally `width: 100%`,
       and an explicit width plus a max-height squashes the image instead of scaling
       it. With both dimensions auto the browser fits inside both caps and keeps the
       aspect ratio. */
    shot: (b) => {
      const style = [
        b.max ? `max-width:${b.max}` : '',
        b.maxh ? `max-height:${b.maxh};width:auto` : '',
      ].filter(Boolean).join(';');
      return FRAME(b,
        `<img class="shotimg" src="${esc(b.src)}" alt="${esc(b.alt || '')}"` +
        ` loading="lazy" decoding="async"` + BOX(b) +
        (style ? ` style="${style}"` : '') + `>`);
    },

    /* --- before / after, on one frame ----------------------------------------

       Two images stacked in the same box with a draggable seam between them.
       Drag left and the second image takes the frame; drag right and the first
       does. For a study whose whole argument is "these are two products in one
       family", showing them in one place beats showing them in two — the
       comparison is the point, and a reader who has to scroll between them is
       doing the work the block should be doing.

         { type: 'compare',
           a: { src: '…', alt: '…', label: 'X1' },
           b: { src: '…', alt: '…', label: 'X0' },
           ratio: '1.45', start: 50, max: '900px',
           caption: '…', pill: true }

       PLACEHOLDERS. Either side may omit `src` and gets the same marked box the
       `ph` block uses, carrying the path it is waiting for. So the seam is
       draggable and the block reads correctly before either image exists —
       which is the state it ships in today. Drop the files in, add the two
       `src` keys, and nothing else changes.

       WHY A RANGE INPUT, HIDDEN. The obvious build is a pointerdown/move/up
       trio on the handle. That gets the mouse right and everything else wrong:
       no keyboard, no touch without extra work, nothing for a screen reader to
       announce, and a drag that dies the moment the pointer leaves the frame.
       A range input has all of that specified and implemented — arrow keys,
       Home/End, touch, pointer capture, a role and a value — so it is stretched
       invisibly over the whole frame and the visible seam is drawn from its
       value. The slider IS the control; the bar and knob are decoration.

       NOT `data-zoom`. Every other framed artifact opens in the lightbox on
       click, and a click here is the start of a drag. The two cannot share a
       gesture, so this frame opts out of the lightbox entirely.            */
    compare: (b) => {
      const start = Number.isFinite(+b.start) ? Math.min(100, Math.max(0, +b.start)) : 50;
      const side = (p, which) => {
        const cls = `cmp__side cmp__side--${which}`;
        if (!p || !p.src) {
          return `<div class="${cls}">` +
            `<div class="phbox phbox--cmp">` +
              `<span class="phbox__l">${esc((p && p.label) || (which === 'a' ? 'Image A' : 'Image B'))}</span>` +
              ((p && p.src2) ? `<code class="phbox__p">${esc(p.src2)}</code>` : '') +
            `</div></div>`;
        }
        return `<div class="${cls}">` +
          `<img class="cmp__img" src="${esc(p.src)}" alt="${esc(p.alt || '')}"` +
          ` loading="lazy" decoding="async" draggable="false">` +
        `</div>`;
      };

      /* the two names the slider announces, so the value means something out
         loud rather than being read as a bare percentage */
      const an = (b.a && b.a.label) || 'the first image';
      const bn = (b.b && b.b.label) || 'the second image';

      const inner =
        /* `max` sets the width as well as capping it. The default 630px is
           what a single screen occupies, and these panels are often grids of
           many — at the default they read as texture rather than as screens. */
        `<div class="cmp" style="--split:${start}%${b.ratio ? `;--ratio:${b.ratio}` : ''}${b.max ? `;--cw:${b.max}` : ''}">` +
          side(b.a, 'a') +
          side(b.b, 'b') +
          ((b.a && b.a.label) || (b.b && b.b.label)
            ? `<span class="cmp__tag cmp__tag--a" aria-hidden="true">${esc((b.a && b.a.label) || '')}</span>` +
              `<span class="cmp__tag cmp__tag--b" aria-hidden="true">${esc((b.b && b.b.label) || '')}</span>`
            : '') +
          `<span class="cmp__bar" aria-hidden="true"><span class="cmp__knob"></span></span>` +
          `<input class="cmp__range" type="range" min="0" max="100" step="0.1"` +
          ` value="${start}" aria-label="Reveal ${esc(an)} or ${esc(bn)}">` +
        `</div>`;

      /* FRAME is bypassed on purpose — see the note above about data-zoom. The
         caption markup is reproduced so the block still sits in the same
         rhythm as every other framed artifact. */
      return `<figure class="blk blk-frame blk-cmp">` +
        inner +
        (b.caption
          ? `<figcaption class="fframe__cap${b.pill ? ' fframe__cap--pill' : ''}">` +
            `<span>${esc(b.caption)}</span></figcaption>`
          : '') +
      `</figure>`;
    },

    /* A pull-out callout: the same measure as the body, indented, slightly
       larger. Used for the one line that carries the argument. */
    callout: (b) => `<div class="blk blk-call"><p>${b.text}</p></div>`,

    /* A framed artifact with caution tape laid across it.

       Two independent tapes, so they can sit on opposite sides of the card:
       the back one passes behind it, the front one over its lower edge. That is
       what creates the depth — a single tape can only ever be in front or
       behind, never both.

       The tape artwork is Ishaan's own PNG, tiled with background-repeat. No
       HTML text and no font substitution: the type in the tape is his file.  */
    /* An artifact crossed by caution tape: one strip behind it, one over its lower
       edge. That contrast is what gives the depth, so the back one always stays
       behind.

       A third strip through the middle was tried and removed — on a dense screenshot
       it crossed the content rather than the edges and read as damage rather than
       tape. Removed rather than left switched off, since a variant nothing uses is
       just a thing to misread later. */
    taped: (b) => {
      const tape = (kind) =>
        `<div class="ndatape ndatape--${kind}" aria-hidden="true">` +
        `<i class="ndatape__lane"></i></div>`;
      const style = [
        b.max ? `max-width:${b.max}` : '',
        b.maxh ? `max-height:${b.maxh};width:auto` : '',
      ].filter(Boolean).join(';');
      return `<div class="ndawrap">` +
        tape('back') +
        FRAME(b,
          `<img class="shotimg" src="${esc(b.src)}" alt="${esc(b.alt || '')}"` +
          ` loading="lazy" decoding="async"` + BOX(b) +
          (style ? ` style="${style}"` : '') + `>`) +
        tape('front') +
      `</div>`;
    },

    /* --- editorial research blocks --------------------------------------
       These exist for the Research section, which is meant to read like a page
       out of a design file: a quiet contextual line, a sub-heading, a bullet
       list at a comfortable measure, and artifacts sitting in white frames. */

    /* A slot for an image that has not arrived yet.

       Same frame and caption as a real artifact so the layout is already
       correct, but deliberately NOT zoomable — there is nothing to enlarge. It
       states the path it is waiting for, so dropping the file in and changing
       `ph` to `shot` is the whole handover. */
    ph: (b) => `<figure class="blk blk-frame">` +
      `<div class="fframe fframe--ph"${b.ratio ? ` style="--ratio:${b.ratio}"` : ''}>` +
        `<div class="phbox">` +
          `<span class="phbox__l">${esc(b.label || 'Image')}</span>` +
          (b.src ? `<code class="phbox__p">${esc(b.src)}</code>` : '') +
        `</div>` +
        (b.annos || []).map((a) =>
          `<span class="anno anno--${a.kind || 'note'}" style="${a.at || ''}"` +
          ` aria-hidden="true">${esc(a.text)}</span>`).join('') +
      `</div>` +
      (b.caption
        ? `<figcaption class="fframe__cap${b.pill ? ' fframe__cap--pill' : ''}">` +
          `${esc(b.caption)}</figcaption>`
        : '') +
    `</figure>`,

    /* A major heading inside a section, at the same level as the section's own.
       The original portfolio runs several of these down one stretch of page —
       "Solve for unstructured hiring decisions", then "Understanding the hiring
       ecosystem" — and a single heading per section could not express that. */
    head: (b) => `<div class="blk blk-head">` +
      `<h4 class="blk-head__t">${esc(b.title)}</h4>` +
      (b.body || []).map((t) => `<p class="blk-head__b">${t}</p>`).join('') +
    `</div>`,

    /* a sub-heading plus an optional lead-in and a bullet list */
    bullets: (b) => {
      const items = (b.items || []).map((t) => `<li>${t}</li>`).join('');
      return `<div class="blk blk-bul">` +
        (b.sub ? `<h5 class="blk__sub2">${esc(b.sub)}</h5>` : '') +
        (b.lead ? `<p class="bul__lead">${b.lead}</p>` : '') +
        /* a sub-heading on its own is legitimate — do not leave an empty list */
        (items ? `<ul class="bul">${items}</ul>` : '') +
      `</div>`;
    },

    /* A research board rebuilt as real markup rather than a screenshot: the
       source is a flattened image in Figma, and rebuilding it means the
       questions are selectable, searchable and legible at any zoom. Each group
       is a coloured tab and a set of question cards. */
    board: (b) => {
      const groups = (b.groups || []).map((g) => {
        const cards = (g.cards || []).map((c) =>
          `<li class="bcard">` +
            `<p class="bcard__q">${esc(c.q)}</p>` +
            (c.note ? `<p class="bcard__n">${esc(c.note)}</p>` : '') +
          `</li>`).join('');
        return `<div class="bgroup">` +
          `<span class="bgroup__tab" style="--tab:${g.tint || '#4cc2f1'}">${esc(g.label)}</span>` +
          `<ul class="bgroup__cards">${cards}</ul>` +
        `</div>`;
      }).join('');
      return FRAME(b, `<div class="board">${groups}</div>`);
    },

    /* the three persona cards */
    personas: (b) => {
      const cards = (b.items || []).map((p) =>
        `<li class="pcard">` +
          `<div class="pcard__top">` +
            `<span class="pcard__av" style="--av:${p.tint || '#cbb8f9'}">${esc(p.initial || p.name[0])}</span>` +
            `<span class="pcard__id"><b>${esc(p.name)}</b><i>${esc(p.trait)}</i></span>` +
          `</div>` +
          `<blockquote class="pcard__q">${esc(p.quote)}</blockquote>` +
          `<p class="pcard__w">${p.want}</p>` +
          `<p class="pcard__l">${p.look}</p>` +
        `</li>`).join('');
      return FRAME(b, `<ul class="pgrid">${cards}</ul>`);
    },

    /* The 2x2 "defining the gap" grid — dark cards, each a short label and a
       sentence. `lift: true` marks the one card that sits a shade lighter, as
       the reference does for Efficiency. */
    cards: (b) => {
      const cells = (b.items || []).map((it) =>
        `<div class="gapc${it.lift ? ' gapc--lift' : ''}">` +
          `<h5 class="gapc__t">${esc(it.label)}</h5>` +
          `<p class="gapc__b">${it.body}</p>` +
        `</div>`).join('');
      return `<div class="blk blk-cards">` +
             (b.heading ? `<h4 class="blk__sub">${esc(b.heading)}</h4>` : '') +
             `<div class="gapgrid">${cells}</div></div>`;
    },

    /* The highlights carousel. One slide is visible; the rest are laid out in a
       flex track that translates by whole slides. Every slide is real markup
       rather than a flattened image, so the copy stays selectable and the
       screenshots stay crisp at any zoom.

       `layout: 'stack'` centres the copy above the shot; the default puts the
       copy left and the shot right, which is what the reference does for all but
       the first slide. */
    carousel: (b) => {
      const base = b.path || 'assets/img/onefinnet/highlights/';
      const slides = (b.slides || []).map((sl, i) => {
        const copy =
          `<div class="hl__copy">` +
            `<h5 class="hl__t">${esc(sl.title)}</h5>` +
            `<p class="hl__b">${sl.body}</p>` +
          `</div>`;
        const shot =
          `<div class="hl__shot"><img src="${esc(base + sl.img)}" alt=""` +
          ` loading="${i ? 'lazy' : 'eager'}" decoding="async"` + BOX(b) + `></div>`;
        return `<li class="hl${sl.layout === 'stack' ? ' hl--stack' : ''}"` +
               ` role="group" aria-roledescription="slide"` +
               ` aria-label="${i + 1} of ${b.slides.length}">${copy}${shot}</li>`;
      }).join('');
      const dots = (b.slides || []).map((sl, i) =>
        `<button type="button" class="hl__dot" data-hl="${i}"` +
        ` aria-label="${esc(sl.title)}"></button>`).join('');
      return `<div class="blk blk-carousel">` +
             `<div class="hlwrap" data-carousel>` +
               (b.eyebrow ? `<span class="hlwrap__eyebrow">${esc(b.eyebrow)}</span>` : '') +
               `<div class="hlcard">` +
                 `<ul class="hltrack">${slides}</ul>` +
                 `<div class="hldots" role="tablist" aria-label="Highlights">${dots}</div>` +
               `</div>` +
             `</div></div>`;
    },

    /* A two-row marquee of product screens on a dark panel, scrolling in
       opposite directions. Each row's list is emitted twice: the animation
       translates one full copy's width and loops, so the seam never shows.
       Duplicating in markup rather than cloning in JS keeps it working with
       scripting mid-flight and needs no measurement pass.

       aria-hidden because it is decoration — the same screens are described in
       the prose, and 54 img elements would be noise in a screen reader. */
    ticker: (b) => {
      const base = b.path || 'assets/img/onefinnet/screens/';
      const rows = b.rows || [];
      const speed = b.speed || 100;            // css px per second
      const body = rows.map((row, i) => {
        const cards = row.map((f) =>
          `<i class="tick__card"><img src="${esc(base + f)}" alt="" loading="lazy" decoding="async"></i>`
        ).join('');
        /* Speed is px per second, and Marquee measures the actual period off the
           laid-out cards. It used to derive a duration from `card` and a hard
           coded 16px gap, which silently went wrong whenever either changed. */
        return `<div class="tick__row tick__row--${i % 2 ? 'b' : 'a'}"` +
               ` data-speed="${speed}">` +
               `<div class="tick__lane">${cards}${cards}</div></div>`;
      }).join('');
      return `<figure class="blk blk-ticker" aria-hidden="true">` +
             `<div class="tick">${body}</div>` +
             (b.caption ? `<figcaption class="blk__caption">${esc(b.caption)}</figcaption>` : '') +
             `</figure>`;
    },

    tiles: (b) => {
      /* a masonry field of tinted tiles — varied heights so the columns ragged */
      let out = '';
      for (let i = 0; i < (b.count || 44); i++) {
        const h = 3 + Math.random() * 4.5;
        const hue = 196 + Math.random() * 54;              // blue → green
        const l1 = 52 + Math.random() * 26;
        out +=
          `<i style="height:${h.toFixed(2)}rem;` +
          `--c1:hsl(${hue.toFixed(0)} 72% ${l1.toFixed(0)}%);` +
          `--c2:hsl(${(hue + 22).toFixed(0)} 66% ${(l1 + 16).toFixed(0)}%);` +
          `--a:${(Math.random() * 360).toFixed(0)}deg"></i>`;
      }
      return `<div class="blk blk-tiles" aria-hidden="true">${out}</div>`;
    },

    /* A label over a group of chips. `values` is the list — one chip each, which
       is why nothing here is comma-separated: a comma inside a pill is a list
       pretending to be one item. `value` is still accepted for a single chip.

       Chip text may carry the inline markup content.js documents; the label is
       escaped, the text is not, because authored copy is allowed <b>/<em>/<a> and
       escaping it printed the tags. */
    facts: (b) =>
      `<dl class="blk blk-facts">` +
      (b.items || []).map((f) => {
        const chips = f.values || (f.value ? [f.value] : []);
        return `<div><dt>${esc(f.label)}</dt><dd>`
          + chips.map((v) => `<span>${v}</span>`).join('')
          + `</dd></div>`;
      }).join('') +
      `</dl>`,

    panel: (b) =>
      `<div class="blk blk-panel">` +
        `<div class="pane">${(PREVIEW[b.preview] || PREVIEW.bloom)(b)}</div>` +
        (b.caption ? `<p class="blk__caption">${esc(b.caption)}</p>` : '') +
      `</div>`,

    row: (b) =>
      `<div class="blk blk-row">` +
        `<div class="blk-row__grid">` +
        (b.panels || []).map((p) =>
          `<div class="pane">${(PREVIEW[p.preview] || PREVIEW.bloom)(p)}</div>`).join('') +
        `</div>` +
        (b.caption ? `<p class="blk__caption">${esc(b.caption)}</p>` : '') +
      `</div>`,

    quote: (b) => `<blockquote class="blk blk-quote">${esc(b.text)}</blockquote>`,

    /* --- the contrast card ----------------------------------------------------
       Two framings set side by side. This was a plain monospace block first,
       which stated a contrast without showing one — the halves have to sit next
       to each other for the comparison to read at a glance.

       Two shapes, one component:

       With `not` alone the left side is prose and the split is 30/70 — the weak
       framing needs a sentence, the reality needs room for its list. One frame,
       one seam, a topical tile per statement.

       With `notItems` both sides are lists and the split is even, because the
       rows now answer each other one for one and an uneven card would break that
       correspondence. Two tinted panels, and the tile gives way to the verdict
       itself. Same tokens, same entrance: a second component would have meant a
       second set of everything to keep in step. */
    contrast: (b) => {
      const ICON = {
        building: '<path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 9h5a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2M16 13h1M16 17h1"/>',
        case: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M2.5 12h19"/>',
        chart: '<path d="M4 19V5M4 19h16M7.5 15l3.5-4 3 2.5L19 8"/>',
        person: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
        target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M17 7l3-3"/>',
        /* the two status marks, for the even card where the glyph IS the verdict */
        cross: '<circle cx="12" cy="12" r="8.4"/><path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6"/>',
        tick: '<circle cx="12" cy="12" r="8.4"/><path d="M8.4 12.3l2.6 2.6 4.6-5.2"/>',
      };
      /* 1.5 at a 26px render of a 24 viewBox lands just over a device pixel on a
         1x screen — heavier than that and the glyphs muddy at this size. */
      const glyph = (n) =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"` +
        ` stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ICON.target}</svg>`;

      const even = Array.isArray(b.notItems);

      /* --i drives the entrance delay. The rows come after the left panel and the
         arrow, which take 0 and 1, so the whole card resolves left to right. On
         the even card both columns share the numbering, so a Before row and its
         After answer arrive together rather than one list after the other. */
      /* One mark per row, at the head of the line. It was marked twice — a bare
         stroke on the left and the same verdict circled on the right — which was
         the same information said twice and made the row read as a form field.

         And the two marks are NOT opposites. Before is a dash: a state the
         product was in, not a failure. Only After gets a tick, so the eye reads
         one side as the answer rather than reading the other as a mistake. */
      const BARE = {
        dash: '<path d="M5 12h14"/>',
        tick: '<path d="M5 12.6l4.6 4.6L19 6.6"/>',
      };
      const bare = (n) =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"` +
        ` stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${BARE[n]}</svg>`;

      const list = (items, fallback) =>
        `<ul class="vs__list">` + (items || []).map((it, i) =>
          `<li class="vs__row" style="--i:${i + 2}">` +
            (even
              ? `<span class="vs__tick" aria-hidden="true">${bare(fallback)}</span>`
              : `<span class="vs__ico" aria-hidden="true">${glyph(it.icon || fallback)}</span>`) +
            `<p class="vs__txt">${it.text}` +
              (it.sub ? `<span class="vs__sub">${it.sub}</span>` : '') +
            `</p>` +
          `</li>`).join('') + `</ul>`;

      const mark = (d) =>
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"` +
        ` stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
        `<circle cx="12" cy="12" r="9"/>${d}</svg>`;

      return `<div class="blk blk-vs${even ? ' blk-vs--even' : ''}">` +
        `<div class="vs__card${even ? ' vs__card--even' : ''}">` +
          `<div class="vs__side vs__side--no">` +
            `<p class="vs__lab vs__lab--no">${mark('<path d="M9 9l6 6M15 9l-6 6"/>')}` +
              `${esc(b.notLabel || 'Not')}</p>` +
            (even ? list(b.notItems, 'dash') : `<p class="vs__weak">${b.not || ''}</p>`) +
          `</div>` +
          `<span class="vs__arrow" aria-hidden="true">` +
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"` +
            ` stroke-linecap="round" stroke-linejoin="round">` +
            `<path d="M5 12h14M13 6l6 6-6 6"/></svg></span>` +
          `<div class="vs__side vs__side--yes">` +
            `<p class="vs__lab vs__lab--yes">${mark('<path d="M8.5 12.5l2.5 2.5 4.5-5"/>')}` +
              `${esc(b.insteadLabel || 'Instead')}</p>` +
            list(b.items, even ? 'tick' : 'target') +
          `</div>` +
        `</div>` +
      `</div>`;
    },

    code: (b) =>
      `<div class="blk blk-code"><ol>` +
      (b.lines || []).map((l) => `<li>${esc(l)}</li>`).join('') +
      `</ol></div>`,
  };

  const Project = {
    links: [],
    sections: [],
    active: -1,

    init() {
      const p = S.project;
      if (!p) return;
      document.title = `${p.title} — ${S.person.name}`;

      /* the rail */
      const rail = $('#rail');
      if (rail) {
        rail.className = 'rail';
        rail.setAttribute('aria-label', 'Case study sections');
        rail.appendChild(el('a', { class: 'rail__back', href: p.back?.href || 'work.html' },
          esc(p.back?.label || 'BACK')));
        const list = el('nav', { class: 'rail__list' });
        p.sections.forEach((sec) => {
          const a = el('a', { class: 'rail__link', href: `#${sec.id}` }, esc(sec.nav || sec.eyebrow));
          list.appendChild(a);
          this.links.push(a);
        });
        rail.appendChild(list);
      }

      /* the page */
      const main = $('#main');
      const body = el('div', { class: 'proj proj__body' });
      const col = el('div', { class: 'proj__col' });

      col.appendChild(el('header', { class: 'proj__head' },
        `<span class="proj__eyebrow">${esc(p.eyebrow || '')}</span>` +
        `<h1 class="proj__title">${esc(p.title)}</h1>`));

      p.sections.forEach((sec) => {
        const s = el('section', {
          class: `sec${sec.tone === 'dark' ? ' sec--dark' : ''}`, id: sec.id });
        s.innerHTML =
          `<span class="sec__eyebrow">${esc(sec.eyebrow || '')}</span>` +
          (sec.preamble
            ? `<div class="sec__pre">` +
                `<h3 class="sec__pre__t">${esc(sec.preamble.title)}</h3>` +
                `<p class="sec__pre__b">${sec.preamble.body}</p>` +
              `</div>`
            : '') +
          `<i class="sec__anchor" aria-hidden="true"></i>` +
          `<h2 class="sec__heading">${esc(sec.heading || '')}</h2>` +
          `<div class="sec__body">${(sec.body || []).map((t) => `<p>${t}</p>`).join('')}</div>` +
          (sec.blocks || []).map((b) => (BLOCK[b.type] || (() => ''))(b)).join('');
        rhythm(s);
        col.appendChild(s);
        this.sections.push(s);
      });

      body.appendChild(col);
      main.appendChild(body);
      Marquee.bind(main);       // attached first, so measurements are real
      videos(main);
      compares(main);

      this.smoothLinks();
    },

    /* clicking a rail link scrolls there rather than jumping */
    smoothLinks() {
      this.links.forEach((a) => {
        a.addEventListener('click', (e) => {
          const target = $(a.getAttribute('href'));
          if (!target) return;
          e.preventDefault();
          Sound.tap();
          /* scrollIntoView isn't everywhere; fall back to an offset scroll */
          if (typeof target.scrollIntoView === 'function') {
            target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
          } else {
            const y = target.getBoundingClientRect().top + (window.scrollY || 0);
            scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
          }
          history.replaceState(null, '', a.getAttribute('href'));
        });
      });
    },

    /* Scroll spy. The active section is the last one whose top has passed a
       line a third of the way down the viewport — so the highlight changes when
       a heading reaches reading position, not when it merely appears. */
    tick(vh) {
      if (!this.sections.length) return false;
      const line = vh * 0.34;
      let next = 0;
      for (let i = 0; i < this.sections.length; i++) {
        if (this.sections[i].getBoundingClientRect().top <= line) next = i;
      }
      if (next !== this.active) {
        this.active = next;
        this.links.forEach((a, i) => {
          a.classList.toggle('is-active', i === next);
          if (i === next) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }
      return false;
    },
  };

  /* ==================================================== 5b1. history ==== */

  /* One undo stack for the whole annotation layer. The brief asks undo to
     reverse drawings, notes, stickers *and* movements, so every mutating action
     pushes the function that reverses it rather than each feature owning its
     own history. */
  const History = {
    stack: [],
    redoStack: [],
    LIMIT: 80,

    /* `redo` is optional: pass it and the action becomes redoable. Anything new
       clears the redo stack, which is how every editor behaves. */
    push(undo, label, redo) {
      this.stack.push({ undo, label, redo });
      if (this.stack.length > this.LIMIT) this.stack.shift();
      if (!this._replaying) this.redoStack.length = 0;
    },

    undo() {
      const entry = this.stack.pop();
      if (!entry) { Sound.tick(); return false; }
      entry.undo();
      if (entry.redo) this.redoStack.push(entry);
      Sound.voice({ freq: 240, gain: 0.045, dur: 0.09, bright: 1400, drop: 0.5, noise: 0.3 });
      return true;
    },

    redo() {
      const entry = this.redoStack.pop();
      if (!entry) { Sound.tick(); return false; }
      this._replaying = true;
      entry.redo();
      this.stack.push(entry);
      this._replaying = false;
      Sound.voice({ freq: 420, gain: 0.04, dur: 0.08, bright: 2200, drop: 1.6, noise: 0.3 });
      return true;
    },

    clear() { this.stack.length = 0; this.redoStack.length = 0; },
  };

  /* ================================================== 5b2. drag engine === */

  /* One pointer-drag implementation for every loose object on the canvas.
     Positions live in --x/--y so dragging is transform-only. On release the
     object keeps its velocity for a moment and the lean springs back to 0. */
  /* ONE WAY IN, AND ONLY ONE.

     hover → select → move / resize / rotate → deselect.

     What this replaced: a press anywhere on an object started dragging it
     immediately, and a press that happened not to travel more than 4px was
     reinterpreted as a selection on release. So the same gesture meant two
     things depending on how steady your hand was, you could move something
     without ever selecting it, and you found out which one you had done only
     after letting go. Reading the page moved the page's furniture by accident.

     Now the press is unambiguous. On an unselected object it selects, and
     stops. Only an object that is already selected can be moved, and only its
     handles resize or rotate it. Nothing here is reachable two ways, and no
     gesture changes meaning after the fact. */

  const Drag = {
    items: [],
    selected: null,

    /* Clicking away from the selection clears it. Bound once, in capture, so it
       runs before any object's own handler: press another object and this
       deselects the old one a moment before that one selects itself. The guard
       is the selected node's own subtree — its handles live inside it, and a
       press on a resize handle must not be read as a press elsewhere. */
    bind() {
      if (this._bound) return;
      this._bound = true;
      document.addEventListener('pointerdown', (e) => {
        if (!this.selected) return;
        if (hit(e, '.drg') === this.selected.node) return;
        this.deselect();
      }, true);
      /* Peel.place() re-lays the stickers on a viewport change, which moves the
         box the cached centre was measured against. */
      addEventListener('resize', () => {
        if (!this.selected) return;
        this.measure(this.selected);
        this.syncGuides();
      }, { passive: true });
    },

    make(node, opts = {}) {
      const it = {
        node,
        x: opts.x || 0, y: opts.y || 0,
        rest: opts.r || 0,           // the angle it sits at
        sx: 1, sy: 1,                // resize, per axis
        dragging: false,
      };
      node.classList.add('drg');
      this.bind();
      this.apply(it);
      this.chrome(it);

      /* Absolute from the grab point, never accumulated per event. Summing
         deltas lets rounding drift, and the object slides out from under the
         cursor over a long drag; this way it is pinned to the pointer for the
         whole gesture however many events arrive. */
      let gx = 0, gy = 0, ox = 0, oy = 0, armed = false, id = null;

      /* How far the pointer must travel before a press becomes a drag.

         This is the whole answer to "nothing may move by accident" without
         making you press an object twice to move it. The press selects at once;
         hold still and that is all it does, so a click stays a click and the
         hand tremor inside one is absorbed. Travel past 4px and you have
         plainly asked for a move.

         The move then runs from where the pointer first went down, not from
         where the threshold was crossed — measuring from the crossing makes the
         object jump those 4px the instant it starts following you. */
      const SLOP = 4;

      node.addEventListener('pointerdown', (e) => {
        /* only the select tool moves things; drawing tools must not */
        if (Rack.tool !== 'select') return;
        if (hit(e, '[data-nodrag]')) return;   // handles run their own gesture
        if (e.button !== 0) return;
        e.preventDefault();

        /* Selecting is what a press does. Moving is what a press that then
           travels does. One gesture in two stages — not two separate paths, and
           not a gesture that decides which one it was after you let go. */
        if (this.selected !== it) this.select(it);

        id = e.pointerId;
        node.setPointerCapture?.(id);
        armed = true;
        it.dragging = false;
        it.fromX = it.x; it.fromY = it.y;
        gx = e.clientX; gy = e.clientY;
        ox = it.x; oy = it.y;
      });

      node.addEventListener('pointermove', (e) => {
        if (!armed) return;
        const dx = e.clientX - gx, dy = e.clientY - gy;

        if (!it.dragging) {
          if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
          it.dragging = true;
          node.classList.add('is-drag');
          this.raise(it);
          Sound.voice({ freq: 620, gain: 0.022, dur: 0.03, bright: 3800, drop: 0.8, noise: 0.7 });
        }

        it.x = ox + dx;
        it.y = oy + dy;
        /* written straight to the style, in the pointer event. Deferring to the
           next frame is what puts an object behind its own cursor. */
        this.apply(it);
        this.syncGuides();
      });

      const release = () => {
        if (!armed) return;
        armed = false;
        node.releasePointerCapture?.(id);
        if (!it.dragging) return;             // a press that never travelled
        it.dragging = false;
        node.classList.remove('is-drag');
        /* It stops where you left it. No glide, no settle — a thrown object
           that keeps travelling after release is the opposite of placing one. */
        const fx = it.fromX, fy = it.fromY;
        History.push(() => {
          it.x = fx; it.y = fy;
          this.apply(it);
        }, 'move');
        Sound.voice({ freq: 300, gain: 0.03, dur: 0.06, bright: 1800, drop: 0.6, noise: 0.4 });
      };
      node.addEventListener('pointerup', release);
      node.addEventListener('pointercancel', release);

      this.items.push(it);
      return it;
    },

    apply(it) {
      const s = it.node.style;
      s.setProperty('--x', `${it.x.toFixed(1)}px`);
      s.setProperty('--y', `${it.y.toFixed(1)}px`);
      s.setProperty('--r', `${it.rest.toFixed(2)}deg`);
      s.setProperty('--sx', (it.sx || 1).toFixed(4));
      s.setProperty('--sy', (it.sy || 1).toFixed(4));
    },

    raise(it) {
      /* keep the most recently touched object on top, Figma-style */
      this.z = (this.z || 3) + 1;
      it.node.style.zIndex = this.z;
    },

    /* Exactly one object, or none. Selecting anything drops whatever was
       selected before, so two sets of handles can never be on screen at once. */
    select(it) {
      if (this.selected === it) return;
      if (this.selected) this.selected.node.classList.remove('is-sel');
      this.selected = it;
      it.node.classList.add('is-sel');
      this.raise(it);            // the active object sits above the rest
      this.measure(it);
      this.syncGuides();
      Sound.voice({ freq: 1500, gain: 0.02, dur: 0.02, bright: 5200, drop: 0.9, noise: 0.3 });
    },

    /* --- the position guides -------------------------------------------------
       Two dashed lines saying where the selected object sits on the canvas: one
       down from the top edge to its rotation knob, one in from the left to its
       middle. They read the way a ruler does — the object's offset is legible
       without moving it — and they follow it through a drag.

       They live in a layer of their own rather than inside the selection
       chrome, because the chrome is a child of the object and inherits its
       rotation and its scale. A guide that tilts with the thing it is measuring
       measures nothing. Out here they stay square to the canvas whatever the
       object is doing. */
    ensureGuides(host) {
      if (this.gl && this.gl.parentNode === host) return this.gl;
      const g = el('div', { class: 'guides', 'aria-hidden': 'true' });
      this.gv = el('span', { class: 'guide guide--v' });
      this.gh = el('span', { class: 'guide guide--h' });
      g.appendChild(this.gv); g.appendChild(this.gh);
      host.appendChild(g);
      this.gl = g;
      return g;
    },

    /* The object's untransformed centre in canvas coordinates, plus its layout
       size — cached on select so the drag never has to read the DOM.

       Rotation and scale both happen about the centre, so the centre is the one
       part of the box a transform cannot move: whatever the object does after
       this, its centre is this point plus --x/--y. That is what makes the
       guides pure arithmetic, and a getBoundingClientRect on every pointer
       event is exactly what this path cannot afford. */
    measure(it) {
      const host = it.node.closest('.canvas');
      if (!host) { it.baseCX = null; return; }
      const cr = host.getBoundingClientRect();
      const nr = it.node.getBoundingClientRect();
      it.baseCX = (nr.left + nr.right) / 2 - cr.left - it.x;
      it.baseCY = (nr.top + nr.bottom) / 2 - cr.top - it.y;
      it.baseW = it.node.offsetWidth;
      it.baseH = it.node.offsetHeight;
      this.frame(it);
      this.ensureGuides(host);
    },

    /* The upright box that contains the object at its current angle, plus the
       inverse scale the frame needs to undo the object's own. Recomputed
       whenever the angle or the size changes — a move doesn't alter either. */
    frame(it) {
      if (!it.baseW) return;
      const rad = (it.rest * Math.PI) / 180;
      const c = Math.abs(Math.cos(rad)), s = Math.abs(Math.sin(rad));
      const w = it.baseW * it.sx, h = it.baseH * it.sy;
      it.aabbW = w * c + h * s;
      it.aabbH = w * s + h * c;
      const st = it.node.style;
      st.setProperty('--sel-w', `${it.aabbW.toFixed(1)}px`);
      st.setProperty('--sel-h', `${it.aabbH.toFixed(1)}px`);
      st.setProperty('--sel-k', (1 / (it.sx || 1)).toFixed(5));
    },

    syncGuides() {
      const it = this.selected;
      if (!this.gl) return;
      if (!it || it.baseCX == null) { this.gl.classList.remove('is-on'); return; }

      /* The frame is upright, so its top-middle dot is straight above the
         object's centre and its left-middle dot straight to the left of it —
         whatever angle the object is at. The lines simply reach those two
         points, and rotating the object slides them rather than swinging them
         around it. */
      const cx = it.baseCX + it.x;
      const cy = it.baseCY + it.y;

      this.gv.style.left = `${cx.toFixed(1)}px`;
      this.gv.style.height = `${Math.max(0, cy - it.aabbH / 2).toFixed(1)}px`;
      this.gh.style.top = `${cy.toFixed(1)}px`;
      this.gh.style.width = `${Math.max(0, cx - it.aabbW / 2).toFixed(1)}px`;
      this.gl.classList.add('is-on');
    },

    /* The Figma chrome: a blue outline, eight handles — four corners and four
       edges — and a knob on a stalk that rotates it.

       The frame stays upright — see `.sel` in site.css for why — so it is the
       object's bounding box at whatever angle it is at, and everything here
       works in the page's axes.

       The opposite side stays put, which is the whole reason a handle is worth
       grabbing rather than just scaling about the middle. Resizing is always
       proportional, so Shift has nothing to lock and is left to the rotation
       handle, where it snaps to 15°. */
    chrome(it) {
      const sel = el('div', { class: 'sel', 'data-nodrag': '' });
      ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
        .forEach((c) => sel.appendChild(el('span', { class: 'sel__h', 'data-c': c })));
      const rot = el('span', { class: 'sel__rot', 'data-nodrag': '', 'aria-hidden': 'true' });
      sel.appendChild(rot);
      it.node.appendChild(sel);

      const centre = () => {
        const r = it.node.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      };

      const MIN = 16;          // px, so nothing can be shrunk to nothing
      const MINS = 0.2, MAXS = 6;

      $$('.sel__h', sel).forEach((h) => {
        h.addEventListener('pointerdown', (e) => {
          e.preventDefault(); e.stopPropagation();
          h.setPointerCapture?.(e.pointerId);

          const c = String(h.dataset.c || '');
          const hx = c.includes('e') ? 1 : c.includes('w') ? -1 : 0;
          const hy = c.includes('s') ? 1 : c.includes('n') ? -1 : 0;
          /* The frame is upright, so a handle pulls along the page's axes and
             not the object's. That is the whole simplification: no projecting
             the pointer into a rotated basis, and the nwse/ns/ew cursors are
             honest at every angle instead of only at zero. */
          const s0 = it.sx;
          const aw0 = it.aabbW || 1, ah0 = it.aabbH || 1;
          const gx = e.clientX, gy = e.clientY;
          const x0 = it.x, y0 = it.y;
          it.node.classList.add('is-xf');

          const move = (ev) => {
            const dx = ev.clientX - gx, dy = ev.clientY - gy;

            /* THE RATIO IS FIXED. Every handle scales, none stretches — these
               are photographs and a headline, and there is no width worth
               giving them independently of their height. So the drag reduces to
               a single factor: a corner takes whichever of its two axes you
               pulled hardest, an edge takes its own. */
            const kx = hx ? (aw0 + hx * dx) / aw0 : null;
            const ky = hy ? (ah0 + hy * dy) / ah0 : null;
            let k = kx == null ? ky
              : ky == null ? kx
                : (Math.abs(kx - 1) > Math.abs(ky - 1) ? kx : ky);
            k = Math.max(k, MIN / aw0, MIN / ah0);

            const sc = clamp(s0 * k, MINS, MAXS);
            it.sx = sc; it.sy = sc;

            /* Hold the opposite side of the frame. The applied factor is read
               back off the clamp, so hitting the size limit stops the object
               dead instead of letting it keep sliding. An edge handle has one
               of hx/hy at zero, so that axis grows symmetrically about the
               centre and the drag stays on its own line. */
            const kk = sc / s0;
            it.x = x0 + (hx * aw0 * (kk - 1)) / 2;
            it.y = y0 + (hy * ah0 * (kk - 1)) / 2;
            this.frame(it);
            this.apply(it);
            this.syncGuides();
          };
          const up = () => {
            h.removeEventListener('pointermove', move);
            h.removeEventListener('pointerup', up);
            h.removeEventListener('pointercancel', up);
            it.node.classList.remove('is-xf');
            if (Math.abs(it.sx - s0) > 0.005) {
              History.push(() => {
                it.sx = s0; it.sy = s0; it.x = x0; it.y = y0;
                this.frame(it); this.apply(it); this.syncGuides();
              }, 'resize');
            }
            Sound.tick();
          };
          h.addEventListener('pointermove', move);
          h.addEventListener('pointerup', up);
          h.addEventListener('pointercancel', up);
        });
      });

      /* rotate: angle from the centre, snapping to 15° with Shift held */
      rot.addEventListener('pointerdown', (e) => {
        e.preventDefault(); e.stopPropagation();
        rot.setPointerCapture?.(e.pointerId);
        const c = centre();
        const from = it.rest;
        const grab = Math.atan2(e.clientY - c.y, e.clientX - c.x);
        it.node.classList.add('is-xf');

        const move = (ev) => {
          const now = Math.atan2(ev.clientY - c.y, ev.clientX - c.x);
          let deg = from + (now - grab) * 180 / Math.PI;
          if (ev.shiftKey) deg = Math.round(deg / 15) * 15;
          it.rest = deg;
          this.frame(it);        // the upright box grows as the object turns
          this.apply(it);
          this.syncGuides();
        };
        const up = () => {
          rot.removeEventListener('pointermove', move);
          rot.removeEventListener('pointerup', up);
          rot.removeEventListener('pointercancel', up);
          it.node.classList.remove('is-xf');
          if (Math.abs(it.rest - from) > 0.5) {
            History.push(() => {
              it.rest = from; this.frame(it); this.apply(it); this.syncGuides();
            }, 'rotate');
          }
          Sound.tick();
        };
        rot.addEventListener('pointermove', move);
        rot.addEventListener('pointerup', up);
        rot.addEventListener('pointercancel', up);
      });
    },

    deselect() {
      if (!this.selected) return;
      this.selected.node.classList.remove('is-sel');
      this.selected = null;
      this.syncGuides();          // fades the guides out with the outline
    },

    /* Removal detaches rather than destroys, so undo can put it back with its
       position, angle and text intact. */
    detach(it) {
      const i = this.items.indexOf(it);
      if (i >= 0) this.items.splice(i, 1);
      if (this.selected === it) {
        it.node.classList.remove('is-sel'); this.selected = null; this.syncGuides();
      }
      it.parent = it.node.parentNode;
      it.node.remove();
    },

    reattach(it) {
      if (!it.parent) return;
      it.parent.appendChild(it.node);
      if (!this.items.includes(it)) this.items.push(it);
      this.apply(it);
    },

    remove(it) { this.detach(it); },

    /* Nothing to animate. An object goes exactly where you put it and stops
       there, so there is no post-release glide to integrate and no velocity
       tilt to decay — every position this module writes now comes straight from
       a pointer event.

       The hook stays because the frame loop asks each module whether it still
       needs frames, and answering "no" is what lets the loop go to sleep. */
    tick() {
      return false;
    },
  };

  /* ==================================================== 5c. tool rack === */

  /* The two illustrated tools. Drawn as SVG rather than images so they inherit
     the drop shadow and can be recoloured from content.js. */
  const TOOL_ART = {
    /* Ishaan's own PEN.svg, used as supplied. The only change: the barrel's
       right edge moved from x=60 to x=118 (and the specular band and blur
       region with it), because the file is the *visible fragment* — it ends in
       a flat butt where the toolbar cuts it. Without material past that cut,
       sliding the pencil out on hover would have exposed the flat end and it
       would read as a broken sprite rather than an object leaving a slot.
       viewBox is now 120x24, so --ow 120px renders 24px tall. */
    marker: `
      <svg aria-hidden="true" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.68528 18.2137C8.96269 17.9195 8.49023 17.218 8.49023 16.4379V8.47611C8.49023 7.69603 8.96269 6.99453 9.68528 6.70032L21.0482 2.08499C22.8815 1.34037 24.8413 0.957032 26.8193 0.957032H118.0V23.957H26.8193C24.8413 23.957 22.8815 23.5737 21.0482 22.8291L9.68528 18.2137Z" fill="white"/>
      <path d="M9.68528 18.2137C8.96269 17.9195 8.49023 17.218 8.49023 16.4379V8.47611C8.49023 7.69603 8.96269 6.99453 9.68528 6.70032L21.0482 2.08499C22.8815 1.34037 24.8413 0.957032 26.8193 0.957032H118.0V23.957H26.8193C24.8413 23.957 22.8815 23.5737 21.0482 22.8291L9.68528 18.2137Z" fill="url(#paint0_linear_807_1636)"/>
      <path d="M8.72949 16.4363V8.47642C8.72949 7.79409 9.14349 7.17884 9.77599 6.92201L21.138 2.30571C22.9425 1.57259 24.8717 1.19597 26.819 1.19597H117.76V23.7168H26.819C24.8717 23.7168 22.9425 23.3402 21.138 22.607L9.77599 17.9908C9.14349 17.7339 8.72949 17.1196 8.72949 16.4363Z" stroke="black" stroke-opacity="0.3" stroke-width="0.479167"/>
      <g opacity="0.4" filter="url(#filter0_f_807_1636)">
      <path d="M24.9103 2.87435H116.0V11.9785H10.0561L9.92773 8.62435L24.9103 2.87435Z" fill="url(#paint1_linear_807_1636)"/>
      </g>
      <path d="M0.595125 13.3435C-0.198375 13.0196 -0.198375 11.8945 0.595125 11.5696L8.96904 8.14453V16.7695L0.595125 13.3435Z" fill="#1E1E1E"/>
      <path d="M0.686578 13.1212C0.0914531 12.8778 0.0914531 12.0344 0.686578 11.791L8.72987 8.50011V16.4121L0.686578 13.1212Z" stroke="black" stroke-opacity="0.3" stroke-width="0.479167"/>
      <path d="M29.5732 23.4785V1.43685" stroke="black" stroke-opacity="0.15" stroke-width="0.958333"/>
      <path opacity="0.5" d="M30.5312 23.4785V1.43685" stroke="white" stroke-width="0.958333"/>
      <defs>
      <filter id="filter0_f_807_1636" x="7.05273" y="0" width="112"  height="14.8535" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="1.4375" result="effect1_foregroundBlur_807_1636"/>
      </filter>
      <linearGradient id="paint0_linear_807_1636" x1="50.4077" y1="23.957" x2="50.4077" y2="0.957031" gradientUnits="userSpaceOnUse">
      <stop stop-opacity="0.06"/>
      <stop offset="0.4" stop-opacity="0"/>
      <stop offset="1" stop-opacity="0.09"/>
      </linearGradient>
      <linearGradient id="paint1_linear_807_1636" x1="-2.32312" y1="11.9785" x2="2.13082" y2="-6.06092" gradientUnits="userSpaceOnUse">
      <stop stop-opacity="0.2"/>
      <stop offset="1" stop-opacity="0.4"/>
      </linearGradient>
      </defs>
      </svg>`,
    /* One note, leaning slightly, with the bottom-LEFT corner turned up. The
       three-note pad that briefly lived here read as a stack rather than the
       single note the reference shows. */
    note: `
      <svg viewBox="0 0 74 74" aria-hidden="true">
        <defs>
          <linearGradient id="ntFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#cfbdfa"/>
            <stop offset="1" stop-color="#b49bf3"/>
          </linearGradient>
        </defs>
        <g transform="translate(7 4) rotate(-4)">
          <path d="M0 0H60V62H18L0 44Z" fill="url(#ntFill)"/>
          <path d="M0 44H18V62Z" fill="#e9e0fd"/>
          <path d="M0 44 18 62" stroke="#8f6fe0" stroke-width="1.2" fill="none" opacity=".35"/>
        </g>
      </svg>`,
  };

  /* built-in pill glyphs */
  const PILL_ICON = {
    pin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14.2s4.6-4 4.6-7.4a4.6 4.6 0 1 0-9.2 0C3.4 10.2 8 14.2 8 14.2Z"/><circle cx="8" cy="6.6" r="1.7"/></svg>',
  };

  const TOOL_ICON = {
    cursor: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.6 1.4 13 8.2l-4.3.5-2 4Z"/></svg>',
    plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>',
    undo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.4 6.2H8.6a4 4 0 1 1 0 8H5.2"/><path d="M6 3 3 6.2l3 3"/></svg>',
    pencilTab: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11.2 2.4 13.6 4.8 5.6 12.8 2.4 13.6l.8-3.2z"/><path d="M10 3.6l2.4 2.4"/></svg>',
    /* The sticky note as a line glyph. The dock draws the note as an
       illustrated object sliding out of a slot, which needs a slot to slide
       within; the status pill is 48px of pill and has none, so it takes a glyph
       like the pen beside it. Same shape as the illustration: a square with the
       lower-left corner turned up. */
    noteTab: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13.4 2.6v10.8H6.2L2.6 9.8V2.6z"/><path d="M2.6 9.8h3.6v3.6"/></svg>',
  };

  const Rack = {
    tool: 'select',

    init() {
      const rack = el('div', { class: 'tools' });
      const panel = el('div', { class: 'tools__panel', role: 'toolbar', 'aria-label': 'Annotation tools' });

      const chip = (name, key, label, html, cls = 'tool') => {
        const b = el('button', {
          class: cls, type: 'button', 'data-tool-btn': name,
          'data-tip': label,
          'aria-label': label, 'aria-pressed': 'false',
        }, html);
        b.addEventListener('click', () => this.pick(name));
        return b;
      };

      panel.appendChild(chip('select', 'v', 'Move', TOOL_ICON.cursor));
      panel.appendChild(el('span', { class: 'tools__div' }));

      /* The armed state for an object is a PREVIEW PLATE — a pale lavender rounded
         rectangle behind it, showing what is about to be placed. It is a separate
         element rather than a background on the button, because the button's box is
         the full panel width while the plate is inset, and because it has to sit
         BEHIND the object while the object stays fully lit. */
      const slot = (art) =>
        `<span class="tool__plate" aria-hidden="true"></span>` +
        `<span class="tool__slot">${art}</span>`;

      /* MEASURED off the reference, not reasoned about. Both supplied images agree
         to within a pixel (a 2x crop and a 2.33x spec sheet):
             pencil   24.0px tall, tip 10.5px in from the panel's inner left edge,
                      running off the RIGHT edge — 36.4px of it visible
             note     46.5px tall, left edge 30.5px in, 16.3px visible
         The earlier numbers here (28px tall, 60px visible / 52px tall, 32px
         visible) were derived from "about half should show", which put both objects
         well over their real size. */
      const marker = chip('marker', 'b', 'Draw', slot(TOOL_ART.marker), 'tool tool--obj');
      marker.style.setProperty('--oh', '24px');      /* art is 120x24, so 1:5 */
      marker.style.setProperty('--ow', '120px');
      marker.style.setProperty('--vis', '36.4px');   /* visible from the tip rightward */
      panel.appendChild(marker);

      const note = chip('note', 'n', 'Sticky Notes', slot(TOOL_ART.note), 'tool tool--obj');
      /* the art is a 74x74 square, so width tracks height exactly */
      note.style.setProperty('--oh', '46.5px');
      note.style.setProperty('--ow', '46.5px');
      note.style.setProperty('--vis', '16.3px');
      panel.appendChild(note);

      panel.appendChild(el('span', { class: 'tools__div' }));

      const add = el('button', {
        class: 'tool', type: 'button', 'data-tool-btn': 'sticker',
        'data-tip': 'Add', 'aria-label': 'Add stickers', 'aria-pressed': 'false',
      }, TOOL_ICON.plus);
      add.addEventListener('click', () => this.pick('sticker'));
      panel.appendChild(add);

      const undo = el('button', {
        class: 'tool tool--undo', type: 'button', 'data-tool-btn': 'undo',
        'data-tip': 'Undo',
        'aria-label': 'Undo last mark',
      }, TOOL_ICON.undo);
      undo.addEventListener('click', () => History.undo());
      undo.addEventListener('dblclick', () => Canvas.clearAll());
      panel.appendChild(undo);

      /* the ink palette flies out beside the rack while a drawing tool is live */
      const inks = el('div', { class: 'inks', role: 'group', 'aria-label': 'Marker colour' });
      (S.canvas?.inks || ['#14100c']).forEach((c, i) => {
        const b = el('button', {
          class: '', type: 'button', style: `--c:${c}`,
          'aria-label': `Colour ${i + 1}`, 'aria-pressed': String(i === 0),
        });
        b.addEventListener('click', () => {
          Ink.colour = c;
          $$('button', inks).forEach((n) => n.setAttribute('aria-pressed', String(n === b)));
          Sound.tick();
        });
        inks.appendChild(b);
      });
      /* Parented to the rack, not the panel. The geometry is identical either
         way — `.tools` shrink-wraps the panel exactly and both are positioned,
         so `right: 100%; top: 0` resolves against the same edge, and the
         desktop renders pixel for pixel as before. It matters on a phone: the
         pen folds the dock away so you can reach the canvas, and a palette
         inside the dock would go with it. */
      this.inks = inks;

      /* the "+" drawer of stickers */
      const pad = el('div', { class: 'drawerpad', role: 'group', 'aria-label': 'Stickers' });
      const base = S.canvas?.stickerPath || 'assets/img/pixel/';
      const list = S.canvas?.stickers || [];
      /* Default to the first sticker so pressing S works before you've opened
         the drawer — otherwise the tool arms with nothing to place. */
      this.sticker = list[0];

      list.forEach((g) => {
        const b = el('button', {
          type: 'button', 'data-sticker': g,
          'aria-label': `Sticker: ${g}`,
          'aria-pressed': String(g === this.sticker),
        }, `<img src="${base}${g}.svg" alt="" loading="lazy">`);
        b.addEventListener('click', () => {
          const already = this.tool === 'sticker';
          this.setSticker(g);
          this.pick('sticker', false, true);
          /* if the tool was already live, force the silhouette to crossfade */
          if (already) { Ghost.kind = 'x'; Ghost.set('sticker'); }
          Sound.tap();
        });
        pad.appendChild(b);
      });
      this.pad = pad;

      rack.appendChild(panel);
      /* The drawer hangs outside the panel (right: 100%), and the panel now
         clips its content per the Figma spec — so it parents to the rack
         instead, after the panel so it still paints above it. Same visual
         position, since .tools wraps the panel exactly. */
      rack.appendChild(inks);
      rack.appendChild(pad);

      /* the collapsed tab: always present, so the tools are never a secret */
      const tab = el('button', {
        class: 'tools__tab', type: 'button',
        'data-tip': 'Open annotation tools',
        'aria-label': 'Open annotation tools', 'aria-expanded': 'false',
      }, TOOL_ICON.pencilTab);
      tab.addEventListener('click', () => { this.userCollapsed = false; this.setMode('open', 'tab'); });
      rack.appendChild(tab);
      this.tab = tab;

      /* one bubble element for the welcome line, one for shortcut confirmations */
      this.say = el('div', { class: 'tools__say', role: 'status', 'aria-live': 'polite' });
      this.flash = el('div', { class: 'tools__say tools__flash', 'aria-hidden': 'true' });
      rack.append(this.say, this.flash);

      this.fabInit(rack);

      document.body.appendChild(rack);
      this.panel = panel;
      this.rack = rack;
      this.mode = 'tab';
      this.rack.classList.add('is-tab');
      this.userCollapsed = false;
      /* let the first paint land before the entrance animation */
      requestAnimationFrame(() => this.applyScope());

      this.pick('select', true);

      /* the shortcut set from the brief */
      const LABEL = {
        select: 'Move Tool', marker: 'Pencil Tool',
        note: 'Sticky Note', sticker: 'Sticker Tool',
      };

      addEventListener('keydown', (e) => {
        if (hit(e, 'input, textarea, [contenteditable]')) return;
        const meta = e.metaKey || e.ctrlKey;

        if (meta && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) { History.redo(); this.flashLabel('Redo'); }
          else { History.undo(); this.flashLabel('Undo'); }
          this.touch();
          return;
        }
        if (meta || e.altKey) return;

        /* Space is a held modifier: the hand tool, then back to what you had */
        if (e.code === 'Space' && !e.repeat) {
          e.preventDefault();
          this._beforeHand = this.tool;
          document.body.dataset.tool = 'hand';
          this.flashLabel('Hand Tool');
          return;
        }

        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          this.pick('sticker', false, true);
          this.flashLabel('Sticker Drawer');
          return;
        }
        if (e.key === 'Escape') {
          /* an external keyboard on a phone folds the dock away first */
          if (this.dockOpen) { this.fabSet(false); return; }
          if (this.tool !== 'select') { this.pick('select'); this.flashLabel('Move Tool'); }
          return;
        }

        const map = { v: 'select', p: 'marker', b: 'marker', n: 'note', s: 'sticker' };
        const next = map[e.key.toLowerCase()];
        if (!next) return;
        e.preventDefault();
        /* a shortcut on a collapsed dock opens it first */
        if (this.mode !== 'open') { this.userCollapsed = false; this.setMode('open', 'shortcut'); }
        this.pick(next, false, true);
        this.flashLabel(LABEL[next]);
      });

      addEventListener('keyup', (e) => {
        if (e.code !== 'Space') return;
        document.body.dataset.tool = this._beforeHand || this.tool || 'select';
        this._beforeHand = null;
      });

      /* any interaction with the dock resets the idle timer */
      rack.addEventListener('pointerdown', () => this.touch());

      /* Crossing the phone boundary swaps which affordance folds the dock away,
         so the mode rules have to be re-read — a dock collapsed to its edge tab
         at 900px must not stay collapsed when the window narrows to a phone,
         where there is no tab to bring it back. */
      const mq = matchMedia(this.PHONE);
      const swap = () => { this.fabSet(false); this.applyScope(); };
      if (mq.addEventListener) mq.addEventListener('change', swap);
      else if (mq.addListener) mq.addListener(swap);
    },

    /* ====================================================== the phone's dock
       Below 768 the dock does not become a different toolbar. It becomes a
       toolbar you open: a 64px button in the bottom-right corner, and above it
       THE DOCK ITSELF — the same 48px panel, the same two hairlines, the same
       pencil and sticky note sliding out of their slots, the same plus and
       undo. Nothing is redrawn and nothing is rebuilt. The only thing this adds
       is a way to fold it away, because 286px pinned to the middle of the right
       edge is 40% of a phone screen sitting across the hero.

       So there is one toolbar on this site, not two. The edge tab is what the
       desktop folds to and the button is what the phone folds to; both open the
       same element, and `Rack.pick` remains the single place a tool is chosen.

       767.98px, not 48rem: the brief puts the tablet at 768 and up, and 48rem
       would claim 768 itself — an iPad in portrait is exactly that wide. This
       is the exclusive complement of the tablet floor, not a new breakpoint. */

    PHONE: '(max-width: 767.98px)',

    /* The MediaQueryList is made once and kept. `.matches` on a live list is a
       property read; `matchMedia()` is a parse and an allocation, and this is
       called from the scroll loop — once per frame is once too often for it. */
    phone() {
      if (typeof matchMedia !== 'function') return false;
      if (!this._mq) this._mq = matchMedia(this.PHONE);
      return this._mq.matches;
    },

    /* what the button says it is doing once a tool is live */
    LIVE: { marker: 'Drawing', note: 'Sticky Notes', sticker: 'Stickers' },

    /* `|| TOOL_ICON.cursor` is not defensive padding. This is written straight
       into innerHTML, and innerHTML of undefined is not empty — it is the seven
       letters u-n-d-e-f-i-n-e-d, rendered inside the button, on top of the
       label. Which is exactly what a missing glyph did here once. */
    fabIcon(name) {
      const map = {
        marker: TOOL_ICON.pencilTab,
        note: TOOL_ICON.noteTab,
        sticker: TOOL_ICON.plus,
      };
      return map[name] || TOOL_ICON.cursor;
    },

    fabInit(rack) {
      /* The dismissal surface. It is a child of `.tools` on purpose: the canvas
         places a note wherever you press, and that listener already skips
         anything inside `.tools`, so closing the dock by tapping the page
         cannot also drop a sticky note where you tapped. */
      const veil = el('div', { class: 'fab__veil', 'data-nopress': '', 'aria-hidden': 'true' });
      veil.addEventListener('pointerdown', (e) => { e.preventDefault(); this.fabSet(false); });

      const fab = el('button', {
        class: 'fab', type: 'button',
        'aria-haspopup': 'true', 'aria-expanded': 'false',
        'aria-label': 'Annotation tools',
      },
        '<span class="fab__ico" aria-hidden="true">' + TOOL_ICON.cursor + '</span>'
        + '<span class="fab__say"></span>');

      /* Three states, in the order you meet them:
           the dock is up      →  put it away, and keep whatever is in your hand
           a tool is live      →  the button is that tool's status pill, and the
                                  one thing a status pill should do is put the
                                  tool down
           neither             →  bring the dock up                            */
      fab.addEventListener('click', () => {
        if (this.dockOpen) { this.fabSet(false); return; }
        if (this.tool !== 'select') { this.pick('select'); return; }
        this.fabSet(true);
      });

      this.fab = fab;
      rack.append(veil, fab);
    },

    fabSet(open) {
      if (!this.fab) return;
      const next = !!open;
      if (next === !!this.dockOpen) return;
      this.dockOpen = next;
      this.rack.classList.toggle('is-dock', next);
      this.fab.setAttribute('aria-expanded', String(next));
      if (next) Sound.voice({ freq: 520, gain: 0.028, dur: 0.07, bright: 3200, drop: 1.6, noise: 0.4 });
    },

    /* the tools themselves are the dock's own chips and light up on their own;
       this is only the button's glyph and its label */
    fabSync(name) {
      if (!this.fab) return;
      const live = this.LIVE[name] || '';
      this.rack.classList.toggle('is-live', !!live);
      $('.fab__ico', this.fab).innerHTML = this.fabIcon(name);
      $('.fab__say', this.fab).textContent = live;
      this.fab.setAttribute('aria-label',
        live ? live + ' — tap to go back to Move' : 'Annotation tools');
    },

    /* Which sticker is armed. The drawer has hover states but had no selected
       state, so you couldn't tell what you were about to place. */
    setSticker(g) {
      this.sticker = g;
      if (!this.pad) return;
      $$('[data-sticker]', this.pad).forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.sticker === g));
      });
    },

    /* ------------------------------------------------------- state machine
       Four states from the brief:
         hero            open
         scrolled past   collapsed to the edge tab
         project open    open, automatically
         project closed  back to the tab

       Plus a 30s idle collapse, and a manual collapse the scroll position
       won't override. Everything routes through setMode. */

    IDLE_MS: 30000,

    onProject() {
      return document.body.dataset.page === 'project'
        || !!document.querySelector('.drawer.is-open');
    },

    onHero() {
      const hero = document.querySelector('.canvas');
      return !!hero && hero.getBoundingClientRect().bottom > innerHeight * 0.35;
    },

    setMode(next, why) {
      if (next === this.mode) return;
      const wasOpen = this.mode === 'open';
      this.mode = next;
      this.rack.classList.toggle('is-open', next === 'open');
      this.rack.classList.toggle('is-tab', next !== 'open');
      this.tab.setAttribute('aria-expanded', String(next === 'open'));

      if (next === 'open') {
        Sound.voice({ freq: 520, gain: 0.03, dur: 0.08, bright: 3200, drop: 1.6, noise: 0.4 });
        this.touch();
        if (why === 'hero') this.welcome();
      } else {
        /* a muted fold on the way in */
        Sound.voice({ freq: 300, gain: 0.026, dur: 0.11, bright: 1800, drop: 0.45, noise: 0.5 });
        this.pick('select', true);
        this.rack.classList.remove('has-ink', 'has-pad');
        Drag.deselect();
        this.hideSay();
        if (wasOpen) document.body.classList.add('past-hero');
      }
      if (next === 'open') document.body.classList.remove('past-hero');
    },

    /* re-evaluate on scroll and on drawer changes */
    applyScope() {
      /* A phone has no edge tab — the CSS hides it — so every rule below that
         collapses the dock would take the tools away with nothing left to bring
         them back. The FAB is always on screen instead, and the dock's state
         machine is simply held open behind it so that placing, drawing and the
         ink layer all keep the one condition they test for. */
      if (this.phone()) { this.setMode('open', 'phone'); return; }

      const scope = S.rack?.scope || 'contextual';
      if (scope === 'everywhere') { this.setMode('open'); return; }

      /* A study marked `reading: true` is a reading surface, so the dock stays
         collapsed to its tab and the visitor opens it if they want it. Without
         this branch applyScope re-opened the dock every frame and undid it. */
      if (this.reading && this.onProject()) { this.setMode('tab', 'reading'); return; }
      if (this.onProject()) { this.userCollapsed = false; this.setMode('open', 'project'); return; }
      if (this.onHero() && !this.userCollapsed) { this.setMode('open', 'hero'); return; }
      if (!this.onHero()) this.setMode('tab', 'scroll');
    },

    /* --- idle collapse -------------------------------------------------- */

    touch() {
      clearTimeout(this._idle);
      if (this.mode !== 'open') return;
      if (this.phone()) return;              /* nothing to collapse to */
      this._idle = setTimeout(() => {
        /* never interrupt someone mid-stroke or mid-edit */
        if (Ink.live) return this.touch();
        if (document.activeElement?.isContentEditable) return this.touch();
        if (Drag.items.some((i) => i.dragging)) return this.touch();
        if (this.onProject() && !this.reading) return;   // projects stay open
        this.userCollapsed = false;
        this.setMode('tab', 'idle');
      }, this.IDLE_MS);
    },

    /* --- the welcome line, once per session ----------------------------- */

    welcome() {
      if (this._welcomed) return;
      try { if (sessionStorage.getItem('rack:welcomed')) { this._welcomed = true; return; } } catch {}
      this._welcomed = true;
      try { sessionStorage.setItem('rack:welcomed', '1'); } catch {}
      const lines = S.rack?.welcome || ['Draw on my portfolio.', 'Press P to sketch.'];
      setTimeout(() => {
        if (this.mode !== 'open') return;
        this.showSay(lines[Math.floor(Math.random() * lines.length)], 4200);
      }, 2000);
    },

    showSay(text, ms) {
      this.say.textContent = text;
      this.say.classList.add('is-up');
      clearTimeout(this._sayT);
      this._sayT = setTimeout(() => this.say.classList.remove('is-up'), ms);
    },

    hideSay() {
      this.say.classList.remove('is-up');
      this.flash.classList.remove('is-up');
    },

    /* a tiny confirmation when a shortcut is used, gone in 700ms */
    flashLabel(text) {
      this.flash.textContent = text;
      this.flash.classList.add('is-up');
      clearTimeout(this._flashT);
      this._flashT = setTimeout(() => this.flash.classList.remove('is-up'), 700);
    },

    pick(name, silent, force) {
      /* Clicking the live tool puts it back — except when `force` is set.
         Choosing a second sticker from the drawer must re-arm the tool, not
         toggle it off. */
      if (name === this.tool && !silent && !force) name = 'select';
      this.tool = name;
      document.body.dataset.tool = name;

      if (this.rack) {
        this.rack.classList.toggle('has-ink', name === 'marker');
        this.rack.classList.toggle('has-pad', name === 'sticker');
      }

      $$('[data-tool-btn]', this.panel).forEach((b) => {
        const on = b.dataset.toolBtn === name;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });

      /* The button's glyph follows the tool, and the dock folds away — picking
         the pen or a note means you want the canvas, not the toolbar. Add is the
         exception: its drawer hangs off the dock's edge, so the dock stays up
         while you choose which sticker to place. */
      this.fabSync(name);
      if (name !== 'sticker') this.fabSet(false);

      /* the preview is the answer to "what happens if I click right now?" */
      Ghost.set(name === 'note' ? 'note' : name === 'sticker' ? 'sticker' : 'none');
      if (name === 'note' || name === 'sticker') Ghost.snap();
      wakeLoop();

      if (!silent) {
        /* picking up a physical tool sounds different from clicking a chip */
        if (name === 'marker') Sound.voice({ freq: 190, gain: 0.045, dur: 0.1, bright: 2600, drop: 1.7, noise: 0.5 });
        else if (name === 'note') Sound.voice({ freq: 380, gain: 0.04, dur: 0.07, bright: 3200, drop: 1.4, noise: 0.6 });
        else Sound.tap();
      }
    },
  };

  /* selection keyboard: the Figma bindings you reach for without thinking */
  addEventListener('keydown', (e) => {
    if (hit(e, 'input, textarea, [contenteditable="true"]')) return;
    const it = Drag.selected;
    if (!it) return;
    if (e.key === 'Escape') { Drag.deselect(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      if (it.duplicate) { const c = it.duplicate(); if (c) Drag.select(c); Sound.tap(); }
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      Drag.detach(it);
      History.push(() => Drag.reattach(it), 'restore');
      Sound.voice({ freq: 220, gain: 0.04, dur: 0.11, bright: 1300, drop: 0.42, noise: 0.5 });
    }
  });

  /* ================================================== 5c2. the canvas === */

  const KILL = '<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M1 1l6 6M7 1L1 7"/></svg>';

  /* ---------------------------------------------------------------- headline
     The hero line, built from a marked-up string in content.js. One mark:

       *text*  italic

     The marked phrase becomes ONE inline box with the per-word reveal spans
     nested inside it, rather than a class on each word. That matters for the
     italic too: slanting each word separately would let the spacing between them
     stay upright, and any decoration added later would break at the space.

     `hdl-` prefixed, never `hl-`: `.hl` is already the Shiny Highlights slide. */
  const HEAD_MARK = { '*': ['i', 'hdl-em'] };
  const HEAD_TOK = /(\*[^*]+\*)/g;

  const headline = (str, rv) => {
    const h1 = el('h1', { class: 'canvas__headline' });
    let i = 0;
    /* the markers are kept in the split so each chunk knows what it is */
    for (const chunk of String(str).split(HEAD_TOK)) {
      if (!chunk) continue;
      const kind = HEAD_MARK[chunk[0]];
      const text = kind ? chunk.slice(1, -1) : chunk;
      const host = kind ? el(kind[0], { class: kind[1] }) : h1;
      /* `\s*\S+\s*` keeps each word's own spacing with it, so ' who ' does not
         lose its edges and '.' does not gain any */
      for (const word of text.match(/\s*\S+\s*|\s+/g) || []) {
        host.appendChild(el('span', {
          class: 'rw rv',
          style: `--rv-dur:${rv.headline || 1100}ms;--rv-delay:${i * (rv.wordStagger || 9)}ms;`
               + `--rv-blur:${rv.blur || 14}px`,
        }, esc(word)));
        i++;
      }
      if (host !== h1) h1.appendChild(host);
    }
    return h1;
  };

  /* ==========================================================================
     PEEL — the stickers around the headline
     ==========================================================================

     This is React Bits' StickerPeel, without React, without GSAP, and without a
     build step. That isn't a shortcut — it's what the component actually is once
     you look at it.

     The peel is two copies of the same image and a clip-path. `.sticker-main`
     is the sticker with its top edge clipped away; `.flap` is the same image
     flipped with `scaleY(-1)`, clipped to only the strip that was removed, and
     parked directly above so the two meet exactly at the cut. Move the cut down
     on hover and the flap grows downward from the same line: the top of the
     sticker appears to fold over onto itself. A CSS transition on `clip-path`
     is the entire animation.

     The `filter` chain is what stops it looking like paper cut in half. The
     flap gets `expandAndFill`, which floods its silhouette flat grey — that's
     the adhesive back of the sticker, and without it you'd see the artwork
     mirrored. Both halves get a specular light that follows the cursor, so the
     fold catches a highlight as it lifts. And the body carries a drop shadow
     that the flap doesn't, so the lifted part reads as off the page.

     WHAT THE ORIGINAL USED THAT THIS DOESN'T. React, for two refs and four
     effects — this needs neither. GSAP's Draggable, for dragging with inertia,
     which the Drag module in this file already does, along with selection,
     rotate handles, delete and undo that GSAP wouldn't have given us. And
     GSAP's `set` to move the light, which is `setAttribute`.

     ONE FIX ON THE WAY THROUGH. The original hard-codes its filter IDs, so
     rendering more than one sticker gives every copy the same four IDs and they
     all resolve to the first — every light on the page follows whichever
     sticker mounted first. Here each sticker gets its own suffixed set.      */

  const Peel = {
    items: [],

    init(host) {
      const defs = (S.canvas && S.canvas.peel) || [];
      if (!defs.length) return;
      this.host = host;
      const c = Object.assign({
        pad: 10, hoverPct: 30, activePct: 40, shadow: 0.55, light: 0.1,
      }, S.canvas.peelStyle || {});

      const layer = el('div', { class: 'peel' });
      /* 48rem is the mobile ceiling on the documented scale — see --bp-portrait
         in site.css. It was 46rem, a number from nowhere, which meant the hero
         thinned out at 736 while every other mobile rule waited for 768. */
      const narrow = matchMedia('(max-width: 48rem)').matches;

      defs.forEach((d, i) => {
        if (narrow && d.mobile === false) return;
        const uid = `pl${i}`;

        const wrap = el('div', { class: 'drg peelstk', 'data-id': d.id, title: d.label || '' });
        wrap.style.setProperty('--sticker-width', `${d.w}px`);
        wrap.style.setProperty('--sticker-p', `${c.pad}px`);
        wrap.style.setProperty('--sticker-peelback-hover', `${d.hover ?? c.hoverPct}%`);
        wrap.style.setProperty('--sticker-peelback-active', `${d.active ?? c.activePct}%`);
        wrap.style.setProperty('--peel-direction', `${d.dir || 0}deg`);
        wrap.style.setProperty('--sticker-shadow-opacity', d.shadow ?? c.shadow);

        wrap.innerHTML = this.filters(uid, d.shadow ?? c.shadow, d.light ?? c.light);

        const box = el('div', { class: 'sticker-container' });
        box.innerHTML =
          `<div class="sticker-main" style="filter:url(#drop-${uid})">`
          + `<div class="sticker-lighting" style="filter:url(#lit-${uid})">`
          + `<img class="sticker-image" src="${esc(d.src)}" alt="" draggable="false"></div></div>`
          + `<div class="flap">`
          + `<div class="flap-lighting" style="filter:url(#litflip-${uid})">`
          + `<img class="flap-image" src="${esc(d.src)}" alt="" draggable="false" `
          + `style="filter:url(#fill-${uid})"></div></div>`;
        wrap.appendChild(box);
        layer.appendChild(wrap);

        const img = $('.sticker-image', box);
        img.addEventListener('load', () => this.place(), { once: true });

        /* The site's own drag: inertia, the lean into the direction of travel,
           selection with rotate and resize handles, delete, ⌘D, undo. All of it
           already written, and all of it consistent with the pills and the
           notes — which GSAP's Draggable would not have been. */
        const pit = Drag.make(wrap, { r: d.rot || 0 });

        const it = { def: d, wrap, box, pit, w: 0, h: 0 };

        /* the specular highlight follows the cursor across the sticker, and is
           parked off-canvas whenever the cursor isn't on it — see `filters` for
           why a resting light washes the artwork out rather than lighting it */
        if (!REDUCED) {
          const a = $(`#pt-${uid}`, wrap);
          const b = $(`#ptf-${uid}`, wrap);
          const park = () => {
            a.setAttribute('x', -9999); a.setAttribute('y', -9999);
            b.setAttribute('x', -9999); b.setAttribute('y', -9999);
          };
          box.addEventListener('pointerleave', park);
          box.addEventListener('pointercancel', park);
          box.addEventListener('pointermove', (e) => {
            const r = box.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            a.setAttribute('x', x); a.setAttribute('y', y);
            /* Peeling straight down is the one case where the flap's light
               would sit on the wrong side of the fold; park it off-canvas. */
            if (Math.abs((d.dir || 0) % 360) !== 180) {
              b.setAttribute('x', x); b.setAttribute('y', r.height - y);
            } else {
              b.setAttribute('x', -1000); b.setAttribute('y', -1000);
            }
          }, { passive: true });
        }

        /* touch has no hover, so the peel opens on press instead */
        box.addEventListener('touchstart', () => box.classList.add('touch-active'), { passive: true });
        const off = () => box.classList.remove('touch-active');
        box.addEventListener('touchend', off);
        box.addEventListener('touchcancel', off);

        this.items.push(it);
      });

      if (!this.items.length) return;
      host.appendChild(layer);
      addEventListener('resize', () => this.place());
      this.place();
      requestAnimationFrame(() => this.place());

      /* The no-go zone is not its final size when the stickers first land. The
         CTA row is appended to the intro after this module runs, and the
         headline reflows again when the webfont swaps in — both make the text
         box taller than it was at first paint. A sticker placed against the
         stale box kept the correction it was given for an overlap that no
         longer existed, so the controller sat 8% high on every load with
         nothing on screen to explain why. Re-place whenever the text resizes;
         fonts.ready covers browsers without ResizeObserver. */
      const intro = $('.canvas__intro', host);
      if (intro) {
        if (window.ResizeObserver) {
          const ro = new ResizeObserver(() => this.place());
          ro.observe(intro);
          /* the headline too: it rewraps when the webfont swaps without the
             column around it changing size */
          const h = $('.canvas__headline', intro);
          if (h) ro.observe(h);
        }
        /* And once the load reveal has finished moving. A tag part-way through
           its entrance is somewhere it will not be in a second's time — the
           pills measured ~480px wider mid-flight than at rest — and a sticker
           corrected against that transient keeps the correction. Debounced on
           the last transition to end anywhere in the intro, so it tracks the
           reveal timings in content.js instead of hard-coding them. */
        let settle = 0;
        const again = () => {
          clearTimeout(settle);
          settle = setTimeout(() => this.place(), 60);
        };
        intro.addEventListener('transitionend', again);
        intro.addEventListener('animationend', again);
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.place());
      }
      window.__peel = this;   /* test hook, same as __pills */
    },

    /* One set per sticker, suffixed. The original names them once and renders
       them per instance, which means the second sticker's light silently drives
       the first one's.

       WHERE THE LIGHT STARTS. Off-canvas, not at (100,100). The interior of a
       cut-out is a flat alpha plateau, so its surface normal is (0,0,1)
       everywhere and feSpecularLighting has no shape to catch — a point light
       hanging over it doesn't read as a highlight, it lays a flat ~10% white
       veil across whatever it covers. Parked at 100,100 that veil sat inside
       every sticker's top-left corner at first paint, which is what made the
       artwork look washed out before you had touched anything. It belongs
       nowhere until the cursor is actually on the sticker; `park()` in init
       puts it back the moment the cursor leaves.

       THE SHADOW. One tight feDropShadow reads as ink printed on the page. Two
       stacked read as an object resting on it: a short dark contact shadow that
       hugs the die-cut edge, then a wide soft ambient one for the lift. They
       chain — the ambient pass blurs the contact pass along with the artwork,
       which is what real penumbra does. The explicit filter region is needed
       because the default (-10%/120%) crops the wide pass. */
    filters(uid, shadow, light) {
      return `<svg width="0" height="0" aria-hidden="true" class="peel__defs"><defs>`
        + `<filter id="lit-${uid}">`
        + `<feGaussianBlur stdDeviation="1" result="blur"/>`
        + `<feSpecularLighting result="spec" in="blur" specularExponent="100" `
        + `specularConstant="${light}" lighting-color="white">`
        + `<fePointLight id="pt-${uid}" x="-9999" y="-9999" z="300"/></feSpecularLighting>`
        + `<feComposite in="spec" in2="SourceGraphic" result="lit"/>`
        + `<feComposite in="lit" in2="SourceAlpha" operator="in"/></filter>`
        + `<filter id="litflip-${uid}">`
        + `<feGaussianBlur stdDeviation="10" result="blur"/>`
        + `<feSpecularLighting result="spec" in="blur" specularExponent="100" `
        + `specularConstant="${light * 7}" lighting-color="white">`
        + `<fePointLight id="ptf-${uid}" x="-9999" y="-9999" z="300"/></feSpecularLighting>`
        + `<feComposite in="spec" in2="SourceGraphic" result="lit"/>`
        + `<feComposite in="lit" in2="SourceAlpha" operator="in"/></filter>`
        + `<filter id="drop-${uid}" x="-35%" y="-35%" width="170%" height="180%">`
        + `<feDropShadow dx="0" dy="1.5" stdDeviation="1.2" `
        + `flood-color="rgb(24,18,14)" flood-opacity="${(shadow * 0.62).toFixed(3)}"/>`
        + `<feDropShadow dx="0" dy="${(9 * shadow).toFixed(2)}" `
        + `stdDeviation="${(11 * shadow).toFixed(2)}" `
        + `flood-color="rgb(24,18,14)" flood-opacity="${(shadow * 0.34).toFixed(3)}"/></filter>`
        /* the adhesive back: the flap's own silhouette, flooded flat grey, so
           the folded part isn't the artwork mirrored */
        + `<filter id="fill-${uid}">`
        + `<feOffset dx="0" dy="0" in="SourceAlpha" result="shape"/>`
        + `<feFlood flood-color="rgb(179,179,179)" result="flood"/>`
        + `<feComposite operator="in" in="flood" in2="shape"/></filter>`
        + `</defs></svg>`;
    },

    /* --- the no-go zone ------------------------------------------------------
       The rectangle the headline, tags and buttons actually occupy — not the
       column they sit in.

       `.canvas__intro` is the obvious thing to measure and it is the wrong one.
       It's a block, so it takes the full width available to it whatever
       `width: fit-content` suggests, and the headline wraps at 18ch well short
       of that edge. At 1440 the box read 704px wide against 385px of ink, and
       the ~320px of empty column on the right counted as occupied: the PS5
       controller, placed at 59%, collided with nothing and was pushed to 74%.
       The arrangement in content.js silently stopped being the arrangement on
       screen.

       So: line boxes for the text via a Range — which gives the wrapped lines
       rather than the paragraph box — unioned with the element rects of the
       tags and buttons, which have rounded backgrounds that extend past their
       glyphs. Empty rects are skipped; a zero-width line box would drag the
       union out to the left margin.                                          */
    safeZone(host) {
      const intro = $('.canvas__intro', host);
      if (!intro) return null;

      const boxes = [];
      const head = $('.canvas__headline', intro);
      if (head) {
        /* Feature-detect the method, not `createRange`. jsdom has the latter
           and not the former, so testing the wrong one throws inside the
           harnesses — where it surfaces as unrelated pages failing to render,
           because site.js dies before it finishes booting. */
        const rg = document.createRange && document.createRange();
        if (rg && rg.getClientRects) {
          rg.selectNodeContents(head);
          boxes.push(...rg.getClientRects());
        } else {
          boxes.push(head.getBoundingClientRect());
        }
      }
      boxes.push(...[...intro.querySelectorAll('.canvas__pills .drg, .canvas__cta > *')]
        .map((n) => n.getBoundingClientRect()));

      let l = Infinity, t = Infinity, rt = -Infinity, b = -Infinity;
      boxes.forEach((k) => {
        if (!k.width || !k.height) return;
        l = Math.min(l, k.left); t = Math.min(t, k.top);
        rt = Math.max(rt, k.right); b = Math.max(b, k.bottom);
      });
      /* Nothing measurable yet — first paint, before the word spans exist.
         Return null and skip the push this pass rather than falling back to the
         intro's own box. That fallback is what made this hard to see: the
         column is ~320px wider than the text, the very first place() ran
         against it, the controller was corrected for an overlap with empty
         space, and no later pass ever revisited it because by then the box was
         correct and the sticker looked deliberately placed. A pass that
         declines to guess costs one frame; a pass that guesses wrong is
         permanent. */
      if (!isFinite(l)) return null;

      /* A sanity bound, against the canvas rather than the intro. It used to be
         the intro's own box, which worked while that box was the full column —
         now the headline layer hugs its text and the tag row overflows it, so
         clamping there would cut the zone short of the tags. */
      const col = (host && host.getBoundingClientRect())
        || intro.getBoundingClientRect();
      return {
        left: Math.max(l, col.left), top: Math.max(t, col.top),
        right: Math.min(rt, col.right), bottom: Math.min(b, col.bottom),
      };
    },

    /* --- placement ---------------------------------------------------------
       Percentages of the hero, so the composition survives a resize. Widths
       scale off a 1440px reference, which stops a 13" laptop getting the same
       200px controller as a 27" display. */
    place() {
      const host = this.host;
      if (!host || !this.items.length) return;
      const r = host.getBoundingClientRect();
      /* Scaling everything off a 1440 reference gives a 390px screen objects at
         27% — legible on a desk, specks in a hand. A phone measures against a
         phone. */
      const narrowNow = r.width <= 768;
      const scale = narrowNow
        ? clamp(r.width / 430, 0.66, 1.04)
        : clamp(r.width / 1440, 0.55, 1.1);

      /* the one thing a sticker may never cover, measured rather than assumed */
      const safe = this.safeZone(host);

      /* HOW MUCH ROOM IS LEFT, which on a phone decides the whole composition.

         The safe zone is one union box around the headline, the tags and the
         buttons, and on a narrow screen that box is nearly the full width — so
         a sticker cannot sit BESIDE the text the way it does on a desktop. It
         is pushed out sideways and clamped at the edge. Everything has to go
         below.

         How far below is the whole question, and it is not a function of width.
         An SE at 320x568 ends its buttons at 69% of the hero and leaves a 15%
         strip; a 14 Pro at 390x844 ends them at 46% and leaves half the screen.
         Same layout in both is either a pile or a shelf with a hole above it.

         So: if the content clears the upper half, there is a lower half to
         compose in and the roomy coordinates are used. If it does not, the
         stickers line up in the strip that is left. 55% rather than 50% because
         a sticker needs its own height below the line, not just its centre. */
      const roomy = !!safe && (safe.bottom - r.top) < r.height * 0.55;

      this.items.forEach((it) => {
        const d = it.def;
        const mob = (narrowNow && d.mobile && typeof d.mobile === 'object') ? d.mobile : null;
        /* `tall` overrides only what it names, so a sticker that sits in the
           same place either way says so by leaving it out */
        const mw = (mob && roomy && mob.tall) ? Object.assign({}, mob, mob.tall) : mob;
        const w = Math.round(((mw && mw.w) || d.w) * scale);
        it.wrap.style.setProperty('--sticker-width', `${w}px`);
        const img = $('.sticker-image', it.box);
        const ratio = img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1;
        it.w = w;
        it.h = Math.round(w * ratio);
        it.wrap.style.setProperty('--sticker-art-h', `${it.h}px`);

        /* The container's box, which is the artwork's bounding box at the angle
           this one peels from — see .sticker-container in site.css for why it
           can't just be the artwork's own box. Collapses to exactly w x h at 0
           and 180, so a top or bottom peel is unaffected. */
        const rad = ((d.dir || 0) * Math.PI) / 180;
        const ca = Math.abs(Math.cos(rad)), sa = Math.abs(Math.sin(rad));
        it.wrap.style.setProperty('--sticker-box-w', `${Math.round(w * ca + it.h * sa)}px`);
        it.wrap.style.setProperty('--sticker-box-h', `${Math.round(w * sa + it.h * ca)}px`);

        /* A PHONE GETS ITS OWN COORDINATES. The desktop ring is drawn around a
           headline that sits in the top-left of a wide screen; on a tall narrow
           one the text takes the whole upper half and there is no ring to be
           in. `mobile: { x, y, w }` in content.js is the same object placed
           again, and anything it leaves out falls back to the desktop value. */
        const m = mw;
        let x = (((m && m.x != null) ? m.x : d.x) / 100) * r.width - w / 2;
        let y = (((m && m.y != null) ? m.y : d.y) / 100) * r.height - it.h / 2;

        if (safe) {
          const pad = 20;
          const sl = safe.left - r.left - pad, sr = safe.right - r.left + pad;
          const st = safe.top - r.top - pad, sb = safe.bottom - r.top + pad;
          if (x + w > sl && x < sr && y + it.h > st && y < sb) {
            /* Out the nearest side. This used to consider only right and down,
               which is the wrong pair for anything sitting to the left of the
               text or above it: the can overlapped the headline's left edge by
               a dozen px and got sent the full width of the column downward,
               off the bottom of the screen. Four candidates, shortest wins, so
               a small overlap costs a small correction. */
            const outs = [
              [sl - (x + w), 0],   // left
              [sr - x, 0],         // right
              [0, st - (y + it.h)],// up
              [0, sb - y],         // down
            ];
            const [ox, oy] = outs.reduce((a, b) =>
              (Math.abs(a[0]) + Math.abs(a[1]) <= Math.abs(b[0]) + Math.abs(b[1]) ? a : b));
            x += ox; y += oy;
          }
        }

        /* a sliver of bleed is allowed, so the scene doesn't read as boxed in */
        it.wrap.style.left = `${clamp(x, -w * 0.18, r.width - w * 0.82)}px`;
        it.wrap.style.top = `${clamp(y, -it.h * 0.1, r.height - it.h * 0.9)}px`;
      });
    },
  };

  const Canvas = {
    noteN: 0,
    surface: null,

    /* --- the headline's box ------------------------------------------------
       Shrink the headline layer onto the words it actually renders.

       `width: fit-content` cannot do this. The h1's cap is `min(100%, 18ch)`,
       and a percentage is indefinite while the parent is being intrinsically
       sized, so Chrome drops the cap entirely and takes the h1's max-content to
       be the whole sentence on one line. That overflows the column, `max-width:
       100%` clamps it back, and the layer ends up exactly as wide as the space
       available — 704px around 338px of text at 1440. Invisible until you
       select it, at which point the frame is drawn round several hundred px of
       nothing.

       Even without that, fit-content would still be wrong here: it sizes to the
       cap, and once text wraps, the longest line is narrower than the cap.
       There is no declarative width that means "as wide as the longest line" —
       it can only be measured after the fact.

       So the h1 keeps the width it chose, pinned, and only the layer around it
       shrinks. Pinning matters: the h1 is an inline-block, so its shrink-to-fit
       reads the parent's width, and narrowing the parent without freezing the
       child re-wraps the sentence and changes where the lines break. The h1
       overflows the layer to the right by whatever slack it had, and that slack
       is empty by definition — it is the part with no glyphs in it. */
    fitHead(head) {
      const h1 = head && $('.canvas__headline', head);
      if (!h1 || !document.createRange) return;
      const rg = document.createRange();
      if (!rg.getClientRects) return;

      /* measure from a clean slate, or each pass would compound the last */
      h1.style.width = ''; h1.style.maxWidth = ''; head.style.width = '';
      const natural = h1.getBoundingClientRect().width;

      rg.selectNodeContents(h1);
      let l = Infinity, r = -Infinity;
      for (const k of rg.getClientRects()) {
        if (!k.width || !k.height) continue;
        l = Math.min(l, k.left); r = Math.max(r, k.right);
      }
      if (!isFinite(l) || r - l < 1) return;      // nothing rendered yet

      h1.style.width = `${Math.ceil(natural)}px`;
      h1.style.maxWidth = 'none';
      head.style.width = `${Math.ceil(r - l)}px`;
      if (Drag.selected && Drag.selected.node === head) {
        Drag.measure(Drag.selected); Drag.syncGuides();
      }
    },

    /* Notes and stickers land on whichever surface is currently the "project":
       the hero canvas on the homepage, the sheet on a case-study page, or the
       drawer's scroll container when a study is open inside it. */
    setSurface(node) {
      this.surface = node;
      this.host = node;
      /* the ink is a layer of the surface, so it moves with it */
      Ink.mountOn(node);
    },

    /* one listener, wherever the surface happens to be */
    placement() {
      if (this._placementBound) return;
      this._placementBound = true;
      document.addEventListener('pointerdown', (e) => {
        const host = this.surface;
        if (!host) return;
        if (Rack.mode !== 'open') return;                // no panel, no placing
        if (hit(e, '.drg, .tools, .btn, .drawer__bar, .rail')) return;
        if (!host.contains(e.target) && host !== document.body) return;
        const r = host.getBoundingClientRect();
        const x = e.clientX - r.left + (host.scrollLeft || 0);
        const y = e.clientY - r.top + (host.scrollTop || 0);
        if (Rack.tool === 'note') {
          this.note(x, y);
          /* continuous placement keeps the tool armed; otherwise drop to Move */
          if (!S.canvas?.continuousNotes) Rack.pick('select');
          else Ghost.snap();
        }
        else if (Rack.tool === 'sticker' && Rack.sticker) { this.sticker(Rack.sticker, x, y); }
        else if (Rack.tool === 'select') Drag.deselect();
      });
    },

    init(host) {
      const c = S.canvas;
      if (!c) return;
      host.classList.add('canvas');
      host.appendChild(el('div', { class: 'canvas__dots', 'aria-hidden': 'true' }));

      const rv = c.reveal || {};
      const intro = el('div', { class: 'canvas__intro' });
      /* the heading is a text layer: selectable, movable, rotatable, resizable */
      const head = el('div', { class: 'drg canvas__head', style: 'position:relative' });
      /* split into words so the reveal resolves left to right — that's what
         makes the second line trail the first, as it does in the recording */
      head.appendChild(headline(c.headline, rv));
      intro.appendChild(head);
      Drag.make(head, {});
      this.fitHead(head);
      /* the wrap moves when the webfont lands and when the column changes */
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.fitHead(head));
      }
      addEventListener('resize', () => this.fitHead(head), { passive: true });

      const pills = el('div', { class: 'canvas__pills' });
      const made = [];
      (c.pills || []).forEach((raw, i) => {
        const item = typeof raw === 'string' ? { label: raw } : raw;
        const wrap = el('div', { class: 'drg' });
        const pill = el('span', { class: 'pill' });
        if (item.icon && PILL_ICON[item.icon]) {
          pill.appendChild(el('span', { class: 'pill__icon' }, PILL_ICON[item.icon]));
        } else if (item.logo) {
          pill.appendChild(el('span', { class: 'pill__icon pill__icon--logo' },
            `<img src="${item.logo}" alt="">`));
        }
        pill.appendChild(el('span', { class: 'pill__label' }, esc(item.label)));
        if (item.detail) pill.appendChild(el('span', { class: 'pill__detail' }, esc(item.detail)));
        pill.classList.add('rv');
        pill.style.setProperty('--rv-dur', `${rv.pills || 850}ms`);
        pill.style.setProperty('--rv-delay', `${(rv.pillsAt || 1050) + i * (rv.pillStagger || 55)}ms`);
        pill.style.setProperty('--rv-blur', `${rv.blur || 14}px`);
        wrap.appendChild(pill);
        pills.appendChild(wrap);

        const pit = Drag.make(wrap, { r: (i % 2 ? 0.5 : -0.6) });
        pit.duplicate = () => {
          const clone = wrap.cloneNode(true);
          clone.classList.remove('is-sel');
          pills.appendChild(clone);
          const ci = Drag.make(clone, { r: pit.rest });
          ci.x = pit.x + 18; ci.y = pit.y + 18;
          ci.duplicate = pit.duplicate;
          Drag.apply(ci); Drag.raise(ci);
          History.push(() => Drag.detach(ci), 'duplicate');
          return ci;
        };
        made.push({ wrap, pit });
      });

      /* Lay the row out from the pills' *measured* widths. Estimating from
         character counts put them on top of each other.

         Each pill also gets its *open* width measured, so hovering can push the
         tags after it aside by exactly the space the detail needs. Measuring
         beats arithmetic here: the open width includes the hairline divider and
         its margins, which are CSS's business, not JS's. */
      const layout = () => {
        const max = pills.clientWidth || 640;
        let x = 0, row = 0;
        made.forEach((m) => {
          const pill = m.wrap.querySelector('.pill');
          const w = pill.offsetWidth || 90;
          let open = w;
          if (pill.querySelector('.pill__detail')) {
            m.wrap.classList.add('is-measuring');
            open = pill.offsetWidth || w;
            m.wrap.classList.remove('is-measuring');
          }
          m.grow = Math.max(0, open - w);
          if (x && x + w > max) { x = 0; row += 1; }
          m.row = row;
          m.col = x;
          m.wrap.style.setProperty('--col', `${x}px`);
          m.wrap.style.top = `${row * 40}px`;
          x += w + 8;
        });
        pills.style.height = `${(row + 1) * 40}px`;
      };
      requestAnimationFrame(layout);
      addEventListener('resize', layout);

      /* Slide the later tags on the same row aside while a detail is open. A
         tag the visitor has dragged off its spot is left alone — it's theirs
         now, and shoving it would undo their placement. */
      const nudge = (src) => {
        made.forEach((m) => {
          if (m.pit.x || m.pit.y) { m.wrap.style.setProperty('--nudge', '0px'); return; }
          const after = src && m !== src && m.row === src.row && m.col > src.col;
          m.wrap.style.setProperty('--nudge', after ? `${src.grow}px` : '0px');
        });
      };
      made.forEach((m) => {
        m.wrap.addEventListener('pointerenter', () => { if (m.grow) nudge(m); });
        m.wrap.addEventListener('pointerleave', () => {
          /* a selected tag keeps its detail open, so it keeps the room too */
          if (m.grow && !m.wrap.classList.contains('is-sel')) nudge(null);
        });
      });
      window.__nudge = nudge;   /* test hooks */
      window.__pills = made;

      intro.appendChild(pills);
      host.appendChild(intro);

      /* the rotating hint */
      const hint = el('div', { class: 'canvas__hint rv' });
      hint.style.setProperty('--rv-delay', `${rv.hintAt || 2600}ms`);
      hint.style.setProperty('--rv-blur', `${rv.blur || 14}px`);
      const hintText = el('span');
      hint.appendChild(hintText);
      host.appendChild(hint);
      /* --- the shortcut legend ------------------------------------------
         Keycaps along the bottom of the hero. Two details earn their keep:
         'Mod' resolves to ⌘ or Ctrl per platform, and a cap lights up when its
         key is actually pressed, which turns the legend from a static list into
         feedback that the shortcut landed. */
      const APPLE = /Mac|iPhone|iPad|iPod/i.test(
        navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);
      const CAP = {
        mod: APPLE ? '\u2318' : 'Ctrl', shift: '\u21e7', alt: APPLE ? '\u2325' : 'Alt',
        enter: '\u21a9', esc: 'Esc', space: 'Space', tab: '\u21e5',
        del: APPLE ? '\u232b' : 'Del', backspace: '\u232b',
        up: '\u2191', down: '\u2193', left: '\u2190', right: '\u2192',
      };
      /* which physical keys light which cap */
      const MATCH = {
        mod: (e) => e.metaKey || e.ctrlKey,
        shift: (e) => e.shiftKey,
        alt: (e) => e.altKey,
        esc: (e) => e.key === 'Escape',
        space: (e) => e.code === 'Space',
        enter: (e) => e.key === 'Enter',
        tab: (e) => e.key === 'Tab',
        del: (e) => e.key === 'Delete' || e.key === 'Backspace',
        backspace: (e) => e.key === 'Delete' || e.key === 'Backspace',
        up: (e) => e.key === 'ArrowUp', down: (e) => e.key === 'ArrowDown',
        left: (e) => e.key === 'ArrowLeft', right: (e) => e.key === 'ArrowRight',
      };
      const rows = c.keys || [];
      if (rows.length) {
        const legend = el('div', { class: 'canvas__keys', 'aria-hidden': 'true' });
        const caps = [];
        rows.forEach((row, i) => {
          const item = el('div', { class: 'keyhint rv' });
          item.style.setProperty('--rv-delay',
            `${(rv.keysAt || rv.hintAt || 2600) + i * (rv.keyStagger || 70)}ms`);
          item.style.setProperty('--rv-blur', `${rv.blur || 14}px`);
          item.appendChild(el('span', { class: 'keyhint__label' }, esc(row.label)));
          const group = el('span', { class: 'keyhint__keys' });
          (row.keys || []).forEach((raw) => {
            const k = String(raw).toLowerCase();
            const cap = el('kbd', { class: 'cap' }, esc(CAP[k] || String(raw).toUpperCase()));
            /* a wide glyph like Ctrl or Space needs the room */
            if ((CAP[k] || raw).length > 2) cap.classList.add('cap--wide');
            group.appendChild(cap);
            caps.push({ cap, test: MATCH[k] || ((e) => e.key.toLowerCase() === k) });
          });
          item.appendChild(group);
          legend.appendChild(item);
        });
        host.appendChild(legend);

        /* light the caps that match what's held down */
        const paint = (e, on) => {
          caps.forEach(({ cap, test }) => {
            let match = false;
            try { match = !!test(e); } catch (_) { match = false; }
            if (match) cap.classList.toggle('is-hit', on);
            else if (on) cap.classList.remove('is-hit');
          });
        };
        addEventListener('keydown', (e) => {
          if (hit(e, 'input, textarea, [contenteditable]')) return;
          paint(e, true);
        });
        addEventListener('keyup', (e) => paint(e, false));
        /* tabbing away mid-press would otherwise leave a cap stuck lit */
        addEventListener('blur', () => caps.forEach(({ cap }) => cap.classList.remove('is-hit')));
      }

      const hints = c.hints || [];
      if (hints.length) {
        let hi = 0;
        hintText.textContent = hints[0];
        setInterval(() => {
          hintText.classList.add('is-out');
          setTimeout(() => {
            hi = (hi + 1) % hints.length;
            hintText.textContent = hints[hi];
            hintText.classList.remove('is-out');
          }, 460);
        }, 4200);
      }

      /* The stickers go in last so the safe-zone pass in Peel.place() measures
         a headline and a pill row that are already laid out. */
      Peel.init(host);

      this.setSurface(host);
      this.placement();

      /* very slow cursor parallax on the dot grid */
      if (!REDUCED) {
        const dots = $('.canvas__dots', host);
        let tx = 0, ty = 0;
        host.addEventListener('pointermove', (e) => {
          const r = host.getBoundingClientRect();
          tx = ((e.clientX - r.left) / r.width - 0.5) * -18;
          ty = ((e.clientY - r.top) / r.height - 0.5) * -18;
        }, { passive: true });
        this.parallax = (dt) => {
          const cx = parseFloat(dots.style.getPropertyValue('--px')) || 0;
          const cy = parseFloat(dots.style.getPropertyValue('--py')) || 0;
          const nx = lerp(cx, tx, Math.min(1, dt * 2.2));
          const ny = lerp(cy, ty, Math.min(1, dt * 2.2));
          if (Math.abs(nx - cx) < 0.02 && Math.abs(ny - cy) < 0.02) return false;
          dots.style.setProperty('--px', `${nx.toFixed(2)}px`);
          dots.style.setProperty('--py', `${ny.toFixed(2)}px`);
          return true;
        };
      }
    },

    note(x, y) {
      const cols = S.canvas.noteColours || ['#fff3b0'];
      const wrap = el('div', { class: 'drg', style: `left:${x - 88}px;top:${y - 40}px` });
      const note = el('div', { class: 'note', style: `--note:${cols[this.noteN++ % cols.length]}` });
      const text = el('div', {
        class: 'note__text', contenteditable: 'true', role: 'textbox',
        'data-placeholder': 'Type anything,\n@mention anyone', 'data-nodrag': '',
      });
      note.appendChild(text);
      note.appendChild(el('span', { class: 'note__by' }, esc(S.person.name)));
      wrap.appendChild(note);
      this.host.appendChild(wrap);

      /* Selection is the whole affordance — outline, corner handles, rotation
         knob. Rotate and resize live on the handles; duplicate and delete are
         ⌘D and Delete. No floating button bar. */
      const it = Drag.make(wrap, { r: (Math.random() - 0.5) * 5 });
      it.duplicate = () => this.note(it.x + x + 24, it.y + y + 24);
      Drag.raise(it);
      History.push(() => Drag.detach(it), 'note');

      /* a paper-placement pop, then focus so you can just type */
      Sound.voice({ freq: 420, gain: 0.045, dur: 0.07, bright: 3000, drop: 1.5, noise: 0.65 });
      requestAnimationFrame(() => text.focus());
      return it;
    },

    sticker(glyph, x, y) {
      const wrap = el('div', { class: 'drg', style: `left:${x - 20}px;top:${y - 20}px` });
      const base = S.canvas?.stickerPath || 'assets/img/pixel/';
      wrap.appendChild(el('span', { class: 'stk' },
        `<img src="${base}${glyph}.svg" alt="" draggable="false">`));
      this.host.appendChild(wrap);

      const it = Drag.make(wrap, { r: (Math.random() - 0.5) * 6 });   // ±3°
      it.duplicate = () => this.sticker(glyph, it.x + x + 26, it.y + y + 26);
      Drag.raise(it);
      History.push(() => Drag.detach(it), 'sticker');
      Sound.voice({ freq: 700, gain: 0.035, dur: 0.05, bright: 4000, drop: 1.6, noise: 0.6 });
      return it;
    },

    /* the double-click-undo gesture wipes the whole annotation layer */
    clearAll() {
      const had = Ink.strokes.length || $$('.drg .note, .drg .stk', this.host).length;
      Ink.strokes.length = 0;
      Ink.draw();
      $$('.note, .stk', this.host).forEach((n) => {
        const wrap = n.closest('.drg');
        const it = Drag.items.find((i) => i.node === wrap);
        if (it) Drag.detach(it); else wrap?.remove();
      });
      History.clear();
      if (had) Sound.voice({ freq: 150, gain: 0.05, dur: 0.2, bright: 1100, drop: 0.4, noise: 0.5 });
    },
  };

  /* ================================================== 5c3. tool ghost === */

  /* The cursor-attached preview. One element, retargeted per tool, following
     the pointer with a ~70ms time constant so it trails rather than snaps.
     Its tilt comes from pointer velocity, which is what makes it feel like a
     physical thing being carried. */
  const Ghost = {
    x: 0, y: 0, vx: 0, kind: 'none',
    SMOOTH: 0.07,           // seconds — the lag the spec asks for
    MAX_TILT: 2,            // degrees

    init() {
      this.el = el('div', { class: 'ghost', 'aria-hidden': 'true' });
      this.inner = el('div', { class: 'ghost__inner' });
      this.el.appendChild(this.inner);
      document.body.appendChild(this.el);

      addEventListener('pointermove', (e) => {
        Pointer.x = e.clientX;
        Pointer.y = e.clientY;
        Pointer.seen = true;
      }, { passive: true });
    },

    /* swap what's being previewed, crossfading rather than cutting */
    set(kind) {
      if (kind === this.kind) return;
      const paint = () => {
        this.kind = kind;
        if (kind === 'note') {
          const cols = S.canvas?.noteColours || ['#c9b8f5'];
          this.inner.innerHTML =
            `<div class="ghost__note" style="--note:${cols[Canvas.noteN % cols.length]}"></div>`;
        } else if (kind === 'sticker') {
          const base = S.canvas?.stickerPath || 'assets/img/pixel/';
          const g = Rack.sticker || (S.canvas?.stickers || [])[0];
          this.inner.innerHTML = `<div class="ghost__stk"><img src="${base}${g}.svg" alt=""></div>`;
        } else {
          this.inner.innerHTML = '';
        }
        this.el.classList.toggle('is-on', kind !== 'none');
      };

      if (this.kind === 'none') { paint(); return; }
      /* fade the old one out, swap, fade the new one in */
      this.el.classList.add('is-swap');
      clearTimeout(this._swap);
      this._swap = setTimeout(() => {
        paint();
        this.el.classList.remove('is-swap');
      }, 200);
    },

    /* jump to the pointer without a visible glide when a tool is first armed */
    snap() {
      this.x = Pointer.x; this.y = Pointer.y; this.vx = 0;
      this.apply();
    },

    apply() {
      const tilt = clamp(this.vx * 0.06, -this.MAX_TILT, this.MAX_TILT);
      this.el.style.transform =
        `translate3d(${this.x.toFixed(1)}px, ${this.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
    },

    tick(dt) {
      if (this.kind === 'none' || !Pointer.seen) return false;
      /* exponential smoothing, framerate independent */
      const k = 1 - Math.exp(-Math.min(dt, 1 / 30) / this.SMOOTH);
      const dx = (Pointer.x - this.x) * k;
      this.x += dx;
      this.y += (Pointer.y - this.y) * k;
      this.vx = this.vx * 0.82 + dx * 0.18 * 60;
      this.apply();
      return Math.abs(Pointer.x - this.x) > 0.15 || Math.abs(Pointer.y - this.y) > 0.15
          || Math.abs(this.vx) > 0.4;
    },
  };

  /* ==================================================== 5d. ink layer === */

  /* Strokes are stored in document coordinates and redrawn into a viewport-sized
     canvas, offset by the scroll position. That keeps memory bounded (no
     full-page canvas) while the marks stay anchored to the page. */
  /* ============================================================== the ink layer
     Rebuilt. What was wrong, and what each part of this replaces:

     1. IT DREW INSIDE pointermove. Every pointer event called draw() directly, so
        rendering ran at the input rate rather than the display rate.
     2. EVERY EVENT REPAINTED EVERY STROKE. draw() re-stroked the whole collection,
        so cost grew with what you had already drawn — the tenth stroke was ten
        times more expensive than the first.
     3. IT ALLOCATED PER FRAME. `mine()` built a new array with .filter and then
        .concat'd another for the live stroke: two arrays per repaint, feeding the
        collector during the one interaction that must not stutter.
     4. IT REPAINTED ON SCROLL. The canvas is fixed, so staying anchored meant
        redrawing everything one frame behind the compositor — which is the shift
        you see: the page moves, the ink catches up a frame later.
     5. THE CANVAS SWALLOWED SCROLLING. `pointer-events: auto` while the pen was
        armed put a full-viewport surface over the page, so the wheel, the
        trackpad and the scrollbar all stopped working.

     The shape now:
       BASE canvas   completed strokes, painted once per change into a band taller
                     than the viewport
       LIVE canvas   the in-progress stroke only — one stroke, constant cost
       scrolling     moves both by transform, so the compositor carries them and
                     nothing repaints until the scroll leaves the painted band
       input         listened for on the page, never on the canvas, so the canvas
                     never intercepts a gesture

     Points are stored flat (x, y, x, y…) rather than as objects: a long stroke is
     one array of numbers instead of hundreds of small allocations. */
  const Ink = {
    strokes: [],
    live: null,
    colour: '#14100c',

    /* the painted band extends this far above and below the viewport, so ordinary
       scrolling moves the canvas without needing a repaint */
    PAD: 700,

    /* Mark work pending AND make sure something will actually do it.

       This is the piece the rewrite was missing. Painting moved out of the pointer
       handlers and into the frame loop — correct — but the loop SLEEPS after a few
       idle frames, and nothing woke it. So a stroke set its dirty flag and then sat
       there unpainted until some other event (a scroll) happened to wake the loop,
       at which point the whole stroke appeared at once. Every path that dirties the
       ink goes through here. */
    invalidate(live) {
      if (live) this.liveDirty = true;
      else { this.dirty = true; this.liveDirty = true; }
      wakeLoop();
    },

    /* --- where the ink lives ------------------------------------------------
       A drawing is a layer OF the surface it was drawn on, not a sheet laid
       over the whole page, and the difference shows the moment you drag a
       sticker across a stroke.

       At the body level these canvases sit at z-index 85. The hero is
       `isolation: isolate`, so it is a stacking context of its own and nothing
       inside it — a sticker at 3, one being dragged at 40 — can ever rise past
       85. The drawing stayed on top of every object you moved, and no z-index
       on the objects could have fixed it: they were sealed in a box that was
       itself underneath.

       So the ink is mounted INSIDE the hero while the hero is the surface,
       where it joins that stacking context and sits below the objects, and
       goes back to the body for anything else — over a drawer or a case-study
       sheet it genuinely does need to clear a fixed panel at z-index 80.

       THE COORDINATE CATCH. Inside the hero these cannot stay `position:
       fixed`. `.sheet`, the wrapper the whole page sits in, carries a transform
       — identity, purely to get its own compositor layer — and a transform makes
       an element the containing block for every fixed descendant under it. On
       the body the canvases were outside `.sheet` and `top: 0` meant the top of
       the viewport; moved inside, the same declaration silently started meaning
       the top of the document, so the band drifted by a full scroll offset and
       strokes were sliced off partway down. So inline they are `absolute`, and
       recentre() measures the offset it has to work against — see `base`. */
    mountOn(surface) {
      if (!this.el) return;               // not built yet; init() calls this too
      const host = surface && surface.classList && surface.classList.contains('canvas')
        ? surface
        : document.body;
      if (this.el.parentNode === host) return;
      host.appendChild(this.el);
      host.appendChild(this.liveEl);      // after .el, so the wet stroke stays on top
      this.inline = host !== document.body;
      this.el.classList.toggle('ink--inline', this.inline);
      this.liveEl.classList.toggle('ink--inline', this.inline);
      this.measureBase();
      this.recentre(true);
      this.invalidate(false);
    },

    /* Document y of whatever the canvases are positioned against: the viewport
       (0) when fixed on the body, the hero's own top edge when inline. Measured
       here and cached, never on the scroll path — recentre() runs every frame
       and a getBoundingClientRect() in there is a forced layout. */
    measureBase() {
      const host = this.inline && this.el && this.el.parentNode;
      this.base = host && host.getBoundingClientRect
        ? host.getBoundingClientRect().top + (window.scrollY || 0)
        : 0;
    },

    init() {
      const mk = (cls) => {
        const c = el('canvas', { class: `ink ${cls}`, 'aria-hidden': 'true' });
        document.body.appendChild(c);
        return c;
      };
      /* two layers: completed strokes, and the one being drawn */
      this.el = mk('ink--base');            // .el kept: other code and the tests use it
      this.liveEl = mk('ink--live');
      /* Canvas.init runs before this, so its setSurface call found no canvases
         to move — pick up whatever surface it settled on. */
      this.mountOn(Canvas.surface);
      this.ctx = this.el.getContext('2d');
      this.liveCtx = this.liveEl.getContext('2d');
      this.origin = 0;                      // document y of the band's top edge
      this.dirty = true;
      this.resize();

      addEventListener('resize', () => { this.resize(); this.invalidate(false); }, { passive: true });

      /* Input is taken from the page, NOT from the canvas. The canvas stays
         pointer-events: none for its whole life, so the wheel, the trackpad, the
         scrollbar and keyboard paging all keep working while the pen is armed —
         arming a tool must never take the page away from the reader. */
      /* The surface's position is read ONCE, when the stroke begins — not per
         sample. It was a getBoundingClientRect() for every pointer event, which is
         a forced layout read on the hottest path in the app, and it made the
         coordinate of a sample depend on when it was measured rather than where
         the cursor was. Only scrollTop is read per sample, so a stroke stays
         anchored if the surface scrolls mid-draw. */
      this.ox = 0; this.oy = 0;
      const anchor = () => {
        const s = Canvas.surface;
        const r = s && s.getBoundingClientRect ? s.getBoundingClientRect() : null;
        this.ox = r ? (r.left || 0) : 0;
        this.oy = r ? (r.top || 0) : 0;
      };
      const px2 = (e) => e.clientX - this.ox;
      const py2 = (e) => e.clientY - this.oy + this.offset();

      const down = (e) => {
        if (Rack.tool !== 'marker') return;
        /* Only a primary press draws, and only from a mouse or a stylus. A finger
           is left to the page so touch scrolling still works, which is how FigJam
           behaves. */
        if (e.button !== 0 && e.button !== undefined) return;
        const t = e.target;
        if (t && t.closest && t.closest('.tools, .drg, .lbox, .drawer__rail')) return;
        /* A finger is normally left to the page so touch scrolling keeps
           working — a mouse or a stylus has a second way to scroll the page and
           a finger does not. A phone has no mouse to fall back to, so the pen
           there has to accept a finger or it is a tool that does nothing.

           The trade is contained rather than global: only a press that starts on
           the drawing SURFACE draws, and only that surface is given
           `touch-action: none` while the pen is armed. Everything else — the
           bar, the sections under the hero, the footer — still scrolls under a
           finger, and putting the pen down hands the hero back too. */
        if (e.pointerType === 'touch') {
          if (!Rack.phone()) return;
          const surf = Canvas.surface;
          if (!surf || !t || !surf.contains(t)) return;
        }
        e.preventDefault();
        anchor();                           // one layout read for the whole stroke
        this.live = {
          color: this.colour, alpha: 1, width: 2.4,
          pts: [px2(e), py2(e)],            // flat: no per-point objects
          surf: Canvas.surface,
        };
        this.invalidate(true);
        Sound.voice({ freq: 900, gain: 0.03, dur: 0.05, bright: 4200, drop: 0.5, noise: 0.85 });
      };

      const move = (e) => {
        if (!this.live) return;
        const pts = this.live.pts;
        const n = pts.length;
        /* Coalesced events give every sample the browser captured between frames,
           not just the last one — that is what keeps a fast stroke smooth instead
           of a long straight chord. */
        const raw = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e];
        for (let i = 0; i < raw.length; i++) {
          const x = px2(raw[i]), y = py2(raw[i]);
          const lx = pts[pts.length - 2], ly = pts[pts.length - 1];
          if (Math.abs(x - lx) + Math.abs(y - ly) < 0.55) continue;
          pts.push(x, y);
        }
        /* NOTHING is drawn here — the frame loop paints. But it has to be awake to
           do it, which is what invalidate() guarantees. */
        if (pts.length !== n) this.invalidate(true);
      };

      const up = () => {
        if (!this.live) return;
        const stroke = this.live;
        this.live = null;
        if (stroke.pts.length > 3) {
          this.strokes.push(stroke);
          this.invalidate(false);           // the base layer gained a stroke
          History.push(
            () => {
              const i = this.strokes.indexOf(stroke);
              if (i >= 0) this.strokes.splice(i, 1);
              this.invalidate(false);
            },
            'stroke',
            () => { this.strokes.push(stroke); this.invalidate(false); },
          );
        } else {
          this.invalidate(true);            // clear the abandoned wet stroke
        }
      };

      addEventListener('pointerdown', down, { passive: false });
      addEventListener('pointermove', move, { passive: true });
      addEventListener('pointerup', up, { passive: true });
      addEventListener('pointercancel', up, { passive: true });
      this._down = down; this._move = move; this._up = up;   // for the harness
    },

    /* how far the surface the ink belongs to has been scrolled */
    offset() {
      const surf = Canvas.surface;
      if (surf && surf.classList && surf.classList.contains('drawer__scroll')) {
        return surf.scrollTop || 0;
      }
      return window.scrollY || 0;
    },

    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = innerWidth;
      const hBase = innerHeight + this.PAD * 2;
      for (const [c, h] of [[this.el, hBase], [this.liveEl, hBase]]) {
        c.width = Math.floor(w * dpr);
        c.height = Math.floor(h * dpr);
        c.style.width = `${w}px`;
        c.style.height = `${h}px`;
      }
      this.dpr = dpr;
      this.bandH = hBase;
      this.measureBase();   /* the hero's top can move when the viewport does */
    },

    /* Catmull-Rom through the samples, emitted as cubic beziers. Smoother than
       quadratics through midpoints: the curve passes THROUGH every sample instead
       of near it, so the line follows the hand rather than cutting its corners. */
    path(ctx, pts) {
      const n = pts.length / 2;
      if (n < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      if (n === 2) { ctx.lineTo(pts[2], pts[3]); ctx.stroke(); return; }
      for (let i = 0; i < n - 1; i++) {
        const i0 = Math.max(i - 1, 0) * 2, i1 = i * 2;
        const i2 = Math.min(i + 1, n - 1) * 2, i3 = Math.min(i + 2, n - 1) * 2;
        const x0 = pts[i0], y0 = pts[i0 + 1];
        const x1 = pts[i1], y1 = pts[i1 + 1];
        const x2 = pts[i2], y2 = pts[i2 + 1];
        const x3 = pts[i3], y3 = pts[i3 + 1];
        ctx.bezierCurveTo(
          x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6,
          x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6,
          x2, y2);
      }
      ctx.stroke();
    },

    prep(ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
    },

    /* repaint the base band: only when a stroke is added or removed, or the scroll
       has carried the band off screen */
    paintBase() {
      const ctx = this.ctx;
      if (!ctx) return;
      const o = this.origin;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, -o * this.dpr);
      ctx.clearRect(0, o, innerWidth, this.bandH);
      this.prep(ctx);
      const surf = Canvas.surface;
      const list = this.strokes;
      for (let i = 0; i < list.length; i++) {
        const s = list[i];
        if (s.surf !== surf) continue;      // no .filter: no array per repaint
        ctx.globalAlpha = s.alpha === undefined ? 1 : s.alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        this.path(ctx, s.pts);
      }
      ctx.globalAlpha = 1;
      this.dirty = false;
    },

    paintLive() {
      const ctx = this.liveCtx;
      if (!ctx) return;
      const o = this.origin;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, -o * this.dpr);
      ctx.clearRect(0, o, innerWidth, this.bandH);
      const s = this.live;
      if (s && s.surf === Canvas.surface) {
        this.prep(ctx);
        ctx.globalAlpha = s.alpha === undefined ? 1 : s.alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        this.path(ctx, s.pts);
        ctx.globalAlpha = 1;
      }
      this.liveDirty = false;
    },

    /* Keep the API the older code and the tests call. A full repaint of both
       layers — used when the stroke set changes wholesale. */
    draw() {
      this.recentre(true);
      this.paintBase();
      this.paintLive();
    },

    /* Move the band with the page. While the viewport stays inside the painted
       band this is a transform only — the compositor moves it and NOTHING
       repaints, which is why the marks no longer lag a frame behind the scroll. */
    recentre(force) {
      const y = this.offset();
      const want = y - this.PAD;
      if (force || Math.abs(want - this.origin) > this.PAD * 0.6) {
        this.origin = want;
        this.dirty = true;
        this.liveDirty = true;
      }
      /* Fixed on the body, the band's own top is the viewport's, so it has to be
         pushed back by the scroll. Absolute inside the hero it already travels
         with the page, and the only gap left is between the hero's top edge and
         where the band starts. Both cases are the same statement: close the
         distance between the band's origin and whatever it is measured from. */
      const shift = this.origin - (this.inline ? this.base : y);
      const t = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      if (this._t !== t) {
        this._t = t;
        this.el.style.transform = t;
        this.liveEl.style.transform = t;
      }
    },

    /* the marks that belong to whatever surface is active right now */
    mine() {
      return this.strokes.filter((s) => s.surf === Canvas.surface);
    },

    undo() {
      const s = this.strokes.pop();
      if (s) this.invalidate(false);
      return s;
    },

    clear() {
      this.strokes.length = 0;
      this.live = null;
      this.invalidate(false);
    },

    clearSurface(node) {
      const before = this.strokes.length;
      this.strokes = this.strokes.filter((s) => s.surf !== node);
      if (this.strokes.length !== before) this.invalidate(false);
    },

    /* Called once per animation frame. Rendering is locked to the display here —
       never to the input rate — and each layer is painted only if something it
       shows has actually changed. */
    tick() {
      if (!this.ctx) return false;
      this.recentre(false);
      if (this.dirty) this.paintBase();
      if (this.liveDirty) this.paintLive();
      return !!this.live;                  // keep the loop awake while drawing
    },
  };

  /* ======================================================== 6. tabs ===== */

  const Tabs = {
    init(mount) {
      const wrap = el('div', { class: 'index' });
      const col = el('div', { class: 'col' });
      const bar = el('div', { class: 'tabs', role: 'tablist' });
      const rows = el('div', { class: 'rows' });

      S.index.tabs.forEach((tab, i) => {
        if (i) bar.appendChild(el('span', { class: 'tabs__dot' }, '·'));
        const b = el('button', {
          class: 'tab', role: 'tab', id: `tab-${tab.id}`,
          'aria-selected': String(i === 0),
        }, esc(tab.label));
        b.addEventListener('click', () => this.show(tab.id));
        bar.appendChild(b);
      });

      col.appendChild(bar);
      col.appendChild(rows);
      wrap.appendChild(col);
      mount.appendChild(wrap);

      this.bar = bar;
      this.rows = rows;
      this.show(S.index.tabs[0].id);
    },

    show(id) {
      $$('.tab', this.bar).forEach((b) => b.setAttribute('aria-selected', String(b.id === `tab-${id}`)));
      const tab = S.index.tabs.find((t) => t.id === id);
      this.rows.innerHTML = '';
      tab.rows.forEach((r, i) => {
        /* A row with an `href` becomes an anchor; the rest stay divs. Two
           reasons not to make every row a link and leave the empty ones
           inert: an <a> with no href is not focusable or announced as a link,
           so the markup would lie about half the rows, and the hover
           affordance below keys off the element type — which means a row that
           looks clickable is one, always.

           rel is not decoration here. These point at Google Drive and Badgr,
           and target=_blank without noopener hands the opened page a
           reference back to this window. */
        const props = {
          class: `row${r.href ? ' row--link' : ''}`,
          style: `animation-delay:${Math.min(i * 32, 380)}ms`,
        };
        if (r.href) {
          props.href = r.href;
          props.target = '_blank';
          props.rel = 'noopener noreferrer';
        }
        this.rows.appendChild(
          el(r.href ? 'a' : 'div', props,
            `<span class="row__year">${esc(r.year || '')}</span>` +
            `<span class="row__name">${esc(r.name)}</span>` +
            `<span class="row__meta">${esc(r.meta)}</span>`)
        );
      });
    },
  };

  /* ================================================= 5e. lightbox + reveal ==

     Two behaviours the Research section needs, both generic enough to use
     anywhere a study renders.                                              */

  /* Click any framed artifact to blow it up. The backdrop blurs rather than
     going black, so the page stays present behind it. Escape, a double-click,
     or a click on the backdrop all close — three exits because a lightbox that
     traps you is worse than no lightbox. */
  const Lightbox = {
    init() {
      if (this.el) return;
      this.el = el('div', { class: 'lbox', 'aria-hidden': 'true' },
        '<div class="lbox__scrim"></div><div class="lbox__stage"></div>');
      document.body.appendChild(this.el);
      this.stage = $('.lbox__stage', this.el);
      $('.lbox__scrim', this.el).addEventListener('click', () => this.close());
      this.stage.addEventListener('dblclick', () => this.close());
      addEventListener('keydown', (e) => {
        if (this.open && e.key === 'Escape') { e.preventDefault(); this.close(); }
      });
    },

    show(frame) {
      this.init();
      /* clone rather than move: pulling the node out would collapse the layout
         behind the lightbox and the page would jump on close */
      this.stage.innerHTML = '';
      const copy = frame.cloneNode(true);
      copy.removeAttribute('data-zoom');
      copy.removeAttribute('tabindex');
      copy.classList.add('is-zoomed');
      this.stage.appendChild(copy);
      this.returnTo = frame;
      this.open = true;
      document.body.classList.add('is-lbox');
      this.el.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => this.el.classList.add('is-on'));
      Sound.voice({ freq: 520, gain: 0.03, dur: 0.07, bright: 3000, drop: 0.6 });
    },

    close() {
      if (!this.open) return;
      this.open = false;
      this.el.classList.remove('is-on');
      this.el.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-lbox');
      if (this.returnTo && this.returnTo.focus) this.returnTo.focus({ preventScroll: true });
      Sound.voice({ freq: 300, gain: 0.025, dur: 0.07, bright: 1800, drop: 0.6 });
      setTimeout(() => { if (!this.open) this.stage.innerHTML = ''; }, 420);
    },

    bind(root) {
      $$('[data-zoom]', root).forEach((f) => {
        f.addEventListener('click', () => this.show(f));
        f.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.show(f); }
        });
      });
    },
  };

  /* ------------------------------------------------------------------ Counters
     The outcome figures count up as their card arrives.

     Two things here are deliberate.

     The delay is computed HERE and written back as `--md`, which the stylesheet
     then reads for the sparkline and the card's own fade. One source of truth:
     the number and the line it explains cannot drift apart, which they would if
     each side kept its own copy of the timing.

     And the final frame writes the ORIGINAL string back verbatim rather than a
     reformatted one. The values are not all plain numbers — "+7" carries a sign
     and "40%" a suffix — so re-deriving the text at the end is how a card ends
     up reading "7" after a perfectly good animation. */
  const Counters = {
    NUM: /^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/,
    DUR: 900,

    bind(root) {
      $$('.blk-metrics', root).forEach((blk) => {
        const stag = parseFloat(blk.style.getPropertyValue('--stag')) || 0;
        const cards = $$('.mcard', blk);
        cards.forEach((card, i) => {
          card.style.setProperty('--i', String(i));
          card.style.setProperty('--md', `${stag * 90 + i * 110}ms`);
        });
        /* the footnote waits for the last line to finish drawing. Derived rather
           than a number typed into the stylesheet, so adding a fifth card moves
           it automatically instead of leaving it landing mid-animation. */
        const last = cards.length ? stag * 90 + (cards.length - 1) * 110 : 0;
        blk.style.setProperty('--md-end', `${last + 1400}ms`);
      });
    },

    run(sec) {
      $$('.mcard__v', sec).forEach((n) => {
        if (n.dataset.counted) return;
        n.dataset.counted = '1';
        /* the truth is already in the DOM, so reduced motion and a failed parse
           both fall through to the correct value rather than to zero */
        const full = n.textContent;
        const m = Counters.NUM.exec(full);
        if (!m || REDUCED) return;

        const target = parseFloat(m[2]);
        const dp = (m[2].split('.')[1] || '').length;
        const card = n.closest('.mcard');
        const delay = parseFloat(card && card.style.getPropertyValue('--md')) || 0;
        const t0 = performance.now() + delay + 120;

        n.textContent = m[1] + (0).toFixed(dp) + m[3];
        const step = (t) => {
          const p = clamp((t - t0) / Counters.DUR);
          if (p >= 1) { n.textContent = full; return; }
          const e = 1 - Math.pow(1 - p, 3);   /* ease-out: a readout settling */
          n.textContent = m[1] + (target * e).toFixed(dp) + m[3];
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },
  };

  /* Per-block staggered entrance. Each section's children are indexed and the
     whole group is released when the section scrolls in, so a block arrives as
     one considered unit — heading, then body, then bullets, then the artifact —
     rather than the entire page animating at once.

     `.stag` is the hook the stylesheet hangs every resting state on, and it is
     only ever applied here. So a page that never binds Reveal renders everything
     visible instead of leaving it stuck at opacity 0 — which is what would
     happen if the resting state keyed off the component's own class. */
  const Reveal = {
    bind(root, scroller) {
      const secs = $$('.sec', root);
      if (!secs.length) return;
      secs.forEach((sec) => {
        const kids = $$('.sec__eyebrow, .sec__pre, .sec__heading, .sec__body, .blk', sec);
        kids.forEach((n, i) => {
          n.classList.add('stag');
          n.style.setProperty('--stag', String(i));
        });
      });
      Counters.bind(root);            /* after --stag exists, since it reads it */
      if (REDUCED || !window.IntersectionObserver) {
        secs.forEach((sec) => sec.classList.add('is-shown'));
        return;
      }
      const io = new IntersectionObserver((rows) => {
        rows.forEach((r) => {
          if (!r.isIntersecting) return;
          r.target.classList.add('is-shown');
          Counters.run(r.target);     /* the figures start with their cards */
          io.unobserve(r.target);            /* it only arrives once */
        });
      }, { root: scroller || null, rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
      secs.forEach((sec) => io.observe(sec));
    },
  };

  /* The rail sits above the dark band, so its ink has to flip where the band
     passes behind it. Hit-testing will not work here: the band is painted by a
     spread shadow, and the dark section's own box stops at the content column,
     nowhere near the rail. So this compares each link's centre against the dark
     regions' vertical ranges instead — geometry, not hit-testing.

     Per link rather than per rail, so the change cascades down the list as the
     boundary crosses it, and each one fades on its own. */
  /* ------------------------------------------------------------------ Marquee
     Continuous scrollers that slow on hover instead of stopping.

     Why this is not a CSS animation with a longer duration on hover: CSS derives
     an animation's progress from elapsed-time / duration, so changing the
     duration relocates the phase in the same frame. Going 30s -> 64s a third of
     the way through jumps backwards by a third of a period — on the NDA tape
     that measured 174px, a hard visible snap on hover. `animation-play-state`
     avoids the jump but stops the motion dead, which is the thing being fixed.

     So position is accumulated here instead: `pos += speed * dt`. Speed can then
     change however it likes and the position stays continuous, because it is
     never recomputed from the clock. Speed eases toward its target with a
     time-constant, so the slow-down itself is smooth rather than a step.

     One period is measured, not assumed. For the screens ticker the list is
     emitted twice, so the offset of the second copy's first card IS one period —
     exact whatever the card widths and gaps are, and it survives a change to
     either without a magic number needing to be kept in step. */
  const Marquee = {
    items: [],
    raf: 0,
    last: 0,
    /* hover target as a fraction of full speed — slowed a long way, never zero */
    SLOW: 0.22,
    TAU: 0.42,           // seconds to close most of the gap to the target speed

    add(lane, opts) {
      if (!lane || lane.__mq) return;
      lane.__mq = true;
      const it = {
        lane,
        dir: opts.dir || 1,
        /* px per second at full speed. May be a function, and for anything whose
           speed is derived from a measurement it MUST be: read once at bind time
           it can be captured before layout exists, and a base of 0 never
           recovers however many frames run afterwards. */
        base: opts.base,
        period: opts.period,      // () => px
        hot: () => false,
        pos: 0,
        speed: typeof opts.base === 'function' ? 0 : opts.base,
        live: true,
      };
      it.pos = opts.start ? opts.start(it) : 0;
      this.items.push(it);
      return it;
    },

    /* .tick — one lane per row, alternating direction, hovering the panel slows
       every row at once so the two do not drift apart in feel */
    bind(root) {
      if (REDUCED) return;   // the strip stays static; CSS makes it scrollable
      $$('.tick', root).forEach((panel) => {
        let hot = false;
        panel.addEventListener('pointerenter', () => { hot = true; });
        panel.addEventListener('pointerleave', () => { hot = false; });
        $$('.tick__row', panel).forEach((row) => {
          const lane = $('.tick__lane', row);
          if (!lane) return;
          const speed = +(row.dataset.speed || 100);
          const dir = row.classList.contains('tick__row--b') ? -1 : 1;
          const it = this.add(lane, {
            dir,
            base: speed,
            /* the second copy's first card, relative to the first card */
            period: () => {
              const k = lane.children.length / 2;
              const a = lane.children[0];
              const b = lane.children[k];
              return a && b ? b.offsetLeft - a.offsetLeft : 0;
            },
            /* row B runs the other way, so it starts a period in and counts down */
            start: () => 0,
          });
          if (it) it.hot = () => hot;
        });
      });

      /* the NDA tape — one tile is a period, since the artwork repeats */
      $$('.ndatape', root).forEach((tape) => {
        const lane = $('.ndatape__lane', tape);
        if (!lane) return;
        let hot = false;
        tape.addEventListener('pointerenter', () => { hot = true; });
        tape.addEventListener('pointerleave', () => { hot = false; });
        const tile = () => {
          const cs = getComputedStyle(tape);
          const h = parseFloat(cs.getPropertyValue('--tape-h')) || tape.offsetHeight;
          const r = parseFloat(cs.getPropertyValue('--tile-ratio')) || 11.1633;
          return h * r;
        };
        /* the cadence lives in CSS with the rest of the tape's numbers */
        const secs = () => parseFloat(
          getComputedStyle(tape).getPropertyValue('--tape-secs')) || 15;
        const it = this.add(lane, {
          /* the keyframe ran from -tile to 0, so the tape travels right */
          dir: -1,
          /* Derived per frame, not captured here: `tile()` measures the element,
             and a measurement taken before layout exists sticks at 0 forever. */
          base: () => tile() / secs(),
          period: tile,
        });
        if (it) it.hot = () => hot;
      });

      this.start();
    },

    start() {
      if (this.raf || !this.items.length) return;
      this.last = performance.now();
      const tick = (now) => {
        /* clamped so a backgrounded tab does not resume with one huge step */
        const dt = Math.min((now - this.last) / 1000, 0.05);
        this.last = now;
        for (const it of this.items) {
          if (!it.live) continue;
          const full = typeof it.base === 'function' ? it.base() : it.base;
          const target = it.hot() ? full * this.SLOW : full;
          /* framerate-independent easing toward the target speed */
          it.speed += (target - it.speed) * (1 - Math.exp(-dt / this.TAU));
          const p = it.period();
          if (!p) continue;                     // not laid out yet
          it.pos = (it.pos + it.speed * dt) % p;
          const x = it.dir > 0 ? -it.pos : it.pos - p;
          it.lane.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
        }
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    },

    /* dropped lanes must not be stepped forever after a drawer closes */
    prune() {
      this.items = this.items.filter((it) => it.lane.isConnected);
      if (!this.items.length && this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
      }
    },
  };

  /* Play a clip while it is on screen, pause it when it leaves — so it starts as
     the reader arrives at it rather than running unseen, and stops costing frames
     once it is past. `preload="none"` in the markup means the file is not even
     fetched until this fires. */
  /* The seam in a `compare` block follows its hidden range input. That is the
     whole behaviour: one custom property, written on input.

     Written to the .cmp element rather than the input's own style so the bar,
     the clip and the two corner tags all read one value — they are siblings,
     and three copies of the same number is three chances to disagree.

     No transition on --split. A drag has to be one-to-one with the pointer, and
     an eased seam trails behind it in a way that reads as lag rather than as
     polish. Keyboard steps are 1% and land instantly for the same reason. */
  const compares = (root) => {
    $$('.cmp', root).forEach((cmp) => {
      const range = $('.cmp__range', cmp);
      if (!range) return;
      const apply = () => cmp.style.setProperty('--split', `${range.value}%`);
      range.addEventListener('input', apply);
      /* `change` as well: some engines only fire input during the drag and
         change at the end, and a seam that never lands is worse than one that
         never moves */
      range.addEventListener('change', apply);
      apply();
    });
  };

  const videos = (root) => {
    const vids = $$('.shotvid', root);
    if (!vids.length) return;
    if (REDUCED) {                     // show the poster and let them choose
      vids.forEach((v) => { v.controls = true; });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          if (v.preload === 'none') v.preload = 'auto';
          /* play() returns a promise in current browsers but is only SPECIFIED to
             return one — older implementations return undefined, and so does any
             environment without media support. Calling .catch on that throws and
             took the whole render down with it. If it does reject, autoplay was
             refused: the poster stays and controls appear so it can be started. */
          const r = v.play();
          if (r && typeof r.catch === 'function') r.catch(() => { v.controls = true; });
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    vids.forEach((v) => io.observe(v));
  };

  /* ------------------------------------------------------------- SectionNav
     The rail: which section is active, and where a click lands.

     What was here before, and why each part was wrong:

     1. CLICKS LANDED BETWEEN SECTIONS. The target was `t.offsetTop - 8`.
        offsetTop is measured from the nearest POSITIONED ancestor, and .drawer is
        `position: fixed` while .drawer__scroll is static — so offsetTop counted
        from the drawer's box while scrollTop counts from the scroll container's
        content. Every destination was off by the drawer header's height, a
        constant error that put the reader mid-section every time.

     2. THE ACTIVE ITEM WAS APPROXIMATE. A scroll handler walked all ten sections
        and marked the last one whose top had passed 30% of the viewport. On a
        section taller than the viewport the heading is long gone while it is still
        "active", and a short section could be skipped between two frames.

     3. IT STUTTERED. That handler ran on EVERY scroll event, unthrottled, and read
        `getBoundingClientRect()` once per section plus `scroll.getBoundingClientRect()`
        AGAIN INSIDE THE LOOP — about 21 forced layout reads per event, on a
        container that also had two other scroll listeners.

     The replacement measures nothing on scroll. An IntersectionObserver watches a
     reading band just under the header; whichever section is topmost in that band
     is active. The band is contiguous, so exactly one section always qualifies —
     which is what stops the flicker between neighbours. */
  const SectionNav = {
    bind(scroll, secs, links) {
      if (!secs.length || !links.length) return;

      /* One anchor per section, sitting immediately before its heading. These are
         the navigation targets — not the section boxes, whose tops are different
         distances above their headings. */
      const anchors = secs.map((sx) => $('.sec__anchor', sx) || sx);

      /* The landing allowance, read from the anchor's own scroll-margin-top. It is
         declared in CSS next to the rest of the rhythm, so the layout decides where
         a section comes to rest and this code holds no offset of its own. */
      const headroom = () => {
        const v = parseFloat(getComputedStyle(anchors[0]).scrollMarginTop);
        return Number.isFinite(v) ? v : 0;
      };

      const setActive = (i) => {
        links.forEach((a, k) => {
          const on = k === i;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
          /* On a phone the rail is one line that scrolls sideways, so the chip
             for the section you are reading can be off the end of the strip —
             which is the same as not having a rail. It is brought to the middle
             as the active section changes.

             The guard is the whole cross-platform story: on a desktop the rail
             is a column that fits its content, scrollWidth equals clientWidth,
             and this does nothing at all. */
          if (!on) return;
          const strip = a.parentElement;
          if (!strip || strip.scrollWidth <= strip.clientWidth + 4) return;
          const want = a.offsetLeft - (strip.clientWidth - a.offsetWidth) / 2;
          const to = Math.max(0, Math.min(want, strip.scrollWidth - strip.clientWidth));
          if (Math.abs(strip.scrollLeft - to) < 2) return;
          if (typeof strip.scrollTo === 'function') {
            strip.scrollTo({ left: to, behavior: REDUCED ? 'auto' : 'smooth' });
          } else {
            strip.scrollLeft = to;
          }
        });
      };

      /* While a click-scroll is in flight the observer would sweep the indicator
         through every section on the way past. The clicked one is pinned instead
         until the scroll settles. */
      let pinned = -1;
      let settle = 0;
      const unpin = () => {
        clearTimeout(settle);
        settle = setTimeout(() => { pinned = -1; }, 160);
      };

      links.forEach((a, i) => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const anc = anchors[i];
          if (!anc) return;
          Sound.tap();
          pinned = i;
          setActive(i);
          /* The anchor's real position, in the SCROLL CONTAINER's coordinate space,
             less the allowance the layout declares for it. Every anchor sits the
             same distance above its heading (zero), so every section comes to rest
             with its heading at exactly the same height. */
          const top = scroll.scrollTop
            + anc.getBoundingClientRect().top
            - scroll.getBoundingClientRect().top
            - headroom();
          if (typeof scroll.scrollTo === 'function') {
            scroll.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
          } else {
            scroll.scrollTop = top;          // older engines, and jsdom
          }
          unpin();
        });
      });

      /* The reading band starts at the SAME line a click lands on, so the active
         item flips exactly as a section reaches its resting position — the rail and
         the page agree by construction rather than by coincidence.

         It runs from that line down to 45% of the height. A section counts as active
         while it touches the band and the topmost one wins: stable for sections of
         any height, including ones taller than the viewport, where "50% visible"
         can never be true. The band is contiguous, so exactly one section always
         qualifies, which is what stops neighbours trading the highlight. */
      const inBand = new Set();
      const choose = () => {
        if (pinned >= 0) return;
        let best = -1;
        for (let i = 0; i < secs.length; i++) {
          if (inBand.has(secs[i])) { best = i; break; }
        }
        if (best >= 0) setActive(best);      // empty band keeps the last, no flicker
      };

      const build = () => {
        if (this.io) this.io.disconnect();
        if (typeof IntersectionObserver !== 'function') { setActive(0); return; }
        this.io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) inBand.add(en.target);
            else inBand.delete(en.target);
          });
          choose();
        }, { root: scroll, rootMargin: `-${Math.round(headroom())}px 0px -55% 0px`,
             threshold: 0 });
        secs.forEach((sx) => this.io.observe(sx));
      };
      build();
      setActive(0);

      this.secs = secs; this.links = links; this.scroll = scroll;
      this.anchors = anchors; this.headroom = headroom;
      this.setActive = setActive;
      this.choose = choose;
      this.inBand = inBand;
      this.pinnedIs = () => pinned;
      this.rebuild = build;
    },

    stop() { if (this.io) { this.io.disconnect(); this.io = null; } },
  };

  const RailInk = {
    bind(rail, scroll) {
      if (!rail) return;
      const darks = $$('.sec--dark, .proj__head--dark', scroll);
      const links = $$('.rail__link', rail);
      if (!darks.length || !links.length) return;

      /* MEASURE ONCE. This used to read getBoundingClientRect() for every dark
         section AND every link on every tick — about twenty forced layout reads
         per scroll, which is most of the stutter.

         The dark bands do not move within the scroll content, and each link's
         offset inside the rail is fixed, so both are cached. What is left per tick
         is ONE rect read (the rail, which slides until it sticks) and arithmetic. */
      let bands = [];        // content-space top/bottom of each dark region
      let offs = [];         // each link's offset inside the rail, plus its height
      const measure = () => {
        const sr = scroll.getBoundingClientRect().top;
        const st = scroll.scrollTop;
        bands = darks.map((d) => {
          const r = d.getBoundingClientRect();
          return { top: st + r.top - sr, bottom: st + r.bottom - sr };
        });
        const rr = rail.getBoundingClientRect().top;
        offs = links.map((a) => {
          const r = a.getBoundingClientRect();
          return { d: r.top - rr, h: r.height };
        });
      };

      /* The decision, separated from the measuring. Pure arithmetic over cached
         numbers — which is what makes it testable without a browser, and what
         keeps the per-scroll cost to one rect read plus this loop. */
      const apply = (railY) => {
        for (let i = 0; i < links.length; i++) {
          const mid = railY + offs[i].d + offs[i].h / 2;
          let over = false;
          for (let k = 0; k < bands.length; k++) {
            if (mid >= bands[k].top && mid <= bands[k].bottom) { over = true; break; }
          }
          const ink = over ? 'light' : 'dark';
          if (links[i].dataset.ink !== ink) links[i].dataset.ink = ink;
        }

        /* THE BAR'S TONE, FROM THE SAME ARITHMETIC AS THE INK.

           On a phone the rail is a bar with a background of its own, because the
           article scrolls underneath it, and that background has to follow the
           band the bar is sitting on. Asking the same question the links are
           asked — is my midpoint over a dark section — but of the BAR, because
           the bar is the thing being coloured.

           Decided here rather than in setActive so it cannot drift: setActive
           fires when the section changes, this runs on every scroll, and a
           snapshot of one taken inside the other is how the two ended up
           disagreeing. The stylesheet then derives the ink from THIS class
           rather than from data-ink, so there is one state and one answer. */
        const rmid = railY + rail.offsetHeight / 2;
        let railOver = false;
        for (let k = 0; k < bands.length; k++) {
          if (rmid >= bands[k].top && rmid <= bands[k].bottom) { railOver = true; break; }
        }
        rail.classList.toggle('is-dark', railOver);
      };

      let lastY = null;
      const tick = () => {
        const y = scroll.scrollTop;
        if (lastY !== null && Math.abs(y - lastY) < 4) return;
        lastY = y;
        if (!bands.length) return;
        /* the single read: where the rail currently sits inside the container */
        apply(rail.getBoundingClientRect().top
              - scroll.getBoundingClientRect().top + y);
      };
      measure();
      tick();
      lastY = null;                        /* so the first scroll always runs */
      rail.__inkTick = tick;
      rail.__inkMeasure = measure;
      /* the drawer's single scroll handler drives this; RailInk owns no listener */
      this.current = {
        tick, measure, apply,
        /* the harness installs known geometry: jsdom reports every rect from a
           rolling stub, so measuring there tests the stub, not the decision */
        set(b2, o2) { bands = b2; offs = o2; },
        get bands() { return bands; },
      };
    },
  };

  /* ==================================================== 6b. adaptive nav ==

     The nav floats over the page, and two of the work previews are near-black
     or saturated. The obvious fix — a soft scrim across the top — turned out to
     be wrong: a veil wide enough to back the links also veils the card beneath
     them, so a black preview got a grey band across its full width and lost its
     own content. Softening it never helps, because the veil is the problem.

     So the nav adapts and the page is left alone. Dark surfaces declare
     `--tone: dark` in CSS. Custom properties inherit, which is the whole trick:
     a caption nested three levels inside a dark preview still reports dark, so
     sampling a single element under the nav is enough. No colour maths, no
     canvas readback, and adding a dark surface later is one CSS line.        */

  const Nav = {
    init() {
      this.el = $('.nav');
      this.ink = '';
      this.lastY = null;
      if (this.el) this.set('light');   /* dark ink on light paper, at rest */
    },

    /* Which surface is under the nav. elementsFromPoint follows hit-testing
       rules, so it already skips the pointer-events: none overlays (the ink
       canvas, the tool ghost) — only the nav itself has to be stepped over. */
    surface() {
      const r = this.el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      if (!document.elementsFromPoint) return 'light';
      const stack = document.elementsFromPoint(x, y) || [];
      for (const node of stack) {
        if (this.el === node || this.el.contains(node)) continue;
        const tone = getComputedStyle(node).getPropertyValue('--tone').trim();
        return tone === 'dark' ? 'dark' : 'light';
      }
      return 'light';
    },

    /* `surface` is what's behind; the ink is the opposite of it */
    set(surface) {
      const ink = surface === 'dark' ? 'light' : 'dark';
      if (ink === this.ink) return false;
      this.ink = ink;
      this.el.dataset.ink = ink;
      return true;
    },

    tick() {
      if (!this.el || this.el.offsetParent === null) return false;
      /* Sampling is a hit test plus one getComputedStyle, so it is cheap but
         not free. Once every 4px of scroll is imperceptible and bounds it. */
      const y = scrollY;
      if (this.lastY !== null && Math.abs(y - this.lastY) < 4) return false;
      this.lastY = y;
      return this.set(this.surface());
    },
  };

  /* ======================================================== 7. pages ==== */

  const Pages = {
    home() {
      /* The hero is a Figma-style canvas: dotted grid, an intro whose pills are
         draggable, and anything you place on it afterwards. */
      const hero = $('#hero');
      Canvas.init(hero);

      const rv = (S.canvas && S.canvas.reveal) || {};
      const cta = el('div', { class: 'canvas__cta rv' });
      cta.style.setProperty('--rv-delay', `${rv.ctaAt || 1500}ms`);
      cta.style.setProperty('--rv-blur', `${rv.blur || 14}px`);
      cta.appendChild(el('button', { class: 'btn', 'data-action': 'copy-email' },
        `<span class="btn__label">${esc(S.hero.primary.label)}</span>`));
      cta.appendChild(el('a', { class: 'btn btn--ghost', href: S.person.resumeUrl, 'data-action': 'resume' },
        `<span class="btn__label">＋ ${esc(S.hero.secondary.label)}</span>`));
      $('.canvas__intro', hero).appendChild(cta);

      /* story → showcase → closing → index */
      const story = el('div', { class: 'story' });
      const scol = el('div', { class: 'col' });
      Words.mount(scol, S.story);
      story.appendChild(scol);
      $('#main').appendChild(story);

      Showcase.init($('#main'));

      const closing = el('div', { class: 'closing' });
      const ccol = el('div', { class: 'col' });
      Words.mount(ccol, S.closing);
      closing.appendChild(ccol);
      $('#main').appendChild(closing);

      Tabs.init($('#main'));

      /* the desk illustration used to sit here, above the footer. Removed: the
         footer now carries the closing weight itself, and a decorative drawing
         between the work and the contact details was the only thing on the page
         that belonged to no system. */
    },

    work() {
      this.head(S.work.intro, 'Work');
      const wrap = el('div', { class: 'col--wide' });
      const list = el('div', { class: 'projects' });
      S.work.projects.forEach((p) => {
        const a = el('a', {
          class: 'project reveal', href: p.href,
          style: `--accent:${p.accent || 'var(--ink)'}`,
        });
        a.innerHTML =
          `<div class="project__top">` +
            `<h2 class="project__title">${esc(p.title)}</h2>` +
            `<span class="project__year">${esc(p.year)}</span>` +
          `</div>` +
          `<span class="project__role">${esc(p.role)}</span>` +
          `<p class="project__summary">${esc(p.summary)}</p>` +
          `<div class="tags">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>`;
        list.appendChild(a);
      });
      wrap.appendChild(list);
      $('#main').appendChild(wrap);
    },

    people() {
      this.head(S.people.intro, 'People');
      const wrap = el('div', { class: 'col--wide' });
      S.people.groups.forEach((g) => {
        const sec = el('section', { class: 'group reveal' });
        sec.appendChild(el('h2', { class: 'group__label' }, esc(g.label)));
        g.entries.forEach((p) => {
          sec.appendChild(
            el('a', { class: 'person', href: p.href },
              `<span class="person__name">${esc(p.name)}</span><span class="person__note">${esc(p.note)}</span>`)
          );
        });
        wrap.appendChild(sec);
      });
      $('#main').appendChild(wrap);
    },

    writing() {
      this.head(S.writing.intro, 'Writing');
      const wrap = el('div', { class: 'col--wide' });
      const list = el('div', { class: 'posts' });
      S.writing.posts.forEach((p) => {
        list.appendChild(
          el('a', { class: 'post reveal', href: p.href },
            `<div class="post__meta"><span>${esc(p.date)}</span><span>·</span><span>${esc(p.readingTime)}</span></div>` +
            `<h2 class="post__title">${esc(p.title)}</h2>` +
            `<p class="post__excerpt">${esc(p.excerpt)}</p>`)
        );
      });
      wrap.appendChild(list);
      $('#main').appendChild(wrap);
    },

    project() {
      Project.init();
      /* the page itself is the project surface, so notes and stickers can land
         anywhere on the case study */
      const sheet = $('.sheet');
      if (sheet) {
        sheet.style.position = 'relative';
        Canvas.setSurface(sheet);
        Canvas.placement();
      }
      /* headings, body copy and blocks all ease in on entry */

    },

    head(intro, title) {
      const h = el('header', { class: 'page-head' });
      const c = el('div', { class: 'col--wide' });
      c.appendChild(el('h1', {}, esc(title)));
      c.appendChild(el('p', {}, esc(intro)));
      h.appendChild(c);
      $('#main').appendChild(h);
    },
  };

  /* ======================================================== 8. loop ===== */

  /* ===================================================== 6c. the paper ====

     The resume, shown inside the site.

     A link straight to the PDF hands the file to the browser's own viewer,
     which is a different application: its own toolbar, its own scrollbar, a
     grey void around the page and no way back except the back button. Embedding
     the PDF in an iframe is barely better — the plugin's chrome comes with it,
     and on iOS it often refuses to render inline at all and offers a download
     instead.

     So the pages are IMAGES, rendered from the same PDF at export time, and the
     viewer around them is built out of the site's own parts: the ink surface
     the menu is written on, the corner radius the project cards use, the same
     spring. The PDF itself is still there behind a download button, which is
     what somebody actually wants the file for.

     The whole thing is built on first open and kept afterwards — a resume is
     something you look at once, and 300KB of page images should not be fetched
     by everybody who never asks for it. */
  const Paper = {
    ok() {
      const r = S.person && S.person.resume;
      return !!(r && r.sheets && r.sheets.length);
    },

    build() {
      if (this.el) return;
      const r = S.person.resume;

      const win = el('div', {
        class: 'paper__win', role: 'dialog', 'aria-modal': 'true',
        'aria-label': r.title || 'Resume',
      });

      const bar = el('div', { class: 'paper__bar' });
      bar.appendChild(el('p', { class: 'paper__title' }, esc(r.title || 'Resume')));
      const acts = el('div', { class: 'paper__acts' });
      acts.appendChild(el('a', {
        class: 'paper__get', href: S.person.resumeUrl, download: '',
      }, 'Download'));
      const x = el('button', {
        class: 'paper__x', type: 'button', 'aria-label': 'Close',
      }, '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" '
        + 'stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>');
      acts.appendChild(x);
      bar.appendChild(acts);
      win.appendChild(bar);

      const scroll = el('div', { class: 'paper__scroll' });
      r.sheets.forEach((src, i) => {
        /* The ratio is declared in content.js rather than measured, so the
           space is reserved before the bytes arrive: without it the second page
           snaps into existence under your thumb the moment it decodes. */
        const wrap = el('div', {
          class: 'paper__pg',
          style: `aspect-ratio:${r.ratio || 0.7727}`,
        });
        const img = el('img', {
          src, alt: `${r.title || 'Resume'}, page ${i + 1}`,
          decoding: 'async', ...(i ? { loading: 'lazy' } : {}),
        });
        wrap.appendChild(img);
        scroll.appendChild(wrap);
      });
      win.appendChild(scroll);

      this.el = el('div', { class: 'paper', hidden: '' });
      this.el.appendChild(el('div', { class: 'paper__veil' }));
      this.el.appendChild(win);
      document.body.appendChild(this.el);

      this.x = x;
      x.addEventListener('click', () => this.close());
      $('.paper__veil', this.el).addEventListener('click', () => this.close());
      addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.open_) this.close();
      });
    },

    open() {
      this.build();
      if (this.open_) return;
      this.open_ = true;
      this.keep = window.scrollY;

      /* PINNED, AND THE SCROLLBAR'S WIDTH GIVEN BACK.
         Taking the page out of flow removes the scrollbar with it, and on a
         desktop that is 15px of the layout disappearing — the whole page slides
         sideways behind the viewer, which you see at the edges. The padding
         puts back exactly what the scrollbar was taking. */
      const bar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.top = `-${this.keep}px`;
      if (bar > 0) document.body.style.paddingRight = `${bar}px`;
      document.body.classList.add('is-held');

      this.el.hidden = false;
      requestAnimationFrame(() => this.el.classList.add('is-up'));
      setTimeout(() => this.x && this.x.focus({ preventScroll: true }), 240);
      Sound.chime();
    },

    close() {
      if (!this.open_) return;
      this.open_ = false;
      this.el.classList.remove('is-up');
      document.body.classList.remove('is-held');
      document.body.style.top = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, this.keep);
      const back = $('[data-action="resume"]');
      if (back) back.focus({ preventScroll: true });
      setTimeout(() => { if (!this.open_) this.el.hidden = true; }, REDUCED ? 1 : 420);
    },
  };

  const Sheet = {
    init() {
      this.el = $('.sheet');
      this.outro = $('.outro');
      /* The floating pods, collected once — the first two are built by
         Shell.controls() and the dock by Rack.init(), both before this runs.
         The dock is in the list because it reads the same --end, backwards: on
         a phone it leaves the corner as the slider and the mute arrive in it. */
      this.pods = $$('.controls, .mute, .tools');
      this.last = -1;
      this.lastEnd = -1;
      this.measure();
    },

    /* The travel distance is the outro's own height, not a fraction of the
       viewport. At max scroll the sheet's bottom edge sits exactly one outro
       above the fold, which is the state the reference screenshot shows — so
       tying it to the outro makes "fully detached" land precisely at the end,
       at any viewport size. */
    measure() {
      this.travel = Math.max(120, this.outro ? this.outro.offsetHeight : 340);
      /* Below 48rem the paper is trimmed by `clip-path` rather than by its
         margin, and the shadow the clip removes is redrawn by the outro. Both
         read the same three properties, and the outro is a sibling of the
         sheet, so it cannot inherit them — it has to be written to as well.
         Read here rather than in the tick: this runs on resize, which is the
         only thing that can change the answer. */
      this.narrow = matchMedia('(max-width: 48rem)').matches;
    },

    /* WRITTEN ON THE ELEMENTS THAT READ THEM, NOT ON THE ROOT.
       These five properties used to be set on documentElement, which is the
       expensive place to put anything that changes while you scroll: a custom
       property on the root invalidates the computed style of every element that
       inherits it, and every element inherits it. Measured over a scroll from
       just above the footer to the end of the page — 1,450ms of style
       recalculation, against 318ms with the same properties held still.

       The sheet's three are read only by `.sheet`, and the two that raise the
       pods are read only by the pods, so each write now dirties one subtree
       instead of the document. */
    tick(vh) {
      if (!this.el) return;
      const r = this.el.getBoundingClientRect();
      /* 32px inset, 24px corner radius — both measured off the reference */
      const p = clamp((vh - r.bottom) / this.travel);

      /* CHANGING THIS MARGIN RE-LAYS-OUT THE WHOLE PAGE, because `.sheet` is
         the paper and the paper contains everything. Measured with Chromium's
         layout counters over a scroll from just above the footer to the end:
         48 layout passes costing 74ms, against 3 costing 1ms with the margin
         held still.
         The fix is in the stylesheet rather than here — below 48rem the margin
         simply does not move, so none of those passes happen. Above it the
         desktop keeps the composition it was measured against, and this stays
         at one write per whole pixel. Quantising it coarsely was tried and
         reverted: rounding to three pixels puts full detachment at 33 rather
         than 32, and the desktop is the reference. */
      const px = Math.round(p * 32);
      if (px !== this.last) {
        this.last = px;
        const round = `${Math.round(p * 24)}px`;
        const lift = p.toFixed(3);
        const s = this.el.style;
        s.setProperty('--sheet-inset', `${px}px`);
        s.setProperty('--sheet-round', round);
        s.setProperty('--sheet-lift', lift);
        /* the phone's second reader — see measure(). Two subtrees dirtied
           instead of one, and neither write touches layout. */
        if (this.narrow && this.outro) {
          const o = this.outro.style;
          o.setProperty('--sheet-inset', `${px}px`);
          o.setProperty('--sheet-round', round);
          o.setProperty('--sheet-lift', lift);
        }
      }

      /* the controls only exist at the end of the page. They start appearing a
         little before the paper detaches so they're settled by the time you
         land, and they only accept input once actually visible. */
      const end = clamp((vh - r.bottom) / (this.travel * 0.5));
      const q = Math.round(end * 50) / 50;
      if (q !== this.lastEnd) {
        this.lastEnd = q;
        const v = q.toFixed(2);
        const e = q > 0.5 ? 'auto' : 'none';
        /* `pointer-events` takes a keyword, not a number, so the dock cannot
           derive its own state from --end the way it derives its opacity. It
           gets the opposite keyword written for it instead. */
        const inv = q > 0.5 ? 'none' : 'auto';
        for (const n of this.pods) {
          n.style.setProperty('--end', v);
          n.style.setProperty('--end-events', e);
          n.style.setProperty('--end-events-inv', inv);
        }
      }
    },
  };

  function observeReveals() {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target))),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );
    $$('.reveal, .blk, .sec__body, .sec__heading').forEach((n) => io.observe(n));
  }

  /* ======================================================== boot ======== */

  function boot() {
    Sky.init();
    Shell.init();
    Nav.init();

    const page = Shell.page;
    (Pages[page] || Pages.home).call(Pages);

    Shell.stacks();
    Shell.avatars();
    Ink.init();
    Ghost.init();
    Rack.init();
    Shell.field();
    Sheet.init();
    observeReveals();

    /* One frame loop. It keeps running while the reveal is still easing toward
       its target, then parks itself until the next scroll. */
    let vh = innerHeight;
    let live = false;
    let idleFrames = 0;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30) || 1 / 60;
      last = now;

      /* every scroll-driven value is integrated with the same timestep, so they
         stay in sync regardless of display refresh rate */
      const a = Words.tick(vh, dt);
      const b = Showcase.tick(vh, dt);
      const g = Showcase.growTick ? Showcase.growTick(dt) : false;
      Project.tick(vh);
      Ink.tick();
      Rack.applyScope();
      Nav.tick();
      const dr = Drag.tick(dt);
      const pr = Canvas.parallax ? Canvas.parallax(dt) : false;
      const gh = Ghost.tick(dt);
      Sheet.tick(vh);

      if (a || b || g || dr || pr || gh) idleFrames = 0;
      else idleFrames++;

      if (idleFrames > 6) { live = false; return; }
      requestAnimationFrame(frame);
    };

    const wake = () => {
      idleFrames = 0;
      if (live) return;
      live = true;
      last = performance.now();
      requestAnimationFrame(frame);
    };

    wakeLoop = wake;
    addEventListener('scroll', wake, { passive: true });
    addEventListener('resize', () => { vh = innerHeight; Sheet.measure(); Nav.lastY = null; wake(); });
    wake();

    /* `is-holding` is what turns the sticker tool's open hand into a closed
       one. Bound on the window rather than the canvas because pointer capture
       during a drag routes pointerup to whichever element captured it, and a
       cancel or a focus loss mid-press would otherwise leave the cursor stuck
       in the grabbing state. */
    const hold = (on) => document.body.classList.toggle('is-holding', on);
    addEventListener('pointerdown', () => hold(true));
    addEventListener('pointerup', () => hold(false));
    addEventListener('pointercancel', () => hold(false));
    addEventListener('blur', () => hold(false));

    /* first gesture unlocks audio */
    const unlock = () => { Sound.wake(); removeEventListener('pointerdown', unlock); removeEventListener('keydown', unlock); };
    addEventListener('pointerdown', unlock);
    addEventListener('keydown', unlock);

    /* test hooks — harmless in production, and the only way the DOM harness can
       see inside the ink layer */
    window.__inkCount = () => Ink.strokes.length;
    window.__inkVisible = () => Ink.mine().length;
    window.__inkReset = () => { Ink.strokes.length = 0; Ink.draw(); };
    window.__carousel = () => { const w = $('[data-carousel]'); return w && w.__hl; };
    window.__lbox = () => ({ open: !!Lightbox.open, kids: Lightbox.stage ? Lightbox.stage.children.length : 0 });
    window.__lboxOpen = (i) => Lightbox.show($$('[data-zoom]')[i || 0]);
    window.__lboxClose = () => Lightbox.close();
    window.__rackReading = () => !!Rack.reading;
    /* Marquee: speed and position are read back so the slow-down can be tested
       without a browser — dt is injected rather than taken from the clock. */
    /* `base` may be a function — see Marquee.add. Resolving it the same way the
       driver does keeps the harness honest; reading it as a number silently gave
       NaN for the tape and every assertion about it passed vacuously. */
    const mqBase = (it) => (typeof it.base === 'function' ? it.base() : it.base);
    window.__mq = () => Marquee.items.map((it) => ({
      base: mqBase(it), lazy: typeof it.base === 'function',
      speed: it.speed, dir: it.dir, pos: it.pos,
      hot: it.hot(), period: it.period(),
    }));
    window.__mqStep = (dt, hot) => {
      Marquee.items.forEach((it) => {
        const full = mqBase(it);
        const target = (hot === undefined ? it.hot() : hot) ? full * Marquee.SLOW : full;
        it.speed += (target - it.speed) * (1 - Math.exp(-dt / Marquee.TAU));
        const p = it.period() || 1000;
        it.pos = (it.pos + it.speed * dt) % p;
      });
    };
    window.__mqSlow = () => Marquee.SLOW;
    /* SectionNav: the active item and the band membership, without a browser */
    window.__ink = () => Ink;
    window.__railRI = () => RailInk.current;
    window.__navActive = () => (SectionNav.links || [])
      .findIndex((a) => a.classList.contains('is-active'));
    window.__navIds = () => (SectionNav.secs || []).map((s2) => s2.id);
    window.__navBand = (ids) => {
      /* drive the observer's decision directly: ids currently in the reading band */
      if (!SectionNav.inBand) return -1;
      SectionNav.inBand.clear();
      (SectionNav.secs || []).forEach((s2) => { if (ids.includes(s2.id)) SectionNav.inBand.add(s2); });
      SectionNav.choose();
      return window.__navActive();
    };
    window.__navPinned = () => (SectionNav.pinnedIs ? SectionNav.pinnedIs() : -2);
    window.__railInk = () => $$('.rail__link').map((a) => a.dataset.ink || '');
    window.__railTick = () => { const r = $('.drawer__rail'); if (r && r.__inkTick) r.__inkTick(); };
    window.__inkSurfaces = () => Ink.strokes.map((s) => (s.surf ? s.surf.className : 'null'));
    window.__inkPts = () => (Ink.strokes[0] ? Ink.strokes[0].pts.length : 0);
    window.__inkColour = () => (Ink.strokes.at(-1) ? Ink.strokes.at(-1).color : null);
    window.__ghost = () => ({ kind: Ghost.kind, x: Ghost.x, y: Ghost.y });
    window.__ghostTick = (dt) => Ghost.tick(dt);
    window.__pointer = (x, y) => { Pointer.x = x; Pointer.y = y; Pointer.seen = true; };
    window.__rackMode = () => Rack.mode;
    window.__rackSet = (m) => Rack.setMode(m, 'test');
    window.__surfaceIsDrawer = () => !!Canvas.surface?.classList?.contains('drawer__scroll');
    window.__navInk = () => Nav.ink;
    window.__navSet = (surface) => Nav.set(surface);

    /* release the compositor layers once each reveal has played */
    $$('.rv').forEach((n) => n.addEventListener('animationend', () => n.classList.add('rv-done'), { once: true }));

    document.body.classList.add('is-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
