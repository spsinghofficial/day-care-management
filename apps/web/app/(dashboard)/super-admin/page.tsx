'use client';

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform-wide administration and management
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          The super admin dashboard is being prepared. You'll be able to manage all 
          tenants, view platform analytics, and configure system-wide settings here.
        </p>
      </div>
    </div>
  );
}