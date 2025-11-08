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
  const variantClass = {
    default: 'glass',
    teal: 'glass-teal',
    ochre: 'glass-ochre',
    strong: 'glass-strong',
  }[variant];

  return (
    <motion.div
      onClick={onClick}
      className={`${variantClass} p-6 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { 
        scale: 1.02, 
        boxShadow: '0 20px 60px rgba(15, 118, 110, 0.3)',
        transition: { duration: 0.2 }
      } : undefined}
    >
      {children}
    </motion.div>
  );
}
