"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Users } from "lucide-react";
import { Card } from "../ui/Card";
import { Administrator } from "@/types";
import SectionHeading from "../ui/SectionHeading";
import SectionCard from "../ui/SectionCard";

interface TeamProps {
  admins: Administrator[];
}

function AdminCard({ admin, imageErrors, handleImageError }: { admin: Administrator; imageErrors: Record<string, boolean>; handleImageError: (name: string) => void }) {
  const initials = admin.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="w-[280px] h-[320px] relative group cursor-pointer hover:-translate-y-2 transition-transform duration-500">
      <div className="relative w-full h-full flex flex-col rounded-xl overflow-hidden z-10 transition-all duration-500 neumorphic-raised neumorphic-hover-raised">
      {/* Image Area filling the top section */}
      <div className="flex-1 relative w-full overflow-hidden">
        {imageErrors[admin.name] || !admin.image ? (
          <div className="w-full h-full flex items-center justify-center bg-white/5 text-5xl font-heading font-bold text-white/20">
            {initials}
          </div>
        ) : (
          <img
            src={admin.image}
            alt={admin.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={() => handleImageError(admin.name)}
          />
        )}
        
        {/* Gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 z-0 pointer-events-none" />

        {/* Cyber accents (top left/right) */}
        <div className="absolute top-4 left-4 text-[8px] font-mono text-cyan-500/80 tracking-widest uppercase z-10">
          ID://{admin.role.substring(0, 4)}
        </div>
        <div className="absolute top-4 right-4 flex gap-1 z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40" />
        </div>

        {/* Content Area overlaying the bottom of the image */}
        <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col items-start justify-end z-10">
          <div className="px-3 py-1 mb-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[9px] font-bold uppercase tracking-widest text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.2)] backdrop-blur-md">
            {admin.role}
          </div>
          <h3 className="text-xl font-heading font-bold text-white tracking-wide drop-shadow-lg">
            {admin.name}
          </h3>
          <p className="text-white/70 text-[10px] font-mono tracking-widest mt-1 drop-shadow-md">
            CLASS OF {admin.year}
          </p>
        </div>
      </div>
      
      {/* Footer / Social Links */}
      <div className="flex items-center justify-between p-4 bg-black/80 border-t border-white/10 relative z-10 w-full backdrop-blur-xl">
        <div className="flex items-end gap-[2px]">
          {/* Simulated barcode */}
          {[12, 18, 14, 20, 10, 16, 14, 22].map((height, i) => (
            <div key={i} className="w-1 bg-white/20 group-hover:bg-cyan-500/40 transition-colors" style={{ height: `${height}px` }} />
          ))}
        </div>
        <div className="flex gap-4 text-white/50 items-center bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <a 
            href={admin.linkedin || "#"} 
            target={admin.linkedin ? "_blank" : "_self"}
            rel={admin.linkedin ? "noopener noreferrer" : ""}
            className={`hover:text-cyan-300 transition-colors duration-300 ${!admin.linkedin && "opacity-50 cursor-not-allowed"}`} 
            title="LinkedIn"
            onClick={(e) => !admin.linkedin && e.preventDefault()}
          >
            <i className="fab fa-linkedin text-sm drop-shadow-md"></i>
          </a>
          <a 
            href={admin.phone ? `tel:${admin.phone}` : "#"} 
            className={`hover:text-cyan-300 transition-colors duration-300 ${!admin.phone && "opacity-50 cursor-not-allowed"}`} 
            title="Phone"
            onClick={(e) => !admin.phone && e.preventDefault()}
          >
            <Phone className="w-4 h-4 drop-shadow-md" />
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function Team({ admins }: TeamProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (name: string) => {
    setImageErrors((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <SectionCard id="admins">
        <div className="col-span-12 flex flex-col items-center justify-center text-center mb-10">
          <SectionHeading title="THE TEAM" />
        </div>
        
        <div className="admin-scroll-container overflow-x-auto pb-8 no-scrollbar -mx-4 px-4">
          <div className="admin-grid flex gap-8 min-w-max">
            {(admins || []).map((admin) => (
              <AdminCard 
                key={admin.name} 
                admin={admin} 
                imageErrors={imageErrors} 
                handleImageError={handleImageError} 
              />
            ))}
          </div>
        </div>
    </SectionCard>
  );
}
