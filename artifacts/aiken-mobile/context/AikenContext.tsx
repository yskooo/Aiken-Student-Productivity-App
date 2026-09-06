import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { handbookDocument, initialEvents } from '@/fixtures/data';
import { AssistantConfig, CalendarEvent, ChatMessage, Document, PendingAction, StudyPlanStep } from '@/types/models';

type FocusSession = { id: string; kind: 'pomodoro' | 'deep_work'; minutes: number; completedAt: string };
type AikenContextValue = {
  events: CalendarEvent[];
  pendingActions: PendingAction[];
  messages: ChatMessage[];
  documents: Document[];
  focusSessions: FocusSession[];
  assistant: AssistantConfig;
  hydrated: boolean;
  addPendingEvent: (event: CalendarEvent, reasoning: string) => void;
  approveAction: (id: string) => void;
  rejectAction: (id: string) => void;
  sendMessage: (text: string) => void;
  addFocusSession: (kind: FocusSession['kind'], minutes: number) => void;
  addDocument: () => void;
  updateAssistant: (config: AssistantConfig) => void;
};

const STORAGE_KEY = 'aiken-demo-state-v1';
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();
const defaultAssistant: AssistantConfig = {
  name: 'Aiken',
  role: 'Your academic co-pilot',
  program: 'BS Information Design',
  tone: 'friendly',
  connectedTools: ['Canvas', 'Google Calendar'],
};

const makePlan = (): StudyPlanStep[] => {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  const end = new Date(start.getTime() + 45 * 60000);
  return [
    { id: 'plan-1', label: 'Gather midterm topics and materials', estimatedMinutes: 20, dependsOn: [] },
    { id: 'plan-2', label: 'Review the highest-weight concepts', estimatedMinutes: 45, dependsOn: ['plan-1'], proposedBlock: { start: start.toISOString(), end: end.toISOString() } },
    { id: 'plan-3', label: 'Practice with retrieval questions', estimatedMinutes: 35, dependsOn: ['plan-2'] },
  ];
};

const initialMessages: ChatMessage[] = [
  { id: 'msg-1', role: 'assistant', content: 'Good morning, Shena. I’m here to help you make the week feel more manageable. What would you like to work through?' },
];

const Context = createContext<AikenContextValue | null>(null);

export function AikenProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [documents, setDocuments] = useState<Document[]>([handbookDocument]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [assistant, setAssistant] = useState<AssistantConfig>(defaultAssistant);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const saved = JSON.parse(stored);
          setEvents(saved.events ?? initialEvents);
          setPendingActions(saved.pendingActions ?? []);
          setMessages(saved.messages ?? initialMessages);
          setDocuments(saved.documents ?? [handbookDocument]);
          setFocusSessions(saved.focusSessions ?? []);
          setAssistant(saved.assistant ?? defaultAssistant);
        } catch {
          Alert.alert('Aiken could not restore your last session', 'Starting with the demo workspace instead.');
        }
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ events, pendingActions, messages, documents, focusSessions, assistant }));
  }, [assistant, documents, events, focusSessions, hydrated, messages, pendingActions]);

  const addPendingEvent = (event: CalendarEvent, reasoning: string) => {
    const createdAt = now();
    setPendingActions((current) => [...current, {
      id: id('approval'),
      kind: 'create_event',
      payload: { event },
      reasoning,
      status: 'pending',
      createdAt,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    }]);
  };

  const approveAction = (actionId: string) => {
    setPendingActions((current) => current.map((action) => {
      if (action.id !== actionId) return action;
      if (action.kind === 'create_event' && action.payload.event) setEvents((currentEvents) => [...currentEvents, action.payload.event!]);
      return { ...action, status: 'approved' as const };
    }));
  };

  const rejectAction = (actionId: string) => setPendingActions((current) => current.map((action) => action.id === actionId ? { ...action, status: 'rejected' as const } : action));

  const sendMessage = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const lower = clean.toLowerCase();
    const userMessage: ChatMessage = { id: id('message'), role: 'user', content: clean };
    let response: ChatMessage;
    if (lower.includes('essay') || lower.includes('exam answer') || lower.includes('do my assignment')) {
      response = { id: id('message'), role: 'assistant', content: 'I can’t complete graded work for you, but I can help you understand the topic, make a study plan, or review your own draft.' };
    } else if (lower.includes('due') || lower.includes('deadline')) {
      const upcoming = events.filter((event) => event.type === 'deadline').sort((a, b) => a.start.localeCompare(b.start));
      const summary = upcoming.length ? upcoming.map((event) => `${event.title} · ${new Date(event.start).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`).join('\n') : 'Nothing is due in the next few days.';
      response = { id: id('message'), role: 'assistant', content: `Here’s what I found in your connected calendars:\n\n${summary}` };
    } else if (lower.includes('study') || lower.includes('midterm') || lower.includes('plan')) {
      const plan = makePlan();
      response = { id: id('message'), role: 'assistant', content: 'I made a small starting plan and found a clear 45-minute window. I’ll keep the block as a proposal until you approve it.', plan };
      addPendingEvent({
        id: id('event'),
        title: 'Midterm review · Deep Work',
        type: 'deep_work',
        start: plan[1].proposedBlock!.start,
        end: plan[1].proposedBlock!.end,
        sourcePlatform: 'Aiken',
      }, 'A focused review block gives you a concrete first step without overlapping your current schedule.');
    } else if (lower.includes('concern') || lower.includes('late') || lower.includes('attendance')) {
      response = { id: id('message'), role: 'assistant', content: 'I can look that up in your Student Handbook. Try asking “What is the late submission process?” for a cited answer.' };
    } else {
      response = { id: id('message'), role: 'assistant', content: 'I can help with deadlines, study plans, focus blocks, and handbook policies. Try “what’s due this week?” or “help me study for midterms.”' };
    }
    setMessages((current) => [...current, userMessage, response]);
  };

  const value = useMemo(() => ({
    events, pendingActions: pendingActions.filter((action) => action.status === 'pending'), messages, documents, focusSessions, assistant, hydrated,
    addPendingEvent, approveAction, rejectAction, sendMessage,
    addFocusSession: (kind: FocusSession['kind'], minutes: number) => setFocusSessions((current) => [...current, { id: id('focus'), kind, minutes, completedAt: now() }]),
    addDocument: () => setDocuments((current) => current.some((doc) => doc.id === handbookDocument.id) ? current : [...current, handbookDocument]),
    updateAssistant: setAssistant,
  }), [assistant, documents, events, focusSessions, hydrated, messages, pendingActions]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAiken() {
  const value = useContext(Context);
  if (!value) throw new Error('useAiken must be used inside AikenProvider');
  return value;
}