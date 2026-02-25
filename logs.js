document.addEventListener('DOMContentLoaded', () => {
    const logTerminal = document.getElementById('log-terminal');
    const logs = [
        { type: 'info', msg: 'System initialized. Kernal v4.19.0-21-agro' },
        { type: 'success', msg: 'TensorFlow Lite delegate loaded successfully' },
        { type: 'info', msg: 'Hardware check: Camera [OK], GPIO Pins [OK], Spray Pump [OK]' },
        { type: 'info', msg: 'Syncing with cloud database...' },
        { type: 'success', msg: 'Database sync complete' },
        { type: 'warn', msg: 'High CPU temperature detected on Raspberry Pi: 68°C' },
        { type: 'info', msg: 'Auto-throttle engaged' },
        { type: 'info', msg: 'New frame received from Camera 01' },
        { type: 'success', msg: 'AI Inference: 0 pests detected' },
        { type: 'info', msg: 'System heartbeat: Pulsing at 1Hz' },
        { type: 'error', msg: 'Failed to access GPIO Pin 17: Resource busy' },
        { type: 'info', msg: 'Retrying GPIO access...' },
        { type: 'success', msg: 'Access granted. Spray system re-latched' }
    ];

    const addLogEntry = (log) => {
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-type type-${log.type}">${log.type.toUpperCase()}</span>
            <span class="log-msg">${log.msg}</span>
        `;
        logTerminal.appendChild(entry);
        logTerminal.scrollTop = logTerminal.scrollHeight;
    };

    // Initial logs
    logs.forEach((log, index) => {
        setTimeout(() => addLogEntry(log), index * 300);
    });

    // Simulated real-time logs
    setInterval(() => {
        const randomLog = logs[Math.floor(Math.random() * logs.length)];
        addLogEntry(randomLog);
    }, 4000);
});
