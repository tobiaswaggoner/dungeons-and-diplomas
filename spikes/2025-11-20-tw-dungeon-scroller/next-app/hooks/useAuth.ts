import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useAuth() {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userXp, setUserXp] = useState<number>(0);
  const [showLogin, setShowLogin] = useState(true);

  // Check localStorage for existing user on mount and reload XP from server
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');

    if (storedUserId && storedUsername) {
      const id = parseInt(storedUserId, 10);
      setUserId(id);
      setUsername(storedUsername);
      setShowLogin(false);

      // Reload XP from server on mount (e.g. after page refresh)
      api.auth.login(storedUsername).then(userData => {
        setUserXp(userData.xp || 0);
      }).catch(err => {
        console.error('Failed to reload user XP:', err);
      });
    }
  }, []);

  const handleLogin = async (id: number, name: string, xp?: number) => {
    setUserId(id);
    setUsername(name);
    setUserXp(xp || 0);
    setShowLogin(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUserId(null);
    setUsername(null);
    setUserXp(0);
    setShowLogin(true);
  };

  return {
    userId,
    username,
    userXp,
    setUserXp,
    showLogin,
    handleLogin,
    handleLogout
  };
}
