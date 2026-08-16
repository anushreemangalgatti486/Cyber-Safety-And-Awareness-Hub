import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, ShieldAlert, TrendingUp, Zap } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

/**
 * CyberTicker - Real-time scrolling threat ticker bar
 * Shows live alerts + static cyber threat news items
 * Displayed at the bottom of the screen on protected pages
 */

const STATIC_ITEMS = [
  { text: 'CYBERSHIELD ACTIVE — All systems nominal', type: 'safe' },
  { text: 'Report suspicious messages using the Report Fraud page', type: 'info' },
  { text: 'Never share OTPs, passwords, or bank details over phone or SMS', type: 'warning' },
  { text: 'Phishing attacks increased 47% this quarter — stay vigilant', type: 'warning' },
  { text: 'Enable 2FA on all your accounts for maximum protection', type: 'info' },
  { text: 'Verify sender identity before clicking any links in emails', type: 'warning' },
  { text: 'CyberShield AI scanner available 24/7 — scan suspicious messages now', type: 'info' },
  { text: 'Ransomware attacks targeting mobile users — keep apps updated', type: 'danger' },
];

const TYPE_COLORS = {
  safe: 'text-green-400',
  info: 'text-cyber-primary',
  warning: 'text-yellow-400',
  danger: 'text-cyber-accent',
};

const TYPE_ICONS = {
  safe: '✓',
  info: '●',
  warning: '⚠',
  danger: '⚡',
};

export default function CyberTicker() {
  const { alerts, isConnected } = useSocket();
  const [items, setItems] = useState(STATIC_ITEMS);
  const tickerRef = useRef(null);

  // Prepend live alerts to ticker
  useEffect(() => {
    if (alerts.length > 0) {
      const latest = alerts[0];
      const liveItem = {
        text: `LIVE: ${latest.message}`,
        type: latest.type === 'danger' ? 'danger' : 'warning',
        isLive: true,
      };
      setItems(prev => [liveItem, ...prev.filter(i => !i.isLive)].slice(0, 12));
    }
  }, [alerts]);

  // Duplicate items for seamless loop
  const displayItems = [...items, ...items];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 h-8 bg-cyber-background/95 border-t border-cyber-primary/20 flex items-center overflow-hidden">
      {/* Left label */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 h-full bg-cyber-primary/10 border-r border-cyber-primary/20">
        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-cyber-accent'}`} />
        <Radio className="w-3 h-3 text-cyber-primary" />
        <span className="text-cyber-primary text-[10px] font-bold font-mono tracking-widest uppercase hidden sm:block">
          LIVE FEED
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-cyber-background/95 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-cyber-background/95 to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex items-center gap-0 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: items.length * 6,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {displayItems.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-6">
              <span className={`text-[10px] font-bold ${TYPE_COLORS[item.type] || 'text-cyber-primary'}`}>
                {TYPE_ICONS[item.type]}
              </span>
              <span className={`text-[11px] font-mono ${
                item.isLive
                  ? 'text-cyber-accent font-bold'
                  : 'text-cyber-text/60'
              }`}>
                {item.text}
              </span>
              <span className="text-cyber-primary/20 mx-2">◆</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Right status */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 h-full bg-cyber-panel/50 border-l border-cyber-primary/20">
        <Zap className="w-3 h-3 text-cyber-secondary" />
        <span className="text-cyber-secondary text-[10px] font-mono hidden sm:block">
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
