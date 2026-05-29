import { useAuth } from '../App';

interface Props {
  onToggleAdmin: () => void;
  showAdmin: boolean;
}

export default function Header({ onToggleAdmin, showAdmin }: Props) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-neon-blue/20 bg-bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-lg md:text-xl font-bold">
            <span className="text-neon-green">HANI</span>
            <span className="text-neon-blue">LAN</span>{' '}
            <span className="text-text-secondary text-sm">POLLS</span>
          </h1>
          <div className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-white/10">
            <span className="font-mono text-[10px] text-text-secondary">HOST:</span>
            <span className="font-mono text-[10px] text-neon-pink">hanipani9</span>
            <span className="font-mono text-[10px] text-text-secondary/50">aka</span>
            <span className="font-mono text-[10px] text-neon-yellow">spicyjizz</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.isAdmin && (
            <button
              onClick={onToggleAdmin}
              className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showAdmin
                  ? 'border-neon-pink text-neon-pink bg-neon-pink/10'
                  : 'border-text-secondary/30 text-text-secondary hover:border-neon-pink hover:text-neon-pink'
              }`}
            >
              ⚙ ADMIN
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neon-blue/20 border border-neon-blue/50 flex items-center justify-center font-mono text-xs text-neon-blue uppercase">
              {user?.username.charAt(0)}
            </div>
            <span className="font-mono text-sm text-text-primary hidden sm:inline">
              {user?.username}
            </span>
            {user?.isAdmin && (
              <span className="text-[10px] font-mono bg-neon-pink/20 text-neon-pink px-1.5 py-0.5 rounded hidden sm:inline">
                ADMIN
              </span>
            )}
          </div>

          <button
            onClick={logout}
            className="font-mono text-xs text-text-secondary hover:text-neon-pink transition-colors px-2 py-1"
            title="Logg ut"
          >
            ✕
          </button>
        </div>
      </div>
    </header>
  );
}
