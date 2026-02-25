document.addEventListener('DOMContentLoaded', () => {
    // Utility function for consistent colors
    const colors = {
        primary: '#2e7d32',
        secondary: '#4caf50',
        danger: '#f44336',
        warning: '#ffa000',
        info: '#2196f3',
        purple: '#9c27b0',
        gray: '#888'
    };

    // 1. Pest Detection Line Chart
    const pestCtx = document.getElementById('pestLineChart').getContext('2d');

    async function initPestChart() {
        try {
            const response = await fetch(`/api/history`);
            const historyData = await response.json();

            const labels = historyData.map(d => d.timestamp.split(' ')[1]).reverse();
            const data = historyData.map(d => d.temperature).reverse();

            new Chart(pestCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Pest Occurrences',
                        data: data,
                        borderColor: colors.danger,
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                        x: { grid: { display: false } }
                    }
                }
            });
        } catch (error) {
            console.error("Error loading pest history:", error);
            if (document.getElementById("status")) {
                document.getElementById("status").innerText = "Connection Lost";
            }
        }
    }

    initPestChart();

    // 2. Spray Usage Bar Chart
    const sprayCtx = document.getElementById('sprayBarChart').getContext('2d');
    new Chart(sprayCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Litres Used',
                data: [5.2, 8.1, 2.3, 4.5, 9.2, 1.5, 3.4],
                backgroundColor: colors.primary,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                x: { grid: { display: false } }
            }
        }
    });

    // 3. Pest Type Distribution Pie Chart
    const typeCtx = document.getElementById('pestTypePieChart').getContext('2d');
    new Chart(typeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Aphids', 'Caterpillars', 'Bells', 'Others'],
            datasets: [{
                data: [45, 25, 20, 10],
                backgroundColor: [colors.danger, colors.warning, colors.info, colors.gray],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            cutout: '70%'
        }
    });

    // 4. Crop Health Area Chart
    const healthCtx = document.getElementById('healthAreaChart').getContext('2d');
    new Chart(healthCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [{
                label: 'Health Index',
                data: [82, 85, 78, 92, 88, 95],
                borderColor: colors.primary,
                backgroundColor: 'rgba(46, 125, 50, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 100,
                    grid: { borderDash: [5, 5] }
                },
                x: { grid: { display: false } }
            }
        }
    });
});
