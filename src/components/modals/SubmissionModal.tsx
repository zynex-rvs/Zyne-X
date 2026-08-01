"use client";

import React, { useState } from "react";
import { X, Link as LinkIcon, FileText, Upload, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Event, User } from "@/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "@/hooks/useToast";
import ImageCropperModal from "./ImageCropperModal";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  moderators?: User[];
  onSubmitProject: (payload: { projectUrl?: string; description?: string; imageBase64?: string; moderatorId?: string }) => void;
}

export default function SubmissionModal({
  isOpen,
  onClose,
  event,
  moderators = [],
  onSubmitProject,
}: SubmissionModalProps) {
  const [projectUrl, setProjectUrl] = useState("");
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [moderatorId, setModeratorId] = useState("");
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (event.submissionRequiresLink && !projectUrl.trim()) {
      addToast("Project URL is required.", "error");
      return;
    }
    if (event.submissionRequiresImage && !imageBase64) {
      addToast("Project Image is required.", "error");
      return;
    }
    if (event.submissionRequiresDescription && !description.trim()) {
      addToast("Project Description is required.", "error");
      return;
    }

    if (event.submissionRequiresModeratorApproval && !moderatorId) {
      addToast("You must select a moderator to review your submission.", "error");
      return;
    }

    onSubmitProject({
      projectUrl: projectUrl.trim() || undefined,
      description: description.trim() || undefined,
      imageBase64: imageBase64 || undefined,
      moderatorId: moderatorId || undefined
    });

    setProjectUrl("");
    setDescription("");
    setImageBase64("");
    setModeratorId("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
            
            {event.submissionRequiresLink && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 flex items-center gap-1.5 ml-1 font-semibold uppercase tracking-wider">
                  <LinkIcon className="w-3.5 h-3.5" /> Project URL <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="https://github.com/your-username/repo"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  required={event.submissionRequiresLink}
                />
              </div>
            )}

            {event.submissionRequiresImage && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 flex items-center gap-1.5 ml-1 font-semibold uppercase tracking-wider">
                  <ImageIcon className="w-3.5 h-3.5" /> Project Image <span className="text-red-500">*</span>
                </label>
                <div 
                  className="flex items-center gap-4 p-4 border-2 border-dashed border-white/10 rounded-lg hover:border-cyan-500/50 transition-colors bg-white/5 relative cursor-pointer"
                  onClick={() => document.getElementById("submission-image-upload")?.click()}
                >
                  {imageBase64 ? (
                    <img src={imageBase64} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                      <Upload className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{imageBase64 ? "Image Selected" : "Upload Image"}</span>
                    <span className="text-xs text-slate-400">Click to {imageBase64 ? "change" : "upload"} (max 2MB)</span>
                  </div>
                  <input
                    id="submission-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {event.submissionRequiresDescription && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 flex items-center gap-1.5 ml-1 font-semibold uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" /> Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Briefly describe your submission..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required={event.submissionRequiresDescription}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 min-h-[100px] resize-y"
                />
              </div>
            )}

            {event.submissionRequiresModeratorApproval && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 flex items-center gap-1.5 ml-1 font-semibold uppercase tracking-wider">
                  Select Moderator <span className="text-red-500">*</span>
                </label>
                <select
                  value={moderatorId}
                  onChange={(e) => setModeratorId(e.target.value)}
                  required={event.submissionRequiresModeratorApproval}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 appearance-none"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-500">Choose a moderator to review</option>
                  {moderators.map(mod => (
                    <option key={mod.id} value={mod.id} className="bg-slate-900 text-slate-200">
                      {mod.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth className="mt-2">
              Submit Now
            </Button>
          </form>
        </div>
      </motion.div>

      {cropperImage && (
        <ImageCropperModal
          imageSrc={cropperImage}
          onCropComplete={(base64) => {
            setImageBase64(base64);
            setCropperImage(null);
          }}
          onClose={() => setCropperImage(null)}
          aspect={16/9}
        />
      )}
    </div>
  );
}
