let currentStage = 1;
const totalStages = 4;
const formData = {};

// DOM Elements
const progressBar = document.getElementById('progress-bar');
const form = document.getElementById('multi-step-form');

// Update Progress Bar
function updateProgress() {
    const percent = (currentStage / totalStages) * 100;
    progressBar.style.width = percent + '%';
}

// Navigation Logic
window.nextStage = function() {
    if (validateStage(currentStage)) {
        saveData(currentStage);
        
        // Hide current
        document.getElementById(`stage-${currentStage}`).classList.add('hidden');
        
        // Increment
        currentStage++;
        
        // Show next
        document.getElementById(`stage-${currentStage}`).classList.remove('hidden');
        updateProgress();

        // If reaching summary (Stage 4), populate it
        if (currentStage === 4) {
            renderSummary();
        }
    }
};

window.prevStage = function() {
    document.getElementById(`stage-${currentStage}`).classList.add('hidden');
    currentStage--;
    document.getElementById(`stage-${currentStage}`).classList.remove('hidden');
    updateProgress();
};

// Validation Logic
function validateStage(stage) {
    let isValid = true;
    const container = document.getElementById(`stage-${stage}`);
    const inputs = container.querySelectorAll('input, select');

    inputs.forEach(input => {
        let fieldValid = true;

        if (input.hasAttribute('required') && !input.value.trim()) {
            fieldValid = false;
        }

        if (input.type === 'checkbox' && input.id === 'terms' && !input.checked) {
            fieldValid = false;
        }

        if (input.type === 'email' && input.value) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) fieldValid = false;
        }

        if (input.type === 'tel' && input.value) {
             if (!/^[0-9]{10}$/.test(input.value)) fieldValid = false;
        }

        if (input.getAttribute('minlength') && input.value.length < input.getAttribute('minlength')) {
            fieldValid = false;
        }

        // Visual Feedback
        if (!fieldValid) {
            input.classList.add('invalid');
            isValid = false;
        } else {
            input.classList.remove('invalid');
        }
    });

    return isValid;
}

// Store Data Temporary
function saveData(stage) {
    const container = document.getElementById(`stage-${stage}`);
    const inputs = container.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
             formData[input.id] = input.checked;
        } else {
             formData[input.id] = input.value;
        }
    });
}

// Render Summary
function renderSummary() {
    const summary = document.getElementById('summary-content');
    summary.innerHTML = `
        <p><strong>Username:</strong> ${formData.username}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Name:</strong> ${formData.fullname}</p>
        <p><strong>Phone:</strong> ${formData.phone || 'N/A'}</p>
        <p><strong>Notification:</strong> ${formData.notification}</p>
    `;
}

// Final Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Form Submitted Successfully!\nData: ' + JSON.stringify(formData, null, 2));
    location.reload(); // Reset
});