import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl";
  
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500 border border-transparent dark:bg-primary-500 dark:hover:bg-primary-600",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 focus:ring-gray-500 border border-transparent tracking-wide",
    outline: "border-2 border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm focus:ring-red-500 border border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5 shadow-sm",
    md: "px-5 py-2.5 text-sm gap-2 shadow-md",
    lg: "px-6 py-3 text-base gap-2.5 shadow-lg"
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.96 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />}
      {!isLoading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span className="flex items-center">{children as React.ReactNode}</span>
      {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </motion.button>
  );
});

Button.displayName = 'Button';
