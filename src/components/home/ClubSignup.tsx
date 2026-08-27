"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinClubAction } from "@/lib/actions";
import { EMPTY_ACTION_STATE } from "@/lib/action-state";
import { BRAND, CLUB } from "@/lib/brand";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-solid shrink-0" disabled={pending}>
      {pending ? "Joining" : "Join the club"}
    </button>
  );
}

export default function ClubSignup() {
  const [state, formAction] = useActionState(joinClubAction, EMPTY_ACTION_STATE);

  return (
    <section id="club" className="relative scroll-mt-24">
      <div className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8 sm:py-36">
        <p className="eyebrow">{BRAND.subLabel}</p>
        <h2 className="display mt-6 text-[clamp(1.35rem,3.6vw,2.1rem)]">
          Join the club
        </h2>
        <p className="dim mx-auto mt-7 max-w-md text-[14px] leading-[1.85]">
          {CLUB.line}
        </p>

        {state.ok ? (
          <p className="display mt-12 text-[12px] leading-[2] text-accent" role="status">
            {state.message}
          </p>
        ) : (
          <form
            action={formAction}
            className="mx-auto mt-12 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label className="sr-only" htmlFor="club-email">
              Email address
            </label>
            <input
              id="club-email"
              className="field"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
            {/* Honeypot. Hidden from people, tempting to bots. */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute h-0 w-0 opacity-0"
            />
            <SubmitButton />
          </form>
        )}

        {!state.ok && state.message ? (
          <p className="mt-5 text-[12px] text-accent" role="alert">
            {state.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
