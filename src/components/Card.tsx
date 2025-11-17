import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  style?: React.CSSProperties;
  isDashboard?: boolean;
}

export const Card = ({ children, className = '', hover = false, glass = false, style, isDashboard = false }: CardProps) => {
  const baseStyles = 'rounded-xl p-6 border transition-all duration-200';
  const hoverStyles = hover ? 'hover:shadow-card dark:hover:shadow-card-dark cursor-pointer' : '';
  const glassStyles = glass 
    ? 'glass-effect dark:bg-secondary-dark/40 dark:backdrop-blur-sm' 
    : isDashboard 
      ? 'bg-[#17B169] dark:bg-secondary-dark shadow-soft dark:shadow-soft-dark' 
      : 'bg-white dark:bg-secondary-dark shadow-soft dark:shadow-soft-dark';

  return (
    <div
      className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
