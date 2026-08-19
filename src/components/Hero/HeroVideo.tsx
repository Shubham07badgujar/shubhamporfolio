"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { profile } from "@/data/profile";
import { useMotion } from "@/components/providers/MotionProvider";

/**
 * Looping hero background plate.
 *
 * The clip is decorative, so it is aria-hidden, muted and carries no captions.
 * Under prefers-reduced-motion the poster stands in — painted as the wrapper's
 * CSS background — and the video is never fetched at all.
 *
 * Visibility deliberately depends on nothing: no ready-state, no fade-in class.
 * An earlier version revealed the video from opacity-0 once `canplay` fired,
 * which left the hero black whenever that event was missed or the transition
 * timeline was suspended. The `poster` attribute already covers the gap before
 * the first frame decodes, so the element simply renders opaque.
 *
 * The scrim is a left-weighted gradient rather than a flat opacity drop: the
 * artwork keeps its darker half under the copy while the figure on the right
 * stays bright.
 */
const subscribeNoop = () => () => {};

export function HeroVideo() {
  const { reducedMotion } = useMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const { video } = profile;

  /*
   * The <video> is mounted only after hydration, and never appears in the server
   * HTML. Media browser extensions (speed controllers and the like) look for a
   * <video> and inject their own controls next to it — if that happens before
   * React hydrates, React finds a foreign element where it expected this
   * container and the whole tree fails to hydrate. With nothing to find until
   * React already owns the DOM, that race cannot occur.
   *
   * Nothing is lost visually: the poster is painted by CSS on the wrapper below,
   * so the first frame is on screen before the element exists.
   */
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true, // client
    () => false, // server and the hydrating pass
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    // Autoplay can be refused before the element is in the DOM with a source,
    // and is suspended while the tab is hidden; retry on both.
    const play = () => void el.play().catch(() => {});
    play();
    const onVisible = () => {
      if (document.visibilityState === "visible") play();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // `mounted` matters: the element does not exist on the first pass, so
    // without it this would run against a null ref and never retry.
  }, [reducedMotion, mounted]);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-bg"
      aria-hidden
      // paints the first frame before the video element exists
      style={{
        backgroundImage: `url(${video.poster})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/*
        The figure sits at 52.5% of this clip, so plain centring keeps him in
        frame even on a portrait viewport, which crops the 16:9 plate to a slim
        central column. Re-measure if the source video is replaced.
      */}
      {!mounted || reducedMotion ? null : (
        <video
          ref={ref}
          poster={video.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="h-full w-full object-cover object-center"
        >
          <source src={video.webm} type="video/webm" />
          <source src={video.mp4} type="video/mp4" />
        </video>
      )}

      {/*
        Two scrims, because the copy moves. On desktop it sits in the left
        column, so the gradient runs horizontally and leaves the figure bright.
        On mobile the copy is full-width at the bottom, so a left-weighted
        gradient would strand text over the bright half — it runs vertically
        instead, keeping his face clear at the top.
      */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.30) 0%, rgba(5,5,5,0.45) 34%, rgba(5,5,5,0.80) 62%, rgba(5,5,5,0.94) 82%, rgba(5,5,5,0.97) 100%)",
        }}
      />
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.78) 26%, rgba(5,5,5,0.34) 52%, rgba(5,5,5,0.12) 74%, rgba(5,5,5,0.30) 100%)",
        }}
      />
      {/* blend the plate into the section above and below */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
    </div>
  );
}
