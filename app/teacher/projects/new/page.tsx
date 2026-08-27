import type { Metadata } from "next";
import { ProjectSetup } from "./ProjectSetup";

export const metadata: Metadata = { title: "Create pilot project", description: "Plan a safe, teacher-led school biodiversity project." };
export default function NewProjectPage() { return <ProjectSetup />; }
