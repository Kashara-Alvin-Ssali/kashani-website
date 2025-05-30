import React, { useContext } from 'react'; // Added useContext
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Added Navigate

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
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<About />} /> {/* Ensure consistent casing if needed */}
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
                <ProtectedRoute>
                  <Management />
                </ProtectedRoute>
              }
            />
            
            {/* Example of a route that might be admin-only later, for now just protected */}
            {/* <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard /> // Assuming you create an AdminDashboard component
                </ProtectedRoute>
              }
            /> */}

            {/* Catch-all for undefined routes or redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {/* <Footer /> */} {/* Uncomment if you have a Footer component */}
         <footer>
           <p>© {new Date().getFullYear()} Kashani Football Team</p>
         </footer>
      </div>
    </Router>
  );
}

export default App;