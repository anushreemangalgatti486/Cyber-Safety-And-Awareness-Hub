import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, TrendingUp, RefreshCw, PieChart as PieIcon, 
  Download, Map, ShieldAlert, Globe, ScanSearch, Cpu, 
  Users, AlertTriangle, CheckCircle, XCircle, Lock
} from 'lucide-react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
  AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useSocket } from '../../context/SocketContext';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

const API = 'http://localhost:5000/api';
const COLORS = ['#00f0ff', '#7000ff', '#ff003c', '#4ade80', '#facc15', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel border border-cyber-primary/30 px-3 py-2 rounded-lg text-xs font-mono bg-[#0a0f1c]/90">
      <p className="text-cyber-primary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days'); // 'today', '7days', '30days'
  const { alerts, newActivityCount } = useSocket(); // listen to socket for updates

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Determine date ranges
      const end = new Date();
      const start = new Date();
      if (dateRange === 'today') {
        start.setHours(0,0,0,0);
      } else if (dateRange === '7days') {
        start.setDate(end.getDate() - 7);
      } else if (dateRange === '30days') {
        start.setDate(end.getDate() - 30);
      }
      
      const [analyticsRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`, { params: { startDate: start.toISOString(), endDate: end.toISOString() } }),
        axios.get(`${API}/admin/stats`)
      ]);
      
      setAnalytics(analyticsRes.data);
      setStats(statsRes.data);
    } catch (e) {
      console.error('[AdminAnalytics]', e.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Initial fetch and dependency on dateRange
  useEffect(() => { 
    fetchDashboardData(); 
  }, [fetchDashboardData]);

  // Listen to socket for live updates (debounce to avoid hammering the server)
  const debounceRef = useRef(null);
  useEffect(() => {
    if (newActivityCount > 0 || alerts.length > 0) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchDashboardData();
      }, 3000);
    }
    return () => clearTimeout(debounceRef.current);
  }, [newActivityCount, alerts, fetchDashboardData]);

  if (loading && !analytics) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-white/5 rounded-full w-48 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        {[1,2,3].map(i => <div key={i} className="h-64 glass-panel rounded-xl animate-pulse" />)}
      </div>
    );
  }

  const handleExportCSV = () => exportToCSV(analytics, 'cyber_analytics_export');
  const handleExportPDF = () => exportToPDF('dashboard-capture', 'cyber_analytics_report');

  return (
    <div className="p-6 pb-20" id="dashboard-capture">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-cyber-secondary" /> CYBER INTELLIGENCE DASHBOARD
          </h1>
          <p className="text-cyber-muted text-xs font-mono mt-1">Advanced metrics, threat tracking, and real-time analytics</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filters */}
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-[#0a0f1c] text-cyber-muted border border-cyber-primary/20 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyber-primary"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel border border-white/10 text-cyber-muted hover:text-cyber-secondary transition-all text-xs font-mono">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel border border-white/10 text-cyber-muted hover:text-cyber-primary transition-all text-xs font-mono">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={fetchDashboardData} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/20 transition-all text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5" /> REFRESH
          </button>
        </div>
      </motion.div>

      {/* Summary Cards Grid */}
      {stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-cyber-primary" />
          <StatCard title="Total Reports" value={stats.totalReports} icon={AlertTriangle} color="text-cyber-secondary" />
          <StatCard title="Pending" value={stats.pendingReports} icon={RefreshCw} color="text-yellow-400" />
          <StatCard title="Verified Threats" value={stats.verifiedReports} icon={ShieldAlert} color="text-red-500" />
          <StatCard title="Safe / Rejected" value={stats.safeReports + stats.rejectedReports} icon={CheckCircle} color="text-green-400" />
          
          <StatCard title="AI Scans" value={stats.aiScans} icon={Cpu} color="text-[#00f0ff]" bg="bg-[#00f0ff]/5" />
          <StatCard title="Web Rep Scans" value={stats.webRepScans} icon={Globe} color="text-[#7000ff]" bg="bg-[#7000ff]/5" />
          <StatCard title="OCR Scans" value={stats.ocrScans} icon={ScanSearch} color="text-[#facc15]" bg="bg-[#facc15]/5" />
          <StatCard title="TI API Checks" value={stats.tiApiChecks} icon={Map} color="text-[#ff003c]" bg="bg-[#ff003c]/5" />
          <StatCard title="High-Risk" value={stats.highRiskReports} icon={XCircle} color="text-cyber-accent" bg="bg-cyber-accent/5" />
        </motion.div>
      )}

      {!analytics ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Charts Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Reports Trend (Area Chart) */}
            <div className="glass-panel rounded-xl p-5 border border-cyber-primary/20">
              <h3 className="text-sm font-bold text-cyber-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Reports Timeline
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={analytics.dailyReports.map(d => ({ date: d._id, reports: d.count }))}>
                  <defs>
                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="reports" stroke="#00f0ff" fillOpacity={1} fill="url(#colorReports)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Threat Intelligence Hits (Bar Chart) */}
              <div className="glass-panel rounded-xl p-5 border border-[#facc15]/20">
                <h3 className="text-sm font-bold text-[#facc15] mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Threat Intel Hits
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.tiHits}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="virusTotal" name="VirusTotal" fill="#7000ff" stackId="a" />
                    <Bar dataKey="safeBrowsing" name="Safe Browsing" fill="#00f0ff" stackId="a" />
                    <Bar dataKey="abuseIPDB" name="AbuseIPDB" fill="#ff003c" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Detection Accuracy (Line Chart) */}
              <div className="glass-panel rounded-xl p-5 border border-[#4ade80]/20">
                <h3 className="text-sm font-bold text-[#4ade80] mb-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> AI Detection Accuracy (%)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.aiAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="accuracy" stroke="#4ade80" strokeWidth={2} dot={{r:3, fill:'#4ade80'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Geographical Heatmap (Mock Scatter) */}
            <div className="glass-panel rounded-xl p-5 border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-cyber-primary/5 cyber-grid opacity-30 pointer-events-none" />
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                <Map className="w-4 h-4 text-cyber-muted" /> Threat Heatmap (US States)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                  <XAxis type="category" dataKey="id" tick={{ fill: '#64748b', fontSize: 10 }} name="Location" />
                  <YAxis type="number" dataKey="value" tick={{ fill: '#64748b', fontSize: 10 }} name="Incidents" />
                  <ZAxis type="number" dataKey="value" range={[100, 1000]} name="Density" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter name="Reports" data={analytics.geoHeatmap} fill="#ff003c" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            
            {/* Threat Intelligence Dashboard */}
            {analytics.threatIntelligenceBoard && (
              <div className="glass-panel rounded-xl p-5 border border-[#ff003c]/30 shadow-[0_0_15px_rgba(255,0,60,0.1)]">
                <h3 className="text-sm font-bold text-[#ff003c] mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Threat Intel Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded p-3">
                    <p className="text-[10px] text-cyber-muted uppercase tracking-wider mb-1">Average Risk Score</p>
                    <p className="text-2xl font-black text-white">{analytics.threatIntelligenceBoard.averageRiskScore} / 100</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-cyber-muted uppercase tracking-wider mb-2">Most Common Scam Type</p>
                    <span className="px-2 py-1 bg-cyber-primary/20 text-cyber-primary rounded text-xs font-bold border border-cyber-primary/30">
                      {analytics.threatIntelligenceBoard.mostCommonScamType}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] text-cyber-muted uppercase tracking-wider mb-2">Top Keywords Detected</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analytics.threatIntelligenceBoard.mostFrequentKeywords.map(k => (
                        <span key={k} className="px-2 py-0.5 bg-white/5 text-gray-300 rounded text-[10px] border border-white/10">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-cyber-muted uppercase tracking-wider mb-2">Dangerous URLs (Watchlist)</p>
                    <ul className="space-y-1">
                      {analytics.threatIntelligenceBoard.mostDangerousURLs.map(url => (
                        <li key={url} className="text-[10px] font-mono text-[#ff003c] truncate bg-[#ff003c]/10 px-2 py-1 rounded">
                          {url}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain Integrity Card */}
            <div className="glass-panel rounded-xl p-5 border border-green-500/30 bg-green-500/5 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
              <h3 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Blockchain Integrity
              </h3>
              <div className="flex justify-between items-center text-center">
                <div>
                  <p className="text-2xl font-black text-white">{stats?.totalReports || 0}</p>
                  <p className="text-[10px] text-cyber-muted uppercase mt-1">Secured</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-green-400">100%</p>
                  <p className="text-[10px] text-cyber-muted uppercase mt-1">Verified</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-red-500">0</p>
                  <p className="text-[10px] text-cyber-muted uppercase mt-1">Tampered</p>
                </div>
              </div>
            </div>

            {/* Reports by Scam Type (Pie Chart) */}
            <div className="glass-panel rounded-xl p-5 border border-cyber-secondary/20">
              <h3 className="text-sm font-bold text-cyber-secondary mb-4 flex items-center gap-2">
                <PieIcon className="w-4 h-4" /> Scam Categories
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie 
                    data={analytics.byType.map(d => ({ name: d._id, value: d.count }))}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                  >
                    {analytics.byType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ color: '#64748b', fontSize: 10 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* User Registration Trend (Area) */}
            <div className="glass-panel rounded-xl p-5 border border-[#7000ff]/20">
              <h3 className="text-sm font-bold text-[#7000ff] mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> User Registrations
              </h3>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={analytics.userRegistrationTrend.map(d => ({ date: d._id, users: d.count }))}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="users" stroke="#7000ff" fill="#7000ff" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for summary cards
function StatCard({ title, value, icon: Icon, color, bg = 'bg-white/5' }) {
  return (
    <div className={`glass-panel rounded-xl p-4 border border-white/5 flex flex-col justify-between h-full ${bg}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-cyber-muted uppercase tracking-widest">{title}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
