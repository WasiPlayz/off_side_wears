import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import './Shop.css';

interface ShopProps {
  products: Product[];
}

const Shop: React.FC<ShopProps> = ({ products }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredProducts = activeCategory === 'ALL' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className={`shop-page container ${isLoaded ? 'loaded' : ''}`}>
      <section className="shop-header">
        <span className="subtitle">ELITE PITCH WEAR</span>
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
        {filteredProducts.map((product, index) => (
          <div 
            key={product.id} 
            className="product-card" 
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="product-img-container">
              {product.category.toUpperCase().includes('PLAYER') && (
                <div className="elite-badge">ELITE GRADE</div>
              )}
              
              <img 
                src={product.img} 
                alt={product.name} 
                loading="lazy" 
                style={{ opacity: product.inStock === false ? 0.3 : 1 }} 
              />
              
              {product.inStock === false && (
                <div className="out-of-stock-overlay">
                  <div className="out-of-stock-text">OUT OF STOCK</div>
                </div>
              )}
              
              <div className="product-overlay">
                <button className="btn-primary full-width">
                  {product.inStock === false ? 'VIEW DETAILS' : 'INITIATE PURCHASE'}
                </button>
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
