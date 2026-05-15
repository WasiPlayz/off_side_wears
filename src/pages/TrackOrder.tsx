import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './TrackOrder.css';

interface TrackedItem {
  name: string;
  size: string;
  quantity: number;
}

interface TrackedOrderData {
  trackingNumber: string;
  status: string;
  customerInfo: {
    fullName: string;
    district: string;
    thana: string;
  };
  orderSummary: {
    total: number;
  };
  items: TrackedItem[];
}

const TrackOrder: React.FC = () => {
  const [trackingInput, setTrackingInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<TrackedOrderData | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;

    // Clean up input (in case they type #OFF-123456 or just 123456)
    const cleanTracking = trackingInput.replace('#OFF-', '').trim();

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const q = query(collection(db, 'orders'), where('trackingNumber', '==', cleanTracking));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("NO ORDER FOUND WITH THIS TRACKING NUMBER. PLEASE CHECK AND TRY AGAIN.");
      } else {
        // Assuming tracking numbers are unique, take the first one
        setOrderData(querySnapshot.docs[0].data() as TrackedOrderData);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("SYSTEM ERROR. UNABLE TO COMMUNICATE WITH THE ARCHIVE.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#fbbf24'; // yellow
      case 'processing': return '#60a5fa'; // blue
      case 'shipped': return '#a78bfa'; // light blue
      case 'completed': return '#4ade80'; // green
      default: return 'var(--accent-color)';
    }
  };

  return (
    <div className="track-order-page container">
      <h1 className="glitch-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        TRACK <span className="highlight">ORDER</span>
      </h1>

      <div className="track-search-container">
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '2rem' }}>
          ENTER YOUR 6-DIGIT TRACKING NUMBER TO VIEW CURRENT LOGISTICS INTEL.
        </p>

        <form onSubmit={handleTrack} className="track-form" style={{ display: 'flex', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="e.g. 123456 or #OFF-123456" 
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            style={{ flex: 1, padding: '1rem', background: '#111', border: '1px solid #444', color: '#fff', fontSize: '1.1rem' }}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'SEARCHING...' : 'TRACK'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', textAlign: 'center', maxWidth: '500px', margin: '2rem auto 0' }}>
            {error}
          </div>
        )}

        {orderData && (
          <div className="track-results" style={{ marginTop: '3rem', maxWidth: '600px', margin: '3rem auto 0', background: '#111', border: '1px solid #333', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--white)', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
              LOGISTICS INTEL: <span style={{ color: 'var(--accent-color)' }}>#OFF-{orderData.trackingNumber}</span>
            </h3>
            
            <div style={{ marginBottom: '2rem', textAlign: 'center', padding: '2rem', background: '#000', border: '1px dashed #444' }}>
              <p style={{ color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>CURRENT STATUS</p>
              <h2 style={{ color: getStatusColor(orderData.status), letterSpacing: '2px', margin: 0 }}>
                {orderData.status.toUpperCase()}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ color: '#888', marginBottom: '0.5rem', fontSize: '0.8rem' }}>SHIPPING TO</h4>
                <p style={{ margin: '0.2rem 0' }}>{orderData.customerInfo.fullName}</p>
                <p style={{ margin: '0.2rem 0' }}>{orderData.customerInfo.district}, {orderData.customerInfo.thana}</p>
              </div>
              <div>
                <h4 style={{ color: '#888', marginBottom: '0.5rem', fontSize: '0.8rem' }}>ORDER SUMMARY</h4>
                <p style={{ margin: '0.2rem 0' }}>Items: {orderData.items.reduce((acc, item) => acc + item.quantity, 0)}</p>
                <p style={{ margin: '0.2rem 0' }}>Total: <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{orderData.orderSummary.total} BDT</span></p>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
               <h4 style={{ color: '#888', marginBottom: '1rem', fontSize: '0.8rem' }}>ITEMS SECURED</h4>
               {orderData.items.map((item, idx) => (
                 <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                   <span>{item.quantity}x {item.name} ({item.size})</span>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;