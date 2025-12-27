'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, BookOpen, Users, ArrowLeftRight, DollarSign, AlertTriangle, BarChart3, TrendingUp, Award, Lightbulb, Trophy } from 'lucide-react';
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
  { id: 'books', name: 'Books Inventory', icon: BookOpen, description: 'Complete list of all books with copy counts' },
  { id: 'members', name: 'Members Directory', icon: Users, description: 'All registered members with status' },
  { id: 'borrowings', name: 'Borrowing History', icon: ArrowLeftRight, description: 'All borrowing records with dates' },
  { id: 'overdue', name: 'Overdue Report', icon: AlertTriangle, description: 'Currently overdue books with fines' },
  { id: 'fines', name: 'Fines Report', icon: DollarSign, description: 'All fines with payment status' },
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-1">Generate and export library reports</p>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Library Summary */}
      {summary && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Library Summary</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-500">Total Books</p>
                  <p className="text-xl font-semibold text-slate-900">{summary.inventory.totalBooks}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-500">Total Copies</p>
                  <p className="text-xl font-semibold text-slate-900">{summary.inventory.totalCopies}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-sm text-slate-500">Available</p>
                  <p className="text-xl font-semibold text-emerald-600">{summary.inventory.availableCopies}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-sm text-slate-500">Borrowed</p>
                  <p className="text-xl font-semibold text-indigo-600">{summary.inventory.borrowedCopies}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Utilization Rate</span>
                  <span className="font-medium text-slate-900">{summary.inventory.utilizationRate}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Members & Activity</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-500">Total Members</p>
                  <p className="text-xl font-semibold text-slate-900">{summary.members.total}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-sm text-slate-500">Active Members</p>
                  <p className="text-xl font-semibold text-emerald-600">{summary.members.active}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-slate-500">Active Loans</p>
                  <p className="text-xl font-semibold text-blue-600">{summary.borrowings.active}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm text-slate-500">Overdue</p>
                  <p className="text-xl font-semibold text-red-600">{summary.borrowings.overdue}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Pending Fines</span>
                  <span className="font-medium text-amber-600">
                    ${summary.finances.pendingFinesAmount.toFixed(2)} ({summary.finances.pendingFinesCount})
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Key Metrics */}
      {insights && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Key Performance Metrics</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-3xl font-bold text-emerald-600">{insights.keyMetrics.returnRate}</p>
              <p className="text-sm text-slate-600 mt-1">Return Rate</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">{insights.keyMetrics.overdueRate}</p>
              <p className="text-sm text-slate-600 mt-1">Overdue Rate</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600">{insights.keyMetrics.avgBorrowingsPerMember}</p>
              <p className="text-sm text-slate-600 mt-1">Avg Borrowings/Member</p>
            </div>
          </div>
        </Card>
      )}

      {/* Management Recommendations */}
      {insights && insights.recommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="h-5 w-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Management Recommendations</h2>
          </div>
          <ul className="space-y-2">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-indigo-500 mt-0.5">-</span>
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Top Borrowed Books & Active Members */}
      {insights && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Borrowed Books */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-slate-900">Top 10 Most Borrowed Books</h2>
            </div>
            <div className="space-y-2">
              {insights.topBorrowedBooks.slice(0, 10).map((book) => (
                <div key={book.rank} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    book.rank === 1 ? 'bg-amber-400 text-white' :
                    book.rank === 2 ? 'bg-slate-300 text-slate-700' :
                    book.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {book.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{book.title}</p>
                    <p className="text-xs text-slate-500">{book.author} - {book.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">{book.borrowCount}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Most Active Members */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-emerald-500" />
              <h2 className="font-semibold text-slate-900">Most Active Members</h2>
            </div>
            <div className="space-y-2">
              {insights.mostActiveMembers.slice(0, 10).map((member) => (
                <div key={member.rank} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    member.rank === 1 ? 'bg-emerald-400 text-white' :
                    member.rank === 2 ? 'bg-slate-300 text-slate-700' :
                    member.rank === 3 ? 'bg-emerald-600 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {member.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.memberNumber}</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">{member.totalBorrowings} loans</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Top Categories & Members with Fines */}
      {insights && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Categories */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Popular Categories</h2>
            </div>
            <div className="space-y-3">
              {insights.topCategories.map((cat, idx) => {
                const maxCount = insights.topCategories[0]?.borrowCount || 1;
                const widthPercent = (cat.borrowCount / maxCount) * 100;
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{cat.category}</span>
                      <span className="font-medium text-slate-900">{cat.borrowCount} borrows</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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

          {/* Members with Outstanding Fines */}
          {insights.membersWithHighestFines.length > 0 && (
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-5 w-5 text-red-500" />
                <h2 className="font-semibold text-slate-900">Members with Outstanding Fines</h2>
              </div>
              <div className="space-y-2">
                {insights.membersWithHighestFines.map((member) => (
                  <div key={member.rank} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.memberNumber} - {member.pendingFines} fine(s)</p>
                    </div>
                    <span className="text-sm font-bold text-red-600">${member.totalOwed.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Category Distribution */}
      {summary && summary.categoryDistribution.length > 0 && (
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Books by Category</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {summary.categoryDistribution.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-sm text-slate-600">{cat.category}</span>
                <span className="font-medium text-slate-900">{cat.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Export Reports */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-900">Export Reports</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">Download reports as CSV files for further analysis</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadReport(report.id)}
                    disabled={downloading === report.id}
                  >
                    {downloading === report.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></div>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </>
                    )}
                  </Button>
                </div>
                <h3 className="font-medium text-slate-900">{report.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{report.description}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
