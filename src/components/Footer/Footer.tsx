import React, { useState } from 'react';
import './Footer.css';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleHiddenTrigger = () => {
    const newCount = clickCount + 1;
    if (newCount >= 5) {
      onNavigate('admin');
      setClickCount(0);
    } else {
      setClickCount(newCount);
      // Reset count after 3 seconds of inactivity
      setTimeout(() => setClickCount(0), 3000);
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="logo" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>OFF_SIDE</div>
          <p>DESIGNED FOR THE BOLD.</p>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h4>SHOP</h4>
            <ul>
              <li><button onClick={() => onNavigate('shop')} className="footer-link-btn">ALL PRODUCTS</button></li>
              <li><button onClick={() => onNavigate('shop')} className="footer-link-btn">NEW ARRIVALS</button></li>
              <li><button onClick={() => onNavigate('shop')} className="footer-link-btn">BEST SELLERS</button></li>
            </ul>
          </div>
          <div className="link-group">
            <h4>SUPPORT</h4>
            <ul>
              <li><button onClick={() => onNavigate('about')} className="footer-link-btn">ABOUT US</button></li>
              <li><button onClick={() => onNavigate('contact')} className="footer-link-btn">CONTACT</button></li>
              <li><button onClick={() => onNavigate('track')} className="footer-link-btn">TRACK ORDER</button></li>
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
