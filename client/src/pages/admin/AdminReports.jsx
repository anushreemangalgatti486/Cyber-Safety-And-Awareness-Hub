import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ShieldAlert, ShieldCheck, Trash2,
  Loader2, Search, Filter, RefreshCw, Eye, Lock, CheckCircle2, AlertOctagon, Copy
} from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const API = 'http://localhost:5000/api';

const STATUS_STYLE = {
  Pending:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Verified: 'text-cyber-accent bg-cyber-accent/10 border-cyber-accent/30',
  Safe:     'text-green-400 bg-green-400/10 border-green-400/30',
  Rejected: 'text-cyber-muted bg-white/5 border-white/10',
};
const RISK_STYLE = {
  Low:    'text-green-400',
  Medium: 'text-yellow-400',
  High:   'text-cyber-accent font-bold',
};

export default function AdminReports() {
  const { alerts } = useSocket();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [integrityResults, setIntegrityResults] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const fetchReports = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/reports`);
      setReports(res.data);
    } catch (e) {
      console.error('[AdminReports]', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Real-time new report
  useEffect(() => {
    if (alerts.length > 0 && alerts[0].report) {
      setReports(prev => {
        if (prev.find(r => r._id === alerts[0].report._id)) return prev;
        return [alerts[0].report, ...prev];
      });
    }
  }, [alerts]);

  // Filter
  useEffect(() => {
    let result = [...reports];
    if (statusFilter !== 'All') result = result.filter(r => r.status === statusFilter);
    if (riskFilter !== 'All') result = result.filter(r => r.riskLevel === riskFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.scamType?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.reporterName?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [reports, statusFilter, riskFilter, search]);

  const handleVerify = async (id) => {
    setActionLoading(p => ({ ...p, [id]: 'verify' }));
    try {
      const res = await axios.put(`${API}/reports/${id}/verify`, { adminNote: 'Verified as confirmed scam.' });
      setReports(prev => prev.map(r => r._id === id ? res.data : r));
    } catch (e) { console.error(e.message); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleSafe = async (id) => {
    setActionLoading(p => ({ ...p, [id]: 'safe' }));
    try {
      const res = await axios.put(`${API}/reports/${id}/safe`, { adminNote: 'Reviewed and confirmed safe.' });
      setReports(prev => prev.map(r => r._id === id ? res.data : r));
    } catch (e) { console.error(e.message); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report permanently?')) return;
    setActionLoading(p => ({ ...p, [id]: 'delete' }));
    try {
      await axios.delete(`${API}/reports/${id}`);
      setReports(prev => prev.filter(r => r._id !== id));
    } catch (e) { console.error(e.message); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleVerifyIntegrity = async (id) => {
    setActionLoading(p => ({ ...p, [id]: 'integrity' }));
    try {
      const res = await axios.post(`${API}/reports/${id}/verify-integrity`, {}, { withCredentials: true });
      setIntegrityResults(prev => ({ ...prev, [id]: res.data }));
    } catch (e) {
      console.error(e.message);
    } finally {
      setActionLoading(p => ({ ...p, [id]: null }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Optionally add a toast here
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-yellow-400" /> SCAM REPORTS
          </h1>
          <p className="text-cyber-muted text-xs font-mono mt-1">{filtered.length} of {reports.length} reports</p>
        </div>
        <button onClick={fetchReports} className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel border border-white/10 text-cyber-muted hover:text-cyber-primary transition-all text-xs font-mono">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyber-primary transition-all"
          />
        </div>
        {/* Status filter */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none appearance-none">
          {['All','Pending','Verified','Safe','Rejected'].map(s => (
            <option key={s} value={s} className="bg-cyber-panel">{s}</option>
          ))}
        </select>
        {/* Risk filter */}
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none appearance-none">
          {['All','Low','Medium','High'].map(r => (
            <option key={r} value={r} className="bg-cyber-panel">{r}</option>
          ))}
        </select>
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 glass-panel rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-xl p-16 flex flex-col items-center text-cyber-muted">
          <FileText className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-mono text-sm">No reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((report, i) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.02 }}
                className="glass-panel rounded-xl p-4 border border-white/5 hover:border-cyber-primary/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-white">{report.scamType}</span>
                      <span className={`text-xs font-mono ${RISK_STYLE[report.riskLevel]}`}>
                        [{report.riskLevel} RISK]
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-mono ${STATUS_STYLE[report.status]}`}>
                        {report.status}
                      </span>
                      {report.aiRiskScore > 0 && (
                        <span className="text-xs text-cyber-secondary font-mono bg-cyber-secondary/10 px-2 py-0.5 rounded">
                          AI Score: {report.aiRiskScore}%
                        </span>
                      )}
                    </div>
                    {/* Description */}
                    <p className="text-cyber-text/70 text-sm line-clamp-2 mb-2">{report.description}</p>
                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-cyber-muted font-mono">
                      <span>👤 {report.reporterName || report.userId?.name || 'Anonymous'}</span>
                      <span>🕐 {new Date(report.createdAt).toLocaleString()}</span>
                      {report.reportHash && (
                        <div className="flex items-center gap-1 text-cyber-primary/60">
                          <Lock className="w-3 h-3" />
                          <span>#{report.reportHash.substring(0, 10)}...</span>
                        </div>
                      )}
                    </div>
                    {/* Admin note */}
                    {report.adminNote && (
                      <p className="mt-2 text-xs text-cyber-muted italic border-l-2 border-cyber-primary/30 pl-2">
                        Note: {report.adminNote}
                      </p>
                    )}

                    {/* Integrity Result View */}
                    {integrityResults[report._id] && (
                      <div className={`mt-3 p-3 rounded-lg border text-xs font-mono ${
                        integrityResults[report._id].integrity === 'Verified'
                          ? 'bg-green-400/10 border-green-400/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-2 mb-2 font-bold">
                          {integrityResults[report._id].integrity === 'Verified' ? (
                            <><CheckCircle2 className="w-4 h-4 text-green-400" /> <span className="text-green-400">INTEGRITY VERIFIED</span></>
                          ) : (
                            <><AlertOctagon className="w-4 h-4 text-red-500" /> <span className="text-red-500">INTEGRITY TAMPERED</span></>
                          )}
                        </div>
                        <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 gap-y-1 text-[10px] items-center">
                          <span className="text-cyber-muted">Stored Hash:</span>
                          <span className="truncate opacity-80">{integrityResults[report._id].storedHash || 'N/A'}</span>
                          {integrityResults[report._id].storedHash && (
                            <button onClick={() => copyToClipboard(integrityResults[report._id].storedHash)} className="hover:text-cyber-primary"><Copy className="w-3 h-3" /></button>
                          )}
                          <span className="text-cyber-muted">Calculated:</span>
                          <span className="truncate opacity-80">{integrityResults[report._id].calculatedHash}</span>
                          <button onClick={() => copyToClipboard(integrityResults[report._id].calculatedHash)} className="hover:text-cyber-primary"><Copy className="w-3 h-3" /></button>
                        </div>
                        <div className="mt-2 text-[10px] text-cyber-muted">Verified at: {new Date(integrityResults[report._id].verifiedAt).toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {/* Integrity Check Button */}
                    <button onClick={() => handleVerifyIntegrity(report._id)} disabled={!!actionLoading[report._id]}
                      title="Verify Integrity"
                      className="p-2 rounded-lg bg-cyber-primary/5 text-cyber-primary hover:bg-cyber-primary/20 border border-cyber-primary/30 transition-all disabled:opacity-50">
                      {actionLoading[report._id] === 'integrity'
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Lock className="w-4 h-4" />}
                    </button>
                    
                    {report.status === 'Pending' && (
                      <>
                        <button onClick={() => handleVerify(report._id)} disabled={!!actionLoading[report._id]}
                          title="Mark as Scam"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyber-accent/10 text-cyber-accent hover:bg-cyber-accent/20 border border-cyber-accent/30 transition-all text-xs font-bold disabled:opacity-50">
                          {actionLoading[report._id] === 'verify'
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <ShieldAlert className="w-3.5 h-3.5" />}
                          SCAM
                        </button>
                        <button onClick={() => handleSafe(report._id)} disabled={!!actionLoading[report._id]}
                          title="Mark as Safe"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20 border border-green-400/30 transition-all text-xs font-bold disabled:opacity-50">
                          {actionLoading[report._id] === 'safe'
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <ShieldCheck className="w-3.5 h-3.5" />}
                          SAFE
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(report._id)} disabled={!!actionLoading[report._id]}
                      title="Delete"
                      className="p-2 rounded-lg bg-white/5 text-cyber-muted hover:bg-cyber-accent/10 hover:text-cyber-accent border border-white/10 transition-all disabled:opacity-50">
                      {actionLoading[report._id] === 'delete'
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
