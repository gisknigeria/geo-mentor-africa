import { Suspense } from "react";
import { AuthCallback } from "./AuthCallback";

export default function AuthCallbackPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f4f6f1] text-sm text-emerald-950">Completing your secure sign-in…</main>}><AuthCallback /></Suspense>;
}
