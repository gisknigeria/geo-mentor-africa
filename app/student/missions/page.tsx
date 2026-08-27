import type { Metadata } from "next";
import { MissionLesson } from "./MissionLesson";

export const metadata: Metadata = { title: "Student biodiversity mission", description: "Complete a safe, teacher-supervised biodiversity fieldwork mission." };
export default function StudentMissionPage() { return <MissionLesson />; }
