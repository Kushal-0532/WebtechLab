// 1. Structure to store questions
const surveyData = [
    {
        id: 'q1',
        type: 'text',
        label: 'What is your full name?',
        required: true,
        validation: { minLength: 3, maxLength: 50 }
    },
    {
        id: 'q2',
        type: 'number',
        label: 'How old are you?',
        required: true,
        validation: { min: 18, max: 100 }
    },
    {
        id: 'q3',
        type: 'radio',
        label: 'How often do you shop online?',
        required: true,
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely']
    },
    {
        id: 'q4',
        type: 'checkbox',
        label: 'Which product categories interest you? (Select at least 2)',
        required: true,
        options: ['Electronics', 'Fashion', 'Home & Garden', 'Books', 'Sports'],
        validation: { minSelect: 2 }
    },
    {
        id: 'q5',
        type: 'textarea',
        label: 'Any feedback for us?',
        required: false,
        validation: { maxLength: 200 }
    }
];

const container = document.getElementById('survey-container');
const form = document.getElementById('survey-form');
const statusEl = document.getElementById('form-status');

// 2. Dynamically generate form fields
function initSurvey() {
    container.innerHTML = surveyData.map(q => createQuestionHTML(q)).join('');
}

function createQuestionHTML(question) {
    let inputHTML = '';

    if (question.type === 'text' || question.type === 'number') {
        inputHTML = `<input type="${question.type}" id="${question.id}" name="${question.id}" placeholder="Type here...">`;
    } else if (question.type === 'textarea') {
        inputHTML = `<textarea id="${question.id}" name="${question.id}" placeholder="Type here..."></textarea>`;
    } else if (question.type === 'radio' || question.type === 'checkbox') {
        inputHTML = `<div class="option-group">` + 
            question.options.map((opt, idx) => `
                <label class="option-item">
                    <input type="${question.type}" name="${question.id}" value="${opt}">
                    ${opt}
                </label>
            `).join('') + 
            `</div>`;
    }

    return `
        <div class="question-group" id="group-${question.id}" data-id="${question.id}">
            <label class="q-label" for="${question.id}">
                ${question.label} ${question.required ? '<span class="required-mark">*</span>' : ''}
            </label>
            ${inputHTML}
            <div class="error-message" id="error-${question.id}"></div>
        </div>
    `;
}

// 3. & 4. Validation Functions
function validateField(question) {
    const group = document.getElementById(`group-${question.id}`);
    const errorEl = document.getElementById(`error-${question.id}`);
    let isValid = true;
    let msg = '';

    // Get value(s)
    let value;
    if (question.type === 'radio' || question.type === 'checkbox') {
        const checked = document.querySelectorAll(`input[name="${question.id}"]:checked`);
        value = Array.from(checked).map(c => c.value);
    } else {
        value = document.getElementById(question.id).value.trim();
    }

    // Required Check
    if (question.required) {
        if ((Array.isArray(value) && value.length === 0) || (!Array.isArray(value) && value === '')) {
            isValid = false;
            msg = 'This field is required.';
        }
    }

    // Specific Validations
    if (isValid && value.length > 0) { // Only check if not empty (or if empty is allowed)
        if (question.type === 'text' && question.validation) {
            if (question.validation.minLength && value.length < question.validation.minLength) {
                isValid = false;
                msg = `Minimum ${question.validation.minLength} characters required.`;
            }
        }
        if (question.type === 'number' && question.validation) {
            const num = Number(value);
            if (question.validation.min && num < question.validation.min) {
                isValid = false;
                msg = `Minimum value is ${question.validation.min}.`;
            }
            if (question.validation.max && num > question.validation.max) {
                isValid = false;
                msg = `Maximum value is ${question.validation.max}.`;
            }
        }
        if (question.type === 'checkbox' && question.validation) {
            if (question.validation.minSelect && value.length < question.validation.minSelect) {
                isValid = false;
                msg = `Please select at least ${question.validation.minSelect} options.`;
            }
        }
        if (question.type === 'textarea' && question.validation) {
             if (question.validation.maxLength && value.length > question.validation.maxLength) {
                isValid = false;
                msg = `Maximum ${question.validation.maxLength} characters allowed.`;
            }
        }
    }

    // 5. DOM Manipulation for Feedback
    if (!isValid) {
        group.classList.add('error');
        group.classList.remove('success');
        errorEl.textContent = msg;
    } else {
        group.classList.remove('error');
        group.classList.add('success');
        errorEl.textContent = '';
    }

    return isValid;
}

// Event Listeners for Real-time Validation
form.addEventListener('input', (e) => {
    // Find which question belongs to the target
    let targetId = e.target.name; 
    const question = surveyData.find(q => q.id === targetId);
    if (question) validateField(question);
});

// 6. Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isFormValid = true;
    surveyData.forEach(q => {
        if (!validateField(q)) {
            isFormValid = false;
        }
    });

    if (isFormValid) {
        statusEl.textContent = "Survey Submitted Successfully!";
        statusEl.style.color = "green";
        form.reset();
        document.querySelectorAll('.question-group').forEach(el => el.classList.remove('success', 'error'));
    } else {
        statusEl.textContent = "Please fix the errors above.";
        statusEl.style.color = "red";
    }
});

// Initialize
initSurvey();