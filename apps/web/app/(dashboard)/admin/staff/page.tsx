'use client';

import { useState, useEffect } from 'react';
import { InviteStaffDialog } from '../../../../components/staff/InviteStaffDialog';
import { EditStaffDialog } from '../../../../components/staff/EditStaffDialog';
import { DeleteStaffConfirmDialog } from '../../../../components/staff/DeleteStaffConfirmDialog';
import { UserRole, StaffInvitation } from '@shared-types';

interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Separate active staff and pending invitations
        const activeStaff = data.filter((member: any) => member.isActive && member.emailVerified);
        const pendingInvitations = data.filter((member: any) => !member.emailVerified);
        
        setStaff(activeStaff);
        setInvitations(pendingInvitations);
      } else {
        setError('Failed to load staff members');
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      setError('Failed to load staff members');
    }
  };

  const fetchInvitations = async () => {
    // This is now handled in fetchStaff
    return;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStaff();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleInviteStaff = async (data: any) => {
    try {
      const response = await fetch('/api/auth/invite-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccessMessage('Staff invitation sent successfully');
        setError('');
        setInviteDialogOpen(false);
        fetchStaff();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send invitation');
        setSuccessMessage('');
      }
    } catch (error) {
      setError('Failed to send invitation');
      setSuccessMessage('');
    }
  };

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
        fetchStaff();
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
        fetchStaff();
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

  const handleEditStaff = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setEditDialogOpen(true);
  };

  const handleUpdateStaff = async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccessMessage('Staff member updated successfully');
        setError('');
        setEditDialogOpen(false);
        setSelectedStaff(null);
        fetchStaff();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update staff member');
        setSuccessMessage('');
      }
    } catch (error) {
      setError('Failed to update staff member');
      setSuccessMessage('');
    }
  };

  const handleDeleteStaff = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        setSuccessMessage('Staff member deleted successfully');
        setError('');
        setDeleteDialogOpen(false);
        setSelectedStaff(null);
        fetchStaff();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete staff member');
        setSuccessMessage('');
      }
    } catch (error) {
      setError('Failed to delete staff member');
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff Management</h1>
          <p className="text-gray-600">
            Manage your staff members and send invitations
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setInviteDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Invite Staff
          </button>
          {invitations.length > 0 && (
            <a
              href="/admin/pending-invitations"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Manage Pending ({invitations.length})
            </a>
          )}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Staff</dt>
                  <dd className="text-lg font-medium text-gray-900">{staff.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Staff</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {staff.filter(s => s.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

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
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Invitations</dt>
                  <dd className="text-lg font-medium text-gray-900">{invitations.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Staff */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Active Staff Members</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                        {formatRole(member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.lastLoginAt
                        ? new Date(member.lastLoginAt).toLocaleDateString()
                        : "Never"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditStaff(member)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit staff member"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete staff member"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Pending Invitations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <InviteStaffDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={handleInviteStaff}
      />

      <EditStaffDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleUpdateStaff}
        staffMember={selectedStaff}
      />

      <DeleteStaffConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        staffMember={selectedStaff}
      />
    </div>
  );
}