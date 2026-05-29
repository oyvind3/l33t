export type PollStatus = 'open' | 'closed' | 'results';

export type PollCategory = 'FPS' | 'MOBA' | 'Strategy' | 'Party Games' | 'Aktiviteter' | 'Annet';

export const CATEGORIES: PollCategory[] = ['FPS', 'MOBA', 'Strategy', 'Party Games', 'Aktiviteter', 'Annet'];

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  category: PollCategory;
  status: PollStatus;
  options: string[];
  voteCounts: number[];
  voters?: Record<number, Array<{ userId: string; username: string }>>;
  userVotes: number[];
  totalVotes: number;
  createdAt: string;
}

export interface Vote {
  optionIndex: number;
  userId: string;
  username: string;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  userId: string;
  username: string;
  createdAt: string;
}
