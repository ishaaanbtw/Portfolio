/* =========================================================================
   FURY — the study's own compositions
   -------------------------------------------------------------------------
   Every board from the Fury Figma file ("Untitled", Ju9mNyoaiUD2W0HHMKNhjb),
   rebuilt as markup. The words are live text, the cards, chips, charts,
   diagrams and flows are drawn in CSS, and only the artwork itself — the
   headset, the phones, the characters, the avatars, the VR renders, the
   photographs, the raw research images — comes in as a file, each exported
   on its own from its own Figma layer into assets/img/fury/.

   HOW IT IS WIRED. content.js's Fury study is ordinary sections; each block
   is `{ type: 'raw', key: '<name>' }`, and the `raw` renderer in site.js
   prints `STUDY_HTML[key]` from here. This file is loaded by fury.html only,
   before site.js. Styles live in site.css, section "FURY", all scoped to
   body[data-project="fury"].

   Anything wrapped by Z() opens in the site's lightbox, the same as every
   other study's framed artwork.
   ========================================================================= */
(function () {
  var A = 'assets/img/fury/';
  /* images are versioned too, so a re-exported file is picked up on refresh */
  var IV = '?v=2';

  /* an image that opens in the lightbox */
  function Z(src, alt, w, h, cls) {
    return '<div class="fframe fy-zoom' + (cls ? ' ' + cls : '') + '" data-zoom tabindex="0" role="button" aria-label="Open larger">' +
      '<div class="fframe__in"><img class="shotimg" src="' + A + src + IV + '" alt="' + alt + '" width="' + w + '" height="' + h + '" loading="lazy" decoding="async"></div></div>';
  }
  function img(src, alt, w, h, cls) {
    return '<img class="' + (cls || '') + '" src="' + A + src + '" alt="' + alt + '" width="' + w + '" height="' + h + '" loading="lazy" decoding="async">';
  }
  /* the window every board sits in: three dots and an address pill */
  function win(label, inner, cls) {
    return '<div class="fy-win' + (cls ? ' ' + cls : '') + '">' +
      '<div class="fy-win__in">' + inner + '</div></div>';
  }
  function sticker(t, cls) { return '<span class="fy-sticker' + (cls ? ' ' + cls : '') + '">' + t + '</span>'; }

  /* a pie as a conic gradient; parts are [label, percent, colour] */
  function pie(q, parts) {
    var at = 0, stops = parts.map(function (p) { var s = p[2] + ' ' + at + '% ' + (at + p[1]) + '%'; at += p[1]; return s; }).join(',');
    return '<figure class="fy-chart fy-pie"><figcaption>' + q + '</figcaption><div class="fy-pie__row">' +
      '<div class="fy-pie__disc" style="background:conic-gradient(' + stops + ')" role="img" aria-label="' +
      parts.map(function (p) { return p[0] + ' ' + p[1] + '%'; }).join(', ') + '"></div>' +
      '<ul class="fy-pie__key">' + parts.map(function (p) {
        return '<li><i style="background:' + p[2] + '"></i>' + p[0] + ' <b>' + p[1] + '%</b></li>';
      }).join('') + '</ul></div></figure>';
  }
  /* a 1-to-5 bar chart; vals are [count, percent] */
  function bars(q, vals, lo, hi) {
    var max = Math.max.apply(null, vals.map(function (v) { return v[0]; }));
    return '<figure class="fy-chart fy-bars"><figcaption>' + q + '</figcaption><div class="fy-bars__plot">' +
      vals.map(function (v, i) {
        return '<div class="fy-bars__col"><span class="fy-bars__v">' + v[1] + '%</span>' +
          '<i style="height:' + Math.max(4, (v[0] / max) * 100) + '%"></i><span class="fy-bars__x">' + (i + 1) + '</span></div>';
      }).join('') + '</div><p class="fy-bars__ends"><span>' + lo + '</span><span>' + hi + '</span></p></figure>';
  }

  /* THE ARCHITECTURE, AS A MAP YOU CAN READ BY POINTING. The same mechanics as
     the X0 study's map (site.js `IA`): nodes on a canvas, wires drawn between
     them, and pointing at any screen lights everything it connects to while the
     rest steps back, with what it is made of read out underneath. A tap pins,
     a second tap lets go. Drawn here rather than through `IA` because that one
     lives inside the X0 scene engine; this one is the same idea in Fury's own
     ink: the light window, pink tab pills, the navy check-in.
     The steps are the ones the task flows below this map already state. */
  var FIA = window.FIA = (function () {
    var DW = 188, DH = 44;
    var C = { tk: 0, hm: 240, cm: 480, pf: 720 };
    var D = {
      W: 930, H: 700,
      nodes: [
        { id: 'launch', kind: 'spine', t: 'Launch Screen', x: 371, y: 0, steps: ['Entry', 'Old user: Login', 'New user: Onboarding'] },
        { id: 'login', kind: 'spine', flow: 1, t: 'Login / Signup', m: 'Old user', x: 246, y: 76, steps: ['Old user', 'Login', 'Enter details', 'Confirmation'] },
        { id: 'onboard', kind: 'spine', flow: 1, t: 'Onboarding', m: 'New user', x: 496, y: 76, steps: ['New user', 'On-boarding', 'Enter details', 'Email', 'OTP', 'Confirmation'] },
        { id: 'eval', kind: 'check', flow: 1, t: 'Emotional Evaluation', m: 'Pick · Select · Explain', x: 355, y: 152, w: 220, h: 50,
          steps: ['Pick words that identify your emotions', 'Select from the pool of emotions', 'Explain in detail'] },
        { id: 'ai', kind: 'spine', flow: 1, t: 'Try AI Suggested Strategy', x: 355, y: 234, w: 220, steps: ['Try AI suggested strategies', 'Lands on Home'] },

        { id: 'tk', kind: 'tab', g: 'tk', t: 'Toolkit', x: C.tk, y: 330 },
        { id: 'hm', kind: 'tab', g: 'hm', t: 'Home', x: C.hm, y: 330 },
        { id: 'cm', kind: 'tab', g: 'cm', t: 'Community', x: C.cm, y: 330 },
        { id: 'pf', kind: 'tab', g: 'pf', t: 'Profile', x: C.pf, y: 330 },

        { id: 'env', g: 'tk', t: 'Create your Environment', m: 'Environments · Tune sound', y: 392 },
        { id: 'vr', g: 'tk', flow: 1, t: 'VR Reflections', m: 'Five sessions', vr: 1, y: 448,
          steps: ['Reflection', 'Pick a session: public speaking, criticism, the dark, dating or an interview', 'VR tutorial', 'Walkthrough', 'Customise'] },
        { id: 'mind', g: 'tk', t: 'Mindfulness routines', y: 504 },

        { id: 'analyse', g: 'hm', flow: 1, t: 'Analyse Yourself', m: 'Runs the check-in again', y: 392, ties: ['eval', 'ai'],
          steps: ['Pick words that identify your emotions', 'Select from the pool of emotions', 'Explain in detail', 'Try AI suggested strategies'] },
        { id: 'htk', g: 'hm', t: 'Toolkit', m: 'Shortcut to the Toolkit tab', y: 448, ties: ['tk', 'env', 'vr', 'mind'] },
        { id: 'hj', g: 'hm', t: 'Journal', m: 'Same journal as Profile', y: 504, ties: ['pj'] },
        { id: 'alter', g: 'hm', t: 'Alter Ego', m: 'Daily Streak · Today’s Task', y: 560, h: 52,
          steps: ['Complete daily tasks and therapy', 'Watch your Alter Ego turn green for the right path'] },
        { id: 'res', g: 'hm', t: 'Recommended Resources', m: ['Articles & Videos · Tips & Tricks', 'Coping Strategies'], y: 624, h: 64 },

        { id: 'feed', g: 'cm', t: 'Discussion Feed', y: 392 },
        { id: 'share', g: 'cm', t: 'Share experience', y: 448 },
        { id: 'peer', g: 'cm', t: 'Peer support group', y: 504 },

        { id: 'prog', g: 'pf', t: 'Progress Tracking', y: 392 },
        { id: 'faq', g: 'pf', t: 'FAQ & Contact Us', y: 448 },
        { id: 'pj', g: 'pf', t: 'Journal', m: 'Same journal as Home', y: 504, ties: ['hj'] },
        { id: 'set', g: 'pf', t: 'Settings', y: 560 },
      ],
      edges: [
        { f: 'launch', t: 'login', r: 'tree' }, { f: 'launch', t: 'onboard', r: 'tree' },
        { f: 'login', t: 'eval', r: 'tree' }, { f: 'onboard', t: 'eval', r: 'tree' },
        { f: 'eval', t: 'ai', r: 'tree' },
        { f: 'ai', t: 'hm', r: 'tree', my: 300 },
        { f: 'ai', t: 'tk', r: 'tree', my: 300, soft: 1 }, { f: 'ai', t: 'cm', r: 'tree', my: 300, soft: 1 }, { f: 'ai', t: 'pf', r: 'tree', my: 300, soft: 1 },
      ],
    };
    var TABN = { tk: 'Toolkit', hm: 'Home', cm: 'Community', pf: 'Profile' };
    /* children hang off their tab: x, width and a spine edge are implied */
    D.nodes.forEach(function (n) {
      if (n.g && n.kind !== 'tab') {
        n.x = C[n.g] + 22; n.w = 188;
        D.edges.push({ f: n.g, t: n.id, r: 'spine' });
      }
      if (n.kind === 'tab') { n.w = 124; n.h = 34; }
    });
    var N = {}; D.nodes.forEach(function (n) { N[n.id] = n; });

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function box(n) { var w = n.w || DW, h = n.h || DH; return { x: n.x, y: n.y, w: w, h: h, r: n.x + w, b: n.y + h, cx: n.x + w / 2, cy: n.y + h / 2 }; }
    function route(e) {
      var f = box(N[e.f]), t = box(N[e.t]), pts;
      if (e.r === 'spine') { var x = f.x + 12; pts = [[x, f.b], [x, t.cy], [t.x, t.cy]]; }
      else { var my = e.my != null ? e.my : (f.b + t.y) / 2; pts = [[f.cx, f.b], [f.cx, my], [t.cx, my], [t.cx, t.y]]; }
      return pts.filter(function (q, i) { return i === 0 || q[0] !== pts[i - 1][0] || q[1] !== pts[i - 1][1]; });
    }
    function path(pts) {
      var R = 6, d = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var i = 1; i < pts.length; i++) {
        var x = pts[i][0], y = pts[i][1], nx = pts[i + 1];
        if (!nx) { d += 'L' + x + ' ' + y; break; }
        var px = pts[i - 1][0], py = pts[i - 1][1];
        var r = Math.min(R, Math.hypot(x - px, y - py) / 2, Math.hypot(nx[0] - x, nx[1] - y) / 2);
        d += 'L' + (x - Math.sign(x - px) * r) + ' ' + (y - Math.sign(y - py) * r) +
          'Q' + x + ' ' + y + ' ' + (x + Math.sign(nx[0] - x) * r) + ' ' + (y + Math.sign(nx[1] - y) * r);
      }
      return d;
    }
    function head(pts) {
      var a = pts[pts.length - 1], b = pts[pts.length - 2];
      var dx = Math.sign(a[0] - b[0]), dy = Math.sign(a[1] - b[1]), L = 5, S = 3.2;
      var bx = a[0] - dx * L, by = a[1] - dy * L;
      return 'M' + (bx - dy * S) + ' ' + (by + dx * S) + 'L' + a[0] + ' ' + a[1] + 'L' + (bx + dy * S) + ' ' + (by - dx * S);
    }
    function kids(id) { return D.nodes.filter(function (n) { return n.g === id && n.kind !== 'tab'; }); }
    function read(n) {
      if (n.kind === 'tab') return kids(n.id).map(function (k) { return k.t; }).join(' · ');
      if (n.steps) return n.steps.join(n.flow ? ' → ' : ' · ');
      if (n.m) return [].concat(n.m).join(' · ');
      return 'In the ' + TABN[n.g] + ' tab';
    }
    var VR = '<i class="fia__vr">VR</i>';
    var ARROW = '<svg viewBox="0 0 22 8" aria-hidden="true"><path d="M1 4h19M16.5 1.2 20 4l-3.5 2.8"/></svg>';

    function html() {
      var order = 0;
      var nodes = D.nodes.map(function (n) {
        var b = box(n);
        var meta = n.m ? [].concat(n.m).map(function (l) { return '<span class="fia__m">' + esc(l) + '</span>'; }).join('') : '';
        return '<button type="button" class="fia__n' + (n.kind ? ' fia__n--' + n.kind : '') + '" data-n="' + n.id + '"' +
          ' data-read="' + esc(read(n)) + '"' + (n.ties ? ' data-ties="' + n.ties.join(' ') + '"' : '') +
          ' style="--i:' + (order++) + ';left:' + b.x + 'px;top:' + b.y + 'px;width:' + b.w + 'px;height:' + b.h + 'px">' +
          '<span class="fia__t"><span>' + esc(n.t) + '</span>' + (n.vr ? VR : '') + '</span>' + meta + '</button>';
      }).join('');
      var wires = D.edges.map(function (e) {
        var pts = route(e), o = Math.max(D.nodes.indexOf(N[e.f]), D.nodes.indexOf(N[e.t]));
        return '<g class="fia__e' + (e.soft ? ' fia__e--soft' : '') + '" data-f="' + e.f + '" data-t="' + e.t + '" style="--i:' + o + '">' +
          '<path class="fia__line" pathLength="1" d="' + path(pts) + '"/>' +
          (e.soft ? '' : '<path class="fia__head" d="' + head(pts) + '"/>') + '</g>';
      }).join('');
      var key = '<ul class="fia__key" aria-label="Key">' +
        '<li>' + ARROW + 'Leads to</li>' +
        '<li><svg class="fia__soft" viewBox="0 0 22 8" aria-hidden="true"><path d="M1 4h20"/></svg>Tab bar</li>' +
        '<li><i class="fia__sw"></i>Check-in</li>' +
        '<li>' + VR + 'In the headset</li></ul>';
      var groups = [['Getting in', ['launch', 'login', 'onboard', 'eval', 'ai']]]
        .concat(['tk', 'hm', 'cm', 'pf'].map(function (g) { return [TABN[g], kids(g).map(function (k) { return k.id; })]; }));
      var list = '<ol class="fia__list">' + groups.map(function (g, gi) {
        return '<li><span class="fia__lh' + (gi ? ' is-tab' : '') + '">' + esc(g[0]) + '</span><ul>' + g[1].map(function (id) {
          var n = N[id];
          return '<li class="fia__li' + (n.kind ? ' fia__li--' + n.kind : '') + '"><details><summary><span class="fia__t"><span>' + esc(n.t) + '</span>' + (n.vr ? VR : '') + '</span>' +
            (n.m ? '<span class="fia__m">' + esc([].concat(n.m).join(' · ')) + '</span>' : '') + '</summary>' +
            '<p class="fia__steps">' + esc(read(n)) + '</p></details></li>';
        }).join('') + '</ul></li>';
      }).join('') + '</ol>';
      return '<div class="fia">' +
        '<div class="fia__fit"><div class="fia__size" style="--w:' + D.W + 'px;--h:' + D.H + 'px">' +
          '<div class="fia__canvas" style="width:' + D.W + 'px;height:' + D.H + 'px">' +
            '<svg class="fia__wires" viewBox="0 0 ' + D.W + ' ' + D.H + '" width="' + D.W + '" height="' + D.H + '" aria-hidden="true">' + wires + '</svg>' +
            nodes +
          '</div></div></div>' +
        '<div class="fia__foot"><p class="fia__read" aria-live="polite"><span class="fia__hint">Point at any screen to trace where it leads.</span></p>' + key + '</div>' +
        list + '</div>';
    }

    function wire(host) {
      if (host.dataset.wired) return; host.dataset.wired = '1';
      var fit = host.querySelector('.fia__fit'), size = host.querySelector('.fia__size');
      var canvas = host.querySelector('.fia__canvas'), svg = host.querySelector('.fia__wires');
      var readEl = host.querySelector('.fia__read'), hint = readEl.innerHTML;
      var MAX = 1.15, MIN = host.closest('.fy-duo') ? 0.4 : 0.66;
      function doFit() {
        var w = fit.clientWidth; if (!w) return;
        var k = Math.min(MAX, w / D.W), pan = false;
        if (k < MIN) { k = MIN; pan = true; }
        size.style.setProperty('--k', k.toFixed(4));
        fit.classList.toggle('is-pan', pan);
      }
      doFit();
      var lastW = fit.clientWidth;
      if ('ResizeObserver' in window) new ResizeObserver(function () { if (fit.clientWidth !== lastW) { lastW = fit.clientWidth; doFit(); } }).observe(fit);
      addEventListener('resize', doFit, { passive: true });

      var nodes = {}; Array.prototype.forEach.call(canvas.querySelectorAll('.fia__n'), function (b) { nodes[b.dataset.n] = b; });
      var wires = Array.prototype.slice.call(svg.querySelectorAll('.fia__e'));
      var pinned = null, ready = false;
      function clear() {
        host.classList.remove('has-lit');
        Array.prototype.forEach.call(host.querySelectorAll('.is-lit, .is-on'), function (x) { x.classList.remove('is-lit', 'is-on'); });
        readEl.innerHTML = hint;
      }
      function show(b) {
        clear();
        host.classList.add('has-lit');
        var id = b.dataset.n, reach = {}; reach[id] = 1;
        wires.forEach(function (w) {
          if (w.dataset.f === id || w.dataset.t === id) {
            w.classList.add('is-lit'); svg.appendChild(w);
            reach[w.dataset.f] = 1; reach[w.dataset.t] = 1;
          }
        });
        (b.dataset.ties || '').split(' ').forEach(function (x) { if (x) reach[x] = 1; });
        Object.keys(reach).forEach(function (x) { if (nodes[x]) nodes[x].classList.add('is-lit'); });
        b.classList.add('is-on');
        readEl.innerHTML = '<b>' + esc(b.querySelector('.fia__t > span').textContent) + '</b><span>' + esc(b.dataset.read) + '</span>';
      }
      function at(e) { return e.target.closest && e.target.closest('.fia__n'); }
      var scrolledAt = 0;
      addEventListener('scroll', function () { scrolledAt = performance.now(); if (!pinned) clear(); }, { passive: true });
      function hover(e) {
        if (e.pointerType === 'touch' || pinned || !ready || performance.now() - scrolledAt < 300) return;
        var x = at(e); if (x && !x.classList.contains('is-on')) show(x);
      }
      canvas.addEventListener('pointerover', hover);
      canvas.addEventListener('pointermove', hover);
      canvas.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch' && !pinned) clear(); });
      canvas.addEventListener('click', function (e) {
        var x = at(e);
        if (!x || x === pinned) { pinned = null; clear(); return; }
        pinned = x; show(x);
      });
      canvas.addEventListener('focusin', function (e) { var x = at(e); if (x) show(x); });
      canvas.addEventListener('focusout', function () { if (!pinned) clear(); });
      host.addEventListener('keydown', function (e) { if (e.key === 'Escape') { pinned = null; clear(); if (document.activeElement) document.activeElement.blur(); } });

      /* IT DRAWS ITSELF ONCE, the first time it is properly in view: the boxes
         land top to bottom and each wire runs out after both its ends exist.
         Pointing waits until the drawing is done. */
      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      function go() { host.classList.add('is-in'); setTimeout(function () { ready = true; }, reduce ? 0 : 1500); }
      if (reduce || !('IntersectionObserver' in window)) { host.classList.add('is-still'); go(); return; }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); go(); } });
      }, { threshold: 0.3 });
      io.observe(fit);
    }

    return { html: html, wire: wire, esc: esc, path: path, head: head };
  })();

  /* THE TASK FLOWS, IN THE SAME HAND AS THE MAP ABOVE THEM. Each flow is drawn
     as what it is: login splits into the old-user and new-user lanes and they
     meet again at Confirmation; VR immersion fans out into its five sessions
     and they all come back to the tutorial. One flow shows at a time, picked
     with the switch. Pointing at a step lights every step that leads to it and
     the one it leads to, and the readout says what comes before and after.
     Every canvas shares one width so the three are drawn at one scale. */
  var FTF = window.FTF = (function () {
    var W = 1220, H = 220;
    var esc = FIA.esc, path = FIA.path, head = FIA.head;
    var FLOWS = [
      { id: 'login', t: 'Login & On-boarding', w: 1050, h: 160,
        nodes: [
          { id: 'entry', kind: 'end', t: 'Entry', x: 0, y: 58, w: 84 },
          { id: 'who', kind: 'choice', t: 'Old or new user?', x: 114, y: 58, w: 160 },
          { id: 'login', t: 'Login', m: 'Old user', x: 310, y: 0, w: 110, h: 44 },
          { id: 'det1', t: 'Enter details', x: 450, y: 0, w: 130, h: 44 },
          { id: 'onb', t: 'On-boarding', m: 'New user', x: 310, y: 116, w: 120, h: 44 },
          { id: 'det2', t: 'Enter details', x: 458, y: 116, w: 126, h: 44 },
          { id: 'email', t: 'Email', x: 612, y: 116, w: 80, h: 44 },
          { id: 'otp', t: 'OTP', x: 720, y: 116, w: 68, h: 44 },
          { id: 'conf', t: 'Confirmation', x: 820, y: 58, w: 124 },
          { id: 'home', kind: 'end', t: 'Home', x: 966, y: 58, w: 84 },
        ],
        edges: [['entry', 'who'], ['who', 'login', 292], ['who', 'onb', 292], ['login', 'det1'], ['det1', 'conf', 802],
          ['onb', 'det2'], ['det2', 'email'], ['email', 'otp'], ['otp', 'conf', 802], ['conf', 'home']],
        outline: ['entry', 'who', ['alt', ['login', 'det1'], ['onb', 'det2', 'email', 'otp']], 'conf', 'home'] },

      { id: 'emotions', t: 'Understand your emotions', w: 1158, h: 40,
        nodes: [
          { id: 'home', kind: 'end', t: 'Home', x: 0, y: 0, w: 84 },
          { id: 'pick', t: 'Pick words that identify your emotions', x: 112, y: 0, w: 266 },
          { id: 'pool', t: 'Select from the pool of emotions', x: 406, y: 0, w: 236 },
          { id: 'explain', t: 'Explain in detail', x: 670, y: 0, w: 140 },
          { id: 'ai', t: 'Try AI suggested strategies', x: 838, y: 0, w: 228, ai: 1 },
          { id: 'end', kind: 'end', t: 'End', x: 1094, y: 0, w: 64 },
        ],
        edges: [['home', 'pick'], ['pick', 'pool'], ['pool', 'explain'], ['explain', 'ai'], ['ai', 'end']],
        outline: ['home', 'pick', 'pool', 'explain', 'ai', 'end'] },

      { id: 'vr', t: 'VR immersion', w: 1218, h: 220,
        nodes: [
          { id: 'tk', kind: 'end', t: 'Toolkit', x: 0, y: 90, w: 90 },
          { id: 'refl', t: 'Reflection', x: 118, y: 90, w: 104 },
          { id: 'sel', kind: 'choice', t: 'Select session', x: 250, y: 90, w: 132 },
          { id: 's1', kind: 'opt', t: 'Public speaking', x: 420, y: 0, w: 170, h: 36 },
          { id: 's2', kind: 'opt', t: 'Criticism', x: 420, y: 46, w: 170, h: 36 },
          { id: 's3', kind: 'opt', t: 'Afraid of darkness', x: 420, y: 92, w: 170, h: 36 },
          { id: 's4', kind: 'opt', t: 'Dating', x: 420, y: 138, w: 170, h: 36 },
          { id: 's5', kind: 'opt', t: 'Interview practice', x: 420, y: 184, w: 170, h: 36 },
          { id: 'tut', t: 'VR tutorial', x: 640, y: 90, w: 118, vr: 1 },
          { id: 'walk', t: 'Session walkthrough', x: 786, y: 90, w: 176, vr: 1 },
          { id: 'cust', t: 'Customisations', x: 990, y: 90, w: 140, vr: 1 },
          { id: 'end', kind: 'end', t: 'End', x: 1158, y: 90, w: 60 },
        ],
        edges: [['tk', 'refl'], ['refl', 'sel'], ['sel', 's1', 401], ['sel', 's2', 401], ['sel', 's3', 401], ['sel', 's4', 401], ['sel', 's5', 401],
          ['s1', 'tut', 615], ['s2', 'tut', 615], ['s3', 'tut', 615], ['s4', 'tut', 615], ['s5', 'tut', 615],
          ['tut', 'walk'], ['walk', 'cust'], ['cust', 'end']],
        outline: ['tk', 'refl', 'sel', ['pick', ['s1', 's2', 's3', 's4', 's5']], 'tut', 'walk', 'cust', 'end'] },
    ];

    /* TOP TO BOTTOM. The flows sit beside the architecture now, in a column
       half the width, so each is laid out down the page from its outline:
       steps stack on one spine, an either/or splits into lanes side by side,
       a choice's options stack as a bracketed list. W and H become the
       largest flow, so switching never moves the page. */
    var CX = 200, G = 16, EL = 10;
    FLOWS.forEach(function (F) {
      var N = {}; F.nodes.forEach(function (n) { N[n.id] = n; });
      var y = 0;
      function place(id, cx, top) { var n = N[id], h = n.h || 40; n.h = h; n.x = Math.round(cx - n.w / 2); n.y = top; return top + h; }
      F.outline.forEach(function (it) {
        if (typeof it === 'string') { y = place(it, CX, y) + G; return; }
        if (it[0] === 'alt') {
          var lanes = it.slice(1), ws = lanes.map(function (l) { return Math.max.apply(null, l.map(function (id) { return N[id].w; })); });
          var total = ws.reduce(function (a, b) { return a + b; }, 0) + 22 * (lanes.length - 1), x0 = CX - total / 2, bottom = y;
          lanes.forEach(function (l, k) {
            var cx = x0 + ws[k] / 2, yy = y + EL;
            l.forEach(function (id) { yy = place(id, cx, yy) + 10; });
            bottom = Math.max(bottom, yy - 10);
            x0 += ws[k] + 22;
          });
          y = bottom + EL + G; return;
        }
        // a choice's options: a stacked list, one width
        var ow = Math.max.apply(null, it[1].map(function (id) { return N[id].w; })), yy = y;
        it[1].forEach(function (id) { N[id].w = ow; N[id].h = 30; yy = place(id, CX, yy) + 6; });
        F.opts = { l: CX - ow / 2 - 16, r: CX + ow / 2 + 16, top: y, bottom: yy - 6 };
        y = yy - 6 + G;
      });
      F.vh = y - G;
      var minX = Math.min.apply(null, F.nodes.map(function (n) { return n.x; })), maxX = Math.max.apply(null, F.nodes.map(function (n) { return n.x + n.w; }));
      F.vw = maxX - minX; F.vx = minX;
    });
    W = Math.max.apply(null, FLOWS.map(function (F) { return F.vw; })) + 40;
    H = Math.max.apply(null, FLOWS.map(function (F) { return F.vh; })) + 8;
    FLOWS.forEach(function (F) { F.w = F.vw; F.h = F.vh; F.dx = (W - F.vw) / 2 - F.vx; F.dy = 4; });

    function vroute(F, a, b) {
      var A = { cx: a.x + a.w / 2, top: a.y, bot: a.y + a.h, cy: a.y + a.h / 2, r: a.x + a.w, l: a.x },
          B = { cx: b.x + b.w / 2, top: b.y, bot: b.y + b.h, cy: b.y + b.h / 2, r: b.x + b.w, l: b.x };
      if (b.kind === 'opt') { var rt = A.bot + 10; return [[A.cx, A.bot], [A.cx, rt], [F.opts.l, rt], [F.opts.l, B.cy], [B.l, B.cy]]; }
      if (a.kind === 'opt') { var rb = B.top - 10; return [[A.r, A.cy], [F.opts.r, A.cy], [F.opts.r, rb], [B.cx, rb], [B.cx, B.top]]; }
      if (Math.abs(A.cx - B.cx) < 1) return [[A.cx, A.bot], [B.cx, B.top]];
      var outs = F.edges.filter(function (e) { return e[0] === a.id; }).length;
      var my = outs > 1 ? A.bot + EL : B.top - EL;
      return [[A.cx, A.bot], [A.cx, my], [B.cx, my], [B.cx, B.top]];
    }
    function box(n) { var w = n.w, h = n.h || 40; return { x: n.x, y: n.y, w: w, h: h, r: n.x + w, cy: n.y + h / 2 }; }
    function route(f, t, mx) {
      var a = box(f), b = box(t);
      if (a.cy === b.cy) return [[a.r, a.cy], [b.x, b.cy]];
      var x = mx != null ? mx : (a.r + b.x) / 2;
      return [[a.r, a.cy], [x, a.cy], [x, b.cy], [b.x, b.cy]];
    }
    var VR = '<i class="fia__vr">VR</i>', AI = '<i class="ftf__ai">AI</i>';
    var ARROW = '<svg viewBox="0 0 22 8" aria-hidden="true"><path d="M1 4h19M16.5 1.2 20 4l-3.5 2.8"/></svg>';

    function panel(F, on) {
      var N = {}; F.nodes.forEach(function (n) { N[n.id] = n; });
      var dx = F.dx, dy = F.dy;
      var prev = {}, next = {};
      F.edges.forEach(function (e) { (next[e[0]] = next[e[0]] || []).push(e[1]); (prev[e[1]] = prev[e[1]] || []).push(e[0]); });
      var names = function (ids) { return (ids || []).map(function (id) { return N[id].t; }).filter(function (v, i, a) { return a.indexOf(v) === i; }); };
      function read(n) {
        var p = names(prev[n.id]), q = names(next[n.id]);
        if (!p.length) return 'Where the flow starts · then ' + q.join(' or ');
        if (!q.length) return 'Where the flow ends · after ' + p.join(' or ');
        return 'After ' + p.join(' or ') + ' · then ' + q.join(' or ');
      }
      var i = 0;
      var nodes = F.nodes.map(function (n) {
        var b = box(n);
        return '<button type="button" class="ftf__n' + (n.kind ? ' ftf__n--' + n.kind : '') + '" data-n="' + n.id + '" data-read="' + esc(read(n)) + '"' +
          ' style="--i:' + (i++) + ';left:' + (b.x + dx) + 'px;top:' + (b.y + dy) + 'px;width:' + b.w + 'px;height:' + b.h + 'px">' +
          '<span class="ftf__t"><span>' + esc(n.t) + '</span>' + (n.vr ? VR : '') + (n.ai ? AI : '') + '</span>' +
          (n.m ? '<span class="ftf__m">' + esc(n.m) + '</span>' : '') + '</button>';
      }).join('');
      var wires = F.edges.map(function (e) {
        var pts = vroute(F, N[e[0]], N[e[1]]).map(function (q) { return [q[0] + dx, q[1] + dy]; });
        var o = Math.max(F.nodes.indexOf(N[e[0]]), F.nodes.indexOf(N[e[1]]));
        return '<g class="fia__e" data-f="' + e[0] + '" data-t="' + e[1] + '" style="--i:' + o + '">' +
          '<path class="fia__line" pathLength="1" d="' + path(pts) + '"/><path class="fia__head" d="' + head(pts) + '"/></g>';
      }).join('');
      function li(id) { var n = N[id]; return '<li class="ftf__li' + (n.kind ? ' ftf__li--' + n.kind : '') + '"><span class="ftf__t"><span>' + esc(n.t) + '</span>' + (n.vr ? VR : '') + (n.ai ? AI : '') + '</span>' + (n.m ? '<span class="ftf__m">' + esc(n.m) + '</span>' : '') + '</li>'; }
      var outline = '<ol class="ftf__list">' + F.outline.map(function (x) {
        if (typeof x === 'string') return li(x);
        if (x[0] === 'alt') return '<li class="ftf__alt"><span class="ftf__or">Either</span>' + x.slice(1).map(function (lane) { return '<ol>' + lane.map(li).join('') + '</ol>'; }).join('<span class="ftf__or">or</span>') + '</li>';
        return '<li class="ftf__alt"><span class="ftf__or">One of</span><ol class="ftf__fan">' + x[1].map(li).join('') + '</ol></li>';
      }).join('') + '</ol>';
      return '<div class="ftf__panel" data-flow="' + F.id + '" data-h="' + (F.vh + 8) + '"' + (on ? '' : ' hidden') + '>' +
        '<div class="ftf__canvas" style="width:' + W + 'px;height:' + H + 'px">' +
          '<svg class="fia__wires" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true">' + wires + '</svg>' + nodes +
        '</div>' + outline + '</div>';
    }

    function html() {
      var sw = '<div class="ftf__mode" role="group" aria-label="Pick a flow">' + FLOWS.map(function (F, k) {
        return '<button type="button" data-flow="' + F.id + '" aria-pressed="' + (k === 0) + '"><b>0' + (k + 1) + '</b>' + esc(F.t) + '</button>';
      }).join('') + '</div>';
      var key = '<ul class="fia__key" aria-label="Key">' +
        '<li>' + ARROW + 'Leads to</li>' +
        '<li><i class="ftf__sw ftf__sw--end"></i>Start and end</li>' +
        '<li><i class="ftf__sw ftf__sw--choice"></i>A choice</li>' +
        '<li>' + VR + 'In the headset</li></ul>';
      return '<div class="fia ftf">' + sw +
        '<div class="fia__fit ftf__fit"><div class="fia__size" style="--w:' + W + 'px;--h:' + H + 'px">' +
          FLOWS.map(function (F, k) { return panel(F, k === 0); }).join('') +
        '</div></div>' +
        '<div class="fia__foot"><p class="fia__read" aria-live="polite"><span class="fia__hint">Point at a step to see what comes before and after it.</span></p>' + key + '</div>' +
      '</div>';
    }

    function wire(host) {
      if (host.dataset.wired) return; host.dataset.wired = '1';
      var fit = host.querySelector('.ftf__fit'), size = host.querySelector('.fia__size');
      var readEl = host.querySelector('.fia__read'), hint = readEl.innerHTML;
      function doFit() {
        var w = fit.clientWidth; if (!w) return;
        var lo = 0.62;
        var k = Math.min(1.0, w / W), pan = false;
        if (k < lo) { k = lo; pan = true; }
        size.style.setProperty('--k', k.toFixed(4));
        fit.classList.toggle('is-pan', pan);
      }
      doFit();
      var lastW = fit.clientWidth;
      if ('ResizeObserver' in window) new ResizeObserver(function () { if (fit.clientWidth !== lastW) { lastW = fit.clientWidth; doFit(); } }).observe(fit);
      addEventListener('resize', doFit, { passive: true });

      var pinned = null, ready = false, cur = host.querySelector('.ftf__panel:not([hidden])');
      function fitH() { size.style.setProperty('--h', cur.dataset.h + 'px'); }
      fitH();
      function clear() {
        host.classList.remove('has-lit');
        Array.prototype.forEach.call(host.querySelectorAll('.is-lit, .is-on'), function (x) { x.classList.remove('is-lit', 'is-on'); });
        readEl.innerHTML = hint;
      }
      function show(b) {
        clear();
        host.classList.add('has-lit');
        var svg = cur.querySelector('svg'), wires = Array.prototype.slice.call(svg.querySelectorAll('.fia__e'));
        var id = b.dataset.n, up = {}, stack = [id]; up[id] = 1;
        /* everything that leads here, however far back */
        while (stack.length) {
          var x = stack.pop();
          wires.forEach(function (w) { if (w.dataset.t === x && !up[w.dataset.f]) { up[w.dataset.f] = 1; stack.push(w.dataset.f); } });
        }
        var lit = {}; Object.keys(up).forEach(function (k) { lit[k] = 1; });
        wires.forEach(function (w) {
          var back = up[w.dataset.f] && up[w.dataset.t], fwd = w.dataset.f === id;
          if (back || fwd) { w.classList.add('is-lit'); svg.appendChild(w); lit[w.dataset.t] = 1; }
        });
        Array.prototype.forEach.call(cur.querySelectorAll('.ftf__n'), function (n) { if (lit[n.dataset.n]) n.classList.add('is-lit'); });
        b.classList.add('is-on');
        readEl.innerHTML = '<b>' + esc(b.querySelector('.ftf__t > span').textContent) + '</b><span>' + esc(b.dataset.read) + '</span>';
      }
      function at(e) { return e.target.closest && e.target.closest('.ftf__n'); }
      var scrolledAt = 0;
      addEventListener('scroll', function () { scrolledAt = performance.now(); if (!pinned) clear(); }, { passive: true });
      function hover(e) {
        if (e.pointerType === 'touch' || pinned || !ready || performance.now() - scrolledAt < 300) return;
        var x = at(e); if (x && !x.classList.contains('is-on')) show(x);
      }
      size.addEventListener('pointerover', hover);
      size.addEventListener('pointermove', hover);
      size.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch' && !pinned) clear(); });
      size.addEventListener('click', function (e) {
        var x = at(e);
        if (!x || x === pinned) { pinned = null; clear(); return; }
        pinned = x; show(x);
      });
      size.addEventListener('focusin', function (e) { var x = at(e); if (x) show(x); });
      size.addEventListener('focusout', function () { if (!pinned) clear(); });
      host.addEventListener('keydown', function (e) { if (e.key === 'Escape') { pinned = null; clear(); if (document.activeElement) document.activeElement.blur(); } });

      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      var settle = 0;
      function draw() {
        clearTimeout(settle); ready = false;
        host.classList.remove('is-in'); void host.offsetWidth; host.classList.add('is-in');
        settle = setTimeout(function () { ready = true; }, reduce ? 0 : 1100);
      }
      /* THE SWITCH redraws the flow it opens, so each one arrives the same way */
      Array.prototype.forEach.call(host.querySelectorAll('.ftf__mode button'), function (btn) {
        btn.addEventListener('click', function () {
          if (btn.getAttribute('aria-pressed') === 'true') return;
          Array.prototype.forEach.call(host.querySelectorAll('.ftf__mode button'), function (x) { x.setAttribute('aria-pressed', String(x === btn)); });
          Array.prototype.forEach.call(host.querySelectorAll('.ftf__panel'), function (p) { p.hidden = p.dataset.flow !== btn.dataset.flow; });
          cur = host.querySelector('.ftf__panel:not([hidden])'); fitH();
          pinned = null; clear();
          if (host.classList.contains('is-in')) draw();
        });
      });
      if (reduce || !('IntersectionObserver' in window)) { host.classList.add('is-still', 'is-in'); ready = true; return; }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); draw(); } });
      }, { threshold: 0.35 });
      io.observe(fit);
    }

    return { html: html, wire: wire };
  })();

  window.STUDY_HTML = {

    /* --------------------------------------------------- Step into confidence */
    confidence:
      win('Project overview',
        '<div class="fy-conf">' +
          '<div class="fy-conf__copy">' +
            sticker('Break your Barriers') +
            '<h3 class="fy-conf__h">Step into<br>Confidence</h3>' +
            '<p class="fy-conf__line">Elevate your interactions while our <em class="fy-pill">innovative</em> tool discreetly supports your <em class="fy-pill fy-pill--ghost">progress</em></p>' +
            '<span class="fy-cta">Shift to Game On</span>' +
          '</div>' +
          '<div class="fy-conf__art">' + img('phones.webp', 'Two phones running Fury: the home screen with the alter ego, and the check-in breakdown', 1200, 1600) + '</div>' +
          '<div class="fy-conf__dots" aria-hidden="true"><i></i><i></i><i></i></div>' +
          '<div class="fy-conf__badge">' + img('wordmark.webp', 'Fury', 2225, 379) + '</div>' +
        '</div>', 'fy-win--light'),

    /* ------------------------------------------------------------ Synergy */
    synergy:
      '<div class="fy-syn">' +
        '<h3 class="fy-syn__h">Unveiling the<br>Ultimate Synergy</h3>' +
        '<p class="fy-syn__p">Begin your adventure on your mobile device and seamlessly transition into the immersive world of VR.</p>' +
        '<ul class="fy-syn__list">' +
          '<li>' + img('icon-continuity.webp', '', 126, 126) + '<span>Cross-Platform<br>Continuity</span></li>' +
          '<li>' + img('icon-safe.webp', '', 126, 126) + '<span>Safe-Space<br>for therapy</span></li>' +
          '<li>' + img('icon-access.webp', '', 126, 126) + '<span>Accessible yet<br>Usable</span></li>' +
        '</ul>' +
        '<div class="fy-syn__art">' + img('hardware.webp', 'A Meta Quest 2 headset seen from the front, between its two controllers', 1600, 562) + '</div>' +
        '<div class="fy-syn__bar" aria-hidden="true"></div>' +
      '</div>',

    /* ------------------------------------------------------- Key features */
    features:
      '<div class="fy-feat">' +
        '<div class="fy-feat__top">' + sticker('Key Features', 'fy-sticker--white fy-sticker--big') +
          '<span class="fy-tags"><span>About</span><span class="is-on">Unified Solution</span></span></div>' +
        '<div class="fy-bento">' +
          '<article class="fy-tile fy-tile--green"><span class="fy-tile__n">01</span>' +
            '<p class="fy-tile__sel"><span>Read More</span><span>Learn More</span><i></i><i></i><i></i><i></i></p></article>' +
          '<article class="fy-tile fy-tile--night fy-tile--limit"><span class="fy-tile__n">03</span>' +
            '<h4>Limitless Exploration</h4><p>Face your fears in multiple environments &amp; landscapes.</p>' +
            img('tile-limitless.webp', 'Session thumbnails: public speaking, fear of the dark, shyness', 470, 482, 'fy-tile__art') + '</article>' +
          '<article class="fy-tile fy-tile--blue"><span class="fy-tile__n">05</span>' +
            img('tile-cardboard.webp', '', 979, 324, 'fy-tile__bg') +
            '<h4>Affordable Cardboard<br>VR Experience</h4></article>' +
          '<article class="fy-tile fy-tile--night fy-tile--wheel"><span class="fy-tile__n">02</span>' +
            '<h4>Wheel of Emotions</h4><p>Develop your emotional literacy &amp; learn to express how you’re feeling.</p>' +
            img('wheel.webp', 'A cluster of emotion bubbles: stressed, shocked, angry, panicked, anxious, overwhelmed', 640, 1034, 'fy-tile__art') + '</article>' +
          '<article class="fy-tile fy-tile--pink"><span class="fy-tile__n">04</span>' +
            '<h4>VR integration</h4><p>Kick off on mobile. If you’re hooked, level up your therapy via a virtual reality headset.</p>' +
            img('tile-vr.webp', 'A Quest 2 headset and controller', 470, 656, 'fy-tile__art') + '</article>' +
          '<article class="fy-tile fy-tile--night fy-tile--ego"><span class="fy-tile__n">06</span>' +
            '<div><h4>Gamified Alter Ego</h4><p>Complete daily tasks, therapy, and watch your Alter Ego turn green for the right path.</p>' +
            '<p>Value each step, stay focused, the journey matters as much as the goal.</p></div>' +
            img('alter-ego.webp', 'The alter ego: an angry devil on a red card behind a happy angel on a green card', 1306, 1088, 'fy-tile__art') + '</article>' +
        '</div>' +
      '</div>',

    /* ------------------------------------------------------- Scope of work */
    gantt:
      '<div class="fy-gantt" role="list">' +
        '<div class="fy-gantt__weeks" aria-hidden="true"><span>Week 1–2</span><span>Week 3–4</span><span>Week 5–6</span><span>Week 7–8</span></div>' +
        ['Strategy', 'Research', 'Define', 'Ideate', 'UI Design', 'Prototype', 'Testing &amp; Feedback', 'Ready to develop']
          .map(function (s, i) { return '<span role="listitem" class="fy-gantt__step' + (i === 7 ? ' is-end' : '') + '" style="--i:' + i + '">' + s + '</span>'; }).join('') +
      '</div>',

    /* ------------------------------------------------------------- Problem */
    problem:
      '<div class="fy-prob">' +
        '<p class="fy-prob__k">What it costs people</p>' +
        '<ul class="fy-chips">' +
          ['Isolation and Loneliness', 'Stifled Personal Development', 'Missed Opportunities', 'Stigma &amp; Misunderstanding',
           'Impact on Mental Health', 'Fear of Participation', 'Emotional Toll', 'Relationship Strain']
            .map(function (c, i) { return '<li style="--i:' + i + ';--c:' + (i % 4) + '">' + c + '</li>'; }).join('') +
        '</ul>' +
        '<div class="fy-stats">' +
          '<div class="fy-stat"><b>1<small>in</small>7</b>' +
            '<span class="fy-seven" aria-hidden="true">' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { return '<i style="--i:' + i + '"></i>'; }).join('') + '</span>' +
            '<span>Indians suffer from mental disorders</span></div>' +
          '<div class="fy-stat"><b><span class="fy-count" data-to="13.7" data-dec="1">13.7</span>%</b><span>of India’s population suffers from some form of mental illness, including anxiety disorders</span></div>' +
          '<div class="fy-stat"><b><span class="fy-count" data-to="0.75" data-dec="2">0.75</span></b><span>Psychiatrists per 100,000 people in India</span></div>' +
          '<div class="fy-stat fy-stat--icon">' + img('gender.webp', 'A woman and a man, with an arrow towards the woman', 406, 286) + '<span>Women are more likely to be diagnosed than men</span></div>' +
        '</div>' +
        '<div class="fy-quotes">' +
          '<blockquote class="fy-quote">Mental health is one of the most neglected social issues in India.</blockquote>' +
          '<blockquote class="fy-quote">We don’t take mental health seriously here in India. It’s just a stigma.</blockquote>' +
        '</div>' +
      '</div>',

    /* ---------------------------------------------------------- Discovery */
    mindmap:
      '<div class="fy-maps">' +
        '<figure>' + Z('mindmap-vr.webp', 'Mind map of virtual reality: usage, impact, advantages and disadvantages, and how it works', 1268, 684, 'fy-zoom--paper') +
          '<figcaption>Virtual reality: where it is used, what it does, and what it costs.</figcaption></figure>' +
        '<figure>' + Z('mindmap-phobia.webp', 'Mind map of social phobia: common situations, causes, symptoms, risk factors and complications', 1269, 1003, 'fy-zoom--paper') +
          '<figcaption>Social phobia: situations, causes, symptoms, risks and complications.</figcaption></figure>' +
      '</div>',

    observations:
      '<div class="fy-bubbles">' +
        '<div class="fy-bubble fy-bubble--navy fy-bubble--big"><h5>Do people make efforts for their emotional wellbeing?</h5><p>Most people lack knowledge about how to deal with emotional stress and express freely. They fear being judged as weak.</p></div>' +
        '<div class="fy-bubble fy-bubble--sky"><h5>With whom do people share their feelings?</h5><p>Talk to their friends, parents, loved ones.</p></div>' +
        '<div class="fy-bubble fy-bubble--paper"><h5>How do people deal with stress &amp; anxiety?</h5><p>Some people view coping methods as helpful, while others see them as a gimmick.</p></div>' +
        '<div class="fy-bubble fy-bubble--ink"><h5>Have you ever tried overcoming your fears?</h5><p>People have forced themselves into situations, but they have never been able to get out of them because of the fear that keeps coming back.</p></div>' +
        '<div class="fy-bubble fy-bubble--pink"><h5>Ways to vent out</h5><p>Playing games, writing a diary, talking to close ones, walking in nature, avoiding everyone.</p></div>' +
      '</div>',

    interviews:
      '<div class="fy-qs">' + sticker('7 participants', 'fy-qs__tag') +
        [['01', 'When did you first notice that you were struggling with social situations?'],
         ['02', 'How do you typically feel or behave when such situations occur?'],
         ['03', 'Have you tried any treatments or therapies? If not, what do you do to overcome it?'],
         ['04', 'How do you think technology could help you improve your social skills and overcome social anxiety?'],
         ['05', 'Have you noticed any negative impacts of your social anxiety on your personal or professional life?'],
         ['06', 'How does social anxiety impact your daily life and routine?'],
         ['07', 'What are some common misconceptions about social anxiety that you would like to dispel?']]
          .map(function (q) { return '<div class="fy-q fy-q--' + q[0] + '"><b>' + q[0] + '</b><p>' + q[1] + '</p></div>'; }).join('') +
      '</div>',

    /* ------------------------------------------------------------ Insights */
    stickies:
      win('Affinity map', Z('stickies.webp', 'Affinity map of sticky notes grouped by observations of gamers, parents, roommates and partners', 1768, 758), 'fy-win--light'),

    insights:
      '<ul class="fy-insights">' +
        '<li>People are unable to relate to the information available on the internet. They believe that <b>too much information equals less information.</b></li>' +
        '<li>People have a <b>variety of trigger points</b> that cause them to get anxious.</li>' +
        '<li>People think that as <b>time passes</b>, their <b>pain will eventually go away.</b></li>' +
        '<li>They believe that rather than wanting to be a <b>leader</b>, they lack confidence and prefer to <b>remain a team-player.</b></li>' +
        '<li><b>Mental health is a stigma</b> and if they share their feelings and emotions, they are considered <b>weak.</b></li>' +
        '<li>Shy and timid personalities are <b>simple targets for abuse.</b></li>' +
        '<li>People are more comfortable with themselves since they are afraid of being criticised by others.</li>' +
      '</ul>',

    /* -------------------------------------------------------- Validation */
    reading:
      '<ol class="fy-reads">' +
        [['Psychiatric Times', 'Social Anxiety Disorder: More Than Just a Little Shyness'],
         ['Research article', 'Virtual reality exposure in the treatment of social anxiety'],
         ['Open access', 'The Influence of Avatar Personalization on Emotions in VR'],
         ['Hindustan Times', 'One in 7 Indians suffers from mental disorders: Lancet Study'],
         ['Study', 'Social media use linked to decline in mental health'],
         ['Education, health', 'Research shows spike in youth suicide attempts, depression after the COVID-19 pandemic began'],
         ['TechNews', 'Can artificial intelligence help overcome social anxiety?'],
         ['Study protocol', 'Self-guided virtual reality therapy for social anxiety disorder: a randomized controlled trial'],
         ['Anxiety', 'Why Robots Could Help People With Social Anxiety']]
          .map(function (r) { return '<li><span>' + r[0] + '</span>' + r[1] + '</li>'; }).join('') +
      '</ol>',

    survey:
      '<div class="fy-survey">' +
        '<div class="fy-survey__n"><b>65</b><span>Responses</span></div>' +
        pie('Gender', [['Male', 44.4, '#5b7bd5'], ['Female', 55.6, '#e0614a']]) +
        pie('Do you think mental health is a stigma in India?', [['Yes', 92.1, '#5b7bd5'], ['No', 7.9, '#e0614a']]) +
        pie('Have you ever disclosed your social anxiety to others?', [['Close friends', 74.6, '#5b7bd5'], ['Family', 20.6, '#e0614a'], ['Colleagues', 4.8, '#f2a93b']]) +
        bars('How often do you feel self-conscious or worry about being judged in social situations?', [[5, 7.9], [11, 17.5], [17, 27], [13, 20.6], [16, 25.4]], 'Rarely', 'Always') +
        bars('Have you ever received professional help for anything related to mental health?', [[41, 65.1], [5, 7.9], [5, 7.9], [8, 12.7], [4, 6.3]], 'Never', 'Regularly') +
        bars('Do technology or online resources support you when it comes to social anxiety?', [[10, 15.2], [11, 17.5], [19, 30.2], [13, 20.6], [10, 15.2]], 'Not at all', 'A lot') +
        bars('How often do you experience anxiety or nervousness in social situations?', [[4, 6.3], [16, 25.4], [24, 38.1], [14, 22.2], [5, 7.9]], 'Rarely', 'Always') +
      '</div>',

    /* RESEARCH, IN ONE PLACE. Three methods, one switch: the mind maps, what
       observing people showed, and the seven interview questions. Same content
       as before, a third of the length. */
    methods:
      '<div class="fy-tabs" data-tabs>' +
        '<div class="fy-tabs__bar" role="tablist">' +
          '<button type="button" role="tab" aria-selected="true" data-tab="maps"><b>01</b>Mind mapping</button>' +
          '<button type="button" role="tab" aria-selected="false" data-tab="obs"><b>02</b>Observations</button>' +
          '<button type="button" role="tab" aria-selected="false" data-tab="int"><b>03</b>Interviews <i>7</i></button>' +
        '</div>' +
        '<div class="fy-tabs__panel" data-panel="maps">' +
          '<p class="fy-tabs__lede">Mind mapping helped me broaden the topic and organise what I found into a hierarchy: how the parts relate to the whole.</p>' +
          '<div class="fy-maps fy-maps--compact">' +
            '<figure>' + Z('mindmap-vr.webp', 'Mind map of virtual reality: usage, impact, advantages and disadvantages, and how it works', 1268, 684, 'fy-zoom--paper') +
              '<figcaption>Virtual reality: where it is used, what it does, and what it costs.</figcaption></figure>' +
            '<figure>' + Z('mindmap-phobia.webp', 'Mind map of social phobia: common situations, causes, symptoms, risk factors and complications', 1269, 1003, 'fy-zoom--paper') +
              '<figcaption>Social phobia: situations, causes, symptoms, risks and complications.</figcaption></figure>' +
          '</div>' +
        '</div>' +
        '<div class="fy-tabs__panel" data-panel="obs" hidden>' +
          '<p class="fy-tabs__lede">Putting myself in their shoes. Observing the environment gave me a first-hand look at people’s social behaviour, and the patterns to continue the research.</p>' +
          '<div class="fy-bubbles">' +
            '<div class="fy-bubble fy-bubble--navy fy-bubble--big"><h5>Do people make efforts for their emotional wellbeing?</h5><p>Most people lack knowledge about how to deal with emotional stress and express freely. They fear being judged as weak.</p></div>' +
            '<div class="fy-bubble fy-bubble--sky"><h5>With whom do people share their feelings?</h5><p>Talk to their friends, parents, loved ones.</p></div>' +
            '<div class="fy-bubble fy-bubble--paper"><h5>How do people deal with stress &amp; anxiety?</h5><p>Some people view coping methods as helpful, while others see them as a gimmick.</p></div>' +
            '<div class="fy-bubble fy-bubble--ink"><h5>Have you ever tried overcoming your fears?</h5><p>People have forced themselves into situations, but they have never been able to get out of them because of the fear that keeps coming back.</p></div>' +
            '<div class="fy-bubble fy-bubble--pink"><h5>Ways to vent out</h5><p>Playing games, writing a diary, talking to close ones, walking in nature, avoiding everyone.</p></div>' +
          '</div>' +
        '</div>' +
        '<div class="fy-tabs__panel" data-panel="int" hidden>' +
          '<p class="fy-tabs__lede">Structured interviews with seven participants. They talked extensively about their discomforts and actions.</p>' +
          '<div class="fy-qs fy-qs--compact">' + sticker('7 participants', 'fy-qs__tag') +
            [['01', 'When did you first notice that you were struggling with social situations?'],
             ['02', 'How do you typically feel or behave when such situations occur?'],
             ['03', 'Have you tried any treatments or therapies? If not, what do you do to overcome it?'],
             ['04', 'How do you think technology could help you improve your social skills and overcome social anxiety?'],
             ['05', 'Have you noticed any negative impacts of your social anxiety on your personal or professional life?'],
             ['06', 'How does social anxiety impact your daily life and routine?'],
             ['07', 'What are some common misconceptions about social anxiety that you would like to dispel?']]
              .map(function (q) { return '<div class="fy-q fy-q--' + q[0] + '"><b>' + q[0] + '</b><p>' + q[1] + '</p></div>'; }).join('') +
          '</div>' +
        '</div>' +
      '</div>',

    /* VALIDATION, IN ONE STRIP. What the survey said, as the numbers that
       matter, and what I read, folded away. */
    validate:
      '<div class="fy-val">' +
        '<div class="fy-val__stats">' +
          '<div class="fy-val__s"><b>65</b><span>survey responses</span></div>' +
          '<div class="fy-val__s"><b>92.1%</b><span>see mental health as a stigma in India</span></div>' +
          '<div class="fy-val__s"><b>74.6%</b><span>have only told close friends about their social anxiety</span></div>' +
          '<div class="fy-val__s"><b>65.1%</b><span>have never had professional help</span></div>' +
        '</div>' +
        '<details class="fy-val__reads"><summary><span>9 sources reviewed</span><i aria-hidden="true">+</i></summary>' +
          '<ol class="fy-reads">' +
            [['Psychiatric Times', 'Social Anxiety Disorder: More Than Just a Little Shyness'],
             ['Research article', 'Virtual reality exposure in the treatment of social anxiety'],
             ['Open access', 'The Influence of Avatar Personalization on Emotions in VR'],
             ['Hindustan Times', 'One in 7 Indians suffers from mental disorders: Lancet Study'],
             ['Study', 'Social media use linked to decline in mental health'],
             ['Education, health', 'Research shows spike in youth suicide attempts, depression after the COVID-19 pandemic began'],
             ['TechNews', 'Can artificial intelligence help overcome social anxiety?'],
             ['Study protocol', 'Self-guided virtual reality therapy for social anxiety disorder: a randomized controlled trial'],
             ['Anxiety', 'Why Robots Could Help People With Social Anxiety']]
              .map(function (r) { return '<li><span>' + r[0] + '</span>' + r[1] + '</li>'; }).join('') +
          '</ol>' +
        '</details>' +
      '</div>',

    /* ---------------------------------------------------------- Personas */
    personas:
      (function () {
        function persona(n, name, av, demo, traits, goals, chall, beh, mot, flip) {
          var li = function (a) { return '<ul>' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; };
          return '<div class="fy-persona' + (flip ? ' fy-persona--flip' : '') + '"><span class="fy-persona__n" aria-hidden="true">' + n + '</span>' +
            '<div class="fy-pc fy-pc--id">' + img(av, 'Illustrated avatar of ' + name, 179, 179) + '<b>' + name + '</b></div>' +
            '<div class="fy-pc fy-pc--demo"><h5>✨ Demographics</h5><dl>' +
              demo.map(function (d) { return '<div><dt>' + d[0] + ':</dt><dd>' + d[1] + '</dd></div>'; }).join('') + '</dl>' +
              '<h5>✨ Personality Traits</h5>' +
              traits.map(function (t) { return '<div class="fy-slider"><span>' + t[0] + '</span><span>' + t[1] + '</span><i style="--at:' + t[2] + '%"></i></div>'; }).join('') + '</div>' +
            '<div class="fy-pc"><h5>💡 Goals</h5>' + li(goals) + '</div>' +
            '<div class="fy-pc"><h5>💡 Challenges</h5>' + li(chall) + '</div>' +
            '<div class="fy-pc"><h5>💡 Behaviours</h5>' + li(beh) + '</div>' +
            '<div class="fy-pc"><h5>💡 Motivations</h5>' + li(mot) + '</div>' +
          '</div>';
        }
        return persona('01', 'Salman Khan', 'avatar-salman.webp',
            [['Age', '27 years old'], ['Education', 'MBA'], ['Hometown', 'Mumbai'], ['Family', 'Single'], ['Occupation', 'Product Manager']],
            [['Introvert', 'Extrovert', 30], ['Analytical', 'Creative', 85]],
            ['Improve public speaking skills to advance career opportunities', 'Feel more confident when presenting in front of groups', 'Overcome fear of being judged or criticized by colleagues'],
            ['Physical symptoms of anxiety (sweating, rapid heartbeat, trembling) when speaking in front of groups', 'Fear of being judged or criticized by colleagues', 'Avoids public speaking, which limits career growth', 'Difficulty organizing thoughts and creating clear presentations'],
            ['Avoids presentations, meetings and conferences', 'Overprepares and obsesses over small details', 'Prefers one-on-one or written communication to group settings', 'Has sought out books and online courses on public speaking'],
            ['Wants to advance in his career and take on leadership roles', 'Values personal growth and development', 'Desires to overcome fears and build confidence']) +
          persona('02', 'Babita Iyer', 'avatar-babita.webp',
            [['Age', '21 years old'], ['Education', 'B.Des (UI/UX)'], ['Hometown', 'Mumbai'], ['Family', 'Single'], ['Occupation', 'Student']],
            [['Introvert', 'Extrovert', 30], ['Analytical', 'Creative', 85]],
            ['Develop social skills to feel more comfortable in social situations', 'Overcome social anxiety to build and maintain relationships', 'Improve self-esteem and confidence'],
            ['Difficulty initiating and maintaining conversations, particularly with new people', 'Avoids parties, clubs and bars', 'Experiences panic attacks in social situations', 'Fear of being judged or criticized by others'],
            ['Avoids social situations, which limits opportunities to meet people', 'Physical symptoms: sweating, rapid heartbeat, trembling', 'Relies on close friends or family for support', 'Has sought out therapy or counseling'],
            ['Wants to make new friends and build meaningful relationships', 'Values personal growth and development', 'Desires to be more independent and self-sufficient'], true);
      })(),

    empathy:
      '<div class="fy-empathy">' +
        '<div class="fy-emp fy-emp--top"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg><h5>Thinks &amp; Feels</h5><ul><li>“Everyone is looking at me and judging me”</li><li>“I’m not good enough”</li><li>“I’m going to embarrass myself”</li><li>“I can’t handle this”</li><li>“I wish I could just disappear”</li></ul></div>' +
        '<div class="fy-emp fy-emp--left"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10a5 5 0 1 1 9 3c-1 1.3-2 2-2 4a3 3 0 0 1-5 2"/><path d="M11 10a2 2 0 1 1 3 1.7"/></svg><h5>Hears</h5><ul><li>Internal dialogue with negative self-talk or self-criticism</li><li>Fear of being judged, criticized, or rejected by others</li><li>Negative or critical comments in social situations</li><li>Criticism from authority figures or loved ones</li></ul></div>' +
        '<div class="fy-emp__me">' + img('avatar-empathy.webp', 'Illustrated avatar at the centre of the empathy map', 340, 339) + '</div>' +
        '<div class="fy-emp fy-emp--right"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12c3-3 6-4 9-2 3-2 6-1 9 2-3 3.5-6 5-9 5s-6-1.5-9-5z"/><path d="M3 12h18"/></svg><h5>Says &amp; Does</h5><ul><li>Avoids social situations or events</li><li>Struggles to engage in conversations</li><li>Keeps to themselves, not joining group activities</li><li>May rely on substances to cope with social situations</li><li>Self-deprecating humour to deflect attention</li></ul></div>' +
        '<div class="fy-emp fy-emp--bottom"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><h5>Sees</h5><ul><li>Crowded or overwhelming social situations, such as parties</li><li>Busy or noisy places, like restaurants and public transport</li><li>Upcoming social events that are sources of stress</li><li>Public speaking opportunities</li></ul></div>' +
      '</div>',

    /* -------------------------------------------------------------- Ideate */
    treatment:
      '<div class="fy-treat">' +
        '<div class="fy-treat__card"><h5>Cognitive Behavioral Therapy</h5><p>People learn different ways of reacting to thoughts and feelings, and learn to engage in different behaviors that result in decreased fear.</p>' +
          img('cbt.webp', 'The CBT cycle: situation, thoughts, emotions, behaviours and bodily sensations', 756, 710) + '</div>' +
        '<div class="fy-treat__card"><h5>Exposure Therapy</h5><p>Psychologists create a safe environment in which to “expose” individuals to the things they fear and avoid.</p>' +
          img('exposure.webp', 'Exposure therapy: imaginal, real-world and role-play exposure', 756, 632) + '</div>' +
      '</div>',

    whyvr:
      '<div class="fy-why">' +
        '<p class="fy-why__h" aria-hidden="true">Why VR?</p>' +
        '<div class="fy-why__pt fy-why__pt--a"><h5>Non-Judgemental Freedom</h5><p>Accessed privately, so people have less hesitation in trying it out.</p></div>' +
        '<div class="fy-why__pt fy-why__pt--b"><h5>Customised Environment</h5><p>People can experience the exact environment they need to learn to manage their anxiety and fears.</p></div>' +
        '<div class="fy-why__pt fy-why__pt--c"><h5>Flexibility</h5><p>The patient is free to leave and try something else without the risk of triggering more social anxiety.</p></div>' +
        '<div class="fy-why__pt fy-why__pt--d"><h5>Personal Treatment</h5><p>Reduced dependency on the presence of a therapist or doctor.</p></div>' +
      '</div>',

    visual:
      '<div class="fy-vis">' +
        '<ul class="fy-vis__pills">' +
          ['Improved Performance in Sports', 'Boosting Confidence', 'Increasing Focus', 'Managing Stress &amp; Anxiety', 'Managing Depression', 'Managing Chronic Pain']
            .map(function (p, i) { return '<li style="--i:' + i + '"><i></i>' + p + '</li>'; }).join('') +
        '</ul>' +
        '<div class="fy-vis__txt"><span class="fy-label">Seeing is believing</span><h4>The science behind how visualising works</h4>' +
          '<p>The practice causes your amygdala (a little region in the centre of the brain that controls the fight-or-flight reaction) to have difficulty telling the difference between something simply being seen during a visualisation session and something truly happening in real time.</p></div>' +
      '</div>',

    /* ------------------------------------------------------------ Solution */
    brainstorm:
      win('Brainstorming', Z('brainstorm.webp', 'Brainstorming sticky notes: a virtual coach, a customisable avatar, peer support, interactive scenarios, biofeedback, breathing techniques', 1691, 645), 'fy-win--light'),

    /* THE DUAL APPLICATION SYSTEM, AS THE JOURNEY IT DESCRIBES. A scroll-driven
       scene: the section pins while you scroll and the scroll plays it.
         01  you start on the phone: Home, a strategy, the Toolkit, while the
             phone's four notes are written on beside it;
         02  the Toolkit's VR reflections light up, you lift off the phone and
             ride the top arc into the headset, which opens like an iris and
             plays its sessions, tutorial and walkthrough, while the headset's
             notes are written on;
         03  you ride the bottom arc back to the phone. Both stay lit.
       Scrolling back rewinds it. The copy is the board's own. */
    dual: (function () {
      var LN = [
        ['tools for self‑assessment', 'M222 118 Q204 106 176 108', 110],
        ['recognize trigger points', 'M222 196 Q202 186 176 188', 190],
        ['track your progress', 'M222 272 Q202 264 176 268', 270],
        ['on-the-go resources', 'M222 346 Q202 338 176 348', 350],
      ];
      var RN = [
        ['exposure therapy', 'M822 124 Q838 114 856 122', 122],
        ['real-life scenarios', 'M822 196 Q838 186 856 194', 194],
        ['interactive challenges', 'M822 272 Q838 262 856 270', 270],
        ['personalized treatment plans', 'M822 348 Q838 338 856 346', 346],
      ];
      var masks = '', dashes = '';
      LN.concat(RN).forEach(function (n, i) {
        masks += '<mask id="fyEcoM' + i + '" maskUnits="userSpaceOnUse"><path class="fy-eco__pen" d="' + n[1] + '" pathLength="1"/></mask>';
        dashes += '<path class="fy-eco__dash" d="' + n[1] + '" mask="url(#fyEcoM' + i + ')" marker-end="url(#fyEcoHead)"/>';
      });
      function notes(set, side) {
        return '<ul class="fy-eco__notes fy-eco__notes--' + side + '">' + set.map(function (n) {
          var pos = side === 'l' ? 'right:' + (83.6) + '%' : 'left:' + (86.6) + '%';
          return '<li style="' + pos + ';top:' + (n[2] / 5.6) + '%"><span>' + n[0] + '</span></li>';
        }).join('') + '</ul>';
      }
      /* wireframes here, not the finished UI: this is the idea. The real
         screens are revealed later, in the flows and inside the headset. */
      var PH = ['screen-home-wire.webp', 'screen-strategy-wire.webp', 'screen-toolkit-wire.webp'];
      var VRS = ['vr-sessions-wire.webp', 'vr-tutorial-wire.webp', 'vr-walkthrough-wire.webp'];
      var TOP = 'M386 132 C404 66 470 66 488 122', BOT = 'M520 480 C500 528 412 524 392 448';
      var steps = [
        ['01', 'Start on the phone', 'For beginners in the early stages of recognizing their social phobia.'],
        ['02', 'Ready? Step into VR', 'When you’re ready for the next step, the headset takes over.'],
        ['03', 'Shift back, any time', 'The right level of support, at the moment you need it.'],
      ];
      return '<div class="fy-eco">' +
        '<div class="fy-eco__run">' +
          '<div class="fy-eco__pin">' +
            '<div class="fy-eco__cap" aria-live="polite">' + steps.map(function (s, i) {
              return '<div class="fy-eco__step" data-s="' + i + '"><b>' + s[0] + '</b><span class="fy-eco__st">' + s[1] + '</span><span class="fy-eco__sp">' + s[2] + '</span></div>';
            }).join('') + '</div>' +
            '<div class="fy-eco__stage">' +
              '<svg class="fy-eco__svg" viewBox="0 0 1000 560" aria-hidden="true">' +
                '<defs>' + masks +
                  '<marker id="fyEcoHead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1L10 5L0 9Z" fill="#7a7a82"/></marker>' +
                  '<linearGradient id="fyEcoG1" x1="0" x2="1"><stop offset="0" stop-color="#ff8fa8"/><stop offset="1" stop-color="#d6f28e"/></linearGradient>' +
                  '<linearGradient id="fyEcoG2" x1="1" x2="0"><stop offset="0" stop-color="#d6f28e"/><stop offset="1" stop-color="#ff8fa8"/></linearGradient>' +
                '</defs>' +
                dashes +
                '<path class="fy-eco__ghost" d="' + TOP + '"/><path class="fy-eco__ghost" d="' + BOT + '"/>' +
                '<path class="fy-eco__arc fy-eco__arc--t" d="' + TOP + '" pathLength="1" stroke="url(#fyEcoG1)"/>' +
                '<path class="fy-eco__arc fy-eco__arc--b" d="' + BOT + '" pathLength="1" stroke="url(#fyEcoG2)"/>' +
              '</svg>' +
              '<div class="fy-eco__dev fy-eco__phone">' +
                '<div class="fy-eco__screen">' + PH.map(function (f, i) { return img(f, i ? '' : 'Fury mobile app', 543, 1179, 'fy-eco__shot'); }).join('').replace(/loading="lazy"/g, '') +
                  '<i class="fy-eco__spot" aria-hidden="true"></i><i class="fy-eco__island" aria-hidden="true"></i></div>' +
                '<img class="fy-eco__frame" src="' + A + 'phone-frame.webp" alt="" width="418" height="842" decoding="async">' +
              '</div>' +
              '<div class="fy-eco__dev fy-eco__visor">' +
                '<div class="fy-eco__lens"><div class="fy-eco__view"><div class="fy-eco__iris">' + VRS.map(function (f, i) { return img(f, i ? '' : 'Fury in VR', 1160, 537, 'fy-eco__shot'); }).join('').replace(/loading="lazy"/g, '') + '</div>' +
                  '<i class="fy-eco__off" aria-hidden="true"><span>Inside the headset</span></i></div></div>' +
              '</div>' +
              '<span class="fy-eco__beam" aria-hidden="true"></span>' +
              '<div class="fy-eco__quest"><img class="fy-eco__qimg" src="' + A + 'quest-back.webp" alt="Meta Quest 2 headset and controllers, seen from the inside" width="678" height="365" decoding="async">' +
                ['l', 'r'].map(function (e) { return '<span class="fy-eco__eye fy-eco__eye--' + e + '" aria-hidden="true">' + VRS.map(function (f) { return '<img src="' + A + f + '" alt="" decoding="async">'; }).join('') + '</span>'; }).join('') +
              '</div>' +
              '<div class="fy-eco__name fy-eco__name--m"><b>#1</b> Mobile Application</div>' +
              '<div class="fy-eco__name fy-eco__name--v"><b>#2</b> VR Application</div>' +
              notes(LN, 'l') + notes(RN, 'r') +
              '<span class="fy-eco__link" aria-hidden="true"><svg viewBox="0 0 40 64"><path d="M14 6v44M8 42l6 8 6-8M26 58V14M20 22l6-8 6 8"/></svg></span>' +
              '<span class="fy-eco__you" aria-hidden="true">' + img('vr-avatar.webp', '', 115, 116) + '</span>' +
            '</div>' +
            '<ol class="fy-eco__rail" aria-hidden="true"><li></li><li></li><li></li></ol>' +
          '</div>' +
        '</div>' +
        '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><clipPath id="fyEcoVisor" clipPathUnits="objectBoundingBox">' +
          '<path d="M.07 0H.93Q1 0 1 .14V.78Q1 1 .84 1H.62Q.56 1 .535 .88Q.5 .74 .465 .88Q.44 1 .38 1H.16Q0 1 0 .78V.14Q0 0 .07 0Z"/></clipPath></svg>' +
        '<p class="fy-dual__name">Dual Application System</p>' +
        '<p class="fy-dual__p">This system offers a flexible and gradual approach for individuals dealing with social phobia. Seamlessly shift between platforms, guaranteeing that you have access to the <mark>precise level of support at the precise moment you need it.</mark></p>' +
      '</div>';
    })(),

    /* --------------------------------------------------------- Architecture */
    ia:
      win('Information architecture', FIA.html(), 'fy-win--light fy-win--ia'),

    flows:
      win('Task flows', FTF.html(), 'fy-win--light fy-win--flows'),

    /* ------------------------------------------------------------- UI design */
    mobile:
      Z('mobile-screens.webp', 'Fury mobile screens: VR setup, strategies, toolkit, emotion picker, home with alter ego, environments and tune sound', 2100, 3068, 'fy-zoom--device'),

    /* ------------------------------------------------------------ VR screens */
    /* INSIDE THE HEADSET. A pinned, scroll-driven scene (see fury-vr.js): a
       Quest 2 in white line, the push through its lens, then the real VR
       screens floating around you in the auditorium. Phones without WebGL and
       reduced motion keep the flat rows below, which are also what search
       engines and screen readers read. */
    vr: (function () {
      var V = [['vr-sessions.webp', 1160, 537, 'The user can access a range of <em>enhanced</em> therapeutic session environments.', 'Sessions: interview practice, criticism, being teased, music practice, dating, public speaking'],
         ['vr-tutorial.webp', 1160, 537, '<b>A brief, easy tutorial</b> on how to interact with the environment is displayed to <strong>avoid user confusion with the controls.</strong>', 'Tutorial: move, grab and gaze'],
         ['vr-walkthrough.webp', 1163, 548, '<b>Walkthroughs</b> let the user know what they need to <strong>complete in the current session.</strong>', 'Public speaking walkthrough before the session starts'],
         ['vr-explore.webp', 1163, 548, 'Have fun exploring &amp; <em>interacting</em> with objects in the environment.', 'Picking up a microphone from a table, with a five-minute timer'],
         ['vr-customise.webp', 1163, 546, '<b>Adjust a range of settings</b> within environments to match preferences.', 'Customise environment: audience, only stage, volume']];
      var TITLES = ['Sessions', 'Tutorial', 'Walkthrough', 'Explore', 'Customise'];
      /* a Quest-style headset from the wearer's side: graphite shell, foam
         gasket, and two lenses you can already see the room through */
      var quest = '<svg class="fvr__quest" viewBox="0 0 640 420" aria-hidden="true"><defs><linearGradient id="fqShell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a43"/><stop offset=".45" stop-color="#1d1d22"/><stop offset="1" stop-color="#0e0e11"/></linearGradient><linearGradient id="fqRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient><linearGradient id="fqFoam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e2e35"/><stop offset="1" stop-color="#18181c"/></linearGradient><radialGradient id="fqCav" cx=".5" cy=".45" r=".65"><stop offset="0" stop-color="#030304"/><stop offset=".7" stop-color="#0a0a0c"/><stop offset="1" stop-color="#17171b"/></radialGradient><radialGradient id="fqGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8f7dff" stop-opacity=".22"/><stop offset=".55" stop-color="#f52d5d" stop-opacity=".06"/><stop offset="1" stop-color="#f52d5d" stop-opacity="0"/></radialGradient><linearGradient id="fqSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2c33"/><stop offset="1" stop-color="#121215"/></linearGradient><radialGradient id="fqHouse" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#050506"/><stop offset=".86" stop-color="#26262d"/><stop offset="1" stop-color="#121215"/></radialGradient><radialGradient id="fqGlass" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#b9a8ff" stop-opacity=".04"/><stop offset=".65" stop-color="#5a3fc0" stop-opacity=".08"/><stop offset="1" stop-color="#140b33" stop-opacity=".6"/></radialGradient><linearGradient id="fqStrap" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#202026"/><stop offset="1" stop-color="#202026" stop-opacity="0"/></linearGradient><filter id="fqBlur" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="10"/></filter><filter id="fqSoft"><feGaussianBlur stdDeviation="2.2"/></filter><mask id="fqHoles" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="420"><rect width="640" height="420" fill="#fff"/><circle cx="252" cy="212" r="41" fill="#000"/><circle cx="388" cy="212" r="41" fill="#000"/></mask></defs><ellipse cx="320" cy="216" rx="330" ry="210" fill="url(#fqGlow)"/><ellipse cx="320" cy="366" rx="236" ry="16" fill="#000" opacity=".7" filter="url(#fqBlur)"/><path d="M286 112 L292 30 Q320 20 348 30 L354 112 Z" fill="url(#fqStrap)"/><path d="M300 106 L304 44 M336 44 L340 106" stroke="#fff" stroke-opacity=".06" fill="none"/><g mask="url(#fqHoles)"><rect x="58" y="160" width="58" height="104" rx="22" fill="url(#fqSide)" stroke="url(#fqRim)" stroke-width="1"/><rect x="524" y="160" width="58" height="104" rx="22" fill="url(#fqSide)" stroke="url(#fqRim)" stroke-width="1"/><rect x="92" y="100" width="456" height="232" rx="80" fill="url(#fqShell)" stroke="url(#fqRim)" stroke-width="1.6"/><path d="M150 108 Q320 92 490 108" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" filter="url(#fqSoft)"/><rect x="104" y="112" width="432" height="208" rx="70" fill="none" stroke="#fff" stroke-opacity=".06" stroke-width="2"/><path d="M200 124 H440 C492 124 516 156 516 200 V246 C516 288 494 310 452 310 H384 C370 310 364 296 358 284 C350 268 338 262 320 262 C302 262 290 268 282 284 C276 296 270 310 256 310 H188 C146 310 124 288 124 246 V200 C124 156 148 124 200 124 Z" fill="url(#fqFoam)" stroke="#fff" stroke-opacity=".16" stroke-width="1.2"/><path d="M206 140 H434 C478 140 498 166 498 204 V242 C498 276 480 292 450 292 H392 C384 292 378 282 372 270 C362 250 344 244 320 244 C296 244 278 250 268 270 C262 282 256 292 248 292 H190 C160 292 142 276 142 242 V204 C142 166 162 140 206 140 Z" fill="url(#fqCav)"/><circle cx="252" cy="212" r="58" fill="url(#fqHouse)"/><circle cx="388" cy="212" r="58" fill="url(#fqHouse)"/><circle cx="252" cy="212" r="58" fill="none" stroke="#fff" stroke-opacity=".14"/><circle cx="388" cy="212" r="58" fill="none" stroke="#fff" stroke-opacity=".14"/><path d="M294 270 C304 258 336 258 346 270" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1.5"/><circle cx="320" cy="168" r="3.2" fill="#050506" stroke="#fff" stroke-opacity=".25"/></g><g class="fvr__glass"><circle cx="252" cy="212" r="41" fill="url(#fqGlass)"/><circle cx="388" cy="212" r="41" fill="url(#fqGlass)"/><g fill="none" stroke="#fff" stroke-opacity=".08"><circle cx="252" cy="212" r="30"/><circle cx="252" cy="212" r="19"/><circle cx="388" cy="212" r="30"/><circle cx="388" cy="212" r="19"/></g><path d="M222 196 A34 34 0 0 1 244 180 M358 196 A34 34 0 0 1 380 180" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/><circle cx="252" cy="212" r="41" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.4"/><circle cx="388" cy="212" r="41" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.4"/></g><circle data-lens="l" cx="252" cy="212" r="41" fill="none"/><circle data-lens="r" cx="388" cy="212" r="41" fill="none"/></svg>';
      return '<div class="fvr">' +
        '<div class="fvr__run" aria-hidden="true"><div class="fvr__pin">' +
          '<div class="fvr__world"><canvas></canvas><i class="fvr__vig"></i></div>' +
          '<div class="fvr__intro"><p class="fvr__kick">Or, on a Quest 2.</p><p class="fvr__sub">Scroll to step inside</p></div>' +
          quest +
          '<p class="fvr__hint"><i></i>Scroll</p>' +
          '<div class="fvr__hud">' +
            '<p class="fvr__count"><b>01</b> / 0' + V.length + '</p>' +
            '<div class="fvr__caps">' + V.map(function (v, i) {
              return '<p class="fvr__cap"><span>' + TITLES[i] + '</span>' + v[3] + '</p>';
            }).join('') + '</div>' +
          '</div>' +
          '<i class="fvr__fade"></i>' +
        '</div></div>' +
        '<div class="fy-vr fvr__flat">' +
          V.map(function (v, i) {
            return '<div class="fy-vr__row' + (i % 2 ? ' fy-vr__row--flip' : '') + '">' + Z(v[0], v[4], v[1], v[2]) + '<p>' + v[3] + '</p></div>';
          }).join('') +
        '</div>' +
      '</div>';
    })(),

    unity:
      '<div class="fy-unity">' +
        img('unity-1.webp', 'The auditorium scene being built in the Unity editor', 580, 323) +
        img('unity-2.webp', 'Testing the microphone interaction on a laptop running Unity', 485, 323) +
        img('unity-3.webp', 'The Unity project open on a laptop', 642, 323) +
        '<p>Testing device: Oculus Quest 2</p>' +
      '</div>',

    /* -------------------------------------------------------------- Testing */
    /* USABILITY TESTING, LED BY THE PEOPLE IN IT. The three sessions are the
       evidence, so they come first and large: the standing tester as the tall
       frame, the other two stacked beside her, and the one number that frames
       them (six expert users, guerrilla method) on the ink card. Each photo
       opens in the lightbox. The notes from the board sit underneath. */
    testing:
      '<div class="fy-test">' +
        '<div class="fy-test__band">' +
          '<figure class="fy-shot fy-shot--tall">' + Z('test-3.webp', 'A tester standing in the lab with an Oculus Quest 2 headset and controllers', 418, 562) + '<figcaption>Oculus Quest 2</figcaption></figure>' +
          '<figure class="fy-shot">' + Z('test-1.webp', 'A tester smiling inside the headset, controllers raised', 406, 300) + '</figure>' +
          '<figure class="fy-shot">' + Z('test-2.webp', 'A tester reaching out to interact in VR', 406, 374) + '</figure>' +
          '<div class="fy-test__stat">' +
            '<span class="fy-test__n fy-slot" aria-label="6"><span class="fy-slot__win" aria-hidden="true"><span class="fy-slot__reel"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i><i>7</i><i>8</i><i>9</i><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i><i>7</i><i>8</i><i>9</i><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i></span></span></span><span class="fy-test__u">expert users,<br>in a moderated session</span>' +
            '<blockquote>Guerrilla testing method was used in this whole process</blockquote>' +
          '</div>' +
        '</div>' +
        '<div class="fy-test__cards">' +
          '<div class="fy-tc"><h5>Background Summary</h5><p>The synthesis of a usability evaluation of my prototype, conducted by <b>6 expert users</b> in a moderated environment to get their reviews and find bugs.</p></div>' +
          '<div class="fy-tc"><h5>Methodology</h5><p>The expert users navigated through the app to find problems and usability issues.</p><ol><li>Analyse your behaviours</li><li>Use toolkit to enter VR environment</li><li>Interact with VR</li></ol></div>' +
          '<div class="fy-tc fy-tc--pink"><h5>Goals</h5><ol><li>Identify usability problems</li><li>Get general feedback about the application and its working</li><li>Find bugs &amp; fix them</li></ol></div>' +
          '<div class="fy-tc"><h5>Questions</h5><ol><li>How easy was the app to use?</li><li>What problems did you face?</li></ol></div>' +
          '<div class="fy-tc fy-tc--wide"><h5>Feedback for VR</h5><ul><li>The virtual world lacked detail, so people wanted something more realistic to relate to.</li><li>Blank walls around the stage caused a tunnelling effect, so more interactable objects keep the user involved.</li><li>Some were afraid of tumbling off the platform, since movement and height adjustment were not set.</li></ul></div>' +
        '</div>' +
      '</div>',
    /* ------------------------------------------------------------------ FAQ */
    faq:
      '<div class="fy-faq">' +
        '<div class="fy-faq__q"><h4>Why is there a need for a mobile app, and not just a VR app?</h4><ul>' +
          '<li>Socially phobic individuals are <mark>more likely to use their phones</mark> as a coping mechanism and to avoid social situations. A mobile app can be a <mark>useful tool to provide support and resources at their fingertips</mark>, while a <mark>VR app can provide a more immersive and controlled environment</mark> for exposure therapy and social skills training.</li>' +
          '<li>Virtual reality can be tricky for novice users, so the <mark>mobile application handles the more complex input</mark>, while VR is used as the visualisation tool.</li>' +
          '<li>A mobile app can serve as a <mark>bridge for a comprehensive strategy</mark> to address social phobia.</li>' +
          '<li><mark>Machine learning</mark> can analyse facial expressions, tone of voice and other nonverbal cues to <mark>detect emotions in real time</mark>, for a more <mark>objective and accurate assessment</mark> of the individual’s emotions.</li></ul></div>' +
        '<div class="fy-faq__q fy-faq__q--r"><h4>What are some limitations or risks of using VR for therapy?</h4><ul>' +
          '<li>VR can induce <mark>motion sickness, nausea, dizziness, headache, eye strain or fatigue</mark>, due to the mismatch between visual and vestibular inputs.</li>' +
          '<li>Technical issues such as <mark>poor graphics, latency or tracking problems</mark> can interfere with the immersive experience and <mark>reduce the effectiveness of the therapy.</mark></li></ul></div>' +
      '</div>',

    /* -------------------------------------------------------- Future scope */
    /* THE REVENUE MODEL, PAYING IN. The wheel from the board, drawn live: six
       streams around the bag. When it scrolls in the segments assemble; then
       each stream in turn lights up with its note, and coins fly from it into
       the bag, which fills a ring of gold one stream at a time. The three
       streams planned for later are hatched, tagged Future, and pay in ghost
       coins. Pointing at any stream makes it pay in now. */
    revenue: (function () {
      var S = [
        { id: 'doc', a: 240, c: '#2c4a87', t: 'Doctor’s Collaboration', p: 'Psychiatrists and therapists can join, so that most people can get access to quality check-ups.', f: 1,
          i: '<circle cx="14" cy="8" r="4.2"/><path d="M5.5 25c0-5 3.8-8.4 8.5-8.4s8.5 3.4 8.5 8.4"/><path d="M14 18.8v4.6M11.7 21.1h4.6"/>' },
        { id: 'pro', a: 300, c: '#2f86d6', t: 'Pro Subscription', p: 'Pro features and additional perks for subscribers.',
          i: '<rect x="4" y="9" width="20" height="14" rx="3"/><path d="M10.5 9V6.6c0-1 .8-1.8 1.8-1.8h3.4c1 0 1.8.8 1.8 1.8V9"/><path d="M16.2 13.2c-.5-.8-1.3-1.1-2.2-1.1-1.2 0-2.1.6-2.1 1.5 0 2 4.4 1 4.4 3.1 0 .9-1 1.6-2.3 1.6-1 0-1.9-.4-2.4-1.2M14 11v1.1M14 18.3v1.1"/>' },
        { id: 'day', a: 0, c: '#5aa3c0', t: 'Daily Limit / Pay-per-Session', p: 'Free users can access some sessions.',
          i: '<path d="M5 4v19h19"/><path d="M8.5 19l4.5-5.5 3.5 3 6-7.5"/><path d="M9 6.5h6M9 9.5h4"/>' },
        { id: 'rent', a: 60, c: '#f07481', t: 'Renting of VR Device', p: 'Doctors can rent VR headsets for their patients.', f: 1,
          i: '<rect x="3.5" y="8" width="21" height="12" rx="4"/><circle cx="9.5" cy="14" r="2.6"/><circle cx="18.5" cy="14" r="2.6"/><path d="M12.6 20l1.4-2.2 1.4 2.2"/>' },
        { id: 'med', a: 120, c: '#e04a3c', t: 'Medical Substitutes', p: 'In future, therapy-related medicines can be sold on the same platform.', f: 1,
          i: '<path d="M6 13l4-7 4 7z"/><circle cx="19.5" cy="9" r="4"/><path d="M17 9h5"/><rect x="7" y="16" width="14" height="6.5" rx="3.25" transform="rotate(-28 14 19.25)"/><path d="M14 16.5v5.5" transform="rotate(-28 14 19.25)"/>' },
        { id: 'ads', a: 180, c: '#dc2a3f', t: 'Advertisements', p: 'Placed between exposure-therapy sessions, in the form of relaxation.',
          i: '<rect x="3.5" y="6.5" width="21" height="15" rx="2.5"/><text x="14" y="18.2" text-anchor="middle" font-size="9.5" font-weight="800" fill="currentColor" stroke="none" font-family="Geist, system-ui, sans-serif">Ad</text>' },
      ];
      var C = 200, R1 = 184, R0 = 118, G = 3.4;
      function pt(r, d) { var t = d * Math.PI / 180; return [(C + r * Math.cos(t)).toFixed(2), (C + r * Math.sin(t)).toFixed(2)]; }
      function seg(a) {
        var s = a - 30 + G, e = a + 30 - G, o1 = pt(R1, s), o2 = pt(R1, e), i2 = pt(R0, e), i1 = pt(R0, s);
        return 'M' + o1 + 'A' + R1 + ' ' + R1 + ' 0 0 1 ' + o2 + 'L' + i2 + 'A' + R0 + ' ' + R0 + ' 0 0 0 ' + i1 + 'Z';
      }
      var wheel = '<svg class="fy-rv__svg" viewBox="0 0 400 400" aria-hidden="true">' +
        '<defs><pattern id="fyHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2.2" height="7" fill="rgba(255,255,255,.28)"/></pattern></defs>' +
        S.map(function (s, k) {
          var c = pt(151, s.a);
          return '<g class="fy-rv__seg' + (s.f ? ' is-future' : '') + '" data-s="' + s.id + '" style="--k:' + k + ';--c:' + s.c + ';transform-origin:' + c[0] + 'px ' + c[1] + 'px">' +
            '<path class="fy-rv__shape" d="' + seg(s.a) + '"/>' + (s.f ? '<path class="fy-rv__hatch" d="' + seg(s.a) + '"/>' : '') +
            '<g class="fy-rv__ico" transform="translate(' + (c[0] - 14) + ' ' + (c[1] - 14) + ')">' + s.i + '</g></g>';
        }).join('') +
        '<circle class="fy-rv__track" cx="200" cy="200" r="100"/>' +
        '<circle class="fy-rv__fill" cx="200" cy="200" r="100" pathLength="6" transform="rotate(-90 200 200)"/>' +
      '</svg>';
      function pt2(s) {
        return '<div class="fy-rev__pt" data-s="' + s.id + '" tabindex="0"><h5>' + s.t + (s.f ? ' <i class="fy-rv__soon">Future</i>' : '') + '</h5><p>' + s.p + '</p></div>';
      }
      var by = {}; S.forEach(function (s) { by[s.id] = s; });
      return '<div class="fy-rev">' +
        '<div class="fy-rev__head"><span class="fy-label">It’s not always about money</span><h3>Revenue Model</h3>' +
          '<p>Virtual reality is integrated into the application, which enables all revenue creation. In the future, the app can be turned into a service, and businesses can be created.</p></div>' +
        '<div class="fy-rev__map">' +
          pt2(by.doc) + pt2(by.pro) + pt2(by.ads) +
          '<div class="fy-rev__wheel fy-rv" data-order="doc pro day rent med ads">' + wheel +
            '<img class="fy-rv__bag" src="' + A + 'rev-bag.webp" alt="A money bag at the centre of the six revenue streams" width="438" height="486" decoding="async">' +
            '<span class="fy-rv__count" aria-hidden="true"><b>0</b>/6 streams</span>' +
          '</div>' +
          pt2(by.day) + pt2(by.med) + pt2(by.rent) +
        '</div>' +
        '<p class="fy-rv__key"><span><i class="fy-rv__sw"></i>Live from launch</span><span><i class="fy-rv__sw fy-rv__sw--f"></i>Planned for later</span></p>' +
      '</div>';
    })(),

    /* ------------------------------------------------------------ IDEATE
       The whole "Ideate" board from Figma (frame 5), as one window: Existing
       Treatment, Why VR?, Power of Visualisation and Brainstorming. The two
       treatment diagrams and the Why VR map are drawn in SVG so they can move:
       arrows draw in and a pulse travels the CBT cycle, the exposure ring
       draws itself and a light orbits it, the Why VR connectors draw out from
       the title and their dots breathe, and the visualisation pills float.
       Motion starts when the block scrolls in (`.is-in`), and all of it is
       switched off under prefers-reduced-motion. */
    ideate: (function () {
      var cbt =
        '<svg class="fz-cbt" viewBox="0 0 520 500" role="img" aria-label="The CBT cycle: a situation triggers thoughts, which drive emotions, behaviours and bodily sensations, which feed back into thoughts">' +
          '<defs><marker id="fzArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 9 5 1 9" fill="none" stroke="#222" stroke-width="1.4"/></marker></defs>' +
          /* the pulse that runs the loop, under the nodes */
          '<g class="fz-cbt__orbit"><circle cx="260" cy="182" r="6" fill="#f52d5d"/></g>' +
          '<circle class="fz-cbt__track" cx="260" cy="292" r="110" fill="none" stroke="#f52d5d" stroke-opacity=".12" stroke-width="2" stroke-dasharray="3 7"/>' +
          '<path class="fz-draw" style="--d:.2s" d="M260 112 V140" stroke="#222" stroke-width="1.6" fill="none" marker-end="url(#fzArrow)"/>' +
          '<path class="fz-draw" style="--d:.5s" d="M300 196 Q350 205 362 248" stroke="#222" stroke-width="1.6" fill="none" marker-end="url(#fzArrow)"/>' +
          '<path class="fz-draw" style="--d:.8s" d="M362 338 Q350 382 304 398" stroke="#222" stroke-width="1.6" fill="none" marker-end="url(#fzArrow)"/>' +
          '<path class="fz-draw" style="--d:1.1s" d="M216 398 Q170 382 158 338" stroke="#222" stroke-width="1.6" fill="none" marker-end="url(#fzArrow)"/>' +
          '<path class="fz-draw" style="--d:1.4s" d="M158 248 Q170 205 220 196" stroke="#222" stroke-width="1.6" fill="none" marker-end="url(#fzArrow)"/>' +
          [['Situation', 260, 70, '#2f9e55', 'What triggers the problems', 330, 40, 'start'],
           ['Thoughts', 260, 182, '#2f9e55', 'What was going through your mind?', 318, 152, 'start'],
           ['Emotions', 370, 292, '#2323c8', 'What were you|feeling?', 420, 286, 'start'],
           ['Behaviors', 260, 402, '#a12fd6', 'What did you do? How did you react?', 260, 470, 'middle'],
           ['Bodily', 150, 292, '#e02a3a', 'What was going on|in your body?', 100, 286, 'end']]
            .map(function (n, i) {
              return '<g class="fz-node" style="--d:' + (0.1 + i * 0.15) + 's">' +
                '<circle cx="' + n[1] + '" cy="' + n[2] + '" r="40" fill="#fff" stroke="#e8e8ec" stroke-width="2"/>' +
                '<circle class="fz-spin" style="--c:' + n[3] + ';animation-delay:-' + i * 1.3 + 's" cx="' + n[1] + '" cy="' + n[2] + '" r="40" fill="none" stroke="' + n[3] + '" stroke-width="3.5" stroke-linecap="round" pathLength="100" stroke-dasharray="72 28"/>' +
                '<text x="' + n[1] + '" y="' + (n[2] + (n[0] === 'Bodily' ? -2 : 5)) + '" text-anchor="middle" class="fz-cbt__t">' + n[0] + '</text>' +
                (n[0] === 'Bodily' ? '<text x="150" y="308" text-anchor="middle" class="fz-cbt__t">Sensations</text>' : '') +
                '<text y="' + n[6] + '" text-anchor="' + n[7] + '" class="fz-cbt__q">' + n[4].split('|').map(function (l, k) { return '<tspan x="' + n[5] + '" dy="' + (k ? 14 : 0) + '">' + l + '</tspan>'; }).join('') + '</text>' +
              '</g>';
            }).join('') +
          /* the four-way arrow at the centre */
          '<g class="fz-cross" stroke="#222" stroke-width="1.5" fill="none"><path d="M260 272v40M240 292h40"/><path d="M255 278l5-6 5 6M255 306l5 6 5-6M246 287l-6 5 6 5M274 287l6 5-6 5"/></g>' +
        '</svg>';

      var exposure =
        '<svg class="fz-exp" viewBox="0 0 520 470" role="img" aria-label="Exposure therapy at the centre of three kinds of exposure: imaginal, role-play and real world">' +
          '<g class="fz-exp__ring" transform="rotate(-90 260 245)">' +
            '<circle class="fz-arc" data-k="0" style="--d:.1s" cx="260" cy="245" r="150" fill="none" stroke="#c0504d" stroke-width="14" pathLength="300" stroke-dashoffset="0"/>' +
            '<circle class="fz-arc" data-k="1" style="--d:.5s" cx="260" cy="245" r="150" fill="none" stroke="#9bbb59" stroke-width="14" pathLength="300" stroke-dashoffset="-100"/>' +
            '<circle class="fz-arc" data-k="2" style="--d:.9s" cx="260" cy="245" r="150" fill="none" stroke="#8064a2" stroke-width="14" pathLength="300" stroke-dashoffset="-200"/>' +
          '</g>' +
          '<g class="fz-exp__orbit"><circle cx="260" cy="95" r="7" fill="#fff" stroke="#f52d5d" stroke-width="3"/></g>' +
          '<g class="fz-exp__core"><circle cx="260" cy="245" r="66" fill="#4f81bd"/>' +
            '<text x="260" y="240" text-anchor="middle" class="fz-exp__c">Exposure</text><text x="260" y="268" text-anchor="middle" class="fz-exp__c">Therapy</text></g>' +
          [['#c0504d', 260, 95, ['Imaginal', 'Exposure']], ['#9bbb59', 390, 320, ['Role-', 'play', 'Exposure']], ['#8064a2', 130, 320, ['Real', 'World', 'Exposure']]]
            .map(function (n, i) {
              var y0 = n[2] - (n[3].length - 1) * 8;
              return '<g class="fz-node" data-k="' + i + '" style="--d:' + (0.3 + i * 0.4) + 's"><circle cx="' + n[1] + '" cy="' + n[2] + '" r="50" fill="' + n[0] + '"/>' +
                n[3].map(function (w, k) { return '<text x="' + n[1] + '" y="' + (y0 + k * 17 + 5) + '" text-anchor="middle" class="fz-exp__n">' + w + '</text>'; }).join('') + '</g>';
            }).join('') +
        '</svg>';

      /* WHY VR, AS ON THE BOARD. No cards: the question big in the middle and
         its four answers floating round it, each tied to the word by a curved
         line ending in a dot. The lines draw out from the word and the dots
         land; the word's letters rise and a wave runs through them. The answers
         themselves stay still. One 1000 x 600 plate, so it holds its shape. */
      var whyvr = (function () {
        var L = [
          ['M432 272 C410 240 392 236 372 236', 362, 236, 7],
          ['M552 268 C566 220 606 184 652 178', 662, 178, 11],
          ['M454 384 C430 420 388 438 340 438', 330, 438, 11],
          ['M600 372 C612 396 632 404 664 404', 674, 404, 7],
        ];
        var svg = '<svg class="fw2__svg" viewBox="0 0 1000 600" aria-hidden="true">' + L.map(function (l, i) {
          return '<path class="fw2__line" style="--i:' + i + '" pathLength="1" d="' + l[0] + '"/>' +
            '<g class="fw2__dot" style="--i:' + i + ';transform-origin:' + l[1] + 'px ' + l[2] + 'px">' +
              '<circle class="fw2__ping" cx="' + l[1] + '" cy="' + l[2] + '" r="' + (l[3] + 7) + '"/>' +
              '<circle class="fw2__ring" cx="' + l[1] + '" cy="' + l[2] + '" r="' + (l[3] + 7) + '"/>' +
              '<circle class="fw2__core" cx="' + l[1] + '" cy="' + l[2] + '" r="' + l[3] + '"/></g>';
        }).join('') + '</svg>';
        return '<div class="fw2">' + svg +
          '<p class="fw2__h fw__h" aria-label="Why VR?">' + 'Why VR?'.split('').map(function (ch, i) { return '<span style="--i:' + i + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>'; }).join('') + '</p>' +
          '<div class="fw2__pt fw2__pt--a"><p>As it is accessed privately, people will have less hesitation in trying it out.</p><h5>Non-Judgemental<br>Freedom</h5></div>' +
          '<div class="fw2__pt fw2__pt--b"><p>People can experience the exact environment they need to learn to manage their anxiety and fears.</p><h5>Customised Environment</h5></div>' +
          '<div class="fw2__pt fw2__pt--c"><h5>Flexibility</h5><p>The patient is free to leave and try something else without the risk of triggering more social anxiety.</p></div>' +
          '<div class="fw2__pt fw2__pt--d"><h5>Personal Treatment</h5><p>Reduced dependency on the presence of a therapist or doctor.</p></div>' +
        '</div>';
      })();

      /* THE POWER OF VISUALISATION, COMPACT. The science on the left, and
         the six things visualising helps with as a tidy grid of chips that
         light up one after another, like a thought being pictured. */
      var visual =
        '<div class="fv">' +
          '<div class="fv__txt"><span class="fy-label">Seeing is believing</span><h3>Power of Visualisation</h3>' +
            '<h4>The science behind how visualising works</h4>' +
            '<p>Your amygdala, the brain’s fight-or-flight centre, struggles to tell a vividly pictured situation from a real one.</p></div>' +
          '<ul class="fv__chips">' +
            ['Improved Performance in Sports', 'Boosting Confidence', 'Increasing Focus', 'Managing Stress &amp; Anxiety', 'Managing Depression', 'Managing Chronic Pain']
              .map(function (t) { return '<li class="fv__chip">' + t + '</li>'; }).join('') +
          '</ul>' +
        '</div>';

      var notes = ['A virtual coach that provides guidance and support during social interactions',
        'A customizable avatar that represents the user in the virtual world',
        'A social network of other users with social phobia for support and encouragement',
        'Interactive scenarios, such as job interviews or dating, to practice specific social skills',
        'A personalized experience that adapts to the user’s needs and preferences', 'Medication',
        'Biofeedback sensors to monitor users’ physiological responses and provide real-time feedback on their anxiety levels',
        'A virtual environment that simulates real-life social situations', 'Public speaking, socializing, and dating',
        'Real-time feedback and support to help users navigate different social situations',
        'Integration with mindfulness and relaxation techniques to help users manage their anxiety', 'Breathing Techniques'];
      var brainstorm =
        '<div class="fz-brain">' + sticker('Ohh noo!!') + '<h3 class="fz-h">Brainstorming</h3>' +
          '<p class="fz-brain__p">It enabled me to come up with concepts and insights for creating a successful solution. I was also able to identify opportunities to close those gaps.</p>' +
          '<ul class="fz-notes">' + notes.map(function (n, i) {
            /* a loose cluster: two overlapping rows, each note nudged and tilted */
            var x = (i % 6) * 16.3 + [0, 1.2, -0.6, 1.4, -0.3, 0.8][i % 6] + (i < 6 ? 0 : 2.2);
            var y = (i < 6 ? 0 : 49) + [0, 5, 1, 6, 2, 4][i % 6];
            return '<li style="--i:' + i + ';--x:' + x.toFixed(1) + '%;--y:' + y + '%;--r:' + ([-4, 3, -2, 4.5, -3, 2][(i + (i < 6 ? 0 : 2)) % 6]) + 'deg"><span>' + n + '</span><small>Ishaan Gupta</small></li>';
          }).join('') + '</ul></div>';

      /* FOUR STEPS, ONE PANEL. Numbered like a story, a pink line fills under
         the step being read and moves on by itself while the panel is on screen;
         pointing at the panel holds it, a click takes over for good. The panel
         grows or shrinks to each step, and every step replays its drawing when
         it opens. Interactions live in the controller at the end of this file. */
      var steps = ['Existing treatment', 'Why VR', 'Visualisation', 'Brainstorm'];
      var pane = function (k, html) { return '<section class="fzs-pane' + (k ? '' : ' is-on') + '" role="tabpanel" data-k="' + k + '">' + html + '</section>'; };
      return win('Ideate',
        '<div class="fz fz--dark fz--steps">' +
          '<div class="fzs-nav" role="tablist" aria-label="What already works">' +
            steps.map(function (t, k) {
              return '<button type="button" class="fzs-tab' + (k ? '' : ' is-on') + '" role="tab" data-k="' + k + '" aria-selected="' + (k ? 'false' : 'true') + '">' +
                '<span class="fzs-n">0' + (k + 1) + '</span><span class="fzs-t">' + t + '</span><i class="fzs-bar" aria-hidden="true"><b></b></i></button>';
            }).join('') +
          '</div>' +
          '<div class="fzs-view">' +
            pane(0, '<div class="fz-treat">' +
              '<figure class="fz-card"><figcaption><b>Cognitive Behavioral Therapy</b>People learn different ways of reacting to thoughts and feelings, and they learn to engage in different behaviors that result in decreased fear.<span class="fz-tip">Point at a step of the cycle to see the question it asks.</span></figcaption>' + cbt + '</figure>' +
              '<figure class="fz-card"><figcaption><b>Exposure Therapy</b>In this form of therapy, psychologists create a safe environment in which to “expose” individuals to the things they fear and avoid.<span class="fz-tip" data-def="Point at a kind of exposure to see what it means.">Point at a kind of exposure to see what it means.</span></figcaption>' + exposure + '</figure>' +
            '</div>') +
            pane(1, whyvr) + pane(2, visual) + pane(3, brainstorm) +
          '</div>' +
        '</div>', 'fz-win fz-win--dark');
    })(),

    /* ------------------------------------------------- PERSONAS + EMPATHY
       Frame 6 of the Figma file, as drawn: one dark board, the two personas
       as three staggered columns each (Salman: identity + demographics, then
       goals + behaviours, then challenges + motivations; Babita mirrored, her
       identity on the right), the persona number set huge and faint behind,
       then the empathy map with its dashed X, the person in a dashed ring and
       the four senses around them. Copy is the board's own, word for word. */
    personaBoard: (function () {
      function list(a) { return '<ul>' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; }
      function card(t, items, i) { return '<div class="fp-card" style="--i:' + i + '"><h5><span aria-hidden="true">💡</span> ' + t + '</h5>' + list(items) + '</div>'; }
      function who(p, i) {
        return '<div class="fp-card fp-id" style="--i:' + i + '">' + img(p.av, 'Illustrated avatar of ' + p.name, 179, 179) + '<b>' + p.name + '</b></div>' +
          '<div class="fp-card fp-demo" style="--i:' + (i + 1) + '"><h5><span aria-hidden="true">✨</span> Demographics</h5><dl>' +
            p.demo.map(function (d) { return '<div><dt>' + d[0] + ':</dt><dd>' + d[1] + '</dd></div>'; }).join('') + '</dl>' +
            '<h6><span aria-hidden="true">✨</span> Personality Traits</h6>' +
            '<div class="fp-slider"><span>Introvert</span><span>Extrovert</span><i style="--at:' + p.t[0] + '%"></i></div>' +
            '<div class="fp-slider"><span>Analytical</span><span>Creative</span><i style="--at:' + p.t[1] + '%"></i></div></div>';
      }
      var S = { name: 'Salman Khan', av: 'avatar-salman.webp', t: [30, 86],
        demo: [['Age', '27 years old'], ['Education', 'MBA'], ['Hometown', 'Mumbai'], ['Family', 'Single'], ['Occupation', 'Product Manager']],
        goals: ['Improve public speaking skills to advance career opportunities', 'Feel more confident when presenting in front of groups', 'Overcome fear of being judged or criticized by colleagues'],
        chall: ['Experiences physical symptoms of anxiety, such as sweating, rapid heartbeat, and trembling when speaking in front of groups', 'Has a fear of being judged or criticized by colleagues', 'Avoids public speaking opportunities, which limits career growth potential', 'Difficulty organizing thoughts and creating clear presentations'],
        beh: ['Avoids public speaking opportunities, including presentations, meetings, and conferences', 'Tends to overprepare and obsess over small details, which adds to anxiety and stress', 'Prefers one-on-one conversations or written communication to group settings', 'Has sought out resources such as books or online courses to improve public speaking skills'],
        mot: ['Wants to advance in his career and take on leadership roles', 'Values personal growth and development', 'Desires to overcome fears and build confidence'] };
      var B = { name: 'Babita Iyer', av: 'avatar-babita.webp', t: [30, 86],
        demo: [['Age', '21 years old'], ['Education', 'B.des (UI/UX)'], ['Hometown', 'Mumbai'], ['Family', 'Single'], ['Occupation', 'Student']],
        goals: ['Develop social skills to feel more comfortable in social situations', 'Overcome social anxiety to build and maintain relationships with friends and family', 'Improve self-esteem and confidence'],
        chall: ['Difficulty initiating and maintaining conversations, particularly with new people', 'Avoidance of social situations and events, including parties, clubs, and bars', 'Tends to experience panic attacks in social situations, which adds to anxiety and stress', 'Has a fear of being judged or criticized by others'],
        beh: ['Avoids social situations and events, which limits opportunities for social interaction', 'Experiences physical symptoms of anxiety, such as sweating, rapid heartbeat, and trembling', 'Tends to rely on close friends or family members for support and guidance', 'Has sought out therapy or counseling to help manage social anxiety'],
        mot: ['Wants to make new friends and build meaningful relationships', 'Values personal growth and development', 'Desires to be more independent and self-sufficient'] };

      /* compact: the two personas side by side, three points a box, the
         rest one tap away */
      function mini(p, n, flip) {
        var meta = p.demo.map(function (d) { return d[1]; }).filter(function (v, i) { return i !== 3; }).join(' · ');
        return '<div class="fp-persona fp-mini' + (flip ? ' fp-persona--b' : '') + '"><span class="fp-num" aria-hidden="true">' + n + '</span>' +
          '<div class="fp-card fp-mhead" style="--i:0">' + img(p.av, 'Illustrated avatar of ' + p.name, 179, 179) +
            '<div><b>' + p.name + '</b><span class="fp-meta">' + meta + '</span></div></div>' +
          card('Goals', p.goals.slice(0, 3), 1) + card('Challenges', p.chall.slice(0, 3), 2) +
          '<details class="fp-card fp-more" style="--i:3"><summary><span>Behaviours, motivations &amp; traits</span><i aria-hidden="true">+</i></summary>' +
            '<h6>Behaviours</h6>' + list(p.beh.slice(0, 3)) + '<h6>Motivations</h6>' + list(p.mot.slice(0, 3)) +
            '<div class="fp-slider"><span>Introvert</span><span>Extrovert</span><i style="--at:' + p.t[0] + '%"></i></div>' +
            '<div class="fp-slider"><span>Analytical</span><span>Creative</span><i style="--at:' + p.t[1] + '%"></i></div>' +
          '</details></div>';
      }
      var salman = '<div class="fp-pair">' + mini(S, '01') + mini(B, '02', true) + '</div>';
      var babita = '';

      var I = {
        heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
        ear: '<path d="M7 9a5 5 0 1 1 9.3 2.6c-.9 1.4-2.3 2.2-2.3 4.4a3 3 0 0 1-5.4 1.8"/><path d="M10 9.5a2 2 0 1 1 3.2 1.6"/>',
        lips: '<path d="M2 12c2.5-2.6 5-4 7-3 1.2.4 1.8 1 3 1s1.8-.6 3-1c2-1 4.5.4 7 3-2.6 3.4-6 5-10 5s-7.4-1.6-10-5z"/><path d="M2 12h20"/>',
        eye: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>' };
      function ico(k, cls) { return '<svg class="fp-ico ' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' + I[k] + '</svg>'; }
      var empathy =
        '<div class="fp-emp">' +
          '<svg class="fp-emp__x" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">' +
            '<path d="M0 0 L420 250 M1000 0 L580 250 M0 620 L420 370 M1000 620 L580 370"/></svg>' +
          '<div class="fp-emp__me"><span class="fp-emp__ring" aria-hidden="true"></span>' + img('avatar-empathy.webp', 'The persona at the centre of the empathy map', 340, 339) + '</div>' +
          ico('heart', 'fp-ico--heart') + ico('ear', 'fp-ico--ear') + ico('lips', 'fp-ico--lips') + ico('eye', 'fp-ico--eye') +
          '<div class="fp-q fp-q--think"><h5>Thinks &amp; Feels</h5>' + list(['“Everyone is looking at me and judging me”', '“I’m going to embarrass myself”', '“I wish I could just disappear”']) + '</div>' +
          '<div class="fp-q fp-q--hear"><h5>Hears</h5>' + list(['Internal dialogue with negative self-talk or self-criticism', 'Fear of being judged, criticized, or rejected by others', 'Criticism or negative feedback from authority figures or loved ones']) + '</div>' +
          '<div class="fp-q fp-q--say"><h5>Says &amp; Does</h5>' + list(['Avoids social situations or events', 'Struggles to engage in conversations', 'May use self-deprecating humour to deflect attention away from themselves']) + '</div>' +
          '<div class="fp-q fp-q--see"><h5>Sees</h5>' + list(['Crowded or overwhelming social situations, such as parties', 'Busy or noisy environments, such as restaurants or public transportation', 'Public Speaking opportunities']) + '</div>' +
        '</div>';

      return '<div class="fp-board">' + salman + babita +
        '<span class="fp-label">UX Research</span><h3 class="fp-h">Empathy Map</h3>' + empathy + '</div>';
    })(),

    /* ------------------------------------------------------------- BENTO
       Key Features, laid out as Figma's "Frame 481818": three columns, every
       tile's artwork exported from its own layers (text hidden, then set here
       as live type). The centre tile is two phones built in CSS 3D — a front
       screen, a back with the camera and the wordmark, and stacked layers for
       the edge — turning on their own axes. Every other tile has one small
       motion of its own. All of it pauses under prefers-reduced-motion. */
    bento: (function () {
      function phone(screen, alt, cls) {
        var edge = '';
        for (var z = -5; z <= 5; z++) edge += '<i class="fb-ph__edge" style="--z:' + z + 'px"></i>';
        return '<div class="fb-ph ' + cls + '"><div class="fb-ph__body">' + edge +
          '<div class="fb-ph__face fb-ph__front"><img src="' + A + screen + '" alt="' + alt + '" loading="lazy" decoding="async"><b class="fb-ph__glare"></b><span class="fb-ph__notch"></span></div>' +
          '<div class="fb-ph__face fb-ph__back"><span class="fb-ph__cam"><i></i><i></i><i></i></span><img class="fb-ph__mark" src="' + A + 'wordmark.webp" alt=""></div>' +
        '</div></div>';
      }
      return '<div class="fb-wrap">' +
        '<div class="fb-head">' + sticker('Key Features', 'fy-sticker--white fy-sticker--big') +
          '<span class="fy-tags"><span>About</span><span class="is-on">Unified Solution</span></span></div>' +
        '<div class="fb">' +
          '<div class="fb-col fb-col--l">' +
            '<article class="fb-t fb-quote" style="--g:472"><img class="fb-bg" src="' + A + 'bento-quote.webp" alt="" loading="lazy">' +
              '<span class="fb-quote__mark" aria-hidden="true">“</span><p class="fb-quote__t">' +
              'I wish i could speak up for myself when i had'.split(' ').map(function (w, i) { return '<span style="--i:' + i + '">' + w + '</span>'; }).join(' ') + '</p></article>' +
            '<article class="fb-t fb-vr" style="--g:505"><img class="fb-bg fb-vr__art" src="' + A + 'bento-vr.webp" alt="A Quest 2 headset and controller" loading="lazy">' +
              '<span class="fb-n">04</span><h4>VR integration</h4><p>Kick off on mobile. If you’re hooked, level up your therapy via a virtual reality headset.</p></article>' +
          '</div>' +
          '<div class="fb-col fb-col--m">' +
            '<article class="fb-t fb-card" style="--g:253"><img class="fb-bg" src="' + A + 'bento-cardboard.webp" alt="" loading="lazy"><b class="fb-shine" aria-hidden="true"></b>' +
              '<span class="fb-n">05</span><h4>Affordable<br>Cardboard<br>VR Experience</h4></article>' +
            '<div class="fb-bar" style="--g:24" aria-hidden="true">' + ['#d44a47', '#3fa2db', '#dcc43a', '#2fb03b', '#d8d8dc', '#141416'].map(function (c, i) { return '<i style="--c:' + c + ';--i:' + i + '"></i>'; }).join('') + '</div>' +
            '<article class="fb-t fb-phones" style="--g:499"><div class="fb-stage">' +
              phone('screen-home.webp', 'Fury home screen: analyse yourself, journal, toolkit, alter ego and streak', 'fb-ph--a') +
              phone('screen-toolkit.webp', 'Fury toolkit screen: create your own magical realm, reflections and mindfulness', 'fb-ph--b') +
            '</div></article>' +
            '<div class="fb-row" style="--g:216">' +
              '<article class="fb-t fb-green"><img class="fb-bg" src="' + A + 'bento-green.webp" alt="" loading="lazy"><span class="fb-n">01</span>' +
                '<p class="fb-sel"><span>Read More</span><span>Learn More</span><i class="fb-sel__box"><i></i><i></i><i></i><i></i></i></p></article>' +
              '<article class="fb-t fb-limit"><h4>Limitless Exploration</h4>' +
                '<div class="fb-strip"><div class="fb-strip__track"><img src="' + A + 'bento-sessions.webp" alt="Session thumbnails: public speaking, afraid of darkness, shyness" loading="lazy"><img src="' + A + 'bento-sessions.webp" alt="" loading="lazy"></div></div></article>' +
            '</div>' +
          '</div>' +
          '<div class="fb-col fb-col--r">' +
            '<article class="fb-t fb-ego" style="--g:298"><div class="fb-ego__art"><img class="fb-bg" src="' + A + 'bento-ego.webp" alt="The alter ego: an angry devil behind a happy angel" loading="lazy">' +
              '<span class="fb-ego__mood"><small>Mood</small><b>Happy</b></span></div></article>' +
            '<article class="fb-t fb-wheel" style="--g:727"><img class="fb-bg fb-wheel__art" src="' + A + 'bento-wheel.webp" alt="Emotion bubbles: stressed, shocked, angry, panicked, anxious, overwhelmed, depression" loading="lazy">' +
              '<span class="fb-n">02</span><h4>Wheel of Emotions</h4><p>Develop your emotional literacy &amp; learn to express how you’re feeling</p></article>' +
          '</div>' +
        '</div></div>';
    })(),
  };
})();

/* Count-up for `.fy-count` (the Problem stats). The markup is printed by
   site.js after this file runs, so this waits for it, then counts each number
   up from zero the first time it scrolls into view. The real value is in the
   markup, so without script or with reduced motion the figure is just there. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function run(el) {
    var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = null, dur = 1600;
    function f(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(f);
    }
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(f);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); run(e.target); } });
  }, { threshold: 0.6 });
  var tries = 0;
  (function find() {
    var els = document.querySelectorAll('.fy-count');
    if (els.length) { els.forEach(function (el) { io.observe(el); }); return; }
    if (tries++ < 50) setTimeout(find, 100);
  })();
})();

/* the map is printed by site.js after this file runs; wire it once it lands */
(function () {
  var tries = 0;
  (function find() {
    var els = document.querySelectorAll('.fia');
    if (els.length) {
      Array.prototype.forEach.call(els, function (el) { (el.classList.contains('ftf') ? window.FTF : window.FIA).wire(el); });
      return;
    }
    if (tries++ < 80) setTimeout(find, 100);
  })();
})();


/* THE JOURNEY RUNS OFF THE SCROLL. `.fy-eco__run` is tall and `.fy-eco__pin`
   sticks inside it, so how far you have scrolled through the run is the
   scene's clock, p in 0..1. It is eased toward the real scroll position every
   frame, so a flick of the wheel glides rather than jumps. Phones and
   reduced motion get the flat version: the same parts, stacked, with the
   screens cycling on a timer while it is in view. */
(function () {
  var tries = 0;
  (function find() {
    var host = document.querySelector('.fy-eco');
    if (!host) { if (tries++ < 80) setTimeout(find, 100); return; }
    run(host);
  })();

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function P(p, a, b) { return clamp((p - a) / (b - a)); }
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function $$(r, s) { return Array.prototype.slice.call(r.querySelectorAll(s)); }

  function run(host) {
    var runEl = host.querySelector('.fy-eco__run');
    var steps = $$(host, '.fy-eco__step'), rail = $$(host, '.fy-eco__rail li');
    var phone = host.querySelector('.fy-eco__phone'), visor = host.querySelector('.fy-eco__visor');
    var pShots = $$(phone, '.fy-eco__shot'), vShots = $$(visor, '.fy-eco__shot');
    var eyes = $$(host, '.fy-eco__eye img');
    var notesL = $$(host, '.fy-eco__notes--l li'), notesR = $$(host, '.fy-eco__notes--r li');
    var pens = $$(host, '.fy-eco__pen'), dashes = $$(host, '.fy-eco__dash');
    var arcT = host.querySelector('.fy-eco__arc--t'), arcB = host.querySelector('.fy-eco__arc--b');
    var you = host.querySelector('.fy-eco__you');
    var lenT = arcT.getTotalLength(), lenB = arcB.getTotalLength();
    var flatMQ = matchMedia('(max-width: 760px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* screen i of n is shown between its cut points, with a short crossfade */
    function cross(shots, p, cuts, back) {
      back = back || 0;
      shots.forEach(function (im, i) {
        var a = i === 0 ? -1 : cuts[i], b = cuts[i + 1] == null ? 2 : cuts[i + 1], f = 0.022;
        var o = Math.min(P(p, a - f, a + f), 1 - P(p, b - f, b + f));
        o = i === 0 ? Math.max(o, back) : o * (1 - back);
        im.style.opacity = o.toFixed(3);
        im.style.transform = 'scale(' + (1.05 - 0.05 * o).toFixed(4) + ')';
      });
    }
    function write(li, q) { li.style.setProperty('--q', q.toFixed(3)); li.classList.toggle('is-on', q > 0.02); }

    function paint(p) {
      host.style.setProperty('--p', p.toFixed(4));
      var s = p < 0.45 ? 0 : p < 0.86 ? 1 : 2;
      steps.forEach(function (el, i) { el.classList.toggle('is-on', i === s); });
      rail.forEach(function (el, i) { el.classList.toggle('is-on', i <= s); });

      /* 01: the phone, its screens and its notes */
      var back = P(p, 0.93, 0.97);
      cross(pShots, p, [0, 0.2, 0.33], back);
      notesL.forEach(function (li, i) { var q = P(p, 0.04 + i * 0.075, 0.11 + i * 0.075); write(li, q); pens[i].style.strokeDashoffset = String(1 - q); dashes[i].style.opacity = Math.min(1, q * 4).toFixed(2); });
      host.style.setProperty('--spot', (P(p, 0.37, 0.41) * (1 - P(p, 0.52, 0.56))).toFixed(3));

      /* 02: the handoff along the top arc, the visor opening, its notes */
      var up = ease(P(p, 0.46, 0.6)), down = ease(P(p, 0.86, 0.95));
      arcT.style.strokeDashoffset = String(1 - up);
      arcB.style.strokeDashoffset = String(1 - down);
      var show = P(p, 0.41, 0.45) * (1 - P(p, 0.6, 0.62)) + P(p, 0.85, 0.87) * (1 - P(p, 0.95, 0.97));
      var pt = p < 0.73 ? arcT.getPointAtLength(lenT * up) : arcB.getPointAtLength(lenB * down);
      you.style.left = (pt.x / 10) + '%'; you.style.top = (pt.y / 5.6) + '%';
      you.style.opacity = show.toFixed(3);
      you.style.transform = 'translate(-50%,-50%) scale(' + (0.4 + 0.6 * show).toFixed(3) + ')';
      var iris = ease(P(p, 0.58, 0.67));
      host.style.setProperty('--iris', (iris * 80).toFixed(2) + '%');
      host.style.setProperty('--off', (1 - P(p, 0.6, 0.64)).toFixed(3));
      cross(vShots, p, [0, 0.72, 0.8]);
      eyes.forEach(function (im, i) { im.style.opacity = vShots[i % 3].style.opacity; });
      notesR.forEach(function (li, i) { var q = P(p, 0.64 + i * 0.055, 0.7 + i * 0.055); write(li, q); pens[4 + i].style.strokeDashoffset = String(1 - q); dashes[4 + i].style.opacity = Math.min(1, q * 4).toFixed(2); });

      /* which device is lit */
      var pg = Math.max(1 - P(p, 0.46, 0.52), P(p, 0.94, 0.98));
      var vg = P(p, 0.6, 0.66);
      host.style.setProperty('--pglow', pg.toFixed(3));
      host.style.setProperty('--vglow', vg.toFixed(3));
    }

    /* ---- flat: stacked, everything drawn, screens on a timer ---- */
    var timer = 0, tick = 0, seen = false;
    function flat(on) {
      host.classList.toggle('is-flat', on);
      clearInterval(timer);
      if (!on) return;
      notesL.concat(notesR).forEach(function (li) { write(li, 1); });
      pens.forEach(function (pn) { pn.style.strokeDashoffset = '0'; });
      dashes.forEach(function (d) { d.style.opacity = '1'; });
      host.style.setProperty('--iris', '80%'); host.style.setProperty('--off', '0');
      host.style.setProperty('--pglow', '1'); host.style.setProperty('--vglow', '1');
      function show(k) {
        pShots.forEach(function (im, i) { im.style.opacity = i === k % 3 ? '1' : '0'; im.style.transform = ''; });
        vShots.forEach(function (im, i) { im.style.opacity = i === k % 3 ? '1' : '0'; im.style.transform = ''; });
        eyes.forEach(function (im, i) { im.style.opacity = i % 3 === k % 3 ? '1' : '0'; });
      }
      show(0);
      if (reduce) return;
      timer = setInterval(function () { if (seen) show(++tick); }, 2400);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }).observe(host);

    /* ---- pinned: the scroll is the clock ---- */
    var target = 0, cur = 0, raf = 0;
    function measure() {
      var r = runEl.getBoundingClientRect(), span = r.height - innerHeight;
      target = span > 0 ? clamp(-r.top / span) : 0;
    }
    function loop() {
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      paint(cur);
      raf = cur === target ? 0 : requestAnimationFrame(loop);
    }
    function onScroll() { if (host.classList.contains('is-flat')) return; measure(); if (!raf) raf = requestAnimationFrame(loop); }
    function mode() {
      var f = flatMQ.matches || reduce;
      flat(f);
      if (!f) { measure(); cur = target; paint(cur); }
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    if (flatMQ.addEventListener) flatMQ.addEventListener('change', mode);
    mode();
    host.classList.add('is-ready');
  }
})();

/* the Research switch: one tab shows, the others wait */
(function () {
  var tries = 0;
  (function find() {
    var els = document.querySelectorAll('[data-tabs]');
    if (!els.length) { if (tries++ < 80) setTimeout(find, 100); return; }
    Array.prototype.forEach.call(els, function (root) {
      var tabs = root.querySelectorAll('[data-tab]'), panels = root.querySelectorAll('[data-panel]');
      Array.prototype.forEach.call(tabs, function (t) {
        t.addEventListener('click', function () {
          Array.prototype.forEach.call(tabs, function (x) { x.setAttribute('aria-selected', String(x === t)); });
          Array.prototype.forEach.call(panels, function (p) { p.hidden = p.dataset.panel !== t.dataset.tab; });
        });
      });
    });
  })();
})();

/* THE REVENUE WHEEL PAYS IN. Assembles when it scrolls in, then pays in one
   stream at a time, round the wheel, while it is on screen. Pointing at a
   stream (its segment or its note) makes it pay in now. */
(function () {
  var tries = 0;
  (function find() {
    var w = document.querySelector('.fy-rv');
    if (!w) { if (tries++ < 80) setTimeout(find, 100); return; }
    run(w);
  })();
  function run(w) {
    var host = w.closest('.fy-rev');
    var order = w.dataset.order.split(' ');
    var segs = {}, pts = {};
    Array.prototype.forEach.call(w.querySelectorAll('.fy-rv__seg'), function (g) { segs[g.dataset.s] = g; });
    Array.prototype.forEach.call(host.querySelectorAll('.fy-rev__pt'), function (p) { pts[p.dataset.s] = p; });
    var fill = w.querySelector('.fy-rv__fill'), bag = w.querySelector('.fy-rv__bag'), count = w.querySelector('.fy-rv__count b');
    var ANG = { doc: 240, pro: 300, day: 0, rent: 60, med: 120, ads: 180 };
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var paid = {}, k = 0, timer = 0, live = false, held = null;

    function setFill() {
      var n = Object.keys(paid).length;
      fill.style.strokeDasharray = n + ' 6';
      count.textContent = n;
      host.classList.toggle('is-full', n === 6);
    }
    function light(id) {
      Object.keys(segs).forEach(function (s) { segs[s].classList.toggle('is-on', s === id); pts[s].classList.toggle('is-on', s === id); });
      host.classList.toggle('has-on', !!id);
    }
    function coins(id) {
      var a = ANG[id] * Math.PI / 180, future = segs[id].classList.contains('is-future');
      var sx = 50 + 37.75 * Math.cos(a), sy = 50 + 37.75 * Math.sin(a);
      for (var i = 0; i < 5; i++) (function (i) {
        var c = document.createElement('span');
        c.className = 'fy-rv__coin' + (future ? ' is-ghost' : '');
        c.textContent = '₹';
        c.style.left = sx + '%'; c.style.top = sy + '%';
        w.appendChild(c);
        var dx = (50 - sx), dy = (50 - sy);
        /* a little arc: out from the wheel, then in to the bag */
        var nx = -dy * 0.35 + (i - 2) * 1.6, ny = dx * 0.35 + (i - 2) * 1.6;
        var W = w.clientWidth / 100;
        var anim = c.animate([
          { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 },
          { transform: 'translate(calc(-50% + ' + (nx * 0.6) * W + 'px), calc(-50% + ' + (ny * 0.6) * W + 'px)) scale(1)', opacity: 1, offset: .25 },
          { transform: 'translate(calc(-50% + ' + (dx * 0.55 + nx * 0.5) * W + 'px), calc(-50% + ' + (dy * 0.55 + ny * 0.5) * W + 'px)) scale(.95) rotate(120deg)', opacity: 1, offset: .6 },
          { transform: 'translate(calc(-50% + ' + dx * W + 'px), calc(-50% + ' + (dy + 4) * W + 'px)) scale(.4) rotate(260deg)', opacity: 0 },
        ], { duration: 1100 + i * 90, delay: i * 110, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'both' });
        anim.onfinish = function () {
          c.remove();
          if (i === 4) {
            paid[id] = 1; setFill();
            bag.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-46%) scale(1.08,.94)' }, { transform: 'translate(-50%,-52%) scale(.97,1.04)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 520, easing: 'cubic-bezier(.3,1.5,.5,1)' });
          }
        };
      })(i);
    }
    function pay(id) { light(id); coins(id); }
    function step() {
      if (held) return;
      if (Object.keys(paid).length === 6 && k % 6 === 0) {
        /* full: rest a beat, then empty and go round again */
        light(null);
        timer = setTimeout(function () { paid = {}; setFill(); timer = setTimeout(step, 700); }, 2200);
        return;
      }
      pay(order[k % 6]); k++;
      timer = setTimeout(step, 1700);
    }
    function start() { if (live) return; live = true; clearTimeout(timer); timer = setTimeout(step, 900); }
    function stop() { live = false; clearTimeout(timer); }

    function hold(id) { held = id; stop(); pay(id); }
    function release() { held = null; light(null); start(); }
    Object.keys(segs).forEach(function (id) {
      [segs[id], pts[id]].forEach(function (el) {
        el.addEventListener('pointerenter', function () { hold(id); });
        el.addEventListener('pointerleave', release);
        el.addEventListener('focus', function () { hold(id); });
        el.addEventListener('blur', release);
      });
    });

    if (reduce || !('IntersectionObserver' in window)) { host.classList.add('is-in', 'is-still'); order.forEach(function (id) { paid[id] = 1; }); setFill(); return; }
    setFill();
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { host.classList.add('is-in'); if (!held) start(); }
        else stop();
      });
    }, { threshold: 0.35 }).observe(w);
  }
})();

/* TURNS: anything marked data-cycle lights its items one after another
   (.is-hot), but only while it is on screen and only after it has drawn in.
   Pointing at an item holds it. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var tries = 0;
  (function find() {
    var els = document.querySelectorAll('[data-cycle]');
    if (!els.length) { if (tries++ < 80) setTimeout(find, 100); return; }
    Array.prototype.forEach.call(els, function (root) {
      var items = Array.prototype.slice.call(root.querySelectorAll(root.dataset.cycle));
      var k = 0, t = 0, live = false, held = false;
      function set(i) { items.forEach(function (it, j) { it.classList.toggle('is-hot', j === i); }); }
      function tick() { if (!held) { set(k % items.length); k++; } t = setTimeout(tick, 1600); }
      items.forEach(function (it, j) {
        it.addEventListener('pointerenter', function () { held = true; set(j); k = j + 1; });
        it.addEventListener('pointerleave', function () { held = false; });
      });
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting && !live) { live = true; t = setTimeout(tick, 1800); }
          else if (!en.isIntersecting && live) { live = false; clearTimeout(t); set(-1); }
        });
      }, { threshold: 0.4 }).observe(root);
    });
  })();
})();

/* FAQ highlights: each answer lights its marks in order as it scrolls in */
(function () {
  var tries = 0;
  (function find() {
    var lis = document.querySelectorAll('.fy-faq li');
    if (!lis.length) { if (tries++ < 80) setTimeout(find, 100); return; }
    if (!('IntersectionObserver' in window)) { Array.prototype.forEach.call(lis, function (li) { li.classList.add('is-lit'); }); return; }
    Array.prototype.forEach.call(lis, function (li) {
      Array.prototype.forEach.call(li.querySelectorAll('mark'), function (m, i) { m.style.setProperty('--d', (0.15 + i * 0.55) + 's'); });
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-lit'); io.unobserve(en.target); } });
    }, { threshold: 0.6, rootMargin: '0px 0px -12% 0px' });
    Array.prototype.forEach.call(lis, function (li) { io.observe(li); });
  })();
})();

/* the problem statement: the circle is drawn round "socially anxious" when the
   line comes into view */
(function () {
  var tries = 0;
  (function find() {
    var el = document.querySelector('.fy-ps');
    if (!el) { if (tries++ < 80) setTimeout(find, 100); return; }
    if (!('IntersectionObserver' in window)) { el.classList.add('is-on'); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { el.classList.add('is-on'); io.disconnect(); } });
    }, { threshold: 0.8 });
    io.observe(el);
  })();
})();



/* THE TWO FLOWS, PLAYED AS FILMS. Each prototype is rendered frame by frame
   from the real screens (real slides, scrolls, taps and the moving parts:
   the cycling word, the ticked boxes, the picked chip, the sound pad) into
   one smooth video. The video plays in the phone frame; the steps beside it
   follow its clock, and clicking a step seeks to it. Flow 2 ends by drawing a
   Google Cardboard in white line and dropping the phone into its slot.
   Plays only while in view. */
(function () {
  var P = 'assets/img/fury/proto/';
  var FLOWS = {
    onboarding: { dur: 35.03, steps: [
      [0, 'A calm first impression', 'No sign-up wall and no noise. The splash and welcome set a quiet, private tone for people who already find the world loud.'],
      [8.38, 'Why are you here?', 'One honest question up front. Fury uses the answers to pick the strategies and VR sessions it suggests from day one.'],
      [11.88, 'Name the feeling', 'Picking a word is easier than explaining. A pool of emotions builds emotional literacy, and each one says what it means.'],
      [18.72, 'Tell us why', 'A few words, a time of day, maybe a photo. Over time these check-ins reveal the triggers behind the feeling.'],
      [21.85, 'Try a strategy', 'Help arrives right away: a short exercise before anything else, with “Not right now” always there.'],
      [24.6, 'Well done', 'Small wins are celebrated, and the streak nudges a habit: people are more likely to stick with it after three days in a row.'],
      [28.43, 'Home, already yours', 'The first check-in lands on a home that reflects it: the Alter Ego, the streak, the breakdown and resources picked for you.'],
    ] },
    therapy: { dur: 20.17, cardboard: 16.3, steps: [
      [0, 'Into the Toolkit', 'Therapy is one tap from home. Reflections, mindfulness and live personalisation sit together in the Toolkit.'],
      [4.03, 'Pick a place', 'Choosing where to practise (an auditorium for a talk, an island to unwind) gives people control before they face anything hard.'],
      [6.52, 'Tune the sound', 'One pad sets the energy of the space, from relaxing to energetic, so the session starts at a level that feels safe.'],
      [10.65, 'Into the headset', 'Clear, illustrated steps for putting the phone into the headset, and a centre line to align the two screens.'],
      [16.27, 'Step into the room', 'The phone becomes the headset. A Google Cardboard is enough: no expensive hardware between someone and their first session.'],
    ] },
  };

  function html(id) {
    var F = FLOWS[id];
    return '<div class="fpt fpt--film' + (F.cardboard ? ' fpt--cb' : '') + '" data-flow="' + id + '">' +
      '<div class="fpt__stage">' +
        (F.cardboard ? '<svg class="fcb fcb--back" viewBox="-122.8 -260.5 258.7 266.5" aria-hidden="true" xmlns:c2pa="http://c2pa.org/manifest"><metadata><c2pa:manifest>AAAWgmp1bWIAAAAeanVtZGMycGEAEQAQgAAAqgA4m3EDYzJwYQAAABZcanVtYgAAAEdqdW1kYzJtYQARABCAAACqADibcQN1cm46YzJwYTo2MDU4NjkwYS0yNDhiLTQ2MjItOTc1Mi1iNGVmYjU0NDA4YjkAAAADl2p1bWIAAAApanVtZGMyYXMAEQAQgAAAqgA4m3EDYzJwYS5hc3NlcnRpb25zAAAAALxqdW1iAAAARGp1bWRjYm9yABEAEIAAAKoAOJtxE2MycGEuaW5ncmVkaWVudC52MwAAAAAYYzJzaLz+2BeBAqGpBLYd6rX0zWgAAABwY2JvcqNpZGM6Zm9ybWF0bWltYWdlL3N2Zyt4bWxqaW5zdGFuY2VJRHgseG1wOmlpZDoyZjZlZjk0Ni1iNGM3LTRmODUtYjA3YS05ZGFmM2Y3OWY0MWRscmVsYXRpb25zaGlwaHBhcmVudE9mAAAB4mp1bWIAAABBanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5hY3Rpb25zLnYyAAAAABhjMnNo/C060CQdg7LC/lXLeR8sAwAAAZljYm9yomdhY3Rpb25zgqJmYWN0aW9ua2MycGEub3BlbmVkanBhcmFtZXRlcnOha2luZ3JlZGllbnRzgaJjdXJseC1zZWxmI2p1bWJmPWMycGEuYXNzZXJ0aW9ucy9jMnBhLmluZ3JlZGllbnQudjNkaGFzaFgg43rYAvWBxJtVvx6i5HBBYdqiXVPKR/antE25u6ZuSu6kZmFjdGlvbngdY29tLmFudGhyb3BpYy5jbGF1ZGUucHJvdmlkZWRqcGFyYW1ldGVyc6F4H2NvbS5hbnRocm9waWMub3JpZ2luLWNvbmZpZGVuY2VndW5rbm93bmtkZXNjcmlwdGlvbnhmQ2xhdWRlIHByb3ZpZGVkIHRoaXMgZmlsZSBhdCB0aGUgcmVxdWVzdCBvZiBhIHVzZXIgYW5kIG1heSBoYXZlIGNyZWF0ZWQgb3IgbW9kaWZpZWQgdGhlIGZpbGUgY29udGVudHMubXNvZnR3YXJlQWdlbnShZG5hbWVmQ2xhdWRlcmFsbEFjdGlvbnNJbmNsdWRlZPUAAADIanVtYgAAAEBqdW1kY2JvcgARABCAAACqADibcRNjMnBhLmhhc2guZGF0YQAAAAAYYzJzaDOOVAkRcjbOQhMZaKISTpsAAACAY2JvcqVjYWxnZnNoYTI1NmNwYWRNAAAAAAAAAAAAAAAAAGRoYXNoWCD/LHXRM9wyJ+/08f2BSD9PK9MIEOmMq/UsYsaUUO2MX2RuYW1lbmp1bWJmIG1hbmlmZXN0amV4Y2x1c2lvbnOBomVzdGFydBiRZmxlbmd0aBkeBAAAAj5qdW1iAAAAJ2p1bWRjMmNsABEAEIAAAKoAOJtxA2MycGEuY2xhaW0udjIAAAACD2Nib3KlY2FsZ2ZzaGEyNTZpc2lnbmF0dXJleE1zZWxmI2p1bWJmPS9jMnBhL3VybjpjMnBhOjYwNTg2OTBhLTI0OGItNDYyMi05NzUyLWI0ZWZiNTQ0MDhiOS9jMnBhLnNpZ25hdHVyZWppbnN0YW5jZUlEeCx4bXA6aWlkOjNjZWZiZGFmLTc5ZTctNDBiNS05YmUxLTAwYTgxZmZkNjYxZXJjcmVhdGVkX2Fzc2VydGlvbnODomN1cmx4LXNlbGYjanVtYmY9YzJwYS5hc3NlcnRpb25zL2MycGEuaW5ncmVkaWVudC52M2RoYXNoWCDjetgC9YHEm1W/HqLkcEFh2qJdU8pH9qe0Tbm7pm5K7qJjdXJseCpzZWxmI2p1bWJmPWMycGEuYXNzZXJ0aW9ucy9jMnBhLmFjdGlvbnMudjJkaGFzaFggarXmE7MZt6V/IpAqBUDEnDHDBScmDNA6gKbB8wIT+hyiY3VybHgpc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5oYXNoLmRhdGFkaGFzaFgg8yFUvztfs38bM3S9NrhrQe3epTw4w9Gl+fSA3LXPiaJ0Y2xhaW1fZ2VuZXJhdG9yX2luZm+jZG5hbWVvQW50aHJvcGljIEZpbGVzZ3ZlcnNpb25lMS4wLjBrc3BlY1ZlcnNpb25lMi40LjAAABA4anVtYgAAAChqdW1kYzJjcwARABCAAACqADibcQNjMnBhLnNpZ25hdHVyZQAAABAIY2JvctKEWQISogEmGCFZAgowggIGMIIBjaADAgECAhRA5aAK7sI50L64g/oGQgU9Z1UTADAKBggqhkjOPQQDAzBJMRcwFQYDVQQKEw5BbnRocm9waWMsIFBCQzEuMCwGA1UEAxMlQW50aHJvcGljIENvbnRlbnQgQ3JlZGVudGlhbHMgUm9vdCBDQTAeFw0yNjA4MDcxODQzNTZaFw0yODA4MDYxOTQzNTZaMEQxFzAVBgNVBAoTDkFudGhyb3BpYywgUEJDMSkwJwYDVQQDEyBBbnRocm9waWMgQ2xhdWRlIENvbnRlbnQgU2lnbmluZzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABJh6CmvLUBgFFNU0vUKlOVtE6djd17L5SuwX0LemFisBM3dkd/3cyjxFA3Qo5S46fX0/ihY0VZ7mfb9KF703t5OjWDBWMA4GA1UdDwEB/wQEAwIHgDAVBgNVHSUEDjAMBgorBgEEAYPoXgIBMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUzlHiBIFOZFsj+OPEz5o+nMHXXMIwCgYIKoZIzj0EAwMDZwAwZAIwMXMdFJ4BetLLVY7ORuE9noqbbAZOZn/aArXyTwFAZfKrPzxF2vPoJNf1+UCdg1XGAjBwX1zd9WGqYkqmL5SFqw1QySjr1zJfpJM9+1rdDwSPLMOPOjKuiXjoU/pUUeG9RwmhY3BhZFkNngAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPZYQI+TPJNxAv5rXbovDCIAVJ6YsdIg7qpnQTGKG9au7wFqmIL2pIEVhJ5NMTWgFOYuJqFbBgDNaS/r6101gjxfDtE=</c2pa:manifest></metadata><path class="l face" d="M-72.96 -40.83 L-103.60 -119.80 L-106.40 -127.32 L-108.93 -134.83 L-111.17 -142.21 L-113.07 -149.33 L-114.61 -156.05 L-115.74 -162.28 L-116.46 -167.90 L-116.76 -172.82 L-116.62 -176.95 L-116.05 -180.22 L-115.06 -182.58 L-113.67 -183.98 L-8.01 -244.98 L-6.24 -245.41 L-4.12 -244.84 L-1.68 -243.31 L1.02 -240.82 L3.95 -237.43 L7.06 -233.18 L10.29 -228.16 L13.58 -222.45 L16.89 -216.15 L20.14 -209.36 L23.30 -202.20 L26.30 -194.80 L56.94 -115.83 Z" pathLength="1"/><path class="l face" d="M-71.01 -41.00 L-101.65 -119.97 L-104.45 -127.49 L-106.98 -135.01 L-109.22 -142.39 L-111.12 -149.50 L-112.66 -156.23 L-113.79 -162.46 L-114.51 -168.08 L-114.81 -172.99 L-114.67 -177.12 L-114.10 -180.39 L-113.11 -182.75 L-111.72 -184.16 L-6.06 -245.16 L-4.29 -245.58 L-2.17 -245.02 L0.27 -243.48 L2.97 -240.99 L5.90 -237.60 L9.01 -233.36 L12.24 -228.34 L15.53 -222.62 L18.84 -216.32 L22.09 -209.53 L25.25 -202.37 L28.25 -194.97 L58.89 -116.00 Z" pathLength="1"/><path class="l face" d="M-57.16 -33.00 L72.75 -108.00 L58.89 -116.00 L-71.01 -41.00 Z" pathLength="1"/><path class="t" d="M-67.55 -43.00 L55.43 -114.00" pathLength="1"/><path class="t" d="M-75.34 -79.48 L-61.49 -87.48 L-80.54 -136.59 L-94.40 -128.59 Z" pathLength="1"/><path class="t" d="M23.38 -136.48 L37.24 -144.48 L18.19 -193.59 L4.33 -185.59 Z" pathLength="1"/><path class="l pf" d="M-60.62 -175.47 L69.28 -250.47 L62.35 -254.47 L-67.55 -179.47 Z" pathLength="1"/><path class="l pf" d="M-60.62 -101.00 L-60.62 -175.47 L-67.55 -179.47 L-67.55 -105.00 Z" pathLength="1"/><path class="t" d="M-36.81 -191.72 L-22.95 -199.72" pathLength="1"/><g class="dots"><circle cx="-74.5" cy="-83.3" r=".55"/><circle cx="-74.8" cy="-87.9" r=".55"/><circle cx="-77.6" cy="-91.2" r=".55"/><circle cx="-77.8" cy="-95.9" r=".55"/><circle cx="-80.6" cy="-99.1" r=".55"/><circle cx="-80.9" cy="-103.8" r=".55"/><circle cx="-83.7" cy="-107.0" r=".55"/><circle cx="-84.0" cy="-111.7" r=".55"/><circle cx="-86.8" cy="-115.0" r=".55"/><circle cx="-87.1" cy="-119.6" r=".55"/><circle cx="-89.9" cy="-122.9" r=".55"/><circle cx="-90.1" cy="-127.6" r=".55"/><circle cx="-72.0" cy="-84.7" r=".55"/><circle cx="-72.2" cy="-89.4" r=".55"/><circle cx="-75.0" cy="-92.6" r=".55"/><circle cx="-75.3" cy="-97.3" r=".55"/><circle cx="-78.1" cy="-100.6" r=".55"/><circle cx="-78.4" cy="-105.2" r=".55"/><circle cx="-81.2" cy="-108.5" r=".55"/><circle cx="-81.5" cy="-113.2" r=".55"/><circle cx="-84.3" cy="-116.4" r=".55"/><circle cx="-84.5" cy="-121.1" r=".55"/><circle cx="-87.3" cy="-124.3" r=".55"/><circle cx="-87.6" cy="-129.0" r=".55"/><circle cx="-69.5" cy="-86.2" r=".55"/><circle cx="-69.7" cy="-90.8" r=".55"/><circle cx="-72.5" cy="-94.1" r=".55"/><circle cx="-72.8" cy="-98.8" r=".55"/><circle cx="-75.6" cy="-102.0" r=".55"/><circle cx="-75.9" cy="-106.7" r=".55"/><circle cx="-78.7" cy="-109.9" r=".55"/><circle cx="-79.0" cy="-114.6" r=".55"/><circle cx="-81.8" cy="-117.9" r=".55"/><circle cx="-82.0" cy="-122.5" r=".55"/><circle cx="-84.8" cy="-125.8" r=".55"/><circle cx="-85.1" cy="-130.5" r=".55"/><circle cx="-66.9" cy="-87.6" r=".55"/><circle cx="-67.2" cy="-92.3" r=".55"/><circle cx="-70.0" cy="-95.5" r=".55"/><circle cx="-70.3" cy="-100.2" r=".55"/><circle cx="-73.1" cy="-103.5" r=".55"/><circle cx="-73.4" cy="-108.1" r=".55"/><circle cx="-76.2" cy="-111.4" r=".55"/><circle cx="-76.4" cy="-116.1" r=".55"/><circle cx="-79.2" cy="-119.3" r=".55"/><circle cx="-79.5" cy="-124.0" r=".55"/><circle cx="-82.3" cy="-127.2" r=".55"/><circle cx="-82.6" cy="-131.9" r=".55"/><circle cx="-64.4" cy="-89.1" r=".55"/><circle cx="-67.5" cy="-97.0" r=".55"/><circle cx="-70.6" cy="-104.9" r=".55"/><circle cx="-73.7" cy="-112.8" r=".55"/><circle cx="-76.7" cy="-120.8" r=".55"/><circle cx="-79.8" cy="-128.7" r=".55"/><circle cx="24.2" cy="-140.3" r=".55"/><circle cx="24.0" cy="-144.9" r=".55"/><circle cx="21.2" cy="-148.2" r=".55"/><circle cx="20.9" cy="-152.9" r=".55"/><circle cx="18.1" cy="-156.1" r=".55"/><circle cx="17.8" cy="-160.8" r=".55"/><circle cx="15.0" cy="-164.0" r=".55"/><circle cx="14.7" cy="-168.7" r=".55"/><circle cx="12.0" cy="-172.0" r=".55"/><circle cx="11.7" cy="-176.6" r=".55"/><circle cx="8.9" cy="-179.9" r=".55"/><circle cx="8.6" cy="-184.6" r=".55"/><circle cx="26.8" cy="-141.7" r=".55"/><circle cx="26.5" cy="-146.4" r=".55"/><circle cx="23.7" cy="-149.6" r=".55"/><circle cx="23.4" cy="-154.3" r=".55"/><circle cx="20.6" cy="-157.6" r=".55"/><circle cx="20.3" cy="-162.2" r=".55"/><circle cx="17.5" cy="-165.5" r=".55"/><circle cx="17.3" cy="-170.2" r=".55"/><circle cx="14.5" cy="-173.4" r=".55"/><circle cx="14.2" cy="-178.1" r=".55"/><circle cx="11.4" cy="-181.3" r=".55"/><circle cx="11.1" cy="-186.0" r=".55"/><circle cx="29.3" cy="-143.2" r=".55"/><circle cx="29.0" cy="-147.8" r=".55"/><circle cx="26.2" cy="-151.1" r=".55"/><circle cx="25.9" cy="-155.8" r=".55"/><circle cx="23.1" cy="-159.0" r=".55"/><circle cx="22.8" cy="-163.7" r=".55"/><circle cx="20.0" cy="-166.9" r=".55"/><circle cx="19.8" cy="-171.6" r=".55"/><circle cx="17.0" cy="-174.9" r=".55"/><circle cx="16.7" cy="-179.5" r=".55"/><circle cx="13.9" cy="-182.8" r=".55"/><circle cx="13.6" cy="-187.5" r=".55"/><circle cx="31.8" cy="-144.6" r=".55"/><circle cx="31.5" cy="-149.3" r=".55"/><circle cx="28.7" cy="-152.5" r=".55"/><circle cx="28.4" cy="-157.2" r=".55"/><circle cx="25.6" cy="-160.5" r=".55"/><circle cx="25.4" cy="-165.1" r=".55"/><circle cx="22.6" cy="-168.4" r=".55"/><circle cx="22.3" cy="-173.1" r=".55"/><circle cx="19.5" cy="-176.3" r=".55"/><circle cx="19.2" cy="-181.0" r=".55"/><circle cx="16.4" cy="-184.2" r=".55"/><circle cx="16.1" cy="-188.9" r=".55"/><circle cx="34.3" cy="-146.1" r=".55"/><circle cx="31.2" cy="-154.0" r=".55"/><circle cx="28.1" cy="-161.9" r=".55"/><circle cx="25.1" cy="-169.8" r=".55"/><circle cx="22.0" cy="-177.8" r=".55"/><circle cx="18.9" cy="-185.7" r=".55"/></g></svg><svg class="fcb fcb--front" viewBox="-122.8 -260.5 258.7 266.5" aria-hidden="true" xmlns:c2pa="http://c2pa.org/manifest"><metadata><c2pa:manifest>AAAWgmp1bWIAAAAeanVtZGMycGEAEQAQgAAAqgA4m3EDYzJwYQAAABZcanVtYgAAAEdqdW1kYzJtYQARABCAAACqADibcQN1cm46YzJwYTpjMDRiYjcwNS04NWY3LTQ0YjUtOWIzYy1mN2E1MWNjM2Y2ODEAAAADl2p1bWIAAAApanVtZGMyYXMAEQAQgAAAqgA4m3EDYzJwYS5hc3NlcnRpb25zAAAAALxqdW1iAAAARGp1bWRjYm9yABEAEIAAAKoAOJtxE2MycGEuaW5ncmVkaWVudC52MwAAAAAYYzJzaIW5xhB2LEP4d1QsC3zbXgsAAABwY2JvcqNpZGM6Zm9ybWF0bWltYWdlL3N2Zyt4bWxqaW5zdGFuY2VJRHgseG1wOmlpZDplZWRkOGIwYS01YzM2LTQyNzYtOGM3Ny1kNTY2N2QwOWM5MGVscmVsYXRpb25zaGlwaHBhcmVudE9mAAAB4mp1bWIAAABBanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5hY3Rpb25zLnYyAAAAABhjMnNozUXc7KBedXpR+AjtdweGQAAAAZljYm9yomdhY3Rpb25zgqJmYWN0aW9ua2MycGEub3BlbmVkanBhcmFtZXRlcnOha2luZ3JlZGllbnRzgaJjdXJseC1zZWxmI2p1bWJmPWMycGEuYXNzZXJ0aW9ucy9jMnBhLmluZ3JlZGllbnQudjNkaGFzaFgg3NydOQn7TPb81cwcv79gbNGXiKJkdptHBLYazBkdsPekZmFjdGlvbngdY29tLmFudGhyb3BpYy5jbGF1ZGUucHJvdmlkZWRqcGFyYW1ldGVyc6F4H2NvbS5hbnRocm9waWMub3JpZ2luLWNvbmZpZGVuY2VndW5rbm93bmtkZXNjcmlwdGlvbnhmQ2xhdWRlIHByb3ZpZGVkIHRoaXMgZmlsZSBhdCB0aGUgcmVxdWVzdCBvZiBhIHVzZXIgYW5kIG1heSBoYXZlIGNyZWF0ZWQgb3IgbW9kaWZpZWQgdGhlIGZpbGUgY29udGVudHMubXNvZnR3YXJlQWdlbnShZG5hbWVmQ2xhdWRlcmFsbEFjdGlvbnNJbmNsdWRlZPUAAADIanVtYgAAAEBqdW1kY2JvcgARABCAAACqADibcRNjMnBhLmhhc2guZGF0YQAAAAAYYzJzaHm/me5GW1K+RrkrGTbdV8UAAACAY2JvcqVjYWxnZnNoYTI1NmNwYWRNAAAAAAAAAAAAAAAAAGRoYXNoWCAtLtRve3KC7DqlT/fmKnCwRnAc+ehMtHk7J6U6F0SuU2RuYW1lbmp1bWJmIG1hbmlmZXN0amV4Y2x1c2lvbnOBomVzdGFydBiSZmxlbmd0aBkeBAAAAj5qdW1iAAAAJ2p1bWRjMmNsABEAEIAAAKoAOJtxA2MycGEuY2xhaW0udjIAAAACD2Nib3KlY2FsZ2ZzaGEyNTZpc2lnbmF0dXJleE1zZWxmI2p1bWJmPS9jMnBhL3VybjpjMnBhOmMwNGJiNzA1LTg1ZjctNDRiNS05YjNjLWY3YTUxY2MzZjY4MS9jMnBhLnNpZ25hdHVyZWppbnN0YW5jZUlEeCx4bXA6aWlkOmRiY2E1OTk4LWY5ZTQtNDA3Zi04ZDQzLTk3ODRmNTlmMzIxNHJjcmVhdGVkX2Fzc2VydGlvbnODomN1cmx4LXNlbGYjanVtYmY9YzJwYS5hc3NlcnRpb25zL2MycGEuaW5ncmVkaWVudC52M2RoYXNoWCDc3J05CftM9vzVzBy/v2Bs0ZeIomR2m0cEthrMGR2w96JjdXJseCpzZWxmI2p1bWJmPWMycGEuYXNzZXJ0aW9ucy9jMnBhLmFjdGlvbnMudjJkaGFzaFggaO1lFNYbmmugFgB7EhE6mPlAi39EsPjEEQOkQfH7IyqiY3VybHgpc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5oYXNoLmRhdGFkaGFzaFggQMj5O5SXN979azXb3JuAEZspgvgxH2AIu67oadxSett0Y2xhaW1fZ2VuZXJhdG9yX2luZm+jZG5hbWVvQW50aHJvcGljIEZpbGVzZ3ZlcnNpb25lMS4wLjBrc3BlY1ZlcnNpb25lMi40LjAAABA4anVtYgAAAChqdW1kYzJjcwARABCAAACqADibcQNjMnBhLnNpZ25hdHVyZQAAABAIY2JvctKEWQISogEmGCFZAgowggIGMIIBjaADAgECAhRA5aAK7sI50L64g/oGQgU9Z1UTADAKBggqhkjOPQQDAzBJMRcwFQYDVQQKEw5BbnRocm9waWMsIFBCQzEuMCwGA1UEAxMlQW50aHJvcGljIENvbnRlbnQgQ3JlZGVudGlhbHMgUm9vdCBDQTAeFw0yNjA4MDcxODQzNTZaFw0yODA4MDYxOTQzNTZaMEQxFzAVBgNVBAoTDkFudGhyb3BpYywgUEJDMSkwJwYDVQQDEyBBbnRocm9waWMgQ2xhdWRlIENvbnRlbnQgU2lnbmluZzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABJh6CmvLUBgFFNU0vUKlOVtE6djd17L5SuwX0LemFisBM3dkd/3cyjxFA3Qo5S46fX0/ihY0VZ7mfb9KF703t5OjWDBWMA4GA1UdDwEB/wQEAwIHgDAVBgNVHSUEDjAMBgorBgEEAYPoXgIBMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUzlHiBIFOZFsj+OPEz5o+nMHXXMIwCgYIKoZIzj0EAwMDZwAwZAIwMXMdFJ4BetLLVY7ORuE9noqbbAZOZn/aArXyTwFAZfKrPzxF2vPoJNf1+UCdg1XGAjBwX1zd9WGqYkqmL5SFqw1QySjr1zJfpJM9+1rdDwSPLMOPOjKuiXjoU/pUUeG9RwmhY3BhZFkNngAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPZYQBAamyxMx+Tdt6ZxoaDnBZPsnjIx2uZdnz67/sLO6WIE1NxDGLU/hLuettO30UVOayzPTFjuFgKOpXOba/M8gMw=</c2pa:manifest></metadata><path class="L face" d="M0.00 -0.00 L43.30 -25.00 L43.65 -37.60 L44.67 -43.86 L46.27 -49.12 L48.31 -53.85 L50.64 -58.16 L53.09 -62.06 L55.50 -65.50 L57.78 -68.47 L59.85 -70.93 L61.70 -72.91 L63.38 -74.41 L64.95 -75.50 L66.53 -76.23 L68.20 -76.66 L70.05 -76.83 L72.12 -76.75 L74.40 -76.41 L76.82 -75.76 L79.26 -74.69 L81.59 -73.06 L83.64 -70.69 L85.23 -67.28 L86.25 -62.20 L86.60 -50.00 L129.90 -75.00 L129.90 -167.00 L0.00 -92.00 Z" pathLength="1"/><path class="L face" d="M0.00 -0.00 L-57.16 -33.00 L-57.16 -125.00 L0.00 -92.00 Z" pathLength="1"/><path class="L face" d="M0.00 -92.00 L129.90 -167.00 L72.75 -200.00 L-57.16 -125.00 Z" pathLength="1"/><path class="l face" d="M43.65 -37.60 L44.67 -43.86 L46.27 -49.12 L48.31 -53.85 L50.64 -58.16 L53.09 -62.06 L55.50 -65.50 L57.78 -68.47 L49.12 -73.47 L46.84 -70.50 L44.43 -67.06 L41.98 -63.16 L39.65 -58.85 L37.61 -54.12 L36.01 -48.86 L34.99 -42.60 Z" pathLength="1"/><path class="t" d="M34.99 -42.60 L36.01 -48.86 L37.61 -54.12 L39.65 -58.85 L41.98 -63.16 L44.43 -67.06 L46.84 -70.50 L49.12 -73.47 L51.19 -75.93 L53.04 -77.91 L54.72 -79.41 L56.29 -80.50 L57.87 -81.23 L59.54 -81.66 L61.39 -81.83 L63.46 -81.75 L65.74 -81.41 L68.16 -80.76 L70.60 -79.69 L72.93 -78.06 L74.98 -75.69 L76.57 -72.28 L77.59 -67.20" pathLength="1"/><path class="t" d="M-5.20 -3.00 L-5.20 -95.00" pathLength="1"/><path class="t" d="M5.20 -89.00 L124.71 -158.00" pathLength="1"/><path class="l face" d="M49.80 -90.75 L49.75 -92.07 L49.59 -93.32 L49.34 -94.50 L48.99 -95.58 L48.54 -96.57 L48.00 -97.46 L47.37 -98.24 L47.77 -100.63 L47.33 -101.99 L45.94 -101.69 L44.07 -100.14 L43.08 -100.30 L42.05 -100.32 L40.96 -100.22 L39.85 -99.98 L38.70 -99.61 L37.54 -99.12 L36.37 -98.50 L35.20 -97.77 L34.04 -96.92 L32.90 -95.97 L31.78 -94.91 L30.70 -93.77 L29.66 -92.55 L28.67 -91.25 L26.81 -90.64 L25.41 -89.33 L24.97 -87.46 L25.38 -85.54 L24.75 -84.04 L24.21 -82.53 L23.76 -81.02 L23.41 -79.53 L23.15 -78.06 L23.00 -76.63 L22.95 -75.25 L23.00 -73.93 L23.15 -72.68 L23.41 -71.50 L23.76 -70.42 L24.21 -69.43 L24.75 -68.54 L25.38 -67.76 L24.97 -65.37 L25.41 -64.01 L26.81 -64.31 L28.67 -65.86 L29.66 -65.70 L30.70 -65.68 L31.78 -65.78 L32.90 -66.02 L34.04 -66.39 L35.20 -66.88 L36.37 -67.50 L37.54 -68.23 L38.70 -69.08 L39.85 -70.03 L40.96 -71.09 L42.05 -72.23 L43.08 -73.45 L44.07 -74.75 L45.94 -75.36 L47.33 -76.67 L47.77 -78.54 L47.37 -80.46 L48.00 -81.96 L48.54 -83.47 L48.99 -84.98 L49.34 -86.47 L49.59 -87.94 L49.75 -89.37 Z" pathLength="1"/><path class="t" d="M46.33 -88.75 L46.29 -89.73 L46.18 -90.66 L45.99 -91.53 L45.73 -92.34 L45.40 -93.07 L45.00 -93.73 L44.53 -94.31 L44.00 -94.80 L43.42 -95.20 L42.77 -95.51 L42.09 -95.72 L41.35 -95.83 L40.58 -95.85 L39.78 -95.77 L38.95 -95.60 L38.10 -95.32 L37.24 -94.96 L36.37 -94.50 L35.51 -93.96 L34.64 -93.33 L33.80 -92.62 L32.97 -91.84 L32.16 -90.99 L31.39 -90.08 L30.66 -89.12 L29.97 -88.11 L29.33 -87.07 L28.74 -85.99 L28.21 -84.89 L27.75 -83.77 L27.35 -82.65 L27.01 -81.53 L26.75 -80.42 L26.57 -79.33 L26.45 -78.27 L26.41 -77.25 L26.45 -76.27 L26.57 -75.34 L26.75 -74.47 L27.01 -73.66 L27.35 -72.93 L27.75 -72.27 L28.21 -71.69 L28.74 -71.20 L29.33 -70.80 L29.97 -70.49 L30.66 -70.28 L31.39 -70.17 L32.16 -70.15 L32.97 -70.23 L33.80 -70.40 L34.64 -70.68 L35.51 -71.04 L36.37 -71.50 L37.24 -72.04 L38.10 -72.67 L38.95 -73.38 L39.78 -74.16 L40.58 -75.01 L41.35 -75.92 L42.09 -76.88 L42.77 -77.89 L43.42 -78.93 L44.00 -80.01 L44.53 -81.11 L45.00 -82.23 L45.40 -83.35 L45.73 -84.47 L45.99 -85.58 L46.18 -86.67 L46.29 -87.73 Z" pathLength="1"/><path class="t" d="M35.17 -90.18 L34.35 -89.48 L33.56 -88.68 L32.80 -87.80 L32.11 -86.84 L31.47 -85.83 L30.91 -84.77 L30.43 -83.69 L30.04 -82.60 L29.75 -81.51 L29.55 -80.45" pathLength="1"/><path class="l face" d="M106.95 -123.75 L106.90 -125.07 L106.75 -126.32 L106.50 -127.50 L106.14 -128.58 L105.70 -129.57 L105.16 -130.46 L104.53 -131.24 L104.93 -133.63 L104.49 -134.99 L103.10 -134.69 L101.23 -133.14 L100.24 -133.30 L99.20 -133.32 L98.12 -133.22 L97.00 -132.98 L95.86 -132.61 L94.70 -132.12 L93.53 -131.50 L92.36 -130.77 L91.20 -129.92 L90.06 -128.97 L88.94 -127.91 L87.86 -126.77 L86.82 -125.55 L85.83 -124.25 L83.96 -123.64 L82.57 -122.33 L82.13 -120.46 L82.53 -118.54 L81.91 -117.04 L81.37 -115.53 L80.92 -114.02 L80.56 -112.53 L80.31 -111.06 L80.16 -109.63 L80.11 -108.25 L80.16 -106.93 L80.31 -105.68 L80.56 -104.50 L80.92 -103.42 L81.37 -102.43 L81.91 -101.54 L82.53 -100.76 L82.13 -98.37 L82.57 -97.01 L83.96 -97.31 L85.83 -98.86 L86.82 -98.70 L87.86 -98.68 L88.94 -98.78 L90.06 -99.02 L91.20 -99.39 L92.36 -99.88 L93.53 -100.50 L94.70 -101.23 L95.86 -102.08 L97.00 -103.03 L98.12 -104.09 L99.20 -105.23 L100.24 -106.45 L101.23 -107.75 L103.10 -108.36 L104.49 -109.67 L104.93 -111.54 L104.53 -113.46 L105.16 -114.96 L105.70 -116.47 L106.14 -117.98 L106.50 -119.47 L106.75 -120.94 L106.90 -122.37 Z" pathLength="1"/><path class="t" d="M103.49 -121.75 L103.45 -122.73 L103.34 -123.66 L103.15 -124.53 L102.89 -125.34 L102.56 -126.07 L102.16 -126.73 L101.69 -127.31 L101.16 -127.80 L100.57 -128.20 L99.93 -128.51 L99.24 -128.72 L98.51 -128.83 L97.74 -128.85 L96.94 -128.77 L96.11 -128.60 L95.26 -128.32 L94.40 -127.96 L93.53 -127.50 L92.66 -126.96 L91.80 -126.33 L90.95 -125.62 L90.12 -124.84 L89.32 -123.99 L88.55 -123.08 L87.82 -122.12 L87.13 -121.11 L86.49 -120.07 L85.90 -118.99 L85.37 -117.89 L84.91 -116.77 L84.50 -115.65 L84.17 -114.53 L83.91 -113.42 L83.72 -112.33 L83.61 -111.27 L83.57 -110.25 L83.61 -109.27 L83.72 -108.34 L83.91 -107.47 L84.17 -106.66 L84.50 -105.93 L84.91 -105.27 L85.37 -104.69 L85.90 -104.20 L86.49 -103.80 L87.13 -103.49 L87.82 -103.28 L88.55 -103.17 L89.32 -103.15 L90.12 -103.23 L90.95 -103.40 L91.80 -103.68 L92.66 -104.04 L93.53 -104.50 L94.40 -105.04 L95.26 -105.67 L96.11 -106.38 L96.94 -107.16 L97.74 -108.01 L98.51 -108.92 L99.24 -109.88 L99.93 -110.89 L100.57 -111.93 L101.16 -113.01 L101.69 -114.11 L102.16 -115.23 L102.56 -116.35 L102.89 -117.47 L103.15 -118.58 L103.34 -119.67 L103.45 -120.73 Z" pathLength="1"/><path class="t" d="M92.33 -123.18 L91.51 -122.48 L90.71 -121.68 L89.96 -120.80 L89.27 -119.84 L88.63 -118.83 L88.07 -117.77 L87.59 -116.69 L87.20 -115.60 L86.91 -114.51 L86.71 -113.45" pathLength="1"/><path class="l" d="M-34.64 -86.00 L-34.55 -87.16 L-34.28 -88.18 L-33.83 -89.03 L-33.22 -89.68 L-32.48 -90.11 L-31.61 -90.31 L-30.65 -90.27 L-29.63 -90.00 L-28.58 -89.50 L-27.53 -88.79 L-26.51 -87.88 L-25.55 -86.81 L-24.68 -85.61 L-23.93 -84.32 L-23.33 -82.97 L-22.88 -81.61 L-22.61 -80.27 L-22.52 -79.00 L-22.52 -55.00 L-22.61 -53.84 L-22.88 -52.82 L-23.33 -51.97 L-23.93 -51.32 L-24.68 -50.89 L-25.55 -50.69 L-26.51 -50.73 L-27.53 -51.00 L-28.58 -51.50 L-29.63 -52.21 L-30.65 -53.12 L-31.61 -54.19 L-32.48 -55.39 L-33.22 -56.68 L-33.83 -58.03 L-34.28 -59.39 L-34.55 -60.73 L-34.64 -62.00 Z" pathLength="1"/><path class="l face" d="M-35.16 -72.30 L-35.14 -72.95 L-35.06 -73.56 L-34.94 -74.14 L-34.76 -74.67 L-34.54 -75.16 L-34.28 -75.59 L-33.97 -75.97 L-33.62 -76.30 L-33.23 -76.56 L-32.81 -76.76 L-32.35 -76.91 L-31.87 -76.98 L-31.36 -76.99 L-30.83 -76.94 L-30.28 -76.82 L-29.72 -76.64 L-29.15 -76.40 L-28.58 -76.10 L-28.01 -75.74 L-27.44 -75.32 L-26.88 -74.86 L-26.33 -74.34 L-25.80 -73.78 L-25.29 -73.18 L-24.80 -72.55 L-24.35 -71.88 L-23.92 -71.19 L-23.54 -70.47 L-23.19 -69.75 L-22.88 -69.01 L-22.61 -68.27 L-22.39 -67.53 L-22.22 -66.80 L-22.10 -66.08 L-22.02 -65.38 L-22.00 -64.70 L-22.02 -64.05 L-22.10 -63.44 L-22.22 -62.86 L-22.39 -62.33 L-22.61 -61.84 L-22.88 -61.41 L-23.19 -61.03 L-23.54 -60.70 L-23.92 -60.44 L-24.35 -60.24 L-24.80 -60.09 L-25.29 -60.02 L-25.80 -60.01 L-26.33 -60.06 L-26.88 -60.18 L-27.44 -60.36 L-28.01 -60.60 L-28.58 -60.90 L-29.15 -61.26 L-29.72 -61.68 L-30.28 -62.14 L-30.83 -62.66 L-31.36 -63.22 L-31.87 -63.82 L-32.35 -64.45 L-32.81 -65.12 L-33.23 -65.81 L-33.62 -66.53 L-33.97 -67.25 L-34.28 -67.99 L-34.54 -68.73 L-34.76 -69.47 L-34.94 -70.20 L-35.06 -70.92 L-35.14 -71.62 Z" pathLength="1"/><path class="t" d="M-31.52 -70.20 L-31.51 -70.49 L-31.48 -70.76 L-31.42 -71.02 L-31.35 -71.26 L-31.25 -71.48 L-31.13 -71.67 L-30.99 -71.84 L-30.83 -71.99 L-30.66 -72.11 L-30.47 -72.20 L-30.27 -72.26 L-30.05 -72.29 L-29.82 -72.30 L-29.59 -72.28 L-29.34 -72.22 L-29.09 -72.14 L-28.84 -72.04 L-28.58 -71.90 L-28.32 -71.74 L-28.07 -71.55 L-27.82 -71.34 L-27.57 -71.11 L-27.33 -70.86 L-27.11 -70.59 L-26.89 -70.31 L-26.69 -70.01 L-26.50 -69.70 L-26.32 -69.38 L-26.17 -69.06 L-26.03 -68.73 L-25.91 -68.40 L-25.81 -68.07 L-25.73 -67.74 L-25.68 -67.42 L-25.65 -67.10 L-25.63 -66.80 L-25.65 -66.51 L-25.68 -66.24 L-25.73 -65.98 L-25.81 -65.74 L-25.91 -65.52 L-26.03 -65.33 L-26.17 -65.16 L-26.32 -65.01 L-26.50 -64.89 L-26.69 -64.80 L-26.89 -64.74 L-27.11 -64.71 L-27.33 -64.70 L-27.57 -64.72 L-27.82 -64.78 L-28.07 -64.86 L-28.32 -64.96 L-28.58 -65.10 L-28.84 -65.26 L-29.09 -65.45 L-29.34 -65.66 L-29.59 -65.89 L-29.82 -66.14 L-30.05 -66.41 L-30.27 -66.69 L-30.47 -66.99 L-30.66 -67.30 L-30.83 -67.62 L-30.99 -67.94 L-31.13 -68.27 L-31.25 -68.60 L-31.35 -68.93 L-31.42 -69.26 L-31.48 -69.58 L-31.51 -69.90 Z" pathLength="1"/><path class="t" d="M-6.93 -106.00 L22.52 -123.00 L8.66 -131.00 L-20.78 -114.00 Z" pathLength="1"/><path class="t" d="M76.21 -154.00 L105.66 -171.00 L91.80 -179.00 L62.35 -162.00 Z" pathLength="1"/><path class="t" d="M-51.96 -125.00 L72.75 -197.00" pathLength="1"/><path class="t h" d="M-5.89 -107.80 L-16.28 -115.40" pathLength="1"/><path class="t h" d="M-3.64 -109.10 L-14.03 -116.70" pathLength="1"/><path class="t h" d="M-1.39 -110.40 L-11.78 -118.00" pathLength="1"/><path class="t h" d="M0.87 -111.70 L-9.53 -119.30" pathLength="1"/><path class="t h" d="M3.12 -113.00 L-7.27 -120.60" pathLength="1"/><path class="t h" d="M5.37 -114.30 L-5.02 -121.90" pathLength="1"/><path class="t h" d="M7.62 -115.60 L-2.77 -123.20" pathLength="1"/><path class="t h" d="M9.87 -116.90 L-0.52 -124.50" pathLength="1"/><path class="t h" d="M12.12 -118.20 L1.73 -125.80" pathLength="1"/><path class="t h" d="M14.38 -119.50 L3.98 -127.10" pathLength="1"/><path class="t h" d="M16.63 -120.80 L6.24 -128.40" pathLength="1"/><path class="t h" d="M18.88 -122.10 L8.49 -129.70" pathLength="1"/><path class="t h" d="M77.25 -155.80 L66.86 -163.40" pathLength="1"/><path class="t h" d="M79.50 -157.10 L69.11 -164.70" pathLength="1"/><path class="t h" d="M81.75 -158.40 L71.36 -166.00" pathLength="1"/><path class="t h" d="M84.00 -159.70 L73.61 -167.30" pathLength="1"/><path class="t h" d="M86.26 -161.00 L75.86 -168.60" pathLength="1"/><path class="t h" d="M88.51 -162.30 L78.12 -169.90" pathLength="1"/><path class="t h" d="M90.76 -163.60 L80.37 -171.20" pathLength="1"/><path class="t h" d="M93.01 -164.90 L82.62 -172.50" pathLength="1"/><path class="t h" d="M95.26 -166.20 L84.87 -173.80" pathLength="1"/><path class="t h" d="M97.51 -167.50 L87.12 -175.10" pathLength="1"/><path class="t h" d="M99.77 -168.80 L89.37 -176.40" pathLength="1"/><path class="t h" d="M102.02 -170.10 L91.63 -177.70" pathLength="1"/></svg>' : '') +
        '<div class="fpt__phone"><div class="fpt__screen">' +
          '<video muted playsinline preload="metadata" poster="' + P + 'flow-' + id + '.webp">' +
            '<source src="' + P + 'flow-' + id + '.webm" type="video/webm"><source src="' + P + 'flow-' + id + '.mp4" type="video/mp4"></video>' +
        '</div><img class="fpt__frame" src="assets/img/fury/phone-frame.webp" alt="" width="418" height="842" decoding="async"></div>' +
      '</div>' +
      '<ol class="fpt__steps">' + F.steps.map(function (s, i) {
        return '<li><button type="button" data-s="' + i + '"><span class="fpt__n">0' + (i + 1) + '</span><span class="fpt__body"><b>' + s[1] + '</b><span>' + s[2] + '</span></span><i class="fpt__bar"><i></i></i></button></li>';
      }).join('') + '</ol>' +
    '</div>';
  }
  window.FURY_PROTO = { html: html };

  var tries = 0;
  (function find() {
    var els = document.querySelectorAll('.fpt--film');
    if (!els.length) { if (tries++ < 80) setTimeout(find, 100); return; }
    Array.prototype.forEach.call(els, run);
  })();

  function run(root) {
    var F = FLOWS[root.dataset.flow], v = root.querySelector('video');
    var btns = root.querySelectorAll('.fpt__steps button'), bars = root.querySelectorAll('.fpt__bar i');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    v.muted = true;
    var holdCb = 0;
    function tick() {
      var t = v.currentTime || 0, s = 0;
      for (var i = 0; i < F.steps.length; i++) if (t >= F.steps[i][0] - .05) s = i;
      Array.prototype.forEach.call(btns, function (b, j) {
        b.classList.toggle('is-on', j === s); b.classList.toggle('is-done', j < s);
        var a = F.steps[j][0], z = j + 1 < F.steps.length ? F.steps[j + 1][0] : F.dur;
        bars[j].style.transform = 'scaleX(' + (j < s ? 1 : j > s ? 0 : Math.min(1, (t - a) / (z - a))).toFixed(3) + ')';
      });
      if (F.cardboard) root.classList.toggle('is-cb', t >= F.cardboard);
      if (live) raf = requestAnimationFrame(tick);
    }
    var live = false, raf = 0;
    /* flow 2 holds on the cardboard a moment before it loops */
    v.addEventListener('ended', function () {
      if (!live) return;
      clearTimeout(holdCb);
      holdCb = setTimeout(function () { root.classList.remove('is-cb'); v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); }, F.cardboard ? 3200 : 600);
    });
    function play() { if (live) return; live = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); raf = requestAnimationFrame(tick); }
    function stop() { live = false; v.pause(); cancelAnimationFrame(raf); clearTimeout(holdCb); }
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () {
        clearTimeout(holdCb); root.classList.remove('is-cb');
        v.currentTime = F.steps[+b.dataset.s][0] + .02;
        if (!live) { live = true; raf = requestAnimationFrame(tick); }
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      });
    });
    if (reduce || !('IntersectionObserver' in window)) { v.controls = true; tick(); return; }
    tick();
    new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) play(); else stop(); });
    }, { threshold: 0.45 }).observe(root);
  }
})();
window.STUDY_HTML.protoOnboarding = window.FURY_PROTO.html('onboarding');
window.STUDY_HTML.protoTherapy = window.FURY_PROTO.html('therapy');

/* INSIDE THE HEADSET: load the 3D scene (fury-vr.js + three.js, ~200 KB
   gzipped) only when the VR chapter is about to scroll in. Without WebGL or
   with reduced motion nothing loads and the flat rows stay. */
(function () {
  var tries = 0;
  (function find() {
    var host = document.querySelector('.fvr');
    if (!host) { if (tries++ < 80) setTimeout(find, 100); return; }
    var gl = null;
    try { var c = document.createElement('canvas'); gl = c.getContext('webgl2') || c.getContext('webgl'); } catch (e) {}
    if (!gl || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      import(new URL('assets/js/fury-vr.js?v=4', document.baseURI).href)
        .then(function (m) { m.mount(host); })
        .catch(function (e) { if (window.console) console.warn('fury-vr', e); });
    }, { rootMargin: '1200px 0px' });
    io.observe(host);
  })();
})();
/* architecture and task flows, side by side in one row */
window.STUDY_HTML.iaFlows = '<div class="fy-duo">' +
  '<div class="fy-duo__c"><p class="fy-duo__h">Information architecture</p>' + window.STUDY_HTML.ia + '</div>' +
  '<div class="fy-duo__c"><p class="fy-duo__h">Task flows</p>' + window.STUDY_HTML.flows + '</div>' +
  '<ul class="fy-duo__key" aria-label="Key">' +
    '<li><svg viewBox="0 0 22 8" aria-hidden="true"><path d="M1 4h19M16.5 1.2 20 4l-3.5 2.8"/></svg>Leads to</li>' +
    '<li><i class="fy-duo__sw fy-duo__sw--tab"></i>Tab bar section</li>' +
    '<li><i class="fy-duo__sw fy-duo__sw--end"></i>Start and end</li>' +
    '<li><i class="fy-duo__sw fy-duo__sw--choice"></i>Check-in / a choice</li>' +
    '<li><i class="fia__vr">VR</i>In the headset</li><li><i class="ftf__ai">AI</i>AI-assisted</li>' +
  '</ul></div>';



/* THE "WHAT ALREADY WORKS" STEPS: switching, autoplay, animated height,
   replayed drawings, and the four interactions (diagram hover, Why VR answers,
   visualisation chips, draggable sticky notes). */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EXP = ['Picturing the feared situation in vivid detail, guided step by step.',
    'Acting the situation out with someone else, where nothing is at stake.',
    'Facing the real situation in everyday life, a little at a time.'];
  function bind(root) {
    if (root.dataset.bound) return; root.dataset.bound = '1';
    var tabs = [].slice.call(root.querySelectorAll('.fzs-tab'));
    var panes = [].slice.call(root.querySelectorAll('.fzs-pane'));
    var view = root.querySelector('.fzs-view');
    var cur = 0, manual = false, chipT = 0, chipK = 0;

    function play(p) {
      p.classList.remove('is-play'); void p.offsetWidth;
      requestAnimationFrame(function () { requestAnimationFrame(function () { p.classList.add('is-play'); }); });
    }
    function chips(on) {
      clearTimeout(chipT);
      var cs = [].slice.call(panes[2].querySelectorAll('.fv__chip'));
      cs.forEach(function (c) { c.classList.remove('is-hot'); });
      if (!on || reduce) return;
      (function tick() {
        if (!panes[2].dataset.held) { cs.forEach(function (c, j) { c.classList.toggle('is-hot', j === chipK % cs.length); }); chipK++; }
        chipT = setTimeout(tick, 1100);
      })();
    }
    function go(k, user) {
      if (user) { manual = true; root.classList.add('is-manual'); }
      if (k === cur && !user) return;
      var h0 = view.offsetHeight;
      tabs.forEach(function (t, j) { t.classList.toggle('is-on', j === k); t.setAttribute('aria-selected', j === k ? 'true' : 'false'); });
      panes.forEach(function (p, j) { p.classList.toggle('is-on', j === k); });
      cur = k; play(panes[k]); chips(k === 2);
      if (!reduce) {
        var h1 = view.offsetHeight;
        view.classList.add('is-sizing');
        view.style.height = h0 + 'px'; void view.offsetHeight;
        view.style.height = h1 + 'px';
        clearTimeout(view._t); view._t = setTimeout(function () { view.style.height = ''; view.classList.remove('is-sizing'); }, 520);
      }
    }
    tabs.forEach(function (t, j) { t.addEventListener('click', function () { go(j, true); }); });
    /* autoplay: the active tab's line fills over 7s; when it ends, the next step */
    tabs.forEach(function (t) {
      t.querySelector('.fzs-bar b').addEventListener('animationend', function () { if (!manual) go((cur + 1) % tabs.length); });
    });
    root.addEventListener('pointerenter', function () { root.classList.add('is-held'); });
    root.addEventListener('pointerleave', function () { root.classList.remove('is-held'); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          root.classList.toggle('is-live', e.isIntersecting);
          if (e.isIntersecting && !root.dataset.seen) { root.dataset.seen = '1'; play(panes[cur]); }
        });
      }, { threshold: 0.35 }).observe(root);
    } else { root.classList.add('is-live'); play(panes[0]); }

    /* CBT: point at a step and its question lights; the rest step back */
    var cbt = root.querySelector('.fz-cbt');
    if (cbt) [].forEach.call(cbt.querySelectorAll('.fz-node'), function (n) {
      n.addEventListener('pointerenter', function () { cbt.classList.add('has-hot'); n.classList.add('is-hot'); });
      n.addEventListener('pointerleave', function () { cbt.classList.remove('has-hot'); n.classList.remove('is-hot'); });
    });
    /* exposure: point at a kind and its arc lights, with a line on what it is */
    var exp = root.querySelector('.fz-exp'), tip = exp && exp.closest('.fz-card').querySelector('.fz-tip');
    if (exp) [].forEach.call(exp.querySelectorAll('.fz-node[data-k]'), function (n) {
      var k = n.getAttribute('data-k');
      n.addEventListener('pointerenter', function () {
        exp.setAttribute('data-on', k); tip.textContent = EXP[+k]; tip.classList.add('is-on');
      });
      n.addEventListener('pointerleave', function () {
        exp.removeAttribute('data-on'); tip.textContent = tip.getAttribute('data-def'); tip.classList.remove('is-on');
      });
    });
    /* Why VR: point at an answer and its line and dot light */
    var fw = root.querySelector('.fw2');
    if (fw) {
      var lines = fw.querySelectorAll('.fw2__line'), dots = fw.querySelectorAll('.fw2__dot');
      ['a', 'b', 'c', 'd'].forEach(function (c, j) {
        var pt = fw.querySelector('.fw2__pt--' + c); if (!pt) return;
        pt.addEventListener('pointerenter', function () { fw.classList.add('has-hot'); pt.classList.add('is-hot'); lines[j].classList.add('is-hot'); dots[j].classList.add('is-hot'); });
        pt.addEventListener('pointerleave', function () { fw.classList.remove('has-hot'); pt.classList.remove('is-hot'); lines[j].classList.remove('is-hot'); dots[j].classList.remove('is-hot'); });
      });
    }
    /* visualisation: pointing at a chip holds it */
    [].forEach.call(panes[2].querySelectorAll('.fv__chip'), function (c) {
      c.addEventListener('pointerenter', function () { panes[2].dataset.held = '1'; [].forEach.call(panes[2].querySelectorAll('.fv__chip'), function (x) { x.classList.toggle('is-hot', x === c); }); });
      c.addEventListener('pointerleave', function () { delete panes[2].dataset.held; });
    });
    /* sticky notes: pick one up and move it */
    var wall = root.querySelector('.fz-notes'), z = 60;
    if (wall) [].forEach.call(wall.querySelectorAll('li'), function (li) {
      li.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        var r = wall.getBoundingClientRect(), sx = e.clientX, sy = e.clientY;
        var x0 = parseFloat(li.style.getPropertyValue('--x')), y0 = parseFloat(li.style.getPropertyValue('--y'));
        li.setPointerCapture(e.pointerId); li.classList.add('is-drag'); li.style.zIndex = ++z;
        function mv(ev) {
          var x = Math.max(-2, Math.min(86, x0 + (ev.clientX - sx) / r.width * 100));
          var y = Math.max(-4, Math.min(62, y0 + (ev.clientY - sy) / r.height * 100));
          li.style.setProperty('--x', x.toFixed(2) + '%'); li.style.setProperty('--y', y.toFixed(2) + '%');
        }
        function up() { li.classList.remove('is-drag'); li.removeEventListener('pointermove', mv); li.removeEventListener('pointerup', up); li.removeEventListener('pointercancel', up); }
        li.addEventListener('pointermove', mv); li.addEventListener('pointerup', up); li.addEventListener('pointercancel', up);
      });
    });
  }
  function scan() { [].forEach.call(document.querySelectorAll('.fz--steps'), bind); }
  scan(); new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();

/* A PEEK INTO THE HEADSET, FLOATING. A small looping clip of the VR room,
   recorded from the chapter itself, that invites a visitor to see the real
   thing before reading their way down to it. It floats at the bottom right of
   the whole study (outside the hero, so the hero's parallax can't shake it).
   While the page scrolls it tucks away to a sliver at the right edge and
   glides back once scrolling stops; inside the VR room itself it steps aside.
   A small x hides it for the rest of the visit. A click glides straight into
   the room. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var M = 'assets/media/fury/', KEY = 'fury-peek-off';
  var el = null, tuckT = 0, raf = 0;
  function off() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function intoRoom() {
    var run = document.querySelector('.fvr__run'); if (!run) return;
    var beh = reduce ? 'auto' : 'smooth';
    function inside() { var r = run.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? r.top + scrollY + span * 0.21 : null; }
    var t = inside();
    if (t != null) { scrollTo({ top: t, behavior: beh }); return; }
    var host = run.closest('.fvr') || run;
    scrollTo({ top: host.getBoundingClientRect().top + scrollY, behavior: beh });
    var n = 0;
    (function wait() {
      var y = inside();
      if (y != null && Math.abs(run.getBoundingClientRect().top) < innerHeight) { scrollTo({ top: y, behavior: beh }); return; }
      if (n++ < 60) setTimeout(wait, 100);
    })();
  }
  function build() {
    var a = document.createElement('a');
    a.className = 'fpeek'; a.href = '#design';
    a.setAttribute('aria-label', 'See it in VR: jump to the VR experience');
    a.innerHTML = '<span class="fpeek__media">' +
        (reduce ? '<img src="' + M + 'vr-peek.webp" alt="">' :
          '<video muted loop playsinline autoplay preload="auto" poster="' + M + 'vr-peek.webp">' +
            '<source src="' + M + 'vr-peek.webm" type="video/webm"><source src="' + M + 'vr-peek.mp4" type="video/mp4"></video>') +
      '</span><span class="fpeek__t">See it in VR <i aria-hidden="true">→</i></span>' +
      '<button type="button" class="fpeek__x" aria-label="Hide the VR preview">×</button>';
    var v = a.querySelector('video'); if (v) { v.muted = true; v.play && v.play().catch(function () {}); }
    a.addEventListener('click', function (e) {
      if (e.target.closest('.fpeek__x')) {
        e.preventDefault(); e.stopPropagation();
        try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
        a.classList.remove('is-on'); setTimeout(function () { a.remove(); el = null; }, 400);
        return;
      }
      e.preventDefault(); intoRoom();
    });
    document.body.appendChild(a);
    setTimeout(function () { a.classList.add('is-on'); }, reduce ? 0 : 1200);
    return a;
  }
  function inVR() {
    var run = document.querySelector('.fvr__run'), r;
    if (run && run.getBoundingClientRect().height > innerHeight) { r = run.getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5; }
    var host = document.querySelector('.fvr');
    if (!host) return false;
    r = host.getBoundingClientRect(); return r.top < innerHeight * 0.4 && r.bottom > innerHeight * 0.6;
  }
  function sync() {
    raf = 0;
    var onFury = !!document.querySelector('body[data-project="fury"] .fhero');
    if (!onFury || off()) { if (el) { el.remove(); el = null; } return; }
    if (!el || !el.isConnected) el = build();
    el.classList.toggle('is-away', inVR());
  }
  addEventListener('scroll', function () {
    if (!raf) raf = requestAnimationFrame(sync);
    if (!el || reduce) return;
    el.classList.add('is-tuck');
    clearTimeout(tuckT);
    tuckT = setTimeout(function () { if (el) el.classList.remove('is-tuck'); }, 600);
  }, { passive: true });
  addEventListener('resize', function () { if (!raf) raf = requestAnimationFrame(sync); });
  new MutationObserver(function () { if (!raf) raf = requestAnimationFrame(sync); }).observe(document.documentElement, { childList: true, subtree: true });
  sync();
})();


/* the testers count rolls only once its card is properly on screen */
(function () {
  function bind() {
    [].forEach.call(document.querySelectorAll('.fy-slot:not([data-b])'), function (el) {
      el.setAttribute('data-b', '1');
      if (!('IntersectionObserver' in window)) { el.classList.add('is-roll'); return; }
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { el.classList.add('is-roll'); io.disconnect(); }
      }, { threshold: 1, rootMargin: '0px 0px -15% 0px' });
      io.observe(el);
    });
  }
  bind(); new MutationObserver(bind).observe(document.documentElement, { childList: true, subtree: true });
})();
