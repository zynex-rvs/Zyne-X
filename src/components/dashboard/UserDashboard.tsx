"use client";

import React, { useState, useRef } from "react";
import { User, Event, Team } from "@/types";
import { User as UserIcon, BookOpen, Bell, Settings, Award, Edit, Trash2, Camera, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "../ui/Button";
import ImageCropperModal from "../modals/ImageCropperModal";
import { uploadImageToCloudinary } from "@/lib/uploadImage";

interface UserDashboardProps {
  currentUser: User;
  events: Event[];
  teams: Record<string, Team>;
  eventRegistrations: Record<string, any[]>;
  users: User[];
  onEditProfile: () => void;
  onUploadPhoto: (base64: string) => void;
  onCancelRegistration: (eventId: string, isTeam: boolean) => void;
  onSetProblemStatement: (teamCode: string) => void;
  onInviteMember?: (regNo: string, teamCode: string) => void;
  onTransferLeadership?: (teamCode: string, newLeaderId: string) => void;
  onRemoveMember?: (teamCode: string, memberId: string) => void;
  setUsers: (users: User[]) => void;
}

export default function UserDashboard({
  currentUser,
  events,
  teams,
  eventRegistrations,
  users,
  onEditProfile,
  onUploadPhoto,
  onCancelRegistration,
  onSetProblemStatement,
  onInviteMember,
  onTransferLeadership,
  onRemoveMember,
  setUsers,
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "events">("profile");
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [memberCropperState, setMemberCropperState] = useState<{ isOpen: boolean, imageSrc: string | null, userId: string | null }>({ isOpen: false, imageSrc: null, userId: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setCropperImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (base64: string) => {
    onUploadPhoto(base64);
    setCropperImage(null);
  };

  const handleMemberCropComplete = async (base64: string) => {
    if (!memberCropperState.userId) return;

    // Upload to Cloudinary first
    const cloudUrl = await uploadImageToCloudinary(base64);
    const finalImage = cloudUrl || base64;

    const userToUpdate = users.find(u => u.id === memberCropperState.userId);
    if (userToUpdate) {
      userToUpdate.image = finalImage;
      setUsers([...users]);
    }

    const { error } = await supabase.from('users').update({ image: finalImage }).eq('id', memberCropperState.userId);
    if (!error) {
      setMemberCropperState({ isOpen: false, userId: null, imageSrc: null });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Find registered events for current user
  const registeredList: { event: Event; isTeam: boolean; team?: Team }[] = [];
  
  events.forEach((event) => {
    // Check if event is expired (event date has passed)
    const now = new Date().getTime();
    let eventTargetStr = event.date;
    if (event.time) {
      if (event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        eventTargetStr = `${event.date}T${event.time}`;
      } else {
        eventTargetStr = `${event.date} 2026 ${event.time}`;
      }
    }
    let eventTarget = new Date(eventTargetStr).getTime();
    if (isNaN(eventTarget)) eventTarget = new Date(event.date).getTime();
    
    if (!isNaN(eventTarget) && eventTarget - now <= 0) {
      return; // Skip expired events
    }

    if (event.isTeamEvent) {
      const userTeam = Object.values(teams || {}).find(
        (t) => t.eventId === event.id && (t.members || []).includes(currentUser.id)
      );
      if (userTeam) {
        registeredList.push({
          event,
          isTeam: true,
          team: userTeam,
        });
      }
    } else {
      const isRegistered = (eventRegistrations[event.id] || []).some(
        (reg) => reg.userId === currentUser.id
      );
      if (isRegistered) {
        registeredList.push({
          event,
          isTeam: false,
        });
      }
    }
  });

  return (
    <div className="dashboard block">
      <div className="dashboard-header flex justify-between items-center mb-8 pb-4 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold font-outfit text-white">Member Dashboard</h2>
          <p className="text-slate-400 text-xs">Sync and update your event registry ledger</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav (1/4 width) */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full py-3 px-4 rounded-lg flex items-center gap-3 text-sm font-semibold tracking-wide uppercase transition-all ${
              activeTab === "profile"
                ? "bg-white/10 border border-white/20/30 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <UserIcon className="w-4 h-4 text-white" /> Profile Info
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`w-full py-3 px-4 rounded-lg flex items-center gap-3 text-sm font-semibold tracking-wide uppercase transition-all ${
              activeTab === "events"
                ? "bg-white/10 border border-white/20/30 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 text-white/60" /> My Event Registry
          </button>
        </div>

        {/* Dynamic Display area (3/4 width) */}
        <div className="lg:col-span-3">
          
          {/* Tab: Profile Info */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile image column */}
              <div className="neumorphic-raised p-6 rounded-[2rem] flex flex-col items-center gap-4 text-center">
                <div 
                  className="relative group cursor-pointer w-36 h-36 rounded-full overflow-hidden border-2 border-white/20 shadow-lg"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {currentUser.image ? (
                    <img
                      src={currentUser.image}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/20/20 to-transparent/20 flex items-center justify-center text-4xl font-bold tracking-wider text-white">
                      {currentUser.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  {/* Photo upload overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity duration-300">
                    <button 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="text-white hover:text-cyan-400 p-2"
                      title="Upload New"
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                    {currentUser.image && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCropperImage(currentUser.image!); }}
                        className="text-white hover:text-amber-400 p-2"
                        title="Edit Current"
                      >
                        <Edit className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <h3 className="text-lg font-bold font-outfit text-white truncate max-w-full">
                  {currentUser.name}
                </h3>
                <p className="text-white text-xs font-semibold tracking-wider uppercase">
                  {currentUser.department} ({currentUser.year} Yr)
                </p>
                <Button variant="primary" size="sm" className="w-full mt-2" onClick={onEditProfile}>
                  <Edit className="w-4 h-4 mr-1.5" /> Edit Profile
                </Button>
              </div>

              {/* Profile Details column */}
              <div className="md:col-span-2 neumorphic-raised p-6 md:p-8 rounded-[2rem] flex flex-col gap-6">
                <h3 className="text-lg font-bold font-outfit text-white border-b border-white/5 pb-2">
                  Account Particulars
                </h3>
                <div className="flex flex-col gap-4 text-sm text-slate-300">
                  <div className="flex flex-col md:flex-row md:justify-between py-2 border-b border-white/5 gap-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Register Number</span>
                    <span className="font-mono">{currentUser.regNo}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between py-2 border-b border-white/5 gap-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Email Address</span>
                    <span>{currentUser.email}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between py-2 border-b border-white/5 gap-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Mobile number</span>
                    <span>{currentUser.mobile}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between py-2 border-b border-white/5 gap-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Academic details</span>
                    <span>Department of {currentUser.department} - Year {currentUser.year}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: My Event Registry */}
          {activeTab === "events" && (
            <div className="neumorphic-raised p-6 md:p-8 rounded-[2rem] flex flex-col gap-6">
              <h3 className="text-lg font-bold font-outfit text-white border-b border-white/5 pb-2">
                Registered Tech Competitions
              </h3>

              {registeredList.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p>You have not registered for any events yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {registeredList.map(({ event, isTeam, team }) => (
                    <div
                      key={event.id}
                      className="p-5 rounded-[1.5rem] neumorphic-inset flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-base font-bold text-white font-outfit">{event.name}</h4>
                          <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                            {isTeam ? "Team Competition" : "Solo Competition"}
                          </span>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex items-center gap-1 text-xs"
                          onClick={() => onCancelRegistration(event.id, isTeam)}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Disband
                        </Button>
                      </div>

                      {/* Display team subdetails */}
                      {isTeam && team && (
                        <div className="p-5 rounded-2xl neumorphic-raised flex flex-col gap-4 mt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-500 font-semibold uppercase tracking-wider">Team Name:</span>
                              <p className="text-slate-300 font-medium text-sm mt-0.5">{team.teamName}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold uppercase tracking-wider">Team Code:</span>
                              <p className="text-white font-mono font-bold text-sm mt-0.5">{team.teamCode}</p>
                            </div>
                          </div>

                          {/* Member List */}
                          <div>
                            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                              Team Members (Max 6)
                            </span>
                            <div className="flex flex-col gap-1.5 mt-1.5">
                              {team.members.map((memberId, idx) => {
                                const userObj = users.find((u) => u.id === memberId);
                                const isCurrentUser = memberId === currentUser.id;
                                const isLeader = memberId === team.leaderId;
                                const amILeader = currentUser.id === team.leaderId;
                                return (
                                  <div key={memberId} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-500 w-3">{idx + 1}.</span>
                                      {userObj?.image ? (
                                        <div className="relative group w-6 h-6 cursor-pointer flex-shrink-0">
                                          <img src={userObj.image} alt={userObj.name} className="w-full h-full rounded-full object-cover border border-white/10" />
                                          <div 
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity"
                                            onClick={(e) => { e.stopPropagation(); setMemberCropperState({ isOpen: true, imageSrc: userObj.image!, userId: userObj.id }); }}
                                            title="Edit Image"
                                          >
                                            <Edit className="w-3 h-3 text-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20/20 to-transparent/20 flex items-center justify-center text-[8px] font-bold text-white border border-white/10">
                                          {userObj?.name?.substring(0, 2).toUpperCase() || "?"}
                                        </div>
                                      )}
                                      <span className="text-slate-300">
                                        {userObj?.name || `User ID: ${memberId}`} <span className="text-slate-500 font-mono text-[10px] ml-1">({userObj?.regNo || ""})</span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isLeader && (
                                        <span className="px-1.5 py-0.5 bg-white/10 border border-white/20/30 rounded text-[9px] font-bold text-white/70">
                                          LEADER
                                        </span>
                                      )}
                                      {!isLeader && amILeader && onTransferLeadership && (
                                        <button
                                          onClick={() => onTransferLeadership(team.teamCode, memberId)}
                                          className="text-[10px] text-white hover:text-white transition-colors uppercase font-bold tracking-wider"
                                        >
                                          Make Leader
                                        </button>
                                      )}
                                      {!isLeader && (amILeader || isCurrentUser) && onRemoveMember && (
                                        <button
                                          onClick={() => onRemoveMember(team.teamCode, memberId)}
                                          className="text-[10px] text-white/60 hover:text-white transition-colors uppercase font-bold tracking-wider"
                                        >
                                          {isCurrentUser ? "Leave" : "Remove"}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Invite Member Section for Leader */}
                            {currentUser.id === team.leaderId && team.members.length < 6 && (
                              <div className="mt-4 pt-3 border-t border-white/5">
                                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] mb-2 block">
                                  Invite Member
                                </span>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Enter Reg No..."
                                    id={`invite-input-${team.teamCode}`}
                                    className="flex-1 px-3 py-2 neumorphic-inset rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono"
                                  />
                                  <Button
                                    variant="cyan"
                                    size="sm"
                                    className="text-xs py-1.5"
                                    onClick={() => {
                                      const input = document.getElementById(`invite-input-${team.teamCode}`) as HTMLInputElement;
                                      if (input && input.value.trim() && onInviteMember) {
                                        onInviteMember(input.value.trim(), team.teamCode);
                                        input.value = "";
                                      }
                                    }}
                                  >
                                    Send Invite
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Special forms: Problem statement selection specifically for Hackathons! */}
                          {event.id === "sih-hackathon" && (
                            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-white/60" /> SIH Problem Statement ID
                              </span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. PS-123"
                                  defaultValue={team.problemStatement}
                                  id={`ps-input-${team.teamCode}`}
                                  className="flex-1 px-3 py-2 neumorphic-inset rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                />
                                <Button
                                  variant="cyan"
                                  size="sm"
                                  className="text-xs py-1.5"
                                  onClick={() => {
                                    const input = document.getElementById(`ps-input-${team.teamCode}`) as HTMLInputElement;
                                    if (input) {
                                      team.problemStatement = input.value;
                                      onSetProblemStatement(team.teamCode);
                                    }
                                  }}
                                >
                                  Save PS
                                </Button>
                              </div>
                              {team.problemStatement && (
                                <p className="text-[10px] text-white font-mono mt-0.5">
                                  Current Selected ID: {team.problemStatement}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {cropperImage && (
        <ImageCropperModal
          imageSrc={cropperImage}
          onCropComplete={handleCropComplete}
          onClose={() => setCropperImage(null)}
          aspect={1}
        />
      )}
      {memberCropperState.isOpen && (
        <ImageCropperModal
          imageSrc={memberCropperState.imageSrc!}
          onCropComplete={handleMemberCropComplete}
          onClose={() => setMemberCropperState({ isOpen: false, imageSrc: null, userId: null })}
          aspect={1}
        />
      )}
    </div>
  );
}
