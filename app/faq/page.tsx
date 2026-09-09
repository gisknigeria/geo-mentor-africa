import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Frequently asked questions about joining and participating in GeoMentor Africa.",
};

const faqs = [
  {
    question: "Who can join?",
    answer: "GeoMentor Africa welcomes professionals, students, young people, educators, researchers, conservation practitioners, entrepreneurs, institutions and partners who want to contribute their knowledge, skills or time to meaningful action across Africa.",
  },
  {
    question: "Is participation free?",
    answer: "Yes. Volunteer participation is free. Some specialised training, events or services may have separate costs, which will always be communicated clearly in advance.",
  },
  {
    question: "Can I participate outside Nigeria?",
    answer: "Yes. GeoMentor Africa is a pan-African initiative. Participants can contribute from anywhere in Africa and, where relevant, from the wider global community through virtual and collaborative activities.",
  },
  {
    question: "How are mentors matched?",
    answer: "Mentors are matched based on their expertise, experience, interests, location and areas of contribution, alongside the needs and goals of mentees, schools and programmes.",
  },
  {
    question: "Can organisations participate?",
    answer: "Yes. Schools, universities, professional bodies, NGOs, businesses, government institutions and development partners can participate through partnerships, Technical Working Groups, school adoption, projects, mentoring and programme support.",
  },
  {
    question: "What is the time commitment?",
    answer: "Participation is flexible and depends on your role. Members are encouraged to contribute consistently to agreed meetings, activities, projects or mentoring commitments without creating unnecessary demands on their schedules.",
  },
  {
    question: "How is child safeguarding handled?",
    answer: "The safety and wellbeing of children come first. GeoMentor Africa applies appropriate safeguarding, consent, supervision, privacy and data-protection measures to all activities involving children and young people.",
  },
  {
    question: "What happens after registration?",
    answer: "Your profile is reviewed to understand your expertise and interests. You are then matched to an appropriate role and Technical Working Group, welcomed and onboarded, and connected to opportunities where you can contribute meaningfully.",
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]">
      <header className="bg-[#083d31] px-5 py-5 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-6">
          <Link href="/twg" className="font-serif text-xl font-medium">GeoMentor Africa</Link>
          <nav className="flex items-center gap-4 text-xs font-bold text-emerald-100">
            <Link href="/privacy" className="transition hover:text-lime-300">Privacy Notice</Link>
            <Link href="/feedback" className="transition hover:text-lime-300">Feedback</Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <header className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">Help &amp; Guidance</p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-tight text-emerald-950 sm:text-6xl">Frequently Asked Questions</h1>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            Find answers about joining GeoMentor Africa, participating across Africa and what happens after you register.
          </p>
        </header>

        <div className="mt-10 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-xl border border-[#dfe6df] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(33,65,54,.04)]">
              <summary className="cursor-pointer list-none pr-8 text-base font-bold text-emerald-950 marker:hidden [&::-webkit-details-marker]:hidden">
                {faq.question}
              </summary>
              <p className="mt-3 border-t border-[#dfe6df] pt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 border-t border-[#dfe6df] pt-6 text-sm leading-7 text-slate-600">
          <p className="font-serif text-2xl text-emerald-950">Join with purpose. Contribute your expertise. Help turn knowledge into measurable impact.</p>
          <p className="mt-5"><Link href="/twg" className="font-bold text-emerald-700 hover:text-emerald-900">Join GeoMentor Africa</Link> or <Link href="/feedback" className="font-bold text-emerald-700 hover:text-emerald-900">send us a question</Link>.</p>
        </div>
      </article>
    </main>
  );
}
