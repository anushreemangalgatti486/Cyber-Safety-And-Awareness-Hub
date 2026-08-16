import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Link2, Clock, User, Shield, AlertTriangle, CheckCircle, Radio } from 'lucide-react';

/**
 * BlockchainLog - Animated terminal-style blockchain activity log
 */

const ACTION_CONFIG = {
  REPORT_SUBMITTED: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'REPORT_SUBMITTED' },
  REPORT_VERIFIED: { icon: Shield, color: 'text-cyber-accent', bg: 'bg-cyber-accent/10', label: 'REPORT_VERIFIED' },
  REPORT_MARKED_SAFE: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'MARKED_SAFE' },
  REPORT_REJECTED: { icon: Shield, color: 'text-cyber-muted', bg: 'bg-white/5', label: 'REJECTED' },
  ALERT_SENT: { icon: Radio, color: 'text-cyber-primary', bg: 'bg-cyber-primary/10', label: 'ALERT_SENT' },
  EMERGENCY_BROADCAST: { icon: Radio, color: 'text-red-400', bg: 'bg-red-400/10', label: 'EMERGENCY_BROADCAST' },
  USER_REGISTERED: { icon: User, color: 'text-cyber-secondary', bg: 'bg-cyber-secondary/10', label: 'USER_REGISTERED' },
  ADMIN_LOGIN: { icon: Shield, color: 'text-cyber-primary', bg: 'bg-cyber-primary/10', label: 'ADMIN_LOGIN' },
  SCAM_DETECTED: { icon: AlertTriangle, color: 'text-cyber-accent', bg: 'bg-cyber-accent/10', label: 'SCAM_DETECTED' },
  THREAT_ESCALATED: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'THREAT_ESCALATED' },
};

const SEVERITY_COLOR = {
  info: 'text-cyber-primary',
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-cyber-accent',
  critical: 'text-red-400',
};

function LogEntry({ log, index }) {
  const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.REPORT_SUBMITTED;
  const Icon = config.icon;
  const severityColor = SEVERITY_COLOR[log.severity] || 'text-cyber-muted';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="font-mono text-xs border-b border-white/5 py-3 px-4 hover:bg-white/3 transition-colors group"
    >
      <div className="flex items-start gap-3">
        {/* Block index */}
        <span className="text-cyber-muted/50 w-8 flex-shrink-0 pt-0.5">
          #{log.blockIndex ?? index}
        </span>

        {/* Icon */}
        <div className={`p-1 rounded flex-shrink-0 ${config.bg}`}>
          <Icon className={`w-3 h-3 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold ${config.color}`}>{config.label}</span>
            <span className={`text-[10px] uppercase ${severityColor}`}>[{log.severity}]</span>
          </div>
          <p className="text-cyber-text/70 mt-0.5 leading-relaxed">{log.description}</p>
          <div className="flex items-center gap-3 mt-1 text-cyber-muted/60">
            <span className="flex items-center gap-1">
              <User className="w-2.5 h-2.5" />
              {log.actorName || 'System'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {new Date(log.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Hash */}
        <div className="hidden lg:flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 text-cyber-primary/40">
            <Link2 className="w-2.5 h-2.5" />
            <span className="text-[9px]">{log.logHash?.substring(0, 8)}...</span>
          </div>
          <div className="text-cyber-muted/30 text-[9px]">
            ← {log.previousLogHash?.substring(0, 8)}...
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BlockchainLog({ logs = [], maxHeight = '400px', title = 'BLOCKCHAIN ACTIVITY LOG' }) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-cyber-primary/20">
      {/* Terminal header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-black/40 border-b border-cyber-primary/20">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-cyber-accent/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Database className="w-4 h-4 text-cyber-primary" />
          <span className="text-cyber-primary font-mono text-xs font-bold tracking-widest">{title}</span>
        </div>
        <span className="text-cyber-muted/50 font-mono text-[10px]">{logs.length} entries</span>
      </div>

      {/* Log entries */}
      <div
        className="overflow-y-auto bg-black/20"
        style={{ maxHeight }}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-cyber-muted">
            <Database className="w-8 h-8 mb-3 opacity-30" />
            <p className="font-mono text-sm">No log entries yet</p>
            <p className="font-mono text-xs mt-1 opacity-60">Logs will appear as activity occurs</p>
          </div>
        ) : (
          <AnimatePresence>
            {logs.map((log, i) => (
              <LogEntry key={log._id || i} log={log} index={i} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
