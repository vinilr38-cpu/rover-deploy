document.addEventListener('DOMContentLoaded', () => {
    const historyBody = document.getElementById('history-body');
    const searchInput = document.getElementById('history-search');

    // Fetch Real Historical Data from Backend
    const fetchHistoricalData = async () => {
        try {
            const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:5000'
                : `${window.location.protocol}//${window.location.hostname}:5000`;
            const response = await fetch(`${baseUrl}/api/history`);
            if (response.ok) {
                const historyData = await response.json();
                renderTable(historyData);

                // Update search logic with new data
                searchInput.oninput = (e) => {
                    const term = e.target.value.toLowerCase();
                    const filtered = historyData.filter(item =>
                        (item.timestamp && item.timestamp.includes(term)) ||
                        (item.temperature && item.temperature.toString().includes(term)) ||
                        (item.humidity && item.humidity.toString().includes(term))
                    );
                    renderTable(filtered);
                };
            }
        } catch (error) {
            console.error("Error loading historical data:", error);
            historyBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#f44336;">Failed to load history. Connection Lost.</td></tr>';
        }
    };

    const renderTable = (data) => {
        historyBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight: 600;">${item.timestamp}</td>
                <td>${item.temperature}°C</td>
                <td>${item.humidity}%</td>
                <td>${item.soil_moisture}%</td>
            `;
            historyBody.appendChild(row);
        });
    };

    // Initial Fetch
    fetchHistoricalData();

    // Search Logic
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = historyData.filter(item =>
            item.pest.toLowerCase().includes(term) ||
            item.date.includes(term) ||
            item.spray.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });
});
