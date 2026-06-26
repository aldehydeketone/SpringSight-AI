import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { BackgroundEffect } from '../components/ui/background-effect';
import { SpringSightLogo } from '../components/ui/springsight-logo';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification Link Expired');
        return;
      }

      try {
        await AuthService.verifyEmail(token);
        setStatus('success');
        setMessage('Verification Successful');
      } catch {
        setStatus('error');
        setMessage('Verification Link Expired');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-16 font-sans">
      <BackgroundEffect />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-7 flex w-full justify-center">
          <SpringSightLogo />
        </div>

        <div className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div
            className={`mx-auto mb-5 h-3 w-3 rounded-full ${
              status === 'loading'
                ? 'animate-pulse bg-zinc-400'
                : status === 'success'
                  ? 'bg-emerald-400'
                  : 'bg-red-400'
            }`}
          />
          <h1 className="text-2xl font-semibold tracking-tight text-white">{message}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {status === 'success'
              ? 'Your SpringSight account is ready. You can sign in now.'
              : status === 'error'
                ? 'Request a new verification email by registering again or contact support.'
                : 'This should only take a moment.'}
          </p>

          {status !== 'loading' && (
            <Link
              to="/"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
            >
              Back to sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
