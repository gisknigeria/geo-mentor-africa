import type { Metadata } from "next";
import { FieldCapture } from "./FieldCapture";

export const metadata: Metadata = {
  title: "Record an observation | GeoMentor Africa",
  description: "Capture a school biodiversity observation with a photo and GPS evidence.",
};

export default function FieldCapturePage() {
  return <FieldCapture />;
}
