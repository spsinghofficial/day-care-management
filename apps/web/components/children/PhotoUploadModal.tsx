'use client';

import { useState } from 'react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  childName: string;
  onPhotoUploaded: () => void;
}

export default function PhotoUploadModal({
  isOpen,
  onClose,
  childId,
  childName,
  onPhotoUploaded,
}: PhotoUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isProfilePhoto, setIsProfilePhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a photo to upload');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);
      if (caption) formData.append('caption', caption);
      if (isProfilePhoto) formData.append('isProfilePhoto', 'true');

      const response = await fetch(`/api/children/${childId}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onPhotoUploaded();
        handleClose();
        // Show success message (could be improved with a toast notification)
        alert('Photo uploaded successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload photo');
      }
    } catch (error) {
      setError('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCaption('');
    setIsProfilePhoto(false);
    setPreview(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Upload Photo for {childName}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Photo *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              required
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
              </div>
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption (Optional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption to describe this photo..."
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Profile Photo Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isProfilePhoto}
              onChange={(e) => setIsProfilePhoto(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Set as profile photo
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}