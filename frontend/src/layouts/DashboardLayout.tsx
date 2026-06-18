import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Monitor,
  Upload,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bot
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { CommandSearch } from '../components/ui/command-search';
import { SpringSightLogo } from '../components/ui/springsight-logo';


export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuItems = [
    { name: 'AI Log Analysis', path: '/dashboard', icon: <Monitor className="h-4.5 w-4.5" />, primary: false },
    { name: 'Upload Logs', path: '/upload', icon: <Upload className="h-4.5 w-4.5 animate-pulse" />, primary: true },
    { name: 'Analysis History', path: '/reports', icon: <FileText className="h-4.5 w-4.5" />, primary: false },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-4.5 w-4.5" />, primary: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f1f5f9] flex flex-col md:flex-row font-sans">
      {/* Cmd+K Palette */}
      <CommandSearch />


{/* Sidebar - Desktop */}
<aside className="hidden md:flex md:w-64 bg-[#12121a] border-r border-[#1e293b] flex-col shrink-0">

  {/* Sidebar Header */}
  <div className="px-3 py-4 border-b border-[#1e293b]">
    <div className="flex justify-center overflow-hidden">
      <div className="scale-[0.64] origin-center">
        <SpringSightLogo />
      </div>
    </div>

 
  </div>

  {/* Navigation */}
  <nav className="flex-1 p-4 space-y-2.5">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            if (item.primary) {
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white border border-blue-400/30 shadow-lg shadow-blue-600/20'
                      : 'bg-[#1b1b2f] border border-cyan-500/30 text-cyan-400 hover:border-cyan-400 hover:bg-[#20203a] hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                  {!active && (
                    <span className="ml-auto text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                      CTA
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-[#94a3b8] hover:bg-[#1a1a2e] hover:text-[#f1f5f9] border border-transparent'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-[#1e293b] bg-[#161622]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-[#1a1a2e] border border-[#1e293b] flex items-center justify-center font-bold text-cyan-400">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#f1f5f9] truncate">{user?.name}</p>
                <p className="text-[9px] text-[#94a3b8] truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Top Navigation - Mobile */}
      <header className="md:hidden bg-[#12121a] border-b border-[#1e293b] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">
            S
          </div>
          <span className="font-extrabold text-sm text-white">SpringSight AI</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-[#94a3b8] hover:text-white rounded-lg cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#12121a] border-b border-[#1e293b] px-4 py-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-2.5 rounded-lg text-xs font-semibold ${
                isActive(item.path)
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-[#94a3b8]'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center px-4 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 cursor-pointer"
          >
            <LogOut className="mr-3 h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Search Bar */}
        <header className="hidden md:flex h-16 border-b border-[#1e293b] items-center justify-between px-8 bg-[#0a0a0f]">
          {/* Global search launcher */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }))}
            className="flex items-center space-x-3 bg-[#12121a]/80 border border-[#1e293b] rounded-lg px-4 py-2 text-xs text-[#94a3b8]/50 hover:border-cyan-500/40 hover:text-[#94a3b8] transition-all cursor-pointer w-72 text-left"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1">Search reports, exceptions, fixes...</span>
            <kbd className="bg-[#1a1a2e] border border-[#1e293b] text-[9px] px-1.5 py-0.5 rounded font-mono text-cyan-400 font-bold uppercase">
              Ctrl+K
            </kbd>
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/20 px-2 py-1 rounded-full">
              <Bot className="h-3.5 w-3.5" />
              Diagnostics Core Online
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
