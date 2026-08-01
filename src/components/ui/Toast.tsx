"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import type { Toast as ToastType, ToastVariant } from "@/hooks/useToast";

interface ToastContainerProps {
  toasts: ToastType[];
  removeToast: (id: number) => void;
}

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
  error: <XCircle className="w-5 h-5 text-red-400 shrink-0" />,
  info: <Info className="w-5 h-5 text-white shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
};

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={`relative overflow-hidden pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl backdrop-blur-xl border ${
              toast.variant === 'success' ? 'bg-green-500/10 border-green-500/20 shadow-green-500/5' :
              toast.variant === 'error' ? 'bg-red-500/10 border-red-500/20 shadow-red-500/5' :
              toast.variant === 'warning' ? 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/5' :
              'bg-white/10 border-white/20 shadow-black/5'
            }`}
          >
            {variantIcons[toast.variant]}
            <p className="text-sm text-slate-100 font-medium leading-snug flex-1">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors shrink-0 mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
            <motion.div
              className={`absolute bottom-0 left-0 h-1 opacity-20 ${
                toast.variant === 'success' ? 'bg-green-400' :
                toast.variant === 'error' ? 'bg-red-400' :
                toast.variant === 'warning' ? 'bg-amber-400' :
                'bg-white'
              }`}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: toast.duration / 1000, ease: "linear" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
