document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const feedback = document.getElementById('feedback');
    const loader = document.getElementById('loader');
    const registrationForm = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');

    let isUsernameAvailable = false;
    let debounceTimer;

    usernameInput.addEventListener('input', () => {
        const username = usernameInput.value.trim();
        
        // Clear previous state
        clearFeedback();
        isUsernameAvailable = false;
        submitBtn.disabled = true;

        if (username.length === 0) {
            return;
        }

        // Debounce to avoid too many requests
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            checkUsernameAvailability(username);
        }, 500);
    });

    async function checkUsernameAvailability(username) {
        showLoader();
        
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const response = await fetch('users.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            const existingUsers = data.usernames;

            if (existingUsers.includes(username.toLowerCase())) {
                setFeedback('Username already taken', 'taken');
                isUsernameAvailable = false;
            } else {
                setFeedback('Username available', 'available');
                isUsernameAvailable = true;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error fetching usernames:', error);
            setFeedback('Error validating username', 'taken');
        } finally {
            hideLoader();
        }
    }

    function setFeedback(message, className) {
        feedback.textContent = message;
        feedback.className = `feedback ${className}`;
    }

    function clearFeedback() {
        feedback.textContent = '';
        feedback.className = 'feedback';
    }

    function showLoader() {
        loader.classList.remove('hidden');
    }

    function hideLoader() {
        loader.classList.add('hidden');
    }

    registrationForm.addEventListener('submit', (event) => {
        if (!isUsernameAvailable) {
            event.preventDefault();
            alert('Please choose an available username.');
        } else {
            event.preventDefault(); // For demo purposes prevent actual redirect
            alert('Registration successful!');
        }
    });
});
