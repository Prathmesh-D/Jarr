import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useBackButtonClose from '../../hooks/useBackButtonClose';
import { VAULT_ICONS } from './CreateVaultModal';
import { checkSufficientBalance } from '../../utils/balanceCheck';

export default function VaultActionModal({ isOpen, initialMode, onClose, vault, allVaults, onDeposit, onWithdraw, onTransfer }) {
  useBackButtonClose(isOpen, onClose);
  const [mode, setMode] = useState(initialMode || 'deposit'); // 'deposit' | 'withdraw' | 'transfer'

  const getLocalYMD = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { amount: '', note: '', entryDate: getLocalYMD(), toVaultId: '', sourceId: '' }
  });

  useEffect(() => {
    if (initialMode && isOpen) {
      setMode(initialMode);
    }
    if (!isOpen) {
      reset();
    }
  }, [initialMode, isOpen, reset]);

  const [submitting, setSubmitting] = useState(false);

  const otherVaults = (allVaults || []).filter(v => v.id !== vault?.id);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(data.amount),
        note: data.note?.trim() || null,
        entryDate: data.entryDate,
      };
      if (mode === 'deposit') {
        if (data.sourceId === 'main') {
          const hasSufficient = await checkSufficientBalance(payload.amount);
          if (!hasSufficient) return;
        }
        await onDeposit({ ...payload, sourceId: data.sourceId });
      } else if (mode === 'withdraw') {
        if (!data.toVaultId) {
          await onWithdraw(payload);
        } else {
          await onTransfer({ ...payload, toVaultId: data.toVaultId === 'main' ? 'main' : parseInt(data.toVaultId) });
        }
      }
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !vault) return null;

  const VaultIcon = VAULT_ICONS[vault.icon] || VAULT_ICONS['PiggyBank'];

  const tabs = [
    { id: 'deposit',  label: 'Deposit',  icon: ArrowDownLeft,  color: 'text-j-positive' },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight,   color: 'text-j-negative' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-j-surface border border-j-border rounded-2xl w-full max-w-md p-6 max-h-[90dvh] overflow-y-auto flex flex-col">
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-j-border"
              style={{ backgroundColor: (vault.color || '#3A3A3A') + '22' }}
            >
              <VaultIcon size={16} strokeWidth={1.6} style={{ color: vault.color || '#787876' }} />
            </div>
            <h2 className="text-lg font-bold text-j-ink">{vault.name}</h2>
          </div>
          <button onClick={onClose} className="text-j-ink-4 hover:text-j-ink transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border border-j-border rounded-lg overflow-hidden mb-5">
          {tabs.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setMode(id); reset(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
                mode === id ? 'bg-j-ink text-j-bg' : 'bg-j-surface text-j-ink-3 hover:bg-j-surface-raised'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-j-ink-3 uppercase tracking-wider mb-1.5">Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              autoFocus
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Must be greater than 0' },
              })}
              error={errors.amount?.message}
            />
          </div>

          {/* Deposit Source */}
          {mode === 'deposit' && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-j-ink-3 uppercase tracking-wider mb-1.5">Source</label>
              <select
                {...register('sourceId')}
                className="w-full bg-j-surface border border-j-border rounded-sm px-3 py-2.5 text-sm text-j-ink outline-none focus:border-j-ink transition-colors"
              >
                <option value="">Cash / External</option>
                <option value="main" className="font-bold">Jarr</option>
              </select>
            </div>
          )}

          {/* Withdraw Destination */}
          {mode === 'withdraw' && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-j-ink-3 uppercase tracking-wider mb-1.5">Destination</label>
              <select
                {...register('toVaultId')}
                className="w-full bg-j-surface border border-j-border rounded-sm px-3 py-2.5 text-sm text-j-ink outline-none focus:border-j-ink transition-colors"
              >
                <option value="">Keep as Cash / External</option>
                <option value="main" className="font-bold">Jarr</option>
                {otherVaults.length > 0 && (
                  <optgroup label="Your Vaults">
                    {otherVaults.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-j-ink-3 uppercase tracking-wider mb-1.5">Date</label>
            <Input
              type="date"
              {...register('entryDate', { required: 'Date is required' })}
              error={errors.entryDate?.message}
            />
          </div>

          {/* Note */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-j-ink-3 uppercase tracking-wider mb-1.5">Note <span className="text-j-ink-4 normal-case">(optional)</span></label>
            <Input placeholder="What is this for?" {...register('note')} />
          </div>

          <Button type="submit" loading={submitting} className="w-full">
            {mode === 'deposit' ? 'Deposit' : 'Withdraw'}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
