import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import { transactionService } from '../services/transactionService';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

export default function QuickAddModal({ isOpen, onClose, onAdded }) {
  const { user } = useAuth();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      type: 'EXPENSE',
      amount: '',
      categoryId: '1',
      transactionDate: new Date().toISOString().split('T')[0],
      note: ''
    }
  });

  const { triggerRefresh } = useTransactions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState({ EXPENSE: [], INCOME: [] });
  const type = watch('type');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { categoryService } = await import('../services/categoryService');
        const allCategories = await categoryService.getCategories();
        setCategories({
          EXPENSE: allCategories.filter(c => c.type === 'EXPENSE'),
          INCOME:  allCategories.filter(c => c.type === 'INCOME'),
        });
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const currentCategories = categories[type] || [];

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await transactionService.createTransaction({
        amount: parseFloat(data.amount),
        type: data.type,
        categoryId: parseInt(data.categoryId),
        transactionDate: data.transactionDate,
        note: data.note
      });
      if (onAdded) onAdded();
      triggerRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to add transaction', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 transition-all duration-500">
      <div className="modal-enter modal-enter-active bg-j-surface w-full max-w-md rounded-xl sm:rounded-2xl shadow-modal border border-j-border relative overflow-hidden flex flex-col">
        {/* Decorative Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-j-glow/20 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-2 relative z-10">
          <h2 className="text-2xl font-heading font-bold text-j-ink tracking-tight">Add Transaction</h2>
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
            {['EXPENSE', 'INCOME'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => reset({ ...watch(), type: t, categoryId: t === 'EXPENSE' ? '1' : '9' })}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-fast
                  ${type === t
                    ? t === 'EXPENSE'
                      ? 'bg-j-negative text-white shadow-sm'
                      : 'bg-j-positive text-white shadow-sm'
                    : 'text-j-ink-3 hover:text-j-ink'
                  }`}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Massive Amount Input */}
          <div className="flex flex-col items-center justify-center py-4">
            <label className="text-xs font-medium text-j-ink-4 uppercase tracking-widest mb-2">
              Amount ({getCurrencySymbol(user?.currency)})
            </label>
            <div className="relative flex items-center justify-center w-full">
              <span className="text-4xl font-light text-j-ink-3 absolute left-1/2 -translate-x-[calc(50%+4rem)] pointer-events-none">
                {getCurrencySymbol(user?.currency)}
              </span>
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-j-ink-3 uppercase tracking-widest">Category</label>
              <select
                className="h-12 px-3 border border-j-border rounded-md bg-j-surface text-sm font-medium text-j-ink focus:border-j-accent focus:ring-1 focus:ring-j-accent outline-none transition-all duration-base shadow-sm"
                {...register('categoryId')}
              >
                {currentCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                error={errors.transactionDate?.message}
                {...register('transactionDate', { required: 'Date is required' })}
              />
              <Input
                label="Note"
                placeholder="e.g. Coffee"
                {...register('note')}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting} className="h-12 text-base shadow-md">
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
