import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";

export const metadata: Metadata = {
  title: "Mentor workspace | GeoMentor Africa",
  description: "Mentor projects, school activity and supervised learning sessions.",
};

const schools = [
  { name: "Staff School, Ibadan", students: 47, observations: 124, activity: "12 active today", health: "On track" },
  { name: "American Christian Academy", students: 31, observations: 76, activity: "5 active today", health: "Needs attention" },
];

export default function MentorWorkspace() {
  return (
    <main className="role-page">
      <aside className="role-rail">
        <Logo />
        <nav aria-label="Mentor navigation"><a className="active" href="/mentor">Overview</a><a href="#schools">My schools</a><a href="#activity">Activity</a><a href="#sessions">Sessions</a><a href="#resources">Resources</a></nav>
        <div className="rail-person"><span>KA</span><div><strong>Dr. Kemi Adeyemi</strong><small>Verified GeoMentor</small></div></div>
      </aside>
      <section className="role-main">
        <header className="role-topbar"><Link href="/">← Student preview</Link><span className="role-chip">Mentor workspace</span></header>
        <div className="role-content">
          <div className="role-welcome"><div><span className="eyebrow">MONDAY · 24 AUGUST</span><h1>Good morning, Dr. Kemi.</h1><p>Two schools are active in your mentoring portfolio today.</p></div><Button>Schedule group session</Button></div>
          <section className="mentor-kpis" aria-label="Mentor summary"><article><small>ASSIGNED SCHOOLS</small><strong>2</strong><em>81 student observers</em></article><article><small>AWAITING GUIDANCE</small><strong>9</strong><em>3 new today</em></article><article><small>VERIFIED THIS TERM</small><strong>186</strong><em>Across 14 species groups</em></article></section>
          <div className="role-grid">
            <section className="role-panel" id="schools"><div className="role-panel-heading"><div><span className="eyebrow">YOUR PORTFOLIO</span><h2>Assigned schools</h2></div><a href="#schools">View map →</a></div><div className="school-list">{schools.map((school, index) => <article key={school.name}><span className="school-initials">{index === 0 ? "SS" : "AC"}</span><div><h3>{school.name}</h3><p>{school.students} students · {school.observations} observations</p><small>{school.activity}</small></div><span className={`health health-${index}`}>{school.health}</span><a href="#activity" aria-label={`Open ${school.name}`}>→</a></article>)}</div></section>
            <aside className="role-panel guidance-panel" id="activity"><span className="eyebrow">GUIDANCE REQUESTS</span><h2>Students need your insight</h2><div className="guidance-item"><span className="species-spot">✦</span><div><strong>Possible Plain tiger</strong><small>Staff School · Pollinator</small><p>“Why does this butterfly stay near the milkweed?”</p></div></div><div className="guidance-item"><span className="species-spot green">♧</span><div><strong>Tree health change</strong><small>ACA · Neem tree</small><p>Leaves are turning yellow after recent rain.</p></div></div><button className="secondary-button">Open guidance queue</button></aside>
          </div>
          <section className="role-panel session-panel" id="sessions"><div><span className="eyebrow">NEXT SUPERVISED SESSION</span><h2>Reading the garden as a habitat</h2><p>Staff School Green Club · Friday, 28 August · 10:00 AM WAT</p></div><div className="attendee-stack"><span>AO</span><span>TO</span><span>IM</span><span>+18</span></div><button className="draft-button">View session plan</button></section>
        </div>
      </section>
    </main>
  );
}
