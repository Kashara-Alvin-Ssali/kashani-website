import React, { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../context/AuthContext';
import '../css/Gallery.css';

const Gallery = () => {
  const { token, isAdmin } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationTimeoutId, setNotificationTimeoutId] = useState(null);
  const [editingImageFilename, setEditingImageFilename] = useState(null);
  const [editingCaption, setEditingCaption] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);
  const [isCleaningGallery, setIsCleaningGallery] = useState(false);
  const [isResyncingGallery, setIsResyncingGallery] = useState(false);
  const [isForceDeleting, setIsForceDeleting] = useState(false);

  // Use localhost in development, render.com in production
  const backendUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001'  // matching your local backend port
    : 'https://kashani-backend.onrender.com';

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!token) {
        setError('You must be logged in to view the gallery.');
        setImages([]);
        return;
      }
      const res = await fetch(`${backendUrl}/api/gallery/images`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if ([401, 403].includes(res.status)) {
          setError('Authentication failed. Please log in again.');
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        setImages([]);
        return;
      }
      const data = await res.json();
      setImages(data);
    } catch (err) {
      setError('Failed to load images. Please try again later.');
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, backendUrl]);

  useEffect(() => {
    fetchImages();
    return () => {
      if (notificationTimeoutId) {
        clearTimeout(notificationTimeoutId);
      }
    };
  }, [fetchImages, notificationTimeoutId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return setMessage('Please select a file to upload.');
    const formData = new FormData();
    formData.append('galleryImage', selectedFile);
    formData.append('caption', uploadCaption);

    try {
      if (!token || !isAdmin) {
        setError("Admin privileges required to upload images.");
        return;
      }
      const res = await fetch(`${backendUrl}/api/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setMessage(`Upload successful: ${result.filename}`);
        setSelectedFile(null);
        setUploadCaption('');
        e.target.reset?.();
        fetchImages();
      } else {
        throw new Error(result.message || 'Upload failed.');
      }
    } catch (err) {
      setError(`Upload error: ${err.message}`);
    } finally {
      const timeout = setTimeout(() => {
        setMessage('');
        setError(null);
      }, 3000);
      setNotificationTimeoutId(timeout);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;
    
    try {
      if (!token || !isAdmin) {
        setError("Admin privileges required to delete images.");
        return;
      }
      
      setDeletingImage(filename);
      setIsLoading(true);
      
      // First, try to force delete the metadata
      const res = await fetch(`${backendUrl}/api/gallery/image/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Force-Delete': 'true', // Add this header to indicate force delete
        },
      });
      
      let result;
      try {
        result = await res.json();
      } catch (e) {
        // Handle case where response isn't JSON
        result = { message: 'No response from server' };
      }
      
      if (res.ok) {
        setMessage('Image deleted successfully.');
        // Remove the deleted image from the local state immediately
        setImages(prevImages => prevImages.filter(img => img.filename !== filename));
        // Then refresh the full list
        fetchImages();
      } else if (res.status === 404) {
        // If image is not found, remove it from the UI anyway
        setMessage('Image record removed from gallery.');
        setImages(prevImages => prevImages.filter(img => img.filename !== filename));
      } else {
        throw new Error(result.message || 'Failed to delete image. Please try again.');
      }
    } catch (err) {
      setError(`Delete error: ${err.message}`);
      console.error('Delete error:', err);
      
      // If we get the specific "file not found" error, give a more helpful message
      if (err.message.includes('file not found')) {
        setError('The image file appears to be missing. Try refreshing the page and deleting again.');
      }
    } finally {
      setIsLoading(false);
      setDeletingImage(null);
      // Keep error/success message visible for longer (8 seconds)
      const timeout = setTimeout(() => {
        setMessage('');
        setError(null);
      }, 8000);
      setNotificationTimeoutId(timeout);
    }
  };

  const handleEditCaptionClick = (filename, currentCaption) => {
    setEditingImageFilename(filename);
    setEditingCaption(currentCaption);
  };

  const handleSaveCaption = async (filename) => {
    try {
      if (!token || !isAdmin) {
        setError("Admin privileges required to edit captions.");
        return;
      }
      const res = await fetch(`${backendUrl}/api/gallery/image/${filename}/caption`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caption: editingCaption }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage('Caption updated.');
        setEditingImageFilename(null);
        setEditingCaption('');
        fetchImages();
      } else {
        throw new Error(result.message || 'Failed to update caption.');
      }
    } catch (err) {
      setError(`Caption error: ${err.message}`);
    } finally {
      const timeout = setTimeout(() => {
        setMessage('');
        setError(null);
      }, 3000);
      setNotificationTimeoutId(timeout);
    }
  };

  const cleanupGallery = async () => {
    if (!window.confirm('This will remove all broken image records from the database. Continue?')) return;
    
    try {
      if (!token || !isAdmin) {
        setError("Admin privileges required to clean gallery.");
        return;
      }
      
      setIsCleaningGallery(true);
      setError(null);
      
      const res = await fetch(`${backendUrl}/api/gallery/cleanup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Log the response details for debugging
      console.log('Cleanup Response Status:', res.status);
      console.log('Cleanup Response Headers:', [...res.headers.entries()]);
      
      // Try to get the response text first
      const textResponse = await res.text();
      console.log('Raw Response:', textResponse);
      
      let result;
      try {
        // Try to parse it as JSON
        result = JSON.parse(textResponse);
      } catch (e) {
        throw new Error(`Server returned invalid JSON. Status: ${res.status}, Response: ${textResponse.substring(0, 100)}...`);
      }
      
      if (res.ok) {
        setMessage(result.message || 'Gallery cleanup completed successfully.');
        fetchImages(); // Refresh the gallery
      } else {
        throw new Error(result.message || 'Failed to clean up gallery.');
      }
    } catch (err) {
      setError(`Cleanup error: ${err.message}`);
      console.error('Cleanup error details:', err);
    } finally {
      setIsCleaningGallery(false);
      const timeout = setTimeout(() => {
        setMessage('');
        setError(null);
      }, 8000);
      setNotificationTimeoutId(timeout);
    }
  };

  const resyncGallery = async () => {
    if (!window.confirm('This will rebuild the gallery metadata from existing files. Continue?')) return;
    
    try {
      if (!token || !isAdmin) {
        setError("Admin privileges required to resync gallery.");
        return;
      }
      
      setIsResyncingGallery(true);
      setError(null);
      
      const res = await fetch(`${backendUrl}/api/gallery/resync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setMessage(result.message || 'Gallery resynced successfully.');
        fetchImages(); // Refresh the gallery
      } else {
        throw new Error(result.message || 'Failed to resync gallery.');
      }
    } catch (err) {
      setError(`Resync error: ${err.message}`);
      console.error('Resync error:', err);
    } finally {
      setIsResyncingGallery(false);
      const timeout = setTimeout(() => {
        setMessage('');
        setError(null);
      }, 8000);
      setNotificationTimeoutId(timeout);
    }
  };

  const forceDeleteAll = async () => {
    if (!window.confirm('⚠️ WARNING: This will permanently delete ALL images in the gallery. This action cannot be undone. Continue?')) return;
    if (!window.confirm('Are you absolutely sure? All images will be permanently deleted.')) return;
    
    try {
      if (!token || !isAdmin) {
        setError("Admin privileges required to force delete.");
        return;
      }
      
      setIsForceDeleting(true);
      setError(null);
      
      const res = await fetch(`${backendUrl}/api/gallery/force-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setMessage(result.message);
        if (result.errors) {
          console.warn('Some files could not be deleted:', result.errors);
        }
        fetchImages(); // Refresh the gallery
      } else {
        throw new Error(result.message || 'Failed to force delete images.');
      }
    } catch (err) {
      setError(`Force delete error: ${err.message}`);
      console.error('Force delete error:', err);
    } finally {
      setIsForceDeleting(false);
      const timeout = setTimeout(() => {
        setMessage('');
        setError(null);
      }, 8000);
      setNotificationTimeoutId(timeout);
    }
  };

  return (
    <div className="gallery-container">
      {isAdmin && (
        <div className="admin-controls">
          <button onClick={() => setShowUploadForm(!showUploadForm)} className="add-image-button">
            {showUploadForm ? '✕' : '+'}
          </button>
          <button 
            onClick={cleanupGallery} 
            className="cleanup-button"
            disabled={isCleaningGallery}
          >
            {isCleaningGallery ? 'Cleaning...' : '🧹 Clean Gallery'}
          </button>
          <button 
            onClick={resyncGallery} 
            className="resync-button"
            disabled={isResyncingGallery}
          >
            {isResyncingGallery ? 'Resyncing...' : '🔄 Resync Gallery'}
          </button>
          <button 
            onClick={forceDeleteAll} 
            className="force-delete-button"
            disabled={isForceDeleting}
          >
            {isForceDeleting ? 'Deleting...' : '🗑️ Force Delete All'}
          </button>
        </div>
      )}
      
      <h1 className="gallery-header">Our Moments of Glory</h1>
      <p className="gallery-intro">Relive the passion, dedication, and victories of Kashani FC.</p>

      {isAdmin && showUploadForm && (
        <div className="upload-section">
          <h2>Upload New Image</h2>
          <form onSubmit={handleUpload}>
            <div>
              <label htmlFor="file-upload">Choose Image:</label>
              <input id="file-upload" type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
            </div>
            <div>
              <label htmlFor="caption-upload">Caption (optional):</label>
              <input id="caption-upload" type="text" value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} />
            </div>
            <button type="submit" disabled={!selectedFile}>Upload Image</button>
          </form>
          {message && <p className="upload-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      )}

      {isLoading && images.length === 0 && <p>Loading images...</p>}
      {!isLoading && error && images.length === 0 && <p className="error-message">{error}</p>}

      <div className="image-grid">
        {images.length > 0 ? (
          images.map((img) => (
            <div key={img.filename} className={`gallery-item ${deletingImage === img.filename ? 'loading' : ''}`}>
              <img src={`${backendUrl}${img.src}`} alt={img.caption || img.filename} loading="lazy" />
              <div className="caption-editor">
                {editingImageFilename === img.filename ? (
                  <>
                    <input 
                      type="text" 
                      value={editingCaption} 
                      onChange={(e) => setEditingCaption(e.target.value)}
                      disabled={deletingImage === img.filename}
                    />
                    <button 
                      onClick={() => handleSaveCaption(img.filename)}
                      disabled={deletingImage === img.filename}
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingImageFilename(null)}
                      disabled={deletingImage === img.filename}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p className="image-caption">{img.caption || <em>No caption</em>}</p>
                    {isAdmin && (
                      <button 
                        onClick={() => handleEditCaptionClick(img.filename, img.caption)}
                        disabled={deletingImage === img.filename}
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
              </div>
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(img.filename)} 
                  className="delete-button"
                  disabled={deletingImage === img.filename}
                >
                  🗑️
                </button>
              )}
            </div>
          ))
        ) : (
          !isLoading && <p>No images found.</p>
        )}
      </div>

      {message && <div className="upload-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Gallery;
