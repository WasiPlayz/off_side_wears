import React, { useState } from 'react';
import type { Product } from '../types';
import './Shop.css';

interface ShopProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const Shop: React.FC<ShopProps> = ({ products, onProductClick }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filteredProducts = activeCategory === 'ALL' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="shop-page container">
      <section className="shop-header">
        <h1 className="glitch-text">JERSEY <br /> <span className="highlight">ARCHIVE</span></h1>
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
          <div key={product.id} className="product-card" onClick={() => onProductClick(product)}>
            <div className="product-img-container">
              <img src={product.img} alt={product.name} loading="lazy" />
              <div className="product-overlay">
                <button className="btn-primary mini">VIEW DETAILS</button>
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
