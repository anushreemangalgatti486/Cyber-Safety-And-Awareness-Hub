import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Shield, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Canvas } from '@react-three/fiber';
import ParticlesBackground from '../components/ParticlesBackground';

/**
 * Register - New agent registration with animated cyberpunk UI
 */
export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Encryption keys do not match');
      return;
    }
    if (password.length < 6) {
      setError('Encryption key must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const res = await register(name, email, password);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => navigate('/home'), 1400);
    } else {
      setError(res.message);
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'WEAK', color: 'bg-cyber-accent' };
    if (score <= 3) return { level: 2, label: 'MODERATE', color: 'bg-yellow-400' };
    return { level: 3, label: 'STRONG', color: 'bg-green-400' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-cyber-background flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Particle background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ParticlesBackground />
        </Canvas>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />

      {/* Purple radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-secondary/5 via-transparent to-transparent pointer-events-none" />

      {/* Success toast */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-panel border border-cyber-secondary/60 px-6 py-3 rounded-xl flex items-center gap-3 shadow-[0_0_30px_rgba(112,0,255,0.4)] bg-cyber-panel/95"
          >
            <CheckCircle className="text-cyber-secondary w-5 h-5 animate-pulse" />
            <span className="text-cyber-secondary font-bold tracking-wider text-sm font-mono">
              AGENT INITIALIZED — WELCOME TO CYBERSHIELD
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Floating shield */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative p-4 rounded-full border-2 border-cyber-secondary/40 bg-cyber-background shadow-neon-purple"
          >
            <Shield className="w-10 h-10 text-cyber-secondary" />
          </motion.div>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-6 text-glow-secondary">
            INITIALIZE AGENT
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
                  className="bg-cyber-accent/10 border border-cyber-accent/60 text-cyber-accent p-3 rounded-xl text-sm flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-cyber-muted mb-2 uppercase tracking-wider">
                Codename
              </label>
              <Input
                icon={UserIcon}
                type="text"
                placeholder="Agent Codename"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={isLoading || isSuccess}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cyber-muted mb-2 uppercase tracking-wider">
                Secure Comm Link
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
                Encryption Key
              </label>
              <div className="relative">
                <Input
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isSuccess}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.level ? strength.color : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[10px] font-mono ${
                    strength.level === 1 ? 'text-cyber-accent' :
                    strength.level === 2 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    KEY STRENGTH: {strength.label}
                  </p>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-cyber-muted mb-2 uppercase tracking-wider">
                Confirm Key
              </label>
              <Input
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat encryption key"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading || isSuccess}
                className={confirmPassword && confirmPassword !== password ? 'border-cyber-accent/60' : ''}
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-cyber-accent text-[10px] font-mono mt-1">Keys do not match</p>
              )}
            </div>

            <Button
              type="submit"
              variant="secondary"
              className={`w-full py-3 font-black tracking-widest mt-2 ${
                isLoading ? 'animate-pulse' : 'hover:scale-[1.02]'
              }`}
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  INITIALIZING...
                </span>
              ) : isSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  AGENT CREATED
                </span>
              ) : (
                'INITIALIZE PROFILE'
              )}
            </Button>
          </form>

          <p className="text-center mt-5 text-cyber-muted text-sm">
            Existing Agent?{' '}
            <Link to="/login" className="text-cyber-secondary hover:text-glow-secondary transition-all font-medium">
              Login Here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
