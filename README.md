# Shubham Badgujar — An Interactive Engineering Experience

A cinematic, 3D personal portfolio: a single scroll-driven page that moves from a
video hero, through a four-year engineering journey, into nine system case
studies with live architecture diagrams — plus a Quick View layer for anyone who
would rather read than explore.

> Building intelligent systems at the intersection of software, AI and
> real-world problems.

```bash
npm install
npm run dev          # http://localhost:3000
```

**Documentation** — [Installation](docs/INSTALLATION.md) ·
[Netlify deployment](docs/NETLIFY_DEPLOYMENT.md) · [Assets](docs/ASSETS.md)

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, React 19, TypeScript strict) |
| Styling | **Tailwind CSS 4** with a CSS-variable design system |
| 3D | **React Three Fiber 9** + **Three.js**, custom GLSL for the portrait shaders |
| Animation | **GSAP** (+ ScrollTrigger), **Framer Motion**, **Lenis** smooth scroll |
| Assets | **sharp** (image pipeline), **ffmpeg-static** (video pipeline) — build-time only |
| Hosting | **Netlify** via `@netlify/plugin-nextjs` |

No runtime environment variables, no database, no API. Every piece of content is
typed data in `src/data/`.

---

## Routes

| Route | What it is |
| --- | --- |
| `/` | The full cinematic experience — nine sections |
| `/projects` | Index of every system |
| `/projects/[slug]` | Case study per system (9 prerendered) |
| `/quick` | **Quick View** — fast, scannable, no 3D |

Section paths (`/about`, `/skills`, `/contact`, …) redirect to their anchors on
`/`; `/education` points at `/#about`, since education is rendered inside the
About section. 15 pages are prerendered at build time.

---

## Features

- **Video hero** — a seamless 10s loop, cross-faded so it never jumps, with a
  poster painted by CSS so the first frame is on screen before the video exists.
- **Cursor-reactive portrait** — supports a two-image cross-reveal under a soft
  mask that follows an eased cursor.
- **Scroll-driven journey** — a 3D path through 2022→2026, camera moving between
  year nodes, each with its own vignette (terminal, circuit board, drone, neural
  network, engineer core).
- **System viewer** — every project renders a live node-and-edge architecture
  diagram with animated data packets; RAG and pipeline projects get an
  interactive stage player.
- **Skill constellation** — a canvas of category hubs orbited by their skills.
- **Sticky stacked ending** — the contact panel pins while the footer rides up
  over it.
- **Graceful degradation** — WebGL scenes fall back to static imagery,
  `prefers-reduced-motion` disables smooth scrolling and scroll-driven motion,
  and the canvas-only sections carry screen-reader equivalents.
- **Quick View** — the professional usability layer, so a recruiter never has to
  explore a 3D scene to find the resume.

---

## Content

Everything below is typed data under `src/data/` — no content is hardcoded in a
component, so updating the portfolio is a data edit.

### Systems

| # | System | Context |
| --- | --- | --- |
| 1 | Mini ERP: From Demand to Delivery | Odoo x KAHE Hackathon 2026 · Finalist |
| 2 | AI-Powered Food Donation Management System | Data Science Internship — Jan–Jun 2026 |
| 3 | KrishiBandhu: AI-Powered Agriculture Platform | Jan 2026 |
| 4 | Infosys Springboard Internship | Sep 2025 – Nov 2025 |
| 5 | Autonomous Drone Research & Payload Drop System | Research & Prototype — 2025 |
| 6 | ArXiv Research Paper Assistant | Mini Project — Mar 2025 |
| 7 | Drone Vision & Object Detection System | Drone Club — 2024 |
| 8 | Drone Club Website & Admin CMS | Team Third Axis — Drone Club |
| 9 | AI Club Website | AI Club — Captain |

Each carries problem, solution, architecture graph, data flow, APIs/services,
engineering decisions, features and outcome.

### Experience

| Role | Organisation | Period |
| --- | --- | --- |
| Web Developer | Dr. Joshi's Holistic Multispecialty Clinic | Jul 2026 – Present |
| Data Science Intern | Paarsh Infotech Pvt. Ltd. | Jan 2 – Jun 30, 2026 |

### Achievements

| Achievement | Result |
| --- | --- |
| SAE AeroTHON 2024 | AIR 5 |
| CodeSphere Hackathon | 1st Runner-up |
| MSME Hackathon 5.0 | ₹12L grant |
| Odoo x KAHE Hackathon 2026 | Top 99 / 2000+ |
| Kaggle | Top 1.5% |

### Beyond code

Software Head — Team Third Axis (Drone Club) · Captain — AI Club · President —
COMPACT · Vice Treasurer — COMPACT · English Content Writer — GCOEJ Media

### Skills

Six categories — Programming, Frontend, Backend, Database, AI/ML, Tools —
rendered as an interactive constellation, with a screen-reader index behind it.

### Education

B.Tech Computer Engineering, Government College of Engineering, Jalgaon
(2022–2026, CGPA 8.13) · HSC, M.J. College (79%) · SSC, L.N.S.V. (97%)

---

## Project structure

```
src/
├── app/                  Routes: /, /projects, /projects/[slug], /quick
├── components/
│   ├── three/            R3F scenes, shaders, particle systems
│   ├── ui/               Reveal, Cursor, Magnetic, SectionHeading, Preloader
│   ├── providers/        MotionProvider (quality tier, reduced motion, WebGL)
│   └── <Section>/        One folder per page section
├── data/                 All content — the only files to edit for updates
├── hooks/                useMediaQuery, useWebGL
└── lib/                  utils, shared pointer store

scripts/                  Asset pipelines (see docs/ASSETS.md)
assets/                   Source masters — never deployed
public/                   Everything actually served
docs/                     Installation, deployment, assets
```

---

## Editing content

| File | Drives |
| --- | --- |
| `profile.ts` | Name, headline, stats, social links, asset paths, footer |
| `projects.ts` | The nine systems and their architecture graphs |
| `experience.ts` | Roles, and the education rows shown inside About |
| `journey.ts` | The 2022→2026 timeline |
| `achievements.ts` | Trophy room |
| `leadership.ts` | Beyond Code |
| `skills.ts` | Skill constellation |
| `about.ts` | About copy and focus areas |
| `navigation.ts` | Nav items |

Any string wrapped in square brackets — `[GitHub Link]`, `[Live Demo]` — is
treated as an unfilled placeholder: the UI marks it "link to be added" and points
it at `#` rather than shipping a dead link.

---

## Local setup

Requires **Node.js 20.12+**. Full detail in [docs/INSTALLATION.md](docs/INSTALLATION.md).

```bash
npm install
```

```bash
npm run dev
```

---

## Build

```bash
npm run build
```

```bash
npm start
```

Run the full check — typecheck, lint, then build:

```bash
npm run verify
```

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build (15 prerendered pages) |
| `npm start` | Serve the build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run verify` | typecheck → lint → build |
| `npm run avatar` | Regenerate the transparent cut-out |
| `npm run hero:video` | Re-encode the hero loop |

The two asset scripts run under `node --env-file-if-exists=.env`, so they read
their input paths from a `.env` in the project root if one exists and run on
their defaults if it does not. Copy `.env.example` to `.env` to change them —
see [docs/ASSETS.md](docs/ASSETS.md).
| `npm run deploy:preview` | Netlify draft deploy |
| `npm run deploy` | Netlify production deploy |

---

## Netlify deployment

Configured by `netlify.toml`. Full guide in
[docs/NETLIFY_DEPLOYMENT.md](docs/NETLIFY_DEPLOYMENT.md).

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `.next` |
| Node version | `22` |
| Plugin | `@netlify/plugin-nextjs` |
| Environment variables | **none required** |

**From GitHub** — Add new site → Import an existing project → pick the repo.
Netlify reads `netlify.toml`; confirm and deploy. Every push to `main` rebuilds
and every PR gets a preview.

**From the CLI**

```bash
npm install -g netlify-cli && netlify login && netlify init
```

```bash
npm run deploy:preview
```

```bash
npm run deploy
```

> **Do not switch to `output: "export"`.** `next.config.ts` defines
> `redirects()` for the section paths, and a static export drops them — every
> `/about`-style URL would start 404ing. The Next runtime plugin implements them
> on Netlify's edge.

---

## Accessibility

Semantic landmarks, keyboard-navigable controls, visible focus states, and
`prefers-reduced-motion` honoured throughout. The canvas-driven sections are
`aria-hidden` and paired with visually-hidden text equivalents, so the skills and
portrait content reach assistive technology. The 3D experience is never the only
route to information — Quick View carries all of it.

---

## Licence

Personal portfolio. The code is available to learn from; the content, imagery and
CV belong to Shubham Badgujar.
