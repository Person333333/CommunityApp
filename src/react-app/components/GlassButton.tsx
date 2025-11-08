import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function GlassButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled,
  type = 'button',
}: GlassButtonProps) {
  const baseClass = 'glass font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-transparent';
  
  const variantClass = {
    primary: 'bg-gradient-to-r from-teal-600 to-amber-600 text-white hover:shadow-lg hover:shadow-teal-500/50',
    secondary: 'glass-teal text-teal-100 hover:glass-strong',
    ghost: 'hover:glass-teal text-slate-100',
  }[variant];
  
  const sizeClass = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}
