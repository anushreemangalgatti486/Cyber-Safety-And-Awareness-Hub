import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database, ShieldAlert, Eye, CheckCircle,
  Users, Activity, TrendingUp, Radio, RefreshCw, Zap
} from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import BlockchainLog from '../../components/BlockchainLog';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const API = 'http://localhost:5000/api';

export default function AdminHome() {
  const { user } = useAuth();
  const { stats: socketStats, alerts, onlineCount } = useSocket();

  const [stats, setStats] = useState({
    totalReports: 0, pendingReports: 0, highRiskReports: 0,
    verifiedReports: 0, safeReports: 0, activeThreats: 0,
    scamAlerts: 0, totalUsers: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, reportsRes, logsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/reports?limit=5`),
        axios.get(`${API}/admin/threat-logs?limit=8`),
      ]);
      setStats(statsRes.data);
      setRecentReports(reportsRes.data);
      setRecentLogs(logsRes.data);
    } catch (e) {
      console.error('[AdminHome]', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (socketStats) setStats(socketStats); }, [socketStats]);

  // Live feed from socket
  const [liveFeed, setLiveFeed] = useState([]);
  useEffect(() => {
    if (alerts.length > 0) setLiveFeed(prev => [alerts[0], ...prev].slice(0, 8));
  }, [alerts]);

  const STAT_CARDS = [
    { title: 'Total Reports',   value: stats.totalReports,   icon: Database,    color: 'primary',   delay: 0.05 },
    { title: 'Pending Review',  value: stats.pendingReports, icon: Eye,         color: 'warning',   delay: 0.1,  pulse: stats.pendingReports > 0 },
    { title: 'High Risk',       value: stats.highRiskReports,icon: ShieldAlert, color: 'danger',    delay: 0.15, pulse: stats.highRiskReports > 0 },
    { title: 'Verified Scams',  value: stats.verifiedReports,icon: Radio,       color: 'danger',    delay: 0.2  },
    { title: 'Marked Safe',     value: stats.safeReports,    icon: CheckCircle, color: 'success',   delay: 0.25 },
    { title: 'Total Users',     value: stats.totalUsers,     icon: Users,       color: 'primary',   delay: 0.3  },
    { title: 'Active Threats',  value: stats.activeThreats,  icon: ShieldAlert, color: stats.activeThreats > 0 ? 'danger' : 'success', delay: 0.35, pulse: stats.activeThreats > 0 },
    { title: 'Online Now',      value: onlineCount,          icon: Zap,         color: 'success',   delay: 0.4,  pulse: true },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-white/5 rounded-full w-64 mb-6 animate-pulse" />
        <LoadingSkeleton type="cards" count={4} />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-64 glass-panel rounded-xl animate-pulse" />
          <div className="h-64 glass-panel rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-cyber-accent text-glow-danger">ADMIN DASHBOARD</h1>
          <p className="text-cyber-muted text-xs font-mono mt-1">
            Welcome, {user?.name} · {new Date().toLocaleString()}
          </p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel border border-white/10 text-cyber-muted hover:text-cyber-primary hover:border-cyber-primary/30 transition-all text-xs font-mono">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.slice(0, 4).map(c => <StatCard key={c.title} {...c} />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.slice(4).map(c => <StatCard key={c.title} {...c} />)}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent reports */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-panel rounded-xl border border-white/5 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyber-primary" /> Recent Reports
            </h3>
            <span className="text-xs text-cyber-muted font-mono">{stats.totalReports} total</span>
          </div>
          <div className="divide-y divide-white/5">
            {recentReports.length === 0 ? (
              <p className="text-cyber-muted text-xs font-mono text-center py-8">No reports yet</p>
            ) : recentReports.map(r => (
              <div key={r._id} className="px-5 py-3 flex items-center justify-between hover:bg-white/3 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{r.scamType}</p>
                  <p className="text-cyber-muted text-xs font-mono">{r.reporterName || 'Anonymous'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    r.riskLevel === 'High' ? 'text-cyber-accent bg-cyber-accent/10' :
                    r.riskLevel === 'Medium' ? 'text-yellow-400 bg-yellow-400/10' :
                    'text-green-400 bg-green-400/10'
                  }`}>{r.riskLevel}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    r.status === 'Pending' ? 'text-yellow-400 bg-yellow-400/10' :
                    r.status === 'Verified' ? 'text-cyber-accent bg-cyber-accent/10' :
                    r.status === 'Safe' ? 'text-green-400 bg-green-400/10' :
                    'text-cyber-muted bg-white/5'
                  }`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Live feed + blockchain logs */}
        <div className="space-y-4">
          {/* Live activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-panel rounded-xl border border-white/5 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" /> Live Activity
              </h3>
            </div>
            <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
              {liveFeed.length === 0 ? (
                <p className="text-cyber-muted text-xs font-mono text-center py-4">Monitoring for activity...</p>
              ) : liveFeed.map((item, i) => (
                <div key={item.id || i} className="flex items-start gap-2 text-xs">
                  <span className={`flex-shrink-0 font-mono ${
                    item.type === 'danger' ? 'text-cyber-accent' :
                    item.type === 'warning' ? 'text-yellow-400' : 'text-cyber-primary'
                  }`}>●</span>
                  <span className="text-cyber-text/70 leading-relaxed">{item.message}</span>
                  <span className="text-cyber-muted font-mono flex-shrink-0 ml-auto">
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Blockchain logs preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <BlockchainLog logs={recentLogs} maxHeight="180px" title="RECENT BLOCKCHAIN LOGS" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
