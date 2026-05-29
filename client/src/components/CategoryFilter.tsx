import type { PollCategory } from '../types';
import { CATEGORIES } from '../types';

interface Props {
  selected: PollCategory | 'Alle';
  onSelect: (cat: PollCategory | 'Alle') => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Alle': '🎯',
  'FPS': '🔫',
  'MOBA': '⚔️',
  'Strategy': '🧠',
  'Party Games': '🎉',
  'Aktiviteter': '🏃',
  'Annet': '🎲',
};

export default function CategoryFilter({ selected, onSelect }: Props) {
  const all: Array<PollCategory | 'Alle'> = ['Alle', ...CATEGORIES];

  return (
    <div className="mb-6 overflow-x-auto scrollbar-none">
      <div className="flex gap-2 pb-2 min-w-max">
        {all.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`font-mono text-xs px-4 py-2 rounded-lg border whitespace-nowrap transition-all ${
              selected === cat
                ? 'border-neon-green text-neon-green bg-neon-green/10 box-glow-green'
                : 'border-text-secondary/20 text-text-secondary hover:border-neon-blue/50 hover:text-neon-blue'
            }`}
          >
            {CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
