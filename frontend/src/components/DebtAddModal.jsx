import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import { debtService } from '../services/debtService';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

export default function DebtAddModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { triggerRefresh } = useTransactions();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('tab') || 'IOU';

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { type: defaultType, personName: '', amount: '', dueDate: '', note: '' }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [friendNames, setFriendNames] = useState([]);
  const type = watch('type');

  useEffect(() => {
    if (isOpen) {
      reset({ type: defaultType, personName: '', amount: '', dueDate: '', note: '' });
      
      const fetchFriends = async () => {
        try {
          const { friendService } = await import('../services/friendService');
          const friends = await friendService.getFriends();
          setFriendNames(friends.map(f => f.name));
        } catch (error) {
          console.error('Failed to fetch friends', error);
        }
      };
      fetchFriends();
    }
  }, [isOpen, reset, defaultType]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await debtService.createDebt({
        type: data.type,
        personName: data.personName,
        amount: parseFloat(data.amount),
        dueDate: data.dueDate || null,
        note: data.note
      });
      triggerRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to add debt', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 transition-all duration-500">
      <div className="modal-enter modal-enter-active bg-j-surface w-full max-w-md max-h-[90vh] rounded-xl sm:rounded-2xl shadow-modal border border-j-border relative overflow-hidden flex flex-col">
        {/* Decorative Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-j-glow/20 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-2 relative z-10">
          <h2 className="text-2xl font-heading font-bold text-j-ink tracking-tight">Add Debt Record</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-j-surface-raised border border-j-border text-j-ink-3 hover:text-j-ink hover:border-j-border-strong transition-all duration-fast shadow-sm"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-6 relative z-10 flex-1 overflow-y-auto">
          {/* Type toggle (Pill design) */}
          <div className="flex p-1 bg-j-surface-raised border border-j-border rounded-lg">
            {[{ val: 'IOU', label: 'I OWE' }, { val: 'UOME', label: 'OWED TO ME' }].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => reset({ ...watch(), type: val })}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-fast
                  ${type === val
                    ? val === 'IOU'
                      ? 'bg-j-negative text-white shadow-sm'
                      : 'bg-j-positive text-white shadow-sm'
                    : 'text-j-ink-3 hover:text-j-ink'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Massive Amount Input */}
          <div className="flex flex-col items-center justify-center py-4">
            <label className="text-xs font-medium text-j-ink-4 uppercase tracking-widest mb-2">
              Amount ({getCurrencySymbol(user?.currency)})
            </label>
            <div className="relative flex items-center justify-center w-full px-4">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-transparent text-center text-5xl sm:text-6xl font-semibold tabular-nums text-j-ink outline-none placeholder:text-j-ink-4"
                {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-j-negative mt-2">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <Input
              label="Person Name"
              placeholder="Who is this with?"
              list="debt-friend-names"
              error={errors.personName?.message}
              {...register('personName', { required: 'Name is required' })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Due Date" type="date" {...register('dueDate')} />
              <Input label="Note" placeholder="e.g. Dinner" {...register('note')} />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting} className="h-12 text-base shadow-md">
              {isSubmitting ? 'Saving...' : 'Save Debt'}
            </Button>
          </div>
          
          <datalist id="debt-friend-names">
            {friendNames.map(name => <option key={name} value={name} />)}
          </datalist>
        </form>
      </div>
    </div>
  );
}
