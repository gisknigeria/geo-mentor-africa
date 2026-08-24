import type { Metadata } from "next";
import { RegistrationApplication } from "./RegistrationApplication";

export const metadata: Metadata = { title: "Complete application", description: "Complete a verified GeoMentor Africa registration application." };

export default function CompleteRegistrationPage() { return <RegistrationApplication />; }
