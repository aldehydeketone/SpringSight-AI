import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeSimple, Lock, Eye, EyeSlash, ArrowRight, CircleNotch, User } from '@phosphor-icons/react';
import { AuthService } from '../../services/auth.service';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const SignUpCard: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await AuthService.register({ name, email, password });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="h-12 w-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Account Created!</h3>
        <p className="text-sm text-white/60">Redirecting you to the sign in page...</p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/80">Full Name</Label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 h-4 w-4 text-white/40" weight="duotone" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              className="h-11 pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus-visible:bg-white/[0.07] focus-visible:border-cyan-400/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50 transition-all rounded-xl"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80">Email</Label>
          <div className="relative flex items-center">
            <EnvelopeSimple className="absolute left-3.5 h-4 w-4 text-white/40" weight="duotone" />
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="h-11 pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus-visible:bg-white/[0.07] focus-visible:border-cyan-400/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50 transition-all rounded-xl"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/80">Password</Label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-white/40" weight="duotone" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="h-11 pl-10 pr-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus-visible:bg-white/[0.07] focus-visible:border-cyan-400/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50 transition-all rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3.5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <Eye className="h-4 w-4" weight="bold" /> : <EyeSlash className="h-4 w-4" weight="bold" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-white/40" weight="duotone" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              className="h-11 pl-10 pr-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus-visible:bg-white/[0.07] focus-visible:border-cyan-400/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50 transition-all rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
              className="absolute right-3.5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <Eye className="h-4 w-4" weight="bold" /> : <EyeSlash className="h-4 w-4" weight="bold" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 mt-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-sm font-semibold transition-all cursor-pointer" disabled={loading}>
          {loading ? (
            <CircleNotch className="mr-2 h-4 w-4 animate-spin" weight="bold" />
          ) : (
            <span className="flex items-center gap-1.5">
              Create Account
              <ArrowRight className="h-4 w-4" weight="bold" />
            </span>
          )}
        </Button>
      </form>
      
      <p className="mt-6 text-center text-xs text-white/50">
        Already have an account?{' '}
        <Link to="/" className="font-semibold text-white hover:text-cyan-400 transition-colors">
          Sign in
        </Link>
      </p>
    </>
  );
};
