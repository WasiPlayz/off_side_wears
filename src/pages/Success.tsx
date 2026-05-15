import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import type { Order } from '../types';
import './Success.css';

interface SuccessProps {
  trackingNumber: string;
}

const Success: React.FC<SuccessProps> = ({ trackingNumber }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [orderInfo, setOrderInfo] = useState<Order | null>(null);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('lastOrderDetails');
    if (savedOrder) {
      try {
        setOrderInfo(JSON.parse(savedOrder) as Order);
      } catch (err) {
        console.error('Failed to parse order info', err);
      }
    }
  }, []);

  const handleDownloadReceipt = async () => {
    if (receiptRef.current === null) {
      console.error("Receipt reference is null");
      return;
    }
    
    setIsDownloading(true);
    
    // Force a small delay to ensure images are loaded
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Create a cloned node for rendering to avoid issues with absolute positioning
      const dataUrl = await toPng(receiptRef.current, { 
        cacheBust: true,
        backgroundColor: '#0a0518',
        pixelRatio: 2, // Higher quality
        skipAutoScale: true,
      });
      
      const link = document.createElement('a');
      link.download = `OFF_SIDE_RECEIPT_${trackingNumber || 'ORDER'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate receipt', err);
      alert('SYSTEM ERROR: RECEIPT GENERATION FAILED. PLEASE TAKE A SCREENSHOT FOR YOUR RECORDS.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="success-page container">
      <div className="success-content-wrapper">
        <div className="success-icon-box">
          <div className="check-mark">✓</div>
        </div>
        
        <h1 className="glitch-text">ORDER <br /><span className="highlight">SECURED</span></h1>
        
        <p className="success-message">
          YOUR DATA HAS BEEN TRANSMITTED TO THE ARCHIVE. 
          THE ELITE KITS ARE BEING PREPARED FOR DEPLOYMENT.
        </p>

        {orderInfo?.paymentInfo?.method === 'cod' && (
          <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid #fbbf24', borderRadius: '4px' }}>
            <p style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px' }}>
              PROTOCOL: CASH ON DELIVERY (PRODUCT PRICE DUE)
            </p>
          </div>
        )}

        <div className="success-actions">
          <button 
            onClick={handleDownloadReceipt} 
            className="btn-primary download-btn" 
            disabled={isDownloading}
          >
            {isDownloading ? 'GENERATING...' : 'DOWNLOAD RECEIPT'}
          </button>
          <Link to="/" className="btn-secondary">RETURN TO SHOP</Link>
        </div>

        {/* Improved Receipt Template - rendered off-screen but visible to the tool */}
        <div style={{ position: 'fixed', left: '-5000px', top: '0', zIndex: -1 }}>
          <div ref={receiptRef} className="receipt-template" style={{ display: 'block' }}>
            <div className="receipt-header">
              <div className="receipt-logo">OFF_SIDE</div>
              <div className="receipt-status">OFFICIAL RECEIPT</div>
            </div>
            
            <div className="receipt-meta">
              <div className="meta-item">
                <span>TRACKING ID:</span>
                <strong style={{ color: '#fff' }}>#OFF-{trackingNumber || 'PENDING'}</strong>
              </div>
              <div className="meta-item">
                <span>DATE:</span>
                <strong style={{ color: '#fff' }}>{new Date().toLocaleDateString()}</strong>
              </div>
            </div>

            <div className="receipt-section">
              <h4>CUSTOMER INTEL</h4>
              <p>{orderInfo?.customerInfo?.fullName || 'VERIFIED CLIENT'}</p>
              <p>{orderInfo?.customerInfo?.phone || ''}</p>
              <p>{orderInfo?.customerInfo?.address || ''}, {orderInfo?.customerInfo?.thana || ''}</p>
              <p>{orderInfo?.customerInfo?.district || ''}</p>
            </div>

            <div className="receipt-section">
              <h4>PAYMENT PROTOCOL</h4>
              <div className="receipt-item-row">
                <span>METHOD:</span>
                <span style={{ textTransform: 'uppercase' }}>{orderInfo?.paymentInfo?.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
              </div>
              <div className="receipt-item-row">
                <span>GATEWAY:</span>
                <span style={{ textTransform: 'uppercase' }}>{orderInfo?.paymentInfo?.mobileBanking || 'N/A'}</span>
              </div>
              <div className="receipt-item-row">
                <span>TRANSACTION ID:</span>
                <span style={{ color: '#3b82f6' }}>{orderInfo?.paymentInfo?.transactionId || 'N/A'}</span>
              </div>
            </div>

            <div className="receipt-section">
              <h4>SECURED ITEMS</h4>
              <div className="receipt-items">
                {orderInfo?.items?.map((item, idx) => (
                  <div key={idx} className="receipt-item-row">
                    <span>{item.quantity}x {item.name} ({item.size})</span>
                    <span>{item.price} BDT</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="receipt-footer">
              <div className="total-row">
                <span>SUBTOTAL:</span>
                <span>{orderInfo?.orderSummary?.subtotal || 0} BDT</span>
              </div>
              <div className="total-row">
                <span>SHIPPING:</span>
                <span>{orderInfo?.orderSummary?.shipping || 0} BDT</span>
              </div>
              <div className="total-row" style={{ color: '#3b82f6', marginTop: '1rem', borderTop: '1px solid #1a1a1a', paddingTop: '1rem' }}>
                <span>AMOUNT PAID (NOW):</span>
                <span>{orderInfo?.orderSummary?.amountPaid || 0} BDT</span>
              </div>
              <div className="total-row" style={{ color: '#fbbf24' }}>
                <span>BALANCE DUE (ON DELIVERY):</span>
                <span>{orderInfo?.orderSummary?.balanceDue || 0} BDT</span>
              </div>
              <div className="total-row grand" style={{ borderTop: '2px solid #3b82f6', paddingTop: '1rem' }}>
                <span>TOTAL ORDER VALUE:</span>
                <span style={{ color: '#3b82f6' }}>{orderInfo?.orderSummary?.total || 0} BDT</span>
              </div>
            </div>
            
            <div className="receipt-watermark" style={{ opacity: 0.1, marginTop: '2rem' }}>AUTHENTIC 1:1 GRADE PROTOCOL // OFF_SIDE_WEARS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
