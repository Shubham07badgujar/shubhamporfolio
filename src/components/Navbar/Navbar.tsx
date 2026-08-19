"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/ui/Magnetic";

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // active section indicator
  useEffect(() => {
    if (!isHome) return;
    const sections = navItems
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.1, 0.25, 0.5] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onNav = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isHome) return; // let Next navigate to /#id
    e.preventDefault();
    setOpen(false);
    scrollToTarget(href);
    history.replaceState(null, "", href);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-all duration-500",
          scrolled ? "py-3" : "py-5",
        )}
      >
        <div className="container-x">
          <nav
            aria-label="Primary"
            className={cn(
              "flex items-center justify-between rounded-full px-4 py-2 md:px-5 transition-all duration-500",
              scrolled ? "glass" : "border border-transparent",
            )}
          >
            <Link
              href="/"
              className="font-mono text-lg font-semibold tracking-tight text-fg"
              aria-label={`${profile.fullName} — home`}
            >
              {profile.logo}
            </Link>

            <ul className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = isHome && active === item.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={isHome ? item.href : `/${item.href}`}
                      onClick={(e) => onNav(e, item.href)}
                      className={cn(
                        "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                        isActive ? "text-fg" : "text-muted hover:text-fg",
                      )}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-white/[0.07]"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <Link
                href="/quick"
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-xs font-medium text-muted hover:text-fg hover:border-white/30 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                Quick View
              </Link>
              <Magnetic strength={0.2}>
                <Link
                  href={isHome ? "#contact" : "/#contact"}
                  onClick={(e) => onNav(e, "#contact")}
                  className="btn btn-primary hidden md:inline-flex !py-2.5 !px-4 text-sm"
                >
                  Let&apos;s Connect
                </Link>
              </Magnetic>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden relative h-10 w-10 rounded-full glass grid place-items-center"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
              >
                <span
                  className={cn(
                    "absolute h-px w-4 bg-fg transition-transform duration-300",
                    open ? "rotate-45" : "-translate-y-1",
                  )}
                />
                <span
                  className={cn(
                    "absolute h-px w-4 bg-fg transition-transform duration-300",
                    open ? "-rotate-45" : "translate-y-1",
                  )}
                />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[90] bg-bg/95 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
            <div className="relative flex h-full flex-col justify-between px-8 pt-28 pb-10">
              <ul className="space-y-1">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={isHome ? item.href : `/${item.href}`}
                      onClick={(e) => onNav(e, item.href)}
                      className="group flex items-baseline gap-4 py-2"
                    >
                      <span className="font-mono text-xs text-dim">0{i + 1}</span>
                      <span className="display text-4xl text-fg group-hover:text-gradient transition-colors">
                        {item.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link href="/quick" onClick={() => setOpen(false)} className="btn btn-ghost">
                  Quick View
                </Link>
                <a href={profile.resumeUrl} className="btn btn-primary" download>
                  Resume
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
