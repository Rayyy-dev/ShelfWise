'use client';

import { useEffect, useState } from 'react';
import { DollarSign, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { fines } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, Badge, Button } from '@/components/ui';

interface Fine {
  id: string;
  amount: number;
  reason: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  borrowing: {
    member: { firstName: string; lastName: string; memberNumber: string };
    bookCopy: { book: { title: string } };
  };
}

interface FineStats {
  total: { count: number; amount: number };
  pending: { count: number; amount: number };
  paid: { count: number; amount: number };
  waived: { count: number; amount: number };
}

export default function FinesPage() {
  const [finesList, setFinesList] = useState<Fine[]>([]);
  const [stats, setStats] = useState<FineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    try {
      setLoading(true);
      const [finesResult, statsResult] = await Promise.all([
        fines.list({ status: filter || undefined }),
        fines.stats(),
      ]);
      setFinesList(finesResult.fines);
      setStats(statsResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCalculateFines() {
    try {
      setCalculating(true);
      await fines.calculate();
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCalculating(false);
    }
  }

  async function handlePayFine(id: string) {
    try {
      await fines.pay(id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleWaiveFine(id: string) {
    try {
      await fines.waive(id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Fines & Payments</h1>
          <p className="text-slate-500 mt-1">Manage overdue fines and payments</p>
        </div>
        <Button onClick={handleCalculateFines} disabled={calculating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
          Calculate Fines
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Fines</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">${stats.total.amount.toFixed(2)}</p>
                <p className="text-sm text-slate-500 mt-1">{stats.total.count} fines</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-2xl font-semibold text-amber-600 mt-1">${stats.pending.amount.toFixed(2)}</p>
                <p className="text-sm text-slate-500 mt-1">{stats.pending.count} unpaid</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Paid</p>
                <p className="text-2xl font-semibold text-emerald-600 mt-1">${stats.paid.amount.toFixed(2)}</p>
                <p className="text-sm text-slate-500 mt-1">{stats.paid.count} collected</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Waived</p>
                <p className="text-2xl font-semibold text-slate-600 mt-1">${stats.waived.amount.toFixed(2)}</p>
                <p className="text-sm text-slate-500 mt-1">{stats.waived.count} waived</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('PAID')}
          className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'PAID' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Paid
        </button>
        <button
          onClick={() => setFilter('WAIVED')}
          className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'WAIVED' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Waived
        </button>
      </div>

      {/* Fines Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Member</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Book</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Reason</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {finesList.map((fine) => (
                <tr key={fine.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 text-sm">
                      {fine.borrowing.member.firstName} {fine.borrowing.member.lastName}
                    </p>
                    <p className="text-slate-500 text-sm">{fine.borrowing.member.memberNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {fine.borrowing.bookCopy.book.title}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">
                    ${fine.amount.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {fine.reason}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        fine.status === 'PAID' ? 'success' : fine.status === 'PENDING' ? 'warning' : 'default'
                      }
                    >
                      {fine.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatDate(fine.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    {fine.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePayFine(fine.id)}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => handleWaiveFine(fine.id)}
                          className="text-slate-500 hover:text-slate-700 text-sm"
                        >
                          Waive
                        </button>
                      </div>
                    )}
                    {fine.status === 'PAID' && fine.paidAt && (
                      <span className="text-sm text-slate-500">Paid {formatDate(fine.paidAt)}</span>
                    )}
                  </td>
                </tr>
              ))}
              {finesList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No fines found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
