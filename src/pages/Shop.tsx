import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import './Shop.css';

interface ShopProps {
  products: Product[];
}

const Shop: React.FC<ShopProps> = ({ products }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded] = useState(true);
  const navigate = useNavigate();

  // Extract unique categories dynamically from products
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('ALL');
    products.forEach(p => {
      if (p.category) cats.add(p.category.trim());
    });
    return Array.from(cats);
  }, [products]);

  const sortedAndFilteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      const matchesCategory = activeCategory === 'ALL' || 
        p.category?.toLowerCase() === activeCategory.toLowerCase();

      // Search query filter
      const matchesSearch = searchQuery.trim() === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      // Primary: Stock Status (In Stock before Out of Stock)
      const stockA = a.inStock === false ? 0 : 1;
      const stockB = b.inStock === false ? 0 : 1;
      if (stockA !== stockB) return stockB - stockA;

      // Secondary: Player edition or featured items
      if (stockA === 1) {
        const isPlayerA = a.category?.toUpperCase().includes('PLAYER') ? 1 : 0;
        const isPlayerB = b.category?.toUpperCase().includes('PLAYER') ? 1 : 0;
        if (isPlayerA !== isPlayerB) return isPlayerB - isPlayerA;
      }

      return 0;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className={`shop-page container ${isLoaded ? 'loaded' : ''}`}>
      <section className="shop-header">
        <span className="subtitle">PREMIUM ATHLETIC & SPORTS WEARS</span>
        <h1 className="glitch-text">OFF_SIDE <br /> <span className="highlight">COLLECTION</span></h1>
        
        {/* Search Bar */}
        <div style={{ maxWidth: '500px', margin: '2rem auto 2.5rem auto' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="SEARCH JERSEYS, T-SHIRTS, TROUSERS..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                letterSpacing: '1px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 900
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="category-filter" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          {availableCategories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      {sortedAndFilteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', background: '#0a0a0a', border: '1px dashed #222', borderRadius: '12px' }}>
          <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '1rem', letterSpacing: '1px' }}>
            NO WEARS FOUND MATCHING YOUR CRITERIA.
          </p>
          <button 
            className="btn-secondary" 
            onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
            style={{ marginTop: '1.5rem', padding: '0.8rem 1.8rem', fontSize: '0.75rem' }}
          >
            RESET FILTERS
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {sortedAndFilteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="product-card" 
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="product-img-container">
                {product.category?.toUpperCase().includes('PLAYER') && (
                  <div className="elite-badge">ELITE GRADE</div>
                )}
                
                <img 
                  src={product.img} 
                  alt={product.name} 
                  loading="lazy" 
                  style={{ opacity: product.inStock === false ? 0.3 : 1 }} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/offside_wears.jpeg';
                  }}
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
      )}
    </div>
  );
};

export default Shop;
