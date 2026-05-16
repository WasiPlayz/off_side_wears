import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID; // We'll use a specific template for contact
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      alert("Contact form configuration is missing. Please add VITE_EMAILJS_CONTACT_TEMPLATE_ID to Vercel.");
      return;
    }

    setIsSubmitting(true);

    try {
      const templateParams = {
        from_name: name,
        from_email: email,
        message: message
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      alert("MESSAGE TRANSMITTED SUCCESSFULLY. WE WILL RESPOND SHORTLY.");
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error("Failed to send message", error);
      alert("TRANSMISSION FAILED. PLEASE TRY AGAIN OR USE DIRECT EMAIL.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page container">
      <section className="contact-header">
        <h1 className="glitch-text">CONNECT <br /> <span className="highlight">WITH US</span></h1>
        <p>Operational 24/7 in the digital void. Drop a message to our neural network.</p>
      </section>

      <div className="contact-grid">
        <div className="contact-info">
          <div className="info-block">
            <h3>DIRECT LINE</h3>
            <p>+8801893460036</p>
          </div>
          <div className="info-block">
            <h3>EMAIL SUPPORT</h3>
            <p>offsidewears.shop@gmail.com</p>
          </div>
          <div className="info-block">
            <h3>LOCATION</h3>
            <p>Dhaka, Bangladesh</p>
          </div>
        </div>

        <div className="contact-form-container">
          <form className="contact-form" onSubmit={handleSendMessage}>
            <div className="form-group">
              <label>NAME / ALIAS</label>
              <input 
                type="text" 
                placeholder="ENTER IDENTITY" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>COMM CHANNEL (EMAIL)</label>
              <input 
                type="email" 
                placeholder="ADDRESS@DOMAIN.COM" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>MESSAGE</label>
              <textarea 
                rows={5} 
                placeholder="TRANSMIT YOUR THOUGHTS..." 
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT DATA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
