import React from 'react';
import '../css/About.css'; // Make sure this path is correct

// Import the background image for the About page hero section
import aboutHeroBg from '../assets/about-hero-bg.jpg';

// Import the new image for the main content section
import kashaniPlayerImage from '../assets/k0.jpg'; // <--- ADDED THIS LINE

const About = () => {
  return (
    <div className="about-page-container">
      {/* Hero Section with Background Image */}
      <section
        className="about-hero-section"
        style={{ '--about-bg-image': `url(${aboutHeroBg})` }}
      >
        <div className="hero-overlay">
          <h1 className="hero-title">Our commitment to Kashani FC</h1>
          <p className="hero-subtitle">
            Relive the passion, dedication, and victories of Kashani FC.
          </p>
        </div>
      </section>

      {/* Feature Blocks Section (Top Section) */}
      <section className="about-features-top">
        <div className="feature-block">
          <div className="feature-icon">⚽</div> {/* Replace with actual icons later */}
          <h3>Passion</h3>
          <p>
            We believe that great sport stems from deep passion and commitment. Our players, staff, and fans are united by an unwavering love for the game and the club.
          </p>
        </div>
        <div className="feature-block">
          <div className="feature-icon">🏆</div>
          <h3>Growth</h3>
          <p>
            The journey to victory is continuous. We are dedicated to nurturing talent, fostering teamwork, and constantly evolving to reach new heights in every competition.
          </p>
        </div>
        <div className="feature-block">
          <div className="feature-icon">✨</div>
          <h3>Recognition</h3>
          <p>
            Success is shared. We work hard as a team to earn our victories and ensure that every player, every fan, and every moment of triumph receives the recognition it deserves.
          </p>
        </div>
      </section>

      {/* Main Content Area (Image Section) */}
      <section className="about-main-content">
        <div className="main-content-image">
          {/* UPDATED: Using the imported kashaniPlayerImage for the src */}
          <img src={kashaniPlayerImage} alt="Kashani FC Player" /> {/* <--- MODIFIED THIS LINE */}
        </div>
        <div className="main-content-text">
          <h2>What makes us different</h2>
          <p>
            At Kashani FC, we are more than just a team; we are a family. Our unique approach to football combines rigorous training with strong community engagement, fostering an environment where talent thrives and sportsmanship is paramount. We focus on developing well-rounded individuals both on and off the pitch.
          </p>
          <p>
            Our commitment extends beyond the game, investing in youth programs and local initiatives to inspire the next generation of athletes and fans. We believe in building a lasting legacy, not just winning matches.
          </p>
        </div>
      </section>

      {/* Feature Blocks Section (Bottom Section) */}
      <section className="about-features-bottom">
        <div className="feature-block">
          <div className="feature-icon">📈</div>
          <h3>Develop as a Player</h3>
          <p>
            Get immediate exposure with our first-team opportunities. Our unique training methodology and dedicated coaching staff ensure your skills are honed to perfection.
          </p>
        </div>
        <div className="feature-block">
          <div className="feature-icon">💼</div>
          <h3>Build your Career</h3>
          <p>
            Present yourself as a professional athlete. We provide services like contract negotiation and mentorship to highlight your journey.
          </p>
        </div>
        <div className="feature-block">
          <div className="feature-icon">📊</div>
          <h3>See your Performance</h3>
          <p>
            With advanced statistics and personalized feedback, you get valuable insights into how your performance can be improved.
          </p>
        </div>
      </section>

      {/* You can add more sections here if needed */}
    </div>
  );
};

export default About;