import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Award, Shield, Zap, FileText, Clock, Star, TrendingUp, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Input from '../components/Input';

const API = 'http://localhost:5000/api';

const ACHIEVEMENTS = [
  { id: 1, label: 'First Report', icon: FileText, desc: 'Submitted your first scam report', color: 'text-cyber-primary', unlocked: true },
  { id: 2, label: 'Threat Hunter', icon: Shield, desc: 'Detected 5+ scam messages', color: 'text-cyber-secondary', unlocked: false },
  { id: 3, label: 'Cyber Guardian', icon: Award, desc: 'Helped verify 10 reports', color: 'text-yellow-400', unlocked: false },
  { id: 4, label: 'Elite Agent', icon: Star, desc: 'Reached top 10% ranking', color: 'text-cyber-accent', unlocked: false },
];

/**
 * Profile - User profile with stats and achievements
 */
export default function Profile() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    reportsSubmitted: 0,
    scamsBlocked: 0,
    cyberScore: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Password Change State
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwdStatus, setPwdStatus] = useState({ loading: false, message: '', error: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwdForm.currentPassword || !pwdForm.newPassword) return;
    setPwdStatus({ loading: true, message: '', error: '' });
    try {
      const res = await axios.post(`${API}/auth/change-password`, pwdForm, { withCredentials: true });
      setPwdStatus({ loading: false, message: res.data.message || 'Password updated.', error: '' });
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwdStatus({ loading: false, message: '', error: err.response?.data?.message || 'Update failed.' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's own reports
        const res = await axios.get(`${API}/reports`);
        const reports = res.data;
        setRecentReports(reports.slice(0, 5));
        setUserStats({
          reportsSubmitted: reports.length,
          scamsBlocked: reports.filter(r => r.status === 'Verified').length,
          cyberScore: reports.length * 10 + reports.filter(r => r.status === 'Verified').length * 25,
        });
      } catch (e) {
        console.error('[Profile] Failed to fetch reports:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusColors = {
    Pending: 'text-yellow-400 bg-yellow-400/10',
    Verified: 'text-cyber-accent bg-cyber-accent/10',
    Safe: 'text-green-400 bg-green-400/10',
    Rejected: 'text-cyber-muted bg-white/5',
  };

  const riskColors = {
    Low: 'text-green-400',
    Medium: 'text-yellow-400',
    High: 'text-cyber-accent',
  };

  return (
    <div className="p-4 md:p-8 mt-16 ml-0 md:ml-64 min-h-[calc(100vh-4rem)] pb-16">
      <PageHeader
        title="AGENT PROFILE"
        subtitle={`${user?.email || ''}`}
        icon={User}
        iconColor="text-cyber-primary"
        glowColor="primary"
        backTo="/home"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 md:p-8 rounded-2xl border border-cyber-primary/20 flex flex-col items-center text-center"
        >
          {/* Avatar */}
          <div className="relative w-28 h-28 mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-cyber-primary/30 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute inset-2 rounded-full border border-cyber-primary/20 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-cyber-primary/10 border border-cyber-primary/40 flex items-center justify-center">
                <User className="w-10 h-10 text-cyber-primary" />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white">{user?.name || 'Agent Unknown'}</h2>
          <p className="text-cyber-primary text-xs font-mono mt-1 tracking-widest uppercase">
            {user?.email || ''}
          </p>

          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-2.5">
              <span className="text-cyber-muted text-xs uppercase font-bold">Role</span>
              <span className={`text-xs font-bold uppercase ${user?.role === 'admin' ? 'text-cyber-accent' : 'text-cyber-secondary'}`}>
                {user?.role || 'User'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-2.5">
              <span className="text-cyber-muted text-xs uppercase font-bold">Agent ID</span>
              <span className="text-cyber-primary text-xs font-mono">
                {user?._id?.substring(0, 8)?.toUpperCase() || '0X88F9A1'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats + Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { label: 'Reports Filed', value: userStats.reportsSubmitted, icon: FileText, color: 'text-cyber-primary' },
              { label: 'Threats Verified', value: userStats.scamsBlocked, icon: Shield, color: 'text-cyber-accent' },
              { label: 'Cyber Score', value: userStats.cyberScore, icon: Zap, color: 'text-cyber-secondary' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="glass-panel p-4 rounded-xl flex flex-col items-center text-center"
              >
                <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                <motion.span
                  key={stat.value}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-black text-white"
                >
                  {stat.value}
                </motion.span>
                <span className="text-xs text-cyber-muted uppercase tracking-wider mt-1">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-5 rounded-xl border border-cyber-secondary/20"
          >
            <h3 className="text-sm font-bold text-glow-secondary mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyber-secondary" />
              ACHIEVEMENTS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                    ach.unlocked
                      ? 'border-cyber-secondary/40 bg-cyber-secondary/5'
                      : 'border-white/5 bg-white/3 opacity-40'
                  }`}
                >
                  <ach.icon className={`w-7 h-7 mb-2 ${ach.unlocked ? ach.color : 'text-cyber-muted'}`} />
                  <span className="text-xs font-bold text-white">{ach.label}</span>
                  <span className="text-[10px] text-cyber-muted mt-1 leading-tight">{ach.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-5 rounded-xl border border-cyber-primary/20"
          >
            <h3 className="text-sm font-bold text-glow-primary mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyber-primary" />
              RECENT REPORTS
            </h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentReports.length === 0 ? (
              <p className="text-cyber-muted text-sm font-mono text-center py-4">
                No reports submitted yet
              </p>
            ) : (
              <div className="space-y-2">
                {recentReports.map((report) => (
                  <div
                    key={report._id}
                    className="flex items-center justify-between bg-white/3 rounded-lg px-4 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-cyber-text/80">{report.scamType}</span>
                      <span className={`text-xs font-mono ${riskColors[report.riskLevel]}`}>
                        {report.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-mono ${statusColors[report.status] || 'text-cyber-muted'}`}>
                        {report.status}
                      </span>
                      <span className="text-cyber-muted text-xs font-mono">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Security / Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-5 rounded-xl border border-cyber-primary/20"
          >
            <h3 className="text-sm font-bold text-glow-primary mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyber-primary" />
              SECURITY & ACCESS
            </h3>
            
            {pwdStatus.message && (
              <div className="mb-4 text-green-400 text-xs font-mono bg-green-500/10 p-2 rounded border border-green-500/30">
                {pwdStatus.message}
              </div>
            )}
            {pwdStatus.error && (
              <div className="mb-4 text-red-400 text-xs font-mono bg-red-500/10 p-2 rounded border border-red-500/30">
                {pwdStatus.error}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={pwdForm.currentPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={pwdForm.newPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                required
              />
              <Button type="submit" variant="outline" disabled={pwdStatus.loading}>
                {pwdStatus.loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </Button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
