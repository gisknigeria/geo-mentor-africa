"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { WaitlistForm } from "../components/WaitlistForm";
import { Logo } from "../../components/app/logo";

const launchDate = new Date("2026-10-10T10:00:00+01:00");
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
      <section className="relative isolate min-h-[80vh] max-h-[90vh] overflow-hidden bg-[#083d31]">
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
          <div className="absolute inset-0 bg-[#063d31]/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#063d31]/78 via-[#063d31]/50 to-[#063d31]/24" />
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

        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-10 pt-8 sm:px-8 sm:pb-16 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-16 lg:px-12 lg:pt-14">
          <div className="max-w-xl">

            <h1 className="max-w-2xl font-serif text-5xl font-medium leading-[.95] tracking-[-.04em] text-white sm:text-6xl lg:text-7xl">
              Volunteer with <span className="whitespace-nowrap text-lime-300">GeoMentor Africa</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm font-semibold leading-6 text-emerald-100/90 sm:text-base">
              A pan-African volunteer network transforming knowledge, mentorship
              and geospatial expertise into measurable action.
            </p>
           
          

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-emerald-50/80">
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-lime-300" /> Early access updates
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-lime-300" /> Pilot opportunities
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-lime-300" /> Seat on the Technical Working Group
              </span>
            </div>
            <Link
              href="#twg-form"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-emerald-950 transition hover:bg-white"
            >
              Join GeoMentor Africa
            </Link>
          </div>

          <div className="max-w-xl lg:justify-self-end">
            <div className="border-l border-lime-300/35 pl-5 sm:pl-7">
              <div className="flex items-center gap-2 text-lime-300">
                <CalendarDays className="size-4" />
                <p className="text-lg font-black uppercase tracking-[.2em]">
                  Launch Date
                </p>
              </div>
              <h2 className="mt-4 font-serif text-3xl text-white sm:text-4xl">
                {hasLaunched ? "We are live." : "30-day countdown."}
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

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-[10px] sm:px-8 sm:py-[10px] lg:grid-cols-[.8fr_1.2fr] lg:gap-20 lg:px-12">
        <div className="lg:pt-5">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">
            Thank You for Stepping Forward
          </p>
          <h2 className="mt-3 max-w-md font-serif text-4xl font-medium leading-tight text-emerald-950 sm:text-5xl">
Every meaningful journey begins with a first step.
          </h2>
           <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100/75 sm:text-base">
              GeoMentor Africa brings together professionals, young people,
              schools, institutions and partners to advance mentorship,
              geography, biodiversity intelligence and green enterprise
              development across Africa.
            </p>
<h3 className="font-serif text-2xl text-emerald-950">            30-Day Countdown
          </h3>
          <div className="mt-5 max-w-xl space-y-5 text-sm leading-7 text-slate-600">
            <p>
              The 30-Day Countdown is GeoMentor Africa&apos;s mobilisation and
              onboarding phase for its Technical Working Groups (TWGs), taking
              place before the official launch and implementation of the
              GeoMentor Africa Five-Year Strategic Plan.
            </p>
            <p>
              During these 30 days, members will be matched to the right TWGs,
              aligned with strategic priorities, assigned clear roles and
              prepared to begin implementation immediately after the plan is
              officially launched.
            </p>
              <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100/75 sm:text-base">
              Contribute your expertise. Join a Technical Working Group.
              Collaborate on practical initiatives. Help turn local knowledge
              into scalable solutions and lasting impact.
            </p>

            <div>
              <h3 className="font-serif text-2xl text-emerald-950">
                What happens after I register?
              </h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 marker:font-bold marker:text-emerald-700">
                <li><strong>Register:</strong> Share your expertise, interests and preferred area of contribution.</li>
                <li><strong>Profile Review:</strong> We identify where your experience can create the greatest value.</li>
                <li><strong>Role Matching:</strong> Your skills are aligned with a suitable strategic role.</li>
                <li><strong>TWG Placement:</strong> You are matched with the most relevant Technical Working Group.</li>
                <li><strong>Welcome &amp; Onboarding:</strong> Meet your team, understand the strategic priorities and prepare for implementation.</li>
                <li><strong>Activate &amp; Participate:</strong> Begin contributing to programmes, projects, partnerships and measurable results under the Five-Year Strategic Plan.</li>
              </ol>
            </div>

            <div>
              <h3 className="font-serif text-2xl text-emerald-950">
                Participation Pathways
              </h3>
              <p className="mt-3">
                Contributors may select one additional role based on their
                expertise, interests, resources and level of commitment.
              </p>
              <ol className="mt-3 list-decimal space-y-3 pl-5 marker:font-bold marker:text-emerald-700">
                <li><strong>Geo-Mentor:</strong> Provides outreach services to schools through School Adoption, Mentorship, Education, Training and Knowledge Sharing.</li>
                <li><strong>Knowledge Expert:</strong> Provides research, scientific expertise and data validation to strengthen the platform&apos;s Knowledge and Intelligence Engine.</li>
                <li><strong>Industry Mentor:</strong> A professional, entrepreneur, business leader or industry specialist who provides Industry Access &amp; Collaboration by connecting participants to practical experience, innovation, enterprise and career opportunities.</li>
              </ol>
              <p className="mt-4">
                <strong>Geo-Partner &amp; Institutional Collaboration:</strong>{" "}
                An individual, organisation, institution, company, government
                agency, university, professional body, donor, foundation or
                development partner that supports GeoMentor Africa through
                resources, expertise, technology, funding, partnerships or
                institutional support.
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 marker:font-bold marker:text-emerald-700">
                <li>Technology &amp; Research Support and Development</li>
                <li>Resource Mobilisation, Funding and Sponsorship</li>
                <li>Products/Materials &amp; In-Kind Support</li>
                <li>Advocacy &amp; Programme Support</li>
                <li>Market Access &amp; Enterprise Development</li>
              </ol>
            </div>
          </div>
        </div>

        <div
          id="twg-form"
          className="rounded-2xl border border-[#dfe6df] bg-white p-5 shadow-[0_12px_40px_rgba(33,65,54,.07)] sm:p-8"
        >
          <WaitlistForm />
        </div>
      </section>

      <footer className="border-t border-[#dfe6df] px-5 py-6 text-center text-xs text-slate-500 sm:px-8">
        <p>GeoMentor Africa · Map what lives. Grow what matters.</p>
      </footer>
    </main>
  );
}
