import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { reportService } from '../services/reportService';
import { debtService } from '../services/debtService';
import { transactionService } from '../services/transactionService';
import Card from '../components/ui/Card';
import { SkeletonCard, SkeletonListRow } from '../components/ui/Skeleton';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/currency';
import useLongPress from '../hooks/useLongPress';
import { toast } from 'react-hot-toast';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import JarMascot from '../components/JarMascot';

// Muted grayscale palette for donut chart — no bright colors
const CHART_GRAYS = ['#3A3A3A', '#787876', '#B0B0AE', '#C8C8C7', '#E4E4E3', '#0A0A0A', '#5A5A58'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, fetchDashboardData, refreshTrigger } = useTransactions();

  const [report, setReport] = useState(null);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [undoTxId, setUndoTxId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    loadDashboardStats();
  }, [fetchDashboardData, refreshTrigger]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const [reportData, debtsData] = await Promise.all([
        reportService.getReport(currentDate.getFullYear(), currentDate.getMonth() + 1),
        debtService.getDebts()
      ]);
      setReport(reportData);
      setDebts(debtsData || []);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  // Defensive checks to ensure debts is an array before filtering
  const safeDebts = Array.isArray(debts) ? debts : [];
  const totalIou = safeDebts.filter(d => d.type === 'IOU' && !d.settled && !d.isSettled).reduce((sum, d) => sum + ((d?.amount || 0) - (d?.amountPaid || 0)), 0);
  const totalUome = safeDebts.filter(d => d.type === 'UOME' && !d.settled && !d.isSettled).reduce((sum, d) => sum + ((d?.amount || 0) - (d?.amountPaid || 0)), 0);

  const totalIncome = report?.monthlySummary?.totalIncome || 0;
  const totalExpense = report?.monthlySummary?.totalExpense || 0;
  const netSavings = report?.monthlySummary?.netSavings || 0;
  const isPositive = netSavings >= 0;

  const handleUndo = async (id) => {
    try {
      await transactionService.deleteTransaction(id);
      toast.success('Transaction removed');
      setUndoTxId(null);
      fetchDashboardData();
      loadDashboardStats();
    } catch (err) {
      toast.error('Failed to undo transaction');
    }
  };

  const DashboardTransactionItem = ({ tx }) => {
    const isUndoActive = undoTxId === tx.id;
    const longPressProps = useLongPress(() => setUndoTxId(tx.id), () => {
      if (undoTxId && undoTxId !== tx.id) setUndoTxId(null);
    });

    return (
      <div {...(isUndoActive ? {} : longPressProps)} className="relative select-none">
        <div className={`flex items-center justify-between py-3 border-b border-j-border last:border-0 transition-opacity duration-base ${isUndoActive ? 'opacity-20' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${tx.type === 'INCOME' ? 'bg-j-positive-dim' : 'bg-j-negative-dim'}`}>
              {tx.type === 'INCOME'
                ? <ArrowUpRight size={15} className="text-j-positive" />
                : <ArrowDownRight size={15} className="text-j-negative" />}
            </div>
            <div>
              <p className="text-sm font-medium text-j-ink-2">{tx.categoryName}</p>
              <p className="text-xs text-j-ink-4">{tx.note || tx.transactionDate}</p>
            </div>
          </div>
          <span className={`text-sm font-semibold tabular-nums ${tx.type === 'INCOME' ? 'text-j-positive' : 'text-j-negative'}`}>
            {tx.type === 'INCOME' ? '+' : '−'}{formatCurrency(tx.amount, user?.currency)}
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
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-j-ink tracking-tight">{user?.name || 'Dashboard'}</h1>
        <p className="text-sm text-j-ink-3 mt-0.5">{monthName}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard className="h-28" rows={1} />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonCard rows={1} />
            <SkeletonCard rows={1} />
          </div>
          <SkeletonListRow />
          <SkeletonListRow />
          <SkeletonListRow />
        </div>
      ) : (
        <>
          {/* Net savings hero */}
          <Card className="p-5">
            <p className="text-xs text-j-ink-3 uppercase tracking-widest mb-3">Net this month</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-[32px] font-semibold tabular-nums leading-none ${isPositive ? 'text-j-ink' : 'text-j-negative'}`}>
                {formatCurrency(netSavings, user?.currency)}
              </span>
              <TrendingUp size={16} className={isPositive ? 'text-j-positive' : 'text-j-negative'} />
            </div>
            {/* Income / Expense sub-row */}
            <div className="flex gap-5 mt-4 pt-3 border-t border-j-border">
              <div>
                <p className="text-xs text-j-ink-4 mb-0.5">Income</p>
                <p className="text-sm font-semibold text-j-positive tabular-nums">+{formatCurrency(totalIncome, user?.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-j-ink-4 mb-0.5">Expenses</p>
                <p className="text-sm font-semibold text-j-negative tabular-nums">−{formatCurrency(totalExpense, user?.currency)}</p>
              </div>
            </div>
          </Card>

          {/* IOU / UOME quick metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card
              padding="p-4"
              onClick={() => navigate('/debts?tab=IOU')}
            >
              <p className="text-xs text-j-ink-4 uppercase tracking-widest mb-2">IOU</p>
              <p className="text-xl font-semibold text-j-negative tabular-nums">{formatCurrency(totalIou, user?.currency)}</p>
              <p className="text-xs text-j-ink-4 mt-1">You owe</p>
            </Card>
            <Card
              padding="p-4"
              onClick={() => navigate('/debts?tab=UOME')}
            >
              <p className="text-xs text-j-ink-4 uppercase tracking-widest mb-2">UOME</p>
              <p className="text-xl font-semibold text-j-positive tabular-nums">{formatCurrency(totalUome, user?.currency)}</p>
              <p className="text-xs text-j-ink-4 mt-1">Owed to you</p>
            </Card>
          </div>

          {/* Category donut chart */}
          {Array.isArray(report?.categoryBreakdown) && report.categoryBreakdown.length > 0 && (
            <Card>
              <p className="text-xs text-j-ink-3 uppercase tracking-widest mb-4">By Category</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={report.categoryBreakdown}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {report.categoryBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_GRAYS[index % CHART_GRAYS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value, user?.currency)}
                      contentStyle={{ borderRadius: '6px', border: '1px solid #E4E4E3', boxShadow: 'none', fontSize: '13px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-3 pt-3 border-t border-j-border">
                {report.categoryBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_GRAYS[idx % CHART_GRAYS.length] }} />
                    <span className="flex-1 truncate text-j-ink-3">{item.categoryName}</span>
                    <span className="font-medium text-j-ink-2">{item.percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent transactions */}
          <div>
            <p className="text-xs text-j-ink-3 uppercase tracking-widest mb-3">Recent</p>
            {Array.isArray(transactions) && transactions.length > 0 ? (
              <Card padding="px-4 py-0">
                {transactions.slice(0, 8).map(tx => (
                  <DashboardTransactionItem key={tx?.id || Math.random()} tx={tx} />
                ))}
              </Card>
            ) : (
              <div className="flex flex-col items-center py-12 text-center text-j-ink-4">
                <div className="text-j-ink-4 mb-4">
                  <JarMascot size={64} fillLevel={0} />
                </div>
                <p className="text-sm">No transactions yet this month</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
