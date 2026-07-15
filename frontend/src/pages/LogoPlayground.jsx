import { useNavigate } from 'react-router-dom';

export default function LogoPlayground() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-j-bg p-8">
      <button onClick={() => navigate(-1)} className="mb-8 text-j-ink-3 hover:text-j-ink text-sm font-medium">
        &larr; Back
      </button>
      <h1 className="text-3xl font-heading font-bold text-j-ink mb-2">Logo Concepts</h1>
      <p className="text-j-ink-3 mb-10">Select your favorite concept.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Concept 2: The Hexagon Vault */}
        <div className="bg-j-surface border border-j-border p-8 rounded-md flex flex-col items-center">
          <svg width="120" height="141" viewBox="0 0 100 118" fill="none" className="text-j-ink mb-6">
            <path d="M20 45 L50 30 L80 45 L80 80 L50 95 L20 80 Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 45 L50 60 L80 45" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 60 L50 95" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <circle cx="50" cy="16" r="8" stroke="currentColor" strokeWidth="5" />
          </svg>
          <h2 className="font-semibold text-j-ink mb-1">Concept 2: Hexagon Vault</h2>
          <p className="text-xs text-center text-j-ink-4">A sleek, 3D isometric hexagon representing a digital vault.</p>
        </div>

        {/* Concept 3: The Split Silhouette */}
        <div className="bg-j-surface border border-j-border p-8 rounded-md flex flex-col items-center">
          <svg width="120" height="141" viewBox="0 0 100 118" fill="none" className="text-j-ink mb-6">
            <path d="M35 15 L30 15 L30 35 Q10 65 30 95 L40 95" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M65 15 L70 15 L70 35 Q90 65 70 95 L60 95" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="55" r="14" stroke="currentColor" strokeWidth="6" />
            <path d="M50 48 L50 62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <h2 className="font-semibold text-j-ink mb-1">Concept 3: Split Silhouette</h2>
          <p className="text-xs text-center text-j-ink-4">A jar silhouette made of two disconnected lines with a coin hovering between them.</p>
        </div>

        {/* Concept 5: The Floating Drop */}
        <div className="bg-j-surface border border-j-border p-8 rounded-md flex flex-col items-center">
          <svg width="120" height="141" viewBox="0 0 100 118" fill="none" className="text-j-ink mb-6">
            <path d="M25 50 L25 80 Q25 100 50 100 Q75 100 75 80 L75 50" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            <path d="M50 15 C64 15 64 30 64 30 C64 42 50 55 50 55 C50 55 36 42 36 30 C36 30 36 15 50 15 Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="30" r="5" fill="currentColor" />
          </svg>
          <h2 className="font-semibold text-j-ink mb-1">Concept 5: Floating Drop</h2>
          <p className="text-xs text-center text-j-ink-4">A thick "U" shape jar with a modern teardrop/map pin dropping into it.</p>
        </div>

        {/* Concept 6: The Continuous Line */}
        <div className="bg-j-surface border border-j-border p-8 rounded-md flex flex-col items-center">
          <svg width="120" height="141" viewBox="0 0 100 118" fill="none" className="text-j-ink mb-6">
            <path d="M25 25 L25 80 Q25 100 50 100 Q75 100 75 80 L75 25 L50 25 L50 45" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="65" r="10" stroke="currentColor" strokeWidth="6" />
          </svg>
          <h2 className="font-semibold text-j-ink mb-1">Concept 6: Continuous Line</h2>
          <p className="text-xs text-center text-j-ink-4">A single continuous stroke that wraps around to form the jar.</p>
        </div>

      </div>
    </div>
  );
}
