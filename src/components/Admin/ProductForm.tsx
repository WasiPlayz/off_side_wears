import React, { useState } from 'react';
import type { Product } from '../../types';

interface ProductFormProps {
  editingProduct: Product | null;
  categories?: string[];
  onSave: (productData: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_CATEGORIES = [
  'Jerseys',
  'PLAYER EDITION',
  'FAN EDITION',
  'T-Shirts',
  'Trousers',
  'Outerwear',
  'Accessories'
];

const PRESET_SIZES = [
  'S', 'M', 'L', 'XL', 'XXL', '3XL',
  '28', '30', '32', '34', '36', '38',
  'FREE SIZE'
];

const ProductForm: React.FC<ProductFormProps> = ({ editingProduct, categories = [], onSave, onCancel }) => {
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories]));

  const [name, setName] = useState(editingProduct?.name || '');
  const [category, setCategory] = useState(editingProduct?.category || allCategories[0] || 'Jerseys');
  const [price, setPrice] = useState(editingProduct?.price || '');
  const [img, setImg] = useState(editingProduct?.img || '');
  const [inStock, setInStock] = useState(editingProduct?.inStock !== false);
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [features, setFeatures] = useState<string[]>(editingProduct?.features || ['']);
  
  const [images, setImages] = useState<string[]>(
    editingProduct?.images && editingProduct.images.length > 0 
      ? editingProduct.images 
      : (editingProduct?.img ? [editingProduct.img] : [])
  );
  const [availableSizes, setAvailableSizes] = useState<string[]>(
    editingProduct?.availableSizes || ['M', 'L', 'XL', 'XXL']
  );
  const [customSizeInput, setCustomSizeInput] = useState('');

  const toggleSize = (size: string) => {
    setAvailableSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (trimmed && !availableSizes.includes(trimmed)) {
      setAvailableSizes(prev => [...prev, trimmed]);
      setCustomSizeInput('');
    }
  };

  const handleAddFeature = () => setFeatures([...features, '']);
  const handleRemoveFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredImages = images.filter(url => url.trim() !== '');
    const filteredFeatures = features.filter(f => f.trim() !== '');

    onSave({
      name,
      category,
      price,
      img,
      inStock,
      description: description.trim(),
      features: filteredFeatures,
      images: filteredImages.length > 0 ? filteredImages : [img],
      availableSizes
    });
  };

  const handleAddImageUrl = () => setImages([...images, '']);
  const handleRemoveImageUrl = (index: number) => setImages(images.filter((_, i) => i !== index));
  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  return (
    <div style={{ background: '#0a0a0a', padding: '2rem', border: '1px solid #1a1a1a', borderRadius: '12px', marginBottom: '2rem' }}>
      <h3 style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', fontSize: '1rem', letterSpacing: '2px' }}>
        {editingProduct ? `EDIT PRODUCT (ID: ${editingProduct.id})` : 'GENERATE NEW PRODUCT'}
      </h3>
      <form onSubmit={handleSubmit} className="product-form-grid">
        <div className="form-group">
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>PRODUCT NAME</label>
          <input type="text" placeholder="e.g. Tactical Cargo Trouser / Argentina Home 24/25" value={name} onChange={e=>setName(e.target.value)} required className="admin-input" />
        </div>

        <div className="form-group">
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>CATEGORY</label>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="admin-input">
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>PRICE (BDT)</label>
          <input type="number" placeholder="1150" value={price} onChange={e=>setPrice(e.target.value)} required className="admin-input" />
        </div>

        <div className="form-group">
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>MAIN THUMBNAIL URL</label>
          <input type="text" placeholder="https://image-link.com/img.jpg" value={img} onChange={e=>setImg(e.target.value)} required className="admin-input" />
        </div>

        <div className="form-group full-row stock-toggle">
          <label style={{ fontSize: '0.8rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <input 
              type="checkbox" 
              checked={inStock} 
              onChange={e => setInStock(e.target.checked)} 
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
            />
            GLOBAL STOCK ACTIVE
          </label>
        </div>

        {/* Flexible Custom Size Management */}
        <div className="form-group full-row size-avail">
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.8rem', display: 'block' }}>SIZE AVAILABILITY</label>
          
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {PRESET_SIZES.map(size => (
              <button
                type="button"
                key={size}
                onClick={() => toggleSize(size)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: availableSizes.includes(size) ? '1px solid var(--accent-color)' : '1px solid #222',
                  background: availableSizes.includes(size) ? 'rgba(59, 130, 246, 0.2)' : '#111',
                  color: availableSizes.includes(size) ? 'var(--accent-color)' : '#888',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                {size} {availableSizes.includes(size) ? '✓' : ''}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="ADD CUSTOM SIZE (e.g. 36, XS, 40)"
              value={customSizeInput}
              onChange={e => setCustomSizeInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSize(); } }}
              className="admin-input"
              style={{ fontSize: '0.75rem' }}
            />
            <button
              type="button"
              onClick={handleAddCustomSize}
              style={{ padding: '0 1rem', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              + ADD SIZE
            </button>
          </div>

          {availableSizes.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#ccc' }}>
              Selected Sizes: <strong style={{ color: 'var(--accent-color)' }}>{availableSizes.join(', ')}</strong>
            </div>
          )}
        </div>

        {/* Custom Description & Features */}
        <div className="form-group full-row product-desc-box">
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>CUSTOM PRODUCT DESCRIPTION</label>
          <textarea
            rows={3}
            placeholder="Write details about the product's fabric, fit, style, and care instructions..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="admin-input"
            style={{ width: '100%', resize: 'vertical' }}
          ></textarea>
        </div>

        <div className="form-group full-row feature-urls">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 900, letterSpacing: '1px' }}>KEY FEATURES & HIGHLIGHTS</h4>
            <button type="button" onClick={handleAddFeature} style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-color)', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 900, borderRadius: '4px' }}>+ ADD FEATURE BULLET</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {features.map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder={`Feature #${idx + 1} (e.g. 100% Breathable Heavyweight Cotton / Zippered Pockets)`} 
                  value={feat} 
                  onChange={(e) => handleFeatureChange(idx, e.target.value)} 
                  className="admin-input"
                  style={{ fontSize: '0.75rem', flex: 1 }} 
                />
                <button type="button" onClick={() => handleRemoveFeature(idx)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0 0.8rem', cursor: 'pointer', borderRadius: '4px' }}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group full-row gallery-urls">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 900, letterSpacing: '1px' }}>ADDITIONAL GALLERY ASSETS</h4>
            <button type="button" onClick={handleAddImageUrl} style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-color)', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 900, borderRadius: '4px' }}>+ ATTACH URL</button>
          </div>
          <div className="gallery-grid">
            {images.map((url, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder={`Asset URL #${idx + 1}`} 
                  value={url} 
                  onChange={(e) => handleImageUrlChange(idx, e.target.value)} 
                  className="admin-input"
                  style={{ fontSize: '0.75rem' }} 
                />
                <button type="button" onClick={() => handleRemoveImageUrl(idx)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0 0.8rem', cursor: 'pointer', borderRadius: '4px' }}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group full-row form-actions">
          <button type="submit" className="btn-primary" style={{ flex: 2, height: '55px' }}>
            {editingProduct ? 'UPDATE DATASTREAM' : 'DEPLOY PRODUCT'}
          </button>
          {editingProduct && (
            <button type="button" onClick={onCancel} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #333', cursor: 'pointer', borderRadius: '8px', fontWeight: 900, fontSize: '0.8rem' }}>
              ABORT
            </button>
          )}
        </div>
      </form>

      <style>{`
        .product-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .full-row {
          grid-column: span 2;
        }
        .stock-toggle, .size-avail, .product-desc-box, .feature-urls, .gallery-urls {
          background: #000;
          padding: 1.2rem;
          border: 1px solid #111;
          border-radius: 8px;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .product-form-grid {
            grid-template-columns: 1fr;
          }
          .full-row {
            grid-column: span 1;
          }
          .gallery-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductForm;
