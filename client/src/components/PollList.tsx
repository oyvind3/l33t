import type { Poll } from '../types';
import PollCard from './PollCard';

interface Props {
  polls: Poll[];
  loading: boolean;
  onVote: () => void;
}

export default function PollList({ polls, loading, onVote }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="font-mono text-neon-blue animate-pulse">⏳ Laster polls...</div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
        <div className="text-4xl mb-4">🎮</div>
        <p className="font-mono text-sm">Ingen polls funnet</p>
        <p className="font-mono text-xs mt-1">Admin kan opprette nye polls</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} onVote={onVote} />
      ))}
    </div>
  );
}
