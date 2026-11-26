import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'completed';

interface AiOrbProps {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: {
    container: 'w-28 h-28',
    core: 'w-14 h-14',
    ring1: 'w-20 h-20',
    ring2: 'w-24 h-24',
    ring3: 'w-28 h-28',
  },
  md: {
    container: 'w-44 h-44 sm:w-48 sm:h-48',
    core: 'w-22 h-22 sm:w-24 sm:h-24',
    ring1: 'w-30 h-30 sm:w-32 sm:h-32',
    ring2: 'w-36 h-36 sm:w-40 sm:h-40',
    ring3: 'w-44 h-44 sm:w-48 sm:h-48',
  },
  lg: {
    container: 'w-56 h-56 sm:w-72 sm:h-72',
    core: 'w-28 h-28 sm:w-36 sm:h-36',
    ring1: 'w-40 h-40 sm:w-48 sm:h-48',
    ring2: 'w-48 h-48 sm:w-60 sm:h-60',
    ring3: 'w-56 h-56 sm:w-72 sm:h-72',
  },
};

const statePalette: Record<
  OrbState,
  { core: string; glow: string; ringOuter: string; ringMid: string; accent: string }
> = {
  idle: {
    core: 'from-indigo-500/90 via-primary/85 to-secondary/75',
    glow: 'rgba(139, 92, 246, 0.34)',
    ringOuter: 'rgba(34, 211, 238, 0.24)',
    ringMid: 'rgba(139, 92, 246, 0.38)',
    accent: '#22D3EE',
  },
  listening: {
    core: 'from-secondary via-cyan-400 to-indigo-500',
    glow: 'rgba(34, 211, 238, 0.44)',
    ringOuter: 'rgba(34, 211, 238, 0.5)',
    ringMid: 'rgba(99, 102, 241, 0.45)',
    accent: '#22D3EE',
  },
  thinking: {
    core: 'from-amber-400 via-primary to-indigo-600',
    glow: 'rgba(245, 158, 11, 0.36)',
    ringOuter: 'rgba(245, 158, 11, 0.4)',
    ringMid: 'rgba(139, 92, 246, 0.5)',
    accent: '#F59E0B',
  },
  speaking: {
    core: 'from-primary via-fuchsia-500 to-secondary',
    glow: 'rgba(139, 92, 246, 0.48)',
    ringOuter: 'rgba(217, 70, 239, 0.45)',
    ringMid: 'rgba(34, 211, 238, 0.5)',
    accent: '#E879F9',
  },
  completed: {
    core: 'from-emerald-400 via-teal-400 to-secondary',
    glow: 'rgba(16, 185, 129, 0.4)',
    ringOuter: 'rgba(16, 185, 129, 0.45)',
    ringMid: 'rgba(34, 211, 238, 0.4)',
    accent: '#10B981',
  },
};

export const AiOrb: React.FC<AiOrbProps> = ({ state = 'idle', size = 'lg' }) => {
  const shouldReduceMotion = useReducedMotion();
  const s = sizeMap[size];
  const palette = statePalette[state];

  const pulseDuration =
    state === 'speaking' ? 0.85 : state === 'listening' ? 1.25 : state === 'thinking' ? 1.5 : 3.6;

  const scaleRange =
    state === 'speaking'
      ? [1, 1.11, 0.97, 1.07, 1]
      : state === 'listening'
      ? [1, 1.06, 1]
      : state === 'thinking'
      ? [1, 1.035, 0.985, 1]
      : [1, 1.03, 1];

  return (
    <div className={`relative flex items-center justify-center ${s.container} select-none`}>
      {/* Controlled ambient radial halo */}
      <motion.div
        className="absolute inset-2 rounded-full blur-2xl will-change-transform"
        style={{ background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)` }}
        animate={
          shouldReduceMotion
            ? undefined
            : { scale: scaleRange, opacity: state === 'idle' ? [0.4, 0.65, 0.4] : [0.55, 0.85, 0.55] }
        }
        transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Expanding acoustic wave ripples during active states */}
      {!shouldReduceMotion && (state === 'listening' || state === 'speaking') && (
        <>
          <motion.div
            className={`absolute ${s.ring2} rounded-full border will-change-transform`}
            style={{ borderColor: palette.ringOuter }}
            initial={{ scale: 0.86, opacity: 0.6 }}
            animate={{ scale: 1.32, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className={`absolute ${s.ring2} rounded-full border will-change-transform`}
            style={{ borderColor: palette.ringMid }}
            initial={{ scale: 0.86, opacity: 0.45 }}
            animate={{ scale: 1.32, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.9 }}
          />
        </>
      )}

      {/* Outer precision SVG orbital ring with acoustic reticle ticks */}
      <motion.svg
        viewBox="0 0 240 240"
        className={`absolute ${s.ring3} will-change-transform`}
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: state === 'thinking' ? 5 : state === 'speaking' ? 10 : 24,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <circle
          cx="120"
          cy="120"
          r="112"
          fill="none"
          stroke={palette.ringOuter}
          strokeWidth="1"
          strokeDasharray={state === 'thinking' ? '8 10' : '48 16 12 16'}
        />
        <circle
          cx="120"
          cy="120"
          r="106"
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1"
          strokeDasharray="1 11"
        />
        <circle cx="120" cy="8" r="3" fill={palette.accent} opacity="0.9" />
      </motion.svg>

      {/* Middle counter-rotating orbital ring */}
      <motion.svg
        viewBox="0 0 200 200"
        className={`absolute ${s.ring2} will-change-transform`}
        animate={shouldReduceMotion ? undefined : { rotate: -360 }}
        transition={{
          duration: state === 'thinking' ? 6.5 : 16,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke={palette.ringMid}
          strokeWidth="1.25"
          strokeDasharray="60 28 18 28"
        />
        <circle cx="100" cy="192" r="2.5" fill="#fff" opacity="0.75" />
      </motion.svg>

      {/* Translucent glass shell */}
      <motion.div
        className={`absolute ${s.ring1} rounded-full border border-white/15 bg-white/[0.025] backdrop-blur-md will-change-transform`}
        style={{ boxShadow: 'inset 0 1px 12px rgba(255,255,255,0.08)' }}
        animate={shouldReduceMotion ? undefined : { scale: scaleRange }}
        transition={{ duration: pulseDuration * 0.9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Core luminous sphere */}
      <motion.div
        className={`relative ${s.core} rounded-full bg-gradient-to-br ${palette.core} shadow-2xl flex items-center justify-center overflow-hidden border border-white/25 will-change-transform`}
        animate={shouldReduceMotion ? undefined : { scale: scaleRange }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-gradient-to-br from-white/40 via-white/10 to-transparent blur-[2px]" />
        <motion.div
          className="absolute inset-2 rounded-full opacity-50 will-change-transform"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.35) 25%, transparent 50%, rgba(34,211,238,0.4) 75%, transparent 100%)',
          }}
          animate={shouldReduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: state === 'speaking' ? 2.5 : 8, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
      </motion.div>
    </div>
  );
};
