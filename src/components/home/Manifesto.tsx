import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";

export default function Manifesto() {
  return (
    <section className="relative mx-auto max-w-3xl px-5 py-28 sm:px-8 sm:py-36">
      <Reveal>
        <SectionHead eyebrow="The origin" title="It Started Behind the Chair." />
      </Reveal>

      <Reveal delay={120} className="mt-12 flex flex-col gap-7 text-[15px] leading-[1.85]">
        <p className="dim">
          Pretty Vicious was built by someone who spent years behind the chair.
          Long days, tired hands, and a client in front of you who leaves
          feeling like a different person. That work is art. It just never got
          dressed like it.
        </p>
        <p className="dim">
          So we made something for the people doing it. Not a uniform, and not a
          novelty tee with a cute pun on the front. Pieces with weight, cut
          relaxed, printed dark, made for the walk in and the walk out.
        </p>
        <p className="dim">
          Drop 001 is the Beauty Professionals Club, for the lash artists, the
          nail techs, and the stylists. But the club was never meant to stop at
          one room. If you make something with your hands and you take it
          seriously, you already belong here.
        </p>
        <p className="display text-[13px] leading-[2] text-bone">
          Tees today, more to come as the club grows.
        </p>
      </Reveal>
    </section>
  );
}
