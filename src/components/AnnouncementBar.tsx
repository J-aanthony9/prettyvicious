import { ANNOUNCEMENT } from "@/lib/brand";

export default function AnnouncementBar() {
  return (
    <div className="relative z-40 bg-accent px-4 py-2.5 text-center text-[11px] font-bold uppercase leading-normal tracking-[0.22em] text-[#171012]">
      {ANNOUNCEMENT}
    </div>
  );
}
