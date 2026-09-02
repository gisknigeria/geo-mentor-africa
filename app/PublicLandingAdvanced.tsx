"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Check,
  Leaf,
  Map as MapIcon,
  Users,
  BarChart3,
  Sparkles,
  Binoculars,
  Microscope,
  TreePine,
  Camera,
  Droplets,
  Award,
  Handshake,
  TrendingUp,
  School,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WaitlistForm } from "./components/WaitlistForm";
import { StudentObservationMap } from "./map/StudentObservationMap";

type Impact = {
  schools: number;
  countries: number;
  observations: number;
  media_uploads: number;
  verified_observations: number;
  awaiting_review: number;
};

type BiodiversityRecord = {
  id: string;
  common: string;
  scientific: string;
  category: string;
  school: string;
  place: string;
  status: string;
  hasEvidence: boolean;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
};

const stockHeroVideoUrl = process.env.NEXT_PUBLIC_FEATURED_VIDEO_URL || "https://videos.pexels.com/video-files/857195/857195-hd_1920_1080_30fps.mp4";

const heroSlides = [
  { type: "video", label: "GeoMentor fieldwork", alt: "Stock video of environmental fieldwork" },
  { type: "image", src: "/biodiversity-fieldwork.png", label: "Learning in the field", alt: "Students and a mentor documenting biodiversity in a school garden" },
  { type: "image", src: "/og.png", label: "Mapping what matters", alt: "GeoMentor Africa biodiversity programme" },
] as const;

export function PublicLandingAdvanced() {
  const [scrolled, setScrolled] = useState(false);
  const [impact, setImpact] = useState<Impact | null>(null);
  const [biodiversityRecords, setBiodiversityRecords] = useState<BiodiversityRecord[]>([]);
  const [liveDataLoading, setLiveDataLoading] = useState(true);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadLiveData = async () => {
      try {
        const [impactResponse, observationsResponse] = await Promise.all([
          fetch("/api/public/impact"),
          fetch("/api/public/observations"),
        ]);
        if (impactResponse.ok) setImpact(await impactResponse.json());
        if (observationsResponse.ok) {
          const result = await observationsResponse.json();
          setBiodiversityRecords(result.records ?? []);
        }
      } finally {
        setLiveDataLoading(false);
      }
    };
    loadLiveData();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm"
            : "bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-2xl font-bold text-emerald-800">
            <Leaf className="size-6" />
            GeoMentor Africa
          </Link>
          <div className="flex min-w-0 items-center gap-5 overflow-x-auto whitespace-nowrap text-xs font-bold text-slate-600 sm:gap-7 sm:text-sm">
            <Link href="/" className="text-emerald-700 transition hover:text-emerald-800">Home</Link>
            <Link href="/about" className="transition hover:text-emerald-700">About</Link>
            <Link href="/lab" className="transition hover:text-emerald-700">Lab</Link>
            <Link href="/green-biz" className="transition hover:text-emerald-700">Green Biz</Link>
            <Link href="/activities" className="transition hover:text-emerald-700">Activities</Link>
            <Link href="/support" className="transition hover:text-emerald-700">Support/Fund</Link>
            <Link href="/volunteer" className="transition hover:text-emerald-700">Volunteer</Link>
            <Link href="#waitlist" className="shrink-0 rounded-lg bg-emerald-700 px-4 py-2.5 text-white transition hover:bg-emerald-800">Join the programme</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-emerald-950 px-6 pb-20 pt-32 lg:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(66,153,116,.34),transparent_36%),linear-gradient(135deg,#062f26,#0b4436_55%,#123f36)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
          <div>
            <div className="mb-5 flex items-center gap-2 text-lime-200">
              <Sparkles className="size-5 text-lime-300" />
              <span className="text-sm font-bold uppercase tracking-[.2em]">A biodiversity intelligence platform</span>
            </div>
            <h1 className="max-w-2xl text-6xl font-black leading-[.9] tracking-tight text-white sm:text-8xl">
              GeoMentor Africa
            </h1>
            <h2 className="mt-6 max-w-2xl text-3xl font-medium leading-tight tracking-tight text-emerald-50 sm:text-5xl">
              Learning from Africa&apos;s living systems.
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-emerald-50">
              GeoMentor Africa brings together biodiversity fieldwork, GIS mapping, mentors, expert validation and decision intelligence in one coordinated platform.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="#waitlist" className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-7 py-4 font-bold text-emerald-950 shadow-lg transition hover:bg-lime-200">
                Join the programme <ArrowRight className="size-5" />
              </Link>
              <Link href="/about" className="inline-flex items-center justify-center rounded-xl px-7 py-4 font-bold text-white ring-1 ring-white/40 transition hover:bg-white/10">
                What we do
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/15 pt-7 sm:grid-cols-4 lg:grid-cols-2">
              {[
                { number: impact ? impact.schools.toLocaleString() : "--", label: "Verified schools" },
                { number: impact ? impact.countries.toLocaleString() : "--", label: "Countries" },
                { number: impact ? impact.observations.toLocaleString() : "--", label: "Observations" },
                { number: impact ? impact.verified_observations.toLocaleString() : "--", label: "Expert-verified" },
              ].map(({ number, label }) => <div key={label}><div className="text-2xl font-bold text-lime-300">{number}</div><p className="mt-1 text-xs text-emerald-200">{label}</p></div>)}
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/20 bg-emerald-900 shadow-2xl shadow-black/30">
            {heroSlides[activeHeroSlide].type === "video" ? (
              <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster="/biodiversity-fieldwork.png" aria-label={heroSlides[activeHeroSlide].alt}>
                <source src={stockHeroVideoUrl} type="video/mp4" />
                <track kind="captions" src="/hero-video.vtt" srcLang="en" label="English" />
              </video>
            ) : (
              <Image src={heroSlides[activeHeroSlide].src} alt={heroSlides[activeHeroSlide].alt} fill className="object-cover" priority={activeHeroSlide === 1} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-transparent to-emerald-950/10" />
            <div className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-5">
              <div><p className="text-xs font-black uppercase tracking-[.2em] text-lime-300">Field note</p><p className="mt-2 text-2xl font-bold text-white">{heroSlides[activeHeroSlide].label}</p></div>
              <div className="flex gap-2" aria-label="Hero media slides">
                {heroSlides.map((slide, index) => <button key={slide.label} type="button" onClick={() => setActiveHeroSlide(index)} aria-label={`Show ${slide.label}`} className={`size-3 rounded-full border border-white transition ${index === activeHeroSlide ? "bg-lime-300" : "bg-white/40 hover:bg-white/70"}`} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FIELDWORK MEDIA */}
      <section id="media" className="bg-emerald-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-lime-300">Fieldwork gallery</p>
              <h2 className="text-4xl font-bold sm:text-5xl">See the work behind the data.</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-emerald-100">Students, teachers and GeoMentors turn places they know into evidence, stories and action.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-emerald-800 bg-emerald-900">
              {stockHeroVideoUrl ? (
                <video className="absolute inset-0 h-full w-full object-cover" controls preload="metadata" poster="/biodiversity-fieldwork.png">
                  <source src={stockHeroVideoUrl} type="video/mp4" />
                  <track kind="captions" src="/hero-video.vtt" srcLang="en" label="English" />
                  Your browser does not support the video element.
                </video>
              ) : (
                <div className="absolute inset-0">
                  <Image src="/biodiversity-fieldwork.png" alt="Students and a mentor documenting biodiversity in a school garden" fill className="object-cover opacity-70" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent" />
                  <div className="absolute inset-x-7 bottom-7">
                    <div className="mb-4 grid size-14 place-items-center rounded-full bg-lime-300 text-emerald-950"><Camera className="size-6" /></div>
                    <h3 className="text-2xl font-bold">GeoMentor field stories</h3>
                    <p className="mt-2 max-w-md text-sm text-emerald-100">Featured programme video coming soon. The gallery is ready for your school visits, restoration work and field activities.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <figure className="relative min-h-[170px] overflow-hidden rounded-2xl border border-emerald-800 bg-emerald-900">
                <Image src="/biodiversity-fieldwork.png" alt="Biodiversity fieldwork in a school garden" fill className="object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950 p-5 pt-12 text-sm font-bold">Learning in the field</figcaption>
              </figure>
              <figure className="relative min-h-[170px] overflow-hidden rounded-2xl border border-emerald-800 bg-emerald-900">
                <Image src="/og.png" alt="GeoMentor Africa biodiversity programme" fill className="object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950 p-5 pt-12 text-sm font-bold">Mapping what matters</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* LAB SECTION */}
      <section id="lab" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              Biodiversity Lab
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The integrated workspace for mapping, monitoring and managing biodiversity and conservation activities across Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapIcon,
                title: "Activity Map",
                description: "Real-time visualization of schools, gardens, activities and observations",
              },
              {
                icon: TreePine,
                title: "School Boundaries",
                description: "Map school premises, conservation areas and green spaces",
              },
              {
                icon: Binoculars,
                title: "Garden Mapping",
                description: "Track garden boundaries, planting areas and monitoring points",
              },
              {
                icon: BarChart3,
                title: "Bio-Tracker Dashboard",
                description: "Monitor biodiversity observations in real time",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition"
              >
                <Icon className="size-12 text-emerald-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BIODIVERSITY TRACKING */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              Biodiversity Tracking
            </h2>
            <p className="text-xl text-slate-600">
              Capture, verify and monitor plants, animals and microbes with geotagged evidence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: TreePine,
                title: "Plants",
                color: "bg-emerald-50 border-emerald-200",
                features: [
                  "Species identification",
                  "Growth monitoring",
                  "Flowering & fruiting",
                  "Biomass estimation",
                ],
              },
              {
                icon: Binoculars,
                title: "Animals",
                color: "bg-amber-50 border-amber-200",
                features: [
                  "Wildlife tracking",
                  "Habitat mapping",
                  "Population monitoring",
                  "Behavioral patterns",
                ],
              },
              {
                icon: Microscope,
                title: "Microbial",
                color: "bg-blue-50 border-blue-200",
                features: [
                  "Soil health",
                  "Nutrient analysis",
                  "Microbial diversity",
                  "Ecosystem indicators",
                ],
              },
            ].map(({ icon: Icon, title, color, features }) => (
              <div key={title} className={`p-8 rounded-2xl border-2 ${color}`}>
                <Icon className="size-12 text-slate-900 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{title}</h3>
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex gap-3 items-center text-slate-700">
                      <Check className="size-5 text-emerald-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-gradient-to-br from-slate-50 to-emerald-50 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Long-term Monitoring</h3>
            <p className="text-slate-600 mb-6">
              Track the same species and habitats over time. Build longitudinal datasets that reveal ecological trends, conservation progress and ecosystem health.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Timeline", value: "Years of data" },
                { label: "Coverage", value: "Every location" },
                { label: "Purpose", value: "Scientific evidence" },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">{label}</p>
                  <p className="text-lg font-bold text-emerald-700">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LIVE BIODIVERSITY MAP & CARDS */}
      <section id="biodiversity" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              Live Biodiversity Records
            </h2>
            <p className="text-xl text-slate-600">
              Real observations from schools across Africa
            </p>
          </div>

          {/* Interactive Map Section */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl mb-12 bg-white">
            <div className="relative h-[420px] w-full bg-emerald-50">
              <StudentObservationMap
                observations={biodiversityRecords.map((record) => ({
                  id: record.id,
                  label: `${record.common} · ${record.school}`,
                  latitude: record.latitude,
                  longitude: record.longitude,
                }))}
                selectedId={null}
                onSelect={() => undefined}
                onMove={() => undefined}
              />
              <div className="pointer-events-none absolute left-4 top-4 z-[400] rounded-xl border border-white/80 bg-white/95 px-4 py-3 shadow-lg">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Live biodiversity map</p>
                <p className="mt-1 text-sm text-slate-600">
                  {liveDataLoading ? "Loading monitoring locations..." : `${biodiversityRecords.length} public observation locations`}
                </p>
              </div>
            </div>
          </div>

          {/* Biodiversity Cards Grid */}
          {biodiversityRecords.length === 0 && !liveDataLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
              Live observations will appear here as schools begin capturing biodiversity evidence.
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {biodiversityRecords.slice(0, 8).map((record) => (
              <div
                key={record.id}
                className="group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-xl hover:border-emerald-300 transition"
              >
                {/* Image Area */}
                <div className="relative aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-7xl group-hover:scale-105 transition overflow-hidden">
                  {record.imageUrl ? <Image src={record.imageUrl} alt={record.common} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" /> : <Leaf className="size-16 text-emerald-700" />}
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {record.common}
                      </h3>
                      <p className="text-xs italic text-slate-500 mt-1">
                        {record.scientific}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        record.status === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {record.status === "VERIFIED" ? "✓ VERIFIED" : "⏳ PENDING"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <p className="text-slate-600">
                      <strong className="text-slate-700">{record.school}</strong>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1">
                      <MapIcon className="size-3" />
                      {record.place || "Location withheld"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.category === "Plants"
                          ? "bg-green-100 text-green-800"
                          : record.category === "Animals"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {record.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Captured record
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 bg-emerald-950 text-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-start">
          <div>
            <p className="text-lime-300 font-bold uppercase tracking-[0.2em] text-sm mb-4">About GeoMentor Africa</p>
            <h2 className="text-5xl font-bold mb-6">A learning network built from real places and real evidence.</h2>
            <p className="text-emerald-100 text-lg leading-relaxed mb-6">
              GeoMentor Africa connects schools, mentors, researchers and partners around one shared goal: helping young people understand and protect the living systems around them.
            </p>
            <p className="text-emerald-200 leading-relaxed">
              Students capture observations in the field. Mentors support better questions and projects. Experts validate the evidence. The platform turns that growing body of work into useful intelligence for conservation, agriculture and local decision-making.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: School, title: "School-led", text: "Learning begins in school grounds, gardens and nearby habitats." },
              { icon: Camera, title: "Evidence-first", text: "Every record is tied to an observation, place and review status." },
              { icon: Users, title: "Community-powered", text: "Mentors and experts add guidance and scientific trust." },
              { icon: TrendingUp, title: "Actionable", text: "Insights help communities plan practical conservation action." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="border border-emerald-800 bg-emerald-900/60 p-5 rounded-xl">
                <Icon className="size-8 text-lime-300 mb-4" />
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-emerald-200 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DATA INTELLIGENCE */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              Data Intelligence Engine
            </h2>
            <p className="text-xl text-slate-600">
              Transform field observations into actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* AI Analytics */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center gap-4 mb-6">
                <Sparkles className="size-10 text-blue-600" />
                <h3 className="text-2xl font-bold text-slate-900">AI Analytics</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Species identification",
                  "Ecological interpretation",
                  "Plant condition assessment",
                  "Risk detection",
                  "Pattern & trend analysis",
                  "Recommended actions",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <Check className="size-5 text-blue-600 shrink-0 mt-1" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-600 mt-6 italic">
                AI provides scale • Experts provide trust and validation
              </p>
            </div>

            {/* Expert Validation */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="flex items-center gap-4 mb-6">
                <Users className="size-10 text-emerald-600" />
                <h3 className="text-2xl font-bold text-slate-900">Expert Validation</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Confirm species identification",
                  "Correct uncertain records",
                  "Provide scientific interpretation",
                  "Contribute local knowledge",
                  "Validate recommendations",
                  "Build scientific trust",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <Check className="size-5 text-emerald-600 shrink-0 mt-1" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-600 mt-6 italic">
                Registered experts review and validate all observations
              </p>
            </div>
          </div>

          {/* Intelligence Products */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Binoculars,
                title: "Agrobiodiversity Intelligence",
                description: "Plants, animals, distribution, ecological relationships and conservation relevance",
              },
              {
                icon: Droplets,
                title: "Soil & Nutrient Intelligence",
                description: "Soil conditions, nutrient requirements, plant health and management needs",
              },
              {
                icon: TrendingUp,
                title: "Agribusiness Intelligence",
                description: "Products, opportunities, value chains and market potential",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition">
                <Icon className="size-10 text-emerald-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVITIES & OPPORTUNITIES */}
      <section id="activities" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              Get Involved
            </h2>
            <p className="text-xl text-slate-600">
              Multiple ways to participate and create impact
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "School",
                title: "Schools",
                description: "Join the programme, build biodiversity estates",
                color: "from-blue-50 to-blue-100",
                borderColor: "border-blue-200",
              },
              {
                icon: "Users",
                title: "Mentors",
                description: "Adopt schools, guide field learning",
                color: "from-emerald-50 to-emerald-100",
                borderColor: "border-emerald-200",
              },
              {
                icon: "Handshake",
                title: "Partners",
                description: "Fund conservation goals with impact",
                color: "from-amber-50 to-amber-100",
                borderColor: "border-amber-200",
              },
              {
                icon: "Award",
                title: "Experts",
                description: "Validate observations and research",
                color: "from-purple-50 to-purple-100",
                borderColor: "border-purple-200",
              },
            ].map(({ icon, title, description, color, borderColor }) => {
              const iconMap: Record<string, LucideIcon> = {
                School,
                Users,
                Handshake,
                Award,
              };
              const Icon = iconMap[icon];
              return (
                <div
                  key={title}
                  className={`p-6 rounded-2xl bg-gradient-to-br ${color} border-2 ${borderColor} hover:shadow-lg transition`}
                >
                  <Icon className="size-10 text-slate-900 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-700 mb-4">{description}</p>
                  <Link
                    href="#waitlist"
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    Learn more <ArrowRight className="size-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WAITLIST SECTION */}
      <section id="waitlist" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold text-slate-900 mb-6">
                Ready to transform field learning?
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Join schools, mentors, partners and experts who are building a biodiversity programme 
                that works across Africa.
              </p>

              <ul className="space-y-4 mb-12">
                {[
                  "Early access to the complete platform",
                  "Priority mentor matching and onboarding",
                  "Exclusive partnership opportunities",
                  "Featured in launch communications",
                  "Direct support from our team",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-center">
                    <Check className="size-6 text-emerald-600 shrink-0" />
                    <span className="text-lg text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="p-6 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                <p className="text-sm text-emerald-900">
                  <strong>Pilot Programme:</strong> We&apos;re currently testing in select African schools. Early adopters get VIP support and shape the platform&apos;s development.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Join our waiting list
              </h3>
              <p className="text-slate-600 mb-8">
                A few details and you&apos;re in.
              </p>
              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-white mb-4">
                <Leaf className="size-5" />
                GeoMentor Africa
              </div>
              <p className="text-sm">
                Connecting schools with mentors to transform field learning, biodiversity conservation and environmental intelligence across Africa.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/lab" className="hover:text-white transition">Lab</Link></li>
                <li><Link href="/green-biz" className="hover:text-white transition">Green Biz</Link></li>
                <li><Link href="/activities" className="hover:text-white transition">Activities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">For</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/support" className="hover:text-white transition">Support/Fund</Link></li>
                <li><Link href="/volunteer" className="hover:text-white transition">Volunteer</Link></li>
                <li><Link href="/#waitlist" className="hover:text-white transition">Join the programme</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/#waitlist" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/activities" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
            <p>© 2024 GeoMentor Africa. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link href="/trust" className="hover:text-white transition">Privacy</Link>
              <Link href="/trust" className="hover:text-white transition">Terms</Link>
              <Link href="/trust" className="hover:text-white transition">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
