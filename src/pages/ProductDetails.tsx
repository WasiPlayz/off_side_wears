import React, { useState } from 'react';
import type { Product } from '../types';
import './ProductDetails.css';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product, size: string) => void;
  onBack: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onAddToCart, onBack }) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImg, setActiveImg] = useState<string>(product.images?.[0] || product.img);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const gallery = product.images || [product.img];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size first.');
      return;
    }
    onAddToCart(product, selectedSize);
  };

  return (
    <div className="product-details-page container">
      <button className="back-btn" onClick={onBack}>← BACK TO SHOP</button>
      
      <div className="details-grid">
        <div className="details-gallery">
          <div className="main-image-container" onClick={() => setIsZoomed(true)}>
            <img src={activeImg} alt={product.name} className="main-image" />
            <div className="zoom-hint">CLICK TO ZOOM</div>
          </div>
          <div className="thumbnail-bar">
            {gallery.map((img, idx) => (
              <div 
                key={idx} 
                className={`thumbnail ${activeImg === img ? 'active' : ''}`}
                onClick={() => setActiveImg(img)}
              >
                <img src={img} alt={`${product.name} view ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="details-info">
          <span className="product-cat">{product.category}</span>
          <h1 className="glitch-text">{product.name}</h1>
          <p className="price-tag">{product.price} BDT</p>
          
          <div className="size-selection">
            <h3>SELECT SIZE</h3>
            <div className="size-bar">
              {sizes.map(size => (
                <button 
                  key={size} 
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary full-width" onClick={handleAddToCart}>
            ADD TO ARCHIVE
          </button>

          <div className="size-chart-section">
            <h3>INTERNATIONAL SIZE CHART (INCHES)</h3>
            <div className="chart-text">
              <div className="chart-row header">
                <span>SIZE</span>
                <span>CHEST</span>
                <span>WAIST</span>
              </div>
              <div className="chart-row">
                <span>S</span>
                <span>34 - 37</span>
                <span>30 - 32</span>
              </div>
              <div className="chart-row">
                <span>M</span>
                <span>37 - 40</span>
                <span>32 - 35</span>
              </div>
              <div className="chart-row">
                <span>L</span>
                <span>40 - 44</span>
                <span>35 - 39</span>
              </div>
              <div className="chart-row">
                <span>XL</span>
                <span>44 - 48</span>
                <span>39 - 43</span>
              </div>
              <div className="chart-row">
                <span>XXL</span>
                <span>48 - 52</span>
                <span>43 - 47</span>
              </div>
              <p className="note">*Player Edition jerseys feature a slim athletic fit. Size up for a looser fit.</p>
            </div>
          </div>

          <div className="product-description">
            <h3>SPECIFICATIONS</h3>
            <ul>
              <li>Heat-applied team crest and branding</li>
              <li>Lightweight, moisture-wicking technology</li>
              <li>Strategic ventilation for breathability</li>
              <li>100% Recycled High-Performance Polyester</li>
            </ul>
          </div>
        </div>
      </div>

      {isZoomed && (
        <div className="zoom-overlay" onClick={() => setIsZoomed(false)}>
          <div className="zoom-modal">
            <img src={activeImg} alt={product.name} />
            <button className="close-zoom">CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
