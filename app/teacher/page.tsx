import type { Metadata } from "next";
import { TeacherReview } from "./TeacherReview";

export const metadata: Metadata = { title: "Teacher review", description: "Review student biodiversity evidence before expert validation." };

export default function TeacherReviewPage() { return <TeacherReview />; }
