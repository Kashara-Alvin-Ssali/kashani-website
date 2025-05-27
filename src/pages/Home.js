// src/pages/Home.js
import React from 'react';
import '../css/Home.css'; // Make sure this path is correct

// Import your background image from src/assets
import thrillBg from '../assets/thrill-bg.jpg';

// Import the image for the "Dominant Win" card
import domiImage from '../assets/domi.jpg';

// Import the new image for the "Player Spotlight" card
import sadicImage from '../assets/sadic.jpg'; // <--- ADDED THIS LINE

const Home = () => {
  return (
    <div className="home-container" style={{ '--home-bg-image': `url(${thrillBg})` }}>
      <header className="hero-section">
        <div className="hero-content">
          <h1>Experience the Thrill!</h1>
          <p>Join the Kashani family and follow our journey to victory.</p>
          <a href="/schedule" className="cta-button">Get Started !</a>
        </div>
      </header>

      <section className="highlights-section">
        <div className="section-header">
          <h2>Latest Highlights</h2>
          <p>Catch up on our recent matches and team news.</p>
        </div>
        <div className="highlight-grid">
          {/* Example News/Blog Card (Dominant Win) */}
          <div className="highlight-card">
            <img src={domiImage} alt="Dominant Win" className="card-image" />
            <div className="card-content">
              <h3>Dominant Win Against Kisyanga FC</h3>
              <p>Our team delivered a stunning performance, securing a [Score] victory...</p>
              <a href="/news/1" className="card-link">Read Full Report →</a>
            </div>
          </div>



          {/* Example Player Spotlight Card */}
          <div className="highlight-card">
            {/* UPDATED: Using the imported sadicImage for the src */}
            <img src={sadicImage} alt="Player Spotlight" className="card-image" /> {/* <--- MODIFIED THIS LINE */}
            <div className="card-content">
              <h3>Player Spotlight: Sadic </h3>
              <p>Learn about our captain and their journey with the team.</p>
              <a href="/roster" className="card-link">Meet the Team →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Another section, e.g., League Standings Overview */}
      <section className="standings-overview-section">
        <div className="section-header">
          <h2>Current League Standings</h2>
          <p>See where we stand in the league table.</p>
        </div>
        <div className="standings-table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>P</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>TY Omujuma</td><td>0</td><td>--</td></tr>
              <tr className="your-team-row"><td>2</td><td>Kashani FC</td><td>0</td><td>--</td></tr>
              <tr><td>3</td><td>Nshera FC</td><td>0</td><td>--</td></tr>
              {/* Add a few more top teams */}
            </tbody>
          </table>
          <a href="/standings" className="cta-button secondary-button">View Full Standings</a>
        </div>
      </section>

      {/* Social Media / Latest Posts Section */}
      <section className="social-feed-section">
        <div className="section-header">
          <h2>Follow Us on Social Media</h2>
          <p>Stay connected for real-time updates and behind-the-scenes content.</p>
        </div>
        <div className="social-links-grid">
          <a href="https://facebook.com/yourteam" target="_blank" rel="noopener noreferrer" className="social-icon facebook">Facebook</a>
          <a href="https://x.com/Kashani_FC" target="_blank" rel="noopener noreferrer" className="social-icon twitter">Twitter</a>
          <a href="https://www.instagram.com/kashani.fc_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="social-icon instagram">Instagram</a>
          <a href="https://www.youtube.com/embed/YOUR_VIDEO_ID_1" target="_blank" rel="noopener noreferrer" className="social-icon youtube">YouTube</a>
        </div>
      </section>

    </div>
  );
};

export default Home;