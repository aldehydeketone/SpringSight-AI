import React from 'react';
import { useAuth } from '../lib/auth';
import { User, LogOut, Shield, ShieldCheck, Mail, Calendar } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Console Configuration</h2>
        <p className="text-xs text-[#94a3b8]">Manage developer credentials and settings.</p>
      </div>

      <div className="bg-[#12121a] border border-[#1e293b] rounded-xl p-6 shadow-lg space-y-6">
        <div className="flex items-center space-x-4 border-b border-[#1e293b] pb-5">
          <div className="h-16 w-16 rounded-full bg-[#1a1a2e] border border-[#1e293b] flex items-center justify-center font-bold text-cyan-400 text-xl shadow-lg">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">{user?.name}</h3>
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 w-max mt-1">
              <ShieldCheck className="h-3 w-3" />
              Console Administrator
            </span>
          </div>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3">
            <span className="text-[#94a3b8] flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              EMAIL ADDRESS
            </span>
            <span className="text-white font-semibold">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3">
            <span className="text-[#94a3b8] flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              REGISTRATION DATE
            </span>
            <span className="text-white font-semibold">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3">
            <span className="text-[#94a3b8] flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              ROLE STATUS
            </span>
            <span className="text-green-400 font-bold">ACTIVE DEPLOYMENT</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full md:w-auto bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            Sign Out of Console
          </button>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
