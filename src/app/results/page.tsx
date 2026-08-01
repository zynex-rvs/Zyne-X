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
              const firstPlace = eventWinners.find(w => w.position === 1);
              const secondPlace = eventWinners.find(w => w.position === 2);
              const thirdPlace = eventWinners.find(w => w.position === 3);

              const renderWinnerCard = (winner: Winner, rank: number) => {
                if (!winner) return <div className="hidden md:block w-full md:w-1/3" />;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: rank === 3 ? 0 : rank === 2 ? 0.2 : 0.4 }}
                    className={`flex flex-col items-center justify-end w-full md:w-1/3 ${rank === 1 ? 'order-first md:order-none mb-8 md:mb-0 z-20' : 'z-10'}`}
                  >
                    
                    {/* Spotlight for 1st place */}
                    {rank === 1 && (
                      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[200%] h-full bg-gradient-to-b from-yellow-400/20 via-yellow-400/5 to-transparent blur-3xl pointer-events-none -z-10" />
                    )}

                    <div className="relative z-10 w-full group">
                      <div className={`relative flex flex-col items-center text-center p-6 md:p-8 rounded-3xl border bg-black/60 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-4 ${getCardStyle(winner.position)} ${rank === 1 ? 'md:scale-110 shadow-2xl' : 'shadow-xl'}`}>
                        
                        {/* Subtle Floating Particles for 1st Place */}
                        {rank === 1 && (
                          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            {[...Array(6)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
                                style={{ left: `${15 + Math.random() * 70}%`, top: `${50 + Math.random() * 30}%` }}
                                animate={{ y: [0, -60 - Math.random() * 40], opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 + Math.random(), delay: Math.random() * 2 }}
                              />
                            ))}
                          </div>
                        )}

                        <div className="mb-6 relative z-10">
                          {getMedalIcon(winner.position)}
                        </div>
                        
                        <div className="mb-6 relative z-10">
                          {winner.members && winner.members.length > 0 ? (
                            <div className="flex justify-center -space-x-4">
                              {winner.members.map((m, i) => (
                                <div 
                                  key={i} 
                                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg transition-transform hover:scale-125 hover:z-30 ${winner.position === 1 ? 'border-yellow-400' : winner.position === 2 ? 'border-slate-300' : 'border-amber-600'}`}
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
                            <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-4 overflow-hidden bg-white/5 flex items-center justify-center shadow-lg ${winner.position === 1 ? 'border-yellow-400' : winner.position === 2 ? 'border-slate-300' : 'border-amber-600'}`}>
                              {winner.image ? (
                                <img src={winner.image} alt={winner.winner_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-3xl font-bold text-white/50">{winner.winner_name.charAt(0)}</span>
                              )}
                            </div>
                          )}

                          {winner.position === 1 && (
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] z-20 whitespace-nowrap">
                              CHAMPION
                            </div>
                          )}
                        </div>

                        <span className={`text-xs font-bold tracking-widest mb-2 z-10 ${winner.position === 1 ? 'text-yellow-400' : winner.position === 2 ? 'text-slate-300' : 'text-amber-600'}`}>
                          {getPositionText(winner.position)}
                        </span>
                        
                        <h3 className={`font-black text-white mb-2 z-10 ${rank === 1 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>{winner.winner_name}</h3>
                        
                        {winner.members && winner.members.length > 0 && (
                          <div className="text-xs md:text-sm text-slate-400 flex flex-wrap justify-center gap-1.5 mt-2 z-10">
                            {winner.members.map((m, i) => (
                              <span key={i} className="bg-white/5 border border-white/10 px-2 py-1 rounded">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {winner.project_url && (
                          <a href={winner.project_url} target="_blank" rel="noopener noreferrer" className="relative z-10 mt-6 text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/50">
                            View Submission
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 3D Glass Cylinder Podium Steps */}
                    <div className={`hidden md:flex flex-col items-center justify-start w-full relative -mt-4 z-0 ${
                        rank === 1 ? 'h-64' : rank === 2 ? 'h-48' : 'h-32'
                    }`}>
                      {/* Top Face (Ellipse) */}
                      <div className={`w-[90%] h-12 rounded-[50%] absolute -top-6 z-10 bg-gradient-to-b backdrop-blur-md ${
                        rank === 1 ? 'from-yellow-400/40 to-yellow-600/10 border border-yellow-400/50 shadow-[0_0_40px_rgba(250,204,21,0.4)]' :
                        rank === 2 ? 'from-slate-300/40 to-slate-500/10 border border-slate-300/50 shadow-[0_0_20px_rgba(203,213,225,0.2)]' :
                        'from-amber-600/40 to-amber-800/10 border border-amber-600/50 shadow-[0_0_20px_rgba(217,119,6,0.2)]'
                      }`} />
                      
                      {/* Front Body (Cylinder) */}
                      <div className={`w-[90%] h-full rounded-b-[50px] relative overflow-hidden bg-gradient-to-b backdrop-blur-sm ${
                        rank === 1 ? 'from-yellow-500/30 via-yellow-600/10 to-transparent border-x border-b border-yellow-400/20' :
                        rank === 2 ? 'from-slate-400/30 via-slate-500/10 to-transparent border-x border-b border-slate-300/20' :
                        'from-amber-700/30 via-amber-800/10 to-transparent border-x border-b border-amber-600/20'
                      } flex items-start justify-center pt-10`}>
                        {/* Shimmer effect inside cylinder */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[30deg] translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                        
                        <span className={`text-7xl md:text-9xl font-black opacity-20 ${
                          rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : 'text-amber-600'
                        }`}>{rank}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              };

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

                  <div className="flex flex-col md:flex-row items-end justify-center gap-6 relative md:pt-16 px-4">
                    {/* 2nd Place */}
                    {renderWinnerCard(secondPlace!, 2)}
                    
                    {/* 1st Place */}
                    {renderWinnerCard(firstPlace!, 1)}
                    
                    {/* 3rd Place */}
                    {renderWinnerCard(thirdPlace!, 3)}
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
