import Reveal from "@/components/Reveal";
import { PERKS } from "@/lib/brand";

export default function Perks() {
  return (
    <section className="relative z-10 border-t border-[color:var(--hairline-soft)]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-[clamp(20px,4vw,48px)] py-11 md:grid-cols-3 md:gap-4">
        {PERKS.map((perk, index) => (
          <Reveal key={perk.title} delay={index * 110} className="px-3 text-center">
            <span className="mb-3 block text-[15px] text-accent">✦</span>
            <h3 className="mb-2 text-[12px] font-bold uppercase tracking-[0.22em]">
              {perk.title}
            </h3>
            <p className="text-[15px] text-[color:var(--bone-dim)]">{perk.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
