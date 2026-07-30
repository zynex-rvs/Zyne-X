"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { Button } from "../ui/Button";

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  subMessage?: string;
}

export default function RegistrationSuccessModal({
  isOpen,
  onClose,
  message,
  subMessage,
}: RegistrationSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#0f172a] max-h-[90vh] overflow-y-auto border border-green-500/30 rounded-2xl p-8 max-w-md w-full relative z-10 shadow-[0_0_30px_rgba(34,197,94,0.15)] flex flex-col items-center text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white font-outfit mb-2">
              Registration Successful!
            </h3>
            <p className="text-slate-300 text-sm mb-2">{message}</p>
            {subMessage && (
              <p className="text-slate-400 text-xs mb-8">{subMessage}</p>
            )}
            <Button variant="primary" onClick={onClose} fullWidth className="bg-green-600 hover:bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              Awesome!
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
