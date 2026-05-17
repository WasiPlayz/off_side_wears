import React, { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Product, PromoCode } from '../../types';
import { useToast } from '../../context/ToastContext';

interface PromoCodeManagerProps {
  products: Product[];
}

const PromoCodeManager: React.FC<PromoCodeManagerProps> = ({ products }) => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [type, setType] = useState<'global' | 'product'>('global');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const fetchPromoCodes = async () => {
    const querySnapshot = await getDocs(collection(db, 'promocodes'));
    const codes = querySnapshot.docs.map(doc => doc.data() as PromoCode);
    setPromoCodes(codes);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      const querySnapshot = await getDocs(collection(db, 'promocodes'));
      const codes = querySnapshot.docs.map(doc => doc.data() as PromoCode);
      if (active) setPromoCodes(codes);
    };
    load();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    if (!code || discount <= 0) {
      showToast("PLEASE ENTER VALID CODE AND DISCOUNT", 'error');
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
        active: true
      };

      await setDoc(doc(db, 'promocodes', promoId), newPromo);
      showToast("PROMO CODE SAVED", 'success');
      setCode('');
      setDiscount(0);
      setSelectedProductIds([]);
      fetchPromoCodes();
    } catch (err) {
      console.error("Error saving promo code", err);
      showToast("FAILED TO SAVE PROMO CODE", 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (promo: PromoCode) => {
    try {
      await setDoc(doc(db, 'promocodes', promo.id), { ...promo, active: !promo.active });
      showToast(`PROMO ${promo.active ? 'DEACTIVATED' : 'ACTIVATED'}`, 'info');
      fetchPromoCodes();
    } catch (err) {
      console.error("Status update error", err);
      showToast("FAILED TO UPDATE STATUS", 'error');
    }
  };

  const deletePromo = async (id: string) => {
    if (!window.confirm("Delete this promo code?")) return;
    try {
      await deleteDoc(doc(db, 'promocodes', id));
      showToast("PROMO CODE DELETED", 'success');
      fetchPromoCodes();
    } catch (err) {
      console.error("Delete error", err);
      showToast("FAILED TO DELETE PROMO", 'error');
    }
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="promo-manager" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div className="admin-section-header">
        <h2>PROMO CODE ARCHITECT</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Creation Form */}
        <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '12px', border: '1px solid #1a1a1a', height: 'fit-content' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginBottom: '1.5rem', letterSpacing: '2px' }}>GENERATE NEW CODE</h3>
          
          <div className="form-group" style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>CODE NAME</label>
            <input 
              type="text" 
              placeholder="e.g. SAVE10" 
              value={code} 
              onChange={e => setCode(e.target.value)} 
              className="admin-input" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>DISCOUNT PERCENTAGE (%)</label>
            <input 
              type="number" 
              placeholder="10" 
              value={discount} 
              onChange={e => setDiscount(Number(e.target.value))} 
              className="admin-input" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 900, marginBottom: '0.5rem', display: 'block' }}>APPLICABILITY</label>
            <select value={type} onChange={e => setType(e.target.value as 'global' | 'product')} className="admin-input">
              <option value="global">GLOBAL (WHOLE CART)</option>
              <option value="product">SPECIFIC PRODUCTS</option>
            </select>
          </div>

          {type === 'product' && (
            <div style={{ marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto', background: '#000', padding: '1rem', border: '1px solid #111' }}>
              <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 900, marginBottom: '0.8rem', display: 'block' }}>SELECT ELIGIBLE ITEMS</label>
              {products.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedProductIds.includes(p.id)} 
                    onChange={() => toggleProductSelection(p.id)} 
                    style={{ accentColor: 'var(--accent-color)' }}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          )}

          <button 
            onClick={handleSave} 
            className="btn-primary full-width" 
            disabled={loading}
            style={{ height: '50px' }}
          >
            {loading ? 'DEPLOYING...' : 'PUBLISH PROMO CODE'}
          </button>
        </div>

        {/* Existing Codes */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', letterSpacing: '2px', fontWeight: 900 }}>ACTIVE REGISTRY</h3>
          {promoCodes.map(promo => (
            <div key={promo.id} className="admin-card" style={{ opacity: promo.active ? 1 : 0.5 }}>
              <div className="admin-card-header" style={{ padding: '1rem 1.5rem' }}>
                <span style={{ fontWeight: 900, color: 'var(--accent-color)', fontSize: '0.9rem', letterSpacing: '1px' }}>{promo.code}</span>
                <span className={`status-pill ${promo.active ? 'status-completed' : 'status-cancelled'}`}>
                  {promo.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="admin-card-body" style={{ padding: '1.2rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>{promo.discount}% OFF • {promo.type.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => toggleStatus(promo)}
                    style={{ flex: 1, padding: '0.6rem', background: '#111', border: '1px solid #222', color: '#fff', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    {promo.active ? 'DISABLE' : 'ENABLE'}
                  </button>
                  <button 
                    onClick={() => deletePromo(promo.id)}
                    style={{ padding: '0.6rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}
          {promoCodes.length === 0 && (
            <p style={{ textAlign: 'center', color: '#444', fontSize: '0.8rem', marginTop: '2rem' }}>NO PROMO CODES IN REGISTRY.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoCodeManager;
