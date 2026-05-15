import React from 'react';

interface SuccessProps {
  onReturn: () => void;
  trackingNumber: string;
}

const Success: React.FC<SuccessProps> = ({ onReturn, trackingNumber }) => {
  return (
    <div className="container" style={{ 
      padding: '4rem 1rem', 
      textAlign: 'center',
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ 
        width: '80px', 
        height: '80px', 
        borderRadius: '50%', 
        border: '4px solid var(--accent-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        marginBottom: '2rem',
        color: 'var(--accent-color)',
        animation: 'pulse 2s infinite'
      }}>
        ✓
      </div>
      <h1 className="glitch-text" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', marginBottom: '1rem', lineHeight: 1.1 }}>
        ORDER <br /> <span className="highlight">CONFIRMED</span>
      </h1>
      <p style={{ 
        color: 'var(--text-color)', 
        opacity: 0.7, 
        fontWeight: 600, 
        marginBottom: '3rem', 
        maxWidth: '500px',
        fontSize: '0.9rem',
        lineHeight: 1.6
      }}>
        YOUR DATA HAS BEEN TRANSMITTED THROUGH OUR SECURE PROTOCOLS. 
        THE ARCHIVE IS PREPARING YOUR ELITE KITS FOR DEPLOYMENT. 
        EXPECT ARRIVAL AT YOUR COORDINATES WITHIN 2-3 BUSINESS DAYS.
      </p>
      
      <div style={{ 
        background: 'var(--dark-grey)', 
        padding: '2rem', 
        border: '1px solid #222',
        marginBottom: '3rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h4 style={{ color: 'var(--accent-color)', marginBottom: '1rem', letterSpacing: '2px' }}>LOGISTICS INTEL</h4>
        <p style={{ fontSize: '0.8rem', color: '#888' }}>TRACKING NUMBER: #OFF-{trackingNumber}</p>
      </div>

      <button className="btn-primary" onClick={onReturn}>RETURN TO ARCHIVE</button>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
    </div>
  );
};

export default Success;
