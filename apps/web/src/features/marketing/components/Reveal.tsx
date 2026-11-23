"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Delay in ms, handy for staggering siblings. */
  delay?: number;
  className?: string;
  as?: ElementType;
};

/**
 * Fades/slides its children in the first time they scroll into view.
 *
 * Content is visible by default (server render, no JS, crawlers, screenshots).
 * Only elements that start below the fold are "armed" (hidden) after mount, and
 * anything already on screen is never hidden at all.
 */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already on screen at mount: leave it visible, no animation, no flash.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    const raf = requestAnimationFrame(() => setArmed(true));
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      data-armed={armed}
      data-in={shown}
      className={`reveal ${className}`}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
