import type { Metadata } from "next";
import { ExpertReview } from "./ExpertReview";

export const metadata: Metadata = { title: "Expert review | GeoMentor Africa", description: "Validate school biodiversity observations." };

export default function ExpertReviewPage() { return <ExpertReview />; }
