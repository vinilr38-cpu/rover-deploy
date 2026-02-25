document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const authToggle = document.getElementById('auth-toggle');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('submit-btn');
    const statusEl = document.getElementById('status');

    // Inputs
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const confirmPassInput = document.getElementById('confirm-password');

    let currentMode = 'login';


    // --- Helper: Show status message ---
    const showStatus = (msg, isError = true) => {
        if (statusEl) {
            statusEl.textContent = msg;
            statusEl.style.color = isError ? '#ff5252' : '#4caf50';
        }
    };

    // --- Toggle Login / Signup ---
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            if (mode === currentMode) return;

            currentMode = mode;
            authToggle.classList.toggle('signup-mode');
            showStatus(''); // clear any error message

            if (currentMode === 'signup') {
                authTitle.textContent = 'Create Account';
                authSubtitle.textContent = 'Join AgroVision to start monitoring';
                submitBtn.textContent = 'Register Now';
                if (confirmPassInput) confirmPassInput.setAttribute('required', 'true');
            } else {
                authTitle.textContent = 'Welcome Back';
                authSubtitle.textContent = 'Please enter your details to login';
                submitBtn.textContent = 'Login to System';
                if (confirmPassInput) confirmPassInput.removeAttribute('required');
            }

            // Clear field error highlights
            document.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));
        });
    });

    // --- Validation Helpers ---
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const setError = (inputEl, msg) => {
        const group = inputEl.closest('.form-group');
        if (!group) return;
        group.classList.add('error');
        const span = group.querySelector('.error-msg');
        if (span && msg) span.textContent = msg;
    };

    const clearError = (inputEl) => {
        const group = inputEl.closest('.form-group');
        if (group) group.classList.remove('error');
    };

    // --- Real-time Error Clearing ---
    [emailInput, passInput, confirmPassInput].forEach(input => {
        if (!input) return;
        input.addEventListener('input', () => clearError(input));
    });

    // --- Form Submission ---
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showStatus('');

        let isValid = true;
        document.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

        if (!validateEmail(emailInput.value)) {
            setError(emailInput, 'Please enter a valid email address.');
            isValid = false;
        }

        if (passInput.value.length < 6) {
            setError(passInput, 'Password must be at least 6 characters.');
            isValid = false;
        }

        if (currentMode === 'signup' && confirmPassInput && confirmPassInput.value !== passInput.value) {
            setError(confirmPassInput, 'Passwords do not match.');
            isValid = false;
        }

        if (!isValid) return;

        // Disable button while processing
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;


        try {
            if (currentMode === 'login') {
                // ---- LOGIN ----
                const res = await fetch(`/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailInput.value,
                        password: passInput.value
                    })
                });

                const data = await res.json();

                if (data.status === 'success') {
                    localStorage.setItem('agrovision-role', data.role);
                    localStorage.setItem('agrovision-user', emailInput.value);
                    showStatus('Login successful! Redirecting...', false);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                } else {
                    showStatus('Invalid email or password. Please try again.');
                    submitBtn.textContent = 'Login to System';
                    submitBtn.disabled = false;
                }

            } else {
                // ---- SIGNUP ----
                const roleInput = document.getElementById('role');
                const signupData = {
                    email: emailInput.value,
                    password: passInput.value,
                    role: roleInput ? roleInput.value : 'farmer'
                };

                const res = await fetch(`/api/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(signupData)
                });

                const data = await res.json();

                if (data.status === 'success') {
                    localStorage.setItem('agrovision-role', signupData.role);
                    localStorage.setItem('agrovision-user', signupData.email);
                    showStatus('Registration successful! Redirecting...', false);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                } else {
                    showStatus(data.message || 'Registration failed. Please try again.');
                    submitBtn.textContent = 'Register Now';
                    submitBtn.disabled = false;
                }
            }

        } catch (error) {
            console.error('Auth error:', error);
            showStatus('Connection failed. Please ensure the backend server is running.');
            submitBtn.textContent = currentMode === 'login' ? 'Login to System' : 'Register Now';
            submitBtn.disabled = false;
        }
    });
});
