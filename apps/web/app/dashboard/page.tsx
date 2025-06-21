'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
  emailVerified: boolean;
  tenant?: {
    id: string;
    name: string;
    subdomain: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user info:', error);
      localStorage.removeItem('token');
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <a href="/login" className="text-indigo-600 hover:text-indigo-500">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* User Welcome Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-600 mt-2">
                {user.tenant?.name || 'Daycare Management Dashboard'}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-sm text-gray-500">Role: {user.role}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{user.email}</span>
                {user.emailVerified && (
                  <>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Role-based Dashboard Content */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Parent Portal
            </h2>
            <p className="text-gray-600 mb-4">
              Manage your children's enrollment, documents, and schedules.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Access Portal
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Admin Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Manage services, educators, and enrollment requests.
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Admin Panel
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Educator Hub
            </h2>
            <p className="text-gray-600 mb-4">
              View schedules and manage assigned children.
            </p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              View Schedule
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Quick Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">45</div>
              <div className="text-gray-600">Enrolled Children</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">12</div>
              <div className="text-gray-600">Waitlist</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">8</div>
              <div className="text-gray-600">Educators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">5</div>
              <div className="text-gray-600">Programs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}