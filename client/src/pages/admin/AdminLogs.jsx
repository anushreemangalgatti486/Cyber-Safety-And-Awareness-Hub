import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw, Search } from 'lucide-react';
import axios from 'axios';
import BlockchainLog from '../../components/BlockchainLog';

const API = 'http://localhost:5000/api';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/threat-logs?limit=200`);
      setLogs(res.data);
    } catch (e) {
      console.error('[AdminLogs]', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    let result = [...logs];
    if (actionFilter !== 'All') result = result.filter(l => l.action === actionFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.description?.toLowerCase().includes(q) ||
        l.actorName?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [logs, search, actionFilter]);

  const uniqueActions = ['All', ...new Set(logs.map(l => l.action))];

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Database className="w-6 h-6 text-green-400" /> BLOCKCHAIN LOGS
          </h1>
          <p className="text-cyber-muted text-xs font-mono mt-1">
            Immutable SHA-256 chained activity ledger · {filtered.length} entries
          </p>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel border border-white/10 text-cyber-muted hover:text-cyber-primary transition-all text-xs font-mono">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </motion.div>

      {/* Info banner */}
      <div className="glass-panel rounded-xl p-4 border border-green-400/20 bg-green-400/5 mb-5">
        <p className="text-green-400 text-xs font-mono leading-relaxed">
          🔒 Each log entry is cryptographically linked to the previous one via SHA-256 hashing.
          This creates an immutable audit trail — entries cannot be modified or deleted without breaking the chain.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <input type="text" placeholder="Search logs..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyber-primary transition-all" />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none appearance-none">
          {uniqueActions.map(a => (
            <option key={a} value={a} className="bg-cyber-panel">{a.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Entries', value: logs.length,                                                    color: 'text-cyber-primary' },
          { label: 'Reports',       value: logs.filter(l => l.action?.includes('REPORT')).length,          color: 'text-yellow-400'    },
          { label: 'Admin Actions', value: logs.filter(l => l.action?.includes('ADMIN') || l.action?.includes('VERIFIED') || l.action?.includes('SAFE')).length, color: 'text-cyber-accent' },
          { label: 'Scams Found',   value: logs.filter(l => l.action === 'SCAM_DETECTED').length,          color: 'text-cyber-secondary'},
        ].map(s => (
          <div key={s.label} className="glass-panel rounded-xl p-4 text-center border border-white/5">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-cyber-muted text-xs uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Log viewer */}
      {loading ? (
        <div className="glass-panel rounded-xl p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <BlockchainLog logs={filtered} maxHeight="600px" title={`BLOCKCHAIN LEDGER · ${filtered.length} ENTRIES`} />
      )}
    </div>
  );
}
