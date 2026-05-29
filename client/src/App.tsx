import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { User, Poll } from './types';
import { fetchPolls, registerUser } from './api';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import PollList from './components/PollList';
import AdminPanel from './components/AdminPanel';
import SuggestionBox from './components/SuggestionBox';
import MusicPlayer from './components/MusicPlayer';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pollapp_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Re-validate user with server
        registerUser(parsed.username).then((u) => {
          setUser(u);
          localStorage.setItem('pollapp_user', JSON.stringify(u));
        }).catch(() => {
          localStorage.removeItem('pollapp_user');
        });
      } catch {
        localStorage.removeItem('pollapp_user');
      }
    }
  }, []);

  const loadPolls = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchPolls();
      setPolls(data);
    } catch {
      // Error handled by API client
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Poll every 5 seconds
  useEffect(() => {
    if (!user) return;
    loadPolls();
    const interval = setInterval(loadPolls, 5000);
    return () => clearInterval(interval);
  }, [user, loadPolls]);

  const logout = () => {
    setUser(null);
    setPolls([]);
    localStorage.removeItem('pollapp_user');
  };

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('pollapp_user', JSON.stringify(u));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <div className="min-h-screen flex flex-col">
        <Header onToggleAdmin={() => setShowAdmin(!showAdmin)} showAdmin={showAdmin} />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 pb-8">
          {showAdmin && user.isAdmin && (
            <AdminPanel onPollCreated={loadPolls} polls={polls} onRefresh={loadPolls} />
          )}

          <SuggestionBox />

          <PollList polls={polls} loading={loading} onVote={loadPolls} />
        </main>

        <MusicPlayer />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
