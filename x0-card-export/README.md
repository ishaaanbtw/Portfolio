# X0 Card: embeddable 3D model

A drag-to-rotate version of the X0 card, taken from `.tools/x0-card-film/card2.html`.

## Files
- `x0-card.js`: the card (geometry, materials, lighting, drag controls)
- `index.html`: a working demo page
- `tex/`: textures

## Textures
Put the originals in `tex/` with these exact names:
`front.png`, `back.png`, `front_crm.png`, `back_crm.png`.
Until they're there, it uses `front_fallback.png` (Card 1) and `back_fallback.png` with a plain satin finish.

## Add it to another site
1. Copy this whole folder into the site.
2. Paste the `<script type="importmap">` block from `index.html` into the page's `<head>`.
3. Put a sized box where the card should go: `<div id="x0-card" style="width:400px;height:520px"></div>`
4. Add:
   ```html
   <script type="module">
     import { mountX0Card } from './x0-card-export/x0-card.js';
     mountX0Card(document.getElementById('x0-card'), { texPath: './x0-card-export/tex/' });
   </script>
   ```

Options: `background` (null = transparent), `autoRotate` (true/false), `halo` (0 to switch off), `texPath`.

## Preview locally
Browsers block textures when you open the file directly. Run `python3 -m http.server` in this folder, then open http://localhost:8000.
