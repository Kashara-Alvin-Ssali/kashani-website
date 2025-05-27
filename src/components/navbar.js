import React, { useState, useEffect } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaGlobe } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../components/navbar.css';
import logo from '../assets/logo.jpg';
import '../css/Players.css'; // Keep this import as it was

const Navbar = () => {
  const [language, setLanguage] = useState('EN');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLanguageToggle = () => {
    setLanguage(prev => (prev === 'EN' ? 'LG' : 'EN'));
  };

  return (
    <nav className="navbar horizontal-navbar">
      <div className="navbar-section logo-area">
        <img src={logo} alt="Kashani FC Logo" className="navbar-logo" />
        <span className="logo-text">Kashani FC</span>
      </div>

      <ul className="navbar-section nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        {/* Added Gallery Link */}
        <li><Link to="/gallery">Gallery</Link></li> {/* <--- ADDED THIS LINE */}
        <li
          className="dropdown"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <span>Management ▾</span>
          {/* {showDropdown && (
            <ul className="dropdown-menu">
              <li><Link to="/players/staff">Staff</Link></li>
              <li><Link to="/players/lineup">Lineup</Link></li>
              <li><Link to="/players/youth">Citizens</Link></li>
            </ul>
          )} */}
        </li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>

      <div className="navbar-section nav-icons">
        <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebook /></a>
        <a href="https://x.com/Kashani_FC" target="_blank" rel="noreferrer"><FaTwitter /></a>
        <a href="https://www.instagram.com/kashani.fc_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer"><FaInstagram /></a>
        <button onClick={handleLanguageToggle} className="lang-toggle">
          <FaGlobe /> {language}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;