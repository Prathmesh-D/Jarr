import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, PiggyBank, ArrowLeft } from 'lucide-react';
import { vaultService } from '../services/vaultService';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currency';
import VaultCard from '../components/vault/VaultCard';
import CreateVaultModal from '../components/vault/CreateVaultModal';
import VaultDetailSheet from '../components/vault/VaultDetailSheet';
import VaultActionModal from '../components/vault/VaultActionModal';
import { toast } from 'react-hot-toast';

export default function VaultPage() {
  const { user } = useAuth();
  const { fetchDashboardData, triggerRefresh } = useTransactions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [editVault, setEditVault] = useState(null);
  const [detailVault, setDetailVault] = useState(null);
  const [actionMode, setActionMode] = useState(null); // 'deposit'|'withdraw'|'transfer'|'edit'
  const [editEntry, setEditEntry] = useState(null);
  const [entries, setEntries] = useState([]);

  // Fetch all vaults
  const { data: vaults = [], isLoading } = useQuery({
    queryKey: ['vaults'],
    queryFn: vaultService.getVaults,
  });

  const invalidateVaults = () => queryClient.invalidateQueries({ queryKey: ['vaults'] });

  // Helpers
  const refreshDetailVault = async (vault) => {
    const fresh = await vaultService.getVaults();
    const updated = fresh.find(v => v.id === vault.id);
    if (updated) setDetailVault(updated);
    const freshEntries = await vaultService.getEntries(vault.id);
    setEntries(freshEntries);
    queryClient.setQueryData(['vaults'], fresh);
  };

  const openDetail = async (vault) => {
    setDetailVault(vault);
    try {
      const e = await vaultService.getEntries(vault.id);
      setEntries(e);
    } catch {
      setEntries([]);
    }
  };

  // Vault CRUD
  const handleSaveVault = async (data) => {
    try {
      if (editVault) {
        await vaultService.updateVault(editVault.id, data);
        toast.success('Vault updated');
        if (detailVault?.id === editVault.id) await refreshDetailVault(editVault);
      } else {
        await vaultService.createVault(data);
        toast.success('Vault created');
      }
      invalidateVaults();
      setEditVault(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
      throw err;
    }
  };

  const handleDeleteVault = async () => {
    try {
      await vaultService.deleteVault(detailVault.id);
      toast.success('Vault deleted');
      setDetailVault(null);
      invalidateVaults();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cannot delete vault with a non-zero balance');
    }
  };

  // Entry actions
  const handleDeposit = async (data) => {
    const entry = await vaultService.deposit(detailVault.id, data);
    
    if (data.sourceId === 'main') {
      try {
        const categories = await categoryService.getCategories();
        const expCategory = categories.find(c => c.type === 'EXPENSE' && c.name.toLowerCase().includes('other')) 
                         || categories.find(c => c.type === 'EXPENSE')
                         || categories[0];
                         
        await transactionService.createTransaction({
          amount: parseFloat(data.amount),
          type: 'EXPENSE',
          categoryId: expCategory?.id,
          transactionDate: data.entryDate,
          note: `To Vault: ${detailVault.name}${data.note ? ` - ${data.note}` : ''}`,
          vaultEntryId: entry.id
        });
        fetchDashboardData();
        triggerRefresh();
        toast.success('Deposited from Jarr');
      } catch (err) {
        console.error('Failed to sync transaction', err);
        toast.success('Deposited (Sync failed)');
      }
    } else {
      toast.success('Deposited');
    }
    
    await refreshDetailVault(detailVault);
    invalidateVaults();
  };

  const handleWithdraw = async (data) => {
    try {
      await vaultService.withdraw(detailVault.id, data);
      toast.success('Withdrawn');
      await refreshDetailVault(detailVault);
      invalidateVaults();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Insufficient balance');
      throw err;
    }
  };

  const handleTransfer = async (data) => {
    try {
      if (data.toVaultId === 'main') {
        // Special case: transfer to main tracker
        const entry = await vaultService.withdraw(detailVault.id, {
          amount: data.amount,
          note: data.note,
          entryDate: data.entryDate,
        });
        
        try {
          const categories = await categoryService.getCategories();
          const incCategory = categories.find(c => c.type === 'INCOME' && c.name.toLowerCase().includes('other')) 
                           || categories.find(c => c.type === 'INCOME')
                           || categories[0];
                           
          await transactionService.createTransaction({
            amount: parseFloat(data.amount),
            type: 'INCOME',
            categoryId: incCategory?.id,
            transactionDate: data.entryDate,
            note: `Transfer from Vault: ${detailVault.name}${data.note ? ` - ${data.note}` : ''}`,
            vaultEntryId: entry.id
          });
          fetchDashboardData();
          triggerRefresh();
          toast.success('Transferred to Jarr');
        } catch (err) {
          console.error('Failed to sync transaction', err);
          toast.success('Transferred (Sync failed)');
        }
      } else {
        // Normal vault-to-vault transfer
        await vaultService.transfer(detailVault.id, data);
        toast.success('Transfer complete');
      }
      
      await refreshDetailVault(detailVault);
      invalidateVaults();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Transfer failed');
      throw err;
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await vaultService.deleteEntry(entryId);
      toast.success('Entry deleted');
      await refreshDetailVault(detailVault);
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  const handleEditEntry = async (data) => {
    try {
      await vaultService.updateEntry(editEntry.id, data);
      toast.success('Entry updated');
      
      // Since changing amount impacts vault balance, we need to refresh the vault and dashboard
      await refreshDetailVault(detailVault);
      invalidateVaults();
      fetchDashboardData();
      triggerRefresh();
    } catch (err) {
      toast.error('Failed to update entry');
      throw err;
    }
  };

  // Total savings across all vaults
  const totalSavings = vaults.reduce((sum, v) => sum + Number(v.currentBalance || 0), 0);

  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mt-8 lg:mt-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-j-ink tracking-tight">Vault</h1>
          <p className="text-xs text-j-ink-4 mt-0.5">Your savings, kept separate</p>
        </div>
        <button
          onClick={() => { setEditVault(null); setCreateOpen(true); }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-j-ink text-j-bg text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.97] transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Vault
        </button>
      </div>

      {/* Total savings banner */}
      {vaults.length > 0 && (
        <div className="bg-j-surface border border-j-border rounded-xl p-5">
          <p className="text-xs text-j-ink-4 uppercase tracking-widest mb-1.5">Total Saved</p>
          <p className="text-3xl font-bold text-j-ink tabular-nums">
            {formatCurrency(totalSavings, user?.currency)}
          </p>
          <p className="text-xs text-j-ink-4 mt-1">across {vaults.length} vault{vaults.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 bg-j-surface border border-j-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : vaults.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-j-surface border border-j-border flex items-center justify-center mb-4">
            <PiggyBank size={28} className="text-j-ink-4" />
          </div>
          <p className="text-base font-semibold text-j-ink-2">No vaults yet</p>
          <p className="text-sm text-j-ink-4 mt-1 max-w-[200px]">
            Create a vault to start tracking your savings
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-5 px-4 py-2 bg-j-ink text-j-bg text-sm font-semibold rounded-lg"
          >
            Create your first vault
          </button>
        </div>
      ) : (
        // Vault grid
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vaults.map(vault => (
            <VaultCard
              key={vault.id}
              vault={vault}
              currency={user?.currency}
              onClick={() => openDetail(vault)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateVaultModal
        isOpen={createOpen || !!editVault}
        onClose={() => { setCreateOpen(false); setEditVault(null); }}
        onSaved={handleSaveVault}
        editVault={editVault}
      />

      <VaultDetailSheet
        isOpen={!!detailVault}
        vault={detailVault}
        entries={entries}
        currency={user?.currency}
        allVaults={vaults}
        onClose={() => setDetailVault(null)}
        onManage={(mode) => setActionMode(mode)}
        onDeleteEntry={handleDeleteEntry}
        onEditEntry={(entry) => { setEditEntry(entry); setActionMode('edit'); }}
        onEdit={() => { setEditVault(detailVault); setDetailVault(null); setCreateOpen(false); setActionMode(null); }}
        onDeleteVault={handleDeleteVault}
      />

      <VaultActionModal
        isOpen={!!actionMode}
        initialMode={actionMode}
        onClose={() => { setActionMode(null); setEditEntry(null); }}
        vault={detailVault}
        allVaults={vaults}
        editEntry={editEntry}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        onTransfer={handleTransfer}
        onEdit={handleEditEntry}
      />
    </div>
  );
}
