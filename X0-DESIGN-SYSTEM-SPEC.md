# The Design System — one table, one pin

**Scene id** `x0-system` · **kind** `room` · **duration** `380svh`
At a 900px viewport: **3,420px tall, of which 2,520px is pin.**

Nothing in this scene is in a container. Every artefact is an `<img>` of one of
Ishaan's transparent SVGs; the phone is the Home-screen render, which came in
its own bezel. Nothing is blurred, at rest or in motion.

---

## The cut

| | |
|---|---|
| **0.00 – 0.24** | the lockup, nothing else |
| **−0.04 – 0.44** | the six sheets, one at a time |
| **0.30 – 0.47** | **the phone**, resolving in place among them |
| **0.42 – 0.72** | the five components gather at its edges |
| **0.72 – 0.80** | everything together, and not a word |
| **0.80 – 1.00** | the line |

The spacing grid and the type scale arrive at −0.04, so the room is never an
empty rectangle on the first frame.

---

## The art-direction pass

Eight notes came back. What each one turned into:

### The lockup was 127px apart

Not a spacing choice — a bug. Both blocks of copy share one grid cell so they
can cross-fade in place, which sizes that cell to the taller of the two, and an
auto-row grid with the default `align-content` **stretches its rows to fill**.
The title card's two rows were being pushed apart by the height of a headline
that was not even on screen yet. `align-content: start` closed it.

Then it became a lockup rather than an icon with text under it: **one flex row,
34px mark, 10px gap** — smaller than the mark is tall, which is the whole of
what makes two things read as one. The name dropped "N45 ·", because a lockup
that repeats what its own mark says is a logo with a caption. Two optical
adjustments: the name is nudged up 1px, because the mark's artwork is inset
inside its tile and centring the tile leaves the text sitting visually low; and
its tracking is trimmed to 0.2em so the gap after its last letter does not open
up against the mark.

### The phone was translucent

The worst thing in the section, and he was right that it broke the illusion.
Its arrival was a straight opacity ramp over a sixth of the pin, and the
components behind were visible straight through the screen.

Now the **opacity resolves in a fourteenth of the pin — about 170px of scroll —
while the scale keeps settling for twice that.** It goes solid almost at once
and then comes to rest. Everything in the near plane was pushed back to 0.42,
by which time it is opaque, so nothing is ever behind a see-through phone.
Measured: at p=0.38 the phone is at opacity 1 and the first component arrives at
0.42.

### The motion was mechanical

`--q` is linear in the scroll: every object travelled at constant speed and
stopped dead. There is now `--e` — smoothstep, q²(3−2q), three multiplications
of unitless numbers, which is all `calc()` needs — and every translate, scale
and rotation runs off it. Things **ease out of the distance and settle**.

And they orbit. Every entry vector is computed from the phone outward along the
line to the object's own place, plus a consistent tangential swing, so all
eleven come in on the same arc toward the same centre of gravity instead of
each flying in from whatever direction had been written down.

### The final frame was lopsided

Measured rather than argued. The 3×3 ink grid at p=0.97 read

```
19.90   4.54   0.53      ← two dead corners,
 4.23  16.53   2.32        on a diagonal
 0.17   4.09   8.74
```

left 45%, right 17%. Moving objects did nothing and raising their brightness did
nothing either, because **the veil was the cause**: a flat wash took the whole
room down to a quarter while the copy sat above it at full strength. 88% of a
quarter is still a quarter.

The veil is now **an ellipse centred on the copy column**. Behind the headline
it is the ground, flat and opaque, and the type reads at 18.3:1; by the far
corner it has almost gone, so the system is still on the table over there. On
top of that the phone moved to **56%**, making the last frame a two-column
composition rather than a headline with a hole beside it, and the headline came
down from 52px to **44px** so the hero is unambiguous.

```
19.91   4.51   4.33      left 34%  centre 40%  right 26%
 2.75  16.46   3.41      L:R 1.33, from 2.53
 1.47   6.92  11.69      no dead cell
```

Held mid-frame, p=0.74: left 25% · centre 46% · right 29%, L:R **0.88**.

### Everything was as bright as the hero

The one that mattered most, and the one I had been measuring myself out of
seeing. Six objects sat at full brightness — the Continue button, the slider,
the snackbar, the chips, the progress bar, the navigation sheet — all of them
white UI on black, all of them as strong as the phone they were supposed to be
supporting. That is why the eye had nowhere to land, and no amount of moving
things around was going to fix it.

There is one tonal hierarchy now and **the phone is the only object in the room
at full strength**:

| | |
|---|---|
| the phone | 1.00 |
| the five real components | 0.62 – 0.68 |
| the six sheets | 0.34 – 0.62 |

`--dim` also moved off the object wrapper onto the artwork, because on the
wrapper it took each label down with its sheet — a sheet pushed back to 42%
had a label at 3:1. The artwork recedes; the label is tied to it only six
tenths of the way, so it is always quieter than the thing it names and always
brighter than a whisper. Measured: 6.7:1 and 4.6:1.

### Empty space had no reason

The chip-and-toggle sheet came back off the bench and into the top right, small
and bright, lying across the type specimen the way the button lies across the
colour ramp on the other side — symmetry of kind, not of position. And the crop
on the snackbar was flipped: cut by the phone's right edge all it had left was
"…essfully ✕", the green bar and the sentence being the hidden half. It is cut
by the **left** edge now, and it reads.

---

## The objects

| at | asset | w | x / y | dim | drift | other motion |
|----|-------|---|-------|-----|-------|--------------|
| −0.04 | `type-scale.svg` | 39vw | 86% / 26% | .62 | −40px | rot −1.6°, spin −0.8° |
| 0.05 | `spacing.svg` | 30vw | 12% / 86% | .34 | −54px | spin +0.6° |
| 0.12 | `colour.svg` | 28vw | 12% / 53% | .42 | −30px | rot +1.2°, **scale +3%** |
| 0.17 | `buttons.svg` | 40vw | 52% / 95% | 1.0† | −96px | rot +1.4°, spin +1.8° |
| 0.22 | `icons.svg` | 20vw | 78% / 54% | .44 | −26px | rot −2.4° |
| 0.27 | `tab-bar.svg` | 36vw | 89% / 78% | .50 | −38px | rot −1° |
| **0.30** | **`hero.webp`** | **min(22vw, 17.5rem)** | **56% / 50%** | 1.0 | −14px | resolves in place |
| 0.42 | `snackbar.svg` | 22vw | 44% / 58% | .62 | **+38px** | rot −1° |
| 0.46 | `slide-to-pay.svg` | 24vw | 41% / 76% | .62 | −60px | rot +0.8° |
| 0.50 | `button.svg` | 11vw | 31% / 48% | .62 | −34px | — |
| 0.53 | `progress.svg` | 16vw | 77% / 45% | .68 | −20px | — |
| 0.56 | `controls.svg` | 15vw | 74% / 40% | .62 | −46px | rot +1.6° |

† `buttons.svg` stays at 1.0 because the file itself is exported at 30%,
which puts it in the sheet tier on its own.

**No two share a `dep`**, one drifts down while the rest rise. Scales run 11vw
to 39vw; five objects run off an edge in four directions.

Positions are checked geometrically at **both ends of the pin** against each
file's measured ink box — not its image box, which is a different rectangle,
because every SVG carries a transparent margin round its artwork. The checks
that pass: no annotation on another object's artwork, no sheet over another
sheet, and nothing under either block of copy.

---

## A note on the frame this was judged in

The first three passes were art-directed at 1440 x 900. The screen recordings
are 2938 x 1602, which is a 2x capture of **1469 x 801** — wider, and a hundred
pixels shorter. Every vertical relationship in the composition is different in
a frame that much shorter, which is part of why two rounds of balancing did not
land. Everything here is now measured and rendered at 1469 x 801.

Balance at that size: **centre 53% / 51% / 42%** across the assembly, the hold
and the last frame — the phone owns the middle of the composition at every
position — with L:R running 0.53 -> 0.73 -> 1.45 and no dead cell in the grid.

## At phone width

Pin released, scene height `auto`, one column in arrival order. Measured at
390 × 844: scene 3,010px, `scrollWidth` exactly 390, nothing overflows, no text
clipped at either width. All 26 scenes of the film still track.

---

## Still outstanding, and still one line

`buttons.svg` opens with `<g opacity="0.3">` — a top-level group left at 30% in
Figma. It is at `dim: 1.0` here, so 30% is all the file has to give.
`colour.svg` still carries the wrong title, **"TEXT INPUT, EVERY STATE"**, over
a greyscale ramp; the one label beside it is the patch until it is re-exported.

---

*Everything above is read out of `assets/js/content.js`. If the scene data and
this file ever disagree, the data is right.*
