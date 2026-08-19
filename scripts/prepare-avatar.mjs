/**
 * Turns the source photo into a transparent-background portrait plate used by
 * the 3D avatar shaders and the DOM fallbacks.
 *
 *   npm run avatar
 *
 * Source : assets/shubham-badgujar.jpeg          (override with AVATAR_SRC)
 * Output : public/images/shubham-profile.webp   (RGBA, background removed)
 *
 * Why two passes: globally, lit skin and sunlit ground are nearly the same
 * colour, so a single colour model either eats the face or keeps the ground.
 *
 *   Pass 1 (body)  colour models from the image margins vs the centre, plus a
 *                  "subjects live near the middle" prior. Cuts the torso well
 *                  but loses the head, whose dark hair matches the night sky.
 *   Pass 2 (head)  a *local* model around the head only, where hair and skin
 *                  separate cleanly from the wall and trees behind them.
 *
 * The two masks are unioned, hole-filled and feathered.
 *
 * Debug: AVATAR_ASCII=1 prints the mask, AVATAR_PREVIEW=out.png writes a
 * composite over the site background.
 */
import sharp from "sharp";
import { existsSync } from "node:fs";

const SRC = process.env.AVATAR_SRC ?? "assets/shubham-badgujar.jpeg";
const OUT = process.env.AVATAR_OUT ?? "public/images/shubham-profile.webp";
const PREVIEW = process.env.AVATAR_PREVIEW ?? "";

if (!existsSync(SRC)) {
  console.error("Source image not found: " + SRC);
  process.exit(1);
}

/* ------------------------------- tunables ---------------------------- */
const CFG = {
  work: 480, // working width for the mask
  clusters: 10,
  bgMarginX: 0.1, // side strips that are always background
  bgMarginTop: 0.04,
  fgRect: { x0: 0.34, x1: 0.66, y0: 0.3, y1: 0.75 }, // always subject (torso)
  bodyTop: 0.30, // above the shoulder line only the head exists — pass 2 owns it
  spatial: 0.55, // strength of the centre prior in pass 1
  /**
   * Head position in normalised image coordinates. This is the one measurement
   * to re-take when the source photo is replaced — run with AVATAR_ASCII=1 and
   * nudge until the head is covered.
   */
  head: { cx: 0.508, cy: 0.172, rx: 0.12, ry: 0.10 },
  headCore: 0.55, // fraction of the ellipse treated as definitely head
  headOuter: 1.12, // classification reaches this far out
  headBgRing: [1.5, 2.3], // annulus sampled as local background
  /**
   * The neck sits in shadow, so neither pass claims it and the head ends up
   * floating. This ellipse bridges chin to collar; re-measure with the head.
   */
  neck: { cx: 0.468, cy: 0.292, rx: 0.052, ry: 0.048 },
  smoothPasses: 3,
  minBlob: 200,
  openRadius: 6, // breaks thin bridges to background blobs
  bgGrowTol: 10, // colour tolerance of the background flood fill
  bgGrowTop: 0.06, // top strip also seeds the flood fill
  maxHoleArea: 0.0022, // pockets larger than this stay transparent
  feather: 2.0,
  maxWidth: 1100,
};

/* ------------------------------- helpers ----------------------------- */
const dist2 = (a, b, i, j) => {
  const dr = a[i] - b[j];
  const dg = a[i + 1] - b[j + 1];
  const db = a[i + 2] - b[j + 2];
  return dr * dr + dg * dg + db * db;
};

/** Tiny k-means over flat RGB samples. */
function kmeans(samples, k, iters = 12) {
  const n = samples.length / 3;
  if (n === 0) return new Float64Array(0);
  k = Math.min(k, n);
  const cents = new Float64Array(k * 3);
  for (let c = 0; c < k; c++) {
    const s = Math.floor(((c + 0.5) / k) * n) * 3;
    cents[c * 3] = samples[s];
    cents[c * 3 + 1] = samples[s + 1];
    cents[c * 3 + 2] = samples[s + 2];
  }
  const sum = new Float64Array(k * 3);
  const cnt = new Float64Array(k);
  for (let it = 0; it < iters; it++) {
    sum.fill(0);
    cnt.fill(0);
    for (let p = 0; p < n; p++) {
      let best = 0;
      let bd = Infinity;
      for (let c = 0; c < k; c++) {
        const d = dist2(samples, cents, p * 3, c * 3);
        if (d < bd) {
          bd = d;
          best = c;
        }
      }
      sum[best * 3] += samples[p * 3];
      sum[best * 3 + 1] += samples[p * 3 + 1];
      sum[best * 3 + 2] += samples[p * 3 + 2];
      cnt[best]++;
    }
    for (let c = 0; c < k; c++) {
      if (!cnt[c]) continue;
      cents[c * 3] = sum[c * 3] / cnt[c];
      cents[c * 3 + 1] = sum[c * 3 + 1] / cnt[c];
      cents[c * 3 + 2] = sum[c * 3 + 2] / cnt[c];
    }
  }
  return cents;
}

const nearest = (cents, px, i) => {
  let bd = Infinity;
  for (let c = 0; c < cents.length / 3; c++) {
    const d = dist2(px, cents, i, c * 3);
    if (d < bd) bd = d;
  }
  return Math.sqrt(bd);
};

/** Majority smoothing — removes speckle without eating real edges. */
function smooth(mask, W, H, passes) {
  for (let pass = 0; pass < passes; pass++) {
    const next = new Uint8Array(mask);
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        let s = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += mask[(y + dy) * W + x + dx];
        next[y * W + x] = s >= 5 ? 1 : 0;
      }
    }
    mask.set(next);
  }
  return mask;
}

/** Drops blobs that never touch `isCore`, and any blob under `minSize`. */
function keepCoreBlobs(mask, W, H, isCore, minSize) {
  const seen = new Uint8Array(W * H);
  const stack = [];
  const members = [];
  for (let s0 = 0; s0 < W * H; s0++) {
    if (!mask[s0] || seen[s0]) continue;
    stack.length = 0;
    members.length = 0;
    stack.push(s0);
    seen[s0] = 1;
    let core = false;
    while (stack.length) {
      const p = stack.pop();
      members.push(p);
      const x = p % W;
      const y = (p / W) | 0;
      if (!core && isCore(x, y)) core = true;
      if (x > 0 && mask[p - 1] && !seen[p - 1]) {
        seen[p - 1] = 1;
        stack.push(p - 1);
      }
      if (x < W - 1 && mask[p + 1] && !seen[p + 1]) {
        seen[p + 1] = 1;
        stack.push(p + 1);
      }
      if (y > 0 && mask[p - W] && !seen[p - W]) {
        seen[p - W] = 1;
        stack.push(p - W);
      }
      if (y < H - 1 && mask[p + W] && !seen[p + W]) {
        seen[p + W] = 1;
        stack.push(p + W);
      }
    }
    if (!core || members.length < minSize) for (const p of members) mask[p] = 0;
  }
  return mask;
}

/**
 * Grows a background region inward from the forced-background margins, stepping
 * only between neighbouring pixels of similar colour.
 *
 * This is what separates the flash-lit wall from the flash-lit shirt: the two
 * are the same white, but the wall is continuous with the frame edge while the
 * shirt is fenced off by the shadow along his shoulder. Protected pixels (the
 * torso and head cores) are never crossed, so a leak cannot eat the subject.
 */
function growBackground(px, W, H, tol, isProtected, isSeed) {
  const bg = new Uint8Array(W * H);
  const stack = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (isSeed(x, y) && !isProtected(x, y)) {
        bg[p] = 1;
        stack.push(p);
      }
    }
  }
  const tol2 = tol * tol;
  while (stack.length) {
    const p = stack.pop();
    const x = p % W;
    const y = (p / W) | 0;
    const i = p * 3;
    const visit = (q) => {
      if (bg[q]) return;
      const qx = q % W;
      const qy = (q / W) | 0;
      if (isProtected(qx, qy)) return;
      const j = q * 3;
      const dr = px[i] - px[j];
      const dg = px[i + 1] - px[j + 1];
      const db = px[i + 2] - px[j + 2];
      if (dr * dr + dg * dg + db * db > tol2) return;
      bg[q] = 1;
      stack.push(q);
    };
    if (x > 0) visit(p - 1);
    if (x < W - 1) visit(p + 1);
    if (y > 0) visit(p - W);
    if (y < H - 1) visit(p + W);
  }
  return bg;
}

/** Binary erosion by a square structuring element of the given radius. */
function erode(src, W, H, r) {
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!src[y * W + x]) continue;
      let ok = 1;
      for (let dy = -r; dy <= r && ok; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) {
          ok = 0;
          break;
        }
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W || !src[yy * W + xx]) {
            ok = 0;
            break;
          }
        }
      }
      out[y * W + x] = ok;
    }
  }
  return out;
}

/**
 * Opening by reconstruction: erode to seeds, drop seeds that do not sit on the
 * subject, then grow the survivors back inside the original mask. Removes
 * background blobs joined to the body by a thin bridge, while leaving the
 * silhouette's real shape untouched.
 */
function openByReconstruction(mask, W, H, r, isCore) {
  const seeds = erode(mask, W, H, r);
  keepCoreBlobs(seeds, W, H, isCore, 1);
  const out = new Uint8Array(W * H);
  const stack = [];
  for (let p = 0; p < W * H; p++)
    if (seeds[p]) {
      out[p] = 1;
      stack.push(p);
    }
  while (stack.length) {
    const p = stack.pop();
    const x = p % W;
    const y = (p / W) | 0;
    const visit = (q) => {
      if (!out[q] && mask[q]) {
        out[q] = 1;
        stack.push(q);
      }
    };
    if (x > 0) visit(p - 1);
    if (x < W - 1) visit(p + 1);
    if (y > 0) visit(p - W);
    if (y < H - 1) visit(p + W);
  }
  mask.set(out);
  return mask;
}

/**
 * Fills pockets that are not reachable from the image border, up to `maxArea`
 * pixels. The cap matters: speckle inside the subject should close, but a real
 * chunk of background framed by the shoulder, neck and collar should not.
 */
function fillHoles(mask, W, H, maxArea = Infinity) {
  const outside = new Uint8Array(W * H);
  const stack = [];
  const push = (p) => {
    if (!outside[p] && !mask[p]) {
      outside[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < W; x++) {
    push(x);
    push((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    push(y * W);
    push(y * W + W - 1);
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % W;
    const y = (p / W) | 0;
    if (x > 0) push(p - 1);
    if (x < W - 1) push(p + 1);
    if (y > 0) push(p - W);
    if (y < H - 1) push(p + W);
  }
  // enclosed pockets, grouped so each can be measured before filling
  const seen = new Uint8Array(W * H);
  const members = [];
  for (let s0 = 0; s0 < W * H; s0++) {
    if (mask[s0] || outside[s0] || seen[s0]) continue;
    stack.length = 0;
    members.length = 0;
    stack.push(s0);
    seen[s0] = 1;
    while (stack.length) {
      const p = stack.pop();
      members.push(p);
      const x = p % W;
      const y = (p / W) | 0;
      const visit = (q) => {
        if (!mask[q] && !outside[q] && !seen[q]) {
          seen[q] = 1;
          stack.push(q);
        }
      };
      if (x > 0) visit(p - 1);
      if (x < W - 1) visit(p + 1);
      if (y > 0) visit(p - W);
      if (y < H - 1) visit(p + W);
    }
    if (members.length <= maxArea) for (const p of members) mask[p] = 1;
  }
  return mask;
}

/* ------------------------------ load image --------------------------- */
const meta = await sharp(SRC).metadata();
const W = CFG.work;
const H = Math.round((meta.height / meta.width) * W);
const px = await sharp(SRC).resize(W, H, { fit: "fill" }).removeAlpha().raw().toBuffer();

const mx = Math.round(W * CFG.bgMarginX);
const mtop = Math.round(H * CFG.bgMarginTop);

/* ============================ pass 1: body =========================== */
const bodyMask = new Uint8Array(W * H);
{
  const bgS = [];
  const fgS = [];
  const fr = CFG.fgRect;
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 3;
      const nx = x / W;
      const ny = y / H;
      if (x < mx || x >= W - mx || y < mtop) bgS.push(px[i], px[i + 1], px[i + 2]);
      else if (nx >= fr.x0 && nx < fr.x1 && ny >= fr.y0 && ny < fr.y1) fgS.push(px[i], px[i + 1], px[i + 2]);
    }
  }
  const bgC = kmeans(Float64Array.from(bgS), CFG.clusters);
  const fgC = kmeans(Float64Array.from(fgS), CFG.clusters);
  const cx = (fr.x0 + fr.x1) / 2;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      if (x < mx || x >= W - mx || y / H < CFG.bodyTop) continue;
      const i = k * 3;
      const nx = Math.abs(x / W - cx) / 0.5;
      const prior = Math.pow(nx, 2.2) * 140 * CFG.spatial;
      bodyMask[k] = nearest(fgC, px, i) + prior < nearest(bgC, px, i) ? 1 : 0;
    }
  }
  smooth(bodyMask, W, H, CFG.smoothPasses);
  const inTorso = (x, y) =>
    x / W > fr.x0 && x / W < fr.x1 && y / H > fr.y0 && y / H < fr.y1;
  keepCoreBlobs(bodyMask, W, H, inTorso, CFG.minBlob);
}

/* ============================ pass 2: head =========================== */
const headMask = new Uint8Array(W * H);
{
  const e = CFG.head;
  /** Normalised radius within the head ellipse (1 = on the ellipse). */
  const er = (x, y) => Math.hypot((x / W - e.cx) / e.rx, (y / H - e.cy) / e.ry);
  const fgS = [];
  const bgS = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const r = er(x, y);
      const i = (y * W + x) * 3;
      if (r < CFG.headCore) fgS.push(px[i], px[i + 1], px[i + 2]);
      else if (r > CFG.headBgRing[0] && r < CFG.headBgRing[1] && y / H < e.cy + e.ry * 0.9)
        bgS.push(px[i], px[i + 1], px[i + 2]);
    }
  }
  const fgC = kmeans(Float64Array.from(fgS), 6);
  const bgC = kmeans(Float64Array.from(bgS), 8);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const r = er(x, y);
      if (r > CFG.headOuter) continue;
      const k = y * W + x;
      const i = k * 3;
      if (r < CFG.headCore) {
        headMask[k] = 1;
        continue;
      }
      // mild pull towards the head so the boundary does not wander outwards
      const prior = (r - CFG.headCore) * 26;
      headMask[k] = nearest(fgC, px, i) + prior < nearest(bgC, px, i) ? 1 : 0;
    }
  }
  smooth(headMask, W, H, 2);
  keepCoreBlobs(headMask, W, H, (x, y) => er(x, y) < CFG.headCore, 50);
}


const asciiOf = (m, label) => {
  const stepY = Math.max(1, Math.round(H / 40));
  const stepX = Math.max(1, Math.round(W / 46));
  let out = label + String.fromCharCode(10);
  for (let y = 0; y < H; y += stepY) {
    let row = "";
    for (let x = 0; x < W; x += stepX) row += m[y * W + x] ? "#" : " ";
    out += row + String.fromCharCode(10);
  }
  console.log(out);
};
if (process.env.AVATAR_ASCII === "2") {
  asciiOf(bodyMask, "--- bodyMask ---");
  asciiOf(headMask, "--- headMask ---");
}
/* ------------------------------- combine ----------------------------- */
const mask = new Uint8Array(W * H);
const holeCap = Math.round(W * H * CFG.maxHoleArea);
for (let p = 0; p < W * H; p++) mask[p] = bodyMask[p] || headMask[p] ? 1 : 0;
{
  const n = CFG.neck;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (Math.hypot((x / W - n.cx) / n.rx, (y / H - n.cy) / n.ry) < 1) mask[y * W + x] = 1;
    }
  }
}
smooth(mask, W, H, 1);
fillHoles(mask, W, H, holeCap);
{
  const fr = CFG.fgRect;
  const e = CFG.head;
  const isCore = (x, y) => {
    const nx = x / W;
    const ny = y / H;
    if (nx > fr.x0 && nx < fr.x1 && ny > fr.y0 && ny < fr.y1) return true;
    return Math.hypot((nx - e.cx) / e.rx, (ny - e.cy) / e.ry) < CFG.headCore;
  };
  openByReconstruction(mask, W, H, CFG.openRadius, isCore);
  fillHoles(mask, W, H, holeCap);

  const bg = growBackground(
    px,
    W,
    H,
    CFG.bgGrowTol,
    isCore,
    (x, y) => x < mx || x >= W - mx || y / H < CFG.bgGrowTop,
  );
  for (let p = 0; p < W * H; p++) if (bg[p]) mask[p] = 0;
  smooth(mask, W, H, 1);
  openByReconstruction(mask, W, H, 3, isCore);
  fillHoles(mask, W, H, holeCap);
  // fillHoles would re-seal pockets the flood fill just opened (the notch
  // between neck and shoulder), so apply the veto once more.
  for (let p = 0; p < W * H; p++) if (bg[p]) mask[p] = 0;
}

if (process.env.AVATAR_ASCII) {
  const chars = " #";
  const stepY = Math.max(1, Math.round(H / 60));
  const stepX = Math.max(1, Math.round(W / 46));
  let s = "";
  for (let y = 0; y < H; y += stepY) {
    let row = "";
    for (let x = 0; x < W; x += stepX) row += chars[mask[y * W + x]];
    s += row + "\n";
  }
  console.log(s);
}

/* --------------------- alpha: upscale, feather, apply ---------------- */
const alphaSmall = Buffer.alloc(W * H);
for (let p = 0; p < W * H; p++) alphaSmall[p] = mask[p] ? 255 : 0;

// NOTE: sharp promotes a 1-channel raw image to 3 channels through blur/linear,
// so the stride is read back from `info` rather than assumed.
const alphaRes = await sharp(alphaSmall, { raw: { width: W, height: H, channels: 1 } })
  .resize(meta.width, meta.height, { fit: "fill" })
  .blur(CFG.feather)
  .linear(1.7, -80) // tighten the feather so edges stay crisp
  .raw()
  .toBuffer({ resolveWithObject: true });
const aStride = alphaRes.info.channels;
const alphaFull = alphaRes.data;

const rgb = await sharp(SRC).removeAlpha().raw().toBuffer();
const rgba = Buffer.alloc(meta.width * meta.height * 4);
for (let p = 0; p < meta.width * meta.height; p++) {
  rgba[p * 4] = rgb[p * 3];
  rgba[p * 4 + 1] = rgb[p * 3 + 1];
  rgba[p * 4 + 2] = rgb[p * 3 + 2];
  rgba[p * 4 + 3] = alphaFull[p * aStride];
}

/* ------------------ crop to the mask bbox and write ------------------ */
let bx0 = W;
let bx1 = 0;
let by0 = H;
let by1 = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!mask[y * W + x]) continue;
    if (x < bx0) bx0 = x;
    if (x > bx1) bx1 = x;
    if (y < by0) by0 = y;
    if (y > by1) by1 = y;
  }
}
const scaleX = meta.width / W;
const scaleY = meta.height / H;
const pad = 8;
const crop = {
  left: Math.max(0, Math.round(bx0 * scaleX) - pad),
  top: Math.max(0, Math.round(by0 * scaleY) - pad),
};
crop.width = Math.min(meta.width - crop.left, Math.round((bx1 - bx0 + 1) * scaleX) + pad * 2);
crop.height = Math.min(meta.height - crop.top, Math.round((by1 - by0 + 1) * scaleY) + pad * 2);

await sharp(rgba, { raw: { width: meta.width, height: meta.height, channels: 4 } })
  .extract(crop)
  .resize({ width: CFG.maxWidth, withoutEnlargement: true })
  .webp({ quality: 88, alphaQuality: 92, effort: 6 })
  .toFile(OUT);

const info = await sharp(OUT).metadata();
console.log("wrote " + OUT + " - " + info.width + "x" + info.height);

if (PREVIEW) {
  const p = await sharp(OUT).resize({ width: 460 }).toBuffer();
  const pm = await sharp(p).metadata();
  await sharp({ create: { width: pm.width, height: pm.height, channels: 3, background: "#0b0b12" } })
    .composite([{ input: p }])
    .png()
    .toFile(PREVIEW);
  console.log("wrote preview " + PREVIEW);
}
