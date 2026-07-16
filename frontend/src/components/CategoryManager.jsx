import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import Input from './ui/Input';
import ConfirmDialog from './ui/ConfirmDialog';
import { categoryService } from '../services/categoryService';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'EXPENSE', colorHex: '#3A3A3A', iconKey: 'tag' }
  });

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const onSubmit = async (data) => {
    try {
      await categoryService.createCategory(data);
      setIsAdding(false);
      reset();
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating category');
    }
  };

  const [deleteCategoryId, setDeleteCategoryId] = useState(null);

  const confirmDelete = async () => {
    if (!deleteCategoryId) return;
    try {
      await categoryService.deleteCategory(deleteCategoryId);
      fetchCategories();
    } catch (error) {
      alert('Cannot delete default categories');
    }
    setDeleteCategoryId(null);
  };

  const sortFn = (a, b) => {
    const isAOther = a.name.toLowerCase() === 'others' || a.name.toLowerCase() === 'other';
    const isBOther = b.name.toLowerCase() === 'others' || b.name.toLowerCase() === 'other';
    if (isAOther && !isBOther) return 1;
    if (!isAOther && isBOther) return -1;
    return a.name.localeCompare(b.name);
  };

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE').sort(sortFn);
  const incomeCategories = categories.filter(c => c.type === 'INCOME').sort(sortFn);

  return (
    <div className="bg-j-surface border border-j-border rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-j-border">
        <p className="text-sm font-medium text-j-ink">Manage Categories</p>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-j-accent hover:text-[#344e70] transition-colors duration-fast"
          >
            <Plus size={13} />
            Add custom
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="px-4 py-3 border-b border-j-border bg-j-surface-raised space-y-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input
              label="Name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-medium text-j-ink-3 uppercase tracking-widest">Type</label>
                <select
                  {...register('type')}
                  className="h-11 px-3 border border-j-border rounded-sm bg-j-surface text-sm text-j-ink focus:border-j-border-strong focus:ring-2 focus:ring-j-accent/12 outline-none"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs font-medium text-j-ink-3 border border-j-border rounded-sm hover:bg-j-border transition-colors duration-fast"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-white bg-j-accent rounded-sm hover:bg-[#344e70] transition-colors duration-fast"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category lists */}
      {[
        { label: 'Expense', items: expenseCategories },
        { label: 'Income', items: incomeCategories },
      ].map(({ label, items }, sectionIdx) => (
        items.length > 0 && (
          <div key={label}>
            <p className={`px-4 py-2 text-xs text-j-ink-4 uppercase tracking-widest border-b border-j-border bg-j-surface-raised ${sectionIdx > 0 ? 'border-t' : ''}`}>
              {label}
            </p>
            <div className="p-4 flex flex-wrap gap-2">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-j-surface-raised border border-j-border rounded-sm"
                >
                  <span className="text-[13px] font-medium text-j-ink-2">{c.name}</span>
                  {c.isDefault && (
                    <span className="text-[9px] text-j-ink-4 uppercase tracking-wider ml-1">Default</span>
                  )}
                  {!c.isDefault && (
                    <button
                      onClick={() => setDeleteCategoryId(c.id)}
                      className="ml-1 -mr-1 p-0.5 text-j-ink-4 hover:text-j-negative rounded-sm transition-colors duration-fast"
                      title="Delete category"
                    >
                      <Trash2 size={13} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      <ConfirmDialog
        isOpen={!!deleteCategoryId}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? Any transactions using it will still be preserved."
        confirmText="Delete"
        icon="trash"
      />
    </div>
  );
}
