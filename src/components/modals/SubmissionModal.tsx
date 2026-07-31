"use client";

import React, { useState } from "react";
import { X, Link as LinkIcon, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Event } from "@/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSubmitProject: (projectUrl: string, description: string) => void;
}

export default function SubmissionModal({
  isOpen,
  onClose,
  event,
  onSubmitProject,
}: SubmissionModalProps) {
  const [projectUrl, setProjectUrl] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectUrl.trim()) {
      alert("Project URL is required.");
      return;
    }
    onSubmitProject(projectUrl.trim(), description.trim());
    setProjectUrl("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black"
      />

      <motion.div
        initial={{ scale: 0.9, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 15, opacity: 0 }}
        className="w-full max-w-md max-h-[85dvh] bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-y-auto z-10"
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
              Submit Project
            </h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold text-white truncate max-w-full">
              {event.name}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 flex items-center gap-1.5 ml-1 font-semibold uppercase tracking-wider">
                <LinkIcon className="w-3.5 h-3.5" /> Project URL
              </label>
              <Input
                placeholder="https://github.com/your-username/repo"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 flex items-center gap-1.5 ml-1 font-semibold uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" /> Description (Optional)
              </label>
              <textarea
                placeholder="Briefly describe your submission..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 min-h-[100px] resize-y"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth className="mt-2">
              Submit Now
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
