"use client";

import React, { useState } from "react";
import { X, ShieldAlert, Lock, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLogin: (id: string, pass: string) => void;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
  onAdminLogin,
}: AdminLoginModalProps) {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId && password) {
      onAdminLogin(adminId, password);
      setAdminId("");
      setPassword("");
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

      {/* Box */}
      <motion.div
        initial={{ scale: 0.9, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 15, opacity: 0 }}
        className="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/20/20 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20/20 flex items-center justify-center text-white/70">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-outfit text-white">Admin Portal</h2>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">
              Authorized personnel only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Admin Security ID"
              placeholder="admin"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
            />
            <Input
              label="Security Pin"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            

            <Button type="submit" variant="primary" fullWidth className="mt-2">
              Verify Credentials
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
