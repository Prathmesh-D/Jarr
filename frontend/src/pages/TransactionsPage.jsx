import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/ui/Card';
import JarMascot from '../components/JarMascot';
import { SkeletonListRow } from '../components/ui/Skeleton';
import { transactionService } from '../services/transactionService';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import useLongPress from '../hooks/useLongPress';
import { toast } from 'react-hot-toast';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const FILTER_OPTIONS = ['ALL', 'INCOME', 'EXPENSE'];

export default function TransactionsPage() {
  const { user } = useAuth();
  const { refreshTrigger, triggerRefresh } = useTransactions();
  const [filterType, setFilterType] = useState('ALL');
  const [undoTxId, setUndoTxId] = useState(null);

  const { data: pageData, isLoading: loading, refetch } = useQuery({
    queryKey: ['transactions', 'history'],
    queryFn: () => transactionService.getTransactions(0, 100)
  });

  useEffect(() => {
    refetch();
  }, [refreshTrigger, refetch]);

  const transactions = pageData?.content || [];
  const filteredTransactions = transactions.filter(t => filterType === 'ALL' || t.type === filterType);

  const handleUndo = async (id) => {
    try {
      await transactionService.deleteTransaction(id);
      toast.success('Transaction removed');
      setUndoTxId(null);
      triggerRefresh();
    } catch (err) {
      toast.error('Failed to remove transaction');
    }
  };

  const TransactionItem = ({ tx }) => {
    const isUndoActive = undoTxId === tx.id;
    const longPressProps = useLongPress(() => setUndoTxId(tx.id), () => {
      if (undoTxId && undoTxId !== tx.id) setUndoTxId(null);
    });

    return (
      <div {...(isUndoActive ? {} : longPressProps)} className="relative select-none">
        <div className={`flex items-center justify-between py-3.5 border-b border-j-border last:border-0 transition-opacity duration-base ${isUndoActive ? 'opacity-20' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 ${tx.type === 'INCOME' ? 'bg-j-positive-dim' : 'bg-j-negative-dim'}`}>
              {tx.type === 'INCOME'
                ? <ArrowUpRight size={15} className="text-j-positive" />
                : <ArrowDownRight size={15} className="text-j-negative" />}
            </div>
            <div>
              <p className="text-sm font-medium text-j-ink-2">{tx.categoryName || 'Uncategorized'}</p>
              <p className="text-xs text-j-ink-4">{tx.note || new Date(tx.transactionDate).toLocaleDateString()}</p>
            </div>
          </div>
          <span className={`shrink-0 whitespace-nowrap text-right text-sm font-semibold tabular-nums ${tx.type === 'INCOME' ? 'text-j-positive' : 'text-j-negative'}`}>
            {tx.type === 'INCOME' ? '+' : '−'}{formatCurrency(tx.amount || 0, user?.currency)}
          </span>
        </div>

        {isUndoActive && (
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setUndoTxId(null); }}
              className="px-3 py-1.5 bg-j-surface border border-j-border text-j-ink-3 text-sm rounded-sm hover:bg-j-surface-raised transition-colors duration-fast"
            >
              Cancel
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleUndo(tx.id); }}
              className="px-4 py-1.5 bg-j-negative text-white text-sm font-medium rounded-sm hover:bg-[#751a1a] transition-colors duration-fast"
            >
              Undo
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-heading font-bold text-j-ink tracking-tight">Transactions</h1>
        {/* Filter tabs */}
        <div className="flex border border-j-border rounded-sm overflow-hidden">
          {FILTER_OPTIONS.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-medium transition-[background-color,color] duration-fast ease-smooth ${
                filterType === type
                  ? 'bg-j-ink text-j-bg'
                  : 'bg-j-surface text-j-ink-3 hover:bg-j-surface-raised'
              }`}
            >
              {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonListRow key={i} />)}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="text-j-ink-4 mb-4">
            <JarMascot size={72} fillLevel={0} />
          </div>
          <p className="text-sm font-medium text-j-ink-3">No transactions found</p>
          <p className="text-xs text-j-ink-4 mt-1">
            {filterType === 'ALL' ? 'Tap + to add your first transaction' : `No ${filterType.toLowerCase()} records yet`}
          </p>
        </div>
      ) : (
        <Card padding="px-4 py-0">
          {filteredTransactions.map(tx => (
            <TransactionItem key={tx.id} tx={tx} />
          ))}
        </Card>
      )}
    </div>
  );
}
