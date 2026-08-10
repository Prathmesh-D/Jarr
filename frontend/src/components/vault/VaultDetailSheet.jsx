import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Pencil, Trash2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import VaultEntryRow from './VaultEntryRow';
import useBackButtonClose from '../../hooks/useBackButtonClose';
import { VAULT_ICONS } from './CreateVaultModal';

export default function VaultDetailSheet({ isOpen, vault, entries, currency, allVaults, onClose, onManage, onDeleteEntry, onEditEntry, onEdit, onDeleteVault }) {
  useBackButtonClose(isOpen, onClose);
  const [deletingEntryId, setDeletingEntryId] = useState(null);
  const [confirmDeleteVault, setConfirmDeleteVault] = useState(false);

  if (!isOpen || !vault) return null;

  const VaultIcon = VAULT_ICONS[vault.icon] || VAULT_ICONS['PiggyBank'];

  const balance = Number(vault.currentBalance || 0);
  const target = vault.targetAmount ? Number(vault.targetAmount) : null;
  const progress = target && target > 0 ? Math.min((balance / target) * 100, 100) : null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-j-surface border border-j-border rounded-2xl w-full max-w-lg flex flex-col max-h-[90dvh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-j-border shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center border border-j-border"
              style={{ backgroundColor: (vault.color || '#3A3A3A') + '22' }}
            >
              <VaultIcon size={22} strokeWidth={1.6} style={{ color: vault.color || '#787876' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-j-ink leading-tight">{vault.name}</h2>
              {vault.notes && <p className="text-xs text-j-ink-4 mt-0.5">{vault.notes}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button onClick={onEdit} className="p-2 text-j-ink-4 hover:text-j-ink transition-colors rounded-md hover:bg-j-surface-raised">
              <Pencil size={16} />
            </button>
            <button onClick={() => setConfirmDeleteVault(true)} className="p-2 text-j-ink-4 hover:text-j-negative transition-colors rounded-md hover:bg-j-surface-raised">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="p-2 text-j-ink-4 hover:text-j-ink transition-colors rounded-md hover:bg-j-surface-raised">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Balance section */}
        <div className="px-5 py-4 border-b border-j-border shrink-0">
          <p className="text-xs text-j-ink-4 uppercase tracking-widest mb-1">Current Balance</p>
          <p className="text-3xl font-bold text-j-ink tabular-nums">{formatCurrency(balance, currency)}</p>
          {progress !== null && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-j-ink-4 mb-1">
                <span>Goal: {formatCurrency(Number(target), currency)}</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-j-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: vault.color || '#3A3A3A' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-5 py-3 border-b border-j-border shrink-0">
          {[
            { label: 'Deposit', icon: ArrowDownLeft, mode: 'deposit' },
            { label: 'Withdraw', icon: ArrowUpRight, mode: 'withdraw' },
          ].map(({ label, icon: Icon, mode }) => (
            <button
              key={mode}
              onClick={() => onManage(mode)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-j-surface-raised border border-j-border rounded-lg hover:bg-j-border transition-colors"
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Entry history */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <p className="text-xs text-j-ink-4 uppercase tracking-widest mb-2">History</p>
          {entries && entries.length > 0 ? (
            <div>
              {entries.map(entry => (
                <VaultEntryRow
                  key={entry.id}
                  entry={entry}
                  currency={currency}
                  deletingId={deletingEntryId}
                  onLongPress={setDeletingEntryId}
                  onCancelDelete={() => setDeletingEntryId(null)}
                  onEdit={(entry) => { onEditEntry(entry); setDeletingEntryId(null); }}
                  onDelete={(id) => { onDeleteEntry(id); setDeletingEntryId(null); }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center text-j-ink-4">
              <div className="w-12 h-12 rounded-xl bg-j-surface-raised border border-j-border flex items-center justify-center mb-3">
                <VaultIcon size={22} strokeWidth={1.4} className="text-j-ink-4" />
              </div>
              <p className="text-sm">No entries yet</p>
              <p className="text-xs mt-1">Tap Deposit to add money</p>
            </div>
          )}
        </div>

        {/* Confirm delete vault */}
        {confirmDeleteVault && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-t-2xl z-10">
            <div className="bg-j-surface border border-j-border rounded-xl p-6 mx-6 text-center shadow-xl">
              <p className="text-lg font-bold text-j-ink mb-2">Delete Vault?</p>
              <p className="text-sm text-j-ink-3 mb-5">
                {balance > 0
                  ? `This vault has a balance of ${formatCurrency(balance, currency)}. Empty it first before deleting.`
                  : `"${vault.name}" and all its history will be permanently deleted.`
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteVault(false)}
                  className="flex-1 py-2 text-sm border border-j-border rounded-lg text-j-ink-3 hover:bg-j-surface-raised"
                >
                  Cancel
                </button>
                {balance === 0 && (
                  <button
                    onClick={() => { setConfirmDeleteVault(false); onDeleteVault(); }}
                    className="flex-1 py-2 text-sm bg-j-negative text-white rounded-lg font-semibold"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
