/* THE SAFETY NET FOR THE CLEANUP.
 *
 * The brief's one absolute rule is that nothing changes — not a pixel, not a
 * timing, not an interaction. So the only acceptable test of a refactor is a
 * comparison against the site as it stood before it, and the comparison has
 * to be made on the two things a reader can actually perceive:
 *
 *   GEOMETRY AND STYLE. Every box on every page, keyed by its position in the
 *   tree rather than by document order, with the computed values that decide
 *   how it looks. Keyed structurally because a diff by document order reports
 *   every element after an insertion as changed — that mistake cost a whole
 *   round earlier in this project.
 *
 *   PIXELS. The rendered page, full height. Style equality can miss a painted
 *   difference — a gradient stop, a shadow, an SVG attribute — and pixels
 *   cannot. Everything that moves on its own is excluded by a recorded mask
 *   (see `moveMask`) so the rest can be compared with no tolerance at all.
 *
 * WHAT MUST BE HELD STILL FIRST. This site is full of deliberate randomness —
 * a star field, scattered preview words, a random line of copy, springs
 * integrated from a clock — and none of it can be compared between two loads.
 * Each of those is frozen through the page's own seams (a fixed Math.random,
 * reduced motion, and a settling wait) rather than by hiding elements, so what
 * is compared is still the real composition.
 *
 * Run it before touching anything to record the baseline, then after each pass.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import { PNG } from 'pngjs';

/* THE PIXEL COMPARISON IS A COUNT, NOT A HASH.
   A hash answers "identical or not", which is the wrong question once one
   decorative element is known to be un-freezable: the star twinkle moves a
   hundred-odd 1px circles by a fraction of a level, which sometimes rounds
   away and sometimes does not, so a hash flickers between pass and fail for
   no reason. A count of differing pixels together with the largest channel
   delta separates the two cases outright — a twinkle is a few hundred pixels
   off by one or two levels; a box that moved is thousands off by tens. */
const compare = (a, b, skip) => {
  const A = PNG.sync.read(a);
  const B = PNG.sync.read(b);
  if (A.width !== B.width || A.height !== B.height) {
    return { size: `${A.width}x${A.height} vs ${B.width}x${B.height}`, n: -1, max: 255 };
  }
  let n = 0;
  let max = 0;
  for (let i = 0, px = 0; i < A.data.length; i += 4, px++) {
    if (skip && skip[px]) continue;
    let d = 0;
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(A.data[i + c] - B.data[i + c]));
    if (d) { n++; if (d > max) max = d; }
  }
  return { size: null, n, max, total: A.width * A.height };
};

/* WHICH PIXELS MOVE ON THEIR OWN, MEASURED RATHER THAN GUESSED.
   Four rounds of chasing paint nondeterminism — seeded randomness, the sky's
   clock, every CSS animation, video playback, the format probe, the headline
   shimmer — each fixed a real source and each left another. The ones left are
   animated WebP, some of it painted as a background-image where no element
   API reaches it, and there is no reason to believe the list ever ends.
   So instead of naming the movers, the frozen copy is photographed twice and
   every pixel that differs between two identical loads is recorded as one
   that moves by itself. Dilated by two pixels, because an animation's edge
   lands on a slightly different subpixel each time and the fringe belongs to
   it. Those pixels are then excluded from every later comparison, and
   everything else is compared exactly — no tolerance at all.
   It is the same instrument-before-code discipline as the rest of this
   project: when a measurement will not sit still, measure how much it moves
   and subtract that, rather than lowering the bar until it passes. */
const moveMask = (a, b, w, h) => {
  const A = PNG.sync.read(a);
  const B = PNG.sync.read(b);
  const raw = new Uint8Array(w * h);
  for (let i = 0, px = 0; i < A.data.length; i += 4, px++) {
    let d = 0;
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(A.data[i + c] - B.data[i + c]));
    if (d) raw[px] = 1;
  }
  const out = new Uint8Array(w * h);
  const R = 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!raw[y * w + x]) continue;
      for (let dy = -R; dy <= R; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -R; dx <= R; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          out[yy * w + xx] = 1;
        }
      }
    }
  }
  return out;
};

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PRE = 'http://localhost:8797';
const POST = process.env.POST || 'http://localhost:8799';
const PAGES = ['index.html', 'work.html', 'work/cypherock-x0.html',
  'work/onefinnet-talent.html', '404.html'];
const WIDTHS = [1440, 1280, 1024, 768, 390];

/* the properties that decide how a box looks. Not every property — a full
   computed style is 340 entries a box and most of them are inherited noise
   that makes the diff unreadable. These are the ones a refactor can break. */
const PROPS = ['display', 'position', 'width', 'height', 'margin', 'padding',
  'font', 'font-family', 'font-size', 'font-weight', 'line-height',
  'letter-spacing', 'color', 'background-color', 'background-image',
  'border', 'border-radius', 'box-shadow', 'opacity', 'transform',
  'z-index', 'overflow', 'flex', 'grid-template-columns', 'grid-template-rows',
  'gap', 'align-items', 'justify-content', 'text-transform', 'text-align',
  'transition', 'animation', 'clip-path', 'visibility', 'white-space',
  'aspect-ratio', 'object-fit', 'mix-blend-mode', 'filter', 'backdrop-filter'];

/* Everything nondeterministic, pinned before the page's own scripts run.
   Math.random is seeded rather than removed: the star field, the scattered
   words and the random line of copy all still happen, they just happen the
   same way twice. */
const FREEZE = `
  (() => {
    let s = 0x2f6e2b1;
    Math.random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

    /* THE CLOCK HAS TO BE PINNED, AND FINDING OUT WHY IS WHAT THIS HARNESS
       WAS FOR. The first self-agreement run reported 26 changed boxes per
       page against an UNTOUCHED copy of the site — always the star field,
       always a fraction of a percent of opacity. Seeding Math.random had
       already made the stars land in the same places, so it was not the
       randomness: the sky reads the real time of day and interpolates its
       star opacity between two hours, the run takes minutes, and the two
       sides were therefore photographed at two different times of night.
       A real difference of 0.0002 opacity, caused entirely by the clock.

       So Date is pinned — 03:00, which is inside the night band where the
       stars are actually visible and worth comparing. performance.now() is
       left alone, because the frame loops need it to advance. */
    const FIXED = new Date('2026-03-14T03:00:00Z').getTime();
    const D = Date;
    const P = new Proxy(D, {
      construct: (t, a) => (a.length ? new t(...a) : new t(FIXED)),
      apply: () => new D(FIXED).toString(),
    });
    P.now = () => FIXED;
    P.parse = D.parse;
    P.UTC = D.UTC;
    window.Date = P;
    const mm = window.matchMedia.bind(window);
    window.matchMedia = (q) => (/prefers-reduced-motion/.test(q)
      ? { matches: true, media: q, onchange: null,
          addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }
      : mm(q));
    try { sessionStorage.setItem('site:entered', '1'); } catch (e) {}
  })();
`;

const snap = async (page) => page.evaluate((props) => {
  const rows = {};
  /* the structural path: tag plus its index among siblings, all the way up.
     Stable under insertion anywhere else in the tree, which document order is
     not. */
  const key = (n) => {
    const parts = [];
    let el = n;
    while (el && el.nodeType === 1 && el !== document.documentElement) {
      const p = el.parentNode;
      const i = p ? [...p.children].indexOf(el) : 0;
      parts.unshift(`${el.tagName.toLowerCase()}[${i}]`);
      el = p;
    }
    return parts.join('/');
  };
  /* THE ONE EXCLUSION, AND WHY IT IS ONLY ONE PROPERTY OF ONE SUBTREE.
     Each star carries its own long twinkle. Pinning the clock and rewinding
     every animation took the disagreement from four thousandths of an opacity
     down to seven millionths, and no amount of further settling closes it:
     the value is being integrated in a frame loop, so two loads are never at
     exactly the same point of it. That is a property of the star field, not
     of anything a refactor can touch.
     So `opacity` is dropped for the sky's own subtree — and nothing else is.
     Every star's position, radius and fill is still compared, so a star that
     moves or disappears still fails; only the brightness it happened to be
     at when the shutter opened is ignored. */
  const sky = document.querySelector('.sky-root');
  for (const n of document.querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|LINK|META|TITLE|HEAD)$/.test(n.tagName)) continue;
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    const twinkles = !!sky && sky.contains(n);
    /* THE HEADLINE'S CHARACTERS ARE A RUNNING SHIMMER. Each letter is its own
       span and its brightness tier — b1…b4, and `is-lit` as the wave passes —
       is rewritten every frame by the page's own loop. Its geometry is worth
       comparing; which tier the wave had reached when the shutter opened is
       not, and there is no moment at which it is at rest. So for these spans
       the class list and the two colours it drives are skipped, and nothing
       else is. */
    const shimmers = n.tagName === 'SPAN' && /(^| )c( |$)|(^| )b[1-4]( |$)/.test(
      typeof n.className === 'string' ? n.className : '');
    const v = [
      `@${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`,
      shimmers ? '#~' : `#${n.className && typeof n.className === 'string' ? n.className : ''}`,
    ];
    for (const p of props) {
      if (twinkles && p === 'opacity') continue;
      if (shimmers && /^(color|border)$/.test(p)) continue;
      /* The two copies are served on two ports, and a resolved url() carries
         the port in its computed value — so every background-image on the
         page reported itself as changed. The origin is the harness's, not the
         page's; only the path is the page's. */
      v.push(`${p}:${cs.getPropertyValue(p).replace(/http:\/\/localhost:\d+/g, '@')}`);
    }
    rows[key(n)] = v.join('|');
  }
  return rows;
}, PROPS);

const b = await chromium.launch({ executablePath: CHROME });

/* THE BEFORE SIDE IS RECORDED ONCE, NOT RE-SHOT EVERY TIME.
   `record` photographs the frozen copy twice — once as the reference and once
   as the control that measures how much the page disagrees with itself — and
   writes both to disk. `check` then photographs only the working copy and
   compares it against what was recorded. The frozen copy does not change
   during a cleanup, so re-shooting it on every pass was paying three page
   loads for information that was already known; this pays one. It also makes
   the baseline an artefact that can be pointed at rather than something
   regenerated, and slightly stricter: every pass is compared against the
   SAME reference rather than against a fresh load of it. */
const MODE = process.argv[2] === 'record' ? 'record' : 'check';
const label = process.argv[3] || (MODE === 'record' ? 'baseline' : 'run');
const only = process.argv[4];
const DIR = '/root/rq-base';
fs.mkdirSync(DIR, { recursive: true });
const cellFile = (cell, kind) => `${DIR}/${cell.replace(/[/@.]/g, '_')}.${kind}`;
const store = {};
let bad = 0;
let boxes = 0;
const chk = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++; };

for (const w of WIDTHS) {
  for (const p of PAGES) {
    if (only && !p.includes(only)) continue;
    const cell = `${p}@${w}`;
    const got = {};
    /* In record mode: the frozen copy twice — the reference, and a control
       that measures what this page disagrees with itself by. In check mode:
       only the working copy, against what was recorded. */
    const sides = MODE === 'record'
      ? [['pre', PRE], ['ctrl', PRE], ['ctrl2', PRE]]
      : [['post', POST]];
    for (const [side, host] of sides) {
      const ctx = await b.newContext({
        viewport: { width: w, height: 900 },
        deviceScaleFactor: 1,
        hasTouch: w <= 768,
        isMobile: w <= 768,
        reducedMotion: 'reduce',
      });
      await ctx.addInitScript(FREEZE);
      /* Everything off-box is refused outright rather than left to time out.
         Two reasons, and the second is the important one: `networkidle` would
         otherwise wait on a webfont this sandbox has no route to, which turns
         fifty page loads into an afternoon — and a font that sometimes
         arrives and sometimes does not would change the measured metrics
         between the two sides and report a difference the refactor did not
         cause. Refusing it makes both sides fall back to the same stack. */
      await ctx.route('**/*', (route) => {
        const u = route.request().url();
        if (u.startsWith('http://localhost:') || u.startsWith('data:') || u.startsWith('blob:')) {
          return route.continue();
        }
        return route.abort();
      });
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e)));
      await page.goto(`${host}/${p}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      /* EVERY RUNNING ANIMATION, PARKED AT ITS OWN START.
         Pinning Date fixed the sky's time of day and the drift stayed: the
         stars each carry a long twinkle whose phase is set from the document
         timeline, so two loads a few seconds apart sample two different
         points of it — a genuine difference of a thousandth of an opacity,
         and nothing to do with any refactor. Seeding the randomness cannot
         reach it because the randomness is not what is moving.
         Rewinding and pausing every animation is the general form of the fix:
         it does not need to know which animation, and it holds the page at a
         defined moment of its own composition rather than at an arbitrary
         one. Done to both sides, so what is compared is the same instant. */
      await page.evaluate(() => {
        for (const a of document.getAnimations()) {
          try { a.currentTime = 0; a.pause(); } catch (e) { /* finished */ }
        }
      });
      /* VIDEO IS A CLOCK TOO. The work cards and the Onefinnet mockups play
         video, and a video decodes whatever frame it has reached when the
         shutter opens — which is why those bands differed by up to 253 levels
         and why they differed on some widths and not others. Paused and
         rewound, both sides photograph the same frame.

         AND A BROKEN IMAGE PRINTS ITS OWN URL. Chromium renders the alt text
         of a failed image as the resolved src, so every missing asset showed
         up as a nine-pixel band differing only in the port number. Blanking
         the alt on failed images removes the artefact — and collecting them
         first turns it into something worth knowing: a list of the assets
         this site asks for and does not have. */
      /* EVERY ENTRANCE, RESOLVED. A full-page screenshot scrolls the page,
         which is what the reveal observers are waiting for — so an element
         could be caught mid-entrance, and it was: one row on work.html came
         out at opacity 0 and six pixels low on one side and settled on the
         other. Reduced motion covers `.reveal` but not every gate. Driving
         the page end to end and then asserting the arrived state on
         everything the observers watch removes the race rather than waiting
         longer and hoping. */
      await page.evaluate(async () => {
        const step = innerHeight * 0.8;
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => requestAnimationFrame(r));
        }
        scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        for (const n of document.querySelectorAll('.reveal, .blk, .sec__body, .sec__heading, .sec')) {
          n.classList.add('is-in');
        }
      });

      /* WAIT FOR THE DOM TO STOP MOVING, not for one condition to hold.
         Card thumbnails are looked for as webp, then avif, then jpg, png, gif
         and svg, and Chromium paints the alt text — the resolved URL, port and
         all — while that is in flight, which is why a nine-pixel band appeared
         partway down every case study. Waiting on `img.complete` did not fix
         it: the probe REMOVES the <img> once every format has missed, so the
         condition goes true while later probes are still inserting and
         removing elements. Quiet is the honest signal — no mutations for a
         third of a second — and it covers the probe, late content and anything
         else that builds itself after load, without this harness needing to
         know what any of those are. */
      await page.evaluate(() => new Promise((done) => {
        let t = setTimeout(finish, 400);
        const mo = new MutationObserver(() => {
          clearTimeout(t);
          t = setTimeout(finish, 400);
        });
        function finish() { mo.disconnect(); done(); }
        mo.observe(document.documentElement, {
          childList: true, subtree: true, attributes: true, characterData: true,
        });
        setTimeout(finish, 6000);
      }));

      /* THE PLACEHOLDERS PRINT THEIR OWN URL, PORT AND ALL.
         Five case-study images are not in the repository, and the site does
         something deliberate about that: it renders a <code class="phbox__p">
         showing the path it wanted. The path it shows is RESOLVED, so it
         carries the origin — and the two copies are served on two ports, so
         every one of those placeholders differed. It is the same artefact as
         the resolved url() in a computed background-image, in painted text
         where no style comparison can normalise it. Stripped here instead. */
      await page.evaluate(() => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const re = /http:\/\/localhost:\d+/g;
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          if (re.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(re, '');
        }
      });

      /* AND NOW STOP EVERY FRAME LOOP.
         The last of the drift was JS-driven motion: the marquees accumulate
         `pos += speed * dt` in their own loop, so they are at an arbitrary
         offset on every load and no mask over two samples can cover where
         they might be. Chasing them one module at a time was the wrong shape
         of fix — taking requestAnimationFrame away after the page has settled
         stops all of it at once, and stops the star twinkle and the headline
         shimmer with it. The page has already been driven end to end and its
         entrances forced, so nothing is left mid-arrival when the clock is
         pulled. */
      await page.evaluate(() => { window.requestAnimationFrame = () => 0; });
      await page.waitForTimeout(120);

      const missing = await page.evaluate(async () => {
        /* Pausing a video is not enough on its own: the page plays them back
           when they scroll into view, so the pause is undone by the next
           observer callback. The method itself is taken away first. */
        HTMLMediaElement.prototype.play = function play() { return Promise.resolve(); };
        const vids = [...document.querySelectorAll('video')];
        await Promise.all(vids.map((v) => new Promise((res) => {
          try {
            v.pause();
            v.addEventListener('seeked', res, { once: true });
            v.currentTime = 0;
            setTimeout(res, 500);
          } catch (e) { res(); }
        })));
        for (const v of vids) v.pause();
        const gone = [];
        for (const im of document.querySelectorAll('img')) {
          if (im.complete && im.naturalWidth === 0 && im.getAttribute('src')) {
            gone.push(im.getAttribute('src').replace(/^https?:\/\/[^/]+\//, ''));
            im.alt = '';
          }
        }
        return gone;
      });
      await page.waitForTimeout(200);
      got[side] = { style: await snap(page), errs, missing };

      /* ANIMATED MEDIA IS FOUND BY WATCHING IT, NOT BY LISTING IT.
         Some of this site's imagery is animated WebP, which no API pauses and
         no stylesheet stills. Rather than keep a list of which files those
         are — a list that would be wrong the first time one is swapped — each
         image is sampled into a canvas twice, a third of a second apart, and
         anything whose pixels changed is animated by definition. Those, and
         every video, are hidden for the photograph only.
         The styles pass has already compared their boxes, positions and
         computed values; what is given up is only the ability to notice a
         change INSIDE a moving picture, which no comparison of two different
         loads could ever have caught anyway. Everything else on the page
         becomes exactly comparable again, which is what makes the pixel check
         worth having at all. */
      const masked = await page.evaluate(async () => {
        const grab = (im) => {
          try {
            const c = document.createElement('canvas');
            c.width = Math.min(im.naturalWidth || 0, 48);
            c.height = Math.min(im.naturalHeight || 0, 48);
            if (!c.width || !c.height) return null;
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            return c.toDataURL();
          } catch (e) { return null; }
        };
        const imgs = [...document.querySelectorAll('img')].filter((im) => im.naturalWidth);
        const first = imgs.map(grab);
        await new Promise((r) => setTimeout(r, 340));
        let n = 0;
        imgs.forEach((im, i) => {
          const now = grab(im);
          if (first[i] && now && first[i] !== now) { im.style.visibility = 'hidden'; n++; }
        });
        for (const v of document.querySelectorAll('video')) {
          v.style.visibility = 'hidden';
          n++;
        }
        return n;
      });
      got[side].masked = masked;
      got[side].shot = await page.screenshot({ fullPage: true });
      await ctx.close();
    }

    if (MODE === 'record') {
      const ref0 = PNG.sync.read(got.pre.shot);
      /* THE MASK IS A UNION OVER SEVERAL SAMPLES, NOT ONE PAIR.
         One control pair is not enough. A marquee at a different offset moves
         a DIFFERENT set of pixels on each load, so a mask built from shots one
         and two left the pixels only shot three visited uncovered — and the
         first check after a change of dead code duly reported 916,000 changed
         pixels on the page with the most animation, with every computed style
         on it identical. Three loads, two masks, unioned: what moves on its
         own is the set of everything seen to move, not what happened to move
         once. */
      const mask = moveMask(got.pre.shot, got.ctrl.shot, ref0.width, ref0.height);
      const mask2 = moveMask(got.pre.shot, got.ctrl2.shot, ref0.width, ref0.height);
      for (let i = 0; i < mask.length; i++) if (mask2[i]) mask[i] = 1;
      const moving = mask.reduce((s, v) => s + v, 0);
      fs.writeFileSync(cellFile(cell, 'json'), JSON.stringify({
        style: got.pre.style, w: ref0.width, h: ref0.height,
        masked: got.pre.masked, missing: got.pre.missing, moving,
      }));
      fs.writeFileSync(cellFile(cell, 'png'), got.pre.shot);
      fs.writeFileSync(cellFile(cell, 'mask'), Buffer.from(mask));
      console.log(`  ·  recorded ${cell.padEnd(36)} ${String(Object.keys(got.pre.style).length).padStart(5)} boxes`
        + `  ${String(got.pre.masked).padStart(2)} media hidden`
        + `  ${((moving / (ref0.width * ref0.height)) * 100).toFixed(2)}% of pixels move by themselves`);
      store[cell] = { boxes: Object.keys(got.pre.style).length, missing: got.pre.missing, moving };
      continue;
    }

    if (!fs.existsSync(cellFile(cell, 'json'))) {
      chk(false, `${cell} — no baseline recorded. Run: node refactorqa.mjs record`);
      continue;
    }
    const ref = JSON.parse(fs.readFileSync(cellFile(cell, 'json'), 'utf8'));
    got.pre = { shot: fs.readFileSync(cellFile(cell, 'png')), style: ref.style };
    got.ctrl = null;
    fs.writeFileSync(`/root/rq-${label}-${p.replace(/\//g, '_')}-${w}.png`, got.post.shot);

    /* --- style --- */
    const A = got.pre.style;
    const B = got.post.style;
    const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
    boxes += Object.keys(A).length;
    const diffs = [];
    for (const k of keys) {
      if (A[k] === B[k]) continue;
      if (!A[k]) { diffs.push(`+ ${k}`); continue; }
      if (!B[k]) { diffs.push(`- ${k}`); continue; }
      const a = A[k].split('|');
      const c = B[k].split('|');
      const which = a.map((x, i) => (x === c[i] ? null : `${x} → ${c[i]}`)).filter(Boolean);
      diffs.push(`~ ${k}\n        ${which.join('\n        ')}`);
    }
    const mask = new Uint8Array(fs.readFileSync(cellFile(cell, 'mask')));
    const px = compare(got.pre.shot, got.post.shot, mask);
    /* No tolerance: the pixels that move by themselves are excluded outright,
       so every remaining pixel must match exactly. */
    const pxOk = !px.size && px.n === 0;
    const pxSay = px.size ? `PAGE SIZE CHANGED ${px.size}`
      : px.n === 0 ? `pixels identical (${((ref.moving / (ref.w * ref.h)) * 100).toFixed(2)}% excluded as self-moving)`
        : `${px.n} STILL PIXELS CHANGED by up to ${px.max}`;

    chk(diffs.length === 0 && pxOk,
      `${cell.padEnd(36)} ${String(Object.keys(A).length).padStart(5)} boxes  `
      + (diffs.length ? `${diffs.length} BOXES DIFFER` : 'styles identical')
      + `  · ${pxSay}`);
    if (diffs.length) {
      for (const d of diffs.slice(0, 8)) console.log(`      ${d}`);
      if (diffs.length > 8) console.log(`      … ${diffs.length - 8} more`);
    }
    if (!pxOk) {
      /* WHERE, not just how many. A count says something moved; a map says
         which band of the page it was in, which is the difference between a
         guess and a lead. Rows that contain any differing pixel are listed as
         y ranges, and the map is written out beside the shot. */
      const A2 = PNG.sync.read(got.pre.shot);
      const skipMask = mask;
      const B2 = PNG.sync.read(got.post.shot);
      if (A2.width === B2.width && A2.height === B2.height) {
        const map = new PNG({ width: A2.width, height: A2.height });
        const rowsHit = [];
        for (let y = 0; y < A2.height; y++) {
          let hit = 0;
          for (let x = 0; x < A2.width; x++) {
            const i = (y * A2.width + x) * 4;
            let d = 0;
            for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(A2.data[i + c] - B2.data[i + c]));
            if (d && !skipMask[y * A2.width + x]) hit++; else if (skipMask[y * A2.width + x]) d = 0;
            map.data[i] = d ? 255 : 0;
            map.data[i + 1] = d ? Math.max(0, 255 - d * 4) : 0;
            map.data[i + 2] = 0;
            map.data[i + 3] = 255;
          }
          if (hit) rowsHit.push(y);
        }
        const bands = [];
        for (const y of rowsHit) {
          const last = bands[bands.length - 1];
          if (last && y - last[1] <= 3) last[1] = y;
          else bands.push([y, y]);
        }
        fs.writeFileSync(`/root/rq-${label}-${p.replace(/\//g, '_')}-${w}-DIFF.png`,
          PNG.sync.write(map));
        console.log(`      differing rows, as y bands: ${bands.slice(0, 8).map(([a2, b2]) => `${a2}–${b2}`).join(', ')}`
          + (bands.length > 8 ? ` … ${bands.length - 8} more` : ''));
        console.log(`      map: /root/rq-${label}-${p.replace(/\//g, '_')}-${w}-DIFF.png`);
      }
    }
    if (got.post.errs.length) {
      bad++;
      console.log(`      PAGE ERRORS: ${got.post.errs.slice(0, 2).join(' | ')}`);
    }
    store[cell] = {
      boxes: Object.keys(A).length, diffs: diffs.length,
      px: px.n, pxMax: px.max, selfMoving: ref.moving,
      missing: got.post.missing,
    };
  }
}

await b.close();
const gone = [...new Set(Object.values(store).flatMap((s) => s.missing || []))].sort();
if (gone.length) {
  console.log(`\n  assets asked for and not present (${gone.length}) —`);
  console.log('  not a refactor problem, but worth knowing:');
  for (const g of gone) console.log(`    ${g}`);
}
fs.writeFileSync(`/root/rq-${label}.json`, JSON.stringify(store, null, 1));
console.log(`\n  ${boxes} boxes compared across ${Object.keys(store).length} page/width pairs.`);
console.log(bad ? `\n${bad} FAILED — the refactor changed something.\n`
  : '\nthe site is byte-identical, box for box and pixel for pixel\n');
process.exit(bad ? 1 : 0);
