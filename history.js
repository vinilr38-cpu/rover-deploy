document.addEventListener('DOMContentLoaded', () => {
    const historyBody = document.getElementById('history-body');
    const searchInput = document.getElementById('history-search');

    // Mock Historical Data
    const historyData = [
        { date: '2026-02-22 14:30', pest: 'Aphids', confidence: 92, spray: 'Yes', temp: 24, humidity: 62 },
        { date: '2026-02-22 11:15', pest: 'Caterpillars', confidence: 85, spray: 'Yes', temp: 22, humidity: 65 },
        { date: '2026-02-21 16:45', pest: 'None', confidence: 0, spray: 'No', temp: 26, humidity: 58 },
        { date: '2026-02-21 09:20', pest: 'Bells', confidence: 78, spray: 'Yes', temp: 21, humidity: 70 },
        { date: '2026-02-20 18:10', pest: 'Aphids', confidence: 89, spray: 'Yes', temp: 23, humidity: 64 },
        { date: '2026-02-20 13:05', pest: 'None', confidence: 0, spray: 'No', temp: 25, humidity: 60 },
        { date: '2026-02-19 22:30', pest: 'Caterpillars', confidence: 94, spray: 'Yes', temp: 19, humidity: 72 },
        { date: '2026-02-19 15:40', pest: 'None', confidence: 0, spray: 'No', temp: 27, humidity: 55 },
        { date: '2026-02-18 10:15', pest: 'Aphids', confidence: 81, spray: 'Yes', temp: 22, humidity: 68 },
        { date: '2026-02-18 07:00', pest: 'None', confidence: 0, spray: 'No', temp: 20, humidity: 75 }
    ];

    const renderTable = (data) => {
        historyBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight: 600;">${item.date}</td>
                <td><span class="badge ${item.pest === 'None' ? 'badge-info' : 'badge-negative'}">${item.pest}</span></td>
                <td>${item.confidence}%</td>
                <td><span class="badge ${item.spray === 'Yes' ? 'badge-positive' : 'badge-info'}">${item.spray}</span></td>
                <td>${item.temp}°C</td>
                <td>${item.humidity}%</td>
            `;
            historyBody.appendChild(row);
        });
    };

    // Initial Render
    renderTable(historyData);

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
