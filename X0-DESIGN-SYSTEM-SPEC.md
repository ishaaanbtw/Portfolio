# The Design System — one table, one pin, and now one story

**Scene id** `x0-system` · **kind** `room` · **duration** `760svh`
At a 900px viewport: **6,840px tall, of which 5,940px is pin.**

Nothing in this scene is in a container. Every artefact is an `<img>` of one of
Ishaan's transparent SVGs; the phone is the Home-screen render, which came in
its own bezel.

---

## The room did not change. The order did.

Every resting place, every width, every dim, every entry vector, every drift
rate and the whole final composition are the ones that were already here. This
is the same table with the same things on it, ending on the same frame.

What changed is the sequence they happen in — and what they do on the way.

**The claim, stated as a sequence: the system existed before the interface.**

---

## The cut

| | |
|---|---|
| **0.00 – 0.04** | a dark room, a grid, a glow. Nothing else. |
| **0.04 – 0.16** | **the lockup**, at 96px, and a long hold on it |
| **0.13 – 0.27** | **the device is drafted** — one stroke, from a corner, all the way round. No interface. |
| **0.26 – 0.33** | the body fills in behind the outline. Still no interface: an empty, opaque object. |
| **0.34 – 0.52** | the system arrives and takes up its orbit |
| **0.52 – 0.86** | **eight round trips.** A piece leaves, goes in behind the phone, the band it authors comes on, the piece comes back to exactly where it was. |
| **0.86 – 0.90** | everything home, the product finished, held |
| **0.90 – 1.00** | the line |

Roughly 250px of scroll per construction beat and a good deal more than that on
either side of them. Every beat introduces one thing, and nothing else moves
while it does.

---

## The five mechanisms

### 1 · The orbit — `.room__orb`

One wrapper per object. It is the size of the whole stage and its transform
origin is the **device's centre**, so rotating it a degree or two across the pin
swings whatever is inside along an arc around the phone. The artwork then
counter-rotates by exactly the same amount, so the piece rides that arc while
staying upright. No trigonometry, no keyframes.

Every object carries its own rate, and that difference is the parallax: the near
components come round at 2.6° over the whole section and the far sheets at 0.7°,
so nothing in the room ever moves with anything else. Two degrees at 400px of
radius is 14px of travel — which is the point. It should not be possible to
catch it moving; it should only be obvious, a screen later, that it has.

The z-index lives on the wrapper rather than on the artefact, because a rotated
wrapper is a stacking context and an index inside one is measured against its
siblings rather than against the room.

### 2 · The draft — `.room__cad`

One rounded rect with `pathLength="1000"`, so the dash array is in thousandths
of its own perimeter whatever the geometry, and the offset running to zero draws
it from a corner all the way round. It is a stroke being laid down, not a shape
being faded up, and that difference is the whole of why it reads as CAD.

It sits under the device and matches its transform term for term, so when the
body comes up behind it the two are the same rectangle and the hand-off is
invisible. Then it **steps back to a quarter and stays** all the way through the
system gathering around it — it is the only thing holding an empty phone as an
object while eleven brighter things collect in the room — and goes for good on
the beat the first band lands.

### 3 · The blank screen — `.room__blank`

A separate layer, and it has to be, because it must not touch the bezel. The
first attempt dimmed the whole render, which crushed the bezel with everything
else — so every band that landed brought the real bezel back with it and left a
step in the phone's edge above and below itself. Now the shell underneath is the
render exactly as exported, bezel and rim intact and never altered, and this
layer blanks only the glass. The clip is the screen's own rectangle, measured
off the render (19px in from the left, 26 from the right, 14 from the top, 22
from the bottom) with the corner radius the screen actually has.

**Brightness alone cannot empty a screen**, which took two attempts to learn.
Multiplying every pixel by a small number keeps every *ratio* between them, so
white type on a black screen stays white type on a black screen — a dimmer
version of the same legible interface, and at any setting dark enough to hide it
the phone has gone too. What empties it is **contrast**: collapsing the range to
a fourteenth leaves a flat slab with the detail crushed out, and the brightness
then only decides how dark that slab is. It is set to land a pixel value or two
under the render's own dark areas, which is why the edge of a lit band cannot be
seen against it.

### 4 · The bands — `.room__p`

`hero.webp` is one flat render with no layers, so a part is that same image again
— same box, same size, same position — clipped to one horizontal band and
stacked over the blank. Light a band and that part of the interface exists.
Because every copy is identical and identically placed, two adjacent bands are in
perfect register: there is no seam to hide and no second mockup to keep in sync.

The band edges were measured off the render's own row-brightness profile — its
dark gutters — so every cut falls where the screen is already black.

| band | from | to |
|---|---|---|
| status | 3.0% | 8.2% |
| app bar | 8.2% | 15.0% |
| card | 15.0% | 23.6% |
| chart | 23.6% | 37.6% |
| balance | 37.6% | 45.8% |
| send | 45.8% | 53.0% |
| actions | 53.0% | 59.3% |
| accounts | 59.3% | 76.0% |
| add new | 76.0% | 84.0% |
| tab bar | 84.0% | 95.5% |

A band **snaps**: a quartic ease out is 94% done in the first third of its
travel, and the 2vw it travels comes from the direction the piece that authored
it arrived from. It is not placed — it is put there, from the side the part came
in on.

### 5 · The round trip

`tp` is when an artefact leaves its place and `tb` is when it starts back; `--g`
is one while it is away and zero at both ends, so the same two numbers carry it
out and home again and it lands on exactly the pixel it left. **There is one
resting position per object, not two, so there is nothing to keep in sync.**

It goes out faster than it comes back — 55 against 40 — which is what makes it
read as being fetched rather than as swinging. And it shrinks to a third on the
way, so that by the time it reaches the device it is smaller than the device and
passes cleanly **behind** it. The piece disappears into the phone, the band comes
on, the piece comes back out.

Why a round trip rather than a one-way journey: **because the ending is the
point.** If the pieces were consumed the section would say "these were
scaffolding". Coming back to the exact pixel they left, and staying there under
the closing line, it says "these are what it is made of, and they are still
true".

---

## The eight trips

| | leaves | piece | band it authors |
|---|---|---|---|
| 1 | 0.520 | Typography | the balance |
| 2 | 0.562 | Colour | the chart |
| 3 | 0.604 | Buttons | Send / Receive |
| 4 | 0.646 | Navigation | the tab bar |
| 5 | 0.688 | Surfaces | the card, then the account rows |
| 6 | 0.730 | Controls | Swap / Buy / Stake |
| 7 | 0.772 | The primary button | + Add new or existing account |
| 8 | 0.814 | Icons | the bell and the gear, then the clock |

**Colour goes second and not last**, which was the plan until it was rendered:
the balance sits *on* the chart's green fill, so the band that carries the number
carries green with it whatever the order.

**Three pieces never leave.** The spacing grid is already in the phone — it is
the reason the phone is that shape — and sending it in would be sending it
twice. The slide-to-confirm control and the progress bar do not appear anywhere
on the Home screen, and sending a piece in to build something that is not there
would be the one dishonest move in the section.

---

## The phone is never transparent

The empty device is the render with its glass blanked, not faded: every pixel
inside the bezel is a pixel. Every artefact travels **behind** it — all eleven
orbit wrappers hold z-indices of 1 to 12 against the device's 18 — so at no point
in the section is anything visible through the screen, and the occlusion is what
sells the hand-off.

---

## Measured

**Scroll cost**, in the same software rasteriser as the rest of the film, at
1469 × 801:

| | median frame |
|---|---|
| other scenes in the film | ~17ms |
| **the version this replaces** | **175ms** |
| **this one** | **63ms** |

Nearly three times faster than the scene it replaces, despite doing a great deal
more — and the reason is one invisible change. The long black shadow under the
phone was a `drop-shadow`, which follows the alpha, which means blurring the
silhouette of a 300 × 620 image at an 80px radius on every frame the transform
changes; this section changes the transform on every frame there is. It is a
radial gradient now, painted once and then merely moved. Under a phone standing
in a pool of light the two are indistinguishable — the shadow's job is to darken
the pool, not to trace the bezel. The rim stays a real drop-shadow, because that
one does have to follow the silhouette.

**At phone width**, measured at 390 × 844: scene 3,072px, `scrollWidth` exactly
390, nothing overflowing, everything visible. Same at 360.

---

## At phone width, and with motion off

The pin is released and the room unstacks into a column in arrival order, as it
always did. The orbit, the draft and the bands all come off — they are things
that happen in a pinned frame with a device standing in it, and in a column
there is no frame, no device to circle and nothing to draw around. The phone is
simply the finished render, once.

The ground shadow becomes a **light** here, and it had to be positioned under the
phone rather than over it: a positioned pseudo-element paints above a static
sibling whatever its z-index, so the black ellipse was covering the render
outright.

With motion off the film holds `--p` at 1 and the scene renders its end state,
which for this one is the right frame to be left on: the finished product with
the whole system standing around it.

---

## Still outstanding

`buttons.svg` opens with `<g opacity="0.3">` — a top-level group left at 30% in
Figma. It is at `dim: 1.0` here, so 30% is all the file has to give.
`colour.svg` still carries the wrong title, **"TEXT INPUT, EVERY STATE"**, over a
greyscale ramp; the one label beside it is the patch until it is re-exported.

---

*Everything above is read out of `assets/js/content.js`. If the scene data and
this file ever disagree, the data is right.*
