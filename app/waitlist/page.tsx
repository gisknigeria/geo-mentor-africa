"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, Leaf, MapPinned } from "lucide-react";
import { useEffect, useState } from "react";
import { WaitlistForm } from "../components/WaitlistForm";
import { Logo } from "../../components/app/logo";

const launchDate = new Date("2026-10-01T00:00:00+01:00");

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdown(): Countdown {
  const difference = Math.max(0, launchDate.getTime() - Date.now());
  const totalSeconds = Math.floor(difference / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-0 text-center">
      <div className="rounded-xl border border-white/15 bg-white/[.08] px-2 py-3 sm:px-4 sm:py-4">
        <strong className="block font-mono text-2xl font-medium tabular-nums text-white sm:text-4xl">
          {String(value).padStart(2, "0")}
        </strong>
      </div>
      <span className="mt-2 block text-[9px] font-bold uppercase tracking-[.16em] text-emerald-100/65">
        {label}
      </span>
    </div>
  );
}

export default function WaitlistPage() {
  const [countdown, setCountdown] = useState<Countdown>(getCountdown);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hasLaunched = launchDate.getTime() <= Date.now();

  return (
    <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]">
      <section className="relative isolate overflow-hidden bg-[#083d31]">
        <div className="pointer-events-none absolute -right-28 -top-36 size-[30rem] rounded-full border-[36px] border-lime-300/10" />
        <div className="pointer-events-none absolute bottom-[-12rem] left-[-6rem] size-[26rem] rounded-full border-[50px] border-orange-300/10" />

        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-100/75 transition hover:text-lime-300"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </header>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-10 sm:px-8 sm:pb-24 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-20 lg:px-12 lg:pt-20">
          <div className="max-w-xl">
            <div className="mb-7 flex items-center gap-3 text-lime-300">
              <span className="grid size-10 place-items-center rounded-full border border-lime-300/30 bg-lime-300/10">
                <Leaf className="size-5" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[.2em]">
                The next field season
              </span>
            </div>
            <h1 className="max-w-2xl font-serif text-5xl font-medium leading-[.98] tracking-[-.04em] text-white sm:text-7xl">
              Put your place on the map.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-emerald-100/75 sm:text-lg">
              GeoMentor Africa is opening its doors this October. Join the volunteer list for launch news, early access, and ways to help young people discover the biodiversity around them.
            </p>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-emerald-50/80">
              <span className="inline-flex items-center gap-2"><Check className="size-4 text-lime-300" /> Early access updates</span>
              <span className="inline-flex items-center gap-2"><Check className="size-4 text-lime-300" /> Pilot opportunities</span>
              <span className="inline-flex items-center gap-2"><Check className="size-4 text-lime-300" /> No noisy inbox</span>
            </div>
          </div>

          <div className="max-w-xl lg:justify-self-end">
            <div className="border-l border-lime-300/35 pl-5 sm:pl-7">
              <div className="flex items-center gap-2 text-lime-300">
                <CalendarDays className="size-4" />
                <p className="text-[10px] font-black uppercase tracking-[.2em]">Launching October 1, 2026</p>
              </div>
              <h2 className="mt-4 font-serif text-3xl text-white sm:text-4xl">
                {hasLaunched ? "We are live." : "The countdown is on."}
              </h2>
              <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3" aria-label="Countdown to launch">
                <CountdownUnit value={countdown.days} label="Days" />
                <CountdownUnit value={countdown.hours} label="Hours" />
                <CountdownUnit value={countdown.minutes} label="Minutes" />
                <CountdownUnit value={countdown.seconds} label="Seconds" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-20 lg:px-12">
        <div className="lg:pt-5">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">Reserve your place</p>
          <h2 className="mt-3 max-w-md font-serif text-4xl font-medium leading-tight text-emerald-950 sm:text-5xl">
            Be there when the map comes alive.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
            Tell us how you would like to take part. Schools, educators, mentors, partners, experts, and volunteers are all welcome.
          </p>
          <div className="mt-8 flex items-start gap-3 border-t border-[#dfe6df] pt-5 text-xs leading-5 text-slate-500">
            <MapPinned className="mt-0.5 size-4 shrink-0 text-orange-600" />
            <span>Built for local knowledge, practical learning, and visible impact across Africa.</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dfe6df] bg-white p-5 shadow-[0_12px_40px_rgba(33,65,54,.07)] sm:p-8">
          <WaitlistForm />
        </div>
      </section>

      <footer className="border-t border-[#dfe6df] px-5 py-6 text-center text-xs text-slate-500 sm:px-8">
        <p>GeoMentor Africa · Map what lives. Grow what matters.</p>
      </footer>
    </main>
  );
}
