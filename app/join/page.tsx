import type { Metadata } from "next";
import { StudentJoin } from "./StudentJoin";

export const metadata: Metadata = { title: "Join your school", description: "Supervised student access using a GeoMentor Africa class code." };

export default function StudentJoinPage() { return <StudentJoin />; }
