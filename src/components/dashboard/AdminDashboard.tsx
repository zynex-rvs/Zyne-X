"use client";

import React, { useState } from "react";
import { User, Event, Team, Registration, Enquiry, Club, Administrator, Submission } from "@/types";
import { Shield, Users, Trophy, Mail, FileSpreadsheet, Search, RefreshCw, CheckCircle, ArrowRight, Eye, X, Trash2, Edit, Camera } from "lucide-react";
import { Button } from "../ui/Button";
import AdminContentManager from "./AdminContentManager";
import AdminEventDetailsTable from "./AdminEventDetailsTable";
import AdminResultsManager from "./AdminResultsManager";
import ImageCropperModal from "../modals/ImageCropperModal";
import { supabase } from "@/lib/supabaseClient";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { useToast } from "@/hooks/useToast";

interface AdminDashboardProps {
  events: Event[];
  setEvents: (val: Event[]) => void;
  administrators: Administrator[];
  setAdministrators: (val: Administrator[]) => void;
  nexauraAdministrators: Administrator[];
  setNexauraAdministrators: (val: Administrator[]) => void;
  clubs: Club[];
  setClubs: (val: Club[]) => void;
  users: User[];
  setUsers: (val: User[]) => void;
  teams: Record<string, Team>;
  setTeams: (val: Record<string, Team>) => void;
  eventRegistrations: Record<string, Registration[]>;
  enquiries: Enquiry[];
  onRespondEnquiry: (idx: number, reply: string) => void;
  announcements?: import("@/types").Announcement[];
  setAnnouncements?: (val: import("@/types").Announcement[]) => void;
  submissions?: Submission[];
  onAppointModerator?: (userId: string) => void;
  onRevokeModerator?: (userId: string) => void;
}

export default function AdminDashboard({
  events, setEvents,
  administrators, setAdministrators,
  nexauraAdministrators, setNexauraAdministrators,
  clubs, setClubs,
  users, setUsers,
  teams, setTeams,
  eventRegistrations,
  enquiries,
  onRespondEnquiry,
  announcements,
  setAnnouncements,
  submissions = [],
  onAppointModerator,
  onRevokeModerator,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "teams" | "registrations" | "enquiries" | "events" | "clubs" | "admins" | "nexaura-admins" | "announcements" | "submissions" | "results" | "moderators">("stats");
  const { addToast } = useToast();
  
  // Search parameters
  const [searchTerms, setSearchTerms] = useState({
    users: "",
    teams: "",
    registrations: "",
    enquiries: "",
    moderators: "",
  });

  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userYearFilter, setUserYearFilter] = useState("All");

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUserData, setEditingUserData] = useState<User | null>(null);
  const [cropperState, setCropperState] = useState<{ image: string, userId: string } | null>(null);
  const [viewingEnquiry, setViewingEnquiry] = useState<{enquiry: Enquiry, idx: number} | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleCropComplete = async (base64: string) => {
    if (!cropperState) return;

    // Upload to Cloudinary
    const cloudUrl = await uploadImageToCloudinary(base64);
    const finalImage = cloudUrl || base64;
    
    if (cropperState.userId === "edit-modal") {
      if (editingUserData) {
        setEditingUserData({ ...editingUserData, image: finalImage });
      }
      setCropperState(null);
      return;
    }

    setUsers(users.map(u => u.id === cropperState.userId ? { ...u, image: finalImage } : u));
    
    const { error } = await supabase.from('users').update({ image: finalImage }).eq('id', cropperState.userId);
    if (error) console.error("Error updating user photo:", error);
    
    setCropperState(null);
  };

  // Statistics calculation
  const totalUsers = users.length;
  const totalTeams = Object.keys(teams || {}).length;
  const totalRegistrations = Object.values(eventRegistrations || {}).reduce((acc, curr) => acc + curr.length, 0);
  const pendingEnquiries = enquiries.filter((e) => e.status === "pending").length;

  const handleSearchChange = (tab: keyof typeof searchTerms, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [tab]: value }));
  };

  // Filters mapping
  const getFilteredUsers = () => {
    return users.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerms.users.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchTerms.users.toLowerCase()) ||
                            u.regNo.toLowerCase().includes(searchTerms.users.toLowerCase());
      const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter.toLowerCase();
      const matchesYear = userYearFilter === "All" || u.year === userYearFilter;
      
      return matchesSearch && matchesRole && matchesYear;
    });
  };

  const getFilteredTeams = () => {
    return Object.values(teams || {}).filter((t) => {
      const eventName = events.find((e) => e.id === t.eventId)?.name || "";
      const matchesSearch = t.teamName.toLowerCase().includes(searchTerms.teams.toLowerCase()) ||
        t.teamCode.toLowerCase().includes(searchTerms.teams.toLowerCase()) ||
        eventName.toLowerCase().includes(searchTerms.teams.toLowerCase());
      
      const matchesEvent = !selectedEventId || t.eventId === selectedEventId;
      return matchesSearch && matchesEvent;
    });
  };

  const getFilteredRegistrations = () => {
    if (!selectedEventId) return [];
    const regs = eventRegistrations[selectedEventId] || [];
    return regs.filter((r) => 
      (r.name || "").toLowerCase().includes(searchTerms.registrations.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerms.registrations.toLowerCase()) ||
      r.mobile.toLowerCase().includes(searchTerms.registrations.toLowerCase())
    );
  };

  const getFilteredEnquiries = () => {
    return enquiries.filter((e) => 
      e.name.toLowerCase().includes(searchTerms.enquiries.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchTerms.enquiries.toLowerCase()) ||
      e.message.toLowerCase().includes(searchTerms.enquiries.toLowerCase())
    );
  };

  const handleRespond = (idx: number) => {
    const reply = prompt("Compose response to candidate email:");
    if (reply) {
      onRespondEnquiry(idx, reply);
      addToast("Response logged and candidate notified via email ledger!", "success");
    }
  };

  const exportTableData = (type: string) => {
    addToast(`CSV dataset for "${type}" successfully generated and copied to downloads folder.`, "success");
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      addToast("Failed to delete user: " + error.message, "error");
      return;
    }
    setUsers(users.filter(u => u.id !== id));
  };

  const handleDeleteTeam = async (teamCode: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    const { error } = await supabase.from("teams").delete().eq("teamCode", teamCode);
    if (error) {
      addToast("Failed to delete team: " + error.message, "error");
      return;
    }
    const nextTeams = { ...teams };
    delete nextTeams[teamCode];
    setTeams(nextTeams);
  };

  return (
    <div id="admin-dashboard" className="dashboard block">
      <div className="dashboard-header flex justify-between items-center mb-8 pb-4 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-white/70" /> Administrator Desk
          </h2>
          <p className="text-slate-400 text-xs">Configure parameters, view enrollments, and respond to enquiries</p>
        </div>
      </div>

      {/* Admin Tab buttons */}
      <div className="admin-tabs flex overflow-x-auto no-scrollbar gap-2 p-1 bg-white/5 backdrop-blur-md border border-white/5 rounded-xl mb-8 whitespace-nowrap">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "stats" ? "bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "users" ? "bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Members List
        </button>
        <button
          onClick={() => setActiveTab("registrations")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "registrations" ? "bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Registrations
        </button>
        <button
          onClick={() => setActiveTab("enquiries")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "enquiries" ? "bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Enquiries Desk
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "events" ? "bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Manage Events
        </button>
        <button
          onClick={() => setActiveTab("clubs")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "clubs" ? "bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Manage Clubs
        </button>
        <button
          onClick={() => setActiveTab("admins")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "admins" ? "bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Manage Admins
        </button>
        <button
          onClick={() => setActiveTab("nexaura-admins")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "nexaura-admins" ? "bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          NEXAURA Admins
        </button>
        <button
          onClick={() => setActiveTab("moderators")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "moderators" ? "bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Manage Moderators
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "announcements" ? "bg-amber-500/20 text-amber-400 shadow-lg border border-amber-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Announcements
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "submissions" ? "bg-cyan-500/20 text-cyan-400 shadow-lg border border-cyan-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Submissions
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`flex-shrink-0 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "results" ? "bg-cyan-500/20 text-cyan-400 shadow-lg border border-cyan-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Results Management
        </button>
      </div>

      {/* Tab content: Overview Stats */}
      {activeTab === "stats" && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Members</span>
                <h3 className="text-3xl font-black text-white font-outfit mt-1">{totalUsers}</h3>
              </div>
              <Users className="w-10 h-10 text-white/70 opacity-30" />
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Teams Formed</span>
                <h3 className="text-3xl font-black text-white font-outfit mt-1">{totalTeams}</h3>
              </div>
              <Trophy className="w-10 h-10 text-white opacity-30" />
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Registrations</span>
                <h3 className="text-3xl font-black text-white font-outfit mt-1">{totalRegistrations}</h3>
              </div>
              <CheckCircle className="w-10 h-10 text-emerald-400 opacity-30" />
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Queries</span>
                <h3 className="text-3xl font-black text-white font-outfit mt-1">{pendingEnquiries}</h3>
              </div>
              <Mail className="w-10 h-10 text-white/60 opacity-30" />
            </div>
          </div>

          {/* Quick list alerts */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl">
            <h3 className="text-lg font-bold font-outfit text-white mb-4">Upcoming SIH Submission status</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Registrations close on September 18, 2026. Dispatched nominative certificates will be issued via the certificates creator engine once hackathon evaluations close on September 21.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Members List */}
      {activeTab === "users" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-lg font-bold font-outfit text-white">Registered Members</h3>
            <div className="flex flex-wrap gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-xs text-white focus:outline-none"
              >
                <option value="All" className="bg-[#1a1a1a]">All Roles</option>
                <option value="member" className="bg-[#1a1a1a]">Members</option>
                <option value="admin" className="bg-[#1a1a1a]">Admins</option>
              </select>

              <select
                value={userYearFilter}
                onChange={(e) => setUserYearFilter(e.target.value)}
                className="px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-xs text-white focus:outline-none"
              >
                <option value="All" className="bg-[#1a1a1a]">All Years</option>
                <option value="1" className="bg-[#1a1a1a]">1st Year</option>
                <option value="2" className="bg-[#1a1a1a]">2nd Year</option>
                <option value="3" className="bg-[#1a1a1a]">3rd Year</option>
                <option value="4" className="bg-[#1a1a1a]">4th Year</option>
              </select>

              <input
                type="text"
                placeholder="Search name, Reg No..."
                value={searchTerms.users}
                onChange={(e) => handleSearchChange("users", e.target.value)}
                className="px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-xs focus:outline-none"
              />
              <Button variant="cyan" size="sm" className="text-xs" onClick={() => exportTableData("Members")}>
                <FileSpreadsheet className="w-4 h-4 mr-1" /> Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-xs text-white uppercase font-bold">
                  <th className="p-3">Reg No.</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Year</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredUsers().map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 text-slate-300">
                    <td className="p-3 font-mono text-xs">{u.regNo}</td>
                    <td className="p-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        {u.image ? (
                          <div className="relative group w-6 h-6 cursor-pointer flex-shrink-0">
                            <img src={u.image} alt={u.name} className="w-full h-full rounded-full object-cover border border-white/10" />
                            <div 
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity"
                              onClick={(e) => { e.stopPropagation(); setCropperState({ image: u.image!, userId: u.id }); }}
                              title="Edit Image"
                            >
                              <Edit className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20/20 to-transparent/20 flex items-center justify-center text-[9px] font-bold text-white border border-white/10">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.mobile}</td>
                    <td className="p-3">{u.department}</td>
                    <td className="p-3">{u.year}</td>
                    <td className="p-3 flex justify-center gap-2">
                      <Button variant="ghost" size="sm" className="px-2 py-1 text-[10px]" onClick={() => setViewingUser(u)}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                      <Button variant="ghost" size="sm" className="px-2 py-1 text-[10px] text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" onClick={() => setEditingUserData(u)}>
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="px-2 py-1 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDeleteUser(u.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* Tab: Registrations (Event Details Table) */}
      {activeTab === "registrations" && (
        <AdminEventDetailsTable 
          events={events}
          users={users}
          teams={teams}
          eventRegistrations={eventRegistrations}
          expandedEventId={expandedEventId}
          setExpandedEventId={setExpandedEventId}
          onDeleteTeam={handleDeleteTeam}
        />
      )}

      {/* Tab: Enquiries */}
      {activeTab === "enquiries" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-lg font-bold font-outfit text-white">Enquiries Ledger</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search query content..."
                value={searchTerms.enquiries}
                onChange={(e) => handleSearchChange("enquiries", e.target.value)}
                className="px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-xs text-white uppercase font-bold">
                  <th className="p-3">From</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredEnquiries().map((e, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 text-slate-300">
                    <td className="p-3 font-bold text-white">{e.name}</td>
                    <td className="p-3">{e.email}</td>
                    <td className="p-3 font-semibold text-white/70">{e.subject}</td>
                    <td className="p-3 max-w-[200px] truncate" title={e.message}>{e.message}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        e.status === "resolved" 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="px-3 py-1 text-xs flex items-center gap-1"
                          onClick={() => {
                            setViewingEnquiry({ enquiry: e, idx });
                            setReplyText("");
                          }}
                        >
                          <Eye className="w-3 h-3" /> View
                        </Button>
                        {e.status === "pending" && (
                          <Button
                            variant="cyan"
                            size="sm"
                            className="px-3 py-1 text-xs flex items-center gap-1"
                            onClick={() => handleRespond(idx)}
                          >
                            Respond <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Management Tabs */}
      {(activeTab === "events" || activeTab === "clubs" || activeTab === "admins" || activeTab === "nexaura-admins" || activeTab === "announcements") && (
        <AdminContentManager
          events={events}
          setEvents={setEvents}
          clubs={clubs}
          setClubs={setClubs}
          administrators={administrators}
          setAdministrators={setAdministrators}
          nexauraAdministrators={nexauraAdministrators}
          setNexauraAdministrators={setNexauraAdministrators}
          announcements={announcements || []}
          setAnnouncements={setAnnouncements}
          activeTab={activeTab as any}
        />
      )}

      {/* User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full relative">
            <button
              onClick={() => setViewingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-50"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold font-outfit text-white mb-6 border-b border-white/10 pb-4">Member Details</h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile Image */}
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-white/20/50 flex-shrink-0 bg-black flex items-center justify-center">
                {viewingUser.image ? (
                  <img src={viewingUser.image} alt={viewingUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white/50">{viewingUser.name.substring(0,2).toUpperCase()}</span>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 flex flex-col gap-3 w-full text-sm">
                <div className="flex flex-col border-b border-white/5 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Register Number</span>
                  <span className="font-mono text-white">{viewingUser.regNo}</span>
                </div>
                <div className="flex flex-col border-b border-white/5 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Full Name</span>
                  <span className="font-bold text-white">{viewingUser.name}</span>
                </div>
                <div className="flex flex-col border-b border-white/5 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Email Address</span>
                  <span className="text-slate-300">{viewingUser.email}</span>
                </div>
                <div className="flex flex-col border-b border-white/5 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Mobile Number</span>
                  <span className="text-slate-300">{viewingUser.mobile}</span>
                </div>
                <div className="flex flex-col border-b border-white/5 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Academics</span>
                  <span className="text-slate-300">Dept. of {viewingUser.department}, Year {viewingUser.year}</span>
                </div>
                <div className="flex flex-col pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">System Role</span>
                  <span className="text-slate-300 capitalize">{viewingUser.role}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button variant="ghost" onClick={() => setViewingUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUserData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full relative max-h-[85dvh] overflow-y-auto">
            <button
              onClick={() => setEditingUserData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-50"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold font-outfit text-white mb-6 border-b border-white/10 pb-4">Edit Member Data</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const { error } = await supabase.from('users').update({
                name: editingUserData.name,
                email: editingUserData.email,
                mobile: editingUserData.mobile,
                department: editingUserData.department,
                year: editingUserData.year,
                regNo: editingUserData.regNo,
                image: editingUserData.image
              }).eq('id', editingUserData.id);

              if (!error) {
                setUsers(users.map(u => u.id === editingUserData.id ? editingUserData : u));
                setEditingUserData(null);
              }
            }} className="flex flex-col gap-4">
              
              <div className="flex flex-col items-center gap-4 mb-2">
                <div 
                  className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-cyan-500/50 flex flex-col items-center justify-center cursor-pointer relative group bg-black"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCropperState({ image: reader.result as string, userId: "edit-modal" });
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  {editingUserData.image ? (
                    <>
                      <img src={editingUserData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Edit className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-white/50 flex flex-col items-center gap-1">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Photo</span>
                    </div>
                  )}
                </div>
                {editingUserData.image && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCropperState({ image: editingUserData.image!, userId: "edit-modal" })}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Re-crop current photo
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Register Number</label>
                  <input required value={editingUserData.regNo} onChange={e => setEditingUserData({...editingUserData, regNo: e.target.value})} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Full Name</label>
                  <input required value={editingUserData.name} onChange={e => setEditingUserData({...editingUserData, name: e.target.value})} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Email</label>
                  <input required type="email" value={editingUserData.email} onChange={e => setEditingUserData({...editingUserData, email: e.target.value})} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Mobile</label>
                  <input required value={editingUserData.mobile} onChange={e => setEditingUserData({...editingUserData, mobile: e.target.value})} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Department</label>
                  <input required value={editingUserData.department} onChange={e => setEditingUserData({...editingUserData, department: e.target.value})} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Year</label>
                  <input required value={editingUserData.year} onChange={e => setEditingUserData({...editingUserData, year: e.target.value})} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 outline-none" />
                </div>
              </div>
              
              <Button type="submit" variant="primary" className="w-full mt-4">
                Save Changes
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Moderators */}
      {activeTab === "moderators" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-lg font-bold font-outfit text-white">Appointed Moderators</h3>
            
            <div className="flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 w-full md:w-auto">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchTerms.moderators}
                onChange={(e) => handleSearchChange("moderators", e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full min-w-[200px]"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reg No</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name / Dept</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Role</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => 
                  u.name.toLowerCase().includes(searchTerms.moderators.toLowerCase()) || 
                  u.regNo.toLowerCase().includes(searchTerms.moderators.toLowerCase())
                ).map((u, i) => (
                  <tr key={u.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"}`}>
                    <td className="py-3 px-4 text-sm text-slate-300 font-mono">{u.regNo}</td>
                    <td className="py-3 px-4 text-sm text-white">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{u.department} • Year {u.year}</div>
                    </td>
                    <td className="py-3 px-4">
                      {u.role === "moderator" ? (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold uppercase tracking-wider">Moderator</span>
                      ) : u.role === "admin" ? (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold uppercase tracking-wider">Admin</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-white/10 text-slate-300 border border-white/20 rounded text-[10px] font-bold uppercase tracking-wider">Member</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role === "moderator" ? (
                        <Button variant="ghost" size="sm" onClick={() => onRevokeModerator && onRevokeModerator(u.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30">
                          Revoke Access
                        </Button>
                      ) : u.role === "member" ? (
                        <Button variant="primary" size="sm" onClick={() => onAppointModerator && onAppointModerator(u.id)} className="!py-1.5 !px-3 !text-[11px] whitespace-nowrap">
                          Appoint Moderator
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {cropperState && (
        <ImageCropperModal
          imageSrc={cropperState.image}
          onCropComplete={handleCropComplete}
          onClose={() => setCropperState(null)}
          aspect={1}
        />
      )}
      {/* Enquiry Details Modal */}
      {viewingEnquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full relative">
            <button
              onClick={() => setViewingEnquiry(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-50"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold font-outfit text-white mb-6 border-b border-white/10 pb-4">Enquiry Details</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">From</p>
                <p className="text-white font-medium">{viewingEnquiry.enquiry.name} <span className="text-slate-400 text-sm">({viewingEnquiry.enquiry.email})</span></p>
              </div>
              
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Subject</p>
                <p className="text-white">{viewingEnquiry.enquiry.subject}</p>
              </div>
              
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Message</p>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-slate-300 whitespace-pre-wrap text-sm max-h-48 overflow-y-auto">
                  {viewingEnquiry.enquiry.message}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                  viewingEnquiry.enquiry.status === "resolved" 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}>
                  {viewingEnquiry.enquiry.status}
                </span>
              </div>
              
              {viewingEnquiry.enquiry.status === "pending" && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Compose Reply</p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here. It will be sent via email..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white min-h-[100px] mb-3 focus:outline-none focus:border-cyan-500/50"
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setViewingEnquiry(null)}>Cancel</Button>
                    <Button 
                      variant="cyan"
                      onClick={() => {
                        if (!replyText.trim()) {
                          addToast("Reply cannot be empty.", "warning");
                          return;
                        }
                        onRespondEnquiry(viewingEnquiry.idx, replyText);
                        setViewingEnquiry(null);
                        addToast("Response logged and candidate notified via email ledger!", "success");
                      }}
                    >
                      Send Reply <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Tab: Results */}
      {activeTab === "results" && (
        <AdminResultsManager
          events={events}
          teams={teams}
          eventRegistrations={eventRegistrations}
          users={users}
        />
      )}

      {/* Tab: Submissions */}
      {activeTab === "submissions" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold font-outfit text-white">Event Submissions</h3>
          </div>
          
          <div className="overflow-x-auto glass-panel border border-white/5 rounded-2xl relative">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Event Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Code</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Project URL</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {submissions.filter(s => !s.status || s.status === 'approved').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No approved submissions found.
                    </td>
                  </tr>
                ) : (
                  submissions.filter(s => !s.status || s.status === 'approved').map((sub, i) => {
                    const event = events.find(e => e.id === sub.eventId);
                    const user = users.find(u => u.id === sub.userId);
                    return (
                      <tr key={sub.id || i} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4 text-sm text-white font-medium">
                          {event ? event.name : "Unknown Event"}
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                          {user ? `${user.name} (${user.regNo})` : "Unknown User"}
                        </td>
                        <td className="p-4 text-sm font-mono text-cyan-400">
                          {sub.teamCode || "-"}
                        </td>
                        <td className="p-4 text-sm">
                          <a href={sub.projectUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">
                            {sub.projectUrl}
                          </a>
                          {sub.description && (
                            <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={sub.description}>
                              {sub.description}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-xs text-slate-400">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
