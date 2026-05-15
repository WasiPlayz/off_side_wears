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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>CURRENT INVENTORY ({products.length})</h3>
        <button onClick={onSeed} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#888', border: '1px solid #444', cursor: 'pointer' }}>
          Seed Initial Data (Dev Only)
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {products.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src={p.img} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
              <div>
                <h4 style={{ margin: 0, color: '#fff' }}>
                  {p.name} 
                  {p.inStock === false && <span style={{ marginLeft: '1rem', fontSize: '0.6rem', background: '#ef4444', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '2px' }}>OUT OF STOCK</span>}
                </h4>
                <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>ID: {p.id} | {p.category} | {p.price} BDT | {p.images?.length || 1} images</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => onEdit(p)} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: '1px solid #444', cursor: 'pointer' }}>
                EDIT
              </button>
              <button onClick={() => onDelete(p.id)} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', cursor: 'pointer' }}>
                DELETE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminInventory;
