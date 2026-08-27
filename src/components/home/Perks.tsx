import Reveal from "@/components/Reveal";
import { PERKS } from "@/lib/brand";

export default function Perks() {
  return (
    <section className="relative border-y border-[color:var(--hairline)] bg-veil/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-3 md:gap-16">
        {PERKS.map((perk, index) => (
          <Reveal key={perk.title} delay={index * 110}>
            <span className="text-accent">✦</span>
            <h3 className="display mt-5 text-[11px] tracking-[0.26em]">
              {perk.title}
            </h3>
            <p className="dim mt-4 text-[13px] leading-[1.85]">{perk.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
