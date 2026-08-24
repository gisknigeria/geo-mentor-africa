import type { Metadata } from "next";
import { AuthForm } from "./AuthForm";

export const metadata: Metadata = { title: "Secure sign in", description: "Invite-only access to the GeoMentor Africa pilot." };

export default function AuthPage() { return <AuthForm />; }
