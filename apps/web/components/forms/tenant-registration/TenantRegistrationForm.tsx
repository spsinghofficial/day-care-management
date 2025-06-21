'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StepIndicator } from '../multi-step/StepIndicator';
import { FormSection } from '../multi-step/FormSection';

const tenantRegistrationSchema = z.object({
  // Daycare Information
  daycareName: z.string().min(1, 'Daycare name is required'),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(20, 'Subdomain must be less than 20 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  
  // Administrator Information
  adminFirstName: z.string().min(1, 'First name is required'),
  adminLastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  
  // Business Settings (Optional)
  businessHours: z.object({
    openTime: z.string().default('07:00'),
    closeTime: z.string().default('18:00'),
  }).optional(),
  
  // Terms and Conditions
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type TenantRegistrationForm = z.infer<typeof tenantRegistrationSchema>;

const steps = [
  { id: '01', name: 'Daycare Info', status: 'current' },
  { id: '02', name: 'Admin Details', status: 'upcoming' },
  { id: '03', name: 'Settings', status: 'upcoming' },
  { id: '04', name: 'Review', status: 'upcoming' },
] as const;

export function TenantRegistrationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues,
  } = useForm<TenantRegistrationForm>({
    resolver: zodResolver(tenantRegistrationSchema),
    defaultValues: {
      businessHours: {
        openTime: '07:00',
        closeTime: '18:00',
      },
    },
  });

  const subdomainValue = watch('subdomain');

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setSubdomainChecking(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${apiBaseUrl}/auth/validate-subdomain?subdomain=${encodeURIComponent(subdomain)}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Subdomain check response:', data);
        setSubdomainAvailable(data.available);
      } else {
        console.log('Subdomain check failed:', response.status, data);
        setSubdomainAvailable(false);
      }
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setSubdomainAvailable(false);
    } finally {
      setSubdomainChecking(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (subdomainValue) {
        checkSubdomainAvailability(subdomainValue);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [subdomainValue]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof TenantRegistrationForm)[] = [];
    
    switch (currentStep) {
      case 0:
        fieldsToValidate = ['daycareName', 'subdomain', 'address', 'phone'];
        break;
      case 1:
        fieldsToValidate = ['adminFirstName', 'adminLastName', 'email', 'password', 'confirmPassword'];
        break;
      case 2:
        fieldsToValidate = ['businessHours'];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && subdomainAvailable !== false) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'complete';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const currentSteps = steps.map((step, index) => ({
    ...step,
    status: getStepStatus(index),
  }));

  const onSubmit = async (data: TenantRegistrationForm) => {
    console.log('Form submission started', data);
    setIsLoading(true);
    setError('');

    try {
      // Remove confirmPassword from the payload as it's only for client-side validation
      const { confirmPassword, ...payload } = data;
      console.log('Payload to send:', payload);
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${apiBaseUrl}/auth/register-tenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();
      
      // Redirect to verification page
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <FormSection 
            title="Daycare Information" 
            description="Tell us about your daycare to get started"
          >
            <div>
              <label htmlFor="daycareName" className="block text-sm font-medium text-gray-700">
                Daycare Name
              </label>
              <input
                {...register('daycareName')}
                type="text"
                placeholder="Little Stars Academy"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.daycareName && (
                <p className="mt-1 text-sm text-red-600">{errors.daycareName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                Choose Your Subdomain
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  {...register('subdomain')}
                  type="text"
                  placeholder="littlestars"
                  className="flex-1 block w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  .daycaremanager.com
                </span>
              </div>
              {subdomainChecking && (
                <p className="mt-1 text-sm text-blue-600">Checking availability...</p>
              )}
              {subdomainAvailable === true && (
                <p className="mt-1 text-sm text-green-600">✓ Subdomain is available!</p>
              )}
              {subdomainAvailable === false && (
                <p className="mt-1 text-sm text-red-600">✗ Subdomain is not available</p>
              )}
              {errors.subdomain && (
                <p className="mt-1 text-sm text-red-600">{errors.subdomain.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Daycare Address
              </label>
              <input
                {...register('address')}
                type="text"
                placeholder="123 Main St, Springfield, IL 62701"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+1-555-0123"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </FormSection>
        );

      case 1:
        return (
          <FormSection 
            title="Administrator Account" 
            description="Create the main administrator account for your daycare"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="adminFirstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  {...register('adminFirstName')}
                  type="text"
                  placeholder="Sarah"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.adminFirstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.adminFirstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="adminLastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  {...register('adminLastName')}
                  type="text"
                  placeholder="Johnson"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.adminLastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.adminLastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="sarah@littlestars.com"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Must contain at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </FormSection>
        );

      case 2:
        return (
          <FormSection 
            title="Business Settings" 
            description="Configure your daycare's operating hours"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="openTime" className="block text-sm font-medium text-gray-700">
                  Opening Time
                </label>
                <input
                  {...register('businessHours.openTime')}
                  type="time"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700">
                  Closing Time
                </label>
                <input
                  {...register('businessHours.closeTime')}
                  type="time"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> You can configure detailed schedules for different days, 
                holidays, and classroom-specific hours after registration.
              </p>
            </div>
          </FormSection>
        );

      case 3:
        const values = getValues();
        return (
          <FormSection 
            title="Review Your Information" 
            description="Please review your information before submitting"
          >
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Daycare Information</h4>
                <dl className="mt-2 text-sm text-gray-600">
                  <div className="flex justify-between py-1">
                    <dt>Name:</dt>
                    <dd>{values.daycareName}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt>Subdomain:</dt>
                    <dd>{values.subdomain}.daycaremanager.com</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt>Address:</dt>
                    <dd>{values.address}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt>Phone:</dt>
                    <dd>{values.phone}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Administrator</h4>
                <dl className="mt-2 text-sm text-gray-600">
                  <div className="flex justify-between py-1">
                    <dt>Name:</dt>
                    <dd>{values.adminFirstName} {values.adminLastName}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt>Email:</dt>
                    <dd>{values.email}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Business Hours</h4>
                <dl className="mt-2 text-sm text-gray-600">
                  <div className="flex justify-between py-1">
                    <dt>Operating Hours:</dt>
                    <dd>{values.businessHours?.openTime} - {values.businessHours?.closeTime}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div>
              <label className="flex items-start">
                <input
                  {...register('acceptTerms')}
                  type="checkbox"
                  className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-indigo-600 hover:text-indigo-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" target="_blank" className="text-indigo-600 hover:text-indigo-500">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
              )}
            </div>
          </FormSection>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Create Your Daycare Account
          </h1>
          <p className="mt-2 text-gray-600">
            Join thousands of daycare centers using our platform
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator steps={currentSteps} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={false}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    console.log('Submit button clicked', {
                      isLoading,
                      subdomainAvailable,
                      formErrors: Object.keys(errors),
                      formValues: getValues()
                    });
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}