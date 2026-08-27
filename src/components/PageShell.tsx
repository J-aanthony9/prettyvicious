import SectionHead from "@/components/SectionHead";

export default function PageShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8 sm:py-28">
      <SectionHead eyebrow={eyebrow} title={title} align="left" />
      <div className="prose-pv mt-14 flex flex-col gap-7">{children}</div>
    </div>
  );
}
