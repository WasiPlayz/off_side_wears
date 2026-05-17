import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { db, auth } from '../firebase';
import type { Product, Order } from '../types';
import AdminOrders from '../components/Admin/AdminOrders';
import AdminInventory from '../components/Admin/AdminInventory';
import ProductForm from '../components/Admin/ProductForm';
import PromoCodeManager from '../components/Admin/PromoCodeManager';
import './Admin.css';

const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'coupons'>('orders');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsProcessing(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders: ", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsProcessing(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods = querySnapshot.docs.map(doc => doc.data() as Product);
      prods.sort((a, b) => a.id - b.id);
      setProductsList(prods);
    } catch (error) {
      console.error("Error fetching products: ", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        if (activeTab === 'orders') await fetchOrders();
        if (activeTab === 'inventory') await fetchProducts();
      };
      loadData();
    }
  }, [activeTab, user, fetchOrders, fetchProducts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login failed", error);
      alert('AUTHENTICATION FAILED: INVALID CREDENTIALS');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    setLoading(true);
    try {
      let productId: number;
      if (editingProduct) {
        productId = editingProduct.id;
      } else {
        const highestId = productsList.reduce((max, p) => p.id > max ? p.id : max, 0);
        productId = highestId + 1;
      }

      const finalProduct: Product = {
        id: productId,
        name: productData.name!,
        category: productData.category!,
        price: productData.price!,
        img: productData.img!,
        inStock: productData.inStock,
        images: productData.images,
        availableSizes: productData.availableSizes
      };

      await setDoc(doc(db, 'products', String(productId)), finalProduct);
      
      alert(editingProduct ? "Product updated!" : "Product published!");
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product", error);
      alert("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm(`Delete product ID ${id}?`)) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'products', String(id)));
      fetchProducts();
      alert("Product deleted.");
    } catch (error) {
      console.error("Error deleting product", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="admin-login-container container">
        <div className="loading-screen">INITIALIZING SYSTEM...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-login-container container">
        <div style={{ maxWidth: '400px', width: '100%', background: '#0a0a0a', padding: '3rem', border: '1px solid #1a1a1a', borderRadius: '12px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', color: 'var(--accent-color)', fontSize: '1.2rem', letterSpacing: '3px', fontWeight: 900 }}>ADMIN ACCESS</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 900, letterSpacing: '1px' }}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="ADMIN@OFFSIDE.COM" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="admin-input"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 900, letterSpacing: '1px' }}>SECURITY PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="admin-input"
                required
              />
            </div>
            <button type="submit" className="btn-primary full-width" disabled={isProcessing} style={{ height: '55px' }}>
              {isProcessing ? 'VERIFYING...' : 'INITIATE LOGIN'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <div>
          <h1 className="glitch-text" style={{ fontSize: '2.5rem', margin: 0 }}>COMMAND <span className="highlight">CENTER</span></h1>
          <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 800, marginTop: '0.5rem', letterSpacing: '1px' }}>SYSTEM OPERATIONAL // VERIFIED ACCESS</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: '900', fontSize: '0.7rem', letterSpacing: '1px' }}>LOGOUT</button>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          ORDERS
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          INVENTORY
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          COUPONS
        </button>
      </div>

      <div className="admin-content-area" style={{ animation: 'fadeIn 0.5s ease' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <div className="loading-screen" style={{ height: 'auto' }}>PROCESSING...</div>
          </div>
        ) : (
          <>
            {activeTab === 'orders' && (
              <AdminOrders orders={orders} updateStatus={updateOrderStatus} />
            )}

            {activeTab === 'inventory' && (
              <div>
                <ProductForm 
                  key={editingProduct?.id || 'new'}
                  editingProduct={editingProduct} 
                  onSave={handleSaveProduct} 
                  onCancel={() => setEditingProduct(null)} 
                />                <AdminInventory 
                  products={productsList} 
                  onEdit={handleEditClick} 
                  onDelete={handleDeleteProduct} 
                />
              </div>
            )}

            {activeTab === 'coupons' && (
              <PromoCodeManager products={productsList} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
