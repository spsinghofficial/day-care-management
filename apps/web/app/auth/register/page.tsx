import { TenantRegistrationForm } from '@/components/forms/tenant-registration-form';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Create your Daycare Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Start managing your daycare with ease.
          </p>
        </div>
        <TenantRegistrationForm />
      </div>
    </div>
  );
} 