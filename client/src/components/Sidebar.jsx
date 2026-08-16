import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShieldAlert, BookOpen, Activity, User, Shield, Menu, X, ChevronRight, ChevronDown, Brain, Globe, Camera, Bot } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/home', label: 'Dashboard', icon: Home, color: 'text-cyber-primary' },
  { path: '/assistant', label: 'Cyber Assistant', icon: Bot, color: 'text-cyan-400' },
  { 
    label: 'Scanners', 
    icon: Search, 
    color: 'text-cyber-secondary',
    subItems: [
      { path: '/ai-analyzer', label: 'AI Analyzer', icon: Brain, color: 'text-purple-400' },
      { path: '/scam-detection', label: 'Scam Scanner', icon: Search, color: 'text-cyber-secondary' },
      { path: '/rep-scanner', label: 'Reputation Scanner', icon: Globe, color: 'text-blue-400' },
      { path: '/evidence-scanner', label: 'Evidence Scanner', icon: Camera, color: 'text-pink-400' }
    ]
  },
  { path: '/report', label: 'Report Fraud', icon: ShieldAlert, color: 'text-cyber-accent' },
  { path: '/alerts', label: 'Live Alerts', icon: Activity, color: 'text-yellow-400' },
  { path: '/learning', label: 'Cyber Academy', icon: BookOpen, color: 'text-green-400' },
  { path: '/profile', label: 'Profile', icon: User, color: 'text-cyber-primary' },
];

const ADMIN_ITEM = { path: '/admin', label: 'Admin Panel', icon: Shield, color: 'text-cyber-accent' };

/**
 * Sidebar - Fixed left navigation with active state and mobile support
 */
export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scannersOpen, setScannersOpen] = useState(
    ['/ai-analyzer', '/scam-detection', '/rep-scanner', '/evidence-scanner'].includes(location.pathname)
  );

  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev);
    document.addEventListener('toggleSidebar', handleToggle);
    return () => document.removeEventListener('toggleSidebar', handleToggle);
  }, []);

  const items = user?.role === 'admin' ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand section */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-cyber-muted uppercase tracking-widest">
            System Active
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto scrollbar-none">
        {items.map((item) => {
          if (item.subItems) {
            const isActive = item.subItems.some(sub => location.pathname === sub.path);
            return (
              <div key={item.label} className="flex flex-col">
                <button
                  onClick={() => setScannersOpen(!scannersOpen)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group w-full',
                    isActive || scannersOpen
                      ? 'bg-cyber-primary/5 text-cyber-primary'
                      : 'text-cyber-muted hover:bg-white/5 hover:text-cyber-text'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', (isActive || scannersOpen) ? item.color : 'text-current')} />
                  <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                  {scannersOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                <AnimatePresence>
                  {scannersOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-6 mt-1 space-y-1"
                    >
                      <div className="pl-2 border-l border-white/10 space-y-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative',
                                isSubActive
                                  ? 'bg-cyber-primary/10 text-cyber-primary'
                                  : 'text-cyber-muted hover:bg-white/5 hover:text-cyber-text'
                              )}
                            >
                              <sub.icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isSubActive ? sub.color : 'text-current')} />
                              <span className="font-medium text-xs">{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group',
                isActive
                  ? 'bg-cyber-primary/10 text-cyber-primary'
                  : 'text-cyber-muted hover:bg-white/5 hover:text-cyber-text'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyber-primary rounded-r-full shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                />
              )}

              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                isActive ? item.color : 'text-current'
              )} />
              <span className="font-medium text-sm">{item.label}</span>

              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto text-cyber-primary/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="text-xs text-cyber-muted font-mono text-center">
          <span className="text-cyber-primary">v2.0.0</span> · CyberShield
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-64 glass-panel border-r border-cyber-primary/20 z-50 pt-16"
          >
            <SidebarContent />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
