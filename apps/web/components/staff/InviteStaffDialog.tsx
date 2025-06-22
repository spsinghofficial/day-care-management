'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserRole } from '@shared-types';

const inviteStaffSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).refine(
    (role) => role === UserRole.BUSINESS_ADMIN || role === UserRole.EDUCATOR,
    'Please select a valid staff role'
  ),
});

type InviteStaffFormData = z.infer<typeof inviteStaffSchema>;

interface InviteStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (data: InviteStaffFormData) => Promise<void>;
}

export function InviteStaffDialog({ open, onOpenChange, onInvite }: InviteStaffDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InviteStaffFormData>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: UserRole.EDUCATOR,
    },
  });

  const handleSubmit = async (data: InviteStaffFormData) => {
    setIsLoading(true);
    try {
      await onInvite(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const staffRoles = [
    { value: UserRole.BUSINESS_ADMIN, label: 'Business Admin' },
    { value: UserRole.EDUCATOR, label: 'Educator' },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={() => onOpenChange(false)}
        ></div>

        {/* Dialog */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Invite Staff Member
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Send an invitation to a new staff member to join your daycare.
                </p>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        {...form.register('firstName')}
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        {...form.register('lastName')}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      {...form.register('email')}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      {...form.register('phone')}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      id="role"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      {...form.register('role')}
                    >
                      {staffRoles.map((role, index) => (
                        <option key={`${role.value}-${index}`} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.role && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.role.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      disabled={isLoading}
                      className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Invitation'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}