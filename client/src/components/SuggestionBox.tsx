import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import type { Suggestion } from '../types';

export default function SuggestionBox() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between bg-bg-card border border-neon-yellow/20 rounded-xl px-5 py-3 font-mono text-sm text-neon-yellow hover:border-neon-yellow/40 transition-all"
      >
        <span>💡 SPILLFORSLAG ({suggestions.length})</span>
        <span className="text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="bg-bg-card border border-neon-yellow/20 border-t-0 rounded-b-xl p-5 animate-slide-in">
          {/* Submit form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Spillnavn eller aktivitet..."
              maxLength={100}
              className="flex-1 bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-text-primary
                         focus:outline-none focus:border-neon-yellow/50 transition-all placeholder:text-text-secondary/40"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskrivelse (valgfritt)..."
              maxLength={200}
              className="flex-1 bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-text-primary
                         focus:outline-none focus:border-neon-yellow/50 transition-all placeholder:text-text-secondary/40 hidden sm:block"
            />
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="bg-neon-yellow/10 border border-neon-yellow text-neon-yellow font-mono text-sm px-4 py-2 rounded-lg
                         hover:bg-neon-yellow/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {submitting ? '⏳' : '+ Foreslå'}
            </button>
          </form>

          {/* Suggestions list */}
          {suggestions.length === 0 ? (
            <p className="font-mono text-xs text-text-secondary text-center py-4">
              Ingen forslag ennå — vær den første! 🎮
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {suggestions.map((s) => (
                <div key={s.id} className="flex items-start gap-2 bg-bg-dark rounded-lg px-3 py-2">
                  <div className="w-5 h-5 rounded-full bg-neon-yellow/20 border border-neon-yellow/50 flex items-center justify-center font-mono text-[8px] text-neon-yellow uppercase shrink-0 mt-0.5">
                    {s.username.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-primary font-bold truncate">{s.title}</span>
                      <span className="font-mono text-[9px] text-text-secondary shrink-0">— {s.username}</span>
                    </div>
                    {s.description && (
                      <p className="font-mono text-[10px] text-text-secondary mt-0.5 truncate">{s.description}</p>
                    )}
                  </div>
                  {(user?.isAdmin || user?.id === s.userId) && (
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="font-mono text-[10px] text-neon-pink/50 hover:text-neon-pink transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
