/**
 * Library Book Tracker - XML DOM Manipulation
 * Lab 5 - Exercise 2
 */

const XML_URL = 'books.xml';

// State
let books = [];
let xmlDoc = null;
let isEditing = false;
let editingId = null;
let currentFilter = 'all';

// DOM Elements
const form = document.getElementById('book-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const refreshBtn = document.getElementById('refresh-btn');
const filterStatus = document.getElementById('filter-status');
const tbody = document.getElementById('books-tbody');
const loadingEl = document.getElementById('loading');
const emptyStateEl = document.getElementById('empty-state');
const errorStateEl = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const toast = document.getElementById('toast');
const toggleXmlBtn = document.getElementById('toggle-xml');
const xmlContent = document.getElementById('xml-content');

// Stats elements
const availableCount = document.getElementById('available-count');
const borrowedCount = document.getElementById('borrowed-count');
const reservedCount = document.getElementById('reserved-count');

// Form inputs
const bookIdInput = document.getElementById('bookId');
const bookTitleInput = document.getElementById('bookTitle');
const bookAuthorInput = document.getElementById('bookAuthor');
const bookStatusInput = document.getElementById('bookStatus');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchBooks();
  setupEventListeners();
});

function setupEventListeners() {
  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', resetForm);
  refreshBtn.addEventListener('click', fetchBooks);
  filterStatus.addEventListener('change', handleFilterChange);
  toggleXmlBtn.addEventListener('click', toggleXmlPreview);
}

/**
 * AJAX GET Request to Load XML Data
 */
function fetchBooks() {
  showLoading(true);
  hideError();

  const xhr = new XMLHttpRequest();
  xhr.open('GET', XML_URL, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      showLoading(false);

      if (xhr.status === 200) {
        try {
          xmlDoc = xhr.responseXML;

          // Handle empty or malformed XML
          if (!xmlDoc || !xmlDoc.documentElement) {
            throw new Error('Empty or malformed XML response');
          }

          const parserError = xmlDoc.querySelector('parsererror');
          if (parserError) {
            throw new Error('XML parsing error: ' + parserError.textContent);
          }

          parseXMLData();
          renderTable();
          updateStats();
          updateXmlPreview();
          showToast('Books loaded successfully!', 'success');
        } catch (error) {
          console.error('XML Parse Error:', error);
          showError('Failed to parse XML: ' + error.message);
        }
      } else if (xhr.status === 404) {
        showError('XML file not found (404)');
      } else if (xhr.status === 0) {
        showError('Network error - please check your connection');
      } else {
        showError(`HTTP Error: ${xhr.status}`);
      }
    }
  };

  xhr.onerror = function() {
    showLoading(false);
    showError('Network error occurred');
  };

  xhr.send();
}

/**
 * Parse XML Data using XML DOM methods
 */
function parseXMLData() {
  books = [];
  const bookNodes = xmlDoc.getElementsByTagName('book');

  for (let i = 0; i < bookNodes.length; i++) {
    const node = bookNodes[i];
    books.push({
      id: node.getElementsByTagName('id')[0]?.textContent || '',
      title: node.getElementsByTagName('title')[0]?.textContent || '',
      author: node.getElementsByTagName('author')[0]?.textContent || '',
      availability: node.getElementsByTagName('availability')[0]?.textContent || 'available'
    });
  }
}

/**
 * Handle Form Submit
 */
function handleSubmit(e) {
  e.preventDefault();

  const bookData = {
    id: bookIdInput.value.trim(),
    title: bookTitleInput.value.trim(),
    author: bookAuthorInput.value.trim(),
    availability: bookStatusInput.value
  };

  if (!validateBook(bookData)) return;

  if (isEditing) {
    updateBook(bookData);
  } else {
    addBook(bookData);
  }
}

/**
 * Validate Book Data
 */
function validateBook(data) {
  if (!data.id || data.id.length < 2) {
    showToast('Book ID must be at least 2 characters', 'warning');
    return false;
  }
  if (!data.title || data.title.length < 1) {
    showToast('Title is required', 'warning');
    return false;
  }
  if (!data.author || data.author.length < 2) {
    showToast('Author name must be at least 2 characters', 'warning');
    return false;
  }
  if (!isEditing && books.some(b => b.id === data.id)) {
    showToast('Book ID already exists!', 'error');
    return false;
  }
  return true;
}

/**
 * ADD - Add new <book> node to XML
 */
function addBook(data) {
  try {
    const libraryRoot = xmlDoc.getElementsByTagName('library')[0];
    
    const newBook = xmlDoc.createElement('book');
    
    const idEl = xmlDoc.createElement('id');
    idEl.textContent = data.id;
    
    const titleEl = xmlDoc.createElement('title');
    titleEl.textContent = data.title;
    
    const authorEl = xmlDoc.createElement('author');
    authorEl.textContent = data.author;
    
    const availabilityEl = xmlDoc.createElement('availability');
    availabilityEl.textContent = data.availability;
    
    newBook.appendChild(idEl);
    newBook.appendChild(titleEl);
    newBook.appendChild(authorEl);
    newBook.appendChild(availabilityEl);
    
    libraryRoot.appendChild(newBook);
    
    books.push(data);
    
    renderTable();
    updateStats();
    updateXmlPreview();
    resetForm();
    showToast(`Book "${data.title}" added successfully!`, 'success');
  } catch (error) {
    console.error('Add error:', error);
    showToast('Failed to add book: ' + error.message, 'error');
  }
}

/**
 * UPDATE - Update availability status in XML
 */
function updateBook(data) {
  try {
    const bookNodes = xmlDoc.getElementsByTagName('book');
    
    for (let i = 0; i < bookNodes.length; i++) {
      const node = bookNodes[i];
      if (node.getElementsByTagName('id')[0]?.textContent === editingId) {
        node.getElementsByTagName('id')[0].textContent = data.id;
        node.getElementsByTagName('title')[0].textContent = data.title;
        node.getElementsByTagName('author')[0].textContent = data.author;
        node.getElementsByTagName('availability')[0].textContent = data.availability;
        break;
      }
    }
    
    const index = books.findIndex(b => b.id === editingId);
    if (index !== -1) books[index] = data;
    
    renderTable();
    updateStats();
    updateXmlPreview();
    resetForm();
    showToast(`Book "${data.title}" updated successfully!`, 'success');
  } catch (error) {
    console.error('Update error:', error);
    showToast('Failed to update book: ' + error.message, 'error');
  }
}

/**
 * Quick Update - Update only availability status
 */
function updateAvailability(id, newStatus) {
  try {
    const bookNodes = xmlDoc.getElementsByTagName('book');
    
    for (let i = 0; i < bookNodes.length; i++) {
      const node = bookNodes[i];
      if (node.getElementsByTagName('id')[0]?.textContent === id) {
        node.getElementsByTagName('availability')[0].textContent = newStatus;
        break;
      }
    }
    
    const book = books.find(b => b.id === id);
    if (book) book.availability = newStatus;
    
    renderTable();
    updateStats();
    updateXmlPreview();
    showToast(`Status updated to "${newStatus}"`, 'success');
  } catch (error) {
    showToast('Failed to update status: ' + error.message, 'error');
  }
}

/**
 * DELETE - Delete a book entry from XML
 */
function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;

  try {
    const bookNodes = xmlDoc.getElementsByTagName('book');
    
    for (let i = 0; i < bookNodes.length; i++) {
      const node = bookNodes[i];
      if (node.getElementsByTagName('id')[0]?.textContent === id) {
        node.parentNode.removeChild(node);
        break;
      }
    }
    
    const deletedBook = books.find(b => b.id === id);
    books = books.filter(b => b.id !== id);
    
    renderTable();
    updateStats();
    updateXmlPreview();
    
    if (isEditing && editingId === id) resetForm();
    
    showToast(`Book "${deletedBook?.title}" deleted successfully!`, 'success');
  } catch (error) {
    showToast('Failed to delete book: ' + error.message, 'error');
  }
}

/**
 * Edit Book - Populate form
 */
function editBook(id) {
  const book = books.find(b => b.id === id);
  if (!book) {
    showToast('Book not found!', 'error');
    return;
  }

  bookIdInput.value = book.id;
  bookTitleInput.value = book.title;
  bookAuthorInput.value = book.author;
  bookStatusInput.value = book.availability;

  isEditing = true;
  editingId = id;
  formTitle.textContent = 'Edit Book';
  submitBtn.querySelector('.btn-text').textContent = 'Update Book';
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
  formTitle.textContent = 'Add New Book';
  submitBtn.querySelector('.btn-text').textContent = 'Add Book';
  cancelBtn.style.display = 'none';
}

/**
 * Handle Filter Change
 */
function handleFilterChange() {
  currentFilter = filterStatus.value;
  renderTable();
}

/**
 * Render Table - Dynamically refresh book list
 */
function renderTable() {
  const filteredBooks = currentFilter === 'all' 
    ? books 
    : books.filter(b => b.availability === currentFilter);

  if (filteredBooks.length === 0) {
    tbody.innerHTML = '';
    emptyStateEl.style.display = 'flex';
    return;
  }

  emptyStateEl.style.display = 'none';
  
  tbody.innerHTML = filteredBooks.map(book => `
    <tr class="fade-in">
      <td><strong>${escapeHtml(book.id)}</strong></td>
      <td>${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.author)}</td>
      <td>
        <span class="status-badge status-${book.availability}">${book.availability}</span>
      </td>
      <td>
        <div class="action-btns">
          <select class="btn btn-status" onchange="updateAvailability('${escapeHtml(book.id)}', this.value)">
            <option value="available" ${book.availability === 'available' ? 'selected' : ''}>Available</option>
            <option value="borrowed" ${book.availability === 'borrowed' ? 'selected' : ''}>Borrowed</option>
            <option value="reserved" ${book.availability === 'reserved' ? 'selected' : ''}>Reserved</option>
          </select>
          <button class="btn btn-edit" onclick="editBook('${escapeHtml(book.id)}')">Edit</button>
          <button class="btn btn-delete" onclick="deleteBook('${escapeHtml(book.id)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Update Statistics
 */
function updateStats() {
  availableCount.textContent = books.filter(b => b.availability === 'available').length;
  borrowedCount.textContent = books.filter(b => b.availability === 'borrowed').length;
  reservedCount.textContent = books.filter(b => b.availability === 'reserved').length;
}

/**
 * Update XML Preview - Display formatted XML data
 */
function updateXmlPreview() {
  if (!xmlDoc) return;
  
  const serializer = new XMLSerializer();
  let xmlString = serializer.serializeToString(xmlDoc);
  
  // Format XML with indentation
  xmlString = formatXml(xmlString);
  xmlContent.textContent = xmlString;
}

/**
 * Format XML string with indentation
 */
function formatXml(xml) {
  const PADDING = '  ';
  let formatted = '';
  let pad = 0;
  
  xml.split(/>\s*</).forEach((node, index) => {
    if (node.match(/^\/\w/)) pad--;
    formatted += (index > 0 ? '\n' : '') + PADDING.repeat(pad) + (index > 0 ? '<' : '') + node + (index < xml.split(/>\s*</).length - 1 ? '>' : '');
    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) pad++;
  });
  
  return formatted;
}

/**
 * Toggle XML Preview
 */
function toggleXmlPreview() {
  const isHidden = xmlContent.style.display === 'none';
  xmlContent.style.display = isHidden ? 'block' : 'none';
  toggleXmlBtn.textContent = isHidden ? 'Hide XML' : 'Show XML';
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
  errorMessage.textContent = msg;
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
