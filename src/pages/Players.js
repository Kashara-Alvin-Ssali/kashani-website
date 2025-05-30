// Players.js
import React, { useState, useEffect, useContext } from 'react';
import '../css/Players.css';
import AuthContext from '../context/AuthContext';

const Players = () => {
  const { token, isAdmin } = useContext(AuthContext);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    jerseyNumber: '',
    nationality: '',
    bio: '',
    dateOfBirth: '',
    playerImage: null
  });

  const backendUrl = 'https://kashani-backend.onrender.com';

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/players`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load players.');
        const data = await res.json();
        setPlayers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchPlayers();
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
    const method = editingPlayerId ? 'PUT' : 'POST';
    const url = editingPlayerId ? `${backendUrl}/api/players/${editingPlayerId}` : `${backendUrl}/api/players`;
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
      setPlayers((prev) => {
        if (editingPlayerId) {
          return prev.map((p) => (p.id === editingPlayerId ? updated.player : p));
        } else {
          return [...prev, updated.player];
        }
      });
      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', position: '', jerseyNumber: '', nationality: '', bio: '', dateOfBirth: '', playerImage: null });
    setEditingPlayerId(null);
    setShowForm(false);
  };

  const handleEdit = (player) => {
    setFormData({
      name: player.name || '',
      position: player.position || '',
      jerseyNumber: player.jerseyNumber || '',
      nationality: player.nationality || '',
      bio: player.bio || '',
      dateOfBirth: player.dateOfBirth || '',
      playerImage: null
    });
    setEditingPlayerId(player.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this player?')) return;
    try {
      const res = await fetch(`${backendUrl}/api/players/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      <h2>Our Players</h2>

      {isAdmin && (
        <div className="admin-controls">
          <button className="add-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? '×' : '+'}
          </button>
          {showForm && (
            <form className="upload-form" onSubmit={handleSubmit}>
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" required />
              <input name="position" value={formData.position} onChange={handleInputChange} placeholder="Position" required />
              <input name="jerseyNumber" value={formData.jerseyNumber} onChange={handleInputChange} placeholder="Jersey #" />
              <input name="nationality" value={formData.nationality} onChange={handleInputChange} placeholder="Nationality" />
              <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Bio" />
              <input name="playerImage" type="file" accept="image/*" onChange={handleInputChange} required={!editingPlayerId} />
              <button type="submit">{editingPlayerId ? 'Update' : 'Upload'} Player</button>
            </form>
          )}
        </div>
      )}

      {isLoading ? <p>Loading...</p> : error ? <p>{error}</p> : (
        <div className="card-grid">
          {players.map((p) => (
            <div key={p.id} className="card">
              <img
                src={p.imageUrl ? `${backendUrl}${p.imageUrl}` : 'https://via.placeholder.com/150'}
                alt={p.name}
              />
              <h3>{p.name}</h3>
              <p>{p.position}</p>
              {isAdmin && (
                <div className="admin-actions">
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Players;
