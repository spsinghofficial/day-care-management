'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TenantRegistrationForm } from '@/components/forms/tenant-registration-form';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegistrationSuccess = (data: { subdomain: string }) => {
    // Redirect to subdomain login page
    window.location.href = `http://${data.subdomain}.localhost:3000/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your daycare account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Login here
            </Link>
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <TenantRegistrationForm onSuccess={handleRegistrationSuccess} />
        </div>
      </div>
    </div>
  );
}