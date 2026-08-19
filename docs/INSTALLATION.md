# Installation

Getting the portfolio running locally, and what to do when it does not.

---

## Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| **Node.js** | **20.12 or newer** | Next.js 16 needs 20.9+; the asset scripts use `--env-file-if-exists`, added in 20.12. Developed on 24.x. |
| **npm** | 10 or newer | Ships with Node. Any of pnpm/yarn/bun works, but the lockfile here is npm's. |
| **Git** | any recent | Only needed to clone. |

Check what you have:

```bash
node -v && npm -v
```

A GPU is not required. The 3D scenes fall back to static images when WebGL is
unavailable, and the site is fully readable without them.

---

## 1. Clone and install

```bash
git clone https://github.com/Shubham07badgujar/shubhamporfolio.git
```

```bash
cd shubhamporfolio && npm install
```

`npm install` pulls two heavy development-only dependencies:

- **`sharp`** — native image processing, used by `npm run avatar`.
- **`ffmpeg-static`** — downloads an ffmpeg binary (~80 MB) on install, used by
  `npm run hero:video`.

Neither is used by the site at runtime. If the install script for
`ffmpeg-static` is blocked by your npm settings, that is harmless — everything
except `npm run hero:video` still works.

---

## 2. Environment variables

**The site needs none.** There is not a single `process.env` reference in
`src/`; all content is committed data under `src/data/`, so it builds and runs
with no configuration.

`.env.example` documents the optional variables consumed by the asset scripts in
`scripts/`. Copy it only if you intend to regenerate assets:

```bash
cp .env.example .env
```

On Windows CMD use `copy .env.example .env`.

`.env` and `.env.local` are git-ignored. `.env.example` is deliberately
un-ignored in `.gitignore` so the template stays in the repository.

**How it is read.** The asset scripts run as `node --env-file-if-exists=.env`,
so they pick up a `.env` in the project root and run fine without one. Next.js
also loads `.env` / `.env.local` automatically for `next dev` and `next build`,
but the site reads nothing from it. That needs Node **20.12+**, which is why
`engines.node` is pinned there.

---

## 3. Run locally

```bash
npm run dev
```

Then open <http://localhost:3000>.

Available routes:

| Route | What it is |
| --- | --- |
| `/` | The full cinematic single-page experience |
| `/projects` | Index of all systems |
| `/projects/[slug]` | Case study per system (9 of them) |
| `/quick` | Quick View — the fast, scannable recruiter layer |

Section paths such as `/about` and `/skills` redirect to their anchors on `/`.

---

## 4. Production build

```bash
npm run build
```

Then serve the build:

```bash
npm start
```

The build prerenders 15 pages. Expect output like:

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /projects
├   /projects/[slug]
│ ├ ● /projects/erp
│ ├ ● /projects/food-donation-system
│ ├ ● /projects/krishibandhu
│ └ ● [+6 more paths]
└ ○ /quick
```

To run everything CI would run:

```bash
npm run verify
```

That is `typecheck` → `lint` → `build` in sequence.

---

## 5. Regenerating assets (optional)

Only needed when replacing the source photograph or video. See
[ASSETS.md](./ASSETS.md) for what each script expects.

```bash
npm run avatar
```

```bash
npm run hero:video
```

---

## Common issues

### A Node version error on install or build
Upgrade Node. Use [nvm](https://github.com/nvm-sh/nvm) or
[nvm-windows](https://github.com/coreybutler/nvm-windows) to hold several
versions side by side.

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### `Jest worker encountered N child process exceptions`
Two dev servers are competing over the same `.next` directory. Stop every
running `next dev`, delete `.next`, and start one:

```bash
rm -rf .next && npm run dev
```

On Windows PowerShell: `Remove-Item -Recurse -Force .next`.

### Hydration mismatch reported in the dev overlay
Usually a **browser extension** injecting into the page before React hydrates —
media/video-speed extensions are the common culprit, since the hero contains a
`<video>`. Confirm by loading the site in a private window with extensions
disabled. If it disappears there, it is not the code.

### `sharp` fails to install or load
It ships prebuilt binaries for common platforms; on an unusual one it compiles
from source and needs build tools. It is only used by `npm run avatar`, so you
can ignore the failure unless you are regenerating the cut-out.

### `npm run hero:video` cannot find ffmpeg
`ffmpeg-static`'s postinstall did not run. Re-run it explicitly:

```bash
npm rebuild ffmpeg-static
```

### The 3D scenes do not appear
Check WebGL is enabled at <https://get.webgl.org>. Without it the site
deliberately falls back to static imagery — that path is supported, not broken.

### Animations do not play
If your OS has **Reduce Motion** enabled, that is intentional: smooth scrolling,
the preloader and the scroll-driven scenes are all disabled and replaced with
static equivalents.
