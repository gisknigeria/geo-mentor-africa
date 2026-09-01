import type { Metadata } from "next";
import Link from "next/link";
import { TeacherReview } from "./TeacherReview";

export const metadata: Metadata = { title: "Teacher review", description: "Review student biodiversity evidence before expert validation." };

export default function TeacherReviewPage() {
  return <><TeacherReview /><Link href="/teacher/projects/new" className="fixed bottom-5 right-5 z-30 rounded-xl bg-lime-300 px-5 py-3 text-xs font-black text-white shadow-xl">Create pilot project</Link></>;
}
