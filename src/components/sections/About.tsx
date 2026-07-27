"use client";

import React from "react";
import { Sparkles, Target, Zap, Rocket } from "lucide-react";

export default function About() {
  return (
    <>
      <div id="about" className="col-span-12 mt-24 flex flex-col items-center justify-center text-center mb-12">
        <div className="aivera-badge">Who We Are</div>
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">One Workspace That Brings<br />Everything Together</h2>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">ZYNE-X is the official association of the Department of Artificial Intelligence & Machine Learning.</p>
      </div>

      {/* Main Vision Bento Box */}
      <section className="col-span-12 lg:col-span-8 glass-card p-10 md:p-14 lg:p-20 flex flex-col justify-center min-h-[450px] relative group hover:-translate-y-2 transition-transform duration-500">

        <div className="relative z-10 w-full flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-2 group-hover:border-cyan-500/40 transition-colors duration-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              <span>Our Vision</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-tight">
              Pioneering the <br /> Future of AI.
            </h2>
            
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mt-2 group-hover:w-32 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
          </div>

          <div className="flex-1 flex flex-col gap-6 relative">
            
            <p className="text-white/90 font-sans leading-relaxed text-lg font-medium tracking-wide">
              <strong className="text-white font-bold tracking-wider drop-shadow-md">ZYNE-X</strong> is the official association of the Department of Artificial Intelligence & Machine Learning, established to cultivate innovation and technical excellence.
            </p>
            <p className="text-white/60 font-sans leading-relaxed text-base">
              We empower the next generation of AI professionals by exploring emerging technologies, mastering complex algorithms, and contributing innovative solutions to real-world challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Side Stats Bento Boxes */}
      <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card flex-1 p-8 relative group flex flex-col justify-center hover:scale-105 transition-transform duration-500">
          <Target className="w-8 h-8 text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          <div className="text-5xl font-heading font-black text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">2023</div>
          <div className="text-cyan-200/50 text-xs font-semibold uppercase tracking-widest">Year Established</div>
        </div>
        
        <div className="glass-card flex-1 p-8 relative group flex flex-col justify-center hover:scale-105 transition-transform duration-500">
          <Rocket className="w-8 h-8 text-purple-400 mb-6 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]" />
          <div className="text-5xl font-heading font-black text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">150+</div>
          <div className="text-purple-200/50 text-xs font-semibold uppercase tracking-widest">Active Members</div>
        </div>
      </section>
    </>
  );
}
