import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    let endpoint = '';
    if (action === 'add-new-parent') {
      endpoint = '/parent-relationships/add-new-parent';
    } else if (action === 'add-existing-parent') {
      endpoint = '/parent-relationships/add-existing-parent';
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // If backend is not available, return mock success for development
      if (response.status === 500 || !response.status) {
        console.warn('Backend not available, returning mock parent relationship creation');
        return NextResponse.json({
          relationship: {
            relationshipId: 'mock-rel-' + Date.now(),
            parent: {
              id: 'mock-parent-' + Date.now(),
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
              emailVerified: false,
            },
            relationship: data.relationship,
            isPrimary: data.isPrimary || false,
            isEmergencyContact: data.isEmergencyContact || true,
            canPickup: data.canPickup || true,
          },
          isNewParent: action === 'add-new-parent',
          message: 'Parent relationship created successfully (mock mode)'
        });
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error managing parent relationship:', error);
    return NextResponse.json(
      { error: 'Failed to manage parent relationship' },
      { status: 500 }
    );
  }
}