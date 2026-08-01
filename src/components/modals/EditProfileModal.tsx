"use client";

import React, { useState } from "react";
import { X, User as UserIcon, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { User } from "@/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useToast } from "@/hooks/useToast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onEditProfile: (data: { name: string; email: string; mobile: string; department: string; year: string }) => void;
  onChangePassword: (curr: string, next: string) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onEditProfile,
  onChangePassword,
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "password">("details");

  // Details State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [mobile, setMobile] = useState(currentUser.mobile);
  const [department, setDepartment] = useState(currentUser.department);
  const [year, setYear] = useState(currentUser.year);

  // Password State
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { addToast } = useToast();

  React.useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setMobile(currentUser.mobile);
      setDepartment(currentUser.department);
      setYear(currentUser.year);
      setCurrPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && mobile && department && year) {
      onEditProfile({ name, email, mobile, department, year });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("New passwords do not match.", "error");
      return;
    }
    onChangePassword(currPassword, newPassword);
    setCurrPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
            <h2 className="text-xl font-bold font-outfit text-white mb-1">Edit Account Settings</h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold text-white">
              Configuration console
            </p>
          </div>

          {/* Edit Tabs */}
          <div className="flex border-b border-white/5 pb-2 text-sm font-semibold gap-4">
            <button
              onClick={() => setActiveTab("details")}
              className={`flex-1 pb-2 border-b-2 transition-all ${
                activeTab === "details"
                  ? "border-white/30 text-white font-bold"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Update Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex-1 pb-2 border-b-2 transition-all ${
                activeTab === "password"
                  ? "border-white/20 text-white font-bold"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Update Password
            </button>
          </div>

          {/* Form: Details */}
          {activeTab === "details" && (
            <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                placeholder="JOHN DOE"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                required
              />
              <Input
                label="Email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
              />
              <Input
                label="Mobile Number"
                placeholder="10 digit number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Department"
                  placeholder="AI & ML"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
                <Input
                  label="Year"
                  placeholder="III"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="primary" fullWidth className="mt-2">
                Save Changes
              </Button>
            </form>
          )}

          {/* Form: Password */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currPassword}
                onChange={(e) => setCurrPassword(e.target.value)}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" fullWidth className="mt-2">
                Update Password
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
