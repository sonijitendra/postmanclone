import { useEffect } from 'react';

interface ShortcutOptions {
  onSend?: () => void;
  onSave?: () => void;
  onNewTab?: () => void;
  onCloseTab?: () => void;
}

export const useKeyboardShortcuts = ({
  onSend,
  onSave,
  onNewTab,
  onCloseTab,
}: ShortcutOptions) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Send: Ctrl + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (onSend) {
          e.preventDefault();
          onSend();
        }
      }

      // Save: Ctrl + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (onSave) {
          e.preventDefault();
          onSave();
        }
      }

      // New Tab: Ctrl + N or Ctrl + T (prevent conflict if possible)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        // We use Ctrl+Y for New Tab to avoid browser Ctrl+N/Ctrl+T intercepting issues
        if (onNewTab) {
          e.preventDefault();
          onNewTab();
        }
      }

      // Close Tab: Ctrl + Q (Ctrl+W is browser native and hard to override securely)
      if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        if (onCloseTab) {
          e.preventDefault();
          onCloseTab();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSend, onSave, onNewTab, onCloseTab]);
};
