import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { Product, Review, Order } from '../types';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';

interface ProductDetailsProps {
  products: Product[];
  isLoading?: boolean;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ products, isLoading }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImg, setActiveImg] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTracking, setReviewTracking] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setLoadingReviews(true);
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', parseInt(id)),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  }, [id]);

  useEffect(() => {
    const loadProduct = () => {
      if (!isLoading && id && products.length > 0) {
        const foundProduct = products.find(p => p.id === parseInt(id));
        if (foundProduct) {
          setProduct(foundProduct);
          setActiveImg(foundProduct.images?.[0] || foundProduct.img);
          fetchReviews();
        } else {
          // If loading is done and we STILL can't find it, go to shop
          navigate('/shop');
        }
      }
    };
    loadProduct();
  }, [id, products, navigate, fetchReviews, isLoading]);

  if (isLoading || !product) {
    return (
      <div className="container" style={{ padding: '150px 0', textAlign: 'center' }}>
        <div className="loading-screen" style={{ height: 'auto' }}>SYNCYNG ELITE WEARS...</div>
      </div>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out the ${product.name} at OFF_SIDE WEARS!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('LINK COPIED TO CLIPBOARD');
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const isPlayerEdition = product.category.toUpperCase().includes('PLAYER');
  const sizes = ['M', 'L', 'XL', 'XXL'];
  const gallery = (product.images && product.images.length > 0) ? product.images : [product.img || '/offside_wears.jpeg'];
  const isInStock = product.inStock !== false;

  const isSizeAvailable = (size: string) => {
    if (!product.availableSizes) return true;
    return product.availableSizes.includes(size);
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = gallery.indexOf(activeImg);
    const nextIndex = (currentIndex + 1) % gallery.length;
    setActiveImg(gallery[nextIndex]);
  };

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = gallery.indexOf(activeImg);
    const prevIndex = (currentIndex - 1 + gallery.length) % gallery.length;
    setActiveImg(gallery[prevIndex]);
  };

  const handleAddToCart = () => {
    if (!isInStock) return;
    if (!selectedSize) {
      alert('Please select a size first.');
      return;
    }
    addToCart(product, selectedSize);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewText || !reviewTracking) {
      alert("Please fill in all fields.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const cleanTracking = reviewTracking.replace('#OFF-', '').trim();
      const q = query(
        collection(db, 'orders'),
        where('trackingNumber', '==', cleanTracking),
        where('status', '==', 'completed')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Invalid Tracking Number or Order not yet completed. Only completed orders can be reviewed.");
        setIsSubmittingReview(false);
        return;
      }

      const orderData = querySnapshot.docs[0].data() as Order;
      const productInOrder = orderData.items.some((item: { id: number }) => item.id === product.id);

      if (!productInOrder) {
        alert("This product was not found in the order provided.");
        setIsSubmittingReview(false);
        return;
      }

      await addDoc(collection(db, 'reviews'), {
        productId: product.id,
        userName: reviewName,
        comment: reviewText,
        rating: reviewRating,
        trackingNumber: cleanTracking,
        createdAt: serverTimestamp()
      });

      alert("Review posted successfully!");
      setReviewName('');
      setReviewText('');
      setReviewTracking('');
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      console.error("Error posting review:", error);
      alert("System Error: Unable to post review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="product-details-page container">
      <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>
      
      <div className="details-grid">
        <div className="details-left">
          <div className="details-gallery">
            <div className="main-image-container">
              {gallery.length > 1 && (
                <>
                  <button className="slider-arrow prev" onClick={handlePrevImg}>←</button>
                  <button className="slider-arrow next" onClick={handleNextImg}>→</button>
                </>
              )}
              <div className="main-image-viewport" onClick={() => setIsZoomed(true)} style={{ background: '#111' }}>
                <img 
                  src={activeImg || '/offside_wears.jpeg'} 
                  alt={product.name} 
                  className="main-image" 
                  fetchPriority="high"
                  style={{ transition: 'opacity 0.4s ease-in-out' }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '1';
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/offside_wears.jpeg';
                  }}
                />
              </div>
              <div className="zoom-hint">CLICK TO ZOOM</div>
              {gallery.length > 1 && (
                <div className="slider-dots">
                  {gallery.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`dot ${gallery.indexOf(activeImg) === idx ? 'active' : ''}`}
                      onClick={() => setActiveImg(gallery[idx])}
                    ></div>
                  ))}
                </div>
              )}
            </div>
            <div className="thumbnail-bar">
              {gallery.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail ${activeImg === img ? 'active' : ''}`}
                  onClick={() => setActiveImg(img)}
                >
                  <img 
                    src={img || '/offside_wears.jpeg'} 
                    alt={`${product.name} view ${idx + 1}`} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/offside_wears.jpeg';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="product-description desktop-only">
            <h3>TECHNICAL SPECIFICATIONS</h3>
            {isPlayerEdition ? (
              <ul>
                <li><strong>Elite 1:1 Grade:</strong> Identical to what the pros wear on the pitch.</li>
                <li><strong>Advanced Breathability:</strong> Micro-perforated fabric for superior airflow and cooling.</li>
                <li><strong>Heat-Pressed Technology:</strong> Ultra-lightweight, 3D silicone heat-applied logos and crests.</li>
                <li><strong>Athletic Aero-Fit:</strong> Slim-cut construction designed for high-performance aerodynamic movement.</li>
                <li><strong>Moisture Management:</strong> High-performance recycled polyester with sweat-wicking properties.</li>
                <li><strong>Authenticity Detail:</strong> Authentic metallic 1:1 serial code tag at the bottom hem.</li>
              </ul>
            ) : (
              <ul>
                <li><strong>Stadium Comfort Version:</strong> Inspired by the pros, tailored for the dedicated supporter.</li>
                <li><strong>Classic Embroidery:</strong> High-density stitched logos for a timeless, premium look and durability.</li>
                <li><strong>Standard Fit:</strong> Relaxed, comfortable cut perfect for daily wear and street styling.</li>
                <li><strong>Premium Poly-Fabric:</strong> Soft-touch breathable material designed for all-day comfort.</li>
                <li><strong>Ventilation Tech:</strong> Integrated fabric patterns for optimal heat regulation.</li>
                <li><strong>Durable Craftsmanship:</strong> Reinforced stitching to withstand the passion of the crowd.</li>
              </ul>
            )}
          </div>
        </div>
        
        <div className="details-info">
          <div className="info-header">
            <span className="product-cat">{product.category}</span>
            <h1 className="glitch-text">{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <p className="price-tag">{product.price} BDT</p>
                <span style={{ 
                  padding: '0.2rem 0.6rem', 
                  fontSize: '0.7rem', 
                  fontWeight: 900, 
                  letterSpacing: '1px',
                  background: isInStock ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: isInStock ? '#4ade80' : '#ef4444',
                  border: `1px solid ${isInStock ? '#4ade80' : '#ef4444'}`
                }}>
                  {isInStock ? 'IN STOCK' : 'OUT OF STOCK'}
                </span>
              </div>
              <button 
                onClick={handleShare}
                className="btn-secondary mini"
                style={{ 
                  padding: '0.6rem 1rem', 
                  fontSize: '0.65rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  letterSpacing: '2px',
                  background: 'rgba(255,255,255,0.03)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                SHARE
              </button>
            </div>
          </div>
          
          <div className="size-selection" style={{ opacity: isInStock ? 1 : 0.5, pointerEvents: isInStock ? 'auto' : 'none' }}>
            <h3>SELECT SIZE</h3>
            <div className="size-bar">
              {sizes.map(size => {
                const available = isSizeAvailable(size);
                return (
                  <button 
                    key={size} 
                    className={`size-btn ${selectedSize === size ? 'active' : ''} ${!available ? 'out-of-stock' : ''}`}
                    onClick={() => available && setSelectedSize(size)}
                    disabled={!isInStock || !available}
                    style={{
                      position: 'relative',
                      opacity: available ? 1 : 0.4,
                      cursor: available ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {size}
                    {!available && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                        width: '100%',
                        height: '2px',
                        background: '#ef4444'
                      }}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            className="btn-primary full-width" 
            onClick={handleAddToCart} 
            disabled={!isInStock || !!(selectedSize && !isSizeAvailable(selectedSize))}
            style={{ 
              background: isInStock ? 'var(--accent-color)' : '#333',
              cursor: isInStock ? 'pointer' : 'not-allowed',
              opacity: isInStock ? 1 : 0.7
            }}
          >
            {isInStock ? 'ADD TO CART' : 'CURRENTLY UNAVAILABLE'}
          </button>

          <div className="size-chart-section">
            <h3>INTERNATIONAL SIZE CHART (INCHES)</h3>
            <div className="chart-text">
              <div className="chart-row header">
                <span>SIZE</span>
                <span>HEIGHT</span>
                <span>CHEST</span>
              </div>
              <div className="chart-row">
                <span>M</span>
                <span>27</span>
                <span>38</span>
              </div>
              <div className="chart-row">
                <span>L</span>
                <span>28</span>
                <span>40</span>
              </div>
              <div className="chart-row">
                <span>XL</span>
                <span>29</span>
                <span>42</span>
              </div>
              <div className="chart-row">
                <span>XXL</span>
                <span>30</span>
                <span>44</span>
              </div>
              <p className="note">*{isPlayerEdition ? 'Player Edition features a slim athletic fit. Size up for comfort.' : 'Fan Edition features a standard relaxed fit. Order your normal size.'}</p>
            </div>
          </div>

          <div className="product-description mobile-only">
            <h3>TECHNICAL SPECIFICATIONS</h3>
            {isPlayerEdition ? (
              <ul>
                <li>Elite 1:1 Grade Pitch Version</li>
                <li>Micro-perforated Breathable Fabric</li>
                <li>Heat-Applied Silicone Crests</li>
                <li>Athletic Aero-Fit Construction</li>
                <li>Authentic Metallic Hem Tag</li>
              </ul>
            ) : (
              <ul>
                <li>Stadium Version (Classic Comfort)</li>
                <li>Premium High-Density Embroidery</li>
                <li>Standard Relaxed Supporter Fit</li>
                <li>Soft-Touch Poly-Fabric</li>
                <li>Durable Lifestyle Craftsmanship</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section" style={{ marginTop: '5rem', borderTop: '1px solid #222', paddingTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h2 className="glitch-text" style={{ fontSize: '2rem' }}>VERIFIED <span className="highlight">REVIEWS</span></h2>
          <button className="btn-secondary mini" onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? 'CANCEL' : 'LEAVE A REVIEW'}
          </button>
        </div>

        {showReviewForm && (
          <div className="review-form-container" style={{ background: '#111', padding: '2rem', border: '1px solid #333', marginBottom: '4rem', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>PRODUCT REVIEW</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888' }}>NAME</label>
                <input 
                  type="text" 
                  placeholder="YOUR NAME" 
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  style={{ width: '100%', padding: '1rem', background: '#000', border: '1px solid #333', color: '#fff' }}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888' }}>TRACKING NUMBER (VERIFICATION)</label>
                <input 
                  type="text" 
                  placeholder="#OFF-123456" 
                  value={reviewTracking}
                  onChange={e => setReviewTracking(e.target.value)}
                  style={{ width: '100%', padding: '1rem', background: '#000', border: '1px solid #333', color: '#fff' }}
                  required
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--accent-color)', marginTop: '0.5rem' }}>Only completed orders can leave reviews.</p>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888' }}>RATING</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button 
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      style={{ 
                        flex: 1, 
                        padding: '0.5rem', 
                        background: reviewRating >= num ? 'var(--accent-color)' : '#222',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {num} ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888' }}>YOUR THOUGHTS</label>
                <textarea 
                  rows={4}
                  placeholder="HOW DOES IT FEEL?" 
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  style={{ width: '100%', padding: '1rem', background: '#000', border: '1px solid #333', color: '#fff', resize: 'none' }}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn-primary full-width" disabled={isSubmittingReview}>
                {isSubmittingReview ? 'TRANSMITTING...' : 'POST REVIEW'}
              </button>
            </form>
          </div>
        )}

        <div className="reviews-list" style={{ display: 'grid', gap: '2rem' }}>
          {loadingReviews ? (
            <p>SYNCING REVIEWS...</p>
          ) : reviews.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>NO REVIEWS FOR THIS PRODUCT YET. BE THE FIRST TO DROP ONE.</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="review-card" style={{ borderLeft: '3px solid var(--accent-color)', paddingLeft: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #111' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, letterSpacing: '1px' }}>{review.userName.toUpperCase()}</h4>
                  <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem' }}>{review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Recent'}</p>
                <p style={{ color: '#ccc', lineHeight: '1.6' }}>{review.comment}</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>VERIFIED PURCHASE</div>
              </div>
            ))
          )}
        </div>
      </section>

      {isZoomed && (
        <div className="zoom-overlay" onClick={() => setIsZoomed(false)}>
          <div className="zoom-modal">
            <img 
              src={activeImg || '/offside_wears.jpeg'} 
              alt={product.name} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/offside_wears.jpeg';
              }}
            />
            <button className="close-zoom">CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
