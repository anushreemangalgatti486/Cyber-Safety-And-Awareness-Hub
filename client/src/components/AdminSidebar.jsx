import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, Activity,
  Radio, Database, LogOut, Shield, ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { path: '/admin',           label: 'Dashboard',      icon: LayoutDashboard, color: 'text-cyber-accent' },
  { path: '/admin/reports',   label: 'Scam Reports',   icon: FileText,        color: 'text-yellow-400'   },
  { path: '/admin/users',     label: 'User Management',icon: Users,           color: 'text-cyber-primary'},
  { path: '/admin/analytics', label: 'Analytics',      icon: Activity,        color: 'text-cyber-secondary'},
  { path: '/admin/broadcast', label: 'Broadcast',      icon: Radio,           color: 'text-cyber-accent' },
  { path: '/admin/logs',      label: 'Blockchain Logs',icon: Database,        color: 'text-green-400'    },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen bg-cyber-background border-r border-cyber-accent/20 flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-cyber-accent/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-cyber-accent/30 blur-md rounded-full" />
            <Shield className="w-7 h-7 text-cyber-accent relative z-10" />
          </div>
          <div>
            <p className="font-black text-cyber-accent tracking-widest text-sm">CYBERSHIELD</p>
            <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Admin info */}
      <div className="px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-cyber-accent/20 border border-cyber-accent/40 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-cyber-accent" />
          </div>
          <div>
            <p className="text-white text-xs font-bold truncate">{user?.name || 'Admin'}</p>
            <p className="text-cyber-muted text-[10px] font-mono">ADMINISTRATOR</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {ADMIN_NAV.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group',
                isActive
                  ? 'bg-cyber-accent/15 text-white border border-cyber-accent/30'
                  : 'text-cyber-muted hover:bg-white/5 hover:text-cyber-text'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="adminActive"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyber-accent rounded-r-full shadow-[0_0_8px_rgba(255,0,60,0.8)]"
                />
              )}
              <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? item.color : 'text-current')} />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-cyber-accent/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-cyber-muted hover:bg-cyber-accent/10 hover:text-cyber-accent transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
        <p className="text-center text-[10px] text-cyber-muted/30 font-mono">v2.0.0 · CyberShield Admin</p>
      </div>
    </aside>
  );
}
