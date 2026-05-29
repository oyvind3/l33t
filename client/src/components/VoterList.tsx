interface Props {
  voters: Array<{ userId: string; username: string }>;
}

export default function VoterList({ voters }: Props) {
  if (voters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1 ml-4">
      {voters.map((v) => (
        <span
          key={v.userId}
          className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[10px] font-mono text-text-secondary"
        >
          <span className="w-3 h-3 rounded-full bg-neon-blue/30 border border-neon-blue/50 flex items-center justify-center text-[7px] text-neon-blue uppercase leading-none">
            {v.username.charAt(0)}
          </span>
          {v.username}
        </span>
      ))}
    </div>
  );
}
