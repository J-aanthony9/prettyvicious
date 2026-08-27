"use client";

import Image from "next/image";
import { useState } from "react";
import type { ShopifyImage } from "@/lib/shopify/types";

export default function Gallery({
  images,
  title,
}: {
  images: ShopifyImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (!current) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center border border-dashed border-[color:var(--hairline)] bg-veil/40 text-accent">
        ✦
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden border border-[color:var(--hairline)] bg-veil">
        <Image
          src={current.url}
          alt={current.altText || title}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-3">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              className={`relative aspect-square overflow-hidden border transition-colors duration-400 ${
                index === active
                  ? "border-[color:var(--color-accent)]"
                  : "border-[color:var(--hairline)] hover:border-[color:var(--color-accent-deep)]"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
