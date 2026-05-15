import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [theme, setTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount, toggleCart } = useCart();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleMobileNav = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">OFF_SIDE</Link>
        
        <ul className="nav-links desktop-only">
          <li><Link to="/" className="nav-link-btn">HOME</Link></li>
          <li><Link to="/shop" className="nav-link-btn">SHOP</Link></li>
          <li><Link to="/about" className="nav-link-btn">ABOUT</Link></li>
          <li><Link to="/contact" className="nav-link-btn">CONTACT</Link></li>
        </ul>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle desktop-only">
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </button>
          <button className="cart-btn" onClick={toggleCart}>CART ({cartCount})</button>
          
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
          <li><button onClick={() => handleMobileNav('/')} className="mobile-nav-btn">HOME</button></li>
          <li><button onClick={() => handleMobileNav('/shop')} className="mobile-nav-btn">SHOP</button></li>
          <li><button onClick={() => handleMobileNav('/about')} className="mobile-nav-btn">ABOUT</button></li>
          <li><button onClick={() => handleMobileNav('/contact')} className="mobile-nav-btn">CONTACT</button></li>
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
