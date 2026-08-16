import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, Shield, ShieldAlert, AlertTriangle, AlertCircle, CheckCircle, Info, Lock, Clock, List, RefreshCw, Activity } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Input from '../components/Input';
import axios from 'axios';
import { cn } from '../utils/cn';

export default function RepScanner() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      // In development, the proxy will route this to http://localhost:5000/api/url/analyze
      // In unified mode, the backend serves both, so /api/url/analyze works directly
      const response = await axios.post('/api/url/analyze', { url });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while scanning the URL.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
    setError(null);
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'Safe': return 'text-green-400';
      case 'Low': return 'text-yellow-400';
      case 'Medium': return 'text-orange-400';
      case 'High': return 'text-red-400';
      case 'Critical': return 'text-red-600 animate-pulse';
      default: return 'text-cyber-muted';
    }
  };

  const getThreatIcon = (level) => {
    switch (level) {
      case 'Safe': return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'Low': return <Info className="w-8 h-8 text-yellow-400" />;
      case 'Medium': return <AlertCircle className="w-8 h-8 text-orange-400" />;
      case 'High': return <AlertTriangle className="w-8 h-8 text-red-400" />;
      case 'Critical': return <ShieldAlert className="w-8 h-8 text-red-600" />;
      default: return <Shield className="w-8 h-8 text-cyber-muted" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 mt-16 md:mt-0 lg:ml-64 relative z-10">
      <PageHeader 
        title="Website Reputation Scanner" 
        subtitle="Analyze URLs for phishing patterns, malicious markers, and structural anomalies." 
        icon={Globe}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 border border-cyber-primary/20"
      >
        <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              label="Target URL"
              type="text"
              placeholder="e.g., https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              icon={Globe}
              className="w-full"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isScanning || !url}
              className="flex-1 md:flex-none"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Scan Website
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClear}
              disabled={isScanning || (!url && !result && !error)}
            >
              Clear
            </Button>
          </div>
        </form>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-400"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-panel p-12 border border-cyber-primary/20 flex flex-col items-center justify-center gap-6"
        >
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-cyber-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-cyber-primary rounded-full border-t-transparent animate-spin" />
            <Globe className="absolute inset-0 m-auto w-8 h-8 text-cyber-primary animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-mono text-cyber-primary">ANALYZING TARGET</h3>
            <p className="text-cyber-muted text-sm font-mono mt-2">Checking heuristics and structural markers...</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {result && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Overview Card */}
            <div className="glass-panel border border-cyber-primary/20 p-6 lg:col-span-1 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-cyber-primary/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center">
                {getThreatIcon(result.threatLevel)}
                <h3 className={cn("text-3xl font-bold font-mono mt-4 tracking-widest uppercase", getThreatColor(result.threatLevel))}>
                  {result.threatLevel}
                </h3>
                <p className="text-cyber-muted text-sm font-mono mt-1 tracking-widest">THREAT LEVEL</p>
              </div>

              <div className="w-full mt-6 space-y-4 relative z-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-cyber-muted">Risk Score</span>
                  <span className={cn("font-mono font-bold", getThreatColor(result.threatLevel))}>{result.riskScore} / 100</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${result.riskScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full", 
                      result.riskScore > 50 ? "bg-red-500" : result.riskScore > 25 ? "bg-orange-500" : result.riskScore > 0 ? "bg-yellow-500" : "bg-green-500"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="glass-panel border border-cyber-primary/20 p-6 lg:col-span-2 space-y-6 relative">
              <h3 className="text-lg font-mono text-cyber-primary border-b border-cyber-primary/20 pb-2">Analysis Details</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyber-muted text-xs uppercase tracking-wider">
                    <List className="w-3 h-3" /> Category
                  </div>
                  <div className="font-medium text-sm">{result.category}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyber-muted text-xs uppercase tracking-wider">
                    <Lock className="w-3 h-3" /> SSL Status
                  </div>
                  <div className={cn("font-medium text-sm", result.sslStatus === 'Secured' ? 'text-green-400' : 'text-red-400')}>
                    {result.sslStatus}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyber-muted text-xs uppercase tracking-wider">
                    <Clock className="w-3 h-3" /> Domain Age
                  </div>
                  <div className="font-medium text-sm">{result.domainAge}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyber-muted text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-3 h-3" /> Blacklist
                  </div>
                  <div className="font-medium text-sm">{result.blacklistStatus}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyber-muted text-xs uppercase tracking-wider">
                    <Activity className="w-3 h-3" /> Scan Time
                  </div>
                  <div className="font-medium text-sm">
                    {new Date(result.scanTimestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              {/* Threat Intelligence APIs */}
              <div className="mt-6 pt-6 border-t border-cyber-primary/20">
                <h4 className="text-sm font-mono text-cyber-secondary mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Threat Intelligence Sources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 p-3 rounded bg-black/20 border border-cyber-primary/10">
                    <div className="text-cyber-muted text-xs uppercase tracking-wider">VirusTotal</div>
                    <div className={cn("font-medium text-sm", result.virusTotalStatus === 'Safe' ? 'text-green-400' : result.virusTotalStatus === 'Unavailable' ? 'text-gray-400' : result.virusTotalStatus === 'Suspicious' ? 'text-yellow-400' : 'text-red-400')}>
                      {result.virusTotalStatus || 'Not Checked'}
                    </div>
                  </div>
                  <div className="space-y-1 p-3 rounded bg-black/20 border border-cyber-primary/10">
                    <div className="text-cyber-muted text-xs uppercase tracking-wider">Google Safe Browsing</div>
                    <div className={cn("font-medium text-sm", result.safeBrowsingStatus === 'Safe' ? 'text-green-400' : result.safeBrowsingStatus === 'Unavailable' ? 'text-gray-400' : 'text-red-400')}>
                      {result.safeBrowsingStatus || 'Not Checked'}
                    </div>
                  </div>
                  <div className="space-y-1 p-3 rounded bg-black/20 border border-cyber-primary/10">
                    <div className="text-cyber-muted text-xs uppercase tracking-wider">AbuseIPDB</div>
                    <div className={cn("font-medium text-sm", result.abuseIPDBStatus === 'Safe' ? 'text-green-400' : result.abuseIPDBStatus === 'Unavailable' ? 'text-gray-400' : result.abuseIPDBStatus === 'Suspicious' ? 'text-yellow-400' : 'text-red-400')}>
                      {result.abuseIPDBStatus || 'Not Checked'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasons */}
              {result.reasons.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-mono text-cyber-secondary mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Detection Reasons
                  </h4>
                  <ul className="space-y-2">
                    {result.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-cyber-secondary mt-1">▸</span> {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suspicious Keywords */}
              {result.suspiciousKeywords.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-mono text-red-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Suspicious Keywords Detected
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suspiciousKeywords.map((kw, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-mono border border-red-500/30">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="mt-6 pt-6 border-t border-cyber-primary/20">
                  <h4 className="text-sm font-mono text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Safety Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-green-400 mt-1">▸</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
