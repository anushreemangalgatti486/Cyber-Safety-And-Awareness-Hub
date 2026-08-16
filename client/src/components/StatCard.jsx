import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

/**
 * StatCard - Animated stat display card with neon glow
 * Used across dashboard pages
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  delay = 0,
  color = 'primary', // 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  subtitle,
  pulse = false,
}) {
  const colorMap = {
    primary: {
      border: 'border-l-cyber-primary',
      icon: 'text-cyber-primary',
      glow: 'shadow-[0_0_20px_rgba(0,240,255,0.1)]',
      badge: 'bg-cyber-primary/10 text-cyber-primary',
    },
    secondary: {
      border: 'border-l-cyber-secondary',
      icon: 'text-cyber-secondary',
      glow: 'shadow-[0_0_20px_rgba(112,0,255,0.1)]',
      badge: 'bg-cyber-secondary/10 text-cyber-secondary',
    },
    danger: {
      border: 'border-l-cyber-accent',
      icon: 'text-cyber-accent',
      glow: 'shadow-[0_0_20px_rgba(255,0,60,0.15)]',
      badge: 'bg-cyber-accent/10 text-cyber-accent',
    },
    success: {
      border: 'border-l-green-500',
      icon: 'text-green-400',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.1)]',
      badge: 'bg-green-500/10 text-green-400',
    },
    warning: {
      border: 'border-l-yellow-400',
      icon: 'text-yellow-400',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.1)]',
      badge: 'bg-yellow-400/10 text-yellow-400',
    },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, translateY: -2 }}
      className={cn(
        'glass-panel p-5 rounded-xl border-l-4 relative overflow-hidden group cursor-default',
        c.border,
        c.glow
      )}
    >
      {/* Background icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <Icon className="w-16 h-16" />
      </div>

      {/* Scan line on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-700 pointer-events-none" />

      <div className="relative z-10">
        <p className="text-cyber-muted text-xs uppercase tracking-widest font-medium">{title}</p>
        <div className="flex items-end gap-2 mt-2">
          <motion.h3
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-black text-white"
          >
            {value}
          </motion.h3>
          {pulse && (
            <span className={cn('w-2 h-2 rounded-full mb-2 animate-pulse', c.icon.replace('text-', 'bg-'))} />
          )}
        </div>
        {subtitle && (
          <p className={cn('text-xs mt-1 font-mono', c.icon)}>{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
