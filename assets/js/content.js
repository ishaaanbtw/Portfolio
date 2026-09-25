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
     <mark class="rule">word</mark>  underline that draws itself in on reveal

   The badge, the scribble and the card stack went with the scroll-reveal prose
   section that was the only thing using them.
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
     moved; below 48rem the same deck is what the bar's handle opens. One list,
     both widths.

     IT IS NOT THE SAME ARRAY AS `nav` BELOW, and that is the trap in it: `nav`
     is the pages the header shows, this is everywhere you can go — pages
     included. Adding a page to `nav` therefore does NOT put it in the menu,
     which is exactly how About came to be reachable from the header and the
     footer but from neither menu. EVERY PAGE IN `nav` MUST HAVE A ROW HERE.

     `kind` says where a link points without repeating an address that is
     already settled in `person`:
       resume   the PDF in person.resumeUrl, opened in the page's own viewer
       email    a mailto to person.email
     Anything with a plain `href` is just a link. Add a row and it appears; the
     order here is the order down the deck — the pages first, then the two
     things that are actions rather than places. */
  deck: {
    links: [
      /* WORK IS THE HOME PAGE, so it is one row and not two. There used to be
         a `Home` pointing at index.html and a `Work` pointing at work.html —
         a separate archive page, now removed — and the grid of projects on
         index.html is the work index. The three rows here are the same three
         the sidebar's Site list offers, in the same order. */
      { label: 'Work', href: 'index.html' },
      { label: 'About', href: 'about.html' },
      { label: 'Play', href: 'play.html' },
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

  /* THE THREE SECTIONS, AND THEY ARE THE ONLY THREE. Work is index.html —
     the grid of projects IS the work index — so there is no separate `Home`
     row and no `work.html` any more. */
  nav: [
    { label: 'Work', href: 'index.html' },
    { label: 'About', href: 'about.html' },
    { label: 'Play', href: 'play.html' },
  ],

  /* ------------------------------------------------------------------- the rail
     THE LEFT COLUMN OF THE HOME AND PLAY PAGES, and the whole of their
     navigation. It is a column of the layout, not a floating widget: it
     scrolls with the page it belongs to and stops when that page's content
     stops.

     `at` is which pages mark a row as the one you are on. The home page shows
     the work, so Work is where you are when you are there — the row is still a
     real link and it goes to the full archive. */
  rail: {
    /* The statement. Same string the hero used to set at 46px; `*word*` is the
       italic, exactly as in `canvas.headline`. */
    say: 'I’m Ishaan, a product designer who *engineers*.',
    site: [
      /* Work is the home page, because the home page IS the work — the grid of
         projects is the first thing on it. The fuller archive is one link at
         the end of that grid rather than a second row up here. */
      { label: 'Work', href: 'index.html', at: ['home'] },
      { label: 'About', href: 'about.html', at: ['about'] },
      { label: 'Play', href: 'play.html', at: ['play'] },
    ],
    /* the one link under the grid, to the archive and the teams table */
    /* `more` was one row of caption type under the grid — "All work →" —
       and the only thing it reached was work.html, the separate archive page.
       The grid it sat under is the archive now, so the row said "here" and
       has been removed rather than pointed at the page it is already on. */
    links: [
      { label: 'Github', href: 'https://github.com/' },
      { label: 'Email', kind: 'email' },
      { label: 'Linkedin', href: 'https://www.linkedin.com/in/ishaangupta24' },
      { label: 'Twitter', href: 'https://x.com/' },
    ],
    /* two lines, present tense */
    now: [
      'Currently designing at Cypherock.',
      'Based in Gurugram, studying at UPES.',
    ],
    fine: '© Ishaan Gupta {year}',
  },

  /* ---------------------------------------------------------------- the tray
     THE HANDFUL OF BRICKS IN THE LEFT COLUMN, and the only number here worth
     touching is how many.

     They are not composed. `Bricks.scatter` rolls what and roughly where, the
     dump throws them in from above, and they land wherever tumbling and
     bumping into each other leaves them — a different pile every visit, the
     same way the 404 room fills. An authored arrangement is what the earlier
     isometric version was, and a composition is not what a few bricks tipped
     onto a desk looks like.

     Keep the count low. Nine is a scatter you can pick through; twenty is a
     heap, and a heap in the corner of an editorial page is the thing this
     whole layout exists to avoid. */
  tray: {
    /* MANY, NOT A FEW. The playground is the whole left column now rather than a
       box inside it, so there is four or five times the floor — and nine pieces
       in it read as a few things that got left behind rather than as a handful
       somebody tipped in. Sixteen fills the open half without becoming a heap;
       the region's `pack` decides how they distribute. */
    pieces: 16,
    /* a phone lays the column out as a strip across the page, with about a
       third of the area */
    mobilePieces: 9,
    /* THE TRICKLE. One more piece every so often, thrown onto the pile that is
       already there. `every` is the wait either side of a piece, in ms, and it
       is long on purpose: you should have stopped watching the box before the
       next one arrives. `max` is the whole population — the box stops filling
       rather than becoming a heap over a long visit. */
    drip: { every: [9000, 22000], count: [1, 1], max: 16 },
  },

  /* ------------------------------------------------------------- the play page
     Everything that used to be on the home page's hero and now has somewhere of
     its own: the dotted desk, the dock, the marker, the notes, the stickers,
     and a floor of bricks with no composition to keep. The home page is the
     work; this is the workshop. */
  play: {
    lead: 'A desk with nothing on it.',
    note: 'Draw, stack, leave a note. Nothing here is saved.',
    /* how many bricks are tipped onto the desk */
    pieces: 22,
    mobilePieces: 12,
  },

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
    /* THE NUMBER IS THE PAGE. It was an eyebrow over a sentence — "ERROR 404"
       set at 13px above a 38px headline — which puts the smallest type on the
       page on the only piece of information a visitor actually needs. Turned
       round: the numeral is the whole statement, one quiet line explains it,
       and the three ways out are directly under it. */
    code: '404',
    headline: 'Looks like you’ve wandered off.',
    /* the long explanation is gone. "The link is either old or slightly
       mistyped" is a sentence about the site's internals; nobody who has just
       hit a dead end needs the taxonomy of how. */
    links: [
      { label: 'Work', href: 'index.html', primary: true },
      { label: 'About', href: 'about.html' },
      { label: 'Resume', kind: 'resume' },
    ],
    /* the quiet invitation. One line, no tutorial. */
    aside: 'Since you are here — build something.',
    pieces: 64,
    mobilePieces: 26,
    drip: { every: [5200, 9000], count: [1, 2], max: 120 },
    /* The hidden game. Every string the challenge shows lives here with the
       rest of the page's words; the builds themselves are lattice geometry and
       stay in site.js beside the presets they are drawn with. */
    game: {
      presets: 'Presets',
      cta: 'Start game',
      note: 'Think you can build it in 30 seconds?',
      eyebrow: 'Build this',
      seconds: 30,
    },
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
    /* THE ITALIC IS BACK, ON THE ONE WORD THAT EARNS IT. The parser and
       `.hdl-em` were left standing for exactly this: the sentence claims two
       jobs and the second one is the surprise, so it is the word that leans.
       Note the full stop sits OUTSIDE the asterisks — inside, the punctuation
       slants with the word and the line ends on a wobble. */
    headline: 'I’m Ishaan, a product designer who *engineers*.',
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
    /* THE COMPOSITION ARRIVES IN ORDER, AND IT ARRIVES SOON.

       The old numbers put the tags at 1.05s and the buttons at 1.5s, which is
       most of a second of an empty corner with bricks already falling past it —
       the LEGO was introducing the page and the page was still loading its own
       sentence. Read top to bottom now: line, tags, buttons, all inside two
       thirds of a second, and the fall carries on around them.

       The handle is deliberately absent from this list. It is not revealed at
       all — it is on screen from the first frame, because a visitor who does
       not know there is a menu has no reason to wait for one. */
    reveal: {
      blur: 14,          // starting blur in px
      headline: 900,     // how long the headline takes to resolve
      wordStagger: 9,    // per-word lag, which makes later lines trail
      pillsAt: 330,      // when the tags start
      pills: 720,
      pillStagger: 45,
      ctaAt: 560,
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
        meta: 'Product identity, 2026, Singapore', href: '#x0-identity',
        /* THE DOMINANT ONE. Widest stack, and the tallest proportion in the
           set — it is the newest work and the composition says so. */
        col: 'a', ratio: 1.34,
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
        /* --- THE CHAPTER COVER ------------------------------------------

           WHAT THIS IS FOR. Pressing a card used to leave the site: one click
           and you were in a forty-six screen case study with no idea whether
           you wanted to be. This is the screen in between — enough of the
           project to decide by, on the page you are already on, with the study
           one deliberate press further.

           IT IS NOT A SUMMARY OF THE STUDY. A summary would be the study
           again, shorter, and nobody reads the same argument twice. This is
           the jacket copy: what the thing is, what was mine, and four pictures
           that say whether it is any good. `spread` is composed rather than
           listed — a hero, two supports at different crops and one detail —
           and the three positions are named rather than numbered so the
           composition is legible here and not only in the stylesheet.

           EVERY FACT IS OUT OF THE STUDY OR THE KNOWLEDGE BASE. Nothing in a
           `brief` is written for the brief. */
        brief: {
          tagline: 'A hardware wallet the size of a bank card.',
          summary: 'X0 had to be new enough to justify its own identity and '
            + 'unmistakably Cypherock at the same time. Seven months from the '
            + 'first scoping conversation to a beta — the card, the app around '
            + 'it, and the design system under both.',
          facts: [
            { k: 'Role', v: 'Senior Product Designer — end to end' },
            { k: 'Timeline', v: 'Seven months · Dec 2025 — present' },
            { k: 'Team', v: 'Design of one, with firmware, hardware, blockchain and frontend' },
            { k: 'Platform', v: 'NFC card · iOS · Android · CySync desktop' },
          ],
          does: [
            'Product strategy',
            'Information architecture',
            'UX and UI',
            'N45 design system',
            'Industrial and packaging design',
            'NFC and BLE interaction flows',
          ],
          cta: 'View the complete case study',
          /* THE HERO IS THE CARD AGAINST THE PHONE, because the whole product
             is one object touching another one, and it is the only frame in
             the set that says so without a caption. */
          spread: [
            { at: 'hero', src: 'assets/media/x0/app-walkthrough.webp', w: 1440, h: 918,
              alt: 'The X0 companion app running on a phone, lit from one side.' },
            { at: 'a', src: 'assets/img/x0/system/hero.webp', w: 862, h: 1772,
              alt: 'The X0 Wallet portfolio screen.' },
            { at: 'b', src: 'assets/img/x0/onboarding/09-tap-idle.webp', w: 393, h: 852,
              alt: 'Tap to approve — the card held against the back of the phone.' },
            { at: 'detail', src: 'assets/img/x0/system/n45-mark.png', w: 192, h: 192,
              alt: 'The N45 design system mark.' },
          ],
        },
        study: {
          /* THE ROUTE THIS STUDY LIVES AT, and the reason it is a word rather
             than an index: `/work/cypherock-x0.html` is a URL somebody can
             read aloud, send, and land on cold. The shell file at
             work/<slug>.html carries nothing but this name; everything below
             is what it finds. */
          slug: 'cypherock-x0',
          /* The hero's own facts. They were one comma-separated string on the
             tile — "Product identity, 2026, Singapore" — which is the right
             shape for a caption and the wrong one for a page that sets them in
             a row with labels over them. */
          company: 'Cypherock',
          category: 'Product identity',
          year: '2026',
          place: 'Singapore',
          role: 'Senior Product Designer',
          /* the one sentence the whole study answers, lifted from the overview
             rather than written twice */
          lede: 'How do you create a product that feels new enough to justify '
            + 'its own identity, while remaining unmistakably Cypherock?',
          eyebrow: 'Cypherock · Product Design',
          title: 'X0',
          /* --- THE OPENING SCENE ----------------------------------------

             The hero is a full screen of its own, above the study, and this
             is its art direction. Every key is optional; a study with no
             `hero` block still gets a hero, built from the facts above and
             the tile's own artwork on paper.

             THE POINT OF IT BEING DATA. One structure, many compositions —
             which is the difference between a hero and a header. The layout
             a project gets is a claim about what kind of work it is:

               panel   the artifact sits on a field of its own colour, with
                       air all round it. An OBJECT, presented. Right for
                       hardware and for identity work.
               bleed   the artifact rises out of the bottom edge and is
                       cropped by it. A SURFACE, in use. Right for software.
               plate   the artifact fills the frame edge to edge.

             `field` is the colour behind it and `ink` the colour of anything
             set on that colour; `scale` is how much of the frame's width the
             artifact takes; `at` is where it sits in the frame. `line` is the
             one sentence under the name — it falls back to `lede`, which on
             this study is a question two lines long, so it is stated shorter
             here. `facts` is the metadata row, and it is deliberately three
             items rather than the study's five: the hero orients, the study
             is where the detail lives.                                     */
          /* --- THE OPENING SCENE, AND IT IS THE FILM --------------------

             WHAT THIS REPLACED. Two openings running back to back. First a
             paper title card built by `Project.hero` — the name, three facts
             and a line, with the tile's own artwork held still on paper —
             and then, one screen down, the film's cold open: "Self-custody,
             without the seminar." at 56px over a black frame that was
             waiting for a render nobody had cut yet. A visitor arriving at a
             hardware project therefore met two headlines, two title
             treatments and no hardware.

             It is one opening now and the product is in it. `kind: 'film'`
             is what `Project.film` reads to build `filmHero` instead of the
             paper card, so which opening a project gets is a value in its
             data rather than a branch written about its slug — and the
             Onefinnet study, which has no film, is untouched by any of this.

             `ground` IS MEASURED OFF THE FILM, not chosen. #030303 is what
             the video's own corner pixel reads, so the page's black and the
             picture's black are the same black: on a portrait screen, where
             a 16:9 film is letterboxed rather than cropped, there is no seam
             to see. `poster` is frame one — the card already at rest — so
             the first paint is that same black and never a white rectangle
             waiting for a download.

             EVERYTHING ELSE HERE IS CHROME, AND ALL OF IT IS LOAD-BEARING.
             The mark says whose work this is; the headline says what the
             work was; the record says what was done and over what; the
             annotation names the object on screen; the cue says there is
             more. Nothing was added to fill the frame — the frame is
             supposed to be empty, because the thing in the middle of it is
             the point of the page. */
          hero: {
            kind: 'film',
            /* TWO ENCODINGS OF ONE FILM, BEST FIRST. VP9 is 350KB against
               H.264's 877KB for a picture that measures 0.99998 SSIM against
               it — nine seconds of mostly-black footage is exactly what VP9
               is good at — so every engine that takes WebM gets the small
               file and Safari takes the MP4. The browser picks; nothing here
               sniffs anything. */
            film: 'assets/media/x0/hero-film.webm',
            film2: 'assets/media/x0/hero-film.mp4',
            poster: 'assets/media/x0/hero-film.webp',
            ground: '#030303',
            /* NO MARK IN THE CORNER AT ALL, WHICH IS THE THIRD ANSWER AND THE
               RIGHT ONE. It was two lines of editorial type — "Cypherock" over
               "X0 · Product Design" — which is a caption explaining a page that
               says "Cypherock X0" in its own record four lines lower. It was
               then the app icon, which says the same thing in one object and
               still puts a small bright plate in the corner of a frame whose
               entire composition is one product in the middle of black. The
               corner is empty now. `filmHero` still renders `mark`/`marksub`
               or `marklogo` if a study states either; this one states neither.
               The identity is carried by the record and by the film. */
            /* TWO LINES, BROKEN WHERE THE SENTENCE BREATHES rather than
               wherever the measure runs out. `<br>` and not a width: the
               break is a typographic decision at this size and leaving it to
               the container means it moves every time the window does. The
               narrow rule in the stylesheet takes it back out again. */
            h: 'Designing self-custody<br>for everyone.',
            meta: [
              { k: 'Cypherock X0', v: 'Hardware + Digital Experience' },
              { k: 'Role', v: 'Product Designer' },
              { k: 'Focus', v: 'UX · Design System · Product' },
            ],
            /* NO ANNOTATION AND NO READOUT, AND BOTH WERE REMOVED FOR THE
               SAME REASON. "X0 / 01 — Hardware wallet / Self-custody" named
               the object on screen to a reader who has just read a headline
               about self-custody and a record that says HARDWARE + DIGITAL
               EXPERIENCE; and the reel counter measured a nine-second loop
               nobody is timing. Two pieces of chrome competing with the film
               for the only thing the frame is supposed to hold. The film is
               the hero; the right half of it is now empty on purpose.
               `prog: false` is read by `filmHero` — the film still runs, it
               simply does not draw a ruler under itself. */
            cue: 'Scroll',
            prog: false,
          },
          /* `true` COLLAPSES THE ANNOTATION DOCK TO ITS EDGE TAB, which is
             what a film needs. `Rack.HOMES` mounts the dock on project pages
             deliberately — a case study you can draw on — and on a black
             frame a lavender 48x328 toolbar is a second thing competing for
             the eye, which is the one rule the whole film rests on. Set this
             back to `false` to have the dock out by default. */
          reading: true,
          back: { label: 'BACK', href: 'index.html' },
          /* --- TWELVE CHAPTERS, NOT NINE SECTIONS -------------------------

             WHAT THIS REPLACED. The study was a well-argued essay: nine
             sections, each opening with two or three paragraphs, with the
             artefacts arriving after the argument had already been made in
             prose. Everything in it was true and most of it was good, and it
             read as a document rather than as a project — you finished it
             knowing what Ishaan concluded and not much about how he got there.

             The shape now is a documented seven months. Every chapter answers
             one question, the question is the heading, and the answer is
             carried by a diagram, a comparison or a photograph wherever a
             diagram, a comparison or a photograph can carry it. Where prose
             is genuinely the right tool it is a sentence, not a paragraph.

             THE NUMBERED EYEBROWS ARE LOAD-BEARING. A reader who lands mid-page
             from a link needs to know where they are in a long argument, and
             the rail on the left is a table of contents rather than a position
             indicator. "04 — Decision #2" says both what this is and how far
             in you are.

             THE PHOTOGRAPH SLOTS ARE DELIBERATE AND THEY ARE NOT DECORATION.
             Chapters 05, 06, 07, 09 and 10 are built around process artefacts
             that do not exist in the repository yet — whiteboards, Figma
             exports, review threads, component close-ups, home screens. Each
             one is a `ph` block naming the exact file to save and carrying the
             caption already written, so the page states honestly that it is
             waiting for an image rather than papering over the gap with more
             prose. Dropping a file at the named path is the whole of the work;
             no code changes. See the checklist in the commit that added this. */
          /* --- THE FILM ---------------------------------------------------

             WHAT THIS REPLACED, AND WHY TWICE. The study was first a
             nine-section essay, then a twelve-chapter documentary. Both were
             documents: a measure of text in a column, with the artefacts
             arriving after the argument had already been made in prose. You
             finished either one knowing what was concluded and very little
             about what it was like.

             This is the same project directed instead of written. Twenty-six
             scenes, each one a screen, each one spending a single idea and
             handing the next one over. No scene has a paragraph longer than
             forty-five words in it; several have no prose at all. Where the
             document version explained a decision, this one shows the
             alternative being rejected.

             THE SPINE IS A QUESTION, and it is Ishaan's own: how do you
             launch a new product without cannibalising the flagship it sits
             next to? Scene 06 asks it, alone, on the only white frame in the
             film. Every act after it is an answer.

             HOW TO READ THE DATA. `kind` picks the renderer in site.js;
             `dur` is how tall the scene's block is, in svh, and since the
             stage inside it is one screen tall, `dur - 100` is how long the
             scene holds while you scroll through it. A scene with eight
             reveals wants around 15svh of hold per reveal — one comfortable
             flick each — which is where these numbers come from. Trimming
             the film is one number per scene and nothing else.

             `act` on a scene puts it in the act rail on the right.

             THE SHOTS THAT DO NOT EXIST YET SAY SO. Twenty of the frames in
             this film are photographs and exports that are not in the
             repository — a wall of four printed directions, an IA whiteboard,
             a hand tapping a card, home screens on real devices. Each one is
             a `shot` with a `label` and an `of`, which renders as a black
             frame stating what it is waiting for. Add `src` to the same
             object and the frame becomes the photograph, with no other
             change. X0-IMAGE-CHECKLIST.md is the list.                     */
          mode: 'film',
          scenes: [
            /* --- 00 · THE RECORD ---------------------------------------------

               WHAT THIS ANSWERS, AND WHY THE HERO CANNOT. The film opens on the
               product moving in the dark under one sentence about self-custody.
               That is an arrival and it is the right one — but a reader who has
               just watched it still does not know what X0 IS, how long it took,
               or which parts of it were mine, and those are the three things a
               case study is opened for. Putting them in the hero turns the hero
               into a title slide with a spec table under it, which is the exact
               shape the film was built to stop being.

               So they are the screen AFTER it. The hero ends on black, the
               bridge turns the page white, and the first thing printed on the
               white is the record. It is the front matter of a document: name,
               one line of what the thing is, then the facts ruled off, key left
               and value right — the same reading the legacy spec card gets
               later in the study, because a fact set as engineering metadata
               reads as a fact and the same fact set as a sentence reads as a
               claim.

               EVERY VALUE HERE IS DOCUMENTED. Seven months, concept to beta,
               the scope and the collaborators are all out of the knowledge base
               rather than written for the page. There is no team size and no
               launch metric because neither is recorded anywhere, and a case
               study that invents one has spent the only thing it had. */
            { id: 'x0-record', nav: 'Overview', kind: 'record', dur: 165,
              kicker: 'Cypherock · Case study',
              h: 'Cypherock X0',
              lede: 'A hardware wallet the size of a bank card, built to make '
                + 'self-custody simpler, more approachable and more '
                + '<b>physical</b> than the vault it sits beside.',
              rows: [
                { k: 'Role', v: 'Senior Product Designer — end to end, concept to beta' },
                { k: 'Timeline', v: 'Seven months · Dec 2025 — present' },
                { k: 'Team', v: 'Design of one, with firmware, hardware, blockchain and frontend engineering' },
                { k: 'Scope', v: 'Product strategy · Information architecture · UX · UI · Design system · Industrial and packaging design' },
                { k: 'Surfaces', v: 'The NFC card · X0 Wallet for iOS and Android · CySync desktop' },
              ] },

            /* ==============================================================
               ACT I — THE PREMISE (01–05)
               Curiosity. The reader should not yet know this is a case study.
               ============================================================== */

            /* THE COLD OPEN IS THE HERO NOW, AND SCENE 01 HAS GONE WITH IT.

               It was `x0-open`: the card in front of its own name, a kicker,
               a 56px headline and a meta line, over a `shot` that was still
               waiting for a transparent render to be cut. Everything it was
               doing — arriving, naming the piece, saying what the work was —
               the film above does with the actual product moving, so keeping
               it meant two cold opens in a row and the same sentence said
               twice in two sizes. The renderer it used, `SCENE.object`, is
               untouched: scenes 02 and 27 are still built by it.

               ACT I THEREFORE STARTS HERE. `act` is stated on the first
               scene of an act and nowhere else, and `Film.build` counts the
               acts off those statements — so this line is what keeps the
               chapter reading in the corner saying 01 / 04 through the
               opening of the film.

               SUCCESS AS THE STARTING CONDITION. The three facts arrive as
               beats and then there is a pause with nothing in it, so the
               reader has time to conclude X1 is fine before being told the
               market moved. The pause is the scene. */
            /* AND IT IS A DRAWING NOW, NOT A SCREENSHOT. The flagship used
               to arrive here as `x1.webp` — the CySync grid, four hundred
               dark screens cut off by the left edge — and it was doing two
               jobs badly. As evidence it was unreadable at that size; as a
               picture it was a rectangle of noise the copy had to shout
               over. What replaced it is a technical line drawing of the
               product it is talking about: the vault, and the four cards it
               splits a key across. No fill, no light, no ground — so there
               is nothing for the copy to fight, and the page's white runs
               straight through the object.

               A DRAWING AND NOT A PHOTOGRAPH, AND THAT IS THE ARGUMENT. The
               scene says X1 was never the problem — the engineering was
               fine. A photograph would have said it was desirable. A
               dimensioned outline says it was correct, which is the claim
               being made and the one the next scene overturns.

               AND IT IS A STENCIL, NOT A PICTURE OF ONE. The first pass
               shipped this as a 1442px bitmap, which at the size it prints
               here was already past its own resolution — the outlines went
               soft exactly where a technical drawing has to be sharp, and a
               blurred stencil is just a grey smudge in the shape of a
               product. It was traced to vector: eighty-three paths, 70 KB,
               and no resolution at all, so it is the same drawing on a phone
               and on a 5K display.

               IT IS ALSO WHY THE SCENE CAN DRAW ITSELF. An outline that is
               geometry rather than pixels can be uncovered a band at a time
               without any of it blurring at the edge — the reveal lives in
               `.fg-obj__art`'s mask in the stylesheet, and it runs off the
               same scroll progress every beat in the film runs off.

               THE FRAME IS THE COMPOSITION, and every part of it is stated
               here rather than assumed by the renderer: `index` is the plate
               number in the top-left corner, `note` is the two-line remark
               out on the white beside the object, `pills` are the three
               claims under the paragraph, `foot` and `sig` are the two feet.
               `object` renders each one only if the scene carries it, so the
               end card — the other scene on this renderer — is untouched by
               all of it. */
            /* --- THE CLAIM, AS THE PRESS KIT CUT APART --------------------

               THIS WAS `kind: 'object'` WITH THE TRACED DRAWING BELOW IT, and
               the drawing argued the wrong case. A line drawing says "this is
               the shape of the thing"; the sentence beside it says the thing
               was already good at $199 — finished, manufactured, photographed.
               A drawing cannot carry that. A photograph of the real product
               can, and the press kit was already shot.

               `tiles` IS AN ORDERED LIST AND NOTHING MORE. Which cell each
               picture lands in is `:nth-child` in the stylesheet, so the
               composition was retuned several times without this file being
               opened. The eighth crop — the vault from above, `x1-vault` — is
               cut and sitting beside these unused; it is the same device as
               `x1-usb` from a second angle, and seven reads better than eight.

               THE DRAWING SPEC BELOW IS NOW UNREFERENCED. It is roughly a
               hundred kilobytes of traced path data that nothing renders any
               more. It is left in place deliberately rather than deleted in
               the same pass as the scene it belonged to. */
            { id: 'x0-x1', nav: 'Context', act: 'I · Premise', kind: 'bento', dur: 150,
              tiles: [
                { src: 'assets/img/x0/kit/x1-fan.webp',
                  alt: 'The flagship card fanned over the four numbered key cards' },
                { src: 'assets/img/x0/kit/x1-joy.webp',
                  alt: "The vault's joystick, close" },
                { src: 'assets/img/x0/kit/x1-chip.webp',
                  alt: 'The contact plate set into a card' },
                { src: 'assets/img/x0/kit/x1-nfc.webp',
                  alt: 'The contactless mark on a card corner' },
                { src: 'assets/img/x0/kit/x1-usb.webp',
                  alt: 'The vault on its side, USB-C port showing' },
                { src: 'assets/img/x0/kit/x1-stack.webp',
                  alt: 'The four cards squared up, the logo running across them' },
                { src: 'assets/img/x0/kit/x1-edges.webp',
                  alt: 'One, three and four read off the stepped card edges' },
              ],
              /* THE DRAWING IS THE ORIGINAL. IT ARRIVES ONE ELEMENT AT A TIME.

                 `art` IS THE DRAWING AND IT IS NEVER TOUCHED. Traced from
                 the original as filled outlines: rendered against the source
                 at 1442px it is a mean of 1.5/255 different, which is the
                 same picture. It is defined once and referenced by every
                 layer, so it exists once in the document however many times
                 it is shown.

                 AND NOTHING IS EVER HALF-DRAWN, WHICH IS THE POINT. Three
                 reveals were built and rejected before this one, and they
                 failed the same way each time. A gradient wipe was a curtain
                 in front of a finished picture. A pen ruling the lines in,
                 chunked, put a hundred part-drawn fragments on screen at
                 once and read as debris. The same pen with whole lines was
                 coherent but still a line growing out of nothing, which is a
                 drawing being made rather than a product being presented.

                 SO THE OBJECT IS CUT INTO ITS OWN PARTS AND EACH PART
                 ARRIVES COMPLETE. The vault, then the fan one card at a time
                 from the back, then what is printed on them. A part fades up
                 whole — correct outline, correct corners, nothing growing —
                 and the parts overlap in time, so the object is assembling
                 rather than flickering. At every scroll position everything
                 visible is a finished piece of the drawing.

                 A LAYER IS A MASK, NOT A COPY OF THE ARTWORK. `pen` is the
                 centreline of that part's lines, stroked fat and white and
                 fully drawn; masking the shared artwork with it shows
                 exactly that part and nothing else. The grouping is read off
                 the geometry — the fan's own spread axis cut into four bands
                 for the four cards, the vault taken as the largest body
                 after the fan plus whatever sits inside its outline — so
                 moving a card in the source moves it here too.

                 THE TWO NUMBERS ON A LAYER are when it starts and how fast
                 it comes up. Every layer takes about an eighth of the scene
                 and they start a fifteenth apart, so the whole object is
                 there a little past half way, before the closing line and
                 the claims land. */
              draw: {
                /* `pw` IS THE MASK PEN'S WIDTH AND `nw` DILATES THE PRINTED
                   TYPE. Measured, not guessed: masked against unmasked at
                   1442px, 26 leaves 0.005% of the ink unreached. Neither can
                   spill — a mask only ever reveals artwork already there. */
                vb: '0 0 1442 1091', pw: 26, nw: 40,
                /* the trace was taken at twice the drawing's size, for
                   smoother curves; this puts it back and flips potrace's
                   y-up space. IT LIVES ON THE ARTWORK'S OWN DEFINITION and
                   not on the layers: `maskUnits="userSpaceOnUse"` measures a
                   mask in the space of the element it is applied to, so a
                   masked group inside a scale(0.5) reads its mask at half
                   size and shows a corner of the drawing in the corner of
                   the frame. */
                at: 'scale(0.5) translate(0,2182) scale(0.1,-0.1)',
                art: [
                  'M8035 21548 c-93 -15 -231 -47 -330 -78 -49 -16 -144 -38 -210 -50 -66 -12 -133 -26 -150 -31 -16 -5 -61 -16 -100 -25 -230 -53 -517 -171 -765 -314 -36 -21 -94 -53 -130 -72 -75 -41 -100 -55 -235 -135 -55 -33 -136 -79 -180 -103 -44 -24 -91 -51 -105 -60 -14 -9 -70 -41 -125 -70 -55 -29 -111 -60 -125 -70 -14 -9 -56 -34 -95 -55 -38 -21 -131 -73 -205 -115 -74 -43 -202 -113 -285 -155 -82 -43 -161 -86 -175 -95 -14 -9 -56 -34 -95 -55 -67 -36 -148 -82 -405 -227 -63 -36 -155 -87 -205 -113 -49 -26 -94 -51 -100 -55 -5 -4 -35 -21 -65 -37 -84 -46 -284 -159 -388 -219 -52 -30 -95 -54 -97 -54 -2 0 -71 -40 -155 -90 -84 -49 -154 -90 -156 -90 -2 0 -38 -21 -81 -46 -43 -26 -123 -70 -178 -99 -55 -28 -203 -112 -330 -185 -126 -74 -320 -184 -430 -245 -336 -188 -394 -225 -565 -361 -224 -178 -387 -368 -490 -569 -142 -276 -199 -501 -200 -787 0 -153 35 -383 81 -533 86 -282 167 -517 203 -598 13 -28 40 -92 60 -141 34 -85 62 -137 164 -305 116 -191 383 -446 632 -606 223 -143 614 -279 935 -326 267 -38 639 -42 900 -9 350 45 806 180 1095 324 98 49 282 146 355 186 66 36 157 86 225 123 30 16 69 37 85 47 17 9 86 47 155 82 69 36 145 77 170 91 124 69 213 117 215 117 2 0 43 23 92 51 48 29 153 85 233 125 80 40 172 88 205 107 33 19 80 45 105 59 25 14 68 38 95 53 28 16 120 64 205 107 85 44 160 83 165 88 6 4 51 29 100 55 50 27 110 59 135 73 25 14 106 56 180 95 74 38 182 95 240 127 58 31 159 85 225 120 66 35 125 66 130 70 6 4 54 31 108 59 221 116 490 259 652 346 39 21 115 64 170 95 55 32 132 74 170 95 39 21 88 48 110 60 78 44 151 83 225 120 105 53 343 213 420 283 192 172 318 327 405 500 141 280 166 394 185 827 6 138 15 336 21 440 6 105 11 300 12 435 2 227 0 252 -21 336 l-24 92 36 46 c74 97 86 146 86 347 0 145 -3 176 -20 223 -63 168 -316 257 -614 216 l-75 -11 -59 48 c-56 45 -194 132 -252 160 -41 20 -172 80 -221 101 -146 66 -404 133 -679 178 -97 16 -147 26 -235 50 -149 42 -466 57 -630 32z m510 -82 c168 -40 195 -50 284 -99 83 -46 102 -62 158 -132 95 -118 106 -144 111 -250 5 -113 -15 -172 -90 -266 -113 -140 -226 -217 -383 -259 -44 -12 -100 -28 -125 -36 -111 -38 -202 -48 -425 -48 -241 -1 -254 1 -455 70 -113 38 -247 118 -296 177 -15 17 -41 61 -58 97 -27 56 -31 76 -30 145 0 110 31 172 141 287 46 47 83 93 83 102 0 20 104 78 232 127 85 33 215 69 378 102 58 12 405 0 475 -17z m603 -127 c203 -48 353 -105 547 -205 44 -23 105 -54 135 -69 30 -15 82 -41 115 -58 53 -27 176 -119 272 -204 53 -46 208 -250 242 -316 17 -34 43 -102 58 -152 24 -81 27 -105 27 -245 0 -154 0 -156 -38 -265 -21 -60 -53 -139 -72 -175 -46 -88 -182 -267 -253 -332 -89 -82 -303 -235 -415 -298 -55 -31 -141 -80 -189 -108 -48 -29 -89 -52 -91 -52 -1 0 -52 -28 -112 -62 -60 -33 -174 -97 -254 -141 -80 -44 -156 -88 -170 -97 -14 -10 -50 -30 -80 -45 -30 -15 -163 -89 -295 -165 -132 -75 -268 -151 -302 -168 -34 -18 -101 -56 -150 -85 -48 -29 -142 -82 -208 -117 -130 -68 -252 -136 -385 -213 -47 -27 -186 -106 -310 -175 -328 -183 -610 -341 -730 -409 -58 -32 -197 -110 -310 -173 -113 -62 -268 -150 -345 -195 -77 -46 -178 -102 -225 -125 -47 -23 -119 -64 -160 -90 -85 -53 -280 -163 -480 -270 -74 -40 -146 -80 -160 -90 -44 -31 -327 -169 -433 -211 -582 -232 -1228 -290 -1852 -164 -473 94 -856 271 -1102 509 -201 193 -300 371 -348 621 -37 198 2 451 105 671 68 146 140 238 325 414 166 158 270 225 745 488 25 13 95 54 155 91 61 37 155 91 210 121 129 69 279 155 330 190 35 24 126 74 335 187 30 16 150 84 265 150 285 164 500 285 620 350 124 68 256 141 445 248 80 45 199 111 265 147 66 36 185 103 265 148 80 45 219 123 310 173 91 50 203 113 250 140 47 27 135 77 195 111 61 34 162 92 225 128 63 36 171 96 240 133 69 37 162 90 207 117 169 100 516 238 752 298 104 26 122 21 51 -15 -30 -15 -66 -35 -80 -45 -14 -10 -61 -29 -105 -43 -232 -74 -318 -114 -653 -306 -221 -126 -252 -143 -377 -211 -44 -24 -91 -51 -105 -60 -14 -9 -50 -30 -80 -47 -51 -28 -69 -38 -167 -95 -21 -11 -69 -38 -108 -58 -38 -21 -110 -61 -160 -90 -49 -29 -103 -60 -120 -70 -16 -9 -57 -33 -90 -52 -33 -20 -81 -47 -107 -62 -27 -14 -67 -37 -90 -50 -24 -13 -86 -47 -138 -76 -52 -29 -143 -81 -203 -116 -59 -35 -109 -64 -112 -64 -2 0 -30 -15 -62 -34 -32 -18 -98 -55 -148 -81 -49 -26 -94 -51 -100 -55 -12 -10 -256 -150 -260 -150 -2 0 -59 -32 -127 -72 -67 -39 -163 -94 -213 -121 -49 -27 -137 -78 -195 -112 -58 -34 -145 -84 -194 -110 -49 -26 -112 -61 -140 -78 -57 -34 -81 -47 -181 -102 -138 -77 -422 -239 -525 -300 -58 -34 -179 -104 -270 -156 -311 -175 -470 -289 -621 -445 -113 -118 -162 -188 -228 -326 -73 -154 -89 -208 -100 -333 -21 -246 32 -429 186 -642 144 -199 310 -317 653 -463 41 -18 76 -34 78 -35 2 -2 -4 -17 -13 -35 -24 -46 -13 -60 14 -17 27 44 34 44 131 13 103 -33 300 -75 460 -97 119 -17 560 -17 685 0 236 32 424 76 700 166 56 18 228 87 240 95 6 5 73 40 150 80 77 40 145 76 150 80 15 12 188 110 290 165 50 27 126 71 170 98 44 28 105 63 135 80 30 17 73 42 95 57 22 15 81 49 130 75 50 26 108 58 130 70 22 13 67 39 100 57 149 82 311 172 509 283 118 66 254 141 303 167 48 27 106 58 128 71 22 13 65 37 95 54 106 59 195 110 245 139 28 17 88 50 134 73 46 24 103 55 125 69 23 14 93 53 156 87 63 34 162 89 220 122 58 33 166 93 240 133 74 40 191 107 260 148 69 41 202 117 295 169 289 162 428 239 490 273 33 18 101 56 150 85 50 28 178 101 285 160 456 254 662 430 781 668 71 140 94 234 93 382 -1 133 -22 209 -95 355 -81 160 -225 307 -449 457 -119 80 -423 215 -588 261 -40 11 -86 32 -103 46 -17 14 -35 26 -40 26 -5 0 -9 5 -9 10 0 15 32 12 128 -11z m-82 -97 c39 -31 111 -148 134 -217 32 -95 25 -209 -16 -286 -75 -140 -294 -304 -496 -373 -396 -133 -835 -139 -1151 -15 -300 118 -438 302 -397 529 19 108 122 274 194 312 24 13 26 17 -45 -72 -142 -178 -142 -379 2 -535 80 -87 261 -182 416 -220 422 -101 917 -23 1200 189 247 186 315 420 180 618 -57 83 -60 88 -50 88 4 0 18 -8 29 -18z m204 -69 c112 -38 422 -189 494 -240 182 -130 319 -275 390 -413 169 -326 99 -638 -211 -941 -116 -114 -247 -203 -503 -346 -140 -78 -371 -209 -425 -240 -62 -37 -100 -58 -195 -110 -125 -69 -700 -388 -770 -428 -218 -124 -395 -223 -570 -320 -107 -60 -271 -152 -365 -205 -266 -152 -433 -244 -515 -285 -41 -21 -115 -61 -165 -90 -118 -69 -550 -312 -690 -387 -60 -33 -162 -90 -225 -128 -562 -332 -1028 -586 -1195 -651 -332 -130 -346 -134 -490 -164 -454 -93 -813 -98 -1245 -16 -192 37 -367 95 -555 186 -169 81 -291 164 -389 263 -95 97 -126 140 -181 257 -122 257 -115 486 21 757 135 268 332 448 755 691 90 52 265 153 389 224 124 72 272 157 330 190 111 63 454 258 705 401 158 90 495 280 779 439 94 52 202 114 240 137 39 24 100 58 136 76 74 37 295 161 515 289 256 150 915 524 1155 656 58 32 144 82 191 111 109 66 390 208 447 225 54 16 60 9 29 -33 -69 -92 -109 -224 -106 -349 2 -67 0 -71 -49 -146 -49 -75 -92 -162 -92 -187 0 -6 -11 -27 -24 -47 -33 -48 -63 -144 -77 -243 -20 -146 27 -300 130 -424 189 -227 471 -372 851 -439 210 -36 558 -20 795 38 444 109 791 354 934 659 48 104 60 153 61 247 0 169 -96 386 -240 538 -35 37 -38 46 -45 119 -9 106 -28 174 -74 268 -38 79 -40 94 -12 83 9 -4 36 -14 61 -22z m1211 -247 c116 -25 228 -97 256 -165 35 -83 -17 -215 -109 -276 -48 -32 -68 -32 -68 -1 0 17 11 31 35 46 112 69 125 204 28 289 -67 60 -144 81 -293 81 -113 0 -140 6 -125 30 9 15 200 12 276 -4z m24 -87 c99 -37 152 -99 139 -164 -8 -46 -19 -51 -40 -20 -24 36 -80 62 -160 75 -65 10 -72 14 -129 70 l-60 60 97 0 c74 0 111 -5 153 -21z m-1289 -203 c-9 -36 -26 -87 -38 -113 -57 -122 -280 -298 -463 -366 -22 -9 -71 -27 -110 -42 -149 -57 -289 -78 -520 -79 -232 0 -275 7 -492 79 -173 58 -271 122 -369 240 -56 67 -91 140 -103 212 -12 76 1 87 32 27 27 -52 117 -147 181 -190 134 -91 334 -157 556 -185 256 -31 659 30 885 135 178 83 365 227 422 323 33 57 39 45 19 -41z m1337 -7 c27 -29 28 -32 11 -50 -9 -10 -25 -19 -34 -19 -19 0 -93 107 -84 121 8 14 77 -19 107 -52z m-1230 -100 c26 -49 29 -61 24 -124 -5 -73 -46 -207 -62 -206 -6 0 -13 21 -17 46 -6 42 -29 92 -71 155 -16 24 -15 27 28 100 25 41 45 78 45 83 0 23 28 -5 53 -54z m86 -38 c15 -47 14 -146 -4 -214 -47 -183 -220 -361 -476 -492 -261 -133 -525 -195 -835 -195 -267 0 -435 33 -664 130 -194 82 -278 143 -367 268 -66 91 -84 148 -91 274 -5 121 6 178 46 230 14 18 21 24 17 13 -20 -55 -38 -126 -45 -175 -27 -185 127 -407 382 -552 127 -72 192 -93 468 -150 83 -17 412 -16 535 1 392 56 781 263 930 496 73 114 79 136 80 282 0 134 3 145 24 84z m1338 -50 c-4 -72 -11 -100 -36 -150 -17 -33 -35 -61 -39 -61 -4 0 -13 19 -20 42 -7 23 -22 60 -33 82 l-19 40 47 40 c27 23 59 53 73 68 14 15 27 27 29 28 2 0 1 -40 -2 -89z m-3639 -33 c16 -29 44 -66 61 -82 38 -36 38 -41 5 -103 -14 -27 -28 -75 -31 -106 -3 -31 -9 -57 -12 -57 -4 0 -24 33 -44 73 -47 91 -58 184 -33 270 9 31 18 57 20 57 2 0 18 -24 34 -52z m2397 -213 c0 -144 -14 -188 -106 -325 -101 -151 -300 -315 -490 -404 -79 -37 -236 -92 -304 -105 -308 -63 -310 -64 -550 -58 -248 5 -333 19 -536 86 -233 78 -393 179 -516 327 -75 90 -133 234 -133 332 0 51 28 182 39 182 5 0 13 -30 19 -66 18 -110 53 -166 176 -290 101 -100 120 -115 216 -162 484 -236 1097 -233 1595 8 286 138 526 390 542 569 2 26 7 57 10 71 5 25 6 24 22 -10 11 -26 16 -66 16 -155z m-445 52 c0 -28 -4 -66 -9 -82 -15 -52 -120 -183 -188 -234 -73 -54 -269 -158 -323 -170 -256 -61 -259 -61 -426 -61 -108 0 -187 5 -236 15 -113 24 -273 81 -331 118 -102 66 -191 188 -204 282 -7 56 5 58 43 8 115 -148 243 -232 433 -284 93 -26 357 -37 477 -21 297 41 552 185 687 389 34 51 65 93 69 93 4 0 8 -24 8 -53z m1580 -159 c0 -18 7 -69 15 -113 17 -94 19 -239 5 -460 -5 -88 -14 -254 -20 -370 -27 -584 -39 -692 -91 -850 -59 -177 -217 -435 -364 -594 -80 -86 -264 -235 -362 -292 -212 -125 -276 -161 -372 -209 -57 -28 -120 -62 -140 -74 -20 -13 -153 -85 -296 -161 -143 -75 -300 -161 -350 -190 -49 -28 -166 -91 -260 -140 -93 -48 -240 -127 -325 -175 -85 -48 -186 -103 -225 -122 -116 -58 -436 -228 -474 -252 -20 -12 -83 -46 -141 -75 -58 -30 -109 -57 -115 -61 -5 -4 -64 -35 -130 -70 -66 -35 -167 -89 -225 -120 -58 -32 -148 -79 -200 -105 -52 -26 -140 -73 -195 -105 -55 -31 -140 -78 -190 -105 -49 -26 -94 -51 -100 -55 -5 -4 -136 -74 -290 -155 -154 -81 -309 -165 -345 -185 -138 -78 -408 -217 -610 -313 -225 -107 -614 -223 -880 -262 -58 -8 -141 -20 -185 -27 -107 -16 -591 -16 -710 1 -151 21 -256 40 -373 67 -91 22 -264 82 -272 94 -11 18 -62 254 -130 600 -37 190 -87 424 -95 450 -4 13 -15 20 -30 20 -44 0 -344 124 -500 205 -282 149 -470 312 -593 516 -58 96 -112 323 -112 468 0 103 11 241 20 241 4 0 12 -44 17 -97 20 -178 114 -401 227 -537 65 -79 198 -212 256 -257 159 -124 569 -324 745 -364 17 -3 44 -12 60 -20 65 -28 373 -77 650 -104 305 -30 798 13 1075 94 344 101 541 175 632 237 16 11 85 48 155 84 71 35 148 75 173 90 112 65 254 145 350 197 30 16 60 33 65 37 6 4 55 31 110 60 55 29 105 56 110 61 11 8 159 94 235 137 25 14 137 78 250 142 113 64 231 131 263 149 31 17 83 45 115 62 97 54 135 75 192 109 30 18 183 102 340 188 157 85 335 185 395 222 61 37 189 109 285 160 96 51 191 103 210 115 47 29 224 130 450 254 102 57 246 138 320 181 170 97 437 247 600 335 69 37 161 89 205 115 44 26 132 75 195 110 170 93 315 184 406 256 109 85 284 252 338 325 38 50 124 212 147 274 20 56 36 111 59 200 5 22 10 75 10 118 0 44 4 77 10 77 6 0 10 -15 10 -32z m-2024 -37 c-27 -42 -326 -111 -486 -111 -83 0 -233 20 -277 37 -13 5 79 8 220 8 248 0 359 14 484 59 46 17 66 19 59 7z m-7226 -4081 c106 -75 341 -205 440 -243 53 -21 126 -44 316 -102 6 -2 17 -48 23 -102 24 -188 79 -467 121 -608 5 -16 19 -75 30 -130 11 -55 25 -110 30 -122 16 -38 -5 -36 -107 13 -307 147 -593 385 -748 620 -71 108 -78 129 -29 84 21 -20 62 -54 89 -76 28 -22 142 -114 254 -205 112 -90 245 -197 294 -236 50 -40 97 -73 104 -73 21 0 54 40 49 58 -3 9 -12 62 -20 117 -15 102 -89 403 -107 436 -5 11 -29 29 -52 40 -23 12 -57 32 -77 44 -19 12 -84 53 -145 90 -60 38 -148 94 -195 125 -47 31 -100 65 -119 74 -18 10 -87 56 -153 103 -140 99 -170 106 -178 38 -6 -49 -15 -38 -46 55 -25 73 -84 274 -84 285 0 3 48 -44 107 -105 63 -66 146 -140 203 -180z m-72 -109 c23 -21 42 -46 42 -54 0 -39 74 -247 105 -293 32 -49 95 -106 95 -87 0 5 -16 36 -36 69 -38 62 -107 251 -98 266 10 15 23 -2 34 -45 18 -67 75 -144 186 -250 108 -103 381 -326 476 -390 53 -35 57 -40 63 -85 3 -26 8 -63 10 -83 3 -20 2 -39 -1 -42 -3 -3 -58 38 -122 92 -65 54 -157 130 -207 170 -49 40 -143 116 -208 169 -66 54 -148 118 -183 143 -35 25 -75 56 -88 68 -27 26 -93 173 -112 251 -15 61 -18 140 -6 140 4 0 26 -17 50 -39z m261 -216 c32 -48 83 -98 195 -191 336 -280 374 -313 360 -314 -17 0 -284 211 -417 330 -124 110 -227 241 -189 240 4 0 27 -30 51 -65z',
                  'M8346 21429 c-30 -24 -36 -78 -11 -99 34 -29 108 -11 125 29 28 68 -53 118 -114 70z m69 -44 c0 -21 -31 -33 -46 -18 -5 5 -7 17 -3 27 9 24 49 17 49 -9z',
                  'M8102 21407 c-24 -26 -29 -66 -10 -85 17 -17 79 -15 106 4 14 10 22 26 22 44 0 56 -77 80 -118 37z m71 -31 c7 -18 -1 -26 -25 -26 -11 0 -18 7 -18 20 0 23 35 28 43 6z',
                  'M8568 21413 c-35 -22 -41 -39 -26 -71 20 -40 61 -51 106 -27 41 22 56 71 28 94 -25 21 -79 23 -108 4z m70 -50 c-4 -20 -35 -30 -50 -15 -15 15 0 32 28 32 19 0 25 -5 22 -17z',
                  'M7852 21380 c-27 -25 -28 -51 -4 -73 63 -57 172 0 128 68 -22 33 -91 36 -124 5z m83 -40 c0 -18 -33 -26 -47 -12 -6 6 -7 15 -3 22 10 16 50 8 50 -10z',
                  'M8762 21300 c-60 -25 -49 -108 17 -121 59 -12 113 59 79 103 -16 20 -66 30 -96 18z m58 -61 c0 -12 -7 -19 -20 -19 -24 0 -38 29 -20 40 19 12 40 1 40 -21z',
                  'M7625 21289 c-57 -32 -61 -83 -10 -128 42 -36 85 -41 115 -11 25 25 27 89 3 119 -21 25 -80 36 -108 20z m63 -38 c8 -5 12 -17 10 -27 -4 -26 -63 -32 -72 -8 -12 32 29 56 62 35z',
                  'M8092 21277 c-7 -8 -9 -29 -5 -50 6 -42 24 -47 95 -25 71 21 87 88 22 88 -25 0 -40 -15 -24 -25 16 -10 1 -25 -25 -25 -17 0 -25 6 -27 22 -4 26 -21 33 -36 15z',
                  'M8279 21280 c-6 -4 -9 -16 -7 -26 3 -17 18 -20 123 -29 109 -9 120 -12 120 -30 0 -22 67 -65 101 -65 12 0 32 8 44 18 20 16 21 21 11 41 -16 29 -69 61 -102 61 -14 0 -48 6 -75 14 -55 16 -197 26 -215 16z m327 -85 c18 -15 18 -15 -5 -13 -14 2 -26 9 -29 16 -5 17 10 15 34 -3z',
                  'M7926 21251 c-68 -14 -86 -60 -34 -87 40 -21 127 -13 146 13 39 54 -19 92 -112 74z m64 -41 c0 -13 -41 -29 -57 -23 -19 7 -16 21 5 26 31 8 52 7 52 -3z',
                  'M8292 21160 c-65 -88 48 -146 116 -59 10 13 9 23 -3 53 -14 32 -19 36 -53 36 -31 0 -43 -6 -60 -30z m67 -19 c19 -12 6 -41 -19 -41 -21 0 -24 8 -14 34 7 18 13 19 33 7z',
                  'M8852 21154 c-16 -11 -34 -14 -58 -10 -45 9 -112 -12 -120 -37 -9 -27 27 -71 61 -75 17 -2 39 5 56 17 16 12 40 26 53 31 14 5 33 21 42 35 15 23 15 28 3 41 -13 12 -18 12 -37 -2z m-72 -54 c0 -16 -41 -33 -52 -22 -6 6 -7 15 -4 21 9 14 56 15 56 1z',
                  'M7781 21134 c-36 -30 -39 -52 -10 -83 18 -19 29 -22 56 -18 85 14 110 69 49 106 -43 27 -58 26 -95 -5z m77 -41 c-2 -10 -13 -19 -26 -21 -24 -4 -29 7 -10 26 18 18 40 15 36 -5z',
                  'M8065 21128 c-26 -15 -35 -28 -35 -55 0 -27 27 -43 75 -43 49 0 75 16 75 45 0 52 -65 82 -115 53z m63 -45 c2 -8 -5 -13 -17 -13 -21 0 -35 13 -24 24 10 10 36 3 41 -11z',
                  'M7553 21103 c-26 -5 -53 -39 -53 -65 0 -23 38 -48 75 -48 44 0 75 25 75 60 0 18 -8 34 -22 44 -22 16 -33 17 -75 9z m45 -54 c4 -19 -27 -34 -41 -20 -14 14 0 43 20 39 10 -2 19 -10 21 -19z',
                  'M8450 21068 c-24 -26 -26 -70 -4 -89 40 -33 134 -1 134 46 0 55 -90 85 -130 43z m80 -33 c0 -9 -7 -18 -16 -22 -18 -7 -39 11 -30 26 11 17 46 13 46 -4z',
                  'M8872 21047 c-29 -30 -26 -53 9 -79 24 -18 27 -19 68 -2 23 9 46 24 51 34 15 28 -17 60 -65 67 -34 4 -44 1 -63 -20z m83 -26 c7 -12 -32 -34 -45 -26 -6 3 -10 13 -10 21 0 16 45 20 55 5z',
                  'M7962 21023 c-12 -3 -30 -15 -38 -29 -15 -22 -15 -26 0 -49 19 -29 53 -32 96 -10 65 34 19 102 -58 88z m38 -43 c0 -12 -28 -25 -36 -17 -9 9 6 27 22 27 8 0 14 -5 14 -10z',
                  'M8202 21014 c-28 -19 -27 -67 1 -72 11 -2 28 -13 39 -24 18 -18 60 -19 89 -2 38 22 -25 114 -78 114 -16 0 -39 -7 -51 -16z m78 -34 c17 -11 7 -24 -27 -35 -19 -5 -23 -2 -23 13 0 18 11 29 30 31 3 0 12 -4 20 -9z',
                  'M8653 20990 c-63 -28 -67 -91 -6 -106 56 -14 123 43 97 83 -23 37 -46 43 -91 23z m37 -50 c0 -19 -20 -27 -33 -13 -8 7 11 33 24 33 5 0 9 -9 9 -20z',
                  'M7693 20971 c-31 -26 -29 -55 4 -81 32 -25 83 -22 114 6 63 57 -52 130 -118 75z m80 -36 c-1 -5 -8 -14 -17 -20 -18 -11 -42 7 -31 25 8 13 51 9 48 -5z',
                  'M7450 20962 c-44 -21 -51 -54 -19 -88 28 -30 72 -31 117 -4 46 28 42 68 -8 92 -44 22 -48 22 -90 0z m80 -46 c0 -18 -58 -32 -72 -18 -17 17 1 32 38 32 23 0 34 -5 34 -14z',
                  'M8394 20918 c-16 -12 -31 -23 -33 -24 -13 -10 13 -53 38 -64 69 -28 146 54 89 94 -31 22 -60 20 -94 -6z m61 -39 c0 -8 -10 -15 -22 -17 -25 -4 -33 22 -10 31 18 8 32 2 32 -14z',
                  'M8840 20923 c-53 -20 -75 -76 -42 -106 43 -39 142 -3 142 52 0 37 -58 69 -100 54z m45 -63 c0 -18 -43 -26 -59 -10 -8 8 -7 13 4 20 21 14 55 8 55 -10z',
                  'M8093 20885 c-29 -21 -34 -49 -12 -84 16 -27 25 -31 60 -31 61 0 79 14 79 60 0 34 -4 42 -30 55 -37 19 -70 19 -97 0z m77 -49 c0 -14 -34 -28 -44 -18 -15 14 -4 32 19 32 15 0 25 -6 25 -14z',
                  'M7905 20873 c-25 -6 -65 -42 -65 -58 0 -18 31 -42 63 -50 54 -14 107 28 90 71 -5 13 -56 46 -65 43 -2 -1 -12 -3 -23 -6z m40 -53 c0 -18 -33 -26 -48 -11 -9 9 -8 14 3 21 21 14 45 8 45 -10z',
                  'M8565 20843 c-32 -8 -45 -23 -45 -54 0 -47 53 -63 110 -34 35 18 40 53 12 78 -18 17 -38 19 -77 10z m40 -43 c3 -6 -1 -13 -10 -16 -19 -8 -30 0 -20 15 8 14 22 14 30 1z',
                  'M7603 20819 c-71 -45 -19 -122 71 -105 59 11 68 53 23 104 -25 27 -52 28 -94 1z m67 -44 c0 -9 -9 -15 -25 -15 -24 0 -32 10 -18 23 12 13 43 7 43 -8z',
                  'M7362 20804 c-33 -23 -27 -75 10 -88 59 -21 156 58 112 91 -25 18 -95 16 -122 -3z m78 -28 c0 -16 -27 -29 -41 -20 -19 11 -9 34 16 34 15 0 25 -6 25 -14z',
                  'M8292 20785 c-29 -13 -33 -19 -30 -47 3 -32 5 -33 48 -35 65 -4 100 13 100 46 0 51 -49 66 -118 36z m73 -25 c3 -6 -1 -13 -10 -16 -19 -8 -30 0 -20 15 8 14 22 14 30 1z',
                  'M8728 20734 c-63 -41 -45 -94 31 -94 85 0 125 77 55 108 -34 16 -43 15 -86 -14z m72 -24 c13 -9 13 -11 0 -20 -22 -14 -50 -12 -50 4 0 12 13 23 30 25 3 0 12 -4 20 -9z',
                  'M7783 20720 c-35 -21 -41 -45 -19 -75 16 -22 98 -24 122 -4 21 17 17 56 -8 79 -27 25 -54 25 -95 0z m57 -50 c-18 -11 -32 -8 -37 7 -5 14 29 23 42 11 6 -6 5 -12 -5 -18z',
                  'M8034 20720 c-36 -14 -65 -59 -53 -81 12 -24 67 -26 109 -4 40 21 43 71 4 85 -29 12 -32 12 -60 0z m36 -50 c0 -5 -7 -10 -15 -10 -8 0 -15 5 -15 10 0 6 7 10 15 10 8 0 15 -4 15 -10z',
                  'M8460 20702 c-30 -9 -36 -33 -20 -73 11 -26 17 -29 55 -29 60 0 94 45 67 88 -11 16 -68 23 -102 14z m58 -50 c2 -7 -3 -12 -12 -12 -9 0 -16 7 -16 16 0 17 22 14 28 -4z',
                  'M7475 20675 c-57 -56 -8 -116 81 -99 65 12 84 87 29 112 -42 19 -83 14 -110 -13z m79 -21 c33 -13 11 -44 -30 -44 -20 0 -30 30 -13 41 17 10 23 11 43 3z',
                  'M8210 20683 c-87 -33 -54 -135 37 -118 96 17 98 99 3 119 -14 3 -32 2 -40 -1z m55 -54 c0 -8 -12 -15 -27 -17 -32 -4 -40 23 -10 31 25 7 37 2 37 -14z',
                  'M8582 20597 c-45 -47 -20 -100 47 -99 53 1 91 24 91 57 0 60 -94 88 -138 42z m79 -28 c24 -13 16 -29 -16 -29 -29 0 -43 19 -24 31 18 11 17 11 40 -2z',
                  'M7657 20577 c-21 -16 -28 -30 -25 -47 4 -30 59 -64 88 -55 32 10 80 55 80 75 0 49 -94 67 -143 27z m93 -32 c0 -22 -35 -38 -49 -22 -8 10 -7 17 1 25 17 17 48 15 48 -3z',
                  'M7904 20560 c-27 -11 -64 -62 -64 -87 0 -58 93 -69 138 -18 54 63 2 136 -74 105z m44 -67 c-4 -22 -58 -31 -58 -10 0 20 10 27 37 27 18 0 24 -5 21 -17z',
                  'M8353 20554 c-28 -14 -33 -22 -33 -53 0 -48 14 -61 67 -61 73 0 119 64 75 103 -28 25 -73 30 -109 11z m61 -30 c33 -13 11 -44 -30 -44 -14 0 -20 31 -7 43 8 9 17 9 37 1z',
                  'M8086 20509 c-70 -55 20 -134 103 -89 39 20 48 81 17 102 -23 16 -93 8 -120 -13z m84 -38 c0 -13 -37 -24 -50 -16 -6 4 -8 11 -5 16 8 12 55 12 55 0z',
                  'M9898 20995 c21 -38 49 -68 55 -58 4 5 -10 25 -30 44 -20 20 -31 26 -25 14z',
                  'M10170 20699 c7 -12 27 -43 45 -68 41 -57 98 -185 120 -271 24 -91 16 -362 -12 -470 -30 -113 -35 -142 -21 -138 36 12 98 292 98 438 -1 162 -63 342 -155 451 -58 69 -96 98 -75 58z',
                  'M10243 19637 c-11 -17 -40 -61 -62 -97 -29 -46 -56 -75 -95 -100 -29 -19 -111 -74 -182 -121 -71 -47 -159 -105 -196 -128 -72 -46 -83 -57 -45 -46 141 43 509 316 582 433 48 78 47 133 -2 59z',
                  'M9355 18984 c-22 -13 -116 -68 -210 -121 -162 -92 -358 -205 -545 -316 -47 -27 -101 -58 -120 -69 -43 -24 -56 -36 -47 -44 3 -3 30 7 59 23 29 17 95 53 147 82 51 28 184 105 295 170 110 65 221 128 246 141 75 37 218 131 224 146 8 20 -3 17 -49 -12z',
                  'M8198 18324 c-27 -13 -48 -26 -48 -29 0 -8 55 16 80 35 33 26 25 24 -32 -6z',
                  'M7851 18149 c-18 -11 -31 -22 -28 -25 6 -7 77 28 77 38 0 13 -12 10 -49 -13z',
                  'M7177 17759 c-22 -11 -36 -23 -33 -26 5 -5 76 35 76 43 0 6 -1 5 -43 -17z',
                  'M7004 17665 c-17 -8 -36 -21 -43 -29 -21 -25 4 -20 49 10 56 37 53 45 -6 19z',
                  'M1251 17513 c-31 -76 -32 -367 -2 -445 5 -12 15 -43 22 -68 15 -54 34 -79 26 -35 -3 17 -13 64 -22 105 -14 60 -16 114 -13 273 1 108 2 197 2 197 -1 0 -7 -12 -13 -27z',
                  'M6505 17399 c-72 -39 -150 -83 -175 -98 -25 -16 -139 -79 -255 -141 -115 -62 -273 -150 -350 -195 -77 -45 -176 -102 -220 -126 -44 -23 -132 -72 -195 -108 -63 -35 -164 -91 -225 -124 -60 -33 -143 -80 -183 -104 -40 -23 -77 -43 -82 -43 -6 0 -10 -9 -10 -20 0 -23 17 -26 39 -6 17 14 50 33 209 118 53 29 160 88 237 131 132 75 176 99 270 152 22 13 110 62 195 110 85 48 165 93 177 101 22 14 64 38 143 82 25 14 90 51 145 82 55 31 149 83 208 114 130 68 217 123 217 136 0 17 -11 12 -145 -61z',
                  'M8809 17954 c-7 -9 -25 -40 -39 -68 -19 -38 -32 -52 -50 -54 -14 -2 -33 -11 -42 -19 -10 -9 -25 -12 -37 -8 -28 8 -196 -71 -236 -112 -17 -17 -37 -49 -45 -72 -7 -23 -16 -44 -20 -46 -3 -2 -26 9 -50 25 -33 22 -47 26 -57 18 -18 -14 -16 -38 2 -38 27 0 125 -70 129 -93 3 -12 12 -61 21 -109 l16 -86 -27 -54 c-15 -29 -45 -81 -67 -116 -21 -35 -37 -66 -34 -69 14 -13 38 11 88 86 31 47 56 76 60 69 4 -6 5 -17 2 -24 -7 -19 16 -54 36 -54 10 0 24 11 31 25 19 36 73 66 139 80 54 10 57 13 71 53 16 47 28 51 90 26 24 -10 45 -13 50 -8 14 14 1 26 -62 59 -37 19 -62 40 -69 57 -17 41 -8 215 14 257 9 19 17 45 17 58 0 26 50 123 94 182 14 19 23 38 20 42 -8 14 -30 10 -45 -7z m-174 -265 c10 -15 -32 -57 -93 -91 -29 -17 -63 -44 -75 -59 -11 -16 -27 -29 -34 -29 -28 0 -45 79 -20 97 6 5 30 15 51 22 22 7 60 26 85 42 47 30 75 36 86 18z m15 -184 c0 -47 -2 -85 -5 -85 -10 0 -85 40 -85 46 0 2 7 17 17 32 41 67 59 92 66 92 4 0 7 -38 7 -85z m-120 0 c-14 -17 -50 -20 -50 -5 0 13 54 40 58 29 2 -5 -2 -16 -8 -24z m-65 -49 c19 -8 35 -19 35 -23 0 -13 -57 -79 -63 -73 -9 8 -20 110 -13 110 4 0 22 -7 41 -14z m120 -53 c41 -20 43 -34 12 -88 -24 -43 -97 -91 -122 -81 -29 11 -17 69 26 129 22 32 42 57 44 57 2 0 20 -8 40 -17z',
                  'M7817 17358 c-23 -16 -27 -26 -22 -47 4 -20 0 -32 -15 -46 -25 -22 -27 -62 -3 -67 13 -2 20 -22 29 -82 9 -56 19 -85 34 -100 l21 -21 47 26 c47 26 59 46 48 76 -6 13 -9 13 -32 -2 -14 -9 -28 -14 -31 -12 -2 3 -7 39 -10 80 l-6 75 32 16 c22 12 31 24 31 42 0 29 -24 42 -45 24 -16 -13 -20 -7 -27 34 -4 27 -19 29 -51 4z',
                  'M7664 17305 c-14 -14 -23 -29 -20 -33 3 -5 10 -67 16 -138 17 -206 20 -224 40 -224 9 0 25 9 35 20 16 17 17 32 12 117 -11 163 -30 283 -45 283 -7 0 -24 -11 -38 -25z',
                  'M8700 17162 c-177 -90 -383 -206 -398 -225 -6 -7 -8 -41 -5 -79 6 -69 18 -84 43 -53 7 8 17 15 23 15 6 0 111 51 234 112 l224 113 -3 75 c-4 93 -12 96 -118 42z',
                  'M7552 17134 c-21 -14 -22 -19 -15 -115 6 -95 5 -101 -17 -124 -13 -14 -31 -25 -41 -25 -18 0 -22 15 -33 135 -3 28 -5 51 -5 53 -3 11 -53 -2 -63 -17 -16 -23 -7 -185 12 -220 26 -50 85 -50 139 -1 18 17 42 30 55 30 12 0 30 6 40 13 17 12 17 19 0 150 -19 147 -24 155 -72 121z',
                  'M7220 16961 c-65 -25 -87 -41 -116 -83 -50 -72 3 -95 63 -28 35 39 65 50 78 30 3 -5 -2 -16 -12 -24 -10 -8 -38 -31 -63 -51 -50 -40 -80 -87 -80 -123 0 -75 64 -84 158 -22 33 22 66 40 75 40 28 0 42 28 30 63 -6 18 -14 63 -18 101 -5 53 -12 74 -30 92 -28 28 -27 28 -85 5z m35 -200 c-16 -50 -94 -88 -80 -38 9 28 67 79 78 67 5 -4 6 -18 2 -29z',
                  'M6999 16942 c-23 -13 -28 -25 -33 -76 -10 -92 -28 -200 -36 -209 -8 -10 -67 68 -100 131 -12 23 -26 42 -32 42 -16 0 -68 -30 -68 -40 0 -4 23 -43 50 -85 28 -41 67 -105 86 -140 39 -71 41 -72 84 -50 39 20 46 35 60 140 6 50 20 136 31 191 10 56 19 105 19 108 0 11 -35 4 -61 -12z',
                  'M7975 16904 c-9 -15 -24 -65 -32 -113 -8 -47 -19 -93 -23 -101 -5 -9 -5 -22 0 -30 14 -23 60 14 60 50 0 19 9 35 26 49 33 26 41 26 49 1 8 -24 43 -27 52 -4 3 9 1 24 -5 33 -6 9 -27 44 -47 79 -40 68 -54 75 -80 36z m44 -63 c8 -14 6 -22 -8 -35 -23 -21 -31 -11 -24 27 6 32 18 35 32 8z',
                  'M7809 16781 c-13 -10 -42 -25 -64 -32 -22 -8 -55 -26 -73 -40 l-33 -25 12 -67 c16 -84 21 -92 47 -78 18 10 19 13 6 48 -19 55 -17 69 15 92 35 25 41 20 41 -41 0 -35 4 -50 15 -55 25 -9 30 4 30 79 0 56 4 73 17 81 24 16 28 8 29 -52 1 -36 6 -54 16 -58 33 -13 45 70 19 132 -17 40 -41 45 -77 16z',
                  'M6499 16685 c-15 -8 -31 -27 -37 -43 -5 -16 -24 -45 -42 -65 -52 -59 -23 -94 29 -36 16 17 31 27 34 22 2 -4 11 -64 18 -132 9 -82 17 -125 26 -128 21 -8 65 26 59 45 -3 9 -13 89 -21 176 -9 88 -18 163 -21 168 -7 11 -14 10 -45 -7z',
                  'M7495 16667 l-32 -32 12 -78 c14 -89 22 -100 66 -100 23 0 40 8 61 31 25 29 28 40 28 97 0 52 -4 70 -22 90 -31 36 -72 33 -113 -8z m89 -33 c17 -44 -1 -127 -30 -138 -35 -13 -50 124 -16 143 25 15 39 13 46 -5z',
                  'M7351 16606 c-35 -19 -50 -54 -51 -112 -1 -127 58 -167 130 -89 22 23 25 36 24 91 -1 99 -44 144 -103 110z m49 -55 c11 -22 14 -90 4 -115 -10 -25 -43 -19 -54 10 -15 38 -12 91 6 108 20 21 31 20 44 -3z',
                  'M6294 16570 c-22 -14 -39 -40 -59 -90 -30 -75 -41 -82 -71 -49 -38 42 -66 50 -102 27 -39 -25 -40 -39 -4 -61 15 -9 47 -34 71 -55 l43 -38 -17 -34 c-21 -40 -75 -172 -75 -182 0 -13 30 -9 55 8 13 9 29 32 36 52 18 56 51 112 67 112 8 0 28 -16 46 -36 l32 -36 37 19 c20 10 37 23 37 30 0 12 -99 103 -112 103 -5 0 -8 8 -8 18 0 22 58 183 71 197 13 13 11 35 -3 35 -7 0 -27 -9 -44 -20z',
                  'M7154 16496 c-33 -33 -46 -76 -22 -76 6 0 23 14 38 32 18 21 32 29 43 25 25 -10 21 -28 -23 -103 -41 -70 -52 -124 -26 -124 8 0 18 4 21 10 3 5 25 18 48 28 51 23 85 58 70 73 -7 7 -22 3 -47 -11 -43 -26 -45 -19 -11 31 37 52 43 101 16 128 -31 31 -67 27 -107 -13z',
                  'M6859 16353 c-40 -34 -59 -79 -59 -142 0 -123 145 -133 196 -14 8 18 14 37 14 43 0 18 -38 11 -45 -9 -10 -33 -46 -71 -65 -71 -31 0 -53 44 -47 91 8 60 31 80 86 77 38 -3 46 0 49 16 9 44 -79 50 -129 9z',
                  'M6633 16230 c-29 -17 -53 -35 -53 -41 0 -31 33 -205 41 -213 5 -6 16 -3 27 7 10 9 24 17 31 17 6 0 34 22 61 50 45 45 50 53 50 95 0 111 -57 142 -157 85z m97 -39 c24 -46 5 -108 -42 -135 -37 -22 -43 -16 -55 56 -8 48 -7 60 6 72 35 30 76 33 91 7z',
                  'M6422 16138 c-6 -6 -12 -34 -12 -61 0 -58 -19 -137 -32 -137 -5 0 -22 27 -36 60 -26 58 -51 76 -67 49 -7 -10 79 -194 95 -204 4 -3 18 3 30 13 21 17 53 144 62 247 3 42 -15 58 -40 33z',
                  'M6171 15990 c-30 -17 -57 -32 -59 -35 -7 -6 -3 -118 4 -124 3 -3 27 7 53 22 53 29 61 27 61 -13 0 -35 -34 -65 -74 -65 -24 0 -31 -4 -31 -20 0 -41 67 -31 114 17 39 39 49 89 27 123 -19 28 -43 32 -72 10 -28 -22 -46 -19 -42 8 2 15 18 29 51 45 33 15 47 28 47 42 0 27 -15 25 -79 -10z',
                  'M17570 18554 c-105 -16 -174 -35 -385 -104 -132 -43 -350 -113 -485 -155 -135 -42 -414 -132 -620 -199 -206 -68 -488 -160 -627 -205 l-252 -82 -68 56 c-86 71 -244 150 -343 172 -113 24 -284 22 -395 -5 -91 -23 -222 -83 -920 -427 -137 -68 -419 -205 -625 -305 -731 -355 -987 -482 -1190 -590 -182 -97 -228 -116 -410 -175 -447 -144 -687 -227 -744 -258 -81 -43 -153 -112 -198 -187 l-37 -62 -308 -135 c-169 -73 -326 -142 -348 -152 -22 -10 -89 -39 -150 -64 -60 -25 -145 -61 -188 -81 -42 -20 -79 -36 -82 -36 -2 0 -147 -61 -322 -137 -502 -215 -546 -234 -573 -242 -14 -5 -72 -29 -130 -54 -426 -184 -424 -183 -504 -260 -93 -91 -152 -246 -144 -379 l3 -57 -60 -37 c-33 -20 -91 -54 -129 -76 -38 -21 -74 -42 -80 -47 -9 -7 -174 -109 -326 -201 -25 -15 -82 -50 -128 -79 -46 -28 -85 -51 -87 -51 -2 0 -41 -23 -87 -51 -46 -29 -99 -61 -118 -72 -19 -10 -53 -32 -75 -46 -22 -15 -83 -52 -135 -81 -52 -30 -131 -76 -175 -104 -77 -48 -146 -88 -445 -261 -74 -43 -236 -139 -360 -213 -124 -74 -241 -144 -260 -155 -210 -118 -311 -304 -297 -543 4 -56 9 -108 12 -117 5 -10 -49 -54 -192 -156 -109 -78 -241 -173 -293 -211 -52 -39 -147 -107 -210 -152 -63 -45 -153 -109 -200 -143 -47 -34 -130 -93 -185 -130 -55 -38 -127 -90 -160 -115 -33 -26 -116 -85 -185 -132 -431 -292 -479 -327 -550 -398 -120 -120 -160 -219 -160 -400 0 -206 30 -332 104 -429 44 -59 48 -62 276 -243 86 -68 198 -157 249 -198 200 -160 285 -226 536 -417 143 -108 289 -219 325 -247 36 -27 124 -95 195 -150 72 -55 155 -121 185 -146 30 -26 147 -116 259 -201 333 -252 737 -564 1042 -804 164 -129 355 -276 559 -430 103 -78 242 -186 399 -311 42 -33 95 -73 117 -90 23 -16 88 -65 145 -110 57 -44 167 -128 244 -187 77 -59 182 -142 234 -185 52 -42 143 -113 201 -157 162 -122 292 -223 540 -420 231 -183 504 -396 633 -494 40 -30 122 -94 182 -142 61 -48 156 -123 211 -166 56 -43 210 -163 343 -268 287 -225 566 -442 636 -495 28 -20 94 -73 147 -116 137 -113 396 -317 470 -371 35 -25 126 -96 203 -157 281 -224 431 -342 465 -366 19 -13 60 -45 90 -70 45 -38 413 -333 537 -430 17 -14 85 -68 150 -120 65 -52 145 -115 178 -140 33 -24 103 -80 156 -125 102 -85 339 -272 467 -368 42 -32 99 -77 126 -100 52 -44 169 -137 411 -327 80 -63 201 -159 267 -213 67 -54 145 -116 174 -138 30 -22 93 -72 141 -112 49 -40 202 -165 342 -277 140 -113 300 -242 355 -288 56 -45 128 -103 161 -129 57 -45 156 -127 200 -166 11 -10 57 -46 102 -80 46 -34 83 -65 83 -69 0 -4 28 -8 63 -8 l62 1 -31 27 c-17 15 -147 120 -290 234 -142 114 -311 250 -374 302 -195 162 -560 459 -614 500 -28 21 -82 65 -121 97 -75 62 -173 139 -329 259 -54 41 -140 109 -192 152 -51 42 -133 107 -181 144 -48 38 -232 184 -408 324 -176 141 -343 274 -371 295 -48 38 -133 106 -478 380 -83 67 -205 165 -271 219 -66 53 -176 141 -245 194 -69 53 -189 148 -268 212 -137 110 -288 229 -595 465 -158 121 -358 279 -487 384 -100 82 -195 156 -525 412 -66 51 -205 161 -310 244 -104 83 -211 166 -236 183 -40 27 -283 218 -544 426 -232 185 -396 314 -540 423 -88 67 -205 156 -260 198 -120 91 -265 203 -394 305 -115 91 -201 157 -330 256 -204 156 -245 188 -449 353 -37 30 -155 119 -262 199 -107 80 -217 164 -245 187 -27 23 -131 103 -230 178 -99 75 -254 195 -345 267 -91 72 -217 169 -280 217 -63 48 -158 121 -210 163 -52 42 -147 115 -210 162 -147 110 -195 147 -360 278 -74 59 -227 178 -340 265 -496 382 -587 453 -654 506 -115 90 -522 408 -638 498 -131 101 -189 162 -225 235 -33 67 -25 81 17 33 17 -20 68 -63 114 -95 46 -33 139 -104 208 -158 68 -55 200 -157 291 -229 92 -71 198 -154 235 -183 84 -67 388 -297 496 -377 45 -33 131 -98 191 -145 61 -47 131 -101 157 -120 91 -69 435 -331 568 -434 74 -58 189 -146 255 -196 66 -51 196 -151 288 -223 93 -73 195 -152 227 -177 186 -145 356 -275 454 -350 61 -47 167 -130 236 -186 69 -55 156 -122 193 -150 38 -27 166 -125 285 -217 119 -92 262 -202 317 -244 55 -42 125 -96 155 -120 225 -176 518 -403 635 -491 77 -58 218 -169 314 -246 96 -78 227 -181 291 -231 257 -197 410 -316 583 -454 100 -79 227 -178 282 -219 55 -42 188 -146 295 -232 396 -317 597 -476 740 -585 36 -28 132 -104 214 -170 146 -118 213 -170 373 -291 45 -34 125 -97 178 -140 54 -43 140 -110 191 -149 50 -38 134 -104 186 -147 51 -42 174 -140 273 -218 99 -79 209 -167 245 -196 92 -76 514 -410 585 -464 33 -24 110 -85 171 -135 62 -49 234 -187 383 -305 262 -208 817 -650 951 -758 36 -29 140 -112 231 -185 91 -72 223 -179 293 -237 71 -58 140 -114 155 -125 14 -10 77 -62 140 -115 63 -52 157 -128 210 -169 53 -41 159 -127 236 -192 l139 -119 58 0 c65 0 70 6 29 35 -30 21 -220 176 -352 287 -42 36 -127 104 -190 153 -63 49 -154 123 -204 165 -49 42 -155 129 -235 194 -80 64 -230 187 -335 272 -104 86 -215 174 -245 197 -30 23 -188 148 -350 277 -162 129 -309 246 -327 260 -18 14 -85 68 -150 121 -65 52 -208 167 -318 254 -110 87 -240 191 -290 230 -49 40 -156 123 -236 186 -216 169 -614 485 -694 551 -75 61 -249 198 -623 491 -48 37 -134 105 -192 151 -92 74 -228 181 -499 391 -43 33 -121 96 -175 140 -54 44 -155 124 -224 178 -70 54 -188 147 -262 206 -74 59 -153 121 -175 137 -22 16 -107 83 -189 149 -82 66 -208 165 -281 220 -73 55 -190 147 -259 205 -120 98 -233 187 -406 318 -41 31 -115 89 -165 128 -110 88 -171 135 -345 266 -74 56 -200 153 -280 215 -80 63 -178 139 -219 171 -41 31 -125 98 -186 147 -153 123 -464 361 -533 409 -31 22 -100 74 -152 115 -106 85 -143 113 -280 217 -52 40 -144 111 -205 158 -60 48 -164 128 -230 178 -66 51 -174 135 -240 188 -196 157 -334 264 -630 488 -154 117 -319 243 -366 280 -124 96 -542 417 -818 627 -130 99 -346 266 -480 370 -133 105 -322 250 -419 323 -195 146 -276 223 -312 298 -21 42 -25 63 -25 149 0 95 2 104 37 177 47 98 77 128 288 277 96 69 226 161 288 205 62 45 138 99 170 121 31 21 120 84 197 140 77 55 265 191 418 300 154 110 318 228 365 263 48 35 121 86 162 114 41 28 84 59 96 69 22 20 34 16 34 -11 0 -54 60 -131 259 -336 113 -117 294 -303 401 -415 107 -112 242 -251 300 -309 58 -58 182 -184 275 -280 94 -96 319 -326 500 -510 181 -184 395 -402 475 -485 416 -429 585 -601 1145 -1170 335 -341 679 -690 765 -775 249 -249 1389 -1408 1465 -1490 39 -41 115 -120 170 -175 55 -55 172 -174 260 -265 88 -91 336 -345 550 -565 363 -373 525 -538 1040 -1065 208 -212 480 -493 1280 -1320 258 -267 564 -582 680 -700 115 -118 259 -267 319 -330 60 -63 164 -171 230 -240 66 -69 179 -186 251 -260 241 -251 458 -474 635 -653 230 -234 321 -295 513 -346 213 -58 514 3 679 136 51 41 176 143 248 202 24 20 85 70 134 111 49 41 112 93 140 114 28 21 53 42 56 46 3 4 59 51 125 106 176 144 328 271 409 340 39 33 129 107 200 165 255 206 354 289 506 420 36 31 113 94 171 141 110 87 325 270 434 369 36 33 82 63 111 74 27 10 173 79 324 152 151 74 296 143 322 154 27 10 180 82 340 160 161 78 363 173 448 211 85 38 183 85 218 104 34 19 62 31 62 25 0 -5 -28 -31 -62 -59 -35 -27 -103 -87 -153 -132 -49 -46 -146 -131 -214 -189 -69 -58 -177 -153 -241 -211 -257 -233 -398 -359 -494 -444 -55 -49 -150 -134 -211 -190 -60 -56 -200 -180 -310 -276 -110 -96 -234 -207 -275 -246 -41 -38 -140 -128 -220 -199 -80 -71 -174 -156 -210 -189 -36 -34 -92 -86 -125 -116 -33 -31 -125 -114 -205 -184 -80 -71 -192 -173 -250 -226 -216 -198 -313 -286 -368 -334 -66 -56 -136 -120 -242 -221 -41 -39 -87 -80 -101 -91 -14 -11 -59 -49 -98 -84 -40 -36 -79 -69 -87 -73 -29 -16 -12 -27 41 -27 39 0 61 5 74 17 10 10 34 32 53 48 89 78 231 207 308 280 47 44 117 106 155 139 39 32 111 97 160 145 50 47 145 134 212 191 66 58 206 183 310 279 353 326 508 468 559 512 83 72 289 256 424 378 69 63 157 141 195 174 156 134 635 561 820 732 61 56 153 137 205 180 52 42 140 119 195 169 55 51 143 130 195 176 52 46 128 115 168 152 39 37 78 68 85 68 6 1 43 16 82 35 38 18 72 31 75 28 3 -2 -14 -21 -37 -41 -23 -20 -108 -95 -190 -167 -81 -71 -186 -166 -233 -211 -47 -44 -148 -136 -225 -205 -77 -68 -178 -160 -225 -204 -47 -44 -166 -152 -264 -240 -99 -88 -228 -205 -288 -260 -137 -126 -348 -316 -503 -453 -66 -58 -154 -137 -196 -176 -119 -111 -489 -444 -789 -709 -107 -95 -226 -201 -265 -237 -253 -233 -402 -368 -625 -564 -159 -141 -240 -217 -240 -228 0 -4 21 -8 47 -8 43 0 51 4 112 63 37 34 140 127 231 207 153 135 246 218 665 600 88 80 196 176 240 214 44 37 127 112 185 165 199 184 412 376 499 449 47 41 118 104 156 140 80 77 377 346 605 548 85 76 216 195 290 264 74 69 171 157 215 195 107 92 214 187 359 320 67 61 160 144 207 185 82 72 338 299 479 425 69 62 109 85 320 181 69 31 204 95 300 141 96 47 222 107 280 133 119 54 408 191 645 305 88 42 185 88 215 102 30 14 102 48 160 75 58 28 134 64 170 80 36 17 153 72 260 123 107 51 359 170 560 265 556 263 1004 478 1215 582 105 52 228 109 275 128 47 19 165 74 263 122 97 48 179 88 182 88 7 0 116 51 449 209 171 82 381 181 466 220 283 132 281 131 353 204 108 109 141 197 168 454 21 207 -26 359 -160 512 -31 36 -143 160 -250 275 -359 390 -526 573 -616 677 -22 25 -96 106 -164 180 -69 74 -141 152 -160 174 -104 116 -234 259 -301 330 -41 44 -156 170 -255 280 -99 109 -225 247 -280 305 -55 58 -145 155 -200 215 -112 123 -299 326 -539 584 -223 241 -285 309 -486 531 -96 106 -274 299 -396 429 -121 130 -261 281 -310 336 -49 55 -156 172 -239 260 -82 88 -204 221 -270 295 -66 74 -158 175 -205 225 -47 49 -146 157 -220 240 -74 82 -207 226 -295 320 -88 93 -297 321 -465 505 -399 439 -477 524 -590 644 -52 56 -128 139 -169 186 -41 47 -151 168 -245 269 -94 102 -236 255 -316 341 -80 85 -201 218 -270 293 -69 76 -188 207 -265 292 -77 84 -203 222 -279 307 -77 84 -179 196 -227 248 -327 357 -517 567 -602 663 -55 62 -131 146 -170 187 -40 41 -108 116 -151 165 -93 106 -225 251 -317 350 -36 38 -133 147 -216 240 -272 308 -376 395 -543 456 -132 48 -313 70 -430 53z m306 -109 c175 -44 296 -120 425 -267 95 -109 208 -234 344 -381 61 -66 157 -173 215 -237 58 -64 150 -166 205 -226 55 -60 151 -165 214 -234 63 -69 180 -197 261 -285 81 -88 160 -176 176 -195 16 -19 87 -98 159 -176 280 -303 334 -362 410 -449 44 -49 134 -148 200 -220 66 -71 140 -152 164 -180 24 -27 81 -88 125 -135 45 -47 130 -139 188 -205 58 -66 120 -133 138 -150 18 -16 85 -88 148 -160 64 -71 153 -168 197 -215 44 -47 132 -144 195 -215 63 -70 161 -178 216 -239 193 -210 617 -671 683 -741 36 -39 136 -146 221 -239 85 -93 211 -230 280 -305 69 -75 157 -172 195 -216 39 -44 115 -127 170 -185 120 -126 407 -437 496 -537 152 -170 340 -375 428 -468 122 -128 386 -414 571 -620 151 -168 323 -356 426 -465 34 -36 116 -126 184 -200 68 -74 151 -164 184 -200 34 -36 104 -112 156 -170 102 -113 297 -325 396 -430 34 -36 103 -112 154 -170 51 -58 134 -148 184 -200 51 -52 134 -142 186 -200 52 -58 133 -146 180 -195 95 -101 200 -217 376 -414 65 -74 153 -171 194 -216 263 -282 459 -503 483 -543 64 -110 94 -234 78 -331 -14 -90 -46 -149 -121 -223 -56 -56 -86 -76 -176 -119 -60 -28 -158 -75 -219 -104 -60 -29 -144 -69 -185 -88 -86 -40 -239 -112 -420 -199 -69 -33 -163 -78 -210 -100 -47 -22 -128 -61 -180 -85 -52 -25 -129 -61 -170 -80 -41 -20 -112 -53 -157 -74 -46 -21 -122 -58 -170 -80 -49 -23 -155 -74 -238 -114 -82 -40 -184 -88 -225 -107 -41 -20 -115 -55 -165 -78 -49 -23 -172 -82 -272 -131 -100 -49 -184 -89 -187 -89 -10 0 -317 -144 -446 -210 -41 -20 -109 -52 -150 -70 -114 -49 -156 -68 -265 -120 -208 -99 -303 -144 -385 -182 -133 -63 -232 -110 -405 -193 -88 -42 -173 -83 -190 -90 -213 -97 -305 -140 -505 -237 -129 -63 -251 -122 -270 -131 -19 -8 -83 -38 -142 -66 -60 -28 -156 -74 -215 -102 -60 -28 -162 -77 -228 -109 -66 -32 -145 -69 -175 -83 -30 -14 -99 -46 -154 -71 -54 -26 -124 -58 -156 -71 -31 -13 -143 -67 -248 -119 -106 -53 -194 -96 -197 -96 -7 0 -276 -126 -465 -218 -142 -69 -306 -146 -650 -304 -41 -19 -178 -85 -305 -145 -385 -184 -597 -281 -655 -297 -169 -48 -373 -34 -527 34 -185 83 -309 204 -403 390 -18 36 -54 97 -80 135 -26 39 -62 99 -80 135 -17 36 -63 117 -100 180 -73 124 -452 789 -515 905 -21 39 -57 102 -80 140 -23 39 -68 115 -100 170 -32 55 -67 116 -78 135 -11 19 -38 69 -60 110 -22 41 -52 93 -67 115 -15 22 -53 87 -85 145 -31 58 -81 141 -109 185 -29 44 -115 190 -191 325 -76 135 -169 297 -206 360 -37 63 -78 138 -92 165 -14 28 -85 154 -158 280 -73 127 -158 278 -189 337 -32 59 -62 113 -68 120 -6 7 -50 83 -100 168 -239 416 -316 547 -333 572 -11 14 -19 29 -19 32 0 3 -40 74 -90 156 -49 82 -90 152 -90 154 0 3 -15 31 -34 63 -18 32 -45 78 -58 103 -14 25 -49 83 -77 129 -29 47 -87 146 -128 220 -133 239 -271 475 -440 751 -22 36 -53 90 -70 120 -50 91 -166 289 -227 390 -70 115 -187 310 -286 480 -40 69 -98 166 -128 215 -30 50 -111 185 -180 300 -69 116 -155 260 -192 320 -37 61 -91 151 -120 200 -29 50 -83 137 -118 195 -36 57 -87 141 -112 185 -26 44 -71 118 -100 165 -29 47 -61 100 -71 118 -63 110 -233 394 -367 612 -52 85 -115 189 -140 230 -25 41 -80 131 -122 200 -42 69 -101 166 -130 215 -29 50 -74 124 -100 165 -27 41 -110 179 -186 305 -75 127 -155 256 -176 287 -21 32 -69 109 -107 170 -68 113 -184 302 -278 453 -27 44 -80 130 -118 190 -37 61 -85 137 -105 170 -21 33 -75 121 -120 195 -76 124 -106 172 -242 386 -87 136 -90 145 -86 253 4 120 19 153 112 247 62 61 82 75 156 103 88 34 114 44 153 60 12 6 56 20 97 32 41 12 140 43 220 69 239 79 640 207 720 231 41 12 203 64 360 116 157 52 310 101 340 109 60 16 687 219 815 265 44 15 105 35 135 43 30 7 159 48 285 89 127 41 331 107 455 147 363 114 388 123 770 248 201 66 529 172 730 237 201 64 410 132 465 150 282 92 870 283 1095 355 140 45 260 83 265 85 6 2 67 4 136 4 104 1 144 -4 225 -24z m-3135 -490 c46 -8 111 -25 145 -38 62 -25 224 -123 224 -136 0 -4 -91 -36 -202 -70 -221 -68 -582 -183 -913 -291 -115 -38 -262 -85 -326 -104 -63 -19 -142 -44 -175 -56 -82 -30 -542 -180 -754 -246 -96 -30 -218 -69 -270 -88 -106 -38 -473 -156 -486 -156 -25 0 158 96 426 223 147 70 425 204 655 317 99 48 227 110 285 138 58 28 249 121 425 207 176 86 341 165 367 176 26 10 79 34 117 54 154 77 312 100 482 70z m-4505 -2057 c-4 -13 -10 -84 -13 -158 -8 -193 -1 -217 114 -407 53 -87 115 -192 138 -233 47 -83 198 -331 226 -371 10 -14 40 -64 67 -110 28 -46 95 -158 151 -249 55 -91 120 -198 143 -238 24 -39 72 -116 106 -170 35 -53 102 -162 149 -242 47 -80 111 -185 141 -235 30 -49 106 -173 167 -275 62 -102 150 -243 195 -315 46 -71 104 -166 130 -210 98 -167 144 -242 193 -320 28 -44 71 -118 96 -165 26 -47 71 -125 102 -175 88 -141 186 -304 309 -510 62 -104 137 -226 165 -270 28 -44 109 -179 179 -300 71 -121 134 -227 141 -235 7 -8 41 -64 75 -125 35 -60 111 -191 170 -290 59 -99 154 -259 210 -355 56 -96 120 -202 140 -235 21 -33 61 -100 90 -150 29 -49 70 -117 90 -150 21 -33 57 -94 80 -135 23 -41 66 -113 95 -160 29 -47 88 -148 131 -224 100 -176 111 -195 199 -341 40 -66 109 -185 155 -265 45 -80 100 -173 122 -206 l39 -62 -11 -258 c-6 -143 -15 -351 -20 -464 -5 -113 -14 -302 -20 -420 -5 -118 -15 -325 -22 -460 -18 -354 -17 -440 5 -454 13 -9 25 -7 50 8 31 18 110 59 407 213 185 97 369 196 444 241 49 29 61 33 68 21 20 -32 98 -173 98 -175 0 -4 -146 -92 -215 -129 -38 -21 -88 -50 -110 -65 -22 -15 -69 -43 -105 -62 -57 -31 -107 -59 -185 -102 -154 -86 -235 -141 -235 -160 0 -18 37 -40 223 -133 122 -62 283 -144 357 -184 74 -39 221 -115 325 -169 105 -53 222 -114 260 -135 138 -75 447 -234 465 -240 21 -7 35 -28 105 -160 26 -49 55 -101 64 -115 9 -14 23 -38 31 -55 8 -16 36 -67 62 -113 27 -46 48 -86 48 -89 0 -3 8 -17 18 -31 11 -15 37 -61 59 -102 22 -41 85 -153 141 -248 56 -96 102 -175 102 -177 0 -2 41 -74 92 -161 112 -196 168 -295 168 -301 0 -3 8 -17 19 -31 10 -15 42 -71 70 -125 28 -53 71 -128 95 -165 24 -37 65 -107 92 -157 98 -185 168 -264 329 -372 106 -71 167 -103 194 -103 50 0 19 -26 -141 -121 -95 -56 -261 -155 -368 -219 -423 -253 -443 -262 -631 -268 -151 -5 -211 8 -348 73 -104 50 -221 152 -269 235 -36 62 -689 1047 -755 1140 -30 41 -88 127 -131 190 -42 63 -132 196 -200 295 -68 99 -184 270 -259 380 -75 110 -173 254 -219 320 -46 66 -115 165 -153 220 -37 55 -103 147 -145 205 -145 200 -296 416 -400 575 -88 133 -216 319 -329 475 -57 80 -156 222 -219 315 -63 94 -138 202 -167 240 -28 39 -80 111 -114 160 -34 50 -98 140 -141 200 -43 61 -122 175 -176 255 -54 80 -134 195 -178 255 -44 61 -120 169 -170 240 -49 72 -132 189 -183 260 -282 393 -345 483 -388 550 -22 34 -73 107 -112 161 -185 253 -371 510 -535 739 -98 138 -211 295 -251 350 -40 55 -106 147 -147 205 -41 58 -112 157 -159 221 -48 64 -131 178 -186 254 -55 76 -132 181 -171 234 -38 53 -93 130 -121 171 -28 41 -115 161 -192 265 -78 105 -163 219 -188 255 -26 36 -77 103 -113 150 -37 47 -88 117 -115 155 -27 39 -140 192 -250 340 -111 149 -220 297 -243 330 -65 93 -147 203 -570 767 -508 676 -477 636 -577 763 -47 61 -132 175 -189 255 -57 80 -124 170 -149 200 -211 255 -211 257 -212 385 0 84 4 108 24 153 41 90 148 172 321 245 19 8 61 27 93 41 32 14 60 26 62 26 2 0 28 11 57 24 29 13 100 43 158 66 58 23 134 55 170 72 36 16 99 43 140 60 41 16 93 38 115 48 22 10 76 32 120 50 87 34 112 45 195 82 30 14 111 49 180 78 69 29 149 63 178 76 29 13 55 24 57 24 5 0 21 7 145 63 25 11 63 27 85 37 22 9 74 33 115 53 41 19 100 45 130 57 62 24 145 61 205 90 52 25 59 24 51 -2z m104 -280 c17 -34 44 -80 60 -102 36 -53 131 -211 185 -306 23 -42 109 -181 190 -310 81 -129 171 -273 200 -320 28 -47 78 -126 111 -177 94 -145 148 -233 297 -478 76 -126 143 -234 147 -240 4 -5 30 -48 58 -95 27 -47 107 -179 179 -295 71 -115 144 -236 162 -268 18 -32 74 -124 123 -205 50 -81 112 -183 138 -227 89 -151 263 -440 310 -515 58 -91 306 -501 379 -625 29 -49 70 -117 91 -150 21 -33 94 -154 162 -270 69 -115 145 -244 170 -285 25 -41 159 -266 298 -500 139 -234 291 -488 338 -565 47 -77 99 -165 115 -195 16 -30 58 -102 92 -160 34 -58 88 -150 120 -205 66 -114 132 -226 197 -335 25 -41 78 -131 118 -200 40 -69 93 -158 117 -197 23 -40 43 -75 43 -77 0 -6 178 -314 200 -346 9 -14 36 -61 60 -105 24 -44 61 -109 83 -145 47 -75 167 -282 207 -355 69 -125 165 -294 190 -335 30 -48 63 -107 118 -210 46 -87 120 -217 147 -260 32 -50 157 -264 195 -335 18 -33 50 -89 70 -125 21 -36 55 -96 75 -135 21 -38 63 -108 93 -154 30 -47 73 -121 96 -165 23 -45 69 -126 102 -181 33 -55 81 -138 107 -185 26 -47 59 -106 75 -131 53 -88 130 -222 230 -399 14 -25 36 -62 49 -82 12 -21 23 -40 23 -43 0 -3 20 -38 44 -78 43 -71 371 -645 436 -762 75 -137 235 -414 270 -470 21 -33 66 -109 100 -170 156 -274 197 -329 309 -420 197 -159 444 -223 691 -181 124 21 128 23 365 136 154 74 217 103 345 160 47 21 162 75 255 122 94 46 199 97 235 113 36 16 148 69 250 118 102 49 257 122 345 162 88 40 255 119 370 175 116 56 257 122 315 147 58 25 209 96 335 158 127 62 275 132 330 155 55 23 201 92 325 152 124 61 263 127 310 148 47 20 182 86 300 145 118 59 235 115 260 125 25 10 102 45 171 78 70 34 196 93 280 132 219 102 684 322 816 386 131 63 217 103 368 170 61 26 196 90 300 142 105 52 249 120 320 152 72 32 238 111 370 175 132 64 266 128 298 141 33 14 174 81 315 150 142 69 311 150 377 179 117 52 193 88 539 254 93 44 171 81 174 81 3 0 134 64 291 143 217 108 297 153 338 191 60 54 65 49 25 -32 -48 -100 -110 -150 -296 -241 -90 -45 -167 -81 -171 -81 -4 0 -76 -33 -159 -74 -83 -41 -187 -91 -231 -111 -44 -21 -120 -57 -170 -80 -49 -23 -115 -54 -145 -68 -30 -13 -111 -52 -180 -85 -179 -86 -316 -150 -385 -182 -33 -15 -107 -50 -165 -78 -366 -175 -550 -262 -557 -262 -3 0 -124 -58 -269 -130 -144 -71 -265 -130 -268 -130 -3 0 -119 -54 -258 -121 -249 -119 -294 -140 -453 -214 -44 -20 -134 -63 -200 -95 -154 -74 -445 -211 -510 -240 -27 -12 -119 -56 -203 -96 -84 -41 -155 -74 -158 -74 -3 0 -75 -35 -162 -78 -86 -43 -186 -91 -222 -106 -36 -16 -148 -69 -249 -117 -101 -49 -185 -89 -187 -89 -7 0 -277 -127 -469 -220 -115 -56 -264 -127 -330 -157 -66 -31 -192 -90 -281 -133 -88 -43 -194 -92 -235 -110 -41 -18 -132 -60 -204 -95 -451 -217 -594 -285 -795 -378 -124 -58 -358 -169 -520 -247 -162 -78 -337 -162 -389 -186 -52 -25 -128 -59 -169 -75 -41 -16 -95 -44 -120 -61 -102 -71 -311 -108 -485 -88 -212 25 -343 87 -498 237 -96 94 -112 115 -189 250 -46 81 -118 207 -160 278 -42 72 -114 198 -160 280 -46 83 -135 240 -199 350 -63 110 -175 308 -249 440 -74 132 -150 267 -169 300 -34 58 -53 91 -109 192 -14 26 -38 65 -53 88 -15 22 -63 103 -106 180 -43 77 -106 187 -140 245 -54 92 -207 363 -298 530 -17 30 -42 73 -57 95 -29 43 -210 345 -210 350 0 2 -41 77 -91 167 -51 90 -103 183 -117 208 -27 50 -31 57 -129 225 -38 66 -107 188 -153 270 -46 83 -108 191 -138 240 -66 108 -152 255 -152 260 0 2 -41 74 -92 161 -50 88 -107 188 -128 224 -20 36 -66 115 -102 175 -117 198 -418 715 -418 721 0 2 -31 52 -68 111 -38 60 -88 144 -112 188 -24 44 -55 98 -70 120 -14 22 -66 110 -115 195 -48 85 -122 211 -165 280 -42 69 -123 204 -180 300 -57 96 -127 214 -157 262 -29 48 -53 90 -53 92 0 8 -97 173 -137 233 -21 32 -52 83 -68 113 -15 30 -56 98 -90 150 -33 52 -94 154 -135 225 -41 72 -123 211 -184 310 -60 99 -138 230 -174 290 -36 61 -89 149 -119 197 -29 48 -53 90 -53 92 0 3 -25 44 -55 93 -30 48 -76 126 -102 171 -27 46 -79 132 -117 190 -38 59 -104 166 -146 237 -121 206 -228 383 -290 480 -51 81 -87 140 -255 420 -26 44 -77 125 -113 180 -36 55 -79 125 -95 155 -17 30 -51 87 -77 125 -26 39 -69 108 -95 155 -64 114 -130 223 -175 290 -20 30 -93 147 -160 260 -68 113 -147 241 -175 285 -44 69 -116 191 -231 390 -51 90 -80 225 -48 225 2 0 17 -28 34 -62z m-2683 -1334 c46 -62 317 -419 371 -489 22 -27 115 -153 208 -280 92 -126 193 -261 224 -300 96 -119 359 -470 704 -942 104 -142 246 -334 316 -428 69 -93 147 -199 173 -235 26 -36 64 -87 86 -115 40 -51 229 -308 336 -456 34 -46 115 -158 180 -248 66 -90 194 -267 285 -392 91 -126 239 -331 330 -456 91 -124 228 -315 305 -424 77 -108 189 -263 249 -345 60 -81 185 -256 279 -388 263 -371 497 -699 557 -781 68 -92 236 -329 290 -410 30 -44 90 -129 135 -190 45 -60 112 -155 149 -210 138 -205 263 -384 322 -461 33 -43 84 -115 114 -159 125 -189 267 -395 315 -460 28 -38 72 -99 96 -135 25 -36 74 -105 109 -155 35 -49 124 -180 198 -290 75 -110 183 -267 242 -350 58 -82 154 -220 212 -305 58 -85 138 -202 178 -260 41 -58 118 -170 173 -250 55 -80 119 -170 142 -200 23 -30 119 -170 214 -310 95 -140 214 -316 266 -390 142 -204 164 -238 507 -755 311 -471 343 -519 470 -699 78 -111 170 -190 291 -249 126 -62 175 -72 347 -71 145 0 185 7 300 48 25 9 50 18 55 19 15 3 18 -82 4 -99 -12 -14 -78 -47 -144 -72 -103 -38 -297 -44 -421 -12 -43 11 -121 41 -173 66 -159 78 -199 125 -535 634 -158 239 -314 473 -346 520 -33 47 -115 168 -184 270 -269 401 -493 728 -538 785 -26 33 -88 123 -138 200 -50 77 -141 213 -203 302 -62 90 -150 219 -197 287 -114 166 -371 534 -468 671 -43 61 -157 222 -253 359 -161 231 -211 302 -428 616 -44 63 -104 149 -135 190 -30 41 -85 120 -123 175 -37 55 -97 141 -133 190 -37 50 -101 142 -144 205 -175 259 -347 504 -600 856 -72 100 -158 221 -191 269 -33 48 -94 133 -136 189 -41 55 -99 137 -129 181 -30 44 -75 107 -100 140 -25 33 -75 103 -110 155 -35 52 -103 147 -150 210 -48 63 -110 149 -138 190 -29 41 -106 149 -172 240 -66 91 -160 221 -208 289 -48 68 -115 161 -149 207 -33 45 -80 111 -104 146 -24 34 -65 90 -91 123 -27 32 -96 127 -155 210 -138 193 -264 367 -381 522 -50 68 -111 152 -134 186 -23 34 -78 109 -123 167 -45 58 -107 141 -138 185 -116 164 -320 440 -476 644 -57 75 -134 178 -170 229 -36 52 -106 147 -156 212 -94 123 -143 189 -340 455 -66 89 -145 196 -176 236 -96 126 -282 379 -356 485 -40 55 -124 166 -187 245 -119 148 -136 180 -151 286 -8 55 -5 53 52 -23z m-118 -24 c18 -83 40 -124 142 -260 51 -69 129 -175 173 -236 99 -136 212 -288 467 -628 107 -143 210 -283 229 -311 18 -27 73 -102 121 -165 130 -171 338 -451 490 -660 74 -102 166 -226 206 -277 39 -51 156 -208 259 -350 103 -142 228 -312 279 -378 50 -66 162 -219 248 -340 87 -121 220 -305 297 -410 76 -104 177 -244 225 -310 130 -182 332 -461 550 -760 124 -170 272 -377 368 -515 94 -135 300 -423 476 -665 75 -104 182 -255 236 -335 54 -80 138 -199 185 -265 48 -66 140 -196 205 -290 284 -406 455 -653 530 -760 44 -63 127 -181 185 -262 57 -82 148 -211 200 -288 53 -77 131 -189 173 -250 42 -60 103 -148 134 -194 32 -46 97 -138 144 -205 194 -275 401 -573 529 -761 75 -110 178 -261 230 -335 161 -232 289 -418 420 -610 69 -102 171 -250 226 -330 54 -80 184 -274 289 -431 104 -158 249 -373 320 -479 72 -106 162 -240 202 -298 94 -141 150 -202 237 -263 111 -79 177 -108 331 -144 161 -39 428 4 572 92 74 45 87 53 278 163 88 50 165 95 170 99 6 5 42 25 80 46 39 20 111 63 160 94 346 221 581 355 611 349 13 -3 -46 -54 -272 -233 -34 -27 -109 -87 -166 -132 -57 -46 -133 -106 -169 -135 -36 -29 -117 -98 -180 -154 -63 -55 -161 -138 -218 -185 -125 -101 -340 -275 -517 -419 -71 -57 -169 -137 -219 -177 -168 -136 -256 -168 -465 -168 -115 0 -145 4 -204 23 -89 30 -148 60 -213 109 -60 45 -495 487 -918 933 -159 168 -380 397 -490 510 -111 113 -315 324 -455 470 -582 606 -692 721 -830 860 -80 81 -273 279 -430 440 -157 161 -384 393 -505 514 -121 122 -326 332 -455 466 -129 135 -267 277 -305 315 -39 39 -225 230 -415 425 -190 195 -469 480 -620 634 -151 154 -329 336 -395 405 -66 68 -250 256 -410 416 -475 477 -1145 1155 -1380 1395 -206 211 -375 383 -1195 1215 -179 182 -417 425 -529 540 -113 116 -329 336 -480 490 -152 154 -424 433 -606 619 -181 186 -423 433 -538 549 -254 258 -272 286 -272 437 0 85 3 102 31 160 48 101 118 169 258 252 598 354 1748 1041 1956 1168 74 46 169 103 210 128 41 25 102 62 135 83 33 21 62 35 66 31 3 -4 11 -32 18 -62z m-2434 -2280 c132 -135 425 -434 650 -664 226 -231 548 -559 716 -730 168 -171 593 -603 944 -961 351 -357 815 -828 1029 -1045 1111 -1123 1886 -1910 2181 -2215 180 -187 488 -502 684 -700 196 -198 540 -551 766 -785 225 -234 565 -582 755 -775 190 -192 399 -406 465 -475 66 -69 210 -217 320 -330 111 -113 257 -264 325 -336 180 -188 858 -893 1030 -1069 80 -82 184 -190 230 -240 47 -49 175 -182 286 -295 110 -113 267 -275 348 -360 152 -159 227 -220 331 -270 174 -82 334 -108 471 -75 77 18 207 61 258 86 22 10 40 18 41 16 1 -1 5 -19 9 -39 6 -33 3 -41 -26 -68 -41 -40 -132 -83 -233 -111 -145 -40 -353 -27 -480 31 -155 71 -289 201 -1434 1396 -53 55 -231 239 -396 410 -166 170 -362 372 -436 449 -74 77 -220 228 -324 335 -105 107 -242 249 -305 315 -159 166 -767 791 -1045 1075 -127 129 -282 289 -344 355 -130 136 -506 521 -870 890 -135 138 -305 311 -376 385 -237 246 -1351 1380 -1965 2000 -151 153 -374 381 -495 506 -120 126 -267 276 -326 334 -115 113 -553 559 -1259 1280 -244 250 -490 500 -545 555 -55 55 -228 233 -384 395 -157 162 -391 403 -521 535 -130 132 -248 261 -263 286 -28 48 -71 163 -59 157 4 -2 115 -113 247 -248z m9745 -4182 c19 -34 58 -98 85 -142 l50 -81 -2 -150 c-2 -82 -7 -238 -13 -345 -5 -107 -11 -289 -12 -405 -3 -239 -3 -240 74 -187 24 16 93 54 153 84 61 30 148 76 194 101 46 26 85 47 86 47 3 0 115 -197 115 -203 0 -3 -37 -25 -82 -50 -46 -24 -100 -54 -121 -66 -22 -12 -121 -64 -220 -115 -100 -52 -233 -121 -295 -155 -62 -33 -118 -61 -124 -61 -12 0 -4 399 12 625 15 211 55 1046 54 1118 -1 26 2 47 5 47 3 0 22 -28 41 -62z m267 -460 c23 -40 50 -89 61 -108 11 -19 69 -122 131 -228 61 -106 111 -197 111 -201 0 -13 -29 -30 -271 -160 -53 -28 -101 -51 -108 -51 -9 0 -11 37 -6 153 15 399 29 667 35 667 3 0 24 -33 47 -72z m702 -1225 c24 -49 50 -96 58 -105 13 -14 13 -20 3 -33 -7 -8 -17 -15 -22 -15 -5 0 -55 -31 -111 -68 -56 -38 -131 -84 -167 -104 -104 -57 -106 -80 -8 -129 35 -17 144 -78 243 -134 178 -101 427 -242 475 -268 23 -13 141 -194 156 -239 6 -19 2 -18 -47 9 -30 17 -135 72 -234 123 -205 106 -306 159 -320 170 -5 4 -100 54 -210 110 -441 226 -605 313 -605 321 0 9 71 55 185 119 227 129 463 267 505 297 25 18 48 32 51 33 3 0 25 -39 48 -87z m152 -270 c18 -32 44 -76 59 -98 15 -22 46 -75 69 -118 23 -42 66 -117 96 -165 29 -48 49 -89 44 -91 -6 -2 -49 23 -96 54 -47 31 -105 68 -129 81 -24 13 -65 36 -91 50 -27 14 -52 30 -58 34 -5 4 -55 31 -110 60 -132 70 -136 74 -94 96 19 9 53 30 77 46 62 42 175 107 189 107 6 1 26 -25 44 -56z m3199 -3332 c0 -5 -31 -32 -69 -59 -37 -28 -104 -83 -148 -124 -43 -40 -166 -146 -273 -235 -107 -89 -286 -237 -396 -330 -111 -92 -259 -215 -330 -273 -168 -138 -351 -289 -515 -425 -72 -60 -167 -137 -210 -171 -43 -34 -104 -84 -136 -111 -32 -28 -68 -55 -79 -61 -21 -11 -22 -9 -26 30 l-4 41 119 103 c66 57 169 143 231 191 61 48 159 128 217 178 283 242 555 468 764 635 127 101 281 226 343 279 218 185 250 208 343 256 51 26 107 56 124 66 35 20 45 23 45 10z m-722 -191 c35 0 43 -14 15 -25 -10 -3 -79 -43 -153 -89 -74 -45 -200 -122 -280 -169 -80 -48 -183 -111 -230 -140 -100 -62 -344 -197 -356 -197 -11 0 -2 89 9 98 18 16 477 294 567 345 145 81 268 155 298 177 17 14 30 16 60 9 20 -5 52 -9 70 -9z',
                  'M17672 17861 c-45 -41 -43 -88 6 -113 102 -51 170 -100 240 -173 119 -123 165 -235 164 -392 -1 -112 8 -127 92 -149 69 -18 85 -9 104 55 17 55 15 226 -3 296 -50 191 -184 348 -381 447 -131 65 -178 71 -222 29z m120 -48 c145 -57 303 -195 364 -318 46 -93 63 -170 64 -287 0 -90 -2 -98 -19 -98 -37 0 -51 27 -51 99 0 202 -111 379 -332 528 -96 64 -105 73 -91 86 9 10 18 9 65 -10z',
                  'M17552 17723 c-23 -9 -44 -63 -37 -95 6 -27 5 -29 -11 -20 -27 15 -73 -5 -81 -36 -7 -30 25 -62 63 -62 14 0 46 -11 72 -24 26 -13 58 -27 72 -31 101 -32 189 -153 190 -262 0 -38 -10 -46 -43 -34 -20 8 -25 18 -30 64 -3 30 -12 68 -20 83 -19 36 -86 114 -97 114 -5 0 5 -33 22 -72 28 -64 32 -84 30 -155 0 -53 3 -85 11 -91 7 -5 73 -14 147 -20 132 -11 135 -11 153 9 38 46 16 239 -39 340 -87 159 -317 326 -402 292z m70 -71 c2 -5 36 -30 76 -56 142 -94 237 -238 249 -381 l6 -75 -37 0 -36 0 0 60 c0 90 -32 163 -104 238 -58 61 -121 110 -159 125 -15 6 -16 10 -5 27 11 16 10 22 -6 33 -11 8 -16 19 -12 25 8 14 23 16 28 4z',
                  'M17309 17469 c-43 -47 -38 -69 26 -113 30 -21 70 -56 90 -77 32 -36 35 -44 35 -99 0 -56 2 -61 26 -70 14 -6 50 -10 79 -10 68 0 75 11 75 117 0 137 -32 195 -138 251 -84 45 -152 45 -193 1z m129 -45 c85 -35 142 -119 142 -209 0 -56 0 -56 -27 -53 -26 3 -28 6 -31 57 -3 50 -6 56 -65 115 -34 33 -71 66 -81 72 -21 11 -14 34 10 34 8 0 31 -7 52 -16z',
                  'M16080 16682 c-262 -89 -650 -216 -780 -256 -164 -50 -229 -113 -230 -221 0 -65 57 -153 317 -485 64 -83 191 -255 258 -350 151 -216 266 -361 308 -387 111 -71 237 -83 369 -37 40 14 100 33 133 43 84 26 216 71 385 131 80 29 172 60 205 70 220 67 300 101 342 144 48 50 68 109 58 173 -6 45 -59 122 -181 269 -32 39 -90 110 -129 158 -38 49 -97 120 -129 159 -184 218 -329 398 -418 517 -50 67 -162 121 -260 127 -68 4 -84 0 -248 -55z m361 -49 c44 -23 73 -51 156 -153 101 -123 116 -150 89 -150 -8 0 -99 -28 -202 -62 l-188 -61 -21 28 c-11 15 -76 100 -143 188 -122 158 -131 176 -84 177 14 0 136 36 167 50 11 5 54 9 96 9 63 1 84 -3 130 -26z m-401 -170 c41 -53 100 -128 131 -166 l56 -70 -31 -60 c-27 -52 -38 -63 -90 -89 -54 -27 -65 -29 -111 -22 -27 4 -80 8 -117 8 l-68 1 -54 72 c-30 40 -67 89 -83 110 -46 60 -133 183 -133 188 0 3 6 5 14 5 8 0 47 12 88 26 40 14 117 38 170 54 53 15 104 33 114 38 26 15 32 10 114 -95z m-473 -150 c43 -60 104 -141 136 -182 32 -40 57 -80 55 -88 -2 -9 -57 -34 -138 -64 -74 -27 -157 -58 -185 -70 -27 -11 -54 -21 -59 -22 -14 -3 -201 232 -222 279 -27 63 18 138 99 168 23 9 83 31 132 49 50 19 93 35 97 36 4 0 42 -47 85 -106z m1236 -91 c31 -43 66 -88 77 -100 17 -18 27 -42 18 -42 -2 0 -70 -23 -151 -50 -208 -70 -204 -71 -302 42 -44 51 -80 96 -80 101 0 9 335 124 365 126 8 0 41 -34 73 -77z m-501 -64 c8 -7 46 -49 83 -93 37 -44 86 -98 109 -121 66 -66 194 -240 183 -250 -3 -3 -56 -8 -117 -10 -61 -2 -119 -8 -128 -13 -9 -4 -33 -11 -54 -15 -35 -6 -73 -41 -121 -110 -29 -42 -49 -33 -106 50 -29 41 -79 103 -110 137 -32 34 -90 110 -130 170 -82 123 -81 128 29 107 82 -15 125 -10 194 25 54 28 81 53 108 104 18 33 35 38 60 19z m722 -207 c42 -49 76 -91 76 -94 0 -3 -60 -26 -132 -51 -73 -26 -155 -56 -182 -67 -65 -25 -67 -25 -98 24 -14 23 -45 68 -67 100 -44 61 -45 77 -5 77 13 0 32 4 42 9 40 20 72 32 156 55 49 14 91 28 94 31 18 18 49 -5 116 -84z m-1222 32 c29 -34 136 -213 130 -216 -4 -3 -41 -14 -82 -26 -41 -13 -125 -40 -187 -62 -61 -21 -115 -39 -120 -39 -4 0 -23 25 -41 55 -18 30 -49 76 -68 101 -35 45 -35 63 0 64 17 0 244 89 292 114 59 30 57 30 76 9z m1444 -295 c117 -146 139 -185 130 -234 -14 -70 -61 -102 -239 -160 l-89 -28 -34 39 c-19 22 -55 67 -79 100 -25 33 -79 103 -120 156 -41 54 -75 101 -75 106 0 4 28 19 63 31 96 36 270 103 292 112 37 16 44 10 151 -122z m-1254 15 c59 -65 148 -194 136 -198 -96 -36 -384 -125 -394 -121 -17 7 -165 207 -161 219 3 11 342 122 388 126 3 1 17 -11 31 -26z m757 -138 c185 -240 242 -317 239 -320 -2 -3 -97 -35 -211 -72 l-207 -69 -39 41 c-37 39 -162 198 -228 290 l-31 45 39 60 c45 67 47 69 98 83 30 8 228 25 267 23 7 -1 40 -37 73 -81z m-452 -201 c184 -245 203 -269 203 -275 0 -4 -28 -16 -62 -28 -35 -12 -72 -26 -83 -31 -131 -59 -261 -50 -367 26 -47 33 -213 257 -205 278 3 6 33 20 68 30 35 10 127 40 204 66 77 26 143 48 147 49 4 0 46 -51 95 -115z',
                  'M11495 15952 c-6 -5 -32 -15 -58 -22 -57 -15 -77 -32 -77 -65 0 -32 -43 -81 -108 -122 -58 -37 -71 -57 -54 -82 6 -9 25 -40 42 -69 17 -29 37 -55 44 -58 16 -6 66 17 113 52 48 36 30 55 173 -181 37 -61 79 -133 93 -162 44 -85 42 -85 149 -51 51 17 99 31 106 34 7 2 17 14 23 26 9 20 1 38 -56 133 -37 61 -80 136 -97 169 -28 56 -73 128 -197 316 -54 82 -76 100 -96 82z m120 -259 c60 -98 129 -216 155 -263 25 -47 54 -98 65 -113 15 -24 16 -30 4 -38 -16 -10 -90 -32 -94 -27 -1 2 -31 50 -65 108 -35 58 -80 130 -101 161 -21 31 -50 78 -65 105 -58 104 -53 102 -136 33 l-61 -51 -18 24 c-27 34 -24 40 31 81 55 41 90 89 90 124 0 14 7 23 23 26 62 12 59 15 172 -170z',
                  'M17902 9998 c-6 -8 -15 -147 -22 -333 -6 -176 -14 -354 -17 -396 l-5 -77 163 -81 c90 -45 185 -96 211 -112 79 -51 82 -47 90 124 3 82 9 151 12 155 9 9 90 -33 324 -166 114 -65 239 -136 277 -157 39 -21 86 -47 105 -58 48 -27 105 -59 170 -94 30 -17 91 -51 136 -75 44 -25 129 -69 187 -99 59 -30 107 -57 107 -60 0 -4 -28 -18 -62 -32 -35 -14 -143 -64 -242 -111 -98 -47 -182 -86 -186 -86 -7 0 -219 116 -290 159 -60 37 -202 115 -455 251 -115 62 -275 150 -355 195 -80 45 -197 110 -260 145 -63 35 -200 110 -305 168 -104 57 -270 147 -368 198 -97 52 -186 99 -196 106 -16 10 -23 9 -39 -5 -16 -15 -20 -37 -26 -160 -3 -78 -11 -216 -16 -307 -6 -91 -15 -246 -20 -345 -5 -99 -14 -272 -20 -385 -6 -113 -15 -290 -20 -395 -6 -104 -15 -255 -20 -335 -6 -80 -14 -233 -19 -340 -5 -107 -15 -295 -21 -418 -12 -223 -9 -252 21 -252 11 0 145 65 374 182 94 47 193 96 220 108 138 62 890 442 897 453 10 19 21 870 11 882 -4 6 -46 30 -93 53 -143 73 -305 158 -328 173 -14 9 -25 10 -31 4 -5 -6 -14 -120 -20 -255 -6 -135 -16 -299 -21 -365 -6 -66 -10 -140 -10 -165 l0 -45 -246 -123 c-136 -68 -247 -122 -249 -120 -3 3 19 517 34 818 6 107 16 296 22 420 6 124 13 227 15 229 5 5 37 -10 189 -92 55 -29 183 -97 285 -151 102 -54 196 -106 210 -116 14 -9 57 -34 95 -55 39 -21 88 -49 110 -62 22 -13 67 -37 100 -54 33 -17 89 -48 125 -69 36 -20 110 -61 165 -90 55 -29 129 -70 165 -90 36 -21 108 -59 160 -85 52 -26 106 -55 120 -65 48 -33 141 -80 159 -80 10 0 45 14 79 30 34 17 64 30 66 30 2 0 50 22 107 48 153 72 198 92 205 92 3 0 53 23 111 50 58 28 107 50 109 50 2 0 65 30 141 66 76 37 174 83 218 104 44 20 132 62 195 92 63 31 125 58 136 62 12 4 29 15 38 25 33 36 56 21 -449 296 -82 45 -211 115 -285 155 -74 40 -214 117 -310 170 -96 54 -321 175 -500 270 -179 95 -388 207 -465 250 -484 268 -656 360 -668 360 -8 0 -19 -6 -25 -12z m283 -224 c110 -58 213 -114 230 -124 16 -10 86 -47 155 -82 69 -35 145 -76 170 -90 25 -14 88 -48 140 -75 52 -28 138 -74 190 -103 127 -70 181 -100 265 -145 39 -21 75 -42 81 -46 6 -5 59 -33 117 -63 58 -30 137 -72 174 -94 37 -21 127 -70 198 -107 72 -37 157 -82 190 -100 33 -18 96 -52 140 -75 44 -24 106 -58 138 -77 32 -18 62 -33 66 -33 5 0 14 -6 20 -13 8 -11 -11 -24 -97 -65 -466 -221 -639 -302 -644 -302 -3 0 -70 -31 -149 -69 -79 -38 -195 -91 -257 -119 l-112 -50 -48 25 c-26 14 -94 52 -152 83 -58 32 -190 104 -295 160 -104 57 -244 133 -310 170 -121 68 -398 221 -490 270 -27 15 -90 49 -140 75 -49 26 -135 74 -190 105 -178 101 -312 168 -322 162 -19 -13 -29 -140 -52 -677 -5 -115 -15 -307 -21 -425 -16 -287 -27 -592 -22 -607 2 -7 9 -13 15 -13 11 0 137 63 251 126 33 19 137 71 229 116 125 61 169 87 171 102 8 38 26 489 26 619 0 99 3 127 13 127 8 0 17 -3 21 -7 4 -5 69 -40 144 -79 l137 -70 -4 -378 c-2 -207 -4 -387 -5 -399 -1 -23 -139 -95 -881 -456 -310 -151 -318 -156 -403 -201 -34 -18 -65 -31 -68 -28 -3 3 2 129 11 279 8 151 22 400 30 554 8 154 20 352 25 440 11 164 33 605 50 985 15 347 22 450 32 450 5 0 24 -11 41 -24 18 -13 88 -52 157 -87 69 -34 148 -76 175 -92 28 -16 118 -64 200 -107 83 -43 267 -143 410 -222 143 -80 289 -160 325 -178 36 -18 97 -51 135 -75 76 -45 139 -80 370 -203 83 -43 174 -93 203 -111 29 -17 55 -31 58 -31 3 0 32 -18 64 -40 59 -40 60 -40 86 -24 14 10 71 39 127 65 354 163 478 226 484 245 2 7 -78 57 -179 112 -186 102 -477 263 -623 344 -147 83 -489 270 -599 330 -89 48 -112 56 -122 46 -8 -9 -15 -64 -20 -160 -4 -82 -7 -148 -8 -148 -6 0 -264 135 -275 143 -11 10 -13 45 -7 197 11 308 19 450 25 450 4 0 96 -48 206 -106z',
                  'M26683 8084 c-72 -33 -73 -34 -73 -72 0 -54 -17 -98 -46 -117 -40 -26 -27 -70 44 -147 32 -34 40 -35 87 -3 20 14 42 24 47 23 10 -4 128 -145 321 -385 45 -56 87 -102 92 -102 24 -2 210 87 213 101 2 9 -14 36 -35 60 -21 24 -72 86 -113 137 -41 51 -104 128 -140 171 -85 101 -227 274 -269 328 -18 23 -38 42 -44 41 -7 0 -45 -16 -84 -35z m129 -121 c31 -38 84 -102 119 -144 196 -235 318 -385 319 -394 2 -10 -67 -54 -85 -54 -5 0 -25 19 -42 42 -35 45 -149 185 -281 346 -46 56 -87 101 -91 101 -5 0 -25 -13 -46 -30 -45 -36 -49 -36 -69 -8 -13 18 -14 24 -2 37 23 27 46 79 46 105 0 23 41 65 65 66 6 0 36 -30 67 -67z',
                  'M20825 8045 c-318 -154 -576 -280 -775 -377 -118 -58 -269 -131 -334 -162 l-119 -56 6 -78 c3 -42 20 -207 37 -367 41 -382 46 -430 64 -560 14 -107 26 -208 47 -390 6 -49 19 -155 29 -235 30 -228 64 -589 57 -596 -3 -3 -18 2 -34 13 -15 11 -66 39 -113 63 -47 24 -107 56 -133 72 -26 15 -50 28 -53 28 -3 0 -18 8 -32 18 -15 11 -58 36 -97 57 -149 80 -202 110 -248 137 -26 15 -50 28 -52 28 -2 0 -42 23 -90 50 -48 28 -88 50 -90 50 -2 0 -42 23 -90 50 -48 28 -88 50 -90 50 -2 0 -59 32 -127 71 -67 39 -145 82 -173 96 -27 14 -96 54 -152 90 -57 35 -151 89 -210 119 -60 31 -110 58 -111 59 -2 2 50 30 115 63 65 32 188 95 274 140 86 45 162 82 168 82 7 0 58 -26 114 -58 56 -32 145 -79 197 -106 52 -27 100 -52 105 -56 10 -7 97 -53 360 -190 77 -40 156 -84 175 -97 40 -27 68 -30 77 -8 9 25 -29 489 -41 502 -6 6 -29 21 -51 34 -196 111 -268 150 -383 210 -73 38 -149 79 -170 92 -33 21 -82 47 -312 169 -30 16 -60 34 -67 39 -8 7 -40 -3 -108 -36 -53 -25 -138 -65 -188 -89 -51 -24 -220 -106 -377 -183 -157 -78 -428 -211 -602 -296 -372 -182 -367 -177 -245 -241 39 -22 122 -67 182 -101 61 -34 171 -96 245 -137 417 -232 511 -284 570 -318 36 -20 119 -66 185 -102 178 -96 551 -301 700 -383 72 -40 162 -89 200 -110 39 -21 113 -61 165 -90 52 -29 140 -76 195 -105 55 -29 129 -70 165 -90 36 -21 110 -61 165 -90 55 -29 164 -89 243 -132 79 -44 169 -91 200 -105 31 -15 87 -44 124 -66 66 -37 69 -38 93 -23 30 20 30 20 5 199 -11 78 -24 187 -30 242 -5 55 -21 186 -34 290 -14 105 -30 242 -36 305 -11 121 -22 207 -46 355 -7 50 -21 162 -29 250 -9 88 -27 243 -40 345 -31 232 -72 581 -81 683 -5 62 -4 77 7 77 8 0 77 32 154 71 276 141 318 160 326 152 5 -5 16 -59 24 -120 8 -61 21 -153 29 -205 40 -244 66 -410 76 -483 6 -44 17 -114 25 -155 13 -67 75 -469 75 -484 0 -15 -40 4 -257 125 -30 17 -64 29 -76 27 -27 -4 -28 -19 -4 -258 9 -96 18 -191 20 -210 2 -33 7 -37 82 -76 44 -23 163 -86 265 -141 102 -55 241 -128 310 -163 69 -35 158 -83 199 -108 63 -38 76 -43 97 -33 29 13 31 42 10 157 -8 44 -31 183 -51 309 -20 127 -56 345 -80 485 -45 256 -133 793 -265 1600 -39 239 -75 445 -80 458 -14 33 -41 27 -185 -43z m127 -100 c4 -28 22 -144 38 -260 17 -115 40 -259 51 -320 10 -60 39 -231 64 -380 25 -148 51 -308 59 -355 8 -47 36 -215 61 -375 41 -253 95 -578 155 -935 10 -58 16 -108 13 -113 -2 -4 -16 1 -31 11 -15 10 -88 49 -162 87 -137 69 -178 91 -355 187 -55 30 -128 70 -163 89 -34 19 -64 41 -67 49 -9 30 -45 313 -41 318 5 5 196 -91 279 -140 27 -16 59 -28 71 -26 29 4 28 38 -17 303 -21 121 -42 252 -48 290 -6 39 -19 117 -29 175 -10 58 -28 173 -40 255 -58 391 -107 659 -121 668 -11 7 -100 -33 -325 -144 -170 -84 -311 -155 -313 -156 -2 -2 8 -103 22 -225 14 -123 29 -257 32 -298 3 -41 15 -145 26 -230 43 -338 82 -655 104 -855 28 -240 70 -592 85 -710 23 -173 38 -330 32 -336 -7 -6 -77 30 -337 170 -121 66 -167 90 -310 166 -60 32 -139 74 -175 95 -92 53 -181 100 -370 197 -91 47 -185 98 -210 113 -59 36 -230 135 -300 173 -30 16 -73 40 -95 52 -22 13 -94 51 -160 85 -66 35 -139 73 -162 86 -24 13 -64 36 -90 50 -27 15 -91 52 -143 82 -52 30 -147 82 -210 115 -63 33 -133 72 -155 87 -37 24 -98 58 -375 203 -52 27 -106 58 -120 67 -14 9 -33 20 -43 23 -45 16 -13 35 433 252 526 256 769 374 868 424 l104 51 51 -28 c29 -16 93 -51 142 -77 85 -45 414 -225 555 -304 36 -20 92 -50 125 -66 l60 -31 14 -168 c7 -92 11 -170 7 -173 -5 -5 -73 26 -141 65 -35 20 -166 92 -245 135 -30 16 -68 37 -85 47 -16 9 -84 45 -150 80 -156 82 -243 128 -280 151 l-31 18 -104 -54 c-58 -29 -215 -110 -350 -179 -245 -125 -282 -152 -234 -170 10 -4 92 -51 183 -105 203 -119 432 -250 609 -348 73 -40 215 -120 315 -177 100 -57 279 -156 397 -221 118 -65 269 -148 335 -185 168 -94 241 -130 266 -130 21 0 21 3 15 83 -7 83 -30 289 -86 767 -17 146 -44 387 -60 536 -16 148 -31 277 -34 285 -12 33 -77 632 -69 639 4 4 53 28 108 53 158 72 350 164 480 230 66 33 145 72 175 86 30 14 147 72 260 128 113 56 212 101 220 100 10 -2 18 -19 22 -52z',
                  'M26364 7945 c-51 -24 -94 -47 -96 -52 -3 -4 -1 -52 4 -107 5 -54 7 -100 5 -103 -3 -2 -60 23 -128 55 l-123 60 -40 -19 c-23 -10 -70 -28 -104 -41 -63 -23 -87 -44 -77 -70 5 -12 422 -224 486 -247 25 -9 26 -13 38 -143 22 -246 33 -317 53 -334 16 -16 25 -14 128 31 l110 49 0 40 c0 22 -5 79 -11 128 -7 49 -10 91 -7 93 4 4 191 -88 235 -115 17 -11 27 -12 45 -3 44 22 113 50 140 56 29 8 51 37 43 59 -3 7 -24 25 -48 40 -38 23 -92 51 -382 194 l-80 39 -11 85 c-23 175 -47 316 -56 333 -12 23 -20 22 -124 -28z m84 -107 c12 -71 28 -185 37 -271 l7 -58 86 -40 c162 -75 372 -181 372 -188 0 -3 -19 -17 -43 -30 l-43 -23 -166 84 c-91 47 -171 83 -176 79 -6 -4 -5 -46 4 -121 23 -194 23 -193 -36 -222 -28 -14 -53 -22 -55 -17 -6 8 -16 85 -40 283 -8 65 -18 123 -23 128 -12 12 -111 64 -294 155 -75 37 -137 73 -137 79 -1 10 71 44 92 44 5 0 73 -31 153 -70 79 -38 151 -70 159 -70 18 0 20 53 6 127 -6 26 -12 72 -14 101 -4 50 -3 54 22 64 14 6 33 14 41 18 30 17 38 9 48 -52z',
                  'M8700 14780 c-166 -56 -265 -174 -240 -285 9 -41 54 -113 75 -121 8 -4 52 9 97 28 91 37 91 37 73 124 -6 27 -4 32 23 43 50 21 93 11 115 -26 22 -38 22 -39 -67 -277 -31 -82 -56 -157 -56 -166 0 -21 70 -141 86 -147 6 -2 87 28 180 67 303 129 379 165 382 182 4 20 -77 158 -96 165 -7 3 -43 -8 -80 -25 -151 -69 -177 -74 -149 -30 50 78 73 248 42 321 -56 133 -229 200 -385 147z m238 -87 c57 -35 92 -97 92 -164 0 -34 -16 -92 -55 -194 -58 -155 -63 -175 -42 -175 7 0 74 27 150 60 76 33 144 60 152 60 11 0 45 -40 45 -53 0 -3 -15 -10 -32 -17 -49 -18 -81 -31 -100 -41 -10 -5 -22 -9 -27 -9 -5 0 -48 -18 -95 -40 -47 -22 -88 -40 -91 -40 -3 0 -26 -10 -51 -22 l-46 -21 -19 24 c-10 13 -19 30 -19 37 0 13 43 140 99 290 35 94 38 129 15 178 -44 92 -172 112 -250 38 -35 -32 -36 -37 -30 -80 6 -44 5 -45 -29 -60 -46 -19 -44 -19 -61 23 -66 156 228 309 394 206z',
                  'M6126 12820 c-106 -19 -240 -108 -298 -199 -41 -65 -40 -141 3 -210 18 -28 37 -51 43 -51 6 1 49 20 96 43 91 45 93 47 75 119 -6 24 -2 30 41 58 58 36 68 37 99 5 37 -36 32 -50 -40 -106 -36 -28 -65 -57 -65 -64 0 -16 105 -125 120 -125 6 0 41 16 78 37 77 42 129 41 157 -1 21 -31 11 -52 -40 -81 -51 -31 -76 -31 -125 -4 l-38 21 -74 -50 c-101 -68 -106 -82 -52 -141 55 -61 146 -81 260 -57 220 46 354 166 354 316 0 123 -80 213 -206 234 l-67 11 -1 56 c-1 69 -29 110 -107 156 -61 35 -133 46 -213 33z m157 -84 c72 -31 111 -124 73 -177 -17 -24 -22 -59 -8 -60 4 0 48 -1 99 -2 99 -2 124 -13 167 -71 34 -45 30 -142 -9 -197 -62 -88 -195 -150 -323 -150 -116 -1 -155 41 -80 85 36 21 37 21 68 2 81 -47 250 47 250 139 0 45 -61 109 -111 118 -54 10 -169 -28 -169 -55 0 -15 -19 -8 -44 16 -34 31 -33 38 11 61 79 43 94 114 35 176 -51 55 -100 62 -174 25 -78 -40 -100 -69 -96 -124 3 -41 0 -47 -27 -63 -16 -10 -35 -18 -42 -18 -18 -1 -36 66 -28 106 7 40 76 120 133 155 73 45 210 62 275 34z',
                  'M3972 10860 c-29 -22 -71 -52 -93 -67 l-42 -27 8 -101 c4 -55 10 -188 14 -296 l6 -196 63 -77 c70 -86 85 -91 141 -48 20 16 70 52 111 80 41 28 97 69 125 91 l50 40 50 -49 c28 -28 59 -50 70 -50 28 1 189 113 193 134 3 12 -15 36 -47 66 -28 26 -51 51 -51 56 0 4 16 22 35 40 51 47 46 69 -30 132 -35 28 -69 52 -75 52 -5 0 -28 -11 -50 -25 -22 -14 -42 -25 -46 -25 -7 0 -290 248 -323 284 -33 35 -47 33 -109 -14z m168 -146 c135 -122 247 -214 260 -214 6 0 29 14 51 32 l39 31 25 -23 c33 -31 32 -40 -15 -74 -22 -17 -40 -35 -40 -42 0 -7 26 -35 58 -63 l57 -52 -40 -34 c-22 -19 -46 -35 -54 -35 -8 0 -41 25 -73 56 l-58 56 -48 -36 c-26 -20 -67 -51 -92 -68 -25 -18 -75 -56 -112 -85 -37 -29 -69 -53 -72 -53 -3 0 -23 19 -45 43 -40 41 -41 44 -41 116 0 40 -7 159 -16 264 l-17 191 27 20 c14 12 39 31 54 43 15 12 32 22 37 22 6 1 57 -42 115 -95z',
                  'M4004 10646 c-3 -9 -1 -53 5 -98 6 -46 14 -127 17 -181 10 -135 18 -144 84 -84 29 26 79 64 111 84 33 20 59 39 59 44 0 13 -38 51 -140 144 -111 101 -128 112 -136 91z m132 -173 c24 -21 44 -42 44 -49 0 -12 -78 -70 -84 -63 -6 7 -15 149 -10 149 3 0 25 -17 50 -37z',
                ],
                nt: 'translate(0.000000,1091.000000) scale(0.100000,-0.100000)',
                note: [
                  'M4055 10706 c-27 -19 -12 -48 22 -44 33 4 42 32 15 47 -14 7 -24 7 -37 -3z m32 -32 c-9 -9 -28 6 -21 18 4 6 10 6 17 -1 6 -6 8 -13 4 -17z',
                  'M4164 10706 c-11 -28 4 -48 33 -44 22 2 28 8 28 28 0 30 -51 43 -61 16z m46 -17 c0 -5 -7 -9 -15 -9 -15 0 -20 12 -9 23 8 8 24 -1 24 -14z',
                  'M4274 10695 c-7 -18 12 -45 32 -45 20 0 44 29 38 45 -8 20 -63 20 -70 0z m46 -15 c0 -5 -7 -10 -15 -10 -8 0 -15 5 -15 10 0 6 7 10 15 10 8 0 15 -4 15 -10z',
                  'M3927 10693 c-14 -14 -6 -42 14 -48 26 -8 54 16 46 39 -6 16 -48 22 -60 9z m43 -23 c0 -5 -7 -10 -15 -10 -8 0 -15 5 -15 10 0 6 7 10 15 10 8 0 15 -4 15 -10z',
                  'M3808 10639 c-39 -22 -10 -69 41 -69 17 0 21 6 21 34 0 43 -25 57 -62 35z m42 -24 c0 -8 -9 -15 -20 -15 -11 0 -20 7 -20 15 0 8 9 15 20 15 11 0 20 -7 20 -15z',
                  'M4094 10636 c-3 -9 -13 -16 -21 -16 -8 0 -11 5 -8 10 3 6 -1 10 -9 10 -9 0 -16 -9 -16 -20 0 -14 7 -20 24 -20 34 0 56 10 56 25 0 21 -19 28 -26 11z',
                  'M4366 10635 c-10 -27 5 -46 33 -43 20 2 27 9 29 31 3 24 0 27 -26 27 -17 0 -32 -6 -36 -15z m44 -15 c0 -5 -4 -10 -9 -10 -6 0 -13 5 -16 10 -3 6 1 10 9 10 9 0 16 -4 16 -10z',
                  'M4140 10625 c0 -12 13 -15 58 -15 46 0 60 -4 70 -20 12 -20 56 -28 66 -11 15 24 -82 61 -158 61 -25 0 -36 -4 -36 -15z m165 -33 c-3 -3 -11 0 -18 7 -9 10 -8 11 6 5 10 -3 15 -9 12 -12z',
                  'M3952 10620 c-35 -15 -21 -35 27 -38 39 -3 42 -2 39 20 -3 26 -29 33 -66 18z m43 -20 c-3 -5 -13 -10 -21 -10 -8 0 -14 5 -14 10 0 6 9 10 21 10 11 0 17 -4 14 -10z',
                  'M4170 10593 c-25 -10 -40 -36 -28 -50 27 -33 78 0 58 36 -6 12 -12 21 -13 20 -1 0 -9 -3 -17 -6z m14 -34 c-8 -14 -24 -10 -24 6 0 9 6 12 15 9 8 -4 12 -10 9 -15z',
                  'M3890 10565 c-18 -21 -5 -45 25 -45 14 0 28 7 31 15 7 17 -12 45 -31 45 -7 0 -18 -7 -25 -15z m32 -27 c-7 -7 -12 -8 -12 -2 0 14 12 26 19 19 2 -3 -1 -11 -7 -17z',
                  'M4390 10571 c-36 -5 -45 -10 -45 -26 0 -28 33 -30 73 -5 28 17 44 42 25 38 -5 0 -28 -4 -53 -7z m0 -21 c0 -5 -7 -10 -15 -10 -8 0 -15 5 -15 10 0 6 7 10 15 10 8 0 15 -4 15 -10z',
                  'M4033 10563 c-7 -2 -13 -13 -13 -24 0 -15 7 -19 35 -19 28 0 35 4 35 19 0 25 -27 37 -57 24z m27 -23 c0 -5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5 10 10 10 6 0 10 -4 10 -10z',
                  'M3753 10534 c-8 -21 23 -45 45 -37 41 16 34 53 -9 53 -18 0 -32 -6 -36 -16z m44 -20 c-9 -9 -28 6 -21 18 4 6 10 6 17 -1 6 -6 8 -13 4 -17z',
                  'M4231 10537 c-16 -16 -14 -44 5 -51 22 -8 56 12 52 31 -4 21 -42 35 -57 20z m31 -22 c0 -5 -5 -11 -11 -13 -6 -2 -11 4 -11 13 0 9 5 15 11 13 6 -2 11 -8 11 -13z',
                  'M4434 10515 c-9 -24 10 -39 41 -31 18 5 25 12 23 24 -4 23 -56 29 -64 7z m41 -5 c3 -5 -1 -10 -9 -10 -9 0 -16 5 -16 10 0 6 4 10 9 10 6 0 13 -4 16 -10z',
                  'M3963 10494 c-8 -22 11 -37 36 -29 31 10 28 45 -4 45 -14 0 -28 -7 -32 -16z m37 -4 c0 -5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5 10 10 10 6 0 10 -4 10 -10z',
                  'M4093 10495 c-3 -9 -2 -19 2 -23 4 -4 10 -1 12 6 3 6 14 12 26 12 21 -1 22 -1 3 -15 -23 -18 -16 -29 13 -20 23 7 27 25 9 43 -17 17 -58 15 -65 -3z',
                  'M3846 10481 c-14 -16 -15 -20 -2 -30 22 -18 61 -10 61 13 0 28 -39 39 -59 17z m39 -11 c3 -5 -1 -10 -10 -10 -9 0 -13 5 -10 10 3 6 8 10 10 10 2 0 7 -4 10 -10z',
                  'M4315 10486 c-19 -14 -19 -16 -4 -31 23 -24 61 -11 57 18 -4 27 -27 32 -53 13z m35 -16 c0 -5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5 10 10 10 6 0 10 -4 10 -10z',
                  'M3723 10483 c-18 -7 -16 -42 2 -49 23 -9 65 5 65 21 0 24 -39 40 -67 28z m41 -22 c7 -11 -22 -23 -35 -15 -5 3 -7 10 -4 15 8 12 32 12 39 0z',
                  'M4965 10480 c3 -5 8 -10 11 -10 3 0 2 5 -1 10 -3 6 -8 10 -11 10 -3 0 -2 -4 1 -10z',
                  'M4195 10456 c-19 -14 -19 -16 -4 -31 21 -21 62 -4 57 23 -4 22 -29 26 -53 8z m35 -16 c0 -5 -7 -10 -16 -10 -8 0 -12 5 -9 10 3 6 10 10 16 10 5 0 9 -4 9 -10z',
                  'M4400 10445 c-17 -21 -5 -45 23 -45 29 0 52 24 43 45 -7 19 -50 19 -66 0z m40 -15 c0 -5 -7 -10 -15 -10 -8 0 -15 5 -15 10 0 6 7 10 15 10 8 0 15 -4 15 -10z',
                  'M4041 10433 c-7 -13 -5 -23 5 -34 18 -21 64 -13 64 10 0 38 -51 56 -69 24z m44 -13 c3 -5 -1 -10 -10 -10 -9 0 -13 5 -10 10 3 6 8 10 10 10 2 0 7 -4 10 -10z',
                  'M3934 10425 c-19 -15 -19 -15 0 -30 25 -19 40 -19 57 1 11 14 10 18 -6 30 -24 17 -27 17 -51 -1z m36 -15 c0 -5 -7 -10 -16 -10 -8 0 -12 5 -9 10 3 6 10 10 16 10 5 0 9 -4 9 -10z',
                  'M3797 10402 c-21 -23 -5 -42 35 -42 30 0 39 25 16 48 -17 17 -32 15 -51 -6z m43 -12 c0 -5 -7 -10 -16 -10 -8 0 -12 5 -9 10 3 6 10 10 16 10 5 0 9 -4 9 -10z',
                  'M4264 10405 c-9 -24 10 -39 41 -31 18 5 25 12 23 24 -4 23 -56 29 -64 7z m43 -11 c-3 -3 -12 -4 -19 -1 -8 3 -5 6 6 6 11 1 17 -2 13 -5z',
                  'M3683 10403 c-7 -2 -13 -13 -13 -24 0 -23 37 -26 65 -6 33 25 -8 48 -52 30z m37 -13 c0 -5 -7 -10 -16 -10 -8 0 -12 5 -9 10 3 6 10 10 16 10 5 0 9 -4 9 -10z',
                  'M4143 10393 c-7 -2 -13 -14 -13 -24 0 -31 64 -23 68 9 3 22 -21 29 -55 15z m37 -13 c0 -5 -5 -10 -11 -10 -5 0 -7 5 -4 10 3 6 8 10 11 10 2 0 4 -4 4 -10z',
                  'M4368 10369 c-37 -21 -15 -56 28 -45 27 7 33 40 8 50 -19 7 -15 8 -36 -5z m32 -19 c0 -5 -7 -10 -16 -10 -8 0 -12 5 -9 10 3 6 10 10 16 10 5 0 9 -4 9 -10z',
                  'M3887 10357 c-28 -19 0 -51 36 -42 29 8 34 24 15 43 -15 15 -30 15 -51 -1z m38 -17 c-3 -5 -10 -10 -16 -10 -5 0 -9 5 -9 10 0 6 7 10 16 10 8 0 12 -4 9 -10z',
                  'M4000 10345 c-18 -22 1 -39 34 -31 35 9 36 46 2 46 -13 0 -29 -7 -36 -15z m37 -12 c-4 -3 -10 -3 -14 0 -3 4 0 7 7 7 7 0 10 -3 7 -7z',
                  'M3743 10343 c-7 -2 -13 -16 -13 -29 0 -21 5 -24 34 -24 22 0 36 6 40 16 12 31 -24 53 -61 37z m41 -22 c3 -5 0 -11 -8 -14 -15 -6 -26 1 -26 15 0 11 27 10 34 -1z',
                  'M4222 10328 c2 -17 10 -23 28 -23 18 0 26 6 28 23 3 19 -1 22 -28 22 -27 0 -31 -3 -28 -22z m35 -5 c-4 -3 -10 -3 -14 0 -3 4 0 7 7 7 7 0 10 -3 7 -7z',
                  'M4087 10333 c-14 -13 -6 -42 13 -48 40 -13 83 34 44 49 -21 8 -49 8 -57 -1z m48 -23 c-3 -5 -13 -10 -21 -10 -8 0 -14 5 -14 10 0 6 9 10 21 10 11 0 17 -4 14 -10z',
                  'M4291 10296 c-28 -34 19 -62 59 -36 12 7 12 13 4 27 -14 24 -47 28 -63 9z m44 -16 c3 -5 -1 -10 -9 -10 -9 0 -16 5 -16 10 0 6 4 10 9 10 6 0 13 -4 16 -10z',
                  'M3833 10293 c-18 -7 -16 -42 3 -50 20 -8 64 13 64 31 0 21 -36 32 -67 19z m42 -23 c-3 -5 -10 -10 -16 -10 -5 0 -9 5 -9 10 0 6 7 10 16 10 8 0 12 -4 9 -10z',
                  'M3936 10261 c-22 -24 -15 -51 13 -51 25 0 53 28 49 49 -5 24 -41 25 -62 2z m39 -11 c3 -6 -1 -13 -10 -16 -19 -8 -30 0 -20 15 8 14 22 14 30 1z',
                  'M4164 10265 c-10 -25 4 -45 29 -45 29 0 52 24 43 45 -7 20 -65 20 -72 0z m50 -16 c-7 -11 -34 -12 -34 -1 0 14 11 21 26 15 8 -3 11 -9 8 -14z',
                  'M4037 10253 c-25 -25 19 -61 53 -43 34 18 26 50 -13 50 -19 0 -37 -3 -40 -7z m50 -19 c-3 -3 -12 -4 -19 -1 -8 3 -5 6 6 6 11 1 17 -2 13 -5z',
                  'M5113 9803 c-34 -48 -38 -59 -14 -38 25 22 45 54 38 61 -3 3 -14 -7 -24 -23z',
                  'M5050 9725 c0 -3 2 -5 5 -5 3 0 5 2 5 5 0 3 -2 5 -5 5 -3 0 -5 -2 -5 -5z',
                  'M4933 9647 c-98 -65 -116 -86 -36 -42 42 22 147 105 133 104 -3 0 -46 -28 -97 -62z',
                  'M4525 9404 c-88 -51 -193 -112 -233 -135 -40 -22 -71 -43 -68 -46 4 -4 79 38 401 223 49 28 83 54 70 53 -5 -1 -82 -43 -170 -95z',
                  'M4387 8946 c-13 -28 -24 -36 -54 -42 -64 -11 -134 -52 -146 -85 -11 -29 -30 -38 -42 -19 -8 12 -35 13 -35 1 0 -5 14 -14 30 -21 37 -15 46 -30 54 -95 6 -45 4 -55 -24 -99 -17 -26 -29 -51 -26 -54 7 -6 6 -7 38 41 26 38 26 38 32 12 7 -26 7 -26 42 4 19 17 46 31 60 31 17 0 27 8 34 26 7 17 15 24 25 20 8 -3 22 -9 30 -12 8 -3 15 -1 15 4 0 6 -9 14 -20 17 -36 11 -50 35 -50 83 0 59 23 136 55 184 17 26 21 38 12 38 -7 0 -21 -16 -30 -34z m-67 -105 c0 -12 -107 -90 -114 -83 -11 11 -6 52 7 52 7 0 28 9 47 19 38 22 60 26 60 12z m10 -86 c0 -47 -6 -53 -33 -32 -16 11 -16 14 3 45 26 42 30 41 30 -13z m-68 -7 c-6 -6 -15 -8 -19 -4 -4 4 -1 11 7 16 19 12 27 3 12 -12z m-12 -36 c0 -10 -22 -32 -32 -32 -4 0 -8 14 -8 30 0 28 2 30 20 20 11 -6 20 -14 20 -18z m44 -8 c9 -3 16 -13 16 -21 0 -17 -53 -73 -69 -73 -18 0 -12 46 10 74 23 29 21 28 43 20z',
                  'M3484 8818 c-4 -7 -3 -8 4 -4 12 7 16 16 8 16 -3 0 -8 -5 -12 -12z',
                  'M616 8705 c-6 -41 7 -191 17 -202 4 -3 -3 214 -7 237 -1 8 -6 -7 -10 -35z',
                  'M3913 8683 c-7 -3 -13 -11 -13 -19 0 -8 -6 -23 -12 -34 -10 -15 -10 -23 -2 -28 6 -4 15 -26 19 -49 8 -51 15 -57 49 -42 31 15 36 44 6 34 -18 -6 -20 -2 -20 35 0 27 5 43 15 46 22 9 18 34 -4 34 -11 0 -21 6 -23 13 -2 8 -9 12 -15 10z',
                  'M3834 8652 c-7 -5 -8 -29 -3 -77 4 -38 8 -80 8 -92 1 -24 30 -33 32 -10 4 42 -11 187 -19 187 -4 0 -12 -4 -18 -8z',
                  'M3770 8512 c0 -53 -11 -82 -32 -82 -4 0 -10 23 -14 50 -7 51 -10 55 -32 42 -9 -6 -10 -23 -5 -62 10 -66 29 -81 69 -55 16 10 31 18 34 18 15 -3 30 23 26 46 -3 14 -7 43 -8 64 -2 28 -6 37 -20 37 -15 0 -18 -9 -18 -58z',
                  'M640 8485 c0 -3 2 -5 5 -5 3 0 5 2 5 5 0 3 -2 5 -5 5 -3 0 -5 -2 -5 -5z',
                  'M3605 8476 c-40 -18 -72 -53 -59 -66 7 -7 18 -2 34 15 13 14 27 25 32 25 18 0 6 -22 -27 -51 -66 -58 -32 -123 36 -71 13 10 31 21 41 25 17 6 16 64 -3 115 -10 25 -13 26 -54 8z m12 -113 c-8 -8 -21 -13 -28 -11 -9 3 -6 11 11 28 17 17 25 20 28 11 2 -7 -3 -20 -11 -28z',
                  'M3499 8470 c-8 -5 -16 -25 -18 -47 -1 -21 -5 -54 -9 -73 -8 -34 -8 -34 -37 13 -29 45 -48 57 -60 37 -6 -10 73 -150 86 -150 22 0 38 37 48 112 7 46 14 91 17 101 6 19 -3 21 -27 7z',
                  'M3985 8448 c-8 -22 -24 -113 -20 -116 8 -8 25 11 25 28 0 22 30 36 41 18 5 -8 11 -9 18 -3 5 6 0 24 -15 48 -25 38 -41 46 -49 25z m25 -33 c0 -8 -4 -15 -10 -15 -5 0 -10 7 -10 15 0 8 5 15 10 15 6 0 10 -7 10 -15z',
                  'M3885 8381 c-67 -37 -65 -34 -58 -74 3 -21 11 -37 19 -37 9 0 10 8 4 30 -7 25 -5 32 11 40 17 10 19 7 19 -20 0 -46 18 -36 22 13 4 50 22 56 26 9 4 -36 22 -34 22 3 0 56 -14 64 -65 36z',
                  'M7855 8279 c-390 -129 -386 -119 -172 -405 78 -105 173 -232 210 -283 74 -101 118 -130 190 -131 22 0 153 38 310 91 303 102 327 115 327 187 0 40 -29 78 -329 442 -51 63 -95 120 -98 126 -8 20 -104 64 -137 63 -17 0 -152 -41 -301 -90z m383 26 c31 -26 118 -134 111 -138 -2 -1 -48 -17 -102 -34 -97 -31 -97 -31 -167 59 -39 50 -70 94 -70 98 0 12 101 38 152 39 36 1 53 -5 76 -24z m-189 -107 c63 -81 63 -81 47 -114 -20 -43 -67 -68 -109 -58 -18 4 -44 8 -59 8 -23 1 -39 17 -93 90 -35 49 -63 91 -61 93 6 6 181 62 196 62 8 0 44 -37 79 -81z m-235 -81 c36 -48 66 -91 66 -96 0 -4 -37 -22 -82 -39 -46 -16 -90 -33 -99 -37 -13 -5 -31 13 -73 68 -61 82 -65 94 -37 128 16 20 134 70 153 66 3 -1 36 -41 72 -90z m599 -19 c22 -27 35 -54 30 -58 -13 -12 -134 -50 -159 -50 -21 0 -98 76 -96 95 1 8 157 64 177 64 6 0 27 -23 48 -51z m-243 -36 c0 -4 18 -25 40 -47 40 -40 130 -157 130 -169 0 -3 -24 -6 -52 -6 -80 0 -127 -17 -146 -51 -10 -16 -22 -29 -28 -29 -15 0 -194 227 -194 247 0 3 24 2 54 -1 64 -8 114 11 140 55 14 24 20 27 37 19 10 -6 19 -14 19 -18z m344 -88 c21 -25 36 -47 35 -49 -8 -7 -190 -68 -193 -64 -18 24 -67 101 -64 103 6 5 163 55 173 56 6 0 28 -21 49 -46z m-580 -30 c21 -31 36 -57 34 -59 -13 -13 -203 -65 -206 -57 -2 6 -17 29 -33 52 -17 23 -29 43 -27 44 2 2 37 15 78 30 42 15 82 31 90 36 23 15 25 14 64 -46z m696 -110 c33 -42 60 -85 60 -98 0 -32 -35 -60 -105 -85 -60 -21 -60 -21 -83 6 -69 84 -134 174 -129 179 6 6 178 73 189 74 4 0 35 -34 68 -76z m-600 -25 c22 -29 39 -53 38 -54 -5 -4 -191 -65 -199 -65 -15 0 -89 109 -78 116 19 11 153 52 176 53 16 1 35 -15 63 -50z m393 -88 l77 -99 -107 -36 c-58 -19 -109 -33 -114 -31 -4 3 -38 44 -74 91 -64 81 -66 86 -55 114 7 16 18 34 26 41 12 10 150 29 165 23 3 -2 40 -48 82 -103z m-243 -79 c40 -52 68 -97 64 -102 -5 -4 -40 -18 -77 -30 -75 -24 -112 -22 -164 9 -34 21 -119 138 -108 149 8 8 197 70 206 68 4 0 39 -43 79 -94z',
                  'M3249 8338 c-22 -18 -52 -69 -45 -76 4 -3 12 0 18 6 21 21 25 14 31 -49 6 -65 10 -75 26 -64 12 7 4 174 -8 188 -4 4 -14 1 -22 -5z',
                  'M3749 8333 c-23 -28 -10 -97 18 -101 22 -3 54 31 48 52 -2 6 -6 23 -9 39 -7 31 -35 36 -57 10z m41 -43 c0 -29 -4 -40 -15 -40 -10 0 -15 10 -15 34 0 29 6 38 28 45 1 1 2 -17 2 -39z',
                  'M3667 8292 c-37 -40 -11 -125 31 -103 27 14 37 51 25 88 -12 34 -34 40 -56 15z m38 -47 c0 -43 -29 -40 -33 3 -3 28 0 33 15 30 13 -2 18 -12 18 -33z',
                  'M3145 8282 c-5 -4 -18 -24 -28 -46 -18 -39 -18 -39 -43 -15 -22 21 -26 22 -40 7 -15 -15 -14 -19 17 -46 33 -29 33 -29 11 -82 -32 -77 -10 -84 28 -9 23 44 26 45 50 24 17 -15 50 -11 50 5 0 5 -14 19 -31 33 -30 23 -30 23 -10 78 12 30 21 55 21 57 0 5 -15 1 -25 -6z',
                  'M3570 8239 c-15 -27 -4 -38 14 -14 28 38 36 5 10 -43 -27 -52 -21 -61 25 -37 34 17 42 40 11 30 -19 -6 -19 -5 -3 23 9 16 14 36 10 45 -9 24 -54 22 -67 -4z',
                  'M3206 8020 c-8 -57 -18 -63 -36 -20 -12 30 -30 41 -30 18 1 -29 45 -97 57 -90 20 13 42 142 24 142 -5 0 -11 -22 -15 -50z',
                  'M3084 7993 c-25 -12 -31 -21 -30 -45 1 -29 6 -31 49 -13 11 5 17 3 17 -7 0 -19 -20 -38 -42 -38 -10 0 -18 -4 -18 -10 0 -5 11 -10 25 -10 30 0 59 40 50 70 -7 21 -30 27 -40 10 -4 -6 -11 -7 -17 -4 -7 4 2 18 23 35 37 31 31 36 -17 12z',
                ],
                layers: [
                  /* the vault, entire */
                  { a: 0.07, s: 9, pen: [
                    'M72.4 319.5L109.0 349.0',
                    'M111.0 278.0C107.9 276.4 97.5 271.5 92.5 268.5C87.4 265.4 84.0 262.7 81.0 260.0C77.9 257.3 76.6 256.3 74.3 252.3C71.9 248.2 68.3 240.2 67.0 235.8C65.7 231.3 65.8 230.0 66.2 225.8C66.6 221.6 68.1 214.8 69.4 210.6C70.8 206.4 71.5 204.7 74.4 200.6C77.3 196.6 81.6 190.9 86.7 186.3C91.9 181.7 63.7 197.0 105.2 173.0C146.8 149.0 294.8 65.2 336.0 42.0C377.1 18.8 348.3 35.5 352.2 34.0C356.0 32.5 357.9 33.2 359.0 33.0',
                    'M74.6 317.2L68.4 301.2',
                    'M451.1 92.2L441.9 98.8',
                    'M427.1 88.1L388.0 90.4',
                    'M83.7 317.3L100.4 331.3',
                    'M471.9 70.0L468.6 83.5L468.0 83.3A15.4 15.4 0 0 1 461.6 91.1L461.7 91.3L461.0 92.0',
                    'M373.0 23.0C372.6 22.8 374.4 21.2 370.4 22.0C366.4 22.8 356.5 25.2 348.9 28.1C341.4 30.9 367.5 15.5 325.0 39.0C282.5 62.5 135.3 145.4 93.9 169.1C52.4 192.9 82.1 176.6 76.5 181.5C70.9 186.5 64.1 193.6 60.2 198.8C56.3 203.9 54.9 206.9 53.0 212.3C51.1 217.7 49.7 227.9 49.0 231.0',
                    'M372.8 22.5L399.6 14.8L399.8 15.4A37.7 37.7 0 0 1 417.2 14.4L417.3 13.9L421.6 14.4L421.6 14.9A33.8 33.8 0 0 1 437.9 18.5L438.2 17.8L447.0 21.1',
                    'M449.3 19.9L471.8 25.2L471.6 26.0A82.5 82.5 0 0 1 496.4 38.2L496.8 37.6L505.7 43.4',
                    'M455.6 74.8L462.5 57.8',
                    'M508.0 43.0C510.7 42.8 519.9 41.6 524.1 42.1C528.2 42.6 530.8 44.6 532.9 46.0C535.1 47.4 536.0 48.7 537.0 50.3C538.0 51.8 538.8 53.5 539.0 55.4C539.2 57.4 538.2 60.9 538.0 62.0',
                    'M59.8 297.7L63.7 294.6L64.1 295.3A9.3 9.3 0 0 1 68.6 298.7L69.0 299.0',
                    'M347.7 65.9L344.9 76.7',
                    'M49.0 232.0C49.3 232.4 50.7 232.6 51.0 234.2C51.3 235.8 50.4 238.6 51.0 241.7C51.6 244.7 52.3 248.1 54.3 252.3C56.3 256.5 59.0 262.2 62.8 266.8C66.5 271.4 70.9 275.7 76.9 279.9C82.9 284.1 90.5 288.5 98.9 291.9C107.3 295.2 120.0 298.3 127.0 300.0C134.1 301.7 133.6 301.7 141.2 302.0C148.8 302.3 162.6 302.8 172.7 302.0C182.9 301.2 193.9 298.9 202.1 296.9C210.3 294.9 215.8 292.5 221.7 290.0C227.7 287.5 192.2 307.5 237.9 282.0C283.6 256.5 449.9 163.6 495.9 137.0C541.8 110.4 509.4 126.6 513.7 122.3C518.1 117.9 519.6 115.2 522.0 110.7C524.4 106.2 526.7 99.9 528.0 95.2C529.3 90.4 529.7 84.2 530.0 82.0',
                    'M353.8 57.0L354.4 46.9L355.1 46.9A13.3 13.3 0 0 1 359.9 35.6L359.7 35.3L360.0 34.0',
                    'M457.2 29.9L460.2 37.7L460.0 37.8A21.4 21.4 0 0 1 461.7 51.9L462.0 51.9L462.0 53.0',
                    'M386.8 92.5L393.0 95.6L393.3 94.9A47.6 47.6 0 0 0 413.8 95.5L413.8 96.0L415.3 96.0L397.4 95.6A61.0 61.0 0 0 0 419.4 94.9L419.5 95.3L430.0 91.7',
                    'M455.0 75.0L453.5 75.0A4.6 4.6 0 0 0 448.6 77.5L448.8 77.9L434.2 88.2',
                    'M58.9 299.5L68.0 319.4',
                    'M455.2 97.4L445.3 102.5',
                    'M112.0 278.0C116.3 279.0 129.2 282.8 138.0 284.0C146.8 285.2 155.2 285.6 164.6 285.0C174.0 284.4 184.8 283.0 194.3 280.7C203.8 278.4 177.0 295.1 221.8 271.0C266.6 246.9 417.5 161.7 462.9 136.0C508.3 110.3 486.8 122.3 494.0 117.0C501.2 111.7 503.2 107.8 506.0 104.0C508.8 100.1 509.8 97.0 511.0 94.0C512.1 91.0 512.7 89.0 513.0 85.9C513.3 82.7 513.5 78.7 513.0 75.4C512.5 72.1 512.0 69.8 510.0 66.1C508.0 62.4 505.1 57.4 501.2 53.2C497.4 49.0 492.1 44.5 486.8 41.0C481.5 37.5 474.2 34.4 469.4 32.4C464.6 30.4 459.9 29.6 458.0 29.0',
                    'M368.0 30.0C366.8 31.8 362.5 37.5 361.0 40.6C359.5 43.7 358.7 45.9 359.0 48.8C359.3 51.6 361.2 55.4 362.7 57.7C364.2 60.1 365.5 61.2 368.0 63.0C370.5 64.9 374.1 67.2 377.7 68.7C381.3 70.2 384.1 71.3 389.8 72.0C395.5 72.7 404.6 73.7 411.9 73.0C419.2 72.3 427.8 70.3 433.8 68.0C439.9 65.7 444.7 61.8 448.1 58.9C451.4 56.1 452.7 53.6 454.0 50.9C455.3 48.2 455.9 45.2 456.0 42.7C456.1 40.2 455.7 38.2 454.7 35.7C453.7 33.3 450.8 29.3 450.0 28.0',
                    'M518.7 56.2L523.8 64.1',
                    'M530.4 59.3L520.5 54.1',
                    'M512.1 45.9L525.9 47.1L525.9 48.2A3.4 3.4 0 0 1 530.1 50.8L530.7 50.7L531.7 51.7L528.2 49.4A4.5 4.5 0 0 1 532.0 54.6L532.2 54.6L531.4 60.1',
                    'M460.0 55.0C458.5 56.5 454.2 61.5 450.9 64.1C447.6 66.8 446.4 68.5 440.2 70.8C433.9 73.2 421.1 76.8 413.1 78.0C405.1 79.2 397.5 78.3 392.1 78.0C386.8 77.7 385.3 77.5 381.0 76.0C376.6 74.4 370.2 71.9 365.9 68.9C361.6 65.9 356.8 59.8 355.0 58.0',
                    'M385.6 91.8L363.5 80.3',
                    'M104.0 327.0L103.6 325.6L103.5 325.8A30.9 30.9 0 0 0 88.0 314.2L88.3 313.3L87.0 313.0',
                    'M351.1 68.0L349.9 73.6L350.2 73.6A12.8 12.8 0 0 0 352.7 84.4L352.4 84.6L354.9 88.1L355.0 88.4L360.0 89.2',
                    'M511.5 48.4L517.5 55.4',
                    'M110.6 347.9L107.9 334.8',
                    'M528.3 69.4L538.0 62.0',
                    'M354.1 65.9L362.4 79.7',
                    'M345.0 77.0C344.3 78.5 341.3 82.3 341.0 85.8C340.7 89.4 342.3 95.1 343.4 98.4C344.5 101.7 344.7 102.5 347.6 105.6C350.5 108.7 354.6 113.5 360.9 116.9C367.3 120.3 376.4 124.3 385.7 126.0C395.0 127.7 408.3 127.5 416.7 127.0C425.1 126.5 431.4 124.3 436.1 122.9C440.8 121.6 441.0 121.1 444.9 119.0C448.8 116.9 455.4 113.6 459.4 110.6C463.4 107.6 466.1 105.3 469.0 101.0C471.9 96.7 475.8 89.2 477.0 84.8C478.2 80.5 476.7 77.2 476.0 74.8C475.3 72.3 473.5 70.8 473.0 70.0',
                    'M345.0 77.0C345.7 79.0 346.9 85.2 349.0 88.8C351.1 92.5 354.9 96.2 357.7 98.7C360.6 101.3 362.5 102.3 366.0 104.0C369.6 105.7 374.0 107.6 379.0 109.0C383.9 110.3 389.9 111.5 395.7 112.0C401.5 112.5 407.5 112.7 413.7 112.0C420.0 111.3 428.2 109.4 433.1 107.9C437.9 106.4 441.3 103.8 443.0 103.0',
                    'M116.8 361.4L94.7 349.4L95.1 348.6A18.9 18.9 0 0 1 86.1 341.7L85.4 342.3L69.2 322.6',
                    'M118.2 360.0L112.4 330.8L110.3 329.6A16.8 16.8 0 0 0 105.5 309.2L106.5 308.1L78.3 296.5L78.5 295.2A8.2 8.2 0 0 1 71.0 290.1L70.0 290.8L53.2 275.8',
                    'M51.1 275.3L45.3 255.2L46.3 254.8A8.3 8.3 0 0 1 45.2 248.0L44.4 247.8L47.1 231.8',
                    'M532.1 82.1L536.8 76.6L536.4 76.2A4.8 4.8 0 0 0 537.9 71.0L538.8 71.0L538.6 62.0',
                    'M361.0 89.0C362.5 90.6 367.6 96.7 369.8 98.8C372.1 101.0 371.0 100.3 374.7 101.7C378.4 103.0 384.8 106.1 392.0 107.0C399.1 107.9 409.3 108.2 417.5 107.0C425.6 105.8 437.1 101.2 441.0 100.0',
                    'M118.0 361.0C121.3 362.1 129.9 366.1 137.7 367.7C145.5 369.4 153.8 371.0 164.9 371.0C175.9 371.0 193.3 369.7 204.1 368.0C214.9 366.3 215.7 367.0 229.7 361.0C243.7 355.0 243.9 355.4 288.1 331.9C332.4 308.3 458.7 240.2 495.2 219.8C531.8 199.4 503.4 213.6 507.5 209.5C511.6 205.4 516.1 201.1 519.8 195.2C523.6 189.2 528.0 179.3 530.0 173.9C532.0 168.4 531.2 173.3 532.0 162.7C532.8 152.0 534.5 121.2 535.0 109.9C535.5 98.6 535.5 99.4 535.0 94.9C534.5 90.4 532.5 85.0 532.0 83.0',
                    'M50.8 276.4L57.9 298.4',
                    'M526.6 70.1L530.1 80.7',
                    'M467.2 63.0L467.7 72.6L466.9 72.7A11.0 11.0 0 0 1 464.0 81.9L463.0 83.0L465.9 78.3A5.2 5.2 0 0 1 458.6 82.8L458.5 83.0L458.0 83.0',
                    'M509.7 55.7L517.8 71.8L516.7 72.6A3.9 3.9 0 0 1 517.7 77.6L518.7 77.9L515.6 102.1',
                    'M241.8 267.7L330.7 217.8',
                    'M414.4 248.1L439.3 233.5',
                    'M337.0 282.0C336.7 281.4 336.5 278.3 335.2 278.2C334.0 278.2 329.9 279.9 329.3 281.7C328.8 283.5 330.8 287.9 331.7 289.0C332.5 290.1 333.6 289.3 334.5 288.5C335.4 287.7 336.6 284.8 337.0 284.0',
                  ] },
                  /* card four */
                  { a: 0.15, s: 9, pen: [
                    'M594.0 254.1L549.8 270.4L549.7 270.6A74.0 74.0 0 0 0 524.9 279.1L524.1 278.4L513.7 290.8',
                    'M376.4 371.0L312.9 409.1L313.7 411.7A167.6 167.6 0 0 0 250.8 448.8L248.5 446.6L240.2 459.6L240.9 460.1A10.2 10.2 0 0 0 240.3 468.6L239.8 468.7L241.1 475.8',
                    'M599.0 249.0C618.8 239.4 696.0 201.4 717.6 191.4C739.2 181.4 725.4 189.2 728.6 189.0C731.9 188.8 733.7 189.0 737.2 190.0C740.8 191.0 746.8 193.1 750.1 195.1C753.4 197.1 755.9 200.9 757.0 202.0',
                    'M134.9 577.0L132.6 565.9L133.2 565.8A6.9 6.9 0 0 1 135.0 559.2L134.4 558.8L140.5 547.9L140.1 546.5A171.5 171.5 0 0 0 190.8 510.9L191.9 512.0L238.4 479.1',
                    'M601.2 253.5L757.2 203.0',
                    'M136.3 577.6L394.3 776.4L393.7 778.0A62.1 62.1 0 0 1 421.4 799.5L423.0 798.1L791.6 1090.5',
                    'M778.5 1090.7L469.5 845.5L468.9 846.1A17.7 17.7 0 0 0 462.3 840.6L462.4 840.3L224.0 655.6L224.4 655.0A826.7 826.7 0 0 1 145.1 593.3L144.4 594.0L142.2 592.2A578.0 578.0 0 0 1 138.0 588.0L137.5 588.1L134.5 579.2',
                    'M377.9 370.0L378.3 358.3L378.7 358.3A12.2 12.2 0 0 1 380.0 354.3L379.6 354.0L388.4 344.6L389.1 337.3A111.7 111.7 0 0 0 476.4 300.2L481.7 304.8L512.8 291.6',
                    'M513.2 304.0L514.2 293.0',
                    'M739.0 695.0C738.8 694.1 748.7 708.2 738.0 689.4C727.3 670.6 712.3 644.1 675.0 582.0C637.7 520.0 541.3 362.6 514.1 317.1C487.0 271.6 512.2 311.0 512.0 309.0C511.8 307.0 512.8 305.7 513.0 305.0',
                    'M869.0 1000.0C867.0 1000.6 861.3 1003.3 857.1 1003.9C852.9 1004.5 848.3 1004.8 843.8 1003.8C839.2 1002.7 833.4 999.9 829.7 997.7C826.1 995.6 835.3 1010.2 822.0 991.0C808.7 971.9 788.0 938.1 749.9 882.9C711.8 827.7 642.3 728.0 593.6 659.6C545.0 591.3 491.5 518.7 457.9 472.9C424.2 427.1 404.9 401.7 391.8 384.8C378.6 367.8 381.2 373.3 379.1 371.0',
                  ] },
                  /* card three */
                  { a: 0.215, s: 9, pen: [
                    'M240.0 480.0C240.6 481.5 239.6 483.6 243.9 488.9C248.1 494.1 206.5 451.4 265.5 511.5C324.4 571.5 508.8 758.7 597.4 849.4C686.1 940.2 761.9 1020.4 797.2 1056.2C832.5 1092.0 805.9 1062.3 809.0 1064.0C812.1 1065.6 811.8 1065.7 815.6 1066.0C819.5 1066.3 827.6 1066.6 832.1 1066.0C836.6 1065.4 839.8 1063.9 842.6 1062.4C845.4 1060.9 847.9 1057.9 849.0 1057.0',
                    'M748.8 762.0L750.4 718.0',
                    'M751.1 717.0L750.6 711.3L750.5 710.3A4.5 4.5 0 0 1 747.0 704.4L746.3 703.8L740.5 695.6',
                    'M772.2 752.4L750.4 763.8',
                    'M378.0 373.0C378.2 374.4 378.5 379.6 379.0 381.6C379.5 383.6 360.5 357.5 381.2 385.2C401.8 412.9 464.5 495.7 502.8 547.8C541.1 599.9 574.8 647.0 611.0 698.0C647.2 749.0 685.5 803.9 719.9 853.9C754.2 903.9 799.4 972.6 817.1 998.1C834.8 1023.7 822.2 1004.6 826.2 1007.2C830.3 1009.9 836.2 1012.9 841.4 1014.0C846.7 1015.1 853.0 1015.0 857.9 1014.0C862.9 1013.0 868.8 1009.0 871.0 1008.0',
                    'M780.6 764.7L773.3 751.8',
                    'M734.6 790.1L780.1 766.3',
                    'M242.0 477.0C289.8 525.3 435.6 671.8 529.0 767.0C622.4 862.2 755.2 1000.5 802.3 1048.3C849.5 1096.1 809.0 1052.7 812.0 1054.0C814.9 1055.3 816.1 1055.9 820.1 1056.0C824.2 1056.1 831.9 1055.8 836.2 1054.8C840.5 1053.8 844.4 1050.8 846.0 1050.0',
                    'M752.1 717.9L754.5 719.3L754.2 719.6A34.5 34.5 0 0 1 763.3 735.1L764.2 734.8L772.6 750.7',
                    'M1404.0 739.0C1404.3 736.9 1405.9 729.9 1406.0 726.3C1406.1 722.8 1405.6 720.5 1404.8 717.8C1404.0 715.1 1402.8 712.6 1401.3 710.3C1399.8 707.9 1477.8 793.3 1395.6 703.6C1313.4 613.9 992.1 261.8 908.1 172.1C824.1 82.3 897.1 166.2 891.5 165.0C885.9 163.8 895.9 158.9 874.3 165.0C852.8 171.1 781.7 195.7 762.1 201.9C742.6 208.1 757.9 202.0 757.0 202.0',
                    'M733.3 788.0L737.5 697.0',
                  ] },
                  /* card two */
                  { a: 0.28, s: 9, pen: [
                    'M514.0 305.0C514.6 305.4 508.4 293.4 517.5 307.5C526.6 321.6 539.0 340.8 568.7 389.7C598.5 438.7 642.4 509.5 696.0 601.0C749.6 692.6 857.1 881.8 890.1 939.1C923.1 996.5 891.4 942.2 894.0 945.0C896.7 947.8 901.8 953.3 906.0 956.0C910.1 958.6 913.1 960.3 918.9 961.0C924.7 961.7 869.1 992.3 941.0 960.0C1012.8 927.7 1274.5 802.6 1350.0 767.0C1425.5 731.3 1385.6 750.3 1393.8 746.0C1402.0 741.7 1397.7 742.0 1399.3 741.0C1400.8 740.0 1402.4 740.2 1403.0 740.0',
                    'M812.7 824.6L778.8 805.3',
                    'M778.7 803.6L794.9 792.9',
                    'M787.8 777.6L781.5 765.7',
                    'M814.4 823.7L824.4 840.6',
                    'M748.7 801.5L787.0 779.1',
                    'M748.9 804.3L822.6 842.8',
                    'M796.7 792.6L814.4 822.8',
                    'M788.6 778.7L795.8 791.6',
                    'M868.9 999.8L913.2 973.3',
                    'M824.9 841.5L885.1 947.2L885.3 947.1A36.2 36.2 0 0 0 898.1 962.6L897.9 962.9L899.0 964.0L889.7 954.2A43.7 43.7 0 0 0 906.3 968.0L906.1 968.4L913.0 970.9',
                  ] },
                  /* card one */
                  { a: 0.345, s: 9, pen: [
                    'M914.0 971.8L926.0 972.5',
                    'M1063.6 915.7L869.3 1090.3',
                    'M938.6 973.7L847.0 1048.9',
                    'M872.3 1007.6L894.1 995.1L893.6 993.7A80.9 80.9 0 0 0 925.3 974.4L925.5 974.5L926.0 974.0',
                    'M1087.0 905.1L881.4 1090.4',
                    'M1404.0 741.0C1403.5 742.5 1402.5 747.7 1400.8 750.2C1399.2 752.7 1444.4 731.7 1394.2 755.8C1343.9 780.0 1150.5 870.5 1099.3 895.0C1048.1 919.5 1089.1 901.7 1087.0 903.0',
                    'M1084.5 902.1L1063.6 913.2',
                    'M961.0 962.5L957.3 962.7L957.1 963.7A7.1 7.1 0 0 0 949.0 967.0L948.3 966.6L939.0 972.0',
                    'M960.9 962.8L971.5 955.8L975.0 958.4A47.6 47.6 0 0 1 1017.7 938.1L1018.0 933.9L1061.6 913.2',
                    'M961.1 963.1L957.4 969.1L956.9 968.7L850.6 1056.8',
                    'M927.0 972.6L937.0 971.8',
                  ] },
                  /* the numbers, chip, mark and printed type */
                  { a: 0.44, s: 7, note: true, pen: [
                    'M884.0 200.0C882.0 197.0 887.5 198.0 889.2 198.0C890.9 198.0 892.6 199.4 894.2 200.2C895.9 201.1 896.8 201.0 899.1 203.1C901.3 205.2 905.8 209.8 907.9 212.9C910.0 216.0 911.1 218.3 911.8 221.8C912.5 225.3 912.4 231.2 912.0 233.7C911.6 236.2 910.6 236.8 909.6 237.0C908.6 237.2 906.7 237.0 906.0 235.0C905.2 232.9 905.7 228.1 904.9 224.9C904.1 221.7 904.5 220.2 901.0 216.0C897.5 211.9 886.0 203.0 884.0 200.0Z',
                    'M882.0 219.7L885.9 233.1L885.2 233.6L890.9 234.1',
                    'M891.9 233.9L891.0 224.5L890.5 224.5A7.1 7.1 0 0 0 888.0 221.1L888.3 220.6L877.2 212.8',
                    'M891.0 234.0C892.1 234.0 896.6 235.7 897.8 234.2C898.9 232.8 898.3 227.7 898.0 225.3C897.7 223.0 898.6 223.2 896.0 220.2C893.4 217.1 885.5 209.3 882.6 207.0C879.7 204.7 879.6 206.0 878.7 206.3C877.7 206.7 877.3 208.6 877.0 209.0',
                    'M877.0 234.0C874.7 231.8 867.6 222.4 866.0 219.6C864.4 216.9 866.7 217.8 867.7 217.3C868.7 216.9 870.2 216.1 872.0 217.0C873.9 217.9 877.3 220.1 878.7 222.7C880.0 225.3 880.3 230.7 880.0 232.6C879.7 234.5 879.3 236.2 877.0 234.0Z',
                    'M572.0 309.0C575.8 312.2 582.7 326.8 586.2 330.0C589.7 333.2 591.6 328.7 592.9 328.0C594.2 327.3 596.5 330.6 594.0 325.5C591.5 320.5 581.0 302.9 577.8 297.8C574.5 292.7 575.7 295.3 574.4 295.0C573.2 294.7 571.4 295.0 570.3 296.0C569.3 297.0 569.3 299.3 568.0 300.8C566.7 302.4 563.2 303.9 562.5 305.5C561.8 307.1 562.0 310.0 563.6 310.6C565.2 311.2 568.2 305.8 572.0 309.0Z',
                    'M465.0 380.0C461.9 381.5 450.4 387.3 446.2 388.8C441.9 390.4 440.8 390.2 439.4 389.4C438.0 388.6 437.4 387.0 438.0 384.0C438.6 380.9 442.0 374.6 443.0 371.0C443.9 367.5 444.1 364.5 443.6 362.6C443.2 360.8 441.7 360.3 440.2 360.0C438.7 359.7 435.7 359.3 434.4 360.6C433.2 361.8 433.8 365.8 432.7 367.3C431.6 368.9 429.2 370.5 427.8 370.0C426.3 369.5 424.5 366.1 424.0 364.5C423.5 362.9 424.0 362.0 425.0 360.4C426.0 358.8 427.1 356.4 430.0 355.0C432.9 353.6 438.9 352.1 442.2 352.2C445.5 352.3 447.9 354.1 449.7 355.7C451.5 357.3 452.4 360.1 452.9 361.9C453.4 363.7 453.6 363.9 453.0 366.4C452.4 368.8 449.8 375.1 449.2 376.8',
                    'M465.3 378.8L462.3 374.7L461.7 374.7L450.1 378.3',
                    'M323.0 477.0C323.8 475.9 323.5 475.0 323.0 474.0C322.5 473.0 321.0 471.5 319.7 471.0C318.4 470.5 317.0 470.5 315.2 471.0C313.5 471.5 310.4 473.9 309.0 474.0C307.6 474.1 307.5 472.6 307.0 471.8C306.5 471.0 305.2 470.7 306.0 469.2C306.8 467.8 311.4 464.9 311.8 463.2C312.2 461.5 309.8 459.7 308.5 459.0C307.3 458.3 305.4 458.6 304.0 459.0C302.7 459.4 301.3 460.1 300.6 461.4C299.9 462.8 300.8 465.7 299.8 467.2C298.9 468.6 296.3 469.6 295.0 470.0C293.8 470.3 293.0 470.3 292.3 469.3C291.7 468.3 291.1 465.5 291.1 463.9C291.1 462.3 290.7 461.6 292.2 459.8C293.6 458.0 297.7 454.6 299.9 453.1C302.0 451.6 302.5 451.2 305.0 451.0C307.5 450.8 312.6 451.0 315.1 452.1C317.5 453.2 318.8 455.8 319.7 457.7C320.5 459.5 319.1 462.2 320.4 463.4C321.7 464.5 325.5 463.7 327.4 464.4C329.4 465.2 331.0 465.9 332.0 468.0C332.9 470.0 333.1 474.5 333.0 476.5C332.9 478.6 332.9 478.9 331.6 480.4C330.2 482.0 327.1 484.7 324.9 486.0C322.6 487.3 320.8 487.7 318.2 488.0C315.6 488.3 311.2 488.4 309.2 488.0C307.2 487.6 306.5 486.4 306.0 485.5C305.5 484.6 305.7 483.6 306.3 482.7C307.0 481.8 307.8 480.5 309.8 480.2C311.8 479.9 316.0 481.3 318.2 480.8C320.4 480.2 322.2 478.1 323.0 477.0Z',
                    'M193.0 558.0C192.9 553.8 192.0 555.3 193.4 553.6C194.7 552.0 197.0 546.8 201.4 548.4C205.7 549.9 215.5 560.8 219.3 563.0C223.1 565.2 223.1 561.4 224.3 561.3C225.6 561.3 226.1 562.1 226.7 562.7C227.4 563.4 228.1 564.0 228.0 565.2C227.9 566.5 226.0 568.5 226.3 570.3C226.6 572.1 230.2 574.6 229.8 576.2C229.4 577.8 226.1 580.0 223.9 580.0C221.7 580.0 218.3 576.8 216.7 576.3C215.0 575.8 216.7 575.2 214.0 577.0C211.2 578.8 203.5 586.7 200.1 587.0C196.8 587.3 195.2 583.9 194.0 579.1C192.8 574.3 193.1 562.2 193.0 558.0Z',
                    'M210.1 568.9L203.1 562.9',
                    'M202.4 574.0L201.8 564.0',
                    'M915.4 623.3L983.2 660.7',
                    'M891.1 669.8L907.3 677.8A5.3 5.3 0 0 1 909.7 685.2L910.1 685.4L909.8 695.6L907.8 696.2A37.0 37.0 0 0 1 907.4 721.8L908.0 722.1L838.6 756.2',
                    'M864.2 643.6L907.0 666.9L908.8 665.1A104.4 104.4 0 0 0 958.9 692.5L958.8 695.9L1024.2 665.5',
                    'M837.0 754.0C838.3 731.0 840.9 638.2 844.8 616.2C848.6 594.2 841.7 612.3 860.1 622.1C878.6 631.9 938.5 666.4 955.2 675.0C972.0 683.6 956.2 676.0 960.8 674.0C965.5 672.0 979.3 664.8 983.0 663.0',
                    'M913.8 625.0L912.5 637.8L911.8 638.5L893.8 629.0L894.3 628.6L896.1 594.0',
                    'M890.2 671.0L888.6 701.8L887.7 702.0A7.9 7.9 0 0 1 886.8 710.1L887.0 710.5L859.8 723.3L858.8 722.4L862.7 645.0',
                    'M897.5 593.1L1024.5 661.8',
                    'M993.8 829.9L982.1 729.5L982.9 728.7A6.8 6.8 0 0 1 983.8 718.1L1046.8 687.6',
                    'M849.7 776.6L1016.5 867.8',
                    'M973.1 783.0L972.7 771.3L973.2 770.7A66.3 66.3 0 0 0 925.0 742.0L925.3 739.0L924.1 738.1L969.8 764.3A150.1 150.1 0 0 0 921.7 738.7L921.4 738.6L849.5 774.0',
                    'M1041.8 797.3L1027.2 790.6',
                    'M1030.7 719.4L1002.4 733.6L1002.3 735.0A42.6 42.6 0 0 1 1004.5 756.3L1005.3 756.3L1018.5 865.9',
                    'M1031.7 719.9L1043.6 795.9',
                    'M894.5 775.1L925.7 759.7L929.7 764.6A9.8 9.8 0 0 1 946.0 773.2L950.8 774.2L971.6 784.8',
                    'M1048.0 689.0C1051.8 712.7 1068.0 807.3 1071.0 831.0C1074.0 854.6 1072.9 834.2 1065.9 830.9C1058.9 827.6 1035.6 814.8 1029.1 811.1C1022.6 807.4 1027.3 812.3 1027.0 809.0C1026.7 805.6 1027.0 794.0 1027.0 791.0',
                    'M991.4 832.0L894.5 777.8',
                    'M1332.0 702.0C1330.4 701.3 1328.9 699.3 1329.0 697.2C1329.1 695.2 1331.0 691.3 1332.4 689.6C1333.7 688.0 1336.0 687.4 1337.2 687.2C1338.4 687.0 1335.6 683.9 1339.6 688.6C1343.7 693.3 1357.5 710.5 1361.5 715.5C1365.6 720.6 1363.7 718.0 1364.0 719.0C1364.3 720.0 1364.5 720.9 1363.3 721.7C1362.1 722.5 1361.0 727.2 1356.8 723.8C1352.7 720.4 1342.6 705.1 1338.4 701.4C1334.3 697.8 1333.6 702.7 1332.0 702.0Z',
                    'M1315.0 707.0C1315.1 705.3 1314.2 698.8 1315.4 696.6C1316.5 694.5 1320.3 693.6 1321.8 694.0C1323.2 694.4 1323.3 695.7 1323.9 698.9C1324.6 702.2 1322.6 709.8 1325.4 713.4C1328.1 716.9 1336.7 718.3 1340.4 720.4C1344.2 722.5 1346.7 725.1 1348.0 726.0',
                    'M1314.0 708.1L1308.8 706.2L1308.5 706.3A9.4 9.4 0 0 0 1301.1 703.2L1300.9 702.6L1293.8 705.6',
                    'M1294.0 707.0C1297.8 709.2 1312.6 714.4 1317.0 720.1C1321.4 725.8 1318.6 738.2 1320.4 741.0C1322.2 743.8 1326.5 739.7 1327.8 737.2C1329.1 734.7 1328.0 727.9 1328.0 726.0',
                    'M1329.1 724.6L1335.7 726.8L1336.4 726.9A3.4 3.4 0 0 0 1341.5 729.2L1342.2 730.4L1348.2 727.4',
                  ] },
                ],
              },
              alt: 'A line drawing of the X1 Vault and the four X1 cards it splits a key across',
              still: true,
              /* THE FRAME'S CHROME CAME OFF, AND IT WAS FOUR THINGS: a plate
                 number and rule at the top left, a crosshair and remark out on
                 the white at the top right, and a signed rule in each bottom
                 corner. They were faithful to the frame this scene was drawn
                 from and they were four small grey things asking to be read
                 around one sentence and one object. Nothing in the film needs
                 to be told it is on plate 02. The renderers and the styles
                 went with them; the note in the stylesheet where they used to
                 be says what they were, in case the argument for them ever
                 looks better than the argument against. */
              kicker: 'The real question',
              h: 'X1 was never the problem.',
              facts: ['<b>$199</b>', '<b>Desktop-first</b>', '<b>Trusted</b>'],
              turn: 'And competitors at the same price were shipping high-end devices.',
              /* THE THREE CLAIMS, AND THEY ARE THE ANSWER TO THE HEADLINE.
                 X1 was fine; what it was not was reachable. Set as pills
                 because they are the only place in the film where three
                 short phrases have to read as one row of equals. */
              pills: [
                { i: 'chip',   t: 'EAL6+' },
                { i: 'split',  t: 'Shamir’s Secret Sharing' },
                { i: 'code',   t: 'Open Source' },
                { i: 'shield', t: 'Keylabs Audited' },
              ],
            },

            /* THE BUSINESS PROBLEM, FELT AS A QUANTITY. Two scenes in the
               first draft — the market, then the insight — merged here
               because it is one gesture: the field of people ignites and
               resolves into the device they are already holding. */
            { id: 'x0-market', kind: 'insight', dur: 170,
              film: 'assets/media/x0/insight.webm',
              film2: 'assets/media/x0/insight.mp4',
              poster: 'assets/media/x0/insight.webp',
              kicker: 'The insight',
              h: 'Mobile isn’t a platform decision.',
              h2: 'It’s where the money already lives.',
              p: 'Price and complexity were screening out the people self-custody was meant to protect.',
              stats: [
                { n: '6.8B+', l: 'smartphone users worldwide' },
                { n: '91%',   l: 'of crypto users use mobile daily' },
                { n: '<$50',  l: 'was the expected price range' },
              ],
              /* x / y are percentages of the video frame, around the phone */
              cards: [
                { i: 'bank',  t: 'Banking',   s: 'Salary, savings, bills.', x: 33, y: 10 },
                { i: 'cart',  t: 'Shopping',  s: 'Everyday payments.',      x: 31, y: 41 },
                { i: 'chart', t: 'Investing', s: 'Building wealth.',        x: 71, y: 19 },
                { i: 'coins', t: 'Crypto',    s: 'Your money, your control.', x: 71, y: 52 },
              ] },

            /* ==============================================================
               ACT II — THE QUESTION (06–10)
               Surprise. The altitude of the problem, and what it ruled out.
               ============================================================== */



            /* ==============================================================
               ACT IV — THE PRODUCT (21–27)
               Admiration. What was built, what it cost, and what is next.
               ============================================================== */

            /* --- CHAPTER 01 · THE PROBLEM ---------------------------------

               THE FIRST BREAK, AND IT COMES AFTER THE FLAGSHIP RATHER THAN
               BEFORE IT. Two scenes have just argued that X1 was correct and
               that the correctness stopped mattering; this rules a line under
               that and names what the next three scenes are about. */
            /* (the 01 · The problem chapter card was removed; the rail entry
               now points at the scene below) */

            /* THE PRODUCT'S ACTUAL REASON TO EXIST, AND IT IS A SUBTRACTION.
               This is the strongest idea in the project and it was missing
               from both earlier versions of the study. The vault device
               leaves the frame slowly and does not come back; three costs are
               struck through behind it. */
            { id: 'x0-subtract', nav: 'The Problem', kind: 'problem', dur: 170,
              
              h: 'The phone was already in their hand.',
              h2: 'So we stopped shipping a screen.',
              p: 'Most hardware wallets still rely on their own screen and buttons. It adds cost, complexity and friction — for something people already have in their pocket.',
              /* IMAGES TO COME. Leave `src` empty and the frame shows a grey
                 placeholder with its label; fill `src` with a path under
                 assets/img/x0/ and the picture takes its place. */
              hero: { src: 'assets/img/x0/problem/hero.webp', label: 'Hero render · phone + X0 card', alt: 'An X0 card tapped against the back of a phone' },
              compare: [
                { t: 'Traditional hardware wallet', s: 'A separate device, screen, buttons and a learning curve.',
                  label: 'Hardware wallet',
                  pair: [
                    { src: 'assets/img/x0/problem/hw-trezor.webp', side: 'l', alt: 'A Trezor Safe 7' },
                    { src: 'assets/img/x0/problem/hw-ledger.webp', side: 'r', alt: 'A Ledger Nano X' },
                  ] },
                { t: 'Cypherock X1', s: 'High-end security with EAL6+ and Shamir Secret Sharing.',
                  src: 'assets/img/x0/problem/x1-set.webp', label: 'Cypherock X1',
                  alt: 'The Cypherock X1 vault and its cards', bleed: true, fade: true },
              ],
              /* x / y: where the note's corner sits; dx / dy: the dot on the
                 render. Both in % of the render's own box. */
              notes: [
                { t: 'The same security layer. Just without the screen.', layout: 'row',
                  x: 76, y: 6, lx: 80, ly: 23, dx: 71.5, dy: 38.8,
                  src: 'assets/img/x0/problem/thumb-chip.webp', label: 'Detail', alt: 'Close-up of the X0 card chip' },
                { t: 'A card that lives in your wallet. Not on your desk.', layout: 'stack',
                  x: 84, y: 70, lx: 84, ly: 88, dx: 73.2, dy: 88.6,
                  src: 'assets/img/x0/problem/thumb-edge.webp', label: 'Detail', alt: 'Close-up of the X0 card edge' },
              ] },

            /* THE TITLE CARD, and the one the reader will screenshot. The
               fourth word holds because it is the one nobody expects to
               survive the other three. */
            { id: 'x0-brief', kind: 'words', dur: 200, dark: true,
              mark: 'assets/img/x0/problem/mark-icon.webp',
              kicker: 'The brief, in four words',
              items: ['Affordable.', 'Mobile-first.', 'Simple.', 'Secure.'],
              p: 'The first three were the brief. The fourth was non-negotiable.' },
            /* --- CHAPTER 02 · UNDERSTANDING THE BRIEF ---------------------------------

               THE BRIEF AND NOT THE USER, WHICH IS WHAT ACTUALLY HAPPENED.
               The honest version of this chapter is that the research was done
               ON the brief — five words, a stack of assumptions, and eight
               questions nobody had written down. Calling it "understanding the
               user" would be the template’s word for it, not the project’s. */
            /* (the 02 · Understanding the brief chapter card was removed; the
               Research rail entry now points at the scene below) */

            /* THE SPINE, and the only white frame in the film. Nothing moves
               in it: after five scenes of motion, stillness is the effect,
               and this is the one moment the reader is meant to stop
               scrolling to read. */
            /* AND IT IS THE LONGEST HOLD IN THE FILM. At 120 the block held
               for a fifth of a screen and then spent a whole screen sliding
               away — which is why it arrived all at once and then left the
               reader staring at white. At 210 the sentence is read across
               real scroll and then sat with. */
            { id: 'x0-question', nav: 'Research', act: 'II · Question', kind: 'ask', dur: 210,
              kicker: 'The actual question',
              /* THREE LINES, NOT SIX. Set at the old poster size this ran
                 down the whole frame and stopped being a sentence you read in
                 one go — it became a wall you scanned. Smaller and wider, it
                 is three lines and one breath. The one word the sentence
                 turns on is marked, and it is the only warm colour in the
                 film: a highlighter stroke swiped under the glyphs, uneven at
                 both ends, drawn across as you arrive. */
              tight: true,
              h: 'How do you launch a new product without '
                + '<mark>cannibalising</mark> the flagship it sits next to?',
              p: 'Not “how do you design an app?”', pat: 0.72 },

            /* THE BRIEF AS IT ARRIVED, and then eight questions that nobody
               had answered. The accumulation is the point — nothing leaves,
               so by the eighth the frame is crowded, which is what the start
               of the project felt like and is not something a paragraph can
               do. The two in brass are the two that decide the rest. */
            /* THE EIGHT ARE A CONVERSATION AND THEY ARE SET AS ONE. Not a
               requirements list — a list is answered and closed, and none of
               these were. They are the things we kept saying to each other,
               so they arrive one at a time, at a pace, with a time under each,
               and the reader is over a shoulder rather than in a document.

               THE WIDTHS ARE COMPOSED BY EYE AND THAT IS THE WHOLE TRICK.
               Bubbles auto-sized to their text all come out within a few
               percent of one another, and eight near-identical rectangles is
               the exact tell that nothing was designed. So every `w` below is
               set deliberately, no two neighbours alike: the two-word ones get
               a third of the column, the long one about unspecced features
               runs almost the full width, and `pad` opens a wider gap where
               the real conversation paused to think. */
            { id: 'x0-brief-real', kind: 'msgs', dur: 280,
              kicker: 'What was handed over',
              quotes: [
                'They didn’t say <em>can you make us some screens.</em>',
                'They said <em>we are launching a completely new product.</em>',
              ],
              /* the figure carries its own thought objects, so nothing is
                 layered on top of it — see the renderer's note */
              art: 'assets/img/x0/think/thinking.webp',
              /* line-art out of the work itself, never pictograms */
              bits: [
                { k: 'grid',  x: '10%', y: '18%', w: 'min(4.4vw, 2.9rem)', at: 0.10, rot: '-6deg', dep: '-14px', o: 0.16 },
                { k: 'wire',  x: '89%', y: '26%', w: 'min(5.2vw, 3.4rem)', at: 0.18, rot: '5deg',  dep: '10px',  o: 0.24 },
                { k: 'chip',  x: '14%', y: '74%', w: 'min(4.8vw, 3.1rem)', at: 0.26, rot: '-3deg', dep: '12px',  o: 0.26 },
                { k: 'dim',   x: '80%', y: '86%', w: 'min(5.6vw, 3.6rem)', at: 0.34, rot: '2deg',  dep: '-8px',  o: 0.2 },
                { k: 'stack', x: '5%',  y: '52%', w: 'min(4.2vw, 2.7rem)', at: 0.42, rot: '4deg',  dep: '-16px', o: 0.22 },
                { k: 'mark',  x: '95%', y: '60%', w: 'min(3.2vw, 2rem)',   at: 0.50, rot: '-2deg', dep: '6px',   o: 0.18 },
              ],
              /* THE STAGGER IS THE WHOLE THING, and the first pass lost it.
                 Eight bubbles sharing a left edge is a chat log: a neat blue
                 column with an image parked beside it and a dead lane down the
                 middle. These did not arrive in a queue — they arrived over
                 days, from different directions, some landing harder than
                 others — so each one carries its OWN indent, and the indents
                 are not a progression. 2, 28, 66, 38, 13, 48, 0, 33: the eye
                 cannot find a rule in that, which is the point. The deepest
                 ones reach into the middle of the frame, so the two halves
                 interlock instead of sitting either side of a gap.

                 AND THEY ARE SIZED TO WHAT THEY SAY. Width is the text's own
                 width now, capped so the long ones wrap — three weights, not
                 one: two asides set small and quiet, four at reading size, and
                 the two that decided everything a clear step up. `gap` varies
                 the silence between them, because a conversation that pauses
                 before the hard question is a conversation and not a list. */
              items: [
                { t: 'Should it look like X1?',        ox: '2%',  w: '78%', time: '9:12' },
                { t: 'Should it look different?',      ox: '28%', w: '72%', time: '9:14', keep: true, pad: '0.9rem',
                  react: { e: '🤔', c: 'tr', d: 0.055 } },
                { t: 'What stays?',                    ox: '66%', w: '50%', time: '9:16', sm: true, pad: '0.45rem' },
                { t: 'What changes?',                  ox: '38%', w: '50%', time: '9:17', sm: true, pad: '0.3rem' },
                { t: 'What can we reuse?',             ox: '13%', w: '62%', time: '9:20', pad: '0.75rem',
                  react: { e: '🧩', c: 'tl', d: 0.07 } },
                { t: 'What deserves a new language?',  ox: '48%', w: '80%', time: '9:22', keep: true, pad: '1rem',
                  react: { e: '💡', c: 'tr', d: 0.05 } },
                { t: 'How do we prepare for features nobody has specced?',
                  ox: '0%', w: '84%', time: '9:24', pad: '0.9rem' },
                { t: 'How do we keep development scalable?', ox: '33%', w: '76%', time: '9:26', pad: '0.5rem',
                  react: { e: '⚙️', c: 'br', d: 0.06 } },
              ] },

            /* FIVE REQUIREMENTS, TWO OF WHICH CANNOT BOTH BE TRUE. The
               contradiction is drawn as a hairline between the two lines
               rather than explained underneath them. */
            { id: 'x0-five', kind: 'stack', dur: 160,
              kicker: 'Five things at once',
              items: [
                { t: 'Approachable.' },
                { t: 'Modern.' },
                { t: 'For everyone.' },
                { t: 'Different from X1.', fight: true, tie: true },
                { t: 'Unmistakably Cypherock.', fight: true },
              ],
              p: 'It had to look better than the flagship without embarrassing it.' },
            /* --- CHAPTER 03 · FINDING THE DIRECTION ---------------------------------

               THE TURN. Everything before this chapter is the problem; everything
               after it is a consequence of the two decisions inside it. */
            /* (the 03 · Finding the direction chapter card was removed; the
               Direction rail entry now points at the scene below) */

            /* THE CONTRADICTION CONVERTED INTO A DIRECTION. Each connector
               draws down and then its word appears, so the reader feels the
               logic close rather than reading a list of five nouns. */
            { id: 'x0-logic', nav: 'Direction', kind: 'chain', dur: 200,
              items: [
                'Same brand',
                'Different audience',
                'Different product',
                'Different experience',
                'A different design language',
              ],
              h: 'A unique identity wasn’t a preference. It was the only way both products survive.',
              /* one brand in the middle, a product either side of it */
              p: 'Two products. Distinct users. A shared foundation.<br>A design language built to unite, not compete.',
              pair: {
                left:  { src: 'assets/img/x0/problem/dir-fan.webp' },
                right: { src: 'assets/img/x0/problem/dir-vault.webp' },
                /* x / y: the stop, in the 2000 × 1183 grid; lift: dot to label top */
                stops: [
                  { x: 260, y: 588, at: 0.14, lift: 7.8,  k: 'Same brand',           t: 'A unified visual language<br>across both products.' },
                  { x: 720, y: 611, at: 0.21, lift: -3.2, k: 'Different audience',   t: 'Distinct needs.<br>Tailored experiences.' },
                  { x: 1250, y: 882, at: 0.28, lift: 7.8,  k: 'Different product',    t: 'Two form factors.<br>One cohesive identity.' },
                  { x: 1900, y: 1030, at: 0.36, lift: 7.8,  k: 'Different experience', t: 'Seamless, secure<br>and purpose-built.' },
                ],
              } },

            /* ==============================================================
               ACT III — THE DECISIONS (11–20)
               Understanding. Each decision with the alternative taken
               seriously, because that is what separates a decision from a
               preference.
               ============================================================== */

            /* The second of the film's two motionless scenes. A decision is
               being announced, and the film slows down to announce it. */
            { id: 'x0-dec-1', act: 'III · Decisions', kind: 'ask', dur: 110, dark: true,
              n: 'Decision 01',
              h: '<span class="fg-key">Don’t reuse</span> the design system that already existed.' },
            /* --- CHAPTER 04 · BUILDING THE SYSTEM ---------------------------------

               THE LONGEST CHAPTER IN THE FILM SITS BEHIND THIS CARD: the split,
               and then the eight-scene room. It is the one place a reader most
               needs to be told they are entering something, because the room
               changes ground and holds for six screens. */
            /* x0-ch-4 chapter card removed. */

            /* THE CASE AGAINST, THEN THE ANSWER, on one pin. The left column
               fills while the right stays black — the asymmetry is
               uncomfortable on purpose, and the reader starting to want the
               answer is the scene's job. Then the left dims as the right
               fills, which is the whole argument in one gesture. */
            { id: 'x0-n45', nav: 'Design System', kind: 'split', dur: 190,
              left: {
                title: 'Why not CySync',
                items: [
                  'Built for a desktop window, not a thumb.',
                  'Component-heavy where X0 needed few clear parts.',
                  'Interaction patterns from another platform.',
                  'And carrying X1’s language into X0 would have made X0 look like a discount X1.',
                ],
              },
              right: {
                title: 'What replaced it',
                name: 'N45',
                items: [
                  'Atomic.',
                  'Mobile-specific, with no inheritance from CySync.',
                  'Reusable.',
                  'Built to scale to features nobody had specced.',
                  'Developer friendly.',
                ],
              },
              /* THE THIRD TRACK, AND IT IS A SPECIFICATION RATHER THAN A
                 PICTURE. Every number here was read out of the CySync file
                 itself — 65 variables in two collections, 31 paint styles,
                 1,664 components in 150 sets across 84 pages, and no text
                 styles at all. A screenshot of a component sheet at a quarter
                 of a column would say "there were a lot of things", which the
                 sentence on the left already says better.

                 THE HEADLINE IS THE SYSTEM'S OWN VARIABLE. `Mini Width` is
                 1024 and `Mini Height` is 700: the smallest window CySync is
                 prepared to be, written down, by CySync. There is no stronger
                 way to say "built for a desktop window, not a thumb" than to
                 quote the system saying it about itself — and nothing here is
                 unkind, because none of it is an opinion. */
              art: { kind: 'spec', ratio: 0.74,
                n: 'CySync · what we did not inherit',
                head: { k: 'Minimum window', v: '1024 × 700',
                  of: 'Not a guideline — two variables in the file. Mini Width, Mini Height.' },
                rows: [
                  /* the real hexes, darkest to lightest: the sidebar, the
                     ground, the inputs, the borders, the paragraph grey, the
                     hover, and the three golds */
                  { k: 'Colour', v: '46 variables · 2 modes',
                    swatches: ['#1e1a15', '#211c18', '#27221d', '#2c2520', '#39322c',
                      '#8b8682', '#ccc4be', '#e9b873', '#fedd8f', '#b78d51'] },
                  { k: 'Spacing', v: '14 steps · 8pt',
                    ticks: [0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104] },
                  { k: 'Type', v: 'No text styles',
                    of: 'Typography lived in one frame of website headings. It was never tokenised, so there was nothing to inherit.' },
                  { k: 'Components', v: '1,664 in 150 sets',
                    of: '1,086 of them icons. 192 buttons across 27 sets. Eighty-four pages.' },
                ],
                foot: 'Read out of the CySync file, September 2026.' },

              /* --- THE OLD SYSTEM, STILL ON THE TABLE ---------------------

                 NINE REAL ARTEFACTS OUT OF THE CYSYNC FILE, strewn across the
                 bands the three text tracks do not use — above the reasons,
                 below them, and off all four edges. They are not decoration
                 and they are not a gallery: the argument on the left is that
                 CySync was a finished desktop language, and a reader is owed
                 the evidence while they are being asked to accept it. So the
                 field fills through the whole first half of the pin, one
                 piece at a time, WHILE the reasons are being read.

                 AND THEN IT GOES BACK. At 0.5 — the exact frame the left
                 column starts dimming and N45 starts arriving — the whole
                 field recedes to a quarter on the same clock. Nothing is
                 removed, nothing is mocked, nothing is redrawn worse than it
                 is: the old system is simply put behind the new one, which is
                 what actually happened and is a truer read of "legacy" than
                 any amount of distressing would be. It is still legible over
                 there, which is the point — you can see it was good, and you
                 can see it was not this.

                 EVERY PIECE IS CROPPED BY SOMETHING — the window, the stage,
                 or another piece. A system you can see all of looks like a
                 catalogue; a system running off every edge looks like one you
                 inherited. `dia` is the interim drawing and `src` is the real
                 export; adding the second changes nothing else about the
                 composition.

                 The nine are the curated set: the sidebar, the topbar, the
                 button sheet, the range picker, the transactions table, the
                 desktop Send window, the truncation rules, the type scale and
                 the account dropdown. */
              strew: [
                /* --- THE FIELD IS TWELVE, AND IT USED TO BE FIFTEEN --------

                   THE FIRST CUT OVERLAPPED. Every one of these exports carries
                   its own soft drop shadow in its alpha, so a piece's box is a
                   good deal bigger than the thing you can see in it; three of
                   them crossing each other turned the bottom of the frame into
                   grey haze rather than into depth. Depth needs one edge in
                   front of another edge — not four translucent rectangles
                   averaging out.

                   So the count came down and the spacing went up. Pieces are
                   now cropped by the WINDOW, which reads as a system running
                   off the edges, rather than by each other, which reads as a
                   rendering fault. Where two do meet it is a deliberate
                   corner-over-corner, never a face over a face. */

                /* --- the top band ---------------------------------------- */

                /* FIRST IN, AND IT MAKES THE WHOLE ARGUMENT: 300px of screen
                   the product assumed it would always have. */
                { at: 0.030, sp: 9, x: '3%', y: '14%', w: 'min(9vw, 12rem)', ratio: 0.36, z: 2,
                  src: 'assets/img/x0/cysync/cysync-navigation.png',
                  dim: 0.95, dy: '-3vh', rot: '-6deg', dep: '-14px',
                  alt: 'The CySync sidebar — nine permanent destinations in a 300px rail' },

                /* a 34:1 hairline along the very top edge */
                { at: 0.065, sp: 9, x: '44%', y: '0%', w: 'min(46vw, 54rem)', ratio: 34.6, z: 1,
                  src: 'assets/img/x0/cysync/cysync-notifications.png',
                  dim: 0.85, dy: '-4vh', rot: '-2deg', dep: '-6px',
                  alt: 'The CySync firmware update notification bar, 1384px wide' },

                /* 1416 x 100, and the least portable object in the system */
                { at: 0.100, sp: 9, x: '71%', y: '2%', w: 'min(32vw, 38rem)', ratio: 14.16, z: 1,
                  src: 'assets/img/x0/cysync/cysync-topbar.png',
                  dim: 0.9, dx: '3vw', dy: '-3vh', rot: '1.4deg', dep: '-8px',
                  alt: 'The CySync topbar at 1416px wide' },

                /* THE POINTER ARGUMENT, AND IT IS THE BEST ONE IN THE FILE.
                   Five range tabs, a wallet dropdown and two tooltips pinned to
                   a crosshair — every one of them something you do with a
                   cursor you can rest somewhere and hold still. */
                { at: 0.135, sp: 9, x: '26%', y: '12%', w: 'min(30vw, 36rem)', ratio: 2.52, z: 2,
                  src: 'assets/img/x0/cysync/cysync-graph.png',
                  dim: 0.95, dx: '-4vw', dy: '-3vh', rot: '3deg', dep: '-20px',
                  alt: 'The CySync portfolio graph — range tabs, wallet dropdown, hover tooltips' },

                /* THE HARDWARE, AND IT IS WHY A DESKTOP APP EXISTED AT ALL.
                   The one object in the field X0 could not redraw smaller,
                   because the thing it is about is physical and plugs in. */
                { at: 0.170, sp: 9, x: '69%', y: '19%', w: 'min(17.5vw, 21rem)', ratio: 2.43, z: 2,
                  src: 'assets/img/x0/cysync/cysync-x1-vault.png',
                  dim: 1, dx: '4vw', dy: '-2vh', rot: '2.4deg', dep: '16px',
                  alt: 'The Cypherock X1 vault' },

                /* the modal, cropped by the right edge above the spec sheet */
                { at: 0.205, sp: 9, x: '97%', y: '2%', w: 'min(12.5vw, 15rem)', ratio: 1.393, z: 2,
                  src: 'assets/img/x0/cysync/cysync-dialogue.png',
                  dim: 0.9, dx: '5vw', dy: '-2vh', rot: '-2.6deg', dep: '-16px',
                  alt: 'A CySync error dialogue — the X1 Card has malfunctioned' },

                /* the small crisp accent: a range dragged across a month grid */
                { at: 0.240, sp: 9, x: '51%', y: '13%', w: 'min(7vw, 8rem)', ratio: 0.875, z: 3,
                  src: 'assets/img/x0/cysync/cysync-date-range.png',
                  dim: 1, dy: '-2.5vh', rot: '3.6deg', dep: '12px',
                  alt: 'The CySync date range picker, a range dragged across a month grid' },

                /* the one confirmation the system ever drew — slotted into
                   the clear line between the graph and the first reason */
                { at: 0.275, sp: 9, x: '30%', y: '32%', w: 'min(18.5vw, 22rem)', ratio: 10.6, z: 2,
                  src: 'assets/img/x0/cysync/cysync-success.png',
                  dim: 0.95, dx: '-4vw', rot: '-2.8deg', dep: '8px',
                  alt: 'The CySync success message bar' },

                /* --- the bottom band ------------------------------------- */

                /* five sortable columns, date group headers and asset names
                   already truncating. There is no thumb-sized version of this
                   object, only a different object. */
                { at: 0.310, sp: 9, x: '8%', y: '92%', w: 'min(27vw, 32rem)', ratio: 1.46, z: 2,
                  src: 'assets/img/x0/cysync/cysync-tables.png',
                  dim: 0.95, dx: '-3vw', dy: '4vh', rot: '-4deg', dep: '-16px',
                  alt: 'The CySync transactions table — five sortable columns' },

                /* the pairing step, and the only picture in the section with
                   physical objects in it */
                { at: 0.345, sp: 9, x: '37%', y: '94%', w: 'min(14.6vw, 18rem)', ratio: 0.964, z: 3,
                  src: 'assets/img/x0/cysync/cysync-enter-pin.png',
                  dim: 1, dy: '5vh', rot: '2.8deg', dep: '20px',
                  alt: 'The X1 card and vault, entering a PIN on the device' },

                /* the whole product in one frame: a five-step rail down the
                   left, a 400px modal in the middle of a 1440px window, and a
                   great deal of chrome around both */
                { at: 0.380, sp: 9, x: '64%', y: '94%', w: 'min(26vw, 31rem)', ratio: 1.6, z: 1,
                  src: 'assets/img/x0/cysync/cysync-desktop-layout.png',
                  dim: 0.9, dy: '5vh', rot: '-5deg', dep: '-22px',
                  alt: 'The CySync Send window at 1440 x 900' },

                /* the densest single panel in the system, last in, bottom
                   right, under the spec sheet rather than across it */
                { at: 0.415, sp: 9, x: '97%', y: '97%', w: 'min(12.3vw, 15rem)', ratio: 0.904, z: 2,
                  src: 'assets/img/x0/cysync/cysync-transaction-details.png',
                  dim: 0.95, dx: '3vw', dy: '4vh', rot: '-3.4deg', dep: '-12px',
                  alt: 'The CySync transaction details panel' },
              ] },

            /* THE ASSEMBLY, and the longest scene in the film. The system is
               proved by building the product out of it on screen: eight parts
               arrive around one button and none of them leave, and by the end
               the accumulated parts are a screen. It should feel long. */
            /* ==============================================================
               THE DESIGN SYSTEM — one table, one pin, and now one story

               THE ROOM DID NOT CHANGE. Every resting place, every width, every
               dim, every drift rate and the whole final composition are the
               ones that were already here — this is the same table with the
               same things on it, ending on the same frame. What changed is the
               order they happen in, and what they do on the way.

               THE CLAIM, STATED AS A SEQUENCE: the system existed before the
               interface did.

                 0.00 – 0.04   a dark room, a grid, a glow. Nothing else.
                 0.04 – 0.16   THE LOCKUP, at 96px, and a long hold on it
                 0.13 – 0.27   THE DEVICE IS DRAFTED — one stroke, drawn from
                               a corner all the way round. No interface.
                 0.26 – 0.33   the body fills in behind the outline. Still no
                               interface: an empty, opaque object.
                 0.34 – 0.52   the system arrives and takes up its orbit
                 0.52 – 0.86   EIGHT ROUND TRIPS. One piece leaves, goes in
                               behind the phone, the band it authors comes on,
                               the piece comes back to exactly where it was.
                 0.86 – 0.90   everything home, the product finished, held
                 0.90 – 1.00   the line

               760svh, so about 5,940px of pin at a 900px viewport: roughly
               250px of scroll per construction beat and a good deal more than
               that on either side of them. Every one of those beats introduces
               one thing and nothing else moves while it does.

               WHY A ROUND TRIP RATHER THAN A ONE-WAY JOURNEY. Because the
               ending is the point. If the pieces were consumed by the phone
               the section would say "these were scaffolding"; coming back to
               the exact pixel they left, and staying there under the closing
               line, it says "these are what it is made of, and they are still
               true". There is one resting position per object, not two, so
               there is nothing to keep in sync.

               THE PHONE IS NEVER TRANSPARENT. The empty device is the render
               at five percent brightness — every pixel inside the bezel is a
               pixel, only a very dark one — and every artefact travels BEHIND
               it, so at no point is anything visible through the screen.
               ============================================================== */

            /* THE SAME FILM IN PORTRAIT, AND `ndur` IS THE ONLY THING ABOUT IT
               THAT IS SHORTER. 620svh of pin at a 830px window is 4,300px of
               scroll; 430 at an 844px phone is 2,800, which is the same twelve
               beats at about two thirds of the travel — a flick each rather
               than a flick and a half. Not one beat is dropped and not one
               changes its place in the pin: every `at` below is a fraction of
               the section, so the whole choreography compresses with it. */
            { id: 'x0-system', kind: 'room', dur: 620, ndur: 430, lab: true, room: true,

              say: [
                /* A TITLE CARD, AND IT IS ALLOWED TO BE ONE. The mark at 96px
                   in the middle of an otherwise empty column, held for a sixth
                   of the section, with the words on the same line and a gap
                   smaller than the mark is tall. It is one object, it is the
                   only object, and nothing happens until it has gone. */
                { at: -0.02, to: 0.88, big: true, k: 'Introducing', n: 'N45 Design System',
                  mark: 'assets/img/x0/system/n45-mark.png' },

                /* and it lands here, after you have watched the thing build
                   itself out of the parts standing around it */
                { at: 0.90, to: 1.2,
                  h: 'We built the system before we built a single screen.',
                  p: 'Not a library extracted from finished work. A grammar, written first — atomic, mobile-first, no inheritance from CySync — and by month six it was carrying surfaces nobody had specced when it was written.' },
              ],

              /* THE PRODUCT, and it is an empty one for a quarter of the
                 section. `k` is how much of the frame's height it covers,
                 which is what every flight path is computed from; `full` is
                 when the shell comes up from five percent to the render as
                 exported, once the bands have covered the screen anyway. */
              /* THE ASSET IS THE INTERFACE ON ITS OWN NOW — no bezel, no
                 frame, no mockup, corners cut in its own alpha. The phone
                 around it is drawn in CSS, which is what lets it have a real
                 edge, a real rail and a real power button, and what lets the
                 blank state be a screen going dark rather than a contrast
                 filter fighting a picture of a bezel.

                 AND IT STAYS SMALL UNTIL IT HAS EARNED THE FRAME. It stands
                 at a quarter of the width for the whole of the section, in the
                 middle of the parts it was made from, because the subject of
                 those nine tenths is the system and not the product. The frame
                 is its reward, and the reward comes at the end. */
              /* AND IN PORTRAIT IT IS CENTRED AND IT IS BIGGER, because the
                 reason it stood at a quarter of the width — the parts are
                 laid out around it and it must not crowd them — is a fact
                 about a landscape frame. In a tall one the parts go above and
                 below, the horizontal middle is the phone's to take, and the
                 hero at half the screen's height is the smallest it can be
                 and still be the hero. `min(52vw, 25vh)` is that half: the vh
                 term governs on a tall phone and the vw term on a short one,
                 so it lands at 49–52% of the viewport on everything from a
                 360x640 to a 430x932 and never overflows the width. */
              device: { at: 0.34, x: '56%', y: '50%', w: 'min(24vw, 19rem)',
                n: { x: '50%', y: '47%', w: 'min(52vw, 25vh)', dep: '-10px' },
                dep: '-14px', z: 18, full: 0.46,
                src: 'assets/img/x0/system/ui.webp', pw: 786, ph: 1734,

                /* THE HARDWARE, AND IT IS A FILE. A transparent render of an
                   iPhone 16 Pro with its screen cut clean out. Nothing in this
                   codebase describes a phone any more; whatever this render
                   is, is what you see.

                   EVERY NUMBER BELOW WAS MEASURED OFF ITS OWN ALPHA CHANNEL,
                   not estimated. Trimmed to its silhouette the file is
                   1292 x 2658, and the hole in it is 1179 x 2564 — which is
                   the iPhone 16 Pro's display to the pixel, so the aperture is
                   the real one and the UI sits in it at the real size. */
                frame: 'assets/img/x0/system/iphone.webp', fw: 1292, fh: 2658,
                screen: { t: 1.768, r: 4.412, b: 1.768, l: 4.334 },
                /* the hole's own corner: 190px on 1179 x 2564 */
                srad: { x: 16.115, y: 7.410 },

                /* and the draft, which is now the render's OWN silhouette:
                   1292 x 2658 with a 255px corner, both read off the same
                   alpha. It can cross-dissolve into the mockup without moving
                   a pixel because it is the same outline. */
                draw: { at: 0.10, sp: 7.15, out: 0.34, gone: 0.42 },

                alt: 'The X0 Home screen — combined portfolio, balance, send and receive, accounts' },

              /* THE TEN BANDS OF THE SCREEN. `from`/`to` are percentages down
                 the render, measured at its dark gutters, and each one lands
                 the moment the piece that authored it is behind the phone. The
                 two vw it travels come from the direction that piece arrived
                 from, so a band is not placed — it is put there, from the side
                 the part came in on. */

              /* THE TABLE, UNCHANGED. Same places, same widths, same dims,
                 same entry vectors, same drifts. `orb` is new and it is how
                 far each piece comes round the phone across the whole pin —
                 under a degree for the far sheets, two and a half for the near
                 components, so no two ever travel together. `tp`/`tb`/`ty` are
                 the round trip: when it leaves, when it starts back, and which
                 band of the render it goes to. Three of them never leave. */
              objects: [
                /* --- the far plane: the six sheets ------------------------ */

                /* typography, and the first to go in: a number set in the type
                   scale is the first thing the type scale can prove */
                { at: 0.400, sp: 22, x: '86%', y: '25%', w: '39vw', z: 2, dim: 0.62,
                  dx: '9.13vw', dy: '-0.10vh', rot: '-1.6deg', dep: '-40px', spin: '-0.8deg',
                  orb: '0.9deg',
                  /* PORTRAIT. Still the first sheet in and still the largest
                     thing on the far plane; it comes down from above the frame
                     instead of in from the right, because above is where the
                     room is. */
                  n: { x: '68%', y: '19%', w: 'min(64vw, 30vh)', dx: '6vw', dy: '-13vh', dep: '-24px' },
                  src: 'assets/img/x0/system/type-scale.svg', pw: 1366, ph: 764,
                  alt: 'Eleven type roles from Hero at 40px down to Micro at 10px' },

                /* the grid the device was drawn on. It does not travel: it is
                   already in the phone — it is the reason the phone is that
                   shape — and sending it in would be sending it twice. */
                { at: 0.414, sp: 22, x: '11%', y: '88%', w: '28vw', z: 1, dim: 0.34,
                  dx: '-9.13vw', dy: '0.23vh', dep: '-54px', spin: '0.6deg',
                  orb: '0.7deg',
                  n: { x: '24%', y: '88%', w: 'min(56vw, 26vh)', dx: '-6vw', dy: '12vh', dep: '-32px' },
                  src: 'assets/img/x0/system/spacing.svg', pw: 1164, ph: 695,
                  alt: 'The N45 4-point spacing grid, 04 through 24' },

                /* the tokens, and the LAST thing in — the chart goes green on
                   the final beat, which is the one moment of colour in the
                   product and the right note to finish a build on */
                { at: 0.428, sp: 22, x: '7%', y: '61%', w: '21vw', z: 1, dim: 0.42,
                  dx: '-8.36vw', dy: '-5.88vh', rot: '1.2deg', dep: '-30px', scl: 0.03,
                  orb: '1.1deg',
                  n: { x: '24%', y: '21%', w: 'min(40vw, 18vh)', dx: '-7vw', dy: '-11vh', dep: '-20px' },
                  src: 'assets/img/x0/system/colour.svg', pw: 1557, ph: 764,
                  m: { n: 'Colour', s: '10 tokens, named not numbered', at: 'br' },
                  alt: 'The N45 greyscale ramp — ten named steps with their hex values' },

                /* components. NOT dimmed: the file is exported at 30% opacity,
                   so the artwork is doing its own receding. */
                { at: 0.442, sp: 22, x: '43%', y: '101%', w: '30vw', z: 2,
                  dx: '-5.14vw', dy: '12.07vh', rot: '1.4deg', dep: '-96px', spin: '1.8deg',
                  orb: '0.8deg',
                  /* it still runs off the bottom of the frame, which is the
                     one thing about its placement that was never about width */
                  n: { x: '58%', y: '101%', w: 'min(66vw, 30vh)', dx: '4vw', dy: '14vh', dep: '-52px' },
                  src: 'assets/img/x0/system/buttons.svg', pw: 1354, ph: 712,
                  alt: 'Primary, secondary and tertiary buttons in every state' },

                /* the icon set — and what it goes in to build is the only part
                   of the screen that is nothing but icons */
                { at: 0.456, sp: 22, x: '94%', y: '52%', w: '15vw', z: 2, dim: 0.44,
                  dx: '7.69vw', dy: '7.88vh', rot: '-2.4deg', dep: '-26px',
                  orb: '1.4deg',
                  n: { x: '72%', y: '7%', w: 'min(40vw, 18vh)', dx: '7vw', dy: '-12vh', dep: '-16px' },
                  src: 'assets/img/x0/system/icons.svg', pw: 1038, ph: 712,
                  alt: 'The N45 icon set, unfilled and filled' },

                /* navigation, low right, off the edge */
                { at: 0.470, sp: 22, x: '89%', y: '79%', w: '36vw', z: 3, dim: 0.50,
                  dx: '5.35vw', dy: '11.84vh', rot: '-1deg', dep: '-38px',
                  orb: '1.2deg',
                  n: { x: '76%', y: '79%', w: 'min(58vw, 27vh)', dx: '6vw', dy: '10vh', dep: '-22px' },
                  src: 'assets/img/x0/system/tab-bar.svg', pw: 1247, ph: 612,
                  alt: 'The navigation bar, Home selected' },

                /* --- the near plane: the five real components ------------- */

                /* the one object in the room that drifts DOWN, and the one
                   that authors two bands: the card and the rows under it */
                { at: 0.484, sp: 22, x: '40%', y: '58%', w: '17vw', z: 12, dim: 0.62,
                  dx: '-6.38vw', dy: '-0.80vh', rot: '-1deg', dep: '38px',
                  orb: '2deg',
                  /* the near plane tucks in against the phone's top and bottom
                     edges rather than beside it — a component at 44vw beside a
                     phone at 52vw is off the frame */
                  n: { x: '46%', y: '14%', w: 'min(44vw, 20vh)', dx: '-5vw', dy: '-7vh', dep: '20px' },
                  src: 'assets/img/x0/system/snackbar.svg', pw: 376, ph: 76,
                  alt: 'The success snackbar — System synced successfully' },

                /* it stays. There is no slide-to-confirm on the Home screen,
                   and sending a piece in to build something that is not there
                   would be the one dishonest move in the section. */
                { at: 0.498, sp: 22, x: '39%', y: '78%', w: '22vw', z: 12, dim: 0.62,
                  dx: '-6.01vw', dy: '3.53vh', rot: '0.8deg', dep: '-60px',
                  orb: '2.3deg',
                  n: { x: '46%', y: '76%', w: 'min(52vw, 24vh)', dx: '-4vw', dy: '7vh', dep: '-30px' },
                  src: 'assets/img/x0/system/slide-to-pay.svg', pw: 360, ph: 48,
                  alt: 'The slide-to-confirm control' },

                /* one shape, every primary action — and the primary action on
                   this screen is the one at the bottom of the list */
                { at: 0.512, sp: 22, x: '25%', y: '57%', w: '11vw', z: 12, dim: 0.62,
                  dx: '-5.54vw', dy: '-5.12vh', dep: '-34px',
                  orb: '1.8deg',
                  n: { x: '26%', y: '84%', w: 'min(30vw, 14vh)', dx: '-6vw', dy: '6vh', dep: '-18px' },
                  src: 'assets/img/x0/system/button.webp', pw: 400, ph: 96,
                  m: { n: 'The button', s: 'One shape, every primary action', at: 'bl' },
                  alt: 'The primary button — Continue' },

                /* three pixels tall, and it stays: the Home screen has no
                   progress bar either */
                { at: 0.526, sp: 22, x: '77%', y: '59%', w: '16vw', z: 12, dim: 0.68,
                  dx: '6.06vw', dy: '3.27vh', dep: '-20px',
                  orb: '2.6deg',
                  n: { x: '72%', y: '88%', w: 'min(36vw, 17vh)', dx: '6vw', dy: '8vh', dep: '-12px' },
                  src: 'assets/img/x0/system/progress.svg', pw: 357, ph: 4,
                  alt: 'The onboarding progress bar, five steps' },

                /* chip, toggle and stepper — which is what the row of Swap,
                   Buy and Stake is made of */
                { at: 0.540, sp: 22, x: '75%', y: '54%', w: '15vw', z: 12, dim: 0.62,
                  dx: '6.34vw', dy: '1.42vh', rot: '1.6deg', dep: '-46px',
                  orb: '2.2deg',
                  n: { x: '76%', y: '19%', w: 'min(34vw, 16vh)', dx: '7vw', dy: '-6vh', dep: '-24px' },
                  src: 'assets/img/x0/system/controls.svg', pw: 265, ph: 52,
                  alt: 'Chip, toggle and stepper in their states' },
              ] },

            /* THE OLD SYSTEM. After N45 has built itself, the screens it
               replaced: CySync for the X1, rising out of the same dark onto a
               tilted wall that drifts once it is full. */
            { id: 'x0-apart', kind: 'wall', dur: 360, dark: true,
              k: 'Before N45',
              h: 'This is what CySync<br>looked like.',
              end: 'Nothing was carried over | except the reason to *trust* it.',
              offs: [0.52, 0.458, 0.495, 0.595, 0.557, 0.607, 0.445, 0.57, 0.42, 0.432, 0.583, 0.545, 0.62, 0.532, 0.482, 0.47, 0.507],
              order: [0.024, 0.121, 0.061, 0.171, 0.098, 0.0, 0.05, 0.146, 0.086, 0.109, 0.036, 0.183, 0.074, 0.159, 0.012, 0.134, 0.195],
              rows: [
                { off: '-6vw', src: ['assets/img/x0/cysync/01.webp', 'assets/img/x0/cysync/07.webp', 'assets/img/x0/cysync/04.webp', 'assets/img/x0/cysync/10.webp', 'assets/img/x0/cysync/14.webp'] },
                { off: '7vw', src: ['assets/img/x0/cysync/08.webp', 'assets/img/x0/cysync/02.webp', 'assets/img/x0/cysync/11.webp', 'assets/img/x0/cysync/13.webp'] },
                { off: '-2vw', src: ['assets/img/x0/cysync/05.webp', 'assets/img/x0/cysync/06.webp', 'assets/img/x0/cysync/09.webp', 'assets/img/x0/cysync/15.webp'] },
                { off: '9vw', src: ['assets/img/x0/cysync/12.webp', 'assets/img/x0/cysync/16.webp', 'assets/img/x0/cysync/17.webp', 'assets/img/x0/cysync/03.webp'] },
              ] },

            /* THE RESULT. The X0 app itself: one phone playing through its key
               moments while every other screen flows past behind it. */
            { id: 'x0-app', kind: 'showcase', dur: 440, dark: true,
              k: 'The result',
              h: 'X0, built on N45.',
              p: '250+ screens and counting. One system underneath all of them.',
              base: 'assets/img/x0/app/',
              frame: 'assets/img/x0/system/iphone.webp',
              hero: ['09', '01', '05', '13', '15', '16', '14', '22'],
              stops: [0, 0.3, 0.39, 0.48, 0.57, 0.66, 0.75, 0.84],
              cards: ['assets/img/x0/cards/c1.webp', 'assets/img/x0/cards/c2.webp', 'assets/img/x0/cards/c3.webp', 'assets/img/x0/cards/c4.webp'],
              cardAt: 0.08, cardGap: 0.075,
              alts: ['Portfolio', 'Onboarding', 'Tap to approve', 'Send', 'Swap token selector', 'Swap', 'Receive', 'Wallet recovered'],
              cols: [
                ['02', '10', '19', '26', '07', '24'],
                ['04', '11', '17', '28', '21', '03'],
                ['06', '12', '23', '18', '25', '08'],
                ['20', '27', '02', '10', '17', '11'],
                ['24', '03', '28', '06', '19', '12'],
                ['08', '21', '07', '26', '23', '04'],
              ] },


            /* THE SECOND DECISION AND ITS EVIDENCE IN ONE SCENE, because a
               title card followed by its own proof is not two scenes. This is
               also where the film's texture changes for the only time:
               rendered black to a real wall, as a hard cut. */
            { id: 'x0-dec-2', nav: 'Explorations', kind: 'photo', dur: 160,
              n: 'Decision 02',
              h: 'Four directions. Only one survived the people who’d have to sell it.',
              p: 'The only way to argue about four directions is to see them at the same time.',
              shot: { kind: 'photo', dia: 'wall', subject: 'Four directions pinned up together', ratio: 1.778,
                of: 'Photograph — four shortlisted directions pinned up together, wide, shot straight on. Handheld and imperfect is right. Blur anything legible on the rejected three.' },
              cap: 'Direction review — four candidates, one wall, everyone who had a say in the room' },

            /* THE STRUCTURE WAS ARGUED BEFORE IT WAS DRAWN, and the
               cross-dissolve is aligned so two or three boxes sit in the same
               place in both frames. Those anchors are what make it read as
               one piece of thinking cleaned up rather than two unrelated
               pictures. */
            { id: 'x0-ia', kind: 'cross', dur: 130,
              a: { kind: 'whiteboard', dia: 'board', subject: 'The IA session with the PM', ratio: 1.4, treat: 'paper',
                of: 'Photograph — the information-architecture session with the PM. Boxes, arrows, crossings out. Shot square to the wall.' },
              b: { kind: 'figma', dia: 'flow', subject: 'The same architecture, redrawn clean', ratio: 1.4, treat: 'paper',
                of: 'The clean IA diagram in the product’s own type, aligned so its key boxes land on the photograph’s.' },
              cap: 'Information architecture and flow mapping, with the PM, before a single screen was drawn' },

            /* HOW THE WORK ACTUALLY MOVED. Both tracks advance at once,
               which is the point: the system churning and the low-fidelity
               flows going out were parallel, and a reader shown them in
               sequence would conclude one waited for the other. */
            { id: 'x0-tracks', kind: 'tracks', dur: 170,
              lanes: [
                { t: 'The system, churning', stack: true,
                  p: 'It went through rigorous back-and-forth. It was the foundation, so it had to.',
                  shots: [
                    { kind: 'figma', dia: 'versions', subject: 'One component, first version', ratio: 1.4 },
                    { kind: 'figma', dia: 'versions', subject: 'The same component, second version', ratio: 1.4 },
                    { kind: 'figma', dia: 'versions', subject: 'Third version — the one that stayed', ratio: 1.4 },
                  ] },
                { t: 'Everyone else, unblocked', stack: true,
                  p: 'Low-fidelity flows kept stakeholders and engineers moving. Most of the simplification in the shipped app started as somebody else’s comment.',
                  shots: [
                    { kind: 'figma', dia: 'flow', subject: 'The low-fidelity flow, as presented', ratio: 1.6, of: 'The low-fidelity flow frames as presented to stakeholders.' },
                    { kind: 'thread', subject: 'A real design-review thread', ratio: 1.5,
                      of: 'Blur names, faces and any unreleased feature names before this is public.' },
                    { kind: 'screenshot', dia: 'beforeafter', subject: 'The affected screen, before and after', ratio: 1.5 },
                  ] },
              ] },

            /* A SECURITY PRODUCT FINDING SECURITY PROBLEMS IN ITS
               COMPETITORS, sorted into groups — because sorting is what
               analysis actually is. The fourth group is deliberately quiet:
               crediting a competitor reads as confidence.

               AND IT IS DESCRIBED, NOT ACCUSED. No brand is named, nothing is
               reproduced, and each finding is stated as a category rather
               than as an exploit. This is the one scene in the film with
               legal exposure and it is written to survive a lawyer. */
            { id: 'x0-competitors', kind: 'pins', dur: 180,
              kicker: 'Competitor teardown',
              h: 'Some of it was carelessness. Some of it was on purpose.',
              groups: [
                { h: 'Real vulnerabilities',
                  items: [
                    'Recovery material recoverable from the device itself',
                    'Confirmation screens that could be spoofed',
                    'Sensitive state persisting after a session ended',
                  ] },
                { h: 'Plain UX failures',
                  items: [
                    'Setup that assumed vocabulary a first owner does not have',
                    'Irreversible actions with no confirmation',
                    'Error states that named a code and not a fix',
                  ] },
                { h: 'Clearly intentional',
                  items: [
                    'The safe path made slower than the convenient one',
                    'Export and exit buried several levels down',
                    'Defaults set in the company’s interest, not the owner’s',
                  ] },
                { h: 'And what they got right', quiet: true,
                  items: [
                    'Portfolio screens that opened fast and said one thing',
                    'Honest language about what a device cannot protect you from',
                  ] },
              ],
              p: 'We fixed the first two in ours — and took the things they’d got right.',
              /* the macro crop, enlarged past its frame and cut by the right
                 edge of the window — so the scene has an object in it and is
                 not three columns of prose */
              shot: { kind: 'device', dia: 'phonescreen', subject: 'A competitor setup screen, cropped close', treat: 'macro', ratio: 0.487,
                of: 'On the step that fails. No brand mark in frame.' } },

            /* ITERATION AS CRAFT RATHER THAN INDECISION, and it is credible
               because it is small and specific. The one place in the film
               where the reader's axis and the content's axis differ, which is
               worth it because six versions of one component genuinely is a
               horizontal idea. */
            /* TRAVEL IS MEASURED, NOT GUESSED. It was 150vw, and at 1440 the
               track is six 232px cells plus a 36vw lead-in — about 133vw
               end to end. Sweeping it 150vw takes every one of the six off
               the left edge, so the scene's last quarter was an empty frame
               with a headline in it. 46vw brings the sixth to centre-right
               and holds it there while the line arrives. */
            { id: 'x0-button', kind: 'rail', dur: 170, travel: '46vw',
              items: [
                { n: '01', kind: 'figma', tight: true, dia: 'button', subject: 'Button, v1', ratio: 1.2, treat: 'strip', of: 'Button, first version. Identical crop across all six.' },
                { n: '02', kind: 'figma', tight: true, dia: 'button', subject: 'Button, v2', ratio: 1.2, treat: 'strip', of: 'Second version.' },
                { n: '03', kind: 'figma', tight: true, dia: 'button', subject: 'Button, v3', ratio: 1.2, treat: 'strip', of: 'Third version.' },
                { n: '04', kind: 'figma', tight: true, dia: 'button', subject: 'Button, v4', ratio: 1.2, treat: 'strip', of: 'Fourth version.' },
                { n: '05', kind: 'figma', tight: true, dia: 'button', subject: 'Button, v5', ratio: 1.2, treat: 'strip', of: 'Fifth version.' },
                { n: '06', kind: 'figma', tight: true, dia: 'button', subject: 'The sixth — shipped', ratio: 1.2, treat: 'strip', of: 'The sixth — the one every primary action in the product was built from.' },
              ],
              h: 'Six versions. Then every primary action in the product was built from it.' },

            /* THE DEEPEST ARTEFACT IN THE FILM, and the only place the reader
               handles a real flow. The device never moves; only what is
               inside it changes, and the caption beside it swaps on the same
               beat. Twelve screens and twelve reasons, all of them already
               written. */
            { id: 'x0-onboarding', kind: 'device', dur: 240,
              screens: [
                { src: 'assets/img/x0/onboarding/01-splash.webp',
                  t: 'Hold the first second',
                  b: 'A cold start has real work to do. That second exists either way, so it carries the mark rather than a spinner.' },
                { src: 'assets/img/x0/onboarding/02-welcome.webp',
                  t: 'One decision, and no account',
                  b: 'No sign-up, no email. The first screen offers the only two things a new owner can want.' },
                { src: 'assets/img/x0/onboarding/03-meet.webp',
                  t: 'The object before the process',
                  b: 'You are about to trust a piece of plastic with your savings. It gets introduced first.' },
                { src: 'assets/img/x0/onboarding/04-no-seed.webp',
                  t: 'Lead with the objection',
                  b: 'Everyone who has held crypto knows the seed phrase problem. Naming it early is what buys the next four screens.' },
                { src: 'assets/img/x0/onboarding/05-distributed.webp',
                  t: 'Answer the obvious question',
                  b: 'If there is no seed phrase, what is there? One sentence and one diagram, before any setup begins.' },
                { src: 'assets/img/x0/onboarding/06-currencies.webp',
                  t: 'Will it hold mine?',
                  b: 'A hardware wallet that does not support your coin is an ornament. Asked and answered before setup.' },
                { src: 'assets/img/x0/onboarding/07-consent.webp',
                  t: 'Ask before collecting',
                  b: 'The analytics question is asked plainly, once, with the default off.' },
                { src: 'assets/img/x0/onboarding/08-card-stack.webp',
                  t: 'Name what is about to happen',
                  b: 'Four cards, and what each one is for, before the first tap is requested.' },
                { src: 'assets/img/x0/onboarding/09-tap-idle.webp',
                  t: 'A sheet, not a new screen',
                  b: 'The tap is a physical act against a phone. It belongs on top of where you already are.' },
                { src: 'assets/img/x0/onboarding/10-tap-loading.webp',
                  t: 'Hold is a state, so it has one',
                  b: 'The card has to stay against the phone. The screen says so for as long as it is true.' },
                { src: 'assets/img/x0/onboarding/11-tap-success.webp',
                  t: 'Confirm where it was asked',
                  b: 'The confirmation lands in the same sheet the request was made in.' },
                { src: 'assets/img/x0/onboarding/12-user-type.webp',
                  t: 'One fork, asked once',
                  b: 'The only branch in the flow, at the end, in the terms a first-time owner would use.' },
              ] },
            /* --- CHAPTER 05 · BRINGING X0 TO LIFE ---------------------------------

               THE LAST BREAK. Act IV opens on the tap, which is the first time in
               the study a hand touches the product — so the card ruled in front
               of it is the film clearing its throat before the payoff. */
            { id: 'x0-ch-5', nav: 'Product', kind: 'mark', dur: 118,
              n: '05', h: 'Bringing X0 to life',
              p: 'The card, the app, and the four ideas the screens exist to prove.' },

            /* THE EMOTIONAL PEAK, AND THE PAYOFF FOR SCENE 04. The video is
               scrubbed by scroll, so the reader controls the tap and can hold
               it at the moment of contact — and that control is the scene.
               This is the interaction that replaced a whole device; letting
               someone stop it half way is the only way a page can say so. */
            { id: 'x0-tap', act: 'IV · Product', kind: 'video', dur: 170, dark: true,
              src: 'assets/media/x0/app-walkthrough.mp4',
              poster: 'assets/media/x0/app-walkthrough.webp',
              alt: 'The X0 card tapped against the back of a phone, and the confirmation that follows',
              h: 'This is what replaced the hardware.',
              p: 'Everything about it is designed around a hand doing something physical. Stand-in footage — the shot to take is the hand, the card and the phone on a tripod, one key light, dark ground.' },

            /* THE PHILOSOPHY WHERE IT CAN BE CHECKED AGAINST EVIDENCE. One
               line per principle, maximum, with a real screen beside it: a
               principle that needs a paragraph to defend it was not a
               principle. */
            { id: 'x0-principles', kind: 'prin', dur: 180,
              items: [
                { w: 'Familiar', src: 'assets/img/x0/onboarding/12-user-type.webp',
                  l: 'Patterns a first-time owner has already used somewhere else.' },
                { w: 'Guided', src: 'assets/img/x0/onboarding/03-meet.webp',
                  l: 'Never more than one thing to understand at a time.' },
                { w: 'Secure', src: 'assets/img/x0/onboarding/05-distributed.webp',
                  l: 'The safe path is the fast path, or the safe path loses.' },
                { w: 'Minimal', src: 'assets/img/x0/onboarding/02-welcome.webp',
                  l: 'One decision per screen. Where a screen had two, one of them wasn’t a decision.' },
              ] },

            /* THE PRODUCT LANDS IN REALITY AND STOPS BEING SCREENS. The dark
               mode arrives as a wipe rather than a fade, because a fade says
               the lights dimmed and a wipe says a second set of token values
               was switched on — which is what dark mode is. */
            { id: 'x0-world', kind: 'world', dur: 160,
              icon: 'X0',
              h: 'At 60 pixels it still has to be the one you trust.',
              homes: [
                { kind: 'device', dia: 'homescreen', subject: 'X0 on a real iPhone home screen', ratio: 0.62,
                  of: 'The X0 icon in place on a real iPhone home screen, among ordinary apps.' },
                { kind: 'device', dia: 'homescreen', subject: 'The same, on Android', ratio: 0.62 },
                { kind: 'device', dia: 'phonescreen', subject: 'One product screen in dark mode', ratio: 0.62 },
              ],
              p: 'The icon had to survive being one of forty things on somebody’s home screen.' },

            /* SEVEN MONTHS, AND THE SHIPPED VERSION WAS THE FOURTH ANSWER
               RATHER THAN THE FIRST. The two months where an earlier answer
               was abandoned carry a brass dot, because those are the two the
               reader should feel. */
            { id: 'x0-timeline', nav: 'Outcomes', kind: 'spine', dur: 180,
              kicker: 'Seven months',
              beats: [
                { w: 'Month 1',
                  t: 'Started by adapting X1. <span>The fastest route, and the one that made X0 look like a discount version of a product it wasn’t related to.</span>' },
                { w: 'Month 2', turn: true,
                  t: 'Abandoned the adapted components. <span>The reversal that cost the most and bought the most.</span>' },
                { w: 'Month 3', turn: true,
                  t: 'Rebuilt the navigation. <span>The second thing that turned out to be inherited rather than designed.</span>' },
                { w: 'Month 5',
                  t: 'N45 carrying surfaces it wasn’t written for. <span>The test of whether it was a system or a catalogue.</span>' },
                { w: 'Month 6',
                  t: 'Onboarding settled at twelve screens. <span>Down from more, and each one with a reason.</span>' },
                { w: 'Month 7',
                  t: 'Beta, on both platforms.' },
              ] },

            /* THE MOST FORWARD-LOOKING CLAIM IN THE PROJECT, and the only
               real number in the film. It is there at rest rather than
               counting up: a counter would make it a statistic, and it is a
               position. The generated output is shown unretouched, because
               the imperfection is the honesty of the scene. */
            { id: 'x0-67', kind: 'num', dur: 170,
              n: '67%',
              sub: 'accuracy of designs generated from N45 by prompt, today',
              h: 'I’m building the system so it can be read by a model, not just by a designer.',
              prompt: 'a portfolio screen using N45, one primary action',
              out: [
                { kind: 'figma', dia: 'namelist', subject: 'The component naming convention', ratio: 1.5,
                  of: 'Close crop of the component naming panel, showing the convention that makes this possible.' },
                { kind: 'device', dia: 'phonescreen', subject: 'The screen that prompt produced', ratio: 0.62,
                  of: 'Unretouched — the flaws are the point.' },
                { kind: 'device', dia: 'phonescreen', subject: 'The same screen, corrected', ratio: 0.62,
                  of: 'The same screen after correction, for the delta.' },
              ],
              /* the closing line moved into the label under the number: the
                 scene is a number, a claim and a prompt, and a fourth
                 element restating the claim is the thing that made this
                 frame feel busy. */
              sub: 'accuracy of designs generated from N45 by prompt, today — and the system has to grow as the app does' },

            /* THE ONLY REFLECTIVE SCENE, at reading size rather than poster
               size, and the scale shift is the signal: this one is meant to
               be read. After twenty-five scenes of cinema, near-stillness
               reads as candour. */
            { id: 'x0-back', kind: 'cards', dur: 140,
              h: 'Looking back.',
              items: [
                { h: 'What worked',
                  body: ['<b>Building the system before the screens.</b> Extracting a system from finished work produces a catalogue of what you already did; building it first produces something the next product can use — and by month six there were surfaces running on it that did not exist when it was written.'] },
                { h: 'The biggest trade-off', lift: true,
                  body: ['Two months in, <b>abandoning the adapted CySync components cost real time</b> — the fastest path was already half walked. It bought X0 an identity of its own, which is the thing the project was actually for.'] },
                { h: 'What I’d improve',
                  body: ['<b>Segmentation is a design problem before it is a marketing one.</b> Making X0 feel approachable without making it feel like the cheap option comes down to type, spacing and tone rather than a badge or a price — and that is the part I would keep pushing on with real users in front of it.'] },
              ] },

            /* THE END CARD, closing the loop opened in scene 01: the same
               card, the same light, the same position, and the giant letters
               behind it gone. The object no longer needs the title. No
               flourish on the last frame. */
            { id: 'x0-end', kind: 'object', dur: 120, dark: true, rest: true,
              shot: { kind: 'render', dia: 'object', subject: 'The X0 card, lit from one side', treat: 'lift',
                of: 'Scene 01’s render, reused exactly. The repetition is the point — do not reshoot it.' },
              still: true,
              h: 'Cypherock X0',
              meta: '7 months · Senior Product Designer · Product strategy, UX, UI, design system, information architecture, engineering collaboration' },
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
        /* THE COUNTER. Narrower stack and the widest proportion in the set, so
           it is plainly a different shape from the one beside it and its caption
           lands well above that one's — which is what stops the two columns
           reading as a row. */
        col: 'b', ratio: 1.72,
        /* `sheet` rather than the default `cover`: the artwork is a title card,
           not a photograph, so cropping it to the panel cost the outer columns
           and left it looking like a screenshot of something else. On a field
           it reads as the poster it is, and it picks up the Eido card's push
           on hover — the two are neighbours in the grid. */
        thumbFit: 'sheet',
        preview: 'words', line: 'Shortlisted',
        /* --- THE CHAPTER COVER ------------------------------------------

           WHAT THIS IS FOR. Pressing a card used to leave the site: one click
           and you were in a forty-six screen case study with no idea whether
           you wanted to be. This is the screen in between — enough of the
           project to decide by, on the page you are already on, with the study
           one deliberate press further.

           IT IS NOT A SUMMARY OF THE STUDY. A summary would be the study
           again, shorter, and nobody reads the same argument twice. This is
           the jacket copy: what the thing is, what was mine, and four pictures
           that say whether it is any good. `spread` is composed rather than
           listed — a hero, two supports at different crops and one detail —
           and the three positions are named rather than numbered so the
           composition is legible here and not only in the stylesheet.

           EVERY FACT IS OUT OF THE STUDY OR THE KNOWLEDGE BASE. Nothing in a
           `brief` is written for the brief. */
        brief: {
          tagline: 'Hiring software that reads the resumes for you.',
          summary: 'Sourcing, shortlisting and screening automated end to end, '
            + 'for a US B2B recruitment platform. The design problem was where '
            + 'to stop: every screen is a place a human decides what the model '
            + 'got right.',
          facts: [
            { k: 'Role', v: 'Product Designer — end to end, plus product direction' },
            { k: 'Timeline', v: 'Jan 2024 — Nov 2025 · Noida, on-site' },
            { k: 'Team', v: 'Cross-functional team of 7' },
            { k: 'Platform', v: 'Web · Recruiter, admin and candidate surfaces' },
          ],
          does: [
            'Product direction',
            'AI assistant for job creation and scheduling',
            'Freemium acquisition model',
            'Meeting scheduler MVP',
            'Design system, 100+ components',
            'Continuous user and A/B testing',
          ],
          cta: 'View the complete case study',
          spread: [
            { at: 'hero', src: 'assets/img/onefinnet/screens/candidate-view.webp', w: 1488, h: 1140,
              alt: 'A candidate evaluation, with the model\u2019s score beside the resume.' },
            { at: 'a', src: 'assets/img/onefinnet/screens/kanban-board.webp', w: 1488, h: 1140,
              alt: 'The hiring pipeline as a board.' },
            { at: 'b', src: 'assets/img/onefinnet/screens/ai-screening-criteria.webp', w: 1488, h: 1140,
              alt: 'Setting the screening criteria the assistant works from.' },
            { at: 'detail', src: 'assets/img/onefinnet/personas.webp', w: 1534, h: 544,
              alt: 'The three people the product is for, in their own words.' },
          ],
        },
        study: {
          slug: 'onefinnet-talent',
          company: 'Onefinnet',
          category: 'B2B SaaS',
          year: '2024\u201325',
          place: 'Noida (on-site)',
          role: 'Product Designer',
          lede: 'Automating candidate sourcing, shortlisting and screening \u2014 '
            + 'so a hiring team spends its day building teams, not filtering '
            + 'resumes.',
          eyebrow: 'Onefinnet \u00b7 Product Design',
          title: 'Talent',
          /* A DIFFERENT COMPOSITION, WHICH IS THE WHOLE REASON THIS IS DATA.
             X0 is an object on a field; this is a product being used, so it
             rises out of the bottom edge of the frame and is cropped by it —
             the screen carries on past the fold, which is what a working
             interface does. Pale field, dark ink, wider artifact. See the
             note on the X0 hero for what each key does. */
          hero: {
            layout: 'bleed',
            /* same reasoning as X0's — the artwork brings its own lavender, so
               a lavender wall behind it doubled the ground. Paper, and the
               screen rises out of it. */
            ink: '#1a1730',
            scale: 0.84,
            at: 'bottom',
            facts: ['B2B SaaS', 'Product design', '2024 — 25'],
            line: 'The screens where a human decides what the model got right.',
          },
          /* The dock opens with the study, as it does on a project page. Set
             `reading: true` to have it collapse to its tab instead — the
             machinery for that is still in Rack.applyScope. */
          reading: false,
          back: { label: 'BACK', href: 'index.html' },
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
        /* the tall one. A fan of passports wants the height. */
        col: 'a', ratio: 1.06,
        preview: 'fan' ,
        /* --- THE CHAPTER COVER ------------------------------------------

           WHAT THIS IS FOR. Pressing a card used to leave the site: one click
           and you were in a forty-six screen case study with no idea whether
           you wanted to be. This is the screen in between — enough of the
           project to decide by, on the page you are already on, with the study
           one deliberate press further.

           IT IS NOT A SUMMARY OF THE STUDY. A summary would be the study
           again, shorter, and nobody reads the same argument twice. This is
           the jacket copy: what the thing is, what was mine, and four pictures
           that say whether it is any good. `spread` is composed rather than
           listed — a hero, two supports at different crops and one detail —
           and the three positions are named rather than numbered so the
           composition is legible here and not only in the stylesheet.

           EVERY FACT IS OUT OF THE STUDY OR THE KNOWLEDGE BASE. Nothing in a
           `brief` is written for the brief. */
        brief: {
          tagline: 'One document, ninety-six ways.',
          summary: 'A self-directed study in how the same identity document is '
            + 'designed differently in every country that issues one — and what '
            + 'that says about designing anything for everywhere.',
          facts: [
            { k: 'Role', v: 'Self-directed' },
            { k: 'Timeline', v: '2024' },
            { k: 'Team', v: 'Solo' },
            { k: 'Platform', v: 'Print and screen' },
          ],
          does: ['Research', 'Art direction', 'Typography'],
          /* NO `cta`, BECAUSE THERE IS NOWHERE TO SEND ANYBODY YET. The study
             is not written and a button to a page that does not exist is the
             one thing worse than no button. `note` takes its place and says so
             plainly — see `.pvw__soon`. */
          note: 'Write-up in progress',
          /* AND NO `spread` EITHER. There are no photographs of this in the
             repository, and four crops of the card's own generated artwork is
             padding with extra steps. The preview falls back to that artwork
             at one size, which is honest about what exists. */
        },
      },
      { title: 'Magic Extractor', meta: 'Design, 2025, Bengaluru', href: '#',
        /* short and wide, under the tall one, so the right-hand stack ends on a
           different line again */
        col: 'b', ratio: 1.5,
        preview: 'ring', line: 'Extracting', stat: '672/897 files parsed' ,
        /* --- THE CHAPTER COVER ------------------------------------------

           WHAT THIS IS FOR. Pressing a card used to leave the site: one click
           and you were in a forty-six screen case study with no idea whether
           you wanted to be. This is the screen in between — enough of the
           project to decide by, on the page you are already on, with the study
           one deliberate press further.

           IT IS NOT A SUMMARY OF THE STUDY. A summary would be the study
           again, shorter, and nobody reads the same argument twice. This is
           the jacket copy: what the thing is, what was mine, and four pictures
           that say whether it is any good. `spread` is composed rather than
           listed — a hero, two supports at different crops and one detail —
           and the three positions are named rather than numbered so the
           composition is legible here and not only in the stylesheet.

           EVERY FACT IS OUT OF THE STUDY OR THE KNOWLEDGE BASE. Nothing in a
           `brief` is written for the brief. */
        brief: {
          tagline: 'Pulling the signal out of nine hundred files.',
          summary: 'An extraction tool for people who are handed a folder and '
            + 'asked what is in it. Most of the design is what the interface '
            + 'does while it does not yet know the answer.',
          facts: [
            { k: 'Role', v: 'Design' },
            { k: 'Timeline', v: '2025 · Bengaluru' },
            { k: 'Team', v: 'With engineering' },
            { k: 'Platform', v: 'Desktop' },
          ],
          does: ['Interaction design', 'Progress and state', 'UI'],
          note: 'Write-up in progress',
        },
      },
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
    back: { label: 'BACK', href: 'index.html' },

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

  /* ------------------------------------------------------------------- peek
     WHAT IS BEHIND THE UNDERLINED WORDS. Each key here matches a `data-peek`
     attribute in a `<mark class="rule">`; a word without an entry is just a
     word, and an entry without a word is never built.

     NOTHING POINTS AT THESE RIGHT NOW. The home page's closing block was the
     only place with `data-peek` words in it and it has been removed, so all
     five of these are waiting rather than working — `Peek.init` finds no words
     and returns. They are kept because the cards are the expensive part and
     the words are the cheap part: put `data-peek="poker"` on a mark anywhere
     in any page's copy and this one is live again.

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




  /* ======================================================================= about
     THE ABOUT PAGE, AS DATA.

     Everything on /about.html is here, and nothing on it is written in the
     builder. The page is long and it is meant to be edited often — a paragraph
     rewritten, a chapter reordered, a photograph finally taken — and none of
     those should mean opening site.js.

     THE PAGE IS FOUR CHAPTERS, NOT A STACK OF BLOCKS. Each one is a different
     composition: a full screen, a rail beside a scattered spread, a wall of
     type, and a résumé set as a document. Everything that used to sit between
     and after them — the loose words, a tools strip, a brick timeline, a
     drawer, a table of what I am reading, a sign-off — is gone, along with the
     bottom navigator that named them. The footer is the page's ending; nothing
     above it needs to be one as well.

     PLACEHOLDER COPY IS MARKED, NOT DISGUISED. Where a line is a stand-in it
     says something true about what belongs there rather than lorem, so the
     layout is under real sentence lengths.

     THE PHOTOGRAPHS DO NOT EXIST YET. Each entry carries the label, the note,
     the tilt and — where it is part of a composition — its position in that
     composition. Drop a `src` on any of them and the real photograph inherits
     all of it: same box, same rotation, same shadow, same interaction. */
  /* ------------------------------------------------------------------- about
     WHAT IS LEFT OF A PAGE THAT USED TO BE A SITE.

     There were four more keys here: a `hero` with a name and a four-line
     statement, five `chapters` of placeholder prose with photograph spreads
     and scrawled annotations, a `creed`, and the titles that introduced them.
     None of it said anything the work does not, and all of it was waiting on
     photographs that do not exist. The page is a document now, and a document
     is these five fields. */
  about: {
    /* the one word over the timeline */
    eyebrow: 'Experience',

    expertise: {
      title: 'Expertise',
      items: [
        'Product Experience Design',
        'Interaction Design',
        'Self-Custody UX',
        'Design Systems',
        'UI/UX',
        'Hardware Ecosystems',
        'Usability Testing',
        'Accessibility',
      ],
    },
    education: {
      title: 'Education',
      items: [
        { what: 'Interaction Design', where: 'B.Des · UPES, Dehradun', when: '2020 – 2024' },
        { what: 'Computer Science', where: 'Minor specialisation', when: '2021 – 2024' },
      ],
    },
    reach: { title: 'Reach me' },
    jobs: [
      {
        company: 'Cypherock',
        glyph: 'cypherock',
        role: 'Product Designer',
        when: 'Currently',
        body: 'Self-custody hardware for people who would rather not trust an '
          + 'exchange with their keys. I lead the design of the X0 ecosystem — '
          + 'the NFC card, its packaging and the wallet app that talks to it — '
          + 'and the CySync clients behind it.',
        wins: [
          'Took X0 from concept to beta in four months: a mobile-first hardware '
            + 'wallet spanning the physical NFC card, the packaging, the '
            + 'manufacturing-ready assets and the companion app.',
          'Architected the N45 design system — components, tokens, interaction '
            + 'patterns and the documentation that made handoff repeatable across '
            + 'platforms.',
          'Designed the NFC and BLE interaction flows across CySync Desktop, '
            + 'Mobile and the X1 Vault, with the firmware, hardware and frontend teams.',
          'Led the CySync v2 redesign: a forecast +40% engagement, 25% fewer '
            + 'interaction steps and +70% daily actives.',
          'Built the affiliate ecosystem end to end — landing page, partner '
            + 'dashboard and admin portal, with the onboarding and commission '
            + 'workflows under them.',
        ],
        tags: ['Product Design', 'Interaction Design', 'Design Systems', 'Hardware', 'Crypto'],
      },
      {
        company: 'Onefinnet',
        initials: 'ON',
        role: 'UI/UX Designer',
        when: '2 years',
        body: 'A B2B SaaS recruitment platform for the US market. I owned the '
          + 'product design and the strategic direction of Onefinnet Talent, '
          + 'directing a cross-functional team of seven.',
        wins: [
          'Created a new core revenue stream in Onefinnet Talent, driving 12% '
            + 'growth in enterprise adoption inside six months.',
          'Shipped a freemium acquisition model: +23% monthly actives and a 15% '
            + 'improvement in lead conversion.',
          'Designed the flagship AI assistant for job creation and interview '
            + 'scheduling — 40% less manual recruiter effort, +18% retention.',
          'Launched an integrated meeting scheduler MVP in a 60-day sprint; 180 '
            + 'early adopters and a 90% positive usability score.',
          'Built a design system from scratch with 100+ reusable components, '
            + 'cutting handoff time 30% and inconsistencies 40%.',
        ],
        tags: ['Product Design', 'B2B SaaS', 'Design Systems', 'Research', 'Prototyping'],
      },
    ],

    /* THE AWARDS, AS A TABLE RATHER THAN AS TROPHIES. A year, the thing, and
       what the thing was — three columns on a rule at the foot of the work,
       which is where a résumé puts them.

       `url` IS OPTIONAL AND ONLY THREE ROWS HAVE ONE. A row with a link
       renders as an anchor with the arrow after it and the rest stay plain,
       so nothing has to be invented for the one certificate that was never
       issued.

       THESE ARE THE CERTIFICATES THEMSELVES — the Drive shares and the Badgr
       assertion off LinkedIn, which is why they are proof rather than a
       programme's homepage. They are only as permanent as those shares: if a
       row stops resolving, the fix is to drop its `url`, not to hunt for a
       mirror. */
    awards: {
      title: 'Awards',
      items: [
        {
          year: '2023',
          name: '24hr Design Hackathon',
          result: '2nd Runner Up',
          where: 'School of Design, Doon University',
        },
        {
          year: '2022',
          name: 'CII Young Designer Awards',
          result: 'Winner, Service Design',
          where: 'Confederation of Indian Industry',
          url: 'https://drive.google.com/file/d/1ahByNMiM3IJy4mup0QUE6OQUBHGVCQQt/view?usp=sharing',
        },
        {
          year: '2022',
          name: 'D’Source-DIC BHU SDGs Design Challenge',
          result: 'Merit Award',
          where: 'IDC School of Design, IIT Bombay',
          url: 'https://drive.google.com/file/d/1r91OBZFxG8fNR8-DEMyLDbrJWl2SyfLF/view?usp=sharing',
        },
        {
          year: '2022',
          name: 'SSDC 2022',
          result: 'Honorable Mention',
          where: 'Service Design College',
          url: 'https://eu.badgr.com/public/assertions/KDCSPP0jTLCqw3v8BbVXVw?action=download',
        },
      ],
    },
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
  },
};
