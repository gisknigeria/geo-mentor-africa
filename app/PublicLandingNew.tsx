"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Leaf,
  MapPin,
  Users,
  Zap,
  Globe,
  BarChart3,
  Shield,
  Sparkles,
  Camera,
} from "lucide-react";
import { WaitlistForm } from "./components/WaitlistForm";

export function PublicLanding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-slate-200"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-700">
            <Leaf className="size-6" />
            GeoMentor Africa
          </Link>
          <div className="hidden sm:flex gap-8 items-center">
            <Link href="#features" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
              Features
            </Link>
            <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
              How it works
            </Link>
            <Link href="#waitlist" className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700">
              Join Waitlist
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50">
            <Sparkles className="size-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Launching soon</span>
          </div>

          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Connect schools with mentors. <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Transform field learning.
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A platform where schools capture biodiversity evidence, mentors guide learning, 
            and partners fund measurable conservation impact across Africa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="#waitlist"
              className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition inline-flex items-center gap-2 justify-center"
            >
              Join the waiting list
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition"
            >
              See how it works
            </Link>
          </div>

          {/* Hero image placeholder */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="size-16 mx-auto text-emerald-600 mb-4 opacity-50" />
                <p className="text-slate-500 font-medium">Interactive school biodiversity map</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              Powerful features for field learning
            </h2>
            <p className="text-xl text-slate-600">
              Everything schools, mentors and partners need to connect and create impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "Camera",
                title: "Field Capture",
                description: "Students photograph biodiversity. AI suggests identities. Teachers and mentors verify.",
              },
              {
                icon: "Globe",
                title: "Live School Map",
                description: "Track schools, observations and conservation activities across Africa in real time.",
              },
              {
                icon: "Users",
                title: "Mentor Network",
                description: "Graduates and experts adopt nearby schools, guide learning and strengthen evidence.",
              },
              {
                icon: "BarChart3",
                title: "Impact Dashboard",
                description: "Visualize verified records, student participation and conservation milestones.",
              },
              {
                icon: "Shield",
                title: "Secure & Private",
                description: "Student consent and safety-first design. Schools maintain control of all data.",
              },
              {
                icon: "Zap",
                title: "Instant Funding",
                description: "Partners sponsor schools and see geotagged proof of impact on the ground.",
              },
            ].map(({ icon, title, description }) => {
              const iconMap: Record<string, typeof Leaf> = {
                Camera,
                Globe,
                Users,
                BarChart3,
                Shield,
                Zap,
              };
              const Icon = iconMap[icon];
              return (
                <div
                  key={title}
                  className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition"
                >
                  <Icon className="size-10 text-emerald-600 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-600">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Three Roles Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              Built for three roles
            </h2>
            <p className="text-xl text-slate-600">
              Each with their own pathway to impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Schools",
                color: "bg-blue-50 border-blue-200",
                icon: "🏫",
                points: [
                  "Onboard teachers and students",
                  "Create field tasks and missions",
                  "Build a living biodiversity estate",
                  "Track conservation progress",
                ],
              },
              {
                title: "Geo-Mentors",
                color: "bg-emerald-50 border-emerald-300",
                icon: "🎯",
                points: [
                  "Adopt nearby schools",
                  "Review and strengthen evidence",
                  "Guide supervised field learning",
                  "Build your impact portfolio",
                ],
              },
              {
                title: "Geo-Partners",
                color: "bg-amber-50 border-amber-200",
                icon: "🌱",
                points: [
                  "Fund specific school goals",
                  "Sponsor conservation campaigns",
                  "See geotagged proof of impact",
                  "Generate partnership outcomes",
                ],
              },
            ].map(({ title, color, icon, points }) => (
              <div
                key={title}
                className={`p-8 rounded-2xl border-2 ${color} relative overflow-hidden`}
              >
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{title}</h3>
                <ul className="space-y-4">
                  {points.map((point) => (
                    <li key={point} className="flex gap-3 items-start">
                      <Check className="size-5 text-emerald-600 shrink-0 mt-1" />
                      <span className="text-slate-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              How it works
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Capture Evidence",
                description:
                  "Students photograph plants, animals or observations using the field app. Location and time are automatically recorded.",
              },
              {
                step: "02",
                title: "AI Suggestion",
                description:
                  "Artificial intelligence suggests species identity and provides educational context—always labelled as a suggestion, never definitive.",
              },
              {
                step: "03",
                title: "Teacher Review",
                description:
                  "Teachers verify student evidence and submission quality. Then mentor or specialist confirmation strengthens the record.",
              },
              {
                step: "04",
                title: "Build Impact",
                description:
                  "Verified records join school biodiversity maps, conservation goals and funded programmes. Outcomes become visible.",
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-600 text-white font-bold text-xl">
                    {step}
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-lg text-slate-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA Section */}
      <section id="waitlist" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold text-slate-900 mb-6">
                Be among the first to transform field learning
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Join thousands of schools, mentors and partners waiting to launch 
                a biodiversity programme that works.
              </p>

              <ul className="space-y-4 mb-12">
                {[
                  "Early access to the platform",
                  "Priority mentor matching and support",
                  "Featured in our launch communications",
                  "Exclusive partnership opportunities",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-center">
                    <div className="flex-shrink-0">
                      <Check className="size-6 text-emerald-600" />
                    </div>
                    <span className="text-lg text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-sm text-slate-500">
                🌍 We're currently pilot testing in select African schools. 
                Spots are limited.
              </p>
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

      {/* Stats Section */}
      <section className="py-16 px-6 bg-emerald-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <p className="text-emerald-100">Schools interested</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">25+</div>
              <p className="text-emerald-100">Countries represented</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">1000+</div>
              <p className="text-emerald-100">Mentors enrolled</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <p className="text-emerald-100">Partner organizations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-white mb-4">
                <Leaf className="size-5" />
                GeoMentor Africa
              </div>
              <p className="text-sm">
                Connecting schools with mentors to transform field learning and conservation across Africa.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white">How it works</Link></li>
                <li><Link href="#waitlist" className="hover:text-white">Waitlist</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">For</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/register?role=school" className="hover:text-white">Schools</a></li>
                <li><a href="/register?role=mentor" className="hover:text-white">Geo-Mentors</a></li>
                <li><a href="/partner" className="hover:text-white">Partners</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pilot" className="hover:text-white">About</Link></li>
                <li><a href="mailto:hello@geomentor.org" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
            <p>© 2024 GeoMentor Africa. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
