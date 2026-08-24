import type { Metadata } from "next";
import { AdminOnboarding } from "./AdminOnboarding";

export const metadata: Metadata = { title: "Onboarding administration", description: "Review access, consent, class codes and staff invitations." };

export default function OnboardingAdminPage() { return <AdminOnboarding />; }
