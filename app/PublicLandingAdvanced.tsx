"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Check,
  Leaf,
  Map as MapIcon,
  Users,
  Zap,
  Globe,
  BarChart3,
  Shield,
  Sparkles,
  Binoculars,
  Microscope,
  TreePine,
  FlaskConical,
  Camera,
  Activity,
  Wind,
  Droplets,
  Award,
  BookOpen,
  Handshake,
  TrendingUp,
  AlertCircle,
  School,
} from "lucide-react";
import { WaitlistForm } from "./components/WaitlistForm";

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

export function PublicLandingAdvanced() {
  const [scrolled, setScrolled] = useState(false);
  const [impact, setImpact] = useState<Impact | null>(null);
  const [biodiversityRecords, setBiodiversityRecords] = useState<BiodiversityRecord[]>([]);
  const [liveDataLoading, setLiveDataLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-700">
            <Leaf className="size-6" />
            GeoMentor Africa
          </Link>
          <div className="hidden lg:flex gap-8 items-center text-sm font-medium">
            <Link href="#lab" className="text-slate-600 hover:text-emerald-700 transition">
              Lab
            </Link>
            <Link href="#biodiversity" className="text-slate-600 hover:text-emerald-700 transition">
              Biodiversity
            </Link>
            <Link href="#about" className="text-slate-600 hover:text-emerald-700 transition">
              About
            </Link>
            <Link href="#activities" className="text-slate-600 hover:text-emerald-700 transition">
              Activities
            </Link>
            <Link href="#waitlist" className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">
              Join Waitlist
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50">
            <Sparkles className="size-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Transforming field learning across Africa</span>
          </div>

          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Connect schools with mentors. <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Map biodiversity. Create impact.
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A platform where schools capture biodiversity evidence, mentors guide field learning, partners fund conservation action, and AI transforms observations into actionable intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="#waitlist"
              className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition inline-flex items-center gap-2 justify-center shadow-lg"
            >
              Join the waiting list
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="#lab"
              className="px-8 py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition"
            >
              Explore the platform
            </Link>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { number: impact ? impact.schools.toLocaleString() : "--", label: "Verified schools" },
              { number: impact ? impact.countries.toLocaleString() : "--", label: "Countries" },
              { number: impact ? impact.observations.toLocaleString() : "--", label: "Observations captured" },
              { number: impact ? impact.verified_observations.toLocaleString() : "--", label: "Expert-verified" },
            ].map(({ number, label }) => (
              <div key={label} className="p-4 rounded-lg bg-white border border-slate-200">
                <div className="text-2xl font-bold text-emerald-600">{number}</div>
                <p className="text-xs text-slate-600 mt-1">{label}</p>
              </div>
            ))}
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
            <div className="aspect-video bg-gradient-to-br from-emerald-100 via-teal-100 to-blue-100 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#0b4436_1px,_transparent_1px)] [background-size:24px_24px]" />
              {biodiversityRecords.map((record) => (
                <span
                  key={record.id}
                  className="absolute size-4 rounded-full bg-emerald-700 border-2 border-white shadow-lg"
                  style={{
                    left: `${Math.min(94, Math.max(6, ((record.longitude + 20) / 75) * 100))}%`,
                    top: `${Math.min(90, Math.max(10, ((35 - record.latitude) / 70) * 100))}%`,
                  }}
                  title={`${record.common} at ${record.school}`}
                />
              ))}
              
              <div className="text-center z-10">
                <MapIcon className="size-20 mx-auto text-emerald-700 mb-4 opacity-80" />
                <h3 className="text-3xl font-bold text-emerald-950 mb-2">
                  Africa Biodiversity Map
                </h3>
                <p className="text-emerald-700 font-semibold">
                  {liveDataLoading ? "Loading live monitoring locations..." : `${biodiversityRecords.length} public observation locations`}
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
                <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-7xl group-hover:scale-105 transition overflow-hidden">
                  {record.imageUrl ? <img src={record.imageUrl} alt={record.common} className="h-full w-full object-cover" /> : <Leaf className="size-16 text-emerald-700" />}
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
              const iconMap: Record<string, any> = {
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
                  <strong>🌍 Pilot Programme:</strong> We're currently testing in select African schools. Early adopters get VIP support and shape the platform's development.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Join our waiting list
              </h3>
              <p className="text-slate-600 mb-8">
                A few details and you're in.
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
                <li><Link href="#lab" className="hover:text-white transition">Lab</Link></li>
                <li><Link href="#biodiversity" className="hover:text-white transition">Biodiversity</Link></li>
                <li><Link href="#activities" className="hover:text-white transition">Activities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">For</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Schools</a></li>
                <li><a href="#" className="hover:text-white transition">Mentors</a></li>
                <li><a href="#" className="hover:text-white transition">Partners</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
            <p>© 2024 GeoMentor Africa. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
