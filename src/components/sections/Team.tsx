"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../ui/Card";
import { Administrator } from "@/types";
import SectionHeading from "../ui/SectionHeading";
import SectionCard from "../ui/SectionCard";

interface TeamProps {
  admins: Administrator[];
  subtitle?: string;
}

function AdminCard({ admin, imageErrors, handleImageError, isMobile }: { admin: Administrator; imageErrors: Record<string, boolean>; handleImageError: (name: string) => void; isMobile?: boolean }) {
  const initials = admin.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`${isMobile ? 'w-[220px]' : 'w-[280px]'} bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 relative group cursor-pointer hover:-translate-y-2 hover:bg-white/5 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-500 flex flex-col gap-4 shadow-xl`}>
      {/* Image Area */}
      <div className={`w-full ${isMobile ? 'h-[160px]' : 'h-[200px]'} relative rounded-[1.5rem] overflow-hidden neumorphic-inset`}>
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

function TeamCarousel({ admins, imageErrors, handleImageError }: { admins: Administrator[]; imageErrors: Record<string, boolean>; handleImageError: (name: string) => void }) {
  const [rotationIndex, setRotationIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const sortedAdmins = [...(admins || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  const n = sortedAdmins.length;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    if (n <= 1) return () => window.removeEventListener('resize', handleResize);
    const interval = setInterval(() => {
      setRotationIndex((prev) => prev + 1);
    }, 4000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [n]);

  const handleNext = () => setRotationIndex((prev) => prev + 1);
  const handlePrev = () => setRotationIndex((prev) => prev - 1);

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    
    if (distance > 50) {
      handleNext(); // Swipe left
    } else if (distance < -50) {
      handlePrev(); // Swipe right
    }
    setTouchStart(null);
  };

  if (!n) return null;

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const angle = 360 / n;
  const cardWidth = isMobile ? 220 : 280;
  
  // Calculate cylinder radius
  let radius = 0;
  if (n > 2) {
    const padding = isMobile ? 20 : 60;
    const minOverlap = isMobile ? 0.9 : 1.2;
    radius = Math.max(cardWidth * minOverlap, (cardWidth / 2) / Math.tan(Math.PI / n) + padding);
  } else if (n === 2) {
    radius = cardWidth;
  }

  // Adjust container scale to ensure cylinder fits on small screens
  // Without this, the neighbor cards are pushed outside the viewport bounds and clipped
  let containerScale = 1;
  if (isMobile) {
    // Estimate width of the cylinder: 2 * radius + cardWidth
    const estimatedWidth = (2 * radius) + cardWidth;
    if (estimatedWidth > windowWidth) {
      containerScale = (windowWidth * 0.9) / estimatedWidth;
    }
  } else if (isTablet) {
    const estimatedWidth = (2 * radius) + cardWidth;
    if (estimatedWidth > windowWidth) {
      containerScale = (windowWidth * 0.95) / estimatedWidth;
    }
  }

  return (
    <div 
      className={`relative w-full ${isMobile ? 'h-[400px]' : 'h-[550px]'} flex items-center justify-center overflow-hidden`} 
      style={{ perspective: isMobile ? '800px' : '1200px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Ambient Floor Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-[150px] md:mt-[220px] w-[300px] md:w-[600px] h-[50px] md:h-[150px] bg-cyan-500/20 blur-[50px] md:blur-[80px] rounded-[100%] pointer-events-none" style={{ transform: 'rotateX(75deg)' }} />

      <motion.div
        className="relative flex items-center justify-center w-full h-full"
        animate={{ 
          rotateY: rotationIndex * -angle, 
          z: n > 1 ? -radius : 0,
          scale: containerScale 
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 1 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {sortedAdmins.map((admin, i) => {
          // Determine if this card is currently front-facing
          const normalizedRotation = ((rotationIndex % n) + n) % n;
          const isActive = i === normalizedRotation;
          
          return (
            <div
              key={admin.name}
              className="absolute flex items-center justify-center"
              style={{
                transform: n > 1 ? `rotateY(${i * angle}deg) translateZ(${radius}px)` : 'none',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <div 
                className={`transition-all duration-700 ${!isActive ? 'opacity-30 scale-90 pointer-events-none' : 'opacity-100 scale-100 cursor-pointer'}`}
              >
                <AdminCard 
                  admin={admin} 
                  imageErrors={imageErrors} 
                  handleImageError={handleImageError}
                  isMobile={isMobile}
                />
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Navigation Controls */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-6 z-[60]">
        <button onClick={handlePrev} className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center text-cyan-400 hover:text-white hover:bg-white/5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={handleNext} className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center text-cyan-400 hover:text-white hover:bg-white/5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default function Team({ admins, subtitle }: TeamProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (name: string) => {
    setImageErrors((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <SectionCard id="admins">
        <div className="col-span-12 flex flex-col items-center justify-center text-center mb-10">
          <SectionHeading title="THE TEAM" subtitle={subtitle} />
        </div>
        
        <TeamCarousel admins={admins} imageErrors={imageErrors} handleImageError={handleImageError} />
    </SectionCard>
  );
}
