import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import React from "react";

import SmoothScroll from "@/components/layout/SmoothScroll";
import Background3D from "@/components/layout/Background3D";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space",
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZYNE-X & NEXAURA | Official AI & ML Association at RVS iTech",
  description: "ZYNE-X and NEXAURA form the official Department Association for AI & ML at RVS Technical Campus, Coimbatore. Join the RIVALS community to explore technology.",
  keywords: ["ZYNEX", "NEXAURA", "RIVALS", "RVS iTech", "zynex rvs", "zynex aiml", "nexaura rvs", "association of zynex and nexaura", "rvs institute of technology", "rvs technical campus coimbatore"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "ZYNE-X & NEXAURA | Official AI & ML Association",
    description: "The premier AI & ML Department Association at RVS Technical Campus, Coimbatore.",
    url: '/',
    siteName: 'ZYNEX-NEXAURA',
    images: [
      {
        url: '/zynex-logo.png',
        width: 800,
        height: 600,
        alt: 'ZYNEX Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ZYNE-X & NEXAURA | Official AI & ML Association",
    description: "The premier AI & ML Department Association at RVS Technical Campus, Coimbatore.",
    images: ['/zynex-logo.png'],
  },
  other: {
    'geo.region': 'IN-TN',
    'geo.placename': 'Coimbatore',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "ZYNE-X & NEXAURA",
    "alternateName": "RIVALS",
    "url": process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    "logo": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/zynex-logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "zynex.rvs@gmail.com",
      "contactType": "customer support"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "3rd Floor, AI & ML Department, RVS Technical Campus",
      "addressLocality": "Coimbatore",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "IN"
    }
  };

  return (
    <html lang="en" className={`${jakarta.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SmoothScroll>
          <Background3D />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
