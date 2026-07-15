import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/ui/Card';
import JarMascot from '../components/JarMascot';
import { SkeletonCard } from '../components/ui/Skeleton';
import { debtService } from '../services/debtService';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import { ChevronDown } from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function DebtsPage() {
  const { user } = useAuth();
  const { refreshTrigger, triggerRefresh } = useTransactions();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'IOU';
  const [paymentDebt, setPaymentDebt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [deleteDialogId, setDeleteDialogId] = useState(null);
  const [doneDialogId, setDoneDialogId] = useState(null);

  const setActiveTab = (tab) => setSearchParams({ tab });

  const { data: debts = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['debts'],
    queryFn: () => debtService.getDebts()
  });

  useEffect(() => {
    refetch();
  }, [refreshTrigger, refetch]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!paymentDebt || !paymentAmount) return;
    try {
      await debtService.payDebt(paymentDebt.id, parseFloat(paymentAmount));
      setPaymentDebt(null);
      setPaymentAmount('');
      triggerRefresh();
    } catch (err) {
      console.error('Failed to pay debt', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await debtService.deleteDebt(id);
      triggerRefresh();
      setDeleteDialogId(null);
    } catch (err) {
      console.error('Failed to delete debt', err);
    }
  };

  const handleMarkAsDone = async (id) => {
    try {
      await debtService.markAsDone(id);
      triggerRefresh();
      setDoneDialogId(null);
    } catch (err) {
      console.error('Failed to mark as done', err);
    }
  };

  const allUnsettled = debts.filter(d => !d.settled && !d.isSettled);
  const settled = debts.filter(d => (d.settled || d.isSettled) && d.type === activeTab);

  const getGroupedDebts = (activeDebts) => {
    const grouped = {};
    activeDebts.forEach(debt => {
      const nameKey = debt.personName.trim().toLowerCase();
      if (!grouped[nameKey]) {
        grouped[nameKey] = { personName: debt.personName, debts: [], totalIOU: 0, totalUOME: 0 };
      }
      const remaining = debt.amount - (debt.amountPaid || 0);
      if (remaining > 0) {
        grouped[nameKey].debts.push(debt);
        if (debt.type === 'IOU') grouped[nameKey].totalIOU += remaining;
        else grouped[nameKey].totalUOME += remaining;
      }
    });

    const iouGroup = [], uomeGroup = [];
    Object.values(grouped).forEach(group => {
      const net = group.totalIOU - group.totalUOME;
      if (net === 0 && group.debts.length > 0) {
        if (group.debts[0].type === 'IOU') iouGroup.push({ ...group, netAmount: 0 });
        else uomeGroup.push({ ...group, netAmount: 0 });
      } else if (net > 0) {
        iouGroup.push({ ...group, netAmount: net });
      } else if (net < 0) {
        uomeGroup.push({ ...group, netAmount: Math.abs(net) });
      }
    });
    return { IOU: iouGroup, UOME: uomeGroup };
  };

  const groupedData = getGroupedDebts(allUnsettled);
  const displayGroups = groupedData[activeTab] || [];
  const totalRemaining = displayGroups.reduce((sum, g) => sum + g.netAmount, 0);

  const getDeadlineInfo = (dueDate) => {
    if (!dueDate) return { text: null, color: '' };
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)}d`, color: 'text-j-negative' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-j-warning' };
    if (diffDays <= 3) return { text: `Due in ${diffDays}d`, color: 'text-j-warning' };
    return { text: `Due ${due.toLocaleDateString()}`, color: 'text-j-ink-4' };
  };

  return (
    <div className="space-y-5 pb-8">
      <h1 className="text-3xl font-heading font-bold text-j-ink tracking-tight">Debts</h1>

      {/* IOU / UOME toggle */}
      <div className="flex border border-j-border rounded-sm overflow-hidden">
        {['IOU', 'UOME'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium transition-[background-color,color] duration-fast ease-smooth ${
              activeTab === tab
                ? tab === 'IOU'
                  ? 'bg-j-negative text-white'
                  : 'bg-j-positive text-white'
                : 'bg-j-surface text-j-ink-3 hover:bg-j-surface-raised'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard rows={2} />
          <SkeletonCard rows={2} />
        </div>
      ) : (
        <>
          {/* Total banner */}
          <div className="flex items-baseline justify-between py-3 border-b border-j-border">
            <span className="text-xs text-j-ink-3 uppercase tracking-widest">
              {activeTab === 'IOU' ? 'Total you owe' : 'Total owed to you'}
            </span>
            <span className={`text-2xl font-semibold tabular-nums ${activeTab === 'IOU' ? 'text-j-negative' : 'text-j-positive'}`}>
              {formatCurrency(totalRemaining, user?.currency)}
            </span>
          </div>

          {displayGroups.length === 0 && settled.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="text-j-ink-4 mb-4"><JarMascot size={72} fillLevel={0} /></div>
              <p className="text-sm font-medium text-j-ink-3">All clear</p>
              <p className="text-xs text-j-ink-4 mt-1">No active {activeTab} records. Tap + to add one.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {displayGroups.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-j-ink-3 uppercase tracking-widest">Active</p>
                  {displayGroups.map(group => {
                    if (group.debts.length === 1) {
                      const debt = group.debts[0];
                      const paid = debt.amountPaid || 0;
                      const remaining = debt.amount - paid;
                      const progress = Math.min(100, Math.max(0, (paid / debt.amount) * 100));
                      const deadline = getDeadlineInfo(debt.dueDate);

                      return (
                        <Card key={debt.id}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-base font-semibold text-j-ink">{debt.personName}</h3>
                              {debt.note && <p className="text-xs text-j-ink-3 mt-0.5">{debt.note}</p>}
                              {deadline.text && <p className={`text-xs mt-0.5 ${deadline.color}`}>{deadline.text}</p>}
                            </div>
                            <span className={`text-lg font-semibold tabular-nums ${activeTab === 'IOU' ? 'text-j-negative' : 'text-j-positive'}`}>
                              {formatCurrency(remaining, user?.currency)}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="mb-1">
                            <div className="flex justify-between text-xs text-j-ink-4 mb-1.5">
                              <span>Paid {formatCurrency(paid, user?.currency)}</span>
                              <span>Total {formatCurrency(debt.amount, user?.currency)}</span>
                            </div>
                            <div className="h-1 bg-j-border rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-base ${activeTab === 'IOU' ? 'bg-j-negative' : 'bg-j-positive'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-j-border">
                            <button
                              onClick={() => setDoneDialogId(debt.id)}
                              className="px-3 py-1.5 text-xs font-medium text-j-ink-3 border border-j-border rounded-sm hover:bg-j-surface-raised transition-colors duration-fast"
                            >
                              Done
                            </button>
                            <button
                              onClick={() => { setPaymentDebt(debt); setPaymentAmount(remaining.toFixed(2)); }}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-j-accent rounded-sm hover:bg-[#344e70] transition-colors duration-fast"
                            >
                              Pay / Settle
                            </button>
                          </div>
                        </Card>
                      );
                    }

                    return (
                      <GroupedDebtCard
                        key={group.personName}
                        group={group}
                        activeTab={activeTab}
                        user={user}
                        getDeadlineInfo={getDeadlineInfo}
                        setPaymentDebt={setPaymentDebt}
                        setPaymentAmount={setPaymentAmount}
                        handleMarkAsDone={setDoneDialogId}
                      />
                    );
                  })}
                </div>
              )}

              {settled.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-j-ink-3 uppercase tracking-widest">Settled</p>
                  {settled.map(debt => (
                    <div key={debt.id} className="flex items-center justify-between py-3 border-b border-j-border last:border-0 opacity-50">
                      <div>
                        <p className="text-sm font-medium text-j-ink-2 line-through">{debt.personName}</p>
                        {debt.note && <p className="text-xs text-j-ink-4">{debt.note}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-j-ink-3 tabular-nums">{formatCurrency(debt.amount, user?.currency)}</span>
                        <button onClick={() => setDeleteDialogId(debt.id)} className="text-j-ink-4 hover:text-j-negative transition-colors duration-fast text-xs">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Payment modal */}
      {paymentDebt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-j-overlay/80 backdrop-blur-[2px] p-4">
          <div className="modal-enter modal-enter-active bg-j-surface w-full max-w-sm rounded-lg shadow-modal border border-j-border">
            <div className="px-5 pt-5 pb-4 border-b border-j-border">
              <h2 className="text-lg font-semibold text-j-ink">Record Payment</h2>
              <p className="text-sm text-j-ink-3 mt-0.5">{paymentDebt.personName}</p>
            </div>
            <form onSubmit={handlePay} className="px-5 py-4 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-j-ink-3 uppercase tracking-widest">
                  Amount ({getCurrencySymbol(user?.currency)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(paymentDebt.amount - (paymentDebt.amountPaid || 0)).toFixed(2)}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="h-11 px-3 border border-j-border rounded-sm text-sm text-j-ink bg-j-surface focus:border-j-border-strong focus:ring-2 focus:ring-j-accent/12 outline-none transition-[border-color] duration-base"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentDebt(null)}
                  className="flex-1 py-2.5 text-sm font-medium text-j-ink-3 border border-j-border rounded-sm hover:bg-j-surface-raised transition-colors duration-fast"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-j-accent rounded-sm hover:bg-[#344e70] transition-colors duration-fast"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteDialogId}
        onClose={() => setDeleteDialogId(null)}
        onConfirm={() => handleDelete(deleteDialogId)}
        title="Delete Record"
        message="Are you sure you want to permanently delete this debt record? This action cannot be undone."
        confirmText="Delete"
        icon="trash"
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={!!doneDialogId}
        onClose={() => setDoneDialogId(null)}
        onConfirm={() => handleMarkAsDone(doneDialogId)}
        title="Mark as Done"
        message="Are you sure you want to mark this debt as done? No transaction will be recorded for the remaining amount."
        confirmText="Mark Done"
        icon="alert"
        isDestructive={false}
      />
    </div>
  );
}

const GroupedDebtCard = ({ group, activeTab, user, getDeadlineInfo, setPaymentDebt, setPaymentAmount, handleMarkAsDone }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-j-ink">{group.personName}</h3>
          <ChevronDown
            size={16}
            className={`text-j-ink-4 transition-transform duration-base ease-smooth ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold tabular-nums ${activeTab === 'IOU' ? 'text-j-negative' : 'text-j-positive'}`}>
            {formatCurrency(group.netAmount, user?.currency)}
          </p>
          <p className="text-xs text-j-ink-4">{group.debts.length} records · net</p>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 mt-3 pt-3 border-t border-j-border">
          {group.debts.map(debt => {
            const paid = debt.amountPaid || 0;
            const remaining = debt.amount - paid;
            const progress = Math.min(100, Math.max(0, (paid / debt.amount) * 100));
            const deadline = getDeadlineInfo(debt.dueDate);

            return (
              <div key={debt.id} className="bg-j-surface-raised rounded-sm p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${debt.type === 'IOU' ? 'bg-j-negative-dim text-j-negative' : 'bg-j-positive-dim text-j-positive'}`}>
                        {debt.type}
                      </span>
                      <span className="text-sm text-j-ink-2">{debt.note || 'No note'}</span>
                    </div>
                    {deadline.text && <p className={`text-xs mt-0.5 ${deadline.color}`}>{deadline.text}</p>}
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${debt.type === 'IOU' ? 'text-j-negative' : 'text-j-positive'}`}>
                    {formatCurrency(remaining, user?.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-j-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${debt.type === 'IOU' ? 'bg-j-negative' : 'bg-j-positive'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkAsDone(debt.id); }}
                      className="px-2.5 py-1 text-xs font-medium text-j-ink-3 border border-j-border rounded-sm hover:bg-j-surface transition-colors duration-fast"
                    >
                      Done
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPaymentDebt(debt); setPaymentAmount(remaining.toFixed(2)); }}
                      className="px-2.5 py-1 text-xs font-medium text-white bg-j-accent rounded-sm hover:bg-[#344e70] transition-colors duration-fast"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
