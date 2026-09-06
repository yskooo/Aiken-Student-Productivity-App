import { CalendarEvent, Document } from '@/types/models';

const day = (offset: number, hour: number, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const initialEvents: CalendarEvent[] = [
  { id: 'ev-1', title: 'Human Computer Interaction', type: 'class', start: day(0, 9), end: day(0, 10, 30), sourcePlatform: 'Canvas' },
  { id: 'ev-2', title: 'UX Research Brief', type: 'deadline', start: day(1, 17), end: day(1, 17, 30), sourcePlatform: 'Google Classroom', weight: 3 },
  { id: 'ev-3', title: 'Product Design Studio', type: 'class', start: day(2, 13), end: day(2, 15), sourcePlatform: 'Canvas' },
  { id: 'ev-4', title: 'Team stand-up', type: 'meeting', start: day(3, 11), end: day(3, 11, 30), sourcePlatform: 'Microsoft Teams' },
  { id: 'ev-5', title: 'Statistics problem set', type: 'deadline', start: day(4, 23, 59), end: day(5, 0), sourcePlatform: 'Google Classroom', weight: 2 },
  { id: 'ev-6', title: 'Design critique', type: 'meeting', start: day(5, 15), end: day(5, 16), sourcePlatform: 'Google Calendar' },
];

export const handbookDocument: Document = {
  id: 'doc-1',
  filename: 'Student Handbook 2025–2026.pdf',
  kind: 'handbook',
  uploadedAt: new Date().toISOString(),
  chunkCount: 14,
};

export const handbookSections = [
  { title: 'Attendance Policy', icon: 'calendar', color: '#B4232A', description: 'Absences, make-up work, and attendance exceptions.' },
  { title: 'Late Assignment Submission', icon: 'clock', color: '#F2A93B', description: 'What happens when work is submitted after the deadline.' },
  { title: 'Academic Integrity', icon: 'shield', color: '#4F8A68', description: 'Collaboration, citations, and originality expectations.' },
  { title: 'Academic Appeals', icon: 'file-text', color: '#8873A8', description: 'How to raise a concern about a grade or decision.' },
];

export const handbookAnswers = [
  {
    keywords: ['late', 'submission', 'deadline', 'extension'],
    answer: 'Late work may be accepted within five calendar days with a 10% deduction per day, unless the syllabus states a stricter rule. Contact your instructor as soon as possible.',
    quote: 'Assignments submitted late may receive a deduction of 10% per calendar day.',
  },
  {
    keywords: ['attendance', 'absent', 'absence', 'class'],
    answer: 'If you miss class for an approved reason, notify your instructor within three working days and coordinate any make-up work directly with them.',
    quote: 'Students should notify the instructor within three working days of an approved absence.',
  },
  {
    keywords: ['integrity', 'plagiarism', 'cheat', 'citation'],
    answer: 'Academic work must be your own and sources must be credited. When in doubt, ask your instructor before submitting rather than guessing.',
    quote: 'All sources used in academic work must be acknowledged through appropriate citation.',
  },
];