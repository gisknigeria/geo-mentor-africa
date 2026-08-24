import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.geomentorafrica.com"),
  title: {
    default: "GeoMentor Africa",
    template: "%s | GeoMentor Africa",
  },
  description: "A secure, spatial learning and biodiversity platform connecting African students, schools, mentors and experts.",
  openGraph: {
    title: "GeoMentor Africa",
    description: "Mentor. Map. Observe. Conserve.",
    type: "website",
    images: [{ url: "/og.png", width: 1733, height: 907, alt: "Students and a mentor documenting biodiversity in a school garden" }],
  },
  twitter: { card: "summary_large_image", title: "GeoMentor Africa", description: "Mentor. Map. Observe. Conserve.", images: ["/og.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
