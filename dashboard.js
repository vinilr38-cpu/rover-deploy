document.addEventListener('DOMContentLoaded', () => {
    // ─────────────── THEME ENGINE ───────────────
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Save/Load preference
    if (localStorage.getItem('agro-theme') === 'dark') body.classList.add('dark-mode');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const icon = themeBtn.querySelector('i');
            if (body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
                localStorage.setItem('agro-theme', 'dark');
            } else {
                icon.className = 'fas fa-moon';
                localStorage.setItem('agro-theme', 'light');
            }
        });
    }

    // ─────────────── DATA FETCHING ───────────────
    const loadingOverlay = document.getElementById('loading-overlay');
    const warning = document.getElementById('connection-warning');

    // DOM Elements
    const tempEl = document.getElementById('temp');
    const humEl = document.getElementById('humidity');
    const soilEl = document.getElementById('soil');
    const sprayEl = document.getElementById('spray');
    const pestEl = document.getElementById('pest-count');
    const lastUpdEl = document.getElementById('last-updated');

    // ─────────────── CHART SYSTEM ───────────────
    const ctx = document.getElementById('sensorChart');
    let sensorChart;

    const initChart = (historyData) => {
        if (!ctx) return;

        const labels = historyData.map(d => d.timestamp.split(' ')[1]).reverse();
        const temps = historyData.map(d => d.temperature).reverse();
        const hums = historyData.map(d => d.humidity).reverse();

        const isDark = body.classList.contains('dark-mode');
        const textColor = isDark ? '#a1b0a8' : '#5c6b62';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        sensorChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: temps,
                        borderColor: '#2e7d32',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: '#2e7d32'
                    },
                    {
                        label: 'Humidity (%)',
                        data: hums,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: '#3b82f6'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: textColor, font: { family: 'Outfit', weight: '600' } }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    }
                },
                animations: {
                    tension: { duration: 1000, easing: 'linear' }
                }
            }
        });
    };

    const updateDashboard = async () => {
        try {
            // Fetch live summary
            const dataRes = await fetch(`/api/data`);
            if (dataRes.ok) {
                const data = await dataRes.json();
                if (tempEl) tempEl.innerText = data.temperature;
                if (tempEl) tempEl.innerText = data.temperature + ' °C';
                if (humEl) humEl.innerText = data.humidity + ' %';
                if (soilEl) {
                    soilEl.innerText = Math.round(data.soil_moisture) + ' %';

                    // Irrigation Warning Logic
                    const alertBox = document.getElementById("alertBox");
                    if (data.soil_moisture < 35) {
                        soilEl.style.color = "red";
                        if (alertBox) {
                            alertBox.className = "alert-box";
                            alertBox.innerText = "⚠ Soil moisture is low! Turn on irrigation.";
                        }

                        // Prevent alert storm - only alert if it wasn't already low
                        if (!window.soilWasLow) {
                            alert("⚠ Soil moisture is low! Irrigation required.");
                            window.soilWasLow = true;
                        }
                    } else {
                        soilEl.style.color = "";
                        if (alertBox) {
                            alertBox.innerText = "";
                            alertBox.className = "";
                        }
                        window.soilWasLow = false;
                    }
                }
                if (sprayEl) sprayEl.innerText = data.spray_status;
                if (pestEl) pestEl.innerText = data.pest_count;
                if (lastUpdEl) lastUpdEl.innerText = data.last_updated.split(' ')[1];

                if (warning) warning.style.display = 'none';
                if (loadingOverlay) loadingOverlay.style.opacity = '0';
                setTimeout(() => { if (loadingOverlay) loadingOverlay.style.display = 'none'; }, 300);
            }

            // Fetch history for graph
            const histRes = await fetch(`/api/history`);
            if (histRes.ok) {
                const history = await histRes.json();
                if (!sensorChart) {
                    initChart(history);
                } else {
                    sensorChart.data.labels = history.map(d => d.timestamp.split(' ')[1]).reverse();
                    sensorChart.data.datasets[0].data = history.map(d => d.temperature).reverse();
                    sensorChart.data.datasets[1].data = history.map(d => d.humidity).reverse();
                    sensorChart.update('none'); // Update without animation for jitter-free live feel
                }
            }
        } catch (err) {
            console.error('Backend connection failed:', err);
            warning.style.display = 'flex';
        }
    };

    // Role-based Access (Admin check)
    const userRole = localStorage.getItem('agrovision-role');
    const adminPanel = document.getElementById('admin-panel');
    if (userRole === 'admin' && adminPanel) {
        adminPanel.style.display = 'block';
    }

    // Initial load and loop
    updateDashboard();
    setInterval(updateDashboard, 5000);
});
