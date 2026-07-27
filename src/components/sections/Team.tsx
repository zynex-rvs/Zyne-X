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
    <div className="w-[280px] neumorphic-raised rounded-[2rem] p-5 relative group cursor-pointer hover:-translate-y-2 transition-all duration-500 flex flex-col gap-4">
      {/* Image Area */}
      <div className="w-full h-[200px] relative rounded-[1.5rem] overflow-hidden neumorphic-inset">
        {imageErrors[admin.name] || !admin.image ? (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-5xl font-heading font-bold text-white/20">
            {initials}
          </div>
        ) : (
          <img
            src={admin.image}
            alt={admin.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 hover:opacity-100"
            onError={() => handleImageError(admin.name)}
          />
        )}
        
        {/* Cyber accents (top left/right) */}
        <div className="absolute top-3 left-3 text-[8px] font-mono text-cyan-500/80 tracking-widest uppercase z-10 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md border border-white/5">
          ID://{admin.role.substring(0, 4)}
        </div>
        <div className="absolute top-3 right-3 flex gap-1 z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40" />
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col items-center text-center">
        <div className="px-3 py-1 mb-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-bold uppercase tracking-widest text-cyan-400">
          {admin.role}
        </div>
        <h3 className="text-lg font-heading font-bold text-white tracking-wide">
          {admin.name}
        </h3>
        <p className="text-slate-400 text-[10px] font-mono tracking-widest mt-1">
          CLASS OF {admin.year}
        </p>
      </div>
      
      {/* Footer / Social Links */}
      <div className="flex items-center justify-center gap-4 mt-1 pt-4 border-t border-white/5">
        <a 
          href={admin.linkedin || "#"} 
          target={admin.linkedin ? "_blank" : "_self"}
          rel={admin.linkedin ? "noopener noreferrer" : ""}
          className={`w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center text-white/50 hover:text-cyan-400 transition-colors ${!admin.linkedin && "opacity-50 cursor-not-allowed"}`} 
          title="LinkedIn"
          onClick={(e) => !admin.linkedin && e.preventDefault()}
        >
          <i className="fab fa-linkedin text-sm"></i>
        </a>
        <a 
          href={admin.phone ? `tel:${admin.phone}` : "#"} 
          className={`w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center text-white/50 hover:text-cyan-400 transition-colors ${!admin.phone && "opacity-50 cursor-not-allowed"}`} 
          title="Phone"
          onClick={(e) => !admin.phone && e.preventDefault()}
        >
          <Phone className="w-4 h-4" />
        </a>
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
