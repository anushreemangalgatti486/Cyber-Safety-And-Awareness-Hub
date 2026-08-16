import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingSkeleton - Animated placeholder for loading states
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-panel rounded-xl p-5 overflow-hidden relative ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.05), transparent)',
        }}
      />
      <div className="h-3 bg-white/5 rounded-full w-1/3 mb-3" />
      <div className="h-8 bg-white/5 rounded-full w-1/2 mb-2" />
      <div className="h-2 bg-white/5 rounded-full w-2/3" />
    </div>
  );
}

export function SkeletonRow({ className = '' }) {
  return (
    <div className={`glass-panel rounded-xl p-4 flex items-center gap-4 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded-full w-1/3" />
        <div className="h-2 bg-white/5 rounded-full w-2/3" />
      </div>
      <div className="w-16 h-6 bg-white/5 rounded-full" />
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-2 bg-white/5 rounded-full"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export default function LoadingSkeleton({ type = 'cards', count = 4 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (type === 'rows') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  return null;
}
