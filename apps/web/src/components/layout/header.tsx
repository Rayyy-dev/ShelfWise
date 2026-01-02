'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { User, Bell, AlertTriangle, BookOpen } from 'lucide-react';
import { borrowings } from '@/lib/api';

interface OverdueItem {
  id: string;
  daysOverdue: number;
  member: { firstName: string; lastName: string };
  bookCopy: { book: { title: string } };
}

export function Header() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [notifications, setNotifications] = useState<OverdueItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadNotifications() {
    try {
      const overdue = await borrowings.overdue();
      setNotifications(overdue.slice(0, 5));
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-6 bg-white border-b border-slate-200">
      {/* Logo/Title */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold text-slate-900 hidden sm:block">ShelfWise</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                {notifications.length > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {notifications.length} overdue
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No notifications</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={`/borrowings/${item.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.bookCopy.book.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.member.firstName} {item.member.lastName} - {item.daysOverdue} days overdue
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <Link
                  href="/borrowings?status=OVERDUE"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-3 text-center text-sm text-indigo-600 hover:bg-slate-50 border-t border-slate-100"
                >
                  View all overdue books
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User profile */}
        {user && (
          <Link href="/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
