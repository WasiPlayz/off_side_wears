import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const navigate = useNavigate();

  const handleHiddenTrigger = () => {
    const newCount = clickCount + 1;
    if (newCount >= 5) {
      navigate('/admin');
      setClickCount(0);
    } else {
      setClickCount(newCount);
      setTimeout(() => setClickCount(0), 3000);
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>OFF_SIDE</div>
          <a 
            href="https://www.instagram.com/off_sidewears" 
            target="_blank" 
            rel="noreferrer"
            className="instagram-link"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              margin: '0.5rem 0 1.5rem',
              color: 'var(--accent-color)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '1px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            @off_sidewears
          </a>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h4>SHOP</h4>
            <ul>
              <li><button onClick={() => navigate('/shop')} className="footer-link-btn">ALL PRODUCTS</button></li>
              <li><button onClick={() => navigate('/shop')} className="footer-link-btn">NEW ARRIVALS</button></li>
              <li><button onClick={() => navigate('/shop')} className="footer-link-btn">BEST SELLERS</button></li>
            </ul>
          </div>
          <div className="link-group">
            <h4>SUPPORT</h4>
            <ul>
              <li><button onClick={() => navigate('/about')} className="footer-link-btn">ABOUT US</button></li>
              <li><button onClick={() => navigate('/contact')} className="footer-link-btn">CONTACT</button></li>
              <li><button onClick={() => navigate('/track')} className="footer-link-btn">TRACK ORDER</button></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p 
          onClick={handleHiddenTrigger} 
          style={{ cursor: 'default', userSelect: 'none' }}
        >
          &copy; 2026 OFF_SIDE WEARS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
