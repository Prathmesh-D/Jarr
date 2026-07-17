import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import { transactionService } from '../services/transactionService';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';
import useBackButtonClose from '../hooks/useBackButtonClose';
import FriendNameInput from './ui/FriendNameInput';


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

  useBackButtonClose(isOpen, onClose);
  const { triggerRefresh } = useTransactions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState({ EXPENSE: [], INCOME: [] });
  const [friendNames, setFriendNames] = useState([]);
  const type = watch('type');

  // Splitwise logic
  const [splits, setSplits] = useState([]);
  const addSplit = () => setSplits([...splits, { personName: '', amount: '', splitType: 'UOME' }]);
  const updateSplit = (index, field, value) => {
    const newSplits = [...splits];
    newSplits[index][field] = value;
    setSplits(newSplits);
  };
  const removeSplit = (index) => setSplits(splits.filter((_, i) => i !== index));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { categoryService } = await import('../services/categoryService');
        const allCategories = await categoryService.getCategories();
        const sortFn = (a, b) => {
          const isAOther = a.name.toLowerCase() === 'others' || a.name.toLowerCase() === 'other';
          const isBOther = b.name.toLowerCase() === 'others' || b.name.toLowerCase() === 'other';
          if (isAOther && !isBOther) return 1;
          if (!isAOther && isBOther) return -1;
          return a.name.localeCompare(b.name);
        };
        
        const safeCategories = Array.isArray(allCategories) ? allCategories : [];
        setCategories({
          EXPENSE: safeCategories.filter(c => c?.type === 'EXPENSE').sort(sortFn),
          INCOME:  safeCategories.filter(c => c?.type === 'INCOME').sort(sortFn),
        });
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  const currentCategories = categories[type] || [];

  useEffect(() => {
    if (isOpen) {
      reset();
      setSplits([]);
      
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
  }, [isOpen, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    const amount = parseFloat(data.amount);
    
    // Validate splits
    const validSplits = splits.map(s => ({
      personName: s.personName.trim(),
      amount: parseFloat(s.amount),
      splitType: s.splitType
    })).filter(s => s.personName && s.amount > 0);

    const totalSplitAmount = validSplits.reduce((sum, s) => sum + s.amount, 0);
    if (totalSplitAmount > amount) {
      toast.error(`Total split amount (${getCurrencySymbol(user?.currency)}${totalSplitAmount}) cannot exceed transaction amount (${getCurrencySymbol(user?.currency)}${amount})`);
      return;
    }

    setIsSubmitting(true);
    try {
      await transactionService.createTransaction({
        amount: amount,
        type: data.type,
        categoryId: parseInt(data.categoryId),
        transactionDate: data.transactionDate,
        note: data.note,
        splits: validSplits
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
      <div className="modal-enter modal-enter-active bg-j-surface w-full max-w-md max-h-[90vh] rounded-xl sm:rounded-2xl shadow-modal border border-j-border relative overflow-hidden flex flex-col">
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
            
            {/* Splitwise Feature */}
            {type === 'EXPENSE' && (
              <div className="pt-4 border-t border-j-border">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-j-ink-3 uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
                    Split Bill
                  </label>
                  <button type="button" onClick={addSplit} className="text-[11px] font-semibold text-j-accent px-2 py-1 rounded hover:bg-j-accent/10 transition-colors duration-fast">
                    + ADD PERSON
                  </button>
                </div>
                
                <div className="space-y-3">
                  {splits.map((split, i) => (
                    <div key={i} className="flex flex-col gap-2 p-3 bg-j-surface-raised border border-j-border rounded-lg relative group">
                      <button type="button" onClick={() => removeSplit(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-j-surface border border-j-border rounded-full flex items-center justify-center text-j-ink-4 hover:text-j-negative hover:border-j-negative transition-colors duration-fast z-10 shadow-sm opacity-0 group-hover:opacity-100">
                        <X size={12} strokeWidth={3} />
                      </button>
                      <FriendNameInput
                        value={split.personName}
                        onChange={(val) => updateSplit(i, 'personName', val)}
                        friendNames={friendNames}
                        placeholder="Friend's Name"
                        className="w-full bg-transparent text-sm font-medium text-j-ink placeholder:text-j-ink-4 border-b border-j-border/50 pb-1 focus:border-j-accent outline-none transition-colors duration-fast"
                      />
                      <div className="flex gap-2">
                        <select
                          value={split.splitType}
                          onChange={(e) => updateSplit(i, 'splitType', e.target.value)}
                          className="flex-1 bg-j-surface text-[13px] font-medium text-j-ink border border-j-border rounded-md px-2 py-1.5 outline-none focus:border-j-accent"
                        >
                          <option value="UOME">They owe me</option>
                          <option value="IOU">I owe them</option>
                        </select>
                        <div className="relative flex-1">
                          <span className="absolute left-2 top-1.5 text-[13px] font-medium text-j-ink-4">{getCurrencySymbol(user?.currency)}</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={split.amount}
                            onChange={(e) => updateSplit(i, 'amount', e.target.value)}
                            className="w-full bg-j-surface text-[13px] font-semibold tabular-nums text-j-ink border border-j-border rounded-md pl-6 pr-2 py-1.5 outline-none focus:border-j-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                

              </div>
            )}
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
