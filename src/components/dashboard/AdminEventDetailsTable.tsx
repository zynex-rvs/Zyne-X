import React, { useState } from "react";
import { Event, User, Team, Registration } from "@/types";
import { ChevronDown, ChevronUp, Users, User as UserIcon, Search, Filter, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";

interface AdminEventDetailsTableProps {
  events: Event[];
  users: User[];
  teams: Record<string, Team>;
  eventRegistrations: Record<string, Registration[]>;
  expandedEventId: string | null;
  setExpandedEventId: (id: string | null) => void;
  onDeleteTeam?: (teamCode: string) => void;
}

export default function AdminEventDetailsTable({
  events,
  users,
  teams,
  eventRegistrations,
  expandedEventId,
  setExpandedEventId,
  onDeleteTeam
}: AdminEventDetailsTableProps) {
  const [expandedTeamCode, setExpandedTeamCode] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  
  const allDepts = ["All", "AI & ML", "AI & DS", "CSE", "CY", "ECE", "MECH", "CIVIL", "AGRI", "AUTO", "MECHATRONICS"];

  const filterUsers = (memberIds: string[]) => {
    return memberIds.filter(id => {
      const u = users.find(user => user.id === id);
      if (!u) return false;
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.regNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === "All" || u.department === filterDept;
      return matchesSearch && matchesDept;
    });
  };

  const filterRegs = (regs: Registration[]) => {
    return regs.filter(r => {
      const u = users.find(user => user.id === r.userId);
      const name = u?.name || r.name || "";
      const regNo = u?.regNo || r.userId;
      const email = u?.email || r.email || "";
      const dept = u?.department || r.department || "";
      
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            regNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === "All" || dept === filterDept;
      return matchesSearch && matchesDept;
    });
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-4">
        <h3 className="text-lg font-bold font-outfit text-white">Event Details & Registrations</h3>
        
        {/* Search & Filter Controls */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Reg No, Name, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-xs focus:outline-none focus:border-cyan-500/50 text-white w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="pl-9 pr-4 py-2 bg-black backdrop-blur-md border border-white/10 rounded-lg text-xs focus:outline-none focus:border-cyan-500/50 text-white appearance-none cursor-pointer"
            >
              {allDepts.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {events.map(ev => {
          const isExpanded = expandedEventId === ev.id;
          const allRegs = eventRegistrations[ev.id] || [];
          
          let registeredCount = 0;
          let teamsList: Team[] = [];
          
          if (ev.isTeamEvent) {
            teamsList = Object.values(teams).filter(t => t.eventId === ev.id);
            registeredCount = teamsList.length;
          } else {
            registeredCount = allRegs.length;
          }

          return (
            <div key={ev.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
              {/* Event Header row */}
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/5">
                    {ev.isTeamEvent ? <Users className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white/70" />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base">{ev.name}</h4>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">{ev.isTeamEvent ? "Team Event" : "Solo Event"} | {ev.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">{registeredCount}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{ev.isTeamEvent ? "Teams" : "Participants"}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md/50">
                  {registeredCount === 0 ? (
                    <p className="text-center text-slate-500 py-4 text-sm">No registrations yet.</p>
                  ) : ev.isTeamEvent ? (
                    <div className="flex flex-col gap-4">
                      {teamsList.map(team => {
                        const isTeamExpanded = expandedTeamCode === team.teamCode;
                        const filteredMembers = filterUsers(team.members);
                        
                        // Hide team if no members match the search and team name doesn't match
                        if (filteredMembers.length === 0 && !team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) && !team.teamCode.toLowerCase().includes(searchTerm.toLowerCase())) {
                          return null;
                        }

                        return (
                          <div key={team.teamCode} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <h5 className="text-white font-bold text-sm">{team.teamName} <span className="text-slate-500 font-mono text-xs ml-2">({team.teamCode})</span></h5>
                                <p className="text-xs text-slate-400 mt-1">{team.members.length} Members</p>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setExpandedTeamCode(isTeamExpanded ? null : team.teamCode)}
                                  className="px-3 py-1.5 bg-white/10 text-white/70 hover:bg-white/10 hover:text-white border border-white/20/30 rounded text-xs font-bold uppercase transition-colors"
                                >
                                  {isTeamExpanded ? "Hide Details" : "View"}
                                </button>
                                {onDeleteTeam && (
                                  <button 
                                    onClick={() => onDeleteTeam(team.teamCode)}
                                    className="px-2 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 rounded text-xs transition-colors flex items-center justify-center"
                                    title="Delete Team"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {isTeamExpanded ? (
                              <div className="overflow-x-auto w-full mt-4">
                                <table className="w-full text-sm text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-white/5 bg-black/20 text-xs text-slate-400 uppercase font-bold">
                                      <th className="p-2">Name</th>
                                      <th className="p-2">Reg No</th>
                                      <th className="p-2">Email</th>
                                      <th className="p-2">Mobile</th>
                                      <th className="p-2">Dept</th>
                                      <th className="p-2">Year</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {team.members.map(memberId => {
                                      const user = users.find(u => u.id === memberId);
                                      const isMatch = filteredMembers.includes(memberId);
                                      return (
                                        <tr key={memberId} className={`border-b border-white/5 last:border-0 hover:bg-white/5 ${isMatch ? "text-slate-300" : "text-slate-600 opacity-50"}`}>
                                          <td className="p-2 font-bold flex items-center gap-2">
                                            {user?.image ? (
                                              <img src={user.image} className="w-5 h-5 rounded-full border border-white/10 object-cover" alt="" />
                                            ) : (
                                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold border border-white/10">
                                                {(user?.name || "??").substring(0,2).toUpperCase()}
                                              </div>
                                            )}
                                            <span className={isMatch ? "text-white" : ""}>{user?.name || memberId}</span>
                                            {memberId === team.leaderId && <span className="text-[9px] text-white/70 border border-white/20/30 px-1 py-0.5 rounded">LEADER</span>}
                                          </td>
                                          <td className="p-2 font-mono text-xs">{user?.regNo || "-"}</td>
                                          <td className="p-2 text-xs">{user?.email || "-"}</td>
                                          <td className="p-2 text-xs">{user?.mobile || "-"}</td>
                                          <td className="p-2 text-xs">{user?.department || "-"}</td>
                                          <td className="p-2 text-xs">{user?.year || "-"}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-xs text-white/70 uppercase font-bold">
                            <th className="p-2 pb-3">Name</th>
                            <th className="p-2 pb-3">Reg No.</th>
                            <th className="p-2 pb-3">Email</th>
                            <th className="p-2 pb-3">Mobile</th>
                            <th className="p-2 pb-3">Dept</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filterRegs(allRegs).map(r => {
                            const user = users.find(u => u.id === r.userId);
                            const finalName = user?.name || r.name;
                            return (
                              <tr key={r.userId} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                                <td className="p-2 py-3 font-semibold text-white flex items-center gap-2">
                                  {user?.image ? (
                                    <img src={user.image} className="w-5 h-5 rounded-full border border-white/10 object-cover" alt="" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold border border-white/10">
                                      {(finalName || "??").substring(0,2).toUpperCase()}
                                    </div>
                                  )}
                                  {finalName}
                                </td>
                                <td className="p-2 py-3 font-mono text-xs">{user?.regNo || r.userId}</td>
                                <td className="p-2 py-3">{user?.email || r.email}</td>
                                <td className="p-2 py-3">{user?.mobile || r.mobile}</td>
                                <td className="p-2 py-3">{user?.department || r.department || "-"}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      {filterRegs(allRegs).length === 0 && (
                        <p className="text-center text-slate-500 py-4 text-xs">No matching registrations found.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
