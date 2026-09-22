import { useState, useEffect, useCallback } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('honeychain_dark') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('honeychain_dark', String(next));
      return next;
    });
  }, []);

  return { isDark, toggle };
}
