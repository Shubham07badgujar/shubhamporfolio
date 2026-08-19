"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { profile } from "@/data/profile";
import { AvatarSpeech } from "@/components/AvatarSpeech/AvatarSpeech";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Magnetic } from "@/components/ui/Magnetic";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { useMotion } from "@/components/providers/MotionProvider";
import { HeroVideo } from "./HeroVideo";

const AvatarScene = dynamic(() => import("@/components/three/AvatarScene").then((m) => m.AvatarScene), {
  ssr: false,
});

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const progress = useRef(1);
  const base = useRef(1);
  const { reducedMotion } = useMotion();
  const useVideo = profile.heroBackground === "video";

  // Entrance: the avatar reconstructs from a digital state into the portrait,
  // then scroll gradually digitises it again as the hero leaves the viewport.
  useEffect(() => {
    const target = { v: 1 };
    const tween = gsap.to(target, {
      v: 0.2,
      duration: reducedMotion ? 0 : 3.2,
      delay: reducedMotion ? 0 : 0.6,
      ease: "power2.inOut",
      onUpdate: () => {
        base.current = target.v;
      },
    });
    let raf = 0;
    const loop = () => {
      const vh = window.innerHeight || 1;
      const scrolled = Math.min(1, window.scrollY / (vh * 0.9));
      progress.current = Math.max(base.current, scrolled * 1.1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      tween.kill();
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  // avatar reacts subtly when the speech line changes
  const onLineChange = useCallback(() => {
    if (reducedMotion) return;
    const t = { v: base.current };
    gsap.to(t, {
      v: Math.min(0.55, base.current + 0.25),
      duration: 0.35,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
      onUpdate: () => {
        base.current = t.v;
      },
    });
  }, [reducedMotion]);

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToTarget(id);
    history.replaceState(null, "", id);
  };

  const fade = (delay: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 24, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 1, delay, ease },
  });

  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden noise" aria-labelledby="hero-title">
      {/* background layers */}
      <div className="absolute inset-0 grid-bg opacity-70" aria-hidden />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 50% at 70% 45%, rgba(72,80,255,0.16), transparent 70%), radial-gradient(40% 40% at 20% 80%, rgba(162,107,255,0.08), transparent 70%)",
        }}
      />
      {useVideo ? (
        <HeroVideo />
      ) : (
        <>
          <AvatarScene progress={progress} className="absolute inset-0 md:left-[28%] md:right-0" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" aria-hidden />
        </>
      )}

      {/* content */}
      <div className="container-x relative z-10 flex min-h-[100svh] flex-col justify-end pb-24 pt-32 md:justify-center md:pb-28">
        <div className="grid items-end gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="max-w-2xl">
            <motion.p {...fade(0.2)} className="eyebrow mb-5 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-gradient-to-r from-accent to-accent-2" aria-hidden />
              Hello, I&apos;m
            </motion.p>
            <h1 id="hero-title" className="display text-[clamp(3.2rem,10vw,7.5rem)] text-fg">
              <motion.span {...fade(0.35)} className="block">
                {profile.firstName.toUpperCase()}
              </motion.span>
              <motion.span {...fade(0.5)} className="block text-gradient">
                {profile.lastName.toUpperCase()}
              </motion.span>
            </h1>
            <motion.p {...fade(0.7)} className="mt-6 text-base font-medium text-fg/85 md:text-lg">
              {profile.headline}
            </motion.p>
            <motion.p {...fade(0.8)} className="mt-3 max-w-md text-muted leading-relaxed">
              {profile.heroDescription}
            </motion.p>
            <motion.div {...fade(0.95)} className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link href="#journey" onClick={(e) => go(e, "#journey")} className="btn btn-primary">
                  Explore My Journey
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="#projects" onClick={(e) => go(e, "#projects")} className="btn btn-ghost">
                  View My Work
                </Link>
              </Magnetic>
            </motion.div>
            <motion.div {...fade(1.1)} className="mt-8">
              <SocialLinks />
            </motion.div>
            <div className="mt-8 md:mt-10">
              <AvatarSpeech onLineChange={onLineChange} startDelay={reducedMotion ? 0 : 1600} />
            </div>
          </div>

          <div className="relative flex flex-col items-start gap-5 md:items-end md:justify-end">
            <motion.dl
              {...fade(1.4)}
              className="glass grid w-full max-w-md grid-cols-2 gap-px overflow-hidden rounded-2xl"
              aria-label="Highlights"
            >
              {profile.stats.map((s) => (
                <div key={s.label} className="flex flex-col bg-white/[0.025] px-4 py-3.5">
                  <dd className="text-xl font-semibold leading-tight tracking-tight text-fg">{s.value}</dd>
                  <dt className="mt-0.5 text-[0.62rem] uppercase leading-tight tracking-[0.14em] text-muted">{s.label}</dt>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.a
        href="#about"
        onClick={(e) => go(e, "#about")}
        {...fade(1.8)}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.25em] text-dim hover:text-muted md:flex"
        aria-label="Scroll to About"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-white/10">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-accent to-transparent" style={{ animation: "scan 1.8s ease-in-out infinite" }} />
        </span>
      </motion.a>
    </section>
  );
}
