document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('agro-contact-form');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic visual feedback
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // Simulate API call
        setTimeout(() => {
            submitBtn.style.background = '#2e7d32';
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Inquiry Sent Successfully!';

            // Clear form
            contactForm.reset();

            // Restore button after delay
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                submitBtn.textContent = originalText;
            }, 3000);
        }, 1500);
    });
});
