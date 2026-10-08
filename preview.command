#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  PREVIEW THE PORTFOLIO
#
#  Double-click this file. It serves this folder over http and opens it.
#
#  WHY IT IS NEEDED. Opening index.html by double-clicking gives the page a
#  `file://` address, and Chrome treats every file:// document as its own
#  opaque origin — so the page is not allowed to read a file sitting next to
#  it. That is a browser security rule, not a bug in the site, and the one
#  thing it breaks is IshaanLLM: the panel opens, but it cannot fetch
#  IshaanLLM_Knowledge_Base.md, so it has nothing to answer from.
#
#  Over http it simply works, which is also how it will behave deployed.
#  Nothing here is part of the site — this file is a local convenience and can
#  be left out of any upload.
#
#  Ctrl-C in the Terminal window, or just close it, to stop.
# ─────────────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")" || exit 1

PORT=8000
# if 8000 is busy, walk up until something is free
while lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

echo ""
echo "  Serving $(pwd)"
echo "  http://localhost:$PORT/"
echo ""
echo "  Close this window to stop."
echo ""

# open the browser a beat after the server is up
( sleep 1; open "http://localhost:$PORT/" ) &

# A plain `python3 -m http.server`, taught the two things Vercel does for this
# site (see vercel.json): clean URLs — /about serves about.html, and
# /about.html redirects to /about — and the old /work/<slug> addresses
# redirecting to /<slug>. Unknown paths get 404.html, like the live site.
exec python3 - "$PORT" <<'PY'
import http.server, os, sys, re
class H(http.server.SimpleHTTPRequestHandler):
    def _go(self, to):
        self.send_response(308); self.send_header('Location', to); self.end_headers()
    def _route(self):
        path, q = (self.path.split('?', 1) + [''])[:2]
        q = ('?' + q) if q else ''
        m = re.match(r'^/work/([\w-]+?)(?:\.html)?/?$', path)
        if m: return self._go('/' + m.group(1) + q)
        if path == '/index.html': return self._go('/' + q)
        m = re.match(r'^/([\w-]+)\.html$', path)
        if m and m.group(1) != '404': return self._go('/' + m.group(1) + q)
        if path != '/' and '.' not in os.path.basename(path) and os.path.isfile('.' + path + '.html'):
            self.path = path + '.html' + q
        return None
    def do_GET(self):
        if self._route() is None: super().do_GET()
    def do_HEAD(self):
        if self._route() is None: super().do_HEAD()
    def send_error(self, code, message=None, explain=None):
        if code == 404 and os.path.isfile('404.html'):
            body = open('404.html', 'rb').read()
            self.send_response(404); self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body))); self.end_headers()
            if self.command != 'HEAD': self.wfile.write(body)
            return
        super().send_error(code, message, explain)
http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), H).serve_forever()
PY
