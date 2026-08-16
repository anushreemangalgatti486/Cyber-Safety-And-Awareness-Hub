import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * PageHeader - Reusable page header with animated back button
 *
 * Props:
 *  title       - Page title string
 *  subtitle    - Optional subtitle
 *  icon        - Optional lucide icon component
 *  iconColor   - Tailwind color class for icon (default: text-cyber-primary)
 *  backTo      - Override back destination (default: browser history)
 *  right       - Optional JSX to render on the right side
 *  glowColor   - 'primary' | 'secondary' | 'danger' (default: 'primary')
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-cyber-primary',
  backTo,
  right,
  glowColor = 'primary',
}) {
  const navigate = useNavigate();

  const glowMap = {
    primary: 'text-glow-primary',
    secondary: 'text-glow-secondary',
    danger: 'text-glow-danger',
  };

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 md:mb-8"
    >
      {/* Left: back button + title */}
      <div className="flex items-center gap-3">
        {/* Back button */}
        <motion.button
          onClick={handleBack}
          whileHover={{ scale: 1.08, x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl glass-panel border border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/10 hover:border-cyber-primary/60 hover:shadow-neon-blue transition-all duration-200"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        {/* Icon + Title */}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="relative flex-shrink-0">
              <div className={cn(
                'absolute inset-0 blur-lg rounded-full opacity-40',
                glowColor === 'danger' ? 'bg-cyber-accent' :
                glowColor === 'secondary' ? 'bg-cyber-secondary' :
                'bg-cyber-primary'
              )} />
              <Icon className={cn('w-7 h-7 relative z-10', iconColor)} />
            </div>
          )}
          <div>
            <h1 className={cn(
              'text-xl md:text-2xl font-black tracking-wide',
              glowMap[glowColor] || glowMap.primary
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-cyber-muted text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right slot */}
      {right && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {right}
        </div>
      )}
    </motion.div>
  );
}
