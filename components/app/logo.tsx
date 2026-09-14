import Image from "next/image";
import Link from "next/link";
import { cn } from "../../lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center justify-center", className)}
      aria-label="GeoMentor Africa home"
    >
      <Image
        src="/WhatsApp Image 2026-09-14 at 5.36.40 PM.jpeg"
        alt="GeoMentor Africa"
        width={compact ? 120 : 180}
        height={compact ? 36 : 54}
        priority
        className="h-auto w-auto max-h-12 object-contain"
      />
    </Link>
  );
}
