import React from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info'
  | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

// ── Variant map ────────────────────────────────────────────────────────────

const variantStyles: Record<BadgeVariant, string> = {
  critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
  high:     'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  medium:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  low:      'bg-green-500/20 text-green-400 border border-green-500/30',
  info:     'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  default:  'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

// ── Component ──────────────────────────────────────────────────────────────

/**
 * Badge — Atom
 *
 * Severity pill with 6 semantic variants.
 * All variants share: text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center',
        'text-[11px] font-semibold uppercase tracking-wide',
        'px-2 py-0.5 rounded-full',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
};

export default Badge;
