import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();
  
  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  const handleGoShopping = () => {
    navigate('/shop');
    setIsCartOpen(false);
  };

  const handleCheckout = () => {
    navigate('/checkout');
    setIsCartOpen(false);
  };

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-drawer ${isCartOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h2>YOUR CART</h2>
          <button className="close-cart" onClick={() => setIsCartOpen(false)}>CLOSE</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>THE CART IS EMPTY.</p>
              <button className="btn-primary" onClick={handleGoShopping}>GO SHOPPING</button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${item.size}-${idx}`} className="cart-item">
                <img src={item.img} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-meta">SIZE: {item.size || 'N/A'}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.size, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.size, 1)}>+</button>
                  </div>
                  <p className="item-price">{item.price} BDT x {item.quantity}</p>
                  <button className="remove-item" onClick={() => removeFromCart(item.id, item.size)}>REMOVE</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
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
