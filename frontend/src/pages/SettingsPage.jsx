import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { notificationService } from '../services/notificationService';
import toast from 'react-hot-toast';
import CategoryManager from '../components/CategoryManager';
import api from '../services/api';
import { LogOut, Bell, Banknote, ChevronRight } from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { AppLoader } from '../components/ui/Skeleton';
import { useTheme } from '../context/ThemeContext';
import { Moon } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout, fetchUser } = useAuth();
  const { theme, changeTheme } = useTheme();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    logout();
    navigate('/', { replace: true });
  };

  const [notifPermission, setNotifPermission] = useState(Notification.permission);
  const [currency, setCurrency] = useState(user?.currency || 'USD');

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    try {
      await api.patch('/users/me', { currency: newCurrency });
      await fetchUser();
      toast.success('Currency updated');
    } catch (err) {
      toast.error('Failed to update currency');
    }
  };

  const enableNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications not supported');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const publicKey = await notificationService.getVapidPublicKey();
        const padding = '='.repeat((4 - publicKey.length % 4) % 4);
        const base64 = (publicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
        const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: outputArray });
        await notificationService.subscribe(subscription);
        toast.success('Notifications enabled');
      }
    } catch (error) {
      toast.error('Error enabling notifications');
    }
  };

  const currencies = [
    { code: 'USD', label: 'USD — US Dollar' },
    { code: 'EUR', label: 'EUR — Euro' },
    { code: 'GBP', label: 'GBP — British Pound' },
    { code: 'INR', label: 'INR — Indian Rupee' },
    { code: 'CAD', label: 'CAD — Canadian Dollar' },
    { code: 'AUD', label: 'AUD — Australian Dollar' },
    { code: 'JPY', label: 'JPY — Japanese Yen' },
  ];

  return (
    <div className="space-y-6 pb-8 pt-8">
      {isLoggingOut && <AppLoader />}
      <h1 className="text-3xl font-heading font-bold text-j-ink tracking-tight">Settings</h1>

      {/* Profile */}
      <div>
        <p className="label-overline mb-2">Account</p>
        <div className="bg-j-surface border border-j-border rounded-md divide-y divide-j-border">
          <div className="px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-j-surface-raised border border-j-border flex items-center justify-center text-sm font-semibold text-j-ink-2 shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-j-ink">{user?.name || 'User'}</p>
              <p className="text-xs text-j-ink-3">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <p className="label-overline mb-2">Preferences</p>
        <div className="bg-j-surface border border-j-border rounded-md divide-y divide-j-border">
          {/* Currency */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Banknote size={16} className="text-j-ink-3" />
              <div>
                <p className="text-sm font-medium text-j-ink">Currency</p>
              </div>
            </div>
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="h-8 px-2 border border-j-border rounded-sm bg-j-surface text-sm text-j-ink-2 focus:border-j-border-strong focus:outline-none focus:ring-2 focus:ring-j-accent/12 transition-[border-color] duration-base"
            >
              {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>

          {/* Theme */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-j-ink-3" />
              <div>
                <p className="text-sm font-medium text-j-ink">Theme</p>
              </div>
            </div>
            <select
              value={theme}
              onChange={(e) => changeTheme(e.target.value)}
              className="h-8 px-2 border border-j-border rounded-sm bg-j-surface text-sm text-j-ink-2 focus:border-j-border-strong focus:outline-none focus:ring-2 focus:ring-j-accent/12 transition-[border-color] duration-base"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-j-ink-3" />
              <div>
                <p className="text-sm font-medium text-j-ink">Push Notifications</p>
              </div>
            </div>
            {notifPermission === 'granted' ? (
              <span className="text-xs font-medium text-j-positive bg-j-positive-dim px-2.5 py-1 rounded-sm">Enabled</span>
            ) : (
              <button
                onClick={enableNotifications}
                className="text-xs font-medium text-j-accent border border-j-accent/30 px-2.5 py-1 rounded-sm hover:bg-j-accent-dim transition-colors duration-fast"
              >
                Enable
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="label-overline mb-2">Categories</p>
        <CategoryManager />
      </div>

      {/* Logout */}
      <div>
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-j-surface border border-j-border rounded-md text-sm font-medium text-j-negative hover:bg-j-negative-dim hover:border-j-negative/20 transition-[background-color,border-color] duration-fast"
        >
          <div className="flex items-center gap-3">
            <LogOut size={16} />
            <span>Sign Out</span>
          </div>
          <ChevronRight size={14} className="text-j-ink-4" />
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account? You will need to log back in to access your data."
        confirmText="Sign Out"
        icon="logout"
        isDestructive={false}
      />
    </div>
  );
}
