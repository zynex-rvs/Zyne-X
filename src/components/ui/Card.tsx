"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "purple" | "cyan" | "pink" | "blue" | "none" | "green" | "yellow" | "orange";
}

export function Card({ children, className = "", glowColor = "cyan" }: CardProps) {
  const getGlowStyles = () => {
    switch (glowColor) {
      case "blue": 
        return { 
          border: `conic-gradient(transparent 0%, transparent 40%, rgba(59, 130, 246, 0.8) 48%, rgba(255,255,255,1) 50%, rgba(59, 130, 246, 0.8) 52%, transparent 60%, transparent 100%)`, 
        };
      case "purple": 
        return { 
          border: `conic-gradient(transparent 0%, transparent 40%, rgba(168, 85, 247, 0.8) 48%, rgba(255,255,255,1) 50%, rgba(168, 85, 247, 0.8) 52%, transparent 60%, transparent 100%)`, 
        };
      case "pink": 
        return { 
          border: `conic-gradient(transparent 0%, transparent 40%, rgba(236, 72, 153, 0.8) 48%, rgba(255,255,255,1) 50%, rgba(236, 72, 153, 0.8) 52%, transparent 60%, transparent 100%)`, 
        };
      case "cyan":
      default:
        return { 
          border: `conic-gradient(transparent 0%, transparent 40%, rgba(6, 182, 212, 0.8) 48%, rgba(255,255,255,1) 50%, rgba(6, 182, 212, 0.8) 52%, transparent 60%, transparent 100%)`, 
        };
    }
  };

  const colors = getGlowStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`glass-card p-6 md:p-8 ${className}`}
    >
      {/* Continuous Automatic Traveling Border Spotlight */}
      <div className="card-border-mask pointer-events-none absolute inset-0 rounded-xl z-10 overflow-hidden">
        <div 
          className="absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite]"
          style={{ background: colors.border }}
        />
      </div>
      
      {/* Card Content */}
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
