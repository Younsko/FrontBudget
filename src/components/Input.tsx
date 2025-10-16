import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-primary-dark mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-all duration-200 ${icon ? 'pl-10' : ''} ${error ? 'border-expense' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-expense">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
