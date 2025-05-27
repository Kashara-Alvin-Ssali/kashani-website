import React from 'react';
import './footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Kashani FC. All rights reserved.</p>
      <p>Made with ❤️ by the Kashani Team</p>
    </footer>
  );
}

export default Footer;
