import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BackgroundEffect } from './background-effect';

/**
 * LoginSuccessTransition
 *
 * Uses advanced framer-motion UI patterns to create a stunning,
 * premium success sequence before entering the dashboard.
 */

type Phase = 'iris-close' | 'success' | 'done';

export const LoginSuccessTransition: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('iris-close');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('success'), 1200);
    const t2 = setTimeout(() => {
      setPhase('done');
      navigate('/dashboard');
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* ── Background: Deep dark base ── */}
      <div className="absolute inset-0 bg-[#060913]" style={{ zIndex: -1 }} />

      {/* ── Phase 1: Dynamic Iris Close ── */}
      <AnimatePresence>
        {phase === 'iris-close' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* The collapsing hole effect */}
            <motion.div
              className="rounded-full bg-transparent shadow-[0_0_0_100vmax_#060913]"
              initial={{ width: '150vmax', height: '150vmax' }}
              animate={{ width: 0, height: 0 }}
              transition={{
                duration: 1.0,
                ease: [0.65, 0, 0.35, 1], // Cinematic easing
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 2: Premium Success Animation ── */}
      <AnimatePresence>
        {phase === 'success' && (
          <motion.div
            key="success-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center select-none overflow-hidden"
          >
            {/* Dot Grid Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute inset-0 z-0"
            >
              <BackgroundEffect />
            </motion.div>

            {/* Clean Premium Checkmark Circle */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
              className="relative z-10 mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M5 13L9.5 17.5L19 6.5"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                />
              </svg>
            </motion.div>

            {/* Staggered Text Reveal */}
            <div className="overflow-hidden relative z-10">
              <motion.h1
                initial={{ y: '100%', opacity: 0, filter: 'blur(8px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.7,
                  delay: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Access Granted
              </motion.h1>
            </div>

            <div className="overflow-hidden mt-4 relative z-10">
              <motion.p
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.7,
                  delay: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-lg md:text-xl font-medium text-slate-400 max-w-sm"
              >
                Initializing your SpringSight environment.
              </motion.p>
            </div>

            {/* Redirecting Progress Bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 240 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="mt-12 h-1 bg-slate-800 rounded-full overflow-hidden relative z-10"
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 2.5, delay: 1.2, ease: 'linear' }}
                className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-4 text-[10px] tracking-[0.2em] uppercase text-cyan-500/70 font-semibold relative z-10"
            >
              Redirecting...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

