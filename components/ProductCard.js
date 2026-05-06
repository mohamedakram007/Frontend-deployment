"use client";

import React from 'react';

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="product-card">
      <div className="product-card-header">
        <h3 className="product-title">{product.name || product.title || 'Unnamed Product'}</h3>
        <span className="product-price">
          ${product.price !== undefined ? Number(product.price).toFixed(2) : '0.00'}
        </span>
      </div>
      <p className="product-desc">
        {product.description || 'No description available for this product.'}
      </p>
      <div className="product-actions">
        <button 
          className="btn-secondary" 
          onClick={() => onEdit(product)}
        >
          Edit
        </button>
        <button 
          className="btn-danger" 
          onClick={() => onDelete(product._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
