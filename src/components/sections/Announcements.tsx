"use client";

import React from "react";
import { Announcement } from "@/types";
import { Megaphone, ExternalLink, ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import SectionCard from "../ui/SectionCard";

interface AnnouncementsProps {
  announcements: Announcement[];
}

export default function Announcements({ announcements = [] }: AnnouncementsProps) {
  if (!announcements || announcements.length === 0) return null;

  // Duplicate the array to create a seamless infinite scrolling effect
  // If the array is too short, duplicate it multiple times to fill the screen
  const repeatedAnnouncements = [...announcements, ...announcements, ...announcements, ...announcements];

  return (
    <SectionCard>
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <SectionHeading title="ANNOUNCEMENTS" />
      </div>

      {/* Marquee Container */}
      <div className="w-full relative flex overflow-x-hidden group">
        {/* Left/Right Fade gradients for smooth entering/exiting */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee min-w-max gap-8 px-4 py-4">
          {repeatedAnnouncements.map((ann, idx) => (
            <div 
              key={`${ann.id}-${idx}`} 
              className="w-[320px] sm:w-[420px] h-[280px] flex-shrink-0 group/card relative rounded-2xl transition-all duration-500 cursor-pointer neumorphic-raised neumorphic-hover-raised"
            >
              
              <div className="w-full h-full relative z-10 rounded-2xl overflow-hidden flex flex-col">
                
                {/* Image Section */}
                <div className="relative h-36 w-full overflow-hidden border-b border-white/5">
                  <img 
                    src={ann.image} 
                    alt={ann.title}
                    className="w-full h-full object-cover opacity-70 group-hover/card:scale-110 group-hover/card:opacity-100 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                  
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg backdrop-blur-md text-[9px] font-black tracking-widest uppercase text-white shadow-xl flex items-center gap-2">
                    {ann.date}
                  </div>

                  {ann.link && (
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1 relative">
                  
                  <h3 className="text-xl font-heading font-bold text-white mb-2 group-hover/card:text-cyan-300 transition-colors line-clamp-1 relative z-10">
                    {ann.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed relative z-10 group-hover/card:text-slate-300 transition-colors">
                    {ann.description}
                  </p>

                  {/* Read More Footer */}
                  <div className="mt-auto relative z-10 flex items-center justify-between border-t border-white/5 pt-4 group-hover/card:border-cyan-500/30 transition-colors">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover/card:text-cyan-400 transition-colors">
                      Read Announcement
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover/card:text-cyan-400 group-hover/card:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
