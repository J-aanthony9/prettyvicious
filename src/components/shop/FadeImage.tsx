"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";

type Stage = "idle" | "waiting" | "loaded";

/**
 * A product image that fades in once it has loaded, instead of popping
 * into an empty frame. While it loads, a faint frost shimmer sweeps the
 * frame behind it (.frost-shimmer in globals.css).
 *
 * Only images still on their way when the page comes to life are hidden
 * and faded. One that has already arrived by then is left alone: hiding a
 * visible picture would flicker it, and an image hidden from the first
 * paint counts as loading late, which is the opposite of what we want.
 * The server renders every image visible, so without JavaScript nothing is
 * ever hidden. With reduced motion there is no fade and no shimmer.
 */
export default function FadeImage({ className = "", onLoad, ...props }: ImageProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (!img) return;
    setStage((current) => (current === "idle" ? (img.complete && img.naturalWidth > 0 ? "loaded" : "waiting") : current));
  }, []);
  return (
    <>
      {stage === "loaded" ? null : <span className="frost-shimmer" aria-hidden="true" />}
      <Image
        {...props}
        ref={ref}
        className={`${stage === "waiting" ? "fade-img" : ""} ${stage === "loaded" ? "fade-img is-loaded" : ""} ${className}`}
        onLoad={(event) => {
          setStage("loaded");
          onLoad?.(event);
        }}
      />
    </>
  );
}
