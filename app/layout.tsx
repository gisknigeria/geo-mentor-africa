import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.geomentorafrica.com"),
  title: {
    default: "GeoMentor Africa",
    template: "%s | GeoMentor Africa",
  },
  description: "A spatial learning and biodiversity platform connecting African schools, Geo-Mentors and Geo-Partners.",
  openGraph: {
    title: "GeoMentor Africa",
    description: "Schools, Geo-Mentors and Geo-Partners mapping biodiversity and growing visible impact across Africa.",
    type: "website",
    images: [{ url: "/og.png", width: 1733, height: 907, alt: "Students and a mentor documenting biodiversity in a school garden" }],
  },
  twitter: { card: "summary_large_image", title: "GeoMentor Africa", description: "Map what lives. Grow what matters.", images: ["/og.png"] },
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
