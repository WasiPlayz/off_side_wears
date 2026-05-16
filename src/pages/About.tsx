import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

const About: React.FC = () => {
  const [email, setEmail] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setShowPopup(true);
      setEmail('');
    }
  };

  const handleProceedToShop = () => {
    setShowPopup(false);
    navigate('/shop');
  };

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge reveal">ESTABLISHED 2026 // DHAKA</div>
            <h1 className="glitch-text reveal" style={{ animationDelay: '0.2s' }}>
              ENGINEERED FOR <br /><span className="highlight">GLORY</span>
            </h1>
            <p className="subtitle reveal" style={{ animationDelay: '0.4s' }}>
              The definitive destination for 1:1 elite grade player edition kits. 
              Where precision meets passion.
            </p>
          </div>
        </div>
      </section>

      <section className="about-philosophy container">
        <div className="philosophy-content">
          <div className="text-reveal-box">
            <h2 className="section-title reveal">OUR PHILOSOPHY</h2>
            <p className="lead-text reveal" style={{ animationDelay: '0.1s' }}>
              WE DON'T JUST SELL JERSEYS. <br />
              WE EQUIP THE DRIVEN.
            </p>
          </div>
          <div className="philosophy-grid">
            <div className="philosophy-item reveal" style={{ animationDelay: '0.2s' }}>
              <span className="item-num">01</span>
              <h3>THE 1:1 STANDARD</h3>
              <p>
                Our "Elite Grade" isn't a marketing buzzword. It's a technical specification. 
                Heat-pressed silicone crests, advanced aero-fabrics, and laser-cut ventilation 
                exactly as worn by the pros.
              </p>
            </div>
            <div className="philosophy-item reveal" style={{ animationDelay: '0.3s' }}>
              <span className="item-num">02</span>
              <h3>BEYOND BORDERS</h3>
              <p>
                Sourcing the rarest drops from the most iconic clubs and national teams worldwide. 
                If it's worn on the global stage, it's available in our collection.
              </p>
            </div>
            <div className="philosophy-item reveal" style={{ animationDelay: '0.4s' }}>
              <span className="item-num">03</span>
              <h3>STREET LEGACY</h3>
              <p>
                Tailored for the pitch, designed for the lifestyle. Our kits transition 
                seamlessly from the stadium to the streets, making a statement 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-mission">
        <div className="container mission-content reveal">
          <h2 className="section-title">MISSION LOG</h2>
          <div className="mission-statement">
            <p>
              OFF_SIDE WEARS WAS BORN FROM A VOID IN THE BANGLADESHI MARKET. 
              WE SAW FANS SETTLING FOR SUBPAR QUALITY. WE SAW PASSION BEING 
              MET WITH MEDIOCRITY. 
            </p>
            <p>
              OUR MISSION IS SIMPLE: TO PROVIDE EVERY FOOTBALL ENTHUSIAST 
              WITH THE EXACT ARMOR THEY DESERVE. ZERO COMPROMISE ON FABRIC. 
              ZERO COMPROMISE ON DETAIL. ZERO COMPROMISE ON AUTHENTICITY.
            </p>
          </div>
          <div className="mission-footer">
            <div className="footer-stat">
              <span className="stat-value">1:1</span>
              <span className="stat-label">GRADE QUALITY</span>
            </div>
            <div className="footer-stat">
              <span className="stat-value">24/7</span>
              <span className="stat-label">SYSTEM SUPPORT</span>
            </div>
            <div className="footer-stat">
              <span className="stat-value">∞</span>
              <span className="stat-label">FOOTBALL PASSION</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta container">
        <div className="cta-box reveal">
          <h2 className="glitch-text">BECOME ELITE</h2>
          <p>Subscribe to our secure datastream for exclusive restock intel and early prototype access.</p>
          <form onSubmit={handleSubscribe} className="cta-input-group">
            <input 
              type="email" 
              placeholder="ENTER SYSTEM EMAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">INITIATE ACCESS</button>
          </form>
        </div>
      </section>

      {/* Promo Code Popup */}
      {showPopup && (
        <div className="promo-popup-overlay">
          <div className="promo-popup">
            <div className="popup-badge">ACCESS GRANTED</div>
            <h2>ELITE STATUS CONFIRMED</h2>
            <p>YOU HAVE UNLOCKED A 10% DISCOUNT ON ALL PLAYER EDITION KITS.</p>
            <div className="promo-display">
              <span className="promo-label">PROMO CODE:</span>
              <strong className="promo-code">ELITE10</strong>
            </div>
            <button className="btn-primary full-width" onClick={handleProceedToShop}>PROCEED TO SHOP</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
