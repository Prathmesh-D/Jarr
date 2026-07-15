/**
 * JarMascot — monochrome single-stroke outline jar.
 * No fills, no colors. Uses currentColor for stroke.
 * fillLevel (0–1) shows a subtle fill line inside the jar outline only.
 */
export default function JarMascot({ size = 120, fillLevel = 0.5, className = '', animate = false }) {
  const w = size;
  const h = size * 1.18;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft Fill / Glow */}
      {fillLevel > 0 && (
        <path
          d="M24 70 L24 88 A 12 12 0 0 0 36 100 L64 100 A 12 12 0 0 0 76 88 L76 70 Z"
          fill="currentColor"
          opacity={0.15 * fillLevel}
          className="transition-all duration-700 ease-smooth"
        />
      )}

      {/* The Boxy 'J' Body */}
      <path
        d="M76 18 L76 88 A 12 12 0 0 1 64 100 L36 100 A 12 12 0 0 1 24 88 L24 46"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="square"
      />

      {/* The Jar Rim */}
      <path
        d="M56 18 L88 18"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="square"
      />

      {/* The Block / Coin */}
      <g className={animate ? 'coin-drop' : ''}>
        <rect x="18" y="12" width="12" height="12" fill="currentColor" />
      </g>

      {animate && (
        <style>{`
          @keyframes float-coin {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-6px); }
          }
          .coin-drop { animation: float-coin 3s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) { .coin-drop { animation: none; } }
        `}</style>
      )}
    </svg>
  );
}
