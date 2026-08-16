import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'Password reset link sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-cyber-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <ShieldCheck className="w-16 h-16 text-cyber-primary mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-mono text-cyber-primary tracking-widest font-bold mb-2">RECOVERY</h1>
          <p className="text-cyber-muted text-sm font-mono uppercase tracking-widest">
            Initiate Password Reset Protocol
          </p>
        </div>

        <div className="glass-panel p-8 border border-cyber-primary/30 shadow-[0_0_30px_rgba(0,255,157,0.1)]">
          {message ? (
            <div className="text-center">
              <div className="text-green-400 font-mono mb-6 bg-green-500/10 p-4 border border-green-500/30 rounded">
                {message}
              </div>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-red-400 text-sm font-mono bg-red-500/10 p-3 border border-red-500/30 rounded">
                  {error}
                </div>
              )}

              <Input
                label="Registered Email"
                type="email"
                placeholder="operative@cybershield.net"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full group"
                disabled={loading}
              >
                {loading ? 'INITIATING...' : 'REQUEST RESET'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="text-center mt-4">
                <Link to="/login" className="text-cyber-muted hover:text-cyber-primary text-sm font-mono flex items-center justify-center gap-2 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
