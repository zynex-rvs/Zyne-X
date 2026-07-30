"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Mail, Lock, Phone, User as UserIcon, GraduationCap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import ImageCropperModal from "./ImageCropperModal";

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
  photo: z.any().refine((files) => files && files.length > 0, "Photo is required"),
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
  onSignup: (data: any) => Promise<boolean | void> | void;
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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingForgotOtp, setIsSendingForgotOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [cropperImage, setCropperImage] = useState<string | null>(null);

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
    setValue: setSignupValue,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  if (!activeModal || activeModal === "admin-login") return null;

  const onLoginSubmit = (data: any) => {
    onLogin(data.regNo, data.password);
    resetLogin();
  };

  const onSignupSubmit = async (data: any) => {
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.name }),
      });

      const result = await res.json();

      if (res.ok) {
        setSignupData(data);
        setActiveModal("otp");
        resetSignup();
      } else {
        alert(`Failed to send OTP: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while sending the OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData) return;

    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupData.email, otp: otpCode }),
      });

      const result = await res.json();

      if (res.ok) {
        // Await onSignup so we can know if it succeeded
        const success = await onSignup(signupData);
        
        if (success !== false) {
          // If it succeeded (or returned void which implies success)
          setOtpCode("");
          setSignupData(null);
        } else {
          // If it failed (e.g. duplicate user), send them back to the form
          setActiveModal("signup");
        }
      } else {
        alert(result.error || "Invalid verification code.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while verifying the OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    
    setIsSendingForgotOtp(true);
    try {
      const res = await fetch('/api/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const result = await res.json();
      
      if (res.ok) {
        setActiveModal("forgot-password-reset");
      } else {
        alert(result.error || "Failed to send reset code.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while sending the reset code.");
    } finally {
      setIsSendingForgotOtp(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || !newPassword || !confirmNewPassword) return;
    
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match.");
      return;
    }
    
    setIsResettingPassword(true);
    try {
      const res = await fetch('/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword }),
      });
      const result = await res.json();
      
      if (res.ok) {
        alert("Password reset successfully! You can now sign in.");
        setForgotEmail("");
        setForgotOtp("");
        setNewPassword("");
        setConfirmNewPassword("");
        setActiveModal("login");
      } else {
        alert(result.error || "Failed to reset password.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while resetting the password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handlePhotoSelect = (file?: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (base64: string) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], "profile.jpg", { type: mime });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    setSignupValue("photo", dataTransfer.files, { shouldValidate: true });
    setCropperImage(null);
  };

  return (
    <>
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
        className="w-full max-w-md neumorphic-raised rounded-[2rem] p-6 md:p-8 relative overflow-hidden z-10"
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
                Access ZYNE-X | NEXAURA Portal
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
              <h2 className="text-2xl font-bold font-outfit text-white mb-1">Join ZYNE-X | NEXAURA</h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold text-white">
                Department of AI & ML | AI & DS
              </p>
            </div>

            <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-3">
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
                    className={`w-full px-4 py-3 neumorphic-inset rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 ${signupErrors.department ? "border-red-500" : ""}`}
                    {...signupRegister("department")}
                    defaultValue=""
                  >
                    <option value="" disabled className="bg-black">Select Dept</option>
                    {["AI & ML", "AI & DS", "CSE", "CY", "ECE", "MECH", "CIVIL", "AGRI", "AUTO", "MECHATRONICS"].map(dept => (
                      <option key={dept} value={dept} className="bg-black">{dept}</option>
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
                    className={`w-full px-4 py-3 neumorphic-inset rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 ${signupErrors.year ? "border-red-500" : ""}`}
                    {...signupRegister("year")}
                    defaultValue=""
                  >
                    <option value="" disabled className="bg-black">Select Year</option>
                    {["I", "II", "III", "IV"].map(year => (
                      <option key={year} value={year} className="bg-black">{year}</option>
                    ))}
                  </select>
                  {signupErrors.year && (
                    <span className="text-xs font-medium text-red-500 mt-0.5">
                      {signupErrors.year.message as string}
                    </span>
                  )}
                </div>
              </div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handlePhotoSelect(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-transparent hover:border-dashed hover:border-white/20 rounded-lg transition-colors p-1"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase ml-1">Photo</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoSelect(file);
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white/70 hover:file:bg-white/10 cursor-pointer p-2 w-full text-sm text-slate-400"
                    />
                  </div>
                  {signupErrors.photo && (
                    <span className="text-xs font-medium text-red-500 mt-0.5 ml-1">
                      {signupErrors.photo.message as string}
                    </span>
                  )}
                  {signupRegister("photo").name && <input type="hidden" {...signupRegister("photo")} />}
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-2">or drag and drop here</p>
              </div>
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
              <Button type="submit" variant="primary" fullWidth className="mt-4" disabled={isSendingOtp}>
                {isSendingOtp ? "Sending OTP..." : "Send OTP"}
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
              <Button type="submit" variant="primary" fullWidth className="mt-2" disabled={isSendingForgotOtp}>
                {isSendingForgotOtp ? "Sending Code..." : "Send Reset Code"}
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

        {/* Modal: Forgot Password Reset */}
        {activeModal === "forgot-password-reset" && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-bold font-outfit text-white mb-1">Set New Password</h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold text-white/60">
                OTP Verification
              </p>
            </div>
            <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
              <Input
                label="Enter 6-Digit OTP"
                placeholder="123456"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                maxLength={6}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" variant="primary" fullWidth className="mt-2" disabled={isResettingPassword}>
                {isResettingPassword ? "Resetting..." : "Reset Password"}
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
              <Button type="submit" variant="primary" fullWidth className="mt-2" disabled={isVerifyingOtp}>
                {isVerifyingOtp ? "Verifying..." : "Verify & Register"}
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
    
    {cropperImage && (
      <ImageCropperModal
        imageSrc={cropperImage}
        onCropComplete={handleCropComplete}
        onClose={() => setCropperImage(null)}
        aspect={1}
      />
    )}
    </>
  );
}
