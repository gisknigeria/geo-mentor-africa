import type { Metadata } from "next";
import Link from "next/link";
import { StudentDashboard } from "../page";

export const metadata: Metadata = { title: "Student fieldwork", description: "Record, review and map school biodiversity observations." };

export default function StudentPage() {
  return <><StudentDashboard /><Link href="/student/missions" className="fixed bottom-5 right-5 z-30 rounded-xl bg-lime-300 px-5 py-3 text-xs font-black text-emerald-950 shadow-xl">Open today’s mission</Link></>;
}
