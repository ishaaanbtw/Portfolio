# Cypherock X0 — the shots the film is waiting for

Generated from the `scenes` array in `assets/js/content.js`. Regenerate rather
than editing by hand.

**26 scenes · ~4220 svh (about 42 screens) · 35 reserved frames.**

The film is white with 6 black scenes as punctuation (`x0-open`, `x0-brief`, `x0-apart`, `x0-dec-1`, `x0-tap`, `x0-end`).
There is no accent colour anywhere in it — three measured ink tiers do all the
work (19.0:1 / 7.3:1 / 4.6:1 on white). Every frame that does not state its own
shape is cut to **1.586**, the ID-1 card proportion.

A reserved frame is not a broken image: it renders as a flat tint with the shot
named in it. To fill one, add a `src` to that object — nothing else changes:

```js
{ label: 'The wall', src: 'assets/img/x0/process/wall.webp',
  treat: 'full', of: '...' }
```

`treat` picks the treatment: `lift` (object with air under it), `paper` (printed
and put down), `macro` (enlarged past its frame), `strip` (flush with its
neighbours), `full` (edge to edge). No two neighbouring scenes use the same one.

---

## 01 — `x0-open` · object · 130svh

- **X0 card** — The card, three-quarter view, one hard key light from the left, on black. Transparent PNG at 3x so it can sit in front of the letters.

## 04 — `x0-subtract` · strike · 180svh

- **X1 vault device** — The X1 device on a light ground, same key light as the card. This is the object that exits the frame and does not return.
- **Card + phone** — The X0 card held against the back of a phone, mid-tap, same lighting. The two objects that are left.

## 12 — `x0-n45` · split · 190svh

- **CySync components** — The existing CySync component sheet. Redact anything non-public before this ships.

## 13 — `x0-assembly` · asm · 200svh

- **Button** — The primary button component, isolated, at 3x.
- **Navigation** — The navigation bar as rebuilt in month three, isolated.
- **Spacing** — The 8pt spacing grid as an overlay, transparent background.
- **Type scale** — The type scale specimen and its two weights, isolated.
- **Colour** — The colour token swatch set, named.
- **Icons** — The icon set, isolated on a transparent ground.
- **Input** — Text input, every state, close crop.
- **Card** — The card component, isolated.

## 14 — `x0-dec-2` · photo · 160svh

- **The wall** — Photograph — four shortlisted directions pinned up together, wide, shot straight on. Handheld and imperfect is right. Blur anything legible on the rejected three.

## 15 — `x0-ia` · cross · 130svh

- **IA whiteboard** — Photograph — the information-architecture session with the PM. Boxes, arrows, crossings out. Shot square to the wall.
- **The same thing, redrawn** — The clean IA diagram in the product’s own type, aligned so its key boxes land on the photograph’s.

## 16 — `x0-tracks` · tracks · 170svh

- **Component v1** — One component, first version.
- **v2** — The same component, second version.
- **v3** — Third version — the one that stayed.
- **Low-fi flow** — The low-fidelity flow frames as presented to stakeholders.
- **A review thread** — A real design-review thread. Blur names, faces, and any unreleased feature names before this is public.
- **What changed** — The affected screen before and after, identical crop.

## 17 — `x0-competitors` · pins · 180svh

- **One of theirs** — A competitor setup screen, cropped close on the step that fails. No brand mark in frame.

## 18 — `x0-button` · rail · 170svh

- **v1** — Button, first version. Identical crop across all six.
- **v2** — Second version.
- **v3** — Third version.
- **v4** — Fourth version.
- **v5** — Fifth version.
- **shipped** — The sixth — the one every primary action in the product was built from.

## 22 — `x0-world` · world · 160svh

- **iOS home screen** — The X0 icon in place on a real iPhone home screen, among ordinary apps.
- **Android home screen** — The same, on Android.
- **In dark mode** — One product screen in dark mode, matched crop to its light version.

## 24 — `x0-67` · num · 170svh

- **Naming convention** — Close crop of the component naming panel, showing the convention that makes this possible.
- **What it generated** — The screen that prompt produced. Unretouched — the flaws are the point.
- **Hand-corrected** — The same screen after correction, for the delta.

## 26 — `x0-end` · object · 120svh · BLACK

- **X0 card** — Scene 01’s render, reused exactly. The repetition is the point — do not reshoot it.

---

## Already real, nothing needed

- All twelve onboarding screens — scene 19, the pinned device
- Four of those twelve again — scene 21, the four principles
- `x0/x1.webp` and `x0/x0.webp` — scenes 02 and 10
- `01-splash.webp` — scene 03, what the dot field resolves into
- `app-walkthrough.mp4` — scene 20, standing in for the tap until it is shot

## Shoot day, highest value first

1. **The X0 card**, one hard key light, three rotations — scenes 01 and 26 (black scenes, so light it on black)
2. **The tap, on video** — hand, card, phone, tripod, one light — scene 20
3. **Four directions on the wall**, wide, straight on — scene 14
4. **The IA whiteboard**, square to the wall — scene 15 (printed, so shoot it flat)
5. **Six button states**, identical crop — scene 18
6. **iOS and Android home screens plus one dark-mode screen** — scene 22

## Redact before any of these are public

- The review thread (scene 16) — names, faces, unreleased feature names
- The CySync component sheet (scene 12) — anything non-public
- The rejected directions (scene 14) — anything legible on the three that lost
- Scene 17 names no competitor and reproduces nothing, deliberately. It is still
  the one scene with legal exposure. Read it before it ships.
