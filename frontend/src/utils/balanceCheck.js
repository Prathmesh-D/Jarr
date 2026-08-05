import { reportService } from '../services/reportService';
import { toast } from 'react-hot-toast';

export const checkSufficientBalance = async (amountToDeduct, silent = false) => {
  try {
    const currentDate = new Date();
    const report = await reportService.getReport(currentDate.getFullYear(), currentDate.getMonth() + 1);
    const currentBalance = report?.monthlySummary?.allTimeNetBalance || 0;
    
    if (currentBalance - amountToDeduct < 0) {
      if (!silent) {
        toast.error('Insufficient Balance: Your balance cannot go below zero.');
      }
      return false; // insufficient
    }
    return true; // sufficient
  } catch (err) {
    console.error('Failed to verify balance', err);
    return true; // fail open to not completely block the app if reports fail
  }
};
