import type { Metadata } from "next";
import { SchoolMap } from "./SchoolMap";

export const metadata: Metadata = { title: "School biodiversity map", description: "Explore privacy-safe school biodiversity observations and GIS layers." };
export default function MapPage() { return <SchoolMap />; }
