import type { Metadata } from "next";
import { StudentDashboard } from "../page";

export const metadata: Metadata = { title: "Student fieldwork", description: "Record, review and map school biodiversity observations." };

export default function StudentPage() { return <StudentDashboard />; }
