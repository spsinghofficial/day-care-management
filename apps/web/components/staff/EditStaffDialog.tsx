'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserRole } from '@shared-types';

const editStaffSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).refine(
    (role) => role === UserRole.BUSINESS_ADMIN || role === UserRole.EDUCATOR,
    'Please select a valid staff role'
  ),
  isActive: z.boolean(),
});

type EditStaffFormData = z.infer<typeof editStaffSchema>;

interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface EditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: EditStaffFormData) => Promise<void>;
  staffMember: StaffMember | null;
}

export function EditStaffDialog({ open, onOpenChange, onUpdate, staffMember }: EditStaffDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditStaffFormData>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: UserRole.EDUCATOR,
      isActive: true,
    },
  });

  // Update form when staffMember changes
  useEffect(() => {
    if (staffMember) {
      form.reset({
        firstName: staffMember.firstName,
        lastName: staffMember.lastName,
        email: staffMember.email,
        phone: staffMember.phone || '',
        role: staffMember.role,
        isActive: staffMember.isActive,
      });
    }
  }, [staffMember, form]);

  const handleSubmit = async (data: EditStaffFormData) => {
    if (!staffMember) return;
    
    setIsLoading(true);
    try {
      await onUpdate(staffMember.id, data);
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

  if (!open || !staffMember) return null;

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
                  Edit Staff Member
                </h3>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      {...form.register('firstName')}
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter first name"
                    />
                    {form.formState.errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      {...form.register('lastName')}
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter last name"
                    />
                    {form.formState.errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      {...form.register('email')}
                      type="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter email address"
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      {...form.register('phone')}
                      type="tel"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter phone number"
                    />
                    {form.formState.errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role *
                    </label>
                    <select
                      {...form.register('role')}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {staffRoles.map((role, index) => (
                        <option key={`${role.value}-${index}`} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.role && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.role.message}</p>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      {...form.register('isActive')}
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Active Staff Member
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Updating...' : 'Update Staff Member'}
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