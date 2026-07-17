import { createContext, useContext, useState, useCallback } from 'react';
import { transactionService } from '../services/transactionService';


const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const txRes = await transactionService.getTransactions(0, 5); // fetch 5 recent for dashboard
      const content = txRes?.content;
      setTransactions(Array.isArray(content) ? content : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <TransactionContext.Provider value={{ transactions, loading, fetchDashboardData, refreshTrigger, triggerRefresh }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionContext);
