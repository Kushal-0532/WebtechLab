/**
 * Product Inventory System - JSON CRUD Operations
 * Lab 5 - Exercise 4
 * Uses Fetch API for AJAX operations
 */

const JSON_URL = 'inventory.json';
const LOW_STOCK_THRESHOLD = 10;

// State
let products = [];
let isEditing = false;
let editingId = null;
let searchTerm = '';
let categoryFilter = 'all';
let stockFilter = 'all';

// DOM Elements
const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const refreshBtn = document.getElementById('refresh-btn');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterStock = document.getElementById('filter-stock');
const tbody = document.getElementById('products-tbody');
const loadingEl = document.getElementById('loading');
const emptyStateEl = document.getElementById('empty-state');
const errorStateEl = document.getElementById('error-state');
const errorMessageEl = document.getElementById('error-message');
const resultCount = document.getElementById('result-count');
const toast = document.getElementById('toast');

// Stats elements
const totalValueEl = document.getElementById('total-value');
const totalProductsEl = document.getElementById('total-products');
const totalStockEl = document.getElementById('total-stock');
const lowStockEl = document.getElementById('low-stock');

// Form inputs
const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('productName');
const productCategoryInput = document.getElementById('productCategory');
const productPriceInput = document.getElementById('productPrice');
const productStockInput = document.getElementById('productStock');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  setupEventListeners();
});

function setupEventListeners() {
  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', resetForm);
  refreshBtn.addEventListener('click', fetchProducts);
  searchInput.addEventListener('input', handleSearch);
  filterCategory.addEventListener('change', handleFilterChange);
  filterStock.addEventListener('change', handleFilterChange);
}

/**
 * AJAX Fetch API - Load JSON Data
 */
async function fetchProducts() {
  showLoading(true);
  hideError();

  try {
    const response = await fetch(JSON_URL);
    
    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Inventory file not found (404)');
      } else if (response.status === 500) {
        throw new Error('Server error (500)');
      } else {
        throw new Error(`HTTP Error: ${response.status}`);
      }
    }

    // Parse JSON
    const data = await response.json();
    
    // Validate data structure
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: expected array');
    }

    // Validate each product
    data.forEach((product, index) => {
      if (!product.id || !product.name) {
        throw new Error(`Invalid product data at index ${index}`);
      }
    });

    products = data;
    renderTable();
    updateStats();
    showToast('Inventory loaded successfully!', 'success');

  } catch (error) {
    console.error('Fetch error:', error);
    
    if (error instanceof SyntaxError) {
      showError('JSON parsing error: Invalid format');
    } else if (error.name === 'TypeError') {
      showError('Network error - check your connection');
    } else {
      showError(error.message);
    }
  } finally {
    showLoading(false);
  }
}

/**
 * Handle Form Submit
 */
function handleSubmit(e) {
  e.preventDefault();

  const productData = {
    id: productIdInput.value.trim(),
    name: productNameInput.value.trim(),
    category: productCategoryInput.value,
    price: parseFloat(productPriceInput.value),
    stock: parseInt(productStockInput.value)
  };

  if (!validateProduct(productData)) return;

  if (isEditing) {
    updateProduct(productData);
  } else {
    addProduct(productData);
  }
}

/**
 * Validate Product Data
 */
function validateProduct(data) {
  if (!data.id || data.id.length < 3) {
    showToast('Product ID must be at least 3 characters', 'warning');
    return false;
  }
  if (!data.name || data.name.length < 2) {
    showToast('Product name is required', 'warning');
    return false;
  }
  if (!data.category) {
    showToast('Please select a category', 'warning');
    return false;
  }
  if (isNaN(data.price) || data.price < 0) {
    showToast('Price must be a valid positive number', 'warning');
    return false;
  }
  if (isNaN(data.stock) || data.stock < 0) {
    showToast('Stock must be a valid non-negative number', 'warning');
    return false;
  }
  if (!isEditing && products.some(p => p.id === data.id)) {
    showToast('Product ID already exists!', 'error');
    return false;
  }
  return true;
}

/**
 * ADD - Add new product
 */
function addProduct(data) {
  try {
    products.push(data);
    renderTable();
    updateStats();
    resetForm();
    showToast(`Product "${data.name}" added successfully!`, 'success');
  } catch (error) {
    showToast('Failed to add product: ' + error.message, 'error');
  }
}

/**
 * UPDATE - Edit product price/stock
 */
function updateProduct(data) {
  try {
    const index = products.findIndex(p => p.id === editingId);
    if (index === -1) throw new Error('Product not found');
    
    products[index] = data;
    renderTable();
    updateStats();
    resetForm();
    showToast(`Product "${data.name}" updated successfully!`, 'success');
  } catch (error) {
    showToast('Failed to update product: ' + error.message, 'error');
  }
}

/**
 * DELETE - Delete product
 */
function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const deleted = products.find(p => p.id === id);
    products = products.filter(p => p.id !== id);
    
    renderTable();
    updateStats();
    
    if (isEditing && editingId === id) resetForm();
    
    showToast(`Product "${deleted?.name}" deleted successfully!`, 'success');
  } catch (error) {
    showToast('Failed to delete product: ' + error.message, 'error');
  }
}

/**
 * Edit Product - Populate form
 */
function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) {
    showToast('Product not found!', 'error');
    return;
  }

  productIdInput.value = product.id;
  productNameInput.value = product.name;
  productCategoryInput.value = product.category;
  productPriceInput.value = product.price;
  productStockInput.value = product.stock;

  isEditing = true;
  editingId = id;
  formTitle.textContent = 'Edit Product';
  submitBtn.querySelector('.btn-text').textContent = 'Update Product';
  cancelBtn.style.display = 'inline-flex';

  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Reset Form
 */
function resetForm() {
  form.reset();
  isEditing = false;
  editingId = null;
  formTitle.textContent = 'Add New Product';
  submitBtn.querySelector('.btn-text').textContent = 'Add Product';
  cancelBtn.style.display = 'none';
}

/**
 * Handle Search
 */
function handleSearch(e) {
  searchTerm = e.target.value.toLowerCase();
  renderTable();
}

/**
 * Handle Filter Change - Search by category
 */
function handleFilterChange() {
  categoryFilter = filterCategory.value;
  stockFilter = filterStock.value;
  renderTable();
}

/**
 * Get Filtered Products
 */
function getFilteredProducts() {
  let filtered = products;

  // Search filter
  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.id.toLowerCase().includes(searchTerm) ||
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }

  // Category filter
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(p => p.category === categoryFilter);
  }

  // Stock filter
  if (stockFilter !== 'all') {
    switch (stockFilter) {
      case 'in-stock':
        filtered = filtered.filter(p => p.stock > LOW_STOCK_THRESHOLD);
        break;
      case 'low-stock':
        filtered = filtered.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
        break;
      case 'out-of-stock':
        filtered = filtered.filter(p => p.stock === 0);
        break;
    }
  }

  return filtered;
}

/**
 * Render Table - Dynamically update inventory
 */
function renderTable() {
  const filteredProducts = getFilteredProducts();

  resultCount.textContent = `Showing ${filteredProducts.length} of ${products.length} products`;

  if (filteredProducts.length === 0) {
    tbody.innerHTML = '';
    emptyStateEl.style.display = 'flex';
    return;
  }

  emptyStateEl.style.display = 'none';
  
  tbody.innerHTML = filteredProducts.map(product => {
    const value = (product.price * product.stock).toFixed(2);
    const stockStatus = getStockStatus(product.stock);
    const rowClass = getRowClass(product.stock);
    
    return `
      <tr class="fade-in ${rowClass}">
        <td><strong>${escapeHtml(product.id)}</strong></td>
        <td>${escapeHtml(product.name)}</td>
        <td><span class="category-badge">${escapeHtml(product.category)}</span></td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.stock}</td>
        <td>$${value}</td>
        <td><span class="stock-badge ${stockStatus.class}">${stockStatus.text}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-edit" onclick="editProduct('${escapeHtml(product.id)}')">Edit</button>
            <button class="btn btn-delete" onclick="deleteProduct('${escapeHtml(product.id)}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Get Stock Status Badge - Conditional formatting
 */
function getStockStatus(stock) {
  if (stock === 0) {
    return { text: 'Out of Stock', class: 'stock-out' };
  } else if (stock <= LOW_STOCK_THRESHOLD) {
    return { text: 'Low Stock', class: 'stock-low' };
  }
  return { text: 'In Stock', class: 'stock-in' };
}

/**
 * Get Row Class for Conditional Formatting
 */
function getRowClass(stock) {
  if (stock === 0) return 'row-out-of-stock';
  if (stock <= LOW_STOCK_THRESHOLD) return 'row-low-stock';
  return '';
}

/**
 * Update Statistics - Calculate total inventory value dynamically
 */
function updateStats() {
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  totalProductsEl.textContent = totalProducts;
  totalStockEl.textContent = totalStock.toLocaleString();
  totalValueEl.textContent = '$' + totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  lowStockEl.textContent = lowStockCount + outOfStockCount;
}

/**
 * UI Helpers
 */
function showLoading(show) {
  loadingEl.style.display = show ? 'flex' : 'none';
  if (show) {
    tbody.innerHTML = '';
    emptyStateEl.style.display = 'none';
    errorStateEl.style.display = 'none';
  }
}

function showError(msg) {
  errorMessageEl.textContent = msg;
  errorStateEl.style.display = 'flex';
  emptyStateEl.style.display = 'none';
}

function hideError() {
  errorStateEl.style.display = 'none';
}

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
