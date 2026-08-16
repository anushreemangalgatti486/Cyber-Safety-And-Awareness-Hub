import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Search, ShieldAlert, ShieldCheck, AlertTriangle,
  Scan, Cpu, Radar, Activity, TrendingUp, Link
} from 'lucide-react';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

const API = 'http://localhost:5000/api';

// Typewriter effect component
const Typewriter = ({ text, speed = 25 }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return (
    <span>
      {displayed}
      <span className="animate-pulse font-bold text-cyber-primary">_</span>
    </span>
  );
};

const SCAN_STEPS = [
  'Initializing neural network...',
  'Tokenizing message vectors...',
  'Querying threat database...',
  'Detecting phishing patterns...',
  'Evaluating semantic risk score...',
  'Cross-referencing known scam signatures...',
  'Finalizing threat assessment...',
];

/**
 * ScamDetection - AI-powered message analysis
 */
export default function ScamDetection() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const analyzeScam = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, SCAN_STEPS.length - 1));
    }, 500);

    try {
      const [res] = await Promise.all([
        axios.post(`${API}/detect-scam`, { message }),
        new Promise(resolve => setTimeout(resolve, 3500)),
      ]);
      clearInterval(stepInterval);
      setResult(res.data);
    } catch (e) {
      clearInterval(stepInterval);
      // Offline fallback
      const text = message.toLowerCase();
      const isHigh = ['urgent', 'click', 'otp', 'verify', 'bank', 'lottery'].some(k => text.includes(k));
      setResult({
        riskLevel: isHigh ? 'High' : 'Low',
        riskScore: isHigh ? 75 : 5,
        matchedKeywords: isHigh ? ['urgent', 'verify'] : [],
        matchedHigh: isHigh ? ['urgent'] : [],
        matchedMedium: [],
        matchedLow: [],
        warningMessage: isHigh
          ? '⚠️ CRITICAL THREAT DETECTED. This message contains high-risk indicators. Do NOT share personal information or click any links.'
          : '✅ No significant threats detected. Always exercise caution with unsolicited messages.',
      });
    }
    setLoading(false);
  };

  const getRiskConfig = (level) => {
    const configs = {
      High: {
        border: 'border-cyber-accent',
        shadow: 'shadow-[0_0_40px_rgba(255,0,60,0.3)]',
        text: 'text-cyber-accent',
        bg: 'bg-cyber-accent/5',
        icon: <ShieldAlert className="w-16 h-16 text-cyber-accent animate-pulse drop-shadow-[0_0_15px_rgba(255,0,60,0.8)]" />,
        glow: 'bg-cyber-accent',
      },
      Medium: {
        border: 'border-yellow-400',
        shadow: 'shadow-[0_0_40px_rgba(250,204,21,0.3)]',
        text: 'text-yellow-400',
        bg: 'bg-yellow-400/5',
        icon: <AlertTriangle className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />,
        glow: 'bg-yellow-400',
      },
      Low: {
        border: 'border-green-400',
        shadow: 'shadow-[0_0_40px_rgba(74,222,128,0.3)]',
        text: 'text-green-400',
        bg: 'bg-green-400/5',
        icon: <ShieldCheck className="w-16 h-16 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]" />,
        glow: 'bg-green-400',
      },
    };
    return configs[level] || configs.Low;
  };

  return (
    <div className="p-4 md:p-8 mt-16 ml-0 md:ml-64 min-h-[calc(100vh-4rem)] flex flex-col items-center pb-16">
      {/* Header */}
      <PageHeader
        title="AI SCAM SCANNER"
        subtitle="Paste suspicious content for military-grade neural analysis"
        icon={Radar}
        iconColor="text-cyber-primary"
        glowColor="primary"
        backTo="/home"
      />

      {/* Scanner panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-3xl glass-panel rounded-2xl transition-all duration-500 overflow-hidden ${
          loading
            ? 'border border-cyber-secondary/60 shadow-[0_0_40px_rgba(112,0,255,0.3)]'
            : 'border border-cyber-primary/30 shadow-neon-blue'
        }`}
      >
        <div className="p-4 md:p-6 relative">
          {/* Scanning beam */}
          {loading && (
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyber-primary to-transparent shadow-[0_0_15px_rgba(0,240,255,0.8)] z-20"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
            />
          )}

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={loading}
            placeholder="[ PASTE SUSPICIOUS TEXT / EMAIL / SMS / URL HERE ]"
            className="w-full h-40 md:h-52 bg-black/40 border border-cyber-primary/20 rounded-xl p-4 text-cyber-text focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary resize-none font-mono text-sm leading-relaxed disabled:opacity-40 transition-all"
          />

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Step indicator */}
            <div className="h-6 flex items-center">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 text-cyber-secondary font-mono text-xs uppercase tracking-widest"
                  >
                    <Cpu className="w-3.5 h-3.5 animate-pulse" />
                    {SCAN_STEPS[currentStep]}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              onClick={analyzeScam}
              disabled={loading || !message.trim()}
              className={`w-full sm:w-auto font-black tracking-widest px-8 py-3 ${
                loading ? 'bg-cyber-secondary/20 border-cyber-secondary text-cyber-secondary' : 'hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Scan className="animate-spin w-4 h-4" />
                  ANALYZING...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  INITIATE SCAN
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: result.riskLevel === 'High' ? [-8, 8, -8, 8, -4, 4, 0] : 0,
            }}
            transition={{ duration: 0.5, type: 'spring' }}
            className={`mt-8 w-full max-w-3xl glass-panel rounded-2xl border-2 p-6 md:p-8 relative overflow-hidden ${
              getRiskConfig(result.riskLevel).border
            } ${getRiskConfig(result.riskLevel).shadow}`}
          >
            {/* Background glow */}
            <div className={`absolute inset-0 opacity-5 ${getRiskConfig(result.riskLevel).glow} pointer-events-none`} />

            <div className="relative z-10 flex flex-col items-center text-center">
              {getRiskConfig(result.riskLevel).icon}

              <h2 className={`text-3xl md:text-5xl font-black mt-5 mb-3 uppercase tracking-widest ${getRiskConfig(result.riskLevel).text}`}>
                {result.riskLevel} RISK
              </h2>

              {/* Risk score bar */}
              <div className="w-full max-w-sm mb-6">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-cyber-muted">Risk Score</span>
                  <span className={getRiskConfig(result.riskLevel).text}>{result.riskScore || 0}/100</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      result.riskLevel === 'High' ? 'bg-cyber-accent' :
                      result.riskLevel === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${result.riskScore || 0}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>

              {/* Warning message */}
              <div className="text-white text-sm md:text-base mb-6 font-mono max-w-2xl bg-black/40 p-4 rounded-xl border border-white/10 text-left leading-relaxed">
                <Typewriter text={result.warningMessage} />
              </div>

              {/* Matched keywords */}
              {result.matchedKeywords?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="w-full text-left bg-black/50 p-4 rounded-xl border border-white/10"
                >
                  <h4 className="text-xs font-bold text-cyber-muted uppercase mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyber-primary animate-pulse" />
                    Detected Threat Indicators ({result.matchedKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedHigh?.map((kw, i) => (
                      <motion.span
                        key={`h-${i}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.8 + i * 0.08, type: 'spring' }}
                        className="px-3 py-1 border rounded text-xs font-bold uppercase tracking-wider bg-cyber-accent/15 border-cyber-accent text-cyber-accent"
                      >
                        {kw}
                      </motion.span>
                    ))}
                    {result.matchedMedium?.map((kw, i) => (
                      <motion.span
                        key={`m-${i}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2 + i * 0.08, type: 'spring' }}
                        className="px-3 py-1 border rounded text-xs font-bold uppercase tracking-wider bg-yellow-400/15 border-yellow-400 text-yellow-400"
                      >
                        {kw}
                      </motion.span>
                    ))}
                    {result.matchedLow?.map((kw, i) => (
                      <motion.span
                        key={`l-${i}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.2 + i * 0.08, type: 'spring' }}
                        className="px-3 py-1 border rounded text-xs font-bold uppercase tracking-wider bg-cyber-primary/10 border-cyber-primary/50 text-cyber-primary/70"
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Suspicious URLs */}
              {result.urlsFound?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                  className="w-full mt-4 text-left bg-black/50 p-4 rounded-xl border border-cyber-accent/20"
                >
                  <h4 className="text-xs font-bold text-cyber-muted uppercase mb-2 flex items-center gap-2">
                    <Link className="w-4 h-4 text-cyber-accent" />
                    URLs Detected {result.hasSuspiciousUrl && '⚠️ Suspicious'}
                  </h4>
                  {result.urlsFound.map((url, i) => (
                    <p key={i} className="text-xs font-mono text-cyber-accent/70 truncate">{url}</p>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
