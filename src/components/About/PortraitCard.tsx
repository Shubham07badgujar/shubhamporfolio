"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { useMotion } from "@/components/providers/MotionProvider";
import { cn } from "@/lib/utils";

/**
 * The SB portrait, using the reference site's interaction model.
 *
 * That effect is a two-layer reveal, not a tilt: a second image sits above the
 * first at opacity 0 and is uncovered through a soft radial mask that follows
 * the cursor. Read off the reference's own bundle, the parts that matter are:
 *
 *   - the cursor is EASED, not tracked raw — `m += (r - m) * 0.12` per frame,
 *     written into CSS custom properties. The trailing spotlight is the whole
 *     feel of it; tracking the raw pointer looks mechanical.
 *   - the mask is a feathered circle: solid to 45%, then 0.9 / 0.6 / 0.25 / 0
 *     at 58 / 70 / 84 / 100%, so the edge never reads as a hard disc.
 *   - the layer fades in over 200ms ease-out on enter and out on leave.
 *   - neither image is transformed. No tilt, no drift, no scale.
 *
 * Only the CSS variables change per frame, so the mask string is never rebuilt
 * and the work stays on the compositor.
 *
 * Two images or one:
 *   - With `portrait.revealImage` set to a counterpart rendered in the SAME
 *     pose, this is the reference effect exactly — the cursor wipes between them.
 *   - With one image, the reveal layer is that same image untouched while the
 *     base is held slightly back (`dimBase`), so the cursor restores the true
 *     portrait. Nothing is added to the image: no glow, outline or colour.
 */

const EASE = 0.12; // matches the reference

/**
 * Feathered spotlight. Position comes from CSS vars so the string is static and
 * only the variables change per frame. The fallbacks matter: an unresolvable
 * var invalidates the whole mask-image, which would leave the reveal layer
 * unmasked for the frame before the loop first runs.
 */
const MASK = (r: number) =>
  `radial-gradient(circle ${r}px at var(--mx, 50%) var(--my, 50%), rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.9) 58%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.25) 84%, rgba(0,0,0,0) 100%)`;

export function PortraitCard({ className }: { className?: string }) {
  const { reducedMotion, isTouch } = useMotion();
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string>(profile.portrait.image);
  const [failed, setFailed] = useState(false);
  const [radius, setRadius] = useState(220);

  const interactive = !reducedMotion && !isTouch;
  const { revealImage, dimBase } = profile.portrait;
  // one image still reveals — against a held-back version of itself
  const revealSrc = revealImage;
  const holdBase = interactive && !revealImage && dimBase;
  // with no counterpart image there is nothing to reveal, so the layer, its
  // second network request and its pointer loop are all skipped entirely
  const showReveal = interactive && !!revealSrc;

  // the reference uses 350px across a full-screen hero; scale it to this card
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRadius(Math.max(150, Math.min(340, Math.min(r.width, r.height) * 0.55)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = frame.current;
    const rev = layer.current;
    if (!el || !rev || !showReveal) return;

    let tx = 0;
    let ty = 0;
    let mx = 0;
    let my = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const b = el.getBoundingClientRect();
      tx = e.clientX - b.left;
      ty = e.clientY - b.top;
      rev.style.opacity = "1";
    };
    const onLeave = () => {
      rev.style.opacity = "0";
    };
    const loop = () => {
      mx += (tx - mx) * EASE;
      my += (ty - my) * EASE;
      rev.style.setProperty("--mx", `${mx}px`);
      rev.style.setProperty("--my", `${my}px`);
      raf = requestAnimationFrame(loop);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [showReveal]);

  return (
    <div
      ref={frame}
      className={cn(
        "relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-3xl border border-line bg-bg-2/60",
        className,
      )}
      /*
       * The backdrop is a known-good asset painted by CSS. If `portrait.image`
       * is missing, slow or fails, the frame still shows a portrait instead of
       * an empty box — the JS onError swap below is a race this does not rely on.
       */
      style={{
        backgroundImage: `url(${profile.avatarImage})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
      }}
      data-cursor
    >
      {/* base layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        onError={() => {
          // a broken <img> still paints its alt text and the browser's broken
          // icon, so hide it and fall through to the CSS backdrop
          if (!failed) {
            setFailed(true);
            setSrc(profile.avatarImage);
          }
        }}
        alt={`Portrait of ${profile.fullName}`}
        className="absolute inset-0 h-full w-full select-none object-cover object-top"
        style={{
          filter: holdBase ? profile.portrait.dim : undefined,
          // keep the alt text and broken-image glyph from ever rendering
          opacity: failed && src === profile.portrait.image ? 0 : 1,
        }}
        draggable={false}
        decoding="async"
      />

      {/* reveal layer */}
      {showReveal && (
        <div
          ref={layer}
          className="pointer-events-none absolute inset-0 z-[2] opacity-0"
          aria-hidden
          style={
            {
              transition: "opacity 200ms ease-out",
              maskImage: MASK(radius),
              WebkitMaskImage: MASK(radius),
              "--mx": "50%",
              "--my": "50%",
            } as React.CSSProperties
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={revealSrc}
            alt=""
            className="absolute inset-0 h-full w-full select-none object-cover object-top"
            draggable={false}
            decoding="async"
          />
        </div>
      )}

      <span className="pointer-events-none absolute left-4 top-4 z-[3] font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted">
        SB · portrait v2026
      </span>
    </div>
  );
}
