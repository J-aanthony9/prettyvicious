export default function SectionHead({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow ? <p className="eyebrow mb-3.5">{eyebrow}</p> : null}
      <h2 className="sec-title">{title}</h2>
      {sub ? (
        <p className="mt-3.5 text-[15px] text-[color:var(--bone-dim)]">{sub}</p>
      ) : null}
    </div>
  );
}
