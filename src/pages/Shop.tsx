import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import './Shop.css';

interface ShopProps {
  products: Product[];
}

const Shop: React.FC<ShopProps> = ({ products }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isLoaded] = useState(true);
  const navigate = useNavigate();

  const sortedAndFilteredProducts = useMemo(() => {
    // 1. Filter by category
    const filtered = activeCategory === 'ALL' 
      ? products 
      : products.filter(p => p.category === activeCategory);

    // 2. Sort: Player Edition first, then stock status (In stock > Out of stock)
    return [...filtered].sort((a, b) => {
      // Primary: Stock Status (In Stock always comes before Out of Stock)
      const stockA = a.inStock === false ? 0 : 1;
      const stockB = b.inStock === false ? 0 : 1;
      
      if (stockA !== stockB) return stockB - stockA;

      // Secondary: Category (Player Edition/Premium first among in-stock items)
      if (stockA === 1) { // Both are in stock
        const isPlayerA = a.category.toUpperCase().includes('PLAYER') ? 1 : 0;
        const isPlayerB = b.category.toUpperCase().includes('PLAYER') ? 1 : 0;
        if (isPlayerA !== isPlayerB) return isPlayerB - isPlayerA;
      }

      return 0; // Maintain original relative order for items with same priority
    });
  }, [products, activeCategory]);

  return (
    <div className={`shop-page container ${isLoaded ? 'loaded' : ''}`}>
      <section className="shop-header">
        <span className="subtitle">PREMIUM GRADE WEARS</span>
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
        {sortedAndFilteredProducts.map((product, index) => (
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
