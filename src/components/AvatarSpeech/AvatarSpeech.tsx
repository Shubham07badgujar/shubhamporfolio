"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile } from "@/data/profile";
import { useMotion } from "@/components/providers/MotionProvider";
import { cn } from "@/lib/utils";

type Props = {
  /** Called whenever a new line starts so the avatar can react. */
  onLineChange?: (index: number) => void;
  className?: string;
  startDelay?: number;
};

const CHAR_MS = 22;

const subscribeNoop = () => () => {};
const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * Glass speech panel: the avatar introduces Shubham line by line.
 * Optional "Listen" uses the browser's speech synthesis — never autoplays.
 */
export function AvatarSpeech({ onLineChange, className, startDelay = 1400 }: Props) {
  const { reducedMotion } = useMotion();
  const lines = [...profile.intro.lines];
  const [lineIndex, setLineIndex] = useState(reducedMotion ? lines.length : 0);
  const [typed, setTyped] = useState(reducedMotion ? lines[lines.length - 1] : "");
  const [done, setDone] = useState(reducedMotion);
  const [speaking, setSpeaking] = useState(false);
  const canSpeak = useSyncExternalStore(subscribeNoop, hasSpeech, () => false);

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    const timers: number[] = [];
    const run = async () => {
      await new Promise((r) => timers.push(window.setTimeout(r, startDelay)));
      for (let li = 0; li < lines.length; li++) {
        if (cancelled) return;
        setLineIndex(li);
        onLineChange?.(li);
        // Step by code point: slicing by index would cut emoji surrogate pairs in half.
        const chars = Array.from(lines[li]);
        for (let c = 1; c <= chars.length; c++) {
          if (cancelled) return;
          setTyped(chars.slice(0, c).join(""));
          await new Promise((r) => timers.push(window.setTimeout(r, CHAR_MS)));
        }
        await new Promise((r) => timers.push(window.setTimeout(r, li === 0 ? 500 : 900)));
      }
      setDone(true);
      onLineChange?.(lines.length);
    };
    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, startDelay]);

  const speak = useCallback(() => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(
      [...profile.intro.lines, profile.intro.followUp].join(" ").replace("👋", ""),
    );
    u.rate = 1;
    u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.cancel();
    synth.speak(u);
  }, [canSpeak, speaking]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const visibleLines = reducedMotion ? lines : lines.slice(0, lineIndex);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: startDelay / 1000 - 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn("glass-strong relative rounded-2xl p-5 md:p-6 max-w-sm", className)}
    >
      <span
        aria-hidden
        className="absolute -left-2 top-8 h-4 w-4 rotate-45 border-l border-b border-line-strong bg-[#101019]/90"
      />
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="eyebrow !text-[0.62rem]">Shubham · digital avatar</span>
      </div>
      <div className="space-y-1.5 text-[0.95rem] leading-relaxed text-fg/90">
        {visibleLines.map((l, i) => (
          <p key={i} className={i === 1 ? "font-medium text-fg" : ""}>
            {l}
          </p>
        ))}
        {!reducedMotion && !done && lineIndex < lines.length && (
          <p className={lineIndex === 1 ? "font-medium text-fg" : ""}>
            {typed}
            <span className="animate-blink ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] bg-accent" aria-hidden />
          </p>
        )}
      </div>
      <AnimatePresence>
        {done && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-sm text-muted"
          >
            {profile.intro.followUp}
          </motion.p>
        )}
      </AnimatePresence>
      {canSpeak && (
        <button
          type="button"
          onClick={speak}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-xs text-muted transition-colors hover:text-fg hover:border-white/30"
          aria-pressed={speaking}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {speaking ? (
              <>
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </>
            ) : (
              <>
                <path d="M11 5 6 9H2v6h4l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              </>
            )}
          </svg>
          {speaking ? "Stop" : "Listen"}
        </button>
      )}
    </motion.div>
  );
}
