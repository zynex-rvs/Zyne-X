"use client";

import React, { useState, useEffect } from "react";
import { Event, Team, Registration, User, Winner } from "@/types";
import { Trophy, Save, RefreshCw, Trash } from "lucide-react";
import { Button } from "../ui/Button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/useToast";

interface AdminResultsManagerProps {
  events: Event[];
  teams: Record<string, Team>;
  eventRegistrations: Record<string, Registration[]>;
  users: User[];
}

export default function AdminResultsManager({
  events,
  teams,
  eventRegistrations,
  users,
}: AdminResultsManagerProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  // Local state for the selected event's new winners
  const [firstPlace, setFirstPlace] = useState<string>("");
  const [secondPlace, setSecondPlace] = useState<string>("");
  const [thirdPlace, setThirdPlace] = useState<string>("");

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("winners").select("*");
      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          // Table doesn't exist
          addToast("Winners table does not exist. Please run the SQL query.", "error");
        } else {
          throw error;
        }
      } else {
        setWinners(data || []);
      }
    } catch (err) {
      console.error("Error fetching winners:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // When selected event changes, populate the form with existing winners
  useEffect(() => {
    if (selectedEventId) {
      const currentSelectedEvent = events.find((e) => e.id === selectedEventId);
      const eventWinners = winners.filter((w) => w.event_id === selectedEventId);
      const first = eventWinners.find((w) => w.position === 1);
      const second = eventWinners.find((w) => w.position === 2);
      const third = eventWinners.find((w) => w.position === 3);

      const getOptionForWinner = (winner_name: string | undefined) => {
        if (!winner_name) return "";
        if (currentSelectedEvent?.isTeamEvent) return winner_name;
        
        const regs = eventRegistrations[selectedEventId] || [];
        const reg = regs.find(r => {
           const u = users.find(user => user.id === r.userId);
           return (r.name || u?.name || r.email) === winner_name;
        });
        return reg ? getSoloOptionString(reg) : winner_name;
      };

      setFirstPlace(getOptionForWinner(first?.winner_name));
      setSecondPlace(getOptionForWinner(second?.winner_name));
      setThirdPlace(getOptionForWinner(third?.winner_name));
    } else {
      setFirstPlace("");
      setSecondPlace("");
      setThirdPlace("");
    }
  }, [selectedEventId, winners]);

  const handleSaveWinners = async () => {
    if (!selectedEvent) return;
    setIsSaving(true);
    try {
      // First, delete existing winners for this event
      await supabase.from("winners").delete().eq("event_id", selectedEvent.id);

      const winnersToInsert: Partial<Winner>[] = [];

      const getWinnerData = (name: string, position: 1 | 2 | 3) => {
        if (!name) return null;
        if (selectedEvent.isTeamEvent) {
          const team = Object.values(teams).find(
            (t) => t.eventId === selectedEvent.id && t.teamName === name
          );
          if (team) {
            const memberNames = team.members.map((id) => {
              const u = users.find((u) => u.id === id);
              return u ? u.name : "";
            });
            const memberImages = team.members.map((id) => {
              const u = users.find((u) => u.id === id);
              return u?.image || "";
            });
            // Try to find the leader's image or just take the first member with an image
            const leader = users.find((u) => u.id === team.leaderId);
            return {
              event_id: selectedEvent.id,
              position,
              winner_name: team.teamName,
              members: memberNames,
              member_images: memberImages,
              image: leader?.image,
              project_url: team.problemStatement || "",
            };
          }
        } else {
          // It's a solo event.
          const reg = (eventRegistrations[selectedEvent.id] || []).find(
            (r) => getSoloOptionString(r) === name
          );
          if (reg) {
            const user = users.find((u) => u.id === reg.userId);
            return {
              event_id: selectedEvent.id,
              position,
              winner_name: reg.name || user?.name || name,
              image: user?.image,
            };
          }
        }
        return null;
      };

      const w1 = getWinnerData(firstPlace, 1);
      if (w1) winnersToInsert.push(w1);
      const w2 = getWinnerData(secondPlace, 2);
      if (w2) winnersToInsert.push(w2);
      const w3 = getWinnerData(thirdPlace, 3);
      if (w3) winnersToInsert.push(w3);

      if (winnersToInsert.length > 0) {
        const { error } = await supabase.from("winners").insert(winnersToInsert);
        if (error) throw error;
      }

      addToast("Results posted successfully!", "success");
      fetchWinners();
    } catch (err) {
      console.error(err);
      addToast("Failed to save results.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveWinners = async () => {
    if (!selectedEvent) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("winners").delete().eq("event_id", selectedEvent.id);
      if (error) throw error;
      
      setFirstPlace("");
      setSecondPlace("");
      setThirdPlace("");
      
      addToast("Results removed successfully!", "success");
      fetchWinners();
    } catch (err) {
      console.error(err);
      addToast("Failed to remove results.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  function getSoloOptionString(r: import("@/types").Registration) {
    const user = users.find((u) => u.id === r.userId);
    return user ? `${r.name || user.name} (${user.regNo})` : (r.name || r.email);
  }

  const getOptions = () => {
    if (!selectedEvent) return [];
    if (selectedEvent.isTeamEvent) {
      return Object.values(teams)
        .filter((t) => t.eventId === selectedEvent.id)
        .map((t) => t.teamName);
    } else {
      return (eventRegistrations[selectedEvent.id] || []).map(getSoloOptionString);
    }
  };

  const options = getOptions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-outfit text-white">
            Results & Winners
          </h2>
          <p className="text-sm text-slate-400">
            Post the top 3 winners for each event to display on the Results page.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchWinners} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="clean-card p-6">
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Select Event
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
        >
          <option value="">-- Choose an Event --</option>
          {events.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {evt.name} {evt.isTeamEvent ? "(Team)" : "(Solo)"}
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <div className="clean-card p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Assign Winners for {selectedEvent.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1st Place */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-yellow-400">
                1st Place (Winner)
              </label>
              <select
                value={firstPlace}
                onChange={(e) => setFirstPlace(e.target.value)}
                className="w-full bg-slate-900/50 border border-yellow-400/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
              >
                <option value="">-- Select --</option>
                {options.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 2nd Place */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                2nd Place (Runner Up)
              </label>
              <select
                value={secondPlace}
                onChange={(e) => setSecondPlace(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-300/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-slate-300 transition-colors"
              >
                <option value="">-- Select --</option>
                {options.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 3rd Place */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-amber-600">
                3rd Place (2nd Runner Up)
              </label>
              <select
                value={thirdPlace}
                onChange={(e) => setThirdPlace(e.target.value)}
                className="w-full bg-slate-900/50 border border-amber-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-600 transition-colors"
              >
                <option value="">-- Select --</option>
                {options.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={handleRemoveWinners}
              disabled={isSaving}
              variant="ghost"
              className="flex items-center gap-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 px-6 py-2 rounded-xl font-bold transition-all"
            >
              <Trash className="w-4 h-4" />
              Remove
            </Button>
            <Button
              onClick={handleSaveWinners}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white border-none shadow-[0_0_15px_rgba(37,99,235,0.4)] px-6 py-2 rounded-xl font-bold transition-all"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Posting..." : "Post Results"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
