'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateSubdomain } from '../../lib/utils/tenant-client';

export default function SelectTenantPage() {
  const router = useRouter();
  const [subdomain, setSubdomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!subdomain) {
      setError('Please enter a daycare identifier');
      return;
    }

    if (!validateSubdomain(subdomain)) {
      setError('Invalid daycare identifier format');
      return;
    }

    setIsLoading(true);

    try {
      // Validate if daycare exists
      const response = await fetch(`/api/validate-tenant?subdomain=${subdomain}`);
      
      if (!response.ok) {
        setError('Daycare not found. Please check the identifier and try again.');
        return;
      }

      // Redirect to the tenant-specific URL
      const baseUrl = window.location.origin;
      const tenantUrl = `${window.location.protocol}//${subdomain}.${window.location.host}`;
      
      window.location.href = tenantUrl;
    } catch (error) {
      console.error('Tenant validation error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Select Your Daycare
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your daycare's unique identifier to access your portal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
              Daycare Identifier
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                placeholder="your-daycare"
                className="flex-1 block w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                .daycare-platform.com
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This is provided by your daycare administrator
            </p>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Connecting...
              </div>
            ) : (
              'Access Daycare Portal'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't know your daycare identifier?{' '}
            <a href="mailto:support@daycare-platform.com" className="font-medium text-indigo-600 hover:text-indigo-500">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}