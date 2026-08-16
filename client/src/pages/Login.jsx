import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Canvas } from '@react-three/fiber';
import ParticlesBackground from '../components/ParticlesBackground';

/**
 * Login - User authentication page with cyberpunk UI
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate(res.user?.role === 'admin' ? '/admin' : '/home');
      }, 1400);
    } else {
      setError(res.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-background flex items-center justify-center relative overflow-hidden px-4">
      {/* Particle background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ParticlesBackground />
        </Canvas>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Success toast */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-panel border border-cyber-primary/60 px-6 py-3 rounded-xl flex items-center gap-3 shadow-[0_0_30px_rgba(0,240,255,0.4)] bg-cyber-panel/95"
          >
            <CheckCircle className="text-cyber-primary w-5 h-5 animate-pulse" />
            <span className="text-cyber-primary font-bold tracking-wider text-sm font-mono">
              ACCESS GRANTED — ESTABLISHING CONNECTION...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        className={`relative z-10 w-full max-w-md transition-all duration-500 ${
          isSuccess
            ? 'scale-[1.02] shadow-[0_0_50px_rgba(0,240,255,0.4)]'
            : isLoading
            ? 'shadow-[0_0_30px_rgba(112,0,255,0.3)]'
            : ''
        }`}
      >
        {/* Floating shield icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={`relative p-4 rounded-full border-2 transition-all duration-500 ${
              isSuccess
                ? 'border-cyber-primary bg-cyber-primary/20 shadow-[0_0_30px_rgba(0,240,255,0.6)]'
                : isLoading
                ? 'border-cyber-secondary bg-cyber-secondary/10 shadow-[0_0_20px_rgba(112,0,255,0.5)]'
                : 'border-cyber-primary/40 bg-cyber-background shadow-neon-blue'
            }`}
          >
            <ShieldCheck className={`w-10 h-10 transition-colors duration-500 ${
              isSuccess ? 'text-cyber-primary' :
              isLoading ? 'text-cyber-secondary' :
              'text-cyber-primary'
            }`} />
          </motion.div>
        </div>

        {/* Card */}
        <div className={`glass-panel rounded-2xl p-6 md:p-8 border transition-all duration-500 ${
          isSuccess ? 'border-cyber-primary/60' :
          isLoading ? 'border-cyber-secondary/40' :
          'border-white/10'
        }`}>
          <h2 className={`text-2xl md:text-3xl font-black text-center mb-6 transition-all duration-500 ${
            isSuccess ? 'text-glow-primary text-cyber-primary' :
            isLoading ? 'text-glow-secondary text-cyber-secondary' :
            'text-glow-primary'
          }`}>
            AUTH REQUIRED
          </h2>

          {/* Error */}
          <div className="min-h-[2.5rem] mb-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-cyber-accent/10 border border-cyber-accent/60 text-cyber-accent p-3 rounded-xl text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,60,0.2)]"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-cyber-muted mb-2 uppercase tracking-wider">
                Agent Email
              </label>
              <Input
                icon={Mail}
                type="email"
                placeholder="agent@cybershield.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading || isSuccess}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyber-muted mb-2 uppercase tracking-wider">
                Passcode
              </label>
              <div className="relative">
                <Input
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isSuccess}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full py-3 font-black tracking-widest transition-all duration-300 ${
                isSuccess ? 'bg-cyber-primary/30 border-cyber-primary text-cyber-primary' :
                isLoading ? 'bg-cyber-secondary/20 border-cyber-secondary text-cyber-secondary' :
                'hover:scale-[1.02]'
              }`}
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AUTHENTICATING...
                </span>
              ) : isSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  CONNECTION ESTABLISHED
                </span>
              ) : (
                'ACCESS SYSTEM'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-cyber-muted text-xs font-mono">OR</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Admin link */}
          <Link
            to="/admin/login"
            className="block w-full text-center py-2.5 rounded-xl border border-cyber-accent/30 text-cyber-accent/70 hover:border-cyber-accent hover:text-cyber-accent hover:bg-cyber-accent/5 transition-all text-xs font-mono tracking-wider mb-4"
          >
            🔒 ADMIN SECURE ACCESS
          </Link>

          <p className="text-center text-cyber-muted text-sm">
            New Agent?{' '}
            <Link to="/register" className="text-cyber-primary hover:text-glow-primary transition-all font-medium">
              Request Clearance
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
