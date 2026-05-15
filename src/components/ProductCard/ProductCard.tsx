import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const isInStock = product.inStock !== false;
  
  return (
    <div className="product-card-home" onClick={() => navigate(`/product/${product.id}`)} style={{ 
      background: '#111', 
      height: '450px', 
      border: '1px solid var(--dark-grey)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    }}>
      <img 
        src={product.img} 
        alt={product.name} 
        loading="lazy"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isInStock ? '0.8' : '0.4',
          transition: 'opacity 0.5s ease',
          backgroundColor: '#1a1a1a' 
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
          zIndex: 2,
          border: '1px solid #fff'
        }}>
          OUT OF STOCK
        </div>
      )}
      <div className="home-product-overlay">
        <button className="btn-primary mini">{isInStock ? 'VIEW DETAILS' : 'RESTOCKING SOON'}</button>
      </div>
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        padding: '1.5rem',
        background: 'linear-gradient(0deg, rgba(10,5,24,1) 0%, rgba(10,5,24,0) 100%)'
      }}>
        <div style={{ position: 'absolute', top: '-120%', right: '1rem', background: 'var(--accent-color)', color: '#fff', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 900 }}>NEW</div>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--white)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{product.name}</h3>
        <p style={{ color: 'var(--accent-color)', fontWeight: 800 }}>{product.price} BDT</p>
      </div>
    </div>
  );
};

export default ProductCard;
