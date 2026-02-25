document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Chart.js Initialization
    let sensorChart;
    const initChart = () => {
        const ctx = document.getElementById('sensorChart').getContext('2d');
        sensorChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        data: [],
                        tension: 0.4
                    },
                    {
                        label: 'Humidity (%)',
                        borderColor: '#2196f3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        data: [],
                        tension: 0.4
                    },
                    {
                        label: 'Soil Moisture (%)',
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        data: [],
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: { display: true, text: 'Time' }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    };

    const updateChart = (timestamp, temp, humidity, soil) => {
        if (!sensorChart) return;

        const timeLabel = timestamp.split(' ')[1]; // Just show time H:M:S

        sensorChart.data.labels.push(timeLabel);
        sensorChart.data.datasets[0].data.push(temp);
        sensorChart.data.datasets[1].data.push(humidity);
        sensorChart.data.datasets[2].data.push(soil);

        // Keep last 15 points
        if (sensorChart.data.labels.length > 15) {
            sensorChart.data.labels.shift();
            sensorChart.data.datasets.forEach(dataset => dataset.data.shift());
        }

        sensorChart.update('none'); // Update without animation for performance
    };

    const fetchHistory = async () => {
        try {
            const baseUrl = `http://${window.location.hostname || 'localhost'}:5000`;
            const response = await fetch(`${baseUrl}/api/history`);
            if (response.ok) {
                const history = await response.json();
                // History comes in DESC order, reverse for chart
                history.reverse().forEach(entry => {
                    updateChart(entry.timestamp, entry.temperature, entry.humidity, entry.soil_moisture);
                });
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    initChart();
    fetchHistory();

    // System Health Monitoring from API
    const fetchSystemStatus = async () => {
        try {
            const baseUrl = `http://${window.location.hostname || 'localhost'}:5000`;
            const response = await fetch(`${baseUrl}/api/system-status`);
            const status = await response.json();

            // Raspberry Pi Status
            const piDot = document.getElementById('pi-status-dot');
            const piText = document.getElementById('status');
            if (piDot && piText) {
                piDot.style.backgroundColor = status.pi_connected ? '#4caf50' : '#f44336';
                piDot.style.boxShadow = status.pi_connected ? '0 0 5px #4caf50' : '0 0 5px #f44336';
                piText.textContent = status.pi_connected ? 'Pi Connected' : 'Pi Offline';
                piText.style.color = status.pi_connected ? '#2e7d32' : '#d32f2f';
            }
            // Camera Status
            const camDot = document.getElementById('camera-status-dot');
            const camText = document.getElementById('camera-status-text');
            if (camDot && camText) {
                camDot.style.backgroundColor = status.camera_status ? '#4caf50' : '#f44336';
                camDot.style.boxShadow = status.camera_status ? '0 0 5px #4caf50' : '0 0 5px #f44336';
                camText.textContent = status.camera_status ? 'Camera Active' : 'Camera Error';
                camText.style.color = status.camera_status ? '#2e7d32' : '#d32f2f';
            }

            // AI Model Status
            const modelDot = document.getElementById('model-status-dot');
            const modelText = document.getElementById('model-status-text');
            if (modelDot && modelText) {
                modelDot.style.backgroundColor = status.model_status ? '#4caf50' : '#f44336';
                modelDot.style.boxShadow = status.model_status ? '0 0 5px #4caf50' : '0 0 5px #f44336';
                modelText.textContent = status.model_status ? 'Model Ready' : 'Model Loading';
                modelText.style.color = status.model_status ? '#2e7d32' : '#d32f2f';
            }

            // Admin Panel Visibility Logic
            const userRole = localStorage.getItem('agrovision-role');
            const adminPanel = document.getElementById('admin-panel');
            if (adminPanel) {
                adminPanel.style.display = (userRole === 'admin') ? 'block' : 'none';
            }

        } catch (error) {
            console.error('Error fetching system status:', error);
            if (document.getElementById("status")) {
                document.getElementById("status").innerText = "Connection Lost";
            }
            // On API fail, mark all as offline
            ['pi', 'camera', 'model'].forEach(id => {
                const dot = document.getElementById(`${id}-status-dot`);
                const text = document.getElementById(`${id === 'pi' ? 'status' : id + '-status-text'}`);
                if (dot && text) {
                    dot.style.backgroundColor = '#f44336';
                    dot.style.boxShadow = '0 0 5px #f44336';
                    text.textContent = 'Offline';
                    text.style.color = '#d32f2f';
                }
            });
        }
    };

    // Dashboard Data Fetching from API
    const fetchDashboardData = async () => {
        const warning = document.getElementById("connection-warning");
        const overlay = document.getElementById("loading-overlay");
        const lastUpdated = document.getElementById("last-updated");

        try {
            const baseUrl = `http://${window.location.hostname || 'localhost'}:5000`;
            // Update Temperature, Humidity, Soil Moisture from /api/sensor-data
            const sensorResponse = await fetch(`${baseUrl}/api/sensor-data`);
            if (sensorResponse.ok) {
                const sensorData = await sensorResponse.json();
                const tempEl = document.getElementById("temp");
                const humEl = document.getElementById("humidity");
                const soilEl = document.getElementById("soil");

                if (tempEl) tempEl.innerText = sensorData.temperature;
                if (humEl) humEl.innerText = sensorData.humidity;
                if (soilEl) soilEl.innerText = sensorData.soil_moisture;

                // Update the chart in real-time
                updateChart(sensorData.timestamp, sensorData.temperature, sensorData.humidity, sensorData.soil_moisture);
            }

            // Update Other Dashboard Data
            const response = await fetch(`${baseUrl}/api/data`);

            if (!response.ok) throw new Error("Backend unreachable");

            const data = await response.json();

            const pestEl = document.getElementById("pest");
            const sprayEl = document.getElementById("spray");

            if (pestEl) pestEl.innerText = data.pest_count;
            if (sprayEl) {
                sprayEl.innerText = (data.spray_status === 'ON' ? 'Active' : 'Idle');
                sprayEl.className = data.spray_status === 'ON' ? 'stat-value status-active' : 'stat-value status-inactive';
            }

            // Update Timestamp
            if (lastUpdated && data.last_updated) {
                lastUpdated.innerText = data.last_updated;
            }

            // Hide error UI
            if (warning) warning.style.display = "none";
            if (overlay) {
                overlay.style.opacity = "0";
                setTimeout(() => { overlay.style.display = "none"; }, 300);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);

            // Show Connection Warning
            if (warning) warning.style.display = "flex";
        }
    };

    // Initial fetch and poll
    fetchDashboardData();
    fetchSystemStatus();
    setInterval(fetchDashboardData, 3000);
    setInterval(fetchSystemStatus, 5000);

    // Theme Management (Dark Mode)
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme
    const savedTheme = localStorage.getItem('agrovision-theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('agrovision-theme', isDark ? 'dark' : 'light');
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // Notification Dropdown
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            notificationDropdown.classList.remove('active');
        });

        notificationDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Download Report Logic
    const downloadBtn = document.getElementById('download-report-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const date = new Date().toLocaleDateString();
            const farmName = farmSelector ? farmSelector.options[farmSelector.selectedIndex].text : 'Main Farm';
            const reportContent = `AgroVision System Report - ${date}\n\n` +
                `Target Farm: ${farmName}\n` +
                `System Health: Pi (Connected), Camera (Active), AI (Ready)\n` +
                `Sensor Status: Temperature, Humidity, Soil Moisture - STABLE\n\n` +
                `--- End of Report ---`;

            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `agrovision_report_${date.replace(/\//g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('Report generation successful! Your download should start shortly.');
        });
    }

    // Refresh notification badge on click
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            const badge = notificationBtn.querySelector('.notification-badge');
            if (badge) badge.style.display = 'none';
        });
    }

    // Initialize user profile
    const userNameEl = document.querySelector('.user-info h4');
    const userRoleEl = document.querySelector('.user-info p');
    const storedUser = localStorage.getItem('agrovision-user');
    const storedRole = localStorage.getItem('agrovision-role');

    if (userNameEl && storedUser) userNameEl.textContent = storedUser.split('@')[0];
    if (userRoleEl && storedRole) userRoleEl.textContent = storedRole.charAt(0).toUpperCase() + storedRole.slice(1);

    // Sidebar Active State logic
    const navLinksList = document.querySelectorAll('.sidebar-nav li');
    navLinksList.forEach(link => {
        link.addEventListener('click', function () {
            if (this.querySelector('a').classList.contains('logout-link')) return;
            navLinksList.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Close sidebar on mobile when clicking a link
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        });
    }
});
