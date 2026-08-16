import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, ShieldCheck, Radio, AlertTriangle, Bell, Wifi, WifiOff, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import PageHeader from '../components/PageHeader';

/**
 * RealTimeAlerts - Live alert feed from Socket.io
 * Shows all incoming alerts and admin notifications
 */
export default function RealTimeAlerts() {
  const { alerts, notifications, isConnected, dismissAlert, dismissNotification } = useSocket();
  const [allAlerts, setAllAlerts] = useState([]);

  // Merge socket alerts and admin notifications into one feed
  useEffect(() => {
    const merged = [
      ...notifications.map(n => ({ ...n, source: 'admin', isAdminNotif: true })),
      ...alerts.map(a => ({ ...a, source: 'system', isAdminNotif: false })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setAllAlerts(merged.slice(0, 50));
  }, [alerts, notifications]);

  const getIcon = (item) => {
    if (item.type === 'safe') return <ShieldCheck className="w-5 h-5 text-green-400" />;
    if (item.type === 'emergency') return <Radio className="w-5 h-5 text-red-400 animate-pulse" />;
    if (item.type === 'danger') return <ShieldAlert className="w-5 h-5 text-cyber-accent animate-pulse" />;
    if (item.type === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <Bell className="w-5 h-5 text-cyber-primary" />;
  };

  const getBorderColor = (item) => {
    if (item.type === 'safe') return 'border-l-green-500';
    if (item.type === 'emergency') return 'border-l-red-500';
    if (item.type === 'danger') return 'border-l-cyber-accent';
    if (item.type === 'warning') return 'border-l-yellow-400';
    return 'border-l-cyber-primary';
  };

  const getTypeLabel = (item) => {
    if (item.type === 'safe') return { label: 'SAFE', color: 'text-green-400 bg-green-400/10' };
    if (item.type === 'emergency') return { label: 'EMERGENCY', color: 'text-red-400 bg-red-400/10' };
    if (item.type === 'danger') return { label: 'DANGER', color: 'text-cyber-accent bg-cyber-accent/10' };
    if (item.type === 'warning') return { label: 'WARNING', color: 'text-yellow-400 bg-yellow-400/10' };
    return { label: 'INFO', color: 'text-cyber-primary bg-cyber-primary/10' };
  };

  const dismiss = (item) => {
    if (item.isAdminNotif) {
      dismissNotification(item.id);
    } else {
      dismissAlert(item.id);
    }
  };

  return (
    <div className="p-4 md:p-8 mt-16 ml-0 md:ml-64 min-h-[calc(100vh-4rem)] pb-16">
      {/* Header */}
      <PageHeader
        title="LIVE THREAT ALERTS"
        subtitle="Real-time cyber security event monitoring"
        icon={Activity}
        iconColor="text-cyber-accent"
        glowColor="danger"
        backTo="/home"
        right={
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono ${
            isConnected
              ? 'bg-green-400/10 text-green-400 border border-green-400/30'
              : 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30'
          }`}>
            {isConnected ? <><Wifi className="w-4 h-4" /> LIVE</> : <><WifiOff className="w-4 h-4" /> OFFLINE</>}
          </div>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Alerts', value: allAlerts.length, color: 'text-cyber-primary' },
          { label: 'Admin Alerts', value: notifications.length, color: 'text-cyber-accent' },
          { label: 'System Events', value: alerts.length, color: 'text-yellow-400' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel rounded-xl p-4 text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-cyber-muted text-xs uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alert feed */}
      <div className="space-y-3">
        <AnimatePresence>
          {allAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-cyber-muted"
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-cyber-primary/10 blur-xl rounded-full" />
                <Activity className="w-12 h-12 opacity-30 relative z-10" />
              </div>
              <p className="font-mono text-sm">No alerts yet</p>
              <p className="font-mono text-xs mt-1 opacity-60">
                Alerts will appear here in real-time as threats are detected
              </p>
            </motion.div>
          ) : (
            allAlerts.map((alert, index) => {
              const typeInfo = getTypeLabel(alert);
              return (
                <motion.div
                  key={alert.id || index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ delay: index * 0.03 }}
                  className={`glass-panel p-4 md:p-5 rounded-xl border-l-4 ${getBorderColor(alert)} flex gap-4 items-start group hover:bg-white/3 transition-colors`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(alert)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm">
                        {alert.title || 'SYSTEM ALERT'}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {alert.source === 'admin' && (
                        <span className="text-[10px] text-cyber-secondary bg-cyber-secondary/10 px-2 py-0.5 rounded font-mono">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-cyber-text/80 text-sm leading-relaxed">{alert.message}</p>
                    <p className="text-cyber-muted text-xs mt-2 font-mono">
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => dismiss(alert)}
                    className="flex-shrink-0 p-1 text-cyber-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
