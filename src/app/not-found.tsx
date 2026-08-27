import Link from "next/link";
import { DROPS } from "@/lib/brand";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-6 text-[clamp(1.4rem,4vw,2.2rem)]">
        Nothing here
      </h1>
      <p className="dim mt-7 text-[14px]">
        This page went dark. The drop did not.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link href={`/collections/${DROPS.current.handle}`} className="btn btn-solid">
          Shop Drop {DROPS.current.number}
        </Link>
        <Link href="/" className="btn">
          Back home
        </Link>
      </div>
    </div>
  );
}
