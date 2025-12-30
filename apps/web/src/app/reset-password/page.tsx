'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Lock, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/api';
import { getPasswordStrength, isPasswordValid, PasswordRequirement } from '@/lib/password';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
      await auth.resetPassword(email, token, password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Invalid reset link</p>
          <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
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
          {success ? (
            <div className="text-center">
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-600">
                Password reset successfully! Redirecting to login...
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-lg font-semibold text-slate-900">Reset your password</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <Input
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
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
                    placeholder="Confirm new password"
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
                  {loading ? 'Resetting...' : (
                    <>
                      Reset password
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          ShelfWise Library Management
        </p>
      </div>
    </div>
  );
}
