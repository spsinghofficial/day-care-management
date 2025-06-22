'use client';

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Stay connected with your child's daycare experience
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          Your parent portal is being prepared. You'll be able to view your children's 
          daily reports, schedule, make payments, and communicate with teachers here.
        </p>
      </div>
    </div>
  );
}