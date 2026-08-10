WORK CARD THUMBNAILS
====================

Drop an image in this folder and it becomes the thumbnail for the matching
work card on work.html. Delete it and the card goes back to its animated CSS
preview. No code changes, ever.


THE FILENAMES
-------------

The name is the project title, lowercased, with everything that isn't a
letter or number turned into a hyphen. The four current cards:

  eido-labs.<ext>                Eido Labs
  onefinnet-talent.<ext>         Onefinnet Talent
  today-around-the-world.<ext>   Today, around the world
  magic-extractor.<ext>          Magic Extractor

Rename a project in assets/js/content.js and the expected filename changes
with it — rename the file to match.


THE EXTENSION
-------------

Any of these work. They're tried in this order and the first one found wins:

  .webp  .avif  .jpg  .jpeg  .png  .gif  .svg

So eido-labs.webp beats eido-labs.jpg if both are present. To swap formats,
delete the old file — don't leave both.


TWO WAYS A CARD CAN SHOW IT
---------------------------

  cover   (default) the artwork fills the panel and is centre-cropped to it.
          Suits photography and full-bleed screens.

  sheet   the artwork sits as a poster on a tinted field and pushes toward you
          on hover, the same move the Eido card makes. Suits title cards and
          anything with text in it, because nothing gets cropped.

Set it in assets/js/content.js on the project's entry: thumbFit: 'sheet'.
Onefinnet Talent uses sheet; the rest default to cover.

The field colour is not configured. It's read from the artwork's own left and
right edges on load and then lifted clear of it, so the poster separates from
the background instead of dissolving into it. Replace the file and the card
re-tints itself.


THE IMAGE ITSELF
----------------

  Aspect ratio   For cover: 1.45 : 1 (the card panel). Anything else is
                 centre-cropped to fill, so keep the subject away from the
                 edges. For sheet: any ratio, nothing is cropped.
  Size           1160 x 800 is plenty. The card renders around 580px wide on
                 a large screen, so this covers 2x displays with room over.
  Format         WebP at quality 80-85 is the right default. Keep files under
                 ~250KB; four of these load on the same screen.
  Transparency   Fine. WebP and PNG keep alpha; the panel's own background
                 shows through.

A dark thumbnail is handled automatically — the site measures the top edge of
the image on load and flips the floating nav to light ink so the links stay
readable. Nothing to set.


IF ONE DOESN'T SHOW UP
----------------------

The card silently falls back to its CSS preview, which is by design but does
mean a typo looks like nothing happened. Check in this order:

  1. Filename spelling, exactly as listed above, all lowercase.
  2. Extension is in the supported list, and lowercase (.JPG won't match).
  3. Hard refresh — Cmd+Shift+R. Browsers cache the 404 too.


OVERRIDING THE CONVENTION
-------------------------

To point one card somewhere else entirely, add a thumb key to its entry in
assets/js/content.js:

  { title: 'Some Project', thumb: 'assets/img/someproject/hero.jpg', ... }

That path is used as-is and this folder is ignored for that card. Use this
when the title makes an unwieldy filename, which is why the X0 card does it.


VIDEO THUMBNAILS
----------------

A thumb path ending .mp4, .webm, .mov or .m4v mounts a video instead of an
image. It plays muted, looped and inline, with no controls — a moving still,
not a player. The card stays a plain link.

  { title: 'Designing the Companion App for X0 Ecosystem',
    thumb:       'assets/media/x0/companion-thumb.mp4',
    thumbPoster: 'assets/media/x0/companion-thumb.webp', ... }

thumbPoster is not optional in practice. Three jobs, not one:

  1. it shows before the first video frame decodes
  2. the field/nav tone sampling reads it, because a video element cannot be
     measured until it has data
  3. its arrival is what fades the card in

Point 3 is the one that matters most and is easiest to undo by accident. The
card is painted OVER its CSS preview, so until something reveals it the
preview is what you see — and if the reveal waits on the video, a cold load
shows that preview for as long as the video takes to arrive. On the X0 card
that was a visible flash of the search panel's blue on every reload. Waiting
on the poster instead makes it imperceptible: it is a fraction of the size,
the video paints it natively, and the swap from poster to first frame is
invisible because they are the same image.

For the same reason the poster is worth preloading in the <head> of whichever
page shows the card:

  <link rel="preload" as="image" href="assets/media/x0/companion-thumb.webp">

index.html carries that line for the X0 card. Remove it if that card stops
using a video thumbnail, and add one if another card starts.

Both cover and sheet fit work the same as for images.

Encoding that keeps a card cheap — 1160px wide, no audio, a few seconds,
h264 at crf 27, and faststart so it begins before it has finished loading:

  ffmpeg -i in.mp4 -an -vf scale=1160:-2 -c:v libx264 -profile:v high \
    -pix_fmt yuv420p -crf 27 -preset slow -movflags +faststart out.mp4
  ffmpeg -i in.mp4 -ss 0.6 -frames:v 1 -vf scale=1160:-2 out.webp

Aim under ~400KB. The X0 loop is 4 seconds and lands around 310KB.

prefers-reduced-motion is honoured automatically: the video holds its first
frame instead of looping. Nothing to set.
