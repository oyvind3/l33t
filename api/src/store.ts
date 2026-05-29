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

// --- Seed data ---
const ADMIN_ID = uuidv4();

addUser({
  id: ADMIN_ID,
  username: 'hanipani9',
  isAdmin: true,
  createdAt: new Date().toISOString(),
});

const seedSuggestions: Array<{ title: string; description: string }> = [
  { title: 'Battlefield 6', description: 'FPS - Klassisk BF action' },
  { title: 'Rainbow Six Siege', description: 'FPS - Taktisk 5v5' },
  { title: 'Helldivers 2', description: 'FPS/Co-op - For demokratiet!' },
  { title: 'Hunt: Showdown 1896', description: 'FPS - Bounty hunting PvPvE' },
  { title: 'Grey Zone Warfare', description: 'FPS - Taktisk extraction shooter' },
  { title: 'CS2', description: 'FPS - Counter-Strike 2' },
  { title: 'Call of Duty', description: 'FPS - Et CoD spill som alle har/kan skaffe' },
  { title: 'PlanetSide 2', description: 'FPS - Massivt online warfare, gratis' },
  { title: "Baldur's Gate 3 (8-player mod)", description: 'RPG - Co-op med 8 spillere!' },
  { title: 'Diablo 4', description: 'Action RPG - Loot og grind' },
  { title: 'Skyrim co-op mod', description: 'RPG - Skyrim Together Reborn' },
  { title: 'Path of Exile 2', description: 'Action RPG - Gratis og hardcore' },
  { title: 'Dota 2', description: 'MOBA - 5v5 klassiker' },
  { title: 'Warcraft 3', description: 'RTS - Strategi + custom games' },
  { title: 'Farming Simulator', description: 'Simulator - Chill farming' },
  { title: 'Racing-spill (TBD)', description: 'Racing - Et spill som alle har/kan skaffe' },
  { title: 'FIFA-turnering', description: 'Sport - PS2 eller PC, gammelt FIFA' },
  { title: 'Golf With Friends', description: 'Sport/Party - Minigolf multiplayer' },
  { title: 'Retro Games', description: 'Retro - Klassiske spill på emulator' },
  { title: 'UNO', description: 'Kortspill - Online eller IRL' },
  { title: 'PS2-stasjon (Battlefront, MW2++)', description: 'Retro - Skal Fred ta med PS2 og TV?' },
  { title: 'Tekken 8 turnering', description: 'Fighting - Turnering på Hani sin PC' },
  { title: 'Backrooms: Escape Together', description: 'Horror/Co-op - Rømningsspill' },
  { title: 'R.E.P.O.', description: 'Horror/Co-op - Skummelt samarbeid' },
  { title: 'Chained Together', description: 'Co-op - Lenket sammen, klatrespill' },
  { title: 'GTA Online', description: 'Open World - Heists og kaos' },
  { title: 'DayZ', description: 'Survival - Zombie apokalypse' },
  { title: 'Rust', description: 'Survival - Base building og PvP' },
  { title: 'Synapse', description: 'VR/Action - Telekinese shooter' },
  { title: 'Deadlock', description: 'MOBA/Shooter - Valve sitt nye spill' },
  { title: 'StarCraft', description: 'RTS - Klassiker 😄' },
  { title: 'IRL aktiviteter', description: 'Leker, turer, bading, matlaging osv.' },
];

for (const s of seedSuggestions) {
  const id = uuidv4();
  suggestions.set(id, {
    id,
    title: s.title,
    description: s.description,
    userId: ADMIN_ID,
    username: 'hanipani9',
    createdAt: new Date().toISOString(),
  });
}
