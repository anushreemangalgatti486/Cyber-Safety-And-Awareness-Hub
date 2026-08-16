import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Brain, ShieldAlert, ShieldCheck, AlertTriangle, Trash2, Search,
  Activity, Tag, List, Clock, ShieldQuestion, ArrowRight, Zap, Target
} from 'lucide-react';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

const API = 'http://localhost:5000/api/ai';

export default function AiScamAnalyzer() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Small artificial delay for visual effect
      await new Promise(r => setTimeout(r, 1200));
      const res = await axios.post(`${API}/analyze`, { text });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError('');
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return 'text-red-500 border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      case 'High': return 'text-orange-500 border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.5)]';
      case 'Medium': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.5)]';
      case 'Low': return 'text-green-400 border-green-400 bg-green-400/10 shadow-[0_0_15px_rgba(74,222,128,0.5)]';
      default: return 'text-cyber-primary border-cyber-primary bg-cyber-primary/10 shadow-[0_0_15px_rgba(0,240,255,0.5)]';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'Critical': return <ShieldAlert className="w-10 h-10 text-red-500" />;
      case 'High': return <AlertTriangle className="w-10 h-10 text-orange-500" />;
      case 'Medium': return <ShieldQuestion className="w-10 h-10 text-yellow-400" />;
      case 'Low': return <ShieldCheck className="w-10 h-10 text-green-400" />;
      default: return <Brain className="w-10 h-10 text-cyber-primary" />;
    }
  };

  return (
    <div className="p-4 md:p-8 mt-16 ml-0 md:ml-64 min-h-[calc(100vh-4rem)] flex flex-col items-center pb-16">
      <PageHeader
        title="AI SCAM ANALYZER"
        subtitle="Advanced cognitive threat detection engine"
        icon={Brain}
        iconColor="text-purple-400"
        glowColor="primary"
        backTo="/home"
      />

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl glass-panel rounded-2xl border border-purple-500/30 p-6 relative overflow-hidden mt-6"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Brain className="w-32 h-32 text-purple-400" />
        </div>
        
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          INPUT SUSPICIOUS TEXT
        </h3>
        
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste suspicious SMS, email, or message content here for deep analysis..."
            className="w-full h-48 bg-black/60 border border-purple-500/30 rounded-xl p-4 text-cyber-text focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none font-mono text-sm leading-relaxed transition-all"
            disabled={loading}
          />
          <div className="absolute bottom-3 right-3 text-xs font-mono text-cyber-muted">
            {text.length} chars
          </div>
        </div>

        {error && (
          <div className="mt-3 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="flex-1 bg-purple-600/20 text-purple-400 border-purple-500/50 hover:bg-purple-600/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 animate-pulse" />
                ANALYZING NEURAL PATTERNS...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 font-bold tracking-widest">
                <Search className="w-4 h-4" />
                ANALYZE MESSAGE
              </span>
            )}
          </Button>
          <Button
            onClick={handleClear}
            disabled={loading || (!text && !result)}
            className="sm:w-32 bg-transparent text-cyber-muted border-white/10 hover:text-white hover:bg-white/5"
          >
            <span className="flex items-center justify-center gap-2 font-bold tracking-widest">
              <Trash2 className="w-4 h-4" />
              CLEAR
            </span>
          </Button>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-4xl mt-8"
          >
            <div className={`glass-panel rounded-2xl border-2 p-6 md:p-8 ${getRiskColor(result.riskLevel)}`}>
              
              <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  {getRiskIcon(result.riskLevel)}
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-widest leading-none">
                      {result.riskLevel} RISK
                    </h2>
                    <p className="text-sm font-mono opacity-80 mt-1">
                      Scam Category: <strong className="text-white bg-black/30 px-2 py-0.5 rounded">{result.category}</strong>
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-4xl font-black">{result.riskScore}<span className="text-lg opacity-50">/100</span></div>
                  <div className="text-[10px] font-mono opacity-70 uppercase tracking-widest">Risk Score</div>
                </div>
              </div>

              {/* Risk Meter Visual */}
              <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden mb-8 border border-white/5 relative">
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/20 z-10"></div>
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/20 z-10"></div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.riskScore}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-current opacity-80 shadow-[0_0_10px_currentColor]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Detected Threats */}
                <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                  <h4 className="text-xs font-bold text-cyber-muted uppercase mb-4 flex items-center gap-2 tracking-widest">
                    <Target className="w-4 h-4 text-cyber-primary" />
                    Detected Threats
                  </h4>
                  {result.detectedThreats.length > 0 ? (
                    <ul className="space-y-2">
                      {result.detectedThreats.map((threat, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <ArrowRight className="w-4 h-4 text-cyber-accent shrink-0 mt-0.5" />
                          {threat}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-cyber-muted font-mono italic">No specific threats detected.</p>
                  )}
                </div>

                {/* Suspicious Keywords */}
                <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                  <h4 className="text-xs font-bold text-cyber-muted uppercase mb-4 flex items-center gap-2 tracking-widest">
                    <Tag className="w-4 h-4 text-cyber-primary" />
                    Suspicious Keywords
                  </h4>
                  {result.suspiciousKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.suspiciousKeywords.map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono text-white">
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-cyber-muted font-mono italic">No suspicious keywords matched.</p>
                  )}
                </div>

                {/* Recommendations */}
                <div className="bg-black/40 rounded-xl p-5 border border-white/10 md:col-span-2">
                  <h4 className="text-xs font-bold text-cyber-muted uppercase mb-4 flex items-center gap-2 tracking-widest">
                    <List className="w-4 h-4 text-cyber-primary" />
                    Safety Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 bg-cyber-primary/5 p-3 rounded-lg border border-cyber-primary/10">
                        <ShieldCheck className="w-5 h-5 text-cyber-primary shrink-0" />
                        <span className="text-sm text-gray-200">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-cyber-muted border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Analysis Time: {result.analysisTime}
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Confidence Score: <span className="text-cyber-primary">{result.confidence}</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
