import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <div className="container hero-content">
        <div className="hero-main">
          <div className="hero-badge">PREMIUM GRADE WEARS</div>
          <h1 className="hero-title">
            WEAR <span className="highlight">YOUR GAME</span>
          </h1>
          <p className="hero-subtitle">
            Experience the pinnacle of football engineering. Authenticity in every fiber, 
            designed for those who command the pitch and the streets.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/shop')}>EXPLORE SHOP</button>
            <button className="btn-secondary" onClick={() => navigate('/shop')}>LATEST DROPS</button>
          </div>
        </div>
      </div>
      <div className="hero-background-effects">
        <div className="effect-blob blob-1"></div>
        <div className="effect-blob blob-2"></div>
      </div>
    </section>
  );
};

export default Hero;
