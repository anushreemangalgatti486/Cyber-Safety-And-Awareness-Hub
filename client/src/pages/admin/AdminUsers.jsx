import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, RefreshCw, ShieldOff, FileText, Zap } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/users`);
      setUsers(res.data);
    } catch (e) {
      console.error('[AdminUsers]', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    ));
  }, [users, search]);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user account?')) return;
    setActionLoading(p => ({ ...p, [id]: true }));
    try {
      await axios.put(`${API}/admin/users/${id}/deactivate`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: false } : u));
    } catch (e) { console.error(e.message); }
    finally { setActionLoading(p => ({ ...p, [id]: false })); }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-cyber-primary" /> USER MANAGEMENT
          </h1>
          <p className="text-cyber-muted text-xs font-mono mt-1">{filtered.length} registered users</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel border border-white/10 text-cyber-muted hover:text-cyber-primary transition-all text-xs font-mono">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
        <input type="text" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyber-primary transition-all" />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users',  value: users.length,                              color: 'text-cyber-primary' },
          { label: 'Active',       value: users.filter(u => u.isActive).length,      color: 'text-green-400'    },
          { label: 'Inactive',     value: users.filter(u => !u.isActive).length,     color: 'text-cyber-muted'  },
        ].map(s => (
          <div key={s.label} className="glass-panel rounded-xl p-4 text-center border border-white/5">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-cyber-muted text-xs uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 glass-panel rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-xl p-16 flex flex-col items-center text-cyber-muted">
          <Users className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-mono text-sm">No users found</p>
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-black/30 border-b border-white/5 text-xs font-bold text-cyber-muted uppercase tracking-wider">
            <div className="col-span-4">User</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2 text-center">Reports</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {filtered.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-white/3 transition-colors"
              >
                {/* Name + avatar */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyber-primary/10 border border-cyber-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyber-primary text-xs font-bold">
                      {u.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.name}</p>
                    <p className="text-cyber-muted text-[10px] font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="col-span-3">
                  <p className="text-cyber-text/70 text-xs font-mono truncate">{u.email}</p>
                </div>

                {/* Reports count */}
                <div className="col-span-2 text-center">
                  <span className="text-cyber-primary font-mono text-sm font-bold">
                    {u.reportsSubmitted || 0}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                    u.isActive ? 'text-green-400 bg-green-400/10' : 'text-cyber-muted bg-white/5'
                  }`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Action */}
                <div className="col-span-1 flex justify-center">
                  {u.isActive && (
                    <button
                      onClick={() => handleDeactivate(u._id)}
                      disabled={actionLoading[u._id]}
                      title="Deactivate user"
                      className="p-1.5 rounded-lg text-cyber-muted hover:text-cyber-accent hover:bg-cyber-accent/10 transition-all disabled:opacity-50"
                    >
                      <ShieldOff className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
