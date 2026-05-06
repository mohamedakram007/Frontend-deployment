"use client";

import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

const API_URL = "https://fastapi-trainning.onrender.com/products";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch all products
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching products from ${API_URL}...`);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Products fetched successfully:', data);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'An error occurred while fetching products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add or Update product
  const handleSubmitProduct = async (productData) => {
    setIsSubmitting(true);
    setActionError(null);
    
    try {
      if (editingProduct) {
        // Update existing product
        console.log(`Updating product ${editingProduct._id}...`, productData);
        const response = await fetch(`${API_URL}/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update: ${response.status} ${response.statusText}`);
        }
        
        console.log('Product updated successfully');
        setEditingProduct(null); // Clear editing state
      } else {
        // Add new product
        console.log('Adding new product...', productData);
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to add: ${response.status} ${response.statusText}`);
        }
        
        console.log('Product added successfully');
      }
      
      // Refresh the product list
      await fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      setActionError(err.message || 'An error occurred while saving the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    setActionError(null);
    
    try {
      console.log(`Deleting product ${id}...`);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status} ${response.statusText}`);
      }
      
      console.log('Product deleted successfully');
      
      // If we're editing the product that was just deleted, clear the form
      if (editingProduct && editingProduct._id === id) {
        setEditingProduct(null);
      }
      
      // Refresh the product list
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setActionError(err.message || 'An error occurred while deleting the product.');
    }
  };

  // Start editing a product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    // Scroll to top where form is (useful on mobile)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1>Product Management Dashboard</h1>
        <p>Manage your inventory with this modern interface.</p>
      </header>

      {actionError && (
        <div className="error-message">
          <strong>Action Failed: </strong> {actionError}
        </div>
      )}

      <div className="dashboard-grid">
        <section>
          <ProductForm 
            onSubmit={handleSubmitProduct} 
            editingProduct={editingProduct} 
            onCancelEdit={handleCancelEdit}
            isLoading={isSubmitting}
          />
        </section>
        
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Product List</h2>
            <button 
              className="btn-secondary" 
              onClick={fetchProducts}
              disabled={isLoading}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <ProductList 
            products={products} 
            onEdit={handleEditProduct} 
            onDelete={handleDeleteProduct} 
            isLoading={isLoading}
            error={error}
          />
        </section>
      </div>
    </main>
  );
}
