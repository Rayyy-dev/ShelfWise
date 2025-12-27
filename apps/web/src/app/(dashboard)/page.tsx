'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, ArrowLeftRight, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { dashboard } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  totalMembers: number;
  activeMembers: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  borrowingsToday: number;
  returnsToday: number;
}

interface DashboardData {
  stats: Stats;
  categoryStats: { category: string; count: number }[];
  recentBorrowings: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const result = await dashboard.stats();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <div className="flex items-center gap-3 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <span>Error loading dashboard: {error}</span>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const { stats, recentBorrowings } = data;

  // Prepare activity data
  const activityData = [
    { name: 'Books', total: stats.totalBooks, active: stats.totalCopies },
    { name: 'Members', total: stats.totalMembers, active: stats.activeMembers },
    { name: 'Loans', total: stats.activeBorrowings + stats.overdueBorrowings, active: stats.activeBorrowings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your library</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Books</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{stats.totalBooks}</p>
              <p className="text-sm text-slate-500 mt-1">{stats.availableCopies} available</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Members</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{stats.activeMembers}</p>
              <p className="text-sm text-slate-500 mt-1">{stats.totalMembers} total</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Loans</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{stats.activeBorrowings}</p>
              <p className="text-sm text-slate-500 mt-1">{stats.borrowingsToday} today</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Overdue</p>
              <p className={`text-2xl font-semibold mt-1 ${stats.overdueBorrowings > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.overdueBorrowings}
              </p>
              <p className="text-sm text-slate-500 mt-1">books overdue</p>
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stats.overdueBorrowings > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
              <AlertTriangle className={`h-5 w-5 ${stats.overdueBorrowings > 0 ? 'text-red-600' : 'text-slate-400'}`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Collection Summary */}
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Collection Summary</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="total" fill="#6366f1" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="active" fill="#10b981" name="Active" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Today's Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Books Borrowed</p>
                  <p className="text-xl font-semibold text-slate-900">{stats.borrowingsToday}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ArrowLeftRight className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Books Returned</p>
                  <p className="text-xl font-semibold text-slate-900">{stats.returnsToday}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Available Copies</p>
                  <p className="text-xl font-semibold text-slate-900">{stats.availableCopies} <span className="text-sm font-normal text-slate-500">/ {stats.totalCopies}</span></p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Borrowings */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Recent Borrowings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Book</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Member</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Due Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentBorrowings.map((borrowing) => (
                <tr key={borrowing.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 text-sm">{borrowing.bookCopy.book.title}</p>
                    <p className="text-slate-500 text-sm">{borrowing.bookCopy.book.author}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-900">{borrowing.member.firstName} {borrowing.member.lastName}</p>
                    <p className="text-sm text-slate-500">{borrowing.member.memberNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatDate(borrowing.dueDate)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        borrowing.status === 'RETURNED' ? 'success' : borrowing.isOverdue ? 'danger' : 'warning'
                      }
                    >
                      {borrowing.status === 'RETURNED' ? 'Returned' : borrowing.isOverdue ? 'Overdue' : 'Active'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {recentBorrowings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                    No recent borrowings
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
