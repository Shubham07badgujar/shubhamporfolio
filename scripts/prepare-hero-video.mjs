/**
 * Prepares the hero background plate from the source video.
 *
 *   npm run hero:video
 *
 * Source : assets/shubham portfolio video.mp4   (override with HERO_SRC)
 * Output : public/video/shubham-portfolio-video.mp4 + public/images/hero-poster.jpg
 *
 * What it does, and why:
 *
 *   1. Keeps the source frame rate. An earlier version resampled to a fixed
 *      25 fps; the master is 24, so ffmpeg duplicated one frame every second
 *      and the plate hitched once per second on playback. Never resample a
 *      background loop — whatever the master runs at is what ships.
 *
 *   2. No cross-fade. An earlier version blended the last second back over the
 *      first to close the loop seam. The camera pushes in across this clip, so
 *      that blend mixed a zoomed frame over a wide one and read as the plate
 *      briefly changing scale, once per cycle. The seam is the lesser evil, so
 *      the clip now plays end to end and restarts on a cut.
 *
 *   3. Downscales to 720p and targets ~1 MB with a two-pass VBR encode. The
 *      master is a 6.9 Mbps 1080p file; this plate sits under two scrims that
 *      cover 78-97% of it, so the extra detail is never visible and the bytes
 *      only compete with the rest of the page for bandwidth. Two-pass rather
 *      than CRF because the point here is a predictable file size.
 *
 *   4. Strips audio. The element is always muted, so the track is pure payload.
 *
 *   5. Short GOP + faststart. A keyframe every 2s keeps the loop restart cheap,
 *      and faststart puts the moov atom first so playback can begin before the
 *      file has finished downloading.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, statSync, rmSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

const SRC = process.env.HERO_SRC ?? "assets/shubham portfolio video.mp4";
const OUT_DIR = "public/video";
const OUT_MP4 = `${OUT_DIR}/shubham-portfolio-video.mp4`;
const POSTER = "public/images/hero-poster.jpg";
const PASSLOG = "scripts/.hero-pass";

const CFG = {
  width: 1280,
  height: 720,
  /** Target video bitrate. 10s at 780k lands just under 1 MB. */
  bitrate: "780k",
  maxrate: "1200k",
  bufsize: "1600k",
  /** Keyframe interval in frames (~2s at 24fps). */
  gop: 48,
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

/** Reads duration and frame rate from ffmpeg's own report. */
async function probe(file) {
  const err = await run(["-hide_banner", "-i", file, "-f", "null", "-"], "probe").catch((e) => e.message);
  const d = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(err);
  const f = /([\d.]+) fps/.exec(err);
  const r = /,\s*(\d{2,5})x(\d{2,5})/.exec(err);
  return {
    duration: d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : 0,
    fps: f ? Number(f[1]) : 0,
    size: r ? `${r[1]}x${r[2]}` : "?",
  };
}

const src = await probe(SRC);
console.log(`source  ${src.size} @ ${src.fps} fps, ${src.duration.toFixed(2)}s`);
console.log(`target  ${CFG.width}x${CFG.height} @ ${src.fps} fps (unchanged), ~1 MB\n`);

// No `fps=` filter here on purpose — see note 1 above.
const vf = [
  `scale=${CFG.width}:${CFG.height}:force_original_aspect_ratio=increase`,
  `crop=${CFG.width}:${CFG.height}`,
].join(",");

const common = [
  "-y", "-i", SRC,
  "-c:v", "libx264", "-profile:v", "high", "-preset", "veryslow",
  "-b:v", CFG.bitrate, "-maxrate", CFG.maxrate, "-bufsize", CFG.bufsize,
  "-vf", vf,
  "-g", String(CFG.gop), "-keyint_min", String(Math.round(CFG.gop / 2)),
  "-pix_fmt", "yuv420p",
  "-an",
];

console.log("encoding pass 1/2 …");
await run([...common, "-pass", "1", "-passlogfile", PASSLOG, "-f", "null", "-"], "pass 1");

console.log("encoding pass 2/2 …");
await run([...common, "-pass", "2", "-passlogfile", PASSLOG, "-movflags", "+faststart", OUT_MP4], "pass 2");

console.log("writing poster …");
await run(["-y", "-i", OUT_MP4, "-frames:v", "1", "-q:v", "3", POSTER], "poster");

// two-pass scratch files
for (const f of [`${PASSLOG}-0.log`, `${PASSLOG}-0.log.mbtree`]) rmSync(f, { force: true });

const out = await probe(OUT_MP4);
console.log(`\n  ${OUT_MP4}`);
console.log(`    ${out.size} @ ${out.fps} fps, ${out.duration.toFixed(2)}s — ${(statSync(OUT_MP4).size / 1048576).toFixed(2)} MB`);
console.log(`  ${POSTER} — ${(statSync(POSTER).size / 1024).toFixed(0)} KB`);

if (out.fps !== src.fps) {
  console.warn(`\n  WARNING: frame rate changed ${src.fps} -> ${out.fps}. This causes periodic judder.`);
}
