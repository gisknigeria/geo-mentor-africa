import type { Metadata } from "next";
import { RolePortal } from "./RolePortal";

export const metadata: Metadata = { title: "My portal", description: "Open your approved GeoMentor Africa workspace." };

export default function PortalPage() { return <RolePortal />; }
