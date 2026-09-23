import { useState, useEffect } from 'react';

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export default function InstallButton({ className = '' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    function handleInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (installed) return null;

  async function handleClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (isIOS()) {
      setShowIOSHint(true);
    }
  }

  if (!deferredPrompt && !isIOS()) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-honey-900 text-white font-semibold text-sm ${className}`}
      >
        📲 Install App
      </button>

      {showIOSHint && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowIOSHint(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-honey-900 dark:text-honey-100 mb-3">Install HoneyChain</h3>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal list-inside">
              <li>Tap the <strong>Share</strong> icon (square with an arrow) at the bottom of Safari</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> in the top-right corner</li>
            </ol>
            <button
              onClick={() => setShowIOSHint(false)}
              className="mt-4 w-full py-2 rounded-lg border border-honey-300 dark:border-gray-600 text-sm font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}