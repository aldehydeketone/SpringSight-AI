import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { AuthService } from '../services/auth.service';
import { BackgroundEffect } from '../components/ui/background-effect';
import { SpringSightLogo } from '../components/ui/springsight-logo';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const response = await AuthService.login({ email, password });
        login(response.token, response.user);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const response = await AuthService.register({ name, email, password });
        login(response.token, response.user);
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    'flex h-10 w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-16 font-sans">
      <BackgroundEffect />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-7 flex w-full justify-center">
          <SpringSightLogo />
        </div>

        {isSuccess ? (
          <div
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <h2 className="text-xl font-semibold tracking-tight text-white">Signed in</h2>
            <p className="mt-2 text-sm text-zinc-400">Redirecting to your workspace…</p>
          </div>
        ) : (
          <div
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-sm text-zinc-400">
                {isLogin ? 'Sign in to your account' : 'Get started with SpringSight'}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    placeholder="Your name"
                    className={inputClassName}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className={inputClassName}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-white text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'Signing in…'
                  : isLogin
                    ? 'Sign in'
                    : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-400">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="font-medium text-white underline-offset-4 transition-colors hover:text-zinc-200 hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
