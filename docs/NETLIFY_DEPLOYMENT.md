# Netlify deployment

How this portfolio deploys to Netlify, and why it is configured the way it is.

---

## Before anything: this is not a static export

It is tempting to set `output: "export"` and publish a folder of HTML. **Do not**
without changing the config first.

`next.config.ts` defines `redirects()`, which maps `/about`, `/journey`,
`/skills`, `/experience`, `/achievements`, `/leadership` and `/contact` onto
their anchors on the single cinematic page, plus `/education` → `/#about`
(education is rendered inside the About section, not as a section of its own).
Redirects are a server feature. A static export drops them silently, and every
one of those URLs starts returning 404 — including links people may already
have.

So the deploy uses **`@netlify/plugin-nextjs`**, which implements Next's routing
and redirects on Netlify's edge. It is declared in `netlify.toml`.

---

## Option A — Deploy from GitHub (recommended)

Continuous deployment: every push to `main` rebuilds; every pull request gets a
preview URL.

1. Push the repository to GitHub.
2. In Netlify: **Add new site → Import an existing project → GitHub**.
3. Authorise Netlify and pick `shubhamporfolio`.
4. Netlify reads `netlify.toml` and fills in the build settings. Confirm they
   read:

   | Setting | Value |
   | --- | --- |
   | **Build command** | `npm run build` |
   | **Publish directory** | `.next` |
   | **Node version** | `22` (from `netlify.toml`) |
   | **Functions directory** | left blank — the plugin manages it |

5. **Deploy site.**

The first build takes a few minutes, largely because `ffmpeg-static` downloads
its binary during `npm install`. Subsequent builds reuse the cache.

---

## Option B — Deploy from the CLI

Useful for a one-off deploy or when you would rather not connect the repository.

Install the CLI (once, globally):

```bash
npm install -g netlify-cli
```

Authenticate:

```bash
netlify login
```

Link the folder to a site — create a new one or pick an existing one:

```bash
netlify init
```

Optionally preview locally behind Netlify's proxy first — this applies the
redirects and headers exactly as production will, which the plain Next dev server
does not:

```bash
netlify dev
```

That serves on <http://localhost:8888>, proxying the Next dev server on 3000, per
the `[dev]` block in `netlify.toml`.

Deploy a **draft** to a preview URL first:

```bash
npm run deploy:preview
```

Check the preview URL it prints, then promote to production:

```bash
npm run deploy
```

Those two scripts are `netlify deploy --build` and
`netlify deploy --build --prod`. `--build` makes Netlify run the build itself, so
the deployed output always matches the committed source rather than whatever is
in your local `.next`.

---

## Environment variables

**None are required.** The application reads no environment variables — `src/`
contains no `process.env` references, and every piece of content is committed
data under `src/data/`.

The only build-image setting is `NODE_VERSION`, already pinned to `22` in
`netlify.toml`.

If you later add a variable (an analytics ID, a contact-form endpoint):

1. **Site configuration → Environment variables → Add a variable**
2. Anything the browser must read has to be prefixed **`NEXT_PUBLIC_`**, and is
   therefore public — never put a secret behind that prefix.
3. Document it in `.env.example` with a placeholder.
4. Redeploy: environment changes do not apply to existing builds.

---

## Custom domain and HTTPS

1. **Domain management → Add a domain** and enter your domain.
2. Point DNS at Netlify, either:
   - **Netlify DNS** — change the nameservers at your registrar; or
   - **External DNS** — add a `CNAME` for `www` to `<site>.netlify.app`, and an
     `ALIAS`/`ANAME` (or Netlify's load-balancer IP) for the apex.
3. Wait for DNS to propagate — minutes to a few hours.
4. **HTTPS → Verify DNS configuration → Provision certificate.** Let's Encrypt
   certificates are free and renew automatically.
5. Turn on **Force HTTPS** once the certificate is live.

Set one of `example.com` or `www.example.com` as primary; Netlify redirects the
other automatically.

---

## Routing and redirects

Handled in two places, deliberately:

| Where | What it covers |
| --- | --- |
| `next.config.ts` → `redirects()` | The eight section paths → anchors on `/`. Owned by the app, applied by the plugin. |
| `netlify.toml` → `[[headers]]` | Cache policy for `/images`, `/video`, `/resume`, plus security headers on `/*`. |

### Why the asset caches are not `immutable`

Assets here are replaced **in place under stable filenames** — `npm run avatar`
overwrites the portrait, `npm run hero:video` overwrites the hero loop, and the
CV is dropped in as the same `Shubham-Badgujar-Resume.pdf`. An `immutable`
directive would strand returning visitors on a year-old copy with no way to
refresh it, so those paths use `must-revalidate` instead.

Next's own output under `/_next/static/*` is content-hashed, so the runtime
plugin caches that hard already — nothing to configure.

**There is no `_redirects` file, and none is needed.** The Next runtime handles
routing for all real routes (`/`, `/projects`, `/projects/[slug]`, `/quick`) and
serves the App Router's own `not-found` page for anything else. Adding a
catch-all SPA rule such as `/* /index.html 200` would actively break the project
case-study routes by swallowing them.

Only add `_redirects` for genuinely Netlify-level concerns — vanity URLs,
redirecting a retired path, or proxying an external API.

---

## Troubleshooting

### Build fails with a Node version error
`netlify.toml` pins `NODE_VERSION = "22"`. If a UI-level environment variable
also sets `NODE_VERSION`, the UI wins — remove it there.

### Section URLs 404 in production (`/about`, `/skills`, …)
The Next plugin is not active. Confirm `@netlify/plugin-nextjs` appears in the
build log's plugin list, and that the publish directory is `.next` and not `out`
or `public`. This is the failure mode a static export produces.

### Page loads but CSS is missing
Publish directory is wrong. It must be `.next`. Pointing it at `public` serves
the static assets folder alone.

### Build times out or is very slow
`ffmpeg-static` downloads ~80 MB during install. It is only needed for
`npm run hero:video` locally. Options: leave it (it caches), or move it out of
the deployed dependency set and install it on demand when regenerating video.

### Video or images 404 in production
They must live under `public/` to be served — see [ASSETS.md](./ASSETS.md).
Check the case of the filename: Netlify's filesystem is case-sensitive where
Windows is not, so `Shubham-Portfolio-Video.mp4` and
`shubham-portfolio-video.mp4` are different files
there and identical locally.

### Resume downloads as `index.html`
The link points at a path that does not exist, so the SPA fallback answered.
Confirm the file sits at `public/resume/Shubham-Badgujar-Resume.pdf` and that
`profile.resumeUrl` matches it exactly.

### A deploy succeeded but the site looks stale
Netlify serves the last successful deploy. Check **Deploys** for a newer failed
build, and use **Clear cache and deploy site** if a dependency changed.

### Hydration warning in production
Almost always a visitor's browser extension rather than the build — the hero
contains a `<video>`, which media extensions attach to. It is worth confirming
in a private window before treating it as a code defect.
