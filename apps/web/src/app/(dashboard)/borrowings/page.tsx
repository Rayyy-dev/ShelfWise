'use client';

import { useEffect, useState } from 'react';
import { ArrowLeftRight, BookOpen, X, Barcode, User, Calendar, RotateCcw, CheckCircle2, Trash2 } from 'lucide-react';
import { borrowings, members, books } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui';

interface Borrowing {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  isOverdue: boolean;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberNumber: string;
  };
  bookCopy: {
    id: string;
    barcode: string;
    book: {
      id: string;
      title: string;
      author: string;
    };
  };
}

interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
}

interface AvailableCopy {
  id: string;
  barcode: string;
  shelfLocation: string | null;
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
    category: string;
  };
}

export default function BorrowingsPage() {
  const [borrowingList, setBorrowingList] = useState<Borrowing[]>([]);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [deletingBorrowing, setDeletingBorrowing] = useState<Borrowing | null>(null);

  useEffect(() => {
    loadBorrowings();
    loadMembers();
  }, [statusFilter]);

  async function loadBorrowings() {
    try {
      const result = await borrowings.list({
        status: statusFilter || undefined,
      });
      setBorrowingList(result.borrowings);
    } catch (err) {
      console.error('Failed to load borrowings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers() {
    try {
      const result = await members.list({ status: 'ACTIVE' });
      setMemberList(result.members);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  }

  async function handleReturn(borrowingId: string) {
    if (!confirm('Confirm book return?')) return;

    try {
      await borrowings.return(borrowingId);
      loadBorrowings();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(borrowing: Borrowing) {
    try {
      await borrowings.delete(borrowing.id);
      setDeletingBorrowing(null);
      loadBorrowings();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const filterButtons = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'RETURNED', label: 'Returned' },
    { value: '', label: 'All' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Borrowings</h1>
          <p className="text-slate-500 mt-1">Track checkouts and returns</p>
        </div>
        <Button onClick={() => setShowCheckoutModal(true)}>
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Checkout Book
        </Button>
      </div>

      {/* Filters */}
      <Card className="flex flex-wrap gap-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setStatusFilter(btn.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === btn.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </Card>

      {/* Borrowings Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></div>
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Book
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Member
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Barcode
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Borrowed
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Due Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {borrowingList.map((borrowing) => (
                  <tr key={borrowing.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {borrowing.bookCopy.book.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {borrowing.bookCopy.book.author}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="h-3 w-3 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-900">
                            {borrowing.member.firstName} {borrowing.member.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {borrowing.member.memberNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Barcode className="h-3 w-3 text-slate-400" />
                        <span className="font-mono text-xs">{borrowing.bookCopy.barcode}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {formatDate(borrowing.borrowDate)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className={`flex items-center gap-2 text-sm ${
                        borrowing.isOverdue && borrowing.status !== 'RETURNED'
                          ? 'text-red-600 font-medium'
                          : 'text-slate-600'
                      }`}>
                        <Calendar className={`h-3 w-3 ${
                          borrowing.isOverdue && borrowing.status !== 'RETURNED'
                            ? 'text-red-400'
                            : 'text-slate-400'
                        }`} />
                        {formatDate(borrowing.dueDate)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <Badge
                        variant={
                          borrowing.status === 'RETURNED'
                            ? 'success'
                            : borrowing.isOverdue
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {borrowing.status === 'RETURNED'
                          ? 'Returned'
                          : borrowing.isOverdue
                          ? 'Overdue'
                          : 'Active'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2">
                        {borrowing.status === 'ACTIVE' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleReturn(borrowing.id)}
                          >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Return
                          </Button>
                        )}
                        {borrowing.status === 'RETURNED' && (
                          <div className="flex items-center gap-2 text-sm text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                            {formatDate(borrowing.returnDate!)}
                          </div>
                        )}
                        <button
                          onClick={() => setDeletingBorrowing(borrowing)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {borrowingList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                          <ArrowLeftRight className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-slate-500">No borrowings found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal
          members={memberList}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => {
            setShowCheckoutModal(false);
            loadBorrowings();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingBorrowing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <Card className="w-full max-w-sm">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Borrowing Record</h3>
              <p className="text-sm text-slate-500 mb-6">
                Delete the borrowing record for "{deletingBorrowing.bookCopy.book.title}"?
                {deletingBorrowing.status === 'ACTIVE' && ' The book will be marked as available.'}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setDeletingBorrowing(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleDelete(deletingBorrowing)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function CheckoutModal({
  members: memberList,
  onClose,
  onSuccess,
}: {
  members: Member[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    memberId: '',
    barcode: '',
  });
  const [availableCopies, setAvailableCopies] = useState<AvailableCopy[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<'select' | 'barcode'>('select');

  useEffect(() => {
    loadAvailableCopies();
  }, []);

  async function loadAvailableCopies() {
    try {
      const copies = await books.availableCopies();
      setAvailableCopies(copies);
    } catch (err) {
      console.error('Failed to load available copies:', err);
    } finally {
      setLoadingCopies(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await borrowings.checkout(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <Card className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Checkout Book</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Member
            </label>
            <select
              required
              value={formData.memberId}
              onChange={(e) =>
                setFormData({ ...formData, memberId: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a member</option>
              {memberList.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName} ({member.memberNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle between select and barcode input */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setInputMode('select')}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                inputMode === 'select'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="inline-block h-4 w-4 mr-1.5" />
              Select Book
            </button>
            <button
              type="button"
              onClick={() => setInputMode('barcode')}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                inputMode === 'barcode'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Barcode className="inline-block h-4 w-4 mr-1.5" />
              Enter Barcode
            </button>
          </div>

          {inputMode === 'select' ? (
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Available Book
              </label>
              {loadingCopies ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></div>
                </div>
              ) : (
                <select
                  required
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a book</option>
                  {availableCopies.map((copy) => (
                    <option key={copy.id} value={copy.barcode}>
                      {copy.book.title} - {copy.book.author} ({copy.barcode})
                    </option>
                  ))}
                </select>
              )}
              {availableCopies.length === 0 && !loadingCopies && (
                <p className="mt-2 text-sm text-slate-500">No books available for checkout</p>
              )}
            </div>
          ) : (
            <Input
              label="Book Barcode"
              required
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
              placeholder="Scan or enter barcode"
              icon={<Barcode className="h-4 w-4" />}
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Checkout
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
