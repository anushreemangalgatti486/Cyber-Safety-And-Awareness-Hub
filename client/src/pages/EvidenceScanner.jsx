import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, UploadCloud, X, RefreshCw, Zap, Search, ShieldAlert, ShieldCheck, AlertTriangle, ShieldQuestion, Target, Tag, List, Clock } from 'lucide-react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { cn } from '../utils/cn';

export default function EvidenceScanner() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setOcrResult(null);
      setAiResult(null);
      setError(null);
      handleExtractText(selected);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setOcrResult(null);
    setAiResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExtractText = async (selectedFile) => {
    setIsExtracting(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/ocr/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setOcrResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to extract text from image.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyzeAI = async () => {
    if (!ocrResult || !ocrResult.extractedText) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await axios.post('/api/ai/analyze', { text: ocrResult.extractedText });
      setAiResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the text with AI. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reused from AiScamAnalyzer
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
      default: return <Zap className="w-10 h-10 text-cyber-primary" />;
    }
  };

  return (
    <div className="p-4 md:p-8 mt-16 md:mt-0 lg:ml-64 min-h-[calc(100vh-4rem)] relative z-10">
      <PageHeader 
        title="EVIDENCE SCANNER" 
        subtitle="Upload screenshots or images to extract text and analyze for threats via AI." 
        icon={Camera}
      />

      {error && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-400 mb-6"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Upload & Preview Column */}
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-cyber-primary/20 relative overflow-hidden">
            <h3 className="text-lg font-mono text-cyber-primary mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5" /> EVIDENCE UPLOAD
            </h3>
            
            {!preview ? (
              <div 
                className="border-2 border-dashed border-cyber-primary/30 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-cyber-primary/5 hover:border-cyber-primary/50 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-12 h-12 text-cyber-muted mb-4" />
                <p className="text-cyber-text font-medium mb-1">Click or drag image to upload</p>
                <p className="text-cyber-muted text-xs font-mono">PNG, JPG, WEBP up to 10MB</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-cyber-primary/30 group">
                <img src={preview} alt="Evidence preview" className="w-full h-auto object-contain max-h-[400px]" />
                
                {/* Overlay for Scanning */}
                {isExtracting && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                    <RefreshCw className="w-10 h-10 text-cyber-primary animate-spin mb-4" />
                    <p className="text-cyber-primary font-mono tracking-widest text-sm">EXTRACTING TEXT...</p>
                  </div>
                )}
                
                <button 
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-red-500/80 hover:border-red-500 transition-colors z-20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          {/* Extracted Text Result */}
          <AnimatePresence>
            {ocrResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 border border-cyber-primary/20"
              >
                <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                  <h3 className="text-sm font-mono text-cyber-primary">EXTRACTED TEXT</h3>
                  <span className="text-xs font-mono text-cyber-muted">
                    Confidence: <span className={cn("text-white", ocrResult.confidence > 80 ? 'text-green-400' : 'text-yellow-400')}>{ocrResult.confidence}%</span>
                  </span>
                </div>
                <div className="bg-black/60 rounded-lg p-4 border border-white/5 max-h-[200px] overflow-y-auto">
                  <p className="font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {ocrResult.extractedText}
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleAnalyzeAI}
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto bg-purple-600/20 text-purple-400 border-purple-500/50 hover:bg-purple-600/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center justify-center gap-2 font-mono text-sm">
                        <Zap className="w-4 h-4 animate-pulse" />
                        ANALYZING WITH AI...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 font-mono text-sm">
                        <Search className="w-4 h-4" />
                        ANALYZE EXTRACTED TEXT
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Analysis Result Column */}
        <div className="space-y-6">
          <AnimatePresence>
            {aiResult && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`glass-panel rounded-2xl border-2 p-6 ${getRiskColor(aiResult.riskLevel)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    {getRiskIcon(aiResult.riskLevel)}
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-widest leading-none">
                        {aiResult.riskLevel} RISK
                      </h2>
                      <p className="text-xs font-mono opacity-80 mt-1">
                        Category: <strong className="text-white bg-black/30 px-2 py-0.5 rounded">{aiResult.category}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <div className="sm:text-right">
                    <div className="text-3xl font-black">{aiResult.riskScore}<span className="text-base opacity-50">/100</span></div>
                    <div className="text-[10px] font-mono opacity-70 uppercase tracking-widest">Risk Score</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                    <h4 className="text-xs font-bold text-cyber-muted uppercase mb-3 flex items-center gap-2 tracking-widest">
                      <Target className="w-4 h-4 text-cyber-primary" />
                      Detected Threats
                    </h4>
                    {aiResult.detectedThreats.length > 0 ? (
                      <ul className="space-y-2">
                        {aiResult.detectedThreats.map((threat, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-cyber-accent shrink-0 mt-0.5">▸</span>
                            {threat}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-cyber-muted font-mono italic">No specific threats detected.</p>
                    )}
                  </div>

                  {aiResult.suspiciousKeywords.length > 0 && (
                    <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                      <h4 className="text-xs font-bold text-cyber-muted uppercase mb-3 flex items-center gap-2 tracking-widest">
                        <Tag className="w-4 h-4 text-cyber-primary" />
                        Suspicious Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {aiResult.suspiciousKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono text-white">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                    <h4 className="text-xs font-bold text-cyber-muted uppercase mb-3 flex items-center gap-2 tracking-widest">
                      <List className="w-4 h-4 text-cyber-primary" />
                      Safety Recommendations
                    </h4>
                    <ul className="space-y-3">
                      {aiResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 bg-cyber-primary/5 p-3 rounded-lg border border-cyber-primary/10">
                          <ShieldCheck className="w-4 h-4 text-cyber-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-200">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-cyber-muted border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Analysis Time: {aiResult.analysisTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    AI Confidence: <span className="text-cyber-primary">{aiResult.confidence}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
