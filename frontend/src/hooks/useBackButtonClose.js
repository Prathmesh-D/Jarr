import { useEffect } from 'react';

/**
 * useBackButtonClose — intercepts the Android hardware back button (and browser back)
 * to close a modal/sheet when it is open.
 *
 * How it works:
 *  - When `isOpen` becomes true, push a dummy history entry so the browser thinks
 *    there is something to go "back" to.
 *  - When the user presses the back button the browser fires a `popstate` event.
 *    We catch that and call `onClose()` instead of navigating away.
 *  - When `isOpen` becomes false normally (e.g. user clicks ✕), we call
 *    history.back() ourselves to clean up the dummy entry — but only if we pushed it.
 *
 * @param {boolean} isOpen  - whether the modal is currently open
 * @param {function} onClose - callback to close the modal
 */
export default function useBackButtonClose(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;

    // Push a dummy state to create a "back" destination
    history.pushState({ modal: true }, '');

    const handlePopState = () => {
      // Back button pressed — close the modal
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);

      // If the modal was closed by code (not by back button), the dummy state
      // is still on the stack. Go back to remove it, but only if the current
      // state is our dummy entry.
      if (history.state?.modal) {
        history.back();
      }
    };
  }, [isOpen, onClose]);
}
