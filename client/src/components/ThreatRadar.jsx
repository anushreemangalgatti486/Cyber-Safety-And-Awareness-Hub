import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * ThreatRadar - Animated radar scanner component
 * Pure CSS/Canvas radar with rotating sweep line
 */
export default function ThreatRadar({ threats = 0, size = 200 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const angleRef = useRef(0);

  // Generate random blip positions based on threat count
  const blipsRef = useRef(
    Array.from({ length: Math.min(threats, 8) }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.3 + Math.random() * 0.55,
      opacity: 0.5 + Math.random() * 0.5,
      size: 2 + Math.random() * 3,
    }))
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Background
      ctx.fillStyle = 'rgba(0, 10, 20, 0.8)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Concentric rings
      [0.25, 0.5, 0.75, 1].forEach((scale) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Cross hairs
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();

      // Sweep gradient
      const sweepGrad = ctx.createConicalGradient
        ? ctx.createConicalGradient(cx, cy, angleRef.current)
        : null;

      // Draw sweep line
      const sweepX = cx + Math.cos(angleRef.current) * r;
      const sweepY = cy + Math.sin(angleRef.current) * r;

      // Sweep trail (arc)
      const trailGrad = ctx.createLinearGradient(cx, cy, sweepX, sweepY);
      trailGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      trailGrad.addColorStop(1, 'rgba(0, 240, 255, 0.6)');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angleRef.current - 1.2, angleRef.current);
      ctx.lineTo(cx, cy);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.fill();

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 1)';
      ctx.shadowColor = 'rgba(0, 240, 255, 1)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Threat blips
      blipsRef.current.forEach((blip) => {
        const bx = cx + Math.cos(blip.angle) * r * blip.radius;
        const by = cy + Math.sin(blip.angle) * r * blip.radius;

        // Fade blip based on angle difference from sweep
        let angleDiff = angleRef.current - blip.angle;
        while (angleDiff < 0) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI * 2) angleDiff -= Math.PI * 2;
        const fade = Math.max(0, 1 - angleDiff / (Math.PI * 2));

        if (fade > 0.05) {
          ctx.beginPath();
          ctx.arc(bx, by, blip.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 0, 60, ${fade * blip.opacity})`;
          ctx.shadowColor = 'rgba(255, 0, 60, 0.8)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Advance angle
      angleRef.current += 0.025;
      if (angleRef.current > Math.PI * 2) angleRef.current -= Math.PI * 2;

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [size, threats]);

  // Update blips when threats change
  useEffect(() => {
    blipsRef.current = Array.from({ length: Math.min(threats, 8) }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.3 + Math.random() * 0.55,
      opacity: 0.5 + Math.random() * 0.5,
      size: 2 + Math.random() * 3,
    }));
  }, [threats]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full"
        style={{ filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.3))' }}
      />
      {/* Outer ring pulse */}
      <motion.div
        className="absolute inset-0 rounded-full border border-cyber-primary/20"
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
