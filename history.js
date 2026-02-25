document.addEventListener('DOMContentLoaded', () => {
    const historyBody = document.getElementById('history-body');
    const searchInput = document.getElementById('history-search');

    // Fallback data shown when backend is unreachable
    const fallbackData = [
        { timestamp: '2026-02-25 14:00:00', temperature: 28, humidity: 65, soil_moisture: 52 },
        { timestamp: '2026-02-25 13:57:00', temperature: 27, humidity: 63, soil_moisture: 50 },
        { timestamp: '2026-02-25 13:54:00', temperature: 29, humidity: 68, soil_moisture: 55 },
        { timestamp: '2026-02-25 13:51:00', temperature: 26, humidity: 61, soil_moisture: 48 },
        { timestamp: '2026-02-25 13:48:00', temperature: 30, humidity: 70, soil_moisture: 58 }
    ];

    let currentData = [];

    const renderTable = (data) => {
        historyBody.innerHTML = '';
        if (!data || data.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#888;">No data available.</td></tr>';
            return;
        }
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight:600;">${item.timestamp || '—'}</td>
                <td>${item.temperature !== undefined ? item.temperature + '°C' : '—'}</td>
                <td>${item.humidity !== undefined ? item.humidity + '%' : '—'}</td>
                <td>${item.soil_moisture !== undefined ? item.soil_moisture + '%' : '—'}</td>
            `;
            historyBody.appendChild(row);
        });
    };

    const getBaseUrl = () => {
        const h = window.location.hostname;
        if (!h || h === 'localhost' || h === '127.0.0.1') return 'http://127.0.0.1:5000';
        return `${window.location.protocol}//${h}:5000`;
    };

    const fetchHistoricalData = async () => {
        try {
            const res = await fetch(`${getBaseUrl()}/api/history`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    currentData = data;
                    renderTable(currentData);
                    return;
                }
            }
        } catch (e) {
            console.warn('Backend unavailable, showing demo history.');
        }
        // Fallback
        currentData = fallbackData;
        renderTable(currentData);
    };

    // Search/filter
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = currentData.filter(item =>
                (item.timestamp && item.timestamp.includes(term)) ||
                (item.temperature !== undefined && String(item.temperature).includes(term)) ||
                (item.humidity !== undefined && String(item.humidity).includes(term)) ||
                (item.soil_moisture !== undefined && String(item.soil_moisture).includes(term))
            );
            renderTable(filtered);
        });
    }

    fetchHistoricalData();
});
