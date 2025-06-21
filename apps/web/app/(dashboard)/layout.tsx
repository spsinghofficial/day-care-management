'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'DAYCARE_ADMIN' | 'TEACHER' | 'STAFF' | 'PARENT';
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', current: true },
    ];

    switch (user.role) {
      case 'SUPER_ADMIN':
        return [
          ...baseItems,
          { name: 'Tenants', href: '/dashboard/super-admin/tenants', current: false },
          { name: 'Analytics', href: '/dashboard/super-admin/analytics', current: false },
          { name: 'Settings', href: '/dashboard/super-admin/settings', current: false },
        ];
      case 'DAYCARE_ADMIN':
        return [
          ...baseItems,
          { name: 'Children', href: '/dashboard/admin/children', current: false },
          { name: 'Staff', href: '/dashboard/admin/staff', current: false },
          { name: 'Classrooms', href: '/dashboard/admin/classrooms', current: false },
          { name: 'Billing', href: '/dashboard/admin/billing', current: false },
          { name: 'Reports', href: '/dashboard/admin/reports', current: false },
          { name: 'Settings', href: '/dashboard/admin/settings', current: false },
        ];
      case 'TEACHER':
      case 'STAFF':
        return [
          ...baseItems,
          { name: 'My Classroom', href: '/dashboard/teacher/classroom', current: false },
          { name: 'Attendance', href: '/dashboard/teacher/attendance', current: false },
          { name: 'Daily Reports', href: '/dashboard/teacher/daily-reports', current: false },
          { name: 'Schedule', href: '/dashboard/teacher/schedule', current: false },
        ];
      case 'PARENT':
        return [
          ...baseItems,
          { name: 'My Children', href: '/dashboard/parent/children', current: false },
          { name: 'Payments', href: '/dashboard/parent/payments', current: false },
          { name: 'Schedule', href: '/dashboard/parent/schedule', current: false },
          { name: 'Messages', href: '/dashboard/parent/messages', current: false },
          { name: 'Documents', href: '/dashboard/parent/documents', current: false },
        ];
      default:
        return baseItems;
    }
  };

  const navigation = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                  DaycareManager
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {user.role.replace('_', ' ')}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}