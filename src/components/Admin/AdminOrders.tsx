import React from 'react';
import type { Order } from '../../types';

interface AdminOrdersProps {
  orders: Order[];
  updateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, updateStatus }) => {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px' }}>
        <p style={{ color: '#64748b', fontWeight: 800, letterSpacing: '2px' }}>NO ACTIVE ORDERS IN DATASTREAM</p>
      </div>
    );
  }

  return (
    <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="admin-section-header">
        <div>
          <h2>ACTIVE ORDERS</h2>
          <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>{orders.length} TRANSACTIONS FOUND</p>
        </div>
      </div>

      {orders.map(order => (
        <div key={order.id} className="admin-card">
          <div className="admin-card-header" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ minWidth: '200px' }}>
              <h3 style={{ color: 'var(--white)', margin: 0, fontSize: '1rem' }}>#OFF-{order.trackingNumber || 'PENDING'}</h3>
              <p style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800, marginTop: '0.3rem' }}>
                ID: {order.id} • {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'RECENT'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span className={`status-pill status-${order.status}`} style={{ whiteSpace: 'nowrap' }}>
                {order.status}
              </span>
              <select 
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                style={{ 
                  background: '#000', 
                  color: '#fff', 
                  padding: '0.5rem', 
                  border: '1px solid #222', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  minWidth: '120px',
                  cursor: 'pointer'
                }}
              >
                <option value="pending">PENDING</option>
                <option value="processing">PROCESSING</option>
                <option value="shipped">SHIPPED</option>
                <option value="completed">COMPLETED</option>
                <option value="cancelled">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="admin-card-body" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-color)', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1.2rem', textTransform: 'uppercase' }}>Customer Intelligence</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <p><strong>NAME:</strong> <span style={{ color: '#e2e8f0' }}>{order.customerInfo.fullName}</span></p>
                  <p><strong>PHONE:</strong> <span style={{ color: '#e2e8f0' }}>{order.customerInfo.phone}</span></p>
                  <p><strong>EMAIL:</strong> <span style={{ color: '#64748b' }}>{order.customerInfo.email}</span></p>
                  <p><strong>ADDRESS:</strong> <span style={{ color: '#e2e8f0' }}>{order.customerInfo.address}, {order.customerInfo.thana}, {order.customerInfo.district}</span></p>
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--accent-color)', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1.2rem', textTransform: 'uppercase' }}>Financial Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <p><strong>METHOD:</strong> <span style={{ color: '#e2e8f0' }}>{order.paymentInfo.method.toUpperCase()}</span></p>
                  {order.paymentInfo.mobileBanking && (
                    <>
                      <p><strong>GATEWAY:</strong> <span style={{ color: '#e2e8f0' }}>{order.paymentInfo.mobileBanking.toUpperCase()}</span></p>
                      <p><strong>TRX ID:</strong> <code style={{ color: 'var(--secondary-accent)', background: 'rgba(168,85,247,0.1)', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>{order.paymentInfo.transactionId}</code></p>
                    </>
                  )}
                  {order.paymentInfo.screenshotUrl && (
                    <a href={order.paymentInfo.screenshotUrl} target="_blank" rel="noreferrer" style={{ alignSelf: 'flex-start', marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', textDecoration: 'none', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>
                      VIEW SCREENSHOT
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #1a1a1a' }}>
              <h4 style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1.2rem' }}>SECURED ITEMS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderLeft: '3px solid var(--accent-color)' }}>
                    <div>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</span>
                      <p style={{ color: '#64748b', fontSize: '0.7rem', margin: '0.2rem 0 0 0' }}>SIZE: {item.size} • QTY: {item.quantity}</p>
                    </div>
                    <span style={{ fontWeight: 800, color: '#fff' }}>{(parseFloat(item.price) * item.quantity)} BDT</span>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '2rem', background: '#000', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>SUBTOTAL</span>
                  <span>{order.orderSummary.subtotal} BDT</span>
                </div>
                {(order.orderSummary.discountAmount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.8rem', color: '#4ade80' }}>
                    <span>DISCOUNT ({order.orderSummary.appliedPromoCode})</span>
                    <span>-{order.orderSummary.discountAmount} BDT</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>SHIPPING</span>
                  <span>{order.orderSummary.shipping} BDT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '1.2rem' }}>
                  <span style={{ fontWeight: 900, color: '#fff', fontSize: '1rem' }}>GRAND TOTAL</span>
                  <span style={{ fontWeight: 900, color: 'var(--accent-color)', fontSize: '1.2rem' }}>{order.orderSummary.total} BDT</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', borderTop: '1px solid #111', paddingTop: '1rem' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                    <span style={{ display: 'block', fontSize: '0.6rem', color: '#64748b', marginBottom: '0.3rem' }}>PAID</span>
                    <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>{order.orderSummary.amountPaid || 0} BDT</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
                    <span style={{ display: 'block', fontSize: '0.6rem', color: '#64748b', marginBottom: '0.3rem' }}>DUE</span>
                    <span style={{ color: '#fbbf24', fontWeight: 800 }}>{order.orderSummary.balanceDue || 0} BDT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
