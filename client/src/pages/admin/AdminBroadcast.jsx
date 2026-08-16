import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Send, CheckCircle, Loader2, AlertTriangle, Zap, Shield, Info } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const API = 'http://localhost:5000/api';

const BROADCAST_TYPES = [
  { value: 'warning',   label: '⚠️ Warning',   desc: 'General security warning',       color: 'border-yellow-400/40 text-yellow-400'   },
  { value: 'danger',    label: '🚨 Danger',    desc: 'Active threat detected',          color: 'border-cyber-accent/40 text-cyber-accent' },
  { value: 'emergency', label: '🔴 Emergency', desc: 'Critical system-wide alert',      color: 'border-red-500/60 text-red-400'           },
  { value: 'info',      label: 'ℹ️ Info',      desc: 'General information notice',      color: 'border-cyber-primary/40 text-cyber-primary'},
  { value: 'safe',      label: '✅ Safe',      desc: 'Threat resolved / all clear',     color: 'border-green-400/40 text-green-400'       },
];

const QUICK_TEMPLATES = [
  { title: '⚠️ Phishing Alert', message: 'A new phishing campaign has been detected targeting users. Do NOT click suspicious links or share personal information.', type: 'danger' },
  { title: '🔴 System Maintenance', message: 'CyberShield will undergo scheduled maintenance. Some features may be temporarily unavailable.', type: 'info' },
  { title: '✅ Threat Resolved', message: 'The previously reported threat has been neutralized. Your data is safe. Thank you for your vigilance.', type: 'safe' },
  { title: '⚠️ OTP Scam Warning', message: 'Multiple OTP scam reports received. Never share your OTP with anyone — CyberShield will never ask for it.', type: 'warning' },
];

export default function AdminBroadcast() {
  const { onlineCount } = useSocket();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('warning');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    setError('');
    try {
      await axios.post(`${API}/admin/broadcast`, { title, message, type });
      setHistory(prev => [{ title, message, type, sentAt: new Date().toISOString() }, ...prev].slice(0, 10));
      setSuccess(true);
      setTitle('');
      setMessage('');
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setError(e.response?.data?.message || 'Broadcast failed. Try again.');
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setType(tpl.type);
  };

  const selectedType = BROADCAST_TYPES.find(t => t.value === type);

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Radio className="w-6 h-6 text-cyber-accent animate-pulse" /> EMERGENCY BROADCAST
        </h1>
        <p className="text-cyber-muted text-xs font-mono mt-1">
          Send real-time alerts to all {onlineCount} connected users
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass-panel border border-green-400/40 bg-green-400/5 p-4 rounded-xl flex items-center gap-3 text-green-400">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">Broadcast sent successfully!</p>
                  <p className="text-xs opacity-70">All connected users have been notified.</p>
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass-panel border border-cyber-accent/40 bg-cyber-accent/5 p-4 rounded-xl flex items-center gap-3 text-cyber-accent">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alert type selector */}
          <div className="glass-panel rounded-xl p-5 border border-white/5">
            <label className="block text-xs font-bold text-cyber-muted mb-3 uppercase tracking-wider">Alert Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BROADCAST_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                    type === t.value
                      ? `${t.color} bg-white/5`
                      : 'border-white/10 text-cyber-muted hover:border-white/20'
                  }`}>
                  <p className="text-sm font-bold">{t.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Compose */}
          <form onSubmit={handleSend} className="glass-panel rounded-xl p-5 border border-white/5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-cyber-muted mb-2 uppercase tracking-wider">Alert Title *</label>
              <input type="text" placeholder="e.g. ⚠️ CyberShield Warning"
                value={title} onChange={e => setTitle(e.target.value)} required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyber-accent transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-cyber-muted mb-2 uppercase tracking-wider">Message *</label>
              <textarea rows={5} placeholder="Write your broadcast message here..."
                value={message} onChange={e => setMessage(e.target.value)} required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyber-accent resize-none transition-all font-mono" />
              <p className="text-cyber-muted text-[10px] font-mono mt-1 text-right">{message.length} chars</p>
            </div>

            {/* Preview */}
            {(title || message) && (
              <div className={`p-4 rounded-xl border ${selectedType?.color || 'border-white/10'} bg-white/3`}>
                <p className="text-[10px] text-cyber-muted font-mono mb-2 uppercase">Preview</p>
                <p className="font-bold text-white text-sm">{title || '—'}</p>
                <p className="text-cyber-text/70 text-xs mt-1 leading-relaxed">{message || '—'}</p>
              </div>
            )}

            <button type="submit" disabled={sending || !title || !message}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyber-accent/20 border border-cyber-accent/50 text-cyber-accent font-black tracking-widest text-sm hover:bg-cyber-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {sending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> BROADCASTING...</>
                : <><Send className="w-4 h-4" /> SEND TO ALL USERS ({onlineCount} online)</>
              }
            </button>
          </form>
        </div>

        {/* Right: templates + history */}
        <div className="space-y-5">
          {/* Quick templates */}
          <div className="glass-panel rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Quick Templates
            </h3>
            <div className="space-y-2">
              {QUICK_TEMPLATES.map((tpl, i) => (
                <button key={i} onClick={() => applyTemplate(tpl)}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-white/5 hover:border-cyber-primary/30 hover:bg-cyber-primary/5 transition-all">
                  <p className="text-white text-xs font-bold">{tpl.title}</p>
                  <p className="text-cyber-muted text-[10px] mt-0.5 line-clamp-1">{tpl.message}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sent history */}
          {history.length > 0 && (
            <div className="glass-panel rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyber-primary" /> Sent This Session
              </h3>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                    <p className="text-white text-xs font-bold">{h.title}</p>
                    <p className="text-cyber-muted text-[10px] font-mono mt-0.5">
                      {new Date(h.sentAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
