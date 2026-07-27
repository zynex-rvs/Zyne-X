"use client";

import { useState, useCallback } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", duration: number = 4000) => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
