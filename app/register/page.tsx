import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Apply to join", description: "Apply as a school, mentor or biodiversity expert." };

export default function RegisterPage() { return <RegisterForm />; }
