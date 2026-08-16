import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cyber-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-12 max-w-md w-full text-center border-red-500/30 relative z-10"
      >
        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
        <h1 className="text-3xl font-mono text-red-400 font-bold tracking-widest mb-2">ACCESS DENIED</h1>
        <p className="text-cyber-muted text-sm mb-8">
          You do not have the required clearance level to access this sector.
        </p>

        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="w-full flex items-center justify-center gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </motion.div>
    </div>
  );
}
