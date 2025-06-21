'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      // If we have a token, verify it
      verifyEmail(token);
    } else if (email) {
      // If we have email but no token, show "check your email" message
      setStatus('success');
      setMessage('Please check your email for a verification link');
    } else {
      // No token and no email
      setStatus('error');
      setMessage('Missing verification information');
    }
  }, [token, email]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${apiBaseUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      setStatus('success');
      setMessage('Email verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?message=email-verified');
      }, 3000);
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const resendVerification = async () => {
    if (!email) return;

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${apiBaseUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend verification');
      }

      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to resend verification');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="mx-auto h-12 w-12 text-indigo-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Verifying your email
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-12 w-12 text-green-600">
                {token ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {token ? 'Email verified!' : 'Check your email'}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {message}
              </p>
              {token && (
                <p className="mt-2 text-center text-sm text-gray-500">
                  Redirecting to login page...
                </p>
              )}
              {!token && email && (
                <div className="mt-6">
                  <button
                    onClick={resendVerification}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Resend Verification Email
                  </button>
                  <div className="mt-4">
                    <a
                      href="/login"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Back to login
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-12 w-12 text-red-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Verification failed
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {message}
              </p>
              
              {!token && email && (
                <div className="mt-6 space-y-4">
                  <p className="text-sm text-gray-600">
                    Didn't receive the verification email?
                  </p>
                  <button
                    onClick={resendVerification}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Resend Verification Email
                  </button>
                </div>
              )}

              <div className="mt-6">
                <a
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Back to login
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}