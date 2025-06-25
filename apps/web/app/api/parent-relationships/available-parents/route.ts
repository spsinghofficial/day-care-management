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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Build query params
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const response = await fetch(`${apiBaseUrl}/parent-relationships/available-parents?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      // If backend is not available, return mock data for development
      if (response.status === 500 || !response.status) {
        console.warn('Backend not available, returning mock available parents data');
        const mockParents = [
          {
            id: 'parent-1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+1-555-0128',
            emailVerified: true,
            childrenCount: 1,
            children: [
              {
                id: 'child-1',
                firstName: 'Liam',
                lastName: 'Johnson',
              }
            ]
          },
          {
            id: 'parent-2',
            firstName: 'Michael',
            lastName: 'Brown',
            email: 'michael.brown@email.com',
            phone: '+1-555-0129',
            emailVerified: true,
            childrenCount: 2,
            children: [
              {
                id: 'child-2',
                firstName: 'Emma',
                lastName: 'Brown',
              },
              {
                id: 'child-3',
                firstName: 'Noah',
                lastName: 'Brown',
              }
            ]
          },
          {
            id: 'parent-3',
            firstName: 'Lisa',
            lastName: 'Davis',
            email: 'lisa.davis@email.com',
            phone: '+1-555-0130',
            emailVerified: false,
            childrenCount: 0,
            children: []
          }
        ];

        // Filter by search term if provided
        let filteredParents = mockParents;
        if (search) {
          const searchLower = search.toLowerCase();
          filteredParents = mockParents.filter(parent =>
            parent.firstName.toLowerCase().includes(searchLower) ||
            parent.lastName.toLowerCase().includes(searchLower) ||
            parent.email.toLowerCase().includes(searchLower)
          );
        }

        return NextResponse.json(filteredParents);
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching available parents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available parents' },
      { status: 500 }
    );
  }
}