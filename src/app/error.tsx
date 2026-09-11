"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BRAND } from "@/lib/brand";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">Something went dark</p>
      <h1 className="display mt-6 text-[clamp(1.4rem,4vw,2.2rem)]">
        That did not load
      </h1>
      <p className="dim mt-7 text-[15px]">
        Give it one more try. If it keeps happening, email{" "}
        <a href={`mailto:${BRAND.supportEmail}`} className="link-quiet text-bone">
          {BRAND.supportEmail}
        </a>
        .
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <button type="button" onClick={reset} className="btn btn-solid">
          Try again
        </button>
        <Link href="/" className="btn">
          Back home
        </Link>
      </div>
    </div>
  );
}
