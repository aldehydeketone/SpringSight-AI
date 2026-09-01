import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import {
  User,
  SignOut,
  ShieldCheck,
  EnvelopeSimple,
  CalendarBlank,
  Key,
  Cpu,
  Check,
  Copy,
  SlidersHorizontal,
  Sparkle,
  Stack,
  Pulse,
  TerminalWindow,
} from '@phosphor-icons/react';
import { GlowCard } from '../components/ui/glow-card';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [copiedKey, setCopiedKey] = useState(false);
  const [autoDiagnose, setAutoDiagnose] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState<'normal' | 'fast' | 'slow'>('normal');

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('ss_live_9f82a48b91c0e82711d954');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System & Account Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure diagnostic preferences, API integration, and console session.</p>
      </div>

      {/* Account Info Card */}
      <GlowCard
        glowColor="rgba(6,182,212,0.2)"
        glowOpacity={0.4}
        className="p-6 bg-[#0b0f19] border border-slate-800 shadow-xl space-y-6"
      >
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-base truncate">{user?.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-slate-300 font-medium bg-slate-800/80 border border-slate-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-max">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" weight="duotone" />
                Console Administrator
              </span>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                Active Session
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#080c14] border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <EnvelopeSimple className="h-4 w-4 text-slate-400" weight="duotone" /> Email Account
            </span>
            <p className="text-slate-200 font-medium">{user?.email}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080c14] border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <CalendarBlank className="h-4 w-4 text-slate-400" weight="duotone" /> Member Since
            </span>
            <p className="text-slate-200 font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'September 2026'}
            </p>
          </div>
        </div>
      </GlowCard>

      {/* AI Engine & Diagnostics Config */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-slate-300" weight="duotone" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">AI Diagnostic Engine</h4>
              <p className="text-[11px] text-slate-400">LLM model parameters & live parser integration</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-md">
            Gemini 2.5 Flash
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Toggle item */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#080c14] border border-slate-800/80">
            <div>
              <p className="font-semibold text-slate-200">Real-time Stream Auto-diagnostics</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Automatically trigger root cause analysis when critical logs are ingested.</p>
            </div>
            <button
              onClick={() => setAutoDiagnose(!autoDiagnose)}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                autoDiagnose ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoDiagnose ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* API Key Box */}
          <div className="p-3.5 rounded-xl bg-[#080c14] border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                <Key className="h-4 w-4 text-cyan-400" weight="duotone" /> CLI Ingestion Token
              </span>
              <button
                onClick={handleCopyKey}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" weight="bold" /> : <Copy className="h-3.5 w-3.5" weight="bold" />}
                {copiedKey ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="font-mono text-xs text-slate-300 bg-black/40 border border-slate-800 px-3 py-2 rounded-lg truncate">
              ss_live_9f82a48b91c0e82711d954
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#0b0f19] border border-red-900/30 rounded-xl p-5 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide">Sign Out of Session</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">End your current session on this console instance.</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-950/30 hover:bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <SignOut className="h-4 w-4" weight="bold" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
