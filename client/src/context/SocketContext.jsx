import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);           // system/report alerts
  const [notifications, setNotifications] = useState([]); // admin-sent notifications
  const [stats, setStats] = useState(null);           // real-time dashboard stats
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineStats, setOnlineStats] = useState({ users: 0, admins: 0 });
  const [activities, setActivities] = useState([]);

  // ── Audio alert ──────────────────────────────────────────────
  const playAlertSound = useCallback((type = 'danger') => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'safe') {
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.24);
      } else if (type === 'emergency') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.3);
      } else {
        // danger / warning
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.24);
      }

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not available — silently ignore
    }
  }, []);

  // ── Socket setup ─────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Identify user to server for room assignment
      if (user?._id) {
        socket.emit('identify', { userId: user._id, role: user.role });
      }
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('reconnect', () => {
      setIsConnected(true);
      if (user?._id) {
        socket.emit('identify', { userId: user._id, role: user.role });
      }
    });

    // ── Incoming events ───────────────────────────────────────

    // Legacy broadcast alert (admin manual send)
    socket.on('receive_alert', (data) => {
      const item = { ...data, id: Date.now(), timestamp: new Date().toISOString() };
      setAlerts(prev => [item, ...prev].slice(0, 50));
      playAlertSound('warning');
    });

    // New report submitted (real-time admin feed)
    socket.on('new_report', (data) => {
      const item = {
        id: Date.now(),
        message: data.message,
        type: data.type || 'warning',
        report: data.report,
        timestamp: new Date().toISOString(),
      };
      setAlerts(prev => [item, ...prev].slice(0, 50));
      if (data.type === 'danger') playAlertSound('danger');
    });

    // Admin notification (verify / safe / broadcast)
    socket.on('admin_notification', (data) => {
      const item = { ...data, id: Date.now(), timestamp: new Date().toISOString() };
      setNotifications(prev => [item, ...prev].slice(0, 20));
      playAlertSound(data.type === 'safe' ? 'safe' : data.type === 'emergency' ? 'emergency' : 'danger');
    });

    // Real-time stats update
    socket.on('stats_update', (newStats) => {
      setStats(newStats);
    });

    // Online user count (admin only)
    socket.on('online_count', (count) => {
      setOnlineCount(count);
    });

    // Detailed online stats
    socket.on('online_stats', (stats) => {
      setOnlineStats(stats);
    });

    // Live activity feed
    socket.on('new_activity', (activity) => {
      const item = { ...activity, id: Date.now() };
      setActivities(prev => [item, ...prev].slice(0, 50));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, playAlertSound]);

  // ── Dismiss helpers ───────────────────────────────────────────
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      alerts,
      notifications,
      stats,
      onlineCount,
      onlineStats,
      activities,
      dismissNotification,
      dismissAlert,
      playAlertSound,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
