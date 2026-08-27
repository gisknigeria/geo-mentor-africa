import type { Metadata } from "next";
import { PilotOnboarding } from "../PilotOnboarding";

export const metadata: Metadata = {
  title: "Pilot Onboarding Centre",
  description: "A practical, safeguarding-conscious launch guide for schools, teachers, mentors and experts joining GeoMentor Africa.",
};

export default function PilotOnboardingPage() { return <PilotOnboarding />; }
