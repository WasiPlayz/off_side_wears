import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const isInStock = product.inStock !== false;
  const displayImg = product.img || '/offside_wears.jpeg';
  
  return (
    <div className="product-card-home" onClick={() => navigate(`/product/${product.id}`)}>
      <img 
        src={displayImg} 
        alt={product.name} 
        loading="lazy"
        style={{ opacity: isInStock ? '0.8' : '0.4' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/offside_wears.jpeg';
        }}
      />
      {!isInStock && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          padding: '0.5rem 1rem',
          fontWeight: 900,
          fontSize: '0.8rem',
          letterSpacing: '2px',
          zIndex: 5,
          border: '1px solid #fff'
        }}>
          OUT OF STOCK
        </div>
      )}
      <div className="home-product-overlay">
        <button className="btn-primary mini">{isInStock ? 'VIEW DETAILS' : 'RESTOCKING SOON'}</button>
      </div>
      <div className="card-info">
        <div className="card-tag">NEW</div>
        <h3 className="card-name">{product.name}</h3>
        <p className="card-price">{product.price} BDT</p>
      </div>
    </div>
  );
};

export default ProductCard;
