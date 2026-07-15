/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Jarr Monochrome Design System ──────────────────────────────────
      colors: {
        j: {
          // Surfaces & backgrounds
          'bg':             'var(--j-bg)',
          'surface':        'var(--j-surface)',
          'surface-raised': 'var(--j-surface-raised)',
          'glow':           'var(--j-glow)',

          // Borders
          'border':         'var(--j-border)',
          'border-strong':  'var(--j-border-strong)',

          // Typography — 4-step ink scale
          'ink':            'var(--j-ink)',
          'ink-2':          'var(--j-ink-2)',
          'ink-3':          'var(--j-ink-3)',
          'ink-4':          'var(--j-ink-4)',

          // Sole accent — muted slate-blue, used only for primary actions & focus
          'accent':         'var(--j-accent)',
          'accent-dim':     'var(--j-accent-dim)',

          // Semantic colors — meaning only, never decorative
          'positive':       'var(--j-positive)',
          'positive-dim':   'var(--j-positive-dim)',
          'negative':       'var(--j-negative)',
          'negative-dim':   'var(--j-negative-dim)',
          'warning':        'var(--j-warning)',
          'warning-dim':    'var(--j-warning-dim)',

          // Modal overlay
          'overlay':        'var(--j-overlay)',
        },
      },

      // ── Typography ─────────────────────────────────────────────────────
      fontFamily: {
        'sans': ['"Inter"', 'system-ui', 'sans-serif'],
        'heading': ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xl':  ['28px', { lineHeight: '1.1', fontWeight: '600' }],
        'xl':   ['22px', { lineHeight: '1.2', fontWeight: '600' }],
        'lg':   ['17px', { lineHeight: '1.3', fontWeight: '600' }],
        'base': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'sm':   ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        'xs':   ['11px', { lineHeight: '1.3', fontWeight: '500', letterSpacing: '0.06em' }],
      },

      // ── Border Radius ──────────────────────────────────────────────────
      borderRadius: {
        'sm':   '6px',    // Tags, small chips, inputs
        'md':   '10px',   // Cards, panels
        'lg':   '14px',   // Modals, bottom sheets
        'full': '999px',  // FAB, pill-only elements
      },

      // ── Elevation ──────────────────────────────────────────────────────
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'modal': '0 8px 40px rgba(0,0,0,0.16)',
        'nav':   '0 -1px 0 #E4E4E3',
      },

      // ── Motion ─────────────────────────────────────────────────────────
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'exit':   'cubic-bezier(0.0, 0.0, 0.2, 1)',
      },
      transitionDuration: {
        'fast':  '100ms',
        'base':  '200ms',
        'route': '250ms',
        'modal': '220ms',
      },
    },
  },
  plugins: [],
}
