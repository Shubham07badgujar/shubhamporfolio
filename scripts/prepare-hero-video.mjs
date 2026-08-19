/**
 * Prepares the hero background loop from a source video.
 *
 *   npm run hero:video
 *
 * Source : assets/shubham badgujar video.mp4   (override with HERO_SRC)
 * Output : public/video/hero-video.mp4 + .webm + public/images/hero-poster.jpg
 *
 * What it does, and why:
 *
 *   1. Seamless loop. The source ends somewhere quite different from where it
 *      starts — the camera pushes in over the clip — so playing it on `loop`
 *      jumps hard once per cycle. The tail is cross-faded back over the head,
 *      which costs `fade` seconds of runtime and removes the cut. Verify with
 *      HERO_SEAM=1, which prints the seam against a normal frame step.
 *   2. Strips audio. The plate is decorative and always muted, so the track is
 *      pure payload.
 *   3. Downscales to 720p and re-encodes. The source is a 6.9 Mbps master;
 *      a hero background does not need to be.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, statSync, rmSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

const SRC = process.env.HERO_SRC ?? "assets/shubham badgujar video.mp4";
const OUT_DIR = "public/video";
const OUT_MP4 = `${OUT_DIR}/hero-video.mp4`;
const OUT_WEBM = `${OUT_DIR}/hero-video.webm`;
const POSTER = "public/images/hero-poster.jpg";

const CFG = {
  width: 1280,
  height: 720,
  fps: 25,
  /** Seconds of cross-fade used to close the loop. */
  fade: 1.0,
  crfMp4: 26,
  crfWebm: 36,
};

if (!existsSync(SRC)) {
  console.error(`Source video not found: ${SRC}`);
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });

const run = (args, label) =>
  new Promise((resolve, reject) => {
    const ff = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    ff.stderr.on("data", (d) => (err += d.toString()));
    ff.on("error", reject);
    ff.on("close", (code) => {
      if (code === 0) resolve(err);
      else reject(new Error(`${label} failed:\n${err.slice(-2000)}`));
    });
  });

/** Reads duration in seconds from ffmpeg's own report. */
async function probeDuration() {
  const err = await run(["-hide_banner", "-i", SRC, "-f", "null", "-"], "probe").catch((e) => e.message);
  const m = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(err);
  if (!m) throw new Error("Could not read duration from the source");
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

const duration = await probeDuration();
const fade = Math.min(CFG.fade, duration / 3);
const loopLen = duration - fade;
console.log(`source ${duration.toFixed(2)}s → loop ${loopLen.toFixed(2)}s (${fade.toFixed(2)}s cross-fade)`);

/*
 * out(t) for t in [0, fade)   = tail(t) faded into head(t)
 * out(t) for t in [fade, len) = source(t)
 *
 * so out(0) continues from source(duration) and out(len) continues into
 * source(loopLen) — the two ends meet.
 */
const scale = `scale=${CFG.width}:${CFG.height}:force_original_aspect_ratio=increase,crop=${CFG.width}:${CFG.height},fps=${CFG.fps}`;
const filter = [
  `[0:v]${scale},split=3[a][b][c]`,
  `[a]trim=0:${fade},setpts=PTS-STARTPTS[head]`,
  `[b]trim=${loopLen}:${duration},setpts=PTS-STARTPTS[tail]`,
  `[tail][head]blend=all_expr='A*(1-T/${fade})+B*(T/${fade})'[join]`,
  `[c]trim=${fade}:${loopLen},setpts=PTS-STARTPTS[body]`,
  `[join][body]concat=n=2:v=1[v]`,
].join(";");

const common = ["-y", "-i", SRC, "-filter_complex", filter, "-map", "[v]", "-an"];

console.log("encoding mp4 …");
await run(
  [...common, "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
   "-crf", String(CFG.crfMp4), "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT_MP4],
  "mp4",
);

console.log("encoding webm …");
await run(
  [...common, "-c:v", "libvpx-vp9", "-crf", String(CFG.crfWebm), "-b:v", "0",
   "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", OUT_WEBM],
  "webm",
);

console.log("writing poster …");
await run(["-y", "-i", OUT_MP4, "-frames:v", "1", "-q:v", "3", POSTER], "poster");

for (const f of [OUT_MP4, OUT_WEBM, POSTER]) {
  console.log(`  ${f} — ${(statSync(f).size / 1024).toFixed(0)} KB`);
}

/* --------------------------- seam verification ------------------------ */
if (process.env.HERO_SEAM) {
  const tmp = "scripts/.seam";
  mkdirSync(tmp, { recursive: true });
  const frames = Math.round(loopLen * CFG.fps);
  const grab = (n, name) =>
    run(["-y", "-i", OUT_MP4, "-vf", `select=eq(n\\,${n}),scale=160:90`, "-frames:v", "1",
         "-f", "rawvideo", "-pix_fmt", "rgb24", `${tmp}/${name}.raw`], "seam");
  await grab(0, "first");
  await grab(1, "second");
  await grab(frames - 1, "last");
  const { readFileSync } = await import("node:fs");
  const R = (n) => readFileSync(`${tmp}/${n}.raw`);
  const diff = (a, b) => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
    return s / a.length;
  };
  const adjacent = diff(R("first"), R("second"));
  const seam = diff(R("last"), R("first"));
  console.log(`\n  adjacent frame step : ${adjacent.toFixed(2)}`);
  console.log(`  loop seam           : ${seam.toFixed(2)}`);
  console.log(
    seam < adjacent * 3
      ? "  → seam is within normal frame-to-frame variation"
      : "  → seam still visible; raise CFG.fade",
  );
  rmSync(tmp, { recursive: true, force: true });
}
