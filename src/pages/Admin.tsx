import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { products as localProducts } from '../data/products';
import type { Product, Order } from '../types';
import AdminOrders from '../components/Admin/AdminOrders';
import AdminInventory from '../components/Admin/AdminInventory';
import ProductForm from '../components/Admin/ProductForm';
import './Admin.css';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAdminAuth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods = querySnapshot.docs.map(doc => doc.data() as Product);
      prods.sort((a, b) => a.id - b.id);
      setProductsList(prods);
    } catch (error) {
      console.error("Error fetching products: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'inventory') fetchProducts();
    }
  }, [activeTab, isAuthenticated, fetchOrders, fetchProducts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'offside2026';
    if (password === adminPass) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAdminAuth', 'true');
    } else {
      alert('Incorrect Password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAdminAuth');
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
        images: productData.images
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

  const seedProducts = async () => {
    if (!window.confirm("Seed database with local products? This will overwrite existing IDs.")) return;
    setLoading(true);
    try {
      for (const p of localProducts) {
        await setDoc(doc(db, 'products', String(p.id)), { ...p, inStock: true });
      }
      alert("Database seeded successfully!");
      fetchProducts();
    } catch (error) {
      console.error("Seed error", error);
      alert("Failed to seed database.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container container">
        <div style={{ maxWidth: '400px', margin: '100px auto', background: '#111', padding: '2rem', border: '1px solid #333' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent-color)' }}>ADMIN ACCESS</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="ENTER ADMIN PASSWORD" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '1rem', background: '#222', border: '1px solid #444', color: '#fff', marginBottom: '1rem' }}
              />
            </div>
            <button type="submit" className="btn-primary full-width">ACCESS DASHBOARD</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="glitch-text" style={{ fontSize: '2.5rem', margin: 0 }}>COMMAND <span className="highlight">CENTER</span></h1>
        <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>LOGOUT</button>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`filter-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
          style={{ flex: 1, padding: '1rem', background: activeTab === 'orders' ? 'var(--accent-color)' : '#222', color: '#fff', border: '1px solid #444', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ORDERS
        </button>
        <button 
          className={`filter-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
          style={{ flex: 1, padding: '1rem', background: activeTab === 'inventory' ? 'var(--accent-color)' : '#222', color: '#fff', border: '1px solid #444', cursor: 'pointer', fontWeight: 'bold' }}
        >
          INVENTORY
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', margin: '2rem' }}>PROCESSING...</p>}

      {!loading && activeTab === 'orders' && (
        <AdminOrders orders={orders} updateStatus={updateOrderStatus} />
      )}

      {!loading && activeTab === 'inventory' && (
        <div>
          <ProductForm 
            editingProduct={editingProduct} 
            onSave={handleSaveProduct} 
            onCancel={() => setEditingProduct(null)} 
          />
          <AdminInventory 
            products={productsList} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteProduct} 
            onSeed={seedProducts} 
          />
        </div>
      )}
    </div>
  );
};

export default Admin;
