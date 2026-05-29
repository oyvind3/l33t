import { useState } from 'react';
import type { Poll } from '../types';
import VoteButton from './VoteButton';
import VoterList from './VoterList';
import { vote } from '../api';

interface Props {
  poll: Poll;
  onVote: () => void;
}

const STATUS_CONFIG = {
  open: { label: 'ÅPEN', color: 'text-neon-green', border: 'border-neon-green/30', bg: 'bg-neon-green/10' },
  closed: { label: 'STENGT', color: 'text-neon-pink', border: 'border-neon-pink/30', bg: 'bg-neon-pink/10' },
  results: { label: 'RESULTATER', color: 'text-neon-blue', border: 'border-neon-blue/30', bg: 'bg-neon-blue/10' },
};

const CATEGORY_ICONS: Record<string, string> = {
  'FPS': '🔫',
  'MOBA': '⚔️',
  'Strategy': '🧠',
  'Party Games': '🎉',
  'Aktiviteter': '🏃',
  'Annet': '🎲',
};

export default function PollCard({ poll, onVote }: Props) {
  const [voting, setVoting] = useState(false);
  const status = STATUS_CONFIG[poll.status];

  const handleVote = async (option: string) => {
    if (poll.status !== 'open' || voting) return;
    setVoting(true);
    try {
      await vote(poll.id, option);
      onVote();
    } catch {
      // handled by API
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="bg-bg-card border border-white/5 rounded-xl p-6 animate-slide-in hover:border-neon-blue/20 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-xl font-bold text-text-primary">{poll.title}</h3>
          {poll.description && (
            <p className="text-text-secondary text-base mt-1">{poll.description}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-3 mb-5">
        <span className={`font-mono text-xs px-3 py-1 rounded ${status.bg} ${status.color} ${status.border} border`}>
          {status.label}
        </span>
        <span className="font-mono text-xs text-text-secondary ml-auto">
          {poll.totalVotes} stemme{poll.totalVotes !== 1 ? 'r' : ''}
        </span>
      </div>

      {/* Options */}
      <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
        {poll.options.map((option, i) => {
          const count = poll.voteCounts[i] || 0;
          const percent = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0;
          const isSelected = poll.userVotes?.includes(i) ?? false;
          const voters = poll.voters?.[i] || [];

          return (
            <div key={i} className="animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
              <VoteButton
                label={option}
                count={count}
                percent={percent}
                isSelected={isSelected}
                disabled={poll.status !== 'open' || voting}
                showResults={true}
                onClick={() => handleVote(option)}
              />
              {voters.length > 0 && (
                <VoterList voters={voters} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
