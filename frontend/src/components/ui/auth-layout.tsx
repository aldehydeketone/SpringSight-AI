import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundEffect } from './background-effect';
import { SpringSightLogo } from './springsight-logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  isSuccess?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, isSuccess = false }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4 font-sans">
      {/* SpringSight dot-matrix background */}
      <BackgroundEffect />

      <AnimatePresence>
        {!isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[480px]"
          >
            {/* Logo container with exact 28px margin below to subtitle */}
            <div className="mb-7 flex justify-center">
              <SpringSightLogo />
            </div>

            {/* Clean, box-less container for the form */}
            <div className="w-full">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
