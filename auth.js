document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const authToggle = document.getElementById('auth-toggle');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('submit-btn');

    // Inputs
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const confirmPassInput = document.getElementById('confirm-password');

    let currentMode = 'login';

    // Toggle logic
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            if (mode === currentMode) return;

            currentMode = mode;
            authToggle.classList.toggle('signup-mode');

            if (currentMode === 'signup') {
                authTitle.textContent = 'Create Account';
                authSubtitle.textContent = 'Join AgroVision to start monitoring';
                submitBtn.textContent = 'Register Now';
                confirmPassInput.setAttribute('required', 'true');
            } else {
                authTitle.textContent = 'Welcome Back';
                authSubtitle.textContent = 'Please enter your details to login';
                submitBtn.textContent = 'Login to System';
                confirmPassInput.removeAttribute('required');
            }

            // Clear errors when toggling
            document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
        });
    });

    // Validation
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const showError = (input, msg) => {
        const group = input.parentElement;
        group.classList.add('error');
        if (msg) group.querySelector('.error-msg').textContent = msg;
    };

    const clearError = (input) => {
        input.parentElement.classList.remove('error');
    };

    // Form Submission
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Reset errors
        document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));

        // Validate Email
        if (!validateEmail(emailInput.value)) {
            showError(emailInput);
            isValid = false;
        }

        // Validate Password
        if (passInput.value.length < 6) {
            showError(passInput);
            isValid = false;
        }

        // Validate Confirm Password (Signup only)
        if (currentMode === 'signup' && confirmPassInput.value !== passInput.value) {
            showError(confirmPassInput);
            isValid = false;
        }

        if (isValid) {
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            if (currentMode === 'login') {
                const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? 'http://localhost:5000'
                    : `${window.location.protocol}//${window.location.hostname}:5000`;

                fetch(`${baseUrl}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailInput.value,
                        password: passInput.value
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'success') {
                            localStorage.setItem('agrovision-role', data.role);
                            localStorage.setItem('agrovision-user', emailInput.value);
                            alert(`Login successful! Redirecting to dashboard...`);
                            window.location.href = 'dashboard.html';
                        } else {
                            alert('Login failed! Invalid email or password.');
                            submitBtn.textContent = 'Login to System';
                            submitBtn.disabled = false;
                        }
                    })
                    .catch(error => {
                        console.error('Login error:', error);
                        alert('Connection failed! Please ensure the backend server is running and accessible.');
                        submitBtn.textContent = 'Login to System';
                        submitBtn.disabled = false;
                    });
            } else {
                // Simulate signup for now
                setTimeout(() => {
                    alert('Registration successful! Redirecting to dashboard...');
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        }
    });

    // Real-time error clearing
    [emailInput, passInput, confirmPassInput].forEach(input => {
        input.addEventListener('input', () => {
            if (input.parentElement.classList.contains('error')) {
                clearError(input);
            }
        });
    });
});
