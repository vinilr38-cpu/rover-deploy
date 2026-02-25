document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    const statusText = document.querySelector('.status-text');
    const statusDot = document.querySelector('.status-dot');

    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    mobileToggle.addEventListener('click', () => {
        // Toggle logic for mobile menu (simple alert or class toggle can be added here)
        alert('Mobile menu clicked! In a full implementation, this would open a slide-out drawer.');
    });

    // Simulate system status variations
    const statuses = [
        { text: 'System Online', color: '#4caf50' },
        { text: 'Scanning Field...', color: '#2196f3' },
        { text: 'Pest Detected', color: '#f44336' },
        { text: 'Spraying Active', color: '#ffa000' }
    ];

    let currentStatusIdx = 0;
    setInterval(() => {
        currentStatusIdx = (currentStatusIdx + 1) % statuses.length;
        const status = statuses[currentStatusIdx];
        
        statusText.style.opacity = '0';
        setTimeout(() => {
            statusText.textContent = status.text;
            statusDot.style.backgroundColor = status.color;
            statusText.style.opacity = '1';
        }, 500);
    }, 5000);

    // Smooth reveal animations on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.about-card, .feature-item, .flow-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // Add hidden classes to be handled by CSS or JS reveal
    document.addEventListener('scroll', () => {
        document.querySelectorAll('.about-card, .feature-item, .flow-card').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    });
});
