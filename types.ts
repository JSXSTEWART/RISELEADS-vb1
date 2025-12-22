
export type Language = 'en' | 'es' | 'zh';

export interface AuditEntry {
  event: string;
  timestamp: string;
  type: 'info' | 'success' | 'alert';
}

export interface EnrichedData {
  revenue?: string;
  employees?: number;
  industry?: string;
  location?: string;
  qualScore?: number; // 0-100
  qualSegment?: 'Low' | 'Medium' | 'Good' | 'Very Good';
  buyingSignals?: string[];
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  techStack?: string[];
  lastFunded?: string;
  isEnriched?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  mapsUrl?: string;
  status: 'New' | 'Contacted' | 'Replied' | 'Closed';
  category: string;
  savedAt: string;
  score?: number; // Internal AI Score
  scoreReason?: string;
  enrichedData?: EnrichedData;
  auditLog: AuditEntry[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'success' | 'info';
  read: boolean;
  timestamp: Date;
}

export interface LeadsContextType {
  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}
