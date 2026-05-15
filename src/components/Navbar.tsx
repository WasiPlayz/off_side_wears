import React, { useState, useEffect } from 'react';
import './Navbar.css';

interface NavbarProps {
  onNavigate: (page: string) => void;
  cartCount: number;
  onToggleCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, cartCount, onToggleCart }) => {
  const [theme, setTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <div className="logo" onClick={() => handleNavigate('home')} style={{ cursor: 'pointer' }}>OFF_SIDE</div>
        
        <ul className="nav-links desktop-only">
          <li><button onClick={() => handleNavigate('home')} className="nav-link-btn">HOME</button></li>
          <li><button onClick={() => handleNavigate('shop')} className="nav-link-btn">SHOP</button></li>
          <li><button onClick={() => handleNavigate('about')} className="nav-link-btn">ABOUT</button></li>
          <li><button onClick={() => handleNavigate('contact')} className="nav-link-btn">CONTACT</button></li>
        </ul>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle desktop-only">
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </button>
          <button className="cart-btn" onClick={onToggleCart}>CART ({cartCount})</button>
          
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul className="mobile-nav-links">
          <li><button onClick={() => handleNavigate('home')} className="mobile-nav-btn">HOME</button></li>
          <li><button onClick={() => handleNavigate('shop')} className="mobile-nav-btn">SHOP</button></li>
          <li><button onClick={() => handleNavigate('about')} className="mobile-nav-btn">ABOUT</button></li>
          <li><button onClick={() => handleNavigate('contact')} className="mobile-nav-btn">CONTACT</button></li>
          <li style={{ marginTop: '2rem' }}>
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'dark' ? 'LIGHT THEME' : 'DARK THEME'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
