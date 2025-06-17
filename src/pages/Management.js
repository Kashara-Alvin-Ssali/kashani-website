import React, { useState, useEffect, useContext } from 'react';
import '../css/Management.css';
import AuthContext from '../context/AuthContext';

const Management = ({ handleEdit, setShowForm }) => {
  const { token, isAdmin } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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