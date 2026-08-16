import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Shield, Loader2, Eye, EyeOff,
  AlertTriangle, CheckCircle, Camera, X, Fingerprint,
  Cpu, RefreshCw, ShieldAlert
} from 'lucide-react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';

const API = 'http://localhost:5000/api';

const TERMINAL_LINES = [
  '> Initializing CyberShield Admin Protocol v2.0...',
  '> Loading biometric security modules...',
  '> Establishing encrypted channel [AES-256]...',
  '> Face recognition engine ready.',
  '> Awaiting administrator credentials...',
];

const SCAN_STEPS = [
  'Initializing face detection...',
  'Detecting facial landmarks...',
  'Mapping biometric vectors...',
  'Verifying identity matrix...',
  'Cross-referencing admin database...',
  'Identity confirmed. Access granted.',
];

export default function AdminLogin() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hold token in memory — only written to localStorage after face lock passes
  const pendingTokenRef = useRef(null);

  // Terminal
  const [terminalLines, setTerminalLines] = useState([]);
  const [terminalDone, setTerminalDone] = useState(false);

  // Camera / face lock
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const [cameraState, setCameraState] = useState('idle'); // idle | requesting | active | denied | error
  const [scanStatus, setScanStatus] = useState('waiting'); // waiting | scanning | success | failed
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepIdx, setScanStepIdx] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  // ── Terminal boot ─────────────────────────────────────────────
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        setTerminalLines(prev => [...prev, TERMINAL_LINES[i++]]);
      } else {
        clearInterval(iv);
        setTimeout(() => setTerminalDone(true), 300);
      }
    }, 380);
    return () => clearInterval(iv);
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── STEP 1: Verify credentials ────────────────────────────────
  const handleCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      const { token, role } = res.data;
      if (role !== 'admin' && role !== 'superadmin') {
        setError('Access denied. Administrator credentials required.');
        setLoading(false);
        return;
      }
      // Store token in memory only — NOT localStorage yet
      pendingTokenRef.current = token;
      setLoading(false);
      setStep(2);
      // Auto-request camera after transition
      setTimeout(() => requestCamera(), 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Check credentials.');
      setLoading(false);
    }
  };

  // ── Request camera permission ─────────────────────────────────
  const requestCamera = async () => {
    setCameraState('requesting');
    setScanStatus('waiting');

    try {
      // Stop any existing stream first
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      setCameraState('active');

      // Attach stream to video element — wait for it to be in DOM
      // Use a small delay + retry loop to handle React render timing
      let attempts = 0;
      const attachStream = () => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().catch(() => {});
          };
        } else if (attempts < 10) {
          attempts++;
          setTimeout(attachStream, 100);
        }
      };
      attachStream();

    } catch (err) {
      console.error('Camera error:', err.name, err.message);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('error');
      } else {
        setCameraState('error');
      }
    }
  };

  // ── Run face scan ─────────────────────────────────────────────
  const startFaceScan = () => {
    if (cameraState !== 'active' || scanStatus === 'scanning') return;

    setScanStatus('scanning');
    setScanProgress(0);
    setScanStepIdx(0);

    let progress = 0;
    let stepIdx = 0;

    scanIntervalRef.current = setInterval(() => {
      progress += Math.random() * 4 + 2.5;
      const capped = Math.min(progress, 100);
      setScanProgress(capped);

      const newStep = Math.min(
        Math.floor((capped / 100) * (SCAN_STEPS.length - 1)),
        SCAN_STEPS.length - 1
      );
      if (newStep !== stepIdx) {
        stepIdx = newStep;
        setScanStepIdx(stepIdx);
      }

      if (capped >= 100) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
        setScanProgress(100);
        setScanStepIdx(SCAN_STEPS.length - 1);
        setScanStatus('success');
        stopCamera();
        // Commit token and redirect after success animation
        setTimeout(() => commitAndRedirect(), 1800);
      }
    }, 100);
  };

  // ── Commit token → localStorage → redirect ────────────────────
  const commitAndRedirect = () => {
    const token = pendingTokenRef.current;
    if (!token) return;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    window.location.href = '/admin';
  };

  // ── Retry after failed scan ───────────────────────────────────
  const handleRetry = () => {
    const remaining = attemptsLeft - 1;
    setAttemptsLeft(remaining);
    if (remaining <= 0) {
      stopCamera();
      pendingTokenRef.current = null;
      setStep(1);
      setError('Too many failed attempts. Please re-authenticate.');
      setAttemptsLeft(3);
      return;
    }
    setScanStatus('waiting');
    setScanProgress(0);
    setScanStepIdx(0);
    requestCamera();
  };

  // ── Camera viewport content ───────────────────────────────────
  const renderCameraContent = () => {
    if (scanStatus === 'success') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-green-400/25 flex flex-col items-center justify-center gap-3 z-20"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <CheckCircle className="w-16 h-16 text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,1)]" />
          </motion.div>
          <span className="text-green-400 text-sm font-black font-mono tracking-widest">IDENTITY VERIFIED</span>
        </motion.div>
      );
    }

    if (cameraState === 'denied') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center z-20">
          <ShieldAlert className="w-10 h-10 text-cyber-accent/60" />
          <p className="text-cyber-accent text-xs font-mono leading-relaxed">
            Camera permission denied.
          </p>
          <p className="text-cyber-muted text-[10px] font-mono leading-relaxed">
            Click the camera icon in your browser address bar → Allow → then click RETRY
          </p>
        </div>
      );
    }

    if (cameraState === 'error') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20">
          <Camera className="w-10 h-10 text-cyber-muted/20" />
          <p className="text-cyber-muted/50 text-xs font-mono">No camera detected</p>
        </div>
      );
    }

    if (cameraState === 'requesting') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20">
          <Loader2 className="w-8 h-8 text-cyber-accent animate-spin" />
          <p className="text-cyber-accent text-xs font-mono animate-pulse">Requesting camera access...</p>
        </div>
      );
    }

    if (cameraState === 'idle') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20">
          <Camera className="w-10 h-10 text-cyber-muted/20" />
          <p className="text-cyber-muted/40 text-xs font-mono">Camera not started</p>
        </div>
      );
    }

    return null; // active — video element shows
  };

  return (
    <div className="min-h-screen bg-cyber-background flex items-center justify-center relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-accent/8 via-transparent to-transparent pointer-events-none" />

      <div className="absolute top-4 left-4 right-4 flex justify-between text-[10px] font-mono text-cyber-accent/20 pointer-events-none select-none">
        <span>RESTRICTED ACCESS ZONE</span>
        <span>UNAUTHORIZED ENTRY PROHIBITED</span>
      </div>

      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-accent/15 to-transparent pointer-events-none"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
      />

      <div className="w-full max-w-md z-10">

        {/* Terminal */}
        <AnimatePresence>
          {!terminalDone && (
            <motion.div
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-panel rounded-xl p-4 mb-5 font-mono text-xs border border-green-400/20 overflow-hidden"
            >
              {terminalLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-1 ${i === TERMINAL_LINES.length - 1 ? 'text-green-400' : 'text-green-400/50'}`}
                >
                  {line}
                  {i === terminalLines.length - 1 && <span className="animate-pulse ml-1">█</span>}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl border border-cyber-accent/40 shadow-[0_0_40px_rgba(255,0,60,0.1)] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-cyber-accent/10 border-b border-cyber-accent/20 px-6 py-4 flex items-center gap-3">
            <div className="relative">
              <Shield className="w-6 h-6 text-cyber-accent" />
              {step === 2 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-accent rounded-full animate-pulse" />}
            </div>
            <div>
              <h1 className="font-black text-cyber-accent tracking-widest text-sm">ADMIN SECURE ACCESS</h1>
              <p className="text-cyber-muted text-xs font-mono">
                Step {step} of 2 — {step === 1 ? 'Credential Verification' : 'Biometric Face Lock'}
              </p>
            </div>
          </div>

          <div className="p-6">
            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-6">
              {[{ n: 1, label: 'Credentials' }, { n: 2, label: 'Face Lock' }].map(({ n, label }, idx) => (
                <React.Fragment key={n}>
                  <div className={`flex items-center gap-2 ${n <= step ? 'text-cyber-accent' : 'text-cyber-muted/30'}`}>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-300 ${
                      n < step ? 'bg-cyber-accent border-cyber-accent text-black' :
                      n === step ? 'border-cyber-accent text-cyber-accent shadow-[0_0_10px_rgba(255,0,60,0.4)]' :
                      'border-cyber-muted/20 text-cyber-muted/30'
                    }`}>
                      {n < step ? '✓' : n === 2 ? <Fingerprint className="w-3.5 h-3.5" /> : n}
                    </div>
                    <span className="text-xs font-mono hidden sm:block">{label}</span>
                  </div>
                  {idx < 1 && <div className={`flex-1 h-px transition-all duration-500 ${n < step ? 'bg-cyber-accent' : 'bg-white/10'}`} />}
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-4 bg-cyber-accent/10 border border-cyber-accent/60 text-cyber-accent p-3 rounded-xl flex items-center gap-2 text-sm"
                      >
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleCredentials} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-cyber-accent/80 mb-2 uppercase tracking-wider">Admin Email</label>
                      <Input icon={Mail} type="email" placeholder="admin@cybershield.io"
                        value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-cyber-accent/80 mb-2 uppercase tracking-wider">Admin Password</label>
                      <div className="relative">
                        <Input icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="••••••••••••"
                          value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-accent transition-colors" tabIndex={-1}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" variant="danger" className="w-full py-3 font-black tracking-widest mt-2" disabled={loading}>
                      {loading
                        ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />VERIFYING...</span>
                        : <span className="flex items-center gap-2"><Eye className="w-4 h-4" />AUTHENTICATE</span>
                      }
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col items-center"
                >
                  {/* Status message */}
                  <p className="text-cyber-muted text-xs text-center mb-3 font-mono leading-relaxed">
                    {cameraState === 'denied'
                      ? '⚠ Camera permission blocked — allow it in browser settings'
                      : cameraState === 'active' && scanStatus === 'waiting'
                      ? 'Camera ready — position your face and click SCAN FACE'
                      : cameraState === 'active' && scanStatus === 'scanning'
                      ? 'Hold still — scanning in progress...'
                      : scanStatus === 'success'
                      ? '✓ Biometric verification complete'
                      : 'Click START CAMERA to begin face verification'
                    }
                  </p>

                  {/* Attempts */}
                  {attemptsLeft < 3 && scanStatus !== 'success' && (
                    <div className="mb-3 px-3 py-1 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30 text-cyber-accent text-xs font-mono font-bold">
                      ⚠ {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                    </div>
                  )}

                  {/* Camera box */}
                  <div className={`relative w-full max-w-xs aspect-video rounded-xl overflow-hidden border-2 mb-4 bg-black transition-all duration-300 ${
                    scanStatus === 'success' ? 'border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.5)]' :
                    scanStatus === 'scanning' ? 'border-cyber-accent shadow-[0_0_20px_rgba(255,0,60,0.4)]' :
                    cameraState === 'active' ? 'border-cyber-accent/60' :
                    cameraState === 'denied' ? 'border-cyber-accent/40' :
                    'border-white/10'
                  }`}>

                    {/* Live video — always rendered so ref is available */}
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                        cameraState === 'active' && scanStatus !== 'success' ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    {/* Overlay content */}
                    {renderCameraContent()}

                    {/* Scanning overlays (on top of video) */}
                    {cameraState === 'active' && scanStatus === 'scanning' && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Corner brackets */}
                        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyber-accent" />
                        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyber-accent" />
                        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyber-accent" />
                        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyber-accent" />
                        {/* Face oval */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-32 rounded-full border border-cyber-accent/50" />
                        </div>
                        {/* Scan beam */}
                        <motion.div
                          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyber-accent to-transparent shadow-[0_0_8px_rgba(255,0,60,1)]"
                          animate={{ top: ['5%', '95%', '5%'] }}
                          transition={{ duration: 1.6, ease: 'linear', repeat: Infinity }}
                        />
                      </div>
                    )}

                    {/* Idle guide when camera active */}
                    {cameraState === 'active' && scanStatus === 'waiting' && (
                      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                        <div className="w-24 h-32 rounded-full border border-cyber-accent/30 animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {(scanStatus === 'scanning' || scanStatus === 'success') && (
                    <div className="w-full mb-4">
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-cyber-muted">Biometric Analysis</span>
                        <span className={scanStatus === 'success' ? 'text-green-400' : 'text-cyber-accent'}>
                          {Math.round(scanProgress)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${scanStatus === 'success' ? 'bg-green-400' : 'bg-cyber-accent'}`}
                          style={{ width: `${scanProgress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      <p className={`text-xs font-mono text-center mt-2 ${scanStatus === 'success' ? 'text-green-400' : 'text-cyber-accent animate-pulse'}`}>
                        {SCAN_STEPS[scanStepIdx]}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 w-full">
                    {/* START CAMERA */}
                    {(cameraState === 'idle' || cameraState === 'denied' || cameraState === 'error') && scanStatus !== 'success' && (
                      <Button onClick={requestCamera} variant="danger" className="flex-1 py-2.5 font-bold tracking-wider">
                        <RefreshCw className="w-4 h-4" />
                        {cameraState === 'denied' ? 'RETRY CAMERA' : 'START CAMERA'}
                      </Button>
                    )}

                    {/* SCAN FACE */}
                    {cameraState === 'active' && scanStatus === 'waiting' && (
                      <Button onClick={startFaceScan} variant="danger" className="flex-1 py-2.5 font-bold tracking-wider">
                        <Camera className="w-4 h-4" />
                        SCAN FACE
                      </Button>
                    )}

                    {/* SCANNING (disabled) */}
                    {scanStatus === 'scanning' && (
                      <Button variant="danger" className="flex-1 py-2.5 font-bold opacity-70 cursor-not-allowed" disabled>
                        <Cpu className="w-4 h-4 animate-spin" />
                        SCANNING...
                      </Button>
                    )}

                    {/* RETRY after failed */}
                    {scanStatus === 'failed' && (
                      <Button onClick={handleRetry} variant="danger" className="flex-1 py-2.5 font-bold">
                        <RefreshCw className="w-4 h-4" />
                        RETRY SCAN
                      </Button>
                    )}

                    {/* Manual override — always visible for testing/fallback */}
                    {scanStatus !== 'success' && (
                      <Button onClick={commitAndRedirect} variant="ghost" className="flex-1 py-2.5 text-xs border border-white/10">
                        Manual Override (Skip)
                      </Button>
                    )}
                  </div>

                  <p className="text-cyber-muted/30 text-[10px] font-mono text-center mt-4">
                    Face data is processed locally and never stored
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
