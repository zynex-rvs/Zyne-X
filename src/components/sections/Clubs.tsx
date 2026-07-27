"use client";

import React from "react";
import { ArrowRight, Brain, Zap, Code, Shield, Network, Grid } from "lucide-react";
import { Club } from "@/types";
import SectionHeading from "../ui/SectionHeading";
import SectionCard from "../ui/SectionCard";

interface ClubsProps {
  clubs?: Club[];
}

const IconMap: Record<string, any> = {
  Brain, Zap, Code, Shield, Network
};

export default function Clubs({ clubs = [] }: ClubsProps) {
  if (clubs.length === 0) return null;

  return (
    <SectionCard id="clubs">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <SectionHeading title="CLUBS" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

      {clubs.map((club, index) => {
        const IconComponent = IconMap[club.icon] || Zap;

        return (
          <div key={club.id} className="group relative flex flex-col justify-end min-h-[320px] cursor-pointer rounded-xl transition-all duration-500 overflow-hidden neumorphic-raised neumorphic-hover-raised">

            {/* Image Background */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
              {club.image ? (
                <img 
                  src={club.image} 
                  alt={club.name} 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-1000 ease-out" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                  <IconComponent className="w-48 h-48 drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]" />
                </div>
              )}
              {/* Glass Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            
            {/* Content Pushed to Bottom */}
            <div className="p-8 relative z-10 flex flex-col transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 flex items-center justify-center mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-700 group-hover:-translate-y-2">
                 <IconComponent className="w-5 h-5 text-white group-hover:text-cyan-300 transition-colors duration-500 drop-shadow-md" />
              </div>

              <h3 className="text-2xl font-heading font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyan-200 transition-all duration-500 drop-shadow-md">
                {club.name}
              </h3>
              
              {club.subtitle && (
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-4 text-blue-400/80">
                  {club.subtitle}
                </h4>
              )}
              
              <p className="text-white/60 text-sm leading-relaxed mb-6 font-sans line-clamp-2 group-hover:line-clamp-none transition-all duration-700">
                {club.description}
              </p>
              
              <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-blue-400 transition-colors duration-500">
                Explore <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
              </div>
            </div>

          </div>
        );
      })}
      </div>
    </SectionCard>
  );
}
