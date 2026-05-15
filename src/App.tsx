import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer/Footer';
import Cart from './components/Cart/Cart';
import ScrollToTop from './components/ScrollToTop';
import { products as localProducts } from './data/products';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './types';
import './styles/index.css';

// Lazy load pages for performance
const Hero = lazy(() => import('./components/Hero/Hero'));
const About = lazy(() => import('./pages/About'));
const Shop = lazy(() => import('./pages/Shop'));
const Contact = lazy(() => import('./pages/Contact'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Success = lazy(() => import('./pages/Success'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Admin = lazy(() => import('./pages/Admin'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));

interface CartItem {
  id: number;
  name: string;
  price: string;
  img: string;
  quantity: number;
  size?: string;
}

const App: React.FC = () => {
  const [lastOrderTracking, setLastOrderTracking] = useState('');
  const [globalProducts, setGlobalProducts] = useState<Product[]>(localProducts);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('offSideWearsCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        if (!querySnapshot.empty) {
          const fetchedProducts = querySnapshot.docs.map(doc => ({
            ...doc.data()
          } as Product));
          fetchedProducts.sort((a, b) => a.id - b.id);
          setGlobalProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('offSideWearsCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, size?: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        return prevCart.map(item =>
          (item.id === product.id && item.size === size) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, size }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Router>
      <ScrollToTop />
      <Navbar cartCount={cartCount} onToggleCart={() => setIsCartOpen(true)} />
      <main>
        <Suspense fallback={<div className="loading-screen">LOADING...</div>}>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <section className="featured container">
                  <h2 style={{ marginBottom: '3rem' }}>FEATURED <span className="highlight">DROPS</span></h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '2rem' 
                  }}>
                    {globalProducts.slice(0, 3).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              </>
            } />
            <Route path="/shop" element={<Shop products={globalProducts} />} />
            <Route path="/product/:id" element={<ProductDetails products={globalProducts} onAddToCart={addToCart} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout items={cart} onComplete={(track) => setLastOrderTracking(track)} />} />
            <Route path="/success" element={<Success trackingNumber={lastOrderTracking} />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={removeFromCart} 
      />
    </Router>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const isInStock = product.inStock !== false;
  return (
    <div className="product-card-home" onClick={() => navigate(`/product/${product.id}`)} style={{ 
      background: '#111', 
      height: '450px', 
      border: '1px solid var(--dark-grey)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    }}>
      <img 
        src={product.img} 
        alt={product.name} 
        loading="lazy"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isInStock ? '0.8' : '0.4',
          transition: 'opacity 0.5s ease',
          backgroundColor: '#1a1a1a' 
        }} 
      />
      {!isInStock && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          padding: '0.5rem 1rem',
          fontWeight: 900,
          fontSize: '0.8rem',
          letterSpacing: '2px',
          zIndex: 2,
          border: '1px solid #fff'
        }}>
          OUT OF STOCK
        </div>
      )}
      <div className="home-product-overlay">
        <button className="btn-primary mini">{isInStock ? 'VIEW DETAILS' : 'RESTOCKING SOON'}</button>
      </div>
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        padding: '1.5rem',
        background: 'linear-gradient(0deg, rgba(10,5,24,1) 0%, rgba(10,5,24,0) 100%)'
      }}>
        <div style={{ position: 'absolute', top: '-120%', right: '1rem', background: 'var(--accent-color)', color: '#fff', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 900 }}>NEW</div>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--white)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{product.name}</h3>
        <p style={{ color: 'var(--accent-color)', fontWeight: 800 }}>{product.price} BDT</p>
      </div>
    </div>
  );
};

export default App;
