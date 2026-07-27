"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-white uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300 ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-red-500 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
