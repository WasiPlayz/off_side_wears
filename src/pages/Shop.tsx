import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import './Shop.css';

interface ShopProps {
  products: Product[];
}

const Shop: React.FC<ShopProps> = ({ products }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const navigate = useNavigate();

  const filteredProducts = activeCategory === 'ALL' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="shop-page container">
      <section className="shop-header">
        <h1 className="glitch-text">JERSEY <br /> <span className="highlight">COLLECTION</span></h1>
        <div className="category-filter">
          {['ALL', 'PLAYER EDITION', 'FAN EDITION'].map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
            <div className="product-img-container">
              <img src={product.img} alt={product.name} loading="lazy" style={{ opacity: product.inStock === false ? 0.5 : 1 }} />
              {product.inStock === false && (
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  background: '#ef4444', 
                  color: '#fff', 
                  padding: '0.2rem 0.6rem', 
                  fontSize: '0.7rem', 
                  fontWeight: 900,
                  zIndex: 2
                }}>
                  OUT OF STOCK
                </div>
              )}
              <div className="product-overlay">
                <button className="btn-primary mini">{product.inStock === false ? 'VIEW DETAILS' : 'BUY NOW'}</button>
              </div>
            </div>
            <div className="product-info">
              <span className="product-cat">{product.category}</span>
              <h3>{product.name}</h3>
              <p className="product-price">{product.price} BDT</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
