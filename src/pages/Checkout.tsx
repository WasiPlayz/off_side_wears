import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { db } from '../firebase';
import { districts, thanas } from '../data/bd-data';
import { useCart } from '../context/CartContext';
import type { PromoCode } from '../types';
import './Checkout.css';

interface CheckoutProps {
  onComplete: (trackingNumber: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [address, setAddress] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | ''>('');
  const [mobileBanking, setMobileBanking] = useState<'bkash' | 'nagad' | 'rocket' | ''>('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Promo Code States
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Consolidate Price Calculations for Accuracy
  const priceBreakdown = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    
    let disc = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'global') {
        disc = Math.round((sub * appliedPromo.discount) / 100);
      } else {
        const applicableTotal = cart.reduce((acc, item) => {
          if (appliedPromo.productIds?.includes(item.id)) {
            return acc + (parseFloat(item.price) * item.quantity);
          }
          return acc;
        }, 0);
        disc = Math.round((applicableTotal * appliedPromo.discount) / 100);
      }
    }

    const ship = district.toLowerCase() === 'dhaka' ? 70 : 140;
    const tot = sub - disc + ship;
    
    return { subtotal: sub, discountAmount: disc, shipping: ship, total: tot };
  }, [cart, appliedPromo, district]);

  const { subtotal, discountAmount, shipping, total } = priceBreakdown;
  
  const amountPaid = paymentMethod === 'cod' ? shipping : (paymentMethod === 'online' ? total : 0);
  const balanceDue = paymentMethod === 'cod' ? (subtotal - discountAmount) : 0;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoError('');
    
    try {
      // Aggressive cleaning: trim, uppercase, replace all non-alphanumeric with underscore
      const cleanInput = promoInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
      
      if (!cleanInput) {
        setPromoError('PLEASE ENTER A VALID CODE.');
        return;
      }

      // Using query + getDocs instead of getDoc by ID for better compatibility
      const q = query(collection(db, 'promocodes'), where('code', '==', cleanInput));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const promoDoc = querySnapshot.docs[0];
        const promoData = promoDoc.data() as PromoCode;
        
        if (!promoData.active) {
          setPromoError('THIS PROMO CODE IS NO LONGER ACTIVE.');
          return;
        }

        // Validate applicability
        if (promoData.type === 'product') {
          const hasEligibleProduct = cart.some(item => promoData.productIds?.includes(item.id));
          if (!hasEligibleProduct) {
            setPromoError('THIS CODE IS NOT VALID FOR THE PRODUCTS IN YOUR CART.');
            return;
          }
        }

        setAppliedPromo(promoData);
        setPromoInput('');
      } else {
        setPromoError('INVALID PROMO CODE. PLEASE CHECK AND TRY AGAIN.');
      }
    } catch (err: any) {
      console.error("Error applying promo", err);
      // Include the error code to help identify if it's a network, permission, or other issue
      const errorCode = err.code || 'UNKNOWN';
      setPromoError(`SYSTEM ERROR (${errorCode}). FAILED TO VALIDATE PROMO.`);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handlePromoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyPromo();
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  const availableThanas = thanas[district] || ["Sadar", "Other"];

  const uploadImageToImgBB = async (imageFile: File) => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      alert("System Error: ImgBB API key is missing. Ensure VITE_IMGBB_API_KEY is set in Vercel.");
      return '';
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        return data.data.url;
      }
      alert("ImgBB Upload Failed: " + (data.error?.message || "Unknown error"));
      return '';
    } catch (err) {
      alert("Network Error during image upload.");
      console.error("Image upload failed", err);
      return '';
    }
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (!mobileBanking) {
      alert("Please select a mobile banking option.");
      return;
    }
    if (!transactionId) {
      alert("Please enter your Transaction ID.");
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshotUrl = '';
      if (screenshot) {
        screenshotUrl = await uploadImageToImgBB(screenshot);
      }

      const generatedTrackingNumber = Math.floor(100000 + Math.random() * 900000).toString();

      const orderData = {
        trackingNumber: generatedTrackingNumber,
        customerInfo: {
          fullName,
          email,
          phone: `+880${phone}`,
          district,
          thana,
          address
        },
        paymentInfo: {
          method: paymentMethod,
          mobileBanking,
          transactionId,
          screenshotUrl,
          amountPaid,
          balanceDue
        },
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || 'N/A'
        })),
        orderSummary: {
          subtotal,
          shipping,
          total,
          discountAmount,
          appliedPromoCode: appliedPromo?.code || null,
          amountPaid,
          balanceDue
        },
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      sessionStorage.setItem('lastOrderDetails', JSON.stringify(orderData));
      
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (serviceId && templateId && publicKey) {
          const itemsHtml = cart.map(item => {
            let imageUrl = item.img.startsWith('/') 
              ? (window.location.origin.includes('localhost') ? 'https://off-side-wears.vercel.app' : window.location.origin) + item.img 
              : item.img;
            
            if (imageUrl.endsWith('.webp')) {
              imageUrl = 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=200';
            }

            return `
            <table style="width: 100%; border-collapse: collapse">
              <tr style="vertical-align: top">
                <td style="padding: 24px 8px 0 4px; display: inline-block; width: max-content">
                  <img style="height: 64px; border-radius: 4px;" height="64" src="${imageUrl}" alt="item" />
                </td>
                <td style="padding: 24px 8px 0 8px; width: 100%">
                  <div style="font-weight: bold; color: #ccc;">${item.name}</div>
                  <div style="font-size: 13px; color: #888; padding-top: 4px;">Size: ${item.size || 'N/A'}</div>
                  <div style="font-size: 14px; color: #888; padding-top: 4px;">QTY: ${item.quantity}</div>
                </td>
                <td style="padding: 24px 4px 0 0; white-space: nowrap">
                  <strong style="color: #3b82f6;">${item.price} BDT</strong>
                </td>
              </tr>
            </table>
          `;
          }).join('');

          const emailParams = {
            email: email,
            customer_name: fullName,
            order_id: generatedTrackingNumber,
            shipping_cost: shipping,
            tax_cost: 0,
            subtotal: subtotal,
            total_cost: total,
            discount_amount: discountAmount,
            applied_promo: appliedPromo?.code || 'N/A',
            amount_paid: amountPaid,
            balance_due: balanceDue,
            payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
            payment_status: paymentMethod === 'cod' ? `Partial (Delivery Charge Paid: ${amountPaid} BDT)` : 'Fully Paid',
            order_items_html: itemsHtml,
            website_link: window.location.origin
          };

          await emailjs.send(serviceId, templateId, emailParams, publicKey);
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email", emailError);
      }

      clearCart();
      setIsSubmitting(false);
      onComplete(generatedTrackingNumber);
      navigate('/success');

    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to submit order. Please check your internet connection or try again later.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page container">
      <h1 className="glitch-text">CHECKOUT <br /><span className="highlight">FINALIZATION</span></h1>
      
      <div className="checkout-grid">
        <form id="checkout-main-form" className="checkout-form" onSubmit={handleCompleteOrder}>
          <div className="form-section">
            <h3>SHIPPING INTEL</h3>
            <div className="form-row">
              <div className="form-group">
                <label>FULL NAME</label>
                <input type="text" placeholder="ENTER NAME" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <input type="email" placeholder="ADDRESS@DOMAIN.COM" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>PHONE NUMBER</label>
              <div className="phone-input-container">
                <span className="country-code">+880</span>
                <input 
                  type="tel" 
                  placeholder="1XXXXXXXXX" 
                  value={phone}
                  required
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>DISTRICT</label>
                <select value={district} required onChange={(e) => { setDistrict(e.target.value); setThana(''); }}>
                  <option value="">SELECT DISTRICT</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>THANA / UPAZILA</label>
                <select value={thana} required onChange={(e) => setThana(e.target.value)} disabled={!district}>
                  <option value="">SELECT THANA</option>
                  {availableThanas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>STREET ADDRESS</label>
              <input type="text" placeholder="HOUSE, ROAD, AREA" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
          </div>

          <div className="form-section">
            <h3>PAYMENT METHOD</h3>
            <div className="payment-methods" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button 
                type="button"
                className={`filter-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cod')}
                style={{ flex: 1, padding: '1.2rem', background: paymentMethod === 'cod' ? 'var(--accent-color)' : '#111', color: '#fff', border: '1px solid #222', cursor: 'pointer', fontWeight: '900', letterSpacing: '1px' }}
              >
                CASH ON DELIVERY
              </button>
              <button 
                type="button"
                className={`filter-btn ${paymentMethod === 'online' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('online')}
                style={{ flex: 1, padding: '1.2rem', background: paymentMethod === 'online' ? 'var(--accent-color)' : '#111', color: '#fff', border: '1px solid #222', cursor: 'pointer', fontWeight: '900', letterSpacing: '1px' }}
              >
                ONLINE PAYMENT
              </button>
            </div>

            {paymentMethod && (
              <div className="manual-payment-flow" style={{ background: '#050505', padding: '2rem', border: '1px solid #1a1a1a', marginTop: '2rem' }}>
                {paymentMethod === 'cod' && (
                  <p style={{ color: 'var(--accent-color)', marginBottom: '2rem', fontWeight: 800, fontSize: '0.8rem', textAlign: 'center', letterSpacing: '1px' }}>
                    * DELIVERY CHARGE {shipping} BDT MUST BE PAID IN ADVANCE TO CONFIRM ORDER
                  </p>
                )}
                {paymentMethod === 'online' && (
                  <p style={{ color: 'var(--accent-color)', marginBottom: '2rem', fontWeight: 800, fontSize: '0.8rem', textAlign: 'center', letterSpacing: '1px' }}>
                    * PAY TOTAL AMOUNT {total} BDT TO INITIATE SHIPMENT {discountAmount > 0 && `(DISCOUNT OF ${discountAmount} BDT APPLIED)`}
                  </p>
                )}
                
                <h4 style={{ marginBottom: '1.5rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 900, letterSpacing: '2px', textAlign: 'center' }}>SELECT MOBILE BANKING GATEWAY</h4>
                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem' }}>
                  {['bKash', 'Nagad', 'Rocket'].map(method => {
                    const methodKey = method.toLowerCase() as 'bkash' | 'nagad' | 'rocket';
                    return (
                      <button 
                        type="button"
                        key={methodKey}
                        onClick={() => setMobileBanking(methodKey)}
                        style={{ 
                          flex: 1, 
                          padding: '1rem', 
                          background: mobileBanking === methodKey ? 'var(--accent-color)' : '#111',
                          color: '#fff',
                          border: '1px solid #222',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          fontWeight: '900',
                          fontSize: '0.8rem',
                          letterSpacing: '1px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {method}
                      </button>
                    )
                  })}
                </div>

                {mobileBanking && (
                  <div className="payment-details-info" style={{ animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ background: '#000', padding: '1.5rem', border: '1px dashed var(--accent-color)', marginBottom: '2rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>SEND MONEY TO:</span>
                      <strong style={{ color: 'var(--accent-color)', letterSpacing: '3px', fontSize: '1.4rem' }}>
                        {mobileBanking === 'rocket' ? '016094765878' : '01893460038'}
                      </strong>
                    </div>

                    <div className="form-group">
                      <label>TRANSACTION ID</label>
                      <input 
                        type="text" 
                        placeholder="ENTER TRX ID" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        style={{ borderColor: '#222' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>TRANSACTION SCREENSHOT (OPTIONAL BUT RECOMMENDED)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setScreenshot(e.target.files ? e.target.files[0] : null)}
                        style={{ 
                          background: '#111', 
                          padding: '1rem', 
                          color: '#fff', 
                          border: '1px solid #222', 
                          width: '100%',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        <div className="order-summary">
          <h3>ORDER SUMMARY</h3>
          
          {/* Promo Code Section */}
          <div className="promo-section" style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 900, color: '#888', display: 'block', marginBottom: '0.8rem', letterSpacing: '2px' }}>PROMO CODE</label>
            {!appliedPromo ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="ENTER CODE" 
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value)}
                  onKeyDown={handlePromoKeyDown}
                  style={{ flex: 1, padding: '0.8rem', background: '#000', border: '1px solid #222', fontSize: '0.8rem' }}
                />
                <button 
                  type="button" 
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo || !promoInput}
                  style={{ padding: '0 1rem', background: 'var(--accent-color)', color: '#fff', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  {isApplyingPromo ? '...' : 'APPLY'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', padding: '0.8rem 1rem', border: '1px dashed var(--accent-color)' }}>
                <div>
                  <span style={{ color: 'var(--accent-color)', fontWeight: 900, fontSize: '0.8rem' }}>{appliedPromo.code} APPLIED</span>
                  <p style={{ fontSize: '0.65rem', color: '#888', margin: 0 }}>{appliedPromo.discount}% DISCOUNT ACTIVATED</p>
                </div>
                <button type="button" onClick={removePromo} style={{ background: 'transparent', color: '#ef4444', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}>REMOVE</button>
              </div>
            )}
            {promoError && <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.5rem', fontWeight: 700 }}>{promoError}</p>}
          </div>

          <div className="summary-items">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${item.size}-${idx}`} className="summary-item">
                <div className="summary-item-info">
                  <span className="summary-name">{item.name}</span>
                  <span className="summary-meta">SIZE: {item.size || 'N/A'} • QTY: {item.quantity}</span>
                </div>
                <span className="summary-price">{(parseFloat(item.price) * item.quantity)} BDT</span>
              </div>
            ))}
          </div>

          <div className="summary-total">
            <div className="total-row">
              <span>SUBTOTAL</span>
              <span style={{ color: '#fff' }}>{subtotal} BDT</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="total-row" style={{ color: '#4ade80' }}>
                <span>DISCOUNT ({appliedPromo?.code})</span>
                <span>-{discountAmount} BDT</span>
              </div>
            )}

            <div className="total-row">
              <span>SHIPPING ({district || 'NOT SELECTED'})</span>
              <span style={{ color: '#fff' }}>{shipping} BDT</span>
            </div>
            
            {paymentMethod === 'cod' && (
              <>
                <div className="total-row" style={{ color: 'var(--accent-color)' }}>
                  <span>PAID NOW (DELIVERY CHARGE)</span>
                  <span>{amountPaid} BDT</span>
                </div>
                <div className="total-row" style={{ color: '#fbbf24' }}>
                  <span>DUE ON DELIVERY (PRODUCT PRICE)</span>
                  <span>{balanceDue} BDT</span>
                </div>
              </>
            )}
            <div className="total-row grand-total">
              <span>GRAND TOTAL</span>
              <span>{total} BDT</span>
            </div>
          </div>

          <button 
            type="submit"
            form="checkout-main-form"
            className="btn-primary full-width checkout-submit-btn" 
            disabled={cart.length === 0 || isSubmitting}
            style={{ marginTop: '2rem', height: '60px', fontSize: '1rem', letterSpacing: '2px' }}
          >
            {isSubmitting ? 'TRANSMITTING ORDER...' : 'COMPLETE ORDER'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
