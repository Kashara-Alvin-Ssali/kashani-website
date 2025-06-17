import React, { useState, useContext } from 'react'; // Removed useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate
import { ThemeProvider } from './context/ThemeContext';
import ReactDOM from 'react-dom'; // Add this import

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

import AuthContext from './context/AuthContext'; // Import AuthContext

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


function App() {
  const { isAdmin, token } = useContext(AuthContext); // Access isAdmin and token here
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
      await res.json(); // Just await the response, we don't need to store it
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

  return (
    <ThemeProvider>
      <Router>
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


              {/* Protected Routes - User needs to be logged in */}
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
                  <ProtectedRoute>
                    <Players />
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
              
              {/* Catch-all for undefined routes or redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {isAdmin && ReactDOM.createPortal(
            <div 
              style={{ 
                position: 'fixed',
                bottom: '40px',
                left: '40px',
                zIndex: 999999,
                background: '#FF0000',
                padding: '20px',
                borderRadius: '20px',
                border: '5px solid #00FF00'
              }}
            >
              <button 
                onClick={() => setShowForm(!showForm)}
                style={{
                  background: '#00FF00',
                  color: '#000',
                  fontSize: '3rem',
                  border: '5px solid #FF0000',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
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
            </div>,
            document.body
          )}
          <footer>
            <p>© {new Date().getFullYear()} Kashani Football Team</p>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;