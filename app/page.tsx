"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell, ChevronRight, CircleHelp,
  ClipboardCheck, FolderKanban, LayoutDashboard, Leaf, Map, MapPin,
  Plus, ScanLine, TreePine, Users,
} from "lucide-react";
import { Logo } from "../components/app/logo";
import { AccountMenu } from "../components/app/account-menu";
import { Badge } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";
import { PublicLanding } from "./PublicLanding";
import { supabase } from "../lib/supabase/client";

type School = { id: string; name: string };
type Observation = { id: string; scientific_name: string | null; common_name: string | null; observation_type: string; verification_status: string; review_stage: string; observed_at: string };
type StudentProfile = { id: string; display_name: string };
type Stats = { verified_observations: number; pending_observations: number; active_projects: number; student_count: number };
type Notification = { id: string; title: string; body: string; kind: string; observation_id: string | null; read_at: string | null; created_at: string };

const navigation = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard, active: true },
  { label: "Field capture", href: "/field", icon: ScanLine },
  { label: "School map", href: "/map", icon: Map },
  { label: "Projects", href: "#projects", icon: FolderKanban },
  { label: "My submissions", href: "#reviews", icon: ClipboardCheck },
];

export default function Home() {
  return <PublicLanding />;
}

export function StudentDashboard() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [stats, setStats] = useState<Stats>({
    verified_observations: 0,
    pending_observations: 0,
    active_projects: 0,
    student_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get student profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, display_name")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setStudent({ id: user.id, display_name: profileData.display_name || "Student" });
          const { data: notificationData } = await supabase.from("notifications").select("id,title,body,kind,observation_id,read_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
          setNotifications((notificationData ?? []) as Notification[]);

          // Get student's school
          const { data: membershipData } = await supabase
            .from("organization_memberships")
            .select("organization_id")
            .eq("user_id", user.id)
            .eq("role", "STUDENT")
            .eq("status", "VERIFIED")
            .single();

          if (membershipData) {
            // Get school details
            const { data: schoolData } = await supabase
              .from("schools")
              .select("id, name")
              .eq("organization_id", membershipData.organization_id)
              .single();

            if (schoolData) {
              setSchool(schoolData);

              // Get observations for this school
              const { data: obsData } = await supabase
                .from("observations")
                .select("id, scientific_name, common_name, observation_type, verification_status, review_stage, observed_at")
                .eq("school_id", schoolData.id)
                .order("observed_at", { ascending: false })
                .limit(6);

              setObservations((obsData || []) as Observation[]);

              // Get school stats
              const { data: dashboardData } = await supabase.rpc("get_school_operations_dashboard");
              if (dashboardData?.metrics) {
                setStats({
                  verified_observations: dashboardData.metrics.verified_observations || 0,
                  pending_observations: dashboardData.metrics.pending_students || 0,
                  active_projects: dashboardData.metrics.active_projects || 0,
                  student_count: dashboardData.metrics.verified_students || 0,
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading student data:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadStudentData();
  }, []);

  const stageLabel: Record<string, string> = {
    TEACHER_REVIEW: "Teacher review",
    EXPERT_REVIEW: "Expert review",
    STUDENT_REVISION: "Student revision",
    CLOSED: "Closed",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f1] text-[#15342d] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!student || !school) {
    return (
      <div className="min-h-screen bg-[#f4f6f1] text-[#15342d] flex items-center justify-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-bold tracking-[.18em] text-emerald-700">STUDENT ACCESS</p>
          <h1 className="mt-3 font-serif text-3xl text-emerald-950">Your live school data is not active yet.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Please sign in with your verified student account or ask your school administrator to approve your school membership before you can view real records.
          </p>
          <Link href="/auth" className={cn(buttonVariants(), "mt-6")}>Sign in</Link>
        </div>
      </div>
    );
  }

  const statItems = [
    { label: "Verified records", value: stats.verified_observations, note: "School-wide", icon: Leaf, tone: "bg-lime-100 text-lime-800" },
    { label: "Awaiting review", value: stats.pending_observations, note: "Usually under 24h", icon: ClipboardCheck, tone: "bg-amber-100 text-amber-800" },
    { label: "Active projects", value: stats.active_projects, note: "School initiatives", icon: FolderKanban, tone: "bg-violet-100 text-violet-700" },
    { label: "Student observers", value: stats.student_count, note: "Including you", icon: Users, tone: "bg-emerald-100 text-emerald-800" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f1] text-[#15342d] lg:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#0b4436] px-5 py-7 text-white lg:flex">
        <Logo />
        <nav className="mt-12 grid gap-1.5" aria-label="Primary navigation">
          {navigation.map(({ label, href, icon: Icon, active }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-emerald-100/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-300/20",
                active && "bg-lime-50 text-emerald-950 hover:bg-lime-50 hover:text-emerald-950"
              )}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-white/10 bg-white/[.07] p-4">
          <p className="text-[10px] font-bold tracking-[.18em] text-emerald-100/65">FIELD PROGRESS</p>
          <p className="mt-2 text-sm font-semibold">{stats.verified_observations} verified</p>
          <p className="mt-2 text-xs text-emerald-100/65">{stats.pending_observations} awaiting review</p>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
          <span className="grid size-10 place-items-center rounded-full bg-lime-200 text-xs font-black text-emerald-950">
            {student.display_name.charAt(0).toUpperCase()}
          </span>
          <span className="grid gap-0.5">
            <strong className="text-xs">{student.display_name}</strong>
            <small className="text-[10px] text-emerald-100/60">Student</small>
          </span>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7">
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="grid size-9 place-items-center rounded-lg bg-lime-100 text-[10px] font-black text-emerald-900">
              {school.name.substring(0, 2).toUpperCase()}
            </span>
            <span className="grid gap-0.5">
              <small className="text-[9px] font-bold tracking-[.14em] text-slate-400">YOUR SCHOOL</small>
              <strong className="text-xs">{school.name}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="relative grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Notifications" onClick={() => setNotificationsOpen((open) => !open)}>
              <Bell className="size-[18px]" />
              {notifications.some((notification) => !notification.read_at) && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-orange-500" />}
            </button>
            {notificationsOpen && <div className="absolute right-4 top-14 z-40 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl"><div className="flex items-center justify-between"><strong className="text-sm text-emerald-950">Notifications</strong><button type="button" className="text-[10px] font-bold text-emerald-700" onClick={async () => { await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", student.id).is("read_at", null); setNotifications((current) => current.map((notification) => ({ ...notification, read_at: notification.read_at || new Date().toISOString() }))); }}>Mark all read</button></div><div className="mt-3 grid max-h-80 gap-2 overflow-y-auto">{notifications.length === 0 ? <p className="text-xs text-slate-500">No review notifications yet.</p> : notifications.map((notification) => <button type="button" key={notification.id} onClick={async () => { if (!notification.read_at) { await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notification.id).eq("user_id", student.id); setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item)); } }} className={`rounded-lg border p-3 text-left ${notification.read_at ? "border-slate-100 bg-slate-50" : "border-lime-300 bg-lime-50"}`}><strong className="block text-xs text-emerald-950">{notification.title}</strong><span className="mt-1 block text-[11px] leading-5 text-slate-600">{notification.body}</span><small className="mt-2 block text-[9px] text-slate-400">{new Date(notification.created_at).toLocaleDateString()}</small></button>)}</div></div>}
            <button className="hidden min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 md:flex">
              <CircleHelp className="size-4" />
              Need help?
            </button>
            <AccountMenu />
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-7 pb-24 sm:px-7 lg:px-9" id="overview">
          <section className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold tracking-[.18em] text-slate-400">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-emerald-950 sm:text-5xl">
                Good morning, {student.display_name.split(" ")[0]}.
              </h1>
              <p className="mt-2 text-sm text-slate-500">{school.name}'s living map is growing. What will you discover today?</p>
            </div>
            <Link href="/field" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
              <Plus className="size-4" />
              Record an observation
            </Link>
          </section>

          <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="School impact summary">
            {statItems.map(({ label, value, note, icon: Icon, tone }) => (
              <article key={label} className="flex min-h-24 items-center gap-3.5 rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_3px_14px_rgba(27,55,47,.035)]">
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", tone)}>
                  <Icon className="size-5" />
                </span>
                <div>
                  <small className="text-[9px] font-bold tracking-[.12em] text-slate-400">{label.toUpperCase()}</small>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <strong className="font-serif text-3xl font-medium text-emerald-950">{value}</strong>
                    <span className="text-[10px] text-slate-500">{note}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,.75fr)]" id="reviews">
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[9px] font-bold tracking-[.15em] text-slate-400">YOUR FIELDWORK</p>
                  <h2 className="mt-1 font-serif text-xl">Recent observations</h2>
                </div>
                <a href="#reviews" className="flex items-center text-xs font-bold text-emerald-800">
                  View all <ChevronRight className="size-4" />
                </a>
              </div>
              <div className="px-5 pb-3">
                {observations.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3">No observations recorded yet. Start capturing biodiversity!</p>
                ) : (
                  observations.map(({ id, scientific_name, common_name, observation_type, verification_status, review_stage, observed_at }) => (
                    <div key={id} className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-3">
                      <span
                        className={cn(
                          "grid size-10 place-items-center rounded-lg",
                          verification_status === "VERIFIED" ? "bg-lime-100 text-lime-800" : "bg-amber-100 text-amber-800"
                        )}
                      >
                        <Leaf className="size-[18px]" />
                      </span>
                      <span>
                        <strong className="block text-xs">{scientific_name || common_name || observation_type}</strong>
                        <small className="mt-1 block text-[10px] text-slate-400">
                          {observation_type} · {new Date(observed_at).toLocaleDateString()}
                        </small>
                      </span>
                      <Badge className={verification_status === "VERIFIED" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}>
                        <span className="size-1.5 rounded-full bg-current" />
                        {stageLabel[review_stage] || verification_status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/10 bg-[#0b4436] px-3 py-2 text-emerald-100 lg:hidden" aria-label="Mobile navigation">
          <a href="#overview" className="grid justify-items-center gap-1 p-1 text-[9px]">
            <LayoutDashboard className="size-5" />
            Home
          </a>
          <Link href="/field" className="grid justify-items-center gap-1 p-1 text-[9px]">
            <Plus className="size-5" />
            Capture
          </Link>
          <a href="#reviews" className="grid justify-items-center gap-1 p-1 text-[9px]">
            <MapPin className="size-5" />
            Records
          </a>
          <a href="#field" className="grid justify-items-center gap-1 p-1 text-[9px]">
            <ClipboardCheck className="size-5" />
            Mission
          </a>
        </nav>
      </div>
    </div>
  );
}
