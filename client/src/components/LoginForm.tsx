import { useState } from 'react';
import type { User } from '../types';
import { registerUser } from '../api';
import toast from 'react-hot-toast';

interface Props {
  onLogin: (user: User) => void;
}

export default function LoginForm({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminField, setShowAdminField] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      const user = await registerUser(username.trim(), adminPassword || undefined);
      toast.success(`Velkommen, ${user.username}! ${user.isAdmin ? '(Admin)' : ''}`);
      onLogin(user);
    } catch {
      // Error handled by API client toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-slide-in">
      <div className="bg-bg-card border border-neon-blue/30 rounded-xl p-8">
        <h1 className="font-mono text-3xl md:text-4xl font-bold text-center mb-2">
          <span className="text-neon-green glow-green">HANI</span>
          <span className="text-neon-blue glow-blue">LAN</span>
        </h1>
        <p className="text-center text-text-secondary mb-1 font-mono text-sm">
          🎮 POLL SYSTEM v1.0
        </p>
        <p className="text-center text-text-secondary/60 mb-8 font-mono text-[10px]">
          Hosted by <span className="text-neon-pink">hanipani9</span>{' '}
          <span className="text-text-secondary/40">aka</span>{' '}
          <span className="text-neon-yellow">spicyjizz</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1 font-mono">BRUKERNAVN</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Skriv inn ditt navn..."
              maxLength={30}
              className="w-full bg-bg-dark border border-neon-blue/30 rounded-lg px-4 py-3 text-text-primary font-mono
                         focus:outline-none focus:border-neon-green focus:box-glow-green transition-all
                         placeholder:text-text-secondary/50"
              autoFocus
            />
          </div>

          {showAdminField && (
            <div className="animate-slide-in">
              <label className="block text-text-secondary text-sm mb-1 font-mono">ADMIN PASSORD</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Valgfritt..."
                className="w-full bg-bg-dark border border-neon-pink/30 rounded-lg px-4 py-3 text-text-primary font-mono
                           focus:outline-none focus:border-neon-pink transition-all
                           placeholder:text-text-secondary/50"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full bg-neon-green/10 border border-neon-green text-neon-green font-mono py-3 rounded-lg
                       hover:bg-neon-green/20 hover:box-glow-green transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed
                       active:scale-[0.98]"
          >
            {loading ? '⏳ KOBLER TIL...' : '🎮 JOIN HANILAN'}
          </button>

          <button
            type="button"
            onClick={() => setShowAdminField(!showAdminField)}
            className="w-full text-text-secondary text-xs font-mono hover:text-neon-pink transition-colors"
          >
            {showAdminField ? '▲ Skjul admin' : '▼ Admin-tilgang'}
          </button>
        </form>
      </div>
    </div>
  );
}
