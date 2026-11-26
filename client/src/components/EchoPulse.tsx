import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { OrbState } from './AiOrb';

interface EchoPulseProps {
  state?: OrbState;
  bars?: number;
  className?: string;
  height?: number;
}

export const EchoPulse: React.FC<EchoPulseProps> = ({
  state = 'idle',
  bars = 20,
  className = '',
  height = 36,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const barArray = Array.from({ length: bars }, (_, i) => i);

  const getColor = (i: number) => {
    if (state === 'completed') return 'bg-emerald-400';
    if (state === 'thinking') return i % 2 === 0 ? 'bg-amber-400' : 'bg-primary';
    if (state === 'speaking') return i % 3 === 0 ? 'bg-secondary' : 'bg-primary';
    if (state === 'listening') return i % 2 === 0 ? 'bg-secondary' : 'bg-indigo-400';
    return 'bg-white/25';
  };

  return (
    <div
      className={`flex items-center justify-center gap-[3px] ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {barArray.map((i) => {
        const centerDist = Math.abs(i - (bars - 1) / 2) / ((bars - 1) / 2);
        const envelope = Math.max(0.25, 1 - centerDist * 0.72);
        const maxH = Math.round(height * envelope);
        const minH = Math.max(4, Math.round(maxH * 0.22));

        const duration =
          state === 'speaking'
            ? 0.45 + (i % 4) * 0.1
            : state === 'listening'
            ? 0.7 + (i % 5) * 0.12
            : state === 'thinking'
            ? 0.9 + (i % 3) * 0.15
            : 2.2;

        return (
          <motion.span
            key={i}
            className={`w-[3px] rounded-full transition-colors duration-300 ${getColor(i)}`}
            animate={
              shouldReduceMotion || state === 'idle' || state === 'completed'
                ? { height: state === 'completed' ? maxH * 0.55 : minH + 3 }
                : {
                    height: [minH, maxH, Math.round(minH * 1.4), Math.round(maxH * 0.75), minH],
                    opacity: [0.55, 1, 0.7, 0.95, 0.55],
                  }
            }
            transition={{
              duration,
              repeat: state === 'idle' || state === 'completed' ? 0 : Infinity,
              ease: 'easeInOut',
              delay: i * 0.04,
            }}
          />
        );
      })}
    </div>
  );
};
