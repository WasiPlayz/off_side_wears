import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer/Footer';
import Cart from './components/Cart/Cart';
import ScrollToTop from './components/ScrollToTop';
import ProductCard from './components/ProductCard/ProductCard';
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

const App: React.FC = () => {
  const [lastOrderTracking, setLastOrderTracking] = useState('');
  const [globalProducts, setGlobalProducts] = useState<Product[]>(localProducts);

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

  return (
    <Router>
      <ScrollToTop />
      <Navbar />
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
            <Route path="/product/:id" element={<ProductDetails products={globalProducts} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout onComplete={(track) => setLastOrderTracking(track)} />} />
            <Route path="/success" element={<Success trackingNumber={lastOrderTracking} />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Cart />
    </Router>
  );
};

export default App;
