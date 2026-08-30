"use client";

import { useState } from "react";
import { ArrowLeft, Building2, GraduationCap, MapPin, School, University } from "lucide-react";

const scopes = {
  africa: {
    eyebrow: "AFRICA OVERVIEW", title: "Schools across the network", count: "1,284 schools in 18 countries", next: "nigeria" as const,
    areas: [{name:"Nigeria",count:286,x:48,y:48},{name:"Ghana",count:94,x:38,y:53},{name:"Kenya",count:171,x:67,y:57},{name:"South Africa",count:208,x:55,y:84},{name:"Rwanda",count:63,x:62,y:61}],
  },
  nigeria: {
    eyebrow: "NIGERIA", title: "Participation by state", count: "286 schools across 22 states", next: "oyo" as const,
    areas: [{name:"Oyo",count:48,x:37,y:57},{name:"Lagos",count:41,x:31,y:70},{name:"FCT",count:34,x:56,y:37},{name:"Kaduna",count:29,x:48,y:23},{name:"Rivers",count:21,x:52,y:76}],
  },
  oyo: {
    eyebrow: "OYO STATE", title: "Registered school locations", count: "48 schools · exact locations shown only where permitted", next: null,
    areas: [{name:"Staff School",count:0,x:42,y:45,type:"Secondary"},{name:"Community Primary",count:0,x:26,y:64,type:"Primary"},{name:"University Demo",count:0,x:67,y:35,type:"Tertiary"},{name:"Bodija College",count:0,x:61,y:67,type:"Secondary"},{name:"Greenfield School",count:0,x:35,y:28,type:"Primary"}],
  },
};

type Scope = keyof typeof scopes;

export function AfricaImpactMap() {
  const [scope, setScope] = useState<Scope>("africa");
  const current = scopes[scope];
  return <section className="bg-[#e7eadf] px-5 py-20 sm:px-8" id="map"><div className="mx-auto max-w-[1440px]"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-[10px] font-black tracking-[.18em] text-emerald-700">A NETWORK YOU CAN SEE</p><h2 className="mt-4 max-w-3xl font-serif text-5xl leading-tight text-emerald-950 sm:text-6xl">From a continental picture to the school gate.</h2></div><p className="max-w-lg text-sm leading-7 text-slate-600">Explore programme reach at country, state and school level. Colours distinguish primary, secondary and tertiary institutions; sensitive coordinates remain generalized.</p></div><div className="mt-10 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1.55fr)_minmax(310px,.65fr)]"><div className="relative min-h-[560px] overflow-hidden bg-[#dbe7d1]">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#63806e_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute inset-[9%] rounded-[40%_55%_44%_60%] border border-emerald-900/10 bg-[radial-gradient(circle_at_30%_25%,#edf2df,transparent_32%),linear-gradient(145deg,#c8d9b8,#a9c7a4)] shadow-inner" />
      {current.areas.map((area) => { const color = "type" in area ? area.type === "Primary" ? "bg-amber-500" : area.type === "Secondary" ? "bg-indigo-600" : "bg-emerald-700" : "bg-emerald-800"; return <button key={area.name} type="button" onClick={() => current.next && setScope(current.next)} className="group absolute -translate-x-1/2 -translate-y-1/2 text-left" style={{left:`${area.x}%`,top:`${area.y}%`}}><span className={`grid size-9 place-items-center rounded-full border-4 border-white text-white shadow-lg transition group-hover:scale-110 ${color}`}><MapPin className="size-4" /></span><span className="absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[9px] font-black text-emerald-950 shadow">{area.name}{area.count ? ` · ${area.count}` : ""}</span></button>; })}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 rounded-lg bg-white/90 p-3 text-[9px] font-bold shadow"><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-amber-500" />Primary</span><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-indigo-600" />Secondary</span><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-emerald-700" />Tertiary</span></div>
    </div><aside className="p-7 sm:p-8"><div className="flex items-center justify-between"><span className="text-[9px] font-black tracking-[.16em] text-emerald-700">{current.eyebrow}</span>{scope !== "africa" && <button type="button" onClick={() => setScope(scope === "oyo" ? "nigeria" : "africa")} className="flex items-center gap-1 text-[9px] font-black text-slate-500"><ArrowLeft className="size-3.5" />Back</button>}</div><h3 className="mt-5 font-serif text-4xl leading-tight text-emerald-950">{current.title}</h3><p className="mt-3 text-sm text-slate-500">{current.count}</p><div className="mt-8 grid gap-3">{current.areas.slice(0,5).map((area, i) => <button type="button" key={area.name} onClick={() => current.next && setScope(current.next)} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#f7f8f4] p-3 text-left hover:border-emerald-300"><span className="grid size-9 place-items-center rounded-lg bg-white text-emerald-800">{i % 3 === 0 ? <School className="size-4" /> : i % 3 === 1 ? <GraduationCap className="size-4" /> : <University className="size-4" />}</span><span className="flex-1"><strong className="block text-xs">{area.name}</strong><small className="mt-1 block text-[9px] text-slate-400">{"type" in area ? String(area.type) : `${area.count} participating schools`}</small></span>{current.next && <span className="text-emerald-700">→</span>}</button>)}</div><div className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5"><Building2 className="size-5 text-emerald-700" /><p className="text-[10px] leading-4 text-slate-500"><strong className="block text-emerald-950">Privacy-aware by default</strong>Public views aggregate young people and generalize sensitive locations.</p></div></aside></div></div></section>;
}
