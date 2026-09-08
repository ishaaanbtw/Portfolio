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

exec python3 -m http.server "$PORT" --bind 127.0.0.1
