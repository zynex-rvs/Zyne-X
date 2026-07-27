"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Trash2, MailOpen, BellOff } from "lucide-react";
import { Notification } from "@/types";
import { Button } from "../ui/Button";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onAcceptInvite: (id: number) => void;
  onRejectInvite: (id: number) => void;
  onMarkAllRead: () => void;
}

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onAcceptInvite,
  onRejectInvite,
  onMarkAllRead,
}: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end p-4">
      {/* Dark backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black"
      />

      {/* Slide-in sidebar pane */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="w-full max-w-sm bg-white/5 backdrop-blur-md border-l border-white/20/20 h-full shadow-2xl relative flex flex-col p-6 z-10 rounded-l-2xl"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white font-outfit">Notifications</span>
            {notifications.filter((n) => n.unread).length > 0 && (
              <span className="px-2 py-0.5 bg-white/10 text-[10px] font-bold rounded-full text-white">
                {notifications.filter((n) => n.unread).length} NEW
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 gap-2">
              <BellOff className="w-10 h-10 text-slate-600" />
              <p className="text-sm">No notifications to display.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border border-white/5 bg-black flex flex-col gap-3 relative transition-all duration-300 ${
                  notif.unread ? "border-l-2 border-l-cyber-cyan" : ""
                }`}
              >
                <p className="text-slate-300 text-sm leading-relaxed">{notif.message}</p>
                
                {notif.type === "invite" && notif.teamCode && (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="px-3 py-1 flex items-center gap-1 text-xs"
                      onClick={() => onAcceptInvite(notif.id)}
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="px-3 py-1 flex items-center gap-1 text-xs"
                      onClick={() => onRejectInvite(notif.id)}
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                )}
                
                <span className="text-[10px] text-slate-600 self-end mt-1">
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer buttons */}
        {notifications.length > 0 && (
          <div className="border-t border-white/5 pt-4 mt-4 flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-slate-400 hover:text-white flex items-center justify-center gap-1.5"
              onClick={onMarkAllRead}
            >
              <MailOpen className="w-4 h-4" /> Mark all read
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
