import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'landing' | 'dashboard';
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ variant = 'dashboard' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Base micro-grid with radial mask */}
      <div
        className="absolute inset-0 bg-grid-pattern opacity-70"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 25%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 25%, #000 40%, transparent 100%)',
        }}
      />

      {/* Primary atmospheric violet glow */}
      <motion.div
        className="absolute -top-48 -left-32 w-[520px] h-[520px] rounded-full blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(99,102,241,0.08) 55%, transparent 75%)',
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 30, -10, 0],
                y: [0, 20, -15, 0],
                scale: [1, 1.06, 0.98, 1],
              }
        }
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary atmospheric cyan glow */}
      <motion.div
        className="absolute top-1/4 -right-40 w-[480px] h-[480px] rounded-full blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.16) 0%, rgba(99,102,241,0.06) 55%, transparent 75%)',
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -25, 15, 0],
                y: [0, -20, 25, 0],
                scale: [1, 0.95, 1.05, 1],
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {variant === 'landing' && (
        <motion.div
          className="hidden md:block absolute bottom-[-140px] left-1/3 w-[560px] h-[360px] rounded-full blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: [0.5, 0.85, 0.5],
                }
          }
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Subtle film/noise texture */}
      <div className="absolute inset-0 noise-overlay opacity-80" />
    </div>
  );
};
