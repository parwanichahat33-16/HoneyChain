import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage.jsx';

const LAYOUTS = {
  en: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ],
  hi: [
    ['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं'],
    ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'],
    ['क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ'],
    ['ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ'],
    ['ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'],
  ],
  gu: [
    ['ા', 'િ', 'ી', 'ુ', 'ૂ', 'ે', 'ૈ', 'ો', 'ૌ', 'ં'],
    ['અ', 'આ', 'ઇ', 'ઈ', 'ઉ', 'ઊ', 'એ', 'ઐ', 'ઓ', 'ઔ'],
    ['ક', 'ખ', 'ગ', 'ઘ', 'ચ', 'છ', 'જ', 'ઝ', 'ટ', 'ઠ'],
    ['ડ', 'ઢ', 'ણ', 'ત', 'થ', 'દ', 'ધ', 'ન', 'પ', 'ફ'],
    ['બ', 'ભ', 'મ', 'ય', 'ર', 'લ', 'વ', 'શ', 'ષ', 'સ', 'હ'],
  ],
};

function insertAtCursor(el, text) {
  if (!el) return;
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const newValue = el.value.slice(0, start) + text + el.value.slice(end);
  setter.call(el, newValue);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  requestAnimationFrame(() => {
    el.setSelectionRange(start + text.length, start + text.length);
    el.focus();
  });
}

function backspace(el) {
  if (!el) return;
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  let newValue, pos;
  if (start !== end) {
    newValue = el.value.slice(0, start) + el.value.slice(end);
    pos = start;
  } else if (start > 0) {
    newValue = el.value.slice(0, start - 1) + el.value.slice(start);
    pos = start - 1;
  } else {
    return;
  }
  setter.call(el, newValue);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  requestAnimationFrame(() => {
    el.setSelectionRange(pos, pos);
    el.focus();
  });
}

export default function VirtualKeyboard() {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    function handleFocusIn(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.type && ['checkbox', 'radio', 'date', 'number'].includes(e.target.type)) {
          return;
        }
        targetRef.current = e.target;
      }
    }
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  const layout = LAYOUTS[lang] || LAYOUTS.en;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Toggle on-screen keyboard"
        className="fixed bottom-4 right-4 z-40 bg-honey-500 hover:bg-honey-600 text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-3"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="2"/>
          <circle cx="6" cy="9" r="0.8" fill="white"/>
          <circle cx="9.5" cy="9" r="0.8" fill="white"/>
          <circle cx="13" cy="9" r="0.8" fill="white"/>
          <circle cx="16.5" cy="9" r="0.8" fill="white"/>
          <circle cx="6" cy="12.5" r="0.8" fill="white"/>
          <circle cx="9.5" cy="12.5" r="0.8" fill="white"/>
          <circle cx="13" cy="12.5" r="0.8" fill="white"/>
          <circle cx="16.5" cy="12.5" r="0.8" fill="white"/>
          <rect x="6" y="15" width="12" height="1.6" rx="0.8" fill="white"/>
        </svg>
        <span className="text-sm font-semibold">Type</span>
      </button>

      {open && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-honey-200 dark:border-gray-600 shadow-2xl p-2 sm:p-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Virtual keyboard ({lang === 'hi' ? 'हिन्दी' : lang === 'gu' ? 'ગુજરાતી' : 'English'}) — tap a field, then tap keys
              </span>
              <button onClick={() => setOpen(false)} className="text-xs text-honey-600 font-medium">Close ✕</button>
            </div>
            {layout.map((row, i) => (
              <div key={i} className="flex justify-center gap-1 mb-1 flex-wrap">
                {row.map((ch) => (
                  <button
                    key={ch}
                    onMouseDown={(e) => { e.preventDefault(); insertAtCursor(targetRef.current, ch); }}
                    className="min-w-[2rem] px-2 py-2 bg-honey-50 dark:bg-gray-700 border border-honey-200 dark:border-gray-600 rounded text-sm sm:text-base font-medium text-honey-900 dark:text-honey-100"
                  >
                    {ch}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex justify-center gap-1 mt-1">
              <button
                onMouseDown={(e) => { e.preventDefault(); insertAtCursor(targetRef.current, ' '); }}
                className="px-16 py-2 bg-honey-50 dark:bg-gray-700 border border-honey-200 dark:border-gray-600 rounded text-sm"
              >
                Space
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); backspace(targetRef.current); }}
                className="px-4 py-2 bg-red-50 dark:bg-gray-700 border border-red-200 dark:border-gray-600 rounded text-sm text-red-600"
              >
                ⌫ Backspace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}