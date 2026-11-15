import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mivafix.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a2540",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "MivaFix",
  title: {
    default: "MivaFix | Campus Repairs, Done Right the First Time | MIVA Open University",
    template: "%s | MivaFix Campus Maintenance",
  },
  description:
    "Official campus maintenance and service request platform for MIVA Open University. Log hostel, lecture hall, electrical, plumbing, and IT faults from your phone and track technician progress live.",
  keywords: [
    "MivaFix",
    "MIVA Open University",
    "campus maintenance system",
    "university facility management",
    "fault reporting portal",
    "hostel maintenance request",
    "service request tracking",
    "MIT 8333",
    "facilities helpdesk Nigeria",
  ],
  authors: [{ name: "MIVA Open University Facilities & IT Team" }],
  creator: "MIVA Open University",
  publisher: "MIVA Open University",
  category: "Education & Facility Management",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "MivaFix | MIVA Open University",
    title: "MivaFix | Campus Repairs, Done Right the First Time.",
    description:
      "Don't wonder if your maintenance complaint was ever read. Log any hostel, lecture hall, or office fault from your phone and track the technician's progress live.",
    images: [
      {
        url: "/images/miva-logo.png",
        width: 512,
        height: 512,
        alt: "MivaFix Campus Maintenance Portal for MIVA Open University",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MivaFix | Campus Repairs, Done Right the First Time.",
    description:
      "Log any hostel, lecture hall, or office fault at MIVA Open University from your phone and track the technician's progress live.",
    images: ["/images/miva-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" data-theme="light" className={poppins.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
