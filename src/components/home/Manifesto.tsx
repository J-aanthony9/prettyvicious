import Reveal from "@/components/Reveal";
import { DROPS } from "@/lib/brand";

export default function Manifesto() {
  return (
    <section
      id="about"
      className="relative z-10 py-[clamp(72px,10vw,128px)] scroll-mt-20"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-[clamp(32px,6vw,88px)] px-[clamp(20px,4vw,48px)] md:grid-cols-2">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(34px,4.6vw,56px)] font-medium uppercase leading-[1.08] tracking-[0.05em]">
            It Started
            <br />
            Behind the{" "}
            <span className="gothic text-[1.08em] normal-case text-accent">
              Chair
            </span>
            .
          </h2>
        </Reveal>

        <Reveal className="flex flex-col gap-[18px] text-[16px] text-[color:var(--bone-dim)]">
          <span
            aria-hidden="true"
            className="mb-1.5 block h-px w-[52px] bg-[color:var(--color-accent-deep)]"
          />
          <p>
            Pretty Vicious was born in the world where beauty actually gets
            made: the suites, the studios, the after-hours appointments.
          </p>
          <p>
            <strong className="font-semibold text-bone">
              Drop {DROPS.current.number} is for the professionals. The brand
              doesn&apos;t stop there.
            </strong>{" "}
            Tees today, more to come as the club grows.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
