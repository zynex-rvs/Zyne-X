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
    <div className="toast-container">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={`toast-item toast-${toast.variant}`}
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
            <div
              className="toast-progress"
              style={{ animationDuration: `${toast.duration}ms` }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
