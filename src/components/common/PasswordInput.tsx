import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  iconClassName?: string;
  buttonClassName?: string;
  hasError?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', iconClassName = '', buttonClassName = '', hasError = false, disabled = false, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
      if (disabled) return;
      setIsVisible((prev) => !prev);
    };

    return (
      <div className="relative w-full">
        <input
          {...props}
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          disabled={disabled}
          className={`w-full pr-10 ${className} ${hasError ? 'border-rose-400 focus:ring-rose-400' : ''}`}
        />
        <button
          type="button"
          tabIndex={0}
          onClick={toggleVisibility}
          disabled={disabled}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
        >
          {isVisible ? (
            <EyeOff className={`w-4 h-4 ${iconClassName}`} aria-hidden="true" />
          ) : (
            <Eye className={`w-4 h-4 ${iconClassName}`} aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
