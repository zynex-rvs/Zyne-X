"use client";

import React, { useState } from "react";
import { X, Award, Users, Mail, Phone, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { Event, User } from "@/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface EventRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  currentUser: User;
  onRegisterSubmit: (data: {
    teamName?: string;
    leaderName?: string;
    mobile: string;
    email: string;
    department: string;
    year: string;
  }) => void;
}

export default function EventRegisterModal({
  isOpen,
  onClose,
  event,
  currentUser,
  onRegisterSubmit,
}: EventRegisterModalProps) {
  // Common states
  const [email, setEmail] = useState(currentUser?.email || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [department, setDepartment] = useState(currentUser?.department || "");
  const [year, setYear] = useState(currentUser?.year || "");

  // Team states
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState(currentUser?.name || "");

  React.useEffect(() => {
    if (isOpen && currentUser) {
      setEmail(currentUser.email || "");
      setMobile(currentUser.mobile || "");
      setDepartment(currentUser.department || "");
      setYear(currentUser.year || "");
      setLeaderName(currentUser.name || "");
      setTeamName("");
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (event.isTeamEvent) {
      if (!teamName || !leaderName) {
        alert("Please enter both a team name and team leader name.");
        return;
      }
      onRegisterSubmit({
        teamName: teamName.toUpperCase(),
        leaderName: leaderName.toUpperCase(),
        mobile,
        email: email.toLowerCase(),
        department,
        year,
      });
    } else {
      onRegisterSubmit({
        mobile,
        email: email.toLowerCase(),
        department,
        year,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black"
      />

      {/* modal box */}
      <motion.div
        initial={{ scale: 0.9, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 15, opacity: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/20/20 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-bold font-outfit text-white mb-1">
              Event Registration
            </h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold text-white truncate max-w-full">
              {event.name}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {event.isTeamEvent ? (
              <>
                <div className="p-3 rounded-lg bg-white/10 border border-white/30/20 flex gap-2.5 items-start text-xs text-slate-400 mb-2">
                  <Users className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>
                    This is a team competition. You will register as the team leader. Once registered, invite your team members using their Reg No. from your dashboard!
                  </span>
                </div>
                <Input
                  label="Team Name"
                  placeholder="e.g. ALPHA TECHS"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value.toUpperCase())}
                  required
                />
              </>
            ) : (
              <div className="p-3 rounded-lg bg-white/10 border border-white/20/20 flex gap-2.5 items-start text-xs text-slate-400 mb-2">
                <Award className="w-4 h-4 text-white/70 shrink-0 mt-0.5" />
                <span>
                  This is a solo participant competition. Your details are already synced with your Zyne-X account.
                </span>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth className="mt-4">
              Complete Registration
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
