'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Redirect to appropriate dashboard based on role
        switch (user.role) {
          case 'SUPER_ADMIN':
            router.push('/dashboard/super-admin');
            break;
          case 'BUSINESS_ADMIN':
          case 'DAYCARE_ADMIN':
            router.push('/dashboard/admin');
            break;
          case 'EDUCATOR':
          case 'TEACHER':
          case 'EDUCATOR':
            router.push('/dashboard/teacher');
            break;
          case 'PARENT':
            router.push('/dashboard/parent');
            break;
          default:
            router.push('/dashboard');
        }
      } catch (error) {
        // Invalid user data, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } else {
      // No authentication, redirect to login page
      router.push('/login');
    }
  }, [router]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}