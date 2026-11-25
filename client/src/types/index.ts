export interface User {
  _id: string;
  name: string;
  email: string;
  company?: string;
  role: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  budget?: string;
  requirements?: string;
  purchaseTimeline?: string;
  leadScore: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown' | string;
  buyingIntent: 'high' | 'medium' | 'low' | 'unknown' | string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost';
  lastInteraction?: string;
  notes?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptEntry {
  role: 'agent' | 'customer';
  content: string;
  timestamp: string;
}

export interface CallSummary {
  summary: string;
  painPoints: string[];
  objections: string[];
  buyingSignals: string[];
  nextAction: string;
  sentiment: string;
  buyingIntent: string;
}

export interface Call {
  _id: string;
  leadId?: string;
  customerName: string;
  customerPhone?: string;
  duration: number;
  status: 'active' | 'completed' | 'missed' | 'failed';
  sentiment: string;
  buyingIntent: string;
  leadScore: number;
  outcome?: string;
  transcript: TranscriptEntry[];
  summary?: CallSummary;
  language: string;
  conversationStage?: string;
  createdAt: string;
}

export interface Appointment {
  _id: string;
  leadId?: string;
  title: string;
  description?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  meetingType: 'demo' | 'consultation' | 'followup' | 'closing';
  notes?: string;
  createdByAgent: boolean;
  createdAt: string;
}

export interface KnowledgeDocument {
  _id: string;
  title: string;
  content?: string;
  type: 'pdf' | 'txt' | 'md' | 'manual';
  originalFilename?: string;
  fileSize?: number;
  chunkCount: number;
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
}

export interface AgentConfig {
  _id?: string;
  agentName: string;
  companyName: string;
  companyDescription?: string;
  salesPitch?: string;
  productInfo?: string;
  objectionHandling?: string;
  greeting?: string;
  language: string;
  voiceEnabled: boolean;
  autoQualify: boolean;
}

export interface DashboardStats {
  totalCalls: number;
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  appointmentsBooked: number;
  avgCallDuration: number;
  revenuePipeline: number;
}
