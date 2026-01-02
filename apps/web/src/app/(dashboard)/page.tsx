'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { dashboard } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50/50 border-red-100">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">Error loading dashboard: {error}</span>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const { stats, categoryStats, recentBorrowings } = data;

  // Prepare chart data - top 6 categories
  const chartData = categoryStats.slice(0, 6).map(cat => ({
    name: cat.category.length > 10 ? cat.category.slice(0, 10) + '...' : cat.category,
    books: cat.count,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your library</p>
      </div>

      {/* Stats Grid - Minimal Design */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Books */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Books</p>
            <BookOpen className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.totalBooks}</p>
          <p className="text-sm text-slate-500 mt-1">
            <span className="text-emerald-600 font-medium">{stats.availableCopies}</span> copies available
          </p>
        </div>

        {/* Members */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Members</p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.activeMembers}</p>
          <p className="text-sm text-slate-500 mt-1">
            <span className="text-slate-600 font-medium">{stats.totalMembers}</span> total registered
          </p>
        </div>

        {/* Active Loans */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Active Loans</p>
            <ArrowLeftRight className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.activeBorrowings}</p>
          <p className="text-sm text-slate-500 mt-1">
            <span className="text-blue-600 font-medium">{stats.borrowingsToday}</span> borrowed today
          </p>
        </div>

        {/* Overdue */}
        <div className={`bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 border-l-4 ${stats.overdueBorrowings > 0 ? 'border-l-red-500' : 'border-l-slate-300'}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Overdue</p>
            <AlertTriangle className={`h-4 w-4 ${stats.overdueBorrowings > 0 ? 'text-red-400' : 'text-slate-400'}`} />
          </div>
          <p className={`text-3xl font-semibold mt-2 ${stats.overdueBorrowings > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {stats.overdueBorrowings}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {stats.overdueBorrowings > 0 ? 'require attention' : 'all books on time'}
          </p>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chart - Takes 3 columns */}
        <Card className="lg:col-span-3">
          <h3 className="font-semibold text-slate-900 mb-6">Collection by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '13px',
                  }}
                />
                <Bar
                  dataKey="books"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                  name="Books"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Stats - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-6">Today's Activity</h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                <span className="text-sm text-slate-600">Books Borrowed</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">{stats.borrowingsToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-slate-600">Books Returned</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">{stats.returnsToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <span className="text-sm text-slate-600">Currently Borrowed</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">{stats.borrowedCopies}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                <span className="text-sm text-slate-600">Available Copies</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">{stats.availableCopies}</span>
            </div>

            {/* Mini progress bar */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-500">Library utilization</span>
                <span className="text-slate-700 font-medium">
                  {Math.round((stats.borrowedCopies / stats.totalCopies) * 100) || 0}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.round((stats.borrowedCopies / stats.totalCopies) * 100) || 0}%` }}
                />
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
