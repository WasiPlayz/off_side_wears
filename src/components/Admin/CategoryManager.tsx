import React, { useState } from 'react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import type { CategoryItem } from '../../types';

interface CategoryManagerProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onRefresh }) => {
  const [newCatName, setNewCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast('CATEGORY ALREADY EXISTS', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const docId = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;
      await setDoc(doc(db, 'categories', docId), {
        name: trimmed,
        createdAt: serverTimestamp()
      });
      showToast(`CATEGORY "${trimmed.toUpperCase()}" ADDED`, 'success');
      setNewCatName('');
      onRefresh();
    } catch (error: any) {
      console.error('Error adding category:', error);
      showToast(`FAILED TO ADD CATEGORY: ${error?.message || 'UNKNOWN ERROR'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!window.confirm(`Delete category "${cat.name}"? Existing products under this category will remain.`)) return;

    try {
      await deleteDoc(doc(db, 'categories', cat.id));
      showToast(`CATEGORY "${cat.name.toUpperCase()}" DELETED`, 'success');
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      showToast(`FAILED TO DELETE CATEGORY: ${error?.message || 'UNKNOWN ERROR'}`, 'error');
    }
  };

  return (
    <div style={{ background: '#0a0a0a', padding: '2rem', border: '1px solid #1a1a1a', borderRadius: '12px', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ color: 'var(--accent-color)', margin: 0, fontSize: '1rem', letterSpacing: '2px' }}>
            PRODUCT CATEGORY MANAGER
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.3rem 0 0 0', fontWeight: 800 }}>
            CREATE AND MANAGE CUSTOM STORE CATEGORIES
          </p>
        </div>
      </div>

      <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="NEW CATEGORY NAME (e.g. T-Shirts, Trousers, Outerwear)"
          value={newCatName}
          onChange={e => setNewCatName(e.target.value)}
          className="admin-input"
          style={{ flex: 1, minWidth: '250px' }}
          required
        />
        <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '0 2rem', height: '48px', whiteSpace: 'nowrap' }}>
          {isSubmitting ? 'SAVING...' : '+ ADD CATEGORY'}
        </button>
      </form>

      <h4 style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px', marginBottom: '1rem' }}>
        ACTIVE STORE CATEGORIES ({categories.length})
      </h4>

      {categories.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>No categories created yet. Add one above.</p>
      ) : (
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                background: '#111',
                border: '1px solid #222',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '1px'
              }}
            >
              <span>{cat.name.toUpperCase()}</span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: '0 0.2rem',
                  lineHeight: 1
                }}
                title={`Delete ${cat.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;

