"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Event, Winner } from "@/types";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { motion } from "framer-motion";
import Background from "@/components/Background";
import Footer from "@/components/layout/Footer";

export default function ResultsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: eventsData } = await supabase.from("events").select("*");
        const { data: winnersData, error: winnersError } = await supabase.from("winners").select("*");
        
        if (winnersError && (winnersError.code === '42P01' || winnersError.code === 'PGRST205')) {
          // Table not created yet, ignore error and let it show empty state
        } else if (winnersError) {
          throw winnersError;
        }

        if (eventsData) setEvents(eventsData);
        if (winnersData) setWinners(winnersData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEventWinners = (eventId: string) => {
    return winners.filter((w) => w.event_id === eventId).sort((a, b) => a.position - b.position);
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-slate-300" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return null;
    }
  };

  const getCardStyle = (position: number) => {
    switch (position) {
      case 1:
        return "border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.2)] bg-gradient-to-br from-yellow-400/10 to-transparent";
      case 2:
        return "border-slate-300/50 shadow-[0_0_20px_rgba(203,213,225,0.1)] bg-gradient-to-br from-slate-300/10 to-transparent";
      case 3:
        return "border-amber-600/50 shadow-[0_0_20px_rgba(217,119,6,0.1)] bg-gradient-to-br from-amber-600/10 to-transparent";
      default:
        return "border-white/10";
    }
  };

  const getPositionText = (position: number) => {
    switch (position) {
      case 1: return "1ST PLACE";
      case 2: return "2ND PLACE";
      case 3: return "3RD PLACE";
      default: return "";
    }
  };

  // Only show events that have at least one winner
  const eventsWithWinners = events.filter((e) => getEventWinners(e.id).length > 0);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 font-inter overflow-x-hidden relative flex flex-col">
      <Background />

      {/* Simple Header */}
      <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold tracking-wider text-sm uppercase">Back to Home</span>
          </a>
          
          <div className="flex items-center gap-3 md:gap-5 select-none">
            <img
              src="/zynex-logo.png"
              alt="ZYNE-X Logo"
              className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            />
            <div className="h-6 w-px bg-white/20"></div>
            <img
              src="/nexaura-logo.png"
              alt="NexAura Logo"
              className="h-10 md:h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative z-10 flex-1">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black font-outfit mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
          >
            Hall of Fame
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Celebrating the brilliant minds and innovative solutions from our top competitors.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        ) : eventsWithWinners.length === 0 ? (
          <div className="text-center text-slate-400 py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm max-w-4xl mx-auto">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold font-outfit text-white mb-2">Results Pending</h2>
            <p>The results for the events have not been announced yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-24">
            {eventsWithWinners.map((event, idx) => {
              const eventWinners = getEventWinners(event.id);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="space-y-10"
                >
                  <div className="flex flex-col items-center text-center">
                    <h2 className="text-3xl md:text-5xl font-black font-outfit text-white mb-4">
                      {event.name}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {/* Podium styling: 2nd, 1st, 3rd for desktop, but ordered 1, 2, 3 for simplicity in DOM */}
                    {eventWinners.map((winner) => (
                      <div
                        key={winner.id}
                        className={`flex flex-col items-center text-center p-8 rounded-3xl border bg-black/50 backdrop-blur-md transition-transform hover:-translate-y-2 ${getCardStyle(winner.position)}`}
                        style={{ order: winner.position === 1 ? -1 : winner.position }}
                      >
                        <div className="mb-6">
                          {getMedalIcon(winner.position)}
                        </div>
                        
                        <div className="mb-6 relative">
                          {winner.members && winner.members.length > 0 ? (
                            <div className="flex justify-center -space-x-4">
                              {winner.members.map((m, i) => (
                                <div 
                                  key={i} 
                                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg transition-transform hover:scale-110 hover:z-10 ${winner.position === 1 ? 'border-yellow-400' : winner.position === 2 ? 'border-slate-300' : 'border-amber-600'}`}
                                  style={{ zIndex: winner.members!.length - i }}
                                  title={m}
                                >
                                  {winner.member_images && winner.member_images[i] ? (
                                    <img src={winner.member_images[i]} alt={m} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xl font-bold text-white/50">{m.charAt(0)}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className={`w-28 h-28 rounded-full border-4 overflow-hidden bg-white/5 flex items-center justify-center ${winner.position === 1 ? 'border-yellow-400' : winner.position === 2 ? 'border-slate-300' : 'border-amber-600'}`}>
                              {winner.image ? (
                                <img src={winner.image} alt={winner.winner_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-3xl font-bold text-white/50">{winner.winner_name.charAt(0)}</span>
                              )}
                            </div>
                          )}

                          {winner.position === 1 && (
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-20">
                              CHAMPION
                            </div>
                          )}
                        </div>

                        <span className={`text-xs font-bold tracking-widest mb-2 ${winner.position === 1 ? 'text-yellow-400' : winner.position === 2 ? 'text-slate-300' : 'text-amber-600'}`}>
                          {getPositionText(winner.position)}
                        </span>
                        
                        <h3 className="text-2xl font-black text-white mb-2">{winner.winner_name}</h3>
                        
                        {winner.members && winner.members.length > 0 && (
                          <div className="text-sm text-slate-400 flex flex-wrap justify-center gap-1.5 mt-2">
                            {winner.members.map((m, i) => (
                              <span key={i} className="bg-white/5 px-2 py-1 rounded">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {winner.project_url && (
                          <a href={winner.project_url} target="_blank" rel="noopener noreferrer" className="mt-6 text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/50">
                            View Submission
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <Footer navigateTo={(path) => { window.location.href = `/#${path}`; }} />
    </main>
  );
}
