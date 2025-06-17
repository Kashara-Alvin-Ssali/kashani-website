import React, { useState, useContext } from 'react'; // Removed useEffect
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'; // Added Navigate and useLocation
import { ThemeProvider } from './context/ThemeContext';
import ReactDOM from 'react-dom'; // Re-import ReactDOM
import Chatbot from './components/Chatbot'; // Import Chatbot component

import './css/App.css';
import Navbar from './components/navbar';
// import Footer from './components/footer'; // Assuming you have a Footer component

// Page Imports
import Home from './pages/Home';
import About from './pages/About';
import Players from './pages/Players';
import Fixtures from './pages/Fixtures';
import Contact from './pages/Contact';
import Management from './pages/Management';
import Gallery from './pages/Gallery';
import LoginPage from './pages/LoginPage'; // Import LoginPage
import RegisterPage from './pages/RegisterPage'; // Import RegisterPage

import AuthContext, { AuthProvider } from './context/AuthContext'; // Corrected import for AuthProvider

// A simple protected route component
const ProtectedRoute = ({ children, isAdminRoute }) => { // Added isAdminRoute
  const { isAuthenticated, isLoading, isAdmin } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminRoute && !isAdmin) { // Check for isAdminRoute and if not admin
    return <Navigate to="/" replace />;
  }
  return children;
};

// Create a wrapper component to access location
const AppContent = () => {
  const { isAdmin, token } = useContext(AuthContext);
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    teamImage: null
  });

  const backendUrl = 'https://kashani-backend.onrender.com';

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
      await res.json();
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

  // Only show admin controls on management and players pages
  const showAdminControls = isAdmin && (location.pathname === '/management' || location.pathname === '/players');

  return (
    <div className="App">
      <Navbar />
      <main className="content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/fixtures" element={<Fixtures />} />

          {/* Protected Routes */}
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <Gallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Players handleEdit={setEditingId} setShowForm={setShowForm} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <Management handleEdit={setEditingId} setShowForm={setShowForm} />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showAdminControls && ReactDOM.createPortal(
        <div 
          style={{ 
            position: 'fixed',
            bottom: window.innerWidth <= 768 ? '20px' : '40px',
            left: window.innerWidth <= 768 ? '20px' : '40px',
            zIndex: 999999,
            background: 'rgba(0, 0, 0, 0.8)',
            padding: window.innerWidth <= 768 ? '15px' : '20px',
            borderRadius: '20px',
            border: '3px solid #ffcc00',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)'
          }}
        >
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              background: '#ffcc00',
              color: '#000',
              fontSize: window.innerWidth <= 768 ? '2.5rem' : '3rem',
              border: '3px solid #000',
              borderRadius: '50%',
              width: window.innerWidth <= 768 ? '60px' : '80px',
              height: window.innerWidth <= 768 ? '60px' : '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              transform: showForm ? 'rotate(45deg)' : 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = showForm ? 'rotate(45deg) scale(1.1)' : 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = showForm ? 'rotate(45deg)' : 'none';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            }}
          >
            {showForm ? '×' : '+'}
          </button>
          {showForm && (
            <form 
              className="upload-form" 
              onSubmit={handleSubmit}
              style={{
                marginTop: '15px',
                background: 'rgba(0, 0, 0, 0.9)',
                padding: '20px',
                borderRadius: '15px',
                border: '2px solid #ffcc00',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(5px)',
                width: window.innerWidth <= 768 ? '280px' : '320px'
              }}
            >
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="Name" 
                required 
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ffcc00',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff'
                }}
              />
              <input 
                name="role" 
                value={formData.role} 
                onChange={handleInputChange} 
                placeholder="Position" 
                required 
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ffcc00',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff'
                }}
              />
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleInputChange} 
                placeholder="Bio"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ffcc00',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
              <input 
                name="teamImage" 
                type="file" 
                onChange={handleInputChange} 
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ffcc00',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff'
                }}
              />
              <button 
                type="submit" 
                style={{
                  background: '#ffcc00',
                  color: '#000',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {editingId ? 'Update' : 'Add'} Team Member
              </button>
            </form>
          )}
        </div>
      )}
      {location.pathname !== '/contact' && <Chatbot />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;