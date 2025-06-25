'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PhotoGallery from '../../../../../components/children/PhotoGallery';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  status: string;
  enrollmentDate: string;
  profilePhoto?: string;
  notes?: string;
  classroom?: {
    id: string;
    name: string;
    ageGroup: string;
  };
  parents: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
    isEmergencyContact: boolean;
    canPickup: boolean;
  }>;
  medicalInformation?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    medicalConditions?: string[];
    doctorName?: string;
    doctorPhone?: string;
    hospitalPreference?: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
    additionalNotes?: string;
  };
  emergencyContacts?: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isAuthorizedPickup: boolean;
    notes?: string;
  }>;
}

export default function ChildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'photos' | 'emergency'>('overview');

  useEffect(() => {
    if (childId) {
      fetchChild();
    }
  }, [childId]);

  const fetchChild = async () => {
    try {
      const response = await fetch(`/api/children/${childId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChild(data);
      } else {
        setError('Failed to load child details');
      }
    } catch (error) {
      console.error('Failed to fetch child:', error);
      setError('Failed to load child details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'WAITLIST':
        return 'bg-yellow-100 text-yellow-800';
      case 'WITHDRAWN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Child not found'}</div>
        <Link
          href="/admin/children"
          className="text-indigo-600 hover:text-indigo-900"
        >
          ← Back to Children
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/children"
            className="text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Children
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {child.firstName} {child.lastName}
            </h1>
            <p className="text-gray-600">Child Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/admin/children/${child.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit Child
          </Link>
        </div>
      </div>

      {/* Child Summary Card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {child.profilePhoto ? (
                <img className="h-20 w-20 rounded-full object-cover" src={child.profilePhoto} alt="" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg className="h-12 w-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Age</dt>
                  <dd className="text-lg font-semibold text-gray-900">{child.age}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(child.status)}`}>
                      {child.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Classroom</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {child.classroom ? child.classroom.name : 'Not assigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Enrollment Date</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {new Date(child.enrollmentDate).toLocaleDateString()}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: '👤' },
            { key: 'medical', label: 'Medical', icon: '🏥' },
            { key: 'photos', label: 'Photos', icon: '📷' },
            { key: 'emergency', label: 'Emergency Contacts', icon: '🚨' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${ 
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {activeTab === 'overview' && (
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="text-sm text-gray-900">{child.firstName} {child.lastName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="text-sm text-gray-900">{new Date(child.dateOfBirth).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="text-sm text-gray-900">{child.gender}</dd>
                  </div>
                  {child.notes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="text-sm text-gray-900">{child.notes}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Parents */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Parents</h3>
                <div className="space-y-4">
                  {child.parents.map((parent, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {parent.firstName} {parent.lastName}
                            {parent.isPrimary && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Primary
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">{parent.relationship}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Email: {parent.email}</p>
                        <p>Phone: {parent.phone}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span>Emergency Contact: {parent.isEmergencyContact ? 'Yes' : 'No'}</span>
                          <span>Can Pickup: {parent.canPickup ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="px-4 py-5 sm:p-6">
            {child.medicalInformation ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                    <dl className="space-y-3">
                      {child.medicalInformation.bloodType && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Blood Type</dt>
                          <dd className="text-sm text-gray-900">{child.medicalInformation.bloodType}</dd>
                        </div>
                      )}
                      {child.medicalInformation.allergies && child.medicalInformation.allergies.length > 0 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                          <dd className="text-sm text-gray-900">{child.medicalInformation.allergies.join(', ')}</dd>
                        </div>
                      )}
                      {child.medicalInformation.medications && child.medicalInformation.medications.length > 0 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Medications</dt>
                          <dd className="text-sm text-gray-900">{child.medicalInformation.medications.join(', ')}</dd>
                        </div>
                      )}
                      {child.medicalInformation.medicalConditions && child.medicalInformation.medicalConditions.length > 0 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Medical Conditions</dt>
                          <dd className="text-sm text-gray-900">{child.medicalInformation.medicalConditions.join(', ')}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Healthcare Providers</h3>
                    <dl className="space-y-3">
                      {child.medicalInformation.doctorName && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Doctor</dt>
                          <dd className="text-sm text-gray-900">{child.medicalInformation.doctorName}</dd>
                          {child.medicalInformation.doctorPhone && (
                            <dd className="text-sm text-gray-500">{child.medicalInformation.doctorPhone}</dd>
                          )}
                        </div>
                      )}
                      {child.medicalInformation.hospitalPreference && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Hospital Preference</dt>
                          <dd className="text-sm text-gray-900">{child.medicalInformation.hospitalPreference}</dd>
                        </div>
                      )}
                      {child.medicalInformation.insuranceProvider && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Insurance Provider</dt>
                          <dd className="text-sm text-gray-900">{child.medicalInformation.insuranceProvider}</dd>
                          {child.medicalInformation.insurancePolicyNumber && (
                            <dd className="text-sm text-gray-500">Policy: {child.medicalInformation.insurancePolicyNumber}</dd>
                          )}
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {child.medicalInformation.additionalNotes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Additional Notes</dt>
                    <dd className="text-sm text-gray-900 mt-1">{child.medicalInformation.additionalNotes}</dd>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No medical information available.</p>
            )}
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="px-4 py-5 sm:p-6">
            <PhotoGallery
              childId={child.id}
              childName={`${child.firstName} ${child.lastName}`}
              canUpload={true}
            />
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="px-4 py-5 sm:p-6">
            {child.emergencyContacts && child.emergencyContacts.length > 0 ? (
              <div className="space-y-4">
                {child.emergencyContacts.map((contact, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-500">{contact.relationship}</p>
                      </div>
                      {contact.isAuthorizedPickup && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Authorized Pickup
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Phone: {contact.phone}</p>
                      {contact.email && <p>Email: {contact.email}</p>}
                      {contact.notes && <p>Notes: {contact.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No emergency contacts available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}