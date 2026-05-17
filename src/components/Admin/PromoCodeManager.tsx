import React, { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { PromoCode, Product } from '../../types';

interface PromoCodeManagerProps {
  products: Product[];
}

const PromoCodeManager: React.FC<PromoCodeManagerProps> = ({ products }) => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [type, setType] = useState<'global' | 'product'>('global');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);

  const fetchPromoCodes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'promocodes'));
      const codes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PromoCode[];
      setPromoCodes(codes);
    } catch (error) {
      console.error("Error fetching promo codes", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchPromoCodes();
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || discount <= 0) {
      alert("Please enter a valid code and discount.");
      return;
    }

    setLoading(true);
    try {
      const trimmedCode = code.trim();
      const promoId = trimmedCode.toUpperCase().replace(/\s+/g, '_');
      const newPromo: PromoCode = {
        id: promoId,
        code: trimmedCode.toUpperCase(),
        discount,
        type,
        productIds: type === 'product' ? selectedProductIds : [],
        active: isActive
      };

      await setDoc(doc(db, 'promocodes', promoId), newPromo);
      alert("Promo code saved!");
      setCode('');
      setDiscount(0);
      setSelectedProductIds([]);
      fetchPromoCodes();
    } catch (error) {
      console.error("Error saving promo code", error);
      alert("Failed to save promo code.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this promo code?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'promocodes', id));
      fetchPromoCodes();
    } catch (error) {
      console.error("Error deleting promo code", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="promo-manager">
      <div className="admin-section-header">
        <div>
          <h2>PROMO SYSTEM</h2>
          <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>{promoCodes.length} ACTIVE DISCOUNTS</p>
        </div>
      </div>

      <div style={{ background: '#0a0a0a', padding: '2.5rem', border: '1px solid #1a1a1a', borderRadius: '12px', marginBottom: '4rem' }}>
        <h3 style={{ marginBottom: '2rem', color: 'var(--accent-color)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Generate New Promo Code</h3>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 900, letterSpacing: '1px' }}>PROMO CODE</label>
            <input 
              type="text" 
              placeholder="e.g. SAVE20" 
              value={code}
              onChange={e => setCode(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 900, letterSpacing: '1px' }}>DISCOUNT %</label>
            <input 
              type="number" 
              placeholder="e.g. 20" 
              value={discount || ''}
              onChange={e => setDiscount(Number(e.target.value))}
              className="admin-input"
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 900, letterSpacing: '1px' }}>APPLICATION TYPE</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value as 'global' | 'product')}
              className="admin-input"
              style={{ paddingRight: '2rem' }}
            >
              <option value="global">GLOBAL COLLECTION</option>
              <option value="product">TARGETED PRODUCTS</option>
            </select>
          </div>

          {type === 'product' && (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 900, letterSpacing: '1px' }}>SELECT TARGET KITS</label>
              <div style={{ maxHeight: '250px', overflowY: 'auto', background: '#000', padding: '1.5rem', border: '1px solid #111', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {products.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', padding: '0.5rem', background: selectedProductIds.includes(p.id) ? 'rgba(59, 130, 246, 0.05)' : 'transparent', borderRadius: '4px', transition: 'all 0.2s ease' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedProductIds.includes(p.id)}
                      onChange={() => toggleProductSelection(p.id)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: selectedProductIds.includes(p.id) ? '#fff' : '#64748b' }}>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, letterSpacing: '1px' }}>STATUS ACTIVE</label>
            <input 
              type="checkbox" 
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ gridColumn: 'span 1', height: '52px', marginTop: 'auto' }}>
            {loading ? 'INITIALIZING...' : 'ACTIVATE CODE'}
          </button>
        </form>
      </div>

      <div className="promo-list">
        <h3 style={{ marginBottom: '2rem', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Active Promo Codes</h3>
        {loading && <div className="loading-screen" style={{ height: 'auto' }}>SYNCING...</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {promoCodes.map(pc => (
            <div key={pc.id} className="admin-card">
              <div className="admin-card-header">
                <strong style={{ color: 'var(--accent-color)', fontSize: '1.2rem', letterSpacing: '1px' }}>{pc.code}</strong>
                <span className={`status-pill ${pc.active ? 'status-completed' : 'status-cancelled'}`}>
                  {pc.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="admin-card-body">
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800 }}>DISCOUNT</span>
                    <span style={{ color: '#fff', fontWeight: 900 }}>{pc.discount}% OFF</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800 }}>TYPE</span>
                    <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 800 }}>{pc.type.toUpperCase()}</span>
                  </div>
                  {pc.type === 'product' && pc.productIds && (
                    <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#000', borderRadius: '4px', border: '1px solid #111' }}>
                      <span style={{ display: 'block', color: '#64748b', fontSize: '0.6rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '1px' }}>TARGET IDS</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {pc.productIds.map(id => (
                          <span key={id} style={{ fontSize: '0.65rem', background: '#222', color: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '2px' }}>#{id}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleDelete(pc.id)} 
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px', borderRadius: '4px', transition: 'all 0.3s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)')}
                >
                  DECOMMISSION CODE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoCodeManager;
