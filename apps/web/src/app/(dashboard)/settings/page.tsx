'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Shield, Clock, Building2, LogOut, Pencil, X, Database, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { auth, dashboard } from '@/lib/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Fetch fresh user data from API to ensure role is up-to-date
    async function fetchUser() {
      try {
        const freshUser = await auth.me();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    }
    fetchUser();
  }, []);

  async function handleLoadDemoData() {
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const result = await dashboard.seedDemo();
      setDemoResult({
        success: true,
        message: `Demo data loaded: ${result.summary.books} books, ${result.summary.members} members, ${result.summary.activeBorrowings + result.summary.returnedBorrowings} borrowings`,
      });
    } catch (err: any) {
      setDemoResult({
        success: false,
        message: err.message || 'Failed to load demo data',
      });
    } finally {
      setDemoLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  async function handleSaveProfile(updatedUser: UserData) {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setShowEditModal(false);
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </div>

          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <User className="h-10 w-10 text-indigo-600" />
            </div>

            <div className="space-y-4 flex-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Name</label>
                  <p className="font-medium text-slate-900">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Role</label>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'success'}>
                    {user.role === 'ADMIN' ? 'Administrator' : 'Librarian'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-500 mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-900">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Info */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Info</h2>
          <dl className="space-y-4">
            <div>
              <dt className="flex items-center gap-2 text-sm text-slate-500">
                <Shield className="h-4 w-4" />
                Access Level
              </dt>
              <dd className="mt-1 font-medium text-slate-900">
                {user.role === 'ADMIN' ? 'Full Access' : 'Standard Access'}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm text-slate-500">
                <Building2 className="h-4 w-4" />
                Organization
              </dt>
              <dd className="mt-1 font-medium text-slate-900">ShelfWise Library</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                Session
              </dt>
              <dd className="mt-1 font-medium text-slate-900">Active</dd>
            </div>
          </dl>
        </Card>

        {/* Demo Data */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Demo Data</h2>
          <p className="text-sm text-slate-500 mb-4">
            Load sample books, members, and borrowings to explore the system. This only works when your library is empty.
          </p>

          {demoResult && (
            <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              demoResult.success
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              <div className="flex items-center gap-2">
                {demoResult.success && <CheckCircle className="h-4 w-4" />}
                {demoResult.message}
              </div>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={handleLoadDemoData}
            disabled={demoLoading}
          >
            <Database className="mr-2 h-4 w-4" />
            {demoLoading ? 'Loading Demo Data...' : 'Load Demo Data'}
          </Button>
        </Card>

        {/* Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions</h2>
          <div className="space-y-3">
            <Button variant="secondary" onClick={handleLogout} className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="w-full justify-start">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
          }}
        />
      )}
    </div>
  );
}

function EditProfileModal({
  user,
  onClose,
  onSave,
}: {
  user: UserData;
  onClose: () => void;
  onSave: (user: UserData) => void;
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user.role === 'ADMIN';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updated = await auth.updateProfile({
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      onSave(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Edit Profile</h2>
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
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ADMIN">Administrator</option>
                <option value="LIBRARIAN">Librarian</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
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

function DeleteAccountModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  async function handleDelete() {
    if (confirmText !== 'DELETE') return;

    setLoading(true);
    setError('');

    try {
      await auth.deleteAccount();
      onConfirm();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <Card className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Delete Account</h2>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <p className="font-medium mb-1">Warning: All your data will be permanently deleted:</p>
          <ul className="list-disc list-inside text-red-600 space-y-0.5">
            <li>All books and copies</li>
            <li>All members</li>
            <li>All borrowing records</li>
            <li>All fines</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Type DELETE to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
            isLoading={loading}
          >
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
