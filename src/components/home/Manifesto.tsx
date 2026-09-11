import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";

export default function Manifesto() {
  return (
    <section className="relative mx-auto max-w-3xl px-5 py-28 sm:px-8 sm:py-36">
      <Reveal>
        <SectionHead eyebrow="The origin" title="It Started Behind the Chair." />
      </Reveal>

      <Reveal delay={120} className="mt-12 flex flex-col gap-7 text-[16px] leading-[1.85]">
        <p className="dim">
          Pretty Vicious was born in the world where beauty actually gets made:
          the suites, the studios, the after-hours appointments. Drop 001 is for
          the professionals. The brand doesn&apos;t stop there.
        </p>
        <p className="display text-[14px] leading-[2] text-bone">
          Tees today, more to come as the club grows.
        </p>
      </Reveal>
    </section>
  );
}
