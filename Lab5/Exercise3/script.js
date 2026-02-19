/**
 * Student Record System - JSON CRUD Operations
 * Lab 5 - Exercise 3
 * Uses Fetch API for AJAX operations
 */

const JSON_URL = 'students.json';

// State
let students = [];
let isEditing = false;
let editingId = null;
let searchTerm = '';

// DOM Elements
const form = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const refreshBtn = document.getElementById('refresh-btn');
const searchInput = document.getElementById('search-input');
const tbody = document.getElementById('students-tbody');
const loadingEl = document.getElementById('loading');
const emptyStateEl = document.getElementById('empty-state');
const errorStateEl = document.getElementById('error-state');
const errorMessageEl = document.getElementById('error-message');
const toast = document.getElementById('toast');

// Stats elements
const totalStudentsEl = document.getElementById('total-students');
const avgMarksEl = document.getElementById('avg-marks');
const highestMarksEl = document.getElementById('highest-marks');
const passRateEl = document.getElementById('pass-rate');

// Form inputs
const studentIdInput = document.getElementById('studentId');
const studentNameInput = document.getElementById('studentName');
const studentCourseInput = document.getElementById('studentCourse');
const studentMarksInput = document.getElementById('studentMarks');

// Error hints
const idError = document.getElementById('id-error');
const nameError = document.getElementById('name-error');
const courseError = document.getElementById('course-error');
const marksError = document.getElementById('marks-error');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchStudents();
  setupEventListeners();
});

function setupEventListeners() {
  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', resetForm);
  refreshBtn.addEventListener('click', fetchStudents);
  searchInput.addEventListener('input', handleSearch);
  
  // Real-time validation
  studentIdInput.addEventListener('blur', () => validateField('id'));
  studentNameInput.addEventListener('blur', () => validateField('name'));
  studentCourseInput.addEventListener('change', () => validateField('course'));
  studentMarksInput.addEventListener('blur', () => validateField('marks'));
}

/**
 * FETCH API - Retrieve JSON Data
 */
async function fetchStudents() {
  showLoading(true);
  hideError();

  try {
    const response = await fetch(JSON_URL);
    
    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Student data file not found (404)');
      } else if (response.status === 500) {
        throw new Error('Server error (500)');
      } else {
        throw new Error(`HTTP Error: ${response.status}`);
      }
    }

    // Parse JSON using response.json()
    const data = await response.json();
    
    // Validate JSON structure
    if (!Array.isArray(data)) {
      throw new Error('Invalid JSON format: expected an array');
    }

    students = data;
    renderTable();
    updateStats();
    showToast('Students loaded successfully!', 'success');

  } catch (error) {
    console.error('Fetch error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      showError('JSON parsing error: Invalid JSON format');
    } else if (error.name === 'TypeError') {
      showError('Network error - please check your connection');
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

  // Clear previous errors
  clearAllErrors();

  const studentData = {
    id: studentIdInput.value.trim(),
    name: studentNameInput.value.trim(),
    course: studentCourseInput.value,
    marks: parseInt(studentMarksInput.value)
  };

  // Validate all fields before submission
  if (!validateAllFields(studentData)) return;

  if (isEditing) {
    updateStudent(studentData);
  } else {
    createStudent(studentData);
  }
}

/**
 * Validate Individual Field
 */
function validateField(field) {
  let isValid = true;

  switch (field) {
    case 'id':
      const idValue = studentIdInput.value.trim();
      if (!idValue || idValue.length < 3) {
        idError.textContent = 'ID must be at least 3 characters';
        studentIdInput.classList.add('invalid');
        isValid = false;
      } else if (!isEditing && students.some(s => s.id === idValue)) {
        idError.textContent = 'ID already exists';
        studentIdInput.classList.add('invalid');
        isValid = false;
      } else {
        idError.textContent = '';
        studentIdInput.classList.remove('invalid');
      }
      break;

    case 'name':
      const nameValue = studentNameInput.value.trim();
      if (!nameValue || nameValue.length < 2) {
        nameError.textContent = 'Name must be at least 2 characters';
        studentNameInput.classList.add('invalid');
        isValid = false;
      } else {
        nameError.textContent = '';
        studentNameInput.classList.remove('invalid');
      }
      break;

    case 'course':
      if (!studentCourseInput.value) {
        courseError.textContent = 'Please select a course';
        studentCourseInput.classList.add('invalid');
        isValid = false;
      } else {
        courseError.textContent = '';
        studentCourseInput.classList.remove('invalid');
      }
      break;

    case 'marks':
      const marksValue = parseInt(studentMarksInput.value);
      if (isNaN(marksValue) || marksValue < 0 || marksValue > 100) {
        marksError.textContent = 'Marks must be between 0 and 100';
        studentMarksInput.classList.add('invalid');
        isValid = false;
      } else {
        marksError.textContent = '';
        studentMarksInput.classList.remove('invalid');
      }
      break;
  }

  return isValid;
}

/**
 * Validate All Fields
 */
function validateAllFields(data) {
  let isValid = true;

  if (!validateField('id')) isValid = false;
  if (!validateField('name')) isValid = false;
  if (!validateField('course')) isValid = false;
  if (!validateField('marks')) isValid = false;

  return isValid;
}

/**
 * Clear All Errors
 */
function clearAllErrors() {
  idError.textContent = '';
  nameError.textContent = '';
  courseError.textContent = '';
  marksError.textContent = '';
  studentIdInput.classList.remove('invalid');
  studentNameInput.classList.remove('invalid');
  studentCourseInput.classList.remove('invalid');
  studentMarksInput.classList.remove('invalid');
}

/**
 * CREATE - Add new student object
 */
function createStudent(data) {
  try {
    students.push(data);
    renderTable();
    updateStats();
    resetForm();
    showToast(`Student "${data.name}" added successfully!`, 'success');
  } catch (error) {
    showToast('Failed to add student: ' + error.message, 'error');
  }
}

/**
 * UPDATE - Modify marks or course
 */
function updateStudent(data) {
  try {
    const index = students.findIndex(s => s.id === editingId);
    if (index === -1) {
      throw new Error('Student not found');
    }
    
    students[index] = data;
    renderTable();
    updateStats();
    resetForm();
    showToast(`Student "${data.name}" updated successfully!`, 'success');
  } catch (error) {
    showToast('Failed to update student: ' + error.message, 'error');
  }
}

/**
 * DELETE - Remove student object
 */
function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;

  try {
    const deletedStudent = students.find(s => s.id === id);
    students = students.filter(s => s.id !== id);
    
    renderTable();
    updateStats();
    
    if (isEditing && editingId === id) resetForm();
    
    showToast(`Student "${deletedStudent?.name}" deleted successfully!`, 'success');
  } catch (error) {
    showToast('Failed to delete student: ' + error.message, 'error');
  }
}

/**
 * Edit Student - Populate form
 */
function editStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) {
    showToast('Student not found!', 'error');
    return;
  }

  studentIdInput.value = student.id;
  studentNameInput.value = student.name;
  studentCourseInput.value = student.course;
  studentMarksInput.value = student.marks;

  isEditing = true;
  editingId = id;
  formTitle.textContent = 'Edit Student';
  submitBtn.querySelector('.btn-text').textContent = 'Update Student';
  cancelBtn.style.display = 'inline-flex';

  clearAllErrors();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Reset Form
 */
function resetForm() {
  form.reset();
  isEditing = false;
  editingId = null;
  formTitle.textContent = 'Add New Student';
  submitBtn.querySelector('.btn-text').textContent = 'Add Student';
  cancelBtn.style.display = 'none';
  clearAllErrors();
}

/**
 * Handle Search
 */
function handleSearch(e) {
  searchTerm = e.target.value.toLowerCase();
  renderTable();
}

/**
 * Render Table - Display all students
 */
function renderTable() {
  let filteredStudents = students;
  
  // Apply search filter
  if (searchTerm) {
    filteredStudents = students.filter(s => 
      s.id.toLowerCase().includes(searchTerm) ||
      s.name.toLowerCase().includes(searchTerm) ||
      s.course.toLowerCase().includes(searchTerm)
    );
  }

  if (filteredStudents.length === 0) {
    tbody.innerHTML = '';
    emptyStateEl.style.display = 'flex';
    return;
  }

  emptyStateEl.style.display = 'none';
  
  tbody.innerHTML = filteredStudents.map(student => `
    <tr class="fade-in">
      <td><strong>${escapeHtml(student.id)}</strong></td>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td>${student.marks}</td>
      <td><span class="grade-badge ${getGradeClass(student.marks)}">${getGrade(student.marks)}</span></td>
      <td><span class="status-badge ${student.marks >= 40 ? 'status-pass' : 'status-fail'}">${student.marks >= 40 ? 'Pass' : 'Fail'}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn btn-edit" onclick="editStudent('${escapeHtml(student.id)}')">Edit</button>
          <button class="btn btn-delete" onclick="deleteStudent('${escapeHtml(student.id)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Update Statistics
 */
function updateStats() {
  const total = students.length;
  const totalMarks = students.reduce((sum, s) => sum + s.marks, 0);
  const avgMarks = total > 0 ? (totalMarks / total).toFixed(1) : 0;
  const highest = total > 0 ? Math.max(...students.map(s => s.marks)) : 0;
  const passCount = students.filter(s => s.marks >= 40).length;
  const passRate = total > 0 ? ((passCount / total) * 100).toFixed(0) : 0;

  totalStudentsEl.textContent = total;
  avgMarksEl.textContent = avgMarks;
  highestMarksEl.textContent = highest;
  passRateEl.textContent = passRate + '%';
}

/**
 * Get Grade from Marks
 */
function getGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
}

/**
 * Get Grade CSS Class
 */
function getGradeClass(marks) {
  if (marks >= 80) return 'grade-a';
  if (marks >= 70) return 'grade-b';
  if (marks >= 60) return 'grade-c';
  if (marks >= 40) return 'grade-d';
  return 'grade-f';
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
