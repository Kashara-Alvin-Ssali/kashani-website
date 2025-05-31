import React, { useState, useEffect, useContext } from 'react';
import '../css/Management.css';
import AuthContext from '../context/AuthContext';

const Management = () => {
  const { token, isAdmin } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    teamImage: null
  });

  const backendUrl = 'https://kashani-backend.onrender.com';

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/team`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load team members.');
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchMembers();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${backendUrl}/api/team/${editingId}` : `${backendUrl}/api/team`;
    const form = new FormData();

    Object.entries(formData).forEach(([key, val]) => {
      if (val) form.append(key, val);
    });

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      if (!res.ok) throw new Error('Upload failed.');
      const updated = await res.json();
      setMembers((prev) => {
        if (editingId) {
          return prev.map((m) => (m.id === editingId ? updated.member : m));
        } else {
          return [...prev, updated.member];
        }
      });
      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: '', bio: '', teamImage: null });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name || '',
      role: member.role || '',
      bio: member.bio || '',
      teamImage: null
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    try {
      const res = await fetch(`${backendUrl}/api/team/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      <h2>Management Team</h2>

      {isAdmin && (
        <div className="admin-controls">
          <button className="add-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? '×' : '+'}
          </button>
          {showForm && (
            <form className="upload-form" onSubmit={handleSubmit}>
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" required />
              <input name="role" value={formData.role} onChange={handleInputChange} placeholder="Position" required />
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Bio" />
              <input name="teamImage" type="file" accept="image/*" onChange={handleInputChange} required={!editingId} />
              <button type="submit">{editingId ? 'Update' : 'Upload'} Member</button>
            </form>
          )}
        </div>
      )}

      {isLoading ? <p>Loading...</p> : error ? <p>{error}</p> : (
        <div className="card-grid">
          {members.map((m) => (
            <div key={m.id} className="card">
              <img
                src={m.imageUrl ? `${backendUrl}${m.imageUrl}` : 'https://via.placeholder.com/150'}
                alt={m.name}
              />
              <h3>{m.name}</h3>
              <p>{m.role}</p>
              <div className="bio">{m.bio}</div>
              {isAdmin && (
                <div className="admin-actions">
                  <button onClick={() => handleEdit(m)}>Edit</button>
                  <button onClick={() => handleDelete(m.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Management;