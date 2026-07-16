/**
 * Skeleton — shared shimmer placeholder components.
 * Use these instead of "Loading..." text in every screen.
 */
export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonText({ className = '' }) {
  return <div className={`skeleton h-4 rounded-sm ${className}`} />;
}

export function SkeletonCard({ className = '', rows = 2 }) {
  return (
    <div className={`bg-j-surface border border-j-border rounded-md p-4 space-y-3 ${className}`}>
      <SkeletonText className="w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonText key={i} className={i === rows - 1 ? 'w-2/3' : 'w-full'} />
      ))}
    </div>
  );
}

export function SkeletonListRow({ className = '' }) {
  return (
    <div className={`bg-j-surface border border-j-border rounded-md p-4 flex items-center gap-4 ${className}`}>
      <div className="skeleton w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="w-1/2" />
        <SkeletonText className="w-1/3" />
      </div>
      <SkeletonText className="w-16" />
    </div>
  );
}

export function SkeletonChartBlock({ className = '' }) {
  return (
    <div className={`bg-j-surface border border-j-border rounded-md p-4 ${className}`}>
      <SkeletonText className="w-32 mb-4" />
      <div className="skeleton h-48 w-full rounded-md" />
    </div>
  );
}

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

/** Branded initial loading screen — shown on first app auth check */
export function AppLoader() {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    const handleWaking = () => setIsWaking(true);
    window.addEventListener('server-waking-up', handleWaking);
    return () => window.removeEventListener('server-waking-up', handleWaking);
  }, []);

  return createPortal(
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center gap-6 z-[999] transition-colors duration-slow">
      {/* Minimal animated mark */}
      <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="2" width="24" height="4" rx="2" fill="white" opacity="0.9"/>
        <path
          d="M6 8 Q2 8 2 14 L2 38 Q2 46 10 46 L30 46 Q38 46 38 38 L38 14 Q38 8 34 8 Z"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <style>{`
          @keyframes fill-rise {
            0%   { clip-path: inset(100% 0 0 0); opacity: 0; }
            20%  { opacity: 1; }
            100% { clip-path: inset(0% 0 0 0); }
          }
          .jar-fill { animation: fill-rise 1.6s cubic-bezier(0.16,1,0.3,1) infinite alternate; }
        `}</style>
        <path
          className="jar-fill"
          d="M4 38 Q4 44 10 44 L30 44 Q36 44 36 38 L36 24 Q28 28 20 26 Q12 24 4 28 Z"
          fill="white"
          opacity="0.15"
        />
      </svg>
      
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-white rounded-full opacity-40"
              style={{ animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite alternate` }}
            />
          ))}
        </div>
        {isWaking && (
          <p className="text-sm font-medium text-white/70 animate-pulse mt-2 px-6 text-center">
            Waking up the server...<br/>
            <span className="text-xs text-white/40 font-normal mt-1 block">
              This usually takes about 30 seconds on the free tier.
            </span>
          </p>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%   { opacity: 0.25; transform: scale(0.8); }
          100% { opacity: 0.9;  transform: scale(1.2); }
        }
        @media (prefers-reduced-motion: reduce) {
          .jar-fill, div[style*='animation'] { animation: none !important; opacity: 0.5; }
        }
      `}</style>
    </div>,
    document.body
  );
}
