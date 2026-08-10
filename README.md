# Portfolio

A four-page portfolio site. No framework, no build step, no dependencies.
Open `index.html` in a browser and it works.

## Editing

Everything you'd want to change lives in **`assets/js/content.js`** — your name,
tagline, email, the scroll copy, the Teams/Experiments table, and the Work,
People and Writing entries. Change a value, save, refresh.

Inline markup you can use inside any string in that file:

| Markup | Result |
| --- | --- |
| `<em>word</em>` | italic word in a hairline box |
| `<u>word</u>` | soft underline that draws itself in |
| `<b>word</b>` | full-strength ink |
| `<span class="dim">…</span>` | permanently muted text |
| `<i class="chip">🜁</i>` | small round chip |
| `<i class="chip" style="--chip:#22c55e">A</i>` | chip in a brand colour |
| `<a href="…">…</a>` | link |
| `<br>` | line break |

## Replacing the art

Three SVGs in `assets/img/`, all swappable for your own files:

- `figure.svg` — the hero illustration
- `foliage.svg` — the leaf shadow cast over the hero
- `desk.svg` — the illustration above the footer

## The CRT panel

Drop a video at `assets/media/principle.mp4` and it plays inside the tube,
grayscaled and scanlined, growing as you scroll past. Without a file there, the
site generates an abstract broadcast on a canvas instead, so nothing looks
broken. Change the file path and captions under `crt` in `content.js`.

## Interactions

- **Scroll reveal** — prose lights up word by word, tied to scroll position
  rather than a timer, so it tracks your speed in both directions.
- **Sky** — the gradient behind the page is the current hour where the visitor
  is. Drag the sun/moon at the bottom left to scrub through a full day.
- **Sound** — every click and tick is synthesized with the Web Audio API, so
  there are no audio files to load. Muting persists across visits via the
  speaker button at the bottom right.
- **Reduced motion** — with `prefers-reduced-motion` set, all text renders at
  full contrast immediately, the CRT stops pinning, and animation is disabled.

## Deploying

It's static, so anything works:

```bash
# Netlify
npx netlify-cli deploy --prod --dir .

# Vercel
npx vercel --prod

# GitHub Pages — commit the folder and enable Pages on the branch
```

For local previewing, opening the file directly is fine. If you'd rather serve
it:

```bash
python3 -m http.server 8000
```

## Structure

```
index.html          hero, story, CRT, index table
work.html
people.html
writing.html
assets/
  css/site.css      design tokens then components, in that order
  js/content.js     ← everything you edit
  js/site.js        sound, sky, word splitting, CRT, tabs, routing
  img/*.svg
  media/            drop principle.mp4 here (optional)
.tools/             jsdom test harnesses — `node .tools/run.mjs` runs them all
```

`.gitignore` excludes `.tools/`, so those harnesses aren't committed. Drop that
line if you'd rather keep them with the project.

`site.js` is organised in numbered sections matching the order things boot.
Each page is a thin HTML shell; the shared nav, footer and controls are rendered
from `content.js` so there's one place to change them.
