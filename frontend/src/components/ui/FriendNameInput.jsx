import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

/**
 * FriendNameInput — replaces <datalist> with a custom friend-chip dropdown.
 *
 * Why custom instead of datalist:
 *   On Android the soft keyboard causes a layout shift that dismisses the browser's
 *   native datalist popup. Our custom list is rendered in the DOM so it survives
 *   keyboard appearance and stays visible until the user picks a name or blurs.
 *
 * UX behaviour:
 *   - Tapping the field opens the full friend list as chips below the input.
 *   - Typing filters the list in real-time.
 *   - Tapping a chip fills the name and closes the list.
 *   - The list closes when focus leaves the component (but not on keyboard show).
 *   - If there are no friends, the dropdown is not shown.
 */
export default function FriendNameInput({ value, onChange, friendNames = [], placeholder = "Friend's Name", className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered = friendNames.filter(
    name => name.toLowerCase().includes((value || '').toLowerCase())
  );

  // Close dropdown when tapping outside
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleSelect = (name) => {
    onChange(name);
    setIsOpen(false);
  };

  const showDropdown = isOpen && friendNames.length > 0 && filtered.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="words"
        spellCheck="false"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className={className}
      />

      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 bg-j-surface border border-j-border rounded-lg shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] overflow-hidden z-50"
          // Prevent the pointerdown-outside handler from firing when tapping inside this
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1.5 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
            {filtered.map(name => (
              <button
                key={name}
                type="button"
                onPointerDown={() => handleSelect(name)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-j-surface-raised border border-j-border rounded-full text-xs font-medium text-j-ink hover:bg-j-border hover:border-j-border-strong active:scale-95 transition-all duration-fast"
              >
                <User size={10} strokeWidth={2.5} className="text-j-ink-3" />
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
