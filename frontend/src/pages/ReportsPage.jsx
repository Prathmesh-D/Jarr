import { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import JarMascot from '../components/JarMascot';
import { SkeletonCard, SkeletonChartBlock } from '../components/ui/Skeleton';
import { reportService } from '../services/reportService';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { Download, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

const CHART_GRAYS = ['#3A3A3A', '#787876', '#B0B0AE', '#C8C8C7', '#E4E4E3', '#0A0A0A'];

export default function ReportsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  useEffect(() => { loadReport(); }, [year, month]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReport(year, month);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await reportService.exportCsv(year, month);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${year}_${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  const hasData = report && (report.monthlySummary?.totalIncome > 0 || report.monthlySummary?.totalExpense > 0);

  const insights = useMemo(() => {
    if (!hasData) return null;
    
    // 1. Savings Rate
    const income = report.monthlySummary.totalIncome;
    const savings = report.monthlySummary.netSavings;
    const savingsRate = income > 0 ? Math.max(0, (savings / income) * 100) : 0;
    
    // 2. Average Daily Spend
    const daysInMonth = new Date(year, month, 0).getDate();
    const avgDailySpend = report.monthlySummary.totalExpense / daysInMonth;
    
    // 3. Top Category
    const topCategory = report.categoryBreakdown?.length > 0 ? report.categoryBreakdown[0] : null;
    
    // 4. Highest Spend Day
    const highestSpendDay = report.dailySpends?.length > 0 
      ? report.dailySpends.reduce((max, d) => d.amount > max.amount ? d : max, report.dailySpends[0])
      : null;

    return { savingsRate, avgDailySpend, topCategory, highestSpendDay };
  }, [report, hasData, year, month]);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-heading font-bold text-j-ink tracking-tight">Reports</h1>
        <input
          type="month"
          className="w-full sm:w-48 h-10 px-3 border border-j-border rounded-sm text-sm text-j-ink bg-j-surface focus:border-j-border-strong focus:outline-none focus:ring-2 focus:ring-j-accent/12 transition-[border-color] duration-base"
          value={`${year}-${month.toString().padStart(2, '0')}`}
          onChange={(e) => {
            if (e.target.value) {
              const [y, m] = e.target.value.split('-');
              setYear(parseInt(y, 10));
              setMonth(parseInt(m, 10));
            }
          }}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <SkeletonCard rows={1} />
            <SkeletonCard rows={1} />
            <SkeletonCard rows={1} />
          </div>
          <SkeletonChartBlock />
          <SkeletonChartBlock />
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="text-j-ink-4 mb-4">
            <JarMascot size={72} fillLevel={0} />
          </div>
          <p className="text-sm font-medium text-j-ink-3">No data for this period</p>
          <p className="text-xs text-j-ink-4 mt-1">Add transactions to see your report</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Income', value: report.monthlySummary.totalIncome, color: 'text-j-positive' },
              { label: 'Expenses', value: report.monthlySummary.totalExpense, color: 'text-j-negative' },
              { label: 'Net', value: report.monthlySummary.netSavings, color: report.monthlySummary.netSavings >= 0 ? 'text-j-ink' : 'text-j-negative' },
            ].map(({ label, value, color }) => (
              <Card key={label} padding="p-3 sm:p-4 min-h-[5rem] flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-j-ink-4 mb-1.5 uppercase tracking-widest truncate">{label}</p>
                <p 
                  className={`text-sm sm:text-lg font-bold tabular-nums tracking-tight truncate ${color}`}
                  title={formatCurrency(value, user?.currency)}
                >
                  {formatCurrency(value, user?.currency)}
                </p>
              </Card>
            ))}
          </div>

          {/* Insights Grid */}
          {insights && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Savings Rate */}
              <Card padding="p-3 sm:p-4 flex flex-col justify-between min-h-[5.5rem] border-t-2 border-t-j-positive">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] sm:text-xs text-j-ink-4 uppercase tracking-widest">Savings Rate</p>
                  <Target size={14} className="text-j-positive" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-lg sm:text-xl font-bold tracking-tight text-j-ink">{insights.savingsRate.toFixed(1)}%</p>
                </div>
              </Card>

              {/* Avg Daily Spend */}
              <Card padding="p-3 sm:p-4 flex flex-col justify-between min-h-[5.5rem] border-t-2 border-t-j-ink-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] sm:text-xs text-j-ink-4 uppercase tracking-widest">Daily Avg</p>
                  <TrendingDown size={14} className="text-j-ink-3" />
                </div>
                <p className="text-lg sm:text-xl font-bold tracking-tight text-j-ink">
                  {formatCurrency(insights.avgDailySpend, user?.currency)}
                </p>
              </Card>

              {/* Top Category */}
              <Card padding="p-3 sm:p-4 flex flex-col justify-between min-h-[5.5rem] border-t-2 border-t-j-accent">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] sm:text-xs text-j-ink-4 uppercase tracking-widest">Top Expense</p>
                  <TrendingUp size={14} className="text-j-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-j-ink truncate">
                    {insights.topCategory ? insights.topCategory.categoryName : 'None'}
                  </p>
                  <p className="text-xs text-j-ink-3">
                    {insights.topCategory ? formatCurrency(insights.topCategory.amount, user?.currency) : '-'}
                  </p>
                </div>
              </Card>

              {/* Highest Spend Day */}
              <Card padding="p-3 sm:p-4 flex flex-col justify-between min-h-[5.5rem] border-t-2 border-t-j-negative">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] sm:text-xs text-j-ink-4 uppercase tracking-widest">Peak Day</p>
                  <Zap size={14} className="text-j-negative" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-j-ink truncate">
                    {insights.highestSpendDay ? `Day ${parseInt(insights.highestSpendDay.date.split('-')[2], 10)}` : 'None'}
                  </p>
                  <p className="text-xs text-j-negative">
                    {insights.highestSpendDay ? formatCurrency(insights.highestSpendDay.amount, user?.currency) : '-'}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category donut */}
          {report.categoryBreakdown && report.categoryBreakdown.length > 0 && (
            <Card>
              <p className="text-xs text-j-ink-3 uppercase tracking-widest mb-4">By Category</p>
              <div className="h-52">
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

          {/* Daily spend bar chart */}
          {report.dailySpends && report.dailySpends.length > 0 && (
            <Card>
              <p className="text-xs text-j-ink-3 uppercase tracking-widest mb-4">Daily Spend</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.dailySpends} barSize={6}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => parseInt(d.split('-')[2], 10)}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#B0B0AE', fontSize: 11 }}
                      dy={6}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: '#F2F2F1' }}
                      formatter={(value) => [formatCurrency(value, user?.currency), 'Spent']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ borderRadius: '6px', border: '1px solid #E4E4E3', boxShadow: 'none', fontSize: '13px' }}
                    />
                    <Bar dataKey="amount" fill="#3A3A3A" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
          </div>

          {/* Export */}
          <button
            onClick={handleExportCsv}
            className="w-full flex items-center justify-center gap-2 border border-j-border rounded-sm py-2.5 text-sm font-medium text-j-ink-3 hover:bg-j-surface-raised hover:text-j-ink hover:border-j-border-strong transition-[background-color,color,border-color] duration-fast ease-smooth"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
}
