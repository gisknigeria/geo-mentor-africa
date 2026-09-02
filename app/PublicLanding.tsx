"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Binoculars,
  Camera,
  Check,
  FlaskConical,
  Handshake,
  Leaf,
  MapPinned,
  Microscope,
  School,
  Sparkles,
  Sprout,
  TreePine,
  UserRoundCheck,
} from "lucide-react";
import { LandingHeader } from "./LandingHeader";
import { LiveHomeHero } from "./LiveHomeHero";
import { LiveSchoolMap } from "./LiveSchoolMap";

type PublicImpact = {
  schools: number;
  countries: number | null;
  observations: number;
  media_uploads: number;
  verified_observations: number;
  awaiting_review: number;
  updated_at: string;
};

type PublicObservation = {
  id: string;
  common: string;
  scientific: string;
  category: "Plants" | "Animals" | "Microbial";
  school: string;
  place: string;
  date: string;
  note: string;
};

const roles = [
  {
    title: "Schools",
    eyebrow: "OWN THE LEARNING ENVIRONMENT",
    icon: School,
    href: "/register?role=school",
    text: "Register the institution, onboard teachers and students, create field tasks, review evidence and track a living school biodiversity estate.",
    actions: [
      "Primary, secondary & tertiary",
      "Teacher-managed student access",
      "Tasks, gardens, trees & carbon estimates",
    ],
  },
  {
    title: "Geo-Mentors",
    eyebrow: "ADOPT · GUIDE · VERIFY",
    icon: UserRoundCheck,
    href: "/register?role=mentor",
    text: "Graduates, researchers and industry professionals adopt nearby schools, strengthen AI suggestions and guide supervised field learning.",
    actions: [
      "Discover schools by location",
      "Review records and join discussions",
      "Report workshops, GIS Day & field sessions",
    ],
  },
  {
    title: "Geo-Partners",
    eyebrow: "FUND VISIBLE OUTCOMES",
    icon: Handshake,
    href: "/partner",
    text: "Institutions and sponsors fund excursions, seeds, equipment, scholarships and conservation campaigns with geotagged proof of impact.",
    actions: [
      "Sponsor a school or campaign",
      "Fund items or recurring programmes",
      "Follow milestones and public impact reports",
    ],
  },
];

const quickAccess = [
  {
    title: "Become a Mentor",
    href: "/register?role=mentor",
    text: "Guide students, review biodiversity records and strengthen field learning at participating schools.",
  },
  {
    title: "Find or Adopt a School",
    href: "/register?role=school",
    text: "Connect schools with mentors, partners and resources for conservation and field activities.",
  },
  {
    title: "View Activities",
    href: "/observations",
    text: "Explore fieldwork, biodiversity records, programme updates and school-level engagement.",
  },
  {
    title: "Awards & Recognition",
    href: "/partner",
    text: "See the impact, innovations, achievements and recognition that celebrate programme success.",
  },
];

const partnerLogos = [
  "Schools",
  "Universities",
  "Conservation Groups",
  "Technology Partners",
  "Professional Bodies",
  "Sponsors",
];

const workflow = [
  {
    title: "Capture",
    text: "Photograph a plant or animal. The field app attaches time and location with consent-aware precision.",
    icon: Camera,
  },
  {
    title: "Understand",
    text: "AI returns a suggested identity and useful context—clearly labelled as a suggestion, never a verified fact.",
    icon: Sparkles,
  },
  {
    title: "Review",
    text: "A teacher checks the student evidence, then a Geo-Mentor or specialist confirms, corrects or escalates it.",
    icon: BadgeCheck,
  },
  {
    title: "Act",
    text: "The record becomes part of a school habitat map, a mission, a planting plan or a funded conservation goal.",
    icon: MapPinned,
  },
];

export function PublicLanding() {
  const [impact, setImpact] = useState<PublicImpact | null>(null);
  const [recentRecords, setRecentRecords] = useState<PublicObservation[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.all([
      fetch("/api/public/impact", {
        signal: controller.signal,
        cache: "no-store",
      }),
      fetch("/api/public/observations", {
        signal: controller.signal,
        cache: "no-store",
      }),
    ])
      .then(async ([impactResponse, observationResponse]) => {
        const impactData = impactResponse.ok
          ? ((await impactResponse.json()) as PublicImpact)
          : null;
        const observationData = observationResponse.ok
          ? ((await observationResponse.json()) as {
              records?: PublicObservation[];
            })
          : null;

        setImpact(impactData);
        setRecentRecords((observationData?.records ?? []).slice(0, 4));
      })
      .catch(() => {
        setImpact(null);
        setRecentRecords([]);
      });

    return () => controller.abort();
  }, []);

  const summaryStats = useMemo(
    () => [
      {
        label: "Verified schools",
        value: impact?.schools ?? null,
        detail: "approved programme members",
      },
      {
        label: "Field records",
        value: impact?.observations ?? null,
        detail: "submitted biodiversity observations",
      },
      {
        label: "Images attached",
        value: impact?.media_uploads ?? null,
        detail: "photographs attached to records",
      },
      {
        label: "Expert-reviewed",
        value: impact?.verified_observations ?? null,
        detail: "completed human review",
      },
    ],
    [impact],
  );

  return (
    <main className="min-h-screen bg-[#f2f3ed] text-[#17332c]">
      <LandingHeader />

      <LiveHomeHero />

      <section className="bg-white px-5 py-20 sm:px-8" id="featured-media">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 max-w-2xl">
            <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">
              FEATURED VIDEO AND IMAGE GALLERY
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-emerald-950 sm:text-5xl">
              Mentorship, fieldwork and school impact in action.
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 p-6 shadow-sm">
              <div className="aspect-video rounded-2xl bg-[radial-gradient(circle_at_center,_rgba(163,230,53,0.28),_rgba(5,42,34,0.95)_65%)] p-6">
                <div className="flex h-full items-center justify-center rounded-2xl border border-white/15 bg-black/15 text-center">
                  <div>
                    <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 text-lime-200">
                      <ArrowRight className="size-7 rotate-[-45deg]" />
                    </div>
                    <p className="mt-5 text-xs font-black tracking-[.18em] text-lime-200">
                      FEATURED VIDEO
                    </p>
                    <h3 className="mt-3 font-serif text-3xl text-white">
                      A living school biodiversity programme
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Mentors supporting field learning",
                "School biodiversity restoration",
                "Students observing local species",
                "Community conservation in action",
              ].map((label, index) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-[#f4f8f3] p-4">
                  <div className={`mb-4 grid h-28 place-items-center rounded-xl ${index % 2 === 0 ? "bg-[#dfeab2]" : "bg-[#d7e7df]"}`}>
                    <span className="text-[10px] font-black tracking-[.16em] text-emerald-800">
                      {label.split(" ")[0].toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-bold leading-5 text-slate-700">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef3dd] px-5 py-20 sm:px-8" id="quick-access">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 max-w-2xl">
            <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">
              QUICK ACCESS
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-emerald-950 sm:text-5xl">
              Choose the next step in the programme.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickAccess.map(({ title, href, text }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black tracking-[.14em] text-emerald-800">
                  ACTION
                </span>
                <h3 className="mt-4 font-serif text-2xl text-emerald-950">{title}</h3>
                <p className="mt-3 text-xs leading-6 text-slate-600">{text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-black text-emerald-800">
                  Explore <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f7f1] px-5 py-20 sm:px-8" id="impact-tracker">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 max-w-2xl">
            <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">
              LIVE ACTIVITY AND IMPACT TRACKER
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-emerald-950 sm:text-5xl">
              Schools reached, mentors engaged and biodiversity evidence recorded.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {summaryStats.map(({ label, value, detail }) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[9px] font-black tracking-[.16em] text-slate-400">{label}</p>
                <strong className="mt-5 block font-serif text-4xl text-emerald-950">{value}</strong>
                <small className="mt-2 block text-[10px] leading-5 text-slate-500">{detail}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b4436] px-5 py-20 sm:px-8" id="partners-supporters">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 max-w-2xl">
            <p className="text-[10px] font-black tracking-[.18em] text-lime-200">
              PARTNERS AND SUPPORTERS
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
              Strategic partners enabling fieldwork, mentoring and conservation action.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {partnerLogos.map((partner) => (
              <div key={partner} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm font-bold text-emerald-50/80">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8" id="roles">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">
                THREE ROLES. ONE ACCOUNTABLE SYSTEM.
              </p>
              <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight tracking-tight text-emerald-950 sm:text-6xl">
                Designed around how the programme actually works.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 lg:justify-self-start">
              Schools remain responsible for young people and learning.
              Geo-Mentors extend professional capacity. Geo-Partners make
              high-value activities possible. Teachers and students participate
              through their registered school.
            </p>
          </div>
          <div className="mt-10 grid gap-4 xl:grid-cols-3">
            {roles.map(
              ({ title, eyebrow, icon: Icon, text, actions, href }, index) => (
                <article
                  key={title}
                  className={`group flex min-h-[420px] flex-col overflow-hidden rounded-2xl border p-7 transition hover:-translate-y-1 hover:shadow-xl ${index === 1 ? "border-emerald-900 bg-[#0b4436] text-white" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`grid size-12 place-items-center rounded-xl ${index === 1 ? "bg-lime-300 text-emerald-950" : "bg-[#edf4d4] text-emerald-800"}`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span
                      className={`font-mono text-xs ${index === 1 ? "text-emerald-100/45" : "text-slate-300"}`}
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <p
                    className={`mt-7 text-[9px] font-black tracking-[.16em] ${index === 1 ? "text-lime-200" : "text-emerald-700"}`}
                  >
                    {eyebrow}
                  </p>
                  <h3 className="mt-2 font-serif text-3xl">{title}</h3>
                  <p
                    className={`mt-3 text-xs leading-6 ${index === 1 ? "text-emerald-50/65" : "text-slate-500"}`}
                  >
                    {text}
                  </p>
                  <ul
                    className={`mt-6 grid gap-3 border-t pt-5 text-[11px] ${index === 1 ? "border-white/10 text-emerald-50/75" : "border-slate-100 text-slate-600"}`}
                  >
                    {actions.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check
                          className={`mt-0.5 size-3.5 shrink-0 ${index === 1 ? "text-lime-300" : "text-emerald-600"}`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={href}
                    className={`mt-auto flex items-center gap-2 pt-7 text-xs font-black ${index === 1 ? "text-lime-200" : "text-emerald-800"}`}
                  >
                    Enter {title.toLowerCase()} pathway{" "}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </Link>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      {recentRecords.length > 0 && (
        <section
          className="bg-[#eef3dd] px-5 py-20 sm:px-8"
          id="latest-records"
        >
          <div className="mx-auto max-w-[1440px]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">
                  LATEST SCHOOL EVIDENCE
                </p>
                <h2 className="mt-3 font-serif text-4xl leading-tight text-emerald-950 sm:text-5xl">
                  Live biodiversity records from real schools
                </h2>
              </div>
              <Link
                href="/observations"
                className="inline-flex items-center gap-2 text-xs font-black text-emerald-800"
              >
                Browse all records <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-4">
              {recentRecords.map((record) => (
                <article
                  key={record.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black text-emerald-800">
                    {record.category}
                  </span>
                  <h3 className="mt-4 font-serif text-2xl text-emerald-950">
                    {record.common}
                  </h3>
                  <p className="mt-1 text-[10px] italic text-slate-400">
                    {record.scientific}
                  </p>
                  <p className="mt-4 text-[11px] leading-5 text-slate-600">
                    {record.note}
                  </p>
                  <div className="mt-5 border-t border-slate-100 pt-4 text-[9px] text-slate-500">
                    <strong className="block text-emerald-950">
                      {record.school}
                    </strong>
                    <span>{record.place}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white px-5 py-20 sm:px-8" id="impact">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">
                REAL DATA IN MOTION
              </p>
              <h2 className="mt-4 font-serif text-5xl leading-tight text-emerald-950 sm:text-6xl">
                Schools are turning field learning into evidence.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
                Every verified observation, image and review decision joins a
                school's learning trail. The programme moves from classroom
                curiosity to measurable environmental understanding.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryStats.map(({ label, value, detail }) => (
                <article
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-[#f9faf6] p-5"
                >
                  <p className="text-[9px] font-black tracking-[.16em] text-slate-400">
                    {label}
                  </p>
                  <strong className="mt-4 block font-serif text-4xl text-emerald-950">
                    {value}
                  </strong>
                  <small className="mt-2 block text-[10px] leading-5 text-slate-500">
                    {detail}
                  </small>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LiveSchoolMap />

      <section className="bg-white px-5 py-20 sm:px-8" id="lab">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">
                BIODIVERSITY LAB
              </p>
              <h2 className="mt-4 font-serif text-5xl leading-tight text-emerald-950 sm:text-6xl">
                The Biodiversity Lab is the platform’s practical environmental workspace for mapping, monitoring and managing biodiversity and conservation activities.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
                Core functions include:
              </p>
              <ul className="mt-5 max-w-xl space-y-3 text-sm leading-7 text-slate-600">
                <li>1. Activity Map: Displays schools, biodiversity gardens, conservation activities and observations.</li>
                <li>2. School Boundary Mapping: Defines school premises, conservation areas and green spaces.</li>
                <li>3. Conservation Garden Mapping: Records garden boundaries, planting areas, habitats and monitoring points.</li>
                <li>4. Bio-Tracker Dashboard: Enables students, teachers and GeoMentors to monitor plants, animals and other biodiversity observations on the web dashboard.</li>
              </ul>
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">
                  1.3 BIODIVERSITY TRACKING APP
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  The Biodiversity Tracking App supports georeferenced field data collection and long-term monitoring.
                </p>
              </div>
              <div className="mt-9 grid grid-cols-3 gap-2">
                <span className="rounded-xl bg-emerald-950 p-4 text-white">
                  <TreePine className="size-5 text-lime-300" />
                  <b className="mt-5 block font-serif text-2xl">Plants</b>
                </span>
                <span className="rounded-xl bg-[#dce7b1] p-4 text-emerald-950">
                  <Binoculars className="size-5" />
                  <b className="mt-5 block font-serif text-2xl">Animals</b>
                </span>
                <span className="rounded-xl bg-[#dce8e4] p-4 text-emerald-950">
                  <Microscope className="size-5" />
                  <b className="mt-5 block font-serif text-2xl">Microbial</b>
                </span>
              </div>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
              <article className="grid gap-5 bg-[#f8f9f5] p-7 sm:grid-cols-[70px_1fr]">
                <span className="grid size-14 place-items-center rounded-2xl bg-white text-emerald-800 shadow-sm">
                  <Camera className="size-6" />
                </span>
                <div>
                  <span className="font-mono text-[9px] font-black text-slate-400">01</span>
                  <h3 className="mt-1 font-serif text-3xl text-emerald-950">Plant tracking</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    For plants, it can capture species, common and local names, photographs, GPS location, planting date, condition, growth, flowering, fruiting and monitoring history.
                  </p>
                </div>
              </article>
              <article className="grid gap-5 bg-[#f8f9f5] p-7 sm:grid-cols-[70px_1fr]">
                <span className="grid size-14 place-items-center rounded-2xl bg-white text-emerald-800 shadow-sm">
                  <Binoculars className="size-6" />
                </span>
                <div>
                  <span className="font-mono text-[9px] font-black text-slate-400">02</span>
                  <h3 className="mt-1 font-serif text-3xl text-emerald-950">Wildlife tracking</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    For animals and other wildlife, it can capture species, GPS location, date, habitat, number observed and photographs.
                  </p>
                </div>
              </article>
              <article className="grid gap-5 bg-[#f8f9f5] p-7 sm:grid-cols-[70px_1fr]">
                <span className="grid size-14 place-items-center rounded-2xl bg-white text-emerald-800 shadow-sm">
                  <MapPinned className="size-6" />
                </span>
                <div>
                  <span className="font-mono text-[9px] font-black text-slate-400">03</span>
                  <h3 className="mt-1 font-serif text-3xl text-emerald-950">Long-term monitoring</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    The application enables repeated monitoring of the same trees, species and habitats over time, rather than limiting records to one-time planting or observations.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8" id="growth">
        <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-3xl bg-[#0a352c] text-white lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <div className="flex gap-3">
              <Sprout className="size-7 text-lime-300" />
              <Banknote className="size-7 text-lime-300" />
            </div>
            <p className="mt-8 text-[10px] font-black tracking-[.18em] text-lime-200">
              PLANT · MONITOR · VALUE
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              From a seedling to a defensible impact record.
            </h2>
            <p className="mt-5 text-sm leading-7 text-emerald-50/68">
              Schools tag planted trees, record species, date, survival,
              diameter and height, and document harvest or non-timber revenue.
              The platform can estimate biomass and CO₂e for learning and
              planning.
            </p>
            <div className="mt-8 rounded-xl border border-amber-200/20 bg-amber-200/10 p-4 text-xs leading-6 text-amber-50">
              <strong className="block text-amber-200">
                Carbon estimate ≠ carbon credit.
              </strong>
              A saleable credit requires an approved methodology, baseline,
              additionality, leakage and permanence controls, independent
              validation and registry issuance.
            </div>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {[
              {
                title: "Measure",
                text: "Species, planting date, survival, DBH, height and geotagged evidence.",
                icon: TreePine,
              },
              {
                title: "Estimate",
                text: "Species- or region-appropriate allometry → dry biomass → carbon → CO₂e.",
                icon: FlaskConical,
              },
              {
                title: "Verify",
                text: "Versioned assumptions, mentor review and qualified methodology oversight.",
                icon: BadgeCheck,
              },
              {
                title: "Generate value",
                text: "Track fruit, seedlings, ecosystem services, sponsorship and eligible project revenue.",
                icon: Banknote,
              },
            ].map(({ title, text, icon: Icon }) => (
              <article key={title} className="bg-[#103e33] p-7">
                <Icon className="size-6 text-lime-300" />
                <h3 className="mt-7 font-serif text-2xl">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-emerald-50/62">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#dce7b1] px-5 py-20 sm:px-8" id="partners">
        <div className="mx-auto grid max-w-[1440px] items-center gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="text-[10px] font-black tracking-[.18em] text-emerald-800">
              FUND A GOAL. FOLLOW THE LOCATION. SEE THE IMPACT.
            </p>
            <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-tight text-emerald-950 sm:text-6xl">
              Make every contribution visible on the ground.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-950/65">
              Geo-Partners can support a school garden, indigenous trees, field
              equipment, an excursion, mentor teams or student scholarships—then
              follow evidence, milestones and outcomes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/partner"
                className="rounded-md bg-[#0b4436] px-6 py-3.5 text-xs font-black text-white"
              >
                Explore partner opportunities
              </Link>
              <Link
                href="/partner#campaigns"
                className="rounded-md border border-emerald-900/20 bg-white/50 px-6 py-3.5 text-xs font-black text-emerald-950"
              >
                View active goals
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(20,57,45,.12)]">
            <span className="rounded-full bg-emerald-100 px-3 py-2 text-[9px] font-black text-emerald-800">
              EVIDENCE-LED PARTNERSHIP
            </span>
            <h3 className="mt-6 font-serif text-3xl text-emerald-950">
              How funded work becomes accountable
            </h3>
            <div className="mt-6 grid gap-3">
              {[
                "Define the goal and responsible school",
                "Confirm the place and delivery plan",
                "Attach geotagged progress evidence",
                "Publish verified outcomes",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-xl bg-[#f4f6ef] p-4"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-900 font-mono text-[10px] font-black text-lime-200">
                    0{index + 1}
                  </span>
                  <span className="text-xs font-bold text-emerald-950">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#082f27] px-5 py-20 text-white sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-black tracking-[.18em] text-lime-200">
              THE NEXT DISCOVERY CAN START AT YOUR SCHOOL
            </p>
            <h2 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-7xl">
              Build a record of learning, life and measurable care.
            </h2>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-lime-300 px-6 text-xs font-black text-white"
            >
              Choose your role <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/observations"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 px-6 text-xs font-black"
            >
              Explore the map
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#082f27] px-5 py-8 text-emerald-100/55 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 text-xs md:flex-row md:items-center">
          <span className="flex items-center gap-2 font-bold text-white">
            <Leaf className="size-4 text-lime-300" />
            GeoMentor Africa
          </span>
          <p>Mentor. Map. Observe. Conserve.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/observations">Biodiversity</Link>
            <Link href="/partner">Partners</Link>
            <Link href="/pilot">Programme &amp; safety</Link>
            <Link href="/portal">My workspace</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
