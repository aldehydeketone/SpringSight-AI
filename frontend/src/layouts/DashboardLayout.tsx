import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  Upload,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bot,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { CommandSearch } from '../components/ui/command-search';
import { SpringSightLogo } from '../components/ui/springsight-logo';
import { ProgressBar } from '../components/ui/atoms/progress-bar';

// ── Nav items ──────────────────────────────────────────────────────────────

const menuItems = [
  { name: 'AI Log Analysis',   path: '/dashboard', icon: Brain },
  { name: 'Upload Logs',       path: '/upload',    icon: Upload },
  { name: 'Analysis History',  path: '/reports',   icon: FileText },
  { name: 'Settings',          path: '/settings',  icon: Settings },
];

// ── Layout ─────────────────────────────────────────────────────────────────

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  /** User initials — first letter of each word, max 2 chars */
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col md:flex-row font-sans">

      {/* Global Cmd+K search palette */}
      <CommandSearch />

      {/* Top-of-screen thin progress bar */}
      <ProgressBar isActive={false} progress={0} />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex md:w-64 bg-[#060913] border-r border-[#1E293B] flex-col shrink-0">

        {/* Logo area */}
        <div className="px-4 py-4 border-b border-[#1E293B]">
          <SpringSightLogo size="sm" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 relative">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-colors duration-200 group"
                style={{
                  color: active ? '#F8FAFC' : '#94A3B8',
                }}
              >
                {/* Framer Motion sliding active background */}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: '#1E293B' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}

                {/* Cyan left accent on active */}
                {active && (
                  <motion.div
                    layoutId="activeNavAccent"
                    className="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded-full"
                    style={{ backgroundColor: '#00C8FF' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}

                {/* Hover bg for inactive */}
                {!active && (
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#1E293B]/60" />
                )}

                <Icon className="relative h-4 w-4 shrink-0 z-10" />
                <span
                  className="relative z-10 transition-colors duration-200"
                  style={{ color: active ? '#F8FAFC' : undefined }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-xs font-bold text-[#00C8FF] shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F8FAFC] truncate leading-tight">
                  {user?.name ?? 'User'}
                </p>
                <p className="text-[10px] text-[#64748B] leading-tight mt-0.5">
                  Administrator
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#94A3B8] hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors duration-200 cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden bg-[#060913] border-b border-[#1E293B] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">
            S
          </div>
          <span className="font-extrabold text-sm text-white">SpringSight AI</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg cursor-pointer transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-[#060913] border-b border-[#1E293B] px-4 py-3 space-y-1"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-[#1E293B] text-white border-l-2 border-[#00C8FF]'
                      : 'text-[#94A3B8] hover:bg-[#1E293B]/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content Column ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Desktop top header */}
        <header className="hidden md:flex h-14 border-b border-[#1E293B] items-center justify-between px-6 bg-[#0F172A] shrink-0">

          {/* Search launcher */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }))}
            className="flex items-center gap-3 bg-[#1E293B]/60 border border-[#334155] rounded-lg px-4 py-2 text-xs text-[#64748B] hover:border-[#00C8FF]/30 hover:text-[#94A3B8] transition-all duration-200 cursor-pointer w-72 text-left"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1">Search logs, reports, stack traces...</span>
            <kbd className="bg-[#0F172A] border border-[#334155] text-[9px] px-1.5 py-0.5 rounded font-mono text-[#00C8FF] font-bold uppercase">
              Ctrl+K
            </kbd>
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-4">

            {/* Diagnostics pill */}
            <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/20 px-2 py-1 rounded-full whitespace-nowrap">
              <Bot className="h-3.5 w-3.5" />
              Diagnostics Core Online
            </span>

            {/* Bell with badge */}
            <div className="relative">
              <button
                aria-label="Notifications"
                className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <Bell className="h-5 w-5" />
              </button>
              <span
                aria-label="3 notifications"
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold pointer-events-none"
              >
                3
              </span>
            </div>

            {/* User avatar */}
            <div
              title={user?.name}
              className="w-8 h-8 rounded-full bg-[#1E293B] border border-[#334155] text-[#00C8FF] text-xs font-semibold flex items-center justify-center cursor-pointer hover:border-[#00C8FF]/60 transition-colors duration-200 select-none"
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
