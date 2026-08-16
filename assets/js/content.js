/* ============================================================================
   content.js — EVERYTHING YOU EDIT LIVES IN THIS FILE.
   ----------------------------------------------------------------------------
   No build step. Change a value, save, refresh the browser.

   Inline markup you can use inside any text string:
     <em>word</em>          italic word in a hairline box
     <mark>word</mark>      soft grey highlight, like a left-over selection
     <u>word</u>            soft hand-drawn underline
     <b>word</b>            full-strength ink (reveals early)
     <span class="dim">    permanently muted text
     <a href="...">        link with underline-on-hover
     <i class="it">word</i>  plain italic, no box
     <i class="chip">🜁</i> small inline round chip (emoji or single letter)
     <i class="chip" style="--chip:#22c55e">A</i>  chip with a brand colour
     <i class="chip-badge" data-tip="Safe" style="--chip:#12b981">S</i>
                            badge with a tooltip that springs up on hover
     <i class="scribble"></i>  hand-drawn scribble glyph
     <span class="stack" role="button" tabindex="0"> … </span>
                            stack of <span class="stack__card" data-name="…">
                            cards that cycle on hover and click
   ========================================================================== */

window.SITE = {
  /* ---------------------------------------------------------------- identity */
  person: {
    name: 'Ishaan Gupta',
    // Shown next to the name in the hero. Keep it to one breath.
    tagline: 'designing best-in-class products for hyperonline startups',
    email: 'product@cypherock.com',
    /* The address the hero's Copy button puts on the clipboard. It is separate
       from `email` above on purpose: that one is the work address the page is
       written from, this one is where you want to be written back to. */
    copyEmail: 'ishaangupta.888@gmail.com',
    resumeUrl: 'assets/resume/ishaan-gupta-resume.pdf',
    /* The resume is shown IN the page rather than handed to the browser's PDF
       plugin, so the pages are here as images and the file above is what the
       download button gives you. Re-export both together: render the PDF at
       150dpi, resize to 1200 wide, save as webp. */
    resume: {
      title: 'Resume',
      sheets: ['assets/resume/p1.webp', 'assets/resume/p2.webp'],
      /* the aspect of one page, so the viewer can hold its shape before the
         image has loaded and nothing jumps when it does */
      ratio: 1200 / 1553,

      /* THE LINKS, BECAUSE A PICTURE OF A LINK IS NOT A LINK.
         The pages are images, which is what makes the viewer feel like part of
         the site — but it also throws away every anchor the PDF had. So the
         link rectangles are lifted out of the file and laid back over the
         picture as real <a> elements. One row per link:

           [ href, left%, top%, width%, height% ]

         All four numbers are percentages of the PAGE, not of the image, so
         they hold at any size and on any screen. To regenerate after a
         re-export, read the /Annots of each page and convert — PDF space has
         its origin at the BOTTOM left, so with a page W x H points and a
         rect [x0 y0 x1 y1]:

           left = x0/W        top    = (H - y1)/H
           width = (x1-x0)/W  height = (y1-y0)/H

         The LinkedIn one is written out in full here on purpose. In the PDF it
         is not a URI at all — the address was typed without a scheme, so the
         exporter turned it into a "go to a remote FILE named
         www.linkedin.com/in/ishaangupta24.pdf" link, which is dead in every
         reader. Putting https:// in front of it in the source fixes it at the
         root; this row is what makes it work in the meantime. */
      links: [
        /* page 1 */
        [
          ['mailto:ishaangupta.888@gmail.com', 6.72, 8.096, 21.063, 1.447],
          ['tel:+919717085986', 29.665, 8.133, 12.995, 1.203],
          ['https://ishaan-gupta.in/', 54.024, 8.096, 11.322, 1.447],
          ['https://www.linkedin.com/in/ishaangupta24', 67.227, 8.096, 26.958, 1.447],
          ['https://www.cypherock.com', 18.396, 30.641, 7.842, 1.461],
          ['https://onefinnet.com/talent', 17.219, 60.617, 7.366, 1.447],
        ],
        /* page 2 */
        [
          ['https://www.upes.ac.in/blog/design/this-upesite-is-making-renting-items-the-new-cool',
            14.998, 8.439, 8.753, 1.461],
        ],
      ],
    },
    location: 'Bengaluru, IN',
    // Used for the browser tab and social previews
    metaDescription:
      'Product designer working on self-custody, hardware and onchain interfaces.',
    socials: [
      { label: 'GitHub', href: 'https://github.com/', icon: 'github' },
      { label: 'X', href: 'https://x.com/', icon: 'x' },
      { label: 'Email', href: 'mailto:product@cypherock.com', icon: 'mail' },
    ],
  },

  /* -------------------------------------------------------------------- deck
     What is underneath the site. Above 48rem the menu is not drawn over the
     page — the page slides off it — so this is the list you see once it has
     moved. It is deliberately not the same array as `nav` below: that one is
     the four pages, this one is everywhere you can go, pages included.

     `kind` says where a link points without repeating an address that is
     already settled in `person`:
       resume   the PDF in person.resumeUrl, opened in the page's own viewer
       email    a mailto to person.email
     Anything with a plain `href` is just a link. Add a row and it appears; the
     order here is the order down the deck. */
  deck: {
    links: [
      { label: 'Home', href: 'index.html' },
      { label: 'Work', href: 'work.html' },
      { label: 'Resume', kind: 'resume' },
      { label: 'Email', kind: 'email' },
    ],
  },

  /* ------------------------------------------------------------------ motion */
  motion: {
    // Eased wheel scrolling. Set false to hand scrolling back to the browser.
    smoothScroll: true,
    // Lower is slower and heavier. 0.08–0.16 is the useful range.
    scrollEase: 0.115,
  },

  nav: [
    { label: 'Home', href: 'index.html' },
    { label: 'Work', href: 'work.html' },
  ],

  /* ------------------------------------------------------- hero call to action */
  hero: {
    primary: { label: 'Copy email', action: 'copy-email' },
    secondary: { label: 'Resume', action: 'resume' },
  },

  /* ------------------------------------------------------------ the 404 room
     A dead end that is not empty. The copy stays small and editorial — it is a
     sign in the room, not the room — and everything else on that page is the
     brick engine the hero already runs.

     `pieces` is how many bricks the room is filled with, and it is the only
     number here worth touching. It is deliberately several times the hero's
     eighteen: the point of the page is abundance. `mobile` is the same room
     with fewer objects in it, because a phone has a quarter of the floor and
     the same frame budget.

     `drip` is the trickle after the load — someone outside the room is still
     throwing bricks in. Long enough apart to read as occasional rather than as
     an animation that never finishes.                                        */
  notFound: {
    code: 'Error 404',
    headline: 'This page wandered off.',
    body: 'The link is either old or slightly mistyped. Nothing behind it any more.',
    /* the same nav as everywhere else, as ordinary links */
    links: [
      { label: 'Home', href: 'index.html', primary: true },
      { label: 'Work', href: 'work.html' },
    ],
    /* the quiet invitation. One line, no tutorial. */
    aside: 'Since you are here — build something.',
    pieces: 64,
    mobilePieces: 26,
    drip: { every: [5200, 9000], count: [1, 2], max: 120 },
  },

  /* ------------------------------------------------------------- tool dock
     'contextual' is the state machine from the brief: open on the hero,
     collapsed to an edge tab while reading, open again inside a project.
     'everywhere' pins it open on every page.                              */
  rack: {
    scope: 'contextual',
    /* the welcome line, shown once per session about 2s after the dock opens */
    welcome: [
      'Draw on my portfolio.',
      'Leave me a note.',
      'Click something to select it.',
      'Press P to sketch.',
    ],
  },

  /* --------------------------------------------------------------- hero canvas
     The Figma-file hero. Everything in `pills`, `stickers` and `notes` is
     draggable once it lands on the canvas.                                  */
  canvas: {
    /* The headline stays a plain editable string. One mark is read out of it:

         *like this*  italic

       Markup in the string rather than an array of segments so the sentence can
       still be read and rewritten as a sentence, spaces and punctuation included.
       Anything unmarked is ordinary text. Note the full stop sits OUTSIDE the
       asterisks — inside, the punctuation slants with the word. */
    /* One weight, no emphasis. The `*word*` syntax still works — the parser and
       `.hdl-em` are both still there — so wrapping a word puts the italic back. */
    headline: 'I’m Ishaan, a product designer who engineers.',
    /* The tags. `detail` appears on hover (and stays while selected).

       `icon` is a built-in glyph — 'pin' or 'cypherock', both drawn inline in
       site.js so they take the label's own colour. `logo` is any SVG path
       instead, for a mark that should keep its brand colours.

       WHERE THE GLYPH SITS IS WRITTEN IN THE LABEL. `{}` is the slot, the same
       way `*word*` in the headline is the italic: put it at the end and the pin
       trails the place name, put it between two words and the mark stands in
       for the one you left out. Leave it out entirely and the glyph leads,
       which is what every tag used to do. */
    pills: [
      { label: 'Based in Gurugram {}', icon: 'pin' },
      { label: 'Currently {} Cypherock', icon: 'cypherock' },
    ],

    /* Load reveal, in ms. Measured off the reference; lower every number by the
       same factor if you want the page to arrive sooner. */
    reveal: {
      blur: 14,          // starting blur in px
      headline: 1100,    // how long the headline takes to resolve
      wordStagger: 9,    // per-word lag, which makes later lines trail
      pillsAt: 1050,     // when the tags start
      pills: 850,
      pillStagger: 55,
      ctaAt: 1500,
      navAt: 2300,
      navStagger: 70,
      hintAt: 2600,
    },

    /* ----------------------------------------------------------- stickers
       The four stickers around the headline. Each peels its top edge back when
       you hover it and further when you press — React Bits' StickerPeel, ported
       to plain CSS in site.css. They drag like everything else on the canvas:
       throw one, select it, rotate it, delete it, undo.

       ARTWORK. Cut-outs in assets/img/stickers/, with the white die-cut edge
       already part of the image. Drop a replacement in at the same path and
       it's swapped.

       THE FIELDS

         x, y     where the sticker's CENTRE sits, as a percentage of the hero,
                  so the composition survives a resize. Anything that would
                  cover the headline is pushed clear automatically.
         w        display width in px at a 1440px-wide window; it scales from
                  there.
         rot      the angle it's stuck on at. Nothing sits square.
         dir      WHICH EDGE PEELS, in degrees, clockwise from the top. The fold
                  always comes off the top, and this turns the sticker
                  underneath to decide where "top" is — so 0 peels from the top,
                  90 from the right, 180 from the bottom, 270 from the left, and
                  anything between is a corner: 45 lifts the top-right. The
                  artwork never looks rotated by it; `rot` is the angle you can
                  see. Any angle works on any shape — place() sizes the fold's
                  box to the artwork's footprint at that angle, so a wide
                  sticker peeling from a side isn't cropped to its own height.
         hover    how far the peel opens on hover, as a percentage of the
                  sticker's height. 30 is a corner; past ~45 it's half the
                  sticker and stops reading as a peel.
         active   how far it opens while pressed. A little more than `hover`.
         shadow   0–1, how heavy the drop shadow under the sticker is.
         light    0–1, the specular highlight that follows your cursor across
                  it. Small numbers: 0.1 is a sheen, 0.4 is a mirror.
         mobile   false drops it below 46rem, where there isn't room.

       ON THE ARRANGEMENT. The headline holds the top-left, so the four objects
       take the three corners it leaves and the space above it: AirPods along
       the top edge past the middle, can tucked into the top-right under the
       nav, controller bottom-left, F1 car bottom-right. Nothing is near the
       text, which is the point — the collision guard in Peel.place() should
       have nothing to do at a desktop width, and if it starts correcting one of
       these it means the headline has moved and these need to move with it.

       All four clear the headline on their own at these coordinates. The
       safe-zone push in Peel.place() is a backstop for narrow windows, not
       something the desktop arrangement should lean on — if you move one and it
       lands somewhere you didn't ask for, it collided with the text and got
       shoved.

       ON THE PHONE IT IS THE OTHER WAY UP. Below 48rem the intro is anchored to
       the bottom of the hero instead of the top, so the free space is the upper
       two fifths rather than the lower one, and these four sit in it: can in the
       top-right, AirPods left of it and slightly lower, controller and F1 car on
       the line beneath. The lowest edge of the lowest one lands around 47% of
       the hero, which leaves the collision guard nothing to do here either.

       These used to carry a `tall` variant for the case where the headline sat
       high enough to leave a deep strip underneath. There is no such case now —
       the text is always at the bottom on a phone — so there is one mobile
       arrangement and `roomy` in Peel.place() never picks a second.          */
    /* EMPTY, AND THE MACHINERY STAYS. Peel.init() returns before it builds
       anything when this list is empty, so the layer, its SVG filters, the
       resize handler and the collision guard are all simply never created —
       there is no dead code path running for four objects that are not there.

       Everything needed to bring them back is still here: the module, the
       artwork in assets/img/stickers/, `peelStyle` below, and the coordinates
       in the note above. Re-adding one is a single entry:

         { id: 'airpods', label: 'AirPods Pro', src: 'assets/img/stickers/airpods.png',
           x: 63, y: 15, w: 100, rot: -10, dir: 20, hover: 30, active: 42,
           mobile: { x: 32, y: 20, w: 76 } }

       The four that were here: airpods 63/15, ps5 9/76, coke 88/22, lego 84/80. */
    peel: [],

    /* ---------------------------------------------------------------- bricks
       Building blocks, scattered the way everything else on this canvas is
       scattered. There is deliberately no cluster and no starting arrangement:
       they are eight loose objects lying about, and two of them found near
       each other is the entire discovery.

         kind    one of the eight silhouettes defined in site.js
         x, y    percent of the hero, the same coordinate system the peel
                 objects use, so a build survives a resize without being re-laid
         tone    index into the palette; omit and it follows the list order

       EIGHTEEN OF THEM, SCATTERED THROUGH A TRACED REGION. The coordinates are
       not hand-picked. The region was lifted off a marked-up screenshot as a
       mask, eroded by half a brick so nothing overhangs its edge, cleared of
       the toolbar's column and the shortcut bar along the bottom, and then
       filled by dropping the largest pieces in first and rejecting any position
       within 20px of one already placed. The scatter therefore follows the
       SHAPE of the region rather than a bounding box, and no two pieces touch
       at rest — every connection on this canvas is one somebody made.

       This is a STARTING ARRANGEMENT and nothing more. There is still no zone,
       no tray and no boundary — the moment one is picked up it goes anywhere on
       the canvas and connects anywhere, and nothing ever puts it back.

       They were eight, huddled in the bottom-right corner around the F1 car and
       the controller. Those are gone, and with them the reason for the huddle —
       the space they were avoiding is now the space to fill.

       ON A PHONE, NINE OF THE EIGHTEEN. The text sits at the bottom there and
       the free space is the upper two fifths of a 390px screen, which eighteen
       pieces would fill wall to wall. The other nine carry `mobile: false` and
       are never built, the same way a peel object opts out. Same canvas, same
       rules, fewer parts. */
    bricks: [
      { kind: 'tee',     x: 75.4, y: 15.9, tone: 0, mobile: { x: 12.3, y: 41.7 } },
      { kind: 'ell',     x: 83.8, y: 24.5, tone: 1, mobile: false },
      { kind: 'conn',    x: 74.4, y: 33.2, tone: 2, mobile: { x: 55.9, y: 43.7 } },
      { kind: 'sq2',     x: 77.8, y: 35.9, tone: 3, mobile: false },
      { kind: 'conn',    x: 60.8, y: 48.0, tone: 4, mobile: { x: 23.6, y: 19.0 } },
      { kind: 'sq2',     x: 66.2, y: 50.4, tone: 5, mobile: false },
      { kind: 'br24',    x: 74.6, y: 50.7, tone: 6, mobile: { x: 34.9, y: 40.9 } },
      { kind: 'long',    x: 42.5, y: 55.6, tone: 7, mobile: { x:  4.6, y: 33.4 } },
      { kind: 'sq2',     x: 36.5, y: 56.7, tone: 0, mobile: false },
      { kind: 'corner',  x: 71.1, y: 59.1, tone: 1, mobile: { x: 34.4, y: 16.6 } },
      { kind: 'small',   x: 52.9, y: 59.3, tone: 2, mobile: false },
      { kind: 'corner',  x: 80.5, y: 59.3, tone: 3, mobile: { x: 75.9, y: 33.8 } },
      { kind: 'tee',     x: 41.7, y: 66.9, tone: 4, mobile: false },
      { kind: 'br24',    x: 49.5, y: 69.6, tone: 5, mobile: { x: 20.8, y: 27.4 } },
      { kind: 'ell',     x: 78.1, y: 70.0, tone: 6, mobile: false },
      { kind: 'small',   x: 22.8, y: 73.0, tone: 7, mobile: false },
      { kind: 'br24',    x: 53.4, y: 77.8, tone: 0, mobile: { x: 65.9, y: 40.2 } },
      { kind: 'long',    x: 67.2, y: 81.3, tone: 1, mobile: false },
    ],

    /* Defaults for anything a sticker doesn't set for itself. */
    peelStyle: {
      /* How far the clip regions reach past the sticker's own box. The drop
         shadow lives in that margin — at 0 it gets sliced off at the edge. It
         has to clear the widest blur in the shadow chain, because `clip-path`
         runs after `filter`: too small and the soft outer pass comes back with
         a straight edge cut through it. */
      pad: 28,
      hoverPct: 30,
      activePct: 40,
      /* One number drives the whole shadow: it sets the opacity of both the
         tight contact pass and the wide ambient one, and the offset and blur of
         the ambient. Lower is lighter AND tighter, which is the right coupling
         — a faint shadow spread as wide as a heavy one reads as haze. Below
         about 0.3 the contact edge goes and the stickers stop sitting on the
         page; 0.55 was heavier than the artwork needed. */
      shadow: 0.42,
      light: 0.1,
    },

    /* the hints that rotate in the corner, to invite play without instructions */
    /* These describe the one interaction there is: click to select, then move,
       resize or rotate. They used to open with 'Drag anything.', which stopped
       being true the moment an unselected object became un-draggable — a hint
       that tells you to do something the page no longer does is worse than no
       hint. */
    hints: [
      'Click an object to select it.',
      'Selected? Drag it, or use the handles to resize and rotate.',
      'Pick up the marker and draw something.',
      'Leave me a note.',
      '⌘D duplicates. Delete removes.',
    ],

    /* The shortcut legend along the bottom of the hero. Each entry is a label
       and the keys it maps to, drawn as keycaps.

       Write 'Mod' for the platform's command key — it renders ⌘ on a Mac and
       Ctrl everywhere else, so the legend is never lying to half the visitors.
       Other spellings that get a proper glyph: 'Shift', 'Alt', 'Enter', 'Esc',
       'Space', 'Del', 'Backspace', and the arrow names ('Up', 'Down', …).

       Add or remove rows freely. Ones deliberately left out to keep the row
       quiet, all of which do work:
         { label: 'Note',      keys: ['N'] }
         { label: 'Duplicate', keys: ['Mod', 'D'] }
         { label: 'Redo',      keys: ['Mod', 'Shift', 'Z'] }
         { label: 'Pan',       keys: ['Space'] }

       'Pencil' is listed second so the row reads in the same order as the
       toolbar: select, pencil, sticker, then the two edit actions. B also arms
       the pencil, but showing one key per row keeps the legend scannable.     */
    keys: [
      { label: 'Move', keys: ['V'] },
      { label: 'Pencil', keys: ['P'] },
      { label: 'Stickers', keys: ['+'] },
      { label: 'Delete', keys: ['Del'] },
      { label: 'Undo', keys: ['Mod', 'Z'] },
    ],

    /* marker colours, in palette order */
    inks: ['#14100c', '#e5484d', '#f76b15', '#f5d90a', '#30a46c', '#0091ff', '#8a3dfd'],
    /* sticky note colours, cycled as you place them (lavender first, as shown) */
    noteColours: ['#c9b8f5', '#f7c8dd', '#bfe3f7', '#c9ecc9', '#f7dfc0'],
    /* Pixel-art stickers in the "+" drawer. Each is a real SVG in
       assets/img/pixel/ built from a small character grid — drop in your own
       and add the filename here.

       The drawer shows six at a time and scrolls for the rest — change
       --pad-rows on .drawerpad in site.css to show more or fewer. Order matters
       here: the first six are the ones visible without scrolling. */
    stickers: [
      'crab', 'cowboy', 'heartpx', 'f1car', 'chequered', 'cat',
      'ghost', 'floppy', 'rocket', 'diskman',
    ],
    stickerPath: 'assets/img/pixel/',
    /* true keeps the note tool armed so you can place several in a row;
       false drops back to Move after each one, as the spec prefers */
    continuousNotes: false,
  },

  /* ------------------------------------------------------------------- story
     Each string is one block. They reveal word-by-word as you scroll.
     Blank-ish blocks are fine — use them for breathing room.             */
  story: [
    ['I build for the internet’s most online <i class="it">corners.</i>'],

    ['The places where software, speculation, and',
     'culture <mark class="blurred">blur</mark> into one another'],

    ['I like interfaces with <mark class="band">consequence</mark><i class="dots">..</i>',
     'Where every action carries weight, whether that is',
     'capital, coordination, or attention.'],

    ['My work is about making <i class="scribble"></i><b>complexity</b> feel',
     '<i class="tag">desirable</i> without dumbing it down.'],

    ['Usually for crypto natives. Always for ' +
       '<button class="people-trigger" type="button" aria-expanded="false">' +
         '<mark class="rule">people</mark>' +
       '</button>.'],

    ['Before this, I spent the last few years',
     'building <span class="stack" role="button" tabindex="0" aria-label="Product logos">' +
       '<span class="stack__card" data-name="Eido Labs" style="--card:#3b5bdb">E</span>' +
       '<span class="stack__card" data-name="Pills Trade" style="--card:#d33f4e">P</span>' +
       '<span class="stack__card" data-name="Tike. Social" style="--card:#6d4bd8">T</span>' +
     '</span> <b>products</b> spanning trading, AI,',
     'and social crypto, mostly steering product,',
     'design, and direction.'],

    /* Organisation logos. Swap the src paths in assets/img/logos/ for the real
       marks — the badge supplies the circle and brand colour, the SVG only
       needs to be the glyph. */
    ['Before that, I worked with teams like <span class="badges t-avatar-group">' +
       '<i class="chip-badge t-avatar" data-tip="Safe" style="--chip:#12ff80">' +
         '<img src="assets/img/logos/safe.svg" alt="Safe"></i>' +
       '<i class="chip-badge t-avatar" data-tip="OpenBlock Labs" style="--chip:#111111">' +
         '<img src="assets/img/logos/openblock.svg" alt="OpenBlock Labs"></i>' +
       '<i class="chip-badge t-avatar" data-tip="Cruize Finance" style="--chip:#1c2b6b">' +
         '<img src="assets/img/logos/cruize.svg" alt="Cruize Finance"></i>' +
     '</span>',
     'designing products and systems for the',
     'onchain world.'],
  ],

  /* ---------------------------------------------------------- work showcase
     A two-column grid of cards. `preview` picks the live panel:
       search  an inner sheet that pushes forward on hover
       words   the name drifting across a tinted field
       fan     overlapping posters that spread apart
       ring    a progress dial over a dark panel
       bloom   a slow radial bloom
       list    rows that tick in one after another
     Each is pure CSS/SVG — no image or video files needed. Add `line`, `stat`,
     `rows` or `colours` to feed the individual previews.

     THUMBNAILS. Any card can be covered with real artwork instead, without
     touching this file. Drop an image into assets/img/thumbs/ named after the
     project title — lowercased, non-alphanumerics hyphenated:

       Eido Labs                 -> assets/img/thumbs/eido-labs.webp
       Today, around the world   -> assets/img/thumbs/today-around-the-world.jpg

     webp, avif, jpg, jpeg, png, gif and svg are all tried, in that order.
     Remove the file and the CSS preview below takes over again, so `preview`
     is worth keeping set even on a card that currently has artwork — it is
     the fallback. See the README in that folder for sizes and gotchas.

     `thumbFit: 'sheet'` shows the artwork as a poster on a field tinted from
     its own edges, pushing forward on hover. The default, `cover`, fills the
     panel and crops. Sheet suits title cards and anything with text in it;
     cover suits photography and full-bleed screens.

     Rename a `title` here and the expected filename changes with it.

     To point a card at a file outside that folder, give it `thumb:` with an
     explicit path; the convention is then skipped for that card.            */
  showcase: {
    items: [
      /* --------------------------------------------------- X0 digital identity
         The only moving thumbnail on the grid: assets/media/x0/companion-thumb.mp4,
         a short silent loop of the app itself, with companion-thumb.webp as its
         poster. Both are explicit `thumb`/`thumbPoster` paths rather than the
         assets/img/thumbs/ filename convention, because the slug this title
         produces is unusable as a filename.

         `preview` below stays set and is still the fallback: if either file
         goes missing the card drops back to the `search` panel, same as any
         card with still artwork.                                             */
      { title: 'Designing the Digital Identity of Cypherock X0',
        meta: 'Product identity, 2026, Bengaluru', href: '#x0-identity',
        thumb: 'assets/media/x0/companion-thumb.mp4',
        thumbPoster: 'assets/media/x0/companion-thumb.webp',
        preview: 'search', line: 'A new product, unmistakably Cypherock',
        /* THE ARGUMENT THIS STUDY MAKES. Not "here are my screens" — the claim
           is that X0 was a new product category inside an existing ecosystem,
           and that every design decision follows from that. The sections are
           the steps of that argument, in order:

             strategy    what X0 is next to X1
             language    the identity that difference required
             evolution   what the earlier concepts taught
             principles  the four ideas the screens exist to prove
             scale       the system that makes it repeatable
             surfaces    the identity carried everywhere the product appears

           Kept deliberately short. An earlier pass ran eleven sections and read
           as a Figma export with captions; the work is the same, the reading
           is a third of the length.

           HOUSE STYLE. Same architecture as Onefinnet Talent, so the two read
           as one portfolio rather than two templates:

             a dark opening band   Overview and Product Strategy tile into one
                                   continuous field
             facts before work     the chips row is the first thing in Overview
             one argument per section, stated in `heading`, with `body` as the
                                   reasoning and `blocks` as the evidence
             the same block vocabulary — head, bullets, contrast, cards,
                                   callout, chip, video, shot
             a Before / After contrast to close, as Onefinnet's Metrics does
             Learnings last, as plain paragraphs with no blocks

           NO METRICS BLOCK. There are no public numbers, so Outcome closes on
           the contrast and a list of what shipped. If figures ever land, the
           `metrics` block in the Onefinnet entry is the shape to copy — four
           cards, each with a `trend` array that draws its own sparkline.

           WHAT IS STILL A PLACEHOLDER. Seven `ph` blocks, each a labelled empty
           frame carrying the path it expects. They render as marked boxes
           rather than broken images, so the study is presentable while the
           artwork is still being cut. Replace a `ph` with a `shot`:

             { type: 'shot', src: 'assets/img/x0/x1-vs-x0.webp',
               w: 1800, h: 1200, alt: '...', max: '900px' }

           The Principles section is the one to split first — four principles
           sharing one frame today, but the point lands harder as four `shot`
           blocks, one screen under each idea.                                */
        study: {
          eyebrow: 'Cypherock · Product Design',
          title: 'X0',
          /* The dock opens with the study, as it does on a project page and as
             Onefinnet does. `reading: true` collapses it to its tab instead. */
          reading: false,
          back: { label: 'BACK', href: 'work.html' },
          sections: [
            /* The opening stretch runs on a dark band — the framing, then the
               strategy — so it reads as premise rather than argument, the same
               way the Onefinnet study opens. Both carry tone: 'dark' and tile
               into one continuous field. */
            { id: 'x0-overview', nav: 'Overview', eyebrow: 'Overview', tone: 'dark',
              heading: 'New enough to justify its own identity',
              body: [
                'Cypherock X1 had already established itself as a premium hardware wallet for advanced users. As the company prepared to launch X0 — a more accessible, mobile-first product — the challenge went <b>beyond designing new screens</b>.',
                'How do you create a product that feels <b>new enough to justify its own identity</b>, while remaining unmistakably Cypherock? Everything below is the answer to that question.',
              ],
              blocks: [
                /* The chips: the facts before the work. Keep the values short —
                   each has to sit on one line at the column width, which is what
                   makes the row scan. A long value wraps inside its pill and the
                   tidy row falls apart. */
                { type: 'facts', items: [
                  { label: 'Team', values: ['Hardware', 'Consumer crypto'] },
                  { label: 'Role', values: ['Product Designer'] },
                  /* Live work. The em dash is what marks it as ongoing — it is
                     the same signal the index table uses for the current role,
                     so the two agree without a separate "in progress" badge. */
                  { label: 'Timeline', values: ['2026 — ongoing'] },
                  { label: 'Scope', values: ['Product identity', 'Mobile app', 'Design system'] },
                  { label: 'Surfaces', values: ['iOS', 'Android', 'Marketing'] },
                ] },

                { type: 'callout',
                  text: 'We weren’t building another app. We were introducing <b>an entirely new product category</b> within the Cypherock ecosystem — and everything else follows from that.' },

                /* The one piece of real media in the study today. Same treatment
                   as the Onefinnet job-creation clip: an H.264 file rather than a
                   GIF, started when it scrolls into view and paused when it
                   leaves. 1440px wide, no audio, ~830KB.

                   When the full screen set exists, a `ticker` block here would
                   match Onefinnet's opening exactly — see that entry for the
                   shape it takes. */
                { type: 'video', src: 'assets/media/x0/app-walkthrough.mp4',
                  w: 1440, h: 918,
                  poster: 'assets/media/x0/app-walkthrough.webp',
                  alt: 'The X0 app in use — portfolio, asset detail and the '
                     + 'card-tap confirmation',
                  max: '960px',
                  pill: true,
                  caption: 'X0 — a second product in the Cypherock ecosystem' },
              ] },

            /* --- 01. Product strategy ------------------------------------------
               One page. What X0 is next to X1, and why that is a design brief
               rather than a marketing one. */
            { id: 'x0-strategy', nav: 'Product Strategy', eyebrow: 'Product Strategy',
              tone: 'dark',
              heading: 'Understanding the product strategy',
              body: [
                'X0 was never a replacement. It was a <b>second position in the same ecosystem</b> — and the two products had to be legible as different things to different people, without either looking like a compromised version of the other.',
              ],
              blocks: [
                { type: 'head', title: 'The business problem' },

                { type: 'contrast',
                  not: 'We wanted to redesign the app…',
                  items: [
                    { icon: 'building', text: 'One product served one end of the market.' },
                    { icon: 'case', text: 'The experience assumed a desktop and a power user.' },
                    { icon: 'chart', text: 'Growth depended on reaching first-time owners.' },
                    { icon: 'person', text: 'Price and complexity screened out the people',
                      sub: 'self-custody was supposed to protect.' },
                    { icon: 'target', text: 'The ecosystem needed a new category, not a cheaper model.' },
                  ] },

                { type: 'chip',
                  text: 'X1 — premium · desktop · power users · existing brand   //   X0 — affordable · mobile · everyday users · new audience' },

                /* the 2x2 grid. `lift` is the one card a shade lighter. */
                { type: 'cards', heading: 'What the split had to resolve',
                  items: [
                    { label: 'Audience',
                      body: 'X1 speaks to someone who already knows what a passphrase is. X0 speaks to someone whose first question is <b>whether they are about to lose their money</b>.' },
                    { label: 'Platform', lift: true,
                      body: 'A desktop-first product asks people to come to it. <b>The phone is where money already lives</b>, and where a first-time owner starts.' },
                    { label: 'Price',
                      body: 'At the premium tier the wallet can cost more than the holdings it protects, which <b>screens out exactly the people it should reach</b>.' },
                    { label: 'Identity',
                      body: 'A second product needed <b>its own voice without fracturing the brand</b> — approachable, never cheapened.' },
                  ] },
              ] },

            /* --- 02. Visual language --------------------------------------------
               The identity chapter. This is the pivot the whole study turns on:
               the design system is introduced as a LANGUAGE, not a component
               library. The library comes later, under Scale. */
            { id: 'x0-language', nav: 'Visual Language', eyebrow: 'Identity',
              heading: 'Defining a new visual language',
              body: [
                'To differentiate X0 while maintaining brand consistency, I developed a <b>new design language</b> that established its own personality while inheriting the trust and familiarity of the Cypherock ecosystem.',
                'The test was simple and unforgiving: the two products had to survive being <b>seen side by side</b> — on a shelf, in an app store, in the same hands — and still read as siblings rather than as an original and a knock-off.',
              ],
              blocks: [
                { type: 'head', title: 'Inherited, and its own' },

                { type: 'bullets',
                  items: [
                    '<b>Inherited</b> — the marks of trust: the restraint, the density of information, the seriousness a product holding someone’s savings has to carry.',
                    '<b>Its own</b> — a warmer, lighter register: softer geometry, more air, and a tone that explains rather than assumes.',
                  ] },

                { type: 'callout',
                  text: 'Segmentation is not a discount. X0 had to be <b>visibly simpler without being visibly cheaper</b> — the security is identical, and the design could not imply otherwise.' },

                /* A draggable seam rather than two pictures side by side. The
                   section's argument is that these are one family in two
                   registers, and that only reads if the eye can hold both in
                   the same place — a comparison split across two frames is one
                   the reader has to do from memory.

                   BOTH FILES MUST BE THE SAME DIMENSIONS. The seam is a clip,
                   not a resize, so the pixel under it on one side has to be the
                   same pixel on the other — mismatched crops slide against each
                   other as the seam moves and the comparison stops meaning
                   anything. These two are 1768x1128 as supplied, encoded to
                   1600px WebP: 93KB and 67KB.

                   `ratio` is those files' own 1.567, so nothing is cropped —
                   .cmp__img is object-fit: cover, and a container at a
                   different ratio would quietly trim the edge screens.

                   `max` widens the panel past the 630px default. These are
                   grids of many screens rather than single shots; at the
                   default they read as texture. */
                { type: 'compare',
                  a: { label: 'X1',
                       src: 'assets/img/x0/x1.webp',
                       alt: 'Cypherock X1 — the CySync app: dark, gold, dense, '
                          + 'built for people who already know what they are doing' },
                  b: { label: 'X0',
                       src: 'assets/img/x0/x0.webp',
                       alt: 'Cypherock X0 — lighter, quieter, more air, and a '
                          + 'guided path through every flow' },
                  ratio: '1.567', start: 50, max: '900px',
                  pill: true,
                  caption: 'Drag to compare — two personalities in one family' },
              ] },

            /* --- 03. Evolution ---------------------------------------------------
               "Evolution", never "redesign". The earlier concepts were right
               about priorities and wrong about system — that distinction is the
               whole section, and it is also what makes it generous rather than
               dismissive about work that came before. */
            { id: 'x0-evolution', nav: 'Evolution', eyebrow: 'The Existing Experience',
              heading: 'Evolving the mobile experience',
              body: [
                'Earlier mobile explorations already existed, and they were worth reading properly rather than replacing. They had <b>validated which features mattered</b> — the priorities in them were right, and that saved a great deal of guessing.',
              ],
              blocks: [
                { type: 'ph', label: 'Earlier explorations',
                  src: 'assets/img/x0/x1-concepts.webp',
                  ratio: '1.5',
                  caption: 'The concepts that came before — read for priorities, not for pixels' },

                { type: 'bullets', sub: 'What the audit surfaced',
                  items: [
                    '<b>Navigation</b> — the model changed depending on where you entered it, so nothing became familiar through repetition.',
                    '<b>Visual hierarchy</b> — the most consequential action on a screen rarely looked like the most consequential thing on it.',
                    '<b>Layout consistency</b> — spacing and component styles drifted between screens, which read as unfinished rather than as variety.',
                  ] },

                { type: 'callout',
                  text: 'The earlier concepts helped validate feature priorities but lacked <b>consistency, scalability and a clear visual identity</b> aligned with the upcoming X0 product.' },
              ] },

            /* --- 04. Principles ---------------------------------------------------
               This section replaces what used to be a feature showcase. The
               difference matters: a feature list says "I drew these"; a
               principle with a screen under it says "this screen exists to
               prove this idea". Every screen here is evidence for a claim.

               TO FINISH THIS SECTION: split the single `ph` below into four
               `shot` blocks, one under each principle — portfolio, onboarding,
               card interaction, wallet creation, in that order. */
            { id: 'x0-principles', nav: 'Principles', eyebrow: 'Designing X0',
              heading: 'Four principles, and the screens that prove them',
              body: [
                'Every screen in X0 resolves the same tension: the safest action and the easiest action are rarely the same one. The principles exist to <b>settle that argument the same way every time</b> — and each one is carried by a specific part of the product.',
              ],
              blocks: [
                { type: 'head', title: 'Design principles' },

                { type: 'cards', heading: 'Each idea, and where it is proved',
                  items: [
                    { label: 'Familiar — the portfolio',
                      body: 'The first screen looks like <b>something you already know how to read</b>. Nothing about holding your own keys should announce itself here.' },
                    { label: 'Guided — onboarding', lift: true,
                      body: 'From an unopened box to a working wallet <b>without a step that has to be explained twice</b>. An unexplained wait reads as a failure.' },
                    { label: 'Secure — card interaction',
                      body: 'The tap is <b>understood before it is asked for</b>. People need to know the phone cannot do this alone — that is the reason they bought the card.' },
                    { label: 'Effortless — wallet creation',
                      body: 'Creating and restoring a wallet, <b>including recovery</b>, designed as a flow rather than documented as a warning.' },
                  ] },

                { type: 'chip',
                  text: 'Familiar → Guided → Secure → Effortless' },

                { type: 'ph', label: 'The four principles on screen',
                  src: 'assets/img/x0/principles.webp',
                  ratio: '1.45',
                  pill: true,
                  caption: 'Portfolio, onboarding, card interaction and wallet creation' },
              ] },

            /* --- 05. Scale --------------------------------------------------------
               The system chapter, kept separate from the language chapter on
               purpose: 02 is what X0 sounds like, this is what makes it
               repeatable. Tokens and components belong here, not there. */
            { id: 'x0-scale', nav: 'Building for Scale', eyebrow: 'The System',
              heading: 'Building for scale',
              body: [
                'A visual language is an argument until something enforces it. The system is what turned the X0 identity into <b>decisions engineering could build from</b> and future products could inherit.',
              ],
              blocks: [
                { type: 'chip',
                  text: 'Design tokens → components → templates → finished screens' },

                { type: 'bullets',
                  items: [
                    '<b>Consistency</b> — one scale for type, colour, spacing and elevation, so no screen negotiates its own rhythm.',
                    '<b>Tokens</b> — decisions held in one place, themed from one source, so changing one reaches everywhere it appears.',
                    '<b>Components</b> — the controls, states and patterns the product repeats, with the anatomy documented rather than inferred.',
                    '<b>Developer efficiency</b> — variables, auto layout and specifications, so the build matches the design without a translation step.',
                    '<b>Future products</b> — built against two surfaces from the start rather than one, so the next surface inherits the system instead of negotiating with it.',
                  ] },

                { type: 'callout',
                  text: 'A design system earns its keep the <b>second</b> time it is used — so it was built before the screens, not extracted from them.' },

                { type: 'ph', label: 'Tokens, components and templates',
                  src: 'assets/img/x0/system.webp',
                  ratio: '1.45',
                  caption: 'One decision, traced from token to finished screen' },
              ] },

            /* --- 06. Across surfaces ------------------------------------------------
               The identity leaving the app. This is what makes the claim in the
               overview true rather than asserted: if X0 is a product category,
               it has to hold together everywhere it appears.

               `eyebrow` says Across Surfaces rather than Launch while the work
               is live — the section describes design that exists, not a release
               that has happened. Switch it to 'Launch' when it ships. */
            { id: 'x0-launch', nav: 'Bringing X0 to Life', eyebrow: 'Across Surfaces',
              heading: 'Bringing X0 to life',
              body: [
                'An identity that only exists inside the app is a screen style. X0 has to hold on <b>both platforms and every surface around them</b> — the icon on a homescreen, the first frame after a tap, the page someone reads before they buy.',
              ],
              blocks: [
                { type: 'bullets',
                  items: [
                    '<b>Android and iOS</b> — native icons, splash, status bars and safe areas, so neither platform feels like a port of the other.',
                    '<b>The product surfaces</b> — the flows the principles are proved on, designed for both builds.',
                    '<b>Marketing and website</b> — the same language carried outside the app, where most people meet the product first.',
                  ] },

                { type: 'ph', label: 'Android and iOS',
                  src: 'assets/img/x0/platforms.webp',
                  ratio: '1.6',
                  caption: 'The same product, native on each platform' },

                { type: 'ph', label: 'Marketing and website',
                  src: 'assets/img/x0/marketing.webp',
                  ratio: '1.6',
                  pill: true,
                  caption: 'The identity outside the app' },
              ] },

            /* --- Where it stands ----------------------------------------------------
               THIS PROJECT IS LIVE. The section is written in the present tense
               on purpose — claiming shipped outcomes on work still in flight is
               the one thing a reader can check and catch. The Before/After
               contrast reads as the direction the work is taking rather than as
               a result already banked.

               WHEN IT SHIPS: change `nav` and `eyebrow` back to 'Outcome',
               rewrite the heading as a result, and add the `metrics` block from
               the Onefinnet entry — four cards, each with a `trend` array that
               draws its own sparkline. */
            { id: 'x0-outcome', nav: 'Where it stands', eyebrow: 'Current State',
              heading: 'Where the work stands today',
              body: [
                'X0 is in active design as of 2026. The identity, the system and the core experience are established; the sections above describe decisions already made and being built against, not a finished launch.',
              ],
              blocks: [
                { type: 'contrast',
                  notLabel: 'Before', insteadLabel: 'After',
                  notItems: [
                    { text: 'One product, one audience' },
                    { text: 'Identity inherited, not designed' },
                    { text: 'Inconsistent components and spacing' },
                    { text: 'Handoff inferred from screenshots' },
                    { text: 'Every new feature designed from scratch' },
                  ],
                  items: [
                    { text: 'A second product category in the ecosystem' },
                    { text: 'A distinct X0 identity inside the Cypherock family' },
                    { text: 'One token-driven component library' },
                    { text: 'Variables and specifications engineering can build from' },
                    { text: 'New features assembled from the system' },
                  ] },

                { type: 'bullets', sub: 'What is established so far',
                  items: [
                    'A <b>visual foundation and identity</b> for Cypherock X0, distinct from X1 and legible as part of the same family.',
                    'A <b>scalable design system</b> already carrying surfaces that did not exist when it was built.',
                    'A <b>mobile-first experience</b> aligned with X0’s product vision, in design across both platforms.',
                    'Fewer design inconsistencies, through <b>reusable components</b> rather than screen-by-screen decisions.',
                    '<b>Faster collaboration</b> with engineering, on variables and specifications rather than screenshots.',
                  ] },
              ] },

            /* Written from the middle of the project rather than after it, so
               these are what the work has taught so far — not a retrospective.
               Worth revisiting when it ships; the last one in particular will
               have an answer by then. */
            { id: 'x0-learnings', nav: 'Learnings', eyebrow: 'Reflection',
              heading: 'What the work has taught so far',
              body: [
                'Segmentation is a design problem before it is a marketing one. Making X0 feel approachable without making it feel like the cheap option comes down to type, spacing and tone — not to a badge or a price.',
                'Evolution beats redesign. The earlier concepts were right about what mattered and wrong about how it held together, and saying so plainly is more useful than starting from nothing.',
                'Build the system first. Extracting a system from finished screens produces a catalogue of what you already did; building it first produces something the next product can use.',
                'Principles are only real if a screen proves them. Four ideas with four surfaces behind them say more about the work than the full set of screens does.',
                'Handoff is part of the design. Variables, auto layout and specifications are not admin at the end of a project; they are the difference between a design that ships as drawn and one that ships as interpreted — which is the part still ahead of me.',
              ] },
          ],
        } },
      /* ------------------------------------------------------------ Onefinnet
         Replaces the old Warp Signals entry. The narrative is condensed from
         Ishaan's own case-study writing in Figma (file "App v2" -> page
         "Handoff" -> frame "Ishaan Gupta").

         The card now carries a real thumbnail — the study's own title card, at
         assets/img/thumbs/onefinnet-talent.webp. It shows a closed device and
         the project facts, no product UI, so the NDA on the screens in that
         Figma file is not in play. `preview` below stays set regardless: it is
         what the card falls back to if the file is ever removed.

         `meta` and the fact chips are taken from that title card, so the two
         now agree. Earlier values (2025, "Remote", "Product Designer") were
         placeholders written before the card existed.                        */
      { title: 'Onefinnet Talent', meta: 'B2B SaaS, 2024–25, Noida (on-site)',
        href: '#onefinnet-talent',
        /* `sheet` rather than the default `cover`: the artwork is a title card,
           not a photograph, so cropping it to the panel cost the outer columns
           and left it looking like a screenshot of something else. On a field
           it reads as the poster it is, and it picks up the Eido card's push
           on hover — the two are neighbours in the grid. */
        thumbFit: 'sheet',
        preview: 'words', line: 'Shortlisted',
        study: {
          eyebrow: 'Onefinnet \u00b7 Product Design',
          title: 'Talent',
          /* The dock opens with the study, as it does on a project page. Set
             `reading: true` to have it collapse to its tab instead — the
             machinery for that is still in Rack.applyScope. */
          reading: false,
          back: { label: 'BACK', href: 'work.html' },
          sections: [
            /* The opening stretch runs on a dark band — overview first, then the
               highlights — so it reads as summary rather than argument. Both
               sections carry tone: 'dark' and tile into one continuous band. */
            { id: 'overview', nav: 'Overview', eyebrow: 'Overview', tone: 'dark',
              heading: 'Helping teams hire faster and smarter with AI',
              body: [
                'The Onefinnet Talent platform automates candidate sourcing, shortlisting and screening \u2014 so your team can focus on building great teams, not filtering resumes.',
                'What follows walks through the reasoning behind the design decisions, from the first scoping conversations to the metrics we shipped against.',
              ],
              blocks: [
                /* The chips, above the screens: the facts before the work. Kept
                   short on purpose — each value has to sit on one line at the
                   column width, which is what makes the row scan. A long value
                   wraps inside its pill and the tidy row falls apart. */
                { type: 'facts', items: [
                  { label: 'Team', values: ['B2B SaaS', 'Enterprise'] },
                  { label: 'Role', values: ['Team Lead', 'UI/UX Designer'] },
                  { label: 'Timeline', values: ['Jan 2024 \u2013 Jun 2025'] },
                  { label: 'Surfaces', values: ['Recruiter app', 'AI reports', 'Admin panel'] },
                  { label: 'Research', values: ['8 recruiters', '5 founders', '10 candidates'] },
                ] },
                { type: 'ticker',
                  /* Real product screens from "Framer export/Hero section",
                     shipped at their native 1488x1140 as WebP q90 with alpha —
                     2.2MB for all 26. Native rather than a fixed multiple of the
                     display size, so zooming in has real pixels to show.

                     ALPHA MATTERS HERE. Each export is a device frame with rounded
                     corners and transparent surrounds. Earlier passes converted to
                     RGB, which composites transparency onto black and bakes a dark
                     rectangle behind every frame — that was the "slight black
                     background", and no CSS could remove it because it was in the
                     file. `exact=True` on save also keeps the RGB values under
                     transparent pixels, which stops fringing at the frame edge.

                     History: cut to 392x300, then 585x448, then 877x672, each time
                     under what the growing cards needed. Native ends that.

                     A caveat worth keeping: no ticker size makes the UI text
                     inside these readable. At a 240px card the source is scaled to
                     21%, so 12px interface text lands near 2.5px. Size helps the
                     screens read as screens; opening one is what makes it legible.

                     The strip is deliberately NOT full-bleed. That was tried and
                     reverted: at 128vw it reached under the sticky rail and covered
                     the section links. The clipped left and right edges are the
                     effect. Card height is the only knob for how many fit. */
                  path: 'assets/img/onefinnet/screens/',
                  card: 313, speed: 100,
                  caption: 'Screens from across the platform \u2014 recruiter app, candidate reports and the admin panel.',
                  rows: [
                    [
        '2fa.webp', '5-step.webp', '6-step.webp', 'ai-screening-criteria.webp',
        'candidate-empty-states.webp', 'candidate-form-maker.webp', 'candidate-view.webp',
        'candidates-listings.webp', 'career-portal.webp', 'create-mail.webp',
        'create-interviews.webp', 'global-search.webp',
        'job-creation.webp'
                    ],
                    [
        'job-dialogue.webp', 'kanban-board.webp', 'legal-pages-for-policies.webp', 'mails.webp',
        'meetings.webp', 'onboarding-steps.webp', 'organisation-setup.webp',
        'public-job-view-form-2.webp', 'public-job-view-form.webp', 'publish-job.webp',
        'resume-strengths-views.webp', 'settings.webp', 'sign-up.webp'
                    ],
                  ] },
              ] },

            { id: 'problem', nav: 'The Problem', eyebrow: 'The Problem', tone: 'dark',
              heading: 'Hiring inefficiency',
              body: [
                'Startups often struggle to <b>find and hire the right talent</b> at the right time. Recruiters deal with too many applications, manual screening, and lack of coordination between hiring teams. <b>This leads to delayed hiring, mismatched candidates, and lost productivity</b> \u2014 all while startups are racing to scale fast.',
                'Over 70% of startups lose top candidates because of slow or disorganised hiring workflows. So the scope narrowed to one idea: data-backed recruitment, where every decision has something underneath it.',
              ],
              blocks: [
                /* The business framing, opening the section: why the project
                   existed at all, before the user-facing problem. Kept as written
                   \u2014 the line breaks in the third statement are deliberate. */
                { type: 'head', title: 'The business problem' },

                { type: 'contrast',
                  not: 'We wanted to redesign\u2026',
                  /* one row per statement, each with its own mark — the fourth keeps
                     its second line as a quieter continuation, as in the reference */
                  items: [
                    { icon: 'building', text: 'The company had one major problem.' },
                    { icon: 'case', text: 'The product was entirely enterprise-driven.' },
                    { icon: 'chart', text: 'Growth depended on sales teams.' },
                    { icon: 'person', text: 'Every customer required lengthy demos,',
                      sub: 'manual onboarding, and high acquisition costs.' },
                    { icon: 'target', text: 'The business needed a scalable acquisition channel.' },
                  ] },

                /* the 2x2 grid from the deck. `lift` is the one card a shade
                   lighter, as in the reference. */
                { type: 'cards', heading: 'Defining the gap',
                  items: [
                    { label: 'Communication gap',
                      body: 'Hiring teams and recruiters often work in silos, leading to <b>misalignment on job roles, feedback loops, and priorities</b>.' },
                    { label: 'Efficiency gap', lift: true,
                      body: 'Recruiters spend hours manually <b>sourcing, shortlisting, and scheduling</b>, slowing down the entire hiring process.' },
                    { label: 'Insight gap',
                      body: 'Most decisions are <b>gut-based, not data-driven</b>, resulting in poor fits and repeated hiring efforts.' },
                    { label: 'Experience gap',
                      body: 'Candidates face <b>delays &amp; lack of updates</b>, leaving a negative impression of the company\u2019s brand.' },
                  ] },
              ] },

            /* Rebuilt to the old portfolio's hierarchy: an opener, then a
               major heading, then a quieter sub-head with bullets, then the next
               major heading. Previously "Solve for unstructured hiring
               decisions" was demoted into a bullet lead-in, which flattened the
               whole stretch into one level. */
            { id: 'research', nav: 'Research', eyebrow: 'Research and Validation',
              preamble: {
                title: 'Going back to how it started\u2026',
                body: 'Let\u2019s walk through and validate the reasoning behind some of these design decisions together.',
              },
              heading: 'Solve for unstructured hiring decisions',
              body: [
                'Every day without the right hire <b>slows progress</b>. Manual hiring <b>drains time, effort and focus</b> from what matters most \u2014 building the product.',
              ],
              blocks: [
                { type: 'bullets', sub: 'Scoping down to data-backed recruitment',
                  lead: 'Recruiters and founders spend:',
                  items: [
                    'Over <b>40% of their week</b> on repetitive hiring tasks.',
                    'No feedback loops or real-time updates.',
                    'Over <b>70% of startups</b> lose top candidates because of <b>slow or disorganised hiring workflows</b>.',
                  ] },

                { type: 'head', title: 'Understanding the hiring ecosystem',
                  body: [
                    'We talked to <b>8 recruiters, 5 founders</b> and <b>10 candidates</b> across early-stage startups to uncover what really happens behind every hiring challenge.',
                  ] },

                { type: 'shot', src: 'assets/img/onefinnet/hiring-ecosystem.webp',
                w: 1800, h: 1883,
                  alt: 'Interview question board grouped by Recruiters, Founders / Hiring Managers and Candidates',
                  max: '900px',
                  /* Near square, so the width cap alone left it 941px tall — the
                     tallest thing in the study. Capping the height shrinks it without
                     giving up any of the file's resolution: at 620px wide it still
                     carries 2.95x, and the lightbox is where it gets read. */
                  maxh: '640px',
                  caption: 'Some of the questions about hiring that led us to build Onefinnet Talent.',
                  annos: [
                    { kind: 'measure', text: '23 interviews', at: 'top:-11px;left:20px' },
                    { kind: 'note', text: 'grouped by who we\u2019d be designing for', at: 'right:-22px;top:26%' },
                    { kind: 'comment', text: 'the questions we kept coming back to', at: 'left:16px;bottom:-16px' },
                  ] },

                { type: 'bullets', sub: 'Key takeaways from interviews',
                  lead: 'Hiring isn\u2019t as easy as it looks.',
                  items: [
                    'Modern recruitment is <b>dependent on collaboration</b> between founders, recruiters and AI tools \u2014 all working in sync.',
                    'Misalignment at any stage leads to lost candidates and wasted time.',
                    'Tools that bridge <b>clarity, collaboration and speed</b> redefine hiring success.',
                  ] },

                { type: 'shot', src: 'assets/img/onefinnet/key-takeaway.webp',
                w: 1268, h: 674,
                  alt: 'Affinity map clustering the collected interview insights',
                  max: '634px',
                  caption: 'Affinity map of the collected insights.',
                  annos: [
                    { kind: 'note', text: 'three clusters, one conclusion', at: 'right:-22px;top:-14px' },
                  ] },

                { type: 'bullets', sub: 'The emotional toll on recruiters',
                  items: [
                    'Recruiters often feel <b>pressured from both sides</b> \u2014 founders want speed, candidates want clarity.',
                    'They constantly juggle expectations, data and deadlines.',
                    'What they really want? <b>Control, visibility and confidence</b> in their decisions.',
                  ] },

                { type: 'head', title: 'Who are we designing for?' },

                { type: 'shot', src: 'assets/img/onefinnet/personas.webp',
                w: 1534, h: 544,
                  alt: 'Three personas: Founders, Recruiters and Candidates, each with a quote and their needs',
                  max: '767px',
                  annos: [
                    { kind: 'measure', text: '3 personas', at: 'top:-11px;left:20px' },
                    { kind: 'note', text: 'all three want the same thing, differently', at: 'right:-22px;bottom:-14px' },
                  ] },
              ] },

            { id: 'benchmark', nav: 'Benchmarking', eyebrow: 'Competitive Audit',
              heading: 'Benchmarking the Best (and the Rest)',
              body: [
                'I studied platforms like <b>Ashby, Workable, BambooHR</b> and <b>Lever</b> to understand how they handle hiring workflows, data migration and recruiter experience. The goal was to uncover usability gaps, workflow inefficiencies, and opportunities for Onefinnet Talent to introduce a more streamlined, AI-driven alternative.',
              ],
              blocks: [
                { type: 'callout',
                  text: '<b>While some</b> legacy platforms struggle to provide consistently, this becomes a <b>key differentiating factor</b>, especially for startups and fast-scaling teams that depend on speed, clarity, and automation.' },

                /* The supplied export is 1260px wide, so it is capped there \u2014
                   stretching it past its own pixels is what makes a table blurry.
                   The lightbox is how you read it properly. */
                { type: 'taped', src: 'assets/img/onefinnet/benchmarking.webp',
                w: 1800, h: 901,
                  alt: 'Benchmarking table comparing Ashby, Lever, Workable and BambooHR across five axes',
                  max: '900px',
                  caption: 'Ashby, Lever, Workable and BambooHR, scored on the same five axes \u2014 top capabilities, ease of use, AI features, customised reporting and pricing affordability \u2014 so the gaps were comparable rather than anecdotal. Click to enlarge.',
                  annos: [
                    { kind: 'measure', text: '4 tools \u00b7 5 axes', at: 'top:-11px;left:20px' },
                    { kind: 'note', text: 'the inconsistency was the opening', at: 'right:-22px;bottom:-14px' },
                  ] },

              ] },

            /* --- The Product ------------------------------------------------
               Content lifted from the old portfolio. Every artifact is a `ph`
               placeholder: swap `type: 'ph'` for `type: 'shot'` and give it the
               real `src` once the export lands. */
            { id: 'solution', nav: 'The Product', eyebrow: 'Introducing Onefinnet Talent',
              heading: 'A single platform to automate hiring end to end',
              body: [
                'An AI hiring assistant that works as hard as you do. Automated shortlisting, engagement tracking and real-time insights keep every team member in sync and in control.',
              ],
              blocks: [
                /* Moved here from The Problem. It introduces the product, so it
                   belongs directly under the sentence that introduces the
                   product rather than at the end of the problem. */
                /* THE SHINY HIGHLIGHTS. Each slide is real markup rather than a
                   flattened image, so the copy is selectable and the screenshots
                   stay crisp. The first slide centres its copy, as the reference
                   does; the rest run copy-left / shot-right. */
                { type: 'carousel', eyebrow: 'THE SHINY HIGHLIGHTS',
                  path: 'assets/img/onefinnet/highlights/',
                  /* all four exports are this size; declared so the panel reserves
                     its height before the images arrive */
                  w: 892, h: 683,
                  slides: [
                    { title: 'Manage candidates like it\u2019s a game', img: 'kanban.jpg', layout: 'stack',
                      body: 'Use the <b>Kanban board to drag and drop</b> candidates across stages. Each candidate is AI-scored, and <b>moving them triggers smart actions</b> like sending rejection emails or scheduling interviews.' },
                    { title: 'Sync up your calendar', img: 'calendar.jpg',
                      body: 'Never let <b>unplanned interviews disrupt your schedule again</b> \u2014 your hiring pipeline keeps everything organised.' },
                    { title: 'All need-to-know information in one place', img: 'dashboard.jpg',
                      body: 'Spend less time searching for what you need \u2014 <b>your dashboard shows everything clearly</b> so you can take action without feeling stuck or delayed.' },
                    { title: 'No need to manage emails elsewhere', img: 'mail.jpg',
                      body: '<b>Integrate Google/Outlook</b> and let AI automate follow-ups, updates, and all candidate conversations.' },
                  ] },

                { type: 'head', title: 'Recruiter\u2019s Application' },

                { type: 'bullets', sub: 'High level goal',
                  items: [
                    'Our goal is to give recruiters the same clarity AI brings to every other business function \u2014 <b>so hiring feels strategic, not stressful</b>.',
                    '<b>Reduce time-to-hire with smart automation.</b>',
                  ] },

                /* The supplied "Highlevelgoal" export, 3200x1712. Encoded to
                   1260px — 2x the 630px it is shown at — with its alpha kept, so
                   the transparent corners are not flattened onto a colour. */
                { type: 'shot', src: 'assets/img/onefinnet/goal-card.webp',
                w: 1800, h: 963,
                  alt: 'The high level goal: give recruiters the clarity AI brings to every other business function',
                  max: '900px',
                  annos: [
                    { kind: 'note', text: 'AI that supports your instinct \u2014 not replaces it.', at: 'right:-22px;top:-16px' },
                  ] },
              ] },

            /* --- Job creation ------------------------------------------------- */
            { id: 'jobs', nav: 'Job Creation', eyebrow: 'Adding Jobs',
              heading: 'Adding Jobs to start hiring',
              body: [
                'Setting up jobs is one of the <b>most crucial steps</b>, as job descriptions serve as the <b>core representation</b> of what a role truly entails. It\u2019s essential to have complete clarity on all requirements from the start \u2014 because, in many cases, <b>the actual responsibilities extend far beyond what\u2019s stated in the JD</b>.',
              ],
              blocks: [
                /* The supplied screen recording. A <video>, not a GIF: the same clip
                   as a GIF would be tens of megabytes and banded to 256 colours,
                   where H.264 is 2.0MB at full 1080p. It starts when it scrolls
                   into view and pauses when it leaves — see `videos()`. */
                { type: 'video', src: 'assets/media/job-basic-details.mp4',
                w: 1920, h: 1080,
                  poster: 'assets/media/job-basic-details.webp',
                  alt: 'Entering the basic details of a new job \u2014 title, type, '
                     + 'experience, location and the AI-assisted description',
                  max: '960px',
                  pill: true,
                  caption: 'Adding jobs to start hiring.. coz thats what everyone wants' },

                { type: 'head', title: 'Stages of Job creation flow',
                  body: [
                    'This flow isn\u2019t just about user experience \u2014 it\u2019s about <b>business conversion and trust</b>.',
                    'HRs already using other tools don\u2019t want to <i class="it">learn something new</i> \u2014 they want to <i class="it">do the same work faster and smarter</i>.',
                  ] },

                { type: 'bullets',
                  items: [
                    'Fit into existing habits \u2014 upload old JDs, save drafts, keep the settings customisable.',
                    'This flow was then optimised to reduce friction, automate repetitive tasks and deliver context-driven recommendations \u2014 ultimately shortening the turnaround time for job creation.',
                  ] },

                /* The supplied "Selected iteration" export, 1534x3266. Encoded to
                   1260px — 2x the 630px it shows at — with its alpha kept. A tall
                   diagram, so it renders 630x1342; the lightbox is where the
                   annotations are actually read. */
                { type: 'shot', src: 'assets/img/onefinnet/job-flow-selected.webp',
                w: 1534, h: 3266,
                  alt: 'The selected job-creation flow, annotated across its four '
                     + 'stages: basic details, description, screening and publish',
                  max: '767px',
                  /* 1:2.1, so a 760px cap like the others would squeeze it to 357px
                     wide. Taller cap here, and the lightbox for the detail. */
                  maxh: '1100px',
                  pill: true,
                  caption: 'Job creation flow \u2014 final design',
                  annos: [
                    { kind: 'measure', text: '4 stages', at: 'top:-11px;left:20px' },
                  ] },
              ] },

            /* --- AI reports --------------------------------------------------- */
            { id: 'reports', nav: 'AI Reports', eyebrow: 'Enhancing AI Candidate Reports',
              heading: 'Enhancing AI Candidate Reports',
              body: [
                'Candidate results play the most crucial role in the hiring cycle \u2014 the <b>clearer and more detailed the insights</b>, the <b>faster and smarter decisions</b> recruiters can make to move candidates to the next stage.',
              ],
              blocks: [
                { type: 'bullets', sub: 'Understanding the need',
                  items: [
                    '<b>Clarity that drives action</b> \u2014 each report section was restructured to highlight the most relevant data first, reducing information overload and enabling recruiters to make faster, data-backed decisions.',
                    '<b>Built for cognitive ease</b> \u2014 every visual and content block was designed to minimise cognitive load, so insights are absorbed effortlessly and recruiters can focus on evaluating talent rather than decoding reports.',
                  ] },

                /* The supplied "Rejected" export, 2048x1897 — encoded to 1260px,
                   2x the 630px it shows at, alpha kept. */
                { type: 'shot', src: 'assets/img/onefinnet/reports-rejected.webp',
                w: 1800, h: 1667,
                  alt: 'The rejected report layout \u2014 a long textual page where the '
                     + 'decision-driving insights sat below the fold',
                  max: '900px',
                  maxh: '760px',
                  pill: true,
                  caption: 'Rejected due to multiple user-related issues identified during scheduled interviews' },

                { type: 'callout',
                  text: 'Categorizing and prioritizing information based on its <b>relevance to HR and recruiters</b> was missing. A significant amount of space was occupied by details that weren\u2019t valuable to them, while the crucial, decision-driving insights were less prominent. So we had to go back to the drawing board.' },

                { type: 'bullets', sub: 'Putting things back together!' },

                /* The content inventory, the aside about how the direction was
                   reached, then the iteration it produced — in that order, because
                   the chip narrates the step between the two artifacts. */
                { type: 'shot', src: 'assets/img/onefinnet/reports-content-inventory.webp',
                w: 1800, h: 1757,
                  alt: 'The content inventory \u2014 every element of the report sorted '
                     + 'by how much it mattered to a recruiter',
                  max: '900px', maxh: '760px' },

                { type: 'chip',
                  text: '\u2733 After a lot of back-and-forth with PMs and stakeholders, '
                      + 'and several whiteboarding sessions to bring clarity, we reached '
                      + 'a solid direction.' },

                { type: 'shot', src: 'assets/img/onefinnet/reports-updated-iteration.webp',
                w: 1600, h: 2048,
                  alt: 'The updated and selected iteration \u2014 scores at a glance on '
                     + 'the left, actionable items to move a candidate through the '
                     + 'pipeline, and the option to regenerate the report',
                  max: '800px', maxh: '760px' },
              ] },

            /* The older portfolio's Admin section, in this portfolio's hierarchy.
               Its order was: "Admin Control app", "High Level Goals", the goal
               card, then "Laying the foundation of the Admin Panel". Here the
               eyebrow and section heading come first, as every other section does,
               and the two sub-topics follow as blocks — same content, one
               consistent hierarchy rather than two competing headings. */
            { id: 'admin', nav: 'Admin Panel', eyebrow: 'Admin Control App',
              heading: 'Laying the foundation of the admin panel',
              body: [],
              blocks: [
                { type: 'callout',
                  text: 'Every complex product needs a <b>defined control structure</b> '
                      + 'that shares information on a <b>need-to-know basis</b>. This led '
                      + 'to the creation of the <b>Onefinnet Admin Panel</b> \u2014 a single '
                      + 'space to <b>manage people, roles, and access</b> across the '
                      + 'organisation effortlessly.' },

                { type: 'head', title: 'High level goals' },

                { type: 'shot', src: 'assets/img/onefinnet/admin-goal.webp',
                w: 1800, h: 881,
                  alt: 'The admin goal card \u2014 giving complete control back to the '
                     + 'organisation\u2019s core, the admins, through Role-Based Access Control',
                  max: '900px',
                  annos: [
                    { kind: 'note', text: 'Every B2B app needs a defined control structure',
                      at: 'right:-18px;top:-14px' },
                  ] },

                { type: 'bullets', sub: 'Quick highlights of Admin',
                  lead: 'With the <b>Onefinnet Admin Control Panel</b>, admins can:',
                  items: [
                    'Invite <b>recruiters, hiring managers and teammates</b> into the organisation.',
                    'Give each person the right access and visibility through <b>Role-Based Access Control</b>.',
                    'Manage <b>people, roles and access</b> from a single space.',
                    'Scale to <b>hundreds of recruiters and thousands of candidates</b> without losing speed.',
                  ] },

                /* The portal itself, under NDA like the benchmarking table. Two
                   strips: a third through the middle was tried and dropped — on an
                   image this dense it crossed the content rather than the edges and
                   read as damage instead of tape. */
                { type: 'taped', src: 'assets/img/onefinnet/admin-portal.webp',
                w: 1800, h: 2012,
                  alt: 'The admin portal \u2014 user manager with per-person roles and '
                     + 'access, subscription plans, and the AI credit ledger',
                  max: '900px', maxh: '760px',
                  pill: true,
                  caption: 'User manager, subscriptions and AI credits \u2014 one place to '
                         + 'manage people, roles and access' },
              ] },

            /* The same four outcomes the paragraphs described, as cards. `trend` is
               a plain list of numbers and the sparkline is drawn from it — so the
               line always agrees with the figure above it, and the first card draws
               DOWNWARD because less recruiter effort is the win. Edit the numbers
               and the drawing follows. */
            { id: 'metrics', nav: 'Outcome', eyebrow: 'Metrics',
              heading: 'Metrics to measure success',
              body: [],
              blocks: [
                /* The shape of the change before the size of it. Same card as the
                   Not / Instead block in the problem section, in its even mode:
                   two lists that answer each other row for row. No heading of its
                   own — the section heading already covers it, and the two labels
                   inside the card say what it is. */
                { type: 'contrast',
                  notLabel: 'Before', insteadLabel: 'After',
                  notItems: [
                    { text: 'Fragmented workflows' },
                    { text: 'Manual and repetitive tasks' },
                    { text: 'Low visibility and insights' },
                    { text: 'Slow hiring process' },
                    { text: 'Low user satisfaction' },
                  ],
                  items: [
                    { text: 'Unified workflows' },
                    { text: 'AI-powered automation' },
                    { text: 'Real-time insights' },
                    { text: 'Faster hiring' },
                    { text: 'High user satisfaction' },
                  ] },

                { type: 'metrics',
                  note: 'Impact observed over 6 months after the new experience was released.',
                  items: [
                    { value: '40%', label: 'Less recruiter effort', icon: 'down',
                      c: '#2f9e6e', wash: '#e8f5ee',
                      body: 'Automation and AI assistance reduced manual tasks significantly.',
                      trend: [62, 60, 55, 52, 46, 44, 39, 36, 33, 28, 24, 21] },

                    { value: '15%', label: 'Higher trial-to-paid conversion', icon: 'up',
                      c: '#6d4dd8', wash: '#eeeafc',
                      body: 'A smoother experience helped more teams convert and stay longer.',
                      trend: [22, 25, 24, 31, 34, 38, 42, 47, 52, 58, 66, 74] },

                    { value: '18%', label: 'Increase in task completion', icon: 'up',
                      c: '#3b82f6', wash: '#e8f0fe',
                      body: 'Users completed key actions faster, with fewer drops in between.',
                      trend: [30, 33, 37, 36, 44, 48, 52, 55, 61, 64, 70, 78] },

                    { value: '+7', label: 'NPS score improvement', icon: 'star',
                      c: '#d99a1a', wash: '#fdf3dd',
                      body: 'A consistent increase in satisfaction and overall user sentiment.',
                      trend: [34, 36, 35, 41, 44, 43, 50, 54, 58, 57, 64, 69] },
                  ] },
              ] },

            { id: 'learnings', nav: 'Learnings', eyebrow: 'Reflection',
              heading: 'Finally, my top learnings',
              body: [
                'Designing for admins versus recruiters. Admins care about control, structure and security; recruiters want speed and simplicity. Making both efficient at once was the hardest part.',
                'Designing the data. Deep candidate and hiring analytics had to feel effortless and contextual, not heavy \u2014 the reference points were analytics tools that make complex data look lightweight.',
                'The importance of trust. Hiring data is sensitive, so every number, insight and automation had to be trustworthy through transparency, feedback loops and a clean audit trail.',
                'Using AI responsibly. The challenge was not to automate blindly but to assist intelligently, keeping humans in control while AI handled the heavy lifting.',
                'Designing for scale and change. Teams, roles and data all grow, so the admin panel had to be a system that absorbs that rather than an interface that breaks under it.',
              ] },
          ],
        } },
      { title: 'Today, around the world', meta: 'Design, 2024, Everywhere', href: '#',
        preview: 'fan' },
      { title: 'Magic Extractor', meta: 'Design, 2025, Bengaluru', href: '#',
        preview: 'ring', line: 'Extracting', stat: '672/897 files parsed' },
    ],
  },

  /* ------------------------------------------------------------ project page
     The case study at project.html. The left rail is built from `sections` —
     each one's `nav` label becomes a link and `id` becomes its scroll anchor.

     Block types you can put in a section's `blocks` array:
       { type:'tiles',  count:44 }                 masonry field of tinted tiles
       { type:'facts',  items:[{label,value}] }    the Role / Timeline / Team row
       { type:'panel',  preview:'search', caption:'…' }   one wide panel
       { type:'row',    panels:[{preview,line}], caption:'…' }  three across
       { type:'quote',  text:'…' }                 large pull quote
       { type:'code',   lines:['…'] }              numbered code block
     `preview` reuses the same live panels as the work cards.               */
  project: {
    eyebrow: 'Exa · Product Design',
    title: 'Websets',
    back: { label: 'BACK', href: 'work.html' },

    sections: [
      { id: 'overview', nav: 'Overview', eyebrow: 'Overview',
        heading: 'A no-code surface for semantic search',
        body: [
          'Websets lets anyone write a query, set criteria, add enrichments and export a list without touching code. This is a self-directed exploration of what happens when that list needs to run on its own.',
        ],
        blocks: [
          { type: 'tiles', count: 44 },
          { type: 'facts', items: [
            { label: 'Role', values: ['Product Designer'] },
            { label: 'Timeline', values: ['September – October 2025'] },
            { label: 'Team', values: ['Solo Exploration'] },
            { label: 'Software', values: ['Figma', 'Warp', 'Rive', 'Exa'] },
          ] },
        ] },

      { id: 'problem', nav: 'The Problem', eyebrow: 'The Problem',
        heading: 'Core Issue: Extensibility for enterprise teams',
        body: [
          'The no-code dashboard covers the core loop well. The issue starts when you want Websets to run on its own or talk to other tools — reacting to a monitored event, keeping a list fresh on a schedule, or piping results into Clay, Slack, or a CRM.',
          'These aren’t niche edge cases. The people who’d get the most out of Websets — account executives, recruiters, outbound leads, GTM operators — generally aren’t engineers. The automation layer, the part that turns Websets into a sales pipeline, is locked behind a skill its target users don’t have.',
        ],
        blocks: [
          { type: 'row', caption: 'Each surface stops at the same wall: full functionality needs API scripting.',
            panels: [
              { preview: 'list', rows: ['Create a Webhook', 'Choose which events', 'Send a POST request', 'Verify the signature'] },
              { preview: 'ring', line: 'Create a Webset', stat: 'Search, import, enrich' },
              { preview: 'list', rows: ['Create a Monitor', 'Find new content', 'Update existing content', 'Automated scheduling'] },
            ] },
        ] },

      { id: 'research', nav: 'Research', eyebrow: 'Research and Validation',
        heading: 'Interview with GTM staff @ Cursor',
        body: [
          'To validate, I ran an interview with a member of GTM staff at Cursor to understand how they currently build sales pipelines, where the friction is, and how they’d react to Websets’ core value proposition.',
          'What I learned is that building enterprise sales pipelines, even at startups like Cursor, still relies on a stack of separate tools: LinkedIn Sales Navigator, Phantom Buster, Clay, Apollo. Each handles prospecting, scraping, enrichment, sequencing. Stitching them together needs technical fluency.',
          'When I described Exa’s semantic search, the value of combining it with enrichment and automation was obvious. So was the barrier: full functionality currently requires API scripting, which leaves out most GTM and AE users.',
        ],
        blocks: [
          { type: 'quote', text: '“Find any F500 outside of NYC or SF, and ask them to explain their CRM. They probably tell you they don’t know how to do automations.”' },
          { type: 'panel', preview: 'words', line: 'Signal', caption: 'Mapping the existing stack, tool by tool, to find where the handoffs break.' },
        ] },

      { id: 'explorations', nav: 'Explorations', eyebrow: 'Explorations',
        heading: 'Ideation, whiteboarding, and early flows',
        body: [
          'How might we extend Websets to cover more of the sales pipeline for enterprise clients, giving non-technical users a complete no-code path from filter → enrich → trigger → output?',
        ],
        blocks: [
          { type: 'row', caption: 'Three directions, each trading configurability against how much you have to understand up front.',
            panels: [
              { preview: 'fan' },
              { preview: 'bloom', line: 'Flows' },
              { preview: 'search', line: 'Trigger → enrich → output' },
            ] },
        ] },

      { id: 'prototyping', nav: 'Prototyping', eyebrow: 'Prototyping',
        heading: 'From whiteboard to a working surface',
        body: [
          'Specify where the webset should output the enriched data, and the columns that should be enriched.',
        ],
        blocks: [
          { type: 'panel', preview: 'list',
            rows: ['Data source: Google Calendar', 'Criteria: Sales Call', 'After January 14 2026', 'Enrichments for Google Calendar'],
            caption: 'The trigger builder, kept to one column so the whole rule reads top to bottom.' },
          { type: 'panel', preview: 'ring', line: 'Webset output', stat: 'Column mapping · 14 fields',
            caption: 'Example output, from Gcal webhook to Slack channel. An AE who used to spend 15 minutes researching the company before a call now gets this automatically the moment the event is created. No API setup. No scripting.' },
          { type: 'code', lines: [
            '{',
            '  "event_title": "Prospective Meeting: Cursor",',
            '  "start_time": "2026-10-13T14:00:00-04:00",',
            '  "end_time": "2026-10-13T14:30:00-04:00",',
            '  "description": "Inbound demo from GTM @ Cursor",',
            '  "organizer_email": "you@company.com",',
            '  "organizer_name": "you@company.com",',
            '  "attendee_name": "John Smith",',
            '  "company_summary": "AI code editor, Series C",',
            '}',
          ] },
        ] },

      { id: 'outcomes', nav: 'Outcomes', eyebrow: 'Outcomes',
        heading: 'What the extension unlocks',
        body: [
          'A complete no-code path from filter to output means the automation layer stops being an engineering task. The list becomes a pipeline, and the people who need it can build it themselves.',
          'Next: validating the trigger builder with the same GTM cohort, and testing whether the column mapping holds up against a CRM schema nobody controls.',
        ],
        blocks: [
          { type: 'panel', preview: 'bloom', line: 'Shipped', caption: 'The end state: one surface, no scripting.' },
        ] },
    ],
  },

  /* ------------------------------------------------------ closing story block */
  /* Five lines, and the count matters: each one is laid out separately, so a
     sixth changes the block's height and a merged pair reflows it.

     This used to end "while looking for the next thing", which read as
     available — the intro chip and the Teams table both say Cypherock is
     current, and a visitor hits all three. The invitation is kept, the
     availability claim is not. */
  closing: [
    ['I’m currently at <mark class="rule" data-peek="cypherock">Cypherock</mark>, otherwise',
     '<mark class="rule" data-peek="vibecoding">vibecoding</mark> and playing <mark class="rule" data-peek="poker">poker</mark>.',
     'Always up for building exciting things',
     'with people I enjoy working with.',
     'Reach out via <a href="mailto:product@cypherock.com"><mark class="rule" data-peek="email">email</mark></a> or dm on <a href="https://x.com/"><mark class="rule" data-peek="x">X</mark></a>.'],
  ],

  /* ------------------------------------------------------------------- peek
     WHAT IS BEHIND THE UNDERLINED WORDS in the closing block. Each key here
     matches a `data-peek` above; a word without an entry is just a word, and an
     entry without a word is never built.

     THE FIELDS
       tone    'light' (paper) or 'dark'. Dark is for the places that are dark
               themselves — X is a black site and a white card in front of it
               reads as this page's, not as theirs.
       media   optional image at the top of the card. Anything in assets/;
               leave it out and the card is type only, which is the right answer
               more often than it sounds. 16:10 is the box it is cropped to.
       title   one line, and it should be the thing you would say out loud.
       body    one or two sentences. Past three the card stops being a glance.
       hint    the small grey line at the bottom. A date, a status, an
               instruction — whatever the word owes the reader.
       action  'copy' puts the title's value on the clipboard on click and
               swaps the hint for a tick. Only `email` uses it.
       value   what `action: 'copy'` copies. Defaults to person.copyEmail.

     ON THE TWO WITHOUT PICTURES. Poker and vibecoding have no artwork in this
     repo, and a stock photograph of chips would be worse than the sentence. Add
     a `media` line to either when there is a real image to put there. */
  peek: {
    cypherock: {
      tone: 'light',
      media: 'assets/img/x0/x0.webp',
      title: 'Cypherock',
      body: 'Product designer. The X0 card from concept to beta, the wallet app around it, and the design system under both.',
      hint: 'Dec 2025 — now · Gurugram',
    },
    vibecoding: {
      tone: 'light',
      media: 'assets/media/x0/app-walkthrough.webp',
      title: 'Vibecoding',
      body: 'Designing by building it. This site is hand-written HTML, CSS and JavaScript — no framework, no build step, every measurement taken off a real screen.',
      hint: 'Claude Code · Figma MCP · a lot of Chromium',
    },
    poker: {
      tone: 'light',
      title: 'Poker',
      body: 'Reading people under incomplete information, then paying to find out if you were right. It is the closest thing to product judgement I have found outside work.',
      hint: 'Mostly losing, learning fast',
    },
    email: {
      tone: 'light',
      title: 'Let’s talk.',
      body: '',
      hint: 'Click to copy',
      action: 'copy',
    },
    x: {
      tone: 'dark',
      title: '@ishaaanbtw',
      body: 'Half design, half whatever I am building that week.',
      hint: 'Open profile',
    },
  },

  /* -------------------------------------------------------------- index table */
  index: {
    tabs: [
      {
        id: 'teams',
        label: 'Teams',
        /* Employment only, newest first, matching LinkedIn exactly.

           The founding and contract work — Eido Labs, Safe, Tike. Social,
           OpenBlock Labs, Cruize Finance — was deliberately removed from this
           table. It still appears on the site: the intro line names Safe,
           OpenBlock Labs and Cruize Finance with their logos, and the work
           page carries Eido Labs, Tike. Social, OpenBlock Labs and Cruize
           Finance as projects. So this list is the employment record, not the
           full picture, and it is not the place to add side projects back.

           Onefinnet is one row carrying the title it ended at. LinkedIn shows
           it as two (UX Design Intern Jan–Jun 2024, then Product Designer to
           Dec 2025); the span in `year` covers both. */
        rows: [
          /* `now: true` marks the row you are still in — it puts a live dot and
             the word Now beside the name. Only one row should ever carry it. */
          { year: 'Since 2025', name: 'Cypherock', meta: 'Senior Product Designer', now: true },
          { year: '24-25', name: 'Onefinnet', meta: 'Product Designer' },
          { year: '2023', name: 'Veritas Technologies', meta: 'CX Designer' },
        ],
      },
      {
        id: 'awards',
        label: 'Awards',
        /* `name` is the competition and `meta` is the result plus who gave it,
           which keeps the middle column scannable — the placements all differ
           and would otherwise collide with the award names.

           `href` is optional and only three of these have one. A row with a
           link renders as an anchor and the rest stay plain, so nothing has to
           be invented for the one certificate that was never issued. The
           links are Google Drive and Badgr URLs off LinkedIn: they are only as
           permanent as those shares, so if a row stops resolving the fix is to
           drop its `href`, not to hunt for a mirror. */
        rows: [
          { year: '2023', name: '24hr Design Hackathon',
            meta: '2nd Runner Up · School of Design, Doon University' },
          { year: '2022', name: 'CII Young Designer Awards',
            meta: 'Winner, Service Design · Confederation of Indian Industry',
            href: 'https://drive.google.com/file/d/1ahByNMiM3IJy4mup0QUE6OQUBHGVCQQt/view?usp=sharing' },
          { year: '2022', name: 'D’Source-DIC BHU SDGs Design Challenge',
            meta: 'Merit Award · IDC School of Design, IIT Bombay',
            href: 'https://drive.google.com/file/d/1r91OBZFxG8fNR8-DEMyLDbrJWl2SyfLF/view?usp=sharing' },
          { year: '2022', name: 'SSDC 2022',
            meta: 'Honorable Mention · Service Design College',
            href: 'https://eu.badgr.com/public/assertions/KDCSPP0jTLCqw3v8BbVXVw?action=download' },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- work page */
  work: {
    intro: 'Selected work. Longer writeups where the thinking is worth the words, a line where it isn’t.',
    projects: [
      {
        title: 'Eido Labs',
        role: 'Co-Founder',
        year: '2025 — now',
        summary:
          'An agentic funding layer for onchain organisations. I own product surface, design system and the narrative.',
        tags: ['Product', 'Design system', '0→1'],
        href: '#',
        accent: '#7c5cff',
      },
      {
        title: 'Safe',
        role: 'Contract Designer',
        year: '2025',
        summary:
          'Rethought transaction review for multisig signers — the moment where a wrong click costs the most.',
        tags: ['Security UX', 'Research'],
        href: '#',
        accent: '#12ff80',
      },
      {
        title: 'Tike. Social',
        role: 'Co-Founder',
        year: '2024',
        summary:
          'A social layer for onchain identity. Shipped from an empty repo to a live network in four months.',
        tags: ['Social', 'Mobile', '0→1'],
        href: '#',
        accent: '#ff7a59',
      },
      {
        title: 'OpenBlock Labs',
        role: 'Founding Product Designer',
        year: '2023',
        summary:
          'Incentive analytics for protocols distributing hundreds of millions in rewards. Dense dashboards that still read like sentences.',
        tags: ['Data viz', 'Dashboards'],
        href: '#',
        accent: '#3b5bdb',
      },
      {
        title: 'Cruize Finance',
        role: 'Founding Product Designer',
        year: '2022 — 23',
        summary:
          'Structured products for people who had never touched an options chain. Complexity hidden, never removed.',
        tags: ['DeFi', 'Onboarding'],
        href: '#',
        accent: '#0ea5e9',
      },
    ],
  },

  /* ----------------------------------------------------- the scattered sketches
     NOT A PAGE ANY MORE. The People page is gone, and what is left here is the
     one thing that never belonged to it: the cards that scatter across the
     screen when you click the word "people" in the closing block on the home
     page. `Shell.field()` reads this. The page's own intro and its lists of
     names went with the page.                                                */
  people: {
    field: [
      { src: 'assets/img/people/sketch-01.svg', ratio: '11/13', w: 9 },
      { src: 'assets/img/people/sketch-02.svg', ratio: '5/6', w: 7 },
      { src: 'assets/img/people/sketch-03.svg', ratio: '1/1', w: 8 },
      { src: 'assets/img/people/sketch-04.svg', ratio: '13/9', w: 11 },
      { src: 'assets/img/people/sketch-05.svg', ratio: '13/9', w: 10 },
      { src: 'assets/img/people/sketch-06.svg', ratio: '30/17', w: 12 },
      { src: 'assets/img/people/sketch-07.svg', ratio: '1/1', w: 7.5 },
      { src: 'assets/img/people/sketch-08.svg', ratio: '32/17', w: 11 },
    ],
  },


  /* ------------------------------------------------------------------- footer */
  /* --------------------------------------------------------------- the footer
     Built to answer the header rather than to close the page off: the same dotted
     field, and the "Pages" column is generated from `nav` above, so the two can
     never disagree about what the site contains.

     The email is the footer's headline the way the name is the hero's. Note this
     is deliberately its own field — `person.email` is what the hero's Copy email
     button puts on the clipboard, and the two need not be the same address. */
  footer: {
    email: 'ishaangupta.888@gmail.com',
    note: 'Hand-built with vanilla HTML, CSS and JavaScript — no framework, no build step.',
    // {year} is replaced automatically
    fine: '© {year} Ishaan Gupta',
    links: [
      { label: 'Twitter', href: 'https://x.com/' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
      { label: 'GitHub', href: 'https://github.com/' },
      { label: 'Email', href: 'mailto:ishaangupta.888@gmail.com' },
    ],
    /* the bit that floats on the sky below the sheet */
    lead: 'Get in touch',
    body:
      'for thoughtful design work, early products, weird experiments, or internet rabbit holes.',
    outroFine: '© {year} · sky shifts with the hour',
  },
};
