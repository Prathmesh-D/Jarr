import { NavLink } from 'react-router-dom';
import { Home, List, BarChart3, Grid3X3, Handshake } from 'lucide-react';

import JarMascot from './JarMascot';

/**
 * Desktop sidebar — j-surface-raised bg, minimal monochrome nav links.
 */
const navItems = [
  { to: '/dashboard',    icon: Home,      label: 'Home' },
  { to: '/transactions', icon: List,      label: 'Transactions' },
  { to: '/reports',      icon: BarChart3, label: 'Reports' },
  { to: '/categories',   icon: Grid3X3,   label: 'Categories' },
  { to: '/debts',        icon: Handshake, label: 'Debts' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-56 bg-j-surface-raised border-r border-j-border z-50">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-j-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-j-surface border border-j-border flex items-center justify-center text-j-ink shadow-sm">
          <JarMascot size={20} fillLevel={0} />
        </div>
        <div>
          <span className="block text-lg font-heading font-bold tracking-tight text-j-ink leading-none mt-0.5">Jarr.</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-[background-color,color] duration-fast ease-smooth
               ${isActive
                 ? 'bg-j-accent-dim text-j-accent'
                 : 'text-j-ink-3 hover:bg-j-border hover:text-j-ink-2'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2 : 1.6} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-5 border-t border-j-border">
        <p className="text-xs text-j-ink-4">© {new Date().getFullYear()} Jarr</p>
      </div>
    </aside>
  );
}
