'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, BookOpen, Pencil, X, Trash2 } from 'lucide-react';
import { books } from '@/lib/api';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';

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
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCopyModal, setShowAddCopyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null);

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Book not found</h2>
        <Link href="/books" className="mt-4 text-indigo-600 hover:underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/books"
            className="rounded-md p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
        </div>
        <Button variant="secondary" onClick={() => setShowEditModal(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Book
        </Button>
      </div>

      {/* Book Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="relative h-48 bg-gray-100">
              <BookCover isbn={book.isbn} title={book.title} />
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
              <Button onClick={() => setShowAddCopyModal(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Add Copy
              </Button>
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
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
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
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <button
                            onClick={() => setEditingCopy(copy)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
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

      {/* Edit Book Modal */}
      {showEditModal && (
        <EditBookModal
          book={book}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadBook();
          }}
        />
      )}

      {/* Edit Copy Modal */}
      {editingCopy && (
        <EditCopyModal
          copy={editingCopy}
          onClose={() => setEditingCopy(null)}
          onSuccess={() => {
            setEditingCopy(null);
            loadBook();
          }}
        />
      )}
    </div>
  );
}

// Book cover component with fallback
function BookCover({ isbn, title }: { isbn: string | null; title: string }) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const coverUrl = isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : null;

  if (imgError || !isbn || !coverUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <BookOpen className="h-16 w-16 text-gray-300" />
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600"></div>
        </div>
      )}
      <img
        src={coverUrl}
        alt={title}
        className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
            setImgError(true);
          } else {
            setLoaded(true);
          }
        }}
        onError={() => setImgError(true)}
      />
    </>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Add Book Copy</h2>
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

          <Input
            label="Barcode"
            required
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="NEW">New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>

          <Input
            label="Shelf Location"
            value={formData.shelfLocation}
            onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
            placeholder="e.g., A-12-3"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Add Copy
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function EditBookModal({
  book,
  onClose,
  onSuccess,
}: {
  book: BookDetail;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    category: book.category,
    isbn: book.isbn || '',
    description: book.description || '',
    publishedYear: book.publishedYear?.toString() || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await books.update(book.id, {
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null,
      });
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
          <h2 className="text-lg font-semibold text-slate-900">Edit Book</h2>
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

          <Input
            label="Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Input
            label="Author"
            required
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="ISBN"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="For book cover"
            />
          </div>

          <Input
            label="Published Year"
            type="number"
            value={formData.publishedYear}
            onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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

function EditCopyModal({
  copy,
  onClose,
  onSuccess,
}: {
  copy: BookCopy;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    barcode: copy.barcode,
    condition: copy.condition,
    shelfLocation: copy.shelfLocation || '',
    status: copy.status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await books.updateCopy(copy.id, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Edit Copy</h2>
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

          <Input
            label="Barcode"
            required
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="AVAILABLE">Available</option>
              <option value="BORROWED">Borrowed</option>
              <option value="RESERVED">Reserved</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="NEW">New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>

          <Input
            label="Shelf Location"
            value={formData.shelfLocation}
            onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
            placeholder="e.g., A-12-3"
          />

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
