import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export const Card = ({ children, className = '', hover = false, glass = false }: CardProps) => {
  const baseStyles = 'rounded-xl p-6';
  const hoverStyles = hover ? 'hover:shadow-card dark:hover:shadow-card-dark transition-shadow duration-200 cursor-pointer' : '';
  const glassStyles = glass 
    ? 'glass-effect dark:bg-secondary-dark/40 dark:backdrop-blur-sm' 
    : 'bg-white dark:bg-secondary-dark shadow-soft dark:shadow-soft-dark';

  return (
    <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};