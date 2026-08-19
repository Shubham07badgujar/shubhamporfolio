"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { profile, hrefOf, isPlaceholder } from "@/data/profile";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Magnetic } from "@/components/ui/Magnetic";
import { useMotion } from "@/components/providers/MotionProvider";

const FaceReconstruction = dynamic(() => import("@/components/three/FaceReconstruction").then((m) => m.FaceReconstruction), {
  ssr: false,
});

/*
 * NOTE: this section must not carry an explicit z-index. `position: sticky`
 * plus a z-index creates a stacking context, and the `noise` utility paints its
 * texture with `mix-blend-mode: overlay` — inside an isolated group that blends
 * against a transparent backdrop and washes the whole panel out to grey. The
 * footer still covers it on scroll because a positioned `z-10` sibling paints
 * above a `z-index: auto` one.
 */

/**
 * The visual loop closes here: the face rebuilds from particles as the section
 * enters, then dissolves once the visitor reaches the very bottom.
 */
export function Contact() {
  const section = useRef<HTMLElement>(null);
  const form = useRef(0);
  const dissolve = useRef(0);
  const { reducedMotion } = useMotion();

  useEffect(() => {
    if (reducedMotion) {
      form.current = 1;
      return;
    }
    let raf = 0;
    // Cached so the frame loop reads layout once per resize instead of per frame.
    let docHeight = document.documentElement.scrollHeight;
    const onResize = () => {
      docHeight = document.documentElement.scrollHeight;
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.documentElement);

    const loop = () => {
      const el = section.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 as the section enters, 1 once it is centred
        form.current = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
        // hold the formed face, then dissolve only in the last stretch of the page
        const docBottom = docHeight - window.scrollY - vh;
        dissolve.current = Math.min(1, Math.max(0, 1 - docBottom / (vh * 0.22)));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [reducedMotion]);

  const emailHref = hrefOf(profile.social.email, "email");
  // LinkedIn is the published way to reach him; fall back to email only if it
  // is ever cleared back to a placeholder.
  const connectVia = isPlaceholder(profile.social.linkedin) ? "email" : "linkedin";
  const connectHref = connectVia === "linkedin" ? hrefOf(profile.social.linkedin) : emailHref;

  return (
    <section id="contact" ref={section} className="sticky top-0 h-[100dvh] overflow-hidden noise" aria-labelledby="contact-title">
      <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{ background: "radial-gradient(50% 45% at 50% 45%, rgba(111,124,255,0.14), transparent 70%)" }}
      />
      <FaceReconstruction form={form} dissolve={dissolve} className="absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent" aria-hidden />
      {/* keeps the copy legible where it crosses the reconstructed face */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{ background: "radial-gradient(42% 32% at 50% 52%, rgba(5,5,5,0.82), transparent 72%)" }}
      />

      <div className="container-x relative z-10 flex h-[100dvh] flex-col items-center justify-center py-16 text-center md:py-20">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="eyebrow mb-4"
        >
          Contact
        </motion.p>
        <motion.h2
          id="contact-title"
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="display text-[clamp(2.4rem,6.5vw,4.75rem)] text-fg"
        >
          LET&apos;S BUILD<br />
          <span className="text-gradient">SOMETHING.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="mt-5 max-w-md text-muted"
        >
          Have an idea, opportunity, or project worth building?
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Magnetic>
            <a
              href={connectHref}
              target={connectVia === "linkedin" ? "_blank" : undefined}
              rel={connectVia === "linkedin" ? "noreferrer" : undefined}
              className="btn btn-primary"
              aria-label={
                connectVia === "linkedin"
                  ? "Let's connect on LinkedIn"
                  : isPlaceholder(profile.social.email)
                    ? "Let's connect — contact link to be added"
                    : "Let's connect by email"
              }
            >
              Let&apos;s Connect
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </Magnetic>
          <Magnetic>
            <a href={profile.resumeUrl} download className="btn btn-ghost">
              Download Resume
            </a>
          </Magnetic>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-7"
        >
          <SocialLinks className="justify-center" />
        </motion.div>
      </div>
    </section>
  );
}
