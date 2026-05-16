import React, { useState } from 'react';
import type { Product } from '../../types';

interface ProductFormProps {
  editingProduct: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ editingProduct, onSave, onCancel }) => {
  // Initialize state directly from editingProduct (clean because of 'key' prop in parent)
  const [name, setName] = useState(editingProduct?.name || '');
  const [category, setCategory] = useState(editingProduct?.category || 'PLAYER EDITION');
  const [price, setPrice] = useState(editingProduct?.price || '');
  const [img, setImg] = useState(editingProduct?.img || '');
  const [inStock, setInStock] = useState(editingProduct?.inStock !== false);
  const [images, setImages] = useState<string[]>(
    editingProduct?.images && editingProduct.images.length > 0 
      ? editingProduct.images 
      : (editingProduct?.img ? [editingProduct.img] : [])
  );
  const [availableSizes, setAvailableSizes] = useState<string[]>(
    editingProduct?.availableSizes || ['M', 'L', 'XL', 'XXL']
  );

  const toggleSize = (size: string) => {
    setAvailableSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredImages = images.filter(url => url.trim() !== '');
    onSave({
      name,
      category,
      price,
      img,
      inStock,
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
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="form-group" style={{ gridColumn: 'span 1' }}>
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>PRODUCT NAME</label>
          <input type="text" placeholder="e.g. Argentina Home 24/25" value={name} onChange={e=>setName(e.target.value)} required className="admin-input" />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 1' }}>
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>CATEGORY</label>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="admin-input">
            <option value="PLAYER EDITION">PLAYER EDITION</option>
            <option value="FAN EDITION">FAN EDITION</option>
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: 'span 1' }}>
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>PRICE (BDT)</label>
          <input type="number" placeholder="1150" value={price} onChange={e=>setPrice(e.target.value)} required className="admin-input" />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 1' }}>
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>MAIN THUMBNAIL URL</label>
          <input type="text" placeholder="https://image-link.com/img.jpg" value={img} onChange={e=>setImg(e.target.value)} required className="admin-input" />
        </div>

        <div className="form-group" style={{ gridColumn: 'span 1', display: 'flex', alignItems: 'center', gap: '1rem', background: '#000', padding: '1rem', border: '1px solid #111', borderRadius: '8px' }}>
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

        {/* Size Availability Management */}
        <div style={{ gridColumn: 'span 1', background: '#000', padding: '1rem', border: '1px solid #111', borderRadius: '8px' }}>
          <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.8rem', display: 'block' }}>SIZE AVAILABILITY</label>
          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
            {['M', 'L', 'XL', 'XXL'].map(size => (
              <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.8rem', padding: '0.5rem 0' }}>
                <input 
                  type="checkbox" 
                  checked={availableSizes.includes(size)}
                  onChange={() => toggleSize(size)}
                  style={{ width: '22px', height: '22px', accentColor: 'var(--accent-color)' }}
                />
                {size}
              </label>
            ))}
          </div>
        </div>

        <div style={{ gridColumn: 'span 2', background: '#000', padding: '1.5rem', border: '1px solid #111', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 900, letterSpacing: '1px' }}>ADDITIONAL GALLERY ASSETS</h4>
            <button type="button" onClick={handleAddImageUrl} style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-color)', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 900, borderRadius: '4px' }}>+ ATTACH URL</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
    </div>
  );
};

export default ProductForm;
