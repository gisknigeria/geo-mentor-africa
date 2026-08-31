"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Button } from "../../components/ui/button";
import { Logo } from "../../components/app/logo";
import { supabase } from "../../lib/supabase/client";

type AssignedSchool = {
  school_id: string;
  school_name: string;
  students: number;
  observations: number;
  pending_guidance: number;
  health: "On track" | "Needs attention" | "Review";
};

type GuidanceRequest = {
  id: string;
  title: string;
  school_name: string;
  detail: string;
};

type MentorDashboard = {
  assigned_schools: number;
  students: number;
  pending_guidance: number;
  verified_this_term: number;
  schools: AssignedSchool[];
  guidance: GuidanceRequest[];
};

const emptyDashboard: MentorDashboard = {
  assigned_schools: 0,
  students: 0,
  pending_guidance: 0,
  verified_this_term: 0,
  schools: [],
  guidance: [],
};

export function MentorWorkspace() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dashboard, setDashboard] = useState<MentorDashboard>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(async ({ data, error: userError }) => {
      if (!active) return;

      if (userError || !data.user) {
        setUser(null);
        setLoading(false);
        setAuthReady(true);
        return;
      }

      setUser(data.user);

      const { data: assignmentRows, error: assignmentError } = await supabase
        .from("mentor_assignments")
        .select("school_id, status")
        .eq("mentor_id", data.user.id)
        .in("status", ["ACTIVE", "PENDING"]);

      if (assignmentError) {
        if (active) {
          setError(assignmentError.message);
          setLoading(false);
          setAuthReady(true);
        }
        return;
      }

      const schoolIds = [...new Set((assignmentRows ?? []).map((assignment) => assignment.school_id))];
      const { data: schoolsData } = schoolIds.length
        ? await supabase.from("schools").select("id, name, organization_id").in("id", schoolIds)
        : { data: [] };

      const schoolMap = new Map((schoolsData ?? []).map((school) => [school.id, school]));

      const liveSchools = await Promise.all(
        schoolIds.map(async (schoolId) => {
          const school = schoolMap.get(schoolId);
          if (!school) return null;

          const [{ count: studentsCount }, { count: observationsCount }, { count: guidanceCount }, { count: verifiedCount }] = await Promise.all([
            supabase
              .from("organization_memberships")
              .select("user_id", { count: "exact", head: true })
              .eq("organization_id", school.organization_id)
              .eq("role", "STUDENT")
              .eq("status", "VERIFIED"),
            supabase.from("observations").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
            supabase
              .from("observations")
              .select("id", { count: "exact", head: true })
              .eq("school_id", schoolId)
              .in("verification_status", ["PENDING", "NEEDS_CHANGES"])
              .in("review_stage", ["TEACHER_REVIEW", "EXPERT_REVIEW"]),
            supabase
              .from("observations")
              .select("id", { count: "exact", head: true })
              .eq("school_id", schoolId)
              .eq("verification_status", "VERIFIED")
              .gte("observed_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()),
          ]);

          return {
            school_id: schoolId,
            school_name: school.name,
            students: studentsCount ?? 0,
            observations: observationsCount ?? 0,
            pending_guidance: guidanceCount ?? 0,
            health: (guidanceCount ?? 0) > 0 ? "Needs attention" : "On track",
          } satisfies AssignedSchool;
        }),
      );

      const assignedSchools = liveSchools.filter(Boolean) as AssignedSchool[];
      const { data: guidanceRows } = await supabase
        .from("observations")
        .select("id, common_name, scientific_name, notes, school_id")
        .in("school_id", schoolIds)
        .in("review_stage", ["TEACHER_REVIEW", "EXPERT_REVIEW"])
        .in("verification_status", ["PENDING", "NEEDS_CHANGES"])
        .order("observed_at", { ascending: false })
        .limit(4);

      const schoolNameMap = new Map((schoolsData ?? []).map((school) => [school.id, school.name]));

      const guidance = (guidanceRows ?? []).map((row) => ({
        id: row.id,
        title: row.scientific_name || row.common_name || "Observation review",
        school_name: schoolNameMap.get(row.school_id) ?? "School",
        detail: row.notes || "Needs mentor input before the next review stage.",
      }));

      const totalVerifiedThisTerm = assignedSchools.reduce((sum, school) => sum + (school.observations > 0 ? Math.min(school.observations, 1) : 0), 0);

      if (active) {
        setDashboard({
          assigned_schools: assignedSchools.length,
          students: assignedSchools.reduce((sum, school) => sum + school.students, 0),
          pending_guidance: assignedSchools.reduce((sum, school) => sum + school.pending_guidance, 0),
          verified_this_term: assignedSchools.reduce((sum, school) => sum + (school.observations > 0 ? 1 : 0), 0),
          schools: assignedSchools,
          guidance,
        });
        setLoading(false);
        setAuthReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const schoolList = dashboard.schools.length ? dashboard.schools : [];
  const mentorName = user?.email ? user.email.split("@")[0].replace(/[._-]+/g, " ") : "mentor";
  const titleName = mentorName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Mentor";

  return (
    <main className="role-page">
      <aside className="role-rail">
        <Logo />
        <nav aria-label="Mentor navigation">
          <a className="active" href="/mentor">Overview</a>
          <a href="#schools">My schools</a>
          <a href="#activity">Activity</a>
          <a href="#sessions">Sessions</a>
          <a href="#resources">Resources</a>
        </nav>
        <div className="rail-person">
          <span>{titleName.slice(0, 2).toUpperCase() || "ME"}</span>
          <div>
            <strong>{titleName}</strong>
            <small>Verified GeoMentor</small>
          </div>
        </div>
      </aside>
      <section className="role-main">
        <header className="role-topbar">
          <Link href="/">← Student preview</Link>
          <span className="role-chip">Mentor workspace</span>
        </header>
        <div className="role-content">
          <div className="role-welcome">
            <div>
              <span className="eyebrow">{loading ? "LOADING" : "LIVE PORTFOLIO"}</span>
              <h1>{user ? `Good morning, ${titleName}.` : "Mentor workspace"}</h1>
              <p>
                {loading
                  ? "Loading your live mentoring portfolio..."
                  : user
                    ? `${dashboard.assigned_schools || 0} school${dashboard.assigned_schools === 1 ? "" : "s"} are active in your mentoring portfolio today.`
                    : "Sign in to view your assigned schools and review queue."}
              </p>
            </div>
            <Button>Schedule group session</Button>
          </div>

          <section className="mentor-kpis" aria-label="Mentor summary">
            <article>
              <small>ASSIGNED SCHOOLS</small>
              <strong>{loading ? 0 : dashboard.assigned_schools}</strong>
              <em>{dashboard.students ? `${dashboard.students} student observers` : "No active roster yet"}</em>
            </article>
            <article>
              <small>AWAITING GUIDANCE</small>
              <strong>{loading ? 0 : dashboard.pending_guidance}</strong>
              <em>{dashboard.pending_guidance ? `${dashboard.pending_guidance} active review items` : "No open review items"}</em>
            </article>
            <article>
              <small>VERIFIED THIS TERM</small>
              <strong>{loading ? 0 : dashboard.verified_this_term}</strong>
              <em>Across live school observations</em>
            </article>
          </section>

          <div className="role-grid">
            <section className="role-panel" id="schools">
              <div className="role-panel-heading">
                <div>
                  <span className="eyebrow">YOUR PORTFOLIO</span>
                  <h2>Assigned schools</h2>
                </div>
                <a href="#schools">View map →</a>
              </div>
              <div className="school-list">
                {schoolList.length === 0 ? (
                  <article>
                    <div style={{ padding: "1rem 0" }}>
                      <h3>No schools assigned yet</h3>
                      <p>{error ? error : "Your school assignments will appear here once they are live."}</p>
                    </div>
                  </article>
                ) : (
                  schoolList.map((school, index) => (
                    <article key={school.school_id}>
                      <span className="school-initials">{school.school_name.slice(0, 2).toUpperCase()}</span>
                      <div>
                        <h3>{school.school_name}</h3>
                        <p>
                          {school.students} students · {school.observations} observations
                        </p>
                        <small>{school.pending_guidance} pending guidance</small>
                      </div>
                      <span className={`health health-${index % 2}`}>{school.health}</span>
                      <a href="#activity" aria-label={`Open ${school.school_name}`}>
                        →
                      </a>
                    </article>
                  ))
                )}
              </div>
            </section>

            <aside className="role-panel guidance-panel" id="activity">
              <span className="eyebrow">GUIDANCE REQUESTS</span>
              <h2>Students need your insight</h2>
              {dashboard.guidance.length === 0 ? (
                <div className="guidance-item">
                  <span className="species-spot">✦</span>
                  <div>
                    <strong>No active review requests</strong>
                    <small>Everything is up to date</small>
                    <p>Your review queue will populate when school submissions are waiting for your feedback.</p>
                  </div>
                </div>
              ) : (
                dashboard.guidance.map((request) => (
                  <div className="guidance-item" key={request.id}>
                    <span className="species-spot">✦</span>
                    <div>
                      <strong>{request.title}</strong>
                      <small>{request.school_name}</small>
                      <p>{request.detail}</p>
                    </div>
                  </div>
                ))
              )}
              <button className="secondary-button">Open guidance queue</button>
            </aside>
          </div>

          <section className="role-panel session-panel" id="sessions">
            <div>
              <span className="eyebrow">NEXT SUPERVISED SESSION</span>
              <h2>{dashboard.schools[0]?.school_name ? `School mentoring at ${dashboard.schools[0].school_name}` : "No session scheduled yet"}</h2>
              <p>
                {dashboard.schools[0]
                  ? `${dashboard.schools[0].school_name} · Group review and field planning · this week`
                  : "Create a live session once a school assignment is active."}
              </p>
            </div>
            <div className="attendee-stack">
              <span>AO</span>
              <span>TO</span>
              <span>IM</span>
              <span>+{dashboard.students || 0}</span>
            </div>
            <button className="draft-button">View session plan</button>
          </section>
        </div>
      </section>
    </main>
  );
}
