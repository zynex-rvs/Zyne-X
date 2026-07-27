"use client";

import React from "react";

export default function Background() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black pointer-events-none" aria-hidden="true">
      {/* Global starry background */}
      <div className="global-particles" />
      
      {/* Glassmorphism ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-[float-orb-1_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen animate-[float-orb-2_25s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-cyan-600/10 blur-[150px] mix-blend-screen" />
    </div>
  );
}
