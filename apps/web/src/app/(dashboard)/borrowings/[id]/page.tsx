'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, User, Calendar, Clock, Barcode, Mail, Phone, RotateCcw, Pencil, X } from 'lucide-react';
import { borrowings } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui';

interface BorrowingDetail {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  isOverdue: boolean;
  daysOverdue: number;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberNumber: string;
    email: string | null;
    phone: string | null;
  };
  bookCopy: {
    id: string;
    barcode: string;
    book: {
      id: string;
      title: string;
      author: string;
      isbn: string | null;
      category: string;
    };
  };
}

export default function BorrowingDetailPage() {
  const params = useParams();
  const [borrowing, setBorrowing] = useState<BorrowingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadBorrowing();
  }, [params.id]);

  async function loadBorrowing() {
    try {
      const result = await borrowings.get(params.id as string);
      setBorrowing(result);
    } catch (err) {
      console.error('Failed to load borrowing:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn() {
    if (!borrowing || !confirm('Confirm book return?')) return;

    try {
      await borrowings.return(borrowing.id);
      loadBorrowing();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!borrowing) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Borrowing not found</h2>
        <Link href="/borrowings" className="mt-4 text-indigo-600 hover:underline">
          Back to borrowings
        </Link>
      </div>
    );
  }

  const statusBadge = borrowing.status === 'RETURNED'
    ? { variant: 'success' as const, label: 'Returned' }
    : borrowing.isOverdue
    ? { variant: 'danger' as const, label: `Overdue (${borrowing.daysOverdue} days)` }
    : { variant: 'warning' as const, label: 'Active' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/borrowings"
            className="rounded-md p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{borrowing.bookCopy.book.title}</h1>
            <p className="text-sm text-slate-500">
              Borrowed by {borrowing.member.firstName} {borrowing.member.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          {borrowing.status === 'ACTIVE' && (
            <Button onClick={handleReturn}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Return
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Book Info */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Book Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500">Title</dt>
              <dd className="font-medium text-slate-900">{borrowing.bookCopy.book.title}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Author</dt>
              <dd className="text-slate-900">{borrowing.bookCopy.book.author}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Category</dt>
              <dd><Badge>{borrowing.bookCopy.book.category}</Badge></dd>
            </div>
            {borrowing.bookCopy.book.isbn && (
              <div>
                <dt className="text-sm text-slate-500">ISBN</dt>
                <dd className="text-slate-900 font-mono text-sm">{borrowing.bookCopy.book.isbn}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-slate-500">Barcode</dt>
              <dd className="flex items-center gap-2 text-slate-900">
                <Barcode className="h-4 w-4 text-slate-400" />
                <span className="font-mono text-sm">{borrowing.bookCopy.barcode}</span>
              </dd>
            </div>
          </dl>
          <div className="mt-4 pt-4 border-t">
            <Link href={`/books/${borrowing.bookCopy.book.id}`} className="text-sm text-indigo-600 hover:underline">
              View book details
            </Link>
          </div>
        </Card>

        {/* Member Info */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Member Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">
                {borrowing.member.firstName} {borrowing.member.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Member Number</dt>
              <dd className="text-slate-900 font-mono text-sm">{borrowing.member.memberNumber}</dd>
            </div>
            {borrowing.member.email && (
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="flex items-center gap-2 text-slate-900">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {borrowing.member.email}
                </dd>
              </div>
            )}
            {borrowing.member.phone && (
              <div>
                <dt className="text-sm text-slate-500">Phone</dt>
                <dd className="flex items-center gap-2 text-slate-900">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {borrowing.member.phone}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-4 pt-4 border-t">
            <Link href={`/members/${borrowing.member.id}`} className="text-sm text-indigo-600 hover:underline">
              View member profile
            </Link>
          </div>
        </Card>

        {/* Dates */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Dates
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Calendar className="h-4 w-4" />
                Borrowed
              </div>
              <p className="font-medium text-slate-900">{formatDate(borrowing.borrowDate)}</p>
            </div>
            <div className={`rounded-lg p-4 ${
              borrowing.isOverdue && borrowing.status !== 'RETURNED'
                ? 'bg-red-50'
                : 'bg-slate-50'
            }`}>
              <div className={`flex items-center gap-2 text-sm mb-1 ${
                borrowing.isOverdue && borrowing.status !== 'RETURNED'
                  ? 'text-red-600'
                  : 'text-slate-500'
              }`}>
                <Calendar className="h-4 w-4" />
                Due Date
              </div>
              <p className={`font-medium ${
                borrowing.isOverdue && borrowing.status !== 'RETURNED'
                  ? 'text-red-900'
                  : 'text-slate-900'
              }`}>{formatDate(borrowing.dueDate)}</p>
            </div>
            <div className={`rounded-lg p-4 ${
              borrowing.status === 'RETURNED' ? 'bg-emerald-50' : 'bg-slate-50'
            }`}>
              <div className={`flex items-center gap-2 text-sm mb-1 ${
                borrowing.status === 'RETURNED' ? 'text-emerald-600' : 'text-slate-500'
              }`}>
                <Calendar className="h-4 w-4" />
                Returned
              </div>
              <p className={`font-medium ${
                borrowing.status === 'RETURNED' ? 'text-emerald-900' : 'text-slate-400'
              }`}>
                {borrowing.returnDate ? formatDate(borrowing.returnDate) : 'Not returned'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditBorrowingModal
          borrowing={borrowing}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadBorrowing();
          }}
        />
      )}
    </div>
  );
}

function EditBorrowingModal({
  borrowing,
  onClose,
  onSuccess,
}: {
  borrowing: BorrowingDetail;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    dueDate: borrowing.dueDate.split('T')[0],
    status: borrowing.status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await borrowings.update(borrowing.id, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function extendDueDate(days: number) {
    const current = new Date(formData.dueDate);
    current.setDate(current.getDate() + days);
    setFormData({ ...formData, dueDate: current.toISOString().split('T')[0] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Edit Borrowing</h2>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => extendDueDate(7)}
                className="px-3 py-1 text-xs rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                +7 days
              </button>
              <button
                type="button"
                onClick={() => extendDueDate(14)}
                className="px-3 py-1 text-xs rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                +14 days
              </button>
              <button
                type="button"
                onClick={() => extendDueDate(30)}
                className="px-3 py-1 text-xs rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                +30 days
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
