import type { Metadata } from "next";
import { MentorWorkspace } from "./MentorWorkspace";

export const metadata: Metadata = {
  title: "Mentor workspace | GeoMentor Africa",
  description: "Mentor projects, school activity and supervised learning sessions.",
};

export default function MentorWorkspacePage() {
  return <MentorWorkspace />;
}
