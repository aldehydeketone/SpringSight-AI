import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { BackgroundEffect } from '../components/ui/background-effect';
import { SpringSightLogo } from '../components/ui/springsight-logo';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClassName =
    'flex h-10 w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10';

  const getErrorMessage = (err: unknown) => {
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response?: { data?: { message?: string } } }).response;
      return response?.data?.message || 'Unable to reset password.';
    }
    return err instanceof Error ? err.message : 'Unable to reset password.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError('Password reset link expired or invalid.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const responseMessage = await AuthService.resetPassword({ token, newPassword });
      setMessage(responseMessage);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-16 font-sans">
      <BackgroundEffect />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-7 flex w-full justify-center">
          <SpringSightLogo />
        </div>

        <div className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Reset password</h1>
            <p className="text-sm text-zinc-400">Choose a new password for your account.</p>
          </div>

          {message && (
            <div className="mb-5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-zinc-300">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="NewPassword123"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirm password"
                className={inputClassName}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-white text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm font-medium text-white underline-offset-4 transition-colors hover:text-zinc-200 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
