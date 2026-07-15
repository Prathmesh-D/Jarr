/**
 * Card — minimal flat surface with 1px border.
 * Replaces the colorful tinted-shadow card.
 */
export default function Card({ children, className = '', padding = 'p-4', onClick, ...props }) {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      className={`
        bg-j-surface border border-j-border rounded-md shadow-card
        ${interactive ? 'cursor-pointer hover:border-j-border-strong transition-[border-color,box-shadow] duration-base ease-smooth active:scale-[0.99]' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
