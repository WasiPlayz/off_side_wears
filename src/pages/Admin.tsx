import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, Timestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { products as localProducts } from '../data/products';
import type { Product } from '../types';
import './Admin.css';

interface Order {
  id: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    district: string;
    thana: string;
    address: string;
  };
  paymentInfo: {
    method: string;
    mobileBanking: string;
    transactionId: string;
    screenshotUrl?: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: string;
    quantity: number;
    size: string;
  }>;
  orderSummary: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  status: string;
  createdAt: Timestamp | null;
  trackingNumber?: string;
}

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

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('PLAYER EDITION');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImg, setNewProdImg] = useState('');
  const [newProdImages, setNewProdImages] = useState<string[]>([]); // For multiple images

  const fetchOrders = async () => {
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
  };

  const fetchProducts = async () => {
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
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'inventory') fetchProducts();
    }
  }, [activeTab, isAuthenticated]);

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
    setNewProdName(product.name);
    setNewProdCategory(product.category);
    setNewProdPrice(product.price);
    setNewProdImg(product.img);
    setNewProdImages(product.images && product.images.length > 0 ? product.images : [product.img]);
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdImg('');
    setNewProdImages([]);
  };

  const handleAddImageUrl = () => {
    setNewProdImages([...newProdImages, '']);
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...newProdImages];
    updated[index] = value;
    setNewProdImages(updated);
  };

  const handleRemoveImageUrl = (index: number) => {
    setNewProdImages(newProdImages.filter((_, i) => i !== index));
  };

  const seedProducts = async () => {
    if (!window.confirm("Seed database with local products? This will overwrite existing IDs.")) return;
    setLoading(true);
    try {
      for (const p of localProducts) {
        await setDoc(doc(db, 'products', String(p.id)), p);
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

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let productId: number;
      
      if (editingProduct) {
        productId = editingProduct.id;
      } else {
        const highestId = productsList.reduce((max, p) => p.id > max ? p.id : max, 0);
        productId = highestId + 1;
      }

      const filteredImages = newProdImages.filter(img => img.trim() !== '');

      const productData: Product = {
        id: productId,
        name: newProdName,
        category: newProdCategory,
        price: newProdPrice,
        img: newProdImg,
        images: filteredImages.length > 0 ? filteredImages : [newProdImg]
      };

      await setDoc(doc(db, 'products', String(productId)), productData);
      
      alert(editingProduct ? "Product updated!" : "Product published!");
      handleCancelEdit();
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

  const updateStatus = async (orderId: string, newStatus: string) => {
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
            <button type="submit" className="btn-primary full-width">ACCESS ARCHIVE</button>
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
        <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map(order => (
            <div key={order.id} className="order-card" style={{ background: '#111', border: '1px solid #333', padding: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: 'var(--white)' }}>ORDER ID: <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>{order.id}</span></h3>
                  {order.trackingNumber && <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.2rem' }}>TRACKING: <span style={{ color: 'var(--white)' }}>#OFF-{order.trackingNumber}</span></p>}
                  <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.2rem' }}>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Recent'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 'bold', padding: '0.5rem 1rem', background: '#222', border: `1px solid ${order.status === 'completed' ? '#4ade80' : 'var(--accent-color)'}` }}>
                    {order.status.toUpperCase()}
                  </span>
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    style={{ background: '#000', color: '#fff', padding: '0.5rem', border: '1px solid #444' }}
                  >
                    <option value="pending">PENDING</option>
                    <option value="processing">PROCESSING</option>
                    <option value="shipped">SHIPPED</option>
                    <option value="completed">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>CUSTOMER DETAILS</h4>
                  <p><strong>Name:</strong> {order.customerInfo.fullName}</p>
                  <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
                  <p><strong>Email:</strong> {order.customerInfo.email}</p>
                  <p><strong>Address:</strong> {order.customerInfo.address}, {order.customerInfo.thana}, {order.customerInfo.district}</p>
                </div>

                <div>
                  <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>PAYMENT DETAILS</h4>
                  <p><strong>Method:</strong> {order.paymentInfo.method.toUpperCase()}</p>
                  {order.paymentInfo.mobileBanking && (
                    <>
                      <p><strong>Banking:</strong> {order.paymentInfo.mobileBanking.toUpperCase()}</p>
                      <p><strong>TrxID:</strong> <span style={{ color: 'var(--accent-color)' }}>{order.paymentInfo.transactionId}</span></p>
                    </>
                  )}
                  {order.paymentInfo.screenshotUrl && (
                    <a href={order.paymentInfo.screenshotUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'var(--accent-color)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      VIEW SCREENSHOT
                    </a>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                <h4 style={{ color: '#888', marginBottom: '1rem' }}>ORDER ITEMS</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#000', padding: '0.8rem', marginBottom: '0.5rem', borderLeft: '3px solid var(--accent-color)' }}>
                    <span>{item.name} (Size: {item.size}) x {item.quantity}</span>
                    <span>{(parseFloat(item.price) * item.quantity)} BDT</span>
                  </div>
                ))}
                <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  TOTAL: <span style={{ color: 'var(--accent-color)' }}>{order.orderSummary.total} BDT</span>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#111', color: '#888' }}>
              NO ORDERS FOUND IN THE ARCHIVE
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'inventory' && (
        <div>
          <div style={{ background: '#111', padding: '1.5rem', border: '1px solid #333', marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>
              {editingProduct ? `EDIT PRODUCT (ID: ${editingProduct.id})` : 'ADD NEW PRODUCT'}
            </h3>
            <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '0.7rem', color: '#888' }}>PRODUCT NAME</label>
                <input type="text" placeholder="Product Name" value={newProdName} onChange={e=>setNewProdName(e.target.value)} required style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '0.7rem', color: '#888' }}>CATEGORY</label>
                <select value={newProdCategory} onChange={e=>setNewProdCategory(e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff' }}>
                  <option value="PLAYER EDITION">PLAYER EDITION</option>
                  <option value="FAN EDITION">FAN EDITION</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '0.7rem', color: '#888' }}>PRICE (BDT)</label>
                <input type="number" placeholder="Price (BDT)" value={newProdPrice} onChange={e=>setNewProdPrice(e.target.value)} required style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '0.7rem', color: '#888' }}>MAIN THUMBNAIL URL</label>
                <input type="text" placeholder="Thumbnail Image URL" value={newProdImg} onChange={e=>setNewProdImg(e.target.value)} required style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff' }} />
              </div>

              <div style={{ gridColumn: 'span 2', background: '#000', padding: '1rem', border: '1px solid #222' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.8rem' }}>ADDITIONAL GALLERY IMAGES</h4>
                  <button type="button" onClick={handleAddImageUrl} style={{ padding: '0.3rem 0.8rem', background: 'var(--accent-color)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>+ ADD URL</button>
                </div>
                {newProdImages.map((url, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder={`Gallery Image #${idx + 1} URL`} 
                      value={url} 
                      onChange={(e) => handleImageUrlChange(idx, e.target.value)} 
                      style={{ flex: 1, padding: '0.6rem', background: '#111', border: '1px solid #333', color: '#fff', fontSize: '0.8rem' }} 
                    />
                    <button type="button" onClick={() => handleRemoveImageUrl(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0 0.8rem', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  {editingProduct ? 'UPDATE CHANGES' : 'PUBLISH PRODUCT'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={handleCancelEdit} style={{ flex: 1, background: '#333', color: '#fff', border: '1px solid #444', cursor: 'pointer' }}>
                    CANCEL
                  </button>
                )}
              </div>
            </form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>CURRENT INVENTORY ({productsList.length})</h3>
            <button onClick={seedProducts} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#888', border: '1px solid #444', cursor: 'pointer' }}>
              Seed Initial Data (Dev Only)
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {productsList.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '1rem', border: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={p.img} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <h4 style={{ margin: 0, color: '#fff' }}>{p.name}</h4>
                    <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>ID: {p.id} | {p.category} | {p.price} BDT | {p.images?.length || 1} images</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEditClick(p)} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: '1px solid #444', cursor: 'pointer' }}>
                    EDIT
                  </button>
                  <button onClick={() => handleDeleteProduct(p.id)} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', cursor: 'pointer' }}>
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;