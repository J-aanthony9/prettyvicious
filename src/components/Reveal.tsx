"use client";

import { useEffect, useRef } from "react";

/**
 * Fades a section up the first time it enters the viewport. Sections on
 * screen when the page opens fade up from the first paint in CSS alone
 * (see .reveal in globals.css). Once the page is running, sections still
 * below the fold are held back (.reveal-wait) and fade up as they are
 * scrolled to. Reduced motion is handled in CSS, where .reveal is simply
 * visible.
 */
export default function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  children,
  ...rest
}: {
  as?: "div" | "section" | "li" | "article";
  className?: string;
  delay?: number;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-in");
      return;
    }

    // Already on screen: its CSS fade has played or is playing. Leave it.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
      node.classList.add("is-in");
      return;
    }
    // Still below the fold: nobody has seen it yet, so hide it until it
    // scrolls into view.
    node.classList.add("reveal-wait");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error the ref type narrows per tag, all are HTMLElement
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
