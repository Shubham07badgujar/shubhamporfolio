# Assets

Where every file lives, what replaces what, and which paths are wired to code.

---

## The two folders, and the difference

| Folder | Served to visitors? | Holds |
| --- | --- | --- |
| **`public/`** | **Yes** — every file is a public URL | Only what the site actually loads |
| **`assets/`** | **No** — never deployed | Originals, masters, working files |

The rule: **masters go in `assets/`, outputs go in `public/`.** A 2 MB source
photograph in `public/` is 2 MB shipped to every visitor whether anything
references it or not.

Anything in `public/x/y.png` is reachable at `https://yoursite/x/y.png`, so treat
that folder as published, not as storage.

---

## Current contents

```
public/
├── images/
│   ├── shubham-portrait.webp     About-section portrait
│   ├── shubham-profile.webp      Transparent cut-out (3D scenes + fallbacks)
│   └── hero-poster.jpg           First frame of the hero video
├── video/
│   └── shubham-portfolio-video.mp4   Hero background plate (H.264, 720p)
└── resume/
    └── Shubham-Badgujar-Resume.pdf

assets/                            (never deployed)
├── shubham-badgujar.jpeg          Original photograph — source for `npm run avatar`
├── shubham portfolio video.mp4     Hero video master — source for `npm run hero:video`
└── ...                            Earlier takes and working files
```

`public/` holds only those six files. Nothing else is served, and nothing in
`assets/` reaches the deploy.

---

## Where each asset is wired

Every path lives in **`src/data/profile.ts`** — no component hardcodes a file
name, so changing a path is a one-line edit.

| Asset | Config key | Used by |
| --- | --- | --- |
| About portrait | `portrait.image` | `PortraitCard` |
| Optional reveal image | `portrait.revealImage` | `PortraitCard` cursor reveal |
| Cut-out avatar | `avatarImage` | 3D scenes, portrait backdrop, fallbacks |
| Hero video | `video.mp4` | `HeroVideo` |
| Hero poster | `video.poster` | `HeroVideo` first paint |
| Resume | `resumeUrl` | Navbar, hero, contact, footer, Quick View |

### Telling the scripts where the masters are

`npm run avatar` and `npm run hero:video` run under
`node --env-file-if-exists=.env`, so they read their paths from a `.env` in the
project root — and fall back to their built-in defaults when there is no `.env`
at all. Copy the template once:

```bash
cp .env.example .env
```

Then set the paths there rather than exporting shell variables. The `VAR=1 cmd`
prefix used on macOS and Linux is not valid syntax in PowerShell or CMD, and
this project is developed on Windows, so `.env` is the portable route. Every
variable below is listed in `.env.example` with a comment.

---

## Replacing the portrait

The About-section portrait is shown **exactly as supplied** — no filter, blend or
overlay is applied.

1. Put the photograph in `public/images/`.
2. Point `portrait.image` at it in `src/data/profile.ts`.

```ts
portrait: {
  image: "/images/your-portrait.webp",
  ...
}
```

**Format** — WebP or JPEG. A 2 MB PNG becomes ~190 KB as WebP at quality 92 with
no visible difference:

```bash
npx sharp-cli --input photo.png --output public/images/your-portrait.webp
```

**Framing** — the card is **3:4** with `object-position: top`. A portrait
narrower than 3:4 is cropped at the bottom; wider is cropped at the sides. Keep
the face in the upper two-thirds.

### The optional cursor reveal

`PortraitCard` can cross-reveal between two images under a cursor-following
mask. It needs a **second image in the same pose and framing** — typically a
plain photograph paired with a stylised or anatomical render of the same shot.

Set both and the effect turns itself on:

```ts
portrait: {
  image: "/images/portrait-plain.webp",
  revealImage: "/images/portrait-alt.webp",
}
```

Leave `revealImage` undefined and the layer, its network request and its pointer
loop are all skipped — the card is a plain image.

---

## Replacing the cut-out avatar

`shubham-profile.webp` is a **transparent-background** cut-out. The 3D scenes
sample its alpha channel to build particle portraits, so transparency is not
cosmetic — without it, every background pixel becomes a particle and the scene
turns into a bright blob.

Regenerate it from a photograph:

```bash
npm run avatar
```

Reads `assets/shubham-badgujar.jpeg`, writes
`public/images/shubham-profile.webp`. Override with `AVATAR_SRC` / `AVATAR_OUT`
in `.env`.

The script segments the subject in two passes and needs one manual measurement
when the photograph changes — the head ellipse in its `CFG` block. Inspect what
it produced:

Uncomment these two in `.env`, then re-run `npm run avatar`:

```
AVATAR_ASCII=1
AVATAR_PREVIEW=scripts/_preview.png
```

That prints the mask as ASCII and writes a preview composited on the site
background. Nudge `CFG.head` until the head is covered, then comment them out
again.

Alternatively, cut it out by hand in any editor and save over the file — no code
change needed.

---

## Replacing the hero video

Put the master in `assets/`, point `HERO_SRC` at it in `.env`, then:

```bash
npm run hero:video
```

It produces `public/video/shubham-portfolio-video.mp4` and
`public/images/hero-poster.jpg`, and it does three things that matter:

1. **Downscales to 720p** at a two-pass target of ~0.9 MB. An 8.2 MB master
   becomes a plate that sits under two scrims covering 78–97% of it, so the
   discarded detail was never visible anyway.
2. **Strips the audio.** The plate is always muted; the track is pure payload.
3. **Leaves the frame rate alone**, and adds `+faststart` plus a keyframe every
   two seconds so playback starts early and the loop restart stays cheap.

Two things the script deliberately does *not* do, both of which were tried and
reverted because they are visible on this particular clip:

- **It does not resample the frame rate.** An earlier version forced 25 fps. The
  master is 24, so ffmpeg duplicated one frame every second and the plate
  hitched once a second. Whatever the master runs at is what ships.
- **It does not cross-fade the loop closed.** An earlier version blended the last
  second back over the first to hide the seam. The camera pushes in across this
  clip, so that blend mixed a zoomed frame over a wide one and read as the plate
  briefly changing scale, once per cycle. The clip now plays end to end and
  restarts on a cut — the lesser of the two artefacts.

If you replace the master with a clip whose end already matches its start, the
seam disappears on its own and neither workaround is needed.

**Subject position matters.** `HeroVideo` centres the clip. If your subject is
not near the centre, a portrait viewport crops them out — measure and adjust
`object-position` in the component.

---

## Replacing the resume

Drop the PDF at exactly:

```
public/resume/Shubham-Badgujar-Resume.pdf
```

Same filename, no code change — it is linked from five places. To use a
different name, update `resumeUrl` in `profile.ts`.

Netlify's filesystem is case-sensitive; Windows is not. `Resume.pdf` and
`resume.pdf` work identically locally and differently in production.

---

## Certificates and other images

There is **no certificates section** in the current site — achievements are
rendered from `src/data/achievements.ts` as 3D objects and text, with no images.

To add image-backed certificates:

1. Put the files in `public/images/certificates/`.
2. Add an image path to each entry in `achievements.ts`.
3. Render it in `src/components/Achievements/`.

Keep each under ~200 KB, and prefer WebP.

---

## Icons and favicon

- **Favicon** — `src/app/favicon.ico`. Next serves it automatically; replacing
  the file is enough. Add `icon.png` or `apple-icon.png` beside it for more
  sizes.
- **UI icons** — inline SVG in the components, no icon library. Add new ones as
  inline SVG with `aria-hidden` when decorative.
- **Social icons** — inline SVG in `src/components/ui/SocialLinks.tsx`.

---

## Open Graph / preview image

Not currently set, so links shared to social platforms show no preview card.
To add one: put a 1200×630 image at `public/images/og.jpg` and extend the
`openGraph` block in `src/app/layout.tsx`.

---

## Checklist before deploying assets

- [ ] Master in `assets/`, output in `public/`
- [ ] Images are WebP or JPEG, not multi-megabyte PNG
- [ ] Filename case matches the path in `profile.ts` exactly
- [ ] Portrait keeps the face in the upper two-thirds of a 3:4 crop
- [ ] Cut-out avatar still has a real alpha channel
- [ ] Hero video still reports the master's own frame rate after `npm run hero:video`
- [ ] `npm run build` passes
