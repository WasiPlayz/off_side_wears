import React from 'react';
import type { Product } from '../../types';

interface AdminInventoryProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => Promise<void>;
  onSeed: () => Promise<void>;
}

const AdminInventory: React.FC<AdminInventoryProps> = ({ products, onEdit, onDelete, onSeed }) => {
  return (
    <div className="admin-inventory-section">
      <div className="admin-section-header">
        <div>
          <h2>PRODUCT INVENTORY</h2>
          <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>{products.length} ITEMS TOTAL</p>
        </div>
        <button onClick={onSeed} style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid #222', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px' }}>
          SEED INITIAL DATA
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {products.map(p => (
          <div key={p.id} className="admin-card">
            <div className="admin-card-header">
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-color)', fontWeight: 900 }}>ID: #{p.id}</span>
              <span className={`status-pill ${p.inStock !== false ? 'status-completed' : 'status-cancelled'}`}>
                {p.inStock !== false ? 'IN STOCK' : 'OUT OF STOCK'}
              </span>
            </div>
            <div className="admin-card-body">
              <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <img src={p.img} alt={p.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #222' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '0.95rem', lineHeight: '1.2' }}>{p.name}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.6rem', color: '#64748b', background: '#111', padding: '0.2rem 0.5rem', border: '1px solid #222' }}>{p.category}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--accent-color)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)', fontWeight: 800 }}>{p.price} BDT</span>
                  </div>
                  <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {['M', 'L', 'XL', 'XXL'].map(sz => {
                      const isAvailable = !p.availableSizes || p.availableSizes.includes(sz);
                      return (
                        <span key={sz} style={{ 
                          fontSize: '0.55rem', 
                          padding: '0.1rem 0.3rem', 
                          border: `1px solid ${isAvailable ? '#4ade80' : '#333'}`,
                          color: isAvailable ? '#4ade80' : '#555',
                          borderRadius: '2px',
                          fontWeight: 800
                        }}>
                          {sz}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button 
                  onClick={() => onEdit(p)} 
                  style={{ flex: 1, padding: '0.8rem', background: 'var(--accent-color)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '0.7rem', letterSpacing: '1px', borderRadius: '4px' }}
                >
                  EDIT DETAILS
                </button>
                <button 
                  onClick={() => onDelete(p.id)} 
                  style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', cursor: 'pointer', fontWeight: '900', fontSize: '0.7rem', borderRadius: '4px' }}
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInventory;
