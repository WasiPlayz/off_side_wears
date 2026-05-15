import React from 'react';
import { useNavigate } from 'react-router-dom';
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
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onRemove }) => {
  const navigate = useNavigate();
  const total = items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  const handleGoShopping = () => {
    navigate('/shop');
    onClose();
  };

  const handleCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`cart-drawer ${isOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h2>YOUR CART</h2>
          <button className="close-cart" onClick={onClose}>CLOSE</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>THE CART IS EMPTY.</p>
              <button className="btn-primary" onClick={handleGoShopping}>GO SHOPPING</button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="cart-item">
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
            <button className="btn-primary full-width" onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
