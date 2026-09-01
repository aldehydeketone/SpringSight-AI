import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { AuthLayout } from '../components/ui/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CircleNotch, ArrowRight } from '@phosphor-icons/react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
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
    <AuthLayout
      title="Set New Password"
      description="Enter your new password below to reset your account credentials."
    >
      {message && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-white/80">
            New Password <span className="text-cyan-400 font-normal ml-0.5">*</span>
          </Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Min. 8 characters"
            disabled={loading}
            className="h-12 px-4 text-base bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus-visible:bg-white/[0.07] focus-visible:border-cyan-400/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50 transition-all rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/80">
            Confirm Password <span className="text-cyan-400 font-normal ml-0.5">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Confirm password"
            disabled={loading}
            className="h-12 px-4 text-base bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus-visible:bg-white/[0.07] focus-visible:border-cyan-400/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50 transition-all rounded-xl"
          />
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl text-base font-semibold transition-all cursor-pointer"
          >
            {loading ? (
              <CircleNotch className="mr-2 h-5 w-5 animate-spin" weight="bold" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Reset Password
                <ArrowRight className="h-5 w-5" weight="bold" />
              </span>
            )}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-white/50">
        <Link to="/" className="font-semibold text-white hover:text-cyan-400 transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
