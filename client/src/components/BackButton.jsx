import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * BackButton - Animated back navigation button
 * Used at the top of every page
 */
export default function BackButton({ to, label = 'Back', className = '' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.button
      onClick={handleBack}
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'flex items-center gap-2 text-cyber-muted hover:text-cyber-primary transition-colors group text-sm font-mono',
        className
      )}
    >
      <div className="w-7 h-7 rounded-lg border border-cyber-primary/20 bg-cyber-primary/5 flex items-center justify-center group-hover:border-cyber-primary/50 group-hover:bg-cyber-primary/10 transition-all">
        <ArrowLeft className="w-3.5 h-3.5" />
      </div>
      <span className="tracking-wider uppercase text-xs">{label}</span>
    </motion.button>
  );
}
