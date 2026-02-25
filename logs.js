document.addEventListener('DOMContentLoaded', () => {
    const logTerminal = document.getElementById('log-terminal');

    // Fallback logs shown when backend is unreachable
    const fallbackLogs = [
        { level: 'INFO', message: 'System initialized. Kernel v4.19.0-21-agro', timestamp: new Date().toLocaleTimeString() },
        { level: 'SUCCESS', message: 'TensorFlow Lite delegate loaded successfully', timestamp: new Date().toLocaleTimeString() },
        { level: 'INFO', message: 'Hardware check: Camera [OK], GPIO Pins [OK], Spray Pump [OK]', timestamp: new Date().toLocaleTimeString() },
        { level: 'SUCCESS', message: 'Database sync complete', timestamp: new Date().toLocaleTimeString() },
        { level: 'WARN', message: 'High CPU temperature detected on Raspberry Pi: 68°C', timestamp: new Date().toLocaleTimeString() },
        { level: 'INFO', message: 'Auto-throttle engaged', timestamp: new Date().toLocaleTimeString() },
        { level: 'SUCCESS', message: 'AI Inference: 0 pests detected', timestamp: new Date().toLocaleTimeString() },
        { level: 'INFO', message: 'System heartbeat: Pulsing at 1Hz', timestamp: new Date().toLocaleTimeString() }
    ];

    const renderLogs = (logs) => {
        logTerminal.innerHTML = '';
        logs.forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            const level = (log.level || log.type || 'info').toLowerCase();
            const msg = log.message || log.msg || '';
            const ts = log.timestamp || log.time || new Date().toLocaleTimeString();
            entry.innerHTML = `
                <span class="log-time">[${ts}]</span>
                <span class="log-type type-${level}">${level.toUpperCase()}</span>
                <span class="log-msg">${msg}</span>
            `;
            logTerminal.appendChild(entry);
        });
        logTerminal.scrollTop = logTerminal.scrollHeight;
    };

    const getBaseUrl = () => {
        const h = window.location.hostname;
        if (!h || h === 'localhost' || h === '127.0.0.1') return 'http://127.0.0.1:5000';
        return `${window.location.protocol}//${h}:5000`;
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${getBaseUrl()}/api/logs`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    renderLogs(data);
                    return;
                }
            }
        } catch (e) {
            console.warn('Backend unavailable, showing demo logs.');
        }
        // Show fallback demo logs if backend is offline or returns empty
        renderLogs(fallbackLogs);
    };

    fetchLogs();
    setInterval(fetchLogs, 5000);
});
