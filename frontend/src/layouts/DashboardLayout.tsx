import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Pulse,
  CloudArrowUp,
  ClockCounterClockwise,
  GearSix,
  SignOut,
  List,
  X,
  MagnifyingGlass,
  Bell,
  CheckCircle,
  WarningOctagon,
  Warning,
  Info,
  User,
  Key,
  ShieldCheck,
  Trash,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { CommandSearch } from '../components/ui/command-search';
import { SpringSightLogo } from '../components/ui/springsight-logo';
import { ProgressBar } from '../components/ui/atoms/progress-bar';
import { Sidebar001Item } from '../components/ui/sidebar-001';

// ── Nav items ──────────────────────────────────────────────────────────────

const menuItems = [
  { name: 'AI Log Analysis',   path: '/dashboard', icon: Pulse },
  { name: 'Upload Logs',       path: '/upload',    icon: CloudArrowUp },
  { name: 'Analysis History',  path: '/reports',   icon: ClockCounterClockwise },
  { name: 'Settings',          path: '/settings',  icon: GearSix },
];

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: 'critical' | 'warning' | 'info';
  unread: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: 'AI RCA Incident Generated',
    desc: 'Critical BeanCreationException diagnosed in production-spring-boot.log',
    time: '2m ago',
    type: 'critical',
    unread: true,
    link: '/reports',
  },
  {
    id: 2,
    title: 'Ingestion Anomaly Detected',
    desc: 'High rate of ConnectException in gateway-access.log',
    time: '15m ago',
    type: 'warning',
    unread: true,
    link: '/reports',
  },
  {
    id: 3,
    title: 'Gemini 2.5 Flash Calibrated',
    desc: 'AI root cause diagnostic engine updated and online',
    time: '1h ago',
    type: 'info',
    unread: true,
    link: '/settings',
  },
];

// ── Layout ─────────────────────────────────────────────────────────────────

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const deleteNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  /** User initials — first letter of each word, max 2 chars */
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'M';

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col md:flex-row font-sans">

      {/* Global Cmd+K search palette */}
      <CommandSearch />

      {/* Top-of-screen thin progress bar */}
      <ProgressBar isActive={false} progress={0} />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex md:w-64 bg-[#060913] border-r border-[#1E293B] flex-col shrink-0">

        {/* Logo area - matched to 64px header height */}
        <div className="h-16 px-5 border-b border-[#1E293B] flex items-center shrink-0">
          <SpringSightLogo size="sm" />
        </div>

        {/* Navigation — 21st.dev Sidebar001 pattern */}
        <nav className="flex-1 p-3 flex flex-col overflow-y-auto">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link key={item.name} to={item.path} className="block">
                  <Sidebar001Item
                    label={item.name}
                    isActive={active}
                    icon={<Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile strip */}
        <div className="p-3 border-t border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/30 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F8FAFC] truncate leading-tight">
                {user?.name || 'Mihir Singh'}
              </p>
              <p className="text-[10px] text-[#64748B] truncate leading-tight">
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <SignOut className="h-4 w-4" weight="bold" />
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex items-center justify-between px-4 h-16 bg-[#060913] border-b border-[#1E293B] shrink-0">
        <SpringSightLogo size="sm" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#94A3B8] hover:text-white rounded-lg cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <List className="h-6 w-6" />}
        </button>
      </div>

      {/* ── Mobile Nav Dropdown ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#060913] border-b border-[#1E293B] px-4 py-3 space-y-1"
          >
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-white bg-[#1E293B]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#0F172A]'
                  }`}
                >
                  <Icon className="h-4 w-4" weight="duotone" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <SignOut className="h-4 w-4" weight="bold" />
              Sign Out
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar — 64px height, vertically centered on baseline */}
        <header className="h-16 border-b border-[#1E293B] bg-[#060913]/90 backdrop-blur-md px-6 md:px-8 flex items-center justify-between shrink-0 relative z-40">

          {/* Search launcher — 44px height, 380px wide, single line text */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }))}
            className="h-11 w-80 lg:w-[380px] flex items-center gap-3 bg-[#1E293B]/60 border border-[#334155] hover:border-slate-500/60 rounded-xl px-3.5 text-xs text-[#64748B] hover:text-[#94A3B8] transition-all duration-200 cursor-pointer text-left shrink-0 shadow-xs"
          >
            <MagnifyingGlass className="h-4 w-4 text-slate-400 shrink-0" weight="bold" />
            <span className="flex-1 truncate whitespace-nowrap text-[12px] font-medium text-slate-400">
              Search logs, reports, stack traces...
            </span>
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            <div className="hidden lg:flex items-center gap-2 h-9 text-xs font-semibold text-slate-300 bg-slate-800/60 border border-slate-700/60 px-3.5 rounded-xl whitespace-nowrap select-none">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              Diagnostics Online
            </div>

            {/* ── Interactive Notifications Popover ── */}
            <div ref={notifRef} className="relative flex items-center">
              <button
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
                className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                  notificationsOpen
                    ? 'text-white bg-slate-800 border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Bell className="h-5 w-5" weight={unreadCount > 0 ? 'bold' : 'regular'} />
              </button>

              {unreadCount > 0 && (
                <span
                  aria-label={`${unreadCount} notifications`}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold pointer-events-none shadow-sm animate-pulse"
                >
                  {unreadCount}
                </span>
              )}

              {/* Popover Card */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -6, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.92, y: -6, filter: 'blur(3px)' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.6 }}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/80"
                  >
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between bg-[#0d1220]/80">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-800/50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (n.link) {
                                navigate(n.link);
                                setNotificationsOpen(false);
                              }
                            }}
                            className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-800/40 ${
                              n.unread ? 'bg-indigo-950/15' : ''
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {n.type === 'critical' && (
                                <WarningOctagon className="h-4 w-4 text-rose-400" weight="duotone" />
                              )}
                              {n.type === 'warning' && (
                                <Warning className="h-4 w-4 text-amber-400" weight="duotone" />
                              )}
                              {n.type === 'info' && (
                                <Info className="h-4 w-4 text-indigo-400" weight="duotone" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-xs font-semibold truncate ${n.unread ? 'text-white' : 'text-slate-300'}`}>
                                  {n.title}
                                </p>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                  {n.time}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                {n.desc}
                              </p>
                            </div>
                            <button
                              onClick={(e) => deleteNotification(e, n.id)}
                              className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors shrink-0"
                              title="Dismiss"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-2.5 bg-[#080c14] text-center">
                      <button
                        onClick={() => {
                          navigate('/reports');
                          setNotificationsOpen(false);
                        }}
                        className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center justify-center gap-1.5 w-full py-1 transition-colors cursor-pointer"
                      >
                        View all incidents & reports <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Interactive User Avatar Dropdown ── */}
            <div ref={profileRef} className="relative flex items-center">
              <button
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                title={user?.name || 'Account Menu'}
                aria-label="Account Menu"
                className={`w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 border text-white text-xs font-bold flex items-center justify-center cursor-pointer transition-all duration-200 select-none shrink-0 ${
                  profileOpen
                    ? 'border-indigo-400 ring-2 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'border-cyan-400/40 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                }`}
              >
                {initials}
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -6, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.92, y: -6, filter: 'blur(3px)' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.6 }}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-0 top-12 w-64 bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1"
                  >
                    {/* Header */}
                    <div className="p-3 bg-[#0d1220]/60 rounded-xl mb-1 border border-slate-800/60">
                      <p className="text-xs font-bold text-white truncate">{user?.name || 'Mihir Singh'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@springsight.ai'}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-indigo-400 font-semibold bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-md w-max">
                        <ShieldCheck className="h-3 w-3" weight="duotone" /> Administrator
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
                    >
                      <User className="h-4 w-4 text-slate-400" weight="duotone" />
                      Account Settings
                    </button>

                    <button
                      onClick={() => {
                        navigate('/settings');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
                    >
                      <Key className="h-4 w-4 text-slate-400" weight="duotone" />
                      API Ingestion Tokens
                    </button>

                    <button
                      onClick={() => {
                        navigate('/reports');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
                    >
                      <Pulse className="h-4 w-4 text-slate-400" weight="duotone" />
                      Analysis History
                    </button>

                    <div className="h-px bg-slate-800 my-1" />

                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                    >
                      <SignOut className="h-4 w-4" weight="bold" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content with synchronized smooth transition */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
