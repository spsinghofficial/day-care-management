'use client';

import { useState } from 'react';
import { UserRole } from '@shared-types';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isAuthorizedPickup?: boolean;
  notes?: string;
}

interface MedicalInformation {
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
}

interface ParentDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
  isEmergencyContact?: boolean;
  canPickup?: boolean;
}

interface ChildEnrollmentData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  enrollmentDate?: string;
  classroomId?: string;
  notes?: string;
  parentDetails: ParentDetails;
  medicalInfo?: MedicalInformation;
  emergencyContacts?: EmergencyContact[];
}

interface ChildEnrollmentFormProps {
  onSubmit: (data: ChildEnrollmentData) => Promise<void>;
  loading?: boolean;
  classrooms?: Array<{ id: string; name: string; ageGroup: string; capacity: number; currentEnrollment: number }>;
}

export default function ChildEnrollmentForm({ onSubmit, loading = false, classrooms = [] }: ChildEnrollmentFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ChildEnrollmentData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    enrollmentDate: '',
    classroomId: '',
    notes: '',
    parentDetails: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      relationship: 'MOTHER',
      isPrimary: true,
      isEmergencyContact: true,
      canPickup: true,
    },
    medicalInfo: {
      bloodType: '',
      allergies: [],
      medications: [],
      medicalConditions: [],
      doctorName: '',
      doctorPhone: '',
      hospitalPreference: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      additionalNotes: '',
    },
    emergencyContacts: [
      {
        name: '',
        relationship: '',
        phone: '',
        email: '',
        isAuthorizedPickup: false,
        notes: '',
      }
    ],
  });

  const [allergies, setAllergies] = useState<string>('');
  const [medications, setMedications] = useState<string>('');
  const [medicalConditions, setMedicalConditions] = useState<string>('');

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process arrays from comma-separated strings
    const processedData = {
      ...formData,
      medicalInfo: {
        ...formData.medicalInfo,
        allergies: allergies.split(',').map(item => item.trim()).filter(item => item),
        medications: medications.split(',').map(item => item.trim()).filter(item => item),
        medicalConditions: medicalConditions.split(',').map(item => item.trim()).filter(item => item),
      },
    };

    await onSubmit(processedData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateParentDetails = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      parentDetails: {
        ...prev.parentDetails,
        [field]: value,
      },
    }));
  };

  const updateMedicalInfo = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        [field]: value,
      },
    }));
  };

  const updateEmergencyContact = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts?.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      ) || [],
    }));
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [
        ...(prev.emergencyContacts || []),
        {
          name: '',
          relationship: '',
          phone: '',
          email: '',
          isAuthorizedPickup: false,
          notes: '',
        }
      ],
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts?.filter((_, i) => i !== index) || [],
    }));
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {[1, 2, 3, 4].map((step, index) => (
            <li key={step} className={`relative ${index !== 3 ? 'pr-8 sm:pr-20' : ''}`}>
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                {index !== 3 && (
                  <div className={`h-0.5 w-full ${step <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                )}
              </div>
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                step <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <span className="text-sm font-medium">{step}</span>
              </div>
              <div className="mt-2">
                <span className={`text-sm font-medium ${
                  step <= currentStep ? 'text-indigo-600' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Child Info'}
                  {step === 2 && 'Parent Info'}
                  {step === 3 && 'Medical Info'}
                  {step === 4 && 'Emergency Contacts'}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Child Information</h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name *</label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name *</label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
          <input
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => updateFormData('gender', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Enrollment Date</label>
          <input
            type="date"
            value={formData.enrollmentDate}
            onChange={(e) => updateFormData('enrollmentDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Classroom</label>
          <select
            value={formData.classroomId}
            onChange={(e) => updateFormData('classroomId', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select Classroom</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} ({classroom.ageGroup}) - {classroom.capacity - classroom.currentEnrollment} spots available
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => updateFormData('notes', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Any additional information about the child..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Parent Information</h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name *</label>
          <input
            type="text"
            required
            value={formData.parentDetails.firstName}
            onChange={(e) => updateParentDetails('firstName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name *</label>
          <input
            type="text"
            required
            value={formData.parentDetails.lastName}
            onChange={(e) => updateParentDetails('lastName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            required
            value={formData.parentDetails.email}
            onChange={(e) => updateParentDetails('email', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone *</label>
          <input
            type="tel"
            required
            value={formData.parentDetails.phone}
            onChange={(e) => updateParentDetails('phone', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Relationship *</label>
          <select
            required
            value={formData.parentDetails.relationship}
            onChange={(e) => updateParentDetails('relationship', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="MOTHER">Mother</option>
            <option value="FATHER">Father</option>
            <option value="GUARDIAN">Guardian</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.parentDetails.isPrimary}
            onChange={(e) => updateParentDetails('isPrimary', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Primary contact</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.parentDetails.isEmergencyContact}
            onChange={(e) => updateParentDetails('isEmergencyContact', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Emergency contact</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.parentDetails.canPickup}
            onChange={(e) => updateParentDetails('canPickup', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Authorized for pickup</label>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Blood Type</label>
          <select
            value={formData.medicalInfo?.bloodType}
            onChange={(e) => updateMedicalInfo('bloodType', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select Blood Type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
          <input
            type="text"
            value={formData.medicalInfo?.doctorName}
            onChange={(e) => updateMedicalInfo('doctorName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Doctor Phone</label>
          <input
            type="tel"
            value={formData.medicalInfo?.doctorPhone}
            onChange={(e) => updateMedicalInfo('doctorPhone', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hospital Preference</label>
          <input
            type="text"
            value={formData.medicalInfo?.hospitalPreference}
            onChange={(e) => updateMedicalInfo('hospitalPreference', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
          <input
            type="text"
            value={formData.medicalInfo?.insuranceProvider}
            onChange={(e) => updateMedicalInfo('insuranceProvider', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Insurance Policy Number</label>
          <input
            type="text"
            value={formData.medicalInfo?.insurancePolicyNumber}
            onChange={(e) => updateMedicalInfo('insurancePolicyNumber', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Allergies</label>
          <input
            type="text"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="Enter allergies separated by commas (e.g., Peanuts, Dairy, Eggs)"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Current Medications</label>
          <input
            type="text"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            placeholder="Enter medications separated by commas"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
          <input
            type="text"
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
            placeholder="Enter medical conditions separated by commas"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Medical Notes</label>
          <textarea
            rows={3}
            value={formData.medicalInfo?.additionalNotes}
            onChange={(e) => updateMedicalInfo('additionalNotes', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Any additional medical information or special instructions..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Emergency Contacts</h3>
        <button
          type="button"
          onClick={addEmergencyContact}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
        >
          Add Contact
        </button>
      </div>
      
      {formData.emergencyContacts?.map((contact, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Emergency Contact {index + 1}</h4>
            {formData.emergencyContacts && formData.emergencyContacts.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmergencyContact(index)}
                className="text-red-600 hover:text-red-900"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Relationship</label>
              <input
                type="text"
                value={contact.relationship}
                onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => updateEmergencyContact(index, 'email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={contact.isAuthorizedPickup}
                onChange={(e) => updateEmergencyContact(index, 'isAuthorizedPickup', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Authorized for pickup</label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={2}
              value={contact.notes}
              onChange={(e) => updateEmergencyContact(index, 'notes', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Additional notes about this contact..."
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {renderStepIndicator()}
      
      <div className="bg-white shadow-lg rounded-lg p-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      <div className="flex justify-between">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
        )}
        
        <div className="flex-1" />
        
        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Enrolling...' : 'Enroll Child'}
          </button>
        )}
      </div>
    </form>
  );
}