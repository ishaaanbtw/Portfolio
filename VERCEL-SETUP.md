# Vercel + your domain, with Claude able to update it

Your `Downloads/portfolio` folder is now the deploy-ready source — I applied everything in place, so this is the only copy you need to keep. No zip juggling.

Added since last time: **`vercel.json`** (Vercel ignores the `_headers` file other hosts use, so the cache and security rules had to be rewritten in Vercel's own format) and **`.gitignore`** (keeps `.DS_Store`, your `.tools/` scripts and `_to_delete/` out of the repo).

---

## Step 1 — GitHub (15 minutes, once)

You need this. It's what makes "Claude changes it → it goes live" possible; without a repo there's nothing for Vercel to watch.

1. Sign up at **github.com**. Note your username.
2. Download **GitHub Desktop** (desktop.github.com) and sign in.
3. **File → Add Local Repository** → choose `Downloads/portfolio`. It'll say this isn't a git repository — click **create a repository** in that message.
   - Name: `portfolio` · leave "Git ignore" as None (you already have one) · **Create repository**.
4. Click **Commit to main** (bottom left), then **Publish repository** (top).
   - Uncheck "Keep this code private" if you want it public. Either works with Vercel.
   - Do **not** publish it into a GitHub *organization* — Vercel's free Hobby plan can't connect to org-owned repos, only personal ones.

## Step 2 — Vercel (3 minutes)

1. Sign up at **vercel.com** → **Continue with GitHub**. Authorise it.
2. **Add New → Project** → find `portfolio` → **Import**.
3. Build settings. This is the only screen people get wrong:
   - Framework Preset: **Other**
   - Build Command: **empty** (delete anything there)
   - Output Directory: **`./`**
   - Install Command: **empty**
   - Everything else: leave alone. Your `vercel.json` handles the rest.
4. **Deploy.** ~20 seconds — static HTML doesn't count as a build on Vercel, so there's nothing to compile.
5. You get `portfolio-something.vercel.app`. Open it and click around.

## Step 3 — Your domain

1. Vercel → your project → **Settings → Domains → Add Domain**. Type your domain.
2. Vercel will offer to add the `www` version too. Say yes — then set whichever one you want as primary and Vercel redirects the other to it automatically.
3. Vercel then shows you the **exact DNS records to create**. Copy them from that screen, not from a blog post: the apex `A` record IP and especially the `CNAME` target are now **project-specific** (they look like `d1d4fc829fe7bc7c.vercel-dns-017.com`), so the old generic `cname.vercel-dns.com` value you'll find on Stack Overflow will silently fail.
4. Paste those into your registrar's DNS panel. Typically:
   - Root domain → **A** record, host `@`, value = the IP Vercel shows
   - `www` → **CNAME** record, host `www`, value = the target Vercel shows
5. Wait. Usually 5–30 minutes; occasionally a few hours. Vercel's Domains page flips to a green "Valid Configuration" when it's through, and issues the HTTPS certificate itself.

**If your DNS is on Cloudflare:** set both records to **DNS only** (grey cloud, not orange). With the proxy on, Vercel can't complete certificate validation and you get a redirect loop. This is the single most common failure.

**If you'd rather not touch DNS records:** Vercel also offers a nameserver method — you point your registrar at Vercel's nameservers and Vercel runs your DNS. Cleaner, but it moves *all* your DNS to Vercel, so if that domain currently has email (MX records) or anything else attached, you'd have to re-create those in Vercel first. Records are the safer choice if the domain is already in use.

---

## Step 4 — The part you actually asked about: editing with Claude, auto-deploying

Once Step 1 and 2 are done, Vercel watches the `main` branch. Anything that lands on `main` is live 30–40 seconds later. So the question is only how changes get to `main`. Three ways, and you can mix them:

### You edit, GitHub Desktop pushes
Change `assets/js/content.js` → open GitHub Desktop → type a line describing the change → **Commit to main** → **Push origin**. Live in under a minute. Two clicks, and you get full version history — any bad edit is one "Revert" away.

### Claude edits and pushes for you
In a new Cowork session: *"clone my portfolio repo, add a new writing entry about X, push it."* I clone the repo in my own sandbox, make the edit, commit, push — Vercel deploys. You never open a terminal.

For that I need push access, which means a GitHub token:

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
2. Repository access: **Only select repositories** → pick `portfolio` (nothing else)
3. Permissions → Repository permissions → **Contents: Read and write**
4. Expiration: 90 days is a sensible default
5. Generate, copy it, paste it to me when you want me to make a change

That token can touch exactly one repo and nothing else in your account. If you ever want to cut access, revoke it on that same page — no other cleanup needed.

### Or: run Cowork on your computer instead
Worth knowing, because I hit it during this setup. I tried to initialise the git repo in your folder for you and it failed — `Operation not permitted` on git's lock and object files. That's a limitation of how this cloud session reaches your disk through a bridge, not something wrong with your Mac or your folder. GitHub Desktop will work there without issue.

If you'd rather Claude just commit and push directly from your machine using the git credentials GitHub Desktop already set up — no token to manage — start the task on your computer instead of in the cloud: in the desktop app, use the **"Run this task"** picker at the top right when starting a new Cowork task. (If you don't see that picker, the option isn't enabled on your account, and the token route above is the way.)

---

## Vercel's free tier, for your site specifically

| | Hobby (free) | Your site |
|---|---|---|
| Bandwidth | 100 GB/month | ~7.5 MB per full visit → roughly 13,000 complete visits/month before you'd notice |
| Deployments | 100/day | You will not hit this |
| Build minutes | n/a — static HTML isn't a build | Nothing to compile |
| Custom domains | 50 per project | You need 2 (root + www) |
| HTTPS | Automatic, renews itself | — |

One thing to know: Hobby is licensed for **personal, non-commercial** use. A portfolio, including one that gets you hired, is squarely fine. Selling something from it isn't.

The realistic way to burn 100 GB is the 1.9 MB video and the 668 KB image in the case study, if a link goes properly viral. If Vercel ever emails you about usage, that's the place to look first.

---

## Still open

1. **I need your domain name and where you bought it.** The `og:image` tags and `sitemap.xml` still contain `REPLACE-WITH-YOUR-DOMAIN` placeholders — link previews on WhatsApp, X and LinkedIn will be unreliable until those are absolute URLs. Tell me the domain and I'll patch all six pages plus the sitemap in a couple of minutes.
2. **Your social links point nowhere.** `content.js` lines 37–38: GitHub is `https://github.com/` and X is `https://x.com/`, both without a username. Add your handles or delete the entries.
3. **The Résumé button is dead.** `resumeUrl: '#'` in `content.js`. Drop a PDF in `assets/` and point at it, or remove the button — right now it renders greyed out.
4. **Mobile: the drawing toolbar is clipped.** At 390 px wide the right-hand tool rail runs off the edge of the screen. Everything else responds correctly.
5. **`_to_delete/` is 67 MB.** Temp files from packaging, plus the half-created `.git` folder from my failed attempt. I can't delete from here — drag it to the Trash. Do this **before** GitHub Desktop's first commit so it doesn't end up in your history (though `.gitignore` already excludes it).
