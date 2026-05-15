import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <h1 className="glitch-text">WEAR <br /> WHATEVER <br /><span className="highlight">YOU WANT</span></h1>
          <p>The ultimate destination for premium football kits in Bangladesh. From the pitch to the streets, represent your team with our elite Player and Fan editions.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/shop')}>SHOP JERSEYS</button>
            <button className="btn-secondary" onClick={() => navigate('/shop')}>LATEST DROPS</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-box">
            <img 
              src="/messi_kisses_cup.jpg" 
              alt="Messi World Cup Celebration" 
              className="hero-img"
            />
          </div>
          <div className="visual-accent"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
