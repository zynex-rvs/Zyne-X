"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Award, Code, CheckCircle } from "lucide-react";

interface TimelineItem {
  title: string;
  date: string;
  end: string;
  side: "left" | "right";
  icon: React.ReactNode;
}

interface TimelineProps {
  timelineData?: string[];
}

export default function Timeline({ timelineData }: TimelineProps) {
  const fallbackItems: TimelineItem[] = [
    {
      title: "Registration Commences",
      date: "September 12, 2026",
      end: "Closing Date: Sept 18, 2026",
      side: "left",
      icon: <Calendar className="w-4 h-4 text-white" />,
    },
    {
      title: "Problem Statement Selection",
      date: "September 15, 2026",
      end: "Selection Deadline: Sept 17, 2026",
      side: "right",
      icon: <Code className="w-4 h-4 text-white/70" />,
    },
    {
      title: "Internal Hackathon Hack",
      date: "September 20, 2026",
      end: "Hack Duration: 24 Hours",
      side: "left",
      icon: <Award className="w-4 h-4 text-white/60" />,
    },
    {
      title: "Results & Nominations",
      date: "September 21, 2026",
      end: "Nominations submitted to AICTE SIH Portal",
      side: "right",
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const icons = [
    <Calendar key="cal" className="w-4 h-4 text-amber-300" />,
    <Code key="code" className="w-4 h-4 text-amber-300/80" />,
    <Award key="award" className="w-4 h-4 text-amber-300/70" />,
    <CheckCircle key="check" className="w-4 h-4 text-amber-400" />,
  ];

  const items: TimelineItem[] = timelineData && timelineData.length > 0
    ? timelineData.map((str, idx) => {
        const parts = str.split("|").map(s => s.trim());
        return {
          title: parts[0] || "",
          date: parts[1] || "",
          end: parts[2] || "",
          side: idx % 2 === 0 ? "left" : "right",
          icon: icons[idx % icons.length],
        };
      })
    : fallbackItems;

  return (
    <section id="timeline" className="py-20 relative overflow-hidden mt-12">
      
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] bg-magenta-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between mb-16 px-2">
          <h2 className="text-xl font-heading font-semibold text-white tracking-widest uppercase">Timeline</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-500/30 via-magenta-500/30 to-transparent ml-8"></div>
        </div>

        <div className="relative mt-8">
          {/* Glowing Vertical Neon Wire */}
          <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-500 to-magenta-500 md:-translate-x-1/2 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>

          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className={`mb-12 flex w-full relative ${
                item.side === "left" ? "md:justify-start" : "md:justify-end"
              } pl-14 md:pl-0`}
            >
              {/* Vertical center node - Desktop */}
              <div className="absolute top-[22px] left-[19px] md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-black border border-cyan-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] z-10 shrink-0 hidden md:flex transition-transform duration-500 hover:scale-125 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]">
                {item.icon}
              </div>

              {/* Mobile details node marker */}
              <div className="absolute top-[26px] left-[19px] -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] z-10 block md:hidden shrink-0" />

              {/* Box Content */}
              <div
                className={`w-full md:w-[45%] glass-panel p-8 rounded-2xl relative group hover:border-cyan-500/40 transition-all duration-500 overflow-hidden cursor-default`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest block mb-2 font-sans group-hover:text-cyan-300 transition-colors">
                  {item.date}
                </span>
                <h4 className="text-white text-xl font-heading font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyan-200 transition-all">
                  {item.title}
                </h4>
                <p className="text-white/50 text-sm leading-relaxed font-sans group-hover:text-white/70 transition-colors">
                  {item.end}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
