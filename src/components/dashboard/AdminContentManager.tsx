"use client";

import React, { useState, useRef } from "react";
import { Event, Club, Administrator } from "@/types";
import { Button } from "../ui/Button";
import { Trash2, Edit, X, Upload } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface AdminContentManagerProps {
  events: Event[];
  setEvents: (val: Event[]) => void;
  administrators: Administrator[];
  setAdministrators: (val: Administrator[]) => void;
  clubs: Club[];
  setClubs: (val: Club[]) => void;
  nexauraAdministrators?: Administrator[];
  setNexauraAdministrators?: (val: Administrator[]) => void;
  announcements?: import("@/types").Announcement[];
  setAnnouncements?: (val: import("@/types").Announcement[]) => void;
  activeTab: "events" | "clubs" | "admins" | "nexaura-admins" | "announcements";
}

export default function AdminContentManager({
  events, setEvents,
  administrators, setAdministrators,
  clubs, setClubs,
  nexauraAdministrators = [], setNexauraAdministrators = () => {},
  announcements = [], setAnnouncements = () => {},
  activeTab
}: AdminContentManagerProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Generic form state
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openModal = (mode: "add" | "edit", item?: any) => {
    setModalMode(mode);
    setEditingId(item?.id || null);
    if (mode === "edit" && item) {
      if (activeTab === "events") {
        setFormData({
          ...item,
          rules: item.rules?.join("\n") || "",
          timeline: item.timeline?.join("\n") || ""
        });
      } else {
        setFormData({ ...item });
      }
    } else {
      if (activeTab === "events") {
        setFormData({ name: "", registrationOpenDate: "", registrationEndDate: "", date: "", time: "TBD", venue: "", category: "General", description: "", rules: "", teamSize: 6, timeline: "", image: "" });
      } else if (activeTab === "clubs") {
        setFormData({ name: "", subtitle: "", description: "", icon: "Zap", image: "" });
      } else if (activeTab === "admins" || activeTab === "nexaura-admins") {
        setFormData({ name: "", role: "", year: "", image: "", linkedin: "", phone: "" });
      } else if (activeTab === "announcements") {
        setFormData({ title: "", description: "", date: "", link: "", image: "" });
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setEditingId(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const safeUpsert = async (table: string, payload: any, editingId?: string | null) => {
    let currentPayload = { ...payload };
    let maxRetries = 5;
    while (maxRetries > 0) {
      maxRetries--;
      const { error, data } = editingId 
        ? await supabase.from(table).update(currentPayload).eq("id", editingId)
        : await supabase.from(table).insert(currentPayload);
      
      if (error) {
        const match = error.message.match(/Could not find the '(.*?)' column/);
        if (match && match[1]) {
          console.warn(`Database missing column '${match[1]}'. Stripping and retrying...`);
          delete currentPayload[match[1]];
          continue;
        }
        return { error };
      }
      return { data };
    }
    return { error: { message: "Too many missing columns" } };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "events") {
      const payload: Event = {
        ...formData,
        id: editingId || formData.name.toLowerCase().replace(/\s+/g, '-'),
        rules: typeof formData.rules === "string" ? formData.rules.split("\n").filter(Boolean) : (formData.rules || []),
        timeline: typeof formData.timeline === "string" ? formData.timeline.split("\n").filter(Boolean) : (formData.timeline || []),
        teamSize: parseInt(formData.teamSize) || 6,
        isTeamEvent: parseInt(formData.teamSize) > 1,
        pptFormat: formData.pptFormat || [],
        prizes: formData.prizes || []
      };

      if (modalMode === "add") {
        const { error } = await safeUpsert("events", payload);
        if (error) { alert("Failed to add event: " + error.message); return; }
        setEvents([payload, ...events]);
      } else {
        const { error } = await safeUpsert("events", payload, editingId);
        if (error) { alert("Failed to update event: " + error.message); return; }
        setEvents(events.map(e => e.id === editingId ? payload : e));
      }
    } else if (activeTab === "clubs") {
      const payload: Club = {
        ...formData,
        id: editingId || formData.name.toLowerCase().replace(/\s+/g, '-'),
      };
      if (!payload.subtitle) payload.subtitle = null as any;
      if (!payload.image) delete payload.image; // Keep delete for image to avoid breaking existing image if empty during edit

      if (modalMode === "add") {
        const { error } = await safeUpsert("clubs", payload);
        if (error) { alert("Failed to add club: " + error.message); return; }
        setClubs([...clubs, payload]);
      } else {
        const { error } = await safeUpsert("clubs", payload, editingId);
        if (error) { alert("Failed to update club: " + error.message); return; }
        setClubs(clubs.map(c => c.id === editingId ? payload : c));
      }
    } else if (activeTab === "admins") {
      const payload: Administrator = {
        ...formData,
        id: editingId || formData.name.toLowerCase().replace(/\s+/g, '-'),
      };
      if (!payload.linkedin) payload.linkedin = null as any;
      if (!payload.phone) payload.phone = null as any;
      if (!payload.image) delete payload.image; // Keep delete for image to avoid breaking avatar if empty during edit

      if (modalMode === "add") {
        const { error } = await safeUpsert("administrators", payload);
        if (error) { alert("Failed to add admin: " + error.message); return; }
        setAdministrators([...administrators, payload]);
      } else {
        const { error } = await safeUpsert("administrators", payload, editingId);
        if (error) { alert("Failed to update admin: " + error.message); return; }
        setAdministrators(administrators.map(a => a.id === editingId ? payload : a));
      }
    } else if (activeTab === "nexaura-admins") {
      const payload: Administrator = {
        ...formData,
        id: editingId || formData.name.toLowerCase().replace(/\s+/g, '-'),
      };
      if (!payload.linkedin) payload.linkedin = null as any;
      if (!payload.phone) payload.phone = null as any;
      if (!payload.image) delete payload.image;

      if (modalMode === "add") {
        const { error } = await safeUpsert("nexaura_administrators", payload);
        if (error) { alert("Failed to add Nexaura admin: " + error.message); return; }
        setNexauraAdministrators([...nexauraAdministrators, payload]);
      } else {
        const { error } = await safeUpsert("nexaura_administrators", payload, editingId);
        if (error) { alert("Failed to update Nexaura admin: " + error.message); return; }
        setNexauraAdministrators(nexauraAdministrators.map(a => a.id === editingId ? payload : a));
      }
    } else if (activeTab === "announcements") {
      const payload: any = {
        ...formData,
        id: editingId || formData.title.toLowerCase().replace(/\s+/g, '-'),
      };
      if (!payload.link) delete payload.link;
      if (!payload.image) delete payload.image;

      if (modalMode === "add") {
        const { error } = await safeUpsert("announcements", payload);
        if (error) { alert("Failed to add announcement: " + error.message); return; }
        setAnnouncements([...announcements, payload]);
      } else {
        const { error } = await safeUpsert("announcements", payload, editingId);
        if (error) { alert("Failed to update announcement: " + error.message); return; }
        setAnnouncements(announcements.map(a => a.id === editingId ? payload : a));
      }
    }

    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    if (activeTab === "events") {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) { alert("Failed to delete event: " + error.message); return; }
      setEvents(events.filter(e => e.id !== id));
    } else if (activeTab === "clubs") {
      const { error } = await supabase.from("clubs").delete().eq("id", id);
      if (error) { alert("Failed to delete club: " + error.message); return; }
      setClubs(clubs.filter(c => c.id !== id));
    } else if (activeTab === "admins") {
      const { error } = await supabase.from("administrators").delete().eq("id", id);
      if (error) { alert("Failed to delete admin: " + error.message); return; }
      setAdministrators(administrators.filter(a => a.id !== id));
    } else if (activeTab === "nexaura-admins") {
      const { error } = await supabase.from("nexaura_administrators").delete().eq("id", id);
      if (error) { alert("Failed to delete Nexaura admin: " + error.message); return; }
      setNexauraAdministrators(nexauraAdministrators.filter(a => a.id !== id));
    } else if (activeTab === "announcements") {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) { alert("Failed to delete announcement: " + error.message); return; }
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleTimelineChange = (idx: number, fieldIndex: number, value: string) => {
    let currentTimeline: string[] = [];
    if (typeof formData.timeline === "string") {
      currentTimeline = formData.timeline.split("\n").filter(Boolean);
    } else if (Array.isArray(formData.timeline)) {
      currentTimeline = [...formData.timeline];
    }
    const rowStr = currentTimeline[idx] || "";
    const parts = rowStr.split("|").map(s => s.trim());
    while (parts.length < 3) parts.push("");
    parts[fieldIndex] = value;
    currentTimeline[idx] = parts.join(" | ");
    handleInputChange("timeline", currentTimeline);
  };

  const addTimelineRow = () => {
    let currentTimeline: string[] = [];
    if (typeof formData.timeline === "string") {
      currentTimeline = formData.timeline.split("\n").filter(Boolean);
    } else if (Array.isArray(formData.timeline)) {
      currentTimeline = [...formData.timeline];
    }
    currentTimeline.push(" | | ");
    handleInputChange("timeline", currentTimeline);
  };

  const removeTimelineRow = (idx: number) => {
    let currentTimeline: string[] = [];
    if (typeof formData.timeline === "string") {
      currentTimeline = formData.timeline.split("\n").filter(Boolean);
    } else if (Array.isArray(formData.timeline)) {
      currentTimeline = [...formData.timeline];
    }
    currentTimeline.splice(idx, 1);
    handleInputChange("timeline", currentTimeline);
  };

  const renderModalContent = () => {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Common Image Upload */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-semibold uppercase">Photo / Image</label>
          <div className="flex items-center gap-4">
            {formData.image && (
              <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-md object-cover border border-white/10" />
            )}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Upload Image
            </Button>
          </div>
        </div>

        {(activeTab === "admins" || activeTab === "nexaura-admins") && (
          <>
            <input required placeholder="Name" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
            <input required placeholder="Role" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.role || ''} onChange={e => handleInputChange('role', e.target.value)} />
            <input required placeholder="Year" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.year || ''} onChange={e => handleInputChange('year', e.target.value)} />
            <input placeholder="LinkedIn Profile URL" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.linkedin || ''} onChange={e => handleInputChange('linkedin', e.target.value)} />
            <input placeholder="Phone Number" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} />
          </>
        )}

        {activeTab === "clubs" && (
          <>
            <input required placeholder="Club Name" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
            <input placeholder="Subtitle (Optional)" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.subtitle || ''} onChange={e => handleInputChange('subtitle', e.target.value)} />
            <textarea placeholder="Description" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all min-h-[120px] resize-y" value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} />
          </>
        )}

        {activeTab === "announcements" && (
          <>
            <input required placeholder="Announcement Title" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.title || ''} onChange={e => handleInputChange('title', e.target.value)} />
            <input required placeholder="Date (e.g. AUG 15, 2026)" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.date || ''} onChange={e => handleInputChange('date', e.target.value)} />
            <input placeholder="External Link (Optional)" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.link || ''} onChange={e => handleInputChange('link', e.target.value)} />
            <textarea required placeholder="Description" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all min-h-[120px] resize-y" value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} />
          </>
        )}

        {activeTab === "events" && (
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Event Name" className="col-span-2 p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Reg Open Date</label>
              <input type="date" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all [color-scheme:dark]" value={formData.registrationOpenDate || ''} onChange={e => handleInputChange('registrationOpenDate', e.target.value)} />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Reg End Date</label>
              <input type="date" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all [color-scheme:dark]" value={formData.registrationEndDate || ''} onChange={e => handleInputChange('registrationEndDate', e.target.value)} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Event Date</label>
              <input type="date" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all [color-scheme:dark]" value={formData.date || ''} onChange={e => handleInputChange('date', e.target.value)} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Event Time</label>
              <input type="time" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all [color-scheme:dark]" value={formData.time || ''} onChange={e => handleInputChange('time', e.target.value)} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Team Size (1 for Solo)</label>
              <input type="number" min="1" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.teamSize || ''} onChange={e => handleInputChange('teamSize', e.target.value)} />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Venue</label>
              <input placeholder="Venue" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all" value={formData.venue || ''} onChange={e => handleInputChange('venue', e.target.value)} />
            </div>
            
            <textarea placeholder="About the Event" className="col-span-2 p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all min-h-[100px] resize-y" value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} />
            <textarea placeholder="Rules and Regulations (one per line)" className="col-span-2 p-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all min-h-[100px] resize-y" value={formData.rules || ''} onChange={e => handleInputChange('rules', e.target.value)} />
            
            {/* Timeline Table UI */}
            <div className="col-span-2 flex flex-col gap-3 mt-2 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <label className="text-xs text-slate-400 font-semibold uppercase">Event Timeline Steps</label>
                <Button type="button" variant="primary" size="sm" onClick={addTimelineRow}>
                  + Add Step
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {(() => {
                  let timelineArr: string[] = [];
                  if (typeof formData.timeline === "string") timelineArr = formData.timeline.split("\n").filter(Boolean);
                  else if (Array.isArray(formData.timeline)) timelineArr = formData.timeline;
                  
                  if (timelineArr.length === 0) return <p className="text-xs text-slate-500 italic py-2">No timeline steps added yet. Click &quot;+ Add Step&quot; to begin.</p>;

                  return timelineArr.map((rowStr, idx) => {
                    const parts = rowStr.split("|").map(s => s.trim());
                    const title = parts[0] || "";
                    const date = parts[1] || "";
                    const subtitle = parts[2] || "";

                    return (
                      <div key={idx} className="flex items-center gap-2 bg-white/10 p-2 rounded border border-white/5">
                        <input placeholder="Step Title" className="flex-1 bg-transparent text-white text-sm outline-none px-2" value={title} onChange={(e) => handleTimelineChange(idx, 0, e.target.value)} />
                        <div className="w-[1px] h-6 bg-white/10" />
                        <input type="date" placeholder="Date" className="w-1/3 bg-transparent text-white text-sm outline-none px-2 [color-scheme:dark]" value={date} onChange={(e) => handleTimelineChange(idx, 1, e.target.value)} />
                        <div className="w-[1px] h-6 bg-white/10" />
                        <input placeholder="Subtitle / End Date" className="flex-1 bg-transparent text-white text-sm outline-none px-2" value={subtitle} onChange={(e) => handleTimelineChange(idx, 2, e.target.value)} />
                        <button type="button" onClick={() => removeTimelineRow(idx)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors ml-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5">
          <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
          <Button type="button" variant="primary" onClick={handleSubmit}>{modalMode === "add" ? "Save" : "Update"}</Button>
        </div>
      </form>
    );
  };

  const getList = () => {
    if (activeTab === "events") return events;
    if (activeTab === "clubs") return clubs;
    if (activeTab === "announcements") return announcements;
    if (activeTab === "nexaura-admins") return nexauraAdministrators;
    return administrators;
  };

  return (
    <>
      <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white capitalize">Manage {activeTab}</h3>
          <Button onClick={() => openModal("add")}>Add New {activeTab.slice(0, -1)}</Button>
        </div>

        <div className="flex flex-col gap-4">
          {getList().map((item: any, i) => (
            <div key={item.id || i} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-4">
                {item.image && (
                  <img src={item.image} alt="thumbnail" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                )}
                <div>
                  <h4 className="text-white font-semibold">{item.name || item.title}</h4>
                  <p className="text-slate-400 text-xs">
                    {activeTab === "events" && `${item.date || "No Date"} | Max Team: ${item.teamSize || 6}`}
                    {activeTab === "clubs" && (item.description?.substring(0, 50) + "...")}
                    {activeTab === "announcements" && `${item.date || ""} | ${item.description?.substring(0, 40) + "..."}`}
                    {(activeTab === "admins" || activeTab === "nexaura-admins") && item.role}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal("edit", item)} className="p-2 bg-white/10 text-white/70 rounded hover:bg-white/10 hover:text-white transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.1)]">
            <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0 bg-transparent">
              <h2 className="text-xl font-bold text-white capitalize">{modalMode} {activeTab.slice(0, -1)}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
