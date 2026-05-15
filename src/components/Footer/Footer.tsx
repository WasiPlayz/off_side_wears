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
          <p>DESIGNED FOR THE BOLD.</p>
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
