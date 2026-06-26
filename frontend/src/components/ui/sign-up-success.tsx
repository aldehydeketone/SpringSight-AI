import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SignUpSuccessProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onContinue?: () => void;
}

export const SignUpSuccess = ({
  title = "You're in!",
  subtitle = "Welcome",
  buttonText = "Continue to Dashboard",
  onContinue,
}: SignUpSuccessProps) => {
  const [dotsVisible, setDotsVisible] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Dots close first (fade + scale out)
    const closeTimer = setTimeout(() => setDotsVisible(false), 100);
    // Success content reveals right after dots finish closing
    const successTimer = setTimeout(() => setShowSuccess(true), 700);
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(successTimer);
    };
  }, []);

  return (
    <div className="flex w-full min-h-screen flex-col items-center justify-center bg-[#020817] relative overflow-hidden select-none text-white font-sans">
      {/* Background Gradient */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, #041326 0%, #020817 65%, #0A1F3D 100%)' }} />

      {/* Dot-grid background — matches the site's existing navy theme */}
      <AnimatePresence>
        {dotsVisible && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(0, 200, 255, 0.15) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        )}
      </AnimatePresence>

      {/* Ambient glow stays under the success content */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[50vh] rounded-b-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 space-y-6 text-center w-full max-w-sm px-4"
          >
            <div className="space-y-1">
              <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                {title}
              </h1>
              <p className="text-[1.25rem] text-white/50 font-light">{subtitle}</p>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="py-10"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-600 flex items-center justify-center shadow-[0_0_25px_rgba(0,170,255,0.4)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-black"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={onContinue}
              className="w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition-colors"
            >
              {buttonText}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
