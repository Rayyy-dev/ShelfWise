'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  DollarSign,
  FileText,
  LogOut,
  Library,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Books', href: '/books', icon: BookOpen },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Borrowings', href: '/borrowings', icon: ArrowLeftRight },
  { name: 'Fines', href: '/fines', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-slate-900 transition-all duration-300',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 flex-shrink-0">
            <Library className="h-5 w-5 text-white" />
          </div>
          {isOpen && <span className="text-lg font-semibold text-white whitespace-nowrap">ShelfWise</span>}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            'h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-all',
            !isOpen && 'rotate-180'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={!isOpen ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                !isOpen && 'justify-center px-0'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-2">
        <button
          onClick={handleLogout}
          title={!isOpen ? 'Logout' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white',
            !isOpen && 'justify-center px-0'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
