import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    const response = await fetch(`${apiBaseUrl}/parent-relationships/child/${params.childId}/parents`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      // If backend is not available, return mock data for development
      if (response.status === 500 || !response.status) {
        console.warn('Backend not available, returning mock child parents data');
        const mockParents = [
          {
            relationshipId: 'rel-1',
            parent: {
              id: 'parent-1',
              firstName: 'John',
              lastName: 'Wilson',
              email: 'john.wilson@email.com',
              phone: '+1-555-0126',
              emailVerified: true,
              lastLoginAt: '2025-02-15T10:30:00Z',
            },
            relationship: 'FATHER',
            isPrimary: true,
            isEmergencyContact: true,
            canPickup: true,
            createdAt: '2025-02-01T00:00:00Z',
          },
          {
            relationshipId: 'rel-2',
            parent: {
              id: 'parent-2',
              firstName: 'Jane',
              lastName: 'Wilson',
              email: 'jane.wilson@email.com',
              phone: '+1-555-0127',
              emailVerified: true,
              lastLoginAt: '2025-02-14T15:45:00Z',
            },
            relationship: 'MOTHER',
            isPrimary: false,
            isEmergencyContact: true,
            canPickup: true,
            createdAt: '2025-02-01T00:00:00Z',
          }
        ];
        return NextResponse.json(mockParents);
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching child parents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch child parents' },
      { status: 500 }
    );
  }
}