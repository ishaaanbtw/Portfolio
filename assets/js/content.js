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
      sheets: ['assets/resume/p1.webp'],
      /* the aspect of one page, so the viewer can hold its shape before the
         image has loaded and nothing jumps when it does */
      ratio: 1200 / 1554,

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
           width = (x1-x0)/W  height = (y1-y0)/H */
      links: [
        /* page 1 — the PDF does not link the phone number; the tel: row is
           added here so it can be tapped on a phone */
        [
          ['mailto:ishaangupta.888@gmail.com', 5.105, 5.703, 21.063, 1.509],
          ['tel:+919717085986', 28.014, 5.791, 12.67, 1.258],
          ['https://ishaan-gupta.in/', 58.955, 5.703, 11.322, 1.509],
          ['https://www.linkedin.com/in/ishaangupta24', 71.959, 5.703, 22.935, 1.509],
          ['https://www.cypherock.com', 4.469, 18.533, 9.882, 1.703],
          ['https://onefinnet.com/talent', 4.469, 44.257, 9.302, 1.701],
          ['https://www.cohesity.com', 4.469, 60.798, 33.173, 1.703],
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
    /* The brick-head above the statement: a grid of head directions and a
       3x3 sheet of expressions, in the cell order `Mascot` expects. */
    mascot: {
      /* 9 columns (left -> right) x 5 rows (up -> down) of head turns */
      directions: 'assets/img/mascot/ishaan-directions-45.webp',
      grid: [9, 5],
      reactions: 'assets/img/mascot/ishaan-reactions.webp',
      label: 'Ishaan',
    },
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
      'made w/ hate',
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
    /* THE PRIMARY BUTTON BOOKS A CALL. It is a plain link to the public
       Cal.com page for the 15-minute event, opened in a new tab — Cal.com is
       the scheduling system and nothing here imitates it. The email address
       is still one press away in the Links list. */
    /* opens INSIDE the page (see `Door` in site.js): the Cal.com calendar in
       a pop-up that follows the light/dark switch. The href is still the real
       booking page, for cmd-click and no-JS. */
    primary: { label: 'Book a call', action: 'book-call', href: 'https://cal.com/ishaanbtw/15min' },
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
    eyebrow: 'Error 404',
    headline: 'This page doesn\u2019t exist.',
    body: 'The link may be old or mistyped. Everything else is still here.',
    links: [
      { label: 'Back to work', href: 'index.html', primary: true },
      { label: 'About', href: 'about.html' },
      { label: 'Resume', kind: 'resume' },
    ],
    aside: 'The bricks are real. Pick one up.',
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
    /* EMPTY FRAMES, UNTIL THERE IS MORE WORK. Quiet rectangles appended
       under each stack's projects so the two stacks read as a wall of work.
       Not links, not focusable, no hover; each is [stack, proportion]. Delete
       a line when a real project takes its place. */
    placeholders: [
    ],
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
      { title: 'Cypherock X0 Cold Wallet App',
        meta: 'App design, 2026, Singapore', href: '#x0-identity',
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
          summary: 'X0 has three parts: the cards, the packaging and the app. '
            + 'This project is the app, the iOS and Android wallet that makes the '
            + 'cards usable.',
          facts: [
            { k: 'Role', v: 'Senior Product Designer, end to end' },
            { k: 'Timeline', v: 'Since Feb 2026' },
            { k: 'Status', v: 'Live on iOS and Android', live: true },
          ],
          does: [
            'Product strategy',
            'Information architecture',
            'UX and UI, 250+ screens',
            'N45 design system',
            'AI-ready design workflow',
            'NFC and BLE interaction flows',
            'Hardware card and packaging',
          ],
          cta: 'View the complete case study',
          /* THE HERO IS THE CARD AGAINST THE PHONE, because the whole product
             is one object touching another one, and it is the only frame in
             the set that says so without a caption. */
          /* THE APP STORE SET, in the order it runs on the listing: six
             portrait panels at one height, flipped through sideways. The
             pressed card does not join the row (`anchor: false`); it steps back
             with the rest of the grid and the listing is the whole row. */
          anchor: false,
          spread: [
            { at: 'a', src: 'assets/img/x0/store/01.webp', w: 440, h: 956,
              alt: 'Secure and simple, a self-custodial wallet.' },
            { at: 'a', src: 'assets/img/x0/store/02.webp', w: 440, h: 956,
              alt: '21,000+ tokens across 15+ networks, in real time.' },
            { at: 'a', src: 'assets/img/x0/store/03.webp', w: 440, h: 956,
              alt: 'No seed phrase backup required.' },
            { at: 'a', src: 'assets/img/x0/store/04.webp', w: 440, h: 956,
              alt: 'Connect your favourite dApps with WalletConnect.' },
            { at: 'a', src: 'assets/img/x0/store/05.webp', w: 440, h: 956,
              alt: 'Swap between multiple wallets.' },
            { at: 'a', src: 'assets/img/x0/store/06.webp', w: 440, h: 956,
              alt: 'Stay up to date with push notifications.' },
          ],
        },
        study: {
          /* THE ROUTE THIS STUDY LIVES AT, and the reason it is a word rather
             than an index: `ishaan-gupta.in/cypherock-x0` is a URL somebody
             can read aloud, send, and land on cold. The shell file at
             <slug>.html (site root) carries nothing but this name; everything
             below is what it finds. */
          slug: 'cypherock-x0',
          /* the hardware chapter follows this one directly */
          next: 'x0-cards',
          /* The hero's own facts. They were one comma-separated string on the
             tile — "App design, 2026, Singapore" — which is the right
             shape for a caption and the wrong one for a page that sets them in
             a row with labels over them. */
          company: 'Cypherock',
          category: 'App design',
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

               EVERY VALUE HERE IS DOCUMENTED. Concept to beta,
               the scope and the collaborators are all out of the knowledge base
               rather than written for the page. There is no team size and no
               launch metric because neither is recorded anywhere, and a case
               study that invents one has spent the only thing it had. */
            { id: 'x0-record', nav: 'Overview', kind: 'record', dur: 165,
              kicker: 'Case study',
              h: 'Cypherock X0',
              lede: 'A hardware wallet the size of a bank card, built to make '
                + 'self-custody simpler, more approachable and more '
                + '<b>physical</b> than the vault it sits beside.',
              rows: [
                { k: 'Role', v: '*Senior Product Designer* · Sole lead designer, end to end, concept to beta' },
                { k: 'Timeline', v: '*Dec 2025* to present' },
                { k: 'Team', v: '*Design of one*, with firmware, hardware, blockchain and frontend engineering' },
                { k: 'Scope', v: '*Product strategy* · *Information architecture* · *UX* · *UI* · *Design system* · *Industrial and packaging design*' },
                { k: 'Surfaces', v: '*The NFC card* · *X0 Wallet* for iOS and Android' },
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
               opening of the film. */
            /* --- CONTEXT, IN TWO BEATS ------------------------------------

               ONE PINNED SCENE, TWO HALVES. Beat one (`a`) is the flagship
               as it stood: the real product, photographed, and its record
               set as a spec table, key left and value right. Beat two (`b`)
               is the market at the same money, set as a price ladder, so the
               reader sees X1 was not wrong, it was outpaced. Beat one leaves
               at half way and beat two arrives just after, both ways.

               THE PHOTOGRAPH IS THE PRESS SHOT, CUT OUT. The seven cropped
               kit tiles this replaced were 12 to 30 KB each and soft at the
               size they printed. `x1-set` is a transparent cut, so the page
               white runs straight round the product. `x1-kit` (everything in
               the box) and `x1-flat` (top down) sit beside it unused.

               EVERY FIGURE IN `b.rows` IS A PUBLIC US LIST PRICE, read off
               manufacturer and review listings in October 2026, and `b.note`
               says so on the page. The X1 rating is Coin Bureau's published
               4.8 / 5. Nothing here is an internal Cypherock number. */
            { id: 'x0-x1', nav: 'Context', act: 'I · Premise', kind: 'context', dur: 240,
              a: {
                kicker: 'Context · Cypherock X1',
                h: 'X1 was never the problem.',
                p: 'Cypherock’s flagship was secure, audited and well reviewed. The engineering held up.',
                img: 'assets/img/x0/x1/x1-set.webp',
                layers: [
                  { k: 'case',  src: 'assets/img/x0/x1/x1-case.webp' },
                  { k: 'cards', src: 'assets/img/x0/x1/x1-cards.webp' },
                ],
                alt: 'The Cypherock X1 Vault resting on its four numbered X1 cards, with the carbon carry case behind',
                cap: 'X1 Vault, four X1 cards, carry case',
                spec: [
                  ['Price', '$199'],
                  ['Hardware', 'Vault with screen and joystick, four NFC cards'],
                  ['Key storage', 'Split across the cards with Shamir’s Secret Sharing'],
                  ['Secure element', 'EAL6+ certified'],
                  ['Code', 'Open source'],
                  ['Audits', 'Keylabs, WalletScrutiny'],
                  ['Rating', '4.8 / 5, Coin Bureau'],
                ],
              },
              b: {
                kicker: 'Same money, higher bar',
                h: 'But the market moved.',
                p: 'Between $150 and $250, rivals were shipping touchscreens, Bluetooth and a phone in the loop. X1 still started on a desktop.',
                cols: ['Wallet', 'List price', 'What you got', 'Set up on'],
                rows: [
                  { n: 'Tangem Wallet',  img: 'assets/img/x0/rivals/tangem-wallet.webp',  p: 55,  f: 'NFC cards, no screen',            s: 'Phone' },
                  { n: 'Ledger Nano X',  img: 'assets/img/x0/rivals/ledger-nano-x.webp', p: 149, f: 'Bluetooth, button screen',        s: 'Phone or desktop' },
                  { n: 'Keystone 3 Pro', img: 'assets/img/x0/rivals/keystone-3-pro.webp', p: 149, f: 'Touchscreen, QR air gap',         s: 'Phone' },
                  { n: 'Trezor Safe 5',  img: 'assets/img/x0/rivals/trezor-safe-5.webp', p: 169, f: 'Colour touchscreen',              s: 'Desktop or Android' },
                  { n: 'Cypherock X1',   img: 'assets/img/x0/x1/x1-thumb.webp',         p: 199, f: 'Screen, joystick, four cards',    s: 'Desktop', me: true },
                  { n: 'Ledger Flex',    img: 'assets/img/x0/rivals/ledger-flex.webp',   p: 249, f: 'E Ink touchscreen, NFC, Bluetooth', s: 'Phone or desktop' },
                ],
                note: 'US list prices from manufacturer and review listings, October 2026. Tangem shown as the two card set. Prices vary by region.',
              },
            },

            /* THE BUSINESS PROBLEM, FELT AS A QUANTITY. Two scenes in the
               first draft — the market, then the insight — merged here
               because it is one gesture: the field of people ignites and
               resolves into the device they are already holding. */
            /* REWORKED AS A PLATE. The film no longer fills the frame under a
               wash and the four glass cards are gone: the same claim, set as
               an editorial split. `films` is tried in order, so the new cut
               (`insight-v2.mp4`) plays as soon as it is in the folder and the
               old film covers until then. */
            { id: 'x0-market', kind: 'insight', dur: 170, layout: 'plate',
              films: ['assets/media/x0/insight-v2.mp4', 'assets/media/x0/insight.webm', 'assets/media/x0/insight.mp4'],
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
              cap: 'Banking, payments and investing already run through the phone.' },

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
              p: 'Most hardware wallets still rely on their own screen and buttons. It adds cost, complexity and friction, for something people already have in their pocket.',
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
            /* THE ACTUAL QUESTION, ON THE BLACK FRAME WITH THE MARK. The brief's
               four words gave way to the question they were really asking; the
               mark still draws itself in on the right, smaller. */
            { id: 'x0-brief', nav: 'Research', act: 'II · Question', kind: 'words', dur: 220, dark: true,
              mark: 'assets/img/x0/problem/mark-icon.webp',
              kicker: 'The actual question',
              h: 'How do you launch a new product without '
                + '<mark>cannibalising</mark> the flagship it sits next to?' },
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
            /* (x0-question now lives inside x0-brief, on the black frame) */

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
              /* THE FIGURE IN PIECES, so it can be built rather than shown:
                 each part is cut from thinking.webp at its own spot (x/y/w are
                 % of that picture) and pops in on its own beat. The grey
                 line drawings that used to float behind it are gone. */
              parts: [
                { k: 'head',   x: 27.905, y: 16.8, w: 43.465, at: 0.02 },
                { k: 'laptop', x: 21.369, y: 65.0, w: 52.801, at: 0.07 },
                { k: 'dots',   x: 13.071, y: 11.7, w: 26.556, at: 0.12 },
                { k: 'eyes',   x: 5.394,  y: 35.8, w: 21.784, at: 0.17 },
                { k: 'bulb',   x: 59.544, y: 4.0,  w: 32.365, at: 0.22 },
                { k: 'ask',    x: 56.328, y: 58.4, w: 15.768, at: 0.27 },
                { k: 'face',   x: 71.784, y: 33.4, w: 27.697, at: 0.32 },
                { k: 'chart',  x: 75.207, y: 66.2, w: 21.162, at: 0.37 },
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

            /* (x0-five, "Five things at once", was removed from the study) */
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

            /* WHY THE MAP CAME BEFORE THE LOOK. The architecture was drawn
               first because it was the planning tool: count the flows, and
               the build and the team's schedule can be sized from them. The
               copy says plainly that this was an estimate, not a deadline. */
            { id: 'x0-plan', kind: 'ask', dur: 150,
              kicker: 'Before the interface',
              h: 'First, how the app fits together.',
              p: 'Before deciding how the UI would look and feel, we mapped its structure. It showed how many flows the app had, how long development would take, and roughly how long the whole team would need to finish. Not a final timeline, but a first estimate everyone could plan around.' },

            /* THE ARCHITECTURE, DRAWN FROM THE FILE AND NOT FROM MEMORY.
               Every node below is a section of the X0 Mobile App Figma file
               (page "1. UI"), and every line is a path the screens in that
               file actually take — read off the frames, their order and the
               arrows drawn between them, not off what a crypto wallet usually
               has. Buy is a button on Home with no flow behind it, so it is
               not here; Cypherock Cover is an option on the wallet screen
               with no screens behind it, so it is drawn as an option only.

               FIVE COLUMNS, TWO ROWS. The top row is the product's loop —
               first run, a wallet, Home, what you do from Home, where it
               lands. The bottom row is everything you manage from Profile.
               Multi-screen flows are one node each; the screens themselves
               are `steps`, read out underneath when a node is pointed at.

               THE GEOMETRY IS STATED, in canvas units (1180 × 720), because
               a layout that avoids crossings is a set of decisions and not a
               solver's output. `x`/`y`/`w`/`h` place a node; an edge names
               its two ends, how it is routed, and the trunk it runs along.
               `flow` marks a node whose steps are a sequence (read out with
               arrows) rather than a list of what it holds. Drawn by `IA` in
               site.js. */
            { id: 'x0-ia', kind: 'ia', dur: 230,
              k: 'Information architecture',
              ia: {
                W: 1180, H: 720,
                /* TWO WAYS IN. With cards is the product; Explore mode is the
                   card-less browse added for App Store review and for people
                   deciding whether to buy (Explore Mode PRD v1.0). In Explore,
                   rows with `ex.off` step back, `only: 'explore'` parts appear,
                   and every action that needs a card is marked and opens the
                   one shared Buy X0 sheet instead. */
                /* the map opens on Explore mode */
                start: 'explore',
                modes: [
                  { id: 'explore', t: 'Explore mode', hint: 'No cards, no wallets. Anything that needs a card opens the Buy X0 sheet.' },
                  { id: 'cards', t: 'With X0 cards' },
                ],
                groups: [
                  { id: 'run',   n: '01', t: 'First run',         x: 0,   y: 0,   at: 0.04 },
                  { id: 'setup', n: '02', t: 'Wallet setup',      x: 248, y: 0,   at: 0.13, off: true },
                  { id: 'home',  n: '03', t: 'Home',              x: 496, y: 0,   at: 0.22 },
                  { id: 'act',   n: '04', t: 'From Home',         x: 744, y: 0,   at: 0.31 },
                  { id: 'log',   n: '05', t: 'Activity',          x: 992, y: 0,   at: 0.40 },
                  { id: 'prof',  n: '06', t: 'Profile',           x: 496, y: 504, at: 0.49 },
                  { id: 'wal',   n: '07', t: 'Wallet management', x: 0,   y: 504, at: 0.58 },
                  { id: 'set',   n: '08', t: 'Settings',          x: 744, y: 504, at: 0.67 },
                ],
                nodes: [
                  /* 01 · first run */
                  { id: 'welcome', flow: true, g: 'run', t: 'Welcome', m: '4 intro screens · Consent', x: 0, y: 36,
                    steps: ['Welcome', 'Meet X0', 'Security across cards', 'No seed phrase backup', '22,000+ currencies', 'Data consent'] },
                  { id: 'device', ex: { off: true }, g: 'run', t: 'Choose device', m: 'X0 or X1 · 1–4 cards', x: 0, y: 100,
                    steps: ['Cypherock X0 or X1', 'How many cards'] },
                  { id: 'tap', ex: { off: true }, flow: true, g: 'run', t: 'Tap a card', m: 'Checks for wallets', x: 0, y: 164, card: true,
                    steps: ['Intro', 'Tap to approve', 'New or existing user'] },
                  { id: 'who', ex: { steps: ['New user: set up the cards', 'Existing user: read the wallets already on them', 'Explore the App: look around without cards'] }, g: 'run', t: 'New or existing?', kind: 'decide', x: 0, y: 234, w: 150, h: 36,
                    steps: ['New user: set up the cards', 'Existing user: read the wallets already on them'] },
                  { id: 'cards', ex: { off: true }, flow: true, g: 'run', t: 'New cards', m: 'Scan · Authenticate · Pair', x: 24, y: 292, w: 164, card: true,
                    steps: ['Scan all four cards', 'Authenticate all four', 'Pair all four', 'Cards ready'] },
                  { id: 'explore', only: 'explore', flow: true, g: 'run', t: 'Explore the App', m: 'No cards yet · Look around', x: 24, y: 420, w: 164,
                    steps: ['Explore the App, on new or existing', 'Continue', 'Home, with no wallets'] },
                  { id: 'existing', ex: { off: true }, flow: true, g: 'run', t: 'Existing cards', m: 'Reads wallets on cards', x: 24, y: 356, w: 164,
                    steps: ['Tap the cards', 'Wallets found on them'] },

                  /* 02 · a wallet */
                  { id: 'options', ex: { off: true }, g: 'setup', t: 'Wallet options', m: 'Open · Create · Import', kind: 'hub', x: 248, y: 36,
                    steps: ['Wallets found on the cards', 'Create a new wallet', 'Import from a seed phrase', 'Restore with Cypherock Cover'] },
                  { id: 'found', ex: { off: true }, flow: true, g: 'setup', t: 'Found wallet', m: 'Open it directly', x: 272, y: 100, w: 164,
                    steps: ['Pick a wallet found on the cards', 'Straight to Home'] },
                  { id: 'create', ex: { off: true }, flow: true, g: 'setup', t: 'Create wallet', m: 'Name · PIN · 4 cards', x: 272, y: 164, w: 164, card: true, pin: true,
                    steps: ['Tap to approve', 'Up to four wallets', 'Name it', 'Confirm name & seed length', 'Set a PIN', 'Tap four cards in order', 'Created', 'First asset'] },
                  { id: 'import', ex: { off: true }, flow: true, g: 'setup', t: 'Import wallet', m: 'Seed phrase · 4 cards', x: 272, y: 228, w: 164, card: true,
                    steps: ['Tap to approve', 'About seed phrases', 'Enter phrase or private key', 'Tap four cards in order', 'Imported', 'First asset'] },
                  { id: 'cover', ex: { off: true }, g: 'setup', t: 'Cypherock Cover', m: 'Subscription restore', kind: 'option', x: 272, y: 292, w: 164,
                    steps: ['Offered on wallet options', 'No flow designed behind it yet'] },

                  /* 03 · Home */
                  { id: 'home', ex: { steps: ['No wallets: the real empty state', 'Assets listed at zero', 'Bell: the Explore version of notifications', 'Gear: settings, unchanged'] }, g: 'home', t: 'Home', m: ['Wallet switcher · Balance', 'Actions · Accounts'], kind: 'hub', tag: 'Tab 1', x: 496, y: 100, h: 64,
                    steps: ['Combine portfolio, or one wallet', 'Balance', 'Send · Receive · Swap · Buy · Earn', 'Your accounts', 'Bell and gear in the header'] },
                  { id: 'empty', ex: { nudge: true, m: 'Add wallet opens Buy X0', steps: ['No wallets', 'Add wallet', 'Buy X0 sheet'] }, flow: true, g: 'home', t: 'Empty', m: 'No wallets yet', kind: 'state', x: 520, y: 184, w: 164, h: 40,
                    steps: ['No wallets', 'Add wallet', 'Wallet options'] },
                  { id: 'offline', flow: true, g: 'home', t: 'Offline', m: 'Last synced · Retry', kind: 'state', x: 520, y: 236, w: 164, h: 40,
                    steps: ['Prices may be outdated', 'Last synced', 'Tap to retry'] },

                  { id: 'nudge', only: 'explore', g: 'home', t: 'Buy X0 sheet', m: ['Get X0 cards · I have my cards', 'Not now'], kind: 'hub', x: 496, y: 404, h: 64,
                    ties: ['empty', 'notif', 'swap', 'wc', 'addw', 'recover'],
                    steps: ['Says why the action needs X0 cards', 'Get X0 cards: the shop', 'I have my cards: back to new or existing', 'Not now: closes, nothing lost', 'Shown every time'] },

                  /* 04 · from Home */
                  { id: 'portfolio', g: 'act', t: 'Portfolio', m: 'Chart · Allocation · Assets', x: 744, y: 36,
                    steps: ['1D to 1Y', 'Asset allocation', 'Asset list', 'Recent transactions'] },
                  { id: 'notif', ex: { nudge: true, m: 'No permission prompt', steps: ['Stay on top of every transaction', 'Get Cypherock X0', 'Buy X0 sheet'] }, g: 'act', t: 'Notifications', m: 'Transactions · Security', x: 744, y: 100,
                    steps: ['Received', 'Sent', 'Swapped', 'Swap failed', 'Transfer failed', 'Face ID enabled'] },
                  { id: 'send', ex: { off: true }, flow: true, g: 'act', t: 'Send', m: 'Recipient · Fee · Review', x: 744, y: 164, card: true, pin: true,
                    steps: ['Wallet', 'Token', 'Recipient', 'Amount & note', 'Network fee', 'Review', 'PIN', 'Tap a card', 'Broadcast'] },
                  { id: 'receive', ex: { off: true }, flow: true, g: 'act', t: 'Receive', m: 'Token · Network · QR', x: 744, y: 228,
                    steps: ['Wallet', 'Token', 'Confirm', 'Address & QR, per network', 'Address options'] },
                  { id: 'swap', ex: { nudge: true, m: 'Live quotes · No balances', steps: ['Wallet, none yet', 'Pay token, most popular first', 'Receive token', 'Amount, no balance check', 'Provider', 'Live quote', 'Review', 'Get Cypherock X0', 'Buy X0 sheet'] }, flow: true, g: 'act', t: 'Swap', m: 'Pair · Provider · Review', tag: 'Tab 2', x: 744, y: 292, card: true,
                    steps: ['Wallet', 'Pay token', 'Receive token', 'Amount', 'Provider', 'Quote', 'Review', 'Tap a card', 'Complete, or failed and back to the start'] },
                  { id: 'addacct', flow: true, g: 'act', t: 'Add account', m: 'Asset · Network · Accounts', x: 744, y: 356, card: true,
                    steps: ['Select asset', 'Network', 'Tap a card', 'Checking the blockchain', 'Choose accounts', 'Added to portfolio'] },
                  { id: 'earn', flow: true, g: 'act', t: 'Earn', m: 'Waitlist', tag: 'Tab 3', x: 744, y: 420,
                    steps: ['Join the waitlist', 'Email', 'Notify me'] },

                  /* 05 · where it lands */
                  { id: 'txns', g: 'log', t: 'Transactions', m: 'Grouped by day · Filter', x: 992, y: 68,
                    steps: ['Today, yesterday, by date', 'Filter sheet'] },
                  { id: 'txd', g: 'log', t: 'Transaction details', m: 'Per type · Pending', kind: 'hub', x: 992, y: 228,
                    steps: ['Sent', 'Received', 'Swapped', 'Pending'] },

                  /* 06 · Profile */
                  { id: 'profile', ex: { steps: ['WalletConnect', 'Wallets, 0 of 4', 'Add wallet', 'Recover wallet', 'App settings', 'Explore Cypherock X0: the shop', 'Support · Terms', 'Exit Explore mode'] }, g: 'prof', t: 'Profile', m: 'Wallets · dApps · App', kind: 'hub', tag: 'Tab 4', x: 496, y: 540,
                    steps: ['WalletConnect', 'Manage wallets', 'Add wallet', 'Recover wallet', 'App settings', 'Support · Terms'] },
                  { id: 'wc', ex: { nudge: true, m: 'Tap or link opens Buy X0', steps: ['Tap it, or a dApp link opens the app', 'Buy X0 sheet, no connection attempted'] }, flow: true, g: 'prof', t: 'WalletConnect', m: 'URL · Wallet · Accounts', x: 520, y: 604, w: 164,
                    steps: ['Paste a URL', 'Select wallet', 'Select accounts', 'Connecting', 'Connection details'] },

                  { id: 'exitx', only: 'explore', flow: true, g: 'prof', t: 'Exit Explore mode', m: 'Back to Welcome', x: 520, y: 668, w: 164,
                    steps: ['Last item on Profile', 'Back to Welcome', 'No confirmation'] },

                  /* 07 · the wallet's life */
                  { id: 'addw', ex: { nudge: true, m: 'Opens Buy X0', steps: ['Buy X0 sheet'] }, flow: true, g: 'wal', t: 'Add wallet', m: 'Returns to setup', x: 248, y: 540,
                    steps: ['Opens wallet options', 'Create or import'] },
                  { id: 'manage', ex: { m: '0 of 4 · No wallets', steps: ['Wallets, 0 of 4', 'No wallet rows'] }, g: 'wal', t: 'Manage wallets', m: 'Up to 4 · Swipe to delete', x: 248, y: 604,
                    steps: ['Wallets, 3 of 4', 'Wallet settings', 'Swipe to delete'] },
                  { id: 'recover', ex: { nudge: true, m: 'Opens Buy X0', steps: ['Buy X0 sheet'] }, flow: true, g: 'wal', t: 'Recover wallet', m: '4 cards · Pick · PIN', x: 248, y: 668, card: true, pin: true,
                    steps: ['Instructions', 'Tap all four cards', 'Wallets found', 'PIN', 'Tap two cards', 'The card missing it', 'The rest', 'Recovered, or none found, or no free slot'] },
                  { id: 'wset', ex: { off: true }, g: 'wal', t: 'Wallet settings', m: 'One wallet', x: 0, y: 540,
                    steps: ['View seed phrase', 'Delete wallet'] },
                  { id: 'seed', ex: { off: true }, flow: true, g: 'wal', t: 'View seed phrase', m: 'Face ID · Tap to reveal', x: 24, y: 604, w: 164,
                    steps: ['Face ID', 'Tap to reveal', '12, 18 or 24 words', 'Screenshots blocked'] },
                  { id: 'delete', ex: { off: true }, flow: true, g: 'wal', t: 'Delete wallet', m: '4 cards · PIN · Caution', kind: 'danger', x: 24, y: 668, w: 164, card: true, pin: true,
                    steps: ['All four cards needed', 'PIN', 'Caution, confirmed', 'Tap four cards in order', 'Deleted'] },

                  /* 08 · settings */
                  { id: 'settings', g: 'set', t: 'Settings', m: 'Also from Home', kind: 'hub', x: 744, y: 540,
                    steps: ['Account', 'Notifications', 'Security', 'Support · About', 'Legal'] },
                  { id: 'prefs', g: 'set', t: 'Preferences', m: 'Currency · Language', x: 992, y: 540,
                    steps: ['Preferred currency', 'Display language', 'Notifications'] },
                  { id: 'security', g: 'set', t: 'Security', m: 'Passcode · Biometrics', x: 992, y: 604,
                    steps: ['App lock', 'Set passcode', 'Biometrics', 'Manage passcode'] },
                  { id: 'help', g: 'set', t: 'Help & legal', m: 'Support · About · Terms', x: 992, y: 668,
                    steps: ['Support', 'About', 'Policies', 'Terms of use'] },
                ],
                /* `down` runs a column; `spine` hangs children off a node's
                   left edge; `r` and `l` leave a node's side, run the trunk
                   at `x` and enter the other node's facing side; `ret` is a
                   return and carries its own points. */
                edges: [
                  { f: 'welcome', t: 'device', r: 'down' },
                  { f: 'device', t: 'tap', r: 'down' },
                  { f: 'tap', t: 'who', r: 'down' },
                  { f: 'who', t: 'cards', r: 'spine' },
                  { f: 'who', t: 'existing', r: 'spine' },
                  { f: 'cards', t: 'options', r: 'r', x: 210, ty: 70 },
                  { f: 'existing', t: 'options', r: 'r', x: 210, ty: 70 },
                  /* explore mode: the selection screen comes straight after
                     the welcome, and Explore the App goes straight to Home */
                  { f: 'welcome', t: 'who', r: 'pts', only: 'explore', pts: [[188, 60], [200, 60], [200, 252], [150, 252]] },
                  { f: 'who', t: 'explore', r: 'spine', only: 'explore' },
                  { f: 'explore', t: 'home', r: 'r', x: 466, only: 'explore' },

                  { f: 'options', t: 'found', r: 'spine' },
                  { f: 'options', t: 'create', r: 'spine' },
                  { f: 'options', t: 'import', r: 'spine' },
                  { f: 'options', t: 'cover', r: 'spine', soft: true },
                  { f: 'found', t: 'home', r: 'r', x: 466 },
                  { f: 'create', t: 'home', r: 'r', x: 466 },
                  { f: 'import', t: 'home', r: 'r', x: 466 },

                  { f: 'home', t: 'empty', r: 'spine', soft: true },
                  { f: 'home', t: 'offline', r: 'spine', soft: true },
                  { f: 'home', t: 'portfolio', r: 'r', x: 714 },
                  { f: 'home', t: 'notif', r: 'r', x: 714 },
                  { f: 'home', t: 'send', r: 'r', x: 714 },
                  { f: 'home', t: 'receive', r: 'r', x: 714 },
                  { f: 'home', t: 'swap', r: 'r', x: 714 },
                  { f: 'home', t: 'addacct', r: 'r', x: 714 },
                  { f: 'home', t: 'earn', r: 'r', x: 714 },

                  { f: 'portfolio', t: 'txns', r: 'r', x: 962 },
                  { f: 'notif', t: 'txns', r: 'r', x: 962, xoff: true },
                  { f: 'txns', t: 'txd', r: 'down', x: 1086 },
                  { f: 'send', t: 'txd', r: 'r', x: 962 },
                  { f: 'swap', t: 'txd', r: 'r', x: 962, xoff: true },

                  { f: 'profile', t: 'wc', r: 'spine' },
                  { f: 'profile', t: 'exitx', r: 'spine', only: 'explore' },
                  { f: 'profile', t: 'settings', r: 'r', x: 714 },
                  { f: 'profile', t: 'addw', r: 'l', x: 466 },
                  { f: 'profile', t: 'manage', r: 'l', x: 466 },
                  { f: 'profile', t: 'recover', r: 'l', x: 466 },
                  { f: 'manage', t: 'wset', r: 'l', x: 210, ty: 564 },
                  { f: 'wset', t: 'seed', r: 'spine' },
                  { f: 'wset', t: 'delete', r: 'spine' },
                  { f: 'addw', t: 'options', r: 'ret', pts: [[342, 540], [342, 400], [230, 400], [230, 50], [248, 50]] },

                  { f: 'settings', t: 'prefs', r: 'r', x: 962 },
                  { f: 'settings', t: 'security', r: 'r', x: 962 },
                  { f: 'settings', t: 'help', r: 'r', x: 962 },
                ],
              } },

            /* ==============================================================
               ACT III — THE DECISIONS (11–20)
               Understanding. Each decision with the alternative taken
               seriously, because that is what separates a decision from a
               preference.
               ============================================================== */

            /* --- CHAPTER 04 · BUILDING THE SYSTEM ---------------------------------

               THE LONGEST CHAPTER IN THE FILM SITS BEHIND THIS CARD: the split,
               and then the eight-scene room. It is the one place a reader most
               needs to be told they are entering something, because the room
               changes ground and holds for six screens. */
            /* x0-ch-4 chapter card removed. */

            /* WHAT CYSYNC ALREADY HAD, SHOWN WITH RESPECT. X1's desktop app
               came first and a lot of work went into it; this scene credits
               that before anything new is introduced, by showing its design
               system level by level with plain names and no verdicts. What X0
               needed sits under the words, and the decision follows. */
            { id: 'x0-cysync', nav: 'Design System', act: 'III · Decisions', kind: 'kept', dur: 130,
              h: 'We started from what CySync already had.',
              p: 'CySync is the <b>desktop app</b> for X1, and a lot of care had gone into it. Its flows came with us: how sending, receiving and reading a transaction work. Its visual parts were made for a desktop window, and X0 would have <b>no desktop app at all</b>.',
              /* PIECES OF THE CYSYNC DESIGN FILE: its colour ramp (the real
                 hexes), its components and a few of the screens built from
                 them, each on a matching plate under its plain name. */
              items: [
                { t: 'Portfolio graph',         src: 'assets/img/x0/cysync/cysync-graph.png' },
                { t: 'Buttons',                 src: 'assets/img/x0/cysync/sys/buttons.webp' },
                { t: 'Transactions table',      src: 'assets/img/x0/cysync/cysync-tables.png' },
                { t: 'Colour',                  swatches: ['#1e1a15', '#211c18', '#27221d', '#2c2520', '#39322c',
                  '#8b8682', '#ccc4be', '#e9b873', '#fedd8f', '#b78d51'] },
                { t: 'Date range picker',       src: 'assets/img/x0/cysync/cysync-date-range.png' },
                { t: 'Toasts',                  src: 'assets/img/x0/cysync/sys/toasts.webp' },
                { t: 'Send window',             src: 'assets/img/x0/cysync/cysync-desktop-layout.png' },
                { t: 'Inputs',                  src: 'assets/img/x0/cysync/sys/inputs.webp' },
                { t: 'Dialogue',                src: 'assets/img/x0/cysync/cysync-dialogue.png' },
                { t: 'Icons',                   src: 'assets/img/x0/cysync/sys/icons.webp' },
                { t: 'Transaction details',     src: 'assets/img/x0/cysync/cysync-transaction-details.png' },
                { t: 'Switches',                src: 'assets/img/x0/cysync/sys/switch.webp' },
                { t: 'Component documentation', src: 'assets/img/x0/cysync/cysync-component-documentation.png' },
                { t: 'Dropdown',                src: 'assets/img/x0/cysync/sys/dropdown.webp' },
                { t: 'Type',                    src: 'assets/img/x0/cysync/sys/type.webp' },
                { t: 'X1 card and vault',       src: 'assets/img/x0/cysync/cysync-x1-vault-and-card.png' },
                { t: 'Sidebar',                 src: 'assets/img/x0/cysync/sys/sidebar.webp' },
                { t: 'Tags',                    src: 'assets/img/x0/cysync/sys/tags.webp' },
                { t: 'Topbar',                  src: 'assets/img/x0/cysync/sys/topbar.webp' },
                { t: 'Dialogues',               src: 'assets/img/x0/cysync/sys/dialogue.webp' },
              ],
              /* what CySync was never asked to do, and so why X0 needed its own */
              needs: { k: 'What X0 needed', v: [
                { t: 'To be readable by AI', icon: 'spark', b: 'Clean tokens and components Claude could read through Figma’s MCP, for quick iterations.' },
                { t: 'To live on a phone', icon: 'phone', b: 'One-handed, on iOS and Android, not a 1024 × 700 window.' },
                { t: 'To ship on time', icon: 'bolt', b: 'A small, reusable kit to design every flow in the map and hand it to developers.' },
              ] } },

            /* THE DECISION USED TO BE A SCENE OF ITS OWN HERE — `x0-dec-1`,
               one sentence on black at 110svh. It said the same thing the
               title card below says and then the title card said it again,
               which is two near-empty screens in a row for one beat of the
               story. The sentence has moved into that card: see `say[0]` of
               `x0-system`, where it is held under the mark and then let go.
               Nothing about the room's choreography changed to take it. */

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
                   smaller than the mark is tall.

                   AND IT CARRIES THE DECISION NOW. That sentence was a scene
                   of its own immediately before this one — black, 110svh, one
                   line — and it was making the same move this card makes:
                   stating that X0 is getting a system of its own. Two screens,
                   one beat. Here they are one object: the mark, its name, and
                   under them the reason it exists.

                   AND THEY ARE A SEQUENCE, NOT A STACK. The decision comes
                   first because it is the decision — one person deciding X0
                   will not inherit CySync — and the system is what that
                   decision produced, so it is introduced after it and by name.
                   Said at the same moment they read as a caption under a logo.

                   `hand` IS THE HAND-OVER: when it starts and how long it
                   runs. It was two fades crossing, and crossing fades on two
                   things in one cell is a double exposure — for a fortieth of
                   the section the name was printed through the sentence and
                   both were legible. It is one front now: the sentence lives
                   only to the right of it, the lockup only to the left, and
                   the front itself is the gold rule standing up and sweeping
                   the card. The rule finishes drawing at 0.07, the front
                   leaves at 0.09, and by 0.17 the card is what it always was —
                   the mark, held to the end of the dissolve as the section's
                   label, in the exact position the placement note above solved
                   for. See `.room__line--hand` in the stylesheet. */
                { at: -0.02, to: 0.88, big: true, k: 'Introducing', n: 'N45 Design System',
                  mark: 'assets/img/x0/system/n45-mark.png',
                  hand: { at: 0.09, sp: 0.08 },

                  /* THE FRAME IS EMPTY WHEN YOU GET HERE, AND THAT IS THE
                     POINT. The card is on from the first frame but it has
                     nothing in it: the eyebrow lands at 0.02, the first line
                     at 0.034, the second at 0.05, and the gold rule draws
                     under `own design system` from 0.066. Roughly fifty
                     screens-worth of section later none of that matters, but
                     the first three hundredths of it are the difference
                     between a decision being made in front of you and a
                     sentence that was already printed on the wall when you
                     walked in. */
                  hk: 'The decision',
                  hkat: 0.02,
                  hat: 0.034,
                  h: ['Let’s give Cypherock X0',
                    'its <span class="fg-key">own design system</span>.'] },

                /* and it lands here, after you have watched the thing build
                   itself out of the parts standing around it */
                { at: 0.90, to: 1.2,
                  h: 'We built the system before we built a single screen.',
                  p: 'Atomic, built for a phone, nothing carried over from CySync. Six months in, it was holding screens we had not thought of when we wrote it.' },
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

                alt: 'The X0 Home screen: combined portfolio, balance, send and receive, accounts' },

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
                  alt: 'The N45 greyscale ramp: ten named steps with their hex values' },

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
                  alt: 'The success snackbar: System synced successfully' },

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
                  alt: 'The primary button: Continue' },

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
              hero: ['09', '01', '13', '15', '16', '14', '05', '22'],
              stops: [0, 0.33, 0.415, 0.5, 0.585, 0.67, 0.755, 0.84],
              cards: ['assets/img/x0/cards/c1.webp', 'assets/img/x0/cards/c2.webp', 'assets/img/x0/cards/c3.webp', 'assets/img/x0/cards/c4.webp'],
              cardAt: 0.08, cardGap: 0.075,
              alts: ['Portfolio', 'Onboarding', 'Send', 'Swap token selector', 'Swap', 'Receive', 'Tap to approve', 'Wallet recovered'],
              cols: [
                ['02', '10', '19', '26', '07', '24'],
                ['04', '11', '17', '28', '21', '03'],
                ['06', '12', '23', '18', '25', '08'],
                ['20', '27', '02', '10', '17', '11'],
                ['24', '03', '28', '06', '19', '12'],
                ['08', '21', '07', '26', '23', '04'],
              ] },


            /* BEFORE THE SYSTEM, AN EXCERPT OF THE ARCHIVE. What the reader
               has just been shown — N45 and the app built on it — reads as if
               it arrived finished. It did not: direction after direction was
               explored — quick Figma mockups, Figma Make prototypes, Claude
               Code prototypes, GPT image generation — and taken to the
               product managers, business development and the CEO before one
               held. This says so quietly and moves on.

               AN EXCERPT, NOT A COUNT. Thirty-five real exploration screens
               from the V1, "Vik AI des" and App v2 Figma files, in an even
               grid that runs off the right edge of the frame — the sheet
               continues past what you can see, because the archive does. No
               frame numbers and no order: numbered frames ending on the
               shipped screen read as "the twenty-fourth idea won". The
               shipped X0 screen sits among them at `kept.at` (the grid fills
               column by column, two rows, so 14 is the eighth column), and as the
               scene holds everything else steps back to grey around it.

               `tools` is the "explored with" line under the copy, set as a
               spec row, key left, values right. */
            { id: 'x0-contact', nav: 'Explorations', kind: 'contact', dur: 200,
              kicker: 'Before N45',
              h: 'None of this was the first version.',
              p: 'We set a fixed timeframe to explore every direction we could. Each one was reviewed with the product managers, business development and the CEO, so the team could agree on one and commit to it.',
              shots: [
                'assets/img/x0/explore/c001.webp',
                'assets/img/x0/explore/c165.webp',
                'assets/img/x0/explore/c057.webp',
                'assets/img/x0/explore/c060.webp',
                'assets/img/x0/explore/c111.webp',
                'assets/img/x0/explore/c168.webp',
                'assets/img/x0/explore/c067.webp',
                'assets/img/x0/explore/c182.webp',
                'assets/img/x0/explore/c002.webp',
                'assets/img/x0/explore/c059.webp',
                'assets/img/x0/explore/c170.webp',
                'assets/img/x0/explore/c064.webp',
                'assets/img/x0/explore/c113.webp',
                'assets/img/x0/explore/c177.webp',
                'assets/img/x0/app/09.webp',
                'assets/img/x0/explore/c061.webp',
                'assets/img/x0/explore/c087.webp',
                'assets/img/x0/explore/c003.webp',
                'assets/img/x0/explore/c173.webp',
                'assets/img/x0/explore/c058.webp',
                'assets/img/x0/explore/c181.webp',
                'assets/img/x0/explore/c066.webp',
                'assets/img/x0/explore/c112.webp',
                'assets/img/x0/explore/c068.webp',
                'assets/img/x0/explore/c174.webp',
                'assets/img/x0/explore/c114.webp',
                'assets/img/x0/explore/c169.webp',
                'assets/img/x0/explore/c063.webp',
                'assets/img/x0/explore/c176.webp',
                'assets/img/x0/explore/c171.webp',
                'assets/img/x0/explore/c065.webp',
                'assets/img/x0/explore/c166.webp',
                'assets/img/x0/explore/c183.webp',
                'assets/img/x0/explore/c178.webp',
                'assets/img/x0/explore/c184.webp',
                'assets/img/x0/explore/c167.webp',
              ],
              cap: 'A fraction of what we drew',
              tools: { k: 'Explored with', v: [
                /* the marks are the official files from each company's brand
                   page, dropped into assets/img/logos under these names; a
                   row whose file is missing simply shows its words */
                { t: 'Quick mockups in Figma', icon: 'assets/img/logos/figma.png' },
                { t: 'Figma Make prototypes',  icon: 'assets/img/logos/figma.png' },
                { t: 'Claude Code prototypes', icon: 'assets/img/logos/claude.png' },
                { t: 'GPT image generation',   icon: 'assets/img/logos/chatgpt.png' },
              ] } },

            /* A SECURITY PRODUCT FINDING SECURITY PROBLEMS IN ITS
               COMPETITORS, sorted into groups — because sorting is what
               analysis actually is. The fourth group is deliberately quiet:
               crediting a competitor reads as confidence.

               AND IT IS DESCRIBED, NOT ACCUSED. No brand is named, nothing is
               reproduced, and each finding is stated as a category rather
               than as an exploit. This is the one scene in the film with
               legal exposure and it is written to survive a lawyer. */
            { id: 'x0-competitors', kind: 'rivals', dur: 230,
              /* WHO WE STUDIED, BY NAME; WHAT WE FOUND, BY CATEGORY. The logos
                 say which products were taken apart. No finding below is tied
                 to any one of them. Official marks live in
                 assets/img/logos/rivals; a missing file shows its name. */
              lead: 'Every wallet claims to be the safest. We studied them all before drawing a single screen.',
              logos: [
                { k: 'trezor', name: 'Trezor', src: 'assets/img/logos/rivals/trezor.png' },
                { k: 'ledger', name: 'Ledger', src: 'assets/img/logos/rivals/ledger.png' },
                { k: 'tangem', name: 'Tangem', src: 'assets/img/logos/rivals/tangem.png' },
                { k: 'dcent',  name: 'D’CENT', src: 'assets/img/logos/rivals/dcent.svg' },
                { k: 'ellipal', name: 'Ellipal', src: 'assets/img/logos/rivals/ellipal.png' },
              ],
              more: 'and many more',
              h: 'We didn\u2019t reinvent the category. We <span class="fg-key">understood</span> it first.',
              sub: 'Every competitor had already shaped what people expect from a hardware wallet. We studied those patterns, their trade-offs and the technology underneath, then decided where X0 should feel familiar and where it had to be different.',
              layers: [
                { h: 'Experience',
                  lead: 'The category had already taught people how to use a hardware wallet.',
                  pts: [
                    'Onboarding, setup, transactions and recovery followed the same mental models across competitors.',
                    'Rather than reinvent them, we used that familiarity to shorten X0\u2019s learning curve.',
                    'A late-mover advantage: familiar where it should be, different where it mattered.',
                  ],
                  role: 'I was designing for a category, not in a vacuum.' },
                { h: 'Security',
                  lead: 'Security claims are easy to compare. Security itself isn\u2019t.',
                  pts: [
                    'I studied how each approach surfaced in the product: authentication, recovery, confirmations, failure states.',
                    'Some patterns were worth adopting because users already knew them; others added friction we had to balance.',
                    'X0 brings multi-factor authentication and secure recovery, built with the security team.',
                  ],
                  role: 'My job wasn\u2019t to rank security architectures. It was to design around what they mean for people.' },
                { h: 'Firmware & constraints',
                  lead: 'The interface was only one layer of the problem.',
                  pts: [
                    'Firmware, device capabilities and security requirements shaped what the UI could and couldn\u2019t do.',
                    'Decisions like Shamir Secret Sharing were cross-functional engineering calls, not visual ones.',
                    'Understanding them early meant they informed the experience instead of surprising it later.',
                  ],
                  role: 'Constraints were part of the brief, not someone else\u2019s problem.' },
              ],
            },

            /* THE EMOTIONAL PEAK, AND THE PAYOFF FOR SCENE 04. The video is
               scrubbed by scroll, so the reader controls the tap and can hold
               it at the moment of contact — and that control is the scene.
               This is the interaction that replaced a whole device; letting
               someone stop it half way is the only way a page can say so. */
            /* NOW THE LAUNCH FILM, PLAYED RATHER THAN SCRUBBED. `play: true`
               loops it muted with no player controls; a sound toggle sits in
               the top-right corner. The film is the Cypherock marketing
               team's launch promo, not Ishaan's work, and `credit` says so
               on the page. The scrubbed walkthrough it replaces is still at
               assets/media/x0/app-walkthrough.mp4 (used as a card image
               further down, so it is not deleted). */
            { id: 'x0-tap', nav: 'Product', act: 'IV · Product', kind: 'video', dur: 170, dark: true,
              play: true, caption: true,
              src: 'assets/media/x0/x0-promo.mp4',
              poster: 'assets/media/x0/x0-promo.webp',
              alt: 'Cypherock X0 launch film: the card, the secure element, supported tokens and the app',
              h: 'This is what replaced the hardware.',
              p: 'Everything about it is designed around a hand doing something physical: tap the card on the phone, hold, done.',
              credit: 'Launch film by the Cypherock marketing team \u00b7 not my work, shown for context' },

            /* THE LAST CHAPTER OF THE PRODUCT: IT SHIPPED. One headline, a
               status, and the three places X0 lives now, shown as the real
               listings. No metrics are claimed here; the listings speak for
               themselves. Amazon (and, optionally, `hw` for the hardware
               photo) draw a labelled placeholder until a `src` is given. */
            { id: 'x0-world', kind: 'shipped', dur: 200,
              kicker: 'Product / Shipped',
              status: 'Status \u00b7 Live',
              h: 'X0 is no longer<br>a concept.<br>It\u2019s out in the <span class="fg-key">world</span>.',
              p: 'X0 is now live across iOS and Android, with the hardware available through Amazon. The product is shipped, and the work continues.',
              surfaces: [
                { name: 'iOS', state: 'Live', src: 'assets/img/x0/launch/ios.webp', ratio: 786 / 1704,
                  alt: 'Cypherock X0 Wallet on the App Store' },
                { name: 'Android', state: 'Live', src: 'assets/img/x0/launch/android.webp', ratio: 610 / 1081,
                  alt: 'Cypherock X0 Wallet on Google Play' },
                { name: 'Amazon', state: 'Available', ratio: 786 / 1704,
                  note: 'US \u00b7 UK \u00b7 Singapore. Not yet in India.',
                  ph: 'Listing screenshot to come' },
              ],
              end: {
                h: 'Shipped is a milestone, not the finish line.',
                p: 'X0 is live today, but the product will keep evolving. New releases, refinements and improvements will continue to shape the experience as more people use it.',
              } },

            /* HOW THE 67% IS MADE: the real files, in the order the work
               happens. The system is documented and tokenised in Figma, an
               AI reads it through MCP, and a plain prompt gives a usable
               screen to argue over; the final pass is still by hand. */
            { id: 'x0-ai', nav: 'Outcomes', kind: 'steps', dur: 280,
              n: '67%',
              sub: 'Accuracy when AI designs with N45.',
              h: 'A design system AI can actually use.',
              ais: [
                { t: 'Figma AI', k: 'figma', src: 'assets/img/logos/figma.png' },
                { t: 'Claude Code', k: 'claude', src: 'assets/img/logos/claude.png' },
                { t: 'Codex', k: 'gpt', src: 'assets/img/logos/chatgpt.png' },
              ],
              steps: [
                { t: 'Document the system', src: 'assets/img/x0/ai/01-docs.webp',
                  d: 'N45 lives in Figma with its own documentation: usage maps, component tokens and decision rules written for an AI to read.' },
                { t: 'Tokenise every decision', src: 'assets/img/x0/ai/02-vars.webp',
                  d: 'Colours, surfaces and components are variables with semantic names, so a model picks \u201csurface/raised\u201d, not a hex code.' },
                { t: 'Let the AI read N45', src: 'assets/img/x0/ai/03-chat.webp',
                  d: 'Connected as a library, the AI searches N45\u2019s components, styles and variables. A plain prompt like \u201cbuild the next step\u201d is enough.' },
                { t: 'Iterate, then polish by hand', src: 'assets/img/x0/ai/04-polish.webp',
                  d: 'The output is a usable screen to discuss and iterate on. Once decisions are final, I polish it manually.' },
              ] },

            /* THE ONLY REFLECTIVE SCENE, at reading size rather than poster
               size, and the scale shift is the signal: this one is meant to
               be read. After twenty-five scenes of cinema, near-stillness
               reads as candour. */
            /* THE RETROSPECTIVE, as a wall of pinned notes rather than a
               wall of text: each card is one lesson, arriving on its own. */
            { id: 'x0-back', kind: 'board', dur: 200,
              h: 'Looking back.',
              cards: [
                { size: 'lead', k: 'The role', t: 'Head of product design, in practice.',
                  b: 'As the only designer, I owned every design, UX and CX decision, working alongside our PM, who helped shape them. Most of those calls were really product calls, and they carried real stakes. I bet on a new design system to let X0 scale, built the product alongside it, and made that system AI-ready at the same time. Not all of it is solved. These are still open challenges, but we\u2019re navigating them and making real progress.' },
                { size: 'stat', k: 'Design to development', n: '1 week \u2192 1\u20132 days',
                  t: 'Up to 5\u00d7 faster.',
                  b: 'What used to take a designer a week now takes me one or two days, because the system does the repeat work.' },
                { k: '', t: 'Designers and developers on the same page.',
                  b: 'Developers build with AI on the same N45 system I design with, so handoff is shorter and delivery more predictable.' },
                { k: '', t: 'More time for testing.',
                  b: 'The time we save goes into testing, security and edge cases. In a crypto finance product, that\u2019s where it matters most.' },
                { k: '', t: 'Segmentation isn\u2019t finished.',
                  b: 'Keeping X0 approachable without feeling like a cheaper X1 comes from small decisions in type, spacing and tone. I\u2019ll keep validating it with real users.' },
              ],
              p: 'I built the foundation that let the product, the engineering team and an AI-assisted workflow scale together.' },

            /* THE END CARD, closing the loop opened in scene 01: the same
               card, the same light, the same position, and the giant letters
               behind it gone. The object no longer needs the title. No
               flourish on the last frame. */
            { id: 'x0-end', kind: 'object', dur: 120, dark: true, rest: true,
              video: 'assets/media/x0/x0-end.mp4', poster: 'assets/media/x0/x0-end.webp',
              still: true,
              h: 'Glad you made it here.',
              meta: 'That\u2019s the Cypherock X0 mobile app and its design system. I also designed the X0 hardware cards, the packaging and everything that goes inside the box.' },
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
        col: 'a', ratio: 1.72,
        /* `sheet` rather than the default `cover`: the artwork is a title card,
           not a photograph, so cropping it to the panel cost the outer columns
           and left it looking like a screenshot of something else. On a field
           it reads as the poster it is, and it picks up the Eido card's push
           on hover — the two are neighbours in the grid. */
        /* THE FLOW REEL: 12s, 60fps, seamless loop, one continuous motion.
           The decks first flick through their screens, then every card rides
           one rail round "hiring."; a single smooth
           rotation (continuous velocity and acceleration) carries two decks
           apart into a ring, slows to an orbit, and gathers them back.
           Source: .tools/talent-vortex/flow.html. Plays muted on a loop. */
        thumb: 'assets/media/onefinnet/talent-flow4.mp4',
        thumbPoster: 'assets/media/onefinnet/talent-flow4.webp',
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
            { k: 'Role', v: 'Product Designer, end to end, plus product direction' },
            { k: 'Timeline', v: 'Jan 2024 to Nov 2025 · Noida, on-site' },
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
          /* TEN SCREENS OF THE PRODUCT, sign up first, presented the way X0's
             store listing is: one height, rounded panels, a tight gutter and
             no captions (`listing`), flipped through sideways. The pressed
             card does not join the row (`anchor: false`). */
          anchor: false,
          listing: true,
          spread: [
            { at: 'a', src: 'assets/img/onefinnet/brief/01-sign-up.webp', w: 1366, h: 1024,
              alt: 'Sign up, the first screen a recruiter sees.' },
            { at: 'a', src: 'assets/img/onefinnet/brief/02-onboarding.webp', w: 1366, h: 1024,
              alt: 'Onboarding, the steps to get a portal ready.' },
            { at: 'a', src: 'assets/img/onefinnet/brief/03-pipeline.webp', w: 1366, h: 1024,
              alt: 'The hiring pipeline as a board.' },
            { at: 'a', src: 'assets/img/onefinnet/brief/04-mails.webp', w: 1366, h: 1024,
              alt: 'Recruiter mail, with an AI summary of each application.' },
            { at: 'a', src: 'assets/img/onefinnet/brief/05-candidate-summary.webp', w: 1366, h: 1024,
              alt: 'A candidate\u2019s details beside the resume report.' },
            { at: 'a', src: 'assets/img/onefinnet/brief/06-screening-criteria.webp', w: 1366, h: 1024,
              alt: 'Setting the screening criteria the assistant works from.' },
            { at: 'a', src: 'assets/img/onefinnet/brief/07-candidate-evaluation.webp', w: 1366, h: 1024,
              alt: 'A candidate the model could not screen, and why.' },
            { at: 'a', src: 'assets/img/onefinnet/brief/08-job-details.webp', w: 1368, h: 1036,
              alt: 'Creating a job, starting from the basics.' },
            { at: 'a', src: 'assets/img/onefinnet/brief/09-apply-form.webp', w: 1366, h: 1024,
              alt: 'A candidate applying, with the resume autofilling the form.' },
            { at: 'a', src: 'assets/img/onefinnet/brief/10-publish.webp', w: 1366, h: 1024,
              alt: 'Configuring and publishing a job.' },
          ],
        },
        study: {
          slug: 'onefinnet-talent',
          /* endcard-onefinnet: the closing card before the footer, the document
             study's version of X0's 'Glad you made it here.' end frame. */
          end: {
            h: 'Glad you made it here.',
            meta: 'That\u2019s Onefinnet Talent: the recruiter app, the AI candidate reports and the admin panel, designed from the first scoping conversations to the metrics we shipped against.',
          },
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
            /* THE FILM, FULL SCREEN — the same opening as X0 and X0 Cards,
               on paper instead of black. 100 applications screened, ranked
               and shortlisted onto the board, the board going live, then the
               Talent logo. Source: .tools/talent-film/film.html */
            kind: 'film',
            tone: 'light',
            film: 'assets/media/onefinnet/talent-film.webm',
            film2: 'assets/media/onefinnet/talent-film.mp4',
            poster: 'assets/media/onefinnet/talent-film.webp',
            /* a portrait cut for phones: tall screening grid, the camera over
               the board. Source: .tools/talent-film/film-phone.html */
            phoneFilm: 'assets/media/onefinnet/talent-film-phone.webm',
            phoneFilm2: 'assets/media/onefinnet/talent-film-phone.mp4',
            phonePoster: 'assets/media/onefinnet/talent-film-phone.webp',
            ground: '#f7f8fa',
            /* no cinema title: the document hero's caption instead, on a
               paper fade at the foot of the film */
            caption: {
              name: 'Onefinnet Talent',
              facts: ['B2B SaaS', 'Product design', '2024 \u2014 25'],
              line: 'The screens where a human decides what the model got right.',
            },
            prog: false,
          },
          /* The dock opens with the study, as it does on a project page. Set
             `reading: true` to have it collapse to its tab instead — the
             machinery for that is still in Rack.applyScope. */
          reading: false,
          /* no annotation dock on this study */
          dock: false,
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

                /* The business problem, drawn: the struck-through framing, then
                   two lanes — how the company grew (one customer at a time,
                   through sales) against the channel it needed (self-serve). */
                { type: 'growth',
                  notLabel: 'The brief wasn\u2019t',
                  not: '\u201cWe wanted to redesign\u2026\u201d',
                  lede: 'It started as a growth problem.',
                  from: {
                    tag: 'How it grew', name: 'Sales-led',
                    note: 'Enterprise-only. Every customer went through sales.',
                    steps: [
                      { icon: 'phone', label: 'Sales call' },
                      { icon: 'screen', label: 'Lengthy demo' },
                      { icon: 'doc', label: 'Manual onboarding' },
                    ],
                    end: { icon: 'user', label: 'One customer', meta: 'High acquisition cost' },
                  },
                  to: {
                    tag: 'What it needed', name: 'A scalable channel',
                    note: 'Teams that find, try and start on their own.',
                    steps: [
                      { icon: 'signup', label: 'Sign up' },
                      { icon: 'bolt', label: 'Self-serve setup' },
                      { icon: 'screen', label: 'First job live' },
                    ],
                    end: { icon: 'users', label: 'Customers at scale' },
                  },
                  axis: 'Time to a customer' },

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
                /* Before and after as five pairs read across, then the four
                   numbers as the figures they are. */
                { type: 'shift', fromLabel: 'Before', toLabel: 'After',
                  pairs: [
                    ['Fragmented workflows', 'Unified workflows'],
                    ['Manual and repetitive tasks', 'AI-powered automation'],
                    ['Low visibility and insights', 'Real-time insights'],
                    ['Slow hiring process', 'Faster hiring'],
                    ['Low user satisfaction', 'High user satisfaction'],
                  ] },

                { type: 'impact',
                  note: 'Impact observed over 6 months after the new experience was released.',
                  items: [
                    { value: '40%', kicker: 'Recruiter effort', label: 'Less recruiter effort', icon: 'down', c: '#2f9e6e',
                      body: 'Automation and AI assistance reduced manual tasks significantly.',
                      trend: [62, 60, 55, 52, 46, 44, 39, 36, 33, 28, 24, 21] },
                    { value: '15%', kicker: 'Trial to paid', label: 'Higher trial-to-paid conversion', icon: 'up', c: '#6d4dd8',
                      body: 'A smoother experience helped more teams convert and stay longer.',
                      trend: [22, 25, 24, 31, 34, 38, 42, 47, 52, 58, 66, 74] },
                    { value: '18%', kicker: 'Task completion', label: 'Increase in task completion', icon: 'up', c: '#3b82f6',
                      body: 'Users completed key actions faster, with fewer drops in between.',
                      trend: [30, 33, 37, 36, 44, 48, 52, 55, 61, 64, 70, 78] },
                    { value: '+7', kicker: 'NPS', label: 'NPS score improvement', icon: 'up', c: '#d99a1a',
                      body: 'A consistent increase in satisfaction and overall user sentiment.',
                      trend: [34, 36, 35, 41, 44, 43, 50, 54, 58, 57, 64, 69] },
                  ] },
              ] },

            { id: 'learnings', nav: 'Learnings', eyebrow: 'Reflection',
              heading: 'Finally, my top learnings',
              body: [],
              blocks: [ { type: 'raw', html: '<ol class="lrn"><li><span class="lrn__n">01</span><b class="lrn__t">Admins vs recruiters</b></li><li><span class="lrn__n">02</span><b class="lrn__t">Making data feel light</b></li><li><span class="lrn__n">03</span><b class="lrn__t">Earning trust</b></li><li><span class="lrn__n">04</span><b class="lrn__t">AI that assists, not replaces</b></li><li><span class="lrn__n">05</span><b class="lrn__t">Built to scale</b></li></ol>' } ] },
          ],
        } },
      /* ----------------------------------------------------------------- Fury
         The Behance study (2023, gallery 170247419), rebuilt from the Figma
         source ("Untitled", key Ju9mNyoaiUD2W0HHMKNhjb) LAYER BY LAYER rather
         than as flattened boards. Every picture in assets/img/fury/ is a single
         asset lifted out of that file — the wordmark, the headset, each phone,
         each key-feature card (with its text layers switched off), each survey
         chart, each VR screen, each photo — and everything that was text in
         Figma is text here, set in this page's own type.

         HOW IT IS BUILT. The sections use the shared document-study frame
         (rail, sticker eyebrows, headings) and each board is an `html` block:
         a composition written for this study, styled in site.css under
         "FURY". Nothing in that markup is shared with another study.

         `tone: 'dark'` on this study means a Fury-pink band.               */
      { title: 'Designing for progressive immersion', meta: 'Mobile to VR, 2025',
        href: '#fury',
        /* in the right-hand stack, under the X1 Vault, taking the empty frame there */
        col: 'b', ratio: 1.6,
        /* a silent teaser loop from the hero film: the headset seats, the
           thoughts blur away, red turns to blue. The full film is inside. */
        thumb: 'assets/media/fury/fury-thumb.mp4',
        thumbPoster: 'assets/media/fury/fury-thumb.webp',
        preview: 'words', line: 'Step into confidence',
        brief: {
          tagline: 'Helping socially anxious people build confidence, one step deeper at a time: from phone, to Cardboard, to headset.',
          summary: 'Fury, an AI companion for social anxiety, is designed so no one '
            + 'has to jump straight into what scares them. It starts small on the phone, '
            + 'steps up to Cardboard VR, then lets people rehearse real situations on a '
            + 'Meta Quest 2, with their growth tracked at every step.',
          facts: [
            { k: 'Scope', v: 'Mobile & Virtual Reality Design' },
            { k: 'Year', v: '2025' },
            { k: 'Timeline', v: '8 weeks, waterfall' },
            { k: 'Platform', v: 'Mobile app · Meta Quest 2 · Cardboard VR' },
          ],
          does: [
            'Primary and secondary research',
            'Survey of 65 people, 7 interviews',
            'Information architecture and task flows',
            'Mobile UI and VR interface design',
            'Figma prototype and Unity build',
            'Usability testing on Oculus Quest 2',
          ],
          cta: 'View the complete case study',
          spread: [
            { at: 'a', src: 'assets/img/thumbs/fury.webp', w: 1600, h: 1000,
              alt: 'Fury’s key features: VR integration, the wheel of emotions, the gamified alter ego and cardboard VR.' },
          ],
        },
        study: {
          slug: 'fury',
          end: {
            /* closes where the film's turn ends: in the safe space */
            h: 'Somewhere safe to start.',
            meta: 'That’s Fury: a mobile companion that helps people name what they feel, and a VR space where they can practise facing it.',
            art: 'assets/media/fury/end-headset.webp',
            artAlt: 'The Meta Quest 2 headset from the film, alone, in calm blue light.',
            cta: { label: 'Let’s talk', href: 'mailto:ishaangupta.888@gmail.com?subject=' + encodeURIComponent('Fury: case study') },
          },
          company: 'Fury',
          category: 'Mobile & VR',
          year: '2025',
          place: 'India',
          role: 'UX Designer',
          lede: 'What if facing social fear could feel safe, guided, and even exciting?',
          eyebrow: 'Fury · Mobile & VR Design',
          title: 'Social Phobia',
          /* the wordmark and the headset, the two layers of the board's
             opening, composed on a transparent canvas over the night field */
          /* THE FILM, FULL SCREEN, the same opening as Talent but on the night
             field. One person's morning: 1 in 8, the 12.7-year wait, a
             presentation at 11, Fury on the phone, a rehearsal in VR, and it
             goes fine. Opens and closes on the hero board, so it loops.
             Source: .tools/fury-film/film.html */
          hero: {
            kind: 'film',
            film: 'assets/media/fury/fury-film.webm',
            film2: 'assets/media/fury/fury-film.mp4',
            poster: 'assets/media/fury/fury-film.webp',
            /* the portrait cut, full screen on phones (.tools/fury-film/film-v9.html, ?v=1) */
            phoneFilm: 'assets/media/fury/fury-film-phone.webm',
            phoneFilm2: 'assets/media/fury/fury-film-phone.mp4',
            phonePoster: 'assets/media/fury/fury-film-phone.webp',
            tone: 'night',
            ground: '#18181c',
            /* the document caption at the foot of the film, same as Talent */
            caption: {
              name: 'Designing for progressive immersion',
              facts: ['Mobile & VR', 'Product design', '2025'],
              line: 'Helping socially anxious people build confidence, one step deeper at a time.',
            },
            prog: false,
          },
          reading: false,
          dock: false,
          back: { label: 'BACK', href: 'index.html' },
          sections: [

            { id: 'overview', nav: 'Overview', eyebrow: 'What & Why ?',
              heading: 'Designing for progressive immersion in social growth',
              body: [
                'What if facing social fear could feel safe, guided, and even exciting? <b>Fury is an AI companion</b> that does exactly that, starting on mobile, expanding into XR, and reaching a <b>Meta Quest 2 VR experience</b> where users can safely explore social scenarios and track their growth every step of the way.',
              ],
              blocks: [
                { type: 'facts', items: [
                  { label: 'Role', values: ['Sole designer', 'Unity build'] },
                  { label: 'Timeline', values: ['2025', '8 weeks', 'Waterfall'] },
                  { label: 'Surfaces', values: ['Mobile app', 'VR app'] },
                  { label: 'Research', values: ['7 interviews', '65 survey responses', '6 expert testers'] },
                  { label: 'Tools', values: [
                    '<img class="fy-tool" src="assets/img/fury/logo-figma.png" alt="" width="16" height="24">Figma',
                    '<img class="fy-tool" src="assets/img/fury/logo-unity-mark.png" alt="" width="20" height="20">Unity'] },
                ] },
                { type: 'raw', html: '<p class="fy-bridge">But first, the thing nobody talks about.</p>' },
              ] },

            { id: 'problem', nav: 'The Problem', eyebrow: 'Shhhhhh !!',
              heading: 'Problem statement',
              body: ['<span class="fy-ps">Enabling <span class="fy-ps__ring">socially anxious<svg viewBox="0 0 240 70" preserveAspectRatio="none" aria-hidden="true"><path class="fy-ps__o" pathLength="1" d="M128 9 C70 5 14 14 8 34 C2 56 70 64 132 61 C196 58 236 46 232 28 C228 12 186 6 118 12"/><path class="fy-ps__k" pathLength="1" d="M214 6 L218 -10"/><path class="fy-ps__k" pathLength="1" d="M226 10 L240 -4"/><path class="fy-ps__k" pathLength="1" d="M233 20 L246 16"/></svg></span> people to overcome obstacles and develop meaningful connections.</span>'],
              blocks: [ { type: 'raw', key: 'problem' },
                { type: 'raw', html: '<p class="fy-bridge">Numbers only say so much. So I went to the people behind them.</p>' },
              ] },

            { id: 'research', nav: 'Research', eyebrow: 'Discovery',
              heading: 'Qualitative research',
              body: ['With such a complex project, this was the stage that defined the product: what social anxiety actually looks like, in people\u2019s heads and in the room.'],
              blocks: [
                { type: 'raw', key: 'methods' },
                { type: 'raw', html: '<p class="fy-bridge">Seven conversations later, the patterns started to show.</p>' },
              ] },

            { id: 'insights', nav: 'Insights', eyebrow: 'Booyaahhh!!', tone: 'dark',
              heading: 'Insight gathering',
              body: ['After digging deep into the topic, it helped me get the <b>full picture</b> of the situation: finding common threads, respecting what people have to say, and finding different viewpoints.'],
              blocks: [ { type: 'raw', key: 'stickies' }, { type: 'raw', key: 'insights' },
                { type: 'raw', html: '<p class="fy-bridge">Then I checked whether it held up beyond the people I knew.</p>' },
              ] },

            { id: 'validation', nav: 'Validation', eyebrow: 'Online media analysis',
              heading: 'Validation',
              body: ['A literature review showed me the trends and where to begin; a survey checked whether the same things were happening in my own surroundings.'],
              blocks: [
                { type: 'raw', key: 'validate' },
                { type: 'raw', html: '<p class="fy-bridge">They didn\u2019t need more information. They needed a safe place to practise.</p>' },
              ] },

            { id: 'ideate', nav: 'Why VR', eyebrow: 'Hmm, what if\u2026',
              heading: 'What already works',
              body: [],
              blocks: [ { type: 'raw', key: 'ideate' },
                { type: 'raw', html: '<p class="fy-bridge">Out of the sticky notes, one idea held: start small on the phone, go deeper in VR.</p>' },
              ] },

            { id: 'solution', nav: 'Solution', eyebrow: 'Let\u2019s Cook',
              heading: 'Proposed Solution',
              body: [],
              blocks: [ { type: 'raw', key: 'dual' },
                { type: 'raw', html: '<p class="fy-bridge">Then came the work of making it real.</p>' },
              ] },

            { id: 'structure', nav: 'Architecture', eyebrow: '(01) Ideate',
              heading: 'Information architecture',
              body: ['Organising, structuring and labelling content in an effective and sustainable way, so users can find information and complete tasks.'],
              blocks: [
                { type: 'raw', key: 'iaFlows' },
                { type: 'raw', html: '<p class="fy-bridge">With the flows on paper, the screens came next.</p>' },
              ] },

            { id: 'design', nav: 'UI Design', eyebrow: 'Lets gooo!!!',
              heading: 'UI design',
              body: ['After creating the user flows and information architecture on paper, I began wireframing in Figma, where I began setting up a <b>basic design system</b> for myself to ease the workload.'],
              blocks: [
                { type: 'head', title: 'Flow 01: Onboarding', body: ['The first two minutes decide whether someone comes back. Here is the whole first run, screen by screen, and why each step is there.'] },
                { type: 'raw', key: 'protoOnboarding' },
                { type: 'head', title: 'Flow 02: Going for therapy', body: ['From home to a VR session in under a minute, on a phone and a piece of cardboard.'] },
                { type: 'raw', key: 'protoTherapy' },
                /* ONE STORY, NOT TWO CHAPTERS. Flow 02 ends with the phone in a
                   Cardboard; Flow 03 picks up on a Quest and steps inside it. */
                { type: 'head', title: 'Flow 03: Inside the session', body: ['Cardboard gets anyone started. On a Quest 2 the session wraps all the way around you, and these are the screens you meet in there.'] },
                { type: 'raw', key: 'vr' },
                { type: 'head', title: 'Unity development', body: ['A 3D environment experience, built in Unity.'] },
                { type: 'raw', key: 'unity' },
                { type: 'raw', html: '<p class="fy-bridge">Time to hand it to someone else.</p>' },
              ] },

            { id: 'testing', nav: 'Testing', eyebrow: 'Mobile & VR app',
              heading: 'Usability testing',
              body: [],
              blocks: [ { type: 'raw', key: 'testing' },
                { type: 'raw', html: '<p class="fy-bridge">A few questions always come up.</p>' },
              ] },

            { id: 'faq', nav: 'FAQ', eyebrow: 'FAQ',
              heading: 'Some questions that generally arise',
              body: [],
              blocks: [ { type: 'raw', key: 'faq' } ] },
          ],
        } },
      /* --------------------------------------------------- X1 Vault, in 3D
         NOT A DOOR. `still` makes the tile a picture rather than a link: no
         href, nothing to press, but the same hover as every other card. It is
         a 16s, 60fps silent loop of the three.js model of the X1 Vault: it
         opens and ends on the assembled front with the logo, eases round as it
         comes apart, holds, and goes back together. `still` also holds it on
         frame one until the page is uncovered and the tile is in view.
         Rendered from the model, poster is its first frame. */
      { title: 'Cypherock X1 Vault', meta: '3D product model, 2026',
        still: true,
        col: 'b', ratio: 1.6,
        thumb: 'assets/media/x1/x1-vault-thumb.mp4?v=2',
        thumbPoster: 'assets/media/x1/x1-vault-thumb.webp?v=2',
        preview: 'bloom' },
      /* ------------------------------------------------------------- X0 Cards
         THE SECOND CHAPTER OF X0, not a new project. The X0 study ends on
         "I also designed the X0 hardware cards, the packaging and everything
         that goes inside the box" — this is that sentence, opened up. It is
         built from the same film engine, the same type and the same pacing,
         with less text and a hero asset on almost every screen.

         WHAT IS STILL WAITING. Most frames here are reserved shots (a `shot`
         with a `label` and an `of`, no `src`): packaging renders, macro
         photography, exploration boards and print files that are not in the
         repository yet. Add `src` to the same object and the frame becomes
         the picture. Every production number that is not confirmed is
         written as [TBD] so nothing unverified ships as fact. */
      { title: 'X0 Cards', meta: 'Hardware & packaging, 2026, Singapore',
        col: 'b', ratio: 1.5,
        /* first in its column: above Onefinnet Talent */
        lead: true,
        /* STILL BEING MADE. `wip` turns the tile into a note rather than a
           door: the pointer becomes an "In progress" tag, and a click writes
           to me instead of opening the study. Delete this line to ship it. */
        wip: {
          label: 'In progress',
          note: 'Contact me for details',
          href: 'mailto:ishaangupta.888@gmail.com?subject=' + encodeURIComponent('X0 Cards: case study'),
        },
        /* the product film: one continuous camera move around a real 3D
           model of the card (front and back from the source artwork), 15s,
           seamless loop. Source scene: .tools/x0-card-film/card2.html (shot-based reel) */
        thumb: 'assets/media/x0/x0-card-reel4-thumb.mp4',
        thumbPoster: 'assets/media/x0/x0-card-reel4-thumb.webp',
        preview: 'fan',
        colours: ['#d9dadd', '#c9cacd', '#b8b9bd', '#a7a8ad'],
        brief: {
          tagline: 'The digital product, made physical.',
          summary: 'The second chapter of X0: the cards, the box, the insert and '
            + 'the instruction cards, designed so everything someone touches '
            + 'before opening the app speaks the same language as the app.',
          facts: [
            { k: 'Role', v: 'Product Designer' },
            { k: 'Timeline', v: '2026 · Singapore' },
            { k: 'Follows', v: 'X0 app · N45' },
            { k: 'Platform', v: 'Cards · Packaging · Print' },
          ],
          does: ['Card design', 'Packaging', 'Print production'],
          cta: 'View the complete case study',
          anchor: false,
          spread: [
            { at: 'a', src: 'assets/img/x0/cards/c1.webp', w: 600, h: 955, alt: 'X0 card 1' },
            { at: 'a', src: 'assets/img/x0/cards/c2.webp', w: 600, h: 955, alt: 'X0 card 2' },
            { at: 'a', src: 'assets/img/x0/cards/c3.webp', w: 600, h: 955, alt: 'X0 card 3' },
            { at: 'a', src: 'assets/img/x0/cards/c4.webp', w: 600, h: 955, alt: 'X0 card 4' },
          ],
        },
        study: {
          slug: 'x0-cards',
          /* the chapter before and after, stated rather than derived, so the
             X0 app study leads straight here and this leads on */
          prev: 'cypherock-x0',
          next: 'onefinnet-talent',
          company: 'Cypherock',
          category: 'Hardware & packaging',
          year: '2026',
          place: 'Singapore',
          role: 'Product Designer',
          lede: 'After defining the digital identity of X0, the next challenge was '
            + 'making the same product language exist in people’s hands.',
          eyebrow: 'Cypherock · Product Design',
          title: 'X0 Cards',
          hero: {
            kind: 'film',
            /* mp4 first: the webm is VP9 profile 1, which phones fail to decode */
            film: 'assets/media/x0/x0-card-reel4.mp4',
            film2: 'assets/media/x0/x0-card-reel4.webm',
            poster: 'assets/media/x0/x0-card-reel4.webp',
            ground: '#060607',
            h: 'X0 Cards',
            meta: [
              { k: 'Chapter two', v: 'X0 beyond the screen' },
              { k: 'Role', v: 'Product Designer' },
              { k: 'Focus', v: 'Cards · Packaging · Print' },
            ],
            cue: 'Scroll',
            prog: false,
          },
          reading: true,
          back: { label: 'BACK', href: 'index.html' },
          mode: 'film',
          scenes: [
            /* 01 · the record, and the one sentence the chapter answers */
            { id: 'xc-record', nav: 'Overview', kind: 'record', dur: 150, rest: true,
              kicker: 'Chapter two of X0',
              h: 'When the interface ended, the product experience had only just begun.',
              lede: 'After defining the digital identity of X0, the next challenge was '
                + 'making the same product language exist in people’s hands.',
              rows: [
                { k: 'Product', v: 'X0 cards and packaging' },
                { k: 'Scope', v: 'Cards · Box · Insert · Instruction cards · Print files' },
                { k: 'Role', v: 'Product Designer' },
                { k: 'Follows', v: 'The X0 app and the N45 design system' },
                { k: 'Timeline', v: '[TBD]' },
              ] },

            { id: 'xc-words', kind: 'words', dur: 170, dark: true,
              kicker: 'Everything touched before the app had to feel',
              items: ['Accessible.', 'Minimal.', 'Premium.', 'Approachable.', 'Consistent.'],
              p: 'The challenge wasn’t packaging. It was trust before the first interaction.' },

            /* 02 · the questions on the wall, before any artwork */
            { id: 'xc-questions', nav: 'The Challenge', kind: 'notes', dur: 180,
              kicker: 'Before any artwork, the questions',
              h: 'Why packaging mattered.',
              items: [
                'How premium should a $40 product feel?',
                'How do we avoid looking cheap?',
                'How do we stay distinct from X1?',
                'How do we keep manufacturing simple?',
                { t: 'How do we communicate security before setup?', keep: true },
              ] },

            /* 03 · one ecosystem, two products — perception, not features */
            { id: 'xc-family', nav: 'X1 and X0', kind: 'vs', dur: 170,
              kicker: 'One ecosystem. Two products.',
              h: 'Compare perception, not features.',
              a: { name: 'X1', words: ['Premium', 'Professional', 'Desktop-first'],
                shot: { src: 'assets/img/x0/kit/x1-stack.webp', alt: 'X1 cards, black with a gold mark' } },
              b: { name: 'X0', words: ['Minimal', 'Mobile-first', 'Everyday users'],
                shot: { src: 'assets/img/x0/cards/c1.webp', alt: 'An X0 card, silver' } },
              p: 'Same family, different promise. The physical language had to say which one you were holding.' },

            /* 04 · the desk: exploration, scattered on purpose */
            { id: 'xc-desk', nav: 'Exploration', kind: 'desk', dur: 230,
              kicker: 'Building the physical language',
              h: 'Nothing started as a render.',
              p: 'Card directions, material tests, print samples and packaging ideas, left out on the desk the way they were made.',
              items: [
                { label: 'Card explorations', of: 'Early card layouts side by side', kind: 'figma', ratio: 1.4, x: 54, y: 5, w: 21, r: 2, d: 0.8 },
                { src: 'assets/img/x0/cards/c2.webp', ratio: 0.628, x: 79, y: 3, w: 9, r: 7, d: 1.4, z: 3, alt: 'X0 card direction' },
                { label: 'Foil explorations', of: 'Silver foil tests on card stock', kind: 'photo', ratio: 1, x: 84, y: 26, w: 13, r: -4, d: 1.2 },
                { label: 'Material tests', of: 'Card materials under one light', kind: 'photo', ratio: 1.2, x: 58, y: 34, w: 17, r: -3, d: 1.6, z: 2 },
                { src: 'assets/img/x0/cards/c3.webp', ratio: 0.628, x: 44, y: 60, w: 8, r: -9, d: 0.9, z: 3, alt: 'X0 card direction' },
                { label: 'Logo sizing', of: 'The mark at three sizes on the card', kind: 'figma', ratio: 1.6, x: 2, y: 66, w: 17, r: -4, d: 1.3 },
                { label: 'Chip colours', of: 'Chip finish options', kind: 'render', ratio: 1, x: 21, y: 70, w: 11, r: 6, d: 0.7 },
                { label: 'Printing samples', of: 'Proofs from the printer', kind: 'photo', ratio: 1.5, x: 30, y: 60, w: 13, r: 3, d: 1.1 },
                { label: 'Texture studies', of: 'Surface finish, close', kind: 'photo', ratio: 1.2, x: 56, y: 68, w: 14, r: -6, d: 1.5 },
                { label: 'Packaging directions', of: 'Box concepts, early', kind: 'render', ratio: 1.4, x: 75, y: 62, w: 19, r: 2, d: 1 },
              ] },

            /* 05 · the constraints, and why each one mattered */
            { id: 'xc-industrial', nav: 'Industrial Decisions', kind: 'board', dur: 210,
              k: 'Industrial decisions',
              h: 'Constraints, not visuals.',
              cards: [
                { size: 'lead', k: 'Thickness', t: 'Plastic card thickness',
                  b: 'It decides whether the card lives in a wallet or a drawer. Final: [TBD].' },
                { k: 'Corners', t: 'Rounded corners',
                  b: 'ID-1 corners keep it familiar in the hand and in a card slot. Radius: [TBD].' },
                { k: 'NFC', t: 'NFC placement',
                  b: 'The antenna decides where the phone has to touch, so the artwork has to point there. Position: [TBD].' },
                { k: 'Print', t: 'Alignment and tolerances',
                  b: 'Edge-to-edge artwork shows every fraction of a millimetre of drift. Tolerance: [TBD].' },
                { k: 'Finish', t: 'Spot UV, silver foil, embossing',
                  b: 'Each one adds cost and a step at the printer, so each one had to earn its place. Used: [TBD].' },
                { k: 'Box', t: 'Durability, shipping and shelf',
                  b: 'The box travels before it is opened, and on a shelf it is the only thing that speaks. Board and tests: [TBD].' },
              ] },

            /* 06 · the unboxing, one moment per screen */
            { id: 'xc-unbox', nav: 'Unboxing', kind: 'reel', dur: 460, dark: true,
              kicker: 'The packaging experience',
              steps: [
                { t: 'The closed box.', label: 'Closed box', of: 'The box on a dark surface, lid on, one key light', kind: 'render' },
                { t: 'The foil logo catches the light.', label: 'Foil logo', of: 'Light sweeping across the silver foil mark', kind: 'render' },
                { t: 'The lid lifts.', label: 'Lid lifting', of: 'The lid halfway up, shadow falling inside', kind: 'render' },
                { t: 'The interior appears.', label: 'Interior', of: 'Looking into the open box', kind: 'render' },
                { t: 'The cards become visible.', label: 'Cards in the box', of: 'The four cards seated in the insert', kind: 'render' },
                { t: 'The instruction card.', label: 'Instruction card', of: 'The instruction card lifted out', kind: 'render' },
                { t: 'The tray.', label: 'Tray', of: 'The insert tray on its own', kind: 'render' },
                { t: 'Four cards, in hand.', label: 'Final reveal', of: 'All four cards fanned out beside the box', kind: 'render' },
              ] },

            /* 07 · the card, given the whole frame */
            { id: 'xc-card', nav: 'The Card', kind: 'object', dur: 180, dark: true,
              word: 'X0', art: 'assets/img/x0/cards/c1.webp', alt: 'The X0 card, silver, vertical',
              kicker: 'The card',
              h: 'Vertical. Silver. Quiet.',
              facts: [
                'Why minimal: [TBD]',
                'Why vertical: [TBD]',
                'Why silver: [TBD]',
                'Why the chip stayed untouched: [TBD]',
                'Why the branding was reduced: [TBD]',
                'Why the typography changed: [TBD]',
              ] },

            /* 08 · details, with almost no words */
            { id: 'xc-details', nav: 'Details', kind: 'desk', dur: 200, dark: true, macro: true,
              kicker: 'Details',
              h: 'Let the photographs talk.',
              items: [
                { label: 'Foil', of: 'Macro: foil edge under raking light', kind: 'photo', treat: 'macro', ratio: 1.2, x: 52, y: 4, w: 24, r: 0, d: 1.3 },
                { label: 'Texture', of: 'Macro: card surface texture', kind: 'photo', treat: 'macro', ratio: 1, x: 79, y: 8, w: 17, r: 0, d: 0.8 },
                { label: 'Edges', of: 'Macro: the card edge and core', kind: 'photo', treat: 'macro', ratio: 1.6, x: 3, y: 60, w: 24, r: 0, d: 1.1 },
                { label: 'Corner radius', of: 'Macro: one corner, very close', kind: 'photo', treat: 'macro', ratio: 1, x: 30, y: 56, w: 16, r: 0, d: 1.5 },
                { label: 'Paper', of: 'Macro: box paper and print', kind: 'photo', treat: 'macro', ratio: 1.3, x: 50, y: 50, w: 20, r: 0, d: 0.9 },
                { label: 'Insert', of: 'Macro: the insert where a card sits', kind: 'photo', treat: 'macro', ratio: 1.1, x: 74, y: 52, w: 20, r: 0, d: 1.2 },
              ] },

            /* 09 · manufacturing, set as an engineering drawing */
            { id: 'xc-spec', nav: 'Manufacturing', kind: 'spec', dur: 210,
              kicker: 'Manufacturing',
              h: 'The print file is part of the design.',
              rows: [
                { k: 'Format', v: 'ID-1 · 85.60 × 53.98 mm' },
                { k: 'Thickness', v: '[TBD]' },
                { k: 'Material', v: '[TBD]' },
                { k: 'Colour', v: 'CMYK · [TBD]' },
                { k: 'Spot UV', v: '[TBD]' },
                { k: 'Silver foil', v: '[TBD]' },
                { k: 'Embossing', v: '[TBD]' },
                { k: 'Bleed', v: '[TBD]' },
                { k: 'Safe area', v: '[TBD]' },
                { k: 'Tolerance', v: '[TBD]' },
              ] },

            /* 10 · the outcome, and the same end card as the app study */
            { id: 'xc-outcome', nav: 'Outcome', kind: 'ask', dur: 150, mid: true,
              kicker: 'Outcome',
              h: 'A product family, not an accessory.',
              p: 'Every touchpoint, from the box to the card to the app, shares one visual language.',
              /* the live 3D card under the line: drag to turn it over */
              card3d: true },

            { id: 'xc-end', kind: 'object', dur: 120, dark: true, rest: true,
              shot: { label: 'The whole family', of: 'Box, four cards and the phone running the X0 app, together', kind: 'render', ratio: 1.778 },
              h: 'Glad you made it here.',
              meta: 'That’s X0 beyond the screen: the cards, the box, the insert and the instruction cards, designed as one system with the app.' },
          ],
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
          'The no-code dashboard covers the core loop well. The issue starts when you want Websets to run on its own or talk to other tools: reacting to a monitored event, keeping a list fresh on a schedule, or piping results into Clay, Slack, or a CRM.',
          'These aren’t niche edge cases. The people who’d get the most out of Websets (account executives, recruiters, outbound leads, GTM operators) generally aren’t engineers. The automation layer, the part that turns Websets into a sales pipeline, is locked behind a skill its target users don’t have.',
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
      hint: 'Dec 2025 to now · Gurugram',
    },
    vibecoding: {
      tone: 'light',
      media: 'assets/media/x0/app-walkthrough.webp',
      title: 'Vibecoding',
      body: 'Designing by building it. This site is hand-written HTML, CSS and JavaScript. No framework, no build step, every measurement taken off a real screen.',
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
        year: '2025 to now',
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
          'Rethought transaction review for multisig signers, the moment where a wrong click costs the most.',
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
        year: '2022 to 2023',
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
    /* ---- THE OPENING: who I am, before what I've done ------------------
       DRAFT COPY, written to be edited. `photo.src` is empty on purpose: the
       box shows a marked placeholder until a real portrait is dropped in
       (e.g. 'assets/img/about/portrait.jpg', portrait 4:5). */
    intro: {
      photo: { src: '', alt: 'Ishaan Gupta', note: 'Your portrait · 4:5' },
      /* `<em>` sets a word in the italic the homepage headline uses */
      lede: 'I design the whole thing, from the object in your hand to the app on your <em>screen</em>.',
      paras: [
        'A product designer who also writes the code. Right now I’m designing '
          + 'the X0 ecosystem at Cypherock.',
      ],
    },

    /* Tools and Kind words were here; removed for now. To bring either back,
       add a `tools: { title, items: [{ name, what }] }` or
       `quotes: { title, items: [{ text, who, role }] }` entry — the page
       renders a section only when its entry exists. */

    /* ---- OUTSIDE WORK. Image slots: add `src` to each when the photos exist. */
    life: {
      title: 'Outside work',
      items: [
        { src: '', caption: 'A photo from somewhere you travelled', ratio: 0.8 },
        { src: '', caption: 'Something you make or tinker with', ratio: 1 },
        { src: '', caption: 'A hobby, a place, a habit', ratio: 0.8 },
      ],
    },

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
        logo: 'assets/img/logos/cypherock-tile.webp',
        url: 'https://www.cypherock.com/',
        role: 'Product Designer',
        /* START MONTH TO CONFIRM: set to the month you joined */
        when: 'Jan 2026 – Present',
        /* marks the job you're in now: green pulsing node + "Now" pill */
        current: true,
        body: 'Self-custody hardware wallets. I lead design for the X0 ecosystem: '
          + 'the NFC card, its packaging and the companion app.',
        wins: [
          'Took X0 from concept to beta in four months.',
          'Built the N45 design system that made handoff repeatable across platforms.',
          'Led the CySync v2 redesign: +40% engagement, 25% fewer steps.',
        ],
        tags: ['Product Design', 'Interaction Design', 'Design Systems', 'Hardware', 'Crypto'],
      },
      {
        company: 'Onefinnet',
        initials: 'ON',
        logo: 'assets/img/logos/onefinnet-tile.png',
        url: 'https://onefinnet.com/',
        role: 'UI/UX Designer',
        when: 'Jan 2024 – Dec 2025',
        body: 'A B2B recruitment platform for the US market. I owned product '
          + 'design for Onefinnet Talent and led a team of seven.',
        wins: [
          'Created a new revenue stream: +12% enterprise adoption in six months.',
          'Designed the AI assistant for hiring: 40% less recruiter effort.',
          'Built a 100+ component design system, cutting handoff time 30%.',
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
    note: 'Hand-built with vanilla HTML, CSS and JavaScript. No framework, no build step.',
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
