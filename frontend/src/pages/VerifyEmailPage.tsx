import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { AuthLayout } from '../components/ui/auth-layout';
import { Button } from '@/components/ui/button';

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
    <AuthLayout>
      <div className="text-center py-4">
        <div
          className={`mx-auto mb-5 h-3.5 w-3.5 rounded-full ${
            status === 'loading'
              ? 'animate-pulse bg-zinc-400'
              : status === 'success'
                ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                : 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.5)]'
          }`}
        />
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">{message}</h1>
        <p className="text-sm sm:text-base text-white/60 font-normal tracking-wide max-w-sm mx-auto">
          {status === 'success'
            ? 'Your SpringSight account is ready. You can sign in now.'
            : status === 'error'
              ? 'Request a new verification email by registering again or contact support.'
              : 'This should only take a moment.'}
        </p>

        {status !== 'loading' && (
          <div className="mt-8">
            <Button asChild className="h-12 px-6 bg-white text-black hover:bg-zinc-200 rounded-xl text-base font-semibold transition-all">
              <Link to="/">Back to sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
