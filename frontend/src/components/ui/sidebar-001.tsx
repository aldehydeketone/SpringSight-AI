"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface Sidebar001ItemProps {
  href?: string;
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isNew?: boolean;
  depth?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface Sidebar001GroupProps {
  label: string;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

interface Sidebar001SectionProps {
  label?: string;
  children: React.ReactNode;
}

// ── Item ───────────────────────────────────────────────────────────────────

export function Sidebar001Item({
  label,
  icon,
  isActive = false,
  isNew = false,
  depth = 0,
  onClick,
}: Sidebar001ItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-[10px] py-2.5 pr-3 text-[13px] tracking-wide transition-all duration-200 select-none cursor-pointer",
        depth === 0 ? "pl-3.5" : "pl-6",
        isActive
          ? "font-semibold text-white bg-white/[0.06]"
          : "font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
      )}
    >
      {/* Animated active left dash accent */}
      <span
        className={cn(
          "absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full transition-all duration-200",
          isActive
            ? "bg-indigo-500 opacity-100 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
            : "opacity-0"
        )}
      />

      {icon && (
        <span
          className={cn(
            "relative z-10 flex items-center justify-center shrink-0 transition-colors duration-200",
            isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
          )}
        >
          {icon}
        </span>
      )}

      <span className="relative z-10 flex-1 truncate">{label}</span>

      {isNew && (
        <span className="relative z-10 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
          NEW
        </span>
      )}
    </div>
  );
}

// ── Group (collapsible) ────────────────────────────────────────────────────

export function Sidebar001Group({
  label,
  defaultOpen = false,
  icon,
  children,
}: Sidebar001GroupProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
      >
        {icon && <span className="h-3.5 w-3.5 shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
        <span className="flex-1 text-left">{label}</span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.15 }}
          className="shrink-0"
        >
          <CaretDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-3 border-l border-border/40 ml-3 mt-0.5 space-y-0.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────

export function Sidebar001Section({ label, children }: Sidebar001SectionProps) {
  return (
    <div className="mb-4">
      {label && (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          {label}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────

export function Sidebar001({ children }: { children: React.ReactNode }) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col overflow-hidden border-r border-border bg-background">
      {children}
    </aside>
  );
}

export function Sidebar001Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 border-b border-border px-4 py-3">{children}</div>
  );
}

export function Sidebar001Content({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
      {children}
    </div>
  );
}

export function Sidebar001Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 border-t border-border px-4 py-3">{children}</div>
  );
}
