import { useState, useEffect } from 'react';

export function useAuth() {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(true);

  // Check localStorage for existing user on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');

    if (storedUserId && storedUsername) {
      const id = parseInt(storedUserId, 10);
      setUserId(id);
      setUsername(storedUsername);
      setShowLogin(false);
    }
  }, []);

  const handleLogin = async (id: number, name: string) => {
    setUserId(id);
    setUsername(name);
    setShowLogin(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUserId(null);
    setUsername(null);
    setShowLogin(true);
  };

  return {
    userId,
    username,
    showLogin,
    handleLogin,
    handleLogout
  };
}
