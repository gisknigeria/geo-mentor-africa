import type { Metadata } from "next";
import { ObservationsExplorer } from "./ObservationsExplorer";

export const metadata: Metadata = {
  title: "Biodiversity observations",
  description: "Explore school biodiversity records, verification status and Geo-Mentor review discussions.",
};

export default function ObservationsPage() { return <ObservationsExplorer />; }
