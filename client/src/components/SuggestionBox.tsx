import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import type { Suggestion } from '../types';

const CATEGORY_MAP: Record<string, { label: string; icon: string; order: number }> = {
  'FPS': { label: 'FPS / Action', icon: '🔫', order: 1 },
  'Action': { label: 'FPS / Action', icon: '🔫', order: 1 },
  'Co-op': { label: 'Horror / Co-op', icon: '👻', order: 7 },
  'RPG': { label: 'RPG / Adventure', icon: '⚔️', order: 2 },
  'Action RPG': { label: 'RPG / Adventure', icon: '⚔️', order: 2 },
  'MOBA': { label: 'Strategi / MOBA', icon: '🧠', order: 3 },
  'RTS': { label: 'Strategi / MOBA', icon: '🧠', order: 3 },
  'Simulator': { label: 'Simulator / Chill', icon: '🚜', order: 4 },
  'Racing': { label: 'Racing / Sport', icon: '🚗', order: 5 },
  'Sport': { label: 'Racing / Sport', icon: '🚗', order: 5 },
  'Sport/Party': { label: 'Racing / Sport', icon: '🚗', order: 5 },
  'Retro': { label: 'Party / Retro', icon: '🕹️', order: 6 },
  'Kortspill': { label: 'Party / Retro', icon: '🕹️', order: 6 },
  'Fighting': { label: 'Party / Retro', icon: '🕹️', order: 6 },
  'Horror': { label: 'Horror / Co-op', icon: '👻', order: 7 },
  'Horror/Co-op': { label: 'Horror / Co-op', icon: '👻', order: 7 },
  'Open World': { label: 'Open World / Survival', icon: '🌍', order: 8 },
  'Survival': { label: 'Open World / Survival', icon: '🌍', order: 8 },
  'VR/Action': { label: 'Litt spesielle', icon: '🧪', order: 9 },
  'MOBA/Shooter': { label: 'Litt spesielle', icon: '🧪', order: 9 },
  'IRL': { label: 'IRL aktiviteter', icon: '🧑‍🤝‍🧑', order: 10 },
};

function parseCategory(description: string): { label: string; icon: string; order: number } {
  const prefix = description.split(' - ')[0]?.trim();
  if (prefix && CATEGORY_MAP[prefix]) return CATEGORY_MAP[prefix];
  return { label: 'Annet', icon: '🎲', order: 99 };
}

export default function SuggestionBox() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadSuggestions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/suggestions', {
        headers: { 'x-user-id': user.id },
      });
      if (res.ok) {
        setSuggestions(await res.json());
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    loadSuggestions();
    const interval = setInterval(loadSuggestions, 10000);
    return () => clearInterval(interval);
  }, [loadSuggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      if (res.ok) {
        toast.success('Forslag sendt! 💡');
        setTitle('');
        setDescription('');
        loadSuggestions();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Noe gikk galt');
      }
    } catch {
      toast.error('Kunne ikke sende forslag');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/suggestions/' + id, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      });
      if (res.ok) {
        toast.success('Forslag slettet');
        loadSuggestions();
      }
    } catch {
      // ignore
    }
  };

  // Group by category
  const grouped = suggestions.reduce<Record<string, { label: string; icon: string; order: number; items: Suggestion[] }>>((acc, s) => {
    const cat = parseCategory(s.description);
    const key = cat.label;
    if (!acc[key]) acc[key] = { ...cat, items: [] };
    acc[key].items.push(s);
    return acc;
  }, {});

  const sortedGroups = Object.entries(grouped).sort(([, a], [, b]) => a.order - b.order);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-sm text-neon-yellow flex items-center gap-2">
          💡 SPILLFORSLAG <span className="text-text-secondary text-xs">({suggestions.length} totalt)</span>
        </h2>
      </div>

      {/* Submit form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Foreslå et spill eller aktivitet..."
          maxLength={100}
          className="flex-1 bg-bg-card border border-neon-yellow/20 rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary
                     focus:outline-none focus:border-neon-yellow/50 transition-all placeholder:text-text-secondary/40"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kategori - Beskrivelse..."
          maxLength={200}
          className="sm:w-64 bg-bg-card border border-neon-yellow/20 rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary
                     focus:outline-none focus:border-neon-yellow/50 transition-all placeholder:text-text-secondary/40"
        />
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="bg-neon-yellow/10 border border-neon-yellow text-neon-yellow font-mono text-sm px-5 py-2.5 rounded-lg
                     hover:bg-neon-yellow/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {submitting ? '⏳' : '+ Foreslå'}
        </button>
      </form>

      {/* Table */}
      {suggestions.length === 0 ? (
        <p className="font-mono text-xs text-text-secondary text-center py-8">
          Ingen forslag ennå — vær den første! 🎮
        </p>
      ) : (
        <div className="bg-bg-card border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left font-mono text-[10px] text-text-secondary uppercase px-4 py-2.5 w-8">#</th>
                <th className="text-left font-mono text-[10px] text-text-secondary uppercase px-4 py-2.5">Spill / Aktivitet</th>
                <th className="text-left font-mono text-[10px] text-text-secondary uppercase px-4 py-2.5 hidden sm:table-cell">Info</th>
                <th className="text-left font-mono text-[10px] text-text-secondary uppercase px-4 py-2.5 hidden md:table-cell">Foreslått av</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {sortedGroups.map(([, group]) => (
                <>
                  {/* Category header row */}
                  <tr key={group.label} className="bg-white/[0.02]">
                    <td colSpan={5} className="px-4 py-2 font-mono text-xs text-neon-yellow/80">
                      {group.icon} {group.label}
                      <span className="text-text-secondary ml-2 text-[10px]">({group.items.length})</span>
                    </td>
                  </tr>
                  {group.items.map((s, i) => (
                    <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2 font-mono text-[10px] text-text-secondary">{i + 1}</td>
                      <td className="px-4 py-2">
                        <span className="font-mono text-sm text-text-primary">{s.title}</span>
                      </td>
                      <td className="px-4 py-2 hidden sm:table-cell">
                        <span className="font-mono text-[10px] text-text-secondary">
                          {s.description.includes(' - ') ? s.description.split(' - ').slice(1).join(' - ') : s.description}
                        </span>
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center font-mono text-[7px] text-neon-blue uppercase">
                            {s.username.charAt(0)}
                          </span>
                          <span className="font-mono text-[10px] text-text-secondary">{s.username}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        {(user?.isAdmin || user?.id === s.userId) && (
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="font-mono text-[10px] text-neon-pink/30 hover:text-neon-pink transition-colors p-1"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
