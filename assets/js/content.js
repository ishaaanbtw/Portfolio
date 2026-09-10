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
          hero: {
            layout: 'panel',
            /* NO FIELD, AND THAT IS THE ART DIRECTION RATHER THAN AN OMISSION.

               It was set to the tile's own blue, on the reasoning that the
               piece the reader clicked should still be the piece in front of
               them. But the ARTWORK is that blue — `.pv-search` paints the
               field itself and sets the white lattice card on it — so a blue
               wall behind a blue artifact put the same colour in two places
               with a drop shadow between them, and a shadow between two
               identical colours reads as a rendering fault.

               Paper is the wall. The blue panel is the object on it, with air
               all round and its own shadow under it, which is what `panel`
               means and what an identity project wants: the artifact
               presented, not the brand colour sprayed across the window.
               `field` stays in the vocabulary for a project whose artwork has
               no ground of its own. */
            ink: '#f4f5ff',
            scale: 0.62,
            at: 'center',
            facts: ['Product identity', 'Hardware · Mobile', '2026'],
            line: 'A new product category inside an ecosystem that already had one.',
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

            /* ==============================================================
               ACT I — THE PREMISE (01–05)
               Curiosity. The reader should not yet know this is a case study.
               ============================================================== */

            /* THE COLD OPEN. The card in front of its own name, the letters
               cropping off both edges so the type reads as scale rather than
               as a word. Nothing fades in — it is already there at rest,
               which is what the first frame of a product page has to be. */
            { id: 'x0-open', act: 'I · Premise', kind: 'object', dur: 130,
              rest: true, dark: true,
              word: 'X0',
              shot: { label: 'X0 card', treat: 'lift',
                of: 'The card, three-quarter view, one hard key light from the left, on black. Transparent PNG at 3x so it can sit in front of the letters.' },
              kicker: 'Cypherock X0 · mobile beta',
              h: 'Self-custody, without the seminar.',
              meta: '7 months · Senior Product Designer' },

            /* SUCCESS AS THE STARTING CONDITION. The three facts arrive as
               beats and then there is a pause with nothing in it, so the
               reader has time to conclude X1 is fine before being told the
               market moved. The pause is the scene. */
            { id: 'x0-x1', kind: 'object', dur: 150,
              art: 'assets/img/x0/x1.webp',
              alt: 'CySync, the X1 desktop app — dark, gold, dense',
              still: true,
              h: 'X1 was never the problem.',
              facts: ['<b>$199</b>', '<b>Desktop-first</b>', '<b>Trusted</b>'],
              turn: 'And competitors at the same price were shipping high-end devices.' },

            /* THE BUSINESS PROBLEM, FELT AS A QUANTITY. Two scenes in the
               first draft — the market, then the insight — merged here
               because it is one gesture: the field of people ignites and
               resolves into the device they are already holding. */
            { id: 'x0-market', kind: 'field', dur: 170, count: 460, seed: 19,
              art: 'assets/img/x0/onboarding/01-splash.webp',
              h: 'Mobile isn’t a platform decision. It’s where the money already lives.',
              p: 'Price and complexity were screening out the people self-custody was meant to protect.' },

            /* THE PRODUCT'S ACTUAL REASON TO EXIST, AND IT IS A SUBTRACTION.
               This is the strongest idea in the project and it was missing
               from both earlier versions of the study. The vault device
               leaves the frame slowly and does not come back; three costs are
               struck through behind it. */
            { id: 'x0-subtract', kind: 'strike', dur: 180,
              gone: { label: 'X1 vault device', treat: 'lift',
                of: 'The X1 device on a light ground, same key light as the card. This is the object that exits the frame and does not return.' },
              stays: { label: 'Card + phone', ratio: 0.8, treat: 'lift',
                of: 'The X0 card held against the back of a phone, mid-tap, same lighting. The two objects that are left.' },
              h: 'The phone was already in their hand. So we stopped shipping a screen.',
              items: ['Hardware to manufacture', 'Freight and returns', 'Certification, per market'],
              p: 'The same distributed-key security, at a fraction of the price — because of what isn’t in the box.' },

            /* THE TITLE CARD, and the one the reader will screenshot. The
               fourth word holds because it is the one nobody expects to
               survive the other three. */
            { id: 'x0-brief', kind: 'words', dur: 140, dark: true,
              kicker: 'The brief, in four words',
              items: ['Affordable.', 'Mobile-first.', 'Simple.', 'Secure.'],
              p: 'The first three were the brief. The fourth was non-negotiable.' },

            /* ==============================================================
               ACT II — THE QUESTION (06–10)
               Surprise. The altitude of the problem, and what it ruled out.
               ============================================================== */

            /* THE SPINE, and the only white frame in the film. Nothing moves
               in it: after five scenes of motion, stillness is the effect,
               and this is the one moment the reader is meant to stop
               scrolling to read. */
            { id: 'x0-question', act: 'II · Question', kind: 'ask', dur: 120,
              kicker: 'The actual question',
              h: 'How do you launch a new product without cannibalising the flagship it sits next to?',
              p: 'Not “how do you design an app?”' },

            /* THE BRIEF AS IT ARRIVED, and then eight questions that nobody
               had answered. The accumulation is the point — nothing leaves,
               so by the eighth the frame is crowded, which is what the start
               of the project felt like and is not something a paragraph can
               do. The two in brass are the two that decide the rest. */
            { id: 'x0-brief-real', kind: 'wall', dur: 170,
              kicker: 'What was handed over',
              quotes: [
                'They didn’t say <em>can you make us some screens.</em>',
                'They said <em>we are launching a completely new product.</em>',
              ],
              items: [
                { t: 'Should it look like X1?' },
                { t: 'Should it look different?', keep: true },
                { t: 'What stays?' },
                { t: 'What changes?' },
                { t: 'What can we reuse?' },
                { t: 'What deserves a new language?', keep: true },
                { t: 'How do we prepare for features nobody has specced?' },
                { t: 'How do we keep development scalable?' },
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

            /* THE CONTRADICTION CONVERTED INTO A DIRECTION. Each connector
               draws down and then its word appears, so the reader feels the
               logic close rather than reading a list of five nouns. */
            { id: 'x0-logic', kind: 'chain', dur: 150,
              items: [
                'Same brand',
                'Different audience',
                'Different product',
                'Different experience',
                'A different design language',
              ],
              h: 'A unique identity wasn’t a preference. It was the only way both products survive.' },

            /* THE SET PIECE. The old interface comes apart in seven slices,
               each on its own vector with its own lag, and the new one is
               already underneath. Built from the two pictures the study
               already had, and reversible: scrolling back reassembles X1,
               because none of this is an animation with a direction. */
            { id: 'x0-apart', kind: 'morph', dur: 180, dark: true,
              over: 'assets/img/x0/x1.webp',
              under: 'assets/img/x0/x0.webp',
              underAlt: 'X0 — lighter, quieter, more air, a guided path through every flow',
              h: 'Nothing was carried over except the reason to trust it.',
              cap: 'CySync (X1, desktop) coming apart over X0 (mobile). Scroll back to reassemble it.' },

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
              h: 'Don’t reuse the design system that already existed.' },

            /* THE CASE AGAINST, THEN THE ANSWER, on one pin. The left column
               fills while the right stays black — the asymmetry is
               uncomfortable on purpose, and the reader starting to want the
               answer is the scene's job. Then the left dims as the right
               fills, which is the whole argument in one gesture. */
            { id: 'x0-n45', kind: 'split', dur: 190,
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
                note: 'Argued with competitor analysis and a cost-to-effort case — not with taste.',
              },
              /* the third track: full height, off the right edge of the window */
              art: { label: 'CySync components',
                of: 'The existing CySync component sheet. Redact anything non-public before this ships.' } },

            /* THE ASSEMBLY, and the longest scene in the film. The system is
               proved by building the product out of it on screen: eight parts
               arrive around one button and none of them leave, and by the end
               the accumulated parts are a screen. It should feel long. */
            /* SEVEN PARTS, NOT EIGHT. The eighth was the assembled home
               screen, which is the one thing in the list that is not a PART
               — it is the outcome, and it already has two scenes of its own
               later in the film. Its frame was also the only portrait one
               here, so it fought the exploded view's geometry. Removed.

               `x`/`y` are each part's centre and `ang` is the bearing of its
               leader line back toward the hub, measured off the composition
               at 1440x760 rather than computed: an exploded view is drawn,
               not solved. */
            { id: 'x0-assembly', kind: 'asm', dur: 200,
              hub: { label: 'Button', ratio: 2.4,
                of: 'The primary button component, isolated, at 3x.' },
              parts: [
                { label: 'Navigation', x: '50%', y: '11%', ratio: 3.2,
                  lead: '4rem', ang: 90,
                  of: 'The navigation bar as rebuilt in month three, isolated.' },
                { label: 'Spacing', x: '16%', y: '21%',
                  lead: '5.5rem', ang: 24,
                  of: 'The 8pt spacing grid as an overlay, transparent background.' },
                { label: 'Type scale', x: '83%', y: '19%', ratio: 1.3,
                  lead: '5.5rem', ang: 152,
                  of: 'The type scale specimen and its two weights, isolated.' },
                { label: 'Colour', x: '11%', y: '58%',
                  lead: '5.5rem', ang: -8,
                  of: 'The colour token swatch set, named.' },
                { label: 'Icons', x: '88%', y: '55%', ratio: 1.4,
                  lead: '5.5rem', ang: 187,
                  of: 'The icon set, isolated on a transparent ground.' },
                { label: 'Input', x: '26%', y: '77%', ratio: 2.2,
                  lead: '4.5rem', ang: -40,
                  of: 'Text input, every state, close crop.' },
                { label: 'Card', x: '75%', y: '79%', ratio: 1.5,
                  lead: '4.5rem', ang: 218,
                  of: 'The card component, isolated.' },
              ],
              h: 'The system wasn’t a deliverable. It was the product’s grammar.' },

            /* THE SECOND DECISION AND ITS EVIDENCE IN ONE SCENE, because a
               title card followed by its own proof is not two scenes. This is
               also where the film's texture changes for the only time:
               rendered black to a real wall, as a hard cut. */
            { id: 'x0-dec-2', kind: 'photo', dur: 160,
              n: 'Decision 02',
              h: 'Four directions. Only one survived the people who’d have to sell it.',
              p: 'The only way to argue about four directions is to see them at the same time.',
              shot: { label: 'The wall',
                of: 'Photograph — four shortlisted directions pinned up together, wide, shot straight on. Handheld and imperfect is right. Blur anything legible on the rejected three.' },
              cap: 'Direction review — four candidates, one wall, everyone who had a say in the room' },

            /* THE STRUCTURE WAS ARGUED BEFORE IT WAS DRAWN, and the
               cross-dissolve is aligned so two or three boxes sit in the same
               place in both frames. Those anchors are what make it read as
               one piece of thinking cleaned up rather than two unrelated
               pictures. */
            { id: 'x0-ia', kind: 'cross', dur: 130,
              a: { label: 'IA whiteboard', treat: 'paper',
                of: 'Photograph — the information-architecture session with the PM. Boxes, arrows, crossings out. Shot square to the wall.' },
              b: { label: 'The same thing, redrawn', treat: 'paper',
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
                    { label: 'Component v1', ratio: 1.4, of: 'One component, first version.' },
                    { label: 'v2', ratio: 1.4, of: 'The same component, second version.' },
                    { label: 'v3', ratio: 1.4, of: 'Third version — the one that stayed.' },
                  ] },
                { t: 'Everyone else, unblocked', stack: true,
                  p: 'Low-fidelity flows kept stakeholders and engineers moving. Most of the simplification in the shipped app started as somebody else’s comment.',
                  shots: [
                    { label: 'Low-fi flow', ratio: 1.6, of: 'The low-fidelity flow frames as presented to stakeholders.' },
                    { label: 'A review thread', ratio: 1.5, of: 'A real design-review thread. Blur names, faces, and any unreleased feature names before this is public.' },
                    { label: 'What changed', ratio: 1.5, of: 'The affected screen before and after, identical crop.' },
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
              shot: { label: 'One of theirs', treat: 'macro', ratio: 0.487,
                of: 'A competitor setup screen, cropped close on the step that fails. No brand mark in frame.' } },

            /* ITERATION AS CRAFT RATHER THAN INDECISION, and it is credible
               because it is small and specific. The one place in the film
               where the reader's axis and the content's axis differ, which is
               worth it because six versions of one component genuinely is a
               horizontal idea. */
            { id: 'x0-button', kind: 'rail', dur: 170, travel: '150vw',
              items: [
                { n: '01', label: 'v1', ratio: 1.2, treat: 'strip', of: 'Button, first version. Identical crop across all six.' },
                { n: '02', label: 'v2', ratio: 1.2, treat: 'strip', of: 'Second version.' },
                { n: '03', label: 'v3', ratio: 1.2, treat: 'strip', of: 'Third version.' },
                { n: '04', label: 'v4', ratio: 1.2, treat: 'strip', of: 'Fourth version.' },
                { n: '05', label: 'v5', ratio: 1.2, treat: 'strip', of: 'Fifth version.' },
                { n: '06', label: 'shipped', ratio: 1.2, treat: 'strip', of: 'The sixth — the one every primary action in the product was built from.' },
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

            /* ==============================================================
               ACT IV — THE PRODUCT (21–27)
               Admiration. What was built, what it cost, and what is next.
               ============================================================== */

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
                { label: 'iOS home screen', ratio: 0.62,
                  of: 'The X0 icon in place on a real iPhone home screen, among ordinary apps.' },
                { label: 'Android home screen', ratio: 0.62,
                  of: 'The same, on Android.' },
                { label: 'In dark mode', ratio: 0.62,
                  of: 'One product screen in dark mode, matched crop to its light version.' },
              ],
              p: 'The icon had to survive being one of forty things on somebody’s home screen.' },

            /* SEVEN MONTHS, AND THE SHIPPED VERSION WAS THE FOURTH ANSWER
               RATHER THAN THE FIRST. The two months where an earlier answer
               was abandoned carry a brass dot, because those are the two the
               reader should feel. */
            { id: 'x0-timeline', kind: 'spine', dur: 180,
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
                { label: 'Naming convention', ratio: 1.5,
                  of: 'Close crop of the component naming panel, showing the convention that makes this possible.' },
                { label: 'What it generated', ratio: 0.62,
                  of: 'The screen that prompt produced. Unretouched — the flaws are the point.' },
                { label: 'Hand-corrected', ratio: 0.62,
                  of: 'The same screen after correction, for the delta.' },
              ],
              p: 'It gets to about two-thirds right. That’s fine — as the app grows, the system has to grow with it.' },

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
              shot: { label: 'X0 card', treat: 'lift',
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
        preview: 'fan' },
      { title: 'Magic Extractor', meta: 'Design, 2025, Bengaluru', href: '#',
        /* short and wide, under the tall one, so the right-hand stack ends on a
           different line again */
        col: 'b', ratio: 1.5,
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
