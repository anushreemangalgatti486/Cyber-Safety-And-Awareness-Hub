import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Trash2, Search, Link, FileText, 
  AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Loader2 
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const QUICK_ACTIONS = [
  { label: 'Analyze Message', query: 'Can you analyze this message for me: ' },
  { label: 'Scan Website', query: 'Can you scan this website: ' },
  { label: 'What is phishing?', query: 'What is phishing?' },
  { label: 'What is ransomware?', query: 'What is ransomware?' },
];

export default function CyberAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am your Cyber AI Assistant. I can help you analyze suspicious messages, scan URLs, or answer cybersecurity questions. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryOverride) => {
    const text = queryOverride || input;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API}/chat`, { message: text });
      
      const assistantMsg = { 
        role: 'assistant', 
        content: res.data.reply,
        scanResult: res.data.scanResult,
        incidentGuide: res.data.incidentGuide
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error while processing your request. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([{ role: 'assistant', content: "Conversation cleared. How can I help you today?" }]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col pt-6 pb-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-cyber-primary" /> CYBER AI ASSISTANT
          </h1>
          <p className="text-cyber-muted text-sm font-mono mt-1">Intelligent cybersecurity guidance & analysis</p>
        </div>
        <button 
          onClick={clearChat}
          className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel border border-white/10 text-cyber-muted hover:text-cyber-accent transition-all text-xs font-mono"
        >
          <Trash2 className="w-4 h-4" /> Clear Chat
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-panel rounded-2xl border border-cyber-primary/20 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none z-0"></div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 scrollbar-thin scrollbar-thumb-cyber-primary/30 scrollbar-track-transparent">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 flex flex-col gap-3 ${
                  msg.role === 'user' 
                    ? 'bg-cyber-primary/20 border border-cyber-primary/40 text-white rounded-tr-sm' 
                    : 'bg-black/60 border border-white/10 text-gray-200 rounded-tl-sm shadow-[0_0_15px_rgba(0,240,255,0.05)]'
                }`}>
                  {/* Text Content */}
                  <div className="flex gap-3">
                    {msg.role === 'assistant' && <Bot className="w-5 h-5 text-cyber-primary flex-shrink-0 mt-0.5" />}
                    <div className="leading-relaxed whitespace-pre-wrap text-sm">{msg.content}</div>
                  </div>

                  {/* Scan Results rendering */}
                  {msg.scanResult && (
                    <div className="mt-3 ml-8">
                      <ScanResultCard result={msg.scanResult} />
                    </div>
                  )}

                  {/* Incident Response Guide rendering */}
                  {msg.incidentGuide && (
                    <div className="mt-3 ml-8">
                      <IncidentGuide guide={msg.incidentGuide} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-black/60 border border-white/10 text-gray-200 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3">
                <Bot className="w-5 h-5 text-cyber-primary" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-cyber-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyber-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyber-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/40 border-t border-white/10 z-10 backdrop-blur-md">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => handleSend(action.query)}
                disabled={loading}
                className="text-[10px] uppercase tracking-wider font-mono px-3 py-1.5 rounded-full border border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/10 transition-colors disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
          
          <div className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question, paste a URL, or drop a suspicious message..."
              className="w-full bg-black/60 border border-cyber-primary/30 rounded-xl pl-4 pr-12 py-3 text-white text-sm focus:outline-none focus:border-cyber-primary focus:ring-1 focus:ring-cyber-primary transition-all resize-none min-h-[50px] max-h-[150px]"
              rows="1"
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyber-primary text-black hover:bg-cyber-primary/80 transition-colors disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          
          <p className="text-center text-[10px] text-cyber-muted mt-3 uppercase tracking-widest opacity-60">
            Disclaimer: The assistant provides educational guidance and should not replace advice from official authorities.
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-component for rendering scan results
function ScanResultCard({ result }) {
  const isUrl = result.type.includes('url');
  const data = result.data;
  
  // Try to determine risk level dynamically
  let riskLevel = data.riskLevel;
  if (!riskLevel && data.basicAnalysis) riskLevel = data.basicAnalysis.riskLevel;
  if (!riskLevel && data.finalRiskScore !== undefined) {
    riskLevel = data.finalRiskScore >= 50 ? 'High' : data.finalRiskScore >= 20 ? 'Medium' : 'Low';
  }

  const isHighRisk = riskLevel === 'High' || riskLevel === 'Critical';

  return (
    <div className={`p-4 rounded-xl border ${isHighRisk ? 'border-red-500/30 bg-red-500/5' : 'border-cyber-primary/30 bg-cyber-primary/5'}`}>
      <div className="flex items-center gap-2 mb-3">
        {isUrl ? <Link className="w-4 h-4 text-cyber-muted" /> : <FileText className="w-4 h-4 text-cyber-muted" />}
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          {isUrl ? 'URL Scan Result' : 'Text Analysis Result'}
        </span>
        <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded border ${
          isHighRisk ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'
        }`}>
          {riskLevel} RISK
        </span>
      </div>
      
      {/* Dynamic Content based on result type */}
      {data.category && (
        <p className="text-xs text-gray-300 mb-2">Category: <strong className="text-white">{data.category}</strong></p>
      )}
      
      {data.detectedThreats && data.detectedThreats.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] text-cyber-muted uppercase mb-1">Threats Detected:</p>
          <div className="flex flex-wrap gap-1">
            {data.detectedThreats.map((t, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">{t}</span>
            ))}
          </div>
        </div>
      )}

      {data.recommendations && data.recommendations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-[10px] text-cyber-primary uppercase mb-1">Recommendations:</p>
          <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
            {data.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// Sub-component for rendering the Incident Response Guide
function IncidentGuide({ guide }) {
  return (
    <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
      <h4 className="text-sm font-bold text-yellow-500 mb-3 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5" /> {guide.title}
      </h4>
      
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-white mb-1">Immediate Actions</p>
          <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
            {guide.immediateActions.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        
        <div>
          <p className="text-xs font-bold text-white mb-1">Recovery Steps</p>
          <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
            {guide.recoverySteps.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        
        <div>
          <p className="text-xs font-bold text-white mb-1">Prevention</p>
          <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
            {guide.prevention.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        
        <div className="pt-2 border-t border-white/10">
          <p className="text-xs text-cyber-muted italic">{guide.reporting}</p>
        </div>
      </div>
    </div>
  );
}
