"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Binoculars,
  Database,
  Globe2,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

type Impact = {
  schools: number;
  countries: number | null;
  observations: number;
  media_uploads: number;
  verified_observations: number;
  awaiting_review: number;
  updated_at: string;
};

const metrics: Array<{ key: keyof Impact; label: string; detail: string }> = [
  {
    key: "schools",
    label: "Verified schools",
    detail: "approved programme members",
  },
  {
    key: "observations",
    label: "Field records",
    detail: "submitted biodiversity observations",
  },
  {
    key: "media_uploads",
    label: "Evidence uploads",
    detail: "photographs attached to records",
  },
  {
    key: "verified_observations",
    label: "Verified records",
    detail: "completed human review",
  },
];

export function LiveHomeHero() {
  const [impact, setImpact] = useState<Impact | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/public/impact", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setImpact((await response.json()) as Impact);
      })
      .catch(() => setError(true));
    return () => controller.abort();
  }, []);
  return (
    <section className="relative isolate overflow-hidden bg-[#062d25] text-white">
      <img
        src="/biodiversity-fieldwork.png"
        alt="A student and teacher documenting biodiversity in a supervised school garden"
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,42,34,.98),rgba(5,42,34,.9)_52%,rgba(5,42,34,.76))]" />
      <div className="relative mx-auto grid min-h-[690px] max-w-[1440px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.02fr_.98fr]">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black tracking-[.18em] text-lime-200">
            Home
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl xl:text-[5.4rem]">
            Overview of GeoMentor Africa
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50/75 sm:text-lg">
            Home: Overview of GeoMentor Africa, key programmes, impact indicators and latest activities.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-7 text-emerald-50/75 sm:text-lg">
            GeoMentor Africa connects schools, students, teachers, Geo-Mentors
            and partners through field observation, GIS mapping, expert review
            and measurable conservation action.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register?role=school"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-lime-300 px-6 text-sm font-black text-white"
            >
              Register a school <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/observations"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/20 bg-black/10 px-6 text-sm font-bold"
            >
              <Binoculars className="size-4" />
              Explore live records
            </Link>
          </div>
        
        </div>
        <div className="relative lg:pl-8">
          <div className="pointer-events-none absolute -left-10 -top-12 grid size-52 place-items-center rounded-full border border-lime-200/15 bg-emerald-900/30 shadow-[0_0_100px_rgba(193,224,100,.12)]">
            <div className="absolute inset-3 animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-lime-200/25" />
            <Globe2 className="size-32 animate-[pulse_4s_ease-in-out_infinite] text-lime-200/80" />
            <span className="absolute left-2 top-1/2 size-2 animate-pulse rounded-full bg-lime-300" />
            <span className="absolute right-5 top-10 size-1.5 animate-pulse rounded-full bg-lime-300 [animation-delay:1s]" />
          </div>
          <div className="relative mt-24 overflow-hidden rounded-2xl border border-white/15 bg-[#06271f]/85 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[9px] font-black tracking-[.17em] text-lime-200">
                  WHAT IS ON THE GROUND
                </p>
                <h2 className="mt-1 font-serif text-2xl">
                  Live programme evidence
                </h2>
              </div>
              <span
                className={`flex items-center gap-2 text-[9px] font-bold ${error ? "text-amber-300" : "text-emerald-100/55"}`}
              >
                <i
                  className={`size-2 rounded-full ${impact ? "animate-pulse bg-lime-300" : error ? "bg-amber-300" : "animate-pulse bg-slate-400"}`}
                />
                {impact ? "LIVE" : error ? "UNAVAILABLE" : "CONNECTING"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10">
              {metrics.map(({ key, label, detail }) => (
                <article key={key} className="bg-[#0c3b30] p-4 sm:p-5">
                  <strong className="font-serif text-3xl text-white sm:text-4xl">
                    {impact ? formatMetric(Number(impact[key])) : "—"}
                  </strong>
                  <span className="mt-2 block text-[10px] font-black uppercase tracking-wide text-lime-200">
                    {label}
                  </span>
                  <small className="mt-1 block text-[8px] leading-4 text-emerald-100/45">
                    {detail}
                  </small>
                </article>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-[9px] text-emerald-100/45">
              <span className="flex items-center gap-2">
                <Database className="size-3.5" />
                Supabase production records
              </span>
              {impact?.updated_at && (
                <time dateTime={impact.updated_at}>
                  Updated{" "}
                  {new Date(impact.updated_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatMetric(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}
