import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy & Data Protection Notice",
  description: "GeoMentor Africa Privacy Policy and Data Protection Notice.",
};

const principles = [
  "Lawfulness", "Fairness", "Transparency", "Purpose limitation", "Data minimisation",
  "Accuracy", "Security", "Accountability", "Responsible data stewardship",
  "Biodiversity safeguarding", "Prevention of harmful or exploitative use of sensitive ecological information",
];

const rights = [
  "Be informed about how your personal data is processed.",
  "Request access to personal data we hold about you.",
  "Request correction of inaccurate or incomplete information.",
  "Request deletion of eligible personal information.",
  "Request restriction of certain processing.",
  "Object to certain processing.",
  "Withdraw consent.",
  "Request portability of eligible personal information.",
  "Request human review of certain automated decisions.",
  "Lodge a complaint with an appropriate data-protection authority.",
];

const sensitiveControls = [
  "Remove precise GPS coordinates from public-facing records.",
  "Display locations at broader geographic scales rather than exact points.",
  "Apply spatial masking, coordinate generalisation or location fuzzing.",
  "Delay publication of sensitive observations.",
  "Restrict access to authorised conservation professionals, researchers or institutions.",
  "Use role-based access controls for sensitive biodiversity datasets.",
  "Require additional approval before sensitive data can be exported or shared.",
  "Maintain audit records of access to high-risk biodiversity information.",
  "Limit downloadable data where unrestricted distribution could create conservation harm.",
];

const prohibitedUses = [
  "Poaching or illegal wildlife trade.",
  "Unauthorised capture or collection of species.",
  "Illegal logging or harvesting.",
  "Exploitation of endangered or protected species.",
  "Destruction or disturbance of sensitive habitats.",
  "Unauthorised commercial extraction of biological resources or biopiracy.",
  "Unauthorised entry into protected or restricted conservation areas.",
  "Any unlawful or harmful activity that threatens biodiversity, communities or conservation outcomes.",
];

function PolicySection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#dfe6df] py-8">
      <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">{number}</p>
      <h2 className="mt-2 font-serif text-3xl text-emerald-950">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return <ul className="list-disc space-y-2 pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]">
      <header className="bg-[#083d31] px-5 py-5 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6">
          <Link href="/twg" className="font-serif text-xl font-medium">GeoMentor Africa</Link>
          <Link href="/twg" className="text-xs font-bold text-emerald-100 transition hover:text-lime-300">Back to registration</Link>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <header className="max-w-3xl pb-10">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">Privacy Notice</p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-tight text-emerald-950 sm:text-6xl">GeoMentor Africa Privacy Policy &amp; Data Protection Notice</h1>
          <p className="mt-5 text-sm text-slate-500">Effective Date: 8 September 2026 · Last Updated: 8 September 2026</p>
        </header>

        <PolicySection number="1" title="Our Commitment">
          <p>GeoMentor Africa respects your privacy and is committed to the responsible, lawful and secure use of personal information and sensitive biodiversity information.</p>
          <p>This notice explains how we collect, use, store, share and protect data when you visit our website, register, volunteer, join a Technical Working Group, participate in mentorship or training, engage in school or community activities, submit biodiversity or geospatial information, attend events, or use our digital platforms and services.</p>
          <BulletList items={principles} />
        </PolicySection>

        <PolicySection number="2" title="Who We Are">
          <p>GeoMentor Africa is a pan-African initiative bringing together professionals, young people, schools, institutions, communities and partners to advance mentorship and capacity development, geography and geospatial learning, biodiversity and environmental intelligence, conservation action, green enterprise, sustainable development, research, innovation and community impact.</p>
          <p>For activities operated directly by GeoMentor Africa, the designated Secretariat is responsible for determining how personal data is processed. Where a programme is delivered jointly with another organisation, responsibilities are determined by the applicable partnership, programme or data-sharing arrangement.</p>
        </PolicySection>

        <PolicySection number="3" title="Information We Collect">
          <p>Depending on how you participate, we may collect your name, email, telephone number, country and location, age or date of birth where required, gender where relevant and voluntarily provided, and photograph or profile image.</p>
          <p>We may also collect organisation, professional role, qualifications, skills, expertise, interests, mentor or Technical Working Group preferences, programme records, school and youth programme information, and parent, guardian or authorised school information where required.</p>
          <p>Geospatial and biodiversity submissions may include GPS coordinates, photographs, field observations, species and habitat observations, environmental and climate information, project records, date and time, species status, abundance and distribution, and nesting, breeding, feeding, migration or congregation locations.</p>
          <p>When you use our digital platforms, we may collect limited technical information such as IP address, browser and device information, login activity, website usage, cookies, security logs and system logs. We aim to collect only information reasonably necessary for the stated purpose.</p>
        </PolicySection>

        <PolicySection number="4" title="Why We Use Your Information">
          <p>We may process information to register participants, maintain profiles, review experience and expertise, match members to roles and Technical Working Groups, connect mentors, mentees, schools and partners, coordinate meetings and programmes, manage volunteer participation, deliver conservation and geospatial activities, verify field data, monitor impact, conduct research, produce dashboards and reports, communicate opportunities, improve services, maintain security, protect participants and species, support conservation planning, and meet contractual, legal, safeguarding and regulatory requirements.</p>
          <p>Whenever reasonably possible, public reports, research outputs and dashboards use aggregated, anonymised, generalised or de-identified information.</p>
        </PolicySection>

        <PolicySection number="5" title="Lawful Basis for Processing">
          <p>Depending on the activity, processing may be based on consent, contract or programme participation, legitimate interests, legal obligation, vital interests or public interest. Where processing is based on consent, you may withdraw consent at any time. Withdrawal does not affect processing that lawfully occurred before consent was withdrawn.</p>
        </PolicySection>

        <PolicySection number="6" title="Children and Young People">
          <p>Children and young people require enhanced privacy and safeguarding protections. Where required by law, we obtain appropriate authorisation or consent from a parent, legal guardian, school or other authorised person before processing a child&apos;s information.</p>
          <p>We collect only information reasonably necessary, limit access, avoid unnecessary publication of identifying information, obtain permission before using identifiable photographs or profiles, exercise particular care with location information, and avoid publicly linking a child&apos;s identity with precise biodiversity or field locations where safety risks may arise.</p>
        </PolicySection>

        <PolicySection number="7" title="Geospatial, Biodiversity and Sensitive Species Data">
          <p>GeoMentor Africa uses geospatial and biodiversity information for learning, research, monitoring, conservation, environmental intelligence and informed decision-making. Where geospatial information identifies or can reasonably be linked to an individual, it is treated as personal data.</p>
          <p>Information exposing endangered, threatened, rare or commercially valuable species may be classified as sensitive biodiversity data. We may restrict, obscure, generalise, delay or withhold it where disclosure could increase the risk of poaching, trafficking, illegal harvesting, habitat destruction, disturbance of breeding sites, biopiracy or other conservation harm.</p>
          <p>We may use the following controls:</p>
          <BulletList items={sensitiveControls} />
          <p>Protection of species and ecosystems takes priority over unrestricted disclosure of sensitive location data.</p>
        </PolicySection>

        <PolicySection number="8" title="Artificial Intelligence and Automated Tools">
          <p>We may use digital, analytical or artificial-intelligence tools for species identification, environmental analysis, data quality checks, programme analytics, expertise matching, mapping, geospatial analysis and identification of potentially sensitive records. These tools support human decision-making and do not replace appropriate human oversight. Potentially sensitive ecological information may be referred for expert review before publication.</p>
        </PolicySection>

        <PolicySection number="9" title="Photographs, Videos and Media">
          <p>Activities may be photographed or recorded for programme documentation, learning, training, reporting, public communication and impact storytelling. Where appropriate, participants are informed before identifiable photographs, videos, testimonials or personal stories are publicly used. Additional consent is obtained where required, particularly for children and vulnerable participants.</p>
        </PolicySection>

        <PolicySection number="10" title="Sharing Personal and Sensitive Information">
          <p>Where necessary, relevant information may be shared with authorised personnel, Technical Working Group coordinators, participating schools and institutions, programme and research partners, conservation organisations and experts, technology and cloud-service providers, professional advisers, funders where safeguards apply, and government agencies or regulators where legally required.</p>
          <p>Access is limited to information reasonably necessary for the relevant purpose. GeoMentor Africa does not sell personal information or sensitive biodiversity location data.</p>
        </PolicySection>

        <PolicySection number="11" title="International Data Transfers">
          <p>GeoMentor Africa operates across Africa and may use providers or collaborate with organisations in different countries. Where cross-border transfers occur, we apply appropriate legal, contractual, organisational, technical and biodiversity-specific safeguards.</p>
        </PolicySection>

        <PolicySection number="12" title="Data Security">
          <p>We apply reasonable administrative, organisational and technical measures against unauthorised access, unlawful disclosure, accidental loss, alteration, destruction, misuse, cybersecurity threats, scraping and misuse of precise species locations.</p>
          <p>No digital system can guarantee absolute security. If a breach occurs, we investigate, contain it, assess impacts on individuals and conservation resources, take corrective measures, restrict compromised access and notify affected individuals or authorities where required by law.</p>
        </PolicySection>

        <PolicySection number="13" title="Data Retention">
          <p>We retain information only as long as reasonably necessary to deliver programmes, maintain records, meet safeguarding requirements, monitor impact, support legitimate conservation and research, fulfil contractual or legal obligations, and resolve disputes. When identifiable information is no longer required, it may be securely deleted, anonymised or appropriately archived. Sensitive biodiversity records may be retained for legitimate scientific, conservation, historical or monitoring purposes while remaining restricted.</p>
        </PolicySection>

        <PolicySection number="14" title="Your Data Protection Rights">
          <p>Subject to applicable law, you may have the right to:</p>
          <BulletList items={rights} />
          <p>These rights relate to personal data and do not automatically create a right to sensitive biodiversity information restricted for conservation, security or safeguarding reasons.</p>
        </PolicySection>

        <PolicySection number="15" title="Communications">
          <p>We may send essential communications about registration, Technical Working Groups, meetings, training, programmes, events, projects, opportunities, safety or administrative matters. Optional communications require an appropriate choice, and you may unsubscribe at any time. Essential programme or administrative communications may still be sent where necessary for ongoing participation.</p>
        </PolicySection>

        <PolicySection number="16" title="Cookies and Website Analytics">
          <p>Our website may use cookies and similar technologies for essential functions, security, preferences, usage understanding, performance, analytics and suspicious-activity detection. Where required, non-essential cookies and analytics are used only after appropriate consent.</p>
        </PolicySection>

        <PolicySection number="17" title="Third-Party Platforms and Links">
          <p>Links to external websites, mapping, social media, learning, partner and other third-party services operate under their own privacy policies and terms. Review their privacy and data-sharing practices before providing personal or biodiversity information.</p>
        </PolicySection>

        <PolicySection number="18" title="Research, Reporting and Open Data">
          <p>GeoMentor Africa supports knowledge sharing, research, open science and evidence-based conservation. Open data does not mean unrestricted disclosure of ecologically sensitive information. For research, dashboards, reports and publications, we take reasonable steps to remove unnecessary identifiers, anonymise participant information, protect sensitive locations, generalise coordinates and assess conservation risks before publication.</p>
        </PolicySection>

        <PolicySection number="19" title="Prohibited Use of GeoMentor Africa Data">
          <p>GeoMentor Africa data must not be used to facilitate or support:</p>
          <BulletList items={prohibitedUses} />
          <p>We may suspend or terminate access where there is evidence or reasonable suspicion of misuse.</p>
        </PolicySection>

        <PolicySection number="20" title="Changes to This Policy">
          <p>We may update this notice as programmes, technology, partnerships, conservation responsibilities or legal obligations change. The latest version will be published with an updated effective date. Where a change materially affects how information is used, we will take reasonable steps to inform affected participants.</p>
        </PolicySection>

        <PolicySection number="21" title="Contact and Data Protection Requests">
          <p>For questions, requests concerning personal information, withdrawal of consent, correction or deletion requests, or concerns relating to sensitive biodiversity data, contact:</p>
          <address className="not-italic rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="font-bold text-emerald-800">GeoMentor Africa Privacy &amp; Data Protection Desk</p>
            <p>GeoMentor Africa Secretariat</p>
            <p className="mt-2">Privacy, data-protection and biodiversity-data concerns may be submitted through the official <Link href="/feedback" className="font-semibold text-emerald-700 underline">Feedback page</Link> on the GeoMentor Africa website.</p>
          </address>
          <p>When submitting a request, provide enough information to identify the relevant record, clearly state the request, include relevant supporting information where necessary, and do not send passwords or unnecessary sensitive information.</p>
        </PolicySection>

        <PolicySection number="22" title="Complaints">
          <p>Contact GeoMentor Africa first so we can investigate and respond. Where applicable, you may also complain to the Nigeria Data Protection Commission, another competent data-protection authority, or an appropriate wildlife, environmental or conservation authority where misuse involves protected species or ecological resources.</p>
        </PolicySection>

        <PolicySection number="23" title="Applicable Data Protection and Conservation Framework">
          <p>GeoMentor Africa is committed to applicable privacy, data-protection and conservation requirements, including the Nigeria Data Protection Act 2023, relevant Nigeria Data Protection Commission guidance, applicable laws in countries where we operate, wildlife and biodiversity laws, and internationally recognised privacy, conservation and responsible data-governance principles.</p>
        </PolicySection>

        <PolicySection number="24" title="Our Data Promise">
          <p>Data should enable participation, learning, research and measurable conservation impact without compromising privacy, safety or biodiversity. We are committed to protecting people, respecting communities, safeguarding children, protecting vulnerable species and habitats, restricting sensitive ecological information where necessary, using information transparently and responsibly, supporting legitimate research and building trust through accountable data stewardship.</p>
          <p className="font-serif text-xl text-emerald-900">Responsible Data. Protected Biodiversity. Trusted Participation. Measurable Impact.</p>
        </PolicySection>

        <footer className="border-t border-[#dfe6df] pt-6 text-sm text-slate-500">
          <p className="mb-4">Have feedback or a question? <Link href="/feedback" className="font-bold text-emerald-700 hover:text-emerald-900">Open the feedback page</Link>.</p>
          <Link href="/twg" className="font-bold text-emerald-700 hover:text-emerald-900">Return to TWG registration</Link>
        </footer>
      </article>
    </main>
  );
}
