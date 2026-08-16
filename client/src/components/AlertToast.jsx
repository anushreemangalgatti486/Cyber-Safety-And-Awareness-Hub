import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { ShieldAlert, ShieldCheck, X, AlertTriangle, Zap, Radio } from 'lucide-react';

/**
 * AlertToast - Displays real-time notifications from Socket.io
 * Shows both admin notifications (verify/safe) and general alerts
 */
export default function AlertToast() {
  const { notifications, alerts, dismissNotification, dismissAlert } = useSocket();
  const [visibleAlerts, setVisibleAlerts] = React.useState([]);

  // Show new socket alerts as toasts (auto-dismiss after 6s)
  useEffect(() => {
    if (alerts.length > 0) {
      const latest = alerts[0];
      // Avoid duplicates
      setVisibleAlerts(prev => {
        if (prev.find(a => a.id === latest.id)) return prev;
        return [latest, ...prev].slice(0, 5);
      });
      const timer = setTimeout(() => {
        setVisibleAlerts(prev => prev.filter(a => a.id !== latest.id));
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  // Show admin notifications (persist until dismissed)
  const allVisible = [
    ...notifications.map(n => ({ ...n, isAdminNotif: true })),
    ...visibleAlerts.map(a => ({ ...a, isAdminNotif: false })),
  ].slice(0, 6);

  const getIcon = (item) => {
    if (item.type === 'safe') return <ShieldCheck className="w-5 h-5 text-green-400" />;
    if (item.type === 'danger' || item.type === 'warning') return <ShieldAlert className="w-5 h-5 text-cyber-accent animate-pulse" />;
    if (item.type === 'emergency') return <Radio className="w-5 h-5 text-red-500 animate-pulse" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
  };

  const getBorderColor = (item) => {
    if (item.type === 'safe') return 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
    if (item.type === 'emergency') return 'border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.5)]';
    if (item.type === 'danger') return 'border-cyber-accent/60 shadow-[0_0_15px_rgba(255,0,60,0.4)]';
    return 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
  };

  const getTitle = (item) => {
    if (item.title) return item.title;
    if (item.type === 'safe') return '✅ Marked Safe';
    if (item.type === 'danger') return '⚠️ Threat Detected';
    if (item.type === 'emergency') return '🚨 Emergency Alert';
    return '🔔 New Alert';
  };

  const dismiss = (item) => {
    if (item.isAdminNotif) {
      dismissNotification(item.id);
    } else {
      setVisibleAlerts(prev => prev.filter(a => a.id !== item.id));
      dismissAlert(item.id);
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {allVisible.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`glass-panel border rounded-xl p-4 pointer-events-auto ${getBorderColor(item)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full flex-shrink-0 ${
                item.type === 'safe' ? 'bg-green-500/20' :
                item.type === 'emergency' ? 'bg-red-500/20' :
                'bg-cyber-accent/20'
              }`}>
                {getIcon(item)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-sm ${
                  item.type === 'safe' ? 'text-green-400' :
                  item.type === 'emergency' ? 'text-red-400' :
                  'text-cyber-accent'
                }`}>
                  {getTitle(item)}
                </h4>
                <p className="text-cyber-text/80 text-xs mt-1 leading-relaxed line-clamp-3">
                  {item.message}
                </p>
                <p className="text-cyber-muted text-xs mt-1 font-mono">
                  {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
                </p>
              </div>
              <button
                onClick={() => dismiss(item)}
                className="text-cyber-muted hover:text-white transition-colors flex-shrink-0 p-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar for auto-dismiss */}
            {!item.isAdminNotif && (
              <motion.div
                className="mt-3 h-0.5 bg-cyber-accent/30 rounded-full overflow-hidden"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-cyber-accent rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 6, ease: 'linear' }}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
