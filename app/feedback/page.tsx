"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const type = String(form.get("type") ?? "Feedback");
    const message = String(form.get("message") ?? "").trim();
    const subject = encodeURIComponent(`GeoMentor Africa ${type}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

    window.location.href = `mailto:giskonsult@gisknigeria.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]">
      <header className="bg-[#083d31] px-5 py-5 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-6">
          <Link href="/twg" className="font-serif text-xl font-medium">GeoMentor Africa</Link>
          <Link href="/privacy" className="text-xs font-bold text-emerald-100 transition hover:text-lime-300">Privacy Notice</Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 lg:py-16">
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">Feedback &amp; Support</p>
        <h1 className="mt-3 font-serif text-4xl font-medium leading-tight text-emerald-950 sm:text-6xl">Tell us what would make GeoMentor Africa better.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
          Use this page to share feedback, ask a question, report a problem or suggest an improvement. Selecting Submit opens your email app with the details ready to send.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl border border-[#dfe6df] bg-white p-5 shadow-[0_12px_40px_rgba(33,65,54,.07)] sm:p-8">
          <label className="block text-sm font-black tracking-[.12em] text-emerald-700">
            YOUR NAME *
            <input name="name" required className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-normal tracking-normal focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
          </label>
          <label className="block text-sm font-black tracking-[.12em] text-emerald-700">
            EMAIL ADDRESS *
            <input name="email" type="email" required className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-normal tracking-normal focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
          </label>
          <label className="block text-sm font-black tracking-[.12em] text-emerald-700">
            FEEDBACK TYPE *
            <select name="type" required className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-normal tracking-normal focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200">
              <option>General feedback</option>
              <option>Question</option>
              <option>Report a problem</option>
              <option>Privacy or data request</option>
              <option>Partnership or programme suggestion</option>
            </select>
          </label>
          <label className="block text-sm font-black tracking-[.12em] text-emerald-700">
            YOUR MESSAGE *
            <textarea name="message" required rows={7} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-normal tracking-normal focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
          </label>
          <button type="submit" className="w-full rounded-lg bg-emerald-600 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700">
            Open email to send feedback
          </button>
          {submitted && <p className="text-sm leading-6 text-emerald-800" role="status">Your email app should now be open with the feedback message prepared.</p>}
        </form>

        <div className="mt-8 border-t border-[#dfe6df] pt-6 text-sm leading-6 text-slate-600">
          <p>Prefer to contact us directly?</p>
          <p><a className="font-semibold text-emerald-700" href="mailto:giskonsult@gisknigeria.com">giskonsult@gisknigeria.com</a> · <a className="font-semibold text-emerald-700" href="tel:08038089097">08038089097</a></p>
          <p className="mt-4"><Link href="/twg" className="font-bold text-emerald-700 hover:text-emerald-900">Return to TWG registration</Link></p>
        </div>
      </section>
    </main>
  );
}
