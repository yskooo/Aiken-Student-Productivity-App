export type CalendarEvent = {
  id: string;
  title: string;
  type: 'class' | 'deadline' | 'meeting' | 'deep_work' | 'pomodoro' | 'custom';
  start: string;
  end: string;
  sourcePlatform?: string;
  sourceUrl?: string;
  weight?: number;
  completed?: boolean;
};

export type PendingAction = {
  id: string;
  kind: 'create_event' | 'toggle_dnd' | 'delete_data';
  payload: { event?: CalendarEvent; minutes?: number };
  reasoning: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sourceSnippets?: { doc: string; quote: string }[];
  plan?: StudyPlanStep[];
};

export type StudyPlanStep = {
  id: string;
  label: string;
  estimatedMinutes: number;
  dependsOn: string[];
  proposedBlock?: { start: string; end: string };
};

export type Document = {
  id: string;
  filename: string;
  kind: 'syllabus' | 'handbook' | 'other';
  uploadedAt: string;
  chunkCount: number;
};

export type AssistantConfig = {
  name: string;
  role: string;
  program: string;
  tone: 'professional' | 'friendly' | 'casual';
  connectedTools: string[];
};