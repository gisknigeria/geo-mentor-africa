import { Leaf } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight text-white", className)} aria-label="GeoMentor Africa home">
      <span className="grid size-9 place-items-center rounded-xl bg-lime-300 text-emerald-950"><Leaf className="size-5" strokeWidth={2.3} /></span>
      {!compact && <span className="text-white">GeoMentor <strong className="text-lime-300">Africa</strong></span>}
    </Link>
  );
}
