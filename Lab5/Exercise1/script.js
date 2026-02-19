/**
 * Employee Management System - XML CRUD Operations
 * Lab 5 - Exercise 1
 */

const XML_URL = 'employees.xml';

// State
let employees = [];
let xmlDoc = null;
let isEditing = false;
let editingId = null;

// DOM Elements
const form = document.getElementById('employee-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const refreshBtn = document.getElementById('refresh-btn');
const tbody = document.getElementById('employees-tbody');
const loadingEl = document.getElementById('loading');
const emptyStateEl = document.getElementById('empty-state');
const errorStateEl = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const toast = document.getElementById('toast');

// Stats elements
const totalEmployeesEl = document.getElementById('total-employees');
const avgSalaryEl = document.getElementById('avg-salary');
const totalPayrollEl = document.getElementById('total-payroll');

// Form inputs
const empIdInput = document.getElementById('empId');
const empNameInput = document.getElementById('empName');
const empDeptInput = document.getElementById('empDept');
const empSalaryInput = document.getElementById('empSalary');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchEmployees();
  setupEventListeners();
});

function setupEventListeners() {
  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', resetForm);
  refreshBtn.addEventListener('click', fetchEmployees);
}

/**
 * AJAX Request to Fetch XML using XMLHttpRequest
 */
function fetchEmployees() {
  showLoading(true);
  hideError();

  const xhr = new XMLHttpRequest();
  xhr.open('GET', XML_URL, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      showLoading(false);

      if (xhr.status === 200) {
        try {
          // Get responseXML directly
          xmlDoc = xhr.responseXML;

          // Handle empty or malformed XML
          if (!xmlDoc || !xmlDoc.documentElement) {
            throw new Error('Empty or malformed XML response');
          }

          // Check for parser errors
          const parserError = xmlDoc.querySelector('parsererror');
          if (parserError) {
            throw new Error('XML parsing error: ' + parserError.textContent);
          }

          parseXMLData();
          renderTable();
          updateStats();
          showToast('Employees loaded successfully!', 'success');
        } catch (error) {
          console.error('XML Parse Error:', error);
          showError('Failed to parse XML: ' + error.message);
        }
      } else if (xhr.status === 404) {
        showError('XML file not found (404)');
      } else if (xhr.status === 500) {
        showError('Server error (500)');
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
 * Parse XML Data using getElementsByTagName
 */
function parseXMLData() {
  employees = [];
  
  // Use getElementsByTagName to get all employee nodes
  const employeeNodes = xmlDoc.getElementsByTagName('employee');

  for (let i = 0; i < employeeNodes.length; i++) {
    const node = employeeNodes[i];
    
    // Extract data using getElementsByTagName for each field
    const id = node.getElementsByTagName('id')[0]?.textContent || '';
    const name = node.getElementsByTagName('name')[0]?.textContent || '';
    const department = node.getElementsByTagName('department')[0]?.textContent || '';
    const salary = parseFloat(node.getElementsByTagName('salary')[0]?.textContent) || 0;

    employees.push({ id, name, department, salary });
  }
}

/**
 * Handle Form Submit (Create/Update)
 */
function handleSubmit(e) {
  e.preventDefault();

  const employeeData = {
    id: empIdInput.value.trim(),
    name: empNameInput.value.trim(),
    department: empDeptInput.value,
    salary: parseFloat(empSalaryInput.value)
  };

  if (!validateEmployee(employeeData)) return;

  if (isEditing) {
    updateEmployee(employeeData);
  } else {
    createEmployee(employeeData);
  }
}

/**
 * Validate Employee Data
 */
function validateEmployee(data) {
  if (!data.id || data.id.length < 3) {
    showToast('Employee ID must be at least 3 characters', 'warning');
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
  if (data.salary < 0) {
    showToast('Salary cannot be negative', 'warning');
    return false;
  }
  if (!isEditing && employees.some(e => e.id === data.id)) {
    showToast('Employee ID already exists!', 'error');
    return false;
  }
  return true;
}

/**
 * CREATE - Add new employee node to XML DOM
 */
function createEmployee(data) {
  try {
    // Create new employee node in XML DOM
    const employeesRoot = xmlDoc.getElementsByTagName('employees')[0];
    
    // Create employee element
    const newEmployee = xmlDoc.createElement('employee');
    
    // Create child elements
    const idEl = xmlDoc.createElement('id');
    idEl.textContent = data.id;
    
    const nameEl = xmlDoc.createElement('name');
    nameEl.textContent = data.name;
    
    const deptEl = xmlDoc.createElement('department');
    deptEl.textContent = data.department;
    
    const salaryEl = xmlDoc.createElement('salary');
    salaryEl.textContent = data.salary;
    
    // Append children to employee node
    newEmployee.appendChild(idEl);
    newEmployee.appendChild(nameEl);
    newEmployee.appendChild(deptEl);
    newEmployee.appendChild(salaryEl);
    
    // Append to root
    employeesRoot.appendChild(newEmployee);
    
    // Update local array
    employees.push(data);
    
    renderTable();
    updateStats();
    resetForm();
    showToast(`Employee "${data.name}" added successfully!`, 'success');
  } catch (error) {
    console.error('Create error:', error);
    showToast('Failed to add employee: ' + error.message, 'error');
  }
}

/**
 * UPDATE - Modify employee node in XML DOM
 */
function updateEmployee(data) {
  try {
    const employeeNodes = xmlDoc.getElementsByTagName('employee');
    
    for (let i = 0; i < employeeNodes.length; i++) {
      const node = employeeNodes[i];
      const nodeId = node.getElementsByTagName('id')[0]?.textContent;
      
      if (nodeId === editingId) {
        // Update XML DOM nodes
        node.getElementsByTagName('id')[0].textContent = data.id;
        node.getElementsByTagName('name')[0].textContent = data.name;
        node.getElementsByTagName('department')[0].textContent = data.department;
        node.getElementsByTagName('salary')[0].textContent = data.salary;
        break;
      }
    }
    
    // Update local array
    const index = employees.findIndex(e => e.id === editingId);
    if (index !== -1) {
      employees[index] = data;
    }
    
    renderTable();
    updateStats();
    resetForm();
    showToast(`Employee "${data.name}" updated successfully!`, 'success');
  } catch (error) {
    console.error('Update error:', error);
    showToast('Failed to update employee: ' + error.message, 'error');
  }
}

/**
 * DELETE - Remove employee node from XML DOM
 */
function deleteEmployee(id) {
  if (!confirm('Are you sure you want to delete this employee?')) return;

  try {
    const employeeNodes = xmlDoc.getElementsByTagName('employee');
    
    for (let i = 0; i < employeeNodes.length; i++) {
      const node = employeeNodes[i];
      const nodeId = node.getElementsByTagName('id')[0]?.textContent;
      
      if (nodeId === id) {
        // Remove from XML DOM
        node.parentNode.removeChild(node);
        break;
      }
    }
    
    // Update local array
    const deletedEmployee = employees.find(e => e.id === id);
    employees = employees.filter(e => e.id !== id);
    
    renderTable();
    updateStats();
    
    if (isEditing && editingId === id) {
      resetForm();
    }
    
    showToast(`Employee "${deletedEmployee?.name}" deleted successfully!`, 'success');
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Failed to delete employee: ' + error.message, 'error');
  }
}

/**
 * Edit Employee - Populate form
 */
function editEmployee(id) {
  const employee = employees.find(e => e.id === id);
  if (!employee) {
    showToast('Employee not found!', 'error');
    return;
  }

  empIdInput.value = employee.id;
  empNameInput.value = employee.name;
  empDeptInput.value = employee.department;
  empSalaryInput.value = employee.salary;

  isEditing = true;
  editingId = id;
  formTitle.textContent = 'Edit Employee';
  submitBtn.querySelector('.btn-text').textContent = 'Update Employee';
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
  formTitle.textContent = 'Add New Employee';
  submitBtn.querySelector('.btn-text').textContent = 'Add Employee';
  cancelBtn.style.display = 'none';
}

/**
 * Render Table
 */
function renderTable() {
  if (employees.length === 0) {
    tbody.innerHTML = '';
    emptyStateEl.style.display = 'flex';
    return;
  }

  emptyStateEl.style.display = 'none';
  
  tbody.innerHTML = employees.map(emp => `
    <tr class="fade-in">
      <td><strong>${escapeHtml(emp.id)}</strong></td>
      <td>${escapeHtml(emp.name)}</td>
      <td>${escapeHtml(emp.department)}</td>
      <td>$${emp.salary.toLocaleString()}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-edit" onclick="editEmployee('${escapeHtml(emp.id)}')">Edit</button>
          <button class="btn btn-delete" onclick="deleteEmployee('${escapeHtml(emp.id)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Update Statistics
 */
function updateStats() {
  const total = employees.length;
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
  const avgSalary = total > 0 ? totalSalary / total : 0;

  totalEmployeesEl.textContent = total;
  avgSalaryEl.textContent = '$' + Math.round(avgSalary).toLocaleString();
  totalPayrollEl.textContent = '$' + totalSalary.toLocaleString();
}

/**
 * UI State Helpers
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
