'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Redirect to role-specific dashboard
        switch (user.role) {
          case 'SUPER_ADMIN':
            router.push('/super-admin');
            break;
          case 'BUSINESS_ADMIN':
          case 'DAYCARE_ADMIN':
            router.push('/admin');
            break;
          case 'EDUCATOR':
          case 'TEACHER':
          case 'EDUCATOR':
            router.push('/teacher');
            break;
          case 'PARENT':
            router.push('/parent');
            break;
          default:
            // Fallback to admin dashboard
            router.push('/admin');
        }
      } catch (error) {
        // Invalid user data, redirect to login
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}