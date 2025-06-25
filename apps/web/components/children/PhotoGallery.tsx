'use client';

import { useState, useEffect } from 'react';
import PhotoUploadModal from './PhotoUploadModal';

interface Photo {
  id: string;
  photoUrl: string;
  thumbnailUrl: string;
  caption: string;
  isProfilePhoto: boolean;
  isSharedWithParents: boolean;
  uploadedBy: string;
  createdAt: string;
}

interface PhotoGalleryProps {
  childId: string;
  childName: string;
  canUpload?: boolean;
}

export default function PhotoGallery({ childId, childName, canUpload = true }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, [childId]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/children/${childId}/photos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      } else {
        setError('Failed to load photos');
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/children/${childId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        setPhotos(photos.filter(photo => photo.id !== photoId));
        setSelectedPhoto(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete photo');
      }
    } catch (error) {
      alert('Failed to delete photo');
    }
  };

  const handlePhotoUploaded = () => {
    fetchPhotos();
  };

  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Photos ({photos.length})
        </h3>
        {canUpload && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Upload Photo
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No photos yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.caption}
                  className="h-full w-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => openPhotoModal(photo)}
                />
                {photo.isProfilePhoto && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Profile
                    </span>
                  </div>
                )}
                {canUpload && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      title="Delete photo"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {photo.caption && (
                <p className="mt-2 text-sm text-gray-600 truncate" title={photo.caption}>
                  {photo.caption}
                </p>
              )}
              <p className="text-xs text-gray-500">
                By {photo.uploadedBy} • {new Date(photo.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        childId={childId}
        childName={childName}
        onPhotoUploaded={handlePhotoUploaded}
      />

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-11/12 max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedPhoto.caption || 'Photo'}
                  </h3>
                  {selectedPhoto.isProfilePhoto && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Profile Photo
                    </span>
                  )}
                </div>
                <button
                  onClick={closePhotoModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.caption}
                  className="w-full h-auto max-h-96 object-contain mx-auto rounded"
                />
                <div className="mt-4 text-sm text-gray-600">
                  <p>Uploaded by {selectedPhoto.uploadedBy}</p>
                  <p>{new Date(selectedPhoto.createdAt).toLocaleString()}</p>
                  {selectedPhoto.isSharedWithParents && (
                    <p className="text-green-600">✓ Shared with parents</p>
                  )}
                </div>
                {canUpload && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDeletePhoto(selectedPhoto.id)}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      Delete Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}