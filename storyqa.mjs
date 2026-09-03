/* THE SECTION IS GONE, AND THE PAGE CLOSES OVER IT.
 *
 * "Removed" is two claims, and only one of them is about absence. The first is
 * that nothing the section owned is in the document or the stylesheet any
 * more — checked by asking the page, not by grepping the source. The second is
 * that the page reads as though it never existed: the hero must meet the
 * showcase with the same air any two sections have between them, with no gap
 * where the prose used to be and no spacer standing in for it.
 *
 * The gap is the part worth measuring rather than eyeballing. So the distance
 * between the hero's bottom edge and the showcase's top edge is compared
 * against the distance between the showcase and the section after it — the
 * page's own idea of what a section boundary looks like. A leftover 8rem of
 * padding would pass a screenshot and fail this.
 */
import { chromium } from 'playwright';

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const HOST = process.env.HOST || 'http://localhost:8799';
const b = await chromium.launch({ executablePath: CHROME });
let bad = 0;
const chk = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++; };

const GONE_DOM = ['.story', '.stack', '.stack__card', '.chip-badge', '.badges',
  '.t-avatar', '.t-avatar-group', '.people-trigger', '.field', '.field__scrim',
  '.field__card', 'mark.band', 'mark.blurred', '.block .dots', '.block .tag',
  '.scribble'];
const GONE_CSS = ['.story', '.stack', '.stack__card', '.chip-badge', '.badges',
  '.t-avatar', '.people-trigger', '.field__scrim', '.field__card',
  'mark.band', 'mark.blurred', '.scribble', '--avatar-lift'];
const KEPT_DOM = ['.closing', '.block', 'mark.rule', '.showcase', '.foot', '.outro',
  '#hero', '.tools', '.mbar, .deck__handle'];

for (const [w, h, name] of [[1440, 900, 'desktop'], [820, 900, 'tablet'], [390, 844, 'phone']]) {
  console.log(`\n${w}x${h}  ${name}\n`);
  const ctx = await b.newContext({
    viewport: { width: w, height: h }, hasTouch: w <= 820, isMobile: w <= 820,
  });
  await ctx.route('**/*', (r) => (r.request().url().startsWith('http://localhost:')
    ? r.continue() : r.abort()));
  const p = await ctx.newPage();
  const errs = [];
  const missing = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  p.on('response', (r) => {
    if (r.status() >= 400 && r.url().startsWith(HOST)) missing.push(r.url().replace(HOST, ''));
  });
  await p.goto(`${HOST}/index.html`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2200);
  /* drive the whole page, so anything that builds on scroll has built */
  await p.evaluate(async () => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 60));
    }
    scrollTo({ top: 0, behavior: 'instant' });
  });
  await p.waitForTimeout(600);

  const r = await p.evaluate(({ goneDom, goneCss, keptDom }) => {
    const out = { present: [], cssLeft: [], keptMissing: [], text: '', boundaries: null };
    for (const s of goneDom) {
      try { if (document.querySelector(s)) out.present.push(s); } catch (e) { /* invalid */ }
    }
    /* the STYLESHEET, as the browser parsed it — not the source text */
    const rules = [];
    for (const sheet of document.styleSheets) {
      let rs; try { rs = sheet.cssRules; } catch (e) { continue; }
      const walk = (list) => {
        for (const rule of list) {
          if (rule.selectorText) rules.push(rule.selectorText);
          if (rule.cssRules) walk(rule.cssRules);
          if (rule.style && rule.style.cssText) rules.push(rule.style.cssText);
        }
      };
      walk(rs);
    }
    const all = rules.join(' | ');
    for (const t of goneCss) if (all.includes(t)) out.cssLeft.push(t);
    for (const s of keptDom) if (!document.querySelector(s)) out.keptMissing.push(s);

    out.text = (document.body.innerText || '').replace(/\s+/g, ' ');

    /* the boundary measurement */
    const hero = document.querySelector('#hero');
    const show = document.querySelector('.showcase');
    const next = show && show.nextElementSibling;
    const gap = (a, c) => (a && c
      ? Math.round(c.getBoundingClientRect().top - a.getBoundingClientRect().bottom) : null);
    out.boundaries = {
      heroToShowcase: gap(hero, show),
      showcaseToNext: gap(show, next),
      nextIs: next ? (next.className || next.tagName) : null,
      docHeight: document.documentElement.scrollHeight,
      mainChildren: [...document.querySelector('#main').children].map((n) => n.className || n.tagName),
      emptyKids: [...document.querySelector('#main').children]
        .filter((n) => !n.textContent.trim() && !n.querySelector('img,svg,canvas,video'))
        .map((n) => n.className || n.tagName),
    };
    return out;
  }, { goneDom: GONE_DOM, goneCss: GONE_CSS, keptDom: KEPT_DOM });

  chk(r.present.length === 0,
    r.present.length ? `STILL IN THE DOM: ${r.present.join(', ')}` : 'nothing the section owned is in the document');
  chk(r.cssLeft.length === 0,
    r.cssLeft.length ? `STILL IN THE STYLESHEET: ${r.cssLeft.join(', ')}` : 'and nothing of it is in the stylesheet the browser parsed');
  chk(r.keptMissing.length === 0,
    r.keptMissing.length ? `SHARED THING LOST: ${r.keptMissing.join(', ')}` : `everything shared is still here (${KEPT_DOM.length} checked)`);

  /* the copy itself, phrase by phrase */
  const phrases = ['most online corners', 'speculation', 'interfaces with consequence',
    'complexity feel', 'crypto natives', 'spent the last few years', 'worked with teams like'];
  const found = phrases.filter((s) => r.text.toLowerCase().includes(s.toLowerCase()));
  chk(found.length === 0, found.length ? `COPY STILL ON THE PAGE: ${found.join(' / ')}` : 'none of its seven blocks of copy is on the page');
  chk(/currently at Cypherock/i.test(r.text), 'the closing block is untouched');

  chk(r.boundaries.emptyKids.length === 0,
    r.boundaries.emptyKids.length ? `EMPTY CONTAINER LEFT: ${r.boundaries.emptyKids.join(', ')}` : 'no empty container left behind in #main');
  console.log(`      #main now holds: ${r.boundaries.mainChildren.join(' → ')}`);

  const a = r.boundaries.heroToShowcase;
  const c = r.boundaries.showcaseToNext;
  chk(a !== null && c !== null && Math.abs(a - c) <= Math.max(24, c * 0.5),
    `the hero meets the showcase like any other boundary (${a}px vs ${c}px to ${r.boundaries.nextIs})`);

  chk(!missing.length, missing.length ? `MISSING FILES: ${[...new Set(missing)].join(', ')}` : 'every file the page asks for exists');
  chk(!errs.length, errs.length ? `ERRORS: ${errs.slice(0, 3).join(' | ')}` : 'no page or console errors');
  console.log(`      page height ${r.boundaries.docHeight}px`);
  await ctx.close();
}

await b.close();
console.log(bad ? `\n${bad} FAILED\n` : '\nthe section is gone and the page closes over it\n');
process.exit(bad ? 1 : 0);
