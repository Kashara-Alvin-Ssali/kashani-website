import React, { useState, useContext } from 'react'; // Added useContext
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import '../components/navbar.css';
import AuthContext from '../context/AuthContext'; // Import AuthContext

// Import your logo image
import logo from '../assets/logo.jpg'; // Make sure this path is correct

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useContext(AuthContext); // Get auth state and functions
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    toggleMobileMenu(); // Close mobile menu on logout
    navigate('/login'); // Redirect to login page
  };

  // Close mobile menu and navigate
  const handleLinkClick = () => {
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };


  return (
    <nav className="horizontal-navbar">
      <div className="navbar-section">
        <div className="logo-area">
          <Link to="/" className="navbar-logo-link" onClick={handleLinkClick}>
            <img src={logo} alt="Kashani FC Logo" className="navbar-logo" />
            <span className="logo-text">Kashani FC</span>
          </Link>
        </div>
      </div>

      <button className="hamburger-menu" onClick={toggleMobileMenu}>
        ☰
      </button>

      <ul className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
        <li><Link to="/about" onClick={handleLinkClick}>About</Link></li>
        {isAuthenticated && <li><Link to="/gallery" onClick={handleLinkClick}>Gallery</Link></li>}
        
        <li className="dropdown">
          <span className="dropdown-title">Team</span>
          <ul className="dropdown-menu">
            {isAuthenticated && <li><Link to="/management" onClick={handleLinkClick}>Committee</Link></li>}
            {isAuthenticated && <li><Link to="/players" onClick={handleLinkClick}>Players</Link></li>}
            {!isAuthenticated && <li><Link to="/login" onClick={handleLinkClick}>View Team (Login)</Link></li>}
          </ul>
        </li>
        
        <li><Link to="/contact" onClick={handleLinkClick}>Contact</Link></li>
        {/* Auth links will be moved to nav-icons for desktop, but need to be in mobile menu */}
        {isMobileMenuOpen && !isAuthenticated && (
          <>
            <li><Link to="/login" onClick={handleLinkClick}>Login</Link></li>
            <li><Link to="/register" onClick={handleLinkClick}>Register</Link></li>
          </>
        )}
        {isMobileMenuOpen && isAuthenticated && (
           <li><button onClick={handleLogout} className="logout-button-navbar">Logout</button></li>
        )}
      </ul>

      <div className="nav-icons">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="nav-icon-link">Login</Link>
            <Link to="/register" className="nav-icon-link">Register</Link>
          </>
        ) : (
          <>
            {user && (
              <span className="navbar-username" title={isAdmin ? `${user.username} (Admin)` : user.username}>
                <i className="fas fa-user" style={{ marginRight: '5px' }}></i>
                {user.username} {isAdmin && '(A)'}
              </span>
            )}
            <button onClick={handleLogout} className="nav-icon-button logout-button-icon">Logout</button>
          </>
        )}
        {/* <a href="#search" aria-label="Search"><i className="fas fa-search"></i></a> */}
        {/* <button className="lang-toggle">EN</button> */}
      </div>
    </nav>
  );
};

export default Navbar;