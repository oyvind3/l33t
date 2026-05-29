interface Props {
  label: string;
  count: number;
  percent: number;
  isSelected: boolean;
  disabled: boolean;
  showResults: boolean;
  onClick: () => void;
}

export default function VoteButton({ label, count, percent, isSelected, disabled, showResults, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left relative overflow-hidden rounded-lg border px-4 py-3 transition-all group ${
        isSelected
          ? 'border-neon-green bg-neon-green/10 box-glow-green'
          : 'border-white/10 bg-white/[0.02] hover:border-neon-blue/30 hover:bg-white/[0.04]'
      } ${disabled && !isSelected ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
    >
      {/* Progress bar background */}
      {showResults && (
        <div
          className={`progress-bar absolute inset-0 ${isSelected ? 'bg-neon-green/15' : 'bg-neon-blue/10'}`}
          style={{ width: `${percent}%` }}
        />
      )}

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {isSelected && <span className="text-neon-green text-base">✓</span>}
          <span className={`font-mono text-base truncate ${isSelected ? 'text-neon-green' : 'text-text-primary'}`}>
            {label}
          </span>
        </div>

        {showResults && (
          <div className="flex items-center gap-3 ml-2 shrink-0">
            <span className="font-mono text-sm text-text-secondary">{count}</span>
            <span className={`font-mono text-sm font-bold ${isSelected ? 'text-neon-green' : 'text-neon-blue'}`}>
              {percent}%
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
