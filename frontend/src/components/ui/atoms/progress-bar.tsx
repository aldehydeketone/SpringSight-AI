import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  /** Whether a loading operation is currently in flight */
  isActive: boolean;
  /** 0–100. Parent controls this value. */
  progress: number;
}

/**
 * ProgressBar — Atom
 *
 * Renders a 2px thin bar pinned to the very top of the viewport.
 * - Uses a CSS transition on `width` for smooth animation (not JS RAF).
 * - When isActive=false and progress reaches 100: stays visible for 400ms
 *   (matching the CSS transition), then fades to opacity-0.
 * - Color: blue #3B82F6 → cyan #00C8FF gradient (brand tokens).
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ isActive, progress }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
    } else if (progress >= 100) {
      // Keep visible for 400ms (width transition) then fade out
      const timer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isActive, progress]);

  if (!visible && !isActive) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      style={{ backgroundColor: 'transparent' }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.min(progress, 100)}%`,
          background: 'linear-gradient(to right, #3B82F6, #00C8FF)',
          transition: 'width 400ms linear',
          opacity: visible ? 1 : 0,
          transitionProperty: 'width, opacity',
        }}
      />
    </div>
  );
};

export default ProgressBar;
