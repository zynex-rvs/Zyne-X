"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, Calendar, MapPin, Timer } from "lucide-react";
import { Event } from "@/types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface EventsGalleryProps {
  events: Event[];
  onBack: () => void;
  onViewMore: (event: Event) => void;
  onRegister: (event: Event) => void;
  registeredEventIds: Set<string>;
}

export default function EventsGallery({
  events,
  onBack,
  onViewMore,
  onRegister,
  registeredEventIds,
}: EventsGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (eventId: string) => {
    setImageErrors((prev) => ({ ...prev, [eventId]: true }));
  };

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="events-page block py-10">
      <div className="events-page-header flex justify-between items-center mb-8 pb-4 border-b border-white/5">
        <h2 className="text-2xl font-bold font-outfit text-white">All Events Gallery</h2>
        <Button variant="ghost" size="sm" className="text-xs flex items-center gap-2" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
      </div>

      {/* Search component */}
      <div className="relative w-full max-w-md mx-auto mb-10">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search all hackathons, paper presentations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 neumorphic-inset rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-300"
        />
      </div>

      {/* Grid listing */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p>No events match your query parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <GalleryEventCard
              key={event.id}
              event={event}
              imageError={imageErrors[event.id]}
              onImageError={() => handleImageError(event.id)}
              onViewMore={() => onViewMore(event)}
              onRegister={() => onRegister(event)}
              isRegistered={registeredEventIds.has(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Inner Gallery Card with live timer updates
interface GalleryEventCardProps {
  event: Event;
  imageError?: boolean;
  onImageError: () => void;
  onViewMore: () => void;
  onRegister: () => void;
  isRegistered: boolean;
}

function GalleryEventCard({
  event,
  imageError,
  onImageError,
  onViewMore,
  onRegister,
  isRegistered,
}: GalleryEventCardProps) {
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

      let result = "";
      if (days > 0) result += `${days}d `;
      result += `${hours}h ${mins}m`;
      setTimeLeft(result);
      setStatus("upcoming");
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [event.date, event.time, event.registrationEndDate]);

  return (
    <Card glowColor={status === "upcoming" ? "purple" : "none"} className="flex flex-col h-full neumorphic-raised neumorphic-hover-raised rounded-[2rem] p-4">
      {/* Photo */}
      <div className="w-full h-44 rounded-xl overflow-hidden neumorphic-inset relative">
        {imageError || !event.image ? (
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={event.image}
            alt={event.name}
            onError={onImageError}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
          />
        )}

        {/* Live status badge */}
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
            status === "upcoming"
              ? "bg-white/10 text-white shadow-lg"
              : "bg-white/10 text-slate-400"
          }`}
        >
          {status}
        </div>

        {/* Live Timer */}
        {status === "upcoming" && (
          <div className="absolute top-3 left-3 bg-black/95 border border-white/30/30 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-white flex items-center gap-1 shadow-lg">
            <Timer className="w-3 h-3 text-white animate-pulse" />
            <span>{timeLeft}</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4 pt-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
            {event.category}
          </span>
          <h3 className="text-base font-bold text-slate-100 tracking-wide font-outfit truncate">
            {event.name}
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
            {event.description}
          </p>
        </div>

        {/* Location / Calendar parameters */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-2 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-1 truncate">
            <Calendar className="w-3.5 h-3.5 text-white shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-white/60 shrink-0" />
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Buttons actions */}
      <div className="flex gap-3 pt-4 border-t border-white/5 mt-4">
        <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={onViewMore}>
          Details
        </Button>
        {status === "upcoming" ? (
          <Button 
            variant="primary" 
            size="sm" 
            className={`flex-1 text-xs ${isRegistered ? "bg-slate-700 hover:bg-slate-700 text-slate-300 opacity-80 cursor-default" : ""}`} 
            onClick={isRegistered ? undefined : onRegister}
            disabled={isRegistered}
          >
            {isRegistered ? "Registered" : "Register"}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="flex-1 text-xs disabled:opacity-50" disabled>
            Closed
          </Button>
        )}
      </div>
    </Card>
  );
}
