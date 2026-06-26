import React from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { BackgroundEffect } from './background-effect';
import { SpringSightLogo } from './springsight-logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  isSuccess?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, isSuccess = false }) => {
  // Subtle 3D tilt — ±2 degrees max
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [2, -2]);
  const rotateY = useTransform(mouseX, [-300, 300], [-2, 2]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4 py-12 font-sans">
      {/* Unchanged SpringSight dot-matrix background */}
      <BackgroundEffect />

      <AnimatePresence>
        {!isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[420px]"
            style={{ perspective: 1400 }}
          >
            {/* Unchanged SpringSight logo */}
            <div className="mb-7 flex justify-center">
              <SpringSightLogo />
            </div>

            {/* 3D tilt + subtle hover lift */}
            <motion.div
              style={{ rotateX, rotateY }}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="group relative"
            >
              {/* ── Very soft outer glow — only on hover, barely visible ── */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  boxShadow: '0 0 18px 2px rgba(6,182,212,0.05), 0 0 0 1px rgba(6,182,212,0.08)',
                }}
              />

              {/* ── Border beam wrapper — clips spinning gradient to card shape ── */}
              <div className="relative overflow-hidden rounded-2xl p-[1px]">

                {/* Spinning beam — thin, fast arc */}
                <div
                  aria-hidden="true"
                  className="animate-border-beam pointer-events-none absolute -inset-[200%] opacity-35"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, transparent 281deg, rgba(6,182,212,0.22) 287deg, rgba(186,230,253,0.30) 290deg, rgba(6,182,212,0.22) 293deg, transparent 299deg, transparent 360deg)',
                  }}
                />

                {/* Static base border — always visible, very dim */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />

                {/* ── Dark card surface — 95% dark, no internal glows ── */}
                <div
                  className="relative rounded-2xl p-7"
                  style={{
                    backgroundColor: 'rgba(8, 14, 28, 0.88)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  {children}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
