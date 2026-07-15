import { Plus } from 'lucide-react';

/**
 * FAB — near-black fill, white icon. No orange.
 */
export default function QuickAddFAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Quick add"
      className="
        fixed z-50
        bottom-[72px] right-4
        lg:bottom-8 lg:right-8
        w-13 h-13
        w-[52px] h-[52px]
        flex items-center justify-center
        bg-j-ink text-white
        rounded-full shadow-modal
        hover:bg-j-ink-2 active:scale-95
        transition-[background-color,transform] duration-fast ease-smooth
      "
    >
      <Plus size={22} strokeWidth={2} />
    </button>
  );
}
