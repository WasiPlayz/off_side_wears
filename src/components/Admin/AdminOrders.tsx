import React from 'react';
import type { Order } from '../../types';

interface AdminOrdersProps {
  orders: Order[];
  updateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, updateStatus }) => {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: '#111', color: '#888' }}>
        NO ORDERS FOUND
      </div>
    );
  }

  return (
    <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {orders.map(order => (
        <div key={order.id} className="order-card" style={{ background: '#111', border: '1px solid #333', padding: '1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ color: 'var(--white)' }}>ORDER ID: <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>{order.id}</span></h3>
              {order.trackingNumber && <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.2rem' }}>TRACKING: <span style={{ color: 'var(--white)' }}>#OFF-{order.trackingNumber}</span></p>}
              <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.2rem' }}>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Recent'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ 
                fontWeight: 'bold', 
                padding: '0.5rem 1rem', 
                background: '#222', 
                border: `1px solid ${
                  order.status === 'completed' ? '#4ade80' : 
                  order.status === 'cancelled' ? '#ef4444' : 
                  'var(--accent-color)'
                }`,
                color: order.status === 'cancelled' ? '#ef4444' : 'inherit'
              }}>
                {order.status.toUpperCase()}
              </span>
              <select 
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                style={{ background: '#000', color: '#fff', padding: '0.5rem', border: '1px solid #444' }}
              >
                <option value="pending">PENDING</option>
                <option value="processing">PROCESSING</option>
                <option value="shipped">SHIPPED</option>
                <option value="completed">COMPLETED</option>
                <option value="cancelled">CANCELLED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>CUSTOMER DETAILS</h4>
              <p><strong>Name:</strong> {order.customerInfo.fullName}</p>
              <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
              <p><strong>Email:</strong> {order.customerInfo.email}</p>
              <p><strong>Address:</strong> {order.customerInfo.address}, {order.customerInfo.thana}, {order.customerInfo.district}</p>
            </div>

            <div>
              <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>PAYMENT DETAILS</h4>
              <p><strong>Method:</strong> {order.paymentInfo.method.toUpperCase()}</p>
              {order.paymentInfo.mobileBanking && (
                <>
                  <p><strong>Banking:</strong> {order.paymentInfo.mobileBanking.toUpperCase()}</p>
                  <p><strong>TrxID:</strong> <span style={{ color: 'var(--accent-color)' }}>{order.paymentInfo.transactionId}</span></p>
                </>
              )}
              {order.paymentInfo.screenshotUrl && (
                <a href={order.paymentInfo.screenshotUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'var(--accent-color)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  VIEW SCREENSHOT
                </a>
              )}
              <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#000', border: '1px solid #222' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>PAID: {order.orderSummary.amountPaid || 0} BDT</p>
                <p style={{ fontSize: '0.8rem', color: '#fbbf24' }}>DUE: {order.orderSummary.balanceDue || 0} BDT</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
            <h4 style={{ color: '#888', marginBottom: '1rem' }}>ORDER ITEMS</h4>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#000', padding: '0.8rem', marginBottom: '0.5rem', borderLeft: '3px solid var(--accent-color)' }}>
                <span>{item.name} (Size: {item.size}) x {item.quantity}</span>
                <span>{(parseFloat(item.price) * item.quantity)} BDT</span>
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              TOTAL: <span style={{ color: 'var(--accent-color)' }}>{order.orderSummary.total} BDT</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
