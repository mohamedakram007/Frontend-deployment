"use client";

import React, { useState, useEffect } from 'react';

export default function ProductForm({ onSubmit, editingProduct, onCancelEdit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });

  // Load editing product data into form
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || editingProduct.title || '',
        description: editingProduct.description || '',
        price: editingProduct.price !== undefined ? editingProduct.price : ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: ''
      });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert price to number before submitting
    const submitData = {
      ...formData,
      price: formData.price ? Number(formData.price) : 0
    };
    
    onSubmit(submitData);
    
    if (!editingProduct) {
      setFormData({ name: '', description: '', price: '' });
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>
        {editingProduct ? 'Edit Product' : 'Add New Product'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Wireless Headphones"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter product description..."
          ></textarea>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ flex: 1 }}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
          </button>
          
          {editingProduct && (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onCancelEdit}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
