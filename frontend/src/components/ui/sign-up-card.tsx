import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeClosed, ArrowRight } from 'lucide-react';
import { AuthService } from '../../services/auth.service';

export const SignUpCard: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getErrorMessage = (err: unknown) => {
    if (err && typeof err === 'object' && 'response' in err) {
      const r = (err as { response?: { data?: { message?: string } } }).response;
      return r?.data?.message || 'Registration failed. Please try again.';
    }
    return err instanceof Error ? err.message : 'Registration failed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await AuthService.register({ name, email, password });
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-4 text-center">
        <p className="text-lg font-semibold text-white">Account Created!</p>
        <p className="mt-1 text-sm text-white/50">Check your email to verify your account.</p>
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => navigate('/')}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
        >
          Go to Sign In
        </motion.button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 space-y-1 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold tracking-tight text-white"
        >
          Create Account
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-white/50"
        >
          Sign up to get started with SpringSight
        </motion.p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Full Name */}
        <div className="relative flex items-center overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] transition-all duration-200 focus-within:border-cyan-400/30 focus-within:bg-white/[0.07]">
          <svg className={`absolute left-3.5 h-4 w-4 shrink-0 transition-colors duration-200 ${focusedInput === 'name' ? 'text-white' : 'text-white/40'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput(null)}
            required
            className="h-11 w-full bg-transparent pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>

        {/* Email */}
        <div className="relative flex items-center overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] transition-all duration-200 focus-within:border-cyan-400/30 focus-within:bg-white/[0.07]">
          <Mail className={`absolute left-3.5 h-4 w-4 shrink-0 transition-colors duration-200 ${focusedInput === 'email' ? 'text-white' : 'text-white/40'}`} />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
            required
            className="h-11 w-full bg-transparent pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>

        {/* Password */}
        <div className="relative flex items-center overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] transition-all duration-200 focus-within:border-cyan-400/30 focus-within:bg-white/[0.07]">
          <Lock className={`absolute left-3.5 h-4 w-4 shrink-0 transition-colors duration-200 ${focusedInput === 'password' ? 'text-white' : 'text-white/40'}`} />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
            required
            className="h-11 w-full bg-transparent pl-10 pr-10 text-sm text-white outline-none placeholder:text-white/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-white/40 hover:text-white transition-colors duration-200"
          >
            {showPassword ? <Eye className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative flex items-center overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] transition-all duration-200 focus-within:border-cyan-400/30 focus-within:bg-white/[0.07]">
          <Lock className={`absolute left-3.5 h-4 w-4 shrink-0 transition-colors duration-200 ${focusedInput === 'confirm' ? 'text-white' : 'text-white/40'}`} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setFocusedInput('confirm')}
            onBlur={() => setFocusedInput(null)}
            required
            className="h-11 w-full bg-transparent pl-10 pr-10 text-sm text-white outline-none placeholder:text-white/30"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 text-white/40 hover:text-white transition-colors duration-200"
          >
            {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
          </button>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end pt-0.5">
          <Link
            to="/forgot-password"
            className="text-xs text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          type="submit"
          disabled={loading}
          className="relative mt-1 flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-white text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />
              </motion.div>
            ) : (
              <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                Sign Up
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-white/50">
        Already have an account?{' '}
        <Link to="/" className="font-semibold text-white transition-colors hover:text-white/80">
          Sign in
        </Link>
      </p>
    </>
  );
};
