import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../components/navbar.css';

// Import your logo image
import logo from '../assets/logo.jpg'; // Make sure this path is correct

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="horizontal-navbar">
      <div className="navbar-section">
        <div className="logo-area">
          <Link to="/" className="navbar-logo-link"> {/* Wrap logo and text in a Link */}
            <img src={logo} alt="Kashani FC Logo" className="navbar-logo" />
            <span className="logo-text">Kashani FC</span>
          </Link>
        </div>
      </div>

      {/* Hamburger Menu Button (visible on mobile) */}
      <button className="hamburger-menu" onClick={toggleMobileMenu}>
        ☰ {/* You can use a dedicated icon library here like Font Awesome */}
      </button>

      {/* Navigation Links (visible on desktop, toggled on mobile) */}
      <ul className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={toggleMobileMenu}>Home</Link></li>
        <li><Link to="/about" onClick={toggleMobileMenu}>About</Link></li>
        <li><Link to="/gallery" onClick={toggleMobileMenu}>Gallery</Link></li>

        <li className="dropdown">
          {/* REMOVED THE LITERAL '▾' HERE. The arrow will now come from CSS. */}
          <span className="dropdown-title">Team</span> {/* <--- MODIFIED THIS LINE */}
          <ul className="dropdown-menu">
            <li><Link to="/management" onClick={toggleMobileMenu}>Committee</Link></li>
            <li><Link to="/players" onClick={toggleMobileMenu}>Players</Link></li>

          </ul>
        </li>

        <li><Link to="/contact" onClick={toggleMobileMenu}>Contact</Link></li>
      </ul>


      {/* Right Section (Icons and Language Toggle) - hidden on mobile initially, potentially part of mobile menu */}
      <div className="nav-icons">
        <a href="#search" aria-label="Search"><i className="fas fa-search"></i></a>
        <a href="#profile" aria-label="Profile"><i className="fas fa-user"></i></a>
        <button className="lang-toggle">EN</button>
      </div>
    </nav>
  );
};

export default Navbar;