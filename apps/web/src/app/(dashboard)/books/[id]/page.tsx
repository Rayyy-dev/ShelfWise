'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { books } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface BookCopy {
  id: string;
  barcode: string;
  status: string;
  condition: string;
  shelfLocation: string | null;
  borrowings: {
    id: string;
    status: string;
    member: {
      id: string;
      firstName: string;
      lastName: string;
      memberNumber: string;
    };
  }[];
}

interface BookDetail {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  category: string;
  description: string | null;
  publishedYear: number | null;
  totalCopies: number;
  availableCopies: number;
  copies: BookCopy[];
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCopyModal, setShowAddCopyModal] = useState(false);

  useEffect(() => {
    loadBook();
  }, [params.id]);

  async function loadBook() {
    try {
      const result = await books.get(params.id as string);
      setBook(result);
    } catch (err) {
      console.error('Failed to load book:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Book not found</h2>
        <Link href="/books" className="mt-4 text-primary-600 hover:underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="rounded-md p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
      </div>

      {/* Book Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="flex h-48 items-center justify-center bg-gray-100">
              <BookOpen className="h-24 w-24 text-gray-300" />
            </div>
            <div className="p-4">
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Author</dt>
                  <dd className="font-medium text-gray-900">{book.author}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-medium text-gray-900">{book.category}</dd>
                </div>
                {book.isbn && (
                  <div>
                    <dt className="text-gray-500">ISBN</dt>
                    <dd className="font-medium text-gray-900">{book.isbn}</dd>
                  </div>
                )}
                {book.publishedYear && (
                  <div>
                    <dt className="text-gray-500">Published</dt>
                    <dd className="font-medium text-gray-900">{book.publishedYear}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500">Availability</dt>
                  <dd className={`font-medium ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {book.availableCopies} of {book.totalCopies} available
                  </dd>
                </div>
              </dl>
              {book.description && (
                <p className="mt-4 text-sm text-gray-600">{book.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Copies */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white shadow">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Book Copies ({book.copies.length})
              </h2>
              <button
                onClick={() => setShowAddCopyModal(true)}
                className="flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Copy
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Barcode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Borrowed By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {book.copies.map((copy) => {
                    const activeBorrowing = copy.borrowings.find(
                      (b) => b.status === 'ACTIVE'
                    );
                    return (
                      <tr key={copy.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {copy.barcode}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              copy.status === 'AVAILABLE'
                                ? 'bg-green-100 text-green-800'
                                : copy.status === 'BORROWED'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {copy.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {copy.condition}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {copy.shelfLocation || '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {activeBorrowing ? (
                            <span>
                              {activeBorrowing.member.firstName}{' '}
                              {activeBorrowing.member.lastName}
                              <span className="text-gray-400">
                                {' '}
                                ({activeBorrowing.member.memberNumber})
                              </span>
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Copy Modal */}
      {showAddCopyModal && (
        <AddCopyModal
          bookId={book.id}
          onClose={() => setShowAddCopyModal(false)}
          onSuccess={() => {
            setShowAddCopyModal(false);
            loadBook();
          }}
        />
      )}
    </div>
  );
}

function AddCopyModal({
  bookId,
  onClose,
  onSuccess,
}: {
  bookId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    barcode: '',
    condition: 'NEW',
    shelfLocation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await books.addCopy(bookId, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Add Book Copy</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Barcode *
            </label>
            <input
              type="text"
              required
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Condition
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="NEW">New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Shelf Location
            </label>
            <input
              type="text"
              value={formData.shelfLocation}
              onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="e.g., A-12-3"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Copy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
