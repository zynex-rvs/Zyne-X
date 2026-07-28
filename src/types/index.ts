export interface User {
  id: string;
  regNo: string;
  name: string;
  email: string;
  mobile: string;
  department: string;
  year: string;
  role: 'member' | 'admin';
  password?: string;
  image?: string;
  imagePosition?: string;
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
  imagePosition?: string;
  isFeatured?: boolean;
  registrationOpenDate?: string;
  registrationEndDate?: string;
  timeline?: string[];
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
  imagePosition?: string;
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
  imagePosition?: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  imagePosition?: string;
  link?: string;
}
