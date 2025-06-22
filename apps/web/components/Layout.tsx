'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  
  // Pages that should not have sidebar
  const noSidebarPages = [
    '/login',
    '/register', 
    '/forgot-password',
    '/verify-email',
    '/accept-invitation',
    '/features',
    '/pricing',
    '/contact',
    '/waitlist'
  ];
  
  // Check if current page should not have sidebar
  // Include both explicit paths and paths that start with auth routes
  const shouldShowSidebar = !noSidebarPages.some(page => 
    pathname === page || pathname.startsWith(page)
  ) && !pathname.includes('(public)') && !pathname.includes('(auth)');

  if (!shouldShowSidebar) {
    // For auth and public pages, render without sidebar
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}