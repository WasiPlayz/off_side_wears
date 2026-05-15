import React from 'react';
import './Cart.css';

interface CartItem {
  id: number;
  name: string;
  price: string;
  img: string;
  quantity: number;
  size?: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: number) => void;
  onNavigate: (page: string) => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onRemove, onNavigate }) => {
  const total = items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  const handleGoShopping = () => {
    onNavigate('shop');
    onClose();
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`cart-drawer ${isOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h2>YOUR ARCHIVE</h2>
          <button className="close-cart" onClick={onClose}>CLOSE</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>THE ARCHIVE IS EMPTY.</p>
              <button className="btn-primary" onClick={handleGoShopping}>GO SHOPPING</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.img} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-meta">SIZE: {item.size || 'N/A'}</p>
                  <p className="item-price">{item.price} BDT x {item.quantity}</p>
                  <button className="remove-item" onClick={() => onRemove(item.id)}>REMOVE</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>TOTAL</span>
              <span>{total} BDT</span>
            </div>
            <button className="btn-primary full-width" onClick={() => { onNavigate('checkout'); onClose(); }}>PROCEED TO CHECKOUT</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
