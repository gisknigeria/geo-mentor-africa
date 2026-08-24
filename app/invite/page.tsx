import type { Metadata } from "next";
import { StaffInvitation } from "./StaffInvitation";

export const metadata: Metadata = { title: "Accept staff invitation", description: "Verify and accept a GeoMentor Africa school staff role." };

export default function StaffInvitationPage() { return <StaffInvitation />; }
