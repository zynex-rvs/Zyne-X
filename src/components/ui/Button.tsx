"use client";

import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "cyan" | "orange";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none font-sans neumorphic-raised active:neumorphic-pressed hover:text-white";
  
    const variants = {
    primary: "text-blue-400 hover:text-blue-300",
    cyan: "text-cyan-400 hover:text-cyan-300",
    secondary: "text-neutral-400 hover:text-neutral-200",
    orange: "text-orange-400 hover:text-orange-300",
    danger: "text-red-500 hover:text-red-400",
    ghost: "text-neutral-500 hover:text-neutral-300 shadow-none bg-transparent hover:neumorphic-pressed",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
