/**
 * Button — four variants, disciplined and minimal.
 * primary:   j-accent fill, white text
 * secondary: 1px j-accent border, j-accent text, transparent bg
 * ghost:     no border, j-ink-3 text, subtle hover
 * danger:    j-negative fill, white text
 */

const variants = {
  primary:   'bg-j-accent text-white hover:bg-[#344e70] active:bg-[#2c4260]',
  secondary: 'border border-j-accent text-j-accent hover:bg-j-accent-dim active:bg-j-accent-dim',
  ghost:     'text-j-ink-3 hover:text-j-ink-2 hover:bg-j-surface-raised active:bg-j-border',
  danger:    'bg-j-negative text-white hover:bg-[#751a1a] active:bg-[#5f1515]',
};

const sizes = {
  sm: 'h-8  px-3 text-xs  rounded-sm',
  md: 'h-11 px-5 text-sm  rounded-sm',
  lg: 'h-12 px-6 text-base rounded-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium tracking-tight
        transition-[background-color,color,border-color,opacity,transform] duration-fast ease-smooth
        active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
