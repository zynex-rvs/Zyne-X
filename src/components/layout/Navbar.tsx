"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Menu, X, LogOut, ChevronDown, Shield, User as UserIcon } from "lucide-react";
import { User, Notification } from "@/types";
import { Button } from "../ui/Button";

interface NavbarProps {
  currentUser: User | null;
  unreadCount: number;
  navigateTo: (section: string) => void;
  setActiveDashboard: (type: 'user' | 'admin' | 'moderator' | null) => void;
  setActiveModal: (type: string | null) => void;
  setIsNotificationsOpen: (open: boolean) => void;
  logoutUser: () => void;
}

export default function Navbar({
  currentUser,
  unreadCount,
  navigateTo,
  setActiveDashboard,
  setActiveModal,
  setIsNotificationsOpen,
  logoutUser,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (section: string) => {
    navigateTo(section);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-700 rounded-full ${isScrolled
          ? "neumorphic-raised py-3 px-6"
          : "bg-transparent py-5 px-6"
        }`}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => handleLinkClick("home")}
          className="flex items-center gap-3 md:gap-5 cursor-pointer group select-none"
        >
          <img
            src="/zynex-logo.png"
            alt="ZYNE-X Logo"
            className="h-14 md:h-16 lg:h-20 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
          />
          <div className="h-8 md:h-10 w-px bg-white/20"></div>
          <img
            src="/nexaura-logo.png"
            alt="NexAura Logo"
            className="h-14 md:h-14 lg:h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
          />
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
            <li>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleLinkClick("home"); }}
                className="text-slate-400 hover:text-white transition-all duration-300"
              >
                Home
              </a>
            </li>

            <li>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleLinkClick("clubs"); }}
                className="text-slate-400 hover:text-white transition-all duration-300"
              >
                Clubs
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleLinkClick("admins"); }}
                className="text-slate-400 hover:text-white transition-all duration-300"
              >
                Team
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleLinkClick("events"); }}
                className="text-slate-400 hover:text-white transition-all duration-300"
              >
                Events
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleLinkClick("enquiry"); }}
                className="text-slate-400 hover:text-white transition-all duration-300"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* Buttons / Auth / Panel triggers */}
        <div className="hidden lg:flex items-center gap-4">
          {currentUser && (
            <div
              className="relative cursor-pointer text-slate-300 hover:text-white p-1 transition-colors duration-200"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[9px] font-bold rounded-full flex items-center justify-center text-white border border-black shadow-lg">
                  {unreadCount}
                </span>
              )}
            </div>
          )}



          {!currentUser ? (
            <div className="flex items-center gap-2 ml-2 pl-6 border-l border-white/10">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-cyan-400"
                onClick={() => setActiveModal("login")}
              >
                Login
              </Button>
              <Button
                variant="cyan"
                size="sm"
                onClick={() => setActiveModal("signup")}
              >
                Sign Up
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2 pl-6 border-l border-white/10">
              {currentUser.role !== "admin" && currentUser.role !== "moderator" && (
                <Button
                  variant="cyan"
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => { setActiveDashboard("user"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >
                  <UserIcon className="w-4 h-4" /> Dashboard
                </Button>
              )}
              {currentUser.role === "admin" && (
                <Button
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => { setActiveDashboard("admin"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >
                  <Shield className="w-4 h-4" /> Admin Panel
                </Button>
              )}
              {currentUser.role === "moderator" && (
                <Button
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => { setActiveDashboard("moderator"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >
                  <Shield className="w-4 h-4" /> Moderator Panel
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 flex items-center gap-1"
                onClick={logoutUser}
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-4">
          {currentUser && (
            <div
              className="relative cursor-pointer text-slate-300 hover:text-white"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[9px] font-bold rounded-full flex items-center justify-center text-white border border-black shadow-lg">
                  {unreadCount}
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-2 text-slate-300 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-[calc(100%+0.5rem)] left-0 w-full neumorphic-raised overflow-hidden rounded-2xl"
          >
            <div className="px-4 pt-3 pb-6 flex flex-col gap-4">
              <ul className="flex flex-col gap-3 font-medium text-sm">
                <li>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleLinkClick("home"); }}
                    className="block text-slate-300 py-2 hover:text-white"
                  >
                    Home
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleLinkClick("clubs"); }}
                    className="block text-slate-300 py-2 hover:text-white"
                  >
                    Clubs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleLinkClick("admins"); }}
                    className="block text-slate-300 py-2 hover:text-white"
                  >
                    Team
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleLinkClick("events"); }}
                    className="block text-slate-300 py-2 hover:text-white"
                  >
                    Events
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleLinkClick("enquiry"); }}
                    className="block text-slate-300 py-2 hover:text-white"
                  >
                    Contact
                  </a>
                </li>
              </ul>

              {/* Action buttons inside drawer */}
              <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
                {!currentUser ? (
                  <>
                    <Button variant="cyan" fullWidth onClick={() => { setActiveModal("login"); setMobileMenuOpen(false); }}>
                      Login
                    </Button>
                    <Button variant="primary" fullWidth onClick={() => { setActiveModal("signup"); setMobileMenuOpen(false); }}>
                      Join Community
                    </Button>
                  </>
                ) : (
                  <>
                    {currentUser.role !== "admin" && currentUser.role !== "moderator" && (
                      <Button
                        variant="cyan"
                        fullWidth
                        onClick={() => { setActiveDashboard("user"); window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}
                      >
                        Dashboard
                      </Button>
                    )}
                    {currentUser.role === "admin" && (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => { setActiveDashboard("admin"); window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}
                      >
                        Admin Panel
                      </Button>
                    )}
                    {currentUser.role === "moderator" && (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => { setActiveDashboard("moderator"); window.scrollTo({ top: 0, behavior: "smooth" }); setMobileMenuOpen(false); }}
                      >
                        Moderator Panel
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      fullWidth
                      className="text-red-400"
                      onClick={() => { logoutUser(); setMobileMenuOpen(false); }}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
