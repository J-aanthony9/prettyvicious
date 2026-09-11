"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { joinClubAction } from "@/lib/actions";
import { EMPTY_ACTION_STATE } from "@/lib/action-state";
import { CLUB } from "@/lib/brand";

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
    <section
      id="club"
      className="club-bg relative z-10 scroll-mt-20 border-t border-[color:var(--hairline-soft)] py-[clamp(72px,10vw,128px)] text-center"
    >
      <div className="mx-auto max-w-[1200px] px-[clamp(20px,4vw,48px)]">
        <p className="gothic mb-4 text-[22px] tracking-[0.06em] text-accent">
          The Club
        </p>
        <h2 className="mx-auto max-w-[640px] font-[family-name:var(--font-display)] text-[clamp(30px,4.6vw,50px)] font-medium uppercase leading-[1.12] tracking-[0.06em]">
          Join the Beauty Professionals Club
        </h2>
        <p className="mx-auto mb-[34px] mt-[18px] max-w-[460px] text-[15px] text-[color:var(--bone-dim)]">
          {CLUB.line}
        </p>

        {state.ok ? (
          <p
            className="font-[family-name:var(--font-display)] text-[22px] italic text-accent"
            role="status"
          >
            {state.message}
          </p>
        ) : (
          <form
            action={formAction}
            className="mx-auto flex max-w-[460px] flex-col justify-center gap-2.5 sm:flex-row"
          >
            <label className="sr-only" htmlFor="club-email">
              Email address
            </label>
            <input
              id="club-email"
              className="field flex-1"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="your@email.com"
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
          <p className="mt-4 text-[14px] text-accent" role="alert">
            {state.message}
          </p>
        ) : null}

        <p className="mt-[18px] text-[12px] tracking-[0.08em] text-[color:var(--bone-faint)]">
          Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
