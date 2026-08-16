import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Lock, Eye } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import Globe from '../components/Globe';

const BOOT_LINES = [
  { text: '> Initializing CyberShield v2.0...', delay: 0.2 },
  { text: '> Loading threat detection modules...', delay: 0.6 },
  { text: '> Establishing encrypted channels...', delay: 1.0 },
  { text: '> Connecting to global threat network...', delay: 1.4 },
  { text: '> All systems operational.', delay: 1.8, highlight: true },
];

/**
 * Splash - Animated boot screen with terminal sequence
 * Auto-redirects to login after 4.5s
 */
export default function Splash() {
  const navigate = useNavigate();
  const [visibleLines, setVisibleLines] = useState([]);
  const [showMain, setShowMain] = useState(false);

  useEffect(() => {
    // Show terminal lines progressively
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
      }, line.delay * 1000);
    });

    // Show main logo after boot
    setTimeout(() => setShowMain(true), 2200);

    // Navigate to login
    const timer = setTimeout(() => navigate('/login'), 4500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-cyber-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Cyber grid */}
      <div className="absolute inset-0 bg-cyber-grid opacity-15 pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-primary/8 via-transparent to-transparent pointer-events-none" />

      {/* 3D Globe background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <Globe />
        </Canvas>
      </div>

      {/* Corner decorations */}
      {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-8 h-8 pointer-events-none`}>
          <div className={`w-full h-full border-cyber-primary/40 ${
            i === 0 ? 'border-t-2 border-l-2' :
            i === 1 ? 'border-t-2 border-r-2' :
            i === 2 ? 'border-b-2 border-l-2' :
            'border-b-2 border-r-2'
          }`} />
        </div>
      ))}

      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/40 to-transparent pointer-events-none z-10"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
      />

      {/* Main content */}
      <div className="z-10 flex flex-col items-center text-center px-4">
        {/* Shield logo */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-8"
        >
          {/* Outer rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-cyber-primary/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            style={{ margin: '-20px' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-cyber-primary/10"
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
            style={{ margin: '-20px' }}
          />

          {/* Glow */}
          <div className="absolute inset-0 bg-cyber-primary/20 blur-[60px] rounded-full" />

          {/* Icon */}
          <div className="relative z-10 w-28 h-28 rounded-full border-2 border-cyber-primary/50 bg-cyber-background/80 flex items-center justify-center">
            <Shield className="w-14 h-14 text-cyber-primary" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl md:text-7xl font-black tracking-widest mb-2"
          style={{
            background: 'linear-gradient(135deg, #00f0ff 0%, #ffffff 50%, #7000ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          CYBERSHIELD
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-cyber-primary/60 tracking-[0.4em] uppercase text-xs mb-10 font-mono"
        >
          Cyber Safety & Awareness Platform
        </motion.p>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex gap-4 mb-10"
        >
          {[
            { icon: Shield, label: 'Protected' },
            { icon: Zap, label: 'Real-Time' },
            { icon: Lock, label: 'Encrypted' },
            { icon: Eye, label: 'AI-Powered' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-cyber-primary" />
              </div>
              <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Terminal boot sequence */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm bg-black/60 border border-cyber-primary/20 rounded-xl p-4 font-mono text-xs text-left"
        >
          <AnimatePresence>
            {visibleLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`mb-1 ${line.highlight ? 'text-green-400' : 'text-cyber-primary/70'}`}
              >
                {line.text}
                {i === visibleLines.length - 1 && (
                  <span className="animate-pulse ml-1 text-cyber-primary">█</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm mt-4"
        >
          <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-primary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: 'linear' }}
            />
          </div>
          <p className="text-cyber-muted text-[10px] font-mono text-center mt-2 tracking-widest">
            LOADING...
          </p>
        </motion.div>
      </div>
    </div>
  );
}
