import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { db } from '../firebase';
import { districts, thanas } from '../data/bd-data';
import './Checkout.css';

interface CartItem {
  id: number;
  name: string;
  price: string;
  img: string;
  quantity: number;
  size?: string;
}

interface CheckoutProps {
  items: CartItem[];
  onComplete: (trackingNumber: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items, onComplete }) => {
  const navigate = useNavigate();
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

  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
  const shipping = district.toLowerCase() === 'dhaka' ? 60 : 120;
  const total = subtotal + shipping;

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
          screenshotUrl
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || 'N/A'
        })),
        orderSummary: {
          subtotal,
          shipping,
          total
        },
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (serviceId && templateId && publicKey) {
          const itemsHtml = items.map(item => {
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
            order_id: generatedTrackingNumber,
            shipping_cost: shipping,
            tax_cost: 0,
            total_cost: total,
            order_items_html: itemsHtml,
            website_link: window.location.origin
          };

          await emailjs.send(serviceId, templateId, emailParams, publicKey);
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email", emailError);
      }

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
      <h1 className="glitch-text">CHECKOUT <br /><span className="highlight">PROTOCOL</span></h1>
      
      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleCompleteOrder}>
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
                style={{ flex: 1, padding: '1rem', background: paymentMethod === 'cod' ? 'var(--accent-color)' : '#222', color: '#fff', border: '1px solid #444', cursor: 'pointer', fontWeight: 'bold' }}
              >
                CASH ON DELIVERY
              </button>
              <button 
                type="button"
                className={`filter-btn ${paymentMethod === 'online' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('online')}
                style={{ flex: 1, padding: '1rem', background: paymentMethod === 'online' ? 'var(--accent-color)' : '#222', color: '#fff', border: '1px solid #444', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ONLINE PAYMENT
              </button>
            </div>

            {paymentMethod && (
              <div className="manual-payment-flow" style={{ background: '#111', padding: '1.5rem', border: '1px solid #333' }}>
                {paymentMethod === 'cod' && (
                  <p style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>
                    You must pay the delivery charge first
                  </p>
                )}
                {paymentMethod === 'online' && (
                  <p style={{ color: 'var(--accent-color)', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>
                    Pay {total} BDT
                  </p>
                )}
                
                <h4 style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#888' }}>SELECT MOBILE BANKING</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {['bKash', 'Nagad', 'Rocket'].map(method => {
                    const methodKey = method.toLowerCase() as 'bkash' | 'nagad' | 'rocket';
                    return (
                      <button 
                        type="button"
                        key={methodKey}
                        onClick={() => setMobileBanking(methodKey)}
                        style={{ 
                          flex: 1, 
                          padding: '0.8rem', 
                          background: mobileBanking === methodKey ? 'var(--accent-color)' : '#222',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}
                      >
                        {method}
                      </button>
                    )
                  })}
                </div>

                {mobileBanking && (
                  <div className="payment-details">
                    <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center', background: '#000', padding: '1rem', border: '1px dashed var(--accent-color)' }}>
                      Send Money : <strong style={{ color: 'var(--accent-color)', letterSpacing: '2px' }}>{mobileBanking === 'rocket' ? '016094765878' : '01609476587'}</strong>
                    </p>

                    <div className="form-group">
                      <label>TRANSACTION ID</label>
                      <input 
                        type="text" 
                        placeholder="ENTER TRANSACTION ID" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        style={{ borderColor: '#444' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>SCREENSHOT OF TRANSACTION</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setScreenshot(e.target.files ? e.target.files[0] : null)}
                        style={{ 
                          background: '#222', 
                          padding: '0.8rem', 
                          color: '#fff', 
                          border: '1px solid #444', 
                          width: '100%',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="btn-primary full-width" 
            disabled={items.length === 0 || isSubmitting}
            style={{ marginTop: '1rem' }}
          >
            {isSubmitting ? 'PROCESSING...' : 'COMPLETE ORDER'}
          </button>
        </form>

        <div className="order-summary">
          <h3>ORDER SUMMARY</h3>
          <div className="summary-items">
            {items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="summary-item">
                <div className="summary-item-info">
                  <span className="summary-name">{item.name}</span>
                  <span className="summary-meta">SIZE: {item.size || 'N/A'} x{item.quantity}</span>
                </div>
                <span className="summary-price">{(parseFloat(item.price) * item.quantity)} BDT</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <div className="total-row">
              <span>SUBTOTAL</span>
              <span>{subtotal} BDT</span>
            </div>
            <div className="total-row">
              <span>SHIPPING ({district || 'NOT SELECTED'})</span>
              <span>{shipping} BDT</span>
            </div>
            <div className="total-row grand-total">
              <span>TOTAL</span>
              <span>{total} BDT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
