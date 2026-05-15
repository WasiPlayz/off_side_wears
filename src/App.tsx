import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer/Footer';
import Hero from './components/Hero/Hero';
import About from './pages/About';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import ProductDetails from './pages/ProductDetails';
import Admin from './pages/Admin';
import TrackOrder from './pages/TrackOrder';
import Cart from './components/Cart/Cart';
import { products as localProducts } from './data/products';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './types';
import './styles/index.css';

interface CartItem {
  id: number;
  name: string;
  price: string;
  img: string;
  quantity: number;
  size?: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastOrderTracking, setLastOrderTracking] = useState('');
  const [globalProducts, setGlobalProducts] = useState<Product[]>(localProducts);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('offSideWearsCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        if (!querySnapshot.empty) {
          const fetchedProducts = querySnapshot.docs.map(doc => ({
            ...doc.data()
          } as Product));
          // Sort by ID to maintain order
          fetchedProducts.sort((a, b) => a.id - b.id);
          setGlobalProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };
    fetchProducts();
  }, []);

  React.useEffect(() => {
    localStorage.setItem('offSideWearsCart', JSON.stringify(cart));
  }, [cart]);

  const navigate = (page: string, product?: Product) => {
    if (product) setSelectedProduct(product);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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

  const completeCheckout = (trackingNumber: string) => {
    setLastOrderTracking(trackingNumber);
    navigate('success');
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return (
          <>
            <Hero onNavigate={navigate} />
            <section className="featured container">
              <h2 style={{ marginBottom: '3rem' }}>FEATURED <span className="highlight">DROPS</span></h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '2rem' 
              }}>
                {globalProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="product-card-home" onClick={() => navigate('product-details', product)} style={{ 
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
                        opacity: '0.8',
                        transition: 'opacity 0.5s ease',
                        backgroundColor: '#1a1a1a' 
                      }} 
                    />
                    <div className="home-product-overlay">
                      <button className="btn-primary mini">VIEW DETAILS</button>
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
                ))}
              </div>
            </section>
          </>
        );
      case 'about':
        return <About />;
      case 'shop':
        return <Shop products={globalProducts} onProductClick={(p: Product) => navigate('product-details', p)} />;
      case 'product-details':
        return <ProductDetails product={selectedProduct!} onAddToCart={addToCart} onBack={() => navigate('shop')} />;
      case 'contact':
        return <Contact />;
      case 'checkout':
        return <Checkout items={cart} onComplete={completeCheckout} />;
      case 'success':
        return <Success onReturn={() => navigate('home')} trackingNumber={lastOrderTracking} />;
      case 'admin':
        return <Admin />;
      case 'track':
        return <TrackOrder />;
      default:
        return <Hero onNavigate={navigate} />;
    }
  };

  return (
    <>
      <Navbar onNavigate={navigate} cartCount={cartCount} onToggleCart={() => setIsCartOpen(true)} />
      <main>
        {renderPage()}
      </main>
      <Footer onNavigate={navigate} />
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={removeFromCart} 
        onNavigate={navigate}
      />
    </>
  );
};

export default App;
