"use client";

import React from "react";
import { Mail, MapPin, ChevronRight } from "lucide-react";

interface FooterProps {
  navigateTo: (section: string) => void;
}

export default function Footer({ navigateTo }: FooterProps) {
  return (
    <footer className="relative bg-black overflow-hidden pt-20 pb-10 border-t border-white/10 z-10">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Info Column (Wider) */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="flex items-center cursor-pointer" onClick={() => navigateTo("home")}>
              <img 
                src="/zynex-logo.png" 
                alt="ZYNE-X Logo" 
                className="h-20 w-auto object-contain transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              ZYNE-X is the premier club of the Department of Artificial Intelligence & Machine Learning at RVS Technical Campus.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="https://instagram.com/zynex_rvs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full clean-card border border-white/5 hover:border-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 group">
                <i className="fab fa-instagram text-lg group-hover:scale-110 transition-transform"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full clean-card border border-white/5 hover:border-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 group">
                <i className="fab fa-linkedin text-lg group-hover:scale-110 transition-transform"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full clean-card border border-white/5 hover:border-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 group">
                <i className="fab fa-github text-lg group-hover:scale-110 transition-transform"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 lg:col-span-2">
            <h3 className="text-white font-bold mb-6 font-outfit uppercase tracking-widest text-xs relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-blue-500/50 rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-4 text-sm">
              {[
                { name: "Home", id: "home" },
                { name: "Leadership", id: "admins" },
                { name: "Events", id: "events" }
              ].map((link) => (
                <li key={link.id}>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigateTo(link.id); }} 
                    className="group flex items-center text-slate-400 hover:text-blue-200 transition-colors duration-200"
                  >
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 text-blue-400 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-4 lg:col-span-2">
            <h3 className="text-white font-bold mb-6 font-outfit uppercase tracking-widest text-xs relative inline-block">
              Legal & Support
              <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-blue-500/50 rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-4 text-sm">
              {[
                { name: "Enquiry Desk", onClick: () => navigateTo("enquiry") },
                { name: "Terms of Service", onClick: () => {} },
                { name: "Privacy Policy", onClick: () => {} }
              ].map((link, idx) => (
                <li key={idx}>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); link.onClick(); }} 
                    className="group flex items-center text-slate-400 hover:text-blue-200 transition-colors duration-200"
                  >
                    <ChevronRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 text-blue-400 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Headquarters */}
          <div className="md:col-span-4 lg:col-span-3">
            <h3 className="text-white font-bold mb-6 font-outfit uppercase tracking-widest text-xs relative inline-block">
              Headquarters
              <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-blue-500/50 rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-5 text-sm text-slate-400">
              <li className="flex items-start gap-3 group cursor-default">
                <div className="w-8 h-8 rounded-full clean-card flex items-center justify-center shrink-0 group-hover:border-white/20 transition-colors duration-300">
                  <MapPin className="w-4 h-4 text-white/70 group-hover:text-white" />
                </div>
                <span className="leading-relaxed pt-1 group-hover:text-white transition-colors">
                  Dept of AI & ML,<br />RVS Technical Campus,<br />Coimbatore - 641402
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full clean-card flex items-center justify-center shrink-0 group-hover:border-white/20 transition-colors duration-300">
                  <Mail className="w-4 h-4 text-white/70 group-hover:text-white" />
                </div>
                <a href="mailto:zynex.rvs@gmail.com" className="hover:text-white transition-colors duration-200 pt-0.5">zynex.rvs@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 relative z-20">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} <span className="text-white font-bold font-outfit tracking-wider">ZYNE-X</span> Club. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            Built for the <span className="text-white">AI & ML Innovation Hub</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
