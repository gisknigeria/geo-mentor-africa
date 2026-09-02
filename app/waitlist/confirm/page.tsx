"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";

function ConfirmWaitlistContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "not-found"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) {
      setStatus("not-found");
      setMessage("No confirmation code found.");
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await fetch(`/api/waitlist/confirm?id=${id}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(
            "Your email has been confirmed! You're now officially on our waiting list."
          );
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to confirm your email.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
      }
    };

    void confirmEmail();
  }, [id]);

  return (
    <>
      {status === "loading" && (
        <div className="text-center">
          <Loader className="size-12 mx-auto text-emerald-600 animate-spin mb-4" />
          <h1 className="font-serif text-2xl text-emerald-950 mb-2">
            Confirming your email...
          </h1>
          <p className="text-slate-600">
            Please wait while we confirm your email address.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <CheckCircle className="size-12 mx-auto text-emerald-600 mb-4" />
          <h1 className="font-serif text-2xl text-emerald-950 mb-2">
            Email Confirmed!
          </h1>
          <p className="text-slate-600 mb-6">{message}</p>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              We'll keep you updated on our launch and early access opportunities.
            </p>
            <Link
              href="/"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <AlertCircle className="size-12 mx-auto text-red-600 mb-4" />
          <h1 className="font-serif text-2xl text-emerald-950 mb-2">
            Confirmation Failed
          </h1>
          <p className="text-slate-600 mb-6">{message}</p>
          <Link
            href="/"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Return to Home
          </Link>
        </div>
      )}

      {status === "not-found" && (
        <div className="text-center">
          <AlertCircle className="size-12 mx-auto text-red-600 mb-4" />
          <h1 className="font-serif text-2xl text-emerald-950 mb-2">
            Invalid Link
          </h1>
          <p className="text-slate-600 mb-6">{message}</p>
          <Link
            href="/"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Return to Home
          </Link>
        </div>
      )}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center">
      <Loader className="size-12 mx-auto text-emerald-600 animate-spin mb-4" />
      <h1 className="font-serif text-2xl text-emerald-950 mb-2">
        Loading...
      </h1>
    </div>
  );
}

export default function ConfirmWaitlist() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Suspense fallback={<LoadingFallback />}>
            <ConfirmWaitlistContent />
          </Suspense>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2024 GeoMentor Africa. All rights reserved.
        </p>
      </div>
    </main>
  );
}
