import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { X, PiggyBank, Wallet, Home, Plane, BookOpen, Car, Heart, ShoppingBag, Leaf, Shield, Star, Landmark, Zap, Gift, Coffee, Dumbbell, Music, Camera, Briefcase } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useBackButtonClose from '../../hooks/useBackButtonClose';

export const VAULT_ICONS = {
  PiggyBank,
  Wallet,
  Landmark,
  Home,
  Shield,
  Plane,
  Car,
  BookOpen,
  Leaf,
  Heart,
  Dumbbell,
  ShoppingBag,
  Coffee,
  Gift,
  Music,
  Camera,
  Briefcase,
  Zap,
  Star,
};

export const ICON_NAMES = Object.keys(VAULT_ICONS);

const COLOR_OPTIONS = [
  '#3A3A3A', '#787876', '#B0B0AE',
  '#22c55e', '#3b82f6', '#f59e0b',
  '#ef4444', '#a855f7', '#ec4899',
  '#06b6d4', '#84cc16', '#f97316',
];

export default function CreateVaultModal({ isOpen, onClose, onSaved, editVault }) {
  useBackButtonClose(isOpen, onClose);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: editVault?.name || '',
      icon: editVault?.icon || 'PiggyBank',
      color: editVault?.color || '#3A3A3A',
      targetAmount: editVault?.targetAmount || '',
      notes: editVault?.notes || '',
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await onSaved({
        name: data.name.trim(),
        icon: data.icon,
        color: data.color,
        targetAmount: data.targetAmount ? parseFloat(data.targetAmount) : null,
        notes: data.notes?.trim() || null,
      });
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-j-surface border border-j-border rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto p-6 flex flex-col">
        
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-j-ink">{editVault ? 'Edit Vault' : 'New Vault'}</h2>
          <button onClick={onClose} className="text-j-ink-4 hover:text-j-ink transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-j-ink-3 uppercase tracking-wider mb-1.5">Vault Name</label>
            <Input
              placeholder="e.g. Emergency Fund, Travel Fund…"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-xs font-medium text-j-ink-3 uppercase tracking-wider mb-1.5">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_NAMES.map(iconName => {
                const Icon = VAULT_ICONS[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setValue('icon', iconName)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                      selectedIcon === iconName
                        ? 'border-j-ink bg-j-ink text-j-bg scale-110'
                        : 'border-j-border bg-j-surface text-j-ink-3 hover:bg-j-surface-raised hover:text-j-ink'
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.6} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-j-ink-3 uppercase tracking-wider mb-1.5">Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    selectedColor === color ? 'border-j-ink scale-110' : 'border-transparent scale-100'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Goal amount (optional) */}
          <div>
            <label className="block text-xs font-medium text-j-ink-3 uppercase tracking-wider mb-1.5">
              Savings Goal <span className="text-j-ink-4 normal-case">(optional)</span>
            </label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              {...register('targetAmount', { min: { value: 0, message: 'Must be positive' } })}
              error={errors.targetAmount?.message}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-j-ink-3 uppercase tracking-wider mb-1.5">
              Notes <span className="text-j-ink-4 normal-case">(optional)</span>
            </label>
            <Input placeholder="What is this vault for?" {...register('notes')} />
          </div>

          <Button type="submit" loading={submitting} className="w-full">
            {editVault ? 'Save Changes' : 'Create Vault'}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
