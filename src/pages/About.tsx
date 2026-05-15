import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-page">
      <section className="about-hero container">
        <h1 className="glitch-text">THE <br /> PERFECT <span className="highlight">KIT</span></h1>
        <p className="subtitle">THE STORY OF OFF_SIDE WEARS</p>
      </section>

      <section className="about-content container">
        <div className="about-grid">
          <div className="about-text-section">
            <h2>OUR MANIFESTO</h2>
            <p className="manifesto">
              "WEAR THE GLORY" isn't just a tagline—it's our primary mission. 
              OFF_SIDE Wears exists to bring you the highest quality football kits, 
              curated for the true enthusiasts of the beautiful game.
            </p>
            <p>
              Founded in 2026, OFF_SIDE Wears was born from the intersection of football culture 
              and elite jersey craftsmanship. We don't just sell apparel; we provide the 
              tools for fans to express their loyalty with the same intensity as the pros.
            </p>
          </div>
          <div className="about-image-placeholder">
            <img 
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800" 
              alt="OFF_SIDE Wears Inspiration" 
              className="about-img"
            />
          </div>
        </div>

        <div className="about-stats">
          <div className="stat-item">
            <h3>AUTHENTIC</h3>
            <p>Player editions with elite pro-performance technology.</p>
          </div>
          <div className="stat-item">
            <h3>QUALITY</h3>
            <p>Fan editions designed for maximum comfort and durability.</p>
          </div>
          <div className="stat-item">
            <h3>CULTURE</h3>
            <p>Celebrating the heritage of the world's greatest teams.</p>
          </div>
        </div>

        <div className="about-lifestyle">
          <img 
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=1200" 
            alt="OFF_SIDE Wears Lifestyle" 
            className="lifestyle-img"
          />
        </div>

        <div className="about-cta">
          <h2>JOIN THE ARCHIVE</h2>
          <p>Be the first to know about upcoming drops and exclusive prototypes.</p>
          <button className="btn-primary">SUBSCRIBE NOW</button>
        </div>
      </section>
    </div>
  );
};

export default About;
