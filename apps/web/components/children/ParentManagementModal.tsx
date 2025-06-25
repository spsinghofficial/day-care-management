'use client';

import { useState, useEffect } from 'react';

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  childrenCount?: number;
  children?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

interface ParentRelationship {
  relationshipId: string;
  parent: Parent;
  relationship: string;
  isPrimary: boolean;
  isEmergencyContact: boolean;
  canPickup: boolean;
  createdAt: string;
}

interface ParentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  childName: string;
  onParentAdded: () => void;
}

export default function ParentManagementModal({
  isOpen,
  onClose,
  childId,
  childName,
  onParentAdded,
}: ParentManagementModalProps) {
  const [currentTab, setCurrentTab] = useState<'current' | 'add-new' | 'add-existing'>('current');
  const [parents, setParents] = useState<ParentRelationship[]>([]);
  const [availableParents, setAvailableParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for adding new parent
  const [newParentForm, setNewParentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    relationship: 'MOTHER',
    isPrimary: false,
    isEmergencyContact: true,
    canPickup: true,
  });

  // Form state for adding existing parent
  const [existingParentForm, setExistingParentForm] = useState({
    parentId: '',
    relationship: 'MOTHER',
    isPrimary: false,
    isEmergencyContact: true,
    canPickup: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchCurrentParents();
    }
  }, [isOpen, childId]);

  useEffect(() => {
    if (currentTab === 'add-existing') {
      fetchAvailableParents();
    }
  }, [currentTab, searchTerm]);

  const fetchCurrentParents = async () => {
    try {
      const response = await fetch(`/api/parent-relationships/child/${childId}/parents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setParents(data);
      }
    } catch (error) {
      console.error('Failed to fetch current parents:', error);
    }
  };

  const fetchAvailableParents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/parent-relationships/available-parents?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out parents already associated with this child
        const currentParentIds = parents.map(p => p.parent.id);
        const filtered = data.filter((parent: Parent) => !currentParentIds.includes(parent.id));
        setAvailableParents(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch available parents:', error);
    }
  };

  const handleAddNewParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/parent-relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'add-new-parent',
          childId,
          ...newParentForm,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(result.message);
        setNewParentForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          relationship: 'MOTHER',
          isPrimary: false,
          isEmergencyContact: true,
          canPickup: true,
        });
        fetchCurrentParents();
        setCurrentTab('current');
        onParentAdded();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add parent');
      }
    } catch (error) {
      setError('Failed to add parent');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExistingParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/parent-relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'add-existing-parent',
          childId,
          ...existingParentForm,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(result.message);
        setExistingParentForm({
          parentId: '',
          relationship: 'MOTHER',
          isPrimary: false,
          isEmergencyContact: true,
          canPickup: true,
        });
        fetchCurrentParents();
        setCurrentTab('current');
        onParentAdded();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add parent');
      }
    } catch (error) {
      setError('Failed to add parent');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRelationship = async (relationshipId: string, updates: any) => {
    try {
      const response = await fetch(`/api/parent-relationships/${relationshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setSuccessMessage('Relationship updated successfully');
        fetchCurrentParents();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update relationship');
      }
    } catch (error) {
      setError('Failed to update relationship');
    }
  };

  const handleRemoveParent = async (relationshipId: string) => {
    if (!confirm('Are you sure you want to remove this parent from the child?')) {
      return;
    }

    try {
      const response = await fetch(`/api/parent-relationships/${relationshipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        setSuccessMessage('Parent removed successfully');
        fetchCurrentParents();
        onParentAdded();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to remove parent');
      }
    } catch (error) {
      setError('Failed to remove parent');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Manage Parents for {childName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setCurrentTab('current')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'current'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Current Parents ({parents.length})
            </button>
            <button
              onClick={() => setCurrentTab('add-new')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'add-new'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Add New Parent
            </button>
            <button
              onClick={() => setCurrentTab('add-existing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'add-existing'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Add Existing Parent
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {currentTab === 'current' && (
          <div className="space-y-4">
            {parents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No parents assigned to this child.</p>
            ) : (
              parents.map((parentRel) => (
                <div key={parentRel.relationshipId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {parentRel.parent.firstName} {parentRel.parent.lastName}
                            {parentRel.isPrimary && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Primary
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">{parentRel.parent.email}</p>
                          <p className="text-sm text-gray-500">{parentRel.parent.phone}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>Relationship: {parentRel.relationship}</span>
                        <span>Emergency Contact: {parentRel.isEmergencyContact ? 'Yes' : 'No'}</span>
                        <span>Can Pickup: {parentRel.canPickup ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateRelationship(parentRel.relationshipId, { isPrimary: !parentRel.isPrimary })}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        {parentRel.isPrimary ? 'Remove Primary' : 'Make Primary'}
                      </button>
                      <button
                        onClick={() => handleRemoveParent(parentRel.relationshipId)}
                        className="text-red-600 hover:text-red-900 text-sm"
                        disabled={parents.length <= 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {currentTab === 'add-new' && (
          <form onSubmit={handleAddNewParent} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  required
                  value={newParentForm.firstName}
                  onChange={(e) => setNewParentForm({ ...newParentForm, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  required
                  value={newParentForm.lastName}
                  onChange={(e) => setNewParentForm({ ...newParentForm, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  required
                  value={newParentForm.email}
                  onChange={(e) => setNewParentForm({ ...newParentForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone *</label>
                <input
                  type="tel"
                  required
                  value={newParentForm.phone}
                  onChange={(e) => setNewParentForm({ ...newParentForm, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Relationship *</label>
                <select
                  required
                  value={newParentForm.relationship}
                  onChange={(e) => setNewParentForm({ ...newParentForm, relationship: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="MOTHER">Mother</option>
                  <option value="FATHER">Father</option>
                  <option value="GUARDIAN">Guardian</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newParentForm.isPrimary}
                  onChange={(e) => setNewParentForm({ ...newParentForm, isPrimary: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Primary contact</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newParentForm.isEmergencyContact}
                  onChange={(e) => setNewParentForm({ ...newParentForm, isEmergencyContact: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Emergency contact</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newParentForm.canPickup}
                  onChange={(e) => setNewParentForm({ ...newParentForm, canPickup: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Authorized for pickup</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setCurrentTab('current')}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Parent'}
              </button>
            </div>
          </form>
        )}

        {currentTab === 'add-existing' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Parents</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <form onSubmit={handleAddExistingParent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Parent *</label>
                <select
                  required
                  value={existingParentForm.parentId}
                  onChange={(e) => setExistingParentForm({ ...existingParentForm, parentId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Choose a parent...</option>
                  {availableParents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.firstName} {parent.lastName} ({parent.email})
                      {parent.childrenCount > 0 && ` - ${parent.childrenCount} children`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Relationship *</label>
                <select
                  required
                  value={existingParentForm.relationship}
                  onChange={(e) => setExistingParentForm({ ...existingParentForm, relationship: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="MOTHER">Mother</option>
                  <option value="FATHER">Father</option>
                  <option value="GUARDIAN">Guardian</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={existingParentForm.isPrimary}
                    onChange={(e) => setExistingParentForm({ ...existingParentForm, isPrimary: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Primary contact</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={existingParentForm.isEmergencyContact}
                    onChange={(e) => setExistingParentForm({ ...existingParentForm, isEmergencyContact: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Emergency contact</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={existingParentForm.canPickup}
                    onChange={(e) => setExistingParentForm({ ...existingParentForm, canPickup: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Authorized for pickup</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCurrentTab('current')}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Parent'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}