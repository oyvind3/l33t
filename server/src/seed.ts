import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

// Ensure host user exists
const hostId = uuidv4();
const existingHost = db.prepare('SELECT id FROM users WHERE username = ?').get('hanipani9') as { id: string } | undefined;
const userId = existingHost?.id || hostId;

if (!existingHost) {
  db.prepare('INSERT INTO users (id, username, isAdmin) VALUES (?, ?, 1)').run(userId, 'hanipani9');
  console.log('✅ Created host user: hanipani9 (admin)');
} else {
  console.log('ℹ️  Host user hanipani9 already exists');
}

const suggestions: Array<{ title: string; description: string }> = [
  // 🔫 FPS / Action
  { title: 'Battlefield 6', description: 'FPS - Klassisk BF action' },
  { title: 'Rainbow Six Siege', description: 'FPS - Taktisk 5v5' },
  { title: 'Helldivers 2', description: 'FPS/Co-op - For demokratiet!' },
  { title: 'Hunt: Showdown 1896', description: 'FPS - Bounty hunting PvPvE' },
  { title: 'Grey Zone Warfare', description: 'FPS - Taktisk extraction shooter' },
  { title: 'CS2', description: 'FPS - Counter-Strike 2' },
  { title: 'Call of Duty', description: 'FPS - Et CoD spill som alle har/kan skaffe' },
  { title: 'PlanetSide 2', description: 'FPS - Massivt online warfare, gratis' },

  // ⚔️ RPG / Adventure
  { title: "Baldur's Gate 3 (8-player mod)", description: 'RPG - Co-op med 8 spillere!' },
  { title: 'Diablo 4', description: 'Action RPG - Loot og grind' },
  { title: 'Skyrim co-op mod', description: 'RPG - Skyrim Together Reborn' },
  { title: 'Path of Exile 2', description: 'Action RPG - Gratis og hardcore' },

  // 🧠 Strategi / MOBA
  { title: 'Dota 2', description: 'MOBA - 5v5 klassiker' },
  { title: 'Warcraft 3', description: 'RTS - Strategi + custom games' },

  // 🚜 Simulator / Chill
  { title: 'Farming Simulator', description: 'Simulator - Chill farming' },

  // 🚗 Racing / Sport
  { title: 'Racing-spill (TBD)', description: 'Racing - Et spill som alle har/kan skaffe' },
  { title: 'FIFA-turnering', description: 'Sport - PS2 eller PC, gammelt FIFA' },
  { title: 'Golf With Friends', description: 'Sport/Party - Minigolf multiplayer' },

  // 🕹️ Party / Retro / Casual
  { title: 'Retro Games', description: 'Retro - Klassiske spill på emulator' },
  { title: 'UNO', description: 'Kortspill - Online eller IRL' },
  { title: 'PS2-stasjon (Battlefront, MW2++)', description: 'Retro - Skal Fred ta med PS2 og TV?' },
  { title: 'Tekken 8 turnering', description: 'Fighting - Turnering på Hani sin PC' },

  // 👻 Skrekk / Co-op
  { title: 'Backrooms: Escape Together', description: 'Horror/Co-op - Rømningsspill' },
  { title: 'R.E.P.O.', description: 'Horror/Co-op - Skummelt samarbeid' },
  { title: 'Chained Together', description: 'Co-op - Lenket sammen, klatrespill' },

  // 🌍 Open world / Survival
  { title: 'GTA Online', description: 'Open World - Heists og kaos' },
  { title: 'DayZ', description: 'Survival - Zombie apokalypse' },
  { title: 'Rust', description: 'Survival - Base building og PvP' },

  // 🧪 Litt spesielle
  { title: 'Synapse', description: 'VR/Action - Telekinese shooter' },
  { title: 'Deadlock', description: 'MOBA/Shooter - Valve sitt nye spill' },
  { title: 'StarCraft', description: 'RTS - Klassiker 😄' },

  // 🧑‍🤝‍🧑 IRL
  { title: 'IRL aktiviteter', description: 'Leker, turer, bading, matlaging osv.' },
];

const insert = db.prepare(
  'INSERT OR IGNORE INTO suggestions (id, title, description, userId, username) VALUES (?, ?, ?, ?, ?)'
);

const insertMany = db.transaction((items: typeof suggestions) => {
  let count = 0;
  for (const item of items) {
    const result = insert.run(uuidv4(), item.title, item.description, userId, 'hanipani9');
    if (result.changes > 0) count++;
  }
  return count;
});

const inserted = insertMany(suggestions);
console.log(`✅ Seeded ${inserted} suggestions (${suggestions.length} total, ${suggestions.length - inserted} already existed)`);
