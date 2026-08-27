export default function SectionHead({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow ? <p className="eyebrow mb-5">{eyebrow}</p> : null}
      <h2 className="display text-[clamp(1.35rem,3.6vw,2.1rem)]">{title}</h2>
      <div
        className={`rule mt-7 ${align === "center" ? "mx-auto w-24" : "w-24"}`}
      />
    </div>
  );
}
