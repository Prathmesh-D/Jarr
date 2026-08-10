import { formatCurrency } from '../../utils/currency';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2, Pencil } from 'lucide-react';

const ENTRY_META = {
  DEPOSIT:      { label: 'Deposit',     icon: ArrowDownLeft,  color: 'text-j-positive', bg: 'bg-j-positive-dim', sign: '+' },
  WITHDRAWAL:   { label: 'Withdrawal',  icon: ArrowUpRight,   color: 'text-j-negative', bg: 'bg-j-negative-dim', sign: '−' },
  TRANSFER_IN:  { label: 'Transfer In', icon: ArrowDownLeft,  color: 'text-j-positive', bg: 'bg-j-positive-dim', sign: '+' },
  TRANSFER_OUT: { label: 'Transfer Out',icon: ArrowLeftRight, color: 'text-j-negative', bg: 'bg-j-negative-dim', sign: '−' },
};

export default function VaultEntryRow({ entry, currency, deletingId, onLongPress, onDelete, onEdit, onCancelDelete }) {
  const meta = ENTRY_META[entry.type] || ENTRY_META.DEPOSIT;
  const Icon = meta.icon;
  const isActive = deletingId === entry.id;

  return (
    <div className="relative select-none">
      <div
        onContextMenu={(e) => { e.preventDefault(); onLongPress(entry.id); }}
        onTouchStart={() => {
          const t = setTimeout(() => onLongPress(entry.id), 500);
          const cancel = () => clearTimeout(t);
          window.addEventListener('touchend', cancel, { once: true });
          window.addEventListener('touchmove', cancel, { once: true });
        }}
        onClick={() => { if (isActive) onCancelDelete(); }}
        className={`flex items-center justify-between py-3 border-b border-j-border last:border-0 transition-opacity duration-200 ${isActive ? 'opacity-20 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${meta.bg}`}>
            <Icon size={14} className={meta.color} />
          </div>
          <div>
            <p className="text-sm font-medium text-j-ink-2 leading-tight">
              {entry.note || meta.label}
            </p>
            <p className="text-xs text-j-ink-4">
              {new Date(entry.entryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              {(entry.type === 'TRANSFER_IN' || entry.type === 'TRANSFER_OUT') && (
                <span className="ml-1 italic">• {entry.vaultName}</span>
              )}
            </p>
          </div>
        </div>
        <span className={`text-sm font-semibold tabular-nums ${meta.color}`}>
          {meta.sign}{formatCurrency(entry.amount, currency)}
        </span>
      </div>

      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onCancelDelete(); }}
            className="px-3 py-1.5 bg-j-surface border border-j-border text-j-ink-3 text-sm rounded-sm"
          >
            Cancel
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-j-surface border border-j-border text-j-ink text-sm font-medium rounded-sm hover:bg-j-surface-raised transition-colors duration-fast"
          >
            <Pencil size={13} />
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-j-negative text-white text-sm font-medium rounded-sm"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
