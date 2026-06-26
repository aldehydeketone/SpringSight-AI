import React, { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

// ── Toast atom ─────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

/**
 * Toast — Atom
 *
 * Single toast notification.
 * - Fixed position: bottom-4 right-4, z-50
 * - Auto-dismisses after 3000ms via useEffect
 * - Left accent: green-500 for success, red-500 for error
 * - Icon: CheckCircle2 | AlertCircle from lucide-react
 */
export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-3 min-w-[280px] max-w-[360px]',
        'bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-3 shadow-xl',
        isSuccess ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500',
      ].join(' ')}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        {isSuccess
          ? <CheckCircle2 className="h-4 w-4 text-green-400" />
          : <AlertCircle className="h-4 w-4 text-red-400" />
        }
      </div>

      {/* Message */}
      <p className="flex-1 text-sm text-slate-200 leading-snug">{message}</p>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer mt-0.5"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

// ── ToastContainer ─────────────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

/**
 * ToastContainer — renders all active toasts stacked at bottom-right.
 * Pass the array from useToast() hook.
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onDismiss={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
};

// ── useToast hook ──────────────────────────────────────────────────────────

export interface UseToastReturn {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

/**
 * useToast — manages an array of active toasts.
 *
 * Usage:
 * ```tsx
 * const { toasts, addToast, removeToast } = useToast();
 * // ...
 * addToast('Analysis complete', 'success');
 * // ...
 * <ToastContainer toasts={toasts} removeToast={removeToast} />
 * ```
 */
export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

export default Toast;
