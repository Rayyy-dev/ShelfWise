'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, BookOpen, Users, ArrowLeftRight, DollarSign, AlertTriangle, TrendingUp, Lightbulb} from 'lucide-react';
import { reports } from '@/lib/api';
import { Card, Button } from '@/components/ui';

interface Summary {
  inventory: {
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    borrowedCopies: number;
    utilizationRate: string;
  };
  members: {
    total: number;
    active: number;
    activeRate: string;
  };
  borrowings: {
    active: number;
    overdue: number;
    overdueRate: string;
  };
  finances: {
    totalFinesCount: number;
    totalFinesAmount: number;
    pendingFinesCount: number;
    pendingFinesAmount: number;
    collectedAmount: number;
    collectionRate: string;
  };
  categoryDistribution: { category: string; count: number }[];
}

interface Insights {
  topBorrowedBooks: { rank: number; title: string; author: string; category: string; borrowCount: number }[];
  mostActiveMembers: { rank: number; memberNumber: string; name: string; status: string; totalBorrowings: number }[];
  topCategories: { rank: number; category: string; borrowCount: number }[];
  membersWithHighestFines: { rank: number; memberNumber: string; name: string; pendingFines: number; totalOwed: number }[];
  borrowingTrend: { month: string; borrowings: number }[];
  recommendations: string[];
  keyMetrics: {
    returnRate: string;
    overdueRate: string;
    avgBorrowingsPerMember: string;
  };
}

const reportTypes = [
  { id: 'books', name: 'Books Inventory', icon: BookOpen, description: 'Complete list of all books' },
  { id: 'members', name: 'Members Directory', icon: Users, description: 'All registered members' },
  { id: 'borrowings', name: 'Borrowing History', icon: ArrowLeftRight, description: 'All borrowing records' },
  { id: 'overdue', name: 'Overdue Report', icon: AlertTriangle, description: 'Currently overdue books' },
  { id: 'fines', name: 'Fines Report', icon: DollarSign, description: 'All fines with status' },
];

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [summaryData, insightsData] = await Promise.all([
        reports.summary(),
        reports.insights(),
      ]);
      setSummary(summaryData);
      setInsights(insightsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadReport(reportType: string) {
    try {
      setDownloading(reportType);
      let blob: Blob;

      switch (reportType) {
        case 'books':
          blob = await reports.books('csv') as Blob;
          break;
        case 'members':
          blob = await reports.members('csv') as Blob;
          break;
        case 'borrowings':
          blob = await reports.borrowings({ format: 'csv' }) as Blob;
          break;
        case 'overdue':
          blob = await reports.overdue('csv') as Blob;
          break;
        case 'fines':
          blob = await reports.fines({ format: 'csv' }) as Blob;
          break;
        default:
          return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDownloading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-1">Library analytics and exports</p>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Stats Overview */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 border-l-4 border-l-indigo-500">
            <p className="text-xs text-slate-500 mb-1">Total Books</p>
            <p className="text-xl font-semibold text-slate-900">{summary.inventory.totalBooks}</p>
            <p className="text-xs text-slate-500 mt-1">{summary.inventory.availableCopies} available</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs text-slate-500 mb-1">Members</p>
            <p className="text-xl font-semibold text-slate-900">{summary.members.total}</p>
            <p className="text-xs text-slate-500 mt-1">{summary.members.active} active</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 border-l-4 border-l-blue-500">
            <p className="text-xs text-slate-500 mb-1">Active Loans</p>
            <p className="text-xl font-semibold text-slate-900">{summary.borrowings.active}</p>
            <p className="text-xs text-slate-500 mt-1">{summary.inventory.utilizationRate} utilization</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 border-l-4 border-l-amber-500">
            <p className="text-xs text-slate-500 mb-1">Pending Fines</p>
            <p className="text-xl font-semibold text-slate-900">${summary.finances.pendingFinesAmount.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">{summary.finances.pendingFinesCount} fines</p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {insights && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Key Metrics</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-semibold text-slate-900">{insights.keyMetrics.returnRate}</p>
              <p className="text-xs text-slate-500 mt-1">Return Rate</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-semibold text-slate-900">{insights.keyMetrics.overdueRate}</p>
              <p className="text-xs text-slate-500 mt-1">Overdue Rate</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-semibold text-slate-900">{insights.keyMetrics.avgBorrowingsPerMember}</p>
              <p className="text-xs text-slate-500 mt-1">Avg Borrowings/Member</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {insights && insights.recommendations.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Recommendations</h2>
          </div>
          <ul className="space-y-2">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="text-slate-400 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Top Lists */}
      {insights && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Borrowed Books */}
          <Card>
            <h2 className="font-semibold text-slate-900 text-sm mb-4">Top Borrowed Books</h2>
            <div className="space-y-2">
              {insights.topBorrowedBooks.slice(0, 5).map((book, idx) => (
                <div key={book.rank} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{book.title}</p>
                    <p className="text-xs text-slate-500">{book.author}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-600">{book.borrowCount}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Most Active Members */}
          <Card>
            <h2 className="font-semibold text-slate-900 text-sm mb-4">Most Active Members</h2>
            <div className="space-y-2">
              {insights.mostActiveMembers.slice(0, 5).map((member, idx) => (
                <div key={member.rank} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.memberNumber}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-600">{member.totalBorrowings} loans</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Popular Categories */}
      {insights && (
        <Card>
          <h2 className="font-semibold text-slate-900 text-sm mb-4">Popular Categories</h2>
          <div className="space-y-3">
            {insights.topCategories.slice(0, 5).map((cat) => {
              const maxCount = insights.topCategories[0]?.borrowCount || 1;
              const widthPercent = (cat.borrowCount / maxCount) * 100;
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{cat.category}</span>
                    <span className="font-medium text-slate-900">{cat.borrowCount}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Export Reports */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold text-slate-900 text-sm">Export Reports</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">Download reports as CSV files</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadReport(report.id)}
                    disabled={downloading === report.id}
                    className="h-7 text-xs px-2"
                  >
                    {downloading === report.id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600"></div>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1" />
                        CSV
                      </>
                    )}
                  </Button>
                </div>
                <h3 className="text-sm font-medium text-slate-900">{report.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{report.description}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
