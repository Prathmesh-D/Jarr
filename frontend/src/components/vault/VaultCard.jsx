import { formatCurrency } from '../../utils/currency';
import { Target } from 'lucide-react';
import { VAULT_ICONS } from './CreateVaultModal';

export default function VaultCard({ vault, currency, onClick }) {
  const balance = Number(vault.currentBalance || 0);
  const target = vault.targetAmount ? Number(vault.targetAmount) : null;
  const progress = target && target > 0 ? Math.min((balance / target) * 100, 100) : null;

  const VaultIcon = VAULT_ICONS[vault.icon] || VAULT_ICONS['PiggyBank'];

  return (
    <div
      onClick={onClick}
      className="relative bg-j-surface border border-j-border rounded-xl p-5 cursor-pointer active:scale-[0.98] transition-all duration-300 hover:border-j-border-raised overflow-hidden"
      style={{
        boxShadow: `0 4px 20px -8px ${vault.color || '#000000'}25, 0 1px 3px -1px ${vault.color || '#000000'}15`
      }}
    >
      {/* Icon + Name */}
      <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-j-border"
              style={{ backgroundColor: (vault.color || '#3A3A3A') + '22' }}
            >
              <VaultIcon size={16} strokeWidth={1.8} style={{ color: vault.color || '#787876' }} />
            </div>
            <span className="text-sm font-semibold text-j-ink-2 truncate max-w-[120px]">{vault.name}</span>
          </div>
          {target && (
            <div className="flex items-center gap-1 text-xs text-j-ink-4">
              <Target size={11} />
              <span className="tabular-nums">{formatCurrency(target, currency)}</span>
            </div>
          )}
        </div>

        {/* Balance */}
        <p className="text-2xl font-bold text-j-ink tabular-nums leading-none mb-3">
          {formatCurrency(balance, currency)}
        </p>

        {/* Progress bar (only if target is set) */}
        {progress !== null ? (
          <div>
            <div className="h-1 bg-j-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: vault.color || '#3A3A3A' }}
              />
            </div>
            <p className="text-xs text-j-ink-4 mt-1.5">
              {progress.toFixed(0)}% of goal
            </p>
          </div>
        ) : (
          <p className="text-xs text-j-ink-4">Tap to manage</p>
        )}
    </div>
  );
}
