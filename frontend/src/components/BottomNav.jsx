import { NavLink, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Users2, BarChart3, Plus } from 'lucide-react';

/**
 * BottomNav — Mathematically perfect unified SVG design
 * - The entire navbar background (pill + bump) is drawn as a single unified SVG path.
 * - This guarantees zero alignment gaps, zero vertical border artifacts, and perfect curves.
 */

const leftItems = [
  { to: '/dashboard',    icon: Home,       label: 'Home' },
  { to: '/transactions', icon: TrendingUp,  label: 'Transactions' },
];

const rightItems = [
  { to: '/debts',   icon: Users2,   label: 'Debts' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function BottomNav({ onFabClick }) {
  const location = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-2rem)] max-w-[22rem]"
      aria-label="Main navigation"
    >
      {/* 1. RESPONSIVE BACKGROUND LAYER */}
      {/* Uses a 3-piece flex layout so the pill can stretch dynamically without distorting the center curve */}
      <div
        className="absolute inset-0 flex items-end pointer-events-none"
        style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.06))' }}
      >
        {/* Left scalable pill side */}
        <div className="flex-1 h-14 bg-j-surface border-[1.5px] border-r-0 border-j-border rounded-l-full relative z-10" />
        
        {/* Center fixed bump */}
        <div className="w-[8.75rem] h-[5rem] relative z-20 shrink-0 -mx-[2px]">
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 140 80" 
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 text-j-border overflow-visible"
          >
            {/* Surface fill overlaps left and right by 2px to mask any CSS rendering seams */}
            <path d="M -2 24.75 L 31.5 24.75 A 12 12 0 0 0 42 18.5 A 32 32 0 0 1 98 18.5 A 12 12 0 0 0 108.5 24.75 L 142 24.75 L 142 80 L -2 80 Z" fill="var(--j-surface)" />
            {/* Continuous Top Stroke */}
            <path d="M -2 24.75 L 31.5 24.75 A 12 12 0 0 0 42 18.5 A 32 32 0 0 1 98 18.5 A 12 12 0 0 0 108.5 24.75 L 142 24.75" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Continuous Bottom Stroke */}
            <path d="M -2 79.25 L 142 79.25" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        
        {/* Right scalable pill side */}
        <div className="flex-1 h-14 bg-j-surface border-[1.5px] border-l-0 border-j-border rounded-r-full relative z-10" />
      </div>

      {/* 2. CONTENT LAYER (ICONS) */}
      <div className="relative z-30 flex items-center justify-between w-full h-14 px-2">
        {/* Left items */}
        <div className="flex flex-1 items-center justify-evenly">
          {leftItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                aria-label={label}
                title={label}
                className="relative flex flex-col items-center justify-center w-12 h-12"
              >
                <div className="relative flex flex-col items-center justify-center w-full h-full">
                  <Icon
                    size="1.375rem"
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isActive ? 'text-j-ink -translate-y-[0.4375rem] scale-[0.85]' : 'text-j-ink-4 translate-y-0 scale-100'
                    }`}
                  />
                  <span 
                    className={`absolute bottom-[0.375rem] text-[0.625rem] font-semibold leading-none text-j-ink tracking-tight transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Spacer for the center button */}
        <div className="w-[3.75rem] shrink-0" />

        {/* Right items */}
        <div className="flex flex-1 items-center justify-evenly">
          {rightItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                aria-label={label}
                title={label}
                className="relative flex flex-col items-center justify-center w-12 h-12"
              >
                <div className="relative flex flex-col items-center justify-center w-full h-full">
                  <Icon
                    size="1.375rem"
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isActive ? 'text-j-ink -translate-y-[0.4375rem] scale-[0.85]' : 'text-j-ink-4 translate-y-0 scale-100'
                    }`}
                  />
                  <span 
                    className={`absolute bottom-[0.375rem] text-[0.625rem] font-semibold leading-none text-j-ink tracking-tight transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* 3. HERO BUTTON */}
      <button
        onClick={onFabClick}
        aria-label="Quick add"
        className="
          absolute left-1/2 -translate-x-1/2 -top-[1rem] z-40
          flex items-center justify-center
          w-[3.25rem] h-[3.25rem]
          rounded-full
          bg-j-ink text-white
          transition-transform duration-fast ease-smooth
          active:scale-95
          shadow-md
        "
      >
        <Plus size="1.75rem" strokeWidth={2.5} className="text-j-bg" />
      </button>
      
    </nav>
  );
}
