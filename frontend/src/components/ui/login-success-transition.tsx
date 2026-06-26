import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * LoginSuccessTransition
 *
 * Full-screen sequence after successful authentication:
 *  Phase 1 — "iris-close" (0ms → 1400ms)
 *    A solid #020617 overlay expands from the edges via an SVG mask,
 *    collapsing the dot-grid into darkness. The transparent "hole" (black
 *    circle in the mask) shrinks from 150vmax → 0.
 *
 *  Phase 2 — "success" (1500ms → 3800ms)
 *    Full-screen, no card. Checkmark animates in, then large hero
 *    "You're In!" text fades + slides up, then a subtitle.
 *
 *  Phase 3 — navigate to /dashboard (3800ms)
 */

type Phase = 'iris-close' | 'success' | 'done';

export const LoginSuccessTransition: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('iris-close');

  useEffect(() => {
    // Iris close animation runs for 1400ms, then switch to success state
    const t1 = setTimeout(() => setPhase('success'), 1400);

    // Stay on success screen for ~2400ms, then navigate
    const t2 = setTimeout(() => {
      setPhase('done');
      navigate('/dashboard');
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">

      {/* ── Phase 1: SVG iris-close mask ── */}
      {/* A full-screen SVG where the white rect (= opaque #020617 cover)
          has a black circle cut out. That circle shrinks from 150vmax → 0,
          making the background appear to "close" like an iris shutter. */}
      <AnimatePresence>
        {phase === 'iris-close' && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask id="iris-mask-ss">
                  {/* White = render the fill color; Black = transparent hole */}
                  <rect width="100%" height="100%" fill="white" />
                  {/* The shrinking hole — starts large (shows the dot grid), closes to 0 */}
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r={0}
                    initial={{ r: 150 * Math.max(window.innerWidth, window.innerHeight) / 100 }}
                    animate={{ r: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.55, 0, 0.45, 1], // smooth sigmoid
                    }}
                    fill="black"
                  />
                </mask>
              </defs>
              {/* The solid background color exposed as the iris closes */}
              <rect
                width="100%"
                height="100%"
                fill="#020617"
                mask="url(#iris-mask-ss)"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Permanent dark backdrop (shows once iris finishes) ── */}
      <div className="absolute inset-0 bg-[#020617]" style={{ zIndex: -1 }} />

      {/* ── Phase 2: Full-screen success state ── */}
      <AnimatePresence>
        {phase === 'success' && (
          <motion.div
            key="success-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center select-none"
          >
            {/* Checkmark circle */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.25)',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M4 12.5L9.5 18L20 7"
                  stroke="rgba(6,182,212,0.9)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                />
              </svg>
            </motion.div>

            {/* Hero headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.1 }}
            >
              You're In!
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.5, ease: 'easeOut' }}
              className="mt-4 text-xl font-medium"
              style={{ color: 'rgba(255,255,255,0.38)' }}
            >
              Welcome back to SpringSight
            </motion.p>

            {/* Redirecting hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="mt-10 text-sm tracking-widest uppercase"
              style={{ color: 'rgba(6,182,212,0.5)', letterSpacing: '0.18em' }}
            >
              Entering dashboard…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
