/* ─────────────────────────────────────────────────────
   script.js — ProductVault Logic
───────────────────────────────────────────────────── */

// Configuration
const API_URL = "http://127.0.0.1:8000/products";
let isEditMode = false;

// DOM Elements
const form = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const productIdInput = document.getElementById('productId');
const productList = document.getElementById('productList');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('emptyState');
const productCount = document.getElementById('productCount');
const refreshBtn = document.getElementById('refreshBtn');
const toastContainer = document.getElementById('toastContainer');

// Icons for toast
const successIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
const errorIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

// --- Toast Notification System ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  toast.innerHTML = `
    <div class="toast-icon">
      ${type === 'success' ? successIcon : errorIcon}
    </div>
    <div class="toast-message">${message}</div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- UI State Management ---
function updateUIState(state) {
  loader.classList.add('hidden');
  emptyState.classList.add('hidden');
  productList.classList.add('hidden');
  
  if (state === 'loading') {
    loader.classList.remove('hidden');
  } else if (state === 'empty') {
    emptyState.classList.remove('hidden');
    productCount.textContent = '0 Items';
  } else if (state === 'content') {
    productList.classList.remove('hidden');
  }
}

function resetForm() {
  form.reset();
  productIdInput.value = '';
  isEditMode = false;
  
  formTitle.textContent = 'Add New Product';
  submitBtn.querySelector('.btn-text').textContent = 'Add Product';
  cancelBtn.classList.add('hidden');
}

function setFormEditMode(product) {
  isEditMode = true;
  productIdInput.value = product.id || product._id;
  document.getElementById('name').value = product.name;
  document.getElementById('description').value = product.description;
  document.getElementById('price').value = product.price;
  document.getElementById('quantity').value = product.quantity;
  
  formTitle.textContent = 'Edit Product';
  submitBtn.querySelector('.btn-text').textContent = 'Save Changes';
  cancelBtn.classList.remove('hidden');
  
  // Scroll to form on mobile
  if (window.innerWidth <= 992) {
    document.querySelector('.sidebar-form').scrollIntoView({ behavior: 'smooth' });
  }
}

// --- Render Products ---
function createProductCard(product) {
  const id = product.id || product._id;
  const isLowStock = product.quantity < 5;
  
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <div class="product-header">
      <h3 class="product-title">${escapeHtml(product.name)}</h3>
      <span class="product-price">₹${Number(product.price).toFixed(2)}</span>
    </div>
    <p class="product-desc">${escapeHtml(product.description)}</p>
    <div class="product-footer">
      <div class="product-qty">
        <span class="qty-indicator ${isLowStock ? 'low' : ''}"></span>
        ${product.quantity} in stock
      </div>
      <div class="card-actions">
        <button class="btn btn-outline-primary" onclick="editProduct('${id}')" title="Edit">Edit</button>
        <button class="btn btn-outline-danger" onclick="deleteProduct('${id}')" title="Delete">Delete</button>
      </div>
    </div>
  `;
  return card;
}

function renderProducts(products) {
  productList.innerHTML = '';
  productCount.textContent = `${products.length} Item${products.length !== 1 ? 's' : ''}`;
  
  products.forEach((product, index) => {
    const card = createProductCard(product);
    // Add subtle entrance animation delay
    card.style.animation = `fadeInUp 0.3s ease forwards ${index * 0.05}s`;
    card.style.opacity = '0';
    productList.appendChild(card);
  });
}

// --- API Calls ---
async function fetchProducts() {
  console.log(`DEBUG: Fetching all products from ${API_URL}`);
  updateUIState('loading');
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Failed to fetch products. Status: ${response.status}`);
    
    const products = await response.json();
    
    if (products.length === 0) {
      updateUIState('empty');
    } else {
      renderProducts(products);
      updateUIState('content');
    }
  } catch (error) {
    showToast(error.message, 'error');
    updateUIState('empty');
  }
}

async function fetchProduct(id) {
  console.log(`DEBUG: Fetching single product from ${API_URL}/${id}`);
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch product details. Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    showToast(error.message, 'error');
    return null;
  }
}

async function addProduct(productData) {
  console.log(`DEBUG: Adding product via POST to ${API_URL}`, productData);
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) throw new Error(`Failed to add product. Status: ${response.status}`);
    
    showToast('Product added successfully!');
    resetForm();
    fetchProducts();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function updateProduct(id, productData) {
  console.log(`DEBUG: Updating product via PUT to ${API_URL}/${id}`, productData);
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) throw new Error(`Failed to update product. Status: ${response.status}`);
    
    showToast('Product updated successfully!');
    resetForm();
    fetchProducts();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Global functions for inline event handlers
window.deleteProduct = async (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  console.log(`DEBUG: Deleting product via DELETE to ${API_URL}/${id}`);
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error(`Failed to delete product. Status: ${response.status}`);
    
    showToast('Product deleted successfully!');
    fetchProducts();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.editProduct = async (id) => {
  const product = await fetchProduct(id);
  if (product) {
    setFormEditMode(product);
  }
};

// --- Event Listeners ---
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const productData = {
    name: document.getElementById('name').value.trim(),
    description: document.getElementById('description').value.trim(),
    price: parseFloat(document.getElementById('price').value),
    quantity: parseInt(document.getElementById('quantity').value, 10)
  };
  
  if (isEditMode) {
    const id = productIdInput.value;
    updateProduct(id, productData);
  } else {
    addProduct(productData);
  }
});

cancelBtn.addEventListener('click', resetForm);

refreshBtn.addEventListener('click', () => {
  refreshBtn.style.transform = 'rotate(180deg)';
  setTimeout(() => refreshBtn.style.transform = 'none', 300);
  fetchProducts();
});

// Utility to prevent XSS
function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Add keyframe animation to document
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// --- Init ---
fetchProducts();