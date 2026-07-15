import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Input — clean 1px border, Inter, j-accent focus ring, minimal radius.
 */
const Input = forwardRef(({
  label,
  error,
  id,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const currentType = isPasswordType && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-j-ink-3 uppercase tracking-widest"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={inputId}
          type={currentType}
          className={`
            w-full h-11 px-3
            text-sm text-j-ink
            bg-j-surface
            border rounded-sm
            placeholder:text-j-ink-4
            transition-[border-color,box-shadow] duration-base ease-smooth
            outline-none
            ${isPasswordType ? 'pr-10' : ''}
            ${error
              ? 'border-j-negative focus:border-j-negative focus:ring-2 focus:ring-j-negative/15'
              : 'border-j-border focus:border-j-border-strong focus:ring-2 focus:ring-j-accent/12'
            }
            ${className}
          `}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-j-ink-4 hover:text-j-ink-2 transition-colors duration-fast focus:outline-none"
            tabIndex="-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-j-negative">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
