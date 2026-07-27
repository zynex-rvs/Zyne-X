"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, Loader2, Send, Mail, MapPin } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const enquirySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type EnquiryFormValues = z.infer<typeof enquirySchema>;

interface EnquiryProps {
  onSubmitEnquiry: (data: any) => void;
}

export default function Enquiry({ onSubmitEnquiry }: EnquiryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: EnquiryFormValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitEnquiry({
        ...data,
        name: data.name.toUpperCase(),
        email: data.email.toLowerCase(),
        date: new Date().toISOString(),
        status: "pending",
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 4000);
    }, 1200);
  };

  return (
    <section id="enquiry" className="py-24 relative overflow-hidden">
      {/* Ambient background orbs for the enquiry section */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Column: Contact Info */}
          <div className="flex flex-col justify-center gap-8 z-10 relative">
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white pb-2 leading-tight">
                Let&apos;s Connect
              </h2>
              <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                Have a question about our events, club inductions, or just want to discuss the future of AI? Drop us a message.
              </p>
            </div>
            
            <div className="flex flex-col gap-6 mt-4">
              <div className="flex items-center gap-5 group cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-500">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-wide uppercase">Email Us</h4>
                  <p className="text-cyan-100/70 text-base mt-0.5 group-hover:text-cyan-300 transition-colors">contact@zynex.edu</p>
                </div>
              </div>
              
              <div className="flex items-center gap-5 group cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:border-blue-400/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-500">
                  <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-wide uppercase">Visit Us</h4>
                  <p className="text-cyan-100/70 text-base mt-0.5 group-hover:text-cyan-300 transition-colors">Block 3, AI & ML Department</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form inside Neumorphic Card */}
          <div className="neumorphic-raised p-8 md:p-10 rounded-[2rem] relative overflow-hidden group">
            {/* Soft inner glow that follows hover state subtly */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-5 relative z-10">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                </div>
                <h3 className="text-3xl font-bold font-outfit text-white">Message Dispatched</h3>
                <p className="text-slate-300 text-base max-w-sm">
                  Your request has been filed in the AI & ML Enquiry ledger. An admin representative will respond via email shortly.
                </p>
                <Button variant="ghost" onClick={() => setIsSuccess(false)} className="mt-4">Send Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Your Name"
                    placeholder="e.g. John Doe"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                  <Input
                    label="Email Address"
                    placeholder="e.g. name@domain.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>

                <Input
                  label="Subject"
                  placeholder="e.g. Club Registration Inquiries"
                  error={errors.subject?.message}
                  {...register("subject")}
                />

                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white uppercase tracking-wider">
                    Details
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Draft your query here..."
                    className={`w-full px-4 py-3 neumorphic-inset rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 resize-none ${
                      errors.message ? "border-red-500" : ""
                    }`}
                    {...register("message")}
                  />
                  {errors.message && (
                    <span className="text-xs font-medium text-red-500 mt-0.5">
                      {errors.message.message}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-full mt-4 flex items-center gap-2 justify-center py-4 text-base font-bold shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Transmitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Dispatch Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
