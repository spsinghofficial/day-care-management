import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');

  if (!subdomain) {
    return NextResponse.json(
      { error: 'Subdomain is required' },
      { status: 400 }
    );
  }

  try {
    // Call the backend API to validate subdomain
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080/api';
    const response = await fetch(`${apiBaseUrl}/business/by-subdomain/${subdomain}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Daycare not found' },
        { status: 404 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      { 
        success: true, 
        business: data.business
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to validate tenant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}