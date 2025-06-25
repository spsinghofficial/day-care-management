'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChildEnrollmentForm from '../../../../../components/children/ChildEnrollmentForm';

export default function EnrollChildPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnrollChild = async (data: any) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to children list with success message
        router.push('/admin/children?success=enrolled');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to enroll child');
      }
    } catch (error) {
      console.error('Failed to enroll child:', error);
      setError('Failed to enroll child. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Enroll New Child</h1>
          <p className="text-gray-600">
            Complete the form below to enroll a new child and create parent accounts
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Children
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Enrollment Form */}
      <ChildEnrollmentForm
        onSubmit={handleEnrollChild}
        loading={loading}
        classrooms={[
          // Mock classrooms - in a real app, fetch from API
          {
            id: 'classroom1',
            name: 'Butterfly Room',
            ageGroup: '3-4 years',
            capacity: 15,
            currentEnrollment: 12
          },
          {
            id: 'classroom2',
            name: 'Sunshine Room',
            ageGroup: '2-3 years',
            capacity: 12,
            currentEnrollment: 8
          },
          {
            id: 'classroom3',
            name: 'Rainbow Room',
            ageGroup: '4-5 years',
            capacity: 18,
            currentEnrollment: 15
          }
        ]}
      />
    </div>
  );
}