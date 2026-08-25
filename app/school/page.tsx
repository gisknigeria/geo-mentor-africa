import type { Metadata } from "next";
import { SchoolOperations } from "./SchoolOperations";

export const metadata: Metadata = { title: "School operations | GeoMentor Africa", description: "Manage students, field observations and school biodiversity review workflows." };

export default function SchoolOperationsPage() { return <SchoolOperations />; }
