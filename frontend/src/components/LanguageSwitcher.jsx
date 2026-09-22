import { useLanguage } from '../hooks/useLanguage.jsx';

const OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'gu', label: 'ગુજરાતી' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="text-sm border border-honey-300 rounded-lg px-2 py-1 bg-white"
    >
      {OPTIONS.map((o) => (
        <option key={o.code} value={o.code}>{o.label}</option>
      ))}
    </select>
  );
}
