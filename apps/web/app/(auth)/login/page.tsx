'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInForm = z.infer<typeof signInSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const message = searchParams.get('message');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true);
    setError('');

    try {
      // For development - simulate login with demo credentials
      if (data.email === 'admin@demo-daycare.com' && data.password === 'admin123') {
        const mockUser = {
          id: 'demo-admin',
          email: 'admin@demo-daycare.com',
          firstName: 'Demo',
          lastName: 'Admin',
          role: 'BUSINESS_ADMIN'
        };
        
        // Store mock token and user
        localStorage.setItem('token', 'demo-token-123');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        // Redirect to admin dashboard
        router.push('/admin');
        return;
      }
      
      if (data.email === 'sarah@demo-daycare.com' && data.password === 'educator123') {
        const mockUser = {
          id: 'demo-teacher',
          email: 'sarah@demo-daycare.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'EDUCATOR'
        };
        
        localStorage.setItem('token', 'demo-token-456');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        router.push('/teacher');
        return;
      }
      
      if (data.email === 'parent@demo-daycare.com' && data.password === 'parent123') {
        const mockUser = {
          id: 'demo-parent',
          email: 'parent@demo-daycare.com',
          firstName: 'John',
          lastName: 'Smith',
          role: 'PARENT'
        };
        
        localStorage.setItem('token', 'demo-token-789');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        router.push('/parent');
        return;
      }

      // If not demo credentials, try real API
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          subdomain: subdomain !== 'localhost' ? subdomain : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const result = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Redirect based on user role
      const { role } = result.user;
      
      switch (role) {
        case 'SUPER_ADMIN':
          router.push('/super-admin');
          break;
        case 'BUSINESS_ADMIN':
          router.push('/admin');
          break;
        case 'EDUCATOR':
          router.push('/teacher');
          break;
        case 'PARENT':
          router.push('/parent');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your daycare management portal
          </p>
        </div>

        {message === 'registration-complete' && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Registration completed successfully! Please login with your credentials.
          </div>
        )}
        
        {message === 'account-created' && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Account activated successfully! Please login with your credentials.
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="admin@demo-daycare.com"
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
                autoComplete="current-password"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-xs">
            <div className="bg-blue-50 p-2 rounded text-center">
              <strong>Admin:</strong> admin@demo-daycare.com / admin123
            </div>
            <div className="bg-green-50 p-2 rounded text-center">
              <strong>Educator:</strong> sarah@demo-daycare.com / educator123
            </div>
            <div className="bg-purple-50 p-2 rounded text-center">
              <strong>Parent:</strong> parent@demo-daycare.com / parent123
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            New business?{' '}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Get started here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}