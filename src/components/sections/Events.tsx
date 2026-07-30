"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, MapPin, Award, Timer, Users } from "lucide-react";
import { Event } from "@/types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import SectionHeading from "../ui/SectionHeading";
import SectionCard from "../ui/SectionCard";

interface EventsProps {
  events: Event[];
  onRegisterClick: (event: Event) => void;
  onViewDetailsClick: (event: Event) => void;
}

export default function Events({ events, onRegisterClick, onViewDetailsClick }: EventsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Hackathon", "Coding", "Design", "Paper Presentation"];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === "All" || event.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <SectionCard id="events">
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <SectionHeading title="EVENTS" />
        </div>

        {/* Filters and search layout */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          {/* Categories Tab list */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border border-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    : "bg-white/5 text-slate-400 border border-white/10 hover:border-blue-400/30 hover:text-blue-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search event name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 neumorphic-inset rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Card lists */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p>No events found matching your search options.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16"
          >
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              >
                <EventCard
                  event={event}
                  onRegister={() => onRegisterClick(event)}
                  onViewDetails={() => onViewDetailsClick(event)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
    </SectionCard>
  );
}

// Inner Event Card Component with Countdown Timer support
interface EventCardProps {
  event: Event;
  onRegister: () => void;
  onViewDetails: () => void;
}

function EventCard({ event, onRegister, onViewDetails }: EventCardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [status, setStatus] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      
      let targetStr = event.registrationEndDate || event.date;
      let target = new Date(targetStr).getTime();
      
      if (event.registrationEndDate) {
        if (!event.registrationEndDate.includes("T")) {
          target = new Date(event.registrationEndDate + "T23:59:59").getTime();
        }
      } else if (event.date) {
        if (event.time) {
          if (event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            targetStr = `${event.date}T${event.time}`;
          } else {
            targetStr = `${event.date} 2026 ${event.time}`;
          }
          target = new Date(targetStr).getTime();
        }
      }

      if (isNaN(target)) {
        target = new Date(event.registrationEndDate || event.date).getTime();
      }

      if (isNaN(target)) {
        setTimeLeft("TBD");
        setStatus("upcoming");
        return;
      }

      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Finished");
        setStatus("past");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      let result = "";
      if (days > 0) result += `${days}d `;
      result += `${hours}h ${mins}m ${secs}s`;
      setTimeLeft(result);
      setStatus("upcoming");
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [event.date, event.time, event.registrationEndDate]);

  return (
    <div onClick={onViewDetails} className="cursor-pointer h-full relative group transition-transform duration-700 hover:-translate-y-2">
      <div className="relative flex flex-col h-full rounded-[2rem] overflow-hidden z-10 transition-all duration-500 neumorphic-raised neumorphic-hover-raised">
          <div className="relative h-36 w-full overflow-hidden border-b border-white/5">
            <img 
              src={event.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"} 
              alt={event.name} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
            {/* Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent" />
            
            {/* Timer Badge (Top Left) */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/80 border border-blue-500/30 rounded-lg backdrop-blur-md text-[10px] font-mono font-bold tracking-widest uppercase shadow-xl flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status === 'upcoming' ? 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'}`} />
              <span className={status === 'upcoming' ? 'text-blue-400' : 'text-red-400'}>
                {timeLeft}
              </span>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 p-6 flex flex-col relative">
            <h3 className="text-2xl font-heading font-bold text-white tracking-wide group-hover:text-blue-400 transition-colors mb-3 relative z-10 line-clamp-1">
              {event.name}
            </h3>
            <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed relative z-10 group-hover:text-neutral-300 transition-colors mb-8">
              {event.description}
            </p>

            {/* Info Metrics Grid */}
            <div className="grid grid-cols-2 gap-5 mt-auto relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <Calendar className="w-4 h-4 text-neutral-300 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Date</span>
                  <span className="text-xs text-white truncate font-medium">{event.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <MapPin className="w-4 h-4 text-neutral-300 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Venue</span>
                  <span className="text-xs text-white truncate font-medium">{event.venue}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <Users className="w-4 h-4 text-neutral-300 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Format</span>
                  <span className="text-xs text-white truncate font-medium">{(event as any).isTeamEvent ? `Team (Max ${(event as any).teamSize})` : "Solo"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-amber-500/30 group-hover:border-amber-500/60 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Award className="w-4 h-4 text-amber-400/80 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Organizer</span>
                  <span className="text-sm text-amber-400 truncate font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">{event.organizedBy || "ZYNE-X"}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8 relative z-10 pt-5 border-t border-white/5 group-hover:border-blue-500/20 transition-colors" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="flex-1 rounded-xl text-xs bg-white/5 hover:bg-white/10 border border-transparent transition-all" onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
                View Details
              </Button>
              {status === "upcoming" && (
                <Button size="sm" className="flex-1 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all border-none" onClick={(e) => { e.stopPropagation(); onRegister(); }}>
                  Register Now
                </Button>
              )}
            </div>
          </div>
          
        </div>
    </div>
  );
}
