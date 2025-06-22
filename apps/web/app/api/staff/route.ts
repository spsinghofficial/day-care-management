import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    const response = await fetch(`${apiBaseUrl}/auth/invited-users`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      // If backend is not available, return mock data for development
      if (response.status === 500 || !response.status) {
        console.warn('Backend not available, returning mock data');
        const mockStaff = [
          {
            id: '1',
            email: 'emily.teacher@littlestars.com',
            firstName: 'Emily',
            lastName: 'Davis',
            role: 'EDUCATOR',
            isActive: true,
            emailVerified: true,
            lastLoginAt: '2025-01-15T10:30:00Z',
            createdAt: '2025-01-01T00:00:00Z',
          },
          {
            id: '2',
            email: 'sarah.admin@littlestars.com',
            firstName: 'Sarah',
            lastName: 'Johnson',
            role: 'BUSINESS_ADMIN',
            isActive: true,
            emailVerified: true,
            lastLoginAt: '2025-01-15T14:20:00Z',
            createdAt: '2025-01-01T00:00:00Z',
          },
        ];
        return NextResponse.json(mockStaff);
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching staff:', error);
    // Return mock data if there's a network error
    console.warn('Network error, returning mock data');
    const mockStaff = [
      {
        id: '1',
        email: 'emily.teacher@littlestars.com',
        firstName: 'Emily',
        lastName: 'Davis',
        role: 'EDUCATOR',
        isActive: true,
        emailVerified: true,
        lastLoginAt: '2025-01-15T10:30:00Z',
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        email: 'sarah.admin@littlestars.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'BUSINESS_ADMIN',
        isActive: true,
        emailVerified: true,
        lastLoginAt: '2025-01-15T14:20:00Z',
        createdAt: '2025-01-01T00:00:00Z',
      },
    ];
    return NextResponse.json(mockStaff);
  }
}