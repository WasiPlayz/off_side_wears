import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import './Success.css';

interface SuccessProps {
  trackingNumber: string;
}

const Success: React.FC<SuccessProps> = ({ trackingNumber }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsSubmitting] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  // Load order data from sessionStorage (saved during checkout)
  useEffect(() => {
    const savedOrder = sessionStorage.getItem('lastOrderDetails');
    if (savedOrder) {
      setOrderInfo(JSON.parse(savedOrder));
    }
  }, []);

  const handleDownloadReceipt = async () => {
    if (receiptRef.current === null) return;
    
    setIsSubmitting(true);
    try {
      const dataUrl = await toPng(receiptRef.current, { 
        cacheBust: true,
        backgroundColor: '#0a0518',
        style: {
          padding: '40px',
          display: 'flex',
          flexDirection: 'column'
        }
      });
      
      const link = document.createElement('a');
      link.download = `OFF_SIDE_RECEIPT_${trackingNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate receipt', err);
      alert('FAILED TO GENERATE RECEIPT. PLEASE TAKE A SCREENSHOT INSTEAD.');
    } finally {
      setIsSubmitting(false);
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

        {/* Hidden Receipt Template for html-to-image */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={receiptRef} className="receipt-template">
            <div className="receipt-header">
              <div className="receipt-logo">OFF_SIDE</div>
              <div className="receipt-status">RECEIPT</div>
            </div>
            
            <div className="receipt-meta">
              <div className="meta-item">
                <span>TRACKING ID:</span>
                <strong>#OFF-{trackingNumber}</strong>
              </div>
              <div className="meta-item">
                <span>DATE:</span>
                <strong>{new Date().toLocaleDateString()}</strong>
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
                <span style={{ color: 'var(--accent-color)' }}>{orderInfo?.paymentInfo?.transactionId || 'N/A'}</span>
              </div>
            </div>

            <div className="receipt-section">
              <h4>SECURED ITEMS</h4>
              <div className="receipt-items">
                {orderInfo?.items?.map((item: any, idx: number) => (
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
              <div className="total-row" style={{ color: 'var(--accent-color)', marginTop: '1rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                <span>AMOUNT PAID (NOW):</span>
                <span>{orderInfo?.orderSummary?.amountPaid || 0} BDT</span>
              </div>
              <div className="total-row" style={{ color: '#fbbf24' }}>
                <span>BALANCE DUE (ON DELIVERY):</span>
                <span>{orderInfo?.orderSummary?.balanceDue || 0} BDT</span>
              </div>
              <div className="total-row grand">
                <span>TOTAL ORDER VALUE:</span>
                <span>{orderInfo?.orderSummary?.total || 0} BDT</span>
              </div>
            </div>
            
            <div className="receipt-watermark">AUTHENTIC 1:1 GRADE PROTOCOL</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
