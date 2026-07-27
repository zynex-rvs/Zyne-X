"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Mail, Lock, Phone, User as UserIcon, GraduationCap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const loginSchema = z.object({
  regNo: z.string().min(1, "Registration number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  regNo: z.string().min(1, "Registration number is required"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  email: z.string().email("Please enter a valid email address"),
  department: z.string().min(1, "Department is required"),
  year: z.string().min(1, "Academic year is required"),
  photo: z.any().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface AuthModalProps {
  activeModal: string | null;
  onClose: () => void;
  onLogin: (regNo: string, pass: string) => void;
  onSignup: (data: any) => void;
  setActiveModal: (modal: string | null) => void;
}

export default function AuthModal({
  activeModal,
  onClose,
  onLogin,
  onSignup,
  setActiveModal,
}: AuthModalProps) {
  const [otpCode, setOtpCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [signupData, setSignupData] = useState<any>(null);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignup,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  if (!activeModal || activeModal === "admin-login") return null;

  const onLoginSubmit = (data: any) => {
    onLogin(data.regNo, data.password);
    resetLogin();
  };

  const onSignupSubmit = (data: any) => {
    setSignupData(data);
    setActiveModal("otp");
    resetSignup();
    alert("OTP sent! Enter 123456 to verify your registration.");
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === "123456" && signupData) {
      onSignup(signupData);
      setOtpCode("");
      setSignupData(null);
    } else {
      alert("Invalid verification code. Try 123456.");
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail) {
      alert(`Instruction email dispatched to ${forgotEmail}.`);
      setForgotEmail("");
      setActiveModal("login");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Black backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black"
      />

      {/* Modal Dialog Content */}
      <motion.div
        initial={{ scale: 0.9, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 15, opacity: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/20/20 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal: Login */}
        {activeModal === "login" && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold font-outfit text-white mb-1">Welcome Back</h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold text-white/70">
                Access ZYNE-X Portal
              </p>
            </div>

            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="flex flex-col gap-4">
              <Input
                label="Reg No."
                placeholder="Enter Register Number"
                error={loginErrors.regNo?.message as string}
                {...loginRegister("regNo")}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={loginErrors.password?.message as string}
                {...loginRegister("password")}
              />
              <div className="text-right">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveModal("forgot-password"); }}
                  className="text-xs text-white hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <Button type="submit" variant="primary" fullWidth className="mt-2">
                Sign In
              </Button>
            </form>


            <p className="text-center text-slate-400 text-xs">
              New here?{" "}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveModal("signup"); }}
                className="text-white hover:underline font-bold"
              >
                Create Account
              </a>
            </p>
          </div>
        )}

        {/* Modal: Signup */}
        {activeModal === "signup" && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold font-outfit text-white mb-1">Join ZYNE-X</h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold text-white">
                Department of AI & ML
              </p>
            </div>

            <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
              <Input
                label="Full Name"
                placeholder="JOHN DOE"
                error={signupErrors.name?.message as string}
                {...signupRegister("name")}
              />
              <Input
                label="Register Number"
                placeholder="12345678"
                error={signupErrors.regNo?.message as string}
                {...signupRegister("regNo")}
              />
              <Input
                label="Mobile Number"
                placeholder="10 digit number"
                error={signupErrors.mobile?.message as string}
                {...signupRegister("mobile")}
              />
              <Input
                label="Email"
                placeholder="name@domain.com"
                error={signupErrors.email?.message as string}
                {...signupRegister("email")}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white uppercase tracking-wider">
                    Department
                  </label>
                  <select
                    className={`w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-white/30 focus:shadow-lg transition-all duration-300 ${signupErrors.department ? "border-red-500" : ""}`}
                    {...signupRegister("department")}
                    defaultValue=""
                  >
                    <option value="" disabled>Select Dept</option>
                    {["AI & ML", "AI & DS", "CSE", "CY", "ECE", "MECH", "CIVIL", "AGRI", "AUTO", "MECHATRONICS"].map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {signupErrors.department && (
                    <span className="text-xs font-medium text-red-500 mt-0.5">
                      {signupErrors.department.message as string}
                    </span>
                  )}
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white uppercase tracking-wider">
                    Year
                  </label>
                  <select
                    className={`w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-white/30 focus:shadow-lg transition-all duration-300 ${signupErrors.year ? "border-red-500" : ""}`}
                    {...signupRegister("year")}
                    defaultValue=""
                  >
                    <option value="" disabled>Select Year</option>
                    {["I", "II", "III", "IV"].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {signupErrors.year && (
                    <span className="text-xs font-medium text-red-500 mt-0.5">
                      {signupErrors.year.message as string}
                    </span>
                  )}
                </div>
              </div>
              <Input
                label="Photo"
                type="file"
                accept="image/*"
                error={signupErrors.photo?.message as string}
                {...signupRegister("photo")}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white/70 hover:file:bg-white/10 cursor-pointer p-2"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={signupErrors.password?.message as string}
                {...signupRegister("password")}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={signupErrors.confirmPassword?.message as string}
                {...signupRegister("confirmPassword")}
              />
              <Button type="submit" variant="primary" fullWidth className="mt-4">
                Send OTP
              </Button>
            </form>

            <p className="text-center text-slate-400 text-xs">
              Already joined?{" "}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveModal("login"); }}
                className="text-white hover:underline font-bold"
              >
                Sign In
              </a>
            </p>
          </div>
        )}

        {/* Modal: Forgot Password */}
        {activeModal === "forgot-password" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-bold font-outfit text-white mb-1">Reset Password</h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold text-white/60">
                Instructions Dispatch
              </p>
            </div>
            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
              <Input
                label="Registered Email"
                placeholder="name@domain.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" fullWidth className="mt-2">
                Dispatch Instructions
              </Button>
            </form>
            <p className="text-center text-xs">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveModal("login"); }}
                className="text-white hover:underline"
              >
                Back to Sign In
              </a>
            </p>
          </div>
        )}

        {/* Modal: OTP Verification */}
        {activeModal === "otp" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-bold font-outfit text-white mb-1">Verify Registration</h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold text-white/70">
                OTP verification
              </p>
            </div>
            <form onSubmit={handleOtpVerify} className="flex flex-col gap-4">
              <Input
                label="Enter 6-Digit OTP"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
              />
              <Button type="submit" variant="primary" fullWidth className="mt-2">
                Verify & Register
              </Button>
            </form>
            <p className="text-center text-xs">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveModal("signup"); }}
                className="text-white hover:underline"
              >
                Back to Sign Up
              </a>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
