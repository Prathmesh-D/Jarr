import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import QuickAddModal from './QuickAddModal';
import DebtAddModal from './DebtAddModal';
import { useTransactions } from '../context/TransactionContext';
import { debtService } from '../services/debtService';
import toast from 'react-hot-toast';

export default function AppLayout() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [pageKey, setPageKey] = useState(location.pathname);
  const { fetchDashboardData } = useTransactions();

  useEffect(() => {
    setPageKey(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const checkDebtReminders = async () => {
      if (sessionStorage.getItem('debtRemindersShown')) return;
      try {
        const debts = await debtService.getDebts() || [];
        const safeDebts = Array.isArray(debts) ? debts : [];
        const unsettled = safeDebts.filter(d => (!d?.settled && !d?.isSettled) && d?.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        unsettled.forEach(debt => {
          const due = new Date(debt.dueDate);
          const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
          if (diffDays < 0) {
            toast.error(`Debt Overdue: ${debt.personName} by ${Math.abs(diffDays)} day(s)!`, { duration: 6000 });
          } else if (diffDays === 0) {
            toast.error(`Debt Due Today: ${debt.personName}!`, { duration: 6000 });
          } else if (diffDays <= 3) {
            toast(`Debt Due Soon: ${debt.personName} in ${diffDays} days`, { duration: 5000 });
          }
        });
        sessionStorage.setItem('debtRemindersShown', 'true');
      } catch (err) {
        console.error('Failed to load debt reminders', err);
      }
    };
    checkDebtReminders();
  }, []);

  const handleFabClick = () => {
    if (location.pathname === '/debts') {
      setIsDebtModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-j-bg relative overflow-x-hidden">
      {/* Ambient background glow for the whole app */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-j-glow blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10">
        <Sidebar onAddClick={handleFabClick} />
      </div>

      <main className="relative lg:ml-56 pb-32 lg:pb-10">
        {/* Top Action Bar */}
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 pt-4 pb-2 lg:pt-5 pointer-events-none">
          {location.pathname === '/settings' ? (
            <button
              onClick={() => window.history.back()}
              className="pointer-events-auto w-9 h-9 rounded-sm bg-j-surface border border-j-border flex items-center justify-center text-j-ink-3 hover:text-j-ink hover:border-j-border-strong transition-[border-color,color] duration-fast ease-smooth shadow-card"
              aria-label="Go back"
            >
              <ArrowLeft size={16} strokeWidth={1.8} />
            </button>
          ) : (
            <div />
          )}

          {location.pathname !== '/settings' && (
            <Link
              to="/settings"
              className="pointer-events-auto w-9 h-9 rounded-sm bg-j-surface border border-j-border flex items-center justify-center text-j-ink-3 hover:text-j-ink hover:border-j-border-strong transition-[border-color,color] duration-fast ease-smooth shadow-card"
              aria-label="Settings"
            >
              <Settings size={16} strokeWidth={1.8} />
            </Link>
          )}
        </div>

        {/* Page content with fade-in transition */}
        <div className="max-w-2xl mx-auto px-4 pt-16 pb-6 page-enter page-enter-active">
          <Outlet />
        </div>
      </main>

      {/* BottomNav owns both the bar AND the FAB button */}
      <BottomNav onFabClick={handleFabClick} />

      <QuickAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <DebtAddModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
      />
    </div>
  );
}
