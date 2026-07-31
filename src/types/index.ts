export interface User {
  id: string;
  regNo: string;
  name: string;
  email: string;
  mobile: string;
  department: string;
  year: string;
  role: 'member' | 'admin' | 'moderator';
  password?: string;
  image?: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  description: string;
  rules: string[];
  eligibility: string;
  pptFormat: string[];
  isTeamEvent: boolean;
  teamSize?: number;
  prizes: string[];
  faqs?: { q: string; a: string }[];
  contacts?: { name: string; role: string; phone: string }[];
  image: string;
  isFeatured?: boolean;
  registrationOpenDate?: string;
  registrationEndDate?: string;
  timeline?: string[];
  organizedBy?: string;
}

export interface Team {
  teamCode: string;
  teamName: string;
  leaderId: string;
  leaderName: string;
  members: string[];
  eventId: string;
  problemStatement?: string;
}

export interface Registration {
  userId: string;
  teamName?: string;
  leaderName?: string;
  name?: string;
  email: string;
  mobile: string;
  department: string;
  year: string;
}

export interface Notification {
  id: number;
  userId: string;
  message: string;
  type: 'general' | 'invite';
  teamCode?: string;
  unread: boolean;
  timestamp: string;
}

export interface Enquiry {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'pending' | 'resolved';
}

export interface Club {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  icon: string;
  image?: string;
}

export interface Administrator {
  id: string;
  name: string;
  role: string;
  year: string;
  image: string;
  linkedin?: string;
  phone?: string;
  orderIndex?: number;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  link?: string;
}

export interface Submission {
  id?: string;
  eventId: string;
  userId: string;
  teamCode?: string;
  projectUrl: string;
  description?: string;
  submittedAt?: string;
}

export interface Winner {
  id: string;
  event_id: string;
  position: 1 | 2 | 3;
  winner_name: string;
  members?: string[];
  member_images?: string[];
  image?: string;
  project_url?: string;
  created_at?: string;
}
