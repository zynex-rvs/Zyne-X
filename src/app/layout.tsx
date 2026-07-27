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

export const metadata = {
  title: "ZYNE-X | Department of AI & ML Hub",
  description: "ZYNE-X is the premier club of the Department of Artificial Intelligence & Machine Learning at RVS Technical Campus, Coimbatore.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer"
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
