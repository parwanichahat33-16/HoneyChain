import { useDarkMode } from '../hooks/useDarkMode';

export default function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-sm border border-honey-300 dark:border-gray-600 rounded-lg px-2 py-1"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
