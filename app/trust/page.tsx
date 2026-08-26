import type { Metadata } from "next";
import { TrustCentre } from "../TrustCentre";

export const metadata: Metadata = {
  title: "Trust and Safety Centre",
  description: "GeoMentor Africa pilot policies for safeguarding, privacy, consent, acceptable use and support.",
};

export default function TrustCentrePage() { return <TrustCentre />; }
