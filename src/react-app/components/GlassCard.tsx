import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'teal' | 'ochre' | 'strong';
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
  variant = 'default',
  onClick,
}: GlassCardProps) {
  // Map legacy variants to new chromic layer aesthetics safely
  const variantClass = {
    default: 'glass-layer',
    teal: 'glass-layer border-teal-500/20',
    ochre: 'glass-layer border-amber-500/20',
    strong: 'glass-layer bg-white/5 border-white/20',
  }[variant];

  return (
    <motion.div
      onClick={onClick}
      className={`${variantClass} p-6 rounded-chromic-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', damping: 20, stiffness: 100 }}
      whileHover={hover ? {
        scale: 1.02,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 30px rgba(192, 132, 252, 0.3)',
      } : undefined}
    >
      {children}
    </motion.div>
  );
}
