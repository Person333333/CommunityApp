import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: GlassButtonProps) {
  const baseClass = `font-bold rounded-chromic-pill transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent ${variant === 'ghost' ? 'glass-layer' : ''}`;

  const variantClass = {
    primary: 'bg-white/10 text-foreground border border-white/20 hover:bg-white/20 hover:shadow-chromic-hover shadow-chromic backdrop-blur-md',
    secondary: 'glass-layer text-foreground hover:bg-white/10 hover:shadow-chromic-hover border border-white/10',
    ghost: 'hover:bg-white/10 text-slate-300 hover:text-foreground border border-transparent',
  }[variant];

  const sizeClass = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }[size];

  return (
    <motion.button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
