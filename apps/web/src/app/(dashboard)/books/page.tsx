'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, BookOpen, X } from 'lucide-react';
import { books } from '@/lib/api';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Badge } from '@/components/ui';

interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export default function BooksPage() {
  const [bookList, setBookList] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadBooks();
    loadCategories();
  }, [search, selectedCategory]);

  async function loadBooks() {
    try {
      const result = await books.list({ search, category: selectedCategory || undefined });
      setBookList(result.books);
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const result = await books.categories();
      setCategories(result);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Books</h1>
          <p className="text-slate-500 mt-1">Manage your library collection</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      {/* Filters */}
      <Card className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search books by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </Card>

      {/* Books Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bookList.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`}>
              <Card hover className="h-full p-0 overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Book Cover */}
                  <div className="relative h-24 w-16 flex-shrink-0 bg-slate-100 rounded overflow-hidden">
                    <BookCover isbn={book.isbn} title={book.title} />
                  </div>

                  {/* Book Info */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="font-medium text-slate-900 text-sm line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mb-2">{book.author}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <Badge variant="default" className="text-xs">{book.category}</Badge>
                      <span
                        className={`text-xs font-medium ${
                          book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {book.availableCopies}/{book.totalCopies}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && bookList.length === 0 && (
        <Card className="py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">No books found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {search || selectedCategory
                  ? 'Try adjusting your search or filter'
                  : 'Get started by adding a new book'}
              </p>
            </div>
            {!search && !selectedCategory && (
              <Button onClick={() => setShowAddModal(true)} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Book
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <AddBookModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadBooks();
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
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <BookOpen className="h-6 w-6 text-slate-300" />
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"></div>
        </div>
      )}
      <img
        src={coverUrl}
        alt={title}
        className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          // Open Library returns 1x1 pixel when no cover found
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

function AddBookModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    description: '',
    publishedYear: '',
    barcode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await books.create({
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : undefined,
        copies: formData.barcode ? [formData.barcode] : [],
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
          <h2 className="text-lg font-semibold text-slate-900">Add New Book</h2>
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Published Year"
              type="number"
              value={formData.publishedYear}
              onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
            />
            <Input
              label="First Copy Barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Add Book
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
