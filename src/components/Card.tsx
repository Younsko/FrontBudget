import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export const Card = ({ children, className = '', hover = false, glass = false }: CardProps) => {
  const baseStyles = 'rounded-xl p-6';
  const hoverStyles = hover ? 'hover:shadow-card transition-shadow duration-200 cursor-pointer' : '';
  const glassStyles = glass ? 'glass-effect' : 'bg-white shadow-soft';

  return (
    <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
