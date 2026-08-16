import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Radio, X, AlertTriangle } from 'lucide-react';

/**
 * WarningModal - Full-screen popup for critical admin notifications
 * Triggered when admin marks a report as SCAM or SAFE
 */

const CONFIG = {
  danger: {
    icon: ShieldAlert,
    iconColor: 'text-cyber-accent',
    iconBg: 'bg-cyber-accent/20',
    border: 'border-cyber-accent/60',
    shadow: 'shadow-[0_0_60px_rgba(255,0,60,0.4)]',
    titleColor: 'text-cyber-accent',
    bg: 'bg-cyber-accent/5',
    pulseColor: 'bg-cyber-accent',
    buttonClass: 'bg-cyber-accent/20 border-cyber-accent text-cyber-accent hover:bg-cyber-accent/30',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-400/20',
    border: 'border-yellow-400/60',
    shadow: 'shadow-[0_0_60px_rgba(234,179,8,0.3)]',
    titleColor: 'text-yellow-400',
    bg: 'bg-yellow-400/5',
    pulseColor: 'bg-yellow-400',
    buttonClass: 'bg-yellow-400/20 border-yellow-400 text-yellow-400 hover:bg-yellow-400/30',
  },
  safe: {
    icon: ShieldCheck,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-400/20',
    border: 'border-green-400/60',
    shadow: 'shadow-[0_0_60px_rgba(74,222,128,0.3)]',
    titleColor: 'text-green-400',
    bg: 'bg-green-400/5',
    pulseColor: 'bg-green-400',
    buttonClass: 'bg-green-400/20 border-green-400 text-green-400 hover:bg-green-400/30',
  },
  emergency: {
    icon: Radio,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-400/20',
    border: 'border-red-500/80',
    shadow: 'shadow-[0_0_80px_rgba(239,68,68,0.5)]',
    titleColor: 'text-red-400',
    bg: 'bg-red-400/5',
    pulseColor: 'bg-red-400',
    buttonClass: 'bg-red-400/20 border-red-400 text-red-400 hover:bg-red-400/30',
  },
};

export default function WarningModal({ notification, onDismiss }) {
  if (!notification) return null;

  const type = notification.type || 'warning';
  const cfg = CONFIG[type] || CONFIG.warning;
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          onClick={e => e.stopPropagation()}
          className={`relative w-full max-w-md glass-panel rounded-2xl border-2 p-8 text-center ${cfg.border} ${cfg.shadow} ${cfg.bg}`}
        >
          {/* Pulse rings */}
          {type === 'danger' || type === 'emergency' ? (
            <>
              <motion.div
                className={`absolute inset-0 rounded-2xl border-2 ${cfg.border}`}
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className={`absolute inset-0 rounded-2xl border ${cfg.border}`}
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </>
          ) : null}

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-cyber-muted hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className={`inline-flex p-5 rounded-full ${cfg.iconBg} mb-5`}>
            <Icon className={`w-12 h-12 ${cfg.iconColor} ${
              type === 'danger' || type === 'emergency' ? 'animate-pulse' : ''
            }`} />
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-black mb-3 tracking-wide ${cfg.titleColor}`}>
            {notification.title || (type === 'safe' ? '✅ CLEARED' : '⚠️ CYBERSHIELD WARNING')}
          </h2>

          {/* Message */}
          <p className="text-cyber-text/80 text-sm leading-relaxed mb-6 font-mono">
            {notification.message}
          </p>

          {/* Timestamp */}
          {notification.timestamp && (
            <p className="text-cyber-muted text-xs font-mono mb-6">
              {new Date(notification.timestamp).toLocaleString()}
            </p>
          )}

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className={`w-full py-3 rounded-xl border font-bold tracking-widest text-sm transition-all ${cfg.buttonClass}`}
          >
            ACKNOWLEDGE
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
