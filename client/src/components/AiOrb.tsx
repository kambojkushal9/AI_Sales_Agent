import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'completed';

interface AiOrbProps {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { container: 'w-28 h-28', core: 'w-14 h-14', ring1: 'w-20 h-20', ring2: 'w-24 h-24', ring3: 'w-28 h-28' },
  md: { container: 'w-48 h-48', core: 'w-24 h-24', ring1: 'w-32 h-32', ring2: 'w-40 h-40', ring3: 'w-48 h-48' },
  lg: { container: 'w-64 h-64', core: 'w-32 h-32', ring1: 'w-44 h-44', ring2: 'w-52 h-52', ring3: 'w-64 h-64' },
};

export const AiOrb: React.FC<AiOrbProps> = ({ state = 'idle', size = 'lg' }) => {
  const shouldReduceMotion = useReducedMotion();
  const s = sizeMap[size];

  const stateColors = {
    idle: 'from-primary/80 via-purple-500/70 to-secondary/70',
    listening: 'from-secondary via-cyan-400 to-primary',
    thinking: 'from-amber-400 via-primary to-secondary',
    speaking: 'from-primary via-fuchsia-500 to-secondary',
    completed: 'from-success via-emerald-400 to-secondary',
  };

  const pulseDuration =
    state === 'speaking' ? 0.9 : state === 'listening' ? 1.3 : state === 'thinking' ? 1.6 : 3.5;

  const scaleRange =
    state === 'speaking' ? [1, 1.15, 0.96, 1.1, 1] : state === 'listening' ? [1, 1.1, 1] : [1, 1.05, 1];

  return (
    <div className={`relative flex items-center justify-center ${s.container} select-none`}>
      {/* Ambient radial glow */}
      <motion.div
        className={`absolute inset-0 rounded-full blur-3xl opacity-40 bg-gradient-to-tr ${stateColors[state]}`}
        animate={shouldReduceMotion ? undefined : { scale: scaleRange, opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Outer ring */}
      <motion.div
        className={`absolute ${s.ring3} rounded-full border border-secondary/25`}
        style={{
          borderStyle: state === 'thinking' ? 'dashed' : 'solid',
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                rotate: state === 'thinking' ? 360 : 0,
                scale: state === 'listening' ? [1, 1.08, 1] : [1, 1.02, 1],
              }
        }
        transition={{
          rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
          scale: { duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Middle ring */}
      <motion.div
        className={`absolute ${s.ring2} rounded-full border border-primary/40`}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                rotate: state === 'thinking' ? -360 : 0,
                scale: state === 'speaking' ? [1, 1.12, 1] : [1, 1.04, 1],
              }
        }
        transition={{
          rotate: { duration: 6, repeat: Infinity, ease: 'linear' },
          scale: { duration: pulseDuration * 0.9, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Inner ring */}
      <motion.div
        className={`absolute ${s.ring1} rounded-full border border-white/20 bg-white/[0.02] backdrop-blur-sm`}
        animate={shouldReduceMotion ? undefined : { scale: scaleRange }}
        transition={{ duration: pulseDuration * 0.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Core sphere */}
      <motion.div
        className={`relative ${s.core} rounded-full bg-gradient-to-br ${stateColors[state]} shadow-2xl flex items-center justify-center overflow-hidden`}
        animate={shouldReduceMotion ? undefined : { scale: scaleRange }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-white/25 via-transparent to-transparent" />
        <div className="w-3 h-3 rounded-full bg-white/80 blur-[1px]" />
      </motion.div>
    </div>
  );
};
