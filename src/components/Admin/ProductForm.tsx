import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';

interface ProductFormProps {
  editingProduct: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ editingProduct, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('PLAYER EDITION');
  const [price, setPrice] = useState('');
  const [img, setImg] = useState('');
  const [inStock, setInStock] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (editingProduct) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setPrice(editingProduct.price);
      setImg(editingProduct.img);
      setInStock(editingProduct.inStock !== false);
      setImages(editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [editingProduct.img]);
    } else {
      setName('');
      setCategory('PLAYER EDITION');
      setPrice('');
      setImg('');
      setInStock(true);
      setImages([]);
    }
  }, [editingProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredImages = images.filter(url => url.trim() !== '');
    onSave({
      name,
      category,
      price,
      img,
      inStock,
      images: filteredImages.length > 0 ? filteredImages : [img]
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
    <div style={{ background: '#111', padding: '1.5rem', border: '1px solid #333', marginBottom: '2rem' }}>
      <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>
        {editingProduct ? `EDIT PRODUCT (ID: ${editingProduct.id})` : 'ADD NEW PRODUCT'}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group" style={{ gridColumn: 'span 1' }}>
          <label style={{ fontSize: '0.7rem', color: '#888' }}>PRODUCT NAME</label>
          <input type="text" placeholder="Product Name" value={name} onChange={e=>setName(e.target.value)} required style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff' }} />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 1' }}>
          <label style={{ fontSize: '0.7rem', color: '#888' }}>CATEGORY</label>
          <select value={category} onChange={e=>setCategory(e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff' }}>
            <option value="PLAYER EDITION">PLAYER EDITION</option>
            <option value="FAN EDITION">FAN EDITION</option>
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: 'span 1' }}>
          <label style={{ fontSize: '0.7rem', color: '#888' }}>PRICE (BDT)</label>
          <input type="number" placeholder="Price (BDT)" value={price} onChange={e=>setPrice(e.target.value)} required style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff' }} />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 1' }}>
          <label style={{ fontSize: '0.7rem', color: '#888' }}>MAIN THUMBNAIL URL</label>
          <input type="text" placeholder="Thumbnail Image URL" value={img} onChange={e=>setImg(e.target.value)} required style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff' }} />
        </div>

        <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '1rem', background: '#000', padding: '1rem', border: '1px solid #222' }}>
          <label style={{ fontSize: '0.8rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={inStock} 
              onChange={e => setInStock(e.target.checked)} 
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
            />
            PRODUCT IS IN STOCK
          </label>
        </div>

        <div style={{ gridColumn: 'span 2', background: '#000', padding: '1rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.8rem' }}>ADDITIONAL GALLERY IMAGES</h4>
            <button type="button" onClick={handleAddImageUrl} style={{ padding: '0.3rem 0.8rem', background: 'var(--accent-color)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>+ ADD URL</button>
          </div>
          {images.map((url, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input 
                type="text" 
                placeholder={`Gallery Image #${idx + 1} URL`} 
                value={url} 
                onChange={(e) => handleImageUrlChange(idx, e.target.value)} 
                style={{ flex: 1, padding: '0.6rem', background: '#111', border: '1px solid #333', color: '#fff', fontSize: '0.8rem' }} 
              />
              <button type="button" onClick={() => handleRemoveImageUrl(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0 0.8rem', cursor: 'pointer' }}>×</button>
            </div>
          ))}
        </div>

        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary" style={{ flex: 2 }}>
            {editingProduct ? 'UPDATE CHANGES' : 'PUBLISH PRODUCT'}
          </button>
          {editingProduct && (
            <button type="button" onClick={onCancel} style={{ flex: 1, background: '#333', color: '#fff', border: '1px solid #444', cursor: 'pointer' }}>
              CANCEL
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
