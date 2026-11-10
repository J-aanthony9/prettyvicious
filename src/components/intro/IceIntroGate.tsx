"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ICE_INTRO_COPY } from "@/lib/brand";
import { iceCoverUp, liftCover, loadIceImages, markIceIntro, type IceImages } from "@/lib/ice-signal";

/** The effect itself, fetched only when it is actually going to play. */
const IceIntro = dynamic(() => import("@/components/intro/IceIntro"), { ssr: false });

// When the page is already covered for the intro, start fetching the effect
// the moment this script runs, rather than after hydration.
if (iceCoverUp()) void import("@/components/intro/IceIntro");

const SESSION_KEY = "pv-ice-intro";

type Lettering = "script" | "blackletter";

/**
 * Decides, once per page load, whether the ice intro plays. Tiny on purpose:
 * the canvas code only loads when the answer is yes.
 *
 * It plays only when all of these hold:
 *  - this page load landed on the homepage (/), not reached by clicking
 *    around, so it never interrupts someone mid-browse;
 *  - it is the first page load of this browser session (landing on any
 *    other page first, or a reload after it played, counts as seen);
 *  - the visitor is not coming back from Shopify checkout;
 *  - they have not already started scrolling or tapping by the time the
 *    effect is ready, so it never jumps in front of someone who is busy.
 *
 * Nothing is server rendered. If JavaScript is off or fails, there is no
 * overlay at all and the page is simply the page.
 *
 * `/?intro=script` or `/?intro=blackletter` forces it, to preview either
 * lettering.
 */
export default function IceIntroGate() {
  const [play, setPlay] = useState<Lettering | null>(null);
  const [images, setImages] = useState<IceImages>({ fog: null, frost: null });

  useEffect(() => {
    const url = new URL(window.location.href);
    const forced = url.searchParams.get("intro");
    const preview = forced === "script" || forced === "blackletter" ? forced : null;

    // A session cookie (no expiry), so every tab shares it and it clears
    // when the browser closes. sessionStorage would replay it in each new tab.
    const seen = document.cookie.split("; ").includes(`${SESSION_KEY}=1`);
    // Once marked, this browser session has had its chance, played or not.
    const markSeen = () => {
      document.cookie = `${SESSION_KEY}=1; path=/; SameSite=Lax`;
    };

    if (!preview) {
      if (seen) {
        liftCover();
        return;
      }
      // Landing anywhere else first, or coming back from checkout, uses up
      // the session's chance: the intro is for arriving, not for returning.
      if (url.pathname !== "/" || /shopify|checkout/i.test(document.referrer)) {
        markSeen();
        liftCover();
        return;
      }
    }

    // From here it may well play: anything waiting on it (the homepage
    // snow) holds off until it has played or decided not to.
    markIceIntro(true);

    // Someone who is already scrolling or tapping keeps the page.
    let busy = false;
    const markBusy = () => {
      busy = true;
    };
    const opts = { passive: true, once: true } as const;
    window.addEventListener("scroll", markBusy, opts);
    window.addEventListener("pointerdown", markBusy, opts);
    window.addEventListener("keydown", markBusy, opts);

    // Start once the page has settled, so the effect never competes with
    // the page's own first paint.
    const begin = () => {
      window.removeEventListener("scroll", markBusy);
      window.removeEventListener("pointerdown", markBusy);
      window.removeEventListener("keydown", markBusy);
      // Marked here, not on mount, so a remount (React's dev double run, or
      // a fast refresh) cannot use up the session before anything decides.
      markSeen();
      // Under the cover nothing of the page has been seen, so there is no
      // one mid-browse to interrupt; without it, a busy visitor keeps the page.
      if (!covered && (busy || window.scrollY > 40)) {
        markIceIntro(false);
        liftCover();
        return;
      }
      // The glass textures first (already fetching since the first paint
      // when the page is covered), but never more than a moment's wait.
      void loadIceImages().then((loaded) => {
        if (cancelled) return;
        setImages(loaded);
        setPlay(preview ?? ICE_INTRO_COPY.lettering);
      });
    };
    // Covered: start now, the page is waiting on it. Otherwise wait for the
    // page to settle so the effect never competes with its first paint.
    const covered = iceCoverUp();
    const idle = covered
      ? window.setTimeout(begin, 0)
      : window.requestIdleCallback
        ? window.requestIdleCallback(begin, { timeout: 600 })
        : window.setTimeout(begin, 200);

    let cancelled = false;
    return () => {
      cancelled = true;
      if (!covered && window.cancelIdleCallback && typeof idle === "number") window.cancelIdleCallback(idle);
      window.clearTimeout(idle as number);
      window.removeEventListener("scroll", markBusy);
      window.removeEventListener("pointerdown", markBusy);
      window.removeEventListener("keydown", markBusy);
    };
  }, []);

  if (!play) return null;
  return (
    <IceIntro
      lettering={play}
      images={images}
      onDone={() => {
        setPlay(null);
        liftCover();
        markIceIntro(false);
      }}
    />
  );
}
