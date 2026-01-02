'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Library, Mail, Lock, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/api';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await auth.login(email, password);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Library className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-slate-900">ShelfWise</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              icon={<Lock className="h-4 w-4" />}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-slate-500">Don't have an account? </span>
            <Link href="/register" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Sign up
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          ShelfWise Library Management
        </p>
      </div>
    </div>
  );
}
