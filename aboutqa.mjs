/* THE ABOUT PAGE, DRIVEN.
 *
 * The brief asks for interactions rather than a mockup, so every claim it
 * makes is checked by doing the thing rather than by looking at the markup.
 *
 * The one worth having is the rail. "Clicking scrolls to the section" and
 * "the active state comes from the real viewport position" are two different
 * claims, and the second is the one that is usually faked with an offset
 * table. So it is checked from both ends: clicking each of the five links must
 * land that section's own anchor at its own `scroll-margin-top` (read from the
 * stylesheet, not assumed), and scrolling by hand to each section must light
 * the matching link WITHOUT anything having been clicked.
 *
 * The pile is checked as state, not as pixels: clicking the third print must
 * put it at depth 0 and push the others back one place, and the order must
 * survive clicking a print that is already on top.
 */
import { chromium } from 'playwright';

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const HOST = process.env.HOST || 'http://localhost:8799';
const b = await chromium.launch({ executablePath: CHROME });
let bad = 0;
const chk = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++; };

const open = async (w, h, touch) => {
  const ctx = await b.newContext({
    viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch,
  });
  await ctx.route('**/*', (r) => (r.request().url().startsWith('http://localhost:')
    ? r.continue() : r.abort()));
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(`${HOST}/about.html`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1800);
  return { ctx, p, errs };
};

/* ------------------------------------------------------------- the shape */
for (const [w, h, touch, name] of [[1440, 900, false, 'desktop'], [1024, 900, false, 'tablet'], [390, 844, true, 'phone']]) {
  console.log(`\n${w}x${h}  ${name}\n`);
  const { ctx, p, errs } = await open(w, h, touch);

  const shape = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const qq = (s) => [...document.querySelectorAll(s)];
    return {
      page: document.body.dataset.page,
      bands: qq('.ab__hero, .ab__read-sec, .ab__creed, .ab__shelf, .ab__drawer, .ab__nowsec, .ab__end').length,
      chapters: qq('.ab__ch').length,
      anchors: qq('.ab__ch .sec__anchor').length,
      links: qq('.ab__rl').length,
      prints: qq('.pile__stack .pcard').length,
      cards: qq('.word').length,
      stops: qq('.tl__i').length,
      bricks: qq('.tl__brick').length,
      groups: qq('.strip__r').length,
      dock: qq('.abdock__l').map((a) => a.textContent.trim()),
      edge: qq('.abedge__l').map((a) => a.textContent.trim()),
      spreads: qq('.spread').length,
      heroH: Math.round((q('.ab__hero') || {}).getBoundingClientRect ? q('.ab__hero').getBoundingClientRect().height : 0),
      hiSize: q('.ab__hi') ? Math.round(parseFloat(getComputedStyle(q('.ab__hi')).fontSize)) : 0,
      /* the composition, measured: where the writing sits and where the pile does */
      geom: (() => {
        const col = q('.ab__hero-col'); const vis = q('.pile__stack');
        if (!col || !vis) return null;
        const a = col.getBoundingClientRect(); const b2 = vis.getBoundingClientRect();
        return { colL: +(a.left / innerWidth * 100).toFixed(1), colR: +(a.right / innerWidth * 100).toFixed(1),
                 visL: +(b2.left / innerWidth * 100).toFixed(1), visR: +(b2.right / innerWidth * 100).toFixed(1) };
      })(),
      scraps: qq('.desk__o, .desk .pcard').length,
      nowRows: qq('.now__r').length,
      /* the global furniture must all still be here */
      nav: qq('#nav a').map((a) => a.textContent.trim()),
      foot: !!q('.foot'),
      outro: !!q('.outro'),
      dots: !!q('.ab .canvas__dots'),
      /* and nothing may be left invisible: .reveal starts at opacity 0 */
      /* THE THRESHOLD IS THE PAGE'S, NOT MINE. The reveal observer runs with
         `rootMargin: 0 0 -12% 0`, so an element four pixels into a phone
         viewport has correctly NOT revealed yet — and asking "is it on screen
         at all" reported exactly that as a bug. The question worth asking is
         whether anything COMFORTABLY in view is still invisible. */
      stuck: qq('.ab .reveal').filter((n) => {
        const r = n.getBoundingClientRect();
        const wellInView = r.top < innerHeight * 0.86 && r.bottom > 0;
        return wellInView && !n.classList.contains('is-in');
      }).map((n) => n.className),
      /* every placeholder must be labelled, not a grey box */
      placeholders: qq('.pcard__label').map((n) => n.textContent.trim()),
      /* the page must not scroll sideways */
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  chk(shape.page === 'about', `the shell identifies itself (data-page="${shape.page}")`);
  /* EIGHT BANDS FOR TEN SECTIONS, ON PURPOSE. The brief numbers the intro and
     the photographs 01 and 02, and the story and its navigation 03 and 04. The
     reference composes each pair as ONE thing — writing beside the objects it
     introduces, a rail beside the chapters it walks — and so does this. As
     four separate bands the intro was a column of text with an empty half page
     next to it, and the story got a rail above a rail. */
  chk(shape.bands === 8, `eight chapters, each its own composition (${shape.bands})`);
  chk(shape.chapters === 5 && shape.anchors === 5 && shape.links === 5,
    `five chapters, five anchors, five rail links (${shape.chapters}/${shape.anchors}/${shape.links})`);
  chk(shape.prints === 4, `four prints in the pile (${shape.prints})`);
  chk(shape.cards === 4, `four loose words (${shape.cards})`);
  chk(shape.spreads === 5, `a spread per chapter (${shape.spreads})`);
  chk(shape.dock.join('/') === 'About/Story/Design/Now', `the bottom navigator has its four stops (${shape.dock.join('/')})`);
  chk(shape.edge.length === 3, `three utilities at the edge (${shape.edge.join(', ')})`);
  chk(shape.stops === 5 && shape.bricks === 5, `five timeline stops, each with a brick (${shape.stops}/${shape.bricks})`);
  chk(shape.groups === 4, `four runs in the tools strip (${shape.groups})`);
  /* THE HERO IS A WHOLE SCREEN, AND THE COMPOSITION IS NOT CENTRED. Measured
     off the reference at 1470px: writing 17%–46%, visual 57%–84%. */
  chk(shape.heroH >= h * 0.92, `the hero fills the first screen (${shape.heroH}px of ${h})`);
  chk(shape.hiSize >= (w > 900 ? 64 : 40), `the headline has presence (${shape.hiSize}px)`);
  /* the two-column hero exists above the 68rem stack point; below it the
     page recomposes and these measurements are meant to fail */
  if (w > 1100 && shape.geom) {
    const g = shape.geom;
    chk(g.colL < 12 && g.colR > 25 && g.colR < 50,
      `the writing occupies the left of the grid, not the middle (${g.colL}%–${g.colR}%)`);
    chk(g.visL > 50 && g.visR < 92 && g.visL - g.colR > 6,
      `the pile sits on the right with a real gutter (${g.visL}%–${g.visR}%)`);
    chk(100 - g.visR > 6, `and the right margin is left empty (${(100 - g.visR).toFixed(1)}%)`);
  }
  chk(shape.scraps === 10, `ten things in the drawer, two of them bricks (${shape.scraps})`);
  chk(shape.nowRows === 5, `five "currently" rows (${shape.nowRows})`);
  chk(shape.nav.join(' / ') === 'Home / Work / About',
    `the global nav carries About (${shape.nav.join(' / ')})`);
  chk(shape.foot && shape.outro, 'the global footer and its sky are both here');
  chk(shape.dots, 'and the page sits on the hero\'s own dot field');
  chk(shape.stuck.length === 0, shape.stuck.length
    ? `NEVER REVEALED: ${shape.stuck.join(' | ')}`
    : 'nothing well inside the viewport is left at opacity 0');
  chk(shape.placeholders.length > 0 && shape.placeholders.every((t) => /^PHOTO|^SCREENSHOT/i.test(t)),
    `every image placeholder is labelled (${shape.placeholders.slice(0, 3).join(', ')}…)`);
  chk(shape.overflowX <= 0, `the page does not scroll sideways (${shape.overflowX}px)`);
  chk(!errs.length, errs.length ? `ERRORS: ${errs.slice(0, 2).join(' | ')}` : 'no page or console errors');
  await ctx.close();
}

/* --------------------------------------------------- the rail, both ways */
console.log('\nTHE RAIL — clicking, and then not clicking\n');
{
  const { ctx, p } = await open(1440, 900, false);

  /* 1. clicking each link lands its own anchor at its own scroll-margin */
  const landings = [];
  for (let i = 0; i < 5; i++) {
    const r = await p.evaluate(async (k) => {
      const a = document.querySelectorAll('.ab__rl')[k];
      a.click();
      await new Promise((res) => setTimeout(res, 900));
      const id = a.getAttribute('href').slice(1);
      const sec = document.getElementById(id);
      const anchor = sec.querySelector('.sec__anchor');
      const want = parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0;
      return {
        id,
        got: Math.round(anchor.getBoundingClientRect().top),
        want: Math.round(want),
        active: document.querySelector('.ab__rl.is-active')?.getAttribute('href'),
      };
    }, i);
    landings.push(r);
  }
  const landed = landings.filter((r) => Math.abs(r.got - r.want) <= 6);
  chk(landed.length === 5,
    `each link lands its section at its own scroll-margin (${landed.length}/5)`);
  for (const r of landings) {
    if (Math.abs(r.got - r.want) > 6) console.log(`      ${r.id}: rested at ${r.got}px, wanted ${r.want}px`);
  }
  const marked = landings.filter((r) => r.active === `#${r.id}`);
  chk(marked.length === 5, `and marks the one it went to (${marked.length}/5)`);

  /* 2. THE REAL TEST: scroll by hand, click nothing, and see whether the
        active state follows the viewport */
  const walked = [];
  for (let i = 0; i < 5; i++) {
    const r = await p.evaluate(async (k) => {
      const sec = document.querySelectorAll('.ab__ch')[k];
      const anchor = sec.querySelector('.sec__anchor');
      const want = parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0;
      /* land it where a click would, but by scrolling the document */
      scrollTo({ top: anchor.getBoundingClientRect().top + scrollY - want + 8, behavior: 'instant' });
      await new Promise((res) => setTimeout(res, 700));
      return {
        id: sec.id,
        active: document.querySelector('.ab__rl.is-active')?.getAttribute('href'),
        aria: document.querySelector('.ab__rl[aria-current="true"]')?.getAttribute('href'),
      };
    }, i);
    walked.push(r);
  }
  const followed = walked.filter((r) => r.active === `#${r.id}` && r.aria === `#${r.id}`);
  chk(followed.length === 5,
    `scrolling with nothing clicked lights the right link (${followed.length}/5)`);
  for (const r of walked) {
    if (r.active !== `#${r.id}`) console.log(`      at ${r.id} the rail said ${r.active}`);
  }

  /* 3. the inactive ones step back but stay readable */
  const dim = await p.evaluate(() => {
    const off = [...document.querySelectorAll('.ab__rl:not(.is-active)')];
    return off.map((a) => parseFloat(getComputedStyle(a).opacity));
  });
  chk(dim.length > 0 && dim.every((o) => o > 0.4 && o < 1),
    `the sections you are not reading step back without vanishing (${dim[0]})`);
  await ctx.close();
}

/* ------------------------------------------------------------- the pile */
console.log('\nTHE PILE — a stack of prints, not a carousel\n');
{
  const { ctx, p } = await open(1440, 900, false);
  const read = () => p.evaluate(() => [...document.querySelectorAll('.pile__stack .pcard')]
    .map((n) => Number(n.style.getPropertyValue('--depth'))));

  const start = await read();
  chk(start.join() === '0,1,2,3', `the pile starts in order (${start.join(' ')})`);

  await p.evaluate(() => document.querySelectorAll('.pile__stack .pcard')[2].click());
  await p.waitForTimeout(700);
  const after = await read();
  chk(after[2] === 0, `clicking the third print brings it to the front (depths ${after.join(' ')})`);
  chk(after[0] === 1 && after[1] === 2 && after[3] === 3,
    'and the others fall back exactly one place, keeping their order');

  const front = await p.evaluate(() => {
    const n = document.querySelector('.pcard.is-front');
    return { idx: [...document.querySelectorAll('.pcard')].indexOf(n), aria: n.getAttribute('aria-current') };
  });
  chk(front.idx === 2 && front.aria === 'true', 'the front print is the one marked current');

  /* clicking the one already on top must do nothing at all */
  await p.evaluate(() => document.querySelectorAll('.pile__stack .pcard')[2].click());
  await p.waitForTimeout(500);
  const again = await read();
  chk(again.join() === after.join(), 'clicking the front print again changes nothing');

  /* hovering separates the pile — the fan is a custom property, so it can be read */
  const fan = await p.evaluate(async () => {
    const stack = document.querySelector('.pile__stack');
    const before = getComputedStyle(stack).getPropertyValue('--fan').trim();
    stack.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 200));
    const held = getComputedStyle(stack).getPropertyValue('--fan').trim();
    const lifted = getComputedStyle(document.querySelector('.pcard.is-front')).transform;
    stack.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 200));
    return { before, held, rest: getComputedStyle(stack).getPropertyValue('--fan').trim(), lifted };
  });
  chk(fan.before === '0px' && fan.held !== '0px' && fan.rest === '0px',
    `hovering the pile separates it and letting go closes it (${fan.before} → ${fan.held} → ${fan.rest})`);
  chk(/matrix/.test(fan.lifted), 'and the front print carries a pose of its own');

  /* keyboard */
  const kb = await p.evaluate(async () => {
    const cards = [...document.querySelectorAll('.pile__stack .pcard')];
    cards[3].focus();
    const focused = document.activeElement === cards[3];
    cards[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise((r) => setTimeout(r, 400));
    return { focused, depth: Number(cards[3].style.getPropertyValue('--depth')) };
  });
  chk(kb.focused && kb.depth === 0, 'a print can be reached and brought forward from the keyboard');
  await ctx.close();
}

/* ------------------------------------------------------ the principles */
console.log('\nTHE LOOSE WORDS — a word is a word until it is asked\n');
{
  const { ctx, p } = await open(1440, 900, false);
  const state = () => p.evaluate(() => [...document.querySelectorAll('.word')].map((c) => ({
    open: c.classList.contains('is-open'),
    aria: c.querySelector('.word__t').getAttribute('aria-expanded'),
    rows: getComputedStyle(c.querySelector('.word__b')).gridTemplateRows,
    h: Math.round(c.getBoundingClientRect().height),
  })));

  const shut = await state();
  chk(shut.every((c) => !c.open && c.aria === 'false'), 'every word starts closed');
  chk(shut.every((c) => parseFloat(c.rows) === 0), `and its sentence has no height (${shut[0].rows})`);

  await p.evaluate(() => document.querySelectorAll('.word__t')[1].click());
  await p.waitForTimeout(700);
  const one = await state();
  chk(one[1].open && one[1].aria === 'true', 'clicking a word opens it');
  chk(one[1].h > shut[1].h + 20, `and it grows to its own sentence (${shut[1].h} → ${one[1].h}px)`);
  chk(one.filter((c) => c.open).length === 1, 'and it is the only one open');

  await p.evaluate(() => document.querySelectorAll('.word__t')[3].click());
  await p.waitForTimeout(700);
  const two = await state();
  chk(two[3].open && !two[1].open, 'opening another closes the first — four open at once is a list');

  await p.evaluate(() => document.querySelectorAll('.word__t')[3].click());
  await p.waitForTimeout(700);
  const closed = await state();
  chk(closed.every((c) => !c.open), 'and clicking the open one closes it again');

  /* the cards are put down at angles, and straighten when opened */
  const tilt = await p.evaluate(() => {
    const c = document.querySelectorAll('.word');
    return [...c].map((n) => n.style.getPropertyValue('--rot').trim());
  });
  chk(tilt.filter((t) => t && parseFloat(t) !== 0).length >= 3,
    `they lie at different angles (${tilt.join(' ')})`);
  await ctx.close();
}

/* ------------------------------------------------- the bottom navigator */
console.log('\nTHE BOTTOM NAVIGATOR — four movements, driven by the page\n');
{
  const { ctx, p } = await open(1440, 900, false);
  const at = () => p.evaluate(() => document.querySelector('.abdock__l.is-active')?.textContent.trim());

  /* clicking each stop must go there AND mark itself */
  const clicks = [];
  for (let i = 0; i < 4; i++) {
    clicks.push(await p.evaluate(async (k) => {
      const a = document.querySelectorAll('.abdock__l')[k];
      a.click();
      await new Promise((r) => setTimeout(r, 1400));
      const id = a.getAttribute('href').slice(1);
      const sec = document.getElementById(id);
      /* the same test as the rail's: the ANCHOR must come to rest at its own
         declared scroll-margin, not the section box at zero — the box's top
         is a different distance above its first line in every section */
      const anchor = sec.querySelector('.sec__anchor');
      return {
        want: a.textContent.trim(),
        active: document.querySelector('.abdock__l.is-active')?.textContent.trim(),
        got: Math.round(anchor.getBoundingClientRect().top),
        margin: Math.round(parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0),
        atTop: scrollY === 0,
      };
    }, i));
  }
  /* A PAGE CANNOT SCROLL ABOVE ITS OWN TOP. The first stop's anchor sits at
     the very start of the document, so landing it at its 53px margin would
     mean scrolling to -53 — the browser clamps that to 0, and resting at 0 is
     the right answer rather than a miss. */
  const ok = clicks.filter((r) => r.active === r.want
    && (Math.abs(r.got - r.margin) <= 6 || (r.atTop && r.got === 0)));
  chk(ok.length === 4, `each stop lands its section at its own scroll-margin and marks itself (${ok.length}/4)`);
  for (const r of clicks) {
    if (!(Math.abs(r.got - r.margin) <= 6 || (r.atTop && r.got === 0))) {
      console.log(`      ${r.want}: rested at ${r.got}px, wanted ${r.margin}px`);
    }
  }
  for (const r of clicks) if (r.active !== r.want) console.log(`      clicked ${r.want}, dock said ${r.active}`);

  /* and the real test: scroll, click nothing */
  const walked = [];
  for (const [id, want] of [['ab-top', 'About'], ['ab-story', 'Story'], ['ab-creed', 'Design'], ['ab-now-sec', 'Now']]) {
    walked.push(await p.evaluate(async ({ id, want }) => {
      const sec = document.getElementById(id);
      scrollTo({ top: sec.getBoundingClientRect().top + scrollY + 40, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 700));
      return { want, got: document.querySelector('.abdock__l.is-active')?.textContent.trim() };
    }, { id, want }));
  }
  const followed = walked.filter((r) => r.got === r.want);
  chk(followed.length === 4, `scrolling with nothing clicked moves the navigator (${followed.length}/4)`);
  for (const r of walked) if (r.got !== r.want) console.log(`      in ${r.want} the dock said ${r.got}`);

  /* it steps aside for the footer, so it never sits over the end-of-page controls */
  const away = await p.evaluate(async () => {
    scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 900));
    const d = document.querySelector('.abdock'); const e = document.querySelector('.abedge');
    return { dock: getComputedStyle(d).opacity, edge: getComputedStyle(e).opacity };
  });
  chk(Number(away.dock) < 0.2 && Number(away.edge) < 0.2,
    `both step aside when the footer arrives (dock ${away.dock}, edge ${away.edge})`);
  await ctx.close();
}

/* --------------------------------------------------- the rest of the site */
console.log('\nAND THE REST OF THE SITE STILL WORKS FROM HERE\n');
{
  const { ctx, p } = await open(1440, 900, false);
  const globals = await p.evaluate(() => ({
    menuHandle: !!document.querySelector('.tab-menu, .deck__handle, .mbar'),
    tools: !!document.querySelector('.tools, .rack'),
    footMail: (document.querySelector('.foot__mail') || {}).textContent || '',
    footCols: [...document.querySelectorAll('.foot__colt')].map((n) => n.textContent),
    aboutInFooter: [...document.querySelectorAll('.foot__col--pages a')].map((a) => a.textContent),
    current: [...document.querySelectorAll('#nav a[aria-current="page"]')].map((a) => a.textContent),
  }));
  chk(globals.menuHandle, 'the global menu handle is on the page');
  chk(globals.tools, 'and the toolbar');
  chk(/@/.test(globals.footMail), `the footer keeps its address (${globals.footMail})`);
  chk(globals.aboutInFooter.join(' / ') === 'Home / Work / About',
    `the footer's Pages column picked About up from the same array (${globals.aboutInFooter.join(' / ')})`);
  chk(globals.current.join() === 'About', `and the header marks About as current (${globals.current.join() || 'none'})`);

  /* the ending's links */
  const ends = await p.evaluate(() => [...document.querySelectorAll('.ab__end-l a')]
    .map((a) => ({ t: a.textContent.trim(), href: a.getAttribute('href'), blank: a.getAttribute('target') })));
  chk(ends.length >= 2, `the ending offers a way to reach you (${ends.map((e) => e.t).join(', ')})`);
  chk(ends.filter((e) => /^https?:/.test(e.href)).every((e) => e.blank === '_blank'),
    'outbound links open away');
  chk(ends.filter((e) => /^mailto:/.test(e.href)).every((e) => !e.blank),
    'and the mailto does not');
  await ctx.close();
}

await b.close();
console.log(bad ? `\n${bad} FAILED\n` : '\nthe About page reads, walks and responds\n');
process.exit(bad ? 1 : 0);
