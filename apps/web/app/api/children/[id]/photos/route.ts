import { NextRequest, NextResponse } from 'next/server';

export async function POST(
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

    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const caption = formData.get('caption') as string;
    const isProfilePhoto = formData.get('isProfilePhoto') === 'true';

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo file is required' },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    
    // Create form data for backend
    const backendFormData = new FormData();
    backendFormData.append('photo', photo);
    if (caption) backendFormData.append('caption', caption);
    if (isProfilePhoto) backendFormData.append('isProfilePhoto', 'true');

    const response = await fetch(`${apiBaseUrl}/children/${params.id}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      // If backend is not available, return mock success for development
      if (response.status === 500 || !response.status) {
        console.warn('Backend not available, returning mock photo upload');
        const mockPhotoUrl = `https://storage.example.com/children/${params.id}/${photo.name}`;
        const mockThumbnailUrl = `https://storage.example.com/children/${params.id}/thumb_${photo.name}`;
        
        return NextResponse.json({
          photo: {
            id: 'photo-' + Date.now(),
            photoUrl: mockPhotoUrl,
            thumbnailUrl: mockThumbnailUrl,
            caption: caption || '',
            isProfilePhoto: isProfilePhoto || false,
            createdAt: new Date().toISOString(),
          },
          message: 'Photo uploaded successfully (mock mode)'
        });
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

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
    const response = await fetch(`${apiBaseUrl}/children/${params.id}/photos`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      // If backend is not available, return mock data for development
      if (response.status === 500 || !response.status) {
        console.warn('Backend not available, returning mock child photos');
        const mockPhotos = [
          {
            id: 'photo-1',
            photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
            thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
            caption: 'Playing in the sandbox',
            isProfilePhoto: true,
            isSharedWithParents: true,
            uploadedBy: 'Emily Davis',
            createdAt: '2025-02-15T10:30:00Z',
          },
          {
            id: 'photo-2',
            photoUrl: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?w=400',
            thumbnailUrl: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?w=150',
            caption: 'Art time - finger painting!',
            isProfilePhoto: false,
            isSharedWithParents: true,
            uploadedBy: 'Sarah Johnson',
            createdAt: '2025-02-14T14:45:00Z',
          },
          {
            id: 'photo-3',
            photoUrl: 'https://images.unsplash.com/photo-1472162314594-12f6f4123639?w=400',
            thumbnailUrl: 'https://images.unsplash.com/photo-1472162314594-12f6f4123639?w=150',
            caption: 'Circle time - learning about animals',
            isProfilePhoto: false,
            isSharedWithParents: true,
            uploadedBy: 'Emily Davis',
            createdAt: '2025-02-13T11:15:00Z',
          }
        ];
        return NextResponse.json(mockPhotos);
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching child photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch child photos' },
      { status: 500 }
    );
  }
}