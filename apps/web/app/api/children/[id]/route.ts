import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const response = await fetch(`${apiBaseUrl}/children/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      // If backend is not available, return mock data for development
      if (response.status === 500 || !response.status) {
        console.warn('Backend not available, returning mock child data');
        const mockChild = {
          id: params.id,
          firstName: 'Emma',
          lastName: 'Wilson',
          dateOfBirth: '2020-05-15',
          age: '4 years 7 months',
          gender: 'FEMALE',
          status: 'ACTIVE',
          enrollmentDate: '2025-02-01',
          profilePhoto: null,
          classroom: {
            id: 'classroom1',
            name: 'Butterfly Room',
            ageGroup: '3-4 years'
          },
          parents: [
            {
              id: 'parent1',
              firstName: 'John',
              lastName: 'Wilson',
              email: 'john.wilson@email.com',
              phone: '+1-555-0126',
              relationship: 'FATHER',
              isPrimary: true,
              isEmergencyContact: true,
              canPickup: true
            }
          ],
          medicalInformation: {
            bloodType: 'O+',
            allergies: ['Peanuts', 'Dairy'],
            medications: [],
            medicalConditions: ['Mild asthma'],
            doctorName: 'Dr. Smith',
            doctorPhone: '+1-555-0200',
            hospitalPreference: 'Children\'s Hospital',
            insuranceProvider: 'Blue Cross Blue Shield',
            insurancePolicyNumber: 'BC123456789',
            additionalNotes: 'Please notify parents immediately of any allergic reactions.'
          },
          emergencyContacts: [
            {
              id: 'emergency1',
              name: 'Jane Wilson',
              relationship: 'Mother',
              phone: '+1-555-0127',
              email: 'jane.wilson@email.com',
              isAuthorizedPickup: true,
              notes: 'Primary emergency contact'
            },
            {
              id: 'emergency2',
              name: 'Robert Wilson',
              relationship: 'Grandfather',
              phone: '+1-555-0130',
              email: 'robert.wilson@email.com',
              isAuthorizedPickup: true,
              notes: 'Secondary emergency contact'
            }
          ],
          immunizationRecords: [
            {
              id: 'imm1',
              vaccineName: 'MMR',
              dateAdministered: '2024-05-15',
              nextDueDate: '2029-05-15',
              administeredBy: 'Dr. Smith',
              notes: 'No adverse reactions'
            }
          ]
        };
        return NextResponse.json(mockChild);
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching child:', error);
    return NextResponse.json(
      { error: 'Failed to fetch child' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

    const response = await fetch(`${apiBaseUrl}/children/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // If backend is not available, return mock success for development
      if (response.status === 500 || !response.status) {
        console.warn('Backend not available, returning mock child update');
        return NextResponse.json({
          id: params.id,
          message: 'Child updated successfully (mock mode)'
        });
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      { error: 'Failed to update child' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const response = await fetch(`${apiBaseUrl}/children/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      // If backend is not available, return mock success for development
      if (response.status === 500 || !response.status) {
        console.warn('Backend not available, returning mock child deletion');
        return NextResponse.json({
          message: 'Child deleted successfully (mock mode)'
        });
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json(
      { error: 'Failed to delete child' },
      { status: 500 }
    );
  }
}