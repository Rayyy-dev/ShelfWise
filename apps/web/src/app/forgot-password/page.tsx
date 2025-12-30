'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/api';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
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
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-slate-900">ShelfWise</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          {success ? (
            <div className="text-center">
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-600">
                If an account exists with this email, you will receive a password reset link.
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Check your console for the reset link (dev mode)
              </p>
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-lg font-semibold text-slate-900">Forgot password?</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your email and we'll send you a reset link
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
                />

                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full"
                >
                  {loading ? 'Sending...' : (
                    <>
                      Send reset link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
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
