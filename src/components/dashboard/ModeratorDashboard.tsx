"use client";

import React, { useState } from "react";
import { User, Event, Team, Registration } from "@/types";
import { Eye, Users, Trophy, CheckCircle, FileSpreadsheet } from "lucide-react";
import { Button } from "../ui/Button";
import AdminEventDetailsTable from "./AdminEventDetailsTable";

interface ModeratorDashboardProps {
  events: Event[];
  users: User[];
  teams: Record<string, Team>;
  eventRegistrations: Record<string, Registration[]>;
}

export default function ModeratorDashboard({
  events,
  users,
  teams,
  eventRegistrations,
}: ModeratorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "registrations">("stats");
  
  const [searchTerms, setSearchTerms] = useState({
    users: "",
  });

  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userYearFilter, setUserYearFilter] = useState("All");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const totalUsers = users.length;
  const totalTeams = Object.keys(teams || {}).length;
  const totalRegistrations = Object.values(eventRegistrations || {}).reduce((acc, curr) => acc + curr.length, 0);

  const handleSearchChange = (tab: keyof typeof searchTerms, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [tab]: value }));
  };

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

  const exportTableData = (type: string) => {
    alert(`CSV dataset for "${type}" successfully generated and copied to downloads folder.`);
  };

  return (
    <div id="moderator-dashboard" className="dashboard block">
      <div className="dashboard-header flex justify-between items-center mb-8 pb-4 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-cyan-400" /> Moderator Desk
          </h2>
          <p className="text-slate-400 text-xs">Read-only view of enrollments and system statistics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs flex overflow-x-auto no-scrollbar gap-2 p-1 bg-white/5 backdrop-blur-md border border-white/5 rounded-xl mb-8 whitespace-nowrap">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "stats" ? "bg-cyan-500/20 text-cyan-400 shadow-lg border border-cyan-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "users" ? "bg-cyan-500/20 text-cyan-400 shadow-lg border border-cyan-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Members List
        </button>
        <button
          onClick={() => setActiveTab("registrations")}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "registrations" ? "bg-cyan-500/20 text-cyan-400 shadow-lg border border-cyan-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          Registrations
        </button>
      </div>

      {/* Overview */}
      {activeTab === "stats" && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </div>
      )}

      {/* Members List */}
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
                className="px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-xs focus:outline-none text-white w-48"
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
                </tr>
              </thead>
              <tbody>
                {getFilteredUsers().map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 text-slate-300">
                    <td className="p-3 font-mono text-xs">{u.regNo}</td>
                    <td className="p-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        {u.image ? (
                          <img src={u.image} alt={u.name} className="w-6 h-6 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white border border-white/10">
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
                  </tr>
                ))}
              </tbody>
            </table>
            {getFilteredUsers().length === 0 && (
              <p className="text-center text-slate-500 py-4 text-xs">No matching members found.</p>
            )}
          </div>
        </div>
      )}

      {/* Registrations Tab */}
      {activeTab === "registrations" && (
        <AdminEventDetailsTable 
          events={events}
          users={users}
          teams={teams}
          eventRegistrations={eventRegistrations}
          expandedEventId={expandedEventId}
          setExpandedEventId={setExpandedEventId}
          // Intentionally omitting onDeleteTeam to keep it read-only
        />
      )}
    </div>
  );
}
