import { v4 as uuidv4 } from 'uuid';
import { HttpRequest } from '@azure/functions';

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'closed' | 'results';
  options: string[];
  createdAt: string;
}

export interface Vote {
  id: string;
  pollId: string;
  optionIndex: number;
  userId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  userId: string;
  username: string;
  createdAt: string;
}

// In-memory stores
const usersById = new Map<string, User>();
const usersByUsername = new Map<string, User>();
export const polls = new Map<string, Poll>();
export const votes: Vote[] = [];
export const suggestions = new Map<string, Suggestion>();

// The single main poll ID
export const MAIN_POLL_ID = 'main-poll';

export function getUser(id: string): User | undefined {
  return usersById.get(id);
}

export function getUserByUsername(username: string): User | undefined {
  return usersByUsername.get(username.toLowerCase());
}

export function addUser(user: User): void {
  usersById.set(user.id, user);
  usersByUsername.set(user.username.toLowerCase(), user);
}

export function getUserCount(): number {
  return usersById.size;
}

export function getAuthUser(request: HttpRequest): User | undefined {
  const userId = request.headers.get('x-user-id');
  if (!userId) return undefined;
  return usersById.get(userId);
}

export function addOptionToMainPoll(option: string): void {
  const poll = polls.get(MAIN_POLL_ID);
  if (poll && !poll.options.includes(option)) {
    poll.options.push(option);
  }
}

// --- Seed data ---
const ADMIN_ID = uuidv4();

addUser({
  id: ADMIN_ID,
  username: 'hanipani9',
  isAdmin: true,
  createdAt: new Date().toISOString(),
});

const seedGames = [
  'Battlefield 6',
  'Rainbow Six Siege',
  'Helldivers 2',
  'Hunt: Showdown 1896',
  'Grey Zone Warfare',
  'CS2',
  'Call of Duty',
  'PlanetSide 2',
  "Baldur's Gate 3 (8-player mod)",
  'Diablo 4',
  'Skyrim co-op mod',
  'Path of Exile 2',
  'Dota 2',
  'Warcraft 3',
  'Farming Simulator',
  'Racing-spill (TBD)',
  'FIFA-turnering',
  'Golf With Friends',
  'Retro Games',
  'UNO',
  'PS2-stasjon (Battlefront, MW2++)',
  'Tekken 8 turnering',
  'Backrooms: Escape Together',
  'R.E.P.O.',
  'Chained Together',
  'GTA Online',
  'DayZ',
  'Rust',
  'Synapse',
  'Deadlock',
  'StarCraft',
  'IRL aktiviteter',
];

// Create the single main poll with all games as options
polls.set(MAIN_POLL_ID, {
  id: MAIN_POLL_ID,
  title: 'HANILAN Game Vote',
  description: 'Stem på spillene du vil spille på LAN! Du kan stemme på flere.',
  category: 'Annet',
  status: 'open',
  options: [...seedGames],
  createdAt: new Date().toISOString(),
});
