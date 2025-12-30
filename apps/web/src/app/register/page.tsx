'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/api';
import { getPasswordStrength, isPasswordValid, PasswordRequirement } from '@/lib/password';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);
  const allRequirementsMet = isPasswordValid(strength);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await auth.register(email, password, name);
      // Auto-verified - store token and redirect to dashboard
      if (response.token) {
        localStorage.setItem('token', response.token);
        router.push('/');
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-slate-900">ShelfWise</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-slate-900">Create an account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Get started with ShelfWise
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
              icon={<User className="h-4 w-4" />}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              icon={<Mail className="h-4 w-4" />}
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                icon={<Lock className="h-4 w-4" />}
              />
              {password && (
                <div className="mt-2 space-y-1">
                  <PasswordRequirement met={strength.hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={strength.hasUppercase} text="One uppercase letter" />
                  <PasswordRequirement met={strength.hasLowercase} text="One lowercase letter" />
                  <PasswordRequirement met={strength.hasNumber} text="One number" />
                </div>
              )}
            </div>

            <div>
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                icon={<Lock className="h-4 w-4" />}
              />
              {confirmPassword && (
                <div className={`mt-1 text-xs ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              disabled={!allRequirementsMet || !passwordsMatch}
            >
              {loading ? 'Creating account...' : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-slate-500">Already have an account? </span>
            <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
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
