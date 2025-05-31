import React, { useState, useEffect, useContext } from 'react';
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

  const backendUrl = 'https://kashani-backend.onrender.com';

  const fetchImages = async () => {
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
  };

  useEffect(() => {
    fetchImages();
    return () => notificationTimeoutId && clearTimeout(notificationTimeoutId);
  }, [token]);

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
      const res = await fetch(`${backendUrl}/api/gallery/image/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (res.ok) {
        setMessage(result.message || 'Deleted successfully.');
        fetchImages();
      } else {
        throw new Error(result.message || 'Delete failed.');
      }
    } catch (err) {
      setError(`Delete error: ${err.message}`);
    } finally {
      const timeout = setTimeout(() => {
        setMessage('');
        setError(null);
      }, 3000);
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

  return (
    <div className="gallery-container">
      {isAdmin && (
        <button onClick={() => setShowUploadForm(!showUploadForm)} className="add-image-button">
          {showUploadForm ? '✕' : '+'}
        </button>
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

      {isLoading && <p>Loading images...</p>}
      {!isLoading && error && images.length === 0 && <p className="error-message">{error}</p>}

      <div className="image-grid">
        {images.length > 0 ? (
          images.map((img) => (
            <div key={img.filename} className="gallery-item">
              <img src={`${backendUrl}${img.src}`} alt={img.caption || img.filename} loading="lazy" />
              <div className="caption-editor">
                {editingImageFilename === img.filename ? (
                  <>
                    <input type="text" value={editingCaption} onChange={(e) => setEditingCaption(e.target.value)} />
                    <button onClick={() => handleSaveCaption(img.filename)}>Save</button>
                    <button onClick={() => setEditingImageFilename(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <p className="image-caption">{img.caption || <em>No caption</em>}</p>
                    {isAdmin && <button onClick={() => handleEditCaptionClick(img.filename, img.caption)}>Edit</button>}
                  </>
                )}
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(img.filename)} className="delete-button">🗑️</button>
              )}
            </div>
          ))
        ) : (
          !isLoading && <p>No images found.</p>
        )}
      </div>
    </div>
  );
};

export default Gallery;
