
export type RecordStatus = 'complete' | 'incomplete' | 'missed';

export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  duration?: number; // in hours, optional for incomplete
  bedTime?: string; // HH:MM
  wakeTime?: string; // HH:MM, optional for incomplete
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown';
  notes?: string;
  status: RecordStatus;
}

export interface Friend {
  id: string;
  name: string;
  avatarColor: string;
  status: 'sleeping' | 'awake' | 'offline';
  lastSleepDuration?: number;
  sleepScore: number;
  wakeTime?: string;
  bedTime?: string; // Added for Night Owl leaderboard
  isCurrentUser?: boolean;
}

export type ViewMode = 'planet' | 'list';

export interface GeminiAnalysis {
  score: number;
  insight: string;
  suggestion: string;
}