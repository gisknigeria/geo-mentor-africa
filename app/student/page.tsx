import type { Metadata } from "next";
import Link from "next/link";
import { StudentDashboard } from "../page";

export const metadata: Metadata = { title: "Student fieldwork", description: "Record, review and map school biodiversity observations." };

export default function StudentPage() {
  return <><StudentDashboard /><div className="fixed bottom-5 right-5 z-30 flex flex-col gap-2"><Link href="/map" className="rounded-xl bg-white px-5 py-3 text-center text-xs font-black text-emerald-900 shadow-xl">Explore GIS map</Link><Link href="/student/missions" className="rounded-xl bg-lime-300 px-5 py-3 text-center text-xs font-black text-emerald-950 shadow-xl">Open today’s mission</Link></div></>;
}
