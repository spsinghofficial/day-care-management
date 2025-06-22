'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'EDUCATOR' | 'PARENT';
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const getSidebarItems = (): SidebarItem[] => {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    ];

    switch (user.role) {
      case 'SUPER_ADMIN':
        return [
          ...baseItems,
          { name: 'Tenants', href: '/super-admin/tenants', icon: '🏢' },
          { name: 'Analytics', href: '/super-admin/analytics', icon: '📊' },
          { name: 'Settings', href: '/super-admin/settings', icon: '⚙️' },
        ];
      case 'BUSINESS_ADMIN':
      case 'BUSINESS_ADMIN':
        return [
          ...baseItems,
          { name: 'Children', href: '/admin/children', icon: '👶' },
          { name: 'Staff', href: '/admin/staff', icon: '👥' },
          { name: 'Classrooms', href: '/admin/classrooms', icon: '🏫' },
          { name: 'Billing', href: '/admin/billing', icon: '💳' },
          { name: 'Reports', href: '/admin/reports', icon: '📈' },
          { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
        ];
      case 'EDUCATOR':
      case 'EDUCATOR':
      case 'EDUCATOR':
        return [
          ...baseItems,
          { name: 'My Classroom', href: '/teacher/classroom', icon: '🏫' },
          { name: 'Attendance', href: '/teacher/attendance', icon: '✅' },
          { name: 'Daily Reports', href: '/teacher/daily-reports', icon: '📝' },
          { name: 'Schedule', href: '/teacher/schedule', icon: '📅' },
        ];
      case 'PARENT':
        return [
          ...baseItems,
          { name: 'My Children', href: '/parent/children', icon: '👶' },
          { name: 'Payments', href: '/parent/payments', icon: '💳' },
          { name: 'Schedule', href: '/parent/schedule', icon: '📅' },
          { name: 'Messages', href: '/parent/messages', icon: '💬' },
          { name: 'Documents', href: '/parent/documents', icon: '📄' },
        ];
      default:
        return baseItems;
    }
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-indigo-400">DaycareManager</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
            </span>
          </div>
          {!isCollapsed && user && (
            <div>
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400">{user.role.replace('_', ' ').toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}