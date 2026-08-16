import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Database, AlertTriangle, CheckCircle, XCircle,
  Radio, Send, Trash2, Eye, TrendingUp, Activity, RefreshCw,
  ShieldAlert, ShieldCheck, Loader2, BarChart2, Home, Search,
  FileText, Bell, BookOpen, User as UserIcon, LayoutDashboard,
  CheckSquare, Zap
} from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import BlockchainLog from '../components/BlockchainLog';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PageHeader from '../components/PageHeader';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';

const API = 'http://localhost:5000/api';

const STATUS_COLORS = {
  Pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Verified: 'text-cyber-accent bg-cyber-accent/10 border-cyber-accent/30',
  Safe: 'text-green-400 bg-green-400/10 border-green-400/30',
  Rejected: 'text-cyber-muted bg-white/5 border-white/10',
};

const RISK_COLORS = {
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-cyber-accent',
};

const PIE_COLORS = ['#00f0ff', '#7000ff', '#ff003c', '#4ade80', '#facc15'];

const REPORTS_BY_MONTH = [
  { name: 'Jan', reports: 65 },
  { name: 'Feb', reports: 59 },
  { name: 'Mar', reports: 80 },
  { name: 'Apr', reports: 81 },
  { name: 'May', reports: 56 },
  { name: 'Jun', reports: 95 },
  { name: 'Jul', reports: 130 },
];

/**
 * AdminDashboard - Full admin control panel
 * Real-time monitoring, report management, broadcast alerts
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const { socket, stats: socketStats, alerts, onlineCount, onlineStats, activities, notifications } = useSocket();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalReports: 0, pendingReports: 0, highRiskReports: 0,
    verifiedReports: 0, safeReports: 0, activeThreats: 0,
    scamAlerts: 0, totalUsers: 0,
  });
  const [reports, setReports] = useState([]);
  const [threatLogs, setThreatLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | reports | analytics | users | logs

  // Broadcast form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('warning');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcastCount, setBroadcastCount] = useState(0);

  // Report action states
  const [actionLoading, setActionLoading] = useState({});
  
  // Custom Toast state
  const [toast, setToast] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, reportsRes, logsRes, analyticsRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/reports`),
        axios.get(`${API}/admin/threat-logs`),
        axios.get(`${API}/admin/analytics`),
        axios.get(`${API}/admin/users`),
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data);
      setThreatLogs(logsRes.data);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      console.error('[Admin] Fetch failed:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Real-time stats update from socket
  useEffect(() => {
    if (socketStats) setStats(socketStats);
  }, [socketStats]);

  // Real-time new reports from socket
  useEffect(() => {
    if (alerts.length > 0 && alerts[0].report) {
      setReports(prev => {
        const exists = prev.find(r => r._id === alerts[0].report._id);
        if (exists) return prev;
        return [alerts[0].report, ...prev];
      });
      
      const timeDiff = new Date() - new Date(alerts[0].timestamp);
      if (timeDiff < 5000) {
        setToast("🚨 New Scam Report Received");
        setTimeout(() => setToast(null), 4000);
      }
    }
  }, [alerts]);

  // Report actions
  const handleVerify = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'verify' }));
    try {
      const res = await axios.put(`${API}/reports/${id}/verify`, {
        adminNote: 'Verified as a confirmed scam threat by CyberShield admin.',
      });
      setReports(prev => prev.map(r => r._id === id ? res.data : r));
      await fetchAll();
    } catch (e) {
      console.error('[Admin] Verify failed:', e.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleMarkSafe = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'safe' }));
    try {
      const res = await axios.put(`${API}/reports/${id}/safe`, {
        adminNote: 'Reviewed and confirmed safe by CyberShield admin.',
      });
      setReports(prev => prev.map(r => r._id === id ? res.data : r));
      await fetchAll();
    } catch (e) {
      console.error('[Admin] Mark safe failed:', e.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report? This action cannot be undone.')) return;
    setActionLoading(prev => ({ ...prev, [id]: 'delete' }));
    try {
      await axios.delete(`${API}/reports/${id}`);
      setReports(prev => prev.filter(r => r._id !== id));
      await fetchAll();
    } catch (e) {
      console.error('[Admin] Delete failed:', e.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;
    setBroadcasting(true);
    try {
      await axios.post(`${API}/admin/broadcast`, {
        title: broadcastTitle,
        message: broadcastMsg,
        type: broadcastType,
      });
      setBroadcastSuccess(true);
      setBroadcastCount(prev => prev + 1);
      setBroadcastTitle('');
      setBroadcastMsg('');
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch (e) {
      console.error('[Admin] Broadcast failed:', e.message);
    } finally {
      setBroadcasting(false);
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: Database, count: stats.totalReports },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users, count: stats.totalUsers },
    { id: 'logs', label: 'Blockchain Logs', icon: Activity, count: threatLogs.length },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-6 mt-16 ml-0 md:ml-64 min-h-[calc(100vh-4rem)] pb-16">
        <div className="h-8 bg-white/5 rounded-full w-64 mb-6 animate-pulse" />
        <LoadingSkeleton type="cards" count={4} />
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="h-12 glass-panel rounded-xl animate-pulse" />
            <LoadingSkeleton type="rows" count={5} />
          </div>
          <div className="space-y-4">
            <div className="h-64 glass-panel rounded-xl animate-pulse" />
            <div className="h-48 glass-panel rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 mt-16 ml-0 md:ml-64 min-h-[calc(100vh-4rem)] pb-16">
      
      {/* Real-time Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[100] bg-cyber-accent/20 border border-cyber-accent/50 text-white px-6 py-3 rounded-full shadow-lg shadow-cyber-accent/20 backdrop-blur-md flex items-center gap-3 font-bold"
          >
            <AlertTriangle className="w-5 h-5 text-cyber-accent" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <PageHeader
        title="ADMIN CONTROL CENTER"
        subtitle={`${onlineCount} users online · Logged in as ${user?.name}`}
        icon={Shield}
        iconColor="text-cyber-accent"
        glowColor="danger"
        backTo="/home"
        right={
          <Button onClick={fetchAll} variant="ghost" className="text-xs gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        }
      />

      {/* Admin Quick Nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { to: '/home', icon: Home, label: 'Dashboard' },
          { to: '/scam-detection', icon: Search, label: 'Scam Scanner' },
          { to: '/report', icon: FileText, label: 'Report Fraud' },
          { to: '/alerts', icon: Bell, label: 'Live Alerts' },
          { to: '/learning', icon: BookOpen, label: 'Academy' },
          { to: '/profile', icon: UserIcon, label: 'Profile' },
        ].map(({ to, icon: Icon, label }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel border border-white/10 text-cyber-muted hover:text-cyber-primary hover:border-cyber-primary/40 hover:bg-cyber-primary/5 transition-all text-xs font-mono"
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyber-primary/20 text-cyber-primary'
                    : 'text-cyber-muted hover:text-cyber-text'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    activeTab === tab.id ? 'bg-cyber-primary/30' : 'bg-white/10'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid (8 Cards) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="primary" delay={0.05} />
                <StatCard title="Total Reports" value={stats.totalReports} icon={Database} color="primary" delay={0.1} />
                <StatCard title="Pending Review" value={stats.pendingReports} icon={Eye} color="warning" delay={0.15} pulse={stats.pendingReports > 0} />
                <StatCard title="Verified Scams" value={stats.verifiedReports} icon={AlertTriangle} color="danger" delay={0.2} />
                <StatCard title="Rejected Reports" value={stats.safeReports} icon={ShieldCheck} color="success" delay={0.25} />
                <StatCard title="Active Alerts" value={stats.scamAlerts || stats.activeThreats} icon={Zap} color="warning" delay={0.3} pulse={stats.scamAlerts > 0} />
                <StatCard title="Broadcasts Sent" value={broadcastCount} icon={Radio} color="primary" delay={0.35} />
                <StatCard title="High Risk" value={stats.highRiskReports} icon={ShieldAlert} color="danger" delay={0.4} pulse={stats.highRiskReports > 0} />
              </div>

              {/* Quick Actions */}
              <div className="glass-panel rounded-xl p-5 border border-cyber-primary/20">
                <h3 className="text-sm font-bold text-cyber-primary mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  QUICK ACTIONS
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button onClick={() => setActiveTab('reports')} className="p-3 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyber-primary/40 hover:bg-cyber-primary/10 transition-all text-cyber-text text-sm font-medium">
                    <Database className="w-5 h-5 text-cyber-primary" />
                    View Reports
                  </button>
                  <button onClick={() => setActiveTab('reports')} className="p-3 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 hover:border-yellow-400/40 hover:bg-yellow-400/10 transition-all text-cyber-text text-sm font-medium">
                    <CheckSquare className="w-5 h-5 text-yellow-400" />
                    Verify Pending
                  </button>
                  <button onClick={() => document.getElementById('broadcast-title')?.focus()} className="p-3 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyber-accent/40 hover:bg-cyber-accent/10 transition-all text-cyber-text text-sm font-medium">
                    <Radio className="w-5 h-5 text-cyber-accent" />
                    Broadcast Alert
                  </button>
                  <button onClick={() => setActiveTab('users')} className="p-3 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyber-secondary/40 hover:bg-cyber-secondary/10 transition-all text-cyber-text text-sm font-medium">
                    <Users className="w-5 h-5 text-cyber-secondary" />
                    Manage Users
                  </button>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel rounded-xl p-5 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-cyber-primary" />
                    Reports by Month
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={REPORTS_BY_MONTH}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0a1224', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8 }} labelStyle={{ color: '#00f0ff' }} />
                      <Line type="monotone" dataKey="reports" stroke="#00f0ff" strokeWidth={3} dot={{ r: 4, fill: '#0a1224', stroke: '#00f0ff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-panel rounded-xl p-5 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyber-secondary" />
                    Report Status
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Verified', value: stats.verifiedReports },
                          { name: 'Pending', value: stats.pendingReports },
                          { name: 'Rejected', value: stats.safeReports },
                        ].filter(d => d.value > 0).length > 0 ? [
                          { name: 'Verified', value: stats.verifiedReports },
                          { name: 'Pending', value: stats.pendingReports },
                          { name: 'Rejected', value: stats.safeReports },
                        ].filter(d => d.value > 0) : [{ name: 'No Data', value: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {
                          [
                            { name: 'Verified', value: stats.verifiedReports },
                            { name: 'Pending', value: stats.pendingReports },
                            { name: 'Rejected', value: stats.safeReports },
                          ].filter(d => d.value > 0).length > 0 
                          ? [
                              { name: 'Verified', value: stats.verifiedReports },
                              { name: 'Pending', value: stats.pendingReports },
                              { name: 'Rejected', value: stats.safeReports },
                            ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={
                              entry.name === 'Verified' ? '#ff003c' : 
                              entry.name === 'Pending' ? '#facc15' : 
                              entry.name === 'Rejected' ? '#4ade80' : '#334155'
                            } />
                          )) : <Cell fill="#334155" />
                        }
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0a1224', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-cyber-muted"><div className="w-2 h-2 rounded-full bg-cyber-accent"></div>Verified</div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-cyber-muted"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>Pending</div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-cyber-muted"><div className="w-2 h-2 rounded-full bg-green-400"></div>Rejected</div>
                  </div>
                </div>
              </div>

              {/* Live Activity Feed */}
              <div className="glass-panel rounded-xl p-5 border border-cyber-primary/20">
                <h3 className="text-sm font-bold text-cyber-primary mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  LIVE ACTIVITY FEED
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {!activities || activities.length === 0 ? (
                    <p className="text-cyber-muted text-xs font-mono text-center py-4">No recent activity</p>
                  ) : (
                    activities.map((act) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        key={act.id} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 text-sm"
                      >
                        {act.type === 'REPORT_SUBMITTED' && <FileText className="w-4 h-4 text-yellow-400 mt-0.5" />}
                        {act.type === 'REPORT_VERIFIED' && <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />}
                        {act.type === 'REPORT_REJECTED' && <ShieldCheck className="w-4 h-4 text-green-400 mt-0.5" />}
                        {act.type === 'USER_REGISTERED' && <UserIcon className="w-4 h-4 text-blue-400 mt-0.5" />}
                        {act.type === 'BROADCAST_SENT' && <Radio className="w-4 h-4 text-cyber-accent mt-0.5" />}
                        {(!['REPORT_SUBMITTED','REPORT_VERIFIED','REPORT_REJECTED','USER_REGISTERED','BROADCAST_SENT'].includes(act.type)) && <Activity className="w-4 h-4 text-cyber-muted mt-0.5" />}
                        
                        <div className="flex-1">
                          <p className="text-gray-200">{act.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-cyber-muted font-mono">{new Date(act.timestamp).toLocaleTimeString()}</span>
                            <span className="text-[10px] text-cyber-primary/70 font-mono flex items-center gap-1">
                              <UserIcon className="w-3 h-3" /> {act.actorName}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="glass-panel rounded-xl p-12 flex flex-col items-center text-cyber-muted">
                  <Database className="w-10 h-10 mb-3 opacity-30" />
                  <p className="font-mono text-sm">No reports submitted yet</p>
                  <p className="font-mono text-xs mt-1 opacity-60">Reports will appear here in real-time</p>
                </div>
              ) : (
                reports.map((report, i) => (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-panel rounded-xl p-4 border border-white/5 hover:border-cyber-primary/20 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold text-white text-sm">{report.scamType}</span>
                          <span className={`text-xs font-mono ${RISK_COLORS[report.riskLevel]}`}>
                            [{report.riskLevel} RISK]
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded border font-mono ${STATUS_COLORS[report.status]}`}>
                            {report.status}
                          </span>
                          {report.aiRiskScore > 0 && (
                            <span className="text-xs text-cyber-secondary font-mono">
                              AI: {report.aiRiskScore}%
                            </span>
                          )}
                        </div>
                        <p className="text-cyber-text/70 text-sm line-clamp-2">{report.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-cyber-muted font-mono">
                          <span>By: {report.reporterName || report.userId?.name || 'Anonymous'}</span>
                          <span>{new Date(report.createdAt).toLocaleString()}</span>
                          {report.reportHash && (
                            <span className="text-cyber-primary/50">
                              #{report.reportHash.substring(0, 8)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {report.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleVerify(report._id)}
                              disabled={!!actionLoading[report._id]}
                              className="p-2 rounded-lg bg-cyber-accent/10 text-cyber-accent hover:bg-cyber-accent/20 transition-colors disabled:opacity-50"
                              title="Mark as Scam"
                            >
                              {actionLoading[report._id] === 'verify'
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <ShieldAlert className="w-4 h-4" />
                              }
                            </button>
                            <button
                              onClick={() => handleMarkSafe(report._id)}
                              disabled={!!actionLoading[report._id]}
                              className="p-2 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors disabled:opacity-50"
                              title="Mark as Safe"
                            >
                              {actionLoading[report._id] === 'safe'
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <ShieldCheck className="w-4 h-4" />
                              }
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(report._id)}
                          disabled={!!actionLoading[report._id]}
                          className="p-2 rounded-lg bg-white/5 text-cyber-muted hover:bg-cyber-accent/10 hover:text-cyber-accent transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {actionLoading[report._id] === 'delete'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Reports by type */}
              <div className="glass-panel rounded-xl p-5 border border-cyber-primary/20">
                <h3 className="text-sm font-bold text-cyber-primary mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Reports by Scam Type
                </h3>
                {analytics.byType.length === 0 ? (
                  <p className="text-cyber-muted text-sm font-mono text-center py-8">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.byType.map(d => ({ name: d._id, count: d.count }))}>
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ background: '#0a1224', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8 }}
                        labelStyle={{ color: '#00f0ff' }}
                        itemStyle={{ color: '#e0e7ff' }}
                      />
                      <Bar dataKey="count" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Risk level pie */}
              <div className="glass-panel rounded-xl p-5 border border-cyber-secondary/20">
                <h3 className="text-sm font-bold text-cyber-secondary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Risk Level Distribution
                </h3>
                {analytics.byRisk.length === 0 ? (
                  <p className="text-cyber-muted text-sm font-mono text-center py-8">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics.byRisk.map(d => ({ name: d._id, value: d.count }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {analytics.byRisk.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0a1224', border: '1px solid rgba(112,0,255,0.2)', borderRadius: 8 }}
                        labelStyle={{ color: '#7000ff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              {users.length === 0 ? (
                <div className="glass-panel rounded-xl p-12 flex flex-col items-center text-cyber-muted">
                  <Users className="w-10 h-10 mb-3 opacity-30" />
                  <p className="font-mono text-sm">No registered users yet</p>
                </div>
              ) : (
                users.map((u, i) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-panel rounded-xl p-4 flex items-center justify-between border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyber-primary/10 border border-cyber-primary/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-cyber-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{u.name}</p>
                        <p className="text-cyber-muted text-xs font-mono">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-cyber-muted">
                        {u.reportsSubmitted || 0} reports
                      </span>
                      <span className={`px-2 py-0.5 rounded ${u.isActive ? 'text-green-400 bg-green-400/10' : 'text-cyber-muted bg-white/5'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Blockchain Logs Tab */}
          {activeTab === 'logs' && (
            <BlockchainLog logs={threatLogs} maxHeight="500px" />
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Emergency Broadcast */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-xl p-5 border border-cyber-accent/20"
          >
            <h3 className="text-sm font-bold text-cyber-accent mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 animate-pulse" />
              EMERGENCY BROADCAST
            </h3>

            <AnimatePresence>
              {broadcastSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 bg-green-400/10 border border-green-400/30 text-green-400 p-3 rounded-lg flex items-center gap-2 text-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  Broadcast sent to all users
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleBroadcast} className="space-y-3">
              <input
                id="broadcast-title"
                type="text"
                placeholder="Alert title..."
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                className="w-full bg-black/50 border border-cyber-accent/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyber-accent transition-all"
                required
              />
              <textarea
                placeholder="Broadcast message to all users..."
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                rows={3}
                className="w-full bg-black/50 border border-cyber-accent/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyber-accent resize-none transition-all font-mono"
                required
              />
              <select
                value={broadcastType}
                onChange={e => setBroadcastType(e.target.value)}
                className="w-full bg-black/50 border border-cyber-accent/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none appearance-none"
              >
                <option value="warning">⚠️ Warning</option>
                <option value="danger">🚨 Danger</option>
                <option value="emergency">🔴 Emergency</option>
                <option value="info">ℹ️ Info</option>
                <option value="safe">✅ Safe</option>
              </select>
              <Button
                type="submit"
                variant="danger"
                className="w-full py-2.5 font-bold tracking-wider text-sm"
                disabled={broadcasting}
              >
                {broadcasting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    BROADCASTING...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    SEND BROADCAST
                  </span>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-xl p-5 border border-cyber-primary/20"
          >
            <h3 className="text-sm font-bold text-cyber-primary mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              SYSTEM STATUS
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Safe Reports', value: stats.safeReports, color: 'text-green-400' },
                { label: 'Active Threats', value: stats.activeThreats, color: 'text-cyber-accent' },
                { label: 'Scam Alerts', value: stats.scamAlerts, color: 'text-yellow-400' },
                { label: 'Total Users', value: stats.totalUsers, color: 'text-cyber-primary' },
                { label: 'Connected Admins', value: onlineStats?.admins || 0, color: 'text-cyber-accent' },
                { label: 'Connected Users', value: onlineStats?.users || 0, color: 'text-green-400' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-cyber-muted text-xs">{item.label}</span>
                  <span className={`font-bold font-mono text-sm ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent blockchain logs preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BlockchainLog
              logs={threatLogs.slice(0, 5)}
              maxHeight="250px"
              title="RECENT ACTIVITY"
            />
          </motion.div>

          {/* Recent Alerts Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel rounded-xl p-5 border border-white/10"
          >
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              RECENT ALERTS
            </h3>
            <div className="space-y-3">
              {!notifications || notifications.length === 0 ? (
                <p className="text-cyber-muted text-xs font-mono text-center py-4">No recent alerts</p>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs">
                    <p className="font-bold text-white mb-1 flex items-center gap-1">
                      {notif.type === 'danger' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                      {notif.title}
                    </p>
                    <p className="text-cyber-muted line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-cyber-primary/50 font-mono mt-2">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
