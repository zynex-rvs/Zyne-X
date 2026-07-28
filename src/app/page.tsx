"use client";

import React, { useState, useEffect, useCallback } from "react";
import Background from "@/components/Background";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Announcements from "@/components/sections/Announcements";
import Clubs from "@/components/sections/Clubs";
import Team from "@/components/sections/Team";
import Events from "@/components/sections/Events";
import EventDetail from "@/components/sections/EventDetail";
import EventsGallery from "@/components/sections/EventsGallery";
import Enquiry from "@/components/sections/Enquiry";
import UserDashboard from "@/components/dashboard/UserDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import ModeratorDashboard from "@/components/dashboard/ModeratorDashboard";
import AuthModal from "@/components/modals/AuthModal";
import AdminLoginModal from "@/components/modals/AdminLoginModal";
import ModeratorLoginModal from "@/components/modals/ModeratorLoginModal";
import EditProfileModal from "@/components/modals/EditProfileModal";
import EventRegisterModal from "@/components/modals/EventRegisterModal";
import NotificationPanel from "@/components/modals/NotificationPanel";
import ImageCropperModal from "@/components/modals/ImageCropperModal";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { registerUser, loginUser } from "@/app/actions/auth";
import Footer from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/Toast";
import { User, Event, Team as TeamType, Registration, Notification, Enquiry as EnquiryType, Club, Administrator } from "@/types";
import { useToast } from "@/hooks/useToast";

import { supabase } from "@/lib/supabaseClient";

const mockAnnouncements: import("@/types").Announcement[] = [
  {
    id: "1",
    title: "Registrations Open for AI Hackathon",
    description: "Join the biggest AI Hackathon of the year. Build innovative solutions and win huge prizes. Early bird registrations close next week!",
    date: "JULY 25, 2026",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
    link: "#events",
  },
  {
    id: "2",
    title: "Guest Lecture: Future of Neural Networks",
    description: "Dr. Alan Turing Jr. will be discussing the latest breakthroughs in LLMs and generative AI. Open to all students.",
    date: "AUG 02, 2026",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
    link: "#",
  },
  {
    id: "3",
    title: "ZYNE-X Club Inductions",
    description: "We are recruiting! If you have a passion for AI, Web Dev, or Design, come join our community.",
    date: "AUG 15, 2026",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000",
    link: "#",
  }
];

export default function Home() {
  // Global States (Supabase synchronized)
  const [events, setEvents] = useState<Event[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [nexauraAdministrators, setNexauraAdministrators] = useState<Administrator[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  
  const [users, setUsers] = useState<User[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<Record<string, Registration[]>>({});
  const [teams, setTeams] = useState<Record<string, TeamType>>({});
  const [enquiries, setEnquiries] = useState<EnquiryType[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<import("@/types").Announcement[]>(mockAnnouncements);
  
  // Try to load currentUser from localStorage as a simple session mechanism
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);

  // Fetch initial data from Supabase


  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        // 1. Fetch lightweight public data required for the landing page
        const [
          { data: eventsData },
          { data: adminsData },
          { data: nexauraAdminsData },
          { data: clubsData },
          { data: announcementsData, error: annError }
        ] = await Promise.all([
          supabase.from("events").select("*"),
          supabase.from("administrators").select("*"),
          supabase.from("nexaura_administrators").select("*"),
          supabase.from("clubs").select("*"),
          supabase.from("announcements").select("*")
        ]);

        if (eventsData) {
          const sorted = [...eventsData].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          setEvents(sorted);
        }
        if (adminsData) setAdministrators(adminsData);
        if (nexauraAdminsData) setNexauraAdministrators(nexauraAdminsData);
        if (clubsData) setClubs(clubsData);
        if (announcementsData && !annError && announcementsData.length > 0) {
          setAnnouncements(announcementsData);
        }

        // Restore user session
        const storedUser = localStorage.getItem("zynex_current_user");
        let parsedUser = null;
        if (storedUser) {
          parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          if (parsedUser.role !== "admin" && !parsedUser.image) {
            setActiveModal("upload-photo");
          }
          // If we have a user session, go ahead and load dashboard data in background
          loadDashboardData(parsedUser);
        }

        setIsLoaded(true);
      } catch (err) {
        console.error("Error fetching public data:", err);
        setIsLoaded(true);
      }
    };
    fetchPublicData();
  }, []);

  // Lazy load dashboard data only when logged in or needed
  const loadDashboardData = async (userObj: User | null = currentUser) => {
    try {
      const [
        { data: usersData },
        { data: teamsData },
        { data: regsData },
        { data: enqData },
        { data: notifsData }
      ] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("teams").select("*"),
        supabase.from("registrations").select("*"),
        supabase.from("enquiries").select("*"),
        supabase.from("notifications").select("*")
      ]);

      if (usersData) {
        setUsers(usersData);
        if (userObj) {
          const freshUser = usersData.find(u => u.id === userObj.id);
          if (freshUser) {
            setCurrentUser(freshUser);
          }
        }
      }
      if (enqData) setEnquiries(enqData);
      if (notifsData) setNotifications(notifsData);

      if (teamsData) {
        const teamsMap: Record<string, import("@/types").Team> = {};
        teamsData.forEach(t => {
          teamsMap[t.teamCode] = t;
        });
        setTeams(teamsMap);
      }

      if (regsData) {
        const regsMap: Record<string, Registration[]> = {};
        regsData.forEach(r => {
          if (!regsMap[r.eventId]) regsMap[r.eventId] = [];
          regsMap[r.eventId].push(r);
        });
        setEventRegistrations(regsMap);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  // View States
  const [viewMode, setViewMode] = useState<"landing" | "gallery" | "event-detail" | "user-dashboard" | "admin-dashboard" | "moderator-dashboard">("landing");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Modals States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  // Handle hash on load
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#admin") {
        setActiveModal("admin-login");
        window.history.replaceState(null, "", window.location.pathname);
      } else if (window.location.hash === "#moderator") {
        setActiveModal("moderator-login");
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Toast notification system
  const { toasts, addToast, removeToast } = useToast();

  // Scroll to section by ID
  const scrollToSection = useCallback((sectionId: string) => {
    // If we're not on the landing page, go back first
    if (viewMode !== "landing") {
      setViewMode("landing");
      setSelectedEvent(null);
      // Wait for React to render landing sections, then scroll
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [viewMode]);

  // Navigation handler
  const navigateTo = useCallback((section: string) => {
    switch (section) {
      case "home":
        setViewMode("landing");
        setSelectedEvent(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "about":
        scrollToSection("about");
        break;
      case "clubs":
        scrollToSection("clubs");
        break;
      case "admins":
        scrollToSection("admins");
        break;
      case "events":
        scrollToSection("events");
        break;
      case "enquiry":
        scrollToSection("enquiry");
        break;
      case "timeline":
        scrollToSection("timeline");
        break;
      case "events-gallery":
        setViewMode("gallery");
        setSelectedEvent(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      default:
        setViewMode("landing");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scrollToSection]);

  const handleLogin = async (regNo: string, pass: string) => {
    const result = await loginUser(regNo, pass);
    
    if (result.error || !result.user) {
      addToast(result.error || "Login failed.", "error");
      return;
    }

    const user = result.user;
    setCurrentUser(user as User);
    localStorage.setItem("zynex_current_user", JSON.stringify(user));
    
    // Load heavy dashboard data now that they are logged in
    loadDashboardData(user as User);

    if (user.role !== "admin" && !user.image) {
      setActiveModal("upload-photo");
    } else {
      setActiveModal(null);
    }
    setViewMode("user-dashboard");
    setSelectedEvent(null);
    addToast(`Welcome back, ${user.name}!`, "success");
  };

  const handleSignup = async (data: any) => {
    const { data: existing } = await supabase.from("users").select("regNo").eq("regNo", data.regNo.toUpperCase()).single();
    if (existing) {
      addToast("This Register Number is already registered.", "error");
      return false;
    }

    let photoBase64 = null;
    if (data.photo && data.photo.length > 0) {
      const file = data.photo[0];
      photoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 300;
              const MAX_HEIGHT = 300;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
            img.src = reader.result;
          } else {
            resolve(null);
          }
        };
        reader.readAsDataURL(file);
      });
      
      if (photoBase64) {
        // Upload to Cloudinary instead of saving base64 to postgres
        const cloudUrl = await uploadImageToCloudinary(photoBase64 as string);
        if (cloudUrl) photoBase64 = cloudUrl;
      }
    }

    const newUser = {
      regNo: data.regNo.toUpperCase(),
      name: data.name.toUpperCase(),
      email: data.email.toLowerCase(),
      mobile: data.mobile,
      department: data.department,
      year: data.year,
      password: data.password,
      image: photoBase64,
    };

    const result = await registerUser(newUser);

    if (result.error || !result.user) {
      addToast(result.error || "Registration failed.", "error");
      return false;
    }

    const insertedUser = result.user as User;
    setUsers([...users, insertedUser]);
    setCurrentUser(insertedUser);
    localStorage.setItem("zynex_current_user", JSON.stringify(insertedUser));
    
    loadDashboardData(insertedUser);

    setActiveModal(null);
    addToast(`Account created successfully! Welcome, ${insertedUser.name}!`, "success");
    setViewMode("user-dashboard");
    setSelectedEvent(null);
    return true;
  };

  const handleAdminLogin = async (id: string, pass: string) => {
    const email = id.trim().toLowerCase();
    
    // Prevent moderator emails from accessing the admin portal
    if (email.includes("moderator")) {
      addToast("Access Denied: Moderator accounts cannot access the main Admin portal.", "error");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    if (error || !data.user) {
      console.error("Admin Auth login error:", error);
      addToast("Invalid administrator credentials.", "error");
      return;
    }

    // Construct a synthetic admin session object since they don't have a record in the 'users' table
    const adminUser = {
      id: data.user.id,
      email: data.user.email || email,
      name: "Administrator",
      role: "admin",
      regNo: "ADMIN",
      mobile: "",
      department: "System",
      year: "N/A"
    };

    setCurrentUser(adminUser as User);
    localStorage.setItem("zynex_current_user", JSON.stringify(adminUser));
    
    // Load heavy dashboard data now that admin is logged in
    loadDashboardData(adminUser as User);

    setActiveModal(null);
    setViewMode("admin-dashboard");
    setSelectedEvent(null);
    addToast(`Administrator access granted. Welcome ${adminUser.name}.`, "success");
  };

  const handleModeratorLogin = async (id: string, pass: string) => {
    const email = id.trim().toLowerCase();

    // Ensure only moderator emails can access this portal
    if (!email.includes("moderator")) {
      addToast("Access Denied: Only Moderator accounts can access this portal.", "error");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    if (error || !data.user) {
      console.error("Moderator Auth login error:", error);
      addToast("Invalid moderator credentials.", "error");
      return;
    }

    const modUser = {
      id: data.user.id,
      email: data.user.email || email,
      name: "Moderator",
      role: "moderator",
      regNo: "MODERATOR",
      mobile: "",
      department: "System",
      year: "N/A"
    };

    setCurrentUser(modUser as User);
    localStorage.setItem("zynex_current_user", JSON.stringify(modUser));
    
    // Load heavy dashboard data now that moderator is logged in
    loadDashboardData(modUser as User);

    setActiveModal(null);
    setViewMode("moderator-dashboard");
    setSelectedEvent(null);
    addToast(`Moderator access granted.`, "success");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("zynex_current_user");
    setViewMode("landing");
    addToast("Logged out successfully.", "info");
  };

  // Event Registration Submit Handler
  const handleEventRegisterSubmit = async (data: any) => {
    if (!currentEvent || !currentUser) return;

    // Check duplicate registrations locally first
    const alreadyReg = currentEvent.isTeamEvent
      ? Object.values(teams).some((t) => t.eventId === currentEvent.id && t.members.includes(currentUser.id))
      : (eventRegistrations[currentEvent.id] || []).some((r) => r.userId === currentUser.id);

    if (alreadyReg) {
      addToast("You are already registered for this event.", "warning");
      return;
    }

    const registration = {
      userId: currentUser.id,
      eventId: currentEvent.id,
      email: data.email,
      mobile: data.mobile,
      department: data.department,
      year: data.year,
      teamName: data.teamName || null,
      leaderName: data.leaderName || null,
    };

    if (currentEvent.isTeamEvent) {
      let code = Math.random().toString(36).substring(2, 8).toUpperCase();
      while (teams[code]) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
      }
      
      const newTeam = {
        teamCode: code,
        teamName: data.teamName,
        leaderId: currentUser.id,
        leaderName: data.leaderName,
        members: [currentUser.id],
        eventId: currentEvent.id,
      };

      const { error: teamErr } = await supabase.from("teams").insert(newTeam);
      if (teamErr) {
        console.error("Team Insert Error:", JSON.stringify(teamErr, Object.getOwnPropertyNames(teamErr)));
        const errMsg = teamErr?.message || teamErr?.code || JSON.stringify(teamErr);
        addToast(`Failed to create team. Details: ${errMsg}`, "error");
        return;
      }
      await supabase.from("registrations").insert(registration);
      
      setTeams({ ...teams, [code]: newTeam as any });
      setEventRegistrations({
        ...eventRegistrations,
        [currentEvent.id]: [...(eventRegistrations[currentEvent.id] || []), registration as any],
      });

      // Notify User
      const notif = {
        userId: currentUser.id,
        message: `Registered for ${currentEvent.name}. Go to your Dashboard to invite members!`,
        type: "general",
      };
      const { data: insertedNotif } = await supabase.from("notifications").insert(notif).select().single();
      if (insertedNotif) {
        setNotifications([...notifications, insertedNotif as any]);
      }

      addToast(`Registration successful! Team Code: ${code}`, "success");
    } else {
      const { error: regErr } = await supabase.from("registrations").insert(registration);
      if (regErr) {
        addToast("Failed to register.", "error");
        return;
      }
      setEventRegistrations({
        ...eventRegistrations,
        [currentEvent.id]: [...(eventRegistrations[currentEvent.id] || []), registration as any],
      });
      addToast(`Successfully registered for ${currentEvent.name}!`, "success");
    }
    setActiveModal(null);
  };

  // Dashboard actions
  const handleCancelRegistration = async (eventId: string, isTeam: boolean) => {
    if (!currentUser) return;
    if (isTeam) {
      const team = Object.values(teams).find((t) => t.eventId === eventId && t.members.includes(currentUser.id));
      if (team && team.leaderId === currentUser.id) {
        // Disband team entirely
        await supabase.from("teams").delete().eq("teamCode", team.teamCode);
        const nextTeams = { ...teams };
        delete nextTeams[team.teamCode];
        setTeams(nextTeams);
      } else if (team) {
        // Leave team
        const nextMembers = team.members.filter(id => id !== currentUser.id);
        await supabase.from("teams").update({ members: nextMembers }).eq("teamCode", team.teamCode);
        team.members = nextMembers;
        setTeams({ ...teams, [team.teamCode]: team });
      }
    }
    await supabase.from("registrations").delete().match({ userId: currentUser.id, eventId });
    const nextRegs = { ...eventRegistrations };
    nextRegs[eventId] = (nextRegs[eventId] || []).filter((r) => r.userId !== currentUser.id);
    setEventRegistrations(nextRegs);
    addToast("Registration cancelled.", "info");
  };

  const handleTransferLeadership = async (teamCode: string, newLeaderId: string) => {
    if (!currentUser) return;
    const team = teams[teamCode];
    if (team && team.leaderId === currentUser.id) {
      const { error } = await supabase.from("teams").update({ leaderId: newLeaderId }).eq("teamCode", teamCode);
      if (!error) {
        setTeams({
          ...teams,
          [teamCode]: { ...team, leaderId: newLeaderId }
        });
        addToast("Leadership transferred successfully.", "success");
      } else {
        addToast("Failed to transfer leadership.", "error");
      }
    }
  };

  const handleRemoveMember = async (teamCode: string, memberId: string) => {
    if (!currentUser) return;
    const team = teams[teamCode];
    if (team && (team.leaderId === currentUser.id || currentUser.id === memberId)) {
      if (memberId === team.leaderId) {
        addToast("Leader cannot be removed. Transfer leadership first or disband the team.", "warning");
        return;
      }
      const nextMembers = team.members.filter(id => id !== memberId);
      const { error } = await supabase.from("teams").update({ members: nextMembers }).eq("teamCode", teamCode);
      if (!error) {
        setTeams({
          ...teams,
          [teamCode]: { ...team, members: nextMembers }
        });
        addToast(currentUser.id === memberId ? "You have left the team." : "Member removed successfully.", "success");
      } else {
        addToast("Failed to remove member.", "error");
      }
    }
  };

  const handleEditProfileSubmit = async (data: any) => {
    if (!currentUser) return;
    const { error } = await supabase.from("users").update({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      department: data.department,
      year: data.year
    }).eq("id", currentUser.id);

    if (error) {
      addToast("Failed to update profile.", "error");
      return;
    }
    
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers(users.map((u) => (u.id === currentUser.id ? updated : u)));
    localStorage.setItem("zynex_current_user", JSON.stringify(updated));
    setActiveModal(null);
    addToast("Profile updated successfully!", "success");
  };

  const handleChangePassword = async (curr: string, next: string) => {
    if (!currentUser) return;
    if (currentUser.password !== curr) {
      addToast("Current password is incorrect.", "error");
      return;
    }
    const { error } = await supabase.from("users").update({ password: next }).eq("id", currentUser.id);
    if (error) {
      addToast("Failed to update password.", "error");
      return;
    }
    const updated = { ...currentUser, password: next };
    setCurrentUser(updated);
    setUsers(users.map((u) => (u.id === currentUser.id ? updated : u)));
    localStorage.setItem("zynex_current_user", JSON.stringify(updated));
    setActiveModal(null);
    addToast("Password updated successfully!", "success");
  };

  const handleUploadPhoto = async (base64: string) => {
    if (!currentUser) return;
    
    // Upload base64 string to Cloudinary
    const cloudUrl = await uploadImageToCloudinary(base64);
    const finalImage = cloudUrl || base64; // Fallback to base64 if Cloudinary fails, but typically cloudUrl is used
    
    const { error } = await supabase.from("users").update({ image: finalImage }).eq("id", currentUser.id);
    if (!error) {
      const updated = { ...currentUser, image: finalImage };
      setCurrentUser(updated);
      setUsers(users.map((u) => (u.id === currentUser.id ? updated : u)));
      try {
        localStorage.setItem("zynex_current_user", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
      addToast("Profile photo updated!", "success");
    } else {
      addToast("Failed to update photo.", "error");
    }
  };

  const handleSetProblemStatement = async (teamCode: string) => {
    const team = teams[teamCode];
    if (team) {
      await supabase.from("teams").update({ problemStatement: team.problemStatement }).eq("teamCode", teamCode);
    }
    addToast(`Problem Statement saved for team: ${teamCode}`, "success");
  };

  // Enquiry submissions
  const handleEnquirySubmit = async (data: any) => {
    const enq = {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: "pending"
    };
    const { data: inserted, error } = await supabase.from("enquiries").insert(enq).select().single();
    if (inserted) {
      setEnquiries([...enquiries, inserted as any]);
    }
  };

  // Notifications invite actions
  const handleInviteMemberByRegNo = async (regNo: string, teamCode: string) => {
    if (!currentUser) return;
    
    // Find the user by Reg No.
    const invitedUser = users.find(u => u.regNo.toLowerCase() === regNo.toLowerCase());
    
    if (!invitedUser) {
      addToast(`No user found with Reg No: ${regNo}`, "error");
      return;
    }

    if (invitedUser.id === currentUser.id) {
      addToast(`You are already the leader of this team!`, "warning");
      return;
    }

    const team = teams[teamCode];
    if (team && team.members.includes(invitedUser.id)) {
      addToast(`${invitedUser.name} is already in the team.`, "warning");
      return;
    }

    // Check if invite already sent
    const alreadyInvited = notifications.some(n => n.userId === invitedUser.id && n.teamCode === teamCode && n.type === "invite");
    if (alreadyInvited) {
      addToast(`An invite is already pending for ${invitedUser.name}.`, "info");
      return;
    }

    // Push notification to the invited user
    const notif = {
      userId: invitedUser.id,
      message: `${currentUser.name} invited you to join team ${team?.teamName || teamCode}.`,
      type: "invite",
      teamCode: teamCode,
    };
    
    const { data: insertedNotif, error } = await supabase.from("notifications").insert(notif).select().single();
    if (error) {
      addToast("Failed to send invite.", "error");
      return;
    }
    setNotifications([...notifications, insertedNotif as any]);
    addToast(`Invite sent to ${invitedUser.name} (${regNo})!`, "success");
  };

  const handleAcceptInvite = async (id: number) => {
    // Note: The id is passed as a number or string depending on schema. Here it's expected as string or uuid based on supabase.
    const notif = notifications.find((n) => (n.id as any) === id);
    if (notif && notif.teamCode && currentUser) {
      const team = teams[notif.teamCode];
      if (team) {
        if (team.members.length >= 6) {
          addToast("Team is full! Maximum 6 members allowed.", "warning");
          return;
        }
        
        const nextMembers = [...team.members, currentUser.id];
        const { error: updateErr } = await supabase.from("teams").update({ members: nextMembers }).eq("teamCode", team.teamCode);
        
        if (!updateErr) {
          setTeams({ ...teams, [notif.teamCode]: { ...team, members: nextMembers } });
          addToast(`You joined team ${team.teamName}!`, "success");
        } else {
          addToast("Failed to join team.", "error");
        }
      }
    }
    
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(notifications.filter((n) => (n.id as any) !== id));
    setIsNotificationsOpen(false);
  };

  const handleRejectInvite = async (id: number) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(notifications.filter((n) => (n.id as any) !== id));
    setIsNotificationsOpen(false);
    addToast("Invitation declined.", "info");
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await supabase.from("notifications").update({ unread: false }).eq("userId", currentUser.id);
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleRespondEnquiry = async (idx: number, reply: string) => {
    const list = [...enquiries];
    const enq = list[idx];
    const { error } = await supabase.from("enquiries").update({ status: "resolved" }).eq("id", enq.id);
    if (!error) {
      enq.status = "resolved";
      setEnquiries(list);
      addToast("Response sent to candidate.", "success");
    } else {
      addToast("Failed to respond to enquiry.", "error");
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Hydration guard
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-outfit tracking-wider uppercase">Loading ZYNE-X Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Background />
      {viewMode !== "admin-dashboard" && (
        <Navbar
          currentUser={currentUser}
          unreadCount={unreadCount}
          navigateTo={navigateTo}
          setActiveDashboard={(type) => {
            if (type === "user") setViewMode("user-dashboard");
            else if (type === "admin") setViewMode("admin-dashboard");
            else if (type === "moderator") setViewMode("moderator-dashboard");
            else setViewMode("landing");
          }}
          setActiveModal={setActiveModal}
          setIsNotificationsOpen={setIsNotificationsOpen}
          logoutUser={handleLogout}
        />
      )}

      {/* Full-width Hero section for landing view */}
      {viewMode === "landing" && (
        <Hero
          onJoinClick={() => setActiveModal("signup")}
          onExploreClick={() => scrollToSection("events")}
        />
      )}

      {/* Main content area */}
      <main id="main-content" className={`min-h-[70vh] relative z-20 ${viewMode !== 'landing' ? 'pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''}`}>

        {/* Landing Page: all sections always visible */}
        {viewMode === "landing" && (
          <>
            <Announcements announcements={announcements} />
            <div className="animated-divider max-w-6xl" />
            
            <Clubs clubs={clubs} />
            
            <div className="animated-divider max-w-6xl" />
            <div className="animated-divider max-w-6xl" />
            <Team admins={administrators} subtitle="ZYNE-X" />
            <div className="animated-divider max-w-6xl" />
            <Team admins={nexauraAdministrators} subtitle="NEXAURA" />
            <div className="animated-divider max-w-6xl" />
            
            <Events
              events={events}
              onRegisterClick={(event) => {
                if (!currentUser) {
                  setActiveModal("login");
                  return;
                }
                if (currentUser.role === "admin" || currentUser.role === "moderator") {
                  addToast("Staff cannot register for events. Please use a student account.", "warning");
                  return;
                }
                const alreadyReg = event.isTeamEvent
                  ? Object.values(teams).some((t) => t.eventId === event.id && t.members.includes(currentUser.id))
                  : (eventRegistrations[event.id] || []).some((r) => r.userId === currentUser.id);
                if (alreadyReg) {
                  addToast("You are already registered for this event.", "warning");
                  return;
                }
                setCurrentEvent(event);
                setActiveModal("event-registration");
              }}
              onViewDetailsClick={(event) => {
                setSelectedEvent(event);
                setViewMode("event-detail");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            <Enquiry onSubmitEnquiry={handleEnquirySubmit} />
          </>
        )}

        {/* Events Gallery View */}
        {viewMode === "gallery" && (
          <EventsGallery
            events={events}
            onBack={() => { setViewMode("landing"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onViewMore={(event) => {
              setSelectedEvent(event);
              setViewMode("event-detail");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onRegister={(event) => {
              if (!currentUser) {
                setActiveModal("login");
                return;
              }
              if (currentUser.role === "admin" || currentUser.role === "moderator") {
                addToast("Staff cannot register for events. Please use a student account.", "warning");
                return;
              }
              const alreadyReg = event.isTeamEvent
                ? Object.values(teams).some((t) => t.eventId === event.id && t.members.includes(currentUser.id))
                : (eventRegistrations[event.id] || []).some((r) => r.userId === currentUser.id);
              if (alreadyReg) {
                addToast("You are already registered for this event.", "warning");
                return;
              }
              setCurrentEvent(event);
              setActiveModal("event-registration");
            }}
          />
        )}

        {/* Detailed Event View */}
        {viewMode === "event-detail" && selectedEvent && (
          <EventDetail
            event={selectedEvent}
            onBackClick={() => { setViewMode("landing"); setSelectedEvent(null); }}
            onRegisterClick={() => {
              if (!currentUser) {
                setActiveModal("login");
                return;
              }
              if (currentUser.role === "admin" || currentUser.role === "moderator") {
                addToast("Staff cannot register for events. Please use a student account.", "warning");
                return;
              }
              const alreadyReg = selectedEvent.isTeamEvent
                ? Object.values(teams).some((t) => t.eventId === selectedEvent.id && t.members.includes(currentUser.id))
                : (eventRegistrations[selectedEvent.id] || []).some((r) => r.userId === currentUser.id);
              if (alreadyReg) {
                addToast("You are already registered for this event.", "warning");
                return;
              }
              setCurrentEvent(selectedEvent);
              setActiveModal("event-registration");
            }}
          />
        )}

        {/* User Dashboard */}
        {viewMode === "user-dashboard" && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            events={events}
            teams={teams}
            eventRegistrations={eventRegistrations}
            users={users}
            onEditProfile={() => setActiveModal("edit-profile")}
            onUploadPhoto={handleUploadPhoto}
            onCancelRegistration={handleCancelRegistration}
            onSetProblemStatement={handleSetProblemStatement}
            onInviteMember={handleInviteMemberByRegNo}
            onTransferLeadership={handleTransferLeadership}
            onRemoveMember={handleRemoveMember}
            setUsers={setUsers}
          />
        )}

        {/* Admin Dashboard */}
        {viewMode === "admin-dashboard" && (
          <AdminDashboard
            events={events}
            setEvents={setEvents}
            administrators={administrators}
            setAdministrators={setAdministrators}
            nexauraAdministrators={nexauraAdministrators}
            setNexauraAdministrators={setNexauraAdministrators}
            clubs={clubs}
            setClubs={setClubs}
            users={users}
            setUsers={setUsers}
            teams={teams}
            setTeams={setTeams}
            eventRegistrations={eventRegistrations}
            enquiries={enquiries}
            onRespondEnquiry={handleRespondEnquiry}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
          />
        )}

        {/* Moderator Dashboard */}
        {viewMode === "moderator-dashboard" && (
          <ModeratorDashboard
            events={events}
            users={users}
            teams={teams}
            eventRegistrations={eventRegistrations}
          />
        )}
      </main>

      <Footer navigateTo={navigateTo} />

      {/* Modals */}
      <AuthModal
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        setActiveModal={setActiveModal}
      />

      <AdminLoginModal
        isOpen={activeModal === "admin-login"}
        onClose={() => setActiveModal(null)}
        onAdminLogin={handleAdminLogin}
      />

      <ModeratorLoginModal
        isOpen={activeModal === "moderator-login"}
        onClose={() => setActiveModal(null)}
        onModeratorLogin={handleModeratorLogin}
      />

      <EditProfileModal
        isOpen={activeModal === "edit-profile"}
        onClose={() => setActiveModal(null)}
        currentUser={currentUser || ({} as User)}
        onEditProfile={handleEditProfileSubmit}
        onChangePassword={handleChangePassword}
      />

      {currentEvent && (
        <EventRegisterModal
          isOpen={activeModal === "event-registration"}
          onClose={() => setActiveModal(null)}
          event={currentEvent}
          currentUser={currentUser || ({} as User)}
          onRegisterSubmit={handleEventRegisterSubmit}
        />
      )}

      <NotificationPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications.filter((n) => n.userId === currentUser?.id)}
        onAcceptInvite={handleAcceptInvite}
        onRejectInvite={handleRejectInvite}
        onMarkAllRead={handleMarkAllRead}
      />

      {activeModal === "upload-photo" && currentUser && !currentUser.image && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="w-full max-w-md neumorphic-raised rounded-[2rem] p-6 md:p-8 relative overflow-hidden z-10 flex flex-col gap-6 text-center">
            <h2 className="text-2xl font-bold font-outfit text-white">Upload Your Photo</h2>
            <p className="text-slate-400 text-sm">
              Please upload a profile photo to continue using the dashboard. It is mandatory for event registrations.
            </p>
            <div className="flex justify-center">
              <label 
                className="cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === "string") {
                        setCropperImage(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              >
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-2 transition-colors bg-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  <span className="text-xs text-white/50 font-semibold uppercase tracking-wider">Select Photo</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === "string") {
                          setCropperImage(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
