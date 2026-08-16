import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, User, Bell, Wifi, WifiOff, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { cn } from '../utils/cn';

/**
 * Navbar - Fixed top navigation with connection status and notification badge
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const { isConnected, notifications, alerts } = useSocket();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.length + (alerts.length > 0 ? 1 : 0);

  return (
    <nav className="fixed top-0 w-full z-40 glass-panel border-b border-cyber-primary/10 h-16 flex items-center px-4 md:px-6 justify-between">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu (All Screens) */}
        {user && (
          <button 
            className="p-1 text-cyber-primary hover:bg-cyber-primary/10 rounded-md transition-colors"
            onClick={() => document.dispatchEvent(new Event('toggleSidebar'))}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Logo */}
        <Link to={user ? '/home' : '/'} className="flex items-center gap-2 group flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-0 bg-cyber-primary/30 blur-md rounded-full group-hover:bg-cyber-primary/50 transition-all" />
          <Shield className="w-7 h-7 text-cyber-primary relative z-10 group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-lg font-black tracking-widest text-glow-primary hidden sm:block">
          CYBERSHIELD
        </span>
      </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Connection status */}
            <div className={cn(
              'hidden md:flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono',
              isConnected
                ? 'text-green-400 bg-green-400/10'
                : 'text-cyber-accent bg-cyber-accent/10'
            )}>
              {isConnected
                ? <><Wifi className="w-3 h-3" /> LIVE</>
                : <><WifiOff className="w-3 h-3" /> OFFLINE</>
              }
            </div>

            {/* Notification bell */}
            <Link
              to="/alerts"
              className="relative p-2 text-cyber-muted hover:text-cyber-primary transition-colors rounded-full hover:bg-cyber-primary/10"
              aria-label="Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-cyber-accent rounded-full text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-2 text-cyber-primary hover:text-white transition-all px-3 py-1.5 rounded-lg hover:bg-cyber-primary/10"
            >
              <div className="w-7 h-7 rounded-full border border-cyber-primary/50 flex items-center justify-center bg-cyber-primary/10">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium max-w-[100px] truncate">
                {user.name || 'Agent'}
              </span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-cyber-muted hover:text-cyber-accent transition-colors rounded-full hover:bg-cyber-accent/10"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-cyber-text/80 hover:text-cyber-primary transition-colors text-sm">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded border border-cyber-primary text-cyber-primary hover:bg-cyber-primary/10 transition-colors shadow-neon-blue text-sm font-medium"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
