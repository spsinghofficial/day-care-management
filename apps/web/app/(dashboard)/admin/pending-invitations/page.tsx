'use client';

import { useState, useEffect } from 'react';
import { UserRole, StaffInvitation } from '@shared-types';

export default function PendingInvitationsPage() {
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/staff', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter for pending invitations (not verified users)
        const pendingInvitations = data.filter((member: any) => !member.emailVerified);
        setInvitations(pendingInvitations);
      } else {
        setError('Failed to load pending invitations');
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      setError('Failed to load pending invitations');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchInvitations();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleResendInvitation = async (userId: string) => {
    try {
      const response = await fetch('/api/auth/resend-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setSuccessMessage('Invitation resent successfully');
        setError('');
        fetchInvitations();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to resend invitation');
        setSuccessMessage('');
      }
    } catch (error) {
      setError('Failed to resend invitation');
      setSuccessMessage('');
    }
  };

  const handleCancelInvitation = async (userId: string) => {
    try {
      const response = await fetch(`/api/auth/cancel-invitation/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        setSuccessMessage('Invitation canceled successfully');
        setError('');
        fetchInvitations();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to cancel invitation');
        setSuccessMessage('');
      }
    } catch (error) {
      setError('Failed to cancel invitation');
      setSuccessMessage('');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.BUSINESS_ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UserRole.EDUCATOR:
        return 'bg-blue-100 text-blue-800';
      case UserRole.SUPER_ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.PARENT:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: UserRole) => {
    switch (role) {
      case UserRole.BUSINESS_ADMIN:
        return 'Admin';
      case UserRole.EDUCATOR:
        return 'Educator';
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      case UserRole.PARENT:
        return 'Parent';
      default:
        return role;
    }
  };

  const getInvitationStatus = (invitation: any) => {
    if (invitation.invitationExpiresAt) {
      const expiryDate = new Date(invitation.invitationExpiresAt);
      const now = new Date();
      if (expiryDate < now) {
        return { status: 'Expired', color: 'bg-red-100 text-red-800' };
      }
    }
    return { status: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pending Invitations</h1>
          <p className="text-gray-600">
            Manage staff invitations that haven't been accepted yet
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Stats Card */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Pending Invitations</dt>
                <dd className="text-lg font-medium text-gray-900">{invitations.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Invitations Table */}
      {invitations.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Outstanding Invitations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => {
                    const status = getInvitationStatus(invitation);
                    return (
                      <tr key={invitation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invitation.firstName} {invitation.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invitation.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(invitation.role)}`}>
                            {formatRole(invitation.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invitation.invitedAt ? new Date(invitation.invitedAt).toLocaleDateString() : new Date(invitation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invitation.invitationExpiresAt ? new Date(invitation.invitationExpiresAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleResendInvitation(invitation.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Resend invitation"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel invitation"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending invitations</h3>
          <p className="mt-1 text-sm text-gray-500">
            All staff invitations have been accepted or there are no pending invitations.
          </p>
        </div>
      )}
    </div>
  );
}