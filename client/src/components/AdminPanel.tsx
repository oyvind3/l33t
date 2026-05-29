import { useState } from 'react';
import type { Poll, PollCategory, PollStatus } from '../types';
import { CATEGORIES } from '../types';
import { createPoll, updatePollStatus, deletePoll } from '../api';
import toast from 'react-hot-toast';

interface Props {
  onPollCreated: () => void;
  polls: Poll[];
  onRefresh: () => void;
}

const STATUS_CYCLE: Record<PollStatus, PollStatus> = {
  open: 'closed',
  closed: 'results',
  results: 'open',
};

const STATUS_LABELS: Record<PollStatus, string> = {
  open: '🟢 Åpen',
  closed: '🔴 Stengt',
  results: '🔵 Resultater',
};

export default function AdminPanel({ onPollCreated, polls, onRefresh }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PollCategory>('Annet');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!title.trim() || cleanOptions.length < 2) {
      toast.error('Tittel og minst 2 alternativer kreves');
      return;
    }

    setCreating(true);
    try {
      await createPoll({ title: title.trim(), description: description.trim(), category, options: cleanOptions });
      toast.success('Poll opprettet! 🎮');
      setTitle('');
      setDescription('');
      setCategory('Annet');
      setOptions(['', '']);
      onPollCreated();
    } catch {
      // handled
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (pollId: string, currentStatus: PollStatus) => {
    const newStatus = STATUS_CYCLE[currentStatus];
    try {
      await updatePollStatus(pollId, newStatus);
      toast.success(`Status endret til ${STATUS_LABELS[newStatus]}`);
      onRefresh();
    } catch {
      // handled
    }
  };

  const handleDelete = async (pollId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne pollen?')) return;
    try {
      await deletePoll(pollId);
      toast.success('Poll slettet');
      onRefresh();
    } catch {
      // handled
    }
  };

  return (
    <div className="mb-8 space-y-4 animate-slide-in">
      {/* Create Poll Form */}
      <div className="bg-bg-card border border-neon-pink/20 rounded-xl p-5">
        <h2 className="font-mono text-sm text-neon-pink mb-4">⚙ OPPRETT NY POLL</h2>

        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tittel..."
            maxLength={100}
            className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-text-primary
                       focus:outline-none focus:border-neon-pink/50 transition-all placeholder:text-text-secondary/40"
          />

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beskrivelse (valgfritt)..."
            maxLength={200}
            className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-text-primary
                       focus:outline-none focus:border-neon-pink/50 transition-all placeholder:text-text-secondary/40"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PollCategory)}
            className="w-full bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-text-primary
                       focus:outline-none focus:border-neon-pink/50 transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="space-y-2">
            <label className="font-mono text-xs text-text-secondary">ALTERNATIVER</label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Alternativ ${i + 1}...`}
                  maxLength={60}
                  className="flex-1 bg-bg-dark border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-text-primary
                             focus:outline-none focus:border-neon-pink/50 transition-all placeholder:text-text-secondary/40"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-neon-pink/60 hover:text-neon-pink font-mono text-sm px-2 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="font-mono text-xs text-neon-blue hover:text-neon-blue/80 transition-colors"
              >
                + Legg til alternativ
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-neon-pink/10 border border-neon-pink text-neon-pink font-mono text-sm py-2 rounded-lg
                       hover:bg-neon-pink/20 transition-all disabled:opacity-40"
          >
            {creating ? '⏳ Oppretter...' : '+ OPPRETT POLL'}
          </button>
        </form>
      </div>

      {/* Manage Polls */}
      {polls.length > 0 && (
        <div className="bg-bg-card border border-neon-pink/20 rounded-xl p-5">
          <h2 className="font-mono text-sm text-neon-pink mb-3">📊 ADMINISTRER POLLS</h2>
          <div className="space-y-2">
            {polls.map((poll) => (
              <div key={poll.id} className="flex items-center gap-2 bg-bg-dark rounded-lg px-3 py-2">
                <span className="font-mono text-xs text-text-primary flex-1 truncate">{poll.title}</span>
                <span className="font-mono text-[10px] text-text-secondary">{poll.totalVotes}v</span>
                <button
                  onClick={() => handleStatusChange(poll.id, poll.status)}
                  className="font-mono text-[10px] px-2 py-1 rounded border border-white/10 hover:border-neon-blue/50 text-text-secondary hover:text-neon-blue transition-all"
                >
                  {STATUS_LABELS[poll.status]}
                </button>
                <button
                  onClick={() => handleDelete(poll.id)}
                  className="font-mono text-[10px] text-neon-pink/50 hover:text-neon-pink transition-colors px-1"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
