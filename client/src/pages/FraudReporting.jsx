import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, CheckCircle, ShieldAlert, AlertTriangle,
  Loader2, Database, Link, Phone, FileText
} from 'lucide-react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const SCAM_TYPES = [
  'SMS Scam',
  'WhatsApp Scam',
  'Fraud Call',
  'Email Phishing',
  'Scam URL',
  'Phishing',
  'Ransomware',
  'Identity Theft',
  'Social Engineering',
  'Other',
];

/**
 * FraudReporting - Report scam/fraud incidents
 * Saves to MongoDB, emits Socket.io event, updates admin dashboard
 */
export default function FraudReporting() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [formData, setFormData] = useState({
    scamType: '',
    description: '',
    riskLevel: 'Low',
    scamUrl: '',
    phoneNumber: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submittedReport, setSubmittedReport] = useState(null);

  const handleChange = (field) => (e) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (file) data.append('screenshot', file);

    try {
      const res = await axios.post(`${API}/reports`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmittedReport(res.data);
      setSuccess(true);
      setFormData({ scamType: '', description: '', riskLevel: 'Low', scamUrl: '', phoneNumber: '' });
      setFile(null);

      setTimeout(() => {
        setSuccess(false);
        setSubmittedReport(null);
      }, 6000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const riskColors = {
    Low: 'border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)] text-green-400',
    Medium: 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)] text-yellow-400',
    High: 'border-cyber-accent shadow-[0_0_10px_rgba(255,0,60,0.3)] text-cyber-accent',
  };

  return (
    <div className="p-4 md:p-8 mt-16 ml-0 md:ml-64 min-h-[calc(100vh-4rem)] flex items-start justify-center pb-16">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-secondary via-transparent to-transparent" />

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 glass-panel border border-cyber-primary p-6 rounded-2xl flex flex-col items-center gap-3 shadow-[0_0_40px_rgba(0,240,255,0.5)] bg-cyber-panel/95 w-11/12 max-w-md text-center"
          >
            <div className="bg-cyber-primary/20 p-4 rounded-full">
              <Database className="text-cyber-primary w-10 h-10 animate-pulse" />
            </div>
            <span className="text-white font-black tracking-widest text-lg text-glow-primary">
              THREAT LOGGED
            </span>
            <span className="text-cyber-primary text-sm font-mono">
              Immutably recorded in the global ledger
            </span>
            {submittedReport && (
              <div className="w-full bg-black/40 rounded-lg p-3 text-left">
                <p className="text-cyber-muted text-xs font-mono">Block Hash:</p>
                <p className="text-cyber-primary text-xs font-mono truncate">
                  {submittedReport.reportHash}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <PageHeader
          title="REPORT THREAT"
          subtitle="Submit fraudulent activity to the global immutable ledger"
          icon={ShieldAlert}
          iconColor="text-cyber-secondary"
          glowColor="secondary"
          backTo="/home"
        />

        <div className={`glass-panel rounded-2xl border transition-all duration-500 p-6 md:p-8 ${
          loading
            ? 'border-cyber-secondary/60 shadow-[0_0_30px_rgba(112,0,255,0.3)]'
            : 'border-cyber-secondary/20'
        }`}>
          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-cyber-accent/10 border border-cyber-accent text-cyber-accent p-4 rounded-xl flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
                <span className="text-sm font-mono">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Scam Type + Risk Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-cyber-secondary mb-2 uppercase tracking-wider">
                  Scam Category *
                </label>
                <select
                  className="w-full bg-black/50 border border-cyber-secondary/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyber-secondary focus:ring-1 focus:ring-cyber-secondary transition-all appearance-none disabled:opacity-50"
                  value={formData.scamType}
                  onChange={handleChange('scamType')}
                  required
                  disabled={loading || success}
                >
                  <option value="" className="bg-cyber-panel">Select category</option>
                  {SCAM_TYPES.map(t => (
                    <option key={t} value={t} className="bg-cyber-panel">{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyber-secondary mb-2 uppercase tracking-wider">
                  Severity Level *
                </label>
                <select
                  className={`w-full bg-black/50 border rounded-lg px-4 py-3 focus:outline-none transition-all appearance-none disabled:opacity-50 ${riskColors[formData.riskLevel]}`}
                  value={formData.riskLevel}
                  onChange={handleChange('riskLevel')}
                  disabled={loading || success}
                >
                  <option value="Low" className="bg-cyber-panel text-white">Low Risk</option>
                  <option value="Medium" className="bg-cyber-panel text-white">Medium Risk</option>
                  <option value="High" className="bg-cyber-panel text-white">High Risk</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-cyber-secondary mb-2 uppercase tracking-wider">
                Incident Description *
              </label>
              <textarea
                required
                rows={4}
                className="w-full bg-black/50 border border-cyber-secondary/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyber-secondary focus:ring-1 focus:ring-cyber-secondary resize-none transition-all font-mono text-sm disabled:opacity-50"
                placeholder="Describe the scam in detail — what happened, what was requested, any suspicious links or numbers..."
                value={formData.description}
                onChange={handleChange('description')}
                disabled={loading || success}
              />
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-cyber-secondary mb-2 uppercase tracking-wider">
                  Scam URL (optional)
                </label>
                <Input
                  icon={Link}
                  type="url"
                  placeholder="https://suspicious-site.com"
                  value={formData.scamUrl}
                  onChange={handleChange('scamUrl')}
                  disabled={loading || success}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-cyber-secondary mb-2 uppercase tracking-wider">
                  Phone Number (optional)
                </label>
                <Input
                  icon={Phone}
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="block text-xs font-bold text-cyber-secondary mb-2 uppercase tracking-wider">
                Screenshot Evidence (optional)
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                file
                  ? 'border-cyber-primary bg-cyber-primary/5'
                  : 'border-cyber-secondary/30 hover:border-cyber-secondary/60 bg-black/30'
              } ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Scan line */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-secondary/10 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 pointer-events-none" />
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept="image/*"
                  disabled={loading || success}
                />
                <UploadCloud className={`w-8 h-8 mb-3 transition-colors ${file ? 'text-cyber-primary' : 'text-cyber-secondary/40 group-hover:text-cyber-secondary'}`} />
                <p className="text-sm text-center font-mono z-10">
                  {file
                    ? <span className="text-cyber-primary font-bold">{file.name}</span>
                    : <span className="text-cyber-muted">Drop image or click to upload</span>
                  }
                </p>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="secondary"
              className={`w-full py-3.5 font-black tracking-widest text-sm ${loading ? 'animate-pulse' : 'hover:scale-[1.01]'}`}
              disabled={loading || success}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ENCRYPTING & SUBMITTING...
                </span>
              ) : success ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  REPORT SUBMITTED
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  SUBMIT REPORT
                </span>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
