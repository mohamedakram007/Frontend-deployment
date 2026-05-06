"use client";

import React from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ products, onEdit, onDelete, isLoading, error }) {
  if (isLoading && products.length === 0) {
    return (
      <div className="card loading-spinner">
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h4>Error loading products</h4>
        <p>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No products found</h3>
        <p>Add a new product using the form to get started.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard 
          key={product._id} 
          product={product} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
