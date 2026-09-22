import { useState, useCallback } from 'react';

function readStoredUser() {
  const stored = localStorage.getItem('honeychain_user') || sessionStorage.getItem('honeychain_user');
  return stored ? JSON.parse(stored) : null;
}

export function useAuth() {
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback((userData, token, remember = true) => {
    const store = remember ? localStorage : sessionStorage;
    // Clear the other storage in case a previous session used it
    const other = remember ? sessionStorage : localStorage;
    other.removeItem('honeychain_token');
    other.removeItem('honeychain_user');

    store.setItem('honeychain_token', token);
    store.setItem('honeychain_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('honeychain_token');
    localStorage.removeItem('honeychain_user');
    sessionStorage.removeItem('honeychain_token');
    sessionStorage.removeItem('honeychain_user');
    setUser(null);
  }, []);

  return { user, login, logout, isAuthenticated: !!user };
}
