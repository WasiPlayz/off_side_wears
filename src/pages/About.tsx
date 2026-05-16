import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="glitch-text">BEYOND THE <br /><span className="highlight">90 MINUTES</span></h1>
            <p className="subtitle">Defining the intersection of elite performance and street culture.</p>
          </div>
        </div>
        <div className="hero-overlay-gradient"></div>
      </section>

      <section className="about-manifesto container">
        <div className="manifesto-grid">
          <div className="manifesto-text">
            <h2 className="section-title">OUR <span className="highlight">MANIFESTO</span></h2>
            <p className="lead-text">
              OFF_SIDE WEARS was born from a singular obsession: the pursuit of the perfect kit. 
              We believe a jersey is more than fabric—it's a vessel of loyalty, a piece of history, 
              and a statement of intent.
            </p>
            <div className="manifesto-details">
              <p>
                Founded in 2026, we recognized a void in the market where "premium" was often just a label. 
                We set out to dismantle that standard, sourcing only 1:1 elite grade garments that mirror 
                the exact specifications of professional pitch-wear.
              </p>
              <p>
                From heat-pressed silicone crests to moisture-wicking aero-fabrics, every item in our 
                collection is vetted through our internal performance protocols. Whether you're 
                dominating the field or the streets, OFF_SIDE ensures you carry the glory.
              </p>
            </div>
          </div>
          <div className="manifesto-visual">
            <div className="visual-frame">
              <img 
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800" 
                alt="OFF_SIDE Craftsmanship" 
              />
              <div className="frame-accent"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-pillars">
        <div className="container">
          <div className="pillars-grid">
            <div className="pillar-item">
              <div className="pillar-num">01</div>
              <h3>ELITE GRADE</h3>
              <p>We specialize in 1:1 Player Editions. Zero compromise on technical specs, weight, or breathability.</p>
            </div>
            <div className="pillar-item">
              <div className="pillar-num">02</div>
              <h3>CULTURAL DEPTH</h3>
              <p>Curated selections that celebrate the heritage of the world's most iconic clubs and national teams.</p>
            </div>
            <div className="pillar-item">
              <div className="pillar-num">03</div>
              <h3>STREET LEGACY</h3>
              <p>Engineered for the pitch, but tailored for the lifestyle. Versatility is woven into every fiber.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-culture container">
        <div className="culture-content">
          <div className="culture-image">
            <img 
              src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=1200" 
              alt="The Beautiful Game" 
            />
          </div>
          <div className="culture-text">
            <h2 className="section-title">THE <span className="highlight">CULTURE</span></h2>
            <p>
              Football is the world's greatest language. OFF_SIDE WEARS is your voice. 
              We don't just provide jerseys; we provide the armor for your passion. 
              Our community is built on the shared respect for the game's history 
              and its future.
            </p>
            <div className="brand-signature">OFF_SIDE // EST. 2026</div>
          </div>
        </div>
      </section>

      <section className="about-cta container">
        <div className="cta-box">
          <h2>JOIN THE CLUB</h2>
          <p>Subscribe to receive intel on upcoming drops, limited restocks, and exclusive prototype access.</p>
          <div className="cta-input-group">
            <input type="email" placeholder="ENTER YOUR EMAIL" />
            <button className="btn-primary">INITIATE</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
