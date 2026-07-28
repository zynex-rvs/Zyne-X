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
          <div key={club.id} className="neumorphic-raised rounded-[2rem] p-5 relative group cursor-pointer hover:-translate-y-2 transition-all duration-500 flex flex-col gap-4">
            
            {/* Image Area */}
            <div className="w-full h-[180px] relative rounded-[1.5rem] overflow-hidden neumorphic-inset flex items-center justify-center">
              {club.image ? (
                <img 
                  src={club.image} 
                  alt={club.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" 
                  style={{ objectPosition: club.imagePosition || "center" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                  <IconComponent className="w-20 h-20 text-white/10 group-hover:text-cyan-500/20 transition-colors duration-500" />
                </div>
              )}
            </div>
            
            {/* Content Area */}
            <div className="flex flex-col items-center text-center px-2 flex-1">
              <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center mb-4 border border-white/5 group-hover:border-cyan-500/30 transition-colors -mt-10 relative z-10 bg-[#1a1a1a]">
                <IconComponent className="w-5 h-5 text-white/70 group-hover:text-cyan-400 transition-colors" />
              </div>

              <h3 className="text-xl font-heading font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors drop-shadow-md">
                {club.name}
              </h3>
              
              {club.subtitle && (
                <h4 className="text-[10px] font-mono tracking-widest uppercase mb-3 text-cyan-500/70">
                  {club.subtitle}
                </h4>
              )}
              
              <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                {club.description}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-white/5 flex justify-center">
              <div className="px-6 py-2 rounded-full neumorphic-inset text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-cyan-400 flex items-center gap-2 transition-colors">
                Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        );
      })}
      </div>
    </SectionCard>
  );
}
