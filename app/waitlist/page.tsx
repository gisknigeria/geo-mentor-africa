"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, MapPinned } from "lucide-react";
import { useEffect, useState } from "react";
import { WaitlistForm } from "../components/WaitlistForm";
import { Logo } from "../../components/app/logo";

const launchDate = new Date("2026-10-01T00:00:00+01:00");
const heroImages = [
  {
    src: "/biodiversity-fieldwork.png",
    alt: "Students and a mentor documenting biodiversity in a school garden",
  },
  {
    src: "/og.png",
    alt: "GeoMentor Africa students mapping biodiversity in a garden",
  },
  {
    src: "/school%20awards.jpg",
    alt: "Students celebrating together with school awards and trophies",
  },
  {
    src: "/happy%20students.jpg",
    alt: "Students gathered together outdoors with their mentor",
  },
  {
    src: "/20230522_122641.jpg",
    alt: "Students and a mentor planting a young tree outdoors",
  },
  {
    src: "/20230522_122403%280%29.jpg",
    alt: "Students learning together during an outdoor field activity",
  },
 
  {
    src: "/20170524_155227.jpg",
    alt: "A school group working together during a biodiversity activity",
  },
];

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
  const [activeHeroImage, setActiveHeroImage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroImage((current) => (current + 1) % heroImages.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const hasLaunched =
    countdown.days === 0 &&
    countdown.hours === 0 &&
    countdown.minutes === 0 &&
    countdown.seconds === 0;

  return (
    <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]">
      <section className="relative isolate overflow-hidden bg-[#083d31]">
        <div className="absolute inset-0" aria-hidden="true">
          {heroImages.map((image, index) => (
            <div
              key={image.src}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1800ms] ${
                index === activeHeroImage ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${image.src})` }}
            />
          ))}
          <div className="absolute inset-0 bg-[#063d31]/42" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#063d31]/72 via-[#063d31]/42 to-[#063d31]/15" />
        </div>
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
            
            <h1 className="max-w-2xl font-serif font-medium leading-[.9] tracking-[-.04em] text-white">
              <span className="block text-2xl sm:text-3xl">Volunteer for</span>
              <span className="mt-2 block text-7xl sm:text-9xl">GeoMentor</span>
              <span className="mt-2 block text-5xl text-lime-300 sm:text-7xl">Africa</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-emerald-100/75 sm:text-lg">
              GeoMentor Africa is a volunteer-driven initiative that connects
              local knowledge with practical learning to create visible impact
              across Africa. Join our waitlist to be part of the next field
              season and help us map what lives and grow what matters.
            </p>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-emerald-50/80">
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-lime-300" /> Early access updates
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-lime-300" /> Pilot opportunities
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-lime-300" /> sit on the Technical Working Group
              </span>
            </div>
          </div>

          <div className="max-w-xl lg:justify-self-end">
            <div className="border-l border-lime-300/35 pl-5 sm:pl-7">
              <div className="flex items-center gap-2 text-lime-300">
                <CalendarDays className="size-4" />
                <p className="text-lg font-black uppercase tracking-[.2em]">
                  Launch Date October 1
                </p>
              </div>
              <h2 className="mt-4 font-serif text-3xl text-white sm:text-4xl">
                {hasLaunched ? "We are live." : "30 Days Countdown."}
              </h2>
              <div
                className="mt-6 grid grid-cols-4 gap-2 sm:gap-3"
                aria-label="Countdown to launch"
              >
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
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">
            Thank You for Stepping Forward
          </p>
          <h2 className="mt-3 max-w-md font-serif text-4xl font-medium leading-tight text-emerald-950 sm:text-5xl">
            Every meaningful journey begins with a first step.
          </h2>
          <div className="mt-5 max-w-xl space-y-4 text-sm leading-7 text-slate-600">
            <p>
              GeoMentor Africa responds to a clear opportunity: Africa has the
              world&apos;s largest youth population and globally significant
              biodiversity, yet many young people still have limited access to
              practical conservation, geospatial technology, environmental
              data, and professional mentorship.
            </p>
            <p>
              GeoMentor Africa connects schools and young people with
              professionals, experts, universities, conservation
              organisations, technology companies, and funding partners. The
              programme integrates school adoption, biodiversity monitoring,
              mapping, AI-enabled insights, expert validation, funding, and
              green enterprise development to turn learning into practical,
              measurable action.
            </p>
            <p>
              Thank you for volunteering to help take these ideas and
              commitments forward. As we count down to the official launch of
              the GeoMentor Africa Platform on 1 October 2026, we invite you to
              share your interests, expertise, strengths, and how you would
              like to contribute through mentorship, school adoption,
              biodiversity monitoring, research, technology, training,
              partnerships, funding, or other forms of support.
            </p>
          </div>
          <div className="mt-8 flex items-start gap-3 border-t border-[#dfe6df] pt-5 text-xs leading-5 text-slate-500">
            <MapPinned className="mt-0.5 size-4 shrink-0 text-orange-600" />
            <div>
              <p>The countdown is on.</p>
              <p className="mt-2 font-semibold text-emerald-800">
                Join us as we connect, contribute, and build GeoMentor Africa
                together.
              </p>
            </div>
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
