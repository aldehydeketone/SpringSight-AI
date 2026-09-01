import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeSimple, Lock, Eye, EyeSlash, ArrowRight, CircleNotch } from '@phosphor-icons/react';
import { useAuth } from '../../lib/auth';
import { AuthService } from '../../services/auth.service';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface LoginCardProps {
  onSuccess: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (err: unknown) => {
    if (err && typeof err === 'object' && 'response' in err) {
      const r = (err as { response?: { data?: { message?: string } } }).response;
      return r?.data?.message || 'Authentication failed. Please verify credentials.';
    }
    return err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      login(response.token, response.user);
      onSuccess();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <>
      {/* Subtitle text container (28px gap above from logo, 36px gap below to form) */}
      <div className="text-center mb-9">
        <p className="text-base sm:text-lg text-white/70 font-normal tracking-wide">
          Sign in to your SpringSight AI dashboard
        </p>
      </div>
      
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-300 font-medium text-center">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field Group (8px gap between label and input) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-white/80">
            Email <span className="text-cyan-400 font-normal ml-0.5" aria-hidden="true">*</span>
          </Label>
          <div className="relative flex items-center">
            <EnvelopeSimple className="absolute left-4 h-5 w-5 text-white/40 pointer-events-none" weight="duotone" />
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="h-12 pl-11 text-base bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus-visible:bg-white/[0.07] focus-visible:border-cyan-400/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50 transition-all rounded-xl"
            />
          </div>
        </div>
        
        {/* Password Field Group (20px gap above from email, 8px gap between label and input) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-white/80">
              Password <span className="text-cyan-400 font-normal ml-0.5" aria-hidden="true">*</span>
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-cyan-400/80 hover:text-cyan-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-4 h-5 w-5 text-white/40 pointer-events-none" weight="duotone" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="h-12 pl-11 pr-11 text-base bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus-visible:bg-white/[0.07] focus-visible:border-cyan-400/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50 transition-all rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-4 text-white/40 hover:text-white transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? <Eye className="h-5 w-5" weight="bold" /> : <EyeSlash className="h-5 w-5" weight="bold" />}
            </button>
          </div>
        </div>

        {/* Sign In Button Container (32px gap above button from password input) */}
        <div className="pt-3">
          <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl text-base font-semibold transition-all cursor-pointer" disabled={loading}>
            {loading ? (
              <CircleNotch className="mr-2 h-5 w-5 animate-spin" weight="bold" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In
                <ArrowRight className="h-5 w-5" weight="bold" />
              </span>
            )}
          </Button>
        </div>
      </form>
      
      <p className="mt-8 text-center text-sm text-white/50">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-white hover:text-cyan-400 transition-colors">
          Sign up
        </Link>
      </p>
    </>
  );
};
