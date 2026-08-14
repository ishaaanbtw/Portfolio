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
      App.mountSky(root);

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

      /* A surface for the controls that sit on the sky, decided by the same
         light-or-dark answer the ink was. A frosted panel over a night sky and
         a white one over a noon sky are the same idea: put the chip on the far
         side of mid-luminance from its own text, so a button is legible at
         every hour without anyone choosing a colour per hour. */
      r.setProperty('--outro-chip', useLight
        ? 'rgba(255, 255, 255, 0.13)'
        : 'rgba(255, 255, 255, 0.55)');
      r.setProperty('--outro-chip-hi', useLight
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(255, 255, 255, 0.74)');
      r.setProperty('--outro-edge', useLight
        ? 'rgba(255, 255, 255, 0.17)'
        : 'rgba(20, 16, 12, 0.08)');

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

  /* ==================================================== 2b. the shell ====
     THE PAGE IS A SHEET OF PAPER LYING ON A DESK, AND THE DESK IS THE SKY.

     Opening the menu does not animate a menu. It slides the whole application
     right, and what was already underneath on the left is simply no longer
     covered. For that to read as one object rather than a dozen synchronised
     ones, everything the site draws has to carry the same transform at the same
     instant.

     It cannot be one element, and the reason is `position: fixed`. A transform
     makes its element the containing block for every fixed descendant, so the
     moment the shell moves, anything fixed inside it stops measuring from the
     viewport and starts measuring from the shell's own box. For the scrolling
     flow that box is the whole document, several thousand pixels tall, and the
     toolbar would fly off with it. So the fixed furniture is separated from the
     flow, into a wrapper that IS exactly the viewport — where being the
     containing block changes nothing, because the two rectangles coincide.

     Three layers, in paint order, all reading the same two custom properties:

       .pane   fixed. The window's back plate: the sky lives in it, it carries
               the corner radius and clips to it, and it casts the shadow. The
               shadow has to be here because a `box-shadow` paints outside the
               border box and `overflow: hidden` does not touch it, whereas the
               `clip-path` the other two need would cut it off.
       .app    the document flow. Not fixed, so it is clipped per-open to the
               viewport rectangle in document coordinates — which is a constant,
               because the scroll is locked while the menu is out.
       .free   fixed, and the one layer that never takes the transform. The two
               weather pods live here: they have to stay put when the shell
               slides, and they have to sit ABOVE the page rather than behind
               it, which is the one thing the deck could not offer them.
       .hud    fixed. Every overlay the modules mount: nav, dock, drawer, menu
               sheet, toasts. Its box is the viewport, so its fixed children
               keep measuring from the viewport exactly as before.
       .tips   fixed, untransformed, unclipped, and empty but for one label.
               THE ONE THING `.hud` CANNOT HOLD. `.hud` is a stacking context in
               which the dock declares 90, so a tooltip inside it could never be
               drawn over the dock however high it declared; it carries the
               shell transform, so viewport coordinates measured off a button
               would land in the wrong place while the menu is out; and it
               carries a clip-path. A label has to be above all three of those
               facts, so it gets the band above them.

     The first four move together because they are given one transform, from one
     pair of variables, with one transition. There is no orchestration to drift.
     `.tips` deliberately does not move: it is fed viewport coordinates read
     from live bounding rectangles, which are post-transform already. */
  const App = {
    init() {
      this.pane = el('div', { class: 'pane', 'aria-hidden': 'true' });
      this.app = el('div', { class: 'app', id: 'app' });
      this.free = el('div', { class: 'free', id: 'free' });
      this.hud = el('div', { class: 'hud', id: 'hud' });
      this.tips = el('div', { class: 'tips', id: 'tips', 'aria-hidden': 'false' });

      /* Everything already in the document is flow — the nav, the sheet, the
         outro. It goes into .app wholesale, and then the one fixed thing among
         them is lifted back out. */
      while (document.body.firstChild) this.app.appendChild(document.body.firstChild);
      document.body.append(this.pane, this.app, this.free, this.hud, this.tips);

      const nav = $('.nav', this.app);
      if (nav) this.hud.appendChild(nav);
    },

    /* Modules mount their furniture through here instead of onto the body.
       Returns the node so the chained `.appendChild(pod)` calls still read the
       way they did. */
    mount(node) { this.hud.appendChild(node); return node; },

    /* the sky goes under the flow, not over it */
    mountSky(node) { this.pane.appendChild(node); return node; },

    /* and the label goes over everything, including the thing it labels */
    mountTip(node) { this.tips.appendChild(node); return node; },

    /* THE PAGE SCROLLS INSIDE `.app`, NOT INSIDE THE WINDOW, and that is what
       lets the shell move while you are still reading. A rounded, scaled window
       has to be clipped to the viewport rectangle; if the document were the
       scroller, `.app` would be a box thousands of pixels tall and the clip
       would have to be rewritten in document coordinates on every scroll frame.
       Made viewport-sized instead, it clips itself with a plain border-radius
       and the scroll is just a scroll.

       Everything that used to ask the window how far down the page it was asks
       here instead. One place, so there is one answer. */
    y() { return this.app ? this.app.scrollTop : (window.scrollY || 0); },

    to(top, smooth) {
      const s = this.app || window;
      const opt = { top, behavior: smooth && !REDUCED ? 'smooth' : 'instant' };
      if (s.scrollTo) s.scrollTo(opt); else s.scrollTop = top;
    },

    onScroll(fn) { (this.app || window).addEventListener('scroll', fn, { passive: true }); },

    /* Holding the page still for a modal. An element scroller keeps its
       scrollTop under `overflow: hidden`, so none of the pin-the-body-at-a
       -negative-offset dance the document scroller needed applies here — and
       neither does the scrollbar-width compensation, because the bar belongs to
       `.app` and `.app` is not going anywhere. */
    lock(on) { document.body.classList.toggle('is-locked', !!on); },
  };

  /* ================================================ 2b. ONE POINTER SPACE ===

     THE SHELL MOVES, AND EVERY MEASUREMENT HAS TO KNOW IT.

     `.app` and `.hud` carry `translate3d(--app-x, --app-y, 0) scale(--app-s)`.
     A pointer event reports viewport coordinates — the only honest input there
     is. Almost everything else in this file works in the LOCAL coordinate space
     of something inside that transform: a brick's `--x`, a sticker's position on
     the canvas, a stroke sample, a fixed overlay's `left`. The two spaces are
     the same thing only while the menu is shut.

     Open the menu and they diverge by a translate of several hundred pixels and
     a scale of 0.935. That is why the sticker preview used to float a menu's
     width away from the cursor steering it, why the click spark landed off to
     one side, and why a sticker slid out from under the finger dragging it.

     THERE IS ONE CONVERSION AND IT IS HERE. Nothing subtracts a menu offset,
     nothing branches on whether the menu is open, nothing knows what `--app-x`
     is. Every answer is derived from geometry the browser has actually rendered,
     read now — which is what makes it right in the middle of the 600ms
     transition as well as at either end of it. A cached rect or a hard-coded
     offset would be correct in exactly the two states it was measured in. */
  const Space = {
    _k: 1, _fresh: false,

    /* THE SHELL'S LIVE SCALE, from the rendered box and not from `--app-s`: a
       custom property holds the TARGET from the frame the transition starts,
       while the element is still back at the old value. `.app` is
       `position: fixed; inset: 0`, so its laid-out width is the viewport and the
       ratio of its rendered width to that IS the scale, whatever produced it.

       Read at most once per frame. It forces a style flush, and pointermove can
       fire several times between paints. */
    k() {
      if (this._fresh) return this._k;
      const n = App.app;
      if (n) {
        const w = n.offsetWidth;
        const r = w ? n.getBoundingClientRect().width / w : 1;
        if (r > 0.01) this._k = r;
      }
      this._fresh = true;
      requestAnimationFrame(() => { this._fresh = false; });
      return this._k;
    },

    /* A VIEWPORT POINT, IN SOME ELEMENT'S OWN COORDINATES.

       The divisor comes from the host's own rendered width against its laid-out
       width, so this holds for a host under any transform — not only the
       shell's — and needs no argument about which transforms are in play. Falls
       back to the shell's scale for hosts with no layout width of their own. */
    local(cx, cy, host) {
      if (!host) return { x: cx, y: cy };
      const r = host.getBoundingClientRect();
      const w = host.offsetWidth;
      const k = w && r.width ? r.width / w : this.k();
      return { x: (cx - r.left) / k, y: (cy - r.top) / k };
    },

    /* A VIEWPORT DISTANCE, IN SHELL PIXELS. For drags and resizes: the pointer
       travels in viewport pixels while the thing it is carrying is measured in
       local ones, so 100px of cursor is 107 local pixels at 0.935 and the object
       stays under the finger. Without it the object creeps away from the
       pointer — slowly, and only while the menu is open. */
    len(d) { return d / this.k(); },
  };

  /* ==================================================== 2c. the deck =====
     What is underneath. It never moves and it never animates: it is painted
     once, at the bottom of the stack, and the shell sliding off it is the whole
     of the reveal.

     IT HAS NO SKY OF ITS OWN, AND THAT IS THE POINT. It used to build a second
     `.sky-root` — the same engine at the same hour, but its own clouds at its
     own offsets — while the shell carried a first one along with it. Two
     weathers, and the seam between them fell exactly where the footer meets the
     menu. There is one sky now, in `.pane`, fixed and untransformed at the back
     of everything: the paper floats on it, the footer is where the paper stops
     covering it, and this is more of the same sky with the paper moved aside. */
  const Deck = {
    built: false,

    /* Below 48rem the canvas travels down instead of sideways and the bar's
       button is the handle. Everything else — this whole module — is shared.
       Read live rather than cached, because a phone can be turned. */
    mob() { return matchMedia('(max-width: 48rem)').matches; },

    init() {
      const deck = el('div', { class: 'deck', id: 'deck' });

      const here = (location.pathname.split('/').pop() || 'index.html');
      const inner = el('div', { class: 'deck__inner' });
      const wrap = el('div', { class: 'deck__navwrap' });
      /* THE RAIL. Segments, not a line: a continuous stroke can only get
         brighter, and what this has to say is *where along itself* you are.
         Twenty-odd separate marks can each answer that individually, which is
         what makes the focus gradient legible — the rail reads like a ruler
         with your finger on it. Built after layout, because how many there are
         depends on how tall the list turns out. */
      this.rail = el('div', { class: 'deck__rail', 'aria-hidden': 'true' });
      /* Paints nothing — see .deck__mark in the stylesheet. It is where the
         spring's number lives, and the segments read their distance from it. */
      this.mark = el('span', { class: 'deck__mark', 'aria-hidden': 'true' });
      this.rail.appendChild(this.mark);
      wrap.appendChild(this.rail);
      const nav = el('nav', { class: 'deck__nav', 'aria-label': 'Site' });

      (S.deck && S.deck.links ? S.deck.links : []).forEach((l, i) => {
        /* `resume` and `email` are written as kinds rather than as URLs, because
           where they point is already settled in `person` and saying it twice is
           how the two drift apart. */
        const href = l.kind === 'resume' ? (S.person.resumeUrl || '#')
          : l.kind === 'email' ? `mailto:${S.person.email}`
            : l.href;
        const a = el('a', { class: 'deck__link', href }, esc(l.label));
        /* the document-level [data-action] delegate opens the resume in the
           page's own viewer rather than handing the file to the PDF plugin */
        if (l.kind === 'resume') a.dataset.action = 'resume';
        if (l.href === here) a.setAttribute('aria-current', 'page');
        nav.appendChild(a);
      });

      /* Any link closes it. A page link is about to unload anyway, but the
         resume opens in place — and it should open over a page that has finished
         coming back, not over one still sliding. */
      nav.addEventListener('click', (e) => { if (hit(e, 'a')) this.close(); });

      /* Hover sets the destination; leaving hands it back to the page you are
         actually on. The indicator is never told to jump — only ever given a
         new number to travel toward, which is why moving between two items
         reads as one continuous glide rather than two animations. */
      nav.addEventListener('pointerover', (e) => {
        const a = hit(e, '.deck__link');
        if (a) this.aim(a);
      });
      nav.addEventListener('pointerleave', () => this.aim(null));
      /* A FINGER DOES NOT HOVER. `pointerover` does fire once on a tap, but it
         fires with the tap — the indicator would start moving in the same frame
         the page starts unloading, which is no indicator at all. `pointerdown`
         is the earliest honest moment: the item is chosen, the rail travels to
         it, and the navigation follows on the click a beat later. */
      nav.addEventListener('pointerdown', (e) => {
        const a = hit(e, '.deck__link');
        if (a) this.aim(a);
      }, { passive: true });

      wrap.appendChild(nav);
      inner.appendChild(wrap);
      this.navEl = nav;

      /* THE SAME TWO PODS THE FOOTER HAS — the same nodes, not copies. They are
         borrowed from `.hud` while the deck is out and handed back when it
         closes, so the hour you set here is the hour the footer is already at:
         there is no second slider to fall out of step, and no second mute to
         disagree about whether the sound is on. */
      /* THE PODS LIVE HERE NOW, AND THEY NEVER MOVE HOUSE AGAIN.

         They used to be borrowed from `.hud` when the deck opened and handed
         back when it closed, and both ends of that were a teleport: a node
         leaves one layout and appears in another between two paint frames, and
         nothing in the browser knows the two positions are the same object.

         Paying for it with a FLIP did not work either, and the reason is worth
         keeping. Back in `.hud` the pod is a child of the shell, and the shell
         is itself mid-transition — so the pod's own animation composed with its
         parent's and it overshot 195px backwards before turning round. Two
         eases on one object do not add up to one ease.

         So there is one layout. They are re-parented once, here, at boot, into
         the layer that never moves, and from then on the only thing that ever
         changes is a transform — see `body.deck-open .controls` in the
         stylesheet, where the distance is written in viewport units and eased
         on the shell's own curve. Same nodes, same listeners, same slider
         value; no second parent to argue with. */
      this.pods = el('div', { class: 'deck__pods' });

      /* THE WAY OUT, SAID PLAINLY. The handle that opened this is on the canvas
         and the canvas has left; leaving it there as the only exit means the way
         back is a button riding a thing that just slid off. So it goes, and this
         takes over — in the corner the deck owns, where a close control belongs
         and where nothing else is. */
      /* A GLYPH IS NOT AN AFFORDANCE — a bare ✕ asks you to know the convention
         and gives the most important action on screen the smallest target on it.
         So it says the word. But it says it in the deck's own voice: type, in
         the deck's own ink, at the deck's own scale. A filled pill with a key
         cap in it was a control borrowed from some other interface and dropped
         on this sky, and it looked exactly like that. */
      this.closeBtn = el('button', {
        class: 'deck__close', type: 'button', 'aria-label': 'Close menu',
      }, '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"'
       + ' stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>'
       + '<span>Close</span>');
      this.closeBtn.addEventListener('click', () => this.close());

      deck.append(this.closeBtn, inner, this.pods);
      document.body.prepend(deck);

      /* THE HANDLE RIDES THE SHELL, NOT THE SCREEN. It goes in .hud, so it
         carries the same transform as everything else and stays welded to the
         canvas's left edge the whole way across — which is what makes the edge
         read as the edge of an object you are pushing, rather than as a button
         that happens to be near it. It is also the leading edge: the deck comes
         out from behind the handle, not from the far side of the screen. */
      const tab = el('button', {
        class: 'tab-menu', type: 'button',
        'aria-label': 'Menu', 'aria-expanded': 'false', 'aria-controls': 'deck',
      }, '<span>Menu</span>');
      tab.addEventListener('click', () => this.toggle());
      App.mount(tab);
      /* it reads --end like the pods do, and Sheet collected them before this
         existed */
      Sheet.collect();

      /* Escape, and a click anywhere on the pushed-aside canvas. The canvas is
         not disabled while it is out — it is still a page, you can still read
         it — so the click has to be caught where it lands and not swallowed by
         whatever it landed on. Capture phase, and only while open. */
      addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) { e.preventDefault(); this.close(); }
      });
      /* Clicking the deck's own background closes it. The canvas does NOT —
         it is still a live page out there, and swallowing its clicks to use
         them as a dismiss would be the one thing that gives away that it is a
         menu rather than a workspace. */
      deck.addEventListener('click', (e) => {
        if (this.isOpen && !hit(e, 'a, button, input, .deck__pods')) this.close();
      });

      this.el = deck;
      this.built = true;

      /* Segment count follows the list's real height, so the rail always spans
         it whatever is in `deck.links`. Re-measured on resize because the type
         is clamped to the viewport. */
      /* NOT INTO THE DECK — INTO `.free`. They were put in the deck because it
         is the layer that does not move, which was right, and it cost them
         their clicks: the deck paints at z-index 1 and the page at 2, so at the
         footer the outro was lying on top of both pods and `elementFromPoint`
         over the slider returned `div.outro`. They looked fine and did nothing.
         `.free` is the same idea one layer up — stationary, but above the page
         rather than under it. */
      [$('.controls'), $('.mute')].forEach((n) => n && App.free.appendChild(n));

      this.railFit();
      this.podFit();
      addEventListener('resize', () => { this.railFit(); this.podFit(); });
      this.markY = this.markTo = 0; this.markV = 0;
      this.aim(null);
    },

    /* --- the two pods, on a phone ------------------------------------------
       They translate into the menu strip on the shell's own curve, the same as
       they do on a laptop. Only one number has to be measured: where the pod
       sits when nothing has moved it. It cannot be written in CSS because it
       depends on the pod's own height AND on `env(safe-area-inset-bottom)`,
       and it cannot be read off a rect either, because both pods are already
       carrying a transform of their own — the `--end` rise. So the transform is
       lifted for one read and put straight back. One forced layout, on resize
       and at boot, and never during the animation. */
    podFit() {
      const root = document.documentElement;
      const pod = $('.controls');
      if (!pod) return;
      if (!this.mob()) { root.style.removeProperty('--deck-podup'); return; }
      /* The pod is already carrying a transform of its own — the `--end` rise —
         so its rect is not where CSS put it. Lift it for one read and put it
         straight back. `--deck-h` cannot be read instead: an unregistered custom
         property comes back as the literal `clamp(...)` it was written as, so
         the strip is measured off the element that resolves it. */
      const prev = pod.style.transform;
      pod.style.transform = 'none';
      const r = pod.getBoundingClientRect();
      pod.style.transform = prev;
      const inner = $('.deck__inner');
      const strip = inner ? inner.getBoundingClientRect().height : 0;
      const gut = parseFloat(getComputedStyle(root).fontSize) * 1.15 || 18;
      root.style.setProperty('--deck-podup', `${Math.round(strip - gut - r.height - r.top)}px`);
    },

    /* One handle at both widths — the paper tab. It is welded to whichever
       edge the canvas leads with, and it is gone while the deck is out. */
    handle() { return $('.tab-menu'); },

    /* --- the rail ------------------------------------------------------- */

    SEG: 13,          /* 2px mark + 11px gap */

    railFit() {
      if (!this.navEl || !this.rail) return;
      const h = this.navEl.offsetHeight;
      if (!h) return;
      const n = Math.max(6, Math.round(h / this.SEG));
      if (n === this.segN) return;
      this.segN = n;
      $$('i', this.rail).forEach((x) => x.remove());
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) frag.appendChild(el('i', { style: `--y:${i * this.SEG}px` }));
      this.rail.insertBefore(frag, this.mark);
      this.segs = $$('i', this.rail);
      this.segLast = new Array(n).fill(-1);
      this.railH = h;
    },

    /* Where the indicator should be heading. `null` means back to the page you
       are on, which is why the active item stays lit once the pointer leaves. */
    aim(a) {
      const link = a || (this.navEl && $('.deck__link[aria-current]', this.navEl))
        || (this.navEl && $('.deck__link', this.navEl));
      if (!link || !this.navEl) return;
      const r = link.getBoundingClientRect();
      const n = this.navEl.getBoundingClientRect();
      this.markTo = r.top - n.top + r.height / 2;
      $$('.deck__link', this.navEl).forEach((x) => x.classList.toggle('is-aim', x === link));
      wakeLoop();
    },

    /* Spring, in the page's frame loop, same reason as everywhere else on this
       site: a transition restarts on every re-target and throws its velocity
       away, so crossing three items would be three animations. This is one.
       k = 240, d = 31 — ratio 1.0006, critically damped, no overshoot past the
       word it is pointing at. */
    tick(dt) {
      if (!this.built || !this.segs || !this.segs.length) return false;
      const d = this.markTo - this.markY;
      if (Math.abs(d) < 0.05 && Math.abs(this.markV) < 0.5) {
        if (this.settled) return false;
        this.settled = true;
        this.markY = this.markTo; this.markV = 0;
      } else {
        this.settled = false;
        this.markV += (d * 240 - this.markV * 31) * dt;
        this.markY += this.markV * dt;
      }

      this.mark.style.transform = `translate3d(0, ${this.markY.toFixed(1)}px, 0) translateY(-50%)`;

      /* The focus gradient. Each segment is lit by how near it is to the
         indicator, and written only when its quantised value actually moves —
         twenty-odd elements a frame is cheap, twenty-odd style writes a frame
         for no change is not. */
      const FALL = 74;
      for (let i = 0; i < this.segs.length; i++) {
        const dy = Math.abs(i * this.SEG - this.markY);
        const t = Math.max(0, 1 - dy / FALL);
        const q = Math.round(t * 10);
        if (q === this.segLast[i]) continue;
        this.segLast[i] = q;
        const e = (q / 10) * (q / 10);          // squared: the falloff is tight
        this.segs[i].style.opacity = (0.18 + e * 0.72).toFixed(2);
        this.segs[i].style.width = `${(18 + e * 6).toFixed(1)}px`;
      }
      return !this.settled;
    },

    open() {
      if (!this.built || this.isOpen) return;
      this.isOpen = true;

      /* THE PAGE KEEPS WORKING WHILE IT IS OUT. Nothing is pinned and nothing
         is disabled: the shell is viewport-sized and scrolls inside itself, so
         it can be read, scrolled and drawn on where it stands. That is the whole
         reason the scroll container moved off the document — see App.y(). */
      clearTimeout(this.t);
      /* measured BEFORE the class lands: the pods read `--deck-podup` on the
         frame the transition starts, and a value written after it would send
         them to one target and then re-aim them mid-flight */
      this.podFit();
      document.body.classList.remove('deck-shut');
      document.body.classList.add('deck-open');
      /* THE SHELL IS ABOUT TO MOVE FOR 600ms, so anything that tracks the
         pointer against it has to be running. The frame loop sleeps when
         nothing is animating, and a cursor held still over the canvas is
         exactly the case where it would be asleep while the ground moves
         underneath the preview standing on it. */
      wakeLoop();
      /* the list has a height now that it is on screen */
      requestAnimationFrame(() => { this.railFit(); this.aim(null); });
      this.el.removeAttribute('aria-hidden');
      const h = this.handle();
      if (h) h.setAttribute('aria-expanded', 'true');
      /* the exit takes focus, so Tab starts from the way out rather than
         landing on it last */
      setTimeout(() => this.closeBtn && this.closeBtn.focus({ preventScroll: true }), 260);
    },

    close() {
      if (!this.built || !this.isOpen) return;
      this.isOpen = false;
      /* `deck-shut` is the journey back: it keeps the transform, the clip and
         the deck's own visibility alive while the shell travels, and comes off
         once it has landed. Without it the page would teleport home. */
      document.body.classList.remove('deck-open');
      document.body.classList.add('deck-shut');
      wakeLoop();                       // the same 600ms, travelling the other way
      this.el.setAttribute('aria-hidden', 'true');
      const h = this.handle();
      if (h) { h.setAttribute('aria-expanded', 'false'); h.focus({ preventScroll: true }); }

      clearTimeout(this.t);
      this.t = setTimeout(() => {
        if (this.isOpen) return;
        document.body.classList.remove('deck-shut');
      }, REDUCED ? 20 : 680);
    },

    toggle() { this.isOpen ? this.close() : this.open(); },
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
       A row of six links is a desktop pattern: it assumes a cursor and a page
       wide enough to spare the room. At 390px it is 262px of 16px-tall targets
       sitting on top of the headline.

       So below 48rem the row is replaced by a bar with two things on it — the
       name, and one control. The control is NOT a menu of its own. It is the
       handle for the same reveal the desktop has: it opens `Deck`, the same
       object, with the same links, the same rail and the same sky behind it,
       and the only difference is that the canvas travels down instead of
       sideways (see section 38b in the stylesheet).

       What used to be here was a second navigation entirely — four coloured
       panels that came down over the page, with their own type, their own
       physics and their own idea of what a menu is. Three hundred lines of it,
       and all of them said something this page does not believe: that the
       interface is a sheet of paper on a desk everywhere except on a phone.

       Project pages already hide `.nav` entirely, and the bar goes with it, so
       nothing here can reach a case study. */
    menu() {
      if (this.page === 'project' || $('.mbar')) return;

      const bar = el('div', { class: 'mbar', 'aria-hidden': 'false' });

      /* THE NAME, AND ONLY THE NAME. A desktop reads the nav links and knows
         whose site it is from the headline; below 48rem the links collapse and
         the headline is at the bottom of the hero, so until you scroll there is
         nothing above the fold saying who this is.

         There is no button in here. The handle is `.tab-menu` — the same paper
         tab the desktop has, on the canvas's top edge instead of its left one,
         because that is the edge the canvas leads with at this width. One
         component, one design, two orientations; see section 38b.

         AND THE NAME LEAVES ON THE FIRST SCROLL. It has no surface, on purpose,
         so anything that scrolls under it collides with it — at the experience
         table that is two headings written over each other. Its job is done by
         then anyway: the page below it says whose site this is at length. */
      bar.appendChild(el('a', { class: 'mbar__name', href: 'index.html' },
        esc(S.person.name)));

      const away = () => bar.classList.toggle('is-away', App.y() > 24);
      addEventListener('scroll', away, { passive: true });
      if (App.app) App.app.addEventListener('scroll', away, { passive: true });

      App.mount(bar);
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
      App.mount(el('div', { class: 'controls' })).appendChild(pod);

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
      App.mount(mute);

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
    /* Takes VIEWPORT coordinates — where the click actually happened — and puts
       the spark there. It is mounted into `.hud`, which rides the shell, so a
       `position: fixed` child of it resolves `left` against the shell's own
       moved, scaled box and not against the screen. Handed clientX directly, the
       spark appeared a menu's width from the click that caused it. One
       conversion at the point of writing; the caller keeps passing what the
       event reported. */
    spark(x, y) {
      if (REDUCED) return;
      const p = Space.local(x, y, App.hud);
      const s = el('span', { class: 'spark', 'aria-hidden': 'true' });
      s.style.left = `${p.x}px`;
      s.style.top = `${p.y}px`;
      for (let k = 0; k < 6; k++) {
        s.appendChild(el('i', { style: `--a:${36 + k * 60}deg` }));
      }
      App.mount(s);
      setTimeout(() => s.remove(), 220);
    },

    toast() {
      this.toastEl = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
      App.mount(this.toastEl);
    },

    /* One tooltip element, repositioned on demand. It springs up from under the
       badge rather than fading in place.

       IT IS MOUNTED INTO `.tips`, NOT `.hud`, and that is the whole of the bug
       it used to have. Inside `.hud` it was a `z-index: 58` in a stacking
       context where the dock declares 90, so the label for a dock button was
       painted behind the dock — legible only for the topmost button, whose
       label happened to clear the panel's top edge, and cut in half for every
       button below it. The `.tools .tip` block in section 24 of the stylesheet
       was written to fix precisely this and never applied to anything, because
       the tooltip has never been a descendant of `.tools` and never should be:
       `.tools` carries `translate: 0 -50%`, which would make it the containing
       block for the label and clip the label to the dock's own paint order all
       over again. A portal is the fix, so the label gets a portal.

       TWO PLACEMENTS, AND THE ANCHOR CHOOSES. A badge in the middle of a
       paragraph wants its label above it with the arrow pointing down, which is
       what everything on the page has always got. A button in a vertical dock
       pinned to the right edge cannot: above means on top of the button over
       it. So anything inside the dock is labelled off the dock's LEFT edge,
       vertically centred on the button, and the arrow turns to match. */
    tooltip() {
      const tip = el('div', { class: 'tip', role: 'tooltip' });
      App.mountTip(tip);
      this.tipEl = tip;

      const GAP = 10;      /* px between the label and the dock's outer edge */
      const EDGE = 8;      /* and the least it may come to the screen's own */

      let current = null;  /* the anchor being labelled, or null */
      let key = '';        /* its last committed position, as a string */
      let wide = 0;        /* the label's measured width, per label */
      let frame = 0;       /* the follow loop, alive only while a label is up */
      let leave = 0;       /* the pending dismissal, if any */

      /* THE DOCK IS ONE OBJECT, so the label hangs off the object's edge and
         not off each button's. Buttons in there are not all the same width —
         the tools are 32px and the row beneath them is not — and anchoring per
         button would step the label in and out as you run down the column. The
         surface is the panel while the dock is open and the tab while it is
         folded, because those are the two things actually on screen. */
      const surface = (node) => node.closest('.tools__panel, .tools__tab');

      const measure = (node) => {
        const r = node.getBoundingClientRect();
        const surf = surface(node);
        if (surf) {
          const s = surf.getBoundingClientRect();
          /* Left is the placement, not a preference among equals: over, under,
             inside and right are all worse than the thing being labelled. The
             only honest fallback is the page's own default — above — and it
             takes a viewport narrower than the label plus the dock to reach it,
             which is why this is a guard and not a strategy. */
          if (s.left - GAP - EDGE >= wide) {
            return { x: s.left - GAP, y: r.top + r.height / 2, side: 'left' };
          }
        }
        return { x: r.left + r.width / 2, y: r.top - 6, side: 'up' };
      };

      /* Rounded, because the position is compared against the last one every
         frame and sub-pixel drift would read as a change on every one of them. */
      const stamp = (t) => `${t.side}|${Math.round(t.x)}|${Math.round(t.y)}`;

      const commit = (t, slide) => {
        key = stamp(t);
        tip.dataset.side = t.side;
        /* `is-jump` is the difference between the label travelling and the
           label being somewhere else. See the loop below. */
        tip.classList.toggle('is-jump', !slide);
        tip.style.setProperty('--tip-x', `${Math.round(t.x)}px`);
        tip.style.setProperty('--tip-y', `${Math.round(t.y)}px`);
      };

      /* THE LABEL IS PINNED TO THE BUTTON, NOT TO A COORDINATE IT WAS HANDED
         ONCE. The dock moves under it in four different ways — it opens, it
         folds to a tab, it re-centres on resize, and it rides the shell when
         the menu slides — and a position measured at hover time is wrong for
         all four. So the anchor is re-read every frame while a label is up, and
         the label is moved only when the answer actually changed.

         That last clause is what keeps the two motions from fighting. Moving
         between buttons is a 150ms glide, committed by show() with slide on.
         The anchor itself moving is instant, committed here with slide off —
         because a label that eases along behind its own button does not look
         smooth, it looks detached. And during a glide the anchor is stationary,
         so this loop sees no change and leaves the glide alone. */
      const follow = () => {
        if (!current) { frame = 0; return; }
        const t = measure(current);
        if (stamp(t) !== key) commit(t, false);
        frame = requestAnimationFrame(follow);
      };

      const show = (node) => {
        const label = node.dataset.tip;
        if (!label) return;
        if (leave) { clearTimeout(leave); leave = 0; }
        const up = tip.classList.contains('is-up');
        if (tip.textContent !== label) { tip.textContent = label; wide = tip.offsetWidth; }
        else if (!wide) wide = tip.offsetWidth;
        current = node;
        /* Appear where you are; travel only between items. A label that has
           been hidden and then flies in across the screen from the last thing
           you hovered reads as a glitch, not as continuity. */
        commit(measure(node), up);
        tip.classList.add('is-up');
        if (!frame) frame = requestAnimationFrame(follow);
      };

      /* A GRACE PERIOD, NOT AN IMMEDIATE DISMISSAL. The dock's buttons have
         gaps and hairline dividers between them, so the pointer crosses dead
         pixels on the way from one to the next. Dropping the label on the first
         frame with nothing under the cursor is what made it blink between
         neighbours. 90ms is longer than any such transit and far shorter than
         an intention to leave. The timer is started once and not restarted by
         further movement, or a slow drag across empty page would postpone it
         indefinitely. */
      const hide = () => {
        if (!current || leave) return;
        leave = setTimeout(() => {
          leave = 0;
          current = null;
          tip.classList.remove('is-up');
        }, 90);
      };

      document.addEventListener('pointermove', (e) => {
        const node = hit(e, '[data-tip]');
        if (node && node === current) {
          /* back on the anchor within the grace period — call off the exit */
          if (leave) { clearTimeout(leave); leave = 0; }
          return;
        }
        if (node) show(node);
        else hide();
      }, { passive: true });

      /* Scrolling used to need its own handler here. It does not any more: the
         page moving is the anchor moving, and the follow loop above already
         watches for that — from the rectangle itself rather than from a list of
         the things that might have changed it. */
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
      App.mount(field);

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
      App.onScroll(() => { if (open) setOpen(false); });
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
          /* the ripple starts under the finger, in the button's own space */
          const q = Space.local(e.clientX, e.clientY, b);
          const ink = el('span', { class: 'btn__ink', style: `left:${q.x}px;top:${q.y}px` });
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
            document.body.appendChild(ta);   /* transient, stays off the shell */
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
      App.mount(wrap);

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
            const y = target.getBoundingClientRect().top + App.y();
            App.to(y, true);
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

    /* HOW THE BRICK ENGINE KNOWS THE HERO MOVED.

       Some objects on this canvas are walls to a brick — the headline, the tags,
       the button row (see Bricks.wallHosts). Their collision geometry has to
       follow them, and the cheapest correct way to arrange that is to make the
       geometry lazy and give it something to compare against: this counter is
       bumped by `apply` for wall-bearing items only, so a brick being dragged
       does not touch it and the headline being dragged a single pixel does.
       Bricks.wallsNow() re-measures when the number has changed and otherwise
       does one integer compare. */
    gen: 0,

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
      /* SOME OBJECTS MUST NOT BE RESIZED OR ROTATED, and for them the chrome is
         not merely redundant, it is destructive twice over.

         A brick's art is generated from its cell list at a fixed lattice unit.
         Scale it and the picture no longer matches the footprint the snap
         engine tests against; rotate it and its cells no longer lie on any
         lattice at all. Both silently break every future connection.

         And there is a plainer problem underneath that. The eight handles are
         hit targets sized for a hand, laid over the object's corners and edges.
         On a 23px brick they cover it completely — every one of them carries
         `data-nodrag`, so the press is read as a resize and the piece can never
         be picked up again once it has been selected once. The first thing
         built with these was unmovable. */
      if (opts.chrome !== false) this.chrome(it);

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

        /* THE SOFT EDGE, MEASURED ONCE PER GESTURE.

           Both boxes are cached at grab rather than read per move: the object's
           rect already carries the transform it has at x = ox, so a later
           position's rect is this one plus (x - ox). Reading it every
           pointermove would be a forced layout inside the event that has to
           paint this frame. */
        this.edge(it, ox, oy);

        /* Anything that needs to know a gesture began — see Bricks, which uses
           it to pop a piece out of its structure when Alt is held. */
        if (it.onGrab) it.onGrab(it, e);
      });

      node.addEventListener('pointermove', (e) => {
        if (!armed) return;
        /* THE GRAB POINT IS ALREADY PRESERVED — this is a delta applied to the
           position the object had when it was grabbed, so it cannot jump. What
           it could do was drift: the pointer travels in viewport pixels and
           `it.x` is written in the shell's, so at 0.935 the object moved 93.5%
           as far as the cursor and slid out from under it over a long drag.
           One divide, and the two agree at any scale. */
        const dx = Space.len(e.clientX - gx), dy = Space.len(e.clientY - gy);

        if (!it.dragging) {
          if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
          it.dragging = true;
          node.classList.add('is-drag');
          this.raise(it);
          Sound.voice({ freq: 620, gain: 0.022, dur: 0.03, bright: 3800, drop: 0.8, noise: 0.7 });
        }

        it.x = ox + dx;
        it.y = oy + dy;
        if (it.bounds) {
          it.x = Math.min(Math.max(it.x, it.bounds.x0), it.bounds.x1);
          it.y = Math.min(Math.max(it.y, it.bounds.y0), it.bounds.y1);
        }
        /* The type's own steering, BEFORE apply, so whatever it does to x/y is
           what gets painted this frame rather than one frame late. Bricks use
           it to lean toward a compatible connection and to carry the rest of
           their structure along. */
        if (it.onMove) it.onMove(it);
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
        /* A type that returns true from onDrop has pushed its own entry. A
           brick's gesture can move six other bricks and change what is welded
           to what, and none of that is expressible as "put this one back". */
        if (it.onDrop && it.onDrop(it, fx, fy) === true) {
          Sound.voice({ freq: 300, gain: 0.03, dur: 0.06, bright: 1800, drop: 0.6, noise: 0.4 });
          return;
        }
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

    /* --- the soft edge -------------------------------------------------------
       Nothing is fenced into the middle of the canvas and nothing is ever
       sprung back to it. The only rule is that an object cannot be pushed so
       far out that there is nothing left to grab: KEEP pixels of it stay inside
       the surface on every side, and within that it goes wherever it is put.

       Objects larger than the surface would produce an inverted range, so each
       axis is ordered before it is used. */
    KEEP: 46,

    edge(it, ox, oy) {
      it.bounds = null;
      const host = (Canvas && Canvas.host) || null;
      if (!host || !host.contains(it.node)) return;
      const r = it.node.getBoundingClientRect();
      const h = host.getBoundingClientRect();
      if (!r.width || !h.width) return;
      const k = Math.min(this.KEEP, r.width * 0.9, r.height * 0.9);
      /* `ox/oy` are canvas coordinates and everything derived from the two
         rects is screen distance, so the screen part is divided before it is
         added. The bounds are what stops an object being dragged off the paper;
         measured in the wrong unit they let it go 6.5% too far, or stopped it
         6.5% short, depending on which edge you pushed against. */
      const s = host.offsetWidth ? h.width / host.offsetWidth : Space.k();
      let x0 = ox + ((h.left + k) - r.right) / s;
      let x1 = ox + ((h.right - k) - r.left) / s;
      let y0 = oy + ((h.top + k) - r.bottom) / s;
      let y1 = oy + ((h.bottom - k) - r.top) / s;
      if (x0 > x1) { const m = (x0 + x1) / 2; x0 = x1 = m; }
      if (y0 > y1) { const m = (y0 + y1) / 2; y0 = y1 = m; }
      it.bounds = { x0, x1, y0, y1 };
    },

    apply(it) {
      /* The single write point for every position, angle and scale on this
         canvas, which is why the wall invalidation hangs off it rather than off
         the drag handlers — a resize handle, a rotate grip, an undo and a
         programmatic move all come through here, and none of them has to
         remember to tell anybody. */
      if (it.wall) this.gen += 1;
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
      /* Both rects are screen rects and `it.x` is a canvas coordinate, so the
         screen part is converted before the two are subtracted. `baseW/H` below
         are `offsetWidth/Height`, which are already canvas pixels — that pairing
         is the reason to land on the canvas's units rather than the screen's. */
      const k = host.offsetWidth ? cr.width / host.offsetWidth : Space.k();
      it.baseCX = ((nr.left + nr.right) / 2 - cr.left) / k - it.x;
      it.baseCY = ((nr.top + nr.bottom) / 2 - cr.top) / k - it.y;
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
            /* `aabbW/H` are laid-out pixels — `baseW * sx` — so the pull that
               is compared against them has to be in the same unit. */
            const dx = Space.len(ev.clientX - gx), dy = Space.len(ev.clientY - gy);

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
      if (it.onDetach) it.onDetach(it);
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
      if (it.onReattach) it.onReattach(it);
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
  /* --- the glyphs a tag can carry ------------------------------------------
     Inline rather than files, and that is the whole reason they are here: an
     `<img>` cannot inherit `currentColor`, and both of these are meant to be
     the same grey as the label they sit in. The company mark in particular is
     type, not decoration — it stands in for a word in the middle of a sentence
     — so it has to take the sentence's colour, at every state the tag has.

     Both are drawn on a 24 box except the mark, which keeps its own
     proportions: it is taller than it is wide (100 x 120.7) and squaring it
     into a 24 box would either letterbox it or stretch it. */
  /* --- THE ONE SWITCH FOR COLLISION GEOMETRY -------------------------------
     SHIP THIS FALSE. It is the only thing in the file that can put the snap
     model on screen, and it exists so that "is the debug layer off?" is a
     question you answer by reading one line rather than by auditing a module.

     False: the hero's regions, its edges and the search radii are numbers and
     nothing else — no node, no SVG, no class on the hero, nothing in the DOM at
     all. The user sees the piece in their hand and the ghost, and that is the
     whole of it.

     True (or `?brkdebug` on the URL, or `__brickDebug(true)` from the console,
     which are the two ways to get it without editing this): `debugDraw` puts
     the model over the canvas — every region, its four snap edges, the edge the
     current landing is against, each piece's true footprint, the anchor, the
     detect and magnet radii, every candidate the solver found and which one it
     took. That is the picture worth having when a snap misbehaves, and it is
     also the only place any of it is ever drawn. */
  const DEBUG_SNAP_GEOMETRY = false;

  const PILL_ICON = {
    /* SOLID, not the outline this used to be. Measured off the reference: the
       pin is 58 x 76 of ink with a 26px hole, so the head is a circle of the
       full width, the hole is concentric with it at 0.45 of the width, and the
       flanks are the two tangents from the point back onto that circle. Every
       number below is that measurement scaled into the 24 box — the tangent
       angle included, which is what makes the shoulders meet the head cleanly
       instead of denting it. */
    /* THE viewBox IS TIGHT TO THE INK, and that is not tidiness. A glyph in a
       line of type is sized by how tall the drawing is, and a 24 box with the
       pin sitting in 77% of it means the number in the stylesheet is 77% of
       what it appears to be — which is exactly how the first pass came out a
       third too small against the reference. Box height == ink height, so
       `height: 0.98em` puts 0.98em of pin on the screen. */
    pin: '<svg viewBox="0 0 14.1 18.48" fill="currentColor" fill-rule="evenodd">'
      + '<path d="M12.6 11.4A7.05 7.05 0 1 0 1.5 11.4L7.05 18.48Z'
      + 'M3.89 7.05a3.16 3.16 0 1 0 6.32 0a3.16 3.16 0 1 0-6.32 0Z"/></svg>',
    /* The Cypherock mark. Traced from the supplied artwork at 4x and reduced to
       two 16/18-point polygons — it is all straight lines, so there is nothing
       for a curve to fit and the trace is the shape rather than an impression
       of it (0.44% of pixels differ from the original, all of it the antialias
       fringe). The same mark is at assets/img/logos/cypherock.svg for anywhere
       that wants it as a file; keep the two in step. */
    cypherock: '<svg viewBox="0 0 100 120.72" fill="currentColor" fill-rule="evenodd">'
      + '<path d="M0 64.71 39.42 120.52 69.94 75.61 85.38 75.5 64.4 106.3 60.14 100.23'
      + ' 55.63 106.99 64.56 120.72 100 68.64 65.55 68.49 39.63 106.56 15.18 72.01'
      + ' 30.67 71.83 43.74 90.1 48.25 83.31 35.29 64.94Z"/>'
      + '<path d="M100 52.18 64.58 0 55.63 13.83 60.14 20.49 64.07 14.52 64.51 14.62'
      + ' 85.38 45.22 70.04 45.22 39.42 0.2 0.1 55.98 35.06 56.01 48.15 37.61'
      + ' 43.74 30.62 30.67 48.99 15.34 48.89 15.28 48.61 39.63 14.16 65.55 52.23Z"/></svg>',
  };

  const TOOL_ICON = {
    cursor: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.6 1.4 13 8.2l-4.3.5-2 4Z"/></svg>',
    /* STICKERS. A round die-cut with its corner peeled back — which is the
       object this tool places, not a metaphor for it: the artwork in
       assets/img/pixel is cut-outs with a white die-cut edge, and `peelStyle`
       lifts that edge on hover. A plus was here before and said "add
       something", which is true of every button that adds something.

       Round, and not the obvious dog-eared square, because the dog-eared square
       is already on screen: the sticky-note tool sits directly above this one in
       the same column and is drawn as exactly that silhouette. Two tools, one
       shape, eighteen pixels apart.

       THE FOLD IS FILLED, AND IT IS A BIG FOLD, because the honest version of
       this icon does not survive. A tasteful peel — a corner turned back a
       couple of degrees, drawn as a second hairline — is legible at 4x and is a
       plain circle at the 19.5px this actually renders at: the first attempt
       here put the flap's curve 0.1px inside its own chord, which is not a
       drawing, it is a rounding error. A fold has to enclose real area to read,
       so this one takes a 125-degree bite and fills it. Judged at 19.5px on the
       real disc, in both the light and the purple state, against six
       alternatives — not at 4x, where all six looked fine. */
    sticker: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.07" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M13.16 6.42A5.4 5.4 0 1 0 6.42 13.16"/>'
      + '<path fill="currentColor" d="M13.16 6.42 6.42 13.16Q7.4 7.4 13.16 6.42Z"/></svg>',
    /* PRESETS. Three stacked bars with two studs on the top one — bricks seen
       end-on. Monochrome, same 16 viewBox and the same hairline stroke the sticker
       and the undo are drawn with, so it sits in the column without announcing
       that it arrived later than the rest. It says "builds"; a gear would have
       said "settings". */
    preset: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M5.4 2.7h1.7M9.8 2.7h1.7"/>'
      + '<rect x="3.6" y="4.4" width="9.8" height="4.2" rx="0.9"/>'
      + '<rect x="2.1" y="9.9" width="9.8" height="4.2" rx="0.9"/></svg>',
    /* A CIRCLE, NOT A HOOK. This was a bent return arrow — the shape a text
       field's undo takes. The recording's is a ring: a near-complete circle
       broken at the upper left, with an L-tick closing it. On a canvas that is
       the right glyph, because what the button undoes is a mark you made in
       space, not a character you typed.

       The stroke is 1.1 rather than 1.5 because the box below is 21.5px, not
       14px — see the note over `.tool--undo svg`. Widening the box without
       thinning the stroke would have drawn the same icon in bold. */
    undo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.12" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8a6 6 0 1 0 2-4.47L2 5.33"/><path d="M2 2v3.33h3.33"/></svg>',
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
      /* Re-measured off the recording. The old pair came from the note's INK —
         46.5px of purple — but --oh sizes the whole 74x74 art box, and the note
         is drawn inset within it. Sized by the ink, the art came out a fifth
         too small and showed 11.5px of purple where the recording shows 16.5. */
      note.style.setProperty('--oh', '56.2px');
      note.style.setProperty('--ow', '56.2px');
      note.style.setProperty('--vis', '22.2px');
      panel.appendChild(note);

      panel.appendChild(el('span', { class: 'tools__div' }));

      const add = el('button', {
        class: 'tool', type: 'button', 'data-tool-btn': 'sticker',
        'data-tip': 'Add', 'aria-label': 'Add stickers', 'aria-pressed': 'false',
      }, TOOL_ICON.sticker);
      add.addEventListener('click', () => this.pick('sticker'));
      panel.appendChild(add);

      /* PRESETS, between Add and Undo. It is not a `pick()` tool — it opens a
         shelf rather than arming the pointer — so it carries no `data-tool-btn`
         and never joins the mutually-exclusive tool state. Everything else
         about it is the existing chip: same box, same hover, same press. */
      const pre = el('button', {
        class: 'tool tool--preset', type: 'button',
        'data-tip': 'Builds', 'aria-label': 'LEGO builds', 'aria-expanded': 'false',
      }, TOOL_ICON.preset);
      pre.addEventListener('click', (e) => { e.stopPropagation(); Bricks.shelf(pre); });
      panel.appendChild(pre);

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
        'data-tip': 'Open Workspace Tools',
        'aria-label': 'Open Workspace Tools', 'aria-expanded': 'false',
      }, TOOL_ICON.cursor);
      tab.addEventListener('click', () => { this.userCollapsed = false; this.setMode('open', 'tab'); });
      rack.appendChild(tab);
      this.tab = tab;

      /* one bubble element for the welcome line, one for shortcut confirmations */
      this.say = el('div', { class: 'tools__say', role: 'status', 'aria-live': 'polite' });
      this.flash = el('div', { class: 'tools__say tools__flash', 'aria-hidden': 'true' });
      rack.append(this.say, this.flash);

      this.fabInit(rack);

      App.mount(rack);
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
        /* THE SAME GLYPH THE DOCK USES. This map is what the phone's button and
           the desktop's collapsed tab wear while a tool is live, so a sticker
           icon changed only in the panel would still be a plus everywhere the
           panel is folded — which on a phone is most of the time. */
        sticker: TOOL_ICON.sticker,
      };
      return map[name] || TOOL_ICON.cursor;
    },

    /* THE HANDLE WEARS THE LIVE TOOL. Collapsed, this 28px sliver is the only
       thing left of the dock, so a fixed pencil on it was a lie two thirds of
       the time — pick the cursor and the edge still said pen. It shows whatever
       is armed, which makes the handle a status light as well as a door: you
       can tell what a click on the canvas is about to do without opening
       anything. Same glyph map the phone's button uses, so the two can never
       disagree about what is selected. */
    tabSync(name) {
      if (!this.tab) return;
      if (this.tab.dataset.glyph === name) return;
      this.tab.dataset.glyph = name;
      this.tab.innerHTML = this.fabIcon(name);
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
      this.tabSync(name);
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
            /* THE PEEL LIGHT FOLLOWS THE CURSOR ACROSS THE STICKER, and these
               are SVG filter coordinates — the sticker's own user space, not the
               screen's. Under the shell's scale the screen distance is the
               smaller of the two, so the highlight trailed the cursor toward the
               sticker's top-left corner: visible as soon as the menu was open,
               invisible before it, which is why it read as the hover being in
               the wrong place rather than as a scale error. */
            const p = Space.local(e.clientX, e.clientY, box);
            const x = p.x;
            const y = p.y;
            a.setAttribute('x', x); a.setAttribute('y', y);
            /* Peeling straight down is the one case where the flap's light
               would sit on the wrong side of the fold; park it off-canvas. */
            if (Math.abs((d.dir || 0) % 360) !== 180) {
              /* mirrored across the sticker's own height — the laid-out one,
                 since `y` is now local and `r.height` is what the screen shows */
              const hh = box.offsetHeight || r.height;
              b.setAttribute('x', x); b.setAttribute('y', hh - y);
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
        /* WHERE THE THING GOES, IN THE SURFACE'S OWN COORDINATES.

           `clientX - r.left` was most of the answer and quietly wrong for the
           rest: it is a distance measured on the screen, and it was being
           written into a surface that may be scaled, so a press 700px into an
           0.935 canvas placed the sticker 45px short of the cursor. The scroll
           offsets are already local, so they are added after the conversion and
           not before it — mixing the two is the same class of mistake one line
           further down. */
        const p = Space.local(e.clientX, e.clientY, host);
        const x = p.x + (host.scrollLeft || 0);
        const y = p.y + (host.scrollTop || 0);
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

        /* WHERE THE GLYPH GOES IS THE LABEL'S BUSINESS.

           It used to be "before the text", always, which is fine for a leading
           icon and cannot express either of the two tags this hero actually
           wants: a pin that trails the place name, and a company mark that
           stands in for a word in the MIDDLE of a sentence — "Currently ◈
           Cypherock". Three positions, and a `position: 'start' | 'end'` enum
           would still not reach the third.

           So the label says where. `{}` in the string is the slot, exactly the
           way `*word*` in the headline is the italic — the copy stays a piece
           of copy you can read and rewrite, and the placement lives with the
           words rather than in a second field that has to be kept in step with
           them. No `{}` and nothing changes: the glyph leads, as before. */
        const glyph = () => {
          if (item.icon && PILL_ICON[item.icon]) {
            return el('span', { class: `pill__icon pill__icon--${item.icon}` },
              PILL_ICON[item.icon]);
          }
          if (item.logo) {
            return el('span', { class: 'pill__icon pill__icon--logo' },
              `<img src="${item.logo}" alt="">`);
          }
          return null;
        };
        const parts = String(item.label).split('{}');
        if (parts.length > 1) {
          parts.forEach((txt, k) => {
            /* trimmed, because the spacing between a word and the mark is the
               row's `gap` — one number, in the stylesheet, rather than however
               many spaces happen to be either side of the token */
            const t = txt.trim();
            if (t) pill.appendChild(el('span', { class: 'pill__label' }, esc(t)));
            if (k < parts.length - 1) {
              const g = glyph();
              if (g) pill.appendChild(g);
            }
          });
        } else {
          const g = glyph();
          if (g) pill.appendChild(g);
          pill.appendChild(el('span', { class: 'pill__label' }, esc(item.label)));
        }
        if (item.detail) pill.appendChild(el('span', { class: 'pill__detail' }, esc(item.detail)));
        pill.classList.add('rv');
        pill.style.setProperty('--rv-dur', `${rv.pills || 850}ms`);
        pill.style.setProperty('--rv-delay', `${(rv.pillsAt || 1050) + i * (rv.pillStagger || 55)}ms`);
        pill.style.setProperty('--rv-blur', `${rv.blur || 14}px`);
        wrap.appendChild(pill);
        pills.appendChild(wrap);

        /* STRAIGHT.

           These used to be laid down at alternating half-degree angles — -0.6
           and +0.5 — on the idea that a thing lying on a canvas is never quite
           square to it. It is a nice idea about stickers and a bad one about
           type. Half a degree is far too small to read as "placed by hand" and
           far too large to read as level: over a 190px tag it drops the far end
           about 1.7px, which is exactly the amount that looks like a rendering
           fault rather than a choice. And the two tags lean opposite ways, so
           the eye gets a reference for level right next to the thing that is
           not level. Set square and they read as set square.

           `tilt` is still there for a tag that genuinely wants an angle; the
           default is zero because the default should be. */
        const pit = Drag.make(wrap, { r: item.tilt || 0 });
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
          /* 10px, measured off the reference: its three pills sit at
             x 24/195/352.5 and are 161/147.5/225.5 wide, so the clear runs
             between them are 10 and 10. Was 8. */
          x += w + 10;
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
      Bricks.init(host);

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
      const wrap = el('div', { class: 'drg', style: `left:${x}px;top:${y}px` });
      const base = S.canvas?.stickerPath || 'assets/img/pixel/';
      wrap.appendChild(el('span', { class: 'stk' },
        `<img src="${base}${glyph}.svg" alt="" draggable="false">`));
      this.host.appendChild(wrap);

      /* CENTRED ON THE POINT, USING THE SIZE IT TURNED OUT TO BE.

         This used to be `x - 20`, half of a sticker assumed to be 40px. They
         are 49.86, so every sticker landed five pixels down and to the right of
         the cursor that placed it — under the preview, which is centred, and
         therefore visibly not where the preview had been standing. Re-centred
         from `offsetWidth`, which is the laid-out size in the canvas's own
         pixels, and again once the artwork loads, because an <img> with no
         intrinsic size yet measures nothing. */
      const mid = () => {
        const w = wrap.offsetWidth, h = wrap.offsetHeight;
        if (!w && !h) return;
        wrap.style.left = `${x - w / 2}px`;
        wrap.style.top = `${y - h / 2}px`;
      };
      mid();
      const art = $('img', wrap);
      if (art && !art.complete) art.addEventListener('load', mid, { once: true });

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

  /* ================================================ 5c2b. the bricks =====

     LEGO-ish pieces, and the one idea that makes them work: THEY ARE NOT A
     FEATURE. There is no board, no tray, no construction zone, no panel and no
     tool of their own. A brick is a `.drg` like the AirPods and the pills are
     `.drg`, it is appended to the same canvas host, and every rule the canvas
     already has — the press-selects-then-travel-drags gesture, the 4px slop,
     the elevation on pickup, the soft edge, the tool gating that makes Pencil
     mode non-draggable, undo — applies to it because it is the same object
     type, not because any of it was reimplemented here.

     What this module adds is exactly one thing on top of that: two bricks that
     come near each other anywhere on the canvas attract and lock together.

     -------------------------------------------------------------------------
     WHY A LATTICE RATHER THAN STUDS AND SOCKETS

     The obvious model is a list of stud positions per piece and a list of
     sockets, matched pairwise. It falls apart on the L and the T: a stud can
     be near a socket while the two bodies are lying across each other, so
     every match needs an overlap test anyway, and once you are testing bodies
     the studs are doing no work.

     So a piece is a SET OF CELLS on a unit grid, and a connection is the
     ordinary grid relationship: land on the lattice, share at least one edge,
     overlap nothing. That is one rule for all eight shapes including the
     concave ones, it cannot produce a physically impossible join, and the
     studs become what they are on a real brick — a drawing of where the grid
     is, rather than the mechanism.

     Every group carries its own lattice, derived from its first member. There
     is no global grid and nothing is aligned to the page, which is what lets a
     structure be built at any arbitrary offset in the top-left corner and
     another one at an unrelated offset beside the F1 car.

     -------------------------------------------------------------------------
     WHY LEGO NEVER TOUCHES ANYTHING ELSE

     `plan()` iterates `this.groups`. That list contains bricks and nothing
     else — no stickers, no peel objects, no notes, no ink. There is no filter
     to get wrong and no class check to forget: a non-brick is not in the data
     structure the snap engine reads, so it cannot be snapped to, and a brick
     dragged over the Coke can is a brick passing over a Coke can. */

  /* Eight silhouettes on the unit grid. Cells are [col, row]; the art, the
     anchors and the collision test are all generated from this one list, so a
     new piece is a new entry here and nothing else. */
  const PIECE = {
    conn:   { cells: [[0, 0]] },
    small:  { cells: [[0, 0], [1, 0]] },
    sq2:    { cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
    br24:   { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]] },
    long:   { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
    ell:    { cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
    corner: { cells: [[0, 0], [1, 0], [0, 1]] },
    tee:    { cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
    /* Two more bar lengths. The first eight were a scatter to play with; a
       recognisable object needs to end a row on an odd number, and with only
       2 and 5 available every silhouette came out as a slab. These are never
       scattered — they exist so the builds have something to draw with, and
       they arrive by being summoned. */
    p13:    { cells: [[0, 0], [1, 0], [2, 0]] },
    p14:    { cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  };

  /* SATURATED, because a brick that is not is not a brick. The first pass at
     these was tuned to the paper — eight muted stones that sat politely in the
     palette and read as interface chrome. Wrong instinct: the whole point of
     the object is that it is a toy someone left on the desk, and the one thing
     every person on earth already knows about this toy is that it is BRIGHT.
     Muting it removed the only cue that said what it was.

     These are the real colours, near enough: red, blue, yellow, green, orange,
     azure, purple, lime. They are the loudest thing on the page and that is
     correct — everything else here is paper, ink and one purple chip. */
  const TONE = ['#d8232a', '#1163c7', '#f3c218', '#24a148', '#f5871f', '#2aa3d4', '#9b4fbf', '#9cbf2e'];

  const shade = (hex, t) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const to = t > 0 ? 255 : 0, k = Math.abs(t);
    const m = (v) => Math.round(v + (to - v) * k);
    return `rgb(${m(r)},${m(g)},${m(b)})`;
  };

  /* Colours the presets need that the eight scattered pieces do not have —
     a wheel is black, a can is silver. A blueprint names a hue; a piece
     recruited into a build is repainted to it on the way there. */
  const HUE = {
    red: '#d8232a', blue: '#1163c7', yellow: '#f3c218', green: '#24a148',
    orange: '#f5871f', azure: '#2aa3d4', purple: '#9b4fbf', lime: '#9cbf2e',
    black: '#2a2c30', slate: '#5d646b', silver: '#c3c9cf', white: '#ecebe7',
  };

  /* ---------------------------------------------------------- the builds
     Each is an ASSEMBLY GRAPH, not a picture: a list of lattice placements
     with a stage number. Pieces sharing a stage are independent and travel
     together — two wheels arrive at once — and a stage never starts until the
     one before it has seated, so the thing assembles in an order that makes
     physical sense and gets more recognisable as it goes.

     Every placement is one of the eight silhouettes the canvas already has,
     on the same unit grid, obeying the same rule the manual snap obeys: no
     two cells overlap and the whole set is edge-connected. Which means these
     are not special objects — a preset builds something you could have built
     by hand, out of the pieces you already have.

     The pieces do not rotate (see `.tool--obj` in the CSS for why), so the
     silhouettes are worked out within that: an L is an L whichever end of the
     car it is on. */
  const PLAN = {
    /* SIDE ELEVATION, and the four things that make an F1 car an F1 car: a
       body far longer than it is tall, a wing hung high at the back, wheels
       standing proud below the floor at each end with a long gap between
       them, and a nose that runs out to a flat wing at the very front. The
       first attempt had none of that — it was a red slab on two black squares.
       This is 15 studs long and 6 tall, which is the proportion. */
    f1: {
      label: 'Ferrari F1',
      parts: [
        { kind: 'long',  gx: 3,  gy: 3, c: 'red',   s: 0 },  /* floor front  */
        { kind: 'long',  gx: 8,  gy: 3, c: 'red',   s: 0 },  /* floor rear   */
        { kind: 'p13',   gx: 0,  gy: 3, c: 'red',   s: 4 },  /* front wing   */
        { kind: 'small', gx: 13, gy: 3, c: 'red',   s: 4 },  /* diffuser     */
        { kind: 'sq2',   gx: 3,  gy: 4, c: 'black', s: 1 },  /* front wheel  */
        { kind: 'sq2',   gx: 11, gy: 4, c: 'black', s: 1 },  /* rear wheel   */
        { kind: 'long',  gx: 5,  gy: 2, c: 'red',   s: 2 },  /* cockpit      */
        { kind: 'long',  gx: 10, gy: 2, c: 'red',   s: 2 },  /* sidepod      */
        { kind: 'p13',   gx: 2,  gy: 2, c: 'red',   s: 2 },  /* nose         */
        { kind: 'conn',  gx: 7,  gy: 1, c: 'slate', s: 3 },  /* halo         */
        { kind: 'p13',   gx: 11, gy: 1, c: 'black', s: 3 },  /* engine cover */
        { kind: 'p14',   gx: 11, gy: 0, c: 'red',   s: 5 },  /* rear wing    */
      ],
    },

    /* A CAN IS A TAPER. Five studs wide in the barrel and three at each end,
       which is what reads as a cylinder seen flat — the earlier four-wide
       stack of bricks was a box. Silver, with the red band across the middle
       where the label is. */
    coke: {
      label: 'Diet Coke',
      parts: [
        { kind: 'p13',  gx: 1, gy: 7, c: 'silver', s: 0 },   /* base rim   */
        { kind: 'long', gx: 0, gy: 6, c: 'silver', s: 0 },
        { kind: 'long', gx: 0, gy: 5, c: 'silver', s: 1 },
        { kind: 'long', gx: 0, gy: 4, c: 'red',    s: 2 },   /* label band */
        { kind: 'long', gx: 0, gy: 3, c: 'red',    s: 2 },
        { kind: 'long', gx: 0, gy: 2, c: 'silver', s: 3 },
        { kind: 'long', gx: 0, gy: 1, c: 'silver', s: 3 },
        { kind: 'p13',  gx: 1, gy: 0, c: 'silver', s: 4 },   /* top rim    */
      ],
    },

    /* THE SHAPE EVERYONE KNOWS is two round heads on two straight stems,
       standing out of the top of a rounded case. So: a pair of 2x2 heads,
       a single stud of stem under each, and a case three deep and six wide
       under both. Read at thumbnail size that is unmistakably AirPods. */
    pods: {
      label: 'AirPods Pro',
      parts: [
        { kind: 'long', gx: 0, gy: 5, c: 'white',  s: 0 },   /* case floor */
        { kind: 'conn', gx: 5, gy: 5, c: 'white',  s: 0 },
        { kind: 'long', gx: 0, gy: 4, c: 'white',  s: 1 },
        { kind: 'conn', gx: 5, gy: 4, c: 'white',  s: 1 },
        { kind: 'long', gx: 0, gy: 3, c: 'white',  s: 1 },   /* case lip   */
        { kind: 'conn', gx: 5, gy: 3, c: 'white',  s: 1 },
        { kind: 'conn', gx: 1, gy: 2, c: 'silver', s: 2 },   /* stems      */
        { kind: 'conn', gx: 4, gy: 2, c: 'silver', s: 2 },
        { kind: 'sq2',  gx: 1, gy: 0, c: 'white',  s: 3 },   /* left bud   */
        { kind: 'sq2',  gx: 4, gy: 0, c: 'white',  s: 3 },   /* right bud  */
      ],
    },

    /* WIDE, WITH TWO GRIPS HANGING DOWN and a dark panel up the middle —
       that outline is the controller. Eleven studs across, grips dropping
       two below the body at either end, touchpad black at the top centre,
       two sticks inboard of the grips. */
    ps5: {
      label: 'PS5 Controller',
      parts: [
        { kind: 'p13',  gx: 0,  gy: 2, c: 'white', s: 0 },   /* body lower */
        { kind: 'long', gx: 3,  gy: 2, c: 'white', s: 0 },
        { kind: 'p13',  gx: 8,  gy: 2, c: 'white', s: 0 },
        { kind: 'long', gx: 0,  gy: 1, c: 'white', s: 1 },
        { kind: 'small', gx: 5, gy: 1, c: 'black', s: 2 },   /* touchpad   */
        { kind: 'p14',  gx: 7,  gy: 1, c: 'white', s: 1 },
        { kind: 'p14',  gx: 0,  gy: 0, c: 'white', s: 3 },   /* top edge   */
        { kind: 'p13',  gx: 4,  gy: 0, c: 'black', s: 2 },
        { kind: 'p14',  gx: 7,  gy: 0, c: 'white', s: 3 },
        { kind: 'sq2',  gx: 1,  gy: 3, c: 'white', s: 4 },   /* left grip  */
        { kind: 'sq2',  gx: 8,  gy: 3, c: 'white', s: 4 },   /* right grip */
        { kind: 'conn', gx: 4,  gy: 3, c: 'slate', s: 5 },   /* sticks     */
        { kind: 'conn', gx: 6,  gy: 3, c: 'slate', s: 5 },
      ],
    },
  };

  const Bricks = {
    U: 22,
    recs: [],
    groups: [],

    /* --- WHERE THE BRICKS LIVE ---------------------------------------------
       The pieces are not scattered over the whole hero. They occupy a region
       of it — right of the intro column, below the buttons, and stopping short
       of both the toolbar and the bottom rule — and everything that decides a
       resting position reads these four numbers rather than the canvas box:
       the fall's entry points, its side walls, the line each piece stops on,
       the overlap relaxation and the reduced-motion composition. One
       definition, so the arrangement cannot mean one thing on a cold load and
       another with motion turned off.

       `top` is a function of how far right you are rather than a constant,
       which is the whole shape of it. The type, the tags and the two buttons
       occupy the upper left; a piece resting up there is not a scatter, it is
       something dropped on the headline. So the region's ceiling starts low on
       the left and lifts as it crosses to the right, where there is nothing
       above it but paper — which is why the pieces bank toward the right and
       the corner by the buttons stays clear.

       Only the RESTING arrangement is bounded. Nothing here fences a gesture:
       drag a piece anywhere on the canvas and it stays where you put it. The
       soft edge in `Drag.edge` is still the only rule about that. */
    ZONE: { x0: 0.21, x1: 0.95, y1: 0.88, hi: 0.17, lo: 0.46, ramp: [0.30, 0.75] },

    /* THE COLUMN IS MEASURED, NOT ASSUMED.

       The numbers above describe the wide layout, where the intro sits in the
       top left and the bricks have the rest of the hero. They are wrong at
       every other width, and wrong in a way no amount of tuning fixes: below
       the breakpoint the intro is not beside the scatter at all, it is BELOW
       it — headline, tags and buttons stacked along the bottom of the canvas —
       and a region defined as "the right-hand three quarters, down to 88%"
       drops eighteen bricks straight onto the type. That is the phone
       screenshot exactly.

       So the column is read off the DOM once, at the size it actually is, and
       the region is derived from it. Two arrangements fall out of the one
       measurement rather than being two sets of numbers that have to be kept
       in agreement, and a change to the intro's own layout carries the bricks
       with it instead of silently putting them on top of it. */
    zone(host) {
      /* OFFSETS, NOT A RECT.

         `getBoundingClientRect` reports where the column is being PAINTED, and
         during the entry it is not being painted where it lives — the reveal
         carries it, so a measurement taken while that is running comes back
         over a tenth of the canvas low, and the region derived from it puts
         its floor underneath the type instead of above it. That is a race that
         changes with the machine, which is the worst kind: the arrangement was
         correct on a fast load and wrong on a slow one.

         `offsetTop` and friends are the LAYOUT position. They ignore
         transforms, they ignore scroll, and they are final from the first
         frame the element exists — measured against the host's own offset box,
         which is the same box the bricks' `left`/`top` are written into. */
      const intro = $('.canvas__intro', host);
      const W = host.offsetWidth, H = host.offsetHeight;
      this.keep = intro && W && H ? {
        x0: intro.offsetLeft / W, x1: (intro.offsetLeft + intro.offsetWidth) / W,
        y0: intro.offsetTop / H, y1: (intro.offsetTop + intro.offsetHeight) / H,
      } : null;

      const z = Object.assign({}, this.ZONE);
      const k = this.keep;
      /* UNDER, NOT BESIDE. The column has moved to the foot of the canvas, so
         the bricks take the whole width above it and the region's floor is the
         column's own top edge. There is no ramp: nothing is in their way up
         there, and the ceiling is the same all the way across. */
      if (!k || k.y0 > 0.5) {
        z.x0 = 0.05; z.x1 = 0.95;
        z.lo = 0.06; z.hi = 0.06; z.ramp = [0, 1];
        z.y1 = k ? Math.max(0.3, k.y0 - 0.04) : 0.7;
      }
      return z;
    },

    /* The column as a box in canvas pixels, with a margin, or null. `shelf`
       says which of the two arrangements it is: a column at the foot is
       something the pieces come to rest ON, one at the head is something they
       are simply never laid over. */
    keepBox(h, pad) {
      const k = this.keep;
      if (!k) return null;
      const p = pad == null ? 14 : pad;
      return {
        L: k.x0 * h.width - p, R: k.x1 * h.width + p,
        T: k.y0 * h.height - p, B: k.y1 * h.height + p,
        shelf: k.y0 > 0.5,
      };
    },

    /* --- THE HERO CONTENT IS A SET OF PHYSICAL OBJECTS ---------------------
       The intro — the headline, the three tags, the button row — is not yours
       to bury, and until recently the brick engine did not know it existed.
       The fall was taught to keep off it (see `lim`, and the shelf floor), but
       a piece in the HAND could be carried anywhere, so the arrangement the
       load composed so carefully was one drag away from a brick sitting on the
       middle of the sentence.

       Fencing the gesture was the obvious answer and it is the wrong one. A
       wall you cannot cross is a thing the page refuses to do; and this canvas
       has exactly one rule about a held object, which is that it goes where you
       put it. So the intro is not a fence. It is a set of PARTS — immovable to a
       brick, with the same lattice and the same studs as everything else. Bring
       a brick to an edge and it clicks onto it the way it clicks onto another
       brick. Push one INTO a block and it seats against the nearest side of it,
       because that is where a part that will not fit inside another part ends up.

       FIVE OBJECTS, NOT ONE. This is the correction that matters, and it is not
       a detail. The intro column LOOKS like one block and is not: the headline
       is a `.drg`, each tag is a `.drg`, and every one of them can be dragged,
       resized and turned independently. A single box drawn around the column is
       therefore wrong the instant any one of them is moved — and it was wrong in
       exactly the way that is hardest to see, because the box was invisible.
       Drag the headline to the top of the screen and the old geometry left a
       dead rectangle behind at the foot of the canvas, blocking empty paper,
       while the sentence itself sat in the open with bricks welding straight
       through it.

       MEASURED AS PAINTED, NOT AS LAID OUT. Every box below comes from
       `getBoundingClientRect` on the live node, which carries the object's
       transform — its drag, its resize, its rotation — and is converted into the
       host's own coordinates, the same space the bricks' lattice is in. Nothing
       reads `offsetTop` here. That is the whole difference between geometry that
       follows the object and geometry that remembers where it used to be.

       (`zone()` DOES read offsets, on purpose, and the two are not in conflict.
       It answers a different question — where should the eighteen pieces be
       COMPOSED — at a moment when the reveal is still animating the column and
       the painted position is a lie. This answers where the objects ARE, during
       a gesture, long after any of that has settled.)

       They are pseudo-groups and they are deliberately NOT in `this.groups`.
       That list is the model — welds, splits, undo and the snapshot all walk it —
       and putting an object in it that has no members, cannot be dragged and
       must never be merged into means every one of those has to learn about a
       special case. They are handed to the solver explicitly instead, which is
       the one place that actually needs them. */
    WALLPAD: 6,

    /* How near two hero blocks have to be to count as one object, in studs.
       See the note in makeWalls. */
    WALLJOIN: 3,

    /* ONE DEFINITION OF "TOUCHING", and it is in PIXELS rather than in studs.

       A piece seated flush lands within about half a pixel of the boundary
       rather than exactly on it: the held group's lattice and a block's are not
       necessarily the same one, and positions are written to a tenth of a pixel.
       So every test that asks "is this cell inside that block" has to allow the
       same margin, or two of them disagree about a placement and undo each
       other's work — the safety net pushing out a seat the solver had just
       certified, or rejecting it outright.

       The first version of this was a quarter of a stud, which is four to six
       pixels, and that is not rounding — it is a licence to lie four pixels deep
       into the headline, and the hammer test duly found bricks doing exactly
       that. The error being absorbed here is a float artefact and does not scale
       with the lattice, so neither does the number. Measured worst case across
       every viewport: 0.61px. */
    WALLEPS: 1.25,

    walls: [],
    wallStamp: -1,
    wallK: 0,          // the shell scale the walls were measured at

    /* WHICH NODES ARE WALLS. The movable blocks inside the intro, plus the
       button row, which is the one piece of hero content that is not draggable
       and still must not be built over. Collected once — the DOM structure does
       not change — and measured every time it matters. */
    wallHosts() {
      if (this._wh) return this._wh;
      const intro = this.introEl || (this.host && $('.canvas__intro', this.host));
      this.introEl = intro;
      if (!intro) return (this._wh = []);
      const list = $$('.drg', intro).filter((n) => !n.classList.contains('brk'));
      const cta = $('.canvas__cta', intro);
      if (cta) list.push(cta);
      /* Anything that IS a wall gets flagged on its drag item, and Drag.apply
         bumps a counter for flagged items only. That counter is the whole
         invalidation strategy: one integer compare per pointer event while
         nothing has moved, one fresh measurement on the first event after the
         headline is dragged a pixel. "Use the current geometry every frame"
         costs nothing when the geometry only changes when something moves. */
      Drag.items.forEach((it) => { if (list.indexOf(it.node) >= 0) it.wall = true; });
      return (this._wh = list);
    },

    /* THE BOX AS IT IS PAINTED.

       The union of the node and its descendants rather than the node's own
       rect, because the two are not the same and the difference is visible: at
       390px the headline's `.drg` wrapper measures 266 wide and the `h1` inside
       it measures 342, so a box drawn on the wrapper leaves 76px of the sentence
       outside the wall — the last word of every line unprotected. The union is
       also what makes this correct for a ROTATED object: a rect from a rotated
       element is already the axis-aligned box of the rotated shape, so the
       region grows and shrinks with the turn instead of staying square to a
       page the object is no longer square to.

       `.sel` is skipped. It is the selection chrome — eight handles and a rotate
       grip, positioned by transform well outside the object — and unioning it
       would make the wall jump by a hundred pixels the moment you clicked the
       headline. */
    /* `h` is the host's LIVE rect and `k` its live scale. Both are needed:
       getBoundingClientRect answers in screen pixels, and every number this is
       compared against — a brick's `ax`, `ay`, the stud size `U` — is in the
       host's own pixels. Subtracting the origin alone leaves the two agreeing
       only while the shell sits at scale 1, which is to say only while the menu
       is shut. WALLPAD is applied after the divide, so six pixels of clearance
       stays six of the host's pixels rather than six of the screen's. */
    wallBox(node, h, k) {
      let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
      const add = (n) => {
        if (n.classList && n.classList.contains('sel')) return;
        const q = n.getBoundingClientRect();
        if (q.width || q.height) {
          L = Math.min(L, q.left); T = Math.min(T, q.top);
          R = Math.max(R, q.right); B = Math.max(B, q.bottom);
        }
        for (let c = n.firstElementChild; c; c = c.nextElementSibling) add(c);
      };
      add(node);
      if (!isFinite(L)) return null;
      const p = this.WALLPAD;
      return {
        L: (L - h.left) / k - p, T: (T - h.top) / k - p,
        R: (R - h.left) / k + p, B: (B - h.top) / k + p,
      };
    },

    makeWalls() {
      const h = this.host && this.host.getBoundingClientRect();
      /* The stamp is only taken on a measurement that succeeded. A canvas with
         no width yet must be re-measured on the next event rather than being
         remembered as "no walls anywhere" for the rest of the session. */
      if (!h || !h.width) { this.walls = []; return; }
      this.wallStamp = Drag.gen;
      const U = this.U;
      /* the host's own scale, from its rendered width against its laid-out one */
      const k = this.host.offsetWidth ? h.width / this.host.offsetWidth : Space.k();

      const boxes = [];
      this.wallHosts().forEach((node) => {
        const b = this.wallBox(node, h, k);
        if (b) { b.nodes = [node]; boxes.push(b); }
      });

      /* --- ONE OBJECT, NOT FIVE ---------------------------------------------
         The hero is five separate draggable blocks and the engine used to hold
         five separate regions, which is faithful to the DOM and wrong about the
         thing. While the composition is intact those five boxes ARE one object:
         the tag row sits inside the headline's shadow, the buttons a dozen
         pixels under that, and no gap between any of them is wide enough for a
         brick to occupy. Modelling them apart bought nothing and cost the
         obvious statement of the rule — "the hero is a block".

         Merging them unconditionally would be the older mistake in reverse: the
         headline can be dragged to the far corner, and one box around it and the
         tags it left behind is a dead rectangle across the paper in between.

         So the regions are the CONNECTED COMPONENTS of the blocks, and the join
         rule is the one that matters to a brick: two blocks are the same object
         when the space between them is not somewhere a brick belongs. Their
         region is then the bounding box of the group. Intact hero: one
         rectangle. Headline dragged out: two, each hugging what is actually
         there. The rule holds at both ends and there is no arrangement it has to
         be told about.

         WALLJOIN IS THREE STUDS, and the first version was one — "merge only if
         a brick could not physically fit". Measured, the widest gap inside the
         intact composition is the 27px between the tags and the buttons, which
         at a 17px stud a 1x1 fits inside with ten pixels to spare. So the rule
         held and the hero came out as two regions, and a piece could be wedged
         into the composition's own breathing room. It fits, and it is still
         debris: three studs is the distance at which a brick in the gap reads as
         placed rather than dropped. Far below any distance a block gets dragged,
         so a piece pulled out of the composition still becomes its own region. */
      const near = U * this.WALLJOIN / 2;
      const root = boxes.map((_, i) => i);
      const find = (i) => {
        let r = i;
        while (root[r] !== r) r = root[r];
        while (root[i] !== r) { const n = root[i]; root[i] = r; i = n; }
        return r;
      };
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i], b = boxes[j];
          if (a.L - near < b.R + near && b.L - near < a.R + near
            && a.T - near < b.B + near && b.T - near < a.B + near) {
            const ra = find(i), rb = find(j);
            if (ra !== rb) root[ra] = rb;
          }
        }
      }
      const merged = new Map();
      boxes.forEach((b, i) => {
        const k = find(i);
        const m = merged.get(k);
        if (!m) { merged.set(k, { L: b.L, T: b.T, R: b.R, B: b.B, nodes: b.nodes.slice() }); return; }
        m.L = Math.min(m.L, b.L); m.T = Math.min(m.T, b.T);
        m.R = Math.max(m.R, b.R); m.B = Math.max(m.B, b.B);
        m.nodes.push(b.nodes[0]);
      });

      this.walls = [...merged.values()].map((box) => {
        /* CEIL, THEN CENTRE.

           Rounding to the NEAREST whole stud can produce a lattice SHORTER than
           the region it stands for, and every pixel it gives up is a pixel of
           hero content a brick is then free to sit on. 169px of intro at a 23px
           stud is 7.35 studs; rounded, 7; and the eight pixels lost off the
           bottom edge is exactly where the first drag test at 1440 parked a
           brick, one stud into the buttons. Ceiling it means the lattice always
           contains the region, and splitting the slack evenly means the seat on
           each of the four sides stands the same distance off it. */
        const nx = Math.max(1, Math.ceil((box.R - box.L) / U));
        const ny = Math.max(1, Math.ceil((box.B - box.T) / U));
        const ox = box.L - (nx * U - (box.R - box.L)) / 2;
        const oy = box.T - (ny * U - (box.B - box.T)) / 2;
        const cells = new Set();
        for (let c = 0; c < nx; c += 1) for (let w = 0; w < ny; w += 1) cells.add(`${c},${w}`);
        /* A piece that seats above a region has its bottom edge exactly on the
           lattice's top row — and the second piece brought to the same side
           lines up with the first, because both are now on this grid. */
        return {
          wall: true, members: [], nodes: box.nodes,
          ox, oy, cells, nx, ny,
          bb: { x0: 0, y0: 0, x1: nx, y1: ny },
        };
      });
    },

    /* One measurement per change, and the change is anything moving that has a
       wall on it. Everything in the gesture path calls this rather than reading
       `this.walls` directly, so there is no way to use a stale box. */
    /* THE SHELL'S SCALE INVALIDATES THE WALLS TOO, not just a drag.

       `Drag.gen` counts moves of the hero blocks, which is what used to be the
       only way this geometry could go stale. Opening the menu is the other way:
       the walls are derived from screen rectangles, and every one of those
       changes when the shell scales — so the stamp carries the scale as well and
       a menu that opens mid-gesture re-measures on the next frame that asks. */
    wallsNow() {
      const k = Space.k();
      if (this.wallStamp !== Drag.gen || this.wallK !== k) { this.wallK = k; this.makeWalls(); }
      return this.walls;
    },

    /* --- WHY THERE IS NO OVERLAY HERE ---------------------------------------
       There was one, and it was the mistake. Each region got a node that drew
       its outline while a brick was near it and hatched its interior in red
       while a brick was on it — the reasoning being that a rule the user cannot
       see is a rule they have to discover by trial.

       It is still true that the rule has to be legible, and it was the wrong
       conclusion. What it produced on screen was the collision model itself: a
       red rectangle laid over the sentence, and beside it more rectangles for
       every other block the piece happened to come near. That is a debugger,
       and shipping a debugger is not the same thing as explaining a rule. It
       also broke the page's own premise — this is a canvas with objects lying on
       it, and objects do not announce their bounding boxes.

       So the geometry below is DATA and nothing else. Not a node, not an SVG
       rect, not a class on the hero. Everything the user needs to know is said
       by the two things that are already theirs to look at: the piece in their
       hand dims when it is somewhere it cannot stay (`.brk.is-block`), and the
       ghost stands at the seat it will take instead. Both are about the brick.
       Neither draws the hero.

       The regions can still be SEEN, from `?brkdebug` — see `debugDraw`, which
       is where a picture of the model belongs. */

    /* WHICH SIDE THE LANDING IS ON, counted rather than inferred.

       The first version of this compared the landing's bounding box against the
       block's — if every cell is above row zero it is the top edge, and so on —
       and it was wrong for any piece that is not a rectangle. An L seated into
       the top-left corner has cells above the block AND cells to the left of it,
       so a box test either picks whichever branch is written first or, when the
       two arms straddle both axes, matches nothing at all and reports no edge.
       That was the mobile failure exactly: four seats, four correct landings, no
       edge lit, because the shape was an L.

       So the contacts are counted. For each face, how many of this piece's cells
       actually sit against it — which is the same question the solver answered
       when it called this landing lawful, and it cannot come out empty for a
       landing that touches. Most contacts wins; that is the side the piece is
       really seated on, whatever shape it is. */
    wallSide(w, p, set) {
      const a = set[0];
      const n = { t: 0, b: 0, l: 0, r: 0 };
      set.forEach((r) => this.cells(r).forEach(([c, ww]) => {
        const cx = p.cx + r.gx - a.gx + c, cy = p.cy + r.gy - a.gy + ww;
        const inx = cx >= 0 && cx < w.nx, iny = cy >= 0 && cy < w.ny;
        if (inx && cy === -1) n.t += 1;
        if (inx && cy === w.ny) n.b += 1;
        if (iny && cx === -1) n.l += 1;
        if (iny && cx === w.nx) n.r += 1;
      }));
      let side = null, best = 0;
      ['t', 'b', 'l', 'r'].forEach((s) => { if (n[s] > best) { best = n[s]; side = s; } });
      return side;
    },

    /* WHICH WALL THE PIECE IS STANDING ON, by area rather than by first hit —
       a brick lying across the gap between the headline and a tag overlaps two,
       and the one it should be pushed out of is the one it is most inside. Rect
       against rect rather than a rounded cell index, because a piece half a stud
       onto the type is on the type. */
    inWall(set) {
      const U = this.U, eps = this.WALLEPS;
      let best = null, area = 0;
      this.wallsNow().forEach((w) => {
        const L = w.ox, T = w.oy, R = w.ox + w.nx * U, B = w.oy + w.ny * U;
        let a2 = 0;
        set.forEach((r) => {
          const bx = this.ax(r), by = this.ay(r);
          this.cells(r).forEach(([c, ww]) => {
            const x = bx + c * U, y = by + ww * U;
            const ox = Math.min(x + U, R) - Math.max(x, L);
            const oy = Math.min(y + U, B) - Math.max(y, T);
            /* THE SAME SLOP AS EVERYWHERE ELSE. Without it this disagreed with
               the solver about what "inside" means: a piece seated flush lands
               within about half a pixel of the boundary — the group's lattice
               and the block's are not the same one, and the position is written
               to one decimal place — and a bare `> 0` reads that as an overlap.
               The result was a placement the sweep had just certified as lawful
               being pushed out again by the safety net, or rejected outright.
               One definition of touching, in `WALLEPS`, used by all three. */
            if (ox > eps && oy > eps) a2 += ox * oy;
          });
        });
        if (a2 > area) { area = a2; best = w; }
      });
      return best;
    },

    /* THE WAY OUT, WHEN THE PIECE IS ALREADY ON THE HERO.

       The ordinary sweep cannot answer this. Its whole design is a search of a
       few studs around the piece, and a brick dropped in the middle of the
       headline is a third of the block away from any lawful seat — widening the
       sweep far enough to find one turns a 169-candidate search into a
       2600-candidate one on every pointer event, for the one case that does not
       need a search at all. Because the answer is not a search: there are four
       ways off a rectangle and the piece takes the nearest.

       AND OUT OF ALL OF IT, NOT JUST THE BLOCK IT IS MOST INSIDE. This is the
       correction that took the last failing case, and it is the kind of thing
       only a test finds. The hero is five blocks and they TOUCH — at 1440 the
       headline's region and the tag row's overlap by twenty pixels, because the
       tags sit that close under the type. So "the nearest way off the block you
       are standing on" is not a way out at all: pushed off the tag the piece
       lands in the headline, pushed off the headline it lands back in the tag,
       and the version of this that only knew about one block at a time chose the
       shortest of four moves that were all still inside something.

       So each direction is resolved against every block that lies ACROSS it —
       the ones whose cross-axis range overlaps the piece, which are exactly the
       ones moving along this axis cannot avoid — and the piece slides until it
       is clear of all of them, seating flush on the last one it passes. Four
       directions, one pass over five walls each. The result is a real position
       rather than the first plausible one. */
    wallOut(set) {
      const ws = this.wallsNow();
      if (!ws.length) return null;
      const U = this.U, a = set[0], eps = this.WALLEPS;

      const rel = [];
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      set.forEach((r) => this.cells(r).forEach(([c, w]) => {
        const cx = r.gx - a.gx + c, cy = r.gy - a.gy + w;
        rel.push([cx, cy]);
        x0 = Math.min(x0, cx); x1 = Math.max(x1, cx);
        y0 = Math.min(y0, cy); y1 = Math.max(y1, cy);
      }));
      if (!isFinite(x0)) return null;

      const ax = this.ax(a), ay = this.ay(a);
      const h = this.host ? this.host.getBoundingClientRect() : null;
      const busy = this.busyCells || null;

      /* the blocks the piece is inside, with its anchor at (X, Y). A quarter of
         a stud of slop, so a piece seated flush reads as touching rather than as
         overlapping — the piece's lattice and a block's are not the same one. */
      const hits = (X, Y) => ws.filter((w) => rel.some(([cx, cy]) => {
        const x = X + cx * U, y = Y + cy * U;
        return x + U - eps > w.ox && x + eps < w.ox + w.nx * U
          && y + U - eps > w.oy && y + eps < w.oy + w.ny * U;
      }));

      if (!hits(ax, ay).length) return null;

      const solve = (X, Y) => {
        const out = [];
        [['y', -1, 't'], ['y', 1, 'b'], ['x', -1, 'l'], ['x', 1, 'r']].forEach((dir) => {
          const vert = dir[0] === 'y', sgn = dir[1], side = dir[2];
          const across = ws.filter((w) => (vert
            ? X + (x1 + 1) * U - eps > w.ox && X + x0 * U + eps < w.ox + w.nx * U
            : Y + (y1 + 1) * U - eps > w.oy && Y + y0 * U + eps < w.oy + w.ny * U));
          if (!across.length) return;
          /* the furthest constraint in this direction is the one that decides
             where the piece stops, and it is the block it ends up seated on */
          let bind = null, cell = 0;
          across.forEach((w) => {
            const v = vert
              ? (sgn < 0 ? -(y1 + 1) : w.ny - y0)
              : (sgn < 0 ? -(x1 + 1) : w.nx - x0);
            const px = vert ? w.oy + v * U : w.ox + v * U;
            if (!bind || (sgn < 0 ? px < (vert ? bind.oy + cell * U : bind.ox + cell * U)
              : px > (vert ? bind.oy + cell * U : bind.ox + cell * U))) { bind = w; cell = v; }
          });
          if (!bind) return;
          /* seated on the binding block's own lattice, and kept in contact with
             it along the free axis — so two pieces brought to the same side of
             the same block are square to each other as well as to it */
          let cx, cy;
          if (vert) {
            cy = cell;
            cx = clamp(Math.round((X - bind.ox) / U), -x1, bind.nx - 1 - x0);
          } else {
            cx = cell;
            cy = clamp(Math.round((Y - bind.oy) / U), -y1, bind.ny - 1 - y0);
          }
          out.push({ side, bind, cx, cy, X: bind.ox + cx * U, Y: bind.oy + cy * U });
        });

        let best = null;
        out.forEach((c) => {
          let buried = 0;
          if (busy) {
            rel.forEach((m) => {
              const bx = Math.round((c.X + m[0] * U) / U), by = Math.round((c.Y + m[1] * U) / U);
              if (busy.has(`${bx},${by}`)) buried += 1;
            });
          }
          /* A seat off the edge of the hero is not a seat. On a phone the column
             sits near the foot of the canvas with sixty pixels under it, so
             "straight down" is both the nearest way off the sentence and the way
             off the page. Ranked last rather than removed, so there is always an
             answer even on a canvas with no room on any side. */
          const off = !!h && (
            c.X + x0 * U < -U * 0.5 || c.X + (x1 + 1) * U > h.width + U * 0.5
            || c.Y + y0 * U < -U * 0.5 || c.Y + (y1 + 1) * U > h.height + U * 0.5);
          const clash = hits(c.X, c.Y).length > 0;
          const d = Math.hypot(c.X - ax, c.Y - ay);
          const k = d + buried * U * 1.5 + (clash ? U * 60 : 0) + (off ? U * 600 : 0);
          if (this.debug) {
            (this._ej = this._ej || []).push({ s: c.side, X: +c.X.toFixed(1), Y: +c.Y.toFixed(1), d: +d.toFixed(1), k: +k.toFixed(1), off, clash });
          }
          if (best && k >= best.k) return;
          best = Object.assign({ d, k, clash, off, buried }, c);
        });
        return best;
      };

      /* ONE OR TWO REPAIR PASSES. Aligning to the binding block's lattice moves
         the piece up to half a stud along the free axis, and half a stud is
         enough to catch the corner of a block that was not across the path when
         the direction was chosen. Re-solving from where it landed is the same
         rule applied again and it converges, because every step is strictly
         outward from the union. */
      let p = solve(ax, ay);
      for (let i = 0; i < 3 && p && p.clash; i += 1) {
        const q = solve(p.X, p.Y);
        if (!q) break;
        p = q;
      }
      if (!p) return null;

      const w = p.bind;
      return {
        d: Math.hypot(p.X - ax, p.Y - ay), k: 0, slack: U * 2,
        tx: p.X, ty: p.Y, g: w, cx: p.cx, cy: p.cy, ox: w.ox, oy: w.oy,
        touch: 1, buried: p.buried || 0, force: true, side: p.side,
      };
    },

    /* The highest a piece may come to rest at a given horizontal position,
       as a fraction of the canvas. */
    ceil(fx) {
      const z = this.Z || this.ZONE;
      const t = clamp((fx - z.ramp[0]) / (z.ramp[1] - z.ramp[0]), 0, 1);
      return z.lo + (z.hi - z.lo) * t;
    },

    /* How far the magnet reaches, in pixels. ONE definition — `plan()` sizes
       its search from it and `move()` shapes the pull from it, and the two
       going out of step is a bug you cannot see, only feel. See the note over
       the sweep in plan() for what that felt like. */
    /* --- THREE RADII, NOT ONE ----------------------------------------------
       There was one number here and it was doing three different jobs, which
       is why the snap felt unreliable in the scattered state rather than in
       the tidy one.

       The number `plan()` measures is not a GAP, it is a TRAVEL: how far the
       piece has to move to seat. That is the right thing to measure — it is
       exactly what the magnet has to do — but it does not scale like a gap.
       A 1x1 lying against a brick has to travel a fraction of a stud to seat.
       A 5x1 lying across one, or half buried in it after the fall, has to
       travel three or four, because every cell of it has to clear. Holding
       both to the same 2.7 studs means the small pieces snap and the big ones
       silently do not, from positions that look identical. Measured on a cold
       load: only eight of the eighteen pieces had ANY lawful landing inside
       the old reach, and which ones did was a function of their size.

       So the distance is split by what it is for:

         DETECT  — far enough to cover the travel a large or half-buried piece
                   needs. Inside this, a candidate exists and the ghost is
                   drawn, so the connection is VISIBLE well before it is felt.
         MAGNET  — unchanged at 2.7. The pull is a feel, and the feel was right;
                   widening it would have made the piece leap.
         COMMIT  — release inside DETECT with a ghost on screen commits to
                   exactly the ghost. One solver, one answer: what the preview
                   promised is what the release does.

       Beyond DETECT nothing happens at all — no ghost, no pull, and a release
       leaves the piece where it was let go. */
    detect() { return this.U * (this.touch ? 5.0 : 4.2); },
    range() { return this.U * (this.touch ? 3.4 : 2.7); },

    /* --- geometry helpers ------------------------------------------------- */
    px(r) { return r.bx + r.it.x; },
    py(r) { return r.by + r.it.y; },
    moveTo(r, X, Y) { r.it.x = X - r.bx; r.it.y = Y - r.by; Drag.apply(r.it); },

    /* --- ROTATION, AND WHY IT IS TWO NUMBERS -------------------------------
       A piece has an angle (`it.rest`, degrees, what you see) and a quarter
       turn (`rec.rot`, 0-3, what the lattice believes). They are the same fact
       at two resolutions, and they are kept in step by one rule: `rest` is
       only ever animated toward `rot * 90`, and `rot` is only ever changed at
       the instant a rotation is asked for. Nothing reads a half-turned angle.

       This is what the module was missing rather than a new feature bolted on.
       The load drops the pieces from a height and keeps whatever angle each
       one came to rest at — 69°, 187°, whatever the tumble produced — while
       every line of the snap engine measures the piece's UNROTATED box. So a
       tilted brick was pulled by its invisible upright footprint, landed by
       it, and only came true at the very end, inside `weld()`. The magnet was
       not weak there; it was aiming at a rectangle that was not on the screen.
       Squaring the piece at the moment it is picked up (see `grab`) is what
       makes the pull, the ghost and the landing all describe the same object.

       The art itself is never re-rendered: a quarter turn of a cell list is
       exactly a quarter turn of the picture drawn from it, so CSS turns the
       node and this turns the footprint, and the two agree by construction. */

    /* The unrotated extent of a piece, in cells. */
    dims(r) {
      let W = 0, H = 0;
      r.def.cells.forEach(([c, w]) => { W = Math.max(W, c + 1); H = Math.max(H, w + 1); });
      return { W, H };
    },

    /* The piece's cells at its current quarter turn, normalised back to the
       origin. A 90° clockwise turn of a W x H block sends (c, w) to
       (H - 1 - w, c) — which is the same mapping CSS applies to the pixels,
       derived once here rather than trusted twice. */
    cells(r) {
      const q = ((r.rot || 0) % 4 + 4) % 4;
      if (!q) return r.def.cells;
      let cells = r.def.cells;
      let { W, H } = this.dims(r);
      for (let i = 0; i < q; i += 1) {
        cells = cells.map(([c, w]) => [H - 1 - w, c]);
        const t = W; W = H; H = t;
      }
      return cells;
    },

    /* THE ANCHOR: the top-left of the piece AS IT IS DRAWN, which for an odd
       quarter turn is not the top-left of its element. CSS rotates about the
       centre, so a W x H box turned 90° leaves the centre alone and the corner
       moves by half the difference of the two sides. Every lattice coordinate
       in this module is measured from the anchor, so a rotated piece sits on
       the grid its picture is actually on.

       At `rot = 0` the offset is zero and these are `px`/`py` exactly, which
       is why nothing that predates rotation had to change. */
    off(r) {
      const U = this.U, d = this.dims(r);
      const W = d.W * U, H = d.H * U;
      const odd = (((r.rot || 0) % 4) + 4) % 4 % 2;
      return { x: odd ? (W - H) / 2 : 0, y: odd ? (H - W) / 2 : 0 };
    },
    ax(r) { return this.px(r) + this.off(r).x; },
    ay(r) { return this.py(r) + this.off(r).y; },
    anchorTo(r, X, Y) {
      const o = this.off(r);
      r.it.x = X - o.x - r.bx; r.it.y = Y - o.y - r.by;
      Drag.apply(r.it);
    },

    /* every cell a group occupies, in that group's own lattice */
    cellsOf(g) {
      const set = new Set();
      g.members.forEach((r) => this.cells(r).forEach(([c, w]) => set.add(`${r.gx + c},${r.gy + w}`)));
      return set;
    },

    /* --- the art ----------------------------------------------------------
       Cells are drawn as rounded rects that reach R past every edge they share
       with a neighbour. The overlap swallows the rounding on internal seams
       while leaving it on the silhouette, so an L reads as one moulded piece
       and not as three squares pushed together — and it needs no outline path,
       which is what would otherwise have to be computed and would stroke those
       internal seams back in. */
    art(kind, tone, uid) {
      const U = this.U;
      const cells = PIECE[kind].cells;
      const has = new Set(cells.map(([c, w]) => `${c},${w}`));
      const W = (Math.max(...cells.map((c) => c[0])) + 1) * U;
      const H = (Math.max(...cells.map((c) => c[1])) + 1) * U;
      const SR = U * 0.275;                 // stud radius, measured off the render
      const arc = (cx, cy, r, a1, a2) => {
        const rad = (d) => (d * Math.PI) / 180;
        return `M${(cx + r * Math.cos(rad(a1))).toFixed(2)} ${(cy + r * Math.sin(rad(a1))).toFixed(2)}`
          + `A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 `
          + `${(cx + r * Math.cos(rad(a2))).toFixed(2)} ${(cy + r * Math.sin(rad(a2))).toFixed(2)}`;
      };

      let body = '', lite = '', dark = '', shad = '', studs = '', rings = '';
      cells.forEach(([c, w]) => {
        body += `<rect x="${c * U}" y="${w * U}" width="${U + 0.5}" height="${U + 0.5}"/>`;
        /* Only the edges the silhouette actually exposes are lit or shaded.
           An internal seam between two cells of the same piece is not an edge
           of anything and drawing one there is what makes an L read as three
           squares pushed together. */
        if (!has.has(`${c},${w - 1}`)) lite += `<rect x="${c * U}" y="${w * U}" width="${U}" height="1.4"/>`;
        if (!has.has(`${c - 1},${w}`)) lite += `<rect x="${c * U}" y="${w * U}" width="1.2" height="${U}"/>`;
        if (!has.has(`${c},${w + 1}`)) dark += `<rect x="${c * U}" y="${(w + 1) * U - 2}" width="${U}" height="2"/>`;
        if (!has.has(`${c + 1},${w}`)) dark += `<rect x="${(c + 1) * U - 1.6}" y="${w * U}" width="1.6" height="${U}"/>`;

        const cx = c * U + U / 2, cy = w * U + U / 2;
        shad += `<circle cx="${(cx + U * 0.055).toFixed(2)}" cy="${(cy + U * 0.085).toFixed(2)}" r="${SR.toFixed(2)}"/>`;
        studs += `<circle cx="${cx}" cy="${cy}" r="${SR.toFixed(2)}"/>`;
        /* The light is a whisper and the shadow does the work — measured off
           the render, where a stud differs from the face it stands on by −9 on
           its lit side and −180 on its shaded one. A symmetric pair of arcs
           reads as a cartoon bevel; this reads as a cylinder. */
        rings += `<path d="${arc(cx, cy, SR * 0.84, 190, 280)}" stroke="rgba(255,255,255,.30)" stroke-width="${(U * 0.045).toFixed(2)}" fill="none" stroke-linecap="round"/>`
          + `<path d="${arc(cx, cy, SR * 0.88, 348, 116)}" stroke="rgba(0,0,0,.22)" stroke-width="${(U * 0.065).toFixed(2)}" fill="none" stroke-linecap="round"/>`;
      });

      /* SQUARE CORNERS. Measured: the reference's silhouettes have a corner
         radius of exactly zero — the top row of every brick spans its full
         width. The first pass rounded them at 0.16 of a stud, which is what
         made these read as soft UI tiles rather than as moulded plastic. With
         no radius the cell rects simply abut and the internal seams vanish on
         their own, so the overlap trick the old art needed is gone too. */
      return `<svg class="brk__art" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" `
        + `aria-hidden="true" focusable="false">`
        + `<defs><filter id="bf${uid}" x="-40%" y="-40%" width="180%" height="180%">`
        + `<feGaussianBlur stdDeviation="${(U * 0.055).toFixed(2)}"/></filter></defs>`
        /* THE HIT REGION AND THE PICTURE ARE THE SAME RECTS. The body group is
           the only thing in the tree that takes a pointer event — see the
           `.brk__hit` rules in site.css — so the area you can grab is the area
           that is painted, and an L's empty quadrant belongs to the paper
           behind it rather than to the L. */
        + `<g class="brk__hit" fill="${tone}">${body}</g>`
        + `<g fill="#fff" opacity=".26">${lite}</g>`
        + `<g fill="#000" opacity=".17">${dark}</g>`
        /* the studs stand on the face, so the shadow they cast is the only
           thing that separates them from it — the face and the stud are the
           same colour in the reference, top to bottom */
        + `<g fill="#000" opacity=".30" filter="url(#bf${uid})">${shad}</g>`
        + `<g fill="${tone}">${studs}</g>`
        + rings
        + `</svg>`;
    },

    /* --- build ------------------------------------------------------------ */
    init(host) {
      const defs = (S.canvas && S.canvas.bricks) || [];
      if (!defs.length) return;
      this.host = host;

      /* WAIT FOR THE HERO TO BE ITS FULL HEIGHT.

         Every brick's position is a percentage of this box, so measuring it
         before the layout has finished puts all eighteen somewhere else. On a
         warm load the hero measured 534px against 900 on a cold one, and the
         same page settled into two different compositions — the pieces an
         eighth of the way up the screen on one and a quarter of the way on the
         other. Nothing about it was random and nothing looked broken, which is
         exactly why it went unnoticed until two loads were compared side by
         side.

         Nothing has been created at this point, so bailing out and coming back
         next frame is free and cannot duplicate anything. The cap is there so
         a hero that genuinely is short — an odd viewport, a print stylesheet —
         still gets its bricks rather than none. */
      /* AND STILL BE IT NEXT FRAME.

         "Tall enough" was not the same question as "finished". The hero passes
         72% while it is still growing — 704px of an eventual 844 on a phone —
         and everything measured in that window is measured against a canvas
         that is about to change size underneath it. The intro column's own
         position is settled by then, so the number that moves is the DENOMINATOR:
         the column came out at 78% of the canvas instead of 65%, the region's
         floor was derived below the type rather than above it, and the pieces
         landed on the headline. On a fast load the same code was correct,
         which is what made it look like a layout bug rather than a race.

         So the height has to be both sufficient AND unchanged from the frame
         before. It costs one extra frame on a load that was already stable and
         it is the difference between measuring the layout and measuring it
         mid-flight. */
      const nowH = host.getBoundingClientRect().height;
      const settled = this.lastH != null && Math.abs(nowH - this.lastH) < 0.5;
      this.lastH = nowH;
      if (nowH < innerHeight * 0.72 || !settled) {
        this.tries = (this.tries || 0) + 1;
        if (this.tries < 40) { requestAnimationFrame(() => this.init(host)); return; }
      }

      const r = host.getBoundingClientRect();
      const narrow = r.width <= 768;
      /* One stud, sized off the same reference the peel objects use. Fixed at
         build time: a lattice that changed under a structure on a window
         resize would tear the structure apart. */
      this.U = Math.round(narrow ? clamp(r.width / 430 * 19, 13, 20)
        : clamp(r.width / 1440 * 23, 16, 25));
      this.touch = matchMedia('(hover: none)').matches;

      /* Before a single piece is laid: everything below reads this. */
      this.Z = this.zone(host);
      /* NO WALL MEASUREMENT HERE, deliberately. The entry reveal is still
         carrying the headline's words at this point, so a live rect taken now
         describes where they are passing through rather than where they live —
         and unlike `zone`, which sidesteps that by reading layout offsets, the
         walls have to read the painted box because the painted box is the whole
         point of them. They are measured on the first gesture that needs them
         instead, which is necessarily after all of this has settled. */
      this.introEl = $('.canvas__intro', host);
      /* Collected (not measured) now, so the `it.wall` flags Drag.apply reads
         are in place before anything can be dragged, rather than depending on
         which gesture happens to be first. */
      this.wallHosts();
      if (DEBUG_SNAP_GEOMETRY || /[?&]brkdebug\b/.test(location.search)) this.debug = true;

      defs.forEach((d, i) => {
        const def = PIECE[d.kind];
        if (!def) return;
        /* `mobile: false` opts a piece out of narrow screens entirely, the same
           way a peel object does. Checked before anything is built, so a piece
           that is not wanted on a phone costs nothing there. */
        if (narrow && d.mobile === false) return;
        const m = (narrow && d.mobile) || d;
        const tone = TONE[d.tone != null ? d.tone % TONE.length : i % TONE.length];
        /* The composition in content.js is stated as percentages of the whole
           hero, and it is kept — it is simply read INTO the region rather than
           onto the canvas. Remapping rather than rewriting the numbers means
           the relative arrangement its author chose survives, and the region
           can be moved later by changing four numbers in one place instead of
           eighteen pairs in another file. */
        const z = this.Z || this.ZONE;
        const fx = z.x0 + (m.x / 100) * (z.x1 - z.x0);
        const top = this.ceil(fx);
        const bx = Math.round(r.width * fx);
        const by = Math.round(r.height * (top + (m.y / 100) * (z.y1 - top)));

        const rec = this.mk(d.kind, tone, bx, by);

        /* The touch-reachable way out of a structure, and the discoverable one:
           double-click a brick and it comes loose where it stands. Alt-drag
           does the same thing in one gesture for a mouse. Neither adds any
           chrome, which is the constraint. */
        rec.it.node.addEventListener('dblclick', (e) => {
          if (Rack.tool !== 'select') return;
          if (rec.g.members.length < 2) return;
          e.preventDefault();
          const before = this.snapshot();
          this.pop(rec);
          const after = this.snapshot();
          History.push(() => this.restore(before), 'brick', () => this.restore(after));
          Sound.voice({ freq: 320, gain: 0.03, dur: 0.05, bright: 2100, drop: 1.1, noise: 0.55 });
        });
      });

      /* NO TWO OF THEM MAY START ON TOP OF EACH OTHER.

         The coordinates are percentages and the lattice unit is clamped, so
         the two scale differently: below about 1000px the positions have
         shrunk faster than the bricks and pieces that were 20px apart at 1440
         are touching. Rather than hand-tune a second set of numbers for every
         width, the scatter is relaxed after it is laid — overlapping pairs
         push apart along the line between their centres until nothing
         intersects. It converges in a handful of passes and does nothing at
         all at the widths where the layout was designed. */
      this.relax();

      /* ONE listener for the hover state of every brick on the canvas, and one
         for the only key this module answers to. Both are bound here rather
         than per piece: eighteen pairs of enter/leave handlers is eighteen
         chances for two of them to disagree about who is lit. */
      this.hoverBind(host);
      addEventListener('keydown', (e) => {
        if (!this.held) return;
        if (e.key !== 'r' && e.key !== 'R') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        e.preventDefault();
        this.rotate(this.held);
      });

      /* THE ARRIVAL. relax() has just decided where every piece belongs; rain()
         takes those positions as the destination and throws the pieces in from
         above to reach them. Order matters — the physics needs somewhere to
         land before it can start. */
      this.rain();

      /* A window that got smaller must not leave a structure stranded off the
         edge — but nothing is re-laid and nothing is re-scaled, so a build
         survives a resize exactly as it was made. */
      addEventListener('resize', () => this.reclaim(), { passive: true });
    },

    /* ONE PLACE A BRICK IS BORN. init() calls it for the scattered eight-
       -teen; spawn() calls it for a piece summoned in mid-build. Everything
       that makes a brick a brick — the drag hooks, the group of one, the
       registration in `recs` and `groups` — happens here and only here, so a
       summoned piece is not a special kind of object with its own rules. */
    mk(kind, tone, bx, by) {
      const wrap = el('div', {
        class: 'drg brk', style: `left:${bx}px;top:${by}px`,
        'data-brick': kind, 'aria-label': `Building block, ${kind}`,
      });
      this.uid = (this.uid || 0) + 1;
      wrap.innerHTML = this.art(kind, tone, `${this.uid}`);
      this.host.appendChild(wrap);

      /* No resting tilt. Everything else loose on this canvas sits at a slight
         angle because it was dropped there; a brick is a machined part, and a
         lattice cannot be built out of pieces that are each a degree off true.
         No chrome either — see the note in Drag.make. */
      const it = Drag.make(wrap, { r: 0, chrome: false });
      const rec = { it, def: PIECE[kind], bx, by, gx: 0, gy: 0, kind, tone, rot: 0 };
      const g = { members: [rec] };
      rec.g = g;
      it.brick = rec;
      /* The hover owner is one delegated listener on the canvas, so it reaches
         a record from whatever painted rect the pointer landed on. */
      wrap.__brk = rec;
      this.groups.push(g);
      this.recs.push(rec);
      it.onGrab = (item, e) => this.grab(rec, item, e);
      it.onMove = () => this.move(rec);
      it.onDrop = () => this.drop(rec);
      it.onDetach = () => this.forget(rec);
      it.onReattach = () => this.remember(rec);
      return rec;
    },

    /* Repaint in place. The art is generated from the cell list and a colour,
       so a piece changing hue is a re-render, not a swap — same node, same
       drag item, same identity, same position. The CSS cross-fades it. */
    retint(rec, hue) {
      if (!hue || rec.tone === hue) return;
      rec.tone = hue;
      this.uid = (this.uid || 0) + 1;
      rec.it.node.classList.add('is-tint');
      rec.it.node.innerHTML = this.art(rec.kind, hue, `${this.uid}`);
      setTimeout(() => rec.it.node.classList.remove('is-tint'), 420);
    },

    relax() {
      const h = this.host.getBoundingClientRect();
      this.Z = this.zone(this.host);
      const box = (r) => {
        const x = this.ax(r), y = this.ay(r);
        let W = 0, H = 0;
        this.cells(r).forEach(([c, w]) => { W = Math.max(W, c + 1); H = Math.max(H, w + 1); });
        return { x, y, w: W * this.U, h: H * this.U, r };
      };
      const PAD = 12;
      for (let pass = 0; pass < 24; pass += 1) {
        let hit = false;
        const bs = this.recs.map(box);
        for (let i = 0; i < bs.length; i += 1) {
          for (let j = i + 1; j < bs.length; j += 1) {
            const a = bs[i], b = bs[j];
            const ox = Math.min(a.x + a.w + PAD, b.x + b.w + PAD) - Math.max(a.x, b.x);
            const oy = Math.min(a.y + a.h + PAD, b.y + b.h + PAD) - Math.max(a.y, b.y);
            if (ox <= 0 || oy <= 0) continue;
            hit = true;
            /* separate along the shallower axis — the shorter way out */
            let dx = 0, dy = 0;
            if (ox < oy) dx = (a.x + a.w / 2 <= b.x + b.w / 2 ? -1 : 1) * (ox / 2 + 0.5);
            else dy = (a.y + a.h / 2 <= b.y + b.h / 2 ? -1 : 1) * (oy / 2 + 0.5);
            this.anchorTo(a.r, a.x + dx, a.y + dy);
            this.anchorTo(b.r, b.x - dx, b.y - dy);
            a.x += dx; a.y += dy; b.x -= dx; b.y -= dy;
          }
        }
        if (!hit) break;
      }
      /* and nothing may have been pushed out of the region doing it. Pushing
         apart is the only thing that moves a piece here, so the correction is
         back INTO the zone rather than merely onto the canvas — otherwise a
         crowded left edge quietly leaks pieces into the intro column, which is
         the arrangement the zone exists to prevent. */
      const z = this.Z || this.ZONE;
      this.recs.forEach((r) => {
        const b = box(r);
        const lo = z.x0 * h.width, hi = z.x1 * h.width - b.w;
        const top = this.ceil(b.x / h.width) * h.height;
        const bot = z.y1 * h.height - b.h;
        const x = Math.min(Math.max(b.x, lo), Math.max(lo, hi));
        const y = Math.min(Math.max(b.y, top), Math.max(top, bot));
        if (x !== b.x || y !== b.y) this.anchorTo(r, x, y);
      });

      /* AND NOTHING MAY BE LEFT ON THE TYPE. The zone is a region and the
         column is a shape inside it, so at some widths — a long headline, a
         wrap that puts the buttons a line lower — the two disagree and a piece
         corrected back into the region lands on the sentence. This is the
         guarantee rather than the intention: whatever the passes above
         produced, anything still overlapping the block is slid straight out
         the nearest side of it. Same rule as the drag, so the laid-out
         composition and the one you make by hand obey the same law. */
      const K = this.keepBox(h, this.WALLPAD);
      if (!K) return;
      this.recs.forEach((r) => {
        const b = box(r);
        if (b.x + b.w <= K.L || b.x >= K.R || b.y + b.h <= K.T || b.y >= K.B) return;
        const outs = [
          { d: b.y + b.h - K.T, x: b.x, y: K.T - b.h },
          { d: K.B - b.y, x: b.x, y: K.B },
          { d: b.x + b.w - K.L, x: K.L - b.w, y: b.y },
          { d: K.R - b.x, x: K.R, y: b.y },
        ].sort((p, q) => p.d - q.d)[0];
        this.anchorTo(r, outs.x, outs.y);
      });
    },

    /* =====================================================================
       THE ARRIVAL

       The hero used to be finished before you saw it: eighteen bricks already
       lying in their places while the type was still resolving. Nothing was
       wrong with it and nothing about it said the page had been built.

       So the pieces are thrown in instead. What runs below is a small rigid-
       body integrator — gravity, velocity, spin, restitution, friction, and
       pairwise contact — over the eighteen bricks and nothing else. It is not
       a path they are following. Each piece has its own mass, its own drop
       height, its own entry moment and its own spin, and when two of them meet
       on the way down they actually push each other apart, which is why no two
       runs land the same way.

       AND YET IT ALWAYS ENDS IN THE SAME PLACE. Every body carries the
       position relax() gave it as a target, and over the last third of the
       sequence a spring takes over from the physics and closes the remaining
       distance to zero. The journey is simulated; the destination is not up
       for negotiation. The hero is pixel-identical the moment it settles.

       PERFORMANCE. Eighteen bodies, 153 possible contacts, one rAF loop, and
       the only thing written per frame is three custom properties per piece —
       --x, --y and --r, all composited. No layout is read inside the loop and
       nothing else on the page re-renders while it runs.
       ===================================================================== */
    rain() {
      const bodies = this.recs.map((r) => ({ r }));
      if (!bodies.length) return;

      /* EVERY LOAD, DELIBERATELY. The fall is not a curtain in front of the
         page, it IS the page arriving. Reduced motion skips it — that is an
         accessibility setting, not a preference about novelty — and is the one
         path that still shows the laid-out composition. This never fired on
         in-page navigation anyway: it hangs off Bricks.init(), which runs once
         per document. */
      if (REDUCED) return;

      /* ===================================================================
         A DUMP, AND NOTHING ELSE.

         There is no target in this function. Not a hidden one, not a soft one,
         not one that only applies at the end — the words `tx` and `ty` do not
         appear below and neither does the position any piece was laid out at.
         A brick's entry, its velocity, its spin, its mass, its bounce and the
         line it comes to rest on are all rolled fresh on every load, it is
         pushed around by whatever it meets on the way down, and where it stops
         is wherever that leaves it.

         When the last one stops moving the loop ends and the transform each
         piece is already wearing is simply kept. No interpolation, no
         normalisation, no restore — the arrangement physics produced IS the
         loaded state, and it is different every refresh.

         The laid-out coordinates in content.js still exist and are still what
         `relax()` arranges, but from here they are only the reduced-motion
         composition and the anchor the transforms are measured from. They are
         not a destination.

         The preset builds are the OTHER system — that is where pieces travel
         to known places and assemble. Nothing in this function is shared with
         them on purpose.
         =================================================================== */
      const h = this.host.getBoundingClientRect();
      const rnd = (a2, b2) => a2 + Math.random() * (b2 - a2);
      /* MEASURED HERE, NOT AT INIT.

         `init` runs as soon as the hero is within 72% of its final height, and
         the last few percent are enough to move the intro column a long way
         down a phone screen — the region was being derived against a canvas
         that was still growing, so its floor came out below where the type
         eventually settled and the pieces landed on it anyway. The fall is the
         last thing to happen and the layout is finished by the time it starts,
         so the column is read again here. */
      this.Z = this.zone(this.host);
      const Z = this.Z;
      /* THE COMPOSITION USES THE LAYOUT BOX, NOT THE PAINTED ONE, and the two
         answer different questions on purpose. Nothing has been dragged when
         this runs — there is nowhere for a painted box to have moved TO — and
         the reveal is still animating, so the layout box is both sufficient and
         the only one that is stable. The interactive walls read the painted box
         because by then things HAVE moved. See wallBox(). */
      const K = this.keepBox(h);

      /* WHERE THIS BODY MAY BE, AT THE ANGLE IT IS AT.

         Every limit in the fall used to fence the body's UNROTATED box, and
         the body is tumbling — a 5x1 bar at 45° reaches half its own length
         past the rectangle the physics was holding. That is why pieces were
         finishing over the type on a phone despite a floor that said they
         could not: the floor was right about the box, and the box was not the
         brick. So the half-extents of the upright box that contains the piece
         AT ITS CURRENT ANGLE are derived per body per frame, and the region,
         the walls and the column are all expressed against those.

         One function, called from two places, because the second place is the
         one that was quietly wrong — see the re-clamp after the pair pass. */
      const lim = (b2) => {
        const rad = b2.a * Math.PI / 180;
        const ca = Math.abs(Math.cos(rad)), sn = Math.abs(Math.sin(rad));
        const hw = (b2.w * ca + b2.h * sn) / 2;
        const hh = (b2.w * sn + b2.h * ca) / 2;
        const cx = b2.w / 2, cy = b2.h / 2;
        let floor = Math.min(b2.base, Z.y1 * h.height - cy - hh);
        /* THE COLUMN IS SOLID, AND IT IS THE TABLE. Where the intro sits at
           the foot of the canvas, a piece whose column overlaps it does not
           fall past it — its floor is the top of the type rather than the line
           it rolled, so the pieces come to rest ON the block the way they
           would on a shelf and the headline and the buttons keep their own
           space. It is re-derived every frame from where the piece actually
           is, so one that slides off the end drops the rest of the way. */
        if (K && K.shelf && b2.x + b2.w > K.L && b2.x < K.R) {
          floor = Math.min(floor, K.T - cy - hh);
        }
        const l = Z.x0 * h.width - cx + hw;
        const r2 = Math.min(Z.x1 * h.width, h.width - 72) - cx - hw;
        return { floor, l, r: Math.max(l, r2) };
      };

      bodies.forEach((b2, i) => {
        const cells = b2.r.def.cells;
        let W = 0, H = 0;
        cells.forEach(([c, w]) => { W = Math.max(W, c + 1); H = Math.max(H, w + 1); });
        b2.w = W * this.U; b2.h = H * this.U;
        b2.m = cells.length * rnd(0.82, 1.25);      /* mass varies per load too */
        b2.e = rnd(0.14, 0.42);                     /* and so does the bounce   */
        b2.fr = rnd(0.86, 0.95);                    /* and the friction         */
        b2.wait = 110 + (i / bodies.length) * 430 + rnd(-110, 110);
        /* IT FALLS INTO THE REGION, not onto the page. Entry points are spread
           across the region's width rather than the canvas's, so nothing has
           to travel sideways to get where it belongs and the left margin is
           never crossed on the way down. */
        b2.x = rnd(Z.x0, Z.x1) * h.width - b2.w / 2;
        b2.y = -rnd(150, 760) - b2.h;
        b2.vx = rnd(-90, 90);
        b2.vy = rnd(0, 190);
        b2.a = rnd(-180, 180);
        b2.va = (Math.random() < 0.4 ? rnd(-560, 560) : rnd(-200, 200));
        /* The line it happens to stop on. Spread across the region's depth
           rather than one shelf, so the result is a scatter with a cluster or
           two in it and not a row. The ceiling is the one that belongs to the
           column it is falling down — high on the right where there is only
           paper above, and well clear of the headline on the left. */
        b2.base = h.height * rnd(this.ceil(b2.x / h.width), Z.y1) - b2.h;
        b2.floor = b2.base;
        b2.hits = 0; b2.live = false; b2.still = 0;
      });

      const G = 2750;
      const CAP = 2600;                   /* a backstop, never the plan */
      const t0 = performance.now();
      let ticks = 0;

      bodies.forEach((b2) => { b2.r.auto = true; b2.r.it.node.classList.add('is-auto', 'is-settle'); });

      const step = (now) => {
        const el = now - t0;
        const dt = Math.min(0.032, (now - (this.last || now)) / 1000) || 0.016;
        this.last = now;

        bodies.forEach((b2) => {
          if (!b2.live) { if (el >= b2.wait) b2.live = true; else return; }
          b2.vy += G * dt;
          b2.x += b2.vx * dt;
          b2.y += b2.vy * dt;
          b2.a += b2.va * dt;

          /* THE COLUMN IS SOLID, AND IT IS THE TABLE.

             Where the intro sits at the foot of the canvas, a piece whose
             column overlaps it does not fall past it — its floor is the top of
             the type rather than the line it rolled. So the pieces come to
             rest ON the block the way they would on a shelf, the headline and
             the buttons keep their own space, and a piece that slides off the
             end drops the rest of the way on its own because the floor is
             re-derived every frame from where the piece actually is rather
             than fixed when it first touched down. */
          const L = lim(b2);
          b2.floor = L.floor;
          if (b2.y >= b2.floor) {
            b2.y = b2.floor;
            if (b2.vy > 55) {
              b2.vy = -b2.vy * b2.e;
              b2.va *= 0.5;
              b2.vx *= 0.7;
              b2.hits += 1;
              if (b2.hits === 1 && ticks < 10) {
                ticks += 1;
                Sound.voice({ freq: 290 + Math.random() * 240, gain: 0.016, dur: 0.035,
                  bright: 2600, drop: 1.7, noise: 0.55 });
              }
            } else {
              /* down on the table: it slides and spins to a stop against
                 friction. Nothing pulls it anywhere. */
              b2.vy = 0; b2.vx *= b2.fr; b2.va *= b2.fr - 0.04;
            }
          }
          b2.vx *= 0.995;
          /* THE REGION'S SIDES ARE WALLS, and they bounce rather than clamp,
             so a piece that arrives at one is turned back into the scatter
             instead of stacking up along it. The right one still keeps clear
             of the toolbar's column — the one place a piece must not come to
             rest, because it would sit under a control. */
          if (b2.x < L.l) { b2.x = L.l; b2.vx = Math.abs(b2.vx) * 0.45; }
          if (b2.x > L.r) { b2.x = L.r; b2.vx = -Math.abs(b2.vx) * 0.45; }
        });

        for (let i = 0; i < bodies.length; i += 1) {
          const A = bodies[i];
          if (!A.live) continue;
          for (let j = i + 1; j < bodies.length; j += 1) {
            const C = bodies[j];
            if (!C.live) continue;
            const ox = Math.min(A.x + A.w, C.x + C.w) - Math.max(A.x, C.x);
            const oy = Math.min(A.y + A.h, C.y + C.h) - Math.max(A.y, C.y);
            if (ox <= 0 || oy <= 0) continue;
            const tot = A.m + C.m, sa = C.m / tot, sc = A.m / tot;
            /* THE TORQUE A CONTACT ADDS, AND WHY IT USED TO NEVER STOP.

               Both branches took a LENGTH IN PIXELS and used it directly as an
               angular impulse in degrees per second. The vertical one was the
               bad one: `(A.x - C.x)` is the gap between two left edges, which
               for two pieces lying beside each other is 60, 80, 120px — so a
               brick that came to rest touching another was handed up to sixty
               degrees per second of new spin, every frame, for as long as the
               contact lasted. Nothing removed it. The pair sat there feeding
               each other rotation, and because the arrangement is only
               declared finished once every piece is under 26°/s, they also
               held the whole fall open until the 2.6s backstop cut it off. It
               is the piece that lands last and then keeps turning.

               A contact torque should be a fraction of the offset relative to
               the PIECES' OWN SIZE, not an absolute distance, and it should be
               bounded — an edge-on nudge cannot spin a brick faster than the
               drop did. Contact also bleeds rotation now rather than only ever
               adding it, which is what friction between two plastic parts
               does and what makes the pile converge. */
            const spin = (P, Q, off, share) => {
              const w = Math.max(P.w, Q.w, 1);
              P.va += clamp(off / w, -1, 1) * 34 * share;
              P.va *= 0.86;
            };
            if (ox < oy) {
              const d = (A.x < C.x ? -1 : 1) * ox;
              A.x += d * sa; C.x -= d * sc;
              const v = (A.vx - C.vx) * 0.36;
              A.vx -= v * sa; C.vx += v * sc;
              spin(A, C, d, sa); spin(C, A, -d, sc);
            } else {
              const d = (A.y < C.y ? -1 : 1) * oy;
              A.y += d * sa; C.y -= d * sc;
              const v = (A.vy - C.vy) * 0.36;
              A.vy -= v * sa; C.vy += v * sc;
              /* centre to centre, so a piece landing squarely on another gets
                 no turn at all and one landing on a corner tips off it */
              const off = (A.x + A.w / 2) - (C.x + C.w / 2);
              spin(A, C, off, sa); spin(C, A, -off, sc);
            }
          }
        }

        /* THE PAIR PASS KNOWS NOTHING ABOUT THE REGION. It resolves brick
           against brick and pushes bodies wherever that takes them, which for
           the last piece to land is often straight back down through the floor
           it had already settled on — and nothing re-applied the limit before
           the frame was drawn, so it stayed there. Every arrangement that
           ended with a piece slightly over the type ended that way here, not
           in the floor calculation. */
        bodies.forEach((b2) => {
          if (!b2.live) return;
          const L = lim(b2);
          if (b2.y > L.floor) { b2.y = L.floor; if (b2.vy > 0) b2.vy = 0; }
          b2.x = Math.min(Math.max(b2.x, L.l), L.r);
        });

        bodies.forEach((b2) => {
          if (!b2.live) { this.moveTo(b2.r, b2.x, -900); return; }
          this.moveTo(b2.r, b2.x, b2.y);
          const st = Math.min(0.06, Math.abs(b2.vy) / 22000);
          b2.r.it.rest = b2.a;
          b2.r.it.sy = 1 + st; b2.r.it.sx = 1 - st * 0.5;
          b2.r.it.node.style.setProperty('--r', `${b2.a.toFixed(2)}deg`);
          b2.r.it.node.style.setProperty('--sx', (1 - st * 0.5).toFixed(4));
          b2.r.it.node.style.setProperty('--sy', (1 + st).toFixed(4));
        });

        const resting = bodies.every((b3) => b3.live && b3.y >= b3.floor - 1.5
          && Math.abs(b3.vy) < 18 && Math.abs(b3.vx) < 18 && Math.abs(b3.va) < 26);
        if (!resting && el < CAP) { requestAnimationFrame(step); return; }

        /* STOP. This is the whole ending: the loop exits and every piece keeps
           the position, the angle and the neighbours physics gave it. The only
           writes here undo the speed-stretch — which is a motion cue, not a
           position — and hand the pieces back to the drag system, which picks
           them up exactly where they are. */
        bodies.forEach((b2) => {
          b2.r.it.sx = 1; b2.r.it.sy = 1;
          b2.r.it.rest = b2.a;
          b2.r.auto = false;
          b2.r.it.node.classList.remove('is-auto', 'is-settle');
          Drag.apply(b2.r.it);
        });
        delete document.body.dataset.arriving;
      };

      document.body.dataset.arriving = 'dump';
      bodies.forEach((b2) => this.moveTo(b2.r, b2.x, -900));
      requestAnimationFrame(step);
    },

    /* --- the snap plan ----------------------------------------------------
       The best lawful landing for `set` against every OTHER group, or null.
       Lawful means: on that group's lattice, no cell overlapping one of its
       cells, and at least one cell edge-to-edge with one of its cells.

       THE SWEEP HAS TO COVER THE WHOLE RANGE, and getting that wrong is
       invisible in every screenshot and obvious in the hand.

       It was a fixed 3x3 around the rounded cell, which is exactly right while
       the magnet reaches one stud. Widening the magnet to 2.7 studs without
       widening this left a dead band: from about 1.5 studs out to the edge of
       the range the nearest LAWFUL cell was two or three cells away, outside
       the sweep, so `plan` returned null and the piece drifted in feeling
       nothing at all. The pull only woke up in the last third of the approach —
       which is precisely the complaint that the magnet was weak. It was not
       weak, it was absent for most of the distance it claimed to cover.

       So the span is derived from the range rather than written down beside it,
       and candidates past the range are culled instead of scored, which keeps
       the wider search cheap. */
    /* Every OTHER group's occupied squares, in absolute canvas pixels rounded
       to the lattice, so a candidate landing can be tested against the pieces
       that are merely LYING there as well as against the one it is joining.

       This is the distinction the scattered state needs. Overlap with a third
       piece must not BLOCK detection — after the fall half the canvas overlaps
       something, and refusing to see a connection because an unrelated brick is
       in the way is the failure this whole pass is about. But a landing that
       buries the piece inside a third brick is still worse than one that does
       not, so it is scored down rather than thrown away: if a clear landing
       exists it wins, and if none does the buried one is still offered.

       Built once per gesture rather than per pointer event — the groups it
       describes are not the ones being moved, so it cannot go stale mid-drag. */
    occupancy(skip) {
      const U = this.U, seen = new Set();
      this.groups.forEach((g) => {
        if (g === skip || g.members.some((r) => r.auto)) return;
        g.members.forEach((r) => {
          const bx = this.ax(r), by = this.ay(r);
          this.cells(r).forEach(([c, w]) => {
            seen.add(`${Math.round((bx + c * U) / U)},${Math.round((by + w * U) / U)}`);
          });
        });
      });
      return seen;
    },

    /* A group's cell bounding box on its own lattice. Cached on the group and
       thrown away whenever its membership or any member's position changes —
       both of which go through `weld`, `pop`, `resplit` and `restore`, so the
       one place it is invalidated is `dirty()`. */
    bounds(g) {
      if (g._bb && g._bbGen === this.gen) return g._bb;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      g.members.forEach((r) => this.cells(r).forEach(([c, w]) => {
        x0 = Math.min(x0, r.gx + c); x1 = Math.max(x1, r.gx + c + 1);
        y0 = Math.min(y0, r.gy + w); y1 = Math.max(y1, r.gy + w + 1);
      }));
      g._bb = { x0, y0, x1, y1 };
      g._bbGen = this.gen;
      return g._bb;
    },

    /* ONE counter, bumped by everything that can change what a group occupies:
       a weld, a piece popped out, a split, an undo, a quarter turn, a build
       placing pieces on the lattice. A cache with several invalidation sites
       is a cache that will be stale in one of them; this has exactly one rule
       — if the model changed, the generation changed. */
    gen: 0,
    dirty() { this.gen += 1; },

    /* --- THE SOLVER -------------------------------------------------------
       ONE function answers "where does this go", and both the ghost and the
       release read its answer. There is no second path that could disagree
       with the preview, because there is no second path.

       It returns the best LAWFUL landing for `set` against every other group,
       or null. Lawful is unchanged and is the thing the lattice guarantees: on
       that group's grid, no cell of ours on a cell of theirs, and at least one
       of our cells edge-to-edge with one of theirs. What has changed is which
       lawful landing wins when there are several, and how far out we look. */
    plan(set, skip) {
      const U = this.U, a = set[0];
      const REACH = this.detect();
      const SPAN = Math.ceil(REACH / U) + 1;
      const ax = this.ax(a), ay = this.ay(a);
      const mc = [];
      set.forEach((r) => this.cells(r).forEach(([c, w]) =>
        mc.push([r.gx - a.gx + c, r.gy - a.gy + w])));
      const busy = this.busyCells || null;
      if (this.debug) this._cand = [];
      /* our own reach past our anchor, so the per-group reject below is a test
         between two boxes rather than between a box and a point */
      let mx = 0, my = 0;
      mc.forEach(([c, w]) => { mx = Math.max(mx, c + 1); my = Math.max(my, w + 1); });
      const reachPad = Math.hypot(mx, my) * U;

      /* NO LANDING MAY PUT A CELL ON HERO CONTENT — including a landing on
         another BRICK. This is the case the walls as targets do not cover and it
         is the one that showed up in testing: bring a piece to the far side of
         the headline, find a neighbour there, and the lawful join to that
         neighbour is two studs over the sentence. A block was a place to land
         and it was not yet a place you could not land, so a legal weld walked
         straight through it.

         A quarter of a stud of slop, because the held group's lattice and a
         block's are not necessarily the same one — a piece seating flush is
         within rounding of touching, and that must read as touching rather than
         as overlapping. */
      const ws = this.wallsNow();
      const wEps = this.WALLEPS;
      const onWall = ws.length ? (px, py) => ws.some((w) => (
        px + U - wEps > w.ox && px + wEps < w.ox + w.nx * U
        && py + U - wEps > w.oy && py + wEps < w.oy + w.ny * U
      )) : null;

      let best = null;

      /* One sweep, run over the real groups and then over the block of type.
         `bias` is what keeps the two from being the same thing: the intro is a
         far larger target than any brick and it would otherwise win every
         close call simply by having more edges. */
      const consider = (g, bias) => {
        let ox, oy, gb, gc;
        if (g.wall) {
          ox = g.ox; oy = g.oy; gb = g.bb; gc = g.cells;
        } else {
          if (g === skip || !g.members.length) return;
          if (set.indexOf(g.members[0]) >= 0) return;
          /* a piece the preset is currently flying is not a place to land: its
             position is changing between frames and it has not seated yet */
          if (g.members.some((r) => r.auto)) return;
          const b = g.members[0];
          ox = this.ax(b) - b.gx * U; oy = this.ay(b) - b.gy * U;
          gb = this.bounds(g);
        }
        /* CHEAP REJECT BEFORE THE SWEEP. Widening the search from 2.7 studs to
           4.2 more than doubled the candidate grid, and it was being walked
           once for every group on the canvas including the ones on the far
           side of the hero. A group's cells cannot reach us if its whole
           bounding box, grown by our own, is still further than the search
           radius — one hypot per group throws most of them out before any of
           that work happens. */
        if (Math.hypot(
          Math.max(0, Math.max(ox + gb.x0 * U - ax, ax - (ox + gb.x1 * U))),
          Math.max(0, Math.max(oy + gb.y0 * U - ay, ay - (oy + gb.y1 * U)))
        ) > REACH + reachPad) return;
        if (!gc) gc = this.cellsOf(g);
        /* The block has one flat side per direction, so joining along ten of
           its cells is not a better connection than joining along three — it
           is the same connection. Capping the bonus stops the length of the
           headline from deciding where a brick goes. */
        const cap = g.wall ? 3 : 6;
        const qx = Math.round((ax - ox) / U), qy = Math.round((ay - oy) / U);
        for (let dy = -SPAN; dy <= SPAN; dy += 1) {
          for (let dx = -SPAN; dx <= SPAN; dx += 1) {
            const cx = qx + dx, cy = qy + dy;
            /* cheap cull first: most of a wide sweep is out of reach anyway */
            const tx0 = ox + cx * U, ty0 = oy + cy * U;
            const d0 = Math.hypot(tx0 - ax, ty0 - ay);
            if (d0 > REACH || (best && d0 + bias - best.slack >= best.k)) continue;
            let bad = false, touch = 0, buried = 0;
            for (let k = 0; k < mc.length; k += 1) {
              const x = cx + mc[k][0], y = cy + mc[k][1];
              if (gc.has(`${x},${y}`)) { bad = true; break; }
              /* Including when the target IS a block. This exemption used to be
                 here — "a landing against a wall obviously touches that wall" —
                 and it was both unnecessary and the last hole in the guarantee.
                 Unnecessary because `gc` already rejects cells inside the target
                 and the rect test carries a quarter-stud of slop, so a flush
                 seat reads as touching rather than as overlapping. A hole
                 because the hero is FIVE blocks that touch: a five-stud bar
                 seated legally along the bottom of the headline reached straight
                 across the gap and lay over the tags, and nothing in the sweep
                 was looking. */
              if (onWall && onWall(tx0 + mc[k][0] * U, ty0 + mc[k][1] * U)) { bad = true; break; }
              if (gc.has(`${x + 1},${y}`)) touch += 1;
              if (gc.has(`${x - 1},${y}`)) touch += 1;
              if (gc.has(`${x},${y + 1}`)) touch += 1;
              if (gc.has(`${x},${y - 1}`)) touch += 1;
              if (busy) {
                const wx = Math.round((tx0 + mc[k][0] * U) / U);
                const wy = Math.round((ty0 + mc[k][1] * U) / U);
                if (busy.has(`${wx},${wy}`)) buried += 1;
              }
            }
            if (bad || !touch) continue;
            /* SCORE, NOT FIRST FOUND. Travel is the bulk of it — the nearest
               lawful landing is nearly always the one meant — and two
               corrections ride on top: a landing that would bury this piece
               inside an unrelated brick costs a stud and a half per cell, and
               every extra shared edge earns back a third of one, so a join
               along a whole side beats a join on a single corner when the two
               are otherwise equally close. */
            const k2 = d0 + buried * U * 1.5 - Math.min(touch, cap) * U * 0.34 + bias;
            if (this.debug) this._cand.push({ tx: tx0, ty: ty0, d: d0, k: k2, touch, buried });
            if (best && k2 >= best.k) continue;
            best = { d: d0, k: k2, slack: U * 2, tx: tx0, ty: ty0, g, cx, cy, ox, oy, touch, buried };
          }
        }
      };

      this.groups.forEach((g) => consider(g, 0));
      /* THE HERO LAST, AND AT A HANDICAP. Half a stud, which is enough that a
         brick offered both a real neighbour and the edge of the sentence at the
         same distance goes to the neighbour — bricks connect to bricks first,
         and a block is where a piece ends up when there is nothing else there.
         All four sides of every wall are searched by the same sweep, so left and
         right are not a special case that could be forgotten; they are the same
         case as top and bottom. */
      ws.forEach((w) => consider(w, U * 0.5));

      /* ONE SOLVER, AND THE INTERIOR IS PART OF IT.

         The blocked interior is not a second system with its own answer. It is
         this function's answer when the piece is standing on a block, computed
         differently — analytically, four ways off a rectangle — because a
         four-stud sweep cannot reach an edge from the middle of a headline. It
         comes back in exactly the same shape, so the preview, the release and
         the overlay all still read one object.

         It wins outright when it applies, which is the priority the interaction
         needs: blocked first, edges second, free drag last. `wallOut` returns
         null when the piece is not inside anything, so "when it applies" is the
         function's own answer rather than a condition written out here twice. */
      if (this.debug) this._ej = [];
      const out = this.wallOut(set);
      if (out) { out.blocked = this.inWall(set); best = out; }
      return best;
    },

    /* --- DEBUG ------------------------------------------------------------
       Off unless it is asked for, and it can only be asked for from the
       address bar or the console — `?brkdebug` on the URL, or
       `__brickDebug(true)`. Nothing in the interface turns it on and nothing
       ships enabled, so a visitor cannot reach it by accident.

       It draws the things that decide a snap and are otherwise invisible: the
       lattice squares each piece actually occupies (which is the hit region,
       not the bounding box), the anchor every measurement is taken from, the
       detect radius around the held piece, every lawful candidate the solver
       found, and which one it chose. When a piece will not connect, this
       answers why in one look — no candidates at all is a reach problem, many
       candidates and a surprising winner is a scoring problem, and candidates
       drawn somewhere other than where the piece appears is a coordinate
       problem. */
    debugOn(on) {
      this.debug = !!on;
      if (!this.debug && this.dbg) { this.dbg.remove(); this.dbg = null; }
      if (this.debug) this.debugDraw();
      return this.debug;
    },

    debugLayer() {
      if (this.dbg && this.dbg.parentNode === this.host) return this.dbg;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'brkdbg');
      svg.setAttribute('aria-hidden', 'true');
      this.host.appendChild(svg);
      this.dbg = svg;
      return svg;
    },

    debugDraw() {
      if (!this.debug || !this.host) return;
      const U = this.U, svg = this.debugLayer();
      const h = this.host.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${Math.round(h.width)} ${Math.round(h.height)}`);
      const p = [];
      const rect = (x, y, w, ht, cls) =>
        p.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" `
          + `height="${ht.toFixed(1)}" class="${cls}"/>`);

      /* THE HERO BLOCKS, AS THE ENGINE BELIEVES THEM.

         This is the layer worth having. Everything about the hero's collision
         geometry is invisible by construction, so a wall measured against where
         the headline USED to be looks exactly like a wall measured correctly —
         which is how a stale box survives a whole afternoon of testing. Drawn
         here: the lattice rectangle of each block, the four edges a brick may
         seat against, and the interior it may not enter. Drag the headline with
         `?brkdebug` on and the outline follows it or it does not, and there is
         nothing to interpret. */
      const held = this.held && this.held.gest;
      const plan = held && held.plan;
      const live = plan && plan.g && plan.g.wall ? plan.g : null;
      const side = live ? this.wallSide(live, plan, held.set) : null;
      (this.walls || []).forEach((w) => {
        const W = w.nx * U, H = w.ny * U;
        rect(w.ox, w.oy, W, H, 'd-wall');
        /* all four snap edges, and the one the current landing is actually
           seated against drawn hot — which is the question you are asking when
           a piece goes to the wrong side of the hero */
        const edge = (s2, x, y, w2, h2) =>
          rect(x, y, w2, h2, w === live && side === s2 ? 'd-wedge d-whot' : 'd-wedge');
        edge('t', w.ox, w.oy - 1.5, W, 3);
        edge('b', w.ox, w.oy + H - 1.5, W, 3);
        edge('l', w.ox - 1.5, w.oy, 3, H);
        edge('r', w.ox + W - 1.5, w.oy, 3, H);
        p.push(`<circle cx="${w.ox.toFixed(1)}" cy="${w.oy.toFixed(1)}" r="3" class="d-anchor"/>`);
      });

      /* every piece's true footprint, square by square */
      this.recs.forEach((r) => {
        const bx = this.ax(r), by = this.ay(r);
        const held = this.heldSet && this.heldSet.indexOf(r) >= 0;
        this.cells(r).forEach(([c, w]) =>
          rect(bx + c * U, by + w * U, U, U, held ? 'd-hit d-held' : 'd-hit'));
        p.push(`<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="2.5" class="d-anchor"/>`);
      });

      const rec = this.held;
      const g = rec && rec.gest;
      if (g) {
        const a = g.set[0];
        const ax = this.ax(a), ay = this.ay(a);
        p.push(`<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" `
          + `r="${this.detect().toFixed(1)}" class="d-detect"/>`);
        p.push(`<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" `
          + `r="${this.range().toFixed(1)}" class="d-magnet"/>`);
        (this._cand || []).forEach((c) => {
          p.push(`<circle cx="${c.tx.toFixed(1)}" cy="${c.ty.toFixed(1)}" r="3" class="d-cand"/>`);
        });
        /* every cell of the held set, so the connector geometry the solver is
           actually testing is on screen next to the piece it belongs to */
        g.set.forEach((r) => {
          const bx = this.ax(r), by = this.ay(r);
          this.cells(r).forEach(([c, w]) => {
            p.push(`<circle cx="${(bx + (c + 0.5) * U).toFixed(1)}" `
              + `cy="${(by + (w + 0.5) * U).toFixed(1)}" r="2" class="d-stud"/>`);
          });
        });
        if (g.plan) {
          const q = g.plan;
          p.push(`<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" `
            + `x2="${q.tx.toFixed(1)}" y2="${q.ty.toFixed(1)}" class="d-pick"/>`);
          p.push(`<circle cx="${q.tx.toFixed(1)}" cy="${q.ty.toFixed(1)}" r="5" class="d-pick"/>`);
          g.set.forEach((r) => {
            const gx = q.cx + r.gx - a.gx, gy = q.cy + r.gy - a.gy;
            this.cells(r).forEach(([c, w]) =>
              rect(q.ox + (gx + c) * U, q.oy + (gy + w) * U, U, U, 'd-land'));
          });
        }
      }
      svg.innerHTML = p.join('');
    },

    /* --- HOVER: ONE OWNER, ONE STATE --------------------------------------
       There is no `:hover` on a brick any more. The reason is not style, it is
       arithmetic: a welded structure is N separate `.drg` nodes and CSS can
       only ever answer "is the cursor over THIS node", so crossing a seam is
       always a leave and an enter on two different elements. Whatever the two
       rules paint, the transition between them happens, and at speed it is a
       ripple of eight elements each starting a 150ms animation — the flicker.

       One delegated listener on the canvas instead, which resolves the pointer
       to a GROUP and does nothing at all when the group has not changed. Move
       the cursor across four bricks of one structure and this fires four times
       and mutates nothing. Move it to a different structure and exactly one
       state leaves and one arrives.

       It also cannot get stuck. There is a single owning field, `hovg`; every
       path that clears it goes through the same function, and a gesture ending
       re-derives the state from where the pointer actually is rather than
       assuming an event will arrive to tell it. */
    mark(g, cls, on) {
      if (!g || !g.members) return;
      g.members.forEach((r) => r.it.node.classList.toggle(cls, on));
    },

    hoverBind(host) {
      const rec = (e) => {
        const n = e.target && e.target.closest ? e.target.closest('.brk') : null;
        return n ? n.__brk || null : null;
      };
      host.addEventListener('pointerover', (e) => { this.over = rec(e); this.hover(this.over); });
      host.addEventListener('pointerout', (e) => {
        /* moving between two rects of the SAME piece, or onto another brick,
           fires an out that the matching over is about to correct. Ignoring it
           here is what stops the state blinking off and on again between two
           events in the same frame. */
        const to = e.relatedTarget;
        if (to && to.closest && to.closest('.brk')) return;
        this.over = null; this.hover(null);
      });
      host.addEventListener('pointerleave', () => { this.over = null; this.hover(null); });
    },

    hover(rec) {
      /* A DRAG OWNS THE STATE UNTIL IT ENDS. Passing over another piece while
         carrying one must not light that piece up, and must not take the held
         set's own state away — the set you are holding is not a thing you are
         pointing at. */
      if (this.held) return;
      let g = rec ? rec.g : null;
      if (g && Rack.tool !== 'select') g = null;      // drawing tools don't hover
      if (g === this.hovg) return;
      this.mark(this.hovg, 'is-hov', false);
      this.hovg = g;
      this.mark(g, 'is-hov', true);
    },

    /* --- THE GHOST --------------------------------------------------------
       The held set, redrawn at the cells `plan()` picked. It is built once per
       gesture and moved by transform after that, so a pointer event costs one
       style write per piece and no layout, and it is drawn from `art()` rather
       than cloned so its filter ids are its own.

       It is deliberately not the same object as the pull. The magnet moves the
       real piece toward the landing; the ghost IS the landing and does not
       move as you approach it, which is what lets you read the two apart —
       one of them is answering to your hand and one of them is not. */
    ghostLayer() {
      if (this.gl && this.gl.parentNode === this.host) return this.gl;
      this.gl = el('div', { class: 'brkghost', 'aria-hidden': 'true' });
      this.host.appendChild(this.gl);
      return this.gl;
    },

    ghostMake(g) {
      const layer = this.ghostLayer();
      layer.innerHTML = '';
      g.ghost = g.set.map((r) => {
        this.uid = (this.uid || 0) + 1;
        const pc = el('div', { class: 'brkghost__pc' });
        pc.innerHTML = this.art(r.kind, r.tone, `g${this.uid}`);
        layer.appendChild(pc);
        return { r, pc };
      });
    },

    /* `plan` null or out of range means there is nothing to promise, so there
       is nothing on screen — see the rule about never showing a preview at a
       position that is not a real connection. */
    ghost(g, plan) {
      if (!plan) {
        if (this.gl) this.gl.classList.remove('is-on');
        if (this.tgtg) { this.mark(this.tgtg, 'is-tgt', false); this.tgtg = null; }
        return;
      }
      if (!g.ghost) this.ghostMake(g);
      const U = this.U, a = g.set[0];
      g.ghost.forEach(({ r, pc }) => {
        const o = this.off(r);
        const X = plan.ox + (plan.cx + r.gx - a.gx) * U - o.x;
        const Y = plan.oy + (plan.cy + r.gy - a.gy) * U - o.y;
        const deg = ((((r.rot || 0) % 4) + 4) % 4) * 90;
        pc.style.transform =
          `translate3d(${X.toFixed(1)}px, ${Y.toFixed(1)}px, 0) rotate(${deg}deg)`;
      });
      this.ghostLayer().classList.add('is-on');

      if (this.tgtg !== plan.g) {
        this.mark(this.tgtg, 'is-tgt', false);
        this.tgtg = plan.g;
        this.mark(this.tgtg, 'is-tgt', true);
      }
      /* A wall has no members, so `mark` has nothing to light for it — and
         nothing should be lit for it. A region is not an object on this canvas;
         the ghost standing at its edge is the whole of what the user is told. */
    },

    /* --- the rotate hint --------------------------------------------------
       Above the piece, centred on it, and only while a piece that can actually
       be turned is in the hand. It is placed from the lattice rather than from
       a measured rect: the numbers are already known and a
       getBoundingClientRect on the drag path is exactly what this module
       spends its whole budget avoiding. */
    hintAt(rec) {
      const g = rec.gest;
      if (!this.hintEl || !g) return;
      let L = Infinity, R = -Infinity, T = Infinity;
      g.set.forEach((r) => {
        const d = this.dims(r);
        const odd = ((((r.rot || 0) % 4) + 4) % 4) % 2;
        const w = (odd ? d.H : d.W) * this.U;
        const x = this.ax(r), y = this.ay(r);
        L = Math.min(L, x); R = Math.max(R, x + w); T = Math.min(T, y);
      });
      this.hintEl.style.left = `${((L + R) / 2).toFixed(1)}px`;
      this.hintEl.style.top = `${(T - 9).toFixed(1)}px`;
    },

    /* ON A TOUCHSCREEN THE HINT IS THE CONTROL.

       "Press R" is not advice on a phone, it is a dead end — there is no R,
       and the rotation was simply unreachable there. So on a coarse pointer
       the same element in the same place becomes a button: the piece is held
       under one finger and the other taps this. It is deliberately the same
       object rather than a second piece of chrome, so the layout, the timing
       and the anchoring are shared and there is one thing to keep out of the
       way of the brick instead of two.

       It takes pointer events (everything else in the brick layer does not)
       and it stops them, so the tap cannot reach the canvas underneath and be
       read as a press on some other piece. `touch-action: none` keeps the tap
       from being interpreted as a scroll, and the handler runs on pointerdown
       rather than click because the drag is still live and a click would not
       be delivered until the finger lifted. */
    hintOn(rec) {
      if (!this.hintEl || this.hintEl.parentNode !== this.host) {
        const tap = this.touch;
        this.hintEl = el('div', {
          class: `brkhint${tap ? ' brkhint--tap' : ''}`,
          'aria-hidden': tap ? 'false' : 'true',
          role: tap ? 'button' : null,
          'aria-label': tap ? 'Rotate the held brick 90 degrees' : null,
        });
        this.hintEl.innerHTML = tap
          ? '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">'
            + '<path d="M13.2 6.2A5.4 5.4 0 1 0 13.5 9.6" fill="none" stroke="currentColor" '
            + 'stroke-width="1.7" stroke-linecap="round"/>'
            + '<path d="M13.6 2.4v3.9H9.7" fill="none" stroke="currentColor" '
            + 'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            + '<span>Rotate</span>'
          : 'Press <kbd>R</kbd> to rotate';
        if (tap) {
          this.hintEl.addEventListener('pointerdown', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (this.held) this.rotate(this.held);
          });
        }
        this.host.appendChild(this.hintEl);
      }
      this.hintAt(rec);
      this.hintEl.classList.add('is-on');
    },

    hintOff() { if (this.hintEl) this.hintEl.classList.remove('is-on'); },

    /* --- R ----------------------------------------------------------------
       A quarter turn of the footprint the instant it is asked for, and a
       quarter turn of the picture over the next 260ms. The order matters: the
       model leads and the animation follows, so the ghost drawn on the very
       next line is already the rotated one. A preview that waited for the
       spring to finish would be describing the piece's old orientation for a
       quarter of a second — which is precisely the stale preview the whole
       ghost exists to prevent.

       Structures are not turned. Rotating a welded assembly means rotating
       every member about a shared centre and re-deriving each one's lattice
       origin, which is a different feature; the hint is not shown when one is
       in the hand, so nothing is promised that does not happen. */
    rotate(rec) {
      const g = rec.gest;
      if (!g || g.set.length !== 1) return;
      rec.rot = (((rec.rot || 0) + 1) % 4);
      this.dirty();
      rec.aim = (rec.aim == null ? rec.it.rest : rec.aim) + 90;
      this.spin(rec);
      this.move(rec);                    // re-plan now; the pointer has not moved
      this.hintAt(rec);
      Sound.voice({ freq: 880, gain: 0.022, dur: 0.035, bright: 4200, drop: 1.1, noise: 0.4 });
    },

    /* TRUING THE TARGET.

       A piece that has never been picked up is still wearing the angle the
       load left it at, and the lattice does not know about that angle — so the
       ghost drawn against it would be drawn against where that piece's upright
       footprint is rather than where the piece visibly is. On an elongated
       brick lying at 70° those are not close, and a preview that is not
       exactly true is worse than no preview.

       So a structure that is about to be connected to comes true first. It
       reads as the thing you are aiming at squaring up to receive the part,
       which is both the honest thing and the physical one, and it happens
       once: `trued` marks a piece whose angle the lattice now owns. Everything
       still lying where it fell keeps its tilt until something wants it. */
    square(g) {
      let did = false;
      (g.members || []).forEach((r) => {
        if (r.trued) return;
        r.trued = true;
        this.dirty();
        const q = Math.round(r.it.rest / 90);
        r.rot = ((q % 4) + 4) % 4;
        r.aim = q * 90;
        if (Math.abs(r.it.rest - r.aim) > 0.01) { this.spin(r); did = true; }
      });
      return did;
    },

    /* The angle, sprung. One small overshoot and stop — the same damped cosine
       the seat uses, because turning a part in your hand and seating it are
       the same kind of motion and should not read as two different physics.

       `sp` is a generation counter: press R three times quickly and the first
       two loops see a newer tag and drop out on their next frame rather than
       fighting the third for the same property. */
    spin(rec) {
      const it = rec.it;
      const from = it.rest, to = rec.aim;
      if (to == null || Math.abs(to - from) < 0.01) return;
      rec.sp = (rec.sp || 0) + 1;
      const tag = rec.sp;
      const node = it.node;
      node.classList.add('is-spin');
      if (REDUCED) {
        it.rest = to; Drag.apply(it); node.classList.remove('is-spin'); return;
      }
      const t0 = performance.now(), DUR = 260;
      const step = (now) => {
        if (rec.sp !== tag) return;
        const t = Math.min(1, (now - t0) / DUR);
        const e = 1 - Math.exp(-7.6 * t) * Math.cos(6.6 * t);
        it.rest = from + (to - from) * e;
        Drag.apply(it);
        if (t < 1) { requestAnimationFrame(step); return; }
        it.rest = to; Drag.apply(it);
        node.classList.remove('is-spin');
      };
      requestAnimationFrame(step);
    },

    /* Everything a gesture put on screen, taken off again — and idempotent,
       because it is called from two places that cannot be ordered against each
       other. `drop` runs from Drag's own pointerup handler and only when the
       press actually travelled; the window listener runs on every release
       including the one that was just a click. Whichever gets here first does
       the work and the other finds nothing to do. */
    endHold(rec) {
      if (this.held !== rec) return;
      clearTimeout(this.hintT);
      this.hintOff();
      this.mark({ members: this.heldSet || [] }, 'is-hold', false);
      this.ghost({}, null);
      this.blocked(null);
      this.heldSet = null;
      this.busyCells = null;
      this.held = null;
      if (this.debug) this.debugDraw();
      /* The pointer has not moved, so no pointerover is coming to tell us what
         is under it now. Re-derive from the last one that did arrive. */
      this.hover(this.over || null);
    },

    /* --- the gesture ------------------------------------------------------ */
    grab(rec, it, e) {
      this.before = this.snapshot();
      /* Alt pops the piece out first, so from here on the gesture is an
         ordinary single-piece drag and there is no second code path for it. */
      if ((e.altKey || e.metaKey) && rec.g.members.length > 1) this.pop(rec);

      const set = rec.g.members.slice();
      rec.gest = {
        set,
        leadX: it.x, leadY: it.y,
        start: set.map((r) => ({ r, x: r.it.x, y: r.it.y })),
        plan: null,
      };
      set.forEach((r) => { if (r !== rec) Drag.raise(r.it); });
      Drag.raise(it);

      /* HELD, FROM THE PRESS. Not from the 4px threshold — the piece is in the
         hand the moment it is pressed, and a state that only arrives once you
         have moved reads as the object catching up with you. Hover is stood
         down for the duration and cannot come back until `endHold`. */
      this.held = rec;
      this.heldSet = set;
      /* what else is lying on the canvas, measured once — see occupancy() */
      this.busyCells = this.occupancy(rec.g);
      /* And where the hero content is, NOW. Not at load, not the last time a
         brick was dragged — read at the top of this gesture and re-read on any
         event after something with a wall on it has moved. */
      this.wallsNow();
      this.mark(this.hovg, 'is-hov', false);
      this.hovg = null;
      this.mark({ members: set }, 'is-hold', true);

      /* SQUARE IT IN THE HAND.

         The load drops these from a height and keeps whatever angle each piece
         came to rest at, and every measurement in the snap engine is of the
         upright footprint — so a brick lying at 69° was being pulled by, and
         landed by, a rectangle that was not the shape on the screen. It came
         true only inside `weld()`, which is why a connection could look wrong
         right up until the instant it completed.

         Picking it up squares it to the nearest quarter turn, which is both
         the fix and the honest gesture: you have taken hold of a part, and a
         part in a hand is oriented. The scatter's tilt is a property of how
         the pieces LANDED, not of the pieces, and it survives until the first
         time you touch one. Members of a structure are already square, so this
         is a no-op for them and R is left to single pieces. */
      if (set.length === 1) {
        rec.trued = true;
        this.dirty();
        const q = Math.round(it.rest / 90);
        rec.rot = ((q % 4) + 4) % 4;
        rec.aim = q * 90;
        this.spin(rec);
        clearTimeout(this.hintT);
        this.hintT = setTimeout(() => { if (this.held === rec) this.hintOn(rec); }, 220);
      }

      /* A press that never travels never reaches `drop`, so the teardown
         cannot live there alone. */
      addEventListener('pointerup', () => this.endHold(rec), { once: true });
      addEventListener('pointercancel', () => this.endHold(rec), { once: true });

      /* The soft edge has to hold the whole structure, not the one brick the
         pointer happens to be on — Drag measured the single node before this
         ran. Re-derive it from the union of the set. */
      if (set.length > 1 && this.host) {
        const h = this.host.getBoundingClientRect();
        let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
        set.forEach((r) => {
          const q = r.it.node.getBoundingClientRect();
          L = Math.min(L, q.left); T = Math.min(T, q.top);
          R = Math.max(R, q.right); B = Math.max(B, q.bottom);
        });
        const k = Math.min(Drag.KEEP, (R - L) * 0.9, (B - T) * 0.9);
        let x0 = it.x + (h.left + k) - R, x1 = it.x + (h.right - k) - L;
        let y0 = it.y + (h.top + k) - B, y1 = it.y + (h.bottom - k) - T;
        if (x0 > x1) { const mid = (x0 + x1) / 2; x0 = x1 = mid; }
        if (y0 > y1) { const mid = (y0 + y1) / 2; y0 = y1 = mid; }
        it.bounds = { x0, x1, y0, y1 };
      }
    },

    /* Carry the rest of the structure, then lean toward whatever is in range.

       The lean is applied on top of a position recomputed from the pointer's
       absolute offset every event, never accumulated — so the magnet can pull
       the piece 12px sideways and the piece is still exactly under the cursor
       the moment it leaves the magnet's range again. An accumulated pull
       cannot be undone and the object walks away from the hand holding it. */
    move(rec) {
      const g = rec.gest;
      if (!g) return;
      const dx = rec.it.x - g.leadX, dy = rec.it.y - g.leadY;
      g.start.forEach((s) => {
        if (s.r === rec) return;
        s.r.it.x = s.x + dx; s.r.it.y = s.y + dy;
      });

      let plan = this.plan(g.set, rec.g);
      /* Truing the target can change its footprint, so anything measured
         against the old one is stale by definition — re-plan against the piece
         as it now is rather than drawing one frame of a promise that is about
         to stop being true. It runs at most once per structure per page. */
      if (plan && this.square(plan.g)) plan = this.plan(g.set, rec.g);

      g.plan = plan;

      if (!plan) {
        this.lit(g.set, false); this.ghost(g, null);
        this.blocked(null);
        this.paint(g.set, rec); this.hintAt(rec); return;
      }

      /* STANDING ON A BLOCK. Nothing is fenced, so the piece is there and the
         question is only what happens when the hand opens. The blocked region
         says it cannot stay; the ghost says where it will go instead. Both are
         true and both are on screen, and as the piece is carried off the block
         the blocked shading turns off under it while the same ghost slides along
         to the edge it is now nearest — one continuous statement rather than an
         invalid state that flips to a valid one.

         The magnet stays off here. Pulling a piece a hundred pixels out from
         under a finger that is still holding it is the one thing the magnet must
         never do; the preview says where it is going and the release takes it
         there. */
      if (plan.force) {
        this.lit(g.set, false);
        this.paint(g.set, rec);
        this.ghost(g, plan);
        this.blocked(g.set);
        this.hintAt(rec);
        return;
      }


      /* Range is generous on touch, where there is no cursor to aim with and
         the finger is covering the thing being aimed. */
      /* Beyond DETECT there is nothing to say, so nothing is said. */
      if (plan.d > this.detect()) {
        this.lit(g.set, false); this.ghost(g, null);
        this.blocked(null);
        this.paint(g.set, rec); this.hintAt(rec); return;
      }

      /* INSIDE DETECT BUT OUTSIDE THE MAGNET: the ghost is up and the piece is
         still entirely yours. This is the stretch that did not exist before —
         you can see where it will go a good two studs before you feel it. */
      const RANGE = this.range();
      if (plan.d > RANGE) {
        this.lit(g.set, false);
        this.paint(g.set, rec);
        this.ghost(g, plan);
        this.blocked(null);
        this.hintAt(rec);
        return;
      }

      /* HOW HARD THE MAGNET PULLS.

         The first tuning was 0.62 at zero distance on a superlinear curve, and
         it was too polite to feel like anything: by the time the pull was
         strong enough to notice you were already close enough that you would
         have hit the target anyway. The effect only exists in the middle of
         the approach, and there was nothing there.

         Now: 0.97 at contact on a SUBlinear curve, so the force arrives early
         and keeps climbing. At half the range the piece already sits 54% of the
         way over; at a fifth of it, 80%; at contact it is effectively locked
         while still in your hand. Range went 1.7 studs -> 2.7 as well, so it
         starts reaching from about two and a half studs out rather than one and
         a half. That middle stretch — plainly being pulled, not yet committed —
         is the whole sensation. */
      const t = 1 - plan.d / RANGE;
      const k = 0.97 * Math.pow(t, 0.85);
      const ox = (plan.tx - this.px(g.set[0])) * k;
      const oy = (plan.ty - this.py(g.set[0])) * k;
      g.set.forEach((r) => { r.it.x += ox; r.it.y += oy; });
      this.lit(g.set, plan.d <= this.U * (this.touch ? 2.2 : 1.7));
      this.paint(g.set, rec);
      /* AFTER the pull, not before: the ghost is drawn from the plan and the
         plan is not a function of where the magnet has just put the piece, so
         the preview stands still at the landing while the piece is drawn into
         it. Two different things saying two different true things. */
      this.ghost(g, plan);
      this.blocked(null);
      this.hintAt(rec);
      if (this.debug) this.debugDraw();
    },

    /* the followers are written straight to the DOM; Drag.apply covers the lead */
    paint(set, lead) { set.forEach((r) => { if (r !== lead) Drag.apply(r.it); }); },

    /* The only feedback there is: a shade more shadow once the piece is inside
       the threshold, so the commit is legible before you let go. No outline,
       no ghost, no connection line. */
    lit(set, on) { set.forEach((r) => r.it.node.classList.toggle('is-near', on)); },

    /* CANNOT STAY HERE — SAID ON THE BRICK, NOT ON THE HERO.

       The whole of the blocked state, and it is deliberately one class on the
       piece in your hand rather than anything drawn around the thing it is over.
       A rule about where a brick may go is a fact about the brick; the sentence
       underneath it is not participating and should not light up, outline
       itself, or acknowledge the drag in any way.

       Held as its own field so the class is only ever written when it changes.
       This runs on every pointer event and a `classList.toggle` per member per
       event is a style invalidation per member per event, for a state that
       changes perhaps twice in a gesture. */
    blocked(set) {
      const now = set && set.length ? set : null;
      if (now === this.blockSet) return;
      if (this.blockSet) this.blockSet.forEach((r) => r.it.node.classList.remove('is-block'));
      this.blockSet = now;
      if (now) now.forEach((r) => r.it.node.classList.add('is-block'));
    },

    drop(rec) {
      const g = rec.gest;
      rec.gest = null;
      if (!g) return false;
      const before = this.before;
      this.before = null;
      this.lit(g.set, false);
      this.ghost(g, null);
      g.ghost = null;

      const plan = g.plan;
      /* WHAT THE GHOST PROMISED. The commit test used to be a number of its
         own — tighter than the one that draws the preview — so there was a
         band where the piece was visibly previewed into a join and still fell
         loose when you let go. Two thresholds meant two answers to one
         question. There is one now: if a ghost is on screen, releasing puts
         the piece exactly where the ghost is, and if there is no ghost nothing
         happens at all. The preview IS the promise. */
      if (plan && (plan.force || plan.d <= this.detect())) {
        const from = g.set.map((r) => ({ r, x: r.it.x, y: r.it.y }));
        this.weld(g.set, plan);
        if (this.wallSettle(g.set)) {
          const to = g.set.map((r) => ({ x: r.it.x, y: r.it.y }));
          this.animate(from, to);
          Sound.voice({ freq: 540, gain: 0.038, dur: 0.055, bright: 3000, drop: 1.5, noise: 0.35 });
          Sound.voice({ freq: 190, gain: 0.03, dur: 0.09, bright: 1200, drop: 0.5, noise: 0.5 });
        } else {
          /* NOWHERE LEGAL TO GO. Put it back where it was picked up. This is the
             one branch that admits defeat and it is the correct behaviour rather
             than a fallback: a release that cannot be resolved into a lawful
             position is an invalid release, and the piece was somewhere lawful a
             moment ago. `before` is the gesture's own snapshot, so this also
             restores whatever the drag had already dislodged. */
          this.restore(before);
          /* eslint-disable-next-line no-console */
          if (this.debug) console.warn('[brk] release had nowhere legal to go; put back');
          Sound.voice({ freq: 210, gain: 0.03, dur: 0.07, bright: 900, drop: 0.9, noise: 0.7 });
          this.endHold(rec);
          return true;
        }
      }

      this.endHold(rec);
      /* THE AUDIT. Only ever on with `?brkdebug`, and it watches the one
         invariant that is invisible when it breaks: nothing this GESTURE placed
         may be left on hero content. Deliberately scoped to the group that was
         just put down — a brick the user buried by dragging the headline over it
         is not this system's doing and is not something to shout about. */
      if (this.debug) {
        const g2 = g.set[0] && g.set[0].g;
        const bad = ((g2 && g2.members) || g.set).filter((r) => this.inWall([r]));
        if (bad.length) {
          /* eslint-disable-next-line no-console */
          console.warn('[brk] PLACED ON THE HERO:',
            bad.map((r) => `${this.recs.indexOf(r)}:${r.kind}`).join(', '),
            '| plan', plan && (plan.g.wall ? `wall/${plan.side}` : 'brick'));
        }
      }
      const after = this.snapshot();
      History.push(() => this.restore(before), 'brick', () => this.restore(after));
      return true;                       // one entry for the whole gesture
    },

    /* THE GUARANTEE, CHECKED RATHER THAN ARGUED.

       Everything upstream of this is designed so a piece cannot come to rest on
       hero content: the sweep refuses those landings, and `wallOut` pushes out
       of the union of the blocks. Both of those are arguments about geometry,
       and geometry has corners — a welded structure carried by one brick, a
       piece taller than the room beside a block, a canvas with nothing on the
       side the piece wanted. In testing it was a five-stud bar welded to the
       piece being dragged: the bar was three studs away from the brick under the
       cursor, so it went where the cursor went, and it went onto the sentence.

       So the invariant is not only reasoned about, it is TESTED — once, at the
       only instant it has to hold, after the placement and before the settle. If
       a cell is still on the hero the piece is pushed out again from where it
       actually ended up, which is a different and better-informed question than
       the one asked mid-drag. Two attempts, because each is strictly outward and
       two is enough for any arrangement of five blocks; and if it still cannot
       be resolved the caller puts the piece back where it was picked up.

       This is the line that makes "a brick can never be left on the hero" a fact
       about the program rather than a property of its cleverness. */
    wallSettle(set) {
      if (!this.wallsNow().length || !set.length) return true;
      /* The group as it is NOW, which after a weld is not the list that was
         handed in — everything the placement moved has to be tested, including
         the structure the piece has just joined. */
      const all = () => (set[0].g && set[0].g.members.length ? set[0].g.members : set);
      for (let i = 0; i < 2; i += 1) {
        if (!this.inWall(all())) return true;
        const p = this.wallOut(all());
        if (!p) return true;
        this.weld(all(), p);
      }
      return !this.inWall(all());
    },

    /* --- welding ---------------------------------------------------------- */
    weld(set, plan) {
      this.dirty();
      const U = this.U, a = set[0];
      const src = a.g, target = plan.g;

      /* THE WHOLE GROUP, NOT THE LIST THAT WAS PASSED IN.

         For a single gesture these are the same thing — `set` is a copy of the
         group's members taken at grab. They stop being the same the moment this
         function is called TWICE in one release, which is exactly what the
         safety net above does: the first call merges the held piece into some
         other structure, so `a.g` is now the bigger group, and the second call
         shifting only the original `set` leaves the newcomers' lattice
         coordinates unshifted while re-placing them from that lattice against a
         new origin. They teleport. That is the four stray cells the blocked-drag
         stress test found sitting on the headline on a 1440 screen, and it is a
         bug the single-call path could never have shown.

         Shifting the group is also the honest statement of the rule: seating one
         brick of a structure carries the structure. */
      const moving = src.members;
      const dgx = plan.cx - a.gx, dgy = plan.cy - a.gy;
      moving.forEach((r) => { r.gx += dgx; r.gy += dgy; });

      /* SEATED AGAINST THE TYPE, NOT WELDED TO IT. The block has no members to
         join and it is not something you can later pull a piece out of, so
         there is nothing to merge — the piece keeps its own group and simply
         adopts the block's lattice. That last part is the whole point of doing
         it this way rather than just clamping a position: the next piece
         brought to the same edge lands on the same grid, so two bricks seated
         along the headline are square to each other as well as to it, and can
         then weld to one another normally. */
      if (target.wall) {
        src.members.forEach((r) => {
          this.anchorTo(r, plan.ox + r.gx * U, plan.oy + r.gy * U);
          const aim = (((r.rot || 0) % 4) + 4) % 4 * 90;
          r.trued = true; r.aim = aim;
          if (Math.abs(r.it.rest - aim) > 0.01) { r.it.rest = aim; Drag.apply(r.it); }
        });
        return;
      }

      if (src !== target) {
        src.members.forEach((r) => { target.members.push(r); r.g = target; });
        const i = this.groups.indexOf(src);
        if (i >= 0) this.groups.splice(i, 1);
      }
      /* Re-place every member from the lattice, not just the ones that moved.
         Float error accumulated over a dozen drags is what eventually leaves a
         structure a third of a pixel out of true. */
      target.members.forEach((r) => {
        this.anchorTo(r, plan.ox + r.gx * U, plan.oy + r.gy * U);
        /* A piece can still arrive at a join wearing an angle the lattice does
           not believe in — one that was never picked up, so was never squared,
           and is sitting at whatever the load left it at. Coming true is part
           of the click; the 150ms transform transition on `.drg` does it.

           `rot * 90` rather than 0, because a piece the user turned has a
           quarter turn the footprint depends on, and zeroing the angle here
           would leave the picture upright and its cells sideways. */
        const aim = (((r.rot || 0) % 4) + 4) % 4 * 90;
        r.trued = true; r.aim = aim;
        if (Math.abs(r.it.rest - aim) > 0.01) { r.it.rest = aim; Drag.apply(r.it); }
      });
    },

    /* Take a piece out of its structure, in place. The remainder may fall into
       two pieces — pull the middle brick out of a row of three — so what is
       left is re-tested for connectivity and split if it has come apart. */
    pop(rec, silent) {
      this.dirty();
      const g = rec.g;
      if (!g || g.members.length < 2) return false;
      g.members.splice(g.members.indexOf(rec), 1);
      const ng = { members: [rec] };
      rec.g = ng; rec.gx = 0; rec.gy = 0;
      this.groups.push(ng);
      this.resplit(g);
      if (!silent) rec.it.node.classList.add('is-pop');
      setTimeout(() => rec.it.node.classList.remove('is-pop'), 240);
      return true;
    },

    /* DELETE. Taking the node out of the DOM is not enough: `plan()` reads
       `this.groups`, so a deleted brick left in there is a connection point
       that is still live and no longer visible — the next piece dragged past
       where it used to be would lock onto nothing. It has to leave the model,
       not just the page.

       Drag's delete pushes its own `reattach` undo entry, so `remember` is the
       other half of the same round trip: the piece comes back loose, wherever
       it was, and is immediately connectable again. */
    forget(rec) {
      this.dirty();
      const g = rec.g;
      if (g) {
        const i = g.members.indexOf(rec);
        if (i >= 0) g.members.splice(i, 1);
        if (!g.members.length) {
          const k = this.groups.indexOf(g);
          if (k >= 0) this.groups.splice(k, 1);
        } else {
          this.resplit(g);
        }
      }
      rec.g = null;
      const j = this.recs.indexOf(rec);
      if (j >= 0) this.recs.splice(j, 1);
    },

    remember(rec) {
      this.dirty();
      if (rec.g && this.groups.indexOf(rec.g) >= 0) return;
      rec.gx = 0; rec.gy = 0;
      const g = { members: [rec] };
      rec.g = g;
      this.groups.push(g);
      if (this.recs.indexOf(rec) < 0) this.recs.push(rec);
    },

    resplit(g) {
      this.dirty();
      const own = new Map();
      g.members.forEach((r) => this.cells(r).forEach(([c, w]) =>
        own.set(`${r.gx + c},${r.gy + w}`, r)));
      const seen = new Set(), comps = [];
      g.members.forEach((r) => {
        if (seen.has(r)) return;
        const comp = [], stack = [r];
        seen.add(r);
        while (stack.length) {
          const cur = stack.pop();
          comp.push(cur);
          this.cells(cur).forEach(([c, w]) => {
            const x = cur.gx + c, y = cur.gy + w;
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([ax, ay]) => {
              const n = own.get(`${x + ax},${y + ay}`);
              if (n && !seen.has(n)) { seen.add(n); stack.push(n); }
            });
          });
        }
        comps.push(comp);
      });
      if (comps.length < 2) return;
      g.members = comps[0];
      comps.slice(1).forEach((c) => {
        const ng = { members: c };
        c.forEach((r) => { r.g = ng; });
        this.groups.push(ng);
      });
    },

    /* --- the settle -------------------------------------------------------
       Purely cosmetic. The weld has already happened and the model is already
       final by the time this runs, so an interruption cannot leave a structure
       half-joined — the worst case is that the last few pixels are not
       animated. A damped cosine: one small overshoot, then it stops. */
    animate(from, to) {
      /* 200ms and stiffer. The settle is the sound the connection makes; a long
         soft one reads as the piece drifting into place, which is the opposite
         of a part seating in a socket. */
      const t0 = performance.now(), DUR = 200;
      from.forEach((f) => f.r.it.node.classList.add('is-settle'));
      const step = (now) => {
        const t = Math.min(1, (now - t0) / DUR);
        const e = 1 - Math.exp(-8.5 * t) * Math.cos(7.4 * t);
        from.forEach((f, i) => {
          f.r.it.x = f.x + (to[i].x - f.x) * e;
          f.r.it.y = f.y + (to[i].y - f.y) * e;
          Drag.apply(f.r.it);
        });
        if (t < 1) { requestAnimationFrame(step); return; }
        from.forEach((f, i) => {
          f.r.it.x = to[i].x; f.r.it.y = to[i].y;
          Drag.apply(f.r.it);
          f.r.it.node.classList.remove('is-settle');
        });
      };
      requestAnimationFrame(step);
    },

    /* --- undo -------------------------------------------------------------
       A brick gesture can move eight pieces and rewrite which structure each
       one belongs to, and none of that is expressible as "put this one back".
       So the whole brick world is snapshotted before and after — eight objects,
       four numbers each — and undo restores a snapshot. One entry per gesture,
       whatever the gesture did. */
    snapshot() {
      /* The angle is part of the state now. A gesture can include three presses
         of R, and undoing it by position alone would put the piece back where
         it came from still lying the way it ended up — a structure whose cells
         and whose picture disagree, which is the one state the lattice must
         never be left in. */
      return this.recs.map((r) => ({
        r, x: r.it.x, y: r.it.y, gx: r.gx, gy: r.gy, g: this.groups.indexOf(r.g),
        rot: r.rot || 0, rest: r.it.rest, aim: r.aim, trued: !!r.trued,
      }));
    },

    /* A brick that was deleted mid-history is not in `recs`, so it is not in
       the snapshot either and restore() leaves it alone — which is right: its
       existence is Drag's detach/reattach entry to undo, not this one's. */

    restore(snap) {
      this.dirty();
      const by = new Map();
      snap.forEach((e) => {
        e.r.it.x = e.x; e.r.it.y = e.y; e.r.gx = e.gx; e.r.gy = e.gy;
        e.r.rot = e.rot; e.r.aim = e.aim; e.r.trued = e.trued;
        /* the quarter turn and the angle go back together or neither does */
        e.r.sp = (e.r.sp || 0) + 1;          // stop any spring mid-flight
        e.r.it.rest = e.rest;
        e.r.it.node.classList.remove('is-spin');
        Drag.apply(e.r.it);
        if (!by.has(e.g)) by.set(e.g, { members: [] });
        const g = by.get(e.g);
        g.members.push(e.r);
        e.r.g = g;
      });
      this.groups = [...by.values()];
    },

    /* ===================================================================
       THE BUILDS

       A preset is not a picture and not a shortcut — it is an INSTRUCTION TO
       THE CANVAS. Everything below drives the pieces through exactly the path
       a hand drives them through: travel, approach, magnetic pull, snap,
       settle, weld. Nothing here places a brick by assignment; if the manual
       interaction changed tomorrow this would change with it, because it is
       the same three moves in the same order.

       What it adds is only the choreography — who goes when, and from where.
       =================================================================== */

    wait(ms) { return new Promise((r) => setTimeout(r, ms)); },

    /* --- the shelf -------------------------------------------------------
       Not a modal. A second panel the same width-ish as the toolbar, hung off
       its left edge in the same white, the same radius, the same 1px inside
       stroke and the same shadow — so it reads as the toolbar having opened a
       drawer rather than as a dialog having arrived over the canvas. */
    shelf(btn) {
      if (this.sh && this.sh.classList.contains('is-up')) return this.unshelf();
      if (!this.sh) {
        const sh = el('div', {
          class: 'shelf', role: 'menu', 'aria-label': 'LEGO builds',
        });
        Object.keys(PLAN).forEach((k) => {
          const bp = PLAN[k];
          const b = el('button', { class: 'shelf__it', type: 'button', role: 'menuitem' },
            `<span class="shelf__art">${this.thumb(bp)}</span>`
            + `<span class="shelf__lb">${esc(bp.label)}</span>`);
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            b.classList.add('is-press');
            this.unshelf();
            setTimeout(() => b.classList.remove('is-press'), 180);
            this.run(k);
          });
          sh.appendChild(b);
        });
        (Rack.rack || this.host).appendChild(sh);
        this.sh = sh;
        this.shBtn = btn;
        addEventListener('keydown', (e) => { if (e.key === 'Escape') this.unshelf(); });
        document.addEventListener('pointerdown', (e) => {
          if (!this.sh || !this.sh.classList.contains('is-up')) return;
          if (e.target.closest('.shelf, .tool--preset')) return;
          this.unshelf();
        }, true);
      }
      this.sh.classList.add('is-up');
      btn.classList.add('is-on');
      btn.setAttribute('aria-expanded', 'true');
      Sound.voice({ freq: 900, gain: 0.022, dur: 0.03, bright: 4200, drop: 1.1, noise: 0.4 });
    },

    unshelf() {
      if (!this.sh) return;
      this.sh.classList.remove('is-up');
      if (this.shBtn) {
        this.shBtn.classList.remove('is-on');
        this.shBtn.setAttribute('aria-expanded', 'false');
      }
    },

    /* The preview is the build, drawn small. Same cell list, same hues, same
       stud on every cell — so what the thumbnail shows is literally what the
       canvas will assemble, and it cannot drift from it. */
    thumb(bp) {
      const u = 5, pad = 1;
      let W = 0, H = 0;
      bp.parts.forEach((pt) => PIECE[pt.kind].cells.forEach(([c, r]) => {
        W = Math.max(W, pt.gx + c + 1); H = Math.max(H, pt.gy + r + 1);
      }));
      let body = '';
      bp.parts.forEach((pt) => {
        const hue = HUE[pt.c] || pt.c;
        PIECE[pt.kind].cells.forEach(([c, r]) => {
          const x = (pt.gx + c) * u + pad, y = (pt.gy + r) * u + pad;
          body += `<rect x="${x}" y="${y}" width="${u}" height="${u}" fill="${hue}"/>`
            + `<circle cx="${x + u / 2}" cy="${y + u / 2}" r="${u * 0.2}" `
            + `fill="#000" opacity=".16"/>`;
        });
      });
      return `<svg viewBox="0 0 ${W * u + pad * 2} ${H * u + pad * 2}" `
        + `width="${W * u + pad * 2}" height="${H * u + pad * 2}" aria-hidden="true">${body}</svg>`;
    },

    /* --- recruiting ------------------------------------------------------
       In the order the spec demands: a loose compatible piece first, then a
       compatible piece out of an existing structure, and only then a new one
       summoned from off-canvas. Somebody's careful build is the LAST thing
       raided, and a piece taken from one is animated out of it like any other
       traveller rather than vanishing. */
    recruit(bp) {
      const used = new Set();
      const pick = (kind, loose) => {
        let best = null, bd = Infinity;
        this.recs.forEach((r) => {
          if (used.has(r) || r.kind !== kind) return;
          if (loose && r.g.members.length !== 1) return;
          if (!loose && r.g.members.length === 1) return;
          const d = Math.abs(this.px(r)) + Math.abs(this.py(r));
          if (d < bd) { bd = d; best = r; }
        });
        return best;
      };
      return bp.parts.map((pt) => {
        const r = pick(pt.kind, true) || pick(pt.kind, false);
        if (r) used.add(r);
        return { part: pt, rec: r };
      });
    },

    /* A piece that does not exist yet arrives from off the edge nearest to
       where it is needed, so it travels INTO frame rather than appearing in
       it. It is a normal brick from the moment it is made — mk() is the only
       constructor — it simply starts outside the window. */
    spawn(kind, hue, tx, ty) {
      const h = this.host.getBoundingClientRect();
      const side = [
        { x: -140, y: ty },                 /* left  */
        { x: h.width + 90, y: ty },         /* right */
        { x: tx, y: -120 },                 /* top   */
        { x: tx, y: h.height + 90 },        /* below */
      ];
      const near = [tx, h.width - tx, ty, h.height - ty];
      let far = 0;
      near.forEach((v, i) => { if (v > near[far]) far = i; });
      const from = side[far];
      const rec = this.mk(kind, hue, Math.round(from.x), Math.round(from.y));
      rec.spawned = true;
      return rec;
    },

    /* --- one piece's journey --------------------------------------------
       Three movements, and they are the three the hand makes:

         TRAVEL     a curved run to a point one and a bit studs short of the
                    join. Curved because a piece carried across a desk does
                    not travel on a ruled line; the bow is perpendicular to
                    the run and its size and sign vary per piece.
         MAGNET     the last stretch, on an ACCELERATING ease. This is the
                    manual magnet's rising force written as time instead of
                    distance — same shape of motion, same feeling of the
                    piece being taken out of your control near the end.
         SETTLE     the damped cosine `animate()` already uses for a manual
                    snap. Identical, deliberately.  */
    async flyTo(rec, tx, ty, seed) {
      const sx = this.px(rec), sy = this.py(rec);
      const dx = tx - sx, dy = ty - sy;
      const dist = Math.hypot(dx, dy) || 1;
      /* 300-560ms of travel, scaled by how far it has to come. It was up to
         760 and a ten-piece build ran to eight seconds, which crosses the line
         from "it is building itself" to "I am waiting for an animation". */
      const T1 = Math.max(300, Math.min(470, 230 + dist * 0.38));
      const bow = (dist * 0.17) * (seed % 2 ? 1 : -1) * (0.7 + (seed % 5) * 0.12);
      /* the hand-off point: one and a bit studs out, on the line of approach */
      const back = Math.min(dist * 0.5, this.U * 1.25);
      const hx = tx - (dx / dist) * back, hy = ty - (dy / dist) * back;
      const cx = (sx + hx) / 2 - (hy - sy) / dist * bow;
      const cy = (sy + hy) / 2 + (hx - sx) / dist * bow;

      rec.auto = true;
      rec.it.node.classList.add('is-auto', 'is-settle');
      await new Promise((done) => {
        const t0 = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - t0) / T1);
          /* out slowly, along quickly, easing off into the hand-off */
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2.4) / 2;
          const m = 1 - e;
          const x = m * m * sx + 2 * m * e * cx + e * e * hx;
          const y = m * m * sy + 2 * m * e * cy + e * e * hy;
          this.moveTo(rec, x, y);
          if (t < 1) requestAnimationFrame(step); else done();
        };
        requestAnimationFrame(step);
      });

      const mx = this.px(rec), my = this.py(rec);
      await new Promise((done) => {
        const t0 = performance.now(), T2 = 130;
        const step = (now) => {
          const t = Math.min(1, (now - t0) / T2);
          const e = t * t;                        /* accelerating: the pull */
          this.moveTo(rec, mx + (tx - mx) * e, my + (ty - my) * e);
          if (t < 1) requestAnimationFrame(step); else done();
        };
        requestAnimationFrame(step);
      });

      /* THE SETTLE IS NOT AWAITED. It is 150ms of the piece giving under its
         own weight after it has already seated — the join is made, and holding
         the whole queue for it added three quarters of a second to a ten-piece
         build for no visible gain. The next piece starts while this one is
         still ringing, which is what an assembly actually looks like. */
      {
        const t0 = performance.now(), T3 = 150;
        const ox = this.px(rec) - tx, oy = this.py(rec) - ty;
        const step = (now) => {
          const t = Math.min(1, (now - t0) / T3);
          const e = 1 - Math.exp(-8.5 * t) * Math.cos(7.4 * t);
          this.moveTo(rec, tx + ox * (1 - e), ty + oy * (1 - e));
          if (t < 1) { requestAnimationFrame(step); return; }
          this.moveTo(rec, tx, ty);
          rec.auto = false;
          rec.it.node.classList.remove('is-auto', 'is-settle');
        };
        requestAnimationFrame(step);
      }
      Sound.voice({ freq: 520, gain: 0.03, dur: 0.05, bright: 3000, drop: 1.5, noise: 0.35 });
      Sound.voice({ freq: 185, gain: 0.024, dur: 0.08, bright: 1200, drop: 0.5, noise: 0.5 });
    },

    /* take a piece out of whatever it belongs to, without forgetting it */
    unbind(rec) {
      const g = rec.g;
      if (!g) return;
      const i = g.members.indexOf(rec);
      if (i >= 0) g.members.splice(i, 1);
      if (!g.members.length) {
        const k = this.groups.indexOf(g);
        if (k >= 0) this.groups.splice(k, 1);
      } else this.resplit(g);
      rec.g = null;
    },

    /* --- the orchestrator ------------------------------------------------ */
    async run(key) {
      const bp = PLAN[key];
      if (!bp || this.busy || !this.host) return;
      this.busy = true;
      /* A build in progress is a state the page can be asked about — by CSS,
         by a test, by anything. Without it "is it finished?" can only be
         guessed at from whether a piece happens to be mid-flight this instant,
         which is false in every gap between two waves. */
      document.body.dataset.building = key;
      const before = this.snapshot();
      const spawned = [];

      /* WHERE IT GETS BUILT. Roughly where the pieces already are, so they do
         not all have to cross the canvas — but clamped well inside it, and
         kept clear of the intro column in the top left. */
      const h = this.host.getBoundingClientRect();
      let W = 0, H = 0;
      bp.parts.forEach((pt) => PIECE[pt.kind].cells.forEach(([c, r]) => {
        W = Math.max(W, pt.gx + c + 1); H = Math.max(H, pt.gy + r + 1);
      }));
      const bw = W * this.U, bh = H * this.U;
      let cx = 0, cy = 0, n = 0;
      this.recs.forEach((r) => { cx += this.px(r); cy += this.py(r); n += 1; });
      cx = n ? cx / n : h.width * 0.55;
      cy = n ? cy / n : h.height * 0.55;
      const jobs = this.recruit(bp);

      /* AND NOT ON TOP OF SOMETHING ALREADY BUILT. The centroid alone put a
         Diet Coke straight through the middle of a finished Ferrari — both
         structures intact, both unreadable. So the standing structures are
         measured first (minus any piece about to be recruited out of one, which
         is leaving anyway) and the origin walks outward in a small spiral until
         it finds clear canvas. It still starts from where the pieces are, so
         nothing has to cross the whole hero; it just refuses to land on work
         that already exists. */
      const keep = new Set(jobs.map((j) => j.rec).filter(Boolean));
      const taken = [];
      this.groups.forEach((g) => {
        const ms = g.members.filter((r) => !keep.has(r));
        /* EVERY piece that is staying put, not just the ones in structures.
           This said `< 2` and skipped lone bricks, so a build would land
           squarely on top of whichever loose pieces happened to be in the
           way — two bricks occupying the same square, which is the one thing
           a lattice is supposed to make impossible. */
        if (!ms.length) return;
        let L = 1e9, T = 1e9, R = -1e9, B = -1e9;
        ms.forEach((r) => {
          const x = this.ax(r), y = this.ay(r);
          this.cells(r).forEach(([c, w]) => {
            L = Math.min(L, x + c * this.U); T = Math.min(T, y + w * this.U);
            R = Math.max(R, x + (c + 1) * this.U); B = Math.max(B, y + (w + 1) * this.U);
          });
        });
        taken.push({ L, T, R, B });
      });
      /* AND NOT ON THE HERO. As far as this is concerned each block of hero
         content is one more standing structure — measured now, so a build placed
         after the headline has been dragged avoids it where it IS. The origin
         clamp below (past 24% of the width, past 110px down) was doing this job
         by accident at desktop widths, where the column happens to sit in the
         top-left corner it excludes. On a phone the column is at the FOOT of the
         canvas and that clamp says nothing about it at all, so a ten-piece build
         could assemble straight over the sentence. */
      this.wallsNow().forEach((w) => {
        taken.push({ L: w.ox, T: w.oy, R: w.ox + w.nx * this.U, B: w.oy + w.ny * this.U });
      });
      const clear = (x, y) => !taken.some((q) =>
        x < q.R + 26 && q.L - 26 < x + bw && y < q.B + 26 && q.T - 26 < y + bh);
      const fit = (x, y) => [
        Math.round(Math.min(Math.max(x, h.width * 0.24), Math.max(h.width * 0.24, h.width - bw - 80))),
        Math.round(Math.min(Math.max(y, 110), Math.max(110, h.height - bh - 70))),
      ];
      let [ox, oy] = fit(cx - bw / 2, cy - bh / 2);
      if (!clear(ox, oy)) {
        const step = this.U * 3;
        outer:
        for (let ring = 1; ring <= 7; ring += 1) {
          for (const [sx, sy] of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
            const [tx2, ty2] = fit(cx - bw / 2 + sx * ring * step, cy - bh / 2 + sy * ring * step);
            if (clear(tx2, ty2)) { ox = tx2; oy = ty2; break outer; }
          }
        }
      }

      /* IF THE SPIRAL FOUND NOTHING the origin stays where the centroid put it,
         and that is allowed to be on top of another build — two structures
         overlapping is untidy and recoverable, and refusing to build at all
         because the canvas is full would be worse. It is NOT allowed to be on
         hero, so that one constraint is re-applied on its own afterwards:
         straight out the nearest side, the same move a dragged piece makes. Two
         passes, because pushing clear of the headline can push into a tag. */
      for (let pass = 0; pass < 2; pass += 1) {
        this.walls.forEach((w) => {
          const U = this.U;
          const WL = w.ox, WT = w.oy, WR = w.ox + w.nx * U, WB = w.oy + w.ny * U;
          if (!(ox < WR && WL < ox + bw && oy < WB && WT < oy + bh)) return;
          const out = [
            { d: oy + bh - WT, x: ox, y: WT - bh },
            { d: WB - oy, x: ox, y: WB },
            { d: ox + bw - WL, x: WL - bw, y: oy },
            { d: WR - ox, x: WR, y: oy },
          ].sort((p, q) => p.d - q.d)[0];
          ox = Math.round(clamp(out.x, 8, Math.max(8, h.width - bw - 8)));
          oy = Math.round(clamp(out.y, 8, Math.max(8, h.height - bh - 8)));
        });
      }

      /* PHASE 1 — the beat before. Nothing moves, and that is the point: it
         is what turns a build into something that was decided rather than
         something that was always going to happen. */
      await this.wait(210);

      const bg = { members: [] };
      this.groups.push(bg);

      const stages = [...new Set(bp.parts.map((pt) => pt.s))].sort((a, b) => a - b);
      let seed = 0;
      for (const st of stages) {
        const wave = jobs.filter((j) => j.part.s === st);
        await Promise.all(wave.map(async (j, k) => {
          seed += 1;
          const tx = ox + j.part.gx * this.U, ty = oy + j.part.gy * this.U;
          let rec = j.rec;
          if (!rec) { rec = this.spawn(j.part.kind, HUE[j.part.c], tx, ty); spawned.push(rec); }
          /* a piece leaving somebody's structure comes loose first, visibly */
          this.unbind(rec);
          rec.g = bg; bg.members.push(rec); this.dirty();
          rec.gx = j.part.gx; rec.gy = j.part.gy;

          /* IT COMES TRUE ON THE WAY.

             A blueprint is a list of cells, and cells have no angle — every
             placement in one is stated at a quarter turn of zero. A recruited
             piece, though, is whatever the load left lying on the canvas, and
             for most of them that is 40° off true. So the car was being built
             out of straight coordinates and crooked bricks: the lattice was
             right, every piece was in its correct cell, and the thing on
             screen was a heap. Nothing in the flight ever said otherwise
             because nothing in the flight ever touched the angle.

             It turns during the travel rather than on arrival, which is the
             only moment that reads as intent — a part being carried into
             position is a part being lined up. The target is the multiple of
             360 nearest where it currently is, so the longest turn any piece
             makes is a half one, and a piece already true does not move. */
          rec.trued = true;
          rec.rot = 0;
          this.dirty();
          rec.aim = Math.round(rec.it.rest / 360) * 360;
          this.spin(rec);
          Drag.raise(rec.it);
          this.retint(rec, HUE[j.part.c]);
          /* pieces in one wave are independent, so they overlap — staggered
             just enough that they read as separate decisions */
          await this.wait(k * 55);
          await this.flyTo(rec, tx, ty, seed);
        }));
        await this.wait(40);
      }

      /* PHASE FINAL — everything already seated gives once, together, and
         stops. No banner, no tick, no percentage: the object is the message. */
      bg.members.forEach((r) => this.moveTo(r, ox + r.gx * this.U, oy + r.gy * this.U));
      const st0 = performance.now();
      bg.members.forEach((r) => r.it.node.classList.add('is-settle'));
      await new Promise((done) => {
        const step = (now) => {
          const t = Math.min(1, (now - st0) / 200);
          const k = Math.exp(-9 * t) * Math.sin(9 * t) * 1.6;
          bg.members.forEach((r) => this.moveTo(r,
            ox + r.gx * this.U, oy + r.gy * this.U + k));
          if (t < 1) { requestAnimationFrame(step); return; }
          bg.members.forEach((r) => {
            this.moveTo(r, ox + r.gx * this.U, oy + r.gy * this.U);
            r.it.node.classList.remove('is-settle');
          });
          done();
        };
        requestAnimationFrame(step);
      });

      const after = this.snapshot();
      History.push(() => {
        spawned.forEach((r) => Drag.detach(r.it));
        this.restore(before);
      }, 'build', () => {
        spawned.forEach((r) => Drag.reattach(r.it));
        this.restore(after);
      });
      delete document.body.dataset.building;
      this.busy = false;
    },

    /* A smaller window must not put a structure out of reach. Whole groups are
       moved as one so a build is never distorted, and only by the amount it
       actually overhangs — nothing is recentred and nothing is re-laid. */
    reclaim() {
      if (!this.host) return;
      const h = this.host.getBoundingClientRect();
      if (!h.width) return;
      /* The hero reflows on a resize — a different wrap, a different height, a
         different corner of the canvas on a phone — and a snap surface measured
         against where it used to be is worse than none. A resize is the one thing
         that moves these blocks WITHOUT going through Drag.apply, so it is the
         one place the invalidation has to be done by hand. */
      this.Z = this.zone(this.host);
      this.wallStamp = -1;
      if (this.walls.length) this.makeWalls();
      this.groups.forEach((g) => {
        let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
        g.members.forEach((r) => {
          const q = r.it.node.getBoundingClientRect();
          L = Math.min(L, q.left); T = Math.min(T, q.top);
          R = Math.max(R, q.right); B = Math.max(B, q.bottom);
        });
        if (!isFinite(L)) return;
        const k = Math.min(Drag.KEEP, (R - L) * 0.9, (B - T) * 0.9);
        let dx = 0, dy = 0;
        if (R < h.left + k) dx = (h.left + k) - R;
        else if (L > h.right - k) dx = (h.right - k) - L;
        if (B < h.top + k) dy = (h.top + k) - B;
        else if (T > h.bottom - k) dy = (h.bottom - k) - T;
        if (!dx && !dy) return;
        g.members.forEach((r) => { r.it.x += dx; r.it.y += dy; Drag.apply(r.it); });
      });
    },
  };

  /* ================================================== 5c3. tool ghost === */

  /* The cursor-attached preview. One element, retargeted per tool, following
     the pointer with a ~70ms time constant so it trails rather than snaps.
     Its tilt comes from pointer velocity, which is what makes it feel like a
     physical thing being carried. */
  const Ghost = {
    x: 0, y: 0, vx: 0, kind: 'none',
    lx: 0, ly: 0,           // the last point written, in the shell's space
    SMOOTH: 0.07,           // seconds — the lag the spec asks for
    MAX_TILT: 2,            // degrees

    init() {
      this.el = el('div', { class: 'ghost', 'aria-hidden': 'true' });
      this.inner = el('div', { class: 'ghost__inner' });
      this.el.appendChild(this.inner);
      App.mount(this.el);

      /* THE ONE POINTER, in the coordinates the browser reported it in. Nothing
         is converted here: this is the raw truth, and each consumer converts
         into its own space at the moment it needs to. */
      addEventListener('pointermove', (e) => {
        Pointer.x = e.clientX;
        Pointer.y = e.clientY;
        Pointer.seen = true;
        /* AND THE LOOP HAS TO BE RUNNING TO ACT ON IT. This listener only ever
           recorded the position; the frame loop sleeps when nothing is
           animating, so with a tool armed and the page at rest the preview
           simply stopped following the cursor until something else — a scroll,
           a resize — happened to wake it. `wake()` is an integer store and an
           early return when it is already live, so this is free on the hot
           path and only costs a frame loop while a preview is actually up. */
        if (this.kind !== 'none') wakeLoop();
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

    /* THE SPRING RUNS IN VIEWPORT SPACE, THE ELEMENT LIVES IN THE SHELL'S.

       `this.x/y` chase `Pointer` in the coordinates the pointer was reported in,
       and the conversion happens here, once, at the moment the transform is
       written. That ordering is deliberate. Smoothing in local coordinates would
       make the shell's own 600ms slide look like pointer movement — the ghost
       would lag several hundred pixels behind the cursor for the length of the
       menu animation and then catch up, which is precisely the artefact this is
       fixing rather than a nicer version of it.

       Returns whether the element actually moved, so the frame loop can stay
       awake while the shell is travelling under a stationary cursor. */
    apply() {
      const tilt = clamp(this.vx * 0.06, -this.MAX_TILT, this.MAX_TILT);
      const p = Space.local(this.x, this.y, App.hud);
      const moved = Math.abs(p.x - this.lx) > 0.05 || Math.abs(p.y - this.ly) > 0.05;
      this.lx = p.x; this.ly = p.y;
      this.el.style.transform =
        `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      return moved;
    },

    tick(dt) {
      if (this.kind === 'none' || !Pointer.seen) return false;
      /* exponential smoothing, framerate independent */
      const k = 1 - Math.exp(-Math.min(dt, 1 / 30) / this.SMOOTH);
      const dx = (Pointer.x - this.x) * k;
      this.x += dx;
      this.y += (Pointer.y - this.y) * k;
      this.vx = this.vx * 0.82 + dx * 0.18 * 60;
      const shifted = this.apply();
      return shifted
          || Math.abs(Pointer.x - this.x) > 0.15 || Math.abs(Pointer.y - this.y) > 0.15
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
        ? host.getBoundingClientRect().top + App.y()
        : 0;
    },

    init() {
      const mk = (cls) => {
        const c = el('canvas', { class: `ink ${cls}`, 'aria-hidden': 'true' });
        App.mount(c);
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
      this.ox = 0; this.oy = 0; this.ok = 1;
      const anchor = () => {
        const s = Canvas.surface;
        const r = s && s.getBoundingClientRect ? s.getBoundingClientRect() : null;
        this.ox = r ? (r.left || 0) : 0;
        this.oy = r ? (r.top || 0) : 0;
        /* AND THE SCALE, taken with the origin and for the same reason. A
           stroke is stored in the surface's own pixels; the pointer arrives in
           the screen's. Subtracting the origin without dividing by the scale
           drew a stroke that shrank toward the canvas's top-left corner —
           straight lines stayed straight, so it read as the pen being offset
           rather than as the geometry being wrong. */
        this.ok = r && r.width && s.offsetWidth ? r.width / s.offsetWidth : Space.k();
      };
      const px2 = (e) => (e.clientX - this.ox) / this.ok;
      const py2 = (e) => (e.clientY - this.oy) / this.ok + this.offset();

      const down = (e) => {
        if (Rack.tool !== 'marker') return;
        /* Only a primary press draws, and only from a mouse or a stylus. A finger
           is left to the page so touch scrolling still works, which is how FigJam
           behaves. */
        if (e.button !== 0 && e.button !== undefined) return;
        const t = e.target;
        /* UI ONLY. `.drg` used to be in this list, and it is the reason a
           stroke could not be STARTED on top of anything lying on the canvas —
           press on a sticker, or a brick, or the headline, and the pen simply
           did nothing until the pointer found bare paper.

           The guard was never needed. The first line of this handler already
           requires the marker to be the live tool, and Drag's own pointerdown
           returns immediately unless the tool is `select`, so in marker mode a
           `.drg` has no behaviour to protect from a press. All the exclusion
           did was carve object-shaped holes in the drawing surface.

           The rest stay: the toolbar, the lightbox and the drawer rail are
           chrome, and a stroke that begins on a button is a misfire. */
        if (t && t.closest && t.closest('.tools, .lbox, .drawer__rail')) return;
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
      return App.y();
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
            /* The trailing em dash in "2025—" is doing this job today, and it is
               doing it quietly enough that you have to already know what it
               means. `now: true` says it out loud. */
            `<span class="row__name">${esc(r.name)}` +
              (r.now ? '<span class="row__now"><i></i>Now</span>' : '') +
            `</span>` +
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
      App.mount(this.el);
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
      const y = App.y();
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
        const wrap = el('div', { class: 'paper__pg' });
        const img = el('img', {
          src, alt: `${r.title || 'Resume'}, page ${i + 1}`,
          /* the ratio lives on the IMAGE, not on the wrapper. On the wrapper it
             is a definite height, and a clipping box with a definite height in
             a grid whose rows were being squeezed cropped every page halfway
             down. On the image it only reserves space until the bytes land,
             and after that the picture's own height is the page's height. */
          style: `aspect-ratio:${r.ratio || 0.7727}`,
          decoding: 'async', ...(i ? { loading: 'lazy' } : {}),
        });
        wrap.appendChild(img);

        /* THE ANCHORS, LAID BACK OVER THE PICTURE.
           Everything above is a photograph of a page, and a photograph of a
           mailto: is not a mailto:. These are the real links, positioned in
           percentages of the page so they stay put at every size — see the
           `links` note in content.js for where the numbers come from. They are
           transparent: the blue underneath is the PDF's own. */
        (r.links && r.links[i] || []).forEach(([href, x, y, w, h]) => {
          const ext = /^https?:/i.test(href);
          wrap.appendChild(el('a', {
            class: 'paper__lnk',
            href,
            style: `left:${x}%;top:${y}%;width:${w}%;height:${h}%`,
            ...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
            /* the page image carries no text, so the link has no accessible
               name of its own — the address is the only honest one there is */
            'aria-label': href.replace(/^mailto:|^tel:|^https?:\/\//i, ''),
          }));
        });

        scroll.appendChild(wrap);
      });
      win.appendChild(scroll);

      this.el = el('div', { class: 'paper', hidden: '' });
      this.el.appendChild(el('div', { class: 'paper__veil' }));
      this.el.appendChild(win);
      App.mount(this.el);

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
      this.keep = App.y();

      /* PINNED, AND THE SCROLLBAR'S WIDTH GIVEN BACK.
         Taking the page out of flow removes the scrollbar with it, and on a
         desktop that is 15px of the layout disappearing — the whole page slides
         sideways behind the viewer, which you see at the edges. The padding
         puts back exactly what the scrollbar was taking. */
      const bar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.top = `-${this.keep}px`;
      if (bar > 0) document.body.style.paddingRight = `${bar}px`;
      App.lock(true);

      this.el.hidden = false;
      requestAnimationFrame(() => this.el.classList.add('is-up'));
      setTimeout(() => this.x && this.x.focus({ preventScroll: true }), 240);
      Sound.chime();
    },

    close() {
      if (!this.open_) return;
      this.open_ = false;
      this.el.classList.remove('is-up');
      App.lock(false);
      document.body.style.top = '';
      document.body.style.paddingRight = '';
      App.to(this.keep);
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
         The dock and the deck's handle are in the list because they read the
         same --end backwards: the dock leaves the phone's corner as the slider
         and the mute arrive in it, and the handle leaves the desktop's edge as
         the footer's own Pages column comes into view. */
      this.collect();
      this.last = -1;
      this.lastEnd = -1;
      this.measure();
    },

    /* Re-runnable, because one of these is built after this module starts: the
       deck mounts its handle later and calls back here. A pod missed at boot
       simply never receives --end and never leaves. */
    collect() { this.pods = $$('.controls, .mute, .tools, .tab-menu'); },

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
        /* The shell's own frame reads this too, and fades out as the paper
           lifts — at the footer the only edge on screen should be the sheet's.
           Written on the two layers that draw the frame rather than on the root,
           for the reason in the comment above. */
        if (App.app) App.app.style.setProperty('--sheet-lift', lift);
        if (App.hud) App.hud.style.setProperty('--sheet-lift', lift);
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

  /* ==================================================== 2d. the peek ======
     THE UNDERLINED WORDS IN THE CLOSING BLOCK, AND WHAT IS BEHIND THEM.

     ONE CARD, NOT FIVE. It is built once and re-pointed, which is what makes
     moving from one word to the next a change of contents rather than a card
     dying and another being born. Two cards would flicker at the handover no
     matter how the timings were tuned, because there is a frame where both are
     mid-opacity and you can see through one to the other.

     THE MOTION IS A SPRING, INTEGRATED IN THE PAGE'S OWN FRAME LOOP, not a CSS
     transition. A transition re-targets by restarting: move the cursor and the
     card eases from wherever it is to wherever the pointer now is, with its
     velocity thrown away at every re-target, which reads as stuttering. A
     spring keeps its velocity, so a continuous cursor produces continuous
     motion and the card trails rather than chases.

       k = 210, d = 29 against unit mass. Damping ratio d / 2√k = 1.0006, which
       is critically damped to three places: it arrives and stops, it does not
       overshoot, and a card that bounces past the word it belongs to reads as a
       toy. The time constant that falls out is ~69ms, so at a normal cursor
       speed of around 300px/s the card sits about 20px behind the pointer —
       which is the trail, and it is a consequence of the physics rather than a
       number typed in somewhere.

     Everything the loop writes is one transform and one opacity, on one
     element, once a frame. */
  const Peek = {
    /* 120ms. Long enough that crossing a word on the way somewhere else does
       not summon anything; short enough that a deliberate hover feels answered
       rather than waited on. */
    DELAY: 120,
    K: 210,
    D: 29,

    init() {
      this.words = $$('mark.rule[data-peek]');
      if (!this.words.length || !S.peek) return;

      this.el = el('div', { class: 'peek', 'aria-hidden': 'true' });
      /* PARKED OFF THE PAGE UNTIL IT IS FIRST WANTED. `tick()` returns before
         writing a transform while the card is closed, so a card that has never
         been opened is still sitting at its untransformed position — the very
         top-left of the viewport, over the hero. Invisible, so nothing showed
         it; the CSS keeps it from taking pointer events now, and this keeps it
         from being a 336x250 rectangle parked on the composition at all. The
         first `point()` re-seats it at the word before it fades in. */
      this.el.style.transform = 'translate3d(-9999px, -9999px, 0)';
      this.el.innerHTML =
        '<div class="peek__in">' +
          '<div class="peek__media"><img alt="" decoding="async" loading="lazy"></div>' +
          '<div class="peek__title"></div>' +
          '<p class="peek__body"></p>' +
          '<div class="peek__hint"></div>' +
        '</div>';
      App.mount(this.el);

      this.media = $('.peek__media', this.el);
      this.img = $('img', this.el);
      this.titleEl = $('.peek__title', this.el);
      this.bodyEl = $('.peek__body', this.el);
      this.hintEl = $('.peek__hint', this.el);
      this.inner = $('.peek__in', this.el);

      this.x = this.y = 0; this.vx = this.vy = 0;
      this.tx = this.ty = 0;
      this.px = this.py = 0;          // pointer, for the inner parallax
      this.amt = 0; this.amtTo = 0;   // 0 hidden, 1 shown
      this.key = null;
      this.t0 = 0;

      /* Coarse pointers never hover. There, the same content opens as a sheet
         off the bottom of the screen and closes on the next tap outside it. */
      this.touch = matchMedia('(hover: none), (pointer: coarse)').matches;

      this.words.forEach((w) => {
        const def = S.peek[w.dataset.peek];
        if (!def) return;
        w.classList.add('is-peek');
        if (this.touch) {
          w.addEventListener('click', (e) => {
            if (this.key === w.dataset.peek && this.amtTo) { this.hide(); return; }
            e.preventDefault();
            this.point(w, true);
          });
        } else {
          w.addEventListener('pointerenter', () => this.arm(w));
          w.addEventListener('pointerleave', () => this.disarm());
          w.addEventListener('click', () => this.act(def));
        }
      });

      if (this.touch) {
        addEventListener('pointerdown', (e) => {
          if (this.amtTo && !hit(e, '.peek, mark.rule[data-peek]')) this.hide();
        }, true);
      } else {
        /* One listener on the document rather than one per word: the card
           follows the pointer wherever it is, including across the gaps between
           words, and a listener per word would drop it in those gaps. */
        addEventListener('pointermove', (e) => {
          this.px = e.clientX; this.py = e.clientY;
          if (this.amtTo) this.retarget();
        }, { passive: true });
      }
    },

    /* hover began — start the clock, do not show anything yet */
    arm(w) {
      clearTimeout(this.timer);
      const wait = this.amtTo ? 0 : this.DELAY;   // already open: switch at once
      this.timer = setTimeout(() => this.point(w, false), wait);
    },

    disarm() {
      clearTimeout(this.timer);
      /* A short grace before it goes. Without it, crossing the two-pixel gap
         between `email` and the full stop after it flickers the card off and
         straight back on. */
      this.timer = setTimeout(() => this.hide(), 90);
    },

    point(w, anchored) {
      const key = w.dataset.peek;
      const def = S.peek[key];
      if (!def) return;
      clearTimeout(this.timer);

      if (key !== this.key) {
        this.key = key;
        this.fill(def);
      }
      this.def = def;
      this.el.dataset.tone = def.tone === 'dark' ? 'dark' : 'light';

      const first = !this.amtTo;
      this.amtTo = 1;
      this.anchor = anchored ? w.getBoundingClientRect() : null;

      /* FIRST APPEARANCE STARTS AT THE WORD, not wherever the card was left. A
         spring told to travel from the last word across the paragraph would
         fly, and the entry has to read as the card rising out of this word. */
      if (first) {
        const r = w.getBoundingClientRect();
        this.x = r.left + r.width / 2;
        this.y = r.top;
        this.vx = this.vy = 0;
        this.t0 = performance.now();
      }
      this.retarget();
      this.el.removeAttribute('aria-hidden');
      wakeLoop();
    },

    /* Where the card wants to be: above the pointer, or above the word when a
       finger opened it. Kept inside the viewport, because a card half off the
       right edge is worse than one that is not quite where the cursor is. */
    retarget() {
      const b = this.el.getBoundingClientRect();
      const w = b.width || 300, h = b.height || 180;
      if (this.touch) { this.tx = innerWidth / 2; this.ty = innerHeight - 24; return; }
      const pad = 14;
      this.tx = clamp(this.px, w / 2 + pad, innerWidth - w / 2 - pad);
      /* above the pointer if there is room, below it if there is not */
      const above = this.py - 22;
      this.ty = above - h < pad ? this.py + h + 34 : above;
    },

    hide() {
      clearTimeout(this.timer);
      this.amtTo = 0;
      this.el.setAttribute('aria-hidden', 'true');
      wakeLoop();
    },

    fill(def) {
      const hasMedia = !!def.media;
      this.media.hidden = !hasMedia;
      if (hasMedia && this.img.getAttribute('src') !== def.media) this.img.src = def.media;
      this.titleEl.textContent = def.title || '';
      const body = def.action === 'copy'
        ? (def.value || S.person.copyEmail || S.person.email)
        : (def.body || '');
      this.bodyEl.textContent = body;
      this.bodyEl.hidden = !body;
      this.hintEl.textContent = def.hint || '';
      this.hintEl.hidden = !def.hint;
      /* the contents changed under a card that is staying put — a short
         crossfade on the inner block, and nothing on the card itself */
      this.inner.classList.remove('is-xf');
      void this.inner.offsetWidth;
      this.inner.classList.add('is-xf');
    },

    async act(def) {
      if (def.action !== 'copy') return;
      const v = def.value || S.person.copyEmail || S.person.email;
      try { await navigator.clipboard.writeText(v); } catch { return; }
      this.hintEl.textContent = '✓ Copied';
      Sound.chime && Sound.chime();
      clearTimeout(this.copyT);
      this.copyT = setTimeout(() => { this.hintEl.textContent = def.hint || ''; }, 1600);
    },

    /* One write per frame, and only while there is something to write. */
    tick(dt) {
      if (!this.el) return false;

      const before = this.amt;
      this.amt += (this.amtTo - this.amt) * Math.min(1, dt * (this.amtTo ? 13 : 17));
      if (Math.abs(this.amtTo - this.amt) < 0.002) this.amt = this.amtTo;

      if (!this.amt && !before) return false;

      if (this.touch) {
        this.x = this.tx; this.y = this.ty;
      } else {
        /* the spring — see the note above the module for the two constants */
        const ax = (this.tx - this.x) * this.K - this.vx * this.D;
        const ay = (this.ty - this.y) * this.K - this.vy * this.D;
        this.vx += ax * dt; this.vy += ay * dt;
        this.x += this.vx * dt; this.y += this.vy * dt;
      }

      /* Idle float. Amplitude under a pixel and a half — at rest you should not
         be able to say whether it is moving, only that it is not dead. */
      const t = (performance.now() - this.t0) / 1000;
      const bob = Math.sin(t * 1.5) * 1.4;

      const e = this.amt;
      const ease = e * e * (3 - 2 * e);                 // smoothstep
      const rise = (1 - ease) * 12;
      const scale = 0.955 + ease * 0.045;

      this.el.style.transform =
        `translate3d(${(this.x).toFixed(1)}px, ${(this.y + bob + rise).toFixed(1)}px, 0)` +
        ` translate(-50%, -100%) scale(${scale.toFixed(4)})`;
      this.el.style.opacity = ease.toFixed(3);

      /* Parallax, and it is deliberately tiny: the media leans against the
         pointer's offset from the card's own centre, six pixels at the edge of
         the card and nothing at the middle. */
      if (!this.touch && this.media && !this.media.hidden) {
        const dx = clamp((this.px - this.x) / 160, -1, 1);
        const dy = clamp((this.py - this.y + 60) / 160, -1, 1);
        this.img.style.transform =
          `translate3d(${(dx * -6).toFixed(2)}px, ${(dy * -4).toFixed(2)}px, 0) scale(1.08)`;
      }

      /* keep the loop awake while the spring is still travelling */
      const moving = Math.abs(this.vx) > 1 || Math.abs(this.vy) > 1;
      return this.amt !== this.amtTo || moving || this.amt > 0;
    },
  };

  /* ======================================================== boot ======== */

  function boot() {
    /* First, before anything mounts: the three layers exist, and every module
       after this lands in one of them rather than on the body. */
    App.init();
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
    /* last, so the handle mounts above the furniture it sits beside */
    Deck.init();
    Peek.init();
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
      const pk = Peek.tick(dt);
      const dk = Deck.tick(dt);
      Sheet.tick(vh);

      if (a || b || g || dr || pr || gh || pk || dk) idleFrames = 0;
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
    App.onScroll(wake);
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
    /* Bricks: the lattice is the thing worth asserting on and it is not in the
       DOM. A harness needs to know which pieces believe they are in the same
       structure and which cells each one occupies — from the outside a welded
       row and a row of pieces that merely look adjacent are identical. */
    window.__bricks = () => Bricks.recs.map((r) => ({
      kind: r.kind,
      g: Bricks.groups.indexOf(r.g),
      gx: r.gx, gy: r.gy, rot: ((r.rot || 0) % 4 + 4) % 4,
      rest: +r.it.rest.toFixed(2),
      cells: Bricks.cells(r),
      ax: +Bricks.ax(r).toFixed(1), ay: +Bricks.ay(r).toFixed(1),
    }));
    window.__brickU = () => Bricks.U;
    window.__brkEj = () => Bricks._ej || null;
    /* WHAT THE GESTURE CURRENTLY INTENDS, as data.

       The counterpart to taking the overlay away: the state a test used to read
       off a coloured rectangle is still readable, it is just not painted on the
       page to be readable. Returns the live plan — what it is aiming at, which
       edge of it, whether the piece is standing somewhere it cannot stay. */
    window.__brkPlan = () => {
      const g = Bricks.held && Bricks.held.gest;
      const p = g && g.plan;
      if (!p) return { target: null, side: null, blocked: false };
      return {
        target: p.g && p.g.wall ? 'hero' : 'brick',
        side: p.g && p.g.wall ? (p.side || Bricks.wallSide(p.g, p, g.set)) : null,
        blocked: !!p.blocked,
        d: +p.d.toFixed(1),
      };
    };
    /* THE HERO'S COLLISION GEOMETRY, FROM THE OUTSIDE.

       The counterpart to `__brickDebug` for the thing that is hardest to see:
       every box the engine currently believes the hero content occupies, freshly
       measured, in the host's coordinates. Drag the headline, call this, and the
       numbers either moved with it or they did not. That is the whole test, and
       it is the one an invisible rectangle cannot fail quietly. */
    window.__brkWalls = () => Bricks.wallsNow().map((w) => ({
      of: w.nodes.map((n) => n.className).join(' + '),
      L: +w.ox.toFixed(1), T: +w.oy.toFixed(1),
      R: +(w.ox + w.nx * Bricks.U).toFixed(1), B: +(w.oy + w.ny * Bricks.U).toFixed(1),
      cells: `${w.nx}x${w.ny}`,
    }));
    /* WHY A PIECE IS NOT SNAPPING, answered from the outside. `plan()` returns
       a landing or null, and null has four different causes that look
       identical on screen. This re-runs the same sweep and reports which one
       it was for a given piece against every other group. */
    window.__brickWhy = (i) => {
      const rec = Bricks.recs[i];
      if (!rec) return null;
      const U = Bricks.U, set = rec.g.members.slice(), a = set[0];
      const REACH = Bricks.range(), SPAN = Math.ceil(REACH / U) + 1;
      const ax = Bricks.ax(a), ay = Bricks.ay(a);
      const mc = [];
      set.forEach((r) => Bricks.cells(r).forEach(([c, w]) =>
        mc.push([r.gx - a.gx + c, r.gy - a.gy + w])));
      const out = [];
      Bricks.groups.forEach((g, gi) => {
        if (g === rec.g || !g.members.length) return;
        const b = g.members[0];
        const ox = Bricks.ax(b) - b.gx * U, oy = Bricks.ay(b) - b.gy * U;
        const gc = Bricks.cellsOf(g);
        const qx = Math.round((ax - ox) / U), qy = Math.round((ay - oy) / U);
        let far = 0, over = 0, loose = 0, ok = 0, near = Infinity;
        for (let dy = -SPAN; dy <= SPAN; dy += 1) {
          for (let dx = -SPAN; dx <= SPAN; dx += 1) {
            const cx = qx + dx, cy = qy + dy;
            const d0 = Math.hypot(ox + cx * U - ax, oy + cy * U - ay);
            near = Math.min(near, d0);
            if (d0 > REACH) { far += 1; continue; }
            let bad = false, touch = false;
            for (let k = 0; k < mc.length; k += 1) {
              const x = cx + mc[k][0], y = cy + mc[k][1];
              if (gc.has(`${x},${y}`)) { bad = true; break; }
              if (!touch && (gc.has(`${x + 1},${y}`) || gc.has(`${x - 1},${y}`)
                || gc.has(`${x},${y + 1}`) || gc.has(`${x},${y - 1}`))) touch = true;
            }
            if (bad) over += 1; else if (!touch) loose += 1; else ok += 1;
          }
        }
        out.push({ g: gi, kinds: g.members.map((m) => m.kind).join('+'),
          nearest: +near.toFixed(1), reach: +REACH.toFixed(1),
          outOfReach: far, blocked: over, notTouching: loose, lawful: ok });
      });
      return { me: rec.kind, reach: +REACH.toFixed(1),
        plan: (() => { const q = Bricks.plan(set, rec.g); return q ? { d: +q.d.toFixed(1), cx: q.cx, cy: q.cy } : null; })(),
        groups: out.filter((o) => o.nearest < 400) };
    };
    window.__brickDebug = (on) => Bricks.debugOn(on !== false);
    /* Place a piece by its ANCHOR, in canvas pixels. The fall is random by
       design, so a harness that wants a known arrangement has to be able to
       state one — every case below TEST 1 depends on two pieces being exactly
       somewhere, and dragging them there with synthetic pointer events makes
       the setup part of what is under test. */
    window.__brickPut = (i, x, y) => {
      const r = Bricks.recs[i];
      if (!r) return null;
      Bricks.anchorTo(r, x, y);
      return { ax: Bricks.ax(r), ay: Bricks.ay(r) };
    };
    window.__brickFind = (kind, n) => Bricks.recs
      .map((r, i) => ({ r, i })).filter((e) => e.r.kind === kind)[n || 0]?.i ?? -1;
    window.__brickZ = () => ({ Z: Bricks.Z, keep: Bricks.keep, KB: Bricks.host ? Bricks.keepBox(Bricks.host.getBoundingClientRect()) : null, h: Bricks.host ? Bricks.host.getBoundingClientRect().height : 0 });
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
