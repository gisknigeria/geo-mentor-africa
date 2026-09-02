import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Camera,
  Check,
  CircleDollarSign,
  FlaskConical,
  Globe,
  Handshake,
  HeartHandshake,
  Leaf,
  Map,
  Microscope,
  Network,
  School,
  ShieldCheck,
  Sparkles,
  Sprout,
  TrendingUp,
  Users,
} from "lucide-react";
import { WaitlistForm } from "./components/WaitlistForm";

const stockBannerVideoUrl = process.env.NEXT_PUBLIC_FEATURED_VIDEO_URL || "https://videos.pexels.com/video-files/857195/857195-hd_1920_1080_30fps.mp4";

type InfoPage = "about" | "lab" | "green-biz" | "activities" | "support" | "volunteer";

type PageContent = {
  label: string;
  title: string;
  intro: string;
  icon: typeof Leaf;
  accent: string;
  sections: Array<{
    icon: typeof Leaf;
    title: string;
    text: string;
    items: string[];
  }>;
};

const content: Record<InfoPage, PageContent> = {
  about: {
    label: "ABOUT GEOMENTOR AFRICA",
    title: "A learning network for Africa's living systems.",
    intro: "GeoMentor Africa connects schools, mentors, experts, partners and communities to turn local biodiversity learning into trusted environmental intelligence.",
    icon: Globe,
    accent: "from-emerald-950 via-emerald-900 to-teal-800",
    sections: [
      { icon: Leaf, title: "Our vision", text: "A future where every learner can understand, value and help protect the biodiversity around them.", items: ["Learning rooted in local places", "Conservation that includes communities", "Better decisions built on evidence"] },
      { icon: Network, title: "The GeoMentor model", text: "Schools create the evidence base, mentors make field learning practical, experts add trust, and partners help good work grow.", items: ["School-led observation", "Mentor-supported projects", "Expert-reviewed knowledge"] },
      { icon: ShieldCheck, title: "Our operating principles", text: "We treat data quality, privacy, scientific review and useful action as connected responsibilities.", items: ["Privacy-safe public mapping", "AI clearly marked as advisory", "Transparent verification status"] },
    ],
  },
  lab: {
    label: "BIODIVERSITY LAB",
    title: "The field-to-intelligence workspace.",
    intro: "One coordinated lab for mapping places, capturing biodiversity, monitoring change and managing conservation activities.",
    icon: FlaskConical,
    accent: "from-slate-950 via-emerald-950 to-emerald-800",
    sections: [
      { icon: Map, title: "Activity Map", text: "See schools, biodiversity gardens, conservation activities and observations in one geographic workspace.", items: ["Programme coverage", "School and garden locations", "Observation and activity layers"] },
      { icon: School, title: "School boundary mapping", text: "Define school premises, green spaces and conservation areas so projects have a clear place and scope.", items: ["School premises", "Conservation areas", "Green-space planning"] },
      { icon: BarChart3, title: "Bio-Tracker dashboard", text: "Give students, teachers and GeoMentors a shared view of field work, progress and evidence quality.", items: ["Plants and animals", "Monitoring history", "Review and impact status"] },
    ],
  },
  "green-biz": {
    label: "GREEN BIZ",
    title: "Conservation that opens economic opportunity.",
    intro: "Green Biz connects biodiversity evidence with responsible enterprise, innovation, entrepreneurship and local value chains.",
    icon: TrendingUp,
    accent: "from-amber-950 via-orange-900 to-emerald-800",
    sections: [
      { icon: Sprout, title: "Opportunity discovery", text: "Use ecological and local knowledge to identify products and services that can grow without degrading the systems that support them.", items: ["Suitable products", "Production opportunities", "Local enterprise potential"] },
      { icon: CircleDollarSign, title: "Value-chain intelligence", text: "Translate field observations into better questions about processing, buyers, markets and sustainable livelihoods.", items: ["Possible markets", "Enterprise pathways", "Responsible sourcing"] },
      { icon: Award, title: "Youth innovation", text: "Create a bridge from school projects to green innovation challenges, practical skills and enterprise learning.", items: ["Innovation projects", "Pitch and showcase opportunities", "Mentor and partner connections"] },
    ],
  },
  activities: {
    label: "ACTIVITIES",
    title: "Where learning becomes participation.",
    intro: "Explore the people, projects, training, awards and community activities that make the GeoMentor model visible and active.",
    icon: Camera,
    accent: "from-blue-950 via-emerald-950 to-teal-800",
    sections: [
      { icon: School, title: "School adoption", text: "Schools can join the programme, build biodiversity estates and run projects connected to their own surroundings.", items: ["Adopt a school", "Start a biodiversity project", "Report activity and progress"] },
      { icon: BookOpen, title: "Training and Knowledge Hub", text: "Practical resources help teachers, students and GeoMentors ask better questions and collect stronger evidence.", items: ["Field learning resources", "Mentor training", "Local knowledge sharing"] },
      { icon: Award, title: "Awards and events", text: "Celebrate good observation, conservation leadership, research and collaboration across the network.", items: ["Recognition programmes", "Field events", "Impact stories and gallery"] },
    ],
  },
  support: {
    label: "SUPPORT / FUND",
    title: "Help a school turn curiosity into conservation.",
    intro: "Fund the people, tools and projects that help schools collect meaningful biodiversity evidence and act on what they learn.",
    icon: Handshake,
    accent: "from-emerald-950 via-teal-900 to-blue-900",
    sections: [
      { icon: School, title: "Adopt a school", text: "Support a school with mentorship, field equipment, training and a practical biodiversity project.", items: ["School sponsorship", "Equipment and connectivity", "Project support"] },
      { icon: Handshake, title: "Partner with the programme", text: "Universities, conservation organisations, professional bodies and technology partners can contribute expertise and reach.", items: ["Strategic partnerships", "Research collaboration", "Technology and knowledge support"] },
      { icon: CircleDollarSign, title: "Fund measurable work", text: "Connect support to clear outputs such as schools reached, observations recorded, gardens mapped and projects completed.", items: ["Transparent impact indicators", "Grant-ready programmes", "Partner reporting"] },
    ],
  },
  volunteer: {
    label: "VOLUNTEER",
    title: "Bring your expertise to the field.",
    intro: "Join a network of GeoMentors, experts, teachers, professionals and volunteers helping young people learn from the places around them.",
    icon: HeartHandshake,
    accent: "from-violet-950 via-emerald-950 to-emerald-800",
    sections: [
      { icon: Users, title: "Become a GeoMentor", text: "Guide a school or project with practical encouragement, field questions and consistent follow-through.", items: ["Adopt or support a school", "Guide field activities", "Help students reflect"] },
      { icon: Microscope, title: "Validate as an expert", text: "Review observations, photographs and AI suggestions to improve accuracy, context and trust.", items: ["Confirm identification", "Correct uncertain records", "Validate recommendations"] },
      { icon: Sparkles, title: "Contribute your craft", text: "Teachers, GIS professionals, researchers, designers and community leaders can strengthen the platform in different ways.", items: ["Teach and train", "Share local knowledge", "Build tools and partnerships"] },
    ],
  },
};

const navigation = [
  ["Home", "/"], ["About", "/about"], ["Lab", "/lab"], ["Green Biz", "/green-biz"],
  ["Activities", "/activities"], ["Support/Fund", "/support"], ["Volunteer", "/volunteer"],
];

export function PublicInfoPage({ page }: { page: InfoPage }) {
  const pageContent = content[page];
  const HeroIcon = pageContent.icon;

  return (
    <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]">
      <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-emerald-800"><Leaf className="size-6" />GeoMentor Africa</Link>
          <nav className="hidden items-center gap-5 text-xs font-bold text-slate-600 xl:flex">
            {navigation.map(([label, href]) => <Link key={href} href={href} className={href === `/${page}` ? "text-emerald-700" : "hover:text-emerald-700"}>{label}</Link>)}
          </nav>
          <Link href="/#waitlist" className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800">Join the programme <ArrowRight className="size-4" /></Link>
        </div>
      </header>

      <section className={`relative overflow-hidden bg-gradient-to-br ${pageContent.accent} px-6 py-24 text-white lg:py-32`}>
        <video className="absolute inset-0 h-full w-full object-cover opacity-35 motion-reduce:hidden" autoPlay muted loop playsInline poster="/biodiversity-fieldwork.png" aria-hidden="true">
          <source src={stockBannerVideoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-emerald-950/60 to-teal-950/80" />
        <div className="relative mx-auto grid max-w-6xl items-end gap-12 lg:grid-cols-[1.2fr_.8fr]">
          <div><p className="mb-5 text-xs font-black tracking-[0.22em] text-lime-300">{pageContent.label}</p><h1 className="max-w-4xl text-5xl font-bold leading-[.98] tracking-tight sm:text-7xl">{pageContent.title}</h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-emerald-100">{pageContent.intro}</p></div>
          <div className="border-l border-white/20 pl-7"><HeroIcon className="size-16 text-lime-300" /><p className="mt-8 text-sm font-bold uppercase tracking-wider text-emerald-200">One platform. Multiple ways to participate.</p><Link href="/#waitlist" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-lime-300">Get involved <ArrowRight className="size-4" /></Link></div>
        </div>
      </section>

      <section className="px-6 py-20 lg:py-28"><div className="mx-auto max-w-6xl"><div className="grid gap-6 md:grid-cols-3">{pageContent.sections.map(({ icon: Icon, title, text, items }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><Icon className="size-10 text-emerald-700" /><h2 className="mt-7 text-2xl font-bold text-slate-900">{title}</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p><ul className="mt-6 space-y-3 border-t border-slate-100 pt-5">{items.map((item) => <li key={item} className="flex gap-2 text-sm font-semibold text-slate-700"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />{item}</li>)}</ul></article>)}</div></div></section>

      <section className="bg-white px-6 py-20"><div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]"><div><p className="text-xs font-black tracking-[0.2em] text-emerald-700">THE FULL ARCHITECTURE</p><h2 className="mt-4 text-4xl font-bold text-slate-900">From a captured observation to a decision people can use.</h2><p className="mt-5 leading-relaxed text-slate-600">The website, Lab, tracking app, GIS, AI analytics, expert validation and intelligence products work together. That coordination is what makes local field learning useful at programme scale.</p></div><div className="grid gap-3 sm:grid-cols-2">{["Capture with location and evidence", "Interpret with geospatial and environmental data", "Review with experts and local knowledge", "Share intelligence for conservation and enterprise"].map((item, index) => <div key={item} className="flex gap-4 rounded-xl bg-emerald-50 p-5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-700 text-sm font-bold text-white">{index + 1}</span><span className="text-sm font-bold leading-relaxed text-emerald-950">{item}</span></div>)}</div></div></section>

      <section id="waitlist" className="px-6 py-20"><div className="mx-auto max-w-6xl rounded-2xl bg-emerald-950 p-7 text-white lg:p-12"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><h2 className="text-4xl font-bold">Ready to take part?</h2><p className="mt-4 leading-relaxed text-emerald-100">Tell us whether you are a school, mentor, partner, expert or volunteer. We will help you find the right starting point.</p></div><div className="rounded-xl bg-white p-6 text-slate-900"><WaitlistForm /></div></div></div></section>

      <footer className="bg-slate-950 px-6 py-10 text-sm text-slate-300"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 sm:flex-row"><span className="font-bold text-white">GeoMentor Africa</span><div className="flex flex-wrap gap-4">{navigation.map(([label, href]) => <Link key={href} href={href} className="hover:text-white">{label}</Link>)}</div></div></footer>
    </main>
  );
}
