import React from 'react';
import { cn } from '../utils/cn';

export default function Button({ children, className, variant = 'primary', ...props }) {
  const baseStyles = "px-6 py-2 rounded-md font-semibold transition-all relative overflow-hidden flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cyber-primary/20 text-cyber-primary border border-cyber-primary hover:bg-cyber-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]",
    secondary: "bg-cyber-secondary/20 text-purple-300 border border-cyber-secondary hover:bg-cyber-secondary/30 shadow-[0_0_15px_rgba(112,0,255,0.3)]",
    danger: "bg-cyber-accent/20 text-cyber-accent border border-cyber-accent hover:bg-cyber-accent/30 shadow-[0_0_15px_rgba(255,0,60,0.3)]",
    ghost: "text-cyber-muted hover:text-cyber-text hover:bg-white/5"
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
