/**
 * Student Management System - AJAX CRUD Operations
 * Lab 4 - Exercise 3
 */

// API Endpoint (simulated with local JSON)
const API_URL = 'students.json';

// State
let students = [];
let isEditing = false;
let editingId = null;

// DOM Elements
const form = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const refreshBtn = document.getElementById('refresh-btn');
const tbody = document.getElementById('students-tbody');
const loadingEl = document.getElementById('loading');
const emptyStateEl = document.getElementById('empty-state');
const toast = document.getElementById('toast');

// Form Inputs
const studentIdInput = document.getElementById('studentId');
const studentNameInput = document.getElementById('studentName');
const departmentInput = document.getElementById('department');
const marksInput = document.getElementById('marks');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchStudents();
  setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', resetForm);
  refreshBtn.addEventListener('click', fetchStudents);
}

/**
 * AJAX Helper Function using Fetch API
 * Handles HTTP requests with proper error handling
 */
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    // Handle HTTP status codes
    if (response.status === 404) {
      throw new Error('Resource not found (404)');
    }
    if (response.status === 500) {
      throw new Error('Server error (500)');
    }
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Network errors
    if (error.name === 'TypeError') {
      throw new Error('Network error - please check your connection');
    }
    throw error;
  }
}

/**
 * READ Operation - Fetch all students
 */
async function fetchStudents() {
  showLoading(true);
  
  try {
    const data = await makeRequest(API_URL);
    students = data;
    renderTable();
    showToast('Students loaded successfully!', 'success');
  } catch (error) {
    console.error('Fetch error:', error);
    showToast(`Failed to load students: ${error.message}`, 'error');
    showEmptyState(true);
  } finally {
    showLoading(false);
  }
}

/**
 * Handle Form Submit (Create/Update)
 */
async function handleSubmit(e) {
  e.preventDefault();

  const studentData = {
    id: studentIdInput.value.trim(),
    name: studentNameInput.value.trim(),
    department: departmentInput.value,
    marks: parseInt(marksInput.value)
  };

  // Validation
  if (!validateStudent(studentData)) {
    return;
  }

  if (isEditing) {
    await updateStudent(studentData);
  } else {
    await createStudent(studentData);
  }
}

/**
 * Validate Student Data
 */
function validateStudent(data) {
  if (!data.id || data.id.length < 3) {
    showToast('Student ID must be at least 3 characters', 'warning');
    return false;
  }
  if (!data.name || data.name.length < 2) {
    showToast('Name must be at least 2 characters', 'warning');
    return false;
  }
  if (!data.department) {
    showToast('Please select a department', 'warning');
    return false;
  }
  if (data.marks < 0 || data.marks > 100) {
    showToast('Marks must be between 0 and 100', 'warning');
    return false;
  }

  // Check for duplicate ID on create
  if (!isEditing && students.some(s => s.id === data.id)) {
    showToast('Student ID already exists!', 'error');
    return false;
  }

  return true;
}

/**
 * CREATE Operation - Add new student
 * Note: In a real application, this would POST to a server
 */
async function createStudent(studentData) {
  try {
    // Simulate AJAX POST request
    // In production: await makeRequest(API_URL, { method: 'POST', body: JSON.stringify(studentData) })
    
    // Simulate network delay
    await simulateDelay(300);

    // Simulate server response (HTTP 201 Created)
    const response = { status: 201, data: studentData };
    
    if (response.status === 201) {
      students.push(response.data);
      renderTable();
      resetForm();
      showToast(`Student "${studentData.name}" added successfully!`, 'success');
    }
  } catch (error) {
    console.error('Create error:', error);
    showToast(`Failed to add student: ${error.message}`, 'error');
  }
}

/**
 * UPDATE Operation - Modify student details
 */
async function updateStudent(studentData) {
  try {
    // Simulate AJAX PUT request
    // In production: await makeRequest(`${API_URL}/${editingId}`, { method: 'PUT', body: JSON.stringify(studentData) })
    
    await simulateDelay(300);

    // Simulate server response (HTTP 200 OK)
    const index = students.findIndex(s => s.id === editingId);
    
    if (index === -1) {
      // Simulate 404 Not Found
      throw new Error('Student not found (404)');
    }

    // Allow ID change if updating
    students[index] = studentData;
    renderTable();
    resetForm();
    showToast(`Student "${studentData.name}" updated successfully!`, 'success');
  } catch (error) {
    console.error('Update error:', error);
    showToast(`Failed to update student: ${error.message}`, 'error');
  }
}

/**
 * DELETE Operation - Remove student record
 */
async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) {
    return;
  }

  try {
    // Simulate AJAX DELETE request
    // In production: await makeRequest(`${API_URL}/${id}`, { method: 'DELETE' })
    
    await simulateDelay(300);

    const index = students.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error('Student not found (404)');
    }

    const deletedStudent = students[index];
    students.splice(index, 1);
    renderTable();
    showToast(`Student "${deletedStudent.name}" deleted successfully!`, 'success');

    // Clear form if we were editing the deleted student
    if (isEditing && editingId === id) {
      resetForm();
    }
  } catch (error) {
    console.error('Delete error:', error);
    showToast(`Failed to delete student: ${error.message}`, 'error');
  }
}

/**
 * Edit Student - Populate form with student data
 */
function editStudent(id) {
  const student = students.find(s => s.id === id);
  
  if (!student) {
    showToast('Student not found!', 'error');
    return;
  }

  // Populate form
  studentIdInput.value = student.id;
  studentNameInput.value = student.name;
  departmentInput.value = student.department;
  marksInput.value = student.marks;

  // Update UI state
  isEditing = true;
  editingId = id;
  formTitle.textContent = 'Edit Student';
  submitBtn.querySelector('.btn-text').textContent = 'Update Student';
  submitBtn.classList.remove('btn-primary');
  submitBtn.classList.add('btn-edit');
  cancelBtn.style.display = 'inline-flex';

  // Scroll to form
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Reset Form to Default State
 */
function resetForm() {
  form.reset();
  isEditing = false;
  editingId = null;
  formTitle.textContent = 'Add New Student';
  submitBtn.querySelector('.btn-text').textContent = 'Add Student';
  submitBtn.classList.add('btn-primary');
  submitBtn.classList.remove('btn-edit');
  cancelBtn.style.display = 'none';
}

/**
 * Render Students Table
 */
function renderTable() {
  if (students.length === 0) {
    tbody.innerHTML = '';
    showEmptyState(true);
    return;
  }

  showEmptyState(false);
  
  tbody.innerHTML = students.map(student => `
    <tr class="fade-in">
      <td><strong>${escapeHtml(student.id)}</strong></td>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.department)}</td>
      <td>${student.marks}</td>
      <td>${getGradeBadge(student.marks)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-edit" onclick="editStudent('${escapeHtml(student.id)}')" title="Edit">
            Edit
          </button>
          <button class="btn btn-delete" onclick="deleteStudent('${escapeHtml(student.id)}')" title="Delete">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Calculate Grade and Return Badge HTML
 */
function getGradeBadge(marks) {
  let grade, className;
  
  if (marks >= 90) {
    grade = 'A+';
    className = 'grade-a';
  } else if (marks >= 80) {
    grade = 'A';
    className = 'grade-a';
  } else if (marks >= 70) {
    grade = 'B';
    className = 'grade-b';
  } else if (marks >= 60) {
    grade = 'C';
    className = 'grade-c';
  } else if (marks >= 50) {
    grade = 'D';
    className = 'grade-d';
  } else {
    grade = 'F';
    className = 'grade-f';
  }

  return `<span class="grade ${className}">${grade}</span>`;
}

/**
 * Show/Hide Loading State
 */
function showLoading(show) {
  loadingEl.style.display = show ? 'flex' : 'none';
  if (show) {
    tbody.innerHTML = '';
    showEmptyState(false);
  }
}

/**
 * Show/Hide Empty State
 */
function showEmptyState(show) {
  emptyStateEl.style.display = show ? 'block' : 'none';
}

/**
 * Show Toast Notification
 */
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Simulate Network Delay (for demo purposes)
 */
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Alternative: XMLHttpRequest Implementation
 * Uncomment to use XMLHttpRequest instead of Fetch API
 */
/*
function makeRequestXHR(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      } else if (xhr.status === 404) {
        reject(new Error('Resource not found (404)'));
      } else if (xhr.status === 500) {
        reject(new Error('Server error (500)'));
      } else {
        reject(new Error(`HTTP Error: ${xhr.status}`));
      }
    };

    xhr.onerror = function() {
      reject(new Error('Network error'));
    };

    xhr.ontimeout = function() {
      reject(new Error('Request timeout'));
    };

    xhr.timeout = 10000; // 10 second timeout

    if (data) {
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    }
  });
}
*/
