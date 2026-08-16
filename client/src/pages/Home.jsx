import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, Activity, Target, Zap, Database, Radio, TrendingUp, Home as HomeIcon } from 'lucide-react';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import Globe from '../components/Globe';
import StatCard from '../components/StatCard';
import ThreatRadar from '../components/ThreatRadar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PageHeader from '../components/PageHeader';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

// Live activity feed item
function ActivityItem({ item, index }) {
  const colors = {
    danger: 'border-cyber-accent text-cyber-accent',
    warning: 'border-yellow-400 text-yellow-400',
    safe: 'border-green-400 text-green-400',
    info: 'border-cyber-primary text-cyber-primary',
  };
  const c = colors[item.type] || colors.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white/3 p-3 rounded-lg border-l-2 ${c} text-xs`}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="text-cyber-text/80 leading-relaxed flex-1">{item.message}</span>
        <span className="text-cyber-muted font-mono flex-shrink-0">
          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * Home / Dashboard - Main user dashboard
 * All stats start at 0 and update in real-time from actual data
 */
export default function Home() {
  const { user } = useAuth();
  const { stats: socketStats, alerts } = useSocket();
  const [stats, setStats] = useState({
    totalReports: 0,
    activeThreats: 0,
    highRiskReports: 0,
    safeReports: 0,
    scamAlerts: 0,
    totalUsers: 0,
  });
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`);
      setStats(res.data);
    } catch (e) {
      // If not admin, fetch basic report count
      try {
        const res = await axios.get(`${API}/reports`);
        const reports = res.data;
        setStats({
          totalReports: reports.length,
          activeThreats: reports.filter(r => r.status === 'Pending' || r.status === 'Verified').length,
          highRiskReports: reports.filter(r => r.riskLevel === 'High').length,
          safeReports: reports.filter(r => r.status === 'Safe').length,
          scamAlerts: reports.filter(r => r.status === 'Verified').length,
          totalUsers: 0,
        });
      } catch {
        // Keep zeros
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Update stats from socket in real-time
  useEffect(() => {
    if (socketStats) {
      setStats(socketStats);
    }
  }, [socketStats]);

  // Build activity feed from socket alerts
  useEffect(() => {
    if (alerts.length > 0) {
      setActivityFeed(prev => [alerts[0], ...prev].slice(0, 10));
    }
  }, [alerts]);

  const statCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: Database,
      color: 'primary',
      delay: 0.1,
      subtitle: 'All time submissions',
    },
    {
      title: 'Active Threats',
      value: stats.activeThreats,
      icon: ShieldAlert,
      color: stats.activeThreats > 0 ? 'danger' : 'success',
      delay: 0.2,
      pulse: stats.activeThreats > 0,
      subtitle: stats.activeThreats > 0 ? 'Requires attention' : 'All clear',
    },
    {
      title: 'High Risk Alerts',
      value: stats.highRiskReports,
      icon: Target,
      color: stats.highRiskReports > 0 ? 'danger' : 'success',
      delay: 0.3,
      pulse: stats.highRiskReports > 0,
      subtitle: 'Critical severity',
    },
    {
      title: 'Scam Alerts',
      value: stats.scamAlerts,
      icon: Radio,
      color: stats.scamAlerts > 0 ? 'warning' : 'success',
      delay: 0.4,
      subtitle: 'Verified threats',
    },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-8 mt-16 ml-0 md:ml-64 min-h-[calc(100vh-4rem)] pb-16">
        <div className="h-8 bg-white/5 rounded-full w-48 mb-8 animate-pulse" />
        <LoadingSkeleton type="cards" count={4} />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 glass-panel rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-44 glass-panel rounded-xl animate-pulse" />
            <div className="h-44 glass-panel rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 mt-16 ml-0 md:ml-64 min-h-[calc(100vh-4rem)] pb-16">
      {/* Header */}
      <PageHeader
        title="COMMAND CENTER"
        subtitle={`Welcome back, ${user?.name || 'Agent'}`}
        icon={HomeIcon}
        iconColor="text-cyber-primary"
        glowColor="primary"
        backTo="/home"
        right={
          <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 border border-cyber-accent/30">
            <div className="w-2 h-2 rounded-full bg-cyber-accent animate-pulse" />
            <span className="text-cyber-accent text-xs font-bold tracking-widest font-mono">
              {stats.activeThreats > 0 ? `DEFCON ${Math.min(stats.activeThreats, 5)}` : 'SECURE'}
            </span>
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-panel rounded-xl p-4 md:p-6 flex flex-col h-[350px] md:h-[420px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-cyber-primary flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Global Threat Activity
            </h3>
            <span className="text-xs text-cyber-muted font-mono">LIVE</span>
          </div>
          <div className="flex-1 w-full relative cursor-move">
            <Canvas camera={{ position: [0, 0, 3] }}>
              <ambientLight intensity={0.5} />
              <Globe />
            </Canvas>
          </div>
        </motion.div>

        {/* Radar + Feed */}
        <div className="flex flex-col gap-6">
          {/* Threat Radar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel rounded-xl p-4 flex flex-col items-center"
          >
            <h3 className="text-sm font-bold text-cyber-secondary mb-3 self-start flex items-center gap-2">
              <Target className="w-4 h-4" />
              Threat Radar
            </h3>
            <ThreatRadar threats={stats.activeThreats} size={160} />
            <p className="text-xs text-cyber-muted mt-3 font-mono">
              {stats.activeThreats} active threat{stats.activeThreats !== 1 ? 's' : ''} detected
            </p>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-panel rounded-xl p-4 flex-1 flex flex-col min-h-[200px]"
          >
            <h3 className="text-sm font-bold text-cyber-secondary mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Live Activity Feed
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <AnimatePresence>
                {activityFeed.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-24 text-cyber-muted"
                  >
                    <Activity className="w-6 h-6 mb-2 opacity-30" />
                    <p className="text-xs font-mono">Monitoring for activity...</p>
                  </motion.div>
                ) : (
                  activityFeed.map((item, i) => (
                    <ActivityItem key={item.id || i} item={item} index={i} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Threat Score Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 glass-panel rounded-xl p-4 md:p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyber-primary" />
            Threat Detection Score
          </h3>
          <span className="text-cyber-primary font-mono text-sm font-bold">
            {stats.totalReports > 0
              ? Math.round((stats.scamAlerts / stats.totalReports) * 100)
              : 0}% Threat Rate
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-cyber-accent"
            initial={{ width: 0 }}
            animate={{
              width: stats.totalReports > 0
                ? `${Math.round((stats.scamAlerts / stats.totalReports) * 100)}%`
                : '0%'
            }}
            transition={{ duration: 1, delay: 1 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-cyber-muted font-mono">
          <span>SAFE</span>
          <span>MODERATE</span>
          <span>CRITICAL</span>
        </div>
      </motion.div>
    </div>
  );
}
