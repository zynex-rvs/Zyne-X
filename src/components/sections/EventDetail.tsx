"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, Users, Award, ShieldAlert, Sparkles, Timer } from "lucide-react";
import { Event } from "@/types";
import { Button } from "../ui/Button";
import Timeline from "@/components/sections/Timeline";

interface EventDetailProps {
  event: Event;
  onBackClick: () => void;
  onRegisterClick: () => void;
}

export default function EventDetail({ event, onBackClick, onRegisterClick }: EventDetailProps) {
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
    <div className="event-detail-page block py-10">
      
      {/* Header back row */}
      <div className="event-detail-header mb-8 flex justify-between items-center">
        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs" onClick={onBackClick}>
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Button>
        {status === "upcoming" && (
          <Button variant="primary" size="md" onClick={onRegisterClick}>
            Register for Event
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main descriptions column (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* Banner */}
          <div className="event-detail-image w-full h-[320px] rounded-[2rem] overflow-hidden neumorphic-raised relative">
            <img
              src={event.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6 neumorphic-inset px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase">{event.category}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-xs font-semibold text-slate-300">{event.venue}</span>
            </div>
          </div>

          {/* Specifications */}
          <div className="event-detail-info neumorphic-raised p-8 rounded-[2rem] flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold font-outfit text-white mb-3">Overview</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{event.description}</p>
            </div>

            {event.rules && event.rules.length > 0 && (
              <div>
                <h3 className="text-lg font-bold font-outfit text-white mb-3 border-t border-white/5 pt-4">General Rules</h3>
                <ul className="flex flex-col gap-2.5">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-slate-400 text-sm">
                      <ShieldAlert className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.eligibility && (
              <div>
                <h3 className="text-lg font-bold font-outfit text-white mb-3 border-t border-white/5 pt-4">Eligibility</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{event.eligibility}</p>
              </div>
            )}

            {event.pptFormat && event.pptFormat.length > 0 && (
              <div>
                <h3 className="text-lg font-bold font-outfit text-white mb-3 border-t border-white/5 pt-4">PPT Submission format</h3>
                <ul className="ppt-instructions flex flex-col gap-2">
                  {event.pptFormat.map((ppt, idx) => (
                    <li key={idx} className="text-slate-400 text-sm">{ppt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Specifications details (1/3 width) */}
        <div className="flex flex-col gap-6">
          
          {/* Timeline counter block */}
          <div className="neumorphic-inset p-6 rounded-[2rem] flex flex-col gap-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20/5 to-transparent pointer-events-none" />
            
            {status === "upcoming" ? (
              <>
                <h4 className="text-xs font-semibold text-white uppercase tracking-widest">
                  Event Countdown
                </h4>
                <div className="text-3xl font-black font-outfit text-white flex items-center justify-center gap-2">
                  <Timer className="w-8 h-8 text-white animate-pulse" />
                  <span>{timeLeft}</span>
                </div>
                <p className="text-slate-400 text-xs">Registration window closes soon!</p>
              </>
            ) : (
              <>
                <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
                  Status
                </h4>
                <div className="text-3xl font-black font-outfit text-slate-500">
                  FINISHED
                </div>
                <p className="text-slate-500 text-xs">Event concluded on {event.date}.</p>
              </>
            )}
          </div>

          {/* Prizes Spec block */}
          {event.prizes && event.prizes.length > 0 && (
            <div className="neumorphic-raised p-6 rounded-[2rem] flex flex-col gap-4">
              <h4 className="text-sm font-bold font-outfit text-white border-b border-white/5 pb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-white" /> Event Prizes
              </h4>
              <ul className="flex flex-col gap-3">
                {event.prizes.map((prize, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-400 uppercase text-xs tracking-wider">Position {idx + 1}</span>
                    <span className="text-white font-outfit">{prize}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Specifications block */}
          <div className="neumorphic-raised p-6 rounded-[2rem] flex flex-col gap-4">
            <h4 className="text-sm font-bold font-outfit text-white border-b border-white/5 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white/70" /> Quick Specifications
            </h4>
            <div className="flex flex-col gap-3 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500 font-semibold uppercase">Category</span>
                <span>{event.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500 font-semibold uppercase">Participation</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-white" /> {event.isTeamEvent ? "Team Event (Max 6)" : "Solo Participant"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500 font-semibold uppercase">Date</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-white/60" /> {event.date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-semibold uppercase">Venue</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-white/70" /> {event.venue}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Event Timeline */}
      <div className="mt-12">
        <Timeline timelineData={event.timeline} />
      </div>
    </div>
  );
}
