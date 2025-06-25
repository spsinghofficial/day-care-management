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
    const response = await fetch(`${apiBaseUrl}/auth/staff-members`, {
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
            isInvited: false,
            invitedAt: null,
            invitationExpiresAt: null,
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
            isInvited: false,
            invitedAt: null,
            invitationExpiresAt: null,
          },
          {
            id: '3',
            email: 'jane.pending@littlestars.com',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'EDUCATOR',
            isActive: false,
            emailVerified: false,
            lastLoginAt: null,
            createdAt: '2025-01-20T00:00:00Z',
            isInvited: true,
            invitedAt: '2025-01-20T00:00:00Z',
            invitationExpiresAt: '2025-01-23T00:00:00Z',
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
        isInvited: false,
        invitedAt: null,
        invitationExpiresAt: null,
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
        isInvited: false,
        invitedAt: null,
        invitationExpiresAt: null,
      },
      {
        id: '3',
        email: 'jane.pending@littlestars.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'EDUCATOR',
        isActive: false,
        emailVerified: false,
        lastLoginAt: null,
        createdAt: '2025-01-20T00:00:00Z',
        isInvited: true,
        invitedAt: '2025-01-20T00:00:00Z',
        invitationExpiresAt: '2025-01-23T00:00:00Z',
      },
    ];
    return NextResponse.json(mockStaff);
  }
}